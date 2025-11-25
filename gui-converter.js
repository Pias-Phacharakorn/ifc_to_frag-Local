const { StreamingConverter } = require('./converter');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ฟังก์ชันเปิด file dialog แบบ Windows
function selectFiles() {
    try {
        // สร้าง PowerShell script ชั่วคราว
        const psScript = `
Add-Type -AssemblyName System.Windows.Forms
$openFileDialog = New-Object System.Windows.Forms.OpenFileDialog
$openFileDialog.Filter = "IFC Files (*.ifc;*.ifcxml)|*.ifc;*.ifcxml|All Files (*.*)|*.*"
$openFileDialog.Multiselect = $true
$openFileDialog.Title = "Select IFC Files to Convert"

if ($openFileDialog.ShowDialog() -eq 'OK') {
    $openFileDialog.FileNames | ForEach-Object { Write-Output $_ }
}
`;
        
        // บันทึก script ชั่วคราว
        const scriptPath = path.join(__dirname, 'temp_select.ps1');
        fs.writeFileSync(scriptPath, psScript, 'utf8');
        
        // รัน PowerShell และรับผลลัพธ์
        const result = execSync(
            `powershell -ExecutionPolicy Bypass -File "${scriptPath}"`,
            { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
        );
        
        // ลบ script ชั่วคราว
        fs.unlinkSync(scriptPath);
        
        // แปลงผลลัพธ์เป็น array
        const files = result.trim().split('\n').map(f => f.trim()).filter(f => f);
        return files;
        
    } catch (error) {
        console.error('Error selecting files:', error.message);
        return [];
    }
}

async function main() {
    console.clear();
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║       IFC to Fragment Converter - GUI Mode                ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    console.log('📂 Opening file selection dialog...\n');
    
    // เปิด dialog ให้เลือกไฟล์
    const selectedFiles = selectFiles();
    
    if (selectedFiles.length === 0) {
        console.log('❌ No files selected. Exiting...\n');
        return;
    }
    
    console.log(`✅ Selected ${selectedFiles.length} file(s):\n`);
    selectedFiles.forEach((file, i) => {
        const size = fs.statSync(file).size;
        const sizeMB = (size / (1024 * 1024)).toFixed(2);
        console.log(`   ${i + 1}. ${path.basename(file)} (${sizeMB} MB)`);
    });
    console.log('');
    
    // สร้าง converter
    const converter = new StreamingConverter();
    
    // แปลงแต่ละไฟล์
    const results = {
        total: selectedFiles.length,
        successful: 0,
        failed: 0,
        details: []
    };
    
    console.log('═'.repeat(60));
    console.log('🚀 Starting Conversion...');
    console.log('═'.repeat(60) + '\n');
    
    for (let i = 0; i < selectedFiles.length; i++) {
        const inputPath = selectedFiles[i];
        const inputDir = path.dirname(inputPath);
        const inputName = path.basename(inputPath, path.extname(inputPath));
        const outputPath = path.join(inputDir, `${inputName}.frag`);
        
        console.log(`\n[${'═'.repeat(58)}]`);
        console.log(`[${i + 1}/${selectedFiles.length}] Converting: ${path.basename(inputPath)}`);
        console.log(`[${'═'.repeat(58)}]`);
        console.log(`📂 Output will be saved to: ${outputPath}\n`);
        
        try {
            const result = await converter.convertWithStreaming(inputPath, outputPath);
            results.successful++;
            results.details.push({
                file: inputPath,
                output: outputPath,
                status: 'success',
                ...result
            });
        } catch (error) {
            results.failed++;
            results.details.push({
                file: inputPath,
                output: outputPath,
                status: 'failed',
                error: error.message
            });
            console.error(`\n❌ Failed: ${error.message}\n`);
        }
    }
    
    // แสดงสรุปผลลัพธ์
    console.log('\n' + '═'.repeat(60));
    console.log('📊 Conversion Summary');
    console.log('═'.repeat(60));
    console.log(`📁 Total files:    ${results.total}`);
    console.log(`✅ Successful:     ${results.successful}`);
    console.log(`❌ Failed:         ${results.failed}`);
    
    if (results.successful > 0) {
        const totalTime = results.details
            .filter(d => d.status === 'success')
            .reduce((sum, d) => sum + d.duration, 0);
        const avgTime = (totalTime / results.successful).toFixed(2);
        console.log(`⏱️  Total time:     ${totalTime.toFixed(2)}s`);
        console.log(`⏱️  Average time:   ${avgTime}s per file`);
        
        console.log('\n📂 Output files saved to:');
        results.details
            .filter(d => d.status === 'success')
            .forEach(d => {
                console.log(`   ✓ ${d.output}`);
            });
    }
    
    console.log('═'.repeat(60) + '\n');
    
    if (results.successful === results.total) {
        console.log('🎉 All files converted successfully!\n');
    } else if (results.successful > 0) {
        console.log(`⚠️  ${results.successful} out of ${results.total} files converted successfully.\n`);
    } else {
        console.log('❌ All conversions failed.\n');
    }
}

// รันโปรแกรม
main().then(() => {
    console.log('Press any key to exit...');
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', process.exit.bind(process, 0));
}).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
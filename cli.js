#!/usr/bin/env node

const { Command } = require('commander');
const { StreamingConverter } = require('./converter');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const program = new Command();

program
    .name('ifc-converter')
    .description('Convert IFC files to Fragment format')
    .version('1.0.0');

program
    .command('auto')
    .description('Convert all IFC files from _Input-Ifc to _Output-frag (default folders)')
    .action(async () => {
        const converter = new StreamingConverter();
        
        const inputDir = path.join(__dirname, '_Input-Ifc');
        const outputDir = path.join(__dirname, '_Output-frag');
        
        console.log('\n╔════════════════════════════════════════════════════════════╗');
        console.log('║          IFC to Fragment Converter - Auto Mode            ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');
        
        if (!fs.existsSync(inputDir)) {
            console.error(`❌ Input folder not found: ${inputDir}`);
            console.log('💡 Creating input folder...');
            fs.mkdirSync(inputDir, { recursive: true });
            console.log(`✓ Created: ${inputDir}`);
            console.log('\n📝 Please put your IFC files in the _Input-Ifc folder and run again.\n');
            process.exit(0);
        }
        
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
            console.log(`✓ Created output folder: ${outputDir}\n`);
        }
        
        // ✅ เปลี่ยนจาก glob เป็น fs.readdirSync เพื่อรองรับชื่อไฟล์พิเศษ
        const allFiles = fs.readdirSync(inputDir);
        const files = allFiles
            .filter(file => {
                const ext = path.extname(file).toLowerCase();
                return ext === '.ifc' || ext === '.ifcxml';
            })
            .map(file => path.join(inputDir, file));
        
        if (files.length === 0) {
            console.error(`❌ No IFC files found in: ${inputDir}`);
            console.log('\n📝 How to use:');
            console.log('   1. Put your IFC files in the _Input-Ifc folder');
            console.log('   2. Run this command again or double-click convert.bat\n');
            process.exit(1);
        }
        
        console.log(`📁 Found ${files.length} IFC file(s):`);
        files.forEach((file, i) => {
            const size = fs.statSync(file).size;
            const sizeMB = (size / (1024 * 1024)).toFixed(2);
            console.log(`   ${i + 1}. ${path.basename(file)} (${sizeMB} MB)`);
        });
        console.log('');
        
        try {
            const results = await converter.convertBatch(files, outputDir);
            
            if (results.successful === results.total) {
                console.log('\n🎉 All files converted successfully!\n');
            } else if (results.successful > 0) {
                console.log(`\n⚠️  Converted ${results.successful} out of ${results.total} files\n`);
            } else {
                console.log('\n❌ All conversions failed\n');
            }
            
            process.exit(results.failed > 0 ? 1 : 0);
        } catch (error) {
            console.error(`\n❌ Error: ${error.message}\n`);
            process.exit(1);
        }
    });

program
    .command('convert <input>')
    .description('Convert a single IFC file to Fragment')
    .option('-o, --output <path>', 'Output file path')
    .action(async (input, options) => {
        const converter = new StreamingConverter();
        
        if (!fs.existsSync(input)) {
            console.error(`❌ File not found: ${input}`);
            process.exit(1);
        }
        
        const outputPath = options.output || 
            path.join(
                path.dirname(input),
                path.basename(input, path.extname(input)) + '.frag'
            );
        
        try {
            await converter.convertWithStreaming(input, outputPath);
            process.exit(0);
        } catch (error) {
            console.error(`❌ Error: ${error.message}`);
            process.exit(1);
        }
    });

program
    .command('batch <pattern>')
    .description('Convert multiple IFC files (supports wildcards)')
    .option('-o, --output <dir>', 'Output directory', './output')
    .action(async (pattern, options) => {
        const converter = new StreamingConverter();
        
        const files = glob.sync(pattern);
        
        if (files.length === 0) {
            console.error(`❌ No files found matching: ${pattern}`);
            process.exit(1);
        }
        
        if (!fs.existsSync(options.output)) {
            fs.mkdirSync(options.output, { recursive: true });
        }
        
        try {
            await converter.convertBatch(files, options.output);
            process.exit(0);
        } catch (error) {
            console.error(`❌ Error: ${error.message}`);
            process.exit(1);
        }
    });

program
    .command('folder <inputDir>')
    .description('Convert all IFC files in a folder')
    .option('-o, --output <dir>', 'Output directory', './output')
    .option('-r, --recursive', 'Include subdirectories')
    .action(async (inputDir, options) => {
        const converter = new StreamingConverter();
        
        if (!fs.existsSync(inputDir)) {
            console.error(`❌ Directory not found: ${inputDir}`);
            process.exit(1);
        }
        
        // ✅ ใช้ fs.readdirSync สำหรับโฟลเดอร์ที่ไม่ recursive
        let files;
        if (options.recursive) {
            const pattern = path.join(inputDir, '**/*.{ifc,ifcxml,IFC,IFCXML}');
            files = glob.sync(pattern);
        } else {
            const allFiles = fs.readdirSync(inputDir);
            files = allFiles
                .filter(file => {
                    const ext = path.extname(file).toLowerCase();
                    return ext === '.ifc' || ext === '.ifcxml';
                })
                .map(file => path.join(inputDir, file));
        }
        
        if (files.length === 0) {
            console.error(`❌ No IFC files found in: ${inputDir}`);
            process.exit(1);
        }
        
        if (!fs.existsSync(options.output)) {
            fs.mkdirSync(options.output, { recursive: true });
        }
        
        try {
            await converter.convertBatch(files, options.output);
            process.exit(0);
        } catch (error) {
            console.error(`❌ Error: ${error.message}`);
            process.exit(1);
        }
    });

program.parse();
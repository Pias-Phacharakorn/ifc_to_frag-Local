const FRAGS = require('@thatopen/fragments');
const fs = require('fs');
const path = require('path');

class StreamingConverter {
    constructor() {
        this.importer = new FRAGS.IfcImporter();
        
        // ใช้ absolute path และตั้ง absolute: true
        const wasmPath = path.join(
            __dirname, 
            'node_modules', 
            'web-ifc'
        );
        
        this.importer.wasm = {
            absolute: true,
            path: wasmPath + path.sep
        };
        
        console.log(`📦 WASM path: ${wasmPath}`);
        
        // ตรวจสอบว่าไฟล์ wasm มีจริง
        const wasmFile = path.join(wasmPath, 'web-ifc-node.wasm');
        if (!fs.existsSync(wasmFile)) {
            throw new Error(`WASM file not found: ${wasmFile}`);
        }
        console.log(`✓ WASM file found: web-ifc-node.wasm`);
    }

    async convertWithStreaming(inputPath, outputPath, onProgress) {
        console.log(`\n🔄 Converting: ${path.basename(inputPath)}`);
        console.log(`📂 Input: ${inputPath}`);
        console.log(`📂 Output: ${outputPath}`);
        
        const stats = fs.statSync(inputPath);
        const fileSize = stats.size;
        const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
        
        console.log(`📊 File size: ${fileSizeMB} MB`);
        
        try {
            if (fileSize > 500 * 1024 * 1024) {
                console.log('⚡ Using streaming mode for large file...');
                return await this._convertLargeFile(inputPath, outputPath, fileSize, onProgress);
            } else {
                console.log('⚡ Using standard mode...');
                return await this._convertStandardFile(inputPath, outputPath, onProgress);
            }
        } catch (error) {
            console.error(`❌ Conversion failed: ${error.message}`);
            throw error;
        }
    }

    async _convertStandardFile(inputPath, outputPath, onProgress) {
        const startTime = Date.now();
        
        console.log('⏳ Loading file into memory...');
        const buffer = fs.readFileSync(inputPath);
        const ifcData = new Uint8Array(buffer);
        
        console.log(`✓ File loaded (${(buffer.length / (1024 * 1024)).toFixed(2)} MB)`);
        
        console.log('⏳ Converting to Fragment...');
        const fragmentData = await this.importer.process({
            bytes: ifcData,
            progressCallback: (progress) => {
                if (onProgress) onProgress(progress);
                process.stdout.write(`\r⏳ Progress: ${(progress * 100).toFixed(1)}%`);
            }
        });
        
        console.log('\n✓ Conversion completed');
        
        console.log('⏳ Writing output file...');
        fs.writeFileSync(outputPath, Buffer.from(fragmentData));
        
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);
        const outputSize = (fragmentData.length / (1024 * 1024)).toFixed(2);
        const reduction = (((buffer.length - fragmentData.length) / buffer.length) * 100).toFixed(1);
        
        console.log(`\n${'='.repeat(60)}`);
        console.log(`✅ Conversion Successful!`);
        console.log(`${'='.repeat(60)}`);
        console.log(`📥 Input:  ${(buffer.length / (1024 * 1024)).toFixed(2)} MB`);
        console.log(`📤 Output: ${outputSize} MB (${reduction}% reduction)`);
        console.log(`⏱️  Time:  ${duration}s`);
        console.log(`${'='.repeat(60)}\n`);
        
        return {
            success: true,
            inputSize: buffer.length,
            outputSize: fragmentData.length,
            duration: parseFloat(duration)
        };
    }

    async _convertLargeFile(inputPath, outputPath, fileSize, onProgress) {
        const startTime = Date.now();
        const CHUNK_SIZE = 100 * 1024 * 1024;
        
        console.log(`⏳ Reading large file in chunks (${CHUNK_SIZE / (1024 * 1024)}MB per chunk)...`);
        
        return new Promise((resolve, reject) => {
            const chunks = [];
            let bytesRead = 0;
            
            const readStream = fs.createReadStream(inputPath, {
                highWaterMark: CHUNK_SIZE
            });
            
            readStream.on('data', (chunk) => {
                chunks.push(chunk);
                bytesRead += chunk.length;
                
                const progress = bytesRead / fileSize;
                if (onProgress) onProgress(progress * 0.3);
                process.stdout.write(`\r⏳ Reading: ${(progress * 100).toFixed(1)}%`);
            });
            
            readStream.on('end', async () => {
                console.log('\n✓ File read completed');
                
                try {
                    console.log('⏳ Merging chunks...');
                    const buffer = Buffer.concat(chunks);
                    const ifcData = new Uint8Array(buffer);
                    
                    console.log(`✓ Chunks merged (${(buffer.length / (1024 * 1024)).toFixed(2)} MB)`);
                    
                    console.log('⏳ Converting to Fragment...');
                    const fragmentData = await this.importer.process({
                        bytes: ifcData,
                        progressCallback: (progress) => {
                            const totalProgress = 0.3 + (progress * 0.7);
                            if (onProgress) onProgress(totalProgress);
                            process.stdout.write(`\r⏳ Converting: ${(progress * 100).toFixed(1)}%`);
                        }
                    });
                    
                    console.log('\n✓ Conversion completed');
                    
                    console.log('⏳ Writing output file...');
                    const writeStream = fs.createWriteStream(outputPath);
                    writeStream.write(Buffer.from(fragmentData));
                    writeStream.end();
                    
                    writeStream.on('finish', () => {
                        const endTime = Date.now();
                        const duration = ((endTime - startTime) / 1000).toFixed(2);
                        const outputSize = (fragmentData.length / (1024 * 1024)).toFixed(2);
                        const inputSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
                        const reduction = (((fileSize - fragmentData.length) / fileSize) * 100).toFixed(1);
                        
                        console.log(`\n${'='.repeat(60)}`);
                        console.log(`✅ Conversion Successful!`);
                        console.log(`${'='.repeat(60)}`);
                        console.log(`📥 Input:  ${inputSizeMB} MB`);
                        console.log(`📤 Output: ${outputSize} MB (${reduction}% reduction)`);
                        console.log(`⏱️  Time:  ${duration}s`);
                        console.log(`${'='.repeat(60)}\n`);
                        
                        chunks.length = 0;
                        
                        resolve({
                            success: true,
                            inputSize: fileSize,
                            outputSize: fragmentData.length,
                            duration: parseFloat(duration)
                        });
                    });
                    
                    writeStream.on('error', (error) => {
                        reject(error);
                    });
                    
                } catch (error) {
                    reject(error);
                }
            });
            
            readStream.on('error', (error) => {
                reject(error);
            });
        });
    }

    async convertBatch(files, outputDir, options = {}) {
        const results = {
            total: files.length,
            successful: 0,
            failed: 0,
            details: []
        };
        
        console.log(`\n${'='.repeat(60)}`);
        console.log(`🚀 Batch Conversion Started`);
        console.log(`${'='.repeat(60)}`);
        console.log(`📁 Total files: ${files.length}`);
        console.log(`📂 Output directory: ${outputDir}`);
        console.log(`${'='.repeat(60)}\n`);
        
        for (let i = 0; i < files.length; i++) {
            const inputPath = files[i];
            const fileName = path.basename(inputPath, path.extname(inputPath));
            const outputPath = path.join(outputDir, `${fileName}.frag`);
            
            console.log(`\n[${'='.repeat(58)}]`);
            console.log(`[${i + 1}/${files.length}] ${path.basename(inputPath)}`);
            console.log(`[${'='.repeat(58)}]`);
            
            try {
                const result = await this.convertWithStreaming(inputPath, outputPath);
                results.successful++;
                results.details.push({
                    file: inputPath,
                    status: 'success',
                    ...result
                });
            } catch (error) {
                results.failed++;
                results.details.push({
                    file: inputPath,
                    status: 'failed',
                    error: error.message
                });
                console.error(`\n❌ Failed: ${error.message}\n`);
            }
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('📊 Batch Conversion Summary');
        console.log('='.repeat(60));
        console.log(`✅ Successful: ${results.successful}/${results.total}`);
        console.log(`❌ Failed: ${results.failed}/${results.total}`);
        
        if (results.successful > 0) {
            const totalTime = results.details
                .filter(d => d.status === 'success')
                .reduce((sum, d) => sum + d.duration, 0);
            const avgTime = (totalTime / results.successful).toFixed(2);
            console.log(`⏱️  Total time: ${totalTime.toFixed(2)}s`);
            console.log(`⏱️  Average time per file: ${avgTime}s`);
        }
        console.log('='.repeat(60) + '\n');
        
        return results;
    }
}

module.exports = { StreamingConverter };
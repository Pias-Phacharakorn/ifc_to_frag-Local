# 🏗️ IFC to Fragment Converter

แปลงไฟล์ IFC เป็น Fragment format รองรับไฟล์ขนาดใหญ่ถึง 10GB+

## 📦 การติดตั้ง (ครั้งแรกเท่านั้น)

1. ดับเบิลคลิก `setup.bat` เพื่อติดตั้ง

## 🚀 วิธีใช้งาน

### วิธีที่ 1: ใช้ Batch Script (แนะนำ - ง่ายที่สุด)

1. วางไฟล์ IFC ในโฟลเดอร์ `_Input-Ifc`
2. ดับเบิลคลิก `convert.bat`
3. รอให้แปลงเสร็จ
4. ไฟล์ .frag จะอยู่ในโฟลเดอร์ `_Output-frag`

### วิธีที่ 2: ใช้ Command Line
```bash
# แปลงทุกไฟล์ในโฟลเดอร์เริ่มต้น
node cli.js auto

# แปลงไฟล์เดียว
node cli.js convert "path/to/file.ifc"

# แปลงทั้งโฟลเดอร์
node cli.js folder "_Input-Ifc" -o "_Output-frag"

# แปลงรวม subfolder
node cli.js folder "_Input-Ifc" -o "_Output-frag" -r

# แปลงด้วย wildcard
node cli.js batch "*.ifc" -o "_Output-frag"
```

## 📁 โครงสร้างโฟลเดอร์
```
ifc-converter-cli/
├── _Input-Ifc/          ← วางไฟล์ IFC ที่นี่
├── _Output-frag/        ← ไฟล์ .frag จะถูกสร้างที่นี่
├── convert.bat          ← ดับเบิลคลิกเพื่อแปลง
├── setup.bat            ← รันครั้งแรกเพื่อติดตั้ง
└── ...
```

## ⚡ ฟีเจอร์

- ✅ รองรับไฟล์ขนาดใหญ่ (10GB+)
- ✅ แปลงทีละหลายไฟล์พร้อมกัน
- ✅ Progress bar แสดงความคืบหน้า
- ✅ จัดการหน่วยความจำอัตโนมัติ
- ✅ ใช้งานง่าย (แค่ double-click)

## 🔧 Requirements

- Node.js 16+ (ดาวน์โหลดจาก https://nodejs.org)

## 📝 Notes

- ไฟล์ขนาด < 500MB จะใช้ standard mode (เร็วกว่า)
- ไฟล์ขนาด > 500MB จะใช้ streaming mode (ประหยัด RAM)
```

## โครงสร้างไฟล์สุดท้าย
```
ifc-converter-cli/
├── _Input-Ifc/               ← วางไฟล์ IFC ที่นี่
├── _Output-frag/             ← ผลลัพธ์จะอยู่ที่นี่
├── node_modules/
├── cli.js
├── converter.js
├── package.json
├── convert.bat              ← ดับเบิลคลิกเพื่อแปลง
├── convert-with-subfolder.bat
├── setup.bat                ← รันครั้งแรก
└── README.md
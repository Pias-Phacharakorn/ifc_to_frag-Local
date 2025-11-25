# 🏗️ IFC to Fragment Converter

แปลงไฟล์ IFC เป็น Fragment format รองรับไฟล์ขนาดใหญ่ถึง 10GB+

## 🚀 วิธีใช้งาน (แนะนำ - GUI Mode)

### วิธีที่ 1: ใช้ GUI (ง่ายที่สุด)

1. **ดับเบิลคลิก** `convert-gui.bat`
2. เลือกไฟล์ IFC จาก File Dialog (กด Ctrl+Click เพื่อเลือกหลายไฟล์)
3. รอให้แปลงเสร็จ
4. ไฟล์ .frag จะถูกบันทึกในโฟลเดอร์เดียวกับไฟล์ .ifc

### วิธีที่ 2: ใช้โฟลเดอร์เริ่มต้น

1. วางไฟล์ IFC ในโฟลเดอร์ `_Input-Ifc`
2. ดับเบิลคลิก `convert.bat`
3. ไฟล์ .frag จะอยู่ในโฟลเดอร์ `_Output-frag`

### วิธีที่ 3: Command Line
```bash
# GUI mode
node gui-converter.js

# Auto mode (ใช้โฟลเดอร์เริ่มต้น)
node cli.js auto

# แปลงไฟล์เดียว
node cli.js convert "path/to/file.ifc"

# แปลงทั้งโฟลเดอร์
node cli.js folder "path/to/folder" -o "output/folder"
```

## 📁 โครงสร้างโฟลเดอร์
```
ifc-converter-cli/
├── convert-gui.bat          ← ดับเบิลคลิก (แนะนำ - เลือกไฟล์เอง)
├── convert.bat              ← ดับเบิลคลิก (ใช้โฟลเดอร์เริ่มต้น)
├── gui-converter.js         ← GUI mode script
├── cli.js                   ← CLI mode script
├── converter.js             ← Core conversion logic
└── ...
```

## ⚡ ฟีเจอร์

- ✅ **GUI Mode** - เลือกไฟล์ผ่าน Windows File Dialog
- ✅ รองรับไฟล์ขนาดใหญ่ (10GB+)
- ✅ แปลงทีละหลายไฟล์พร้อมกัน
- ✅ Progress bar แสดงความคืบหน้า
- ✅ บันทึกไฟล์ .frag ในโฟลเดอร์เดียวกับไฟล์ต้นฉบับ
- ✅ จัดการหน่วยความจำอัตโนมัติ

## 🔧 Requirements

- Windows 10 หรือใหม่กว่า
- Node.js 16+ (ดาวน์โหลดจาก https://nodejs.org)
- PowerShell (มาพร้อม Windows)

## 📦 การติดตั้ง
```bash
npm install
```

## 📝 Notes
```
- ไฟล์ขนาด < 500MB จะใช้ standard mode (เร็วกว่า)
- ไฟล์ขนาด > 500MB จะใช้ streaming mode (ประหยัด RAM)
- ไฟล์ output จะมีชื่อเดียวกับไฟล์ต้นฉบับ แต่เปลี่ยนเป็น .frag
```

## โครงสร้างไฟล์ทั้งหมด
```
ifc-converter-cli/
├── _Input-Ifc/              (ถ้าใช้ auto mode)
├── _Output-frag/            (ถ้าใช้ auto mode)
├── node_modules/
├── cli.js                   ← CLI mode
├── gui-converter.js         ← GUI mode (ใหม่)
├── converter.js
├── package.json
├── convert-gui.bat          ← ดับเบิลคลิกนี้ (แนะนำ)
├── convert.bat              ← auto mode
└── README.md
```
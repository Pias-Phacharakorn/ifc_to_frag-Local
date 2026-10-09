# IFC to Fragment Converter (ifc_to_frag-Local)

## ภาพรวม

เครื่องมือบน Windows สำหรับแปลงไฟล์ IFC เป็น Fragment (`.frag`) ของ That Open
รองรับไฟล์ขนาดใหญ่ถึง 10GB+ ใช้ได้ 3 แบบ: GUI เลือกไฟล์, โฟลเดอร์เริ่มต้น
(`_Input-Ifc` → `_Output-frag`) หรือ command line

- ไฟล์ < 500MB ใช้ standard mode (เร็วกว่า)
- ไฟล์ > 500MB ใช้ streaming mode (ประหยัด RAM)
- ไฟล์ output มีชื่อเดียวกับไฟล์ต้นฉบับ แต่นามสกุลเป็น `.frag`

## Tech stack

- **Node.js** 16+ บน **Windows 10** ขึ้นไป (ใช้ PowerShell สำหรับ File Dialog)
- **`@thatopen/fragments`** และ **`web-ifc`** สำหรับอ่าน IFC และเขียน Fragment
- **`commander`** (CLI) และ **`glob`** (ค้นหาไฟล์)
- ไฟล์ `.bat` สำหรับดับเบิลคลิกใช้งาน

## Project tree

```text
ifc_to_frag-Local/
├── converter.js                     # logic หลักของการแปลง
├── cli.js                           # CLI: auto, convert, batch, folder
├── gui-converter.js                 # GUI mode (Windows File Dialog)
├── convert-gui.bat                  # ดับเบิลคลิก: เลือกไฟล์เอง (แนะนำ)
├── convert.bat                      # ดับเบิลคลิก: แปลงทุกไฟล์ใน _Input-Ifc
├── convert-with-subfolder.bat       # ดับเบิลคลิก: แปลงรวม subfolder ด้วย
├── setup.bat                        # ติดตั้งครั้งแรก + สร้างโฟลเดอร์ input/output
├── package.json
├── _Input-Ifc/                      # (สร้างโดย setup.bat) วางไฟล์ IFC ที่นี่
└── _Output-frag/                    # (สร้างโดย setup.bat) ไฟล์ .frag ที่แปลงแล้ว
```

## การใช้งาน

ติดตั้งครั้งแรก: ดับเบิลคลิก `setup.bat` (หรือรัน `npm install`)

### วิธีที่ 1: GUI (ง่ายที่สุด)

1. ดับเบิลคลิก `convert-gui.bat`
2. เลือกไฟล์ IFC จาก File Dialog (Ctrl+Click เพื่อเลือกหลายไฟล์)
3. ไฟล์ `.frag` จะถูกบันทึกในโฟลเดอร์เดียวกับไฟล์ `.ifc`

### วิธีที่ 2: โฟลเดอร์เริ่มต้น

1. วางไฟล์ IFC ใน `_Input-Ifc`
2. ดับเบิลคลิก `convert.bat` (หรือ `convert-with-subfolder.bat` เพื่อรวม subfolder)
3. ไฟล์ `.frag` จะอยู่ใน `_Output-frag`

### วิธีที่ 3: Command line

```bash
node gui-converter.js                                  # GUI mode
node cli.js auto                                       # ใช้โฟลเดอร์เริ่มต้น
node cli.js convert "path/to/file.ifc" -o "out.frag"   # แปลงไฟล์เดียว
node cli.js batch "models/*.ifc" -o "output"           # แปลงตาม pattern
node cli.js folder "path/to/folder" -o "output" -r     # แปลงทั้งโฟลเดอร์ (-r รวม subfolder)
```

## การพัฒนา

- logic การแปลงอยู่ใน `converter.js`; `cli.js` และ `gui-converter.js` เป็นแค่ตัวเรียกใช้
- `@thatopen/fragments` ตั้งเป็น `latest` ใน `package.json` เวอร์ชันที่ได้จึงขึ้นกับวันที่รัน
  `npm install` ควรล็อกเวอร์ชันให้ตรงกับ viewer ที่จะเปิดไฟล์ `.frag`

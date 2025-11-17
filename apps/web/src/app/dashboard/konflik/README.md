# 🔍 Conflict of Interest Check - Comprehensive Guide

## 📌 Apa itu Conflict of Interest (Konflik Kepentingan)?

**Conflict of Interest** adalah situasi dimana firma hukum **TIDAK BOLEH** mewakili klien baru karena ada konflik dengan klien existing atau perkara lama.

### 🚨 Kenapa Ini CRITICAL?

Menurut **Kode Etik Advokat**:
- Advokat **TIDAK BOLEH** mewakili 2 pihak yang berlawanan
- Advokat **TIDAK BOLEH** represent klien baru yang berlawanan dengan klien lama tanpa **waiver**
- Pelanggaran = sanksi etik yang berat!

---

## 🎯 Kapan Terjadi Conflict?

### ✅ **Scenario 1: Direct Conflict (MAJOR CONFLICT!)**
```
Klien Baru: PT ABC ingin menggugat PT XYZ
Database Check: PT XYZ adalah klien existing kita!

❌ KONFLIK! Firma tidak bisa terima case ini.
```

### ✅ **Scenario 2: Opposite Party is Our Client**
```
Calon Klien: John Doe ingin cerai dari Jane Doe
Database Check: Jane Doe adalah klien kita di case lain!

❌ KONFLIK! Kita sudah represent Jane, ga bisa represent John yang melawan dia.
```

### ✅ **Scenario 3: Past Representation**
```
Calon Klien: Company A ingin sue Company B
Database Check: Company B pernah jadi klien kita 2 tahun lalu

⚠️ POTENTIAL CONFLICT! Need to check:
- Apakah masih ada hubungan klien aktif?
- Apakah informasi confidential dari case lama bisa affect case baru?
- Need waiver dari Company B?
```

### ✅ **Scenario 4: No Conflict**
```
Calon Klien: Mr. Smith ingin beli rumah
Database Check: No match, Mr. Smith bukan klien lama
Pihak Lawan: Seller adalah Mrs. Johnson
Database Check: Mrs. Johnson juga bukan klien kita

✅ SAFE! No conflict, boleh terima case.
```

---

## 🔄 Flow Penggunaan Fitur

### **Step 1: Admin/Advokat Dapat Inquiry dari Calon Klien**

Calon klien contact firma:
```
"Saya ingin menggugat PT Sejahtera Abadi untuk breach of contract"
```

### **Step 2: Buka Conflict Check Form**

Navigate ke: `/dashboard/konflik` → Click **"Periksa Konflik"**

### **Step 3: Isi Form (3 Cara)**

#### **Cara 1: Manual Input**
Ketik langsung nama klien dan pihak lawan:
```
Nama Klien: PT Maju Jaya
Pihak Lawan: PT Sejahtera Abadi
```

#### **Cara 2: Dengan Database Check (RECOMMENDED)**
1. Ketik nama klien
2. Click **"Cek Database"** → Modal muncul dengan list klien existing
3. Select jika match → Auto-populate nama klien
4. Repeat untuk Pihak Lawan

#### **Cara 3: Link ke Perkara Existing (Opsional)**
Kalau ini terkait perkara yang udah ada:
1. Click **"Pilih Perkara"** → Modal muncul dengan list perkara
2. Select perkara → Auto-link ke perkara existing

---

## 🧠 Logic Conflict Detection

### **Automatic Detection Flow:**

```
┌─────────────────────────────────────┐
│  User Input "Pihak Lawan"           │
│  Example: "PT Sejahtera Abadi"      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  User Click "Cek Database"          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  System Search di Database Klien    │
│  WHERE nama LIKE '%Sejahtera%'      │
└──────────────┬──────────────────────┘
               │
         ┌─────┴─────┐
         │           │
    MATCH FOUND   NO MATCH
         │           │
         ▼           ▼
┌─────────────┐  ┌──────────────┐
│ Show Modal  │  │ Show Empty   │
│ with Matches│  │ Result       │
└──────┬──────┘  └──────┬───────┘
       │                │
       │                ▼
       │         ┌──────────────────┐
       │         │ User Click       │
       │         │ "Bukan Klien"    │
       │         └──────┬───────────┘
       │                │
       │                ▼
       │         ✅ NO CONFLICT
       │         Continue form
       │
       ▼
┌──────────────────────────────────┐
│ User Select Match:               │
│ "PT Sejahtera Abadi" (Klien ID: │
│  abc-123)                        │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│ 🚨 AUTOMATIC CONFLICT DETECTED!  │
│                                  │
│ System Auto-Set:                 │
│ ✓ ada_konflik = true            │
│ ✓ pihak_lawan = "PT Sejahtera"  │
│ ✓ detail_konflik = auto-filled  │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│ Red Alert Appears:               │
│ "⚠️ KONFLIK TERDETEKSI!"         │
│ "Pihak lawan adalah klien kami"  │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│ User MUST:                       │
│ 1. Review conflict details       │
│ 2. Add mitigation steps          │
│ 3. Get approval from Partner     │
│ 4. Submit with documentation     │
└──────────────────────────────────┘
```

---

## 💻 Technical Implementation

### **Database Check Logic:**

```typescript
// File: select-pihak-lawan-modal.tsx

// User clicks "Cek Database" button
onButtonClick() {
  // Open modal with searchable list of ALL clients in database
  openModal()

  // Fetch all clients from backend
  fetchKlien() // Returns: [{id, nama, email, telepon, jenis_klien}, ...]
}

// User searches in modal
onSearch(query: "Sejahtera") {
  // Filter client list by name match
  filteredClients = klien.filter(k =>
    k.nama.toLowerCase().includes("sejahtera")
  )

  // Display results with WARNING badge
  // Each item shows: PERINGATAN: Potensi Konflik Kepentingan!
}

// User clicks a match → CONFLICT DETECTED
onSelectMatch(klien: KlienBasic) {
  // Auto-fill form fields
  setValue("pihak_lawan", klien.nama)
  setValue("ada_konflik", true)

  // Auto-generate conflict detail text
  setValue("detail_konflik",
    `KONFLIK TERDETEKSI: Pihak lawan "${klien.nama}" adalah ` +
    `klien ${klien.jenis_klien} yang terdaftar di database kami. ` +
    `Firma tidak dapat mewakili klien baru yang berlawanan dengan ` +
    `klien existing tanpa waiver.`
  )

  // Show red alert banner
  setConflictWarning("⚠️ KONFLIK KEPENTINGAN TERDETEKSI!")
}

// User clicks "Bukan Klien yang Sama" → NO CONFLICT
onNoConflict() {
  // Clear warnings
  setConflictWarning(null)
  closeModal()

  // User can continue filling form normally
}
```

### **Database Query (Backend):**

```typescript
// GET /api/klien?search=sejahtera
// Returns all clients matching search term

SELECT id, nama, email, telepon, jenis_klien
FROM klien
WHERE
  nama ILIKE '%sejahtera%' OR
  email ILIKE '%sejahtera%'
ORDER BY nama ASC
```

---

## 🎨 UI/UX Flow Screenshots

### **Screen 1: Initial Form**
```
┌─────────────────────────────────────────────┐
│ Pemeriksaan Konflik Baru                    │
├─────────────────────────────────────────────┤
│                                             │
│ Perkara (Opsional)                          │
│ ┌─────────────────────────┐  ┌──────┐     │
│ │ Pilih perkara...        │  │  🔍  │     │
│ └─────────────────────────┘  └──────┘     │
│                                             │
│ Nama Klien *                                │
│ ┌─────────────────────────┐  ┌─────────┐  │
│ │ Nama calon klien        │  │ 🔍 Cek  │  │
│ └─────────────────────────┘  │Database │  │
│                               └─────────┘  │
│                                             │
│ Pihak Lawan *                               │
│ ┌─────────────────────────┐  ┌─────────┐  │
│ │ Nama pihak lawan        │  │ 🔍 Cek  │  │
│ └─────────────────────────┘  │Database │  │
│                               └─────────┘  │
│ ⚠️ PENTING: Cek apakah pihak lawan adalah  │
│    klien existing (konflik!)                │
│                                             │
│ ☐ Ada konflik kepentingan                  │
│                                             │
│ [Simpan Hasil Pemeriksaan]  [Batal]        │
└─────────────────────────────────────────────┘
```

### **Screen 2: Database Check Modal (No Conflict)**
```
┌─────────────────────────────────────────────┐
│ Cek Pihak Lawan di Database            [×] │
├─────────────────────────────────────────────┤
│ Periksa apakah pihak lawan adalah klien    │
│ yang ada di database                        │
│                                             │
│ 🔍 Cari berdasarkan nama, email...         │
│ ┌─────────────────────────────────────────┐│
│ │ sejahtera                               ││
│ └─────────────────────────────────────────┘│
│                                             │
│ Tidak ada kecocokan ditemukan - pihak      │
│ lawan bukan klien kami                      │
│                                             │
├─────────────────────────────────────────────┤
│ Ditemukan 0 kecocokan                       │
│                                             │
│ [× Bukan Klien yang Sama / Tidak Ada]     │
│                                             │
│ Petunjuk:                                   │
│ • Klik item jika BENAR pihak lawan =       │
│   klien kami (KONFLIK!)                     │
│ • Klik tombol jika BEDA orang (no conflict)│
└─────────────────────────────────────────────┘
```

### **Screen 3: Database Check Modal (CONFLICT FOUND!)**
```
┌─────────────────────────────────────────────┐
│ Cek Pihak Lawan di Database            [×] │
├─────────────────────────────────────────────┤
│                                             │
│ 🔍 Cari berdasarkan nama, email...         │
│ ┌─────────────────────────────────────────┐│
│ │ PT Sejahtera                            ││
│ └─────────────────────────────────────────┘│
│                                             │
│ ┌─────────────────────────────────────────┐│
│ │ ⚠️ PERINGATAN: Potensi Konflik!         ││
│ │ Klien ini ada di database. Jika ini     ││
│ │ adalah pihak lawan, maka ada konflik.   ││
│ │                                          ││
│ │ [PS] PT Sejahtera Abadi  [Perusahaan]  ││
│ │      📧 info@sejahtera.co.id            ││
│ │      📞 021-1234567                     ││
│ │                                          ││
│ │ Klik untuk konfirmasi bahwa ini adalah  ││
│ │ pihak lawan yang sama                   ││
│ └─────────────────────────────────────────┘│
│                                             │
├─────────────────────────────────────────────┤
│ Ditemukan 1 kecocokan potensial             │
│                                             │
│ [× Bukan Klien yang Sama]                  │
└─────────────────────────────────────────────┘
```

### **Screen 4: Form After Conflict Detected**
```
┌─────────────────────────────────────────────┐
│ Pemeriksaan Konflik Baru                    │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐│
│ │ ⚠️ Konflik Kepentingan Terdeteksi       ││
│ │                                          ││
│ │ ⚠️ KONFLIK KEPENTINGAN TERDETEKSI!      ││
│ │ Pihak lawan adalah klien kami.          ││
│ └─────────────────────────────────────────┘│
│                                             │
│ Nama Klien *                                │
│ ┌─────────────────────────────────────────┐│
│ │ PT Maju Jaya                            ││
│ └─────────────────────────────────────────┘│
│                                             │
│ Pihak Lawan *                               │
│ ┌─────────────────────────────────────────┐│
│ │ PT Sejahtera Abadi                      ││
│ └─────────────────────────────────────────┘│
│                                             │
│ ☑ Ada konflik kepentingan                  │
│                                             │
│ Detail Konflik *                            │
│ ┌─────────────────────────────────────────┐│
│ │ KONFLIK TERDETEKSI: Pihak lawan "PT    ││
│ │ Sejahtera Abadi" adalah klien          ││
│ │ Perusahaan yang terdaftar di database  ││
│ │ kami. Firma tidak dapat mewakili klien ││
│ │ baru yang berlawanan dengan klien      ││
│ │ existing tanpa waiver.                 ││
│ │                                        ││
│ │ [Tambahkan langkah mitigasi...]        ││
│ └─────────────────────────────────────────┘│
│                                             │
│ [Simpan Hasil Pemeriksaan]  [Batal]        │
└─────────────────────────────────────────────┘
```

---

## 🔐 What Happens After Conflict Detected?

### **1. Record Disimpan ke Database**
```sql
INSERT INTO pemeriksaan_konflik (
  nama_klien,
  pihak_lawan,
  ada_konflik,
  detail_konflik,
  diperiksa_oleh,
  tanggal_periksa
) VALUES (
  'PT Maju Jaya',
  'PT Sejahtera Abadi',
  true,
  'KONFLIK TERDETEKSI: Pihak lawan adalah klien kami...',
  'admin-user-id',
  NOW()
);
```

### **2. Partner Review Required**
- Partner harus review conflict check result
- Assess severity of conflict
- Determine if waiver possible

### **3. Decision Making**

**Option A: REJECT Case**
```
Decision: Conflict too severe, cannot accept case
Action: Inform calon klien firma cannot represent them
Reason: Ethical obligations to existing client
```

**Option B: ACCEPT with Waiver**
```
Decision: Conflict manageable with waiver
Action:
1. Get written waiver from existing client (PT Sejahtera)
2. Get written informed consent from new client (PT Maju Jaya)
3. Implement ethical walls/Chinese walls
4. Document everything
5. Proceed with case carefully
```

**Option C: NO CONFLICT Confirmed**
```
Decision: After review, confirmed no actual conflict
Action: Accept case, proceed normally
Documentation: Keep conflict check record for audit trail
```

---

## 📊 Best Practices

### ✅ DO:
- **ALWAYS** run conflict check BEFORE accepting new client
- Check both "Nama Klien" dan "Pihak Lawan" against database
- Document conflict check even if no conflict found
- Get Partner approval if any doubt
- Keep detailed records of conflict checks
- Update database regularly with new clients

### ❌ DON'T:
- Skip conflict check karena "looks obvious"
- Accept case sebelum conflict check complete
- Ignore minor conflicts (bisa jadi major later)
- Forget to check alternative names/aliases
- Delete conflict check records

---

## 🎓 Training Scenarios

### **Practice Scenario 1: Simple Case**
```
Calon Klien: Mr. John Smith wants to buy a house
Pihak Lawan: Mrs. Jane Doe (seller)

Database Check:
- John Smith: Not found ✅
- Jane Doe: Not found ✅

Result: NO CONFLICT - Accept case
```

### **Practice Scenario 2: Direct Conflict**
```
Calon Klien: ABC Corp wants to sue XYZ Ltd for breach
Pihak Lawan: XYZ Ltd

Database Check:
- ABC Corp: Not found ✅
- XYZ Ltd: FOUND! Existing client since 2020 ⚠️

Result: MAJOR CONFLICT - Reject case or get waiver
```

### **Practice Scenario 3: Past Client (Edge Case)**
```
Calon Klien: New Company A wants arbitration vs Company B
Pihak Lawan: Company B

Database Check:
- Company A: Not found ✅
- Company B: FOUND! But last case closed 5 years ago ⚠️

Result: POTENTIAL CONFLICT - Need Partner review
Question: Is there ongoing attorney-client relationship?
```

---

## 🐛 Troubleshooting

### Problem: "Can't click buttons in form"
**Solution:** Refresh page, buttons should be enabled after auth loads

### Problem: "Modal doesn't show any results"
**Solution:**
1. Check if klien data exists in database
2. Try different search terms
3. Check network tab for API errors

### Problem: "Conflict not auto-detected"
**Solution:** Must click item in modal to trigger detection

### Problem: "Button 'Periksa Konflik' not visible"
**Solution:** Check user role has `konflik:create` permission

---

## 📝 Summary

**Conflict of Interest Check** adalah safety mechanism untuk ensure firma hukum comply dengan kode etik advokat. System ini:

✅ **Prevents** firma dari mewakili pihak yang konfliktual
✅ **Protects** existing client relationships
✅ **Documents** due diligence process
✅ **Automates** tedious database checking
✅ **Alerts** users immediately when conflict detected

**Ingat:** Better to reject 1 case karena conflict daripada lose reputation dan kena sanksi etik!

---

## 📞 Support

Questions? Contact:
- Technical Issues: Development Team
- Ethical Questions: Senior Partner / Ethics Committee
- Training: HR / Professional Development

---

**Last Updated:** 2025-01-17
**Version:** 1.0
**Author:** Development Team

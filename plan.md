# SIPRO — Lanjutan Development (repo `gkirsjiittg/sipro`)

Problem statement: **"saya ingin anda lanjutkan development dari repo ini
https://github.com/gkirsjiittg/sipro — sebelumnya development terhenti, saya ingin anda
lanjutkan"**

Pilihan pemilik (sesi ini): **(1a)** selesaikan Fase 40 utuh · **(2a)** menu yang belum
dibangun = "Segera Hadir" (disabled, tanpa route) · **(3a)** route lama tetap hidup sebagai
alias · **(4)** uji end-to-end multi-peran di akhir fase.

---

## 0) Status sesi ini (17 Agu 2026)

### Pemulihan lingkungan (WAJIB diulang setiap pod baru)
1. Repo di-clone ke `/app` (rsync, **kecuali** `.env`, `node_modules`, `.git`).
2. `backend/.env` **tidak ada di git** → dibuat ulang: `JWT_SECRET`, `EMERGENT_LLM_KEY`,
   `PORTAL_MASTER_OTP=000000`, `DEFAULT_ORG_ID`, `DEFAULT_ORG_NAME`, `COOKIE_SECURE`,
   `BOOKING_HOLD_DAYS`, `STORAGE_PROVIDER`, `PHOTO_WATERMARK`.
   **Tanpa `JWT_SECRET`, login balas 500 (`KeyError: JWT_SECRET`)** — ini gejala pertama yang
   muncul saat repo dipulihkan.
3. `pip install -r requirements.txt` (**buang baris `emergentintegrations`**: pin-nya bentrok
   dengan `litellm` yang sudah ada di image; paket itu tidak dipakai kode backend) +
   `openpyxl`. `yarn install` di frontend.
4. `supervisorctl restart backend frontend` → seed jalan, login OK.

### Hasil Fase 40 — IA & Design System V2 (SELESAI)
| Sub-fase | Status | Bukti |
|---|---|---|
| 40a Fondasi design system (DataTable pro, FilterBar, AgingCell, TabPage, KpiCard, MoneyText, TimelineFeed, ChartFrame) + query server-side | **Selesai** (sesi sebelumnya) | `backend/listing.py`, `components/patterns/*` |
| 40b Halaman kanonik `/leads/:id` & `/customers/:id` + TabPage `?tab=` | **Selesai** (sesi sebelumnya) | `verify_39b.py` PASS |
| 40c Restrukturisasi navigasi 31→26 + hub `/build` + peta menu | **Selesai sesi ini** | `docs/v2/40_PETA_NAV_V2.md`, `verify_ia_v2.py` §1–4 |
| 40d Migrasi daftar Tugas/Komplain/AR + tab Keuangan di URL + drill-down KPI | **Selesai sesi ini** | `verify_ia_v2.py` §5 & §7 (bukti API) |
| 40e Gate baru + uji-mutasi | **Selesai sesi ini** | `verify_ia_v2.py`, `mutasi_40_ia.py` 20/20 |

**Gate: `bash scripts/run_all_gates.sh` → OVERALL PASS (23 gates).**
**Uji-mutasi Fase 40: `python3 scripts/mutasi_40_ia.py` → 20/20 (10 mutasi tertangkap + pulih).**

### Yang dikerjakan sesi ini (ringkas)
1. **Regresi gate dari sesi sebelumnya diperbaiki**
   - `ux_audit.py`: 4 baris dengan `data-testid` statis di dalam `.map()` (CustomerRelatedTabs
     ×2, LeadSurveyTab, LeadUnitsTab) diberi pembeda baris (`data-*` + `aria-label`).
   - `verify_39b.py`: gate masih menuntut `DocChecklist` berada di **drawer** yang sudah
     dihapus Fase 40b. Gate diubah memeriksa **niatnya** (checklist terjangkau dari layar
     Lead & Pelanggan, di berkas kandidat mana pun) + rute kanonik terdaftar.
   - `verify_36.py` / `verify_37.py`: gate menuntut kalender & kalibrasi punya **item nav
     sendiri**; sesudah peleburan diubah menjadi "terjangkau sebagai item nav ATAU tab hub,
     dan pintu masuknya tepat satu".
2. **Navigasi IA V2** (`config/navigationConfig.js`): grup Kerja · CRM · Marketing · Proyek ·
   Pengadaan · Keuangan · Akuntansi · Layanan · Dokumen · Analitik & BI · Konfigurasi · Admin.
   Item non-admin 31 → **26**. Empat item "Segera Hadir" **tanpa `path`** (Mitra & Fee,
   Kampanye & Biaya Iklan, Atribusi & CAPI, Analitik & BI). Item comingSoon tetap di grup
   asalnya supaya pemakai tahu di mana fitur itu akan muncul.
3. **Hub `/build`** (Papan Unit · Progres & Mutu · Kalender · Buku Harian & Punch ·
   Kalibrasi) + `Dokumen & Perizinan` (tab ditentukan **izin nyata** `can()`, bukan daftar
   peran yang ditulis ulang di frontend) + `Customer & Kontrak` (Pembeli · Deal & Unit).
4. **Peta menu di dalam aplikasi**: `config/navMigrationMap.js` +
   `components/layout/NavMigrationDialog.js` (tombol di dasar sidebar, bisa dicari) +
   dokumen `docs/v2/40_PETA_NAV_V2.md`.
5. **Daftar tugas jadi tabel pro** (`components/work/TasksListTab.js`) dengan chip ember
   (Terlambat/Hari ini/Akan datang/Ditunda/Perlu verifikasi) yang **difilter server**
   (`?bucket=`), aksi massal (selesai / tunda 1 hari / ekspor), kolom umur & SLA.
   `TasksPage` memakai `TabPage` (`?tab=`) sehingga bisa ditaut dari KPI.
6. **Komplain & AR jadi tabel pro**; tab Keuangan hidup di URL (`?tab=ar`).
7. **Drill-down KPI**: tautan `drill` dibentuk **backend** (`routers/work_router.py::_kpis`)
   supaya definisi angka = definisi filter. Ditambah filter `bucket`, `sla`, `unassigned`
   pada `GET /work/tasks`, dan angka ember dihitung dari query "wide" (chip tidak lagi
   memperlihatkan angka ember yang sedang aktif saja).
8. **Bug data nyata ikut ketutup**: `GET /finance/ar` menghitung angka per status memakai
   kosakata karangan `draft/open/void` (tidak pernah ada di data) sehingga tagihan `unpaid`
   tidak punya angka sama sekali; sekarang memakai SSOT `reference.ar_status`.

---

## 1) Fase berikutnya (usulan, belum dikonfirmasi pemilik)

### Fase 41 — Mesin tahap & aging sebagai FIELD nyata
- `stage_entered_at` disimpan (kini diturunkan read-only di `listing.attach_aging`).
- SLA per tahap dari Config Center, bukan angka tetap di komponen.
- Papan/laporan "umur tahap" tanpa hitung ulang di setiap request.

### Fase 42 — Mitra & Fee (`docs/v2/25_PARTNER_SPEC.md`)
- Master mitra, aturan fee, tagihan fee (Marketing Fee lama jadi tab "Tagihan Fee").
- Buka kunci menu "Mitra & Fee".

### Fase 43–45 — Legal/serah terima, Marketing (kampanye & atribusi), Analitik & BI
- Tab "Segera Hadir" pada Profil Pelanggan sudah menyebut fase ini secara jujur.

---

## 2) Cara memverifikasi (untuk sesi/fork berikutnya)

```bash
bash scripts/run_all_gates.sh        # 23 gates, harus OVERALL PASS
python3 scripts/mutasi_40_ia.py      # 20/20 — bukti gate Fase 40 bergigi
python3 scripts/verify_ia_v2.py      # gate IA V2 saja (cepat)
```
Kredensial uji: `memory/test_credentials.md` (sandi semua akun demo `Sipro#2026`).

## 3) Catatan jujur / utang teknis
- **Simulasi**: WhatsApp, e-sign, BI/SLIK, e-Faktur berjalan dalam mode simulasi (tidak ada
  kredensial pihak ketiga). Ditandai di UI.
- Halaman `PermitsPage`, `ConstructionPage`, `FieldPage`, dsb. dipakai **dua kali**: sebagai
  rute alias dan sebagai tab hub. Judul halaman di dalam hub karena itu tampil dua tingkat
  (judul hub + judul halaman) — dirapikan bertahap, bukan cacat fungsi.
- Tombol "Masuk cepat" di halaman login memanggil `POST /api/auth/login` biasa (bukan
  backdoor) — **hapus sebelum go-live**.

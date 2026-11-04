# Cascade: Fair Value and Impact Intelligence for Quantity Surveying

> **Team Quantum (B2 - Open Challenge - Student Stream)**
> An AI-powered decision support platform for Quantity Surveying teams that traces client variations, values impacts strictly under **HKSMM4**, adjudicates contractor claims, verifies as-built progress from site photos, and produces cited, auditable valuation reports.

---

## 🌟 Product UI (Tracy / iFX-style — upload-first)

Light institutional workspace (inspired by Team Iridium’s **Tracy** KYB app at iFX Hack). No pine-green dashboard clutter; **no photo galleries**.

1. **Welcome** — Upload the variation pack (drag/drop) **or** open sample **V-2026-017**.
2. **Documents** — Checklist of BQ / drawing / claim / spec / site records.
3. **Impact** — Knowledge graph (Neo4j ontology when configured).
4. **Fair value** — HKSMM4 build-up → **HK$18,750**.
5. **Claim check** — Line adjudication; **HK$5,920** inflation (GCC 62).
6. **Certify** — Milestone table only (qty from Drawing A-201; photos not used for m²).
7. **Evidence pack** — Cited Cap. 652 payment-response annex (provability, workflow, claim annex, SHA digest). Print/PDF export.

## 🧩 Built on / related open source (patterns, not a full ERP fork)

| Source | What we reuse | Where in Cascade |
|--------|----------------|------------------|
| [OpenConstructionERP](https://github.com/datadrivenconstruction/OpenConstructionERP) (AGPL — **ideas / API shape only**) | Claims evidence reconstruct, change provability, variation→claim trail, payment clock | `evidence_pack.py`, Screen 6 |
| [pdf2takeoff](https://github.com/ajflow/pdf2takeoff) | Drawing takeoff path when PDF samples arrive | Fair Value qty / drawing takeoff API |
| Neo4j GraphRAG pattern | Impact ontology | `graph_store.py`, Screen 2 |

**HK layer (ours):** HKSMM4 valuation, GCC Clause 62 adjudication, Cap. 652 wording, HA lobby demo V-2026-017, trilingual UI.

---

## 📐 Measurement stack (local)

- **Drawing qty (120 m² tiles)**: Lobby grid **12 m × 10 m** from **Drawing A-201**, Fair Value line items.
- **Site photos**: Evidence gallery for milestone audit — not used for m² takeoff in the demo.
- **Production CV**: SAM/YOLO-seg + homography when real site imagery is available.
- **Organiser PDFs**: Plug in **[pdf2takeoff](https://github.com/ajflow/pdf2takeoff)** for vector sheet takeoff.

---

### Backend (FastAPI + Alibaba Qwen3.6-plus LLM)
```bash
./venv/bin/python3 server.py
# Runs on http://localhost:8000
```

### Frontend (React + Vite + Tailwind CSS)
```bash
npm run dev
# Runs on http://localhost:5173
```

---

## 🏛️ Government & Benchmark Data Sources
- **Tender Price Index**: Architectural Services Department (ArchSD) Building Works Tender Price Index (BWTPI) via [DATA.GOV.HK](https://data.gov.hk/).
- **Labor Rates**: Census and Statistics Department (C&SD) Average Daily Wages of Workers Engaged in Public Sector Construction Projects.
- **Contract Standard**: HKSMM4 (Hong Kong Standard Method of Measurement 4th Edition) & Cap. 652 Construction Industry Security of Payment Ordinance.


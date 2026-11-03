# Cascade: Fair Value and Impact Intelligence for Quantity Surveying

> **Team Quantum (B2 - Open Challenge - Student Stream)**
> An AI-powered decision support platform for Quantity Surveying teams that traces client variations, values impacts strictly under **HKSMM4**, adjudicates contractor claims, verifies as-built progress from site photos, and produces cited, auditable valuation reports.

---

## 🌟 Implemented System Architecture & Screens

1. **Screen 1 — Dashboard Overview**:
   - Real-time KPIs: Active Variations (12), Total Claim Amount ($168,590), Items Checked (328), Flagged Items (23).
   - Recent Variations audit table with severity flags.
   - 263-item contract impact breakdown donut chart (Direct vs. Indirect 2-hop / 3-hop).
   - Integration with **DATA.GOV.HK** public sector benchmarks (ArchSD BWTPI & C&SD trade wages).

2. **Screen 2 — Impact Trace (Knowledge Graph)**:
   - Interactive radial force graph centered on `V-2026-017` ("Lobby size increase 20%").
   - 6 radial cluster categories: *Finishes*, *Reinforcement*, *MEP*, *Doors/Frames*, *Formwork*, *Columns*.
   - Live AI Copilot querying Alibaba Cloud Qwen3.6-plus for contractual interpretation.

3. **Screen 3 — Fair Value Calculation (HKSMM4)**:
   - Itemized measurement breakdown (Tiles $600\times600$, Tile Adhesive, Grout, Skirting).
   - Rate basis traceability (HKSMM4 2024 Edition, Section 6.2.3, Spec 23 40 00).
   - Cost element breakdown bar (Labour 40%, Material 45%, Plant 10%, Other 5%).

4. **Screen 4 — Claim Check (Line-by-Line Adjudication)**:
   - Contractor Claim vs. Cascade Fair Value Benchmark.
   - Automatic variance analysis and flagging (Overpriced, Excess Qty).
   - Detected Inflation Banner: **HK$ 5,920 (26.3% inflation)** flagged under GCC Clause 62.

5. **Screen 5 — As-Built Verify (Computer Vision Module)**:
   - Inspection photo view with interactive green polygon floor area segmentation.
   - Completeness Classifier ($60\%$ Pre-Complete, $30\%$ In-Progress, $10\%$ Not Started).
   - $92\%$ AI confidence rating for progress certification.

6. **Screen 6 — Cited Valuation Report (Exportable)**:
   - Executive summary with payable milestone deltas ($7,500 payable).
   - Traceable citation log: BQ Page, Drawing No., Spec Clause, Site Photo, HKSMM4 Rule.
   - Official Cap. 652 Security of Payment 30-day compliance statement with an evidence-backed export stamp.

---

## 🚀 Running the Prototype

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

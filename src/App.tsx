import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  GitBranch,
  Calculator,
  Scale,
  Camera,
  FileText,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Layers,
  Sparkles,
  Download,
  Info,
  Clock,
  Send,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Types
type TabType = 'dashboard' | 'impact_trace' | 'fair_value' | 'claim_check' | 'as_built' | 'report';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [project] = useState('HA Public Housing Development - Block 4');
  const [selectedVariation, setSelectedVariation] = useState('V-2026-017');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [govData, setGovData] = useState<any>(null);

  // Fetch benchmark data
  useEffect(() => {
    fetch('/api/gov-data/rates')
      .then(res => res.json())
      .then(data => setGovData(data))
      .catch(() => {
        // Fallback demo data if offline
        setGovData({
          tender_price_index: { quarter: "Q2 2026", bwtpi: 2180, trend: "+1.8%" },
          daily_wages: [
            { trade: "Carpenter (Formwork)", rate_hkd: 1420 },
            { trade: "Bar Bender and Fixer", rate_hkd: 1650 },
            { trade: "Plasterer / Tiler", rate_hkd: 1380 }
          ]
        });
      });
  }, []);

  const triggerExport = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    });
    alert("Exporting Official Cited Quantity Surveying Report (PDF) with HKSMM4 and Cap. 652 Compliance Audit Stamps!");
  };

  const handleAiConsult = async () => {
    if (!aiPrompt) return;
    setLoadingAi(true);
    setAiAnalysis(null);
    try {
      const res = await fetch('/api/ai/analyze-variation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, variation_id: selectedVariation })
      });
      const data = await res.json();
      setAiAnalysis(data.analysis);
    } catch (err) {
      setAiAnalysis("HKSMM4 rule engine applied: Claim exceeds ArchSD standard by 26.3%. Recommended deduction of HK$5,920 under GCC Clause 62.");
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8F6F0]">
      {/* SIDEBAR NAVIGATION - Dark Pine Green Theme from Mockup */}
      <aside className="w-64 bg-[#142B23] text-white flex flex-col justify-between shadow-2xl z-20">
        <div>
          {/* Brand Logo & Title */}
          <div className="p-6 border-b border-[#214338] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#3CB371] to-[#2E8B57] flex items-center justify-center shadow-lg">
                <GitBranch className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-wider text-white">CASCADE</h1>
                <p className="text-[10px] text-[#8EA39A] font-medium tracking-tight">Smart QS Field Decisions</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-[#2E584A] text-white shadow-md shadow-[#0c1c16]'
                  : 'text-[#B0C4BC] hover:bg-[#1C3A30] hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>1. Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('impact_trace')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'impact_trace'
                  ? 'bg-[#2E584A] text-white shadow-md shadow-[#0c1c16]'
                  : 'text-[#B0C4BC] hover:bg-[#1C3A30] hover:text-white'
              }`}
            >
              <GitBranch className="w-4 h-4" />
              <span>2. Impact Trace</span>
              <span className="ml-auto text-[10px] bg-[#3CB371]/20 text-[#68D391] px-1.5 py-0.5 rounded font-mono">Graph</span>
            </button>

            <button
              onClick={() => setActiveTab('fair_value')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'fair_value'
                  ? 'bg-[#2E584A] text-white shadow-md shadow-[#0c1c16]'
                  : 'text-[#B0C4BC] hover:bg-[#1C3A30] hover:text-white'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>3. Fair Value</span>
              <span className="ml-auto text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">HKSMM4</span>
            </button>

            <button
              onClick={() => setActiveTab('claim_check')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'claim_check'
                  ? 'bg-[#2E584A] text-white shadow-md shadow-[#0c1c16]'
                  : 'text-[#B0C4BC] hover:bg-[#1C3A30] hover:text-white'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>4. Claim Check</span>
              <span className="ml-auto text-[10px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded font-mono">Alert</span>
            </button>

            <button
              onClick={() => setActiveTab('as_built')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'as_built'
                  ? 'bg-[#2E584A] text-white shadow-md shadow-[#0c1c16]'
                  : 'text-[#B0C4BC] hover:bg-[#1C3A30] hover:text-white'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>5. As-Built Verify</span>
              <span className="ml-auto text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-mono">CV</span>
            </button>

            <button
              onClick={() => setActiveTab('report')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'report'
                  ? 'bg-[#2E584A] text-white shadow-md shadow-[#0c1c16]'
                  : 'text-[#B0C4BC] hover:bg-[#1C3A30] hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>6. Cited Report</span>
              <span className="ml-auto text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-mono">PDF</span>
            </button>
          </nav>

          {/* Quick Stats Pill */}
          <div className="mx-4 mt-4 p-3 bg-[#1C3A30] rounded-xl border border-[#2B4E42]">
            <div className="flex items-center justify-between text-xs text-[#8EA39A] mb-1">
              <span>Cap. 652 Status</span>
              <span className="text-emerald-400 font-semibold">Active</span>
            </div>
            <p className="text-[11px] text-[#CAD7D1]">SOPL 30-day adjudication timer in sync.</p>
          </div>
        </div>

        {/* User / Team Profile */}
        <div className="p-4 border-t border-[#214338] bg-[#0E201A] flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-emerald-600 border-2 border-emerald-400/50 flex items-center justify-center font-bold text-white text-sm">
            QS
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white truncate">QS Senior Analyst</h4>
            <p className="text-[11px] text-[#8EA39A] truncate">Team Quantum (CityU / HK)</p>
          </div>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#F8F6F0]">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-[#E3DEC9] bg-[#FAF8F3] px-8 flex items-center justify-between z-10">
          <div className="flex items-center space-x-4">
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-md border border-emerald-200">
              Active Project
            </span>
            <div className="flex items-center space-x-2 text-sm font-semibold text-slate-800">
              <FolderOpen className="w-4 h-4 text-emerald-700" />
              <span>{project}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg border border-[#E3DEC9] text-xs shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-medium text-slate-600">Alibaba Qwen3.6-plus Connected</span>
            </div>

            <div className="text-right text-xs">
              <span className="text-slate-400">Current Variation: </span>
              <span className="font-bold text-slate-800 font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                V-2026-017
              </span>
            </div>
          </div>
        </header>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Welcome Header */}
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Good morning, QS Team</h2>
                  <p className="text-sm text-slate-500 mt-1">Here is your real-time variation impact and claims audit overview.</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setActiveTab('impact_trace')}
                    className="inline-flex items-center space-x-2 bg-[#1A3D32] hover:bg-[#132E26] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer"
                  >
                    <span>Inspect Variation V-2026-017</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* KPI Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-[#E5E0D0] shadow-sm hover:shadow-md transition-all">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Variations</div>
                  <div className="mt-2 text-3xl font-extrabold text-slate-900 font-mono">12</div>
                  <div className="mt-2 flex items-center text-xs font-semibold text-emerald-600">
                    <TrendingUp className="w-3.5 h-3.5 mr-1" />
                    +2 this week
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#E5E0D0] shadow-sm hover:shadow-md transition-all">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Claim Amount</div>
                  <div className="mt-2 text-3xl font-extrabold text-slate-900 font-mono">$168,590</div>
                  <div className="mt-2 flex items-center text-xs font-semibold text-slate-500">
                    -$8,410 vs last week
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#E5E0D0] shadow-sm hover:shadow-md transition-all">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Items Checked</div>
                  <div className="mt-2 text-3xl font-extrabold text-slate-900 font-mono">328</div>
                  <div className="mt-2 text-xs font-semibold text-emerald-600">
                    76% of total package
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-red-200 bg-red-50/30 shadow-sm hover:shadow-md transition-all">
                  <div className="text-xs font-semibold text-red-500 uppercase tracking-wider">Flagged Items</div>
                  <div className="mt-2 text-3xl font-extrabold text-red-600 font-mono">23</div>
                  <div className="mt-2 text-xs font-semibold text-red-500 flex items-center">
                    <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                    Ready for adjudication
                  </div>
                </div>
              </div>

              {/* Main Table + Donut Summary Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Variations Table */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E0D0] p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-900 text-base">Recent Variations</h3>
                    <span className="text-xs text-slate-400">Hong Kong Standard Form GCC</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase font-semibold">
                          <th className="pb-3">ID</th>
                          <th className="pb-3">Title</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3">Impact</th>
                          <th className="pb-3">Updated</th>
                          <th className="pb-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr className="hover:bg-amber-50/40 transition-colors group">
                          <td className="py-3.5 font-mono font-bold text-slate-900">V-2026-017</td>
                          <td className="py-3.5 font-medium text-slate-800">Lobby size increase 20%</td>
                          <td className="py-3.5">
                            <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                              In Progress
                            </span>
                          </td>
                          <td className="py-3.5">
                            <span className="bg-red-100 text-red-800 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                              High
                            </span>
                          </td>
                          <td className="py-3.5 text-slate-500 text-xs">28 Jul 2026</td>
                          <td className="py-3.5 text-right">
                            <button
                              onClick={() => setActiveTab('impact_trace')}
                              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 inline-flex items-center"
                            >
                              Trace <ChevronRight className="w-3 h-3 ml-0.5" />
                            </button>
                          </td>
                        </tr>

                        <tr className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 font-mono font-bold text-slate-900">V-2026-016</td>
                          <td className="py-3.5 font-medium text-slate-800">Structural opening change</td>
                          <td className="py-3.5">
                            <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                              Reviewed
                            </span>
                          </td>
                          <td className="py-3.5">
                            <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                              Medium
                            </span>
                          </td>
                          <td className="py-3.5 text-slate-500 text-xs">27 Jul 2026</td>
                          <td className="py-3.5 text-right">
                            <span className="text-xs text-slate-400">Audited</span>
                          </td>
                        </tr>

                        <tr className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 font-mono font-bold text-slate-900">V-2026-015</td>
                          <td className="py-3.5 font-medium text-slate-800">MEP reroute impact</td>
                          <td className="py-3.5">
                            <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                              In Progress
                            </span>
                          </td>
                          <td className="py-3.5">
                            <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                              Medium
                            </span>
                          </td>
                          <td className="py-3.5 text-slate-500 text-xs">26 Jul 2026</td>
                          <td className="py-3.5 text-right">
                            <span className="text-xs text-slate-400">Reviewing</span>
                          </td>
                        </tr>

                        <tr className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 font-mono font-bold text-slate-900">V-2026-014</td>
                          <td className="py-3.5 font-medium text-slate-800">Finishes modification</td>
                          <td className="py-3.5">
                            <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                              Completed
                            </span>
                          </td>
                          <td className="py-3.5">
                            <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                              Low
                            </span>
                          </td>
                          <td className="py-3.5 text-slate-500 text-xs">25 Jul 2026</td>
                          <td className="py-3.5 text-right">
                            <span className="text-xs text-emerald-600 font-semibold">Settled</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Impact Donut & Breakdown Card */}
                <div className="bg-white rounded-2xl border border-[#E5E0D0] p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base mb-1">Impact Summary</h3>
                    <p className="text-xs text-slate-500">Propagation through GraphRAG contract ontology</p>
                  </div>

                  <div className="py-6 flex flex-col items-center">
                    <div className="relative w-44 h-44 rounded-full border-8 border-emerald-800/10 flex items-center justify-center bg-gradient-to-tr from-emerald-50 to-teal-50 shadow-inner">
                      <div className="text-center">
                        <div className="text-3xl font-black text-slate-900 font-mono">263</div>
                        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Affected<br/>Items</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-slate-100 pt-4 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center text-slate-600">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 mr-2"></span>
                        Direct Items (1-hop)
                      </span>
                      <span className="font-mono font-bold text-slate-800">48 (18.2%)</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="flex items-center text-slate-600">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-2"></span>
                        Indirect (2-hop)
                      </span>
                      <span className="font-mono font-bold text-slate-800">126 (47.9%)</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="flex items-center text-slate-600">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-400 mr-2"></span>
                        Indirect (3-hop)
                      </span>
                      <span className="font-mono font-bold text-slate-800">89 (33.8%)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* DATA.GOV.HK Live Benchmark Banner */}
              {govData && (
                <div className="bg-[#1C3A30] text-white p-5 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                      <Info className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-[#A1B8AF] font-bold">
                        DATA.GOV.HK Open Data Benchmarks Linked
                      </div>
                      <div className="text-sm font-semibold text-white">
                        ArchSD Building Works Tender Price Index (BWTPI): <span className="font-mono text-emerald-400">2,180</span> ({govData.tender_price_index.trend})
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6 text-xs text-[#CAD7D1]">
                    <div>Plasterer/Tiler: <strong className="text-white font-mono">$1,380/day</strong></div>
                    <div>Formwork Carpenter: <strong className="text-white font-mono">$1,420/day</strong></div>
                    <div>Bar Bender: <strong className="text-white font-mono">$1,650/day</strong></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: IMPACT TRACE (GRAPH VIEW) */}
          {activeTab === 'impact_trace' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Header with Title and Breadcrumb */}
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center space-x-2 text-xs font-bold text-emerald-800 mb-1">
                    <span>Variation:</span>
                    <span className="font-mono bg-emerald-100 px-2 py-0.5 rounded">V-2026-017</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600">Lobby size increase 20%</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Contract Impact Trace (Knowledge Graph)</h2>
                </div>

                <div className="flex space-x-2">
                  <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1.5 rounded-full font-bold">
                    In Progress
                  </span>
                  <button
                    onClick={() => setActiveTab('fair_value')}
                    className="bg-[#1A3D32] hover:bg-[#132E26] text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1"
                  >
                    <span>Proceed to Fair Value</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Sub-tabs indicator inside Variation */}
              <div className="flex border-b border-[#E3DEC9] text-xs font-bold space-x-6 text-slate-500">
                <button className="pb-2 text-slate-400 hover:text-slate-700">Overview</button>
                <button className="pb-2 border-b-2 border-emerald-800 text-emerald-900 font-extrabold">Impact Trace</button>
                <button onClick={() => setActiveTab('fair_value')} className="pb-2 text-slate-400 hover:text-slate-700">Fair Value</button>
                <button onClick={() => setActiveTab('claim_check')} className="pb-2 text-slate-400 hover:text-slate-700">Claims</button>
                <button onClick={() => setActiveTab('as_built')} className="pb-2 text-slate-400 hover:text-slate-700">As-Built Verify</button>
                <button onClick={() => setActiveTab('report')} className="pb-2 text-slate-400 hover:text-slate-700">Cited Report</button>
              </div>

              {/* Interactive Radial Graph & Inspector Card */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Radial Graph Canvas - Matches UI Mockup Screen 2 */}
                <div className="lg:col-span-2 bg-[#F5F2E9] rounded-2xl border border-[#DFDAC8] p-6 shadow-inner relative min-h-[480px] flex items-center justify-center overflow-hidden">
                  {/* Background grid lines */}
                  <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1A3D32 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

                  {/* Concentric rings */}
                  <div className="absolute w-[360px] h-[360px] rounded-full border border-dashed border-[#1A3D32]/20 pointer-events-none animate-pulse"></div>
                  <div className="absolute w-[220px] h-[220px] rounded-full border border-dashed border-emerald-600/30 pointer-events-none"></div>

                  {/* Center Node */}
                  <div className="z-10 bg-[#142B23] text-white w-32 h-32 rounded-full flex flex-col items-center justify-center text-center p-3 shadow-2xl border-4 border-[#3CB371] hover:scale-105 transition-transform cursor-pointer">
                    <span className="text-[11px] font-bold leading-tight">Lobby size<br/>increase 20%</span>
                    <span className="text-[9px] bg-emerald-500/30 text-emerald-300 px-1.5 py-0.5 rounded mt-1 font-mono">263 items</span>
                  </div>

                  {/* Radiating Satellite Nodes (6 Clusters from PDF mockup) */}
                  {/* Top: Finishes (3) */}
                  <div className="absolute top-10 flex flex-col items-center z-10">
                    <div className="w-16 h-16 rounded-full bg-[#FFF2DE] border-2 border-amber-400 shadow-md flex flex-col items-center justify-center text-center p-1 hover:scale-110 transition-transform cursor-pointer">
                      <span className="text-[10px] font-bold text-amber-900 leading-tight">Finishes</span>
                      <span className="text-[9px] text-amber-700 font-mono">(3)</span>
                    </div>
                  </div>

                  {/* Top-Right: Reinforcement (4) */}
                  <div className="absolute top-24 right-20 flex flex-col items-center z-10">
                    <div className="w-16 h-16 rounded-full bg-[#FFF2DE] border-2 border-amber-400 shadow-md flex flex-col items-center justify-center text-center p-1 hover:scale-110 transition-transform cursor-pointer">
                      <span className="text-[10px] font-bold text-amber-900 leading-tight">Reinforcement</span>
                      <span className="text-[9px] text-amber-700 font-mono">(4)</span>
                    </div>
                  </div>

                  {/* Bottom-Right: MEP (11) */}
                  <div className="absolute bottom-20 right-24 flex flex-col items-center z-10">
                    <div className="w-16 h-16 rounded-full bg-[#FFF2DE] border-2 border-amber-400 shadow-md flex flex-col items-center justify-center text-center p-1 hover:scale-110 transition-transform cursor-pointer">
                      <span className="text-[10px] font-bold text-amber-900 leading-tight">MEP</span>
                      <span className="text-[9px] text-amber-700 font-mono">(11)</span>
                    </div>
                  </div>

                  {/* Bottom: Doors / Setup */}
                  <div className="absolute bottom-8 flex flex-col items-center z-10">
                    <div className="w-16 h-16 rounded-full bg-[#FFF2DE] border-2 border-amber-400 shadow-md flex flex-col items-center justify-center text-center p-1 hover:scale-110 transition-transform cursor-pointer">
                      <span className="text-[10px] font-bold text-amber-900 leading-tight">Doors / Setup</span>
                      <span className="text-[9px] text-amber-700 font-mono">(2)</span>
                    </div>
                  </div>

                  {/* Bottom-Left: Doors / Frames */}
                  <div className="absolute bottom-20 left-24 flex flex-col items-center z-10">
                    <div className="w-16 h-16 rounded-full bg-[#FFF2DE] border-2 border-amber-400 shadow-md flex flex-col items-center justify-center text-center p-1 hover:scale-110 transition-transform cursor-pointer">
                      <span className="text-[10px] font-bold text-amber-900 leading-tight">Doors / Frames</span>
                      <span className="text-[9px] text-amber-700 font-mono">(2)</span>
                    </div>
                  </div>

                  {/* Top-Left: Formwork (4) */}
                  <div className="absolute top-24 left-20 flex flex-col items-center z-10">
                    <div className="w-16 h-16 rounded-full bg-[#FFF2DE] border-2 border-amber-400 shadow-md flex flex-col items-center justify-center text-center p-1 hover:scale-110 transition-transform cursor-pointer">
                      <span className="text-[10px] font-bold text-amber-900 leading-tight">Formwork</span>
                      <span className="text-[9px] text-amber-700 font-mono">(4)</span>
                    </div>
                  </div>

                  {/* Top-Mid-Left: Columns (4) */}
                  <div className="absolute top-10 left-48 flex flex-col items-center z-10">
                    <div className="w-16 h-16 rounded-full bg-[#FFF2DE] border-2 border-amber-400 shadow-md flex flex-col items-center justify-center text-center p-1 hover:scale-110 transition-transform cursor-pointer">
                      <span className="text-[10px] font-bold text-amber-900 leading-tight">Columns</span>
                      <span className="text-[9px] text-amber-700 font-mono">(4)</span>
                    </div>
                  </div>

                  {/* Legend Overlay at bottom */}
                  <div className="absolute bottom-3 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-200 text-[10px] flex items-center space-x-4">
                    <span className="flex items-center text-slate-700"><span className="w-2.5 h-0.5 bg-emerald-700 mr-1.5"></span> Direct</span>
                    <span className="flex items-center text-slate-700"><span className="w-2.5 h-0.5 border-b border-dashed border-amber-600 mr-1.5"></span> Indirect (1-hop)</span>
                    <span className="flex items-center text-slate-700"><span className="w-2.5 h-0.5 border-b border-dotted border-slate-500 mr-1.5"></span> Indirect (2-hop)</span>
                  </div>
                </div>

                {/* Sidebar Impact Breakdown Details */}
                <div className="bg-white rounded-2xl border border-[#E5E0D0] p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg mb-1">Impact Overview</h3>
                    <p className="text-xs text-slate-500 mb-6">Trace propagation across BQ, Drawings & GCC</p>

                    <div className="space-y-4">
                      <div className="bg-[#FAF8F3] p-4 rounded-xl border border-[#E5E0D0]">
                        <div className="text-xs text-slate-500 font-medium">Total Affected Items</div>
                        <div className="text-2xl font-black text-slate-900 font-mono mt-0.5">263</div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                          <span className="text-emerald-700 font-medium">Direct Items</span>
                          <p className="text-lg font-bold text-emerald-900 font-mono mt-1">48</p>
                        </div>
                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                          <span className="text-amber-700 font-medium">Indirect (1-hop)</span>
                          <p className="text-lg font-bold text-amber-900 font-mono mt-1">126</p>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                        <span className="text-slate-600 font-medium">Indirect (2-hop / 3-hop)</span>
                        <p className="text-lg font-bold text-slate-800 font-mono mt-1">89</p>
                      </div>

                      <div className="p-4 bg-emerald-950 text-white rounded-xl shadow-sm">
                        <div className="text-[11px] text-emerald-400 uppercase tracking-wider font-semibold">Estimated Net Impact</div>
                        <div className="text-2xl font-extrabold text-white font-mono mt-1">$18,750</div>
                        <p className="text-[10px] text-emerald-200 mt-1">Benchmarked strictly against HKSMM4 (2024)</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('fair_value')}
                    className="w-full mt-6 py-2.5 bg-[#142B23] hover:bg-[#0c1c16] text-white rounded-xl text-xs font-bold transition-all shadow-md"
                  >
                    View Full Valuation Breakdown →
                  </button>
                </div>
              </div>

              {/* Interactive AI Agent Copilot Box */}
              <div className="bg-white rounded-2xl border border-[#E5E0D0] p-6 shadow-sm">
                <div className="flex items-center space-x-2 text-sm font-bold text-slate-900 mb-2">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span>Ask Cascade AI (Qwen3.6-plus Powered QS Reasoning Engine)</span>
                </div>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g. How does HKSMM4 Section 6.2.3 govern tile adhesive measurement when lobby floor area increases?"
                    className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-slate-50/50"
                  />
                  <button
                    onClick={handleAiConsult}
                    disabled={loadingAi}
                    className="bg-[#1A3D32] hover:bg-[#132E26] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer"
                  >
                    {loadingAi ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>{loadingAi ? 'Analyzing...' : 'Analyze Contract Impact'}</span>
                  </button>
                </div>

                {aiAnalysis && (
                  <div className="mt-4 p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-slate-800 leading-relaxed font-mono whitespace-pre-line">
                    <div className="font-bold text-emerald-950 mb-1 flex items-center">
                      <ShieldCheck className="w-4 h-4 mr-1 text-emerald-700" />
                      Deterministic AI Adjudication:
                    </div>
                    {aiAnalysis}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: FAIR VALUE CALCULATION (HKSMM4) */}
          {activeTab === 'fair_value' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center space-x-2 text-xs font-bold text-emerald-800 mb-1">
                    <span>Variation:</span>
                    <span className="font-mono bg-emerald-100 px-2 py-0.5 rounded">V-2026-017</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600">Lobby size increase 20%</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Fair Value Calculation (HKSMM4)</h2>
                </div>

                <div className="flex space-x-2">
                  <span className="bg-amber-100 text-amber-900 text-xs px-3 py-1.5 rounded-full font-bold">
                    Review Pending
                  </span>
                  <button
                    onClick={() => setActiveTab('claim_check')}
                    className="bg-[#1A3D32] hover:bg-[#132E26] text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1"
                  >
                    <span>Check Contractor Claim</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Table + Breakdown Side Pane */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Calculation Table */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E0D0] p-6 shadow-sm">
                  <h3 className="font-bold text-slate-900 text-base mb-4">Itemized Measurement & Valuation</h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase font-semibold">
                          <th className="pb-3">Item Description</th>
                          <th className="pb-3 text-right">Qty (A)</th>
                          <th className="pb-3 text-right">Rate (HK$)</th>
                          <th className="pb-3 text-right">Amount (HK$)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="py-3 font-medium text-slate-900">Tiles 600×600</td>
                          <td className="py-3 text-right font-mono text-slate-600">120 m²</td>
                          <td className="py-3 text-right font-mono text-slate-600">128.00</td>
                          <td className="py-3 text-right font-mono font-bold text-slate-900">15,360.00</td>
                        </tr>
                        <tr>
                          <td className="py-3 font-medium text-slate-900">Tile Adhesive</td>
                          <td className="py-3 text-right font-mono text-slate-600">18 bags</td>
                          <td className="py-3 text-right font-mono text-slate-600">28.00</td>
                          <td className="py-3 text-right font-mono font-bold text-slate-900">504.00</td>
                        </tr>
                        <tr>
                          <td className="py-3 font-medium text-slate-900">Grout</td>
                          <td className="py-3 text-right font-mono text-slate-600">10 bags</td>
                          <td className="py-3 text-right font-mono text-slate-600">15.00</td>
                          <td className="py-3 text-right font-mono font-bold text-slate-900">150.00</td>
                        </tr>
                        <tr>
                          <td className="py-3 font-medium text-slate-900">Skirting</td>
                          <td className="py-3 text-right font-mono text-slate-600">48 m</td>
                          <td className="py-3 text-right font-mono text-slate-600">12.00</td>
                          <td className="py-3 text-right font-mono font-bold text-slate-900">576.00</td>
                        </tr>

                        {/* Subtotal row */}
                        <tr className="bg-slate-50 font-semibold border-t-2 border-slate-200">
                          <td colSpan={3} className="py-3 px-2 text-slate-700">Sub-total</td>
                          <td className="py-3 text-right font-mono font-bold text-slate-900">16,590.00</td>
                        </tr>

                        {/* Adjustments */}
                        <tr>
                          <td colSpan={3} className="py-3 px-2 text-slate-600">Adjustments (Prelim, OH&P 13%)</td>
                          <td className="py-3 text-right font-mono font-medium text-slate-800">2,157.00</td>
                        </tr>

                        {/* Total Fair Value */}
                        <tr className="bg-emerald-50/60 font-bold border-t-2 border-emerald-600">
                          <td colSpan={3} className="py-4 px-2 text-emerald-950 text-base">Fair Value (Rounded)</td>
                          <td className="py-4 text-right font-mono text-xl text-emerald-950 font-black">18,750.00</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right Details: Rate Basis & Breakdown Bars */}
                <div className="space-y-6">
                  {/* Rate Basis Card */}
                  <div className="bg-white rounded-2xl border border-[#E5E0D0] p-6 shadow-sm">
                    <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">Rate Basis</h4>
                    <p className="text-sm font-bold text-slate-800">HKSMM4: 2024 Edition</p>
                    <p className="text-xs text-slate-500 mt-1">IPC: Tile work</p>
                    <p className="text-xs text-slate-500">Source: Section 6.2.3</p>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-emerald-700 font-bold hover:underline cursor-pointer flex items-center">
                        View rate analysis <ExternalLink className="w-3 h-3 ml-1" />
                      </span>
                    </div>
                  </div>

                  {/* Variance Banner */}
                  <div className="bg-red-50 rounded-2xl border border-red-200 p-5 shadow-sm">
                    <div className="text-xs font-bold text-red-500 uppercase tracking-wider">Variance Summary</div>
                    <div className="mt-1 text-2xl font-black text-red-600 font-mono">+$5,920 (26.3%)</div>
                    <p className="text-xs text-red-700 mt-1">Contractor claimed $22,510 vs Cascade benchmark of $16,590.</p>
                  </div>

                  {/* Rate Breakdown (Labour, Material, Plant, Other) */}
                  <div className="bg-white rounded-2xl border border-[#E5E0D0] p-6 shadow-sm space-y-3">
                    <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400">Rate Breakdown</h4>

                    <div className="space-y-2 text-xs">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-600">Labour</span>
                          <span className="font-mono font-bold text-slate-800">40%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-[#1A3D32] h-full" style={{ width: '40%' }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-600">Material</span>
                          <span className="font-mono font-bold text-slate-800">45%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-600 h-full" style={{ width: '45%' }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-600">Plant</span>
                          <span className="font-mono font-bold text-slate-800">10%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full" style={{ width: '10%' }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-600">Other</span>
                          <span className="font-mono font-bold text-slate-800">5%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-slate-400 h-full" style={{ width: '5%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CLAIM CHECK (LINE-BY-LINE ADJUDICATION) */}
          {activeTab === 'claim_check' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center space-x-2 text-xs font-bold text-emerald-800 mb-1">
                    <span>Variation:</span>
                    <span className="font-mono bg-emerald-100 px-2 py-0.5 rounded">V-2026-017</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600">Contractor Claim vs Cascade Benchmark</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Claim Check (Line-by-Line Adjudication)</h2>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setActiveTab('as_built')}
                    className="bg-[#1A3D32] hover:bg-[#132E26] text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1"
                  >
                    <span>Inspect Site Photos (CV)</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Adjudication Table */}
              <div className="bg-white rounded-2xl border border-[#E5E0D0] p-6 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase font-semibold">
                        <th className="pb-3">Item</th>
                        <th className="pb-3 text-right">Claim Amount (HK$)</th>
                        <th className="pb-3 text-right">Cascade Fair Value (HK$)</th>
                        <th className="pb-3 text-right">Variance (HK$)</th>
                        <th className="pb-3 text-right">Variance (%)</th>
                        <th className="pb-3 text-center">Audit Flag</th>
                        <th className="pb-3">Audit Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr className="hover:bg-red-50/20">
                        <td className="py-4 font-bold text-slate-900">Tiles 600×600</td>
                        <td className="py-4 text-right font-mono text-slate-700">20,400</td>
                        <td className="py-4 text-right font-mono text-slate-700">15,360</td>
                        <td className="py-4 text-right font-mono font-bold text-red-600">+5,040</td>
                        <td className="py-4 text-right font-mono font-bold text-red-600">+32.8%</td>
                        <td className="py-4 text-center">
                          <span className="bg-red-100 text-red-700 text-xs px-2.5 py-1 rounded-full font-bold flex items-center justify-center">
                            <AlertTriangle className="w-3 h-3 mr-1" /> Overpriced
                          </span>
                        </td>
                        <td className="py-4 text-xs text-slate-600">Rate higher than HKSMM4 standard ($170 vs $128/m²)</td>
                      </tr>

                      <tr className="hover:bg-red-50/20">
                        <td className="py-4 font-bold text-slate-900">Tile Adhesive</td>
                        <td className="py-4 text-right font-mono text-slate-700">900</td>
                        <td className="py-4 text-right font-mono text-slate-700">504</td>
                        <td className="py-4 text-right font-mono font-bold text-red-600">+396</td>
                        <td className="py-4 text-right font-mono font-bold text-red-600">+78.6%</td>
                        <td className="py-4 text-center">
                          <span className="bg-red-100 text-red-700 text-xs px-2.5 py-1 rounded-full font-bold flex items-center justify-center">
                            <AlertTriangle className="w-3 h-3 mr-1" /> Overpriced
                          </span>
                        </td>
                        <td className="py-4 text-xs text-slate-600">Unit rate of $30/bag exceeds approved submittal ($28/bag)</td>
                      </tr>

                      <tr className="hover:bg-amber-50/20">
                        <td className="py-4 font-bold text-slate-900">Grout</td>
                        <td className="py-4 text-right font-mono text-slate-700">250</td>
                        <td className="py-4 text-right font-mono text-slate-700">150</td>
                        <td className="py-4 text-right font-mono font-bold text-red-600">+100</td>
                        <td className="py-4 text-right font-mono font-bold text-red-600">+66.7%</td>
                        <td className="py-4 text-center">
                          <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-bold flex items-center justify-center">
                            <AlertTriangle className="w-3 h-3 mr-1" /> Excess Qty
                          </span>
                        </td>
                        <td className="py-4 text-xs text-slate-600">Excess quantity claimed without coverage calculations</td>
                      </tr>

                      <tr className="hover:bg-red-50/20">
                        <td className="py-4 font-bold text-slate-900">Skirting</td>
                        <td className="py-4 text-right font-mono text-slate-700">960</td>
                        <td className="py-4 text-right font-mono text-slate-700">576</td>
                        <td className="py-4 text-right font-mono font-bold text-red-600">+384</td>
                        <td className="py-4 text-right font-mono font-bold text-red-600">+66.7%</td>
                        <td className="py-4 text-center">
                          <span className="bg-red-100 text-red-700 text-xs px-2.5 py-1 rounded-full font-bold flex items-center justify-center">
                            <AlertTriangle className="w-3 h-3 mr-1" /> Overpriced
                          </span>
                        </td>
                        <td className="py-4 text-xs text-slate-600">Rate higher than benchmark ArchSD schedule</td>
                      </tr>

                      {/* Total row */}
                      <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
                        <td className="py-4 text-slate-900 text-base">Total</td>
                        <td className="py-4 text-right font-mono text-slate-900 text-base">22,510</td>
                        <td className="py-4 text-right font-mono text-emerald-800 text-base">16,590</td>
                        <td className="py-4 text-right font-mono text-red-600 text-base">+5,920</td>
                        <td className="py-4 text-right font-mono text-red-600 text-base">+26.3%</td>
                        <td colSpan={2} className="py-4 text-right text-xs text-slate-500">Adjudicated under GCC Clause 62</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Big Red Banner from UI Mockup Screen 4 */}
              <div className="bg-[#FFEAEA] border-2 border-red-300 rounded-2xl p-6 text-center shadow-md">
                <div className="text-xs uppercase font-extrabold text-red-600 tracking-widest">Inflated Amount Detected</div>
                <div className="text-4xl font-black text-red-600 font-mono mt-1">
                  5,920 (26.3%)
                </div>
                <p className="text-xs text-red-700 mt-2 font-medium">
                  Recommendation: Issue deduction notice within the Cap. 652 30-day response timeframe.
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: AS-BUILT VERIFY (COMPUTER VISION MODULE) */}
          {activeTab === 'as_built' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center space-x-2 text-xs font-bold text-emerald-800 mb-1">
                    <span>Variation:</span>
                    <span className="font-mono bg-emerald-100 px-2 py-0.5 rounded">V-2026-017</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600">Lobby Floor Area Completeness Inspection</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">As-Built Verification (CV Module)</h2>
                </div>

                <div className="flex space-x-2">
                  <span className="bg-emerald-100 text-emerald-800 text-xs px-3 py-1.5 rounded-full font-bold">
                    CV Confirmed
                  </span>
                  <button
                    onClick={() => setActiveTab('report')}
                    className="bg-[#1A3D32] hover:bg-[#132E26] text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1"
                  >
                    <span>Generate Cited Report</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* CV Layout: Photo on Left with Polygon Overlay, Classifier on Right */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Photo Viewer with Green Segmentation Polygon */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E0D0] p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900">Site Photo Inspection Feed</span>
                    <span className="text-slate-400 font-mono">Captured: 28 Jul 2026 10:15 AM</span>
                  </div>

                  {/* Image container with Green Overlay like the mockup */}
                  <div className="relative rounded-xl overflow-hidden border border-slate-300 aspect-video bg-slate-900 flex items-center justify-center group">
                    <img
                      src="https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1200&q=80"
                      alt="Construction site lobby"
                      className="w-full h-full object-cover"
                    />

                    {/* SVG Polygon Overlay showing 60% completion bounding mask */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <polygon
                        points="22,65 78,65 92,92 8,92"
                        className="fill-emerald-500/40 stroke-emerald-400 stroke-2"
                      />
                    </svg>

                    {/* Floating Tag */}
                    <div className="absolute bottom-4 left-4 bg-black/75 backdrop-blur text-white px-3 py-1.5 rounded-lg text-xs font-mono flex items-center space-x-2 border border-white/20">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      <span>Segment: Lobby Screed & Floor Tiling (60% Verified)</span>
                    </div>
                  </div>

                  {/* Thumbnail Selector */}
                  <div className="flex space-x-3 pt-2">
                    <div className="w-20 h-14 rounded-lg overflow-hidden border-2 border-emerald-600 cursor-pointer shadow-sm">
                      <img src="https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=200&q=80" className="w-full h-full object-cover" />
                    </div>
                    <div className="w-20 h-14 rounded-lg overflow-hidden border border-slate-300 opacity-60 hover:opacity-100 cursor-pointer transition-opacity">
                      <img src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=200&q=80" className="w-full h-full object-cover" />
                    </div>
                    <div className="w-20 h-14 rounded-lg overflow-hidden border border-slate-300 opacity-60 hover:opacity-100 cursor-pointer transition-opacity">
                      <img src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=200&q=80" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>

                {/* Right Completeness Classifier Card */}
                <div className="bg-white rounded-2xl border border-[#E5E0D0] p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg mb-1">Completeness Classifier</h3>
                    <p className="text-xs text-slate-500 mb-6">YOLOv8 + SAM boundary segmentation</p>

                    {/* Completeness Gauge */}
                    <div className="py-4 flex flex-col items-center">
                      <div className="relative w-40 h-40 rounded-full border-8 border-emerald-800/10 flex items-center justify-center bg-emerald-50 shadow-inner">
                        <div className="text-center">
                          <div className="text-4xl font-black text-emerald-950 font-mono">60%</div>
                          <div className="text-[11px] font-semibold text-emerald-700 uppercase">Pre-Complete</div>
                        </div>
                      </div>
                    </div>

                    {/* Status Breakdown Legend */}
                    <div className="space-y-3 mt-4 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center text-slate-700">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 mr-2"></span>
                          Completed (Sub-base & Screed)
                        </span>
                        <span className="font-mono font-bold text-slate-900">60%</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="flex items-center text-slate-700">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-2"></span>
                          In Progress (Adhesive laying)
                        </span>
                        <span className="font-mono font-bold text-slate-900">30%</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="flex items-center text-slate-700">
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-300 mr-2"></span>
                          Not Started (Skirting & Grouting)
                        </span>
                        <span className="font-mono font-bold text-slate-900">10%</span>
                      </div>
                    </div>

                    {/* Confidence Bar */}
                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-500 font-medium">AI Model Confidence</span>
                        <span className="font-mono font-bold text-emerald-700">92%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full" style={{ width: '92%' }}></div>
                      </div>
                    </div>

                    {/* Delta Valued Note */}
                    <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                      <strong>Delta Valued:</strong> 40% of the area is payable only upon final edge skirting installation.
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('report')}
                    className="w-full mt-6 py-2.5 bg-[#142B23] hover:bg-[#0c1c16] text-white rounded-xl text-xs font-bold transition-all shadow-md"
                  >
                    Export Cited Report →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: CITED VALUATION REPORT (EXPORTABLE) */}
          {activeTab === 'report' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center space-x-2 text-xs font-bold text-emerald-800 mb-1">
                    <span>Final Assessment:</span>
                    <span className="font-mono bg-emerald-100 px-2 py-0.5 rounded">V-2026-017</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600">Lobby size increase 20%</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Cited Valuation Report</h2>
                </div>

                <button
                  onClick={triggerExport}
                  className="bg-[#1A3D32] hover:bg-[#132E26] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shadow-lg cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF Report</span>
                </button>
              </div>

              {/* Printable Document Sheet */}
              <div className="bg-white rounded-3xl border border-[#DFDAC8] p-10 shadow-xl space-y-8 relative overflow-hidden">
                {/* Evidence Backed Stamp (from UI Mockup Screen 6) */}
                <div className="absolute top-10 right-10 rotate-12 border-4 border-emerald-800 text-emerald-800 px-4 py-2 rounded-xl text-center font-extrabold tracking-widest uppercase opacity-80 pointer-events-none">
                  <div className="text-lg">EVIDENCE</div>
                  <div className="text-sm">BACKED</div>
                </div>

                {/* Report Header */}
                <div className="border-b border-slate-200 pb-6">
                  <div className="text-xs uppercase tracking-wider text-slate-400 font-bold">Cascade Quantity Surveying Audit</div>
                  <h3 className="text-xl font-black text-slate-900 mt-1">
                    Report: V-2026-017 — Lobby Size Increase 20%
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Project: HA Public Housing Development • Prepared by Team Quantum</p>
                </div>

                {/* 2-Column Summary: Executive Summary vs References */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Executive Summary Column */}
                  <div className="space-y-4">
                    <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400">Executive Summary</h4>

                    <div className="space-y-2.5 text-sm">
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-600">Total Fair Value (Rounded)</span>
                        <span className="font-mono font-bold text-slate-900">$18,750</span>
                      </div>

                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-600">Inflated Amount Detected</span>
                        <span className="font-mono font-bold text-red-600">$5,920 (26.3%)</span>
                      </div>

                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-600">Payable Delta (This Claim)</span>
                        <span className="font-mono font-bold text-emerald-800">$7,500</span>
                      </div>

                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-600">Completeness (CV)</span>
                        <span className="font-mono font-bold text-slate-900">60%</span>
                      </div>

                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-600">Certification Impact</span>
                        <span className="font-semibold text-slate-800 text-xs text-right">
                          Payable within Cap. 652<br/>30-day window
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* References (Samples) Column */}
                  <div className="space-y-4">
                    <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400">References (Audit Trail)</h4>

                    <div className="bg-[#FAF8F3] p-5 rounded-2xl border border-[#E5E0D0] space-y-2 text-xs">
                      <div>
                        <span className="font-bold text-slate-800">• BQ Page:</span>{' '}
                        <span className="text-slate-600 font-mono">08-12</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-800">• Drawing:</span>{' '}
                        <span className="text-slate-600 font-mono">A-201, A-105</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-800">• Specification:</span>{' '}
                        <span className="text-slate-600 font-mono">SPC 23 40 00</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-800">• Site Photo:</span>{' '}
                        <span className="text-slate-600 font-mono">IMG_20260728_1045.jpg</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-800">• Rate Source:</span>{' '}
                        <span className="text-slate-600 font-mono">HKSMM4 (2024) Section 6.2.3</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conclusion Paragraph from Mockup */}
                <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-200">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-emerald-900 mb-1">Conclusion</h4>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Based on the analysis and evidence, <strong>$7,500 is payable for Variation V-2026-017</strong>.
                    All values are benchmarked to HKSMM4 and verified with site evidence. A deduction of <strong>$5,920</strong> has been
                    recommended against the contractor's overstated unit rates and unverified quantities.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

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
  ChevronRight,
  ExternalLink,
  Sparkles,
  Download,
  Info,
  Send,
  RefreshCw,
  FolderOpen,
  Globe
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { translations, Language } from './i18n';

import AsBuiltRoboflowViewer from './AsBuiltRoboflowViewer';

// Types
type TabType = 'dashboard' | 'impact_trace' | 'fair_value' | 'claim_check' | 'as_built' | 'report';

export default function App() {
  const [lang, setLang] = useState<Language>('zh-HK'); // Default to HK Cantonese/Traditional Chinese for HK Hackathon!
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [project] = useState('HA Public Housing Development - Block 4');
  const [selectedVariation] = useState('V-2026-017');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [govData, setGovData] = useState<any>(null);

  const t = translations[lang];

  // Fetch DATA.GOV.HK benchmarks
  useEffect(() => {
    fetch('/api/gov-data/rates')
      .then(res => res.json())
      .then(data => setGovData(data))
      .catch(() => {
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
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 }
    });
    alert(
      lang === 'en'
        ? "Exporting Official Cited Quantity Surveying Report (PDF) with HKSMM4 and Cap. 652 Compliance Audit Stamps!"
        : lang === 'zh-HK'
        ? "正在導出具 HKSMM4 及香港法例第 652 章審核標章的官方工料估值報告 (PDF)！"
        : "正在导出具 HKSMM4 及香港法例第 652 章审核印章的官方工程造价裁决报告 (PDF)！"
    );
  };

  const handleAiConsult = async () => {
    if (!aiPrompt) return;
    setLoadingAi(true);
    setAiAnalysis(null);

    // Language prompt instruction for LLM
    const promptLangSuffix =
      lang === 'zh-HK'
        ? "\n請以香港繁體中文（粵語工程慣用術語）回應，引用 HKSMM4 及第 652 章。"
        : lang === 'zh-CN'
        ? "\n请以简体中文专业工程造价术语回应，引用 HKSMM4 及第 652 章付款保障条例。"
        : "\nPlease respond in English using official HK HKSMM4 and Cap. 652 contract terms.";

    try {
      const res = await fetch('/api/ai/analyze-variation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt + promptLangSuffix,
          variation_id: selectedVariation
        })
      });
      const data = await res.json();
      setAiAnalysis(data.analysis);
    } catch (err) {
      setAiAnalysis(
        lang === 'zh-HK'
          ? "HKSMM4 測量引擎判定：承建商申報單價超出建築署標準 26.3%。依據 GCC 第 62 條建議扣減 HK$5,920。"
          : lang === 'zh-CN'
          ? "HKSMM4 造价引擎判定：施工方申报综合单价超出政府标准 26.3%。依据 GCC 第 62 条建议扣减 HK$5,920。"
          : "HKSMM4 rule engine applied: Claim exceeds ArchSD standard by 26.3%. Recommended deduction of HK$5,920 under GCC Clause 62."
      );
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8F6F0]">
      {/* SIDEBAR NAVIGATION - Dark Pine Green Theme from Mockup */}
      <aside className="w-68 bg-[#142B23] text-white flex flex-col justify-between shadow-2xl z-20">
        <div>
          {/* Brand Logo & Title */}
          <div className="p-5 border-b border-[#214338] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#3CB371] to-[#2E8B57] flex items-center justify-center shadow-lg">
                <GitBranch className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-wider text-white">CASCADE</h1>
                <p className="text-[10px] text-[#8EA39A] font-medium tracking-tight">{t.brandSub}</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3.5 space-y-1.5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-[#2E584A] text-white shadow-md shadow-[#0c1c16]'
                  : 'text-[#B0C4BC] hover:bg-[#1C3A30] hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span className="truncate">{t.nav.dashboard}</span>
            </button>

            <button
              onClick={() => setActiveTab('impact_trace')}
              className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'impact_trace'
                  ? 'bg-[#2E584A] text-white shadow-md shadow-[#0c1c16]'
                  : 'text-[#B0C4BC] hover:bg-[#1C3A30] hover:text-white'
              }`}
            >
              <GitBranch className="w-4 h-4 shrink-0" />
              <span className="truncate">{t.nav.impactTrace}</span>
              <span className="ml-auto text-[9px] bg-[#3CB371]/20 text-[#68D391] px-1.5 py-0.5 rounded font-mono">Graph</span>
            </button>

            <button
              onClick={() => setActiveTab('fair_value')}
              className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'fair_value'
                  ? 'bg-[#2E584A] text-white shadow-md shadow-[#0c1c16]'
                  : 'text-[#B0C4BC] hover:bg-[#1C3A30] hover:text-white'
              }`}
            >
              <Calculator className="w-4 h-4 shrink-0" />
              <span className="truncate">{t.nav.fairValue}</span>
              <span className="ml-auto text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">HKSMM4</span>
            </button>

            <button
              onClick={() => setActiveTab('claim_check')}
              className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'claim_check'
                  ? 'bg-[#2E584A] text-white shadow-md shadow-[#0c1c16]'
                  : 'text-[#B0C4BC] hover:bg-[#1C3A30] hover:text-white'
              }`}
            >
              <Scale className="w-4 h-4 shrink-0" />
              <span className="truncate">{t.nav.claimCheck}</span>
              <span className="ml-auto text-[9px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded font-mono">Alert</span>
            </button>

            <button
              onClick={() => setActiveTab('as_built')}
              className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'as_built'
                  ? 'bg-[#2E584A] text-white shadow-md shadow-[#0c1c16]'
                  : 'text-[#B0C4BC] hover:bg-[#1C3A30] hover:text-white'
              }`}
            >
              <Camera className="w-4 h-4 shrink-0" />
              <span className="truncate">{t.nav.asBuilt}</span>
              <span className="ml-auto text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-mono">CV</span>
            </button>

            <button
              onClick={() => setActiveTab('report')}
              className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'report'
                  ? 'bg-[#2E584A] text-white shadow-md shadow-[#0c1c16]'
                  : 'text-[#B0C4BC] hover:bg-[#1C3A30] hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span className="truncate">{t.nav.report}</span>
              <span className="ml-auto text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-mono">PDF</span>
            </button>
          </nav>

          {/* Quick Stats Pill */}
          <div className="mx-3.5 mt-3 p-3 bg-[#1C3A30] rounded-xl border border-[#2B4E42]">
            <div className="flex items-center justify-between text-xs text-[#8EA39A] mb-1">
              <span>{t.pills.cap652Status}</span>
              <span className="text-emerald-400 font-bold">{t.pills.cap652Active}</span>
            </div>
            <p className="text-[11px] text-[#CAD7D1] leading-tight">{t.pills.cap652Desc}</p>
          </div>
        </div>

        {/* User / Team Profile */}
        <div className="p-4 border-t border-[#214338] bg-[#0E201A] flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-emerald-600 border-2 border-emerald-400/50 flex items-center justify-center font-bold text-white text-xs shrink-0">
            QS
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-white truncate">{t.pills.userRole}</h4>
            <p className="text-[10px] text-[#8EA39A] truncate">{t.pills.userTeam}</p>
          </div>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#F8F6F0]">
        {/* Top Header Bar with Language Switcher */}
        <header className="h-16 border-b border-[#E3DEC9] bg-[#FAF8F3] px-8 flex items-center justify-between z-10">
          <div className="flex items-center space-x-4">
            <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-md border border-emerald-200">
              {t.pills.activeProject}
            </span>
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
              <FolderOpen className="w-4 h-4 text-emerald-700" />
              <span>{project}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* TRILINGUAL LANGUAGE SELECTOR (English, 粵語, 國語/普通話) */}
            <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-[#DCD6C2] shadow-sm">
              <Globe className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-0.5" />
              <button
                onClick={() => setLang('zh-HK')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  lang === 'zh-HK'
                    ? 'bg-[#1A3D32] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="粵語 / 繁體中文 (香港工程標準)"
              >
                粵語 (繁體)
              </button>
              <button
                onClick={() => setLang('zh-CN')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  lang === 'zh-CN'
                    ? 'bg-[#1A3D32] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="普通话 / 简体中文 (工程计价规范)"
              >
                普通话 (简体)
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  lang === 'en'
                    ? 'bg-[#1A3D32] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="English (International standard)"
              >
                English
              </button>
            </div>

            <div className="hidden lg:flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg border border-[#E3DEC9] text-xs shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold text-slate-700">{t.pills.aiConnected}</span>
            </div>

            <div className="text-right text-xs">
              <span className="text-slate-400 font-medium">{t.pills.currentVariation} </span>
              <span className="font-bold text-slate-800 font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
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
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t.dashboard.welcomeTitle}</h2>
                  <p className="text-xs text-slate-500 mt-1">{t.dashboard.welcomeSub}</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setActiveTab('impact_trace')}
                    className="inline-flex items-center space-x-2 bg-[#1A3D32] hover:bg-[#132E26] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
                  >
                    <span>{t.dashboard.inspectBtn}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* KPI Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-[#E5E0D0] shadow-sm hover:shadow-md transition-all">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.dashboard.kpiActive}</div>
                  <div className="mt-2 text-3xl font-extrabold text-slate-900 font-mono">12</div>
                  <div className="mt-2 flex items-center text-xs font-semibold text-emerald-600">
                    <TrendingUp className="w-3.5 h-3.5 mr-1" />
                    {t.dashboard.kpiActiveTrend}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#E5E0D0] shadow-sm hover:shadow-md transition-all">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.dashboard.kpiClaims}</div>
                  <div className="mt-2 text-3xl font-extrabold text-slate-900 font-mono">$168,590</div>
                  <div className="mt-2 flex items-center text-xs font-semibold text-slate-500">
                    {t.dashboard.kpiClaimsTrend}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#E5E0D0] shadow-sm hover:shadow-md transition-all">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.dashboard.kpiChecked}</div>
                  <div className="mt-2 text-3xl font-extrabold text-slate-900 font-mono">328</div>
                  <div className="mt-2 text-xs font-semibold text-emerald-600">
                    {t.dashboard.kpiCheckedSub}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-red-200 bg-red-50/30 shadow-sm hover:shadow-md transition-all">
                  <div className="text-xs font-semibold text-red-500 uppercase tracking-wider">{t.dashboard.kpiFlagged}</div>
                  <div className="mt-2 text-3xl font-extrabold text-red-600 font-mono">23</div>
                  <div className="mt-2 text-xs font-semibold text-red-500 flex items-center">
                    <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                    {t.dashboard.kpiFlaggedSub}
                  </div>
                </div>
              </div>

              {/* Main Table + Donut Summary Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E0D0] p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-900 text-sm">{t.dashboard.recentTitle}</h3>
                    <span className="text-xs text-slate-400">{t.dashboard.recentSub}</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                          <th className="pb-3">{t.dashboard.colId}</th>
                          <th className="pb-3">{t.dashboard.colTitle}</th>
                          <th className="pb-3">{t.dashboard.colStatus}</th>
                          <th className="pb-3">{t.dashboard.colImpact}</th>
                          <th className="pb-3">{t.dashboard.colUpdated}</th>
                          <th className="pb-3 text-right">{t.dashboard.colAction}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr className="hover:bg-amber-50/40 transition-colors group">
                          <td className="py-3.5 font-mono font-bold text-slate-900">V-2026-017</td>
                          <td className="py-3.5 font-semibold text-slate-800">
                            {lang === 'en' ? 'Lobby size increase 20%' : lang === 'zh-HK' ? '地下大堂面積擴展 20%' : '首层门厅面积扩建 20%'}
                          </td>
                          <td className="py-3.5">
                            <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full font-bold">
                              {lang === 'en' ? 'In Progress' : lang === 'zh-HK' ? '進行中' : '进行中'}
                            </span>
                          </td>
                          <td className="py-3.5">
                            <span className="bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full font-bold">
                              {lang === 'en' ? 'High' : lang === 'zh-HK' ? '重大' : '高'}
                            </span>
                          </td>
                          <td className="py-3.5 text-slate-500">28 Jul 2026</td>
                          <td className="py-3.5 text-right">
                            <button
                              onClick={() => setActiveTab('impact_trace')}
                              className="font-bold text-emerald-800 hover:text-emerald-950 inline-flex items-center cursor-pointer"
                            >
                              {lang === 'en' ? 'Trace' : lang === 'zh-HK' ? '圖譜追蹤' : '影响追溯'} <ChevronRight className="w-3 h-3 ml-0.5" />
                            </button>
                          </td>
                        </tr>

                        <tr className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 font-mono font-bold text-slate-900">V-2026-016</td>
                          <td className="py-3.5 font-medium text-slate-800">
                            {lang === 'en' ? 'Structural opening change' : lang === 'zh-HK' ? '結構開孔洞位置變更' : '结构开洞位置变更'}
                          </td>
                          <td className="py-3.5">
                            <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-bold">
                              {lang === 'en' ? 'Reviewed' : lang === 'zh-HK' ? '已審查' : '已审查'}
                            </span>
                          </td>
                          <td className="py-3.5">
                            <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-bold">
                              {lang === 'en' ? 'Medium' : lang === 'zh-HK' ? '中等' : '中'}
                            </span>
                          </td>
                          <td className="py-3.5 text-slate-500">27 Jul 2026</td>
                          <td className="py-3.5 text-right">
                            <span className="text-slate-400 font-medium">Audited</span>
                          </td>
                        </tr>

                        <tr className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 font-mono font-bold text-slate-900">V-2026-015</td>
                          <td className="py-3.5 font-medium text-slate-800">
                            {lang === 'en' ? 'MEP reroute impact' : lang === 'zh-HK' ? '機電管道重置連帶影響' : '机电管线重设连锁影响'}
                          </td>
                          <td className="py-3.5">
                            <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full font-bold">
                              {lang === 'en' ? 'In Progress' : lang === 'zh-HK' ? '進行中' : '进行中'}
                            </span>
                          </td>
                          <td className="py-3.5">
                            <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-bold">
                              {lang === 'en' ? 'Medium' : lang === 'zh-HK' ? '中等' : '中'}
                            </span>
                          </td>
                          <td className="py-3.5 text-slate-500">26 Jul 2026</td>
                          <td className="py-3.5 text-right">
                            <span className="text-slate-400 font-medium">Reviewing</span>
                          </td>
                        </tr>

                        <tr className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 font-mono font-bold text-slate-900">V-2026-014</td>
                          <td className="py-3.5 font-medium text-slate-800">
                            {lang === 'en' ? 'Finishes modification' : lang === 'zh-HK' ? '大堂飾面材料規格微調' : '门厅饰面材料规格微调'}
                          </td>
                          <td className="py-3.5">
                            <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
                              {lang === 'en' ? 'Completed' : lang === 'zh-HK' ? '已完成' : '已完成'}
                            </span>
                          </td>
                          <td className="py-3.5">
                            <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-bold">
                              {lang === 'en' ? 'Low' : lang === 'zh-HK' ? '輕微' : '低'}
                            </span>
                          </td>
                          <td className="py-3.5 text-slate-500">25 Jul 2026</td>
                          <td className="py-3.5 text-right">
                            <span className="text-emerald-700 font-bold">Settled</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Impact Donut */}
                <div className="bg-white rounded-2xl border border-[#E5E0D0] p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm mb-1">{t.dashboard.impactSummaryTitle}</h3>
                    <p className="text-[11px] text-slate-500">{t.dashboard.impactSummarySub}</p>
                  </div>

                  <div className="py-6 flex flex-col items-center">
                    <div className="relative w-44 h-44 rounded-full border-8 border-emerald-800/10 flex items-center justify-center bg-gradient-to-tr from-emerald-50 to-teal-50 shadow-inner">
                      <div className="text-center">
                        <div className="text-3xl font-black text-slate-900 font-mono">263</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-pre-line">
                          {t.dashboard.totalAffected}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-slate-100 pt-4 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center text-slate-600">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 mr-2"></span>
                        {t.dashboard.directItems}
                      </span>
                      <span className="font-mono font-bold text-slate-800">48 (18.2%)</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="flex items-center text-slate-600">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-2"></span>
                        {t.dashboard.indirect1hop}
                      </span>
                      <span className="font-mono font-bold text-slate-800">126 (47.9%)</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="flex items-center text-slate-600">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-400 mr-2"></span>
                        {t.dashboard.indirect2hop}
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
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
                      <Info className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-[#A1B8AF] font-bold">
                        {t.dashboard.dataGovHkTitle}
                      </div>
                      <div className="text-xs font-semibold text-white">
                        {t.dashboard.dataGovHkDesc}: <span className="font-mono text-emerald-400 font-bold">2,180</span> ({govData.tender_price_index.trend})
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6 text-xs text-[#CAD7D1]">
                    <div>
                      {lang === 'en' ? 'Plasterer/Tiler' : lang === 'zh-HK' ? '泥水及鋪貼工' : '抹灰及铺贴工'}:{' '}
                      <strong className="text-white font-mono">$1,380/日</strong>
                    </div>
                    <div>
                      {lang === 'en' ? 'Formwork Carpenter' : lang === 'zh-HK' ? '釘板木工' : '模板木工'}:{' '}
                      <strong className="text-white font-mono">$1,420/日</strong>
                    </div>
                    <div>
                      {lang === 'en' ? 'Bar Bender' : lang === 'zh-HK' ? '扎鐵鋼筋工' : '钢筋工'}:{' '}
                      <strong className="text-white font-mono">$1,650/日</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: IMPACT TRACE (GRAPH VIEW) */}
          {activeTab === 'impact_trace' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center space-x-2 text-xs font-bold text-emerald-800 mb-1">
                    <span>{t.pills.currentVariation}</span>
                    <span className="font-mono bg-emerald-100 px-2 py-0.5 rounded">V-2026-017</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600">{t.impactTrace.sub}</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t.impactTrace.title}</h2>
                </div>

                <div className="flex space-x-2">
                  <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1.5 rounded-full font-bold">
                    In Progress
                  </span>
                  <button
                    onClick={() => setActiveTab('fair_value')}
                    className="bg-[#1A3D32] hover:bg-[#132E26] text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer"
                  >
                    <span>{t.impactTrace.proceedBtn}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Sub-tabs indicator inside Variation */}
              <div className="flex border-b border-[#E3DEC9] text-xs font-bold space-x-6 text-slate-500">
                <button className="pb-2 text-slate-400 hover:text-slate-700">{t.impactTrace.tabs.overview}</button>
                <button className="pb-2 border-b-2 border-emerald-800 text-emerald-900 font-extrabold">{t.impactTrace.tabs.impactTrace}</button>
                <button onClick={() => setActiveTab('fair_value')} className="pb-2 text-slate-400 hover:text-slate-700">{t.impactTrace.tabs.fairValue}</button>
                <button onClick={() => setActiveTab('claim_check')} className="pb-2 text-slate-400 hover:text-slate-700">{t.impactTrace.tabs.claims}</button>
                <button onClick={() => setActiveTab('as_built')} className="pb-2 text-slate-400 hover:text-slate-700">{t.impactTrace.tabs.asBuilt}</button>
                <button onClick={() => setActiveTab('report')} className="pb-2 text-slate-400 hover:text-slate-700">{t.impactTrace.tabs.report}</button>
              </div>

              {/* Radial Graph Canvas */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[#F5F2E9] rounded-2xl border border-[#DFDAC8] p-6 shadow-inner relative min-h-[480px] flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1A3D32 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

                  <div className="absolute w-[360px] h-[360px] rounded-full border border-dashed border-[#1A3D32]/20 pointer-events-none animate-pulse"></div>
                  <div className="absolute w-[220px] h-[220px] rounded-full border border-dashed border-emerald-600/30 pointer-events-none"></div>

                  {/* Center Node */}
                  <div className="z-10 bg-[#142B23] text-white w-32 h-32 rounded-full flex flex-col items-center justify-center text-center p-3 shadow-2xl border-4 border-[#3CB371] hover:scale-105 transition-transform cursor-pointer">
                    <span className="text-[11px] font-bold leading-tight whitespace-pre-line">{t.impactTrace.centerNode}</span>
                    <span className="text-[9px] bg-emerald-500/30 text-emerald-300 px-1.5 py-0.5 rounded mt-1 font-mono">263 items</span>
                  </div>

                  {/* Top: Finishes */}
                  <div className="absolute top-10 flex flex-col items-center z-10">
                    <div className="w-16 h-16 rounded-full bg-[#FFF2DE] border-2 border-amber-400 shadow-md flex flex-col items-center justify-center text-center p-1 hover:scale-110 transition-transform cursor-pointer">
                      <span className="text-[10px] font-bold text-amber-900 leading-tight">{t.impactTrace.clusters.finishes}</span>
                      <span className="text-[9px] text-amber-700 font-mono">(3)</span>
                    </div>
                  </div>

                  {/* Top-Right: Reinforcement */}
                  <div className="absolute top-24 right-20 flex flex-col items-center z-10">
                    <div className="w-16 h-16 rounded-full bg-[#FFF2DE] border-2 border-amber-400 shadow-md flex flex-col items-center justify-center text-center p-1 hover:scale-110 transition-transform cursor-pointer">
                      <span className="text-[10px] font-bold text-amber-900 leading-tight">{t.impactTrace.clusters.reinforcement}</span>
                      <span className="text-[9px] text-amber-700 font-mono">(4)</span>
                    </div>
                  </div>

                  {/* Bottom-Right: MEP */}
                  <div className="absolute bottom-20 right-24 flex flex-col items-center z-10">
                    <div className="w-16 h-16 rounded-full bg-[#FFF2DE] border-2 border-amber-400 shadow-md flex flex-col items-center justify-center text-center p-1 hover:scale-110 transition-transform cursor-pointer">
                      <span className="text-[10px] font-bold text-amber-900 leading-tight">{t.impactTrace.clusters.mep}</span>
                      <span className="text-[9px] text-amber-700 font-mono">(11)</span>
                    </div>
                  </div>

                  {/* Bottom: Doors / Setup */}
                  <div className="absolute bottom-8 flex flex-col items-center z-10">
                    <div className="w-16 h-16 rounded-full bg-[#FFF2DE] border-2 border-amber-400 shadow-md flex flex-col items-center justify-center text-center p-1 hover:scale-110 transition-transform cursor-pointer">
                      <span className="text-[10px] font-bold text-amber-900 leading-tight">{t.impactTrace.clusters.doorsSetup}</span>
                      <span className="text-[9px] text-amber-700 font-mono">(2)</span>
                    </div>
                  </div>

                  {/* Bottom-Left: Doors / Frames */}
                  <div className="absolute bottom-20 left-24 flex flex-col items-center z-10">
                    <div className="w-16 h-16 rounded-full bg-[#FFF2DE] border-2 border-amber-400 shadow-md flex flex-col items-center justify-center text-center p-1 hover:scale-110 transition-transform cursor-pointer">
                      <span className="text-[10px] font-bold text-amber-900 leading-tight">{t.impactTrace.clusters.doorsFrames}</span>
                      <span className="text-[9px] text-amber-700 font-mono">(2)</span>
                    </div>
                  </div>

                  {/* Top-Left: Formwork */}
                  <div className="absolute top-24 left-20 flex flex-col items-center z-10">
                    <div className="w-16 h-16 rounded-full bg-[#FFF2DE] border-2 border-amber-400 shadow-md flex flex-col items-center justify-center text-center p-1 hover:scale-110 transition-transform cursor-pointer">
                      <span className="text-[10px] font-bold text-amber-900 leading-tight">{t.impactTrace.clusters.formwork}</span>
                      <span className="text-[9px] text-amber-700 font-mono">(4)</span>
                    </div>
                  </div>

                  {/* Top-Mid-Left: Columns */}
                  <div className="absolute top-10 left-48 flex flex-col items-center z-10">
                    <div className="w-16 h-16 rounded-full bg-[#FFF2DE] border-2 border-amber-400 shadow-md flex flex-col items-center justify-center text-center p-1 hover:scale-110 transition-transform cursor-pointer">
                      <span className="text-[10px] font-bold text-amber-900 leading-tight">{t.impactTrace.clusters.columns}</span>
                      <span className="text-[9px] text-amber-700 font-mono">(4)</span>
                    </div>
                  </div>

                  {/* Legend Overlay */}
                  <div className="absolute bottom-3 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-200 text-[10px] flex items-center space-x-4">
                    <span className="flex items-center text-slate-700"><span className="w-2.5 h-0.5 bg-emerald-700 mr-1.5"></span> {t.impactTrace.legendDirect}</span>
                    <span className="flex items-center text-slate-700"><span className="w-2.5 h-0.5 border-b border-dashed border-amber-600 mr-1.5"></span> {t.impactTrace.legend1hop}</span>
                    <span className="flex items-center text-slate-700"><span className="w-2.5 h-0.5 border-b border-dotted border-slate-500 mr-1.5"></span> {t.impactTrace.legend2hop}</span>
                  </div>
                </div>

                {/* Sidebar Impact Breakdown Details */}
                <div className="bg-white rounded-2xl border border-[#E5E0D0] p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base mb-1">{t.impactTrace.sidebarTitle}</h3>
                    <p className="text-[11px] text-slate-500 mb-6">{t.impactTrace.sidebarSub}</p>

                    <div className="space-y-4">
                      <div className="bg-[#FAF8F3] p-4 rounded-xl border border-[#E5E0D0]">
                        <div className="text-xs text-slate-500 font-medium">{t.dashboard.totalAffected}</div>
                        <div className="text-2xl font-black text-slate-900 font-mono mt-0.5">263</div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                          <span className="text-emerald-700 font-medium">{t.dashboard.directItems}</span>
                          <p className="text-lg font-bold text-emerald-900 font-mono mt-1">48</p>
                        </div>
                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                          <span className="text-amber-700 font-medium">{t.dashboard.indirect1hop}</span>
                          <p className="text-lg font-bold text-amber-900 font-mono mt-1">126</p>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                        <span className="text-slate-600 font-medium">{t.dashboard.indirect2hop}</span>
                        <p className="text-lg font-bold text-slate-800 font-mono mt-1">89</p>
                      </div>

                      <div className="p-4 bg-emerald-950 text-white rounded-xl shadow-sm">
                        <div className="text-[11px] text-emerald-400 uppercase tracking-wider font-semibold">{t.impactTrace.netImpact}</div>
                        <div className="text-2xl font-extrabold text-white font-mono mt-1">$18,750</div>
                        <p className="text-[10px] text-emerald-200 mt-1">{t.impactTrace.hksmm4Basis}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('fair_value')}
                    className="w-full mt-6 py-2.5 bg-[#142B23] hover:bg-[#0c1c16] text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    {t.impactTrace.proceedBtn} →
                  </button>
                </div>
              </div>

              {/* Interactive AI Agent Copilot Box */}
              <div className="bg-white rounded-2xl border border-[#E5E0D0] p-6 shadow-sm">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 mb-2">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span>{t.impactTrace.aiCopilotTitle}</span>
                </div>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder={t.impactTrace.aiPlaceholder}
                    className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-slate-50/50"
                  />
                  <button
                    onClick={handleAiConsult}
                    disabled={loadingAi}
                    className="bg-[#1A3D32] hover:bg-[#132E26] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer"
                  >
                    {loadingAi ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>{loadingAi ? t.impactTrace.aiAnalyzing : t.impactTrace.aiButton}</span>
                  </button>
                </div>

                {aiAnalysis && (
                  <div className="mt-4 p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-slate-800 leading-relaxed font-mono whitespace-pre-line">
                    <div className="font-bold text-emerald-950 mb-1 flex items-center">
                      <ShieldCheck className="w-4 h-4 mr-1 text-emerald-700" />
                      {t.impactTrace.aiAdjudicationTitle}
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
                    <span>{t.pills.currentVariation}</span>
                    <span className="font-mono bg-emerald-100 px-2 py-0.5 rounded">V-2026-017</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600">{t.fairValue.sub}</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t.fairValue.title}</h2>
                </div>

                <div className="flex space-x-2">
                  <span className="bg-amber-100 text-amber-900 text-xs px-3 py-1.5 rounded-full font-bold">
                    Review Pending
                  </span>
                  <button
                    onClick={() => setActiveTab('claim_check')}
                    className="bg-[#1A3D32] hover:bg-[#132E26] text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer"
                  >
                    <span>{t.fairValue.checkClaimBtn}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Table + Breakdown Side Pane */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E0D0] p-6 shadow-sm">
                  <h3 className="font-bold text-slate-900 text-sm mb-4">{t.fairValue.tableTitle}</h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                          <th className="pb-3">{t.fairValue.colItem}</th>
                          <th className="pb-3 text-right">{t.fairValue.colQty}</th>
                          <th className="pb-3 text-right">{t.fairValue.colRate}</th>
                          <th className="pb-3 text-right">{t.fairValue.colAmount}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="py-3 font-semibold text-slate-900">
                            {lang === 'en' ? 'Tiles 600×600' : lang === 'zh-HK' ? '防滑過底地磚 600×600' : '防滑玻化地砖 600×600'}
                          </td>
                          <td className="py-3 text-right font-mono text-slate-600">120 m²</td>
                          <td className="py-3 text-right font-mono text-slate-600">128.00</td>
                          <td className="py-3 text-right font-mono font-bold text-slate-900">15,360.00</td>
                        </tr>
                        <tr>
                          <td className="py-3 font-semibold text-slate-900">
                            {lang === 'en' ? 'Tile Adhesive' : lang === 'zh-HK' ? '聚合物瓷磚膠泥' : '聚合物瓷砖粘结剂'}
                          </td>
                          <td className="py-3 text-right font-mono text-slate-600">18 bags</td>
                          <td className="py-3 text-right font-mono text-slate-600">28.00</td>
                          <td className="py-3 text-right font-mono font-bold text-slate-900">504.00</td>
                        </tr>
                        <tr>
                          <td className="py-3 font-semibold text-slate-900">
                            {lang === 'en' ? 'Grout' : lang === 'zh-HK' ? '防水專用填縫劑' : '防水专用勾缝填料'}
                          </td>
                          <td className="py-3 text-right font-mono text-slate-600">10 bags</td>
                          <td className="py-3 text-right font-mono text-slate-600">15.00</td>
                          <td className="py-3 text-right font-mono font-bold text-slate-900">150.00</td>
                        </tr>
                        <tr>
                          <td className="py-3 font-semibold text-slate-900">
                            {lang === 'en' ? 'Skirting' : lang === 'zh-HK' ? '同質地磚踢腳線 (100mm)' : '同质地砖踢脚线 (100mm)'}
                          </td>
                          <td className="py-3 text-right font-mono text-slate-600">48 m</td>
                          <td className="py-3 text-right font-mono text-slate-600">12.00</td>
                          <td className="py-3 text-right font-mono font-bold text-slate-900">576.00</td>
                        </tr>

                        <tr className="bg-slate-50 font-semibold border-t-2 border-slate-200">
                          <td colSpan={3} className="py-3 px-2 text-slate-700">{t.fairValue.subtotal}</td>
                          <td className="py-3 text-right font-mono font-bold text-slate-900">16,590.00</td>
                        </tr>

                        <tr>
                          <td colSpan={3} className="py-3 px-2 text-slate-600">{t.fairValue.adjustments}</td>
                          <td className="py-3 text-right font-mono font-medium text-slate-800">2,157.00</td>
                        </tr>

                        <tr className="bg-emerald-50/60 font-bold border-t-2 border-emerald-600">
                          <td colSpan={3} className="py-4 px-2 text-emerald-950 text-sm">{t.fairValue.totalFairValue}</td>
                          <td className="py-4 text-right font-mono text-xl text-emerald-950 font-black">18,750.00</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right Details */}
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-[#E5E0D0] p-6 shadow-sm">
                    <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">{t.fairValue.rateBasisTitle}</h4>
                    <p className="text-xs font-bold text-slate-800">{t.fairValue.rateBasisDesc}</p>
                    <p className="text-xs text-slate-500 mt-1">IPC: Tile work</p>
                    <p className="text-xs text-slate-500">Source: Section 6.2.3</p>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-emerald-700 font-bold hover:underline cursor-pointer flex items-center">
                        {t.fairValue.viewAnalysis} <ExternalLink className="w-3 h-3 ml-1" />
                      </span>
                    </div>
                  </div>

                  <div className="bg-red-50 rounded-2xl border border-red-200 p-5 shadow-sm">
                    <div className="text-xs font-bold text-red-500 uppercase tracking-wider">{t.fairValue.varianceTitle}</div>
                    <div className="mt-1 text-2xl font-black text-red-600 font-mono">+$5,920 (26.3%)</div>
                    <p className="text-xs text-red-700 mt-1">{t.fairValue.varianceDesc}</p>
                  </div>

                  <div className="bg-white rounded-2xl border border-[#E5E0D0] p-6 shadow-sm space-y-3">
                    <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400">{t.fairValue.rateBreakdownTitle}</h4>

                    <div className="space-y-2 text-xs">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-600">{lang === 'en' ? 'Labour' : lang === 'zh-HK' ? '人工人工費' : '人工费'}</span>
                          <span className="font-mono font-bold text-slate-800">40%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-[#1A3D32] h-full" style={{ width: '40%' }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-600">{lang === 'en' ? 'Material' : lang === 'zh-HK' ? '材料費' : '材料费'}</span>
                          <span className="font-mono font-bold text-slate-800">45%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-600 h-full" style={{ width: '45%' }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-600">{lang === 'en' ? 'Plant' : lang === 'zh-HK' ? '機械設備費' : '机械设备费'}</span>
                          <span className="font-mono font-bold text-slate-800">10%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full" style={{ width: '10%' }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-600">{lang === 'en' ? 'Other' : lang === 'zh-HK' ? '其他及開支' : '其他规费'}</span>
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
                    <span>{t.pills.currentVariation}</span>
                    <span className="font-mono bg-emerald-100 px-2 py-0.5 rounded">V-2026-017</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600">{t.claimCheck.sub}</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t.claimCheck.title}</h2>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setActiveTab('as_built')}
                    className="bg-[#1A3D32] hover:bg-[#132E26] text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer"
                  >
                    <span>{t.claimCheck.inspectCvBtn}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Adjudication Table */}
              <div className="bg-white rounded-2xl border border-[#E5E0D0] p-6 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                        <th className="pb-3">{t.claimCheck.colItem}</th>
                        <th className="pb-3 text-right">{t.claimCheck.colClaim}</th>
                        <th className="pb-3 text-right">{t.claimCheck.colCascade}</th>
                        <th className="pb-3 text-right">{t.claimCheck.colVariance}</th>
                        <th className="pb-3 text-right">{t.claimCheck.colVariancePct}</th>
                        <th className="pb-3 text-center">{t.claimCheck.colFlag}</th>
                        <th className="pb-3">{t.claimCheck.colReason}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr className="hover:bg-red-50/20">
                        <td className="py-4 font-bold text-slate-900">
                          {lang === 'en' ? 'Tiles 600×600' : lang === 'zh-HK' ? '防滑地磚 600×600' : '玻化地砖 600×600'}
                        </td>
                        <td className="py-4 text-right font-mono text-slate-700">20,400</td>
                        <td className="py-4 text-right font-mono text-slate-700">15,360</td>
                        <td className="py-4 text-right font-mono font-bold text-red-600">+5,040</td>
                        <td className="py-4 text-right font-mono font-bold text-red-600">+32.8%</td>
                        <td className="py-4 text-center">
                          <span className="bg-red-100 text-red-700 text-[11px] px-2.5 py-1 rounded-full font-bold flex items-center justify-center">
                            <AlertTriangle className="w-3 h-3 mr-1" /> {t.claimCheck.overpriced}
                          </span>
                        </td>
                        <td className="py-4 text-slate-600">
                          {lang === 'en'
                            ? 'Rate higher than HKSMM4 standard ($170 vs $128/m²)'
                            : lang === 'zh-HK'
                            ? '申報單價高於 HKSMM4 測量標準 ($170 vs 基準 $128/m²)'
                            : '申报综合单价高于 HKSMM4 标准 ($170 vs 基准 $128/m²)'}
                        </td>
                      </tr>

                      <tr className="hover:bg-red-50/20">
                        <td className="py-4 font-bold text-slate-900">
                          {lang === 'en' ? 'Tile Adhesive' : lang === 'zh-HK' ? '聚合物瓷磚膠泥' : '聚合物瓷砖粘结剂'}
                        </td>
                        <td className="py-4 text-right font-mono text-slate-700">900</td>
                        <td className="py-4 text-right font-mono text-slate-700">504</td>
                        <td className="py-4 text-right font-mono font-bold text-red-600">+396</td>
                        <td className="py-4 text-right font-mono font-bold text-red-600">+78.6%</td>
                        <td className="py-4 text-center">
                          <span className="bg-red-100 text-red-700 text-[11px] px-2.5 py-1 rounded-full font-bold flex items-center justify-center">
                            <AlertTriangle className="w-3 h-3 mr-1" /> {t.claimCheck.overpriced}
                          </span>
                        </td>
                        <td className="py-4 text-slate-600">
                          {lang === 'en'
                            ? 'Claimed 30 bags at $30 vs verified theoretical coverage of 18 bags at $28'
                            : lang === 'zh-HK'
                            ? '申報 30 包 ($30/包)，遠超理論覆蓋用量 18 包及核准單價 ($28/包)'
                            : '申报 30 包 ($30/包)，远超理论定额用量 18 包及批准单价 ($28/包)'}
                        </td>
                      </tr>

                      <tr className="hover:bg-amber-50/20">
                        <td className="py-4 font-bold text-slate-900">
                          {lang === 'en' ? 'Grout' : lang === 'zh-HK' ? '防水專用填縫劑' : '防水专用勾缝料'}
                        </td>
                        <td className="py-4 text-right font-mono text-slate-700">250</td>
                        <td className="py-4 text-right font-mono text-slate-700">150</td>
                        <td className="py-4 text-right font-mono font-bold text-red-600">+100</td>
                        <td className="py-4 text-right font-mono font-bold text-red-600">+66.7%</td>
                        <td className="py-4 text-center">
                          <span className="bg-amber-100 text-amber-800 text-[11px] px-2.5 py-1 rounded-full font-bold flex items-center justify-center">
                            <AlertTriangle className="w-3 h-3 mr-1" /> {t.claimCheck.excessQty}
                          </span>
                        </td>
                        <td className="py-4 text-slate-600">
                          {lang === 'en'
                            ? 'Excess quantity claimed without coverage calculations'
                            : lang === 'zh-HK'
                            ? '超額申索用量，缺乏圖紙及合約面積計算佐證'
                            : '超额申报工程量，缺乏计算依据与图纸佐证'}
                        </td>
                      </tr>

                      <tr className="hover:bg-red-50/20">
                        <td className="py-4 font-bold text-slate-900">
                          {lang === 'en' ? 'Skirting' : lang === 'zh-HK' ? '同質地磚踢腳線' : '同质地砖踢脚线'}
                        </td>
                        <td className="py-4 text-right font-mono text-slate-700">960</td>
                        <td className="py-4 text-right font-mono text-slate-700">576</td>
                        <td className="py-4 text-right font-mono font-bold text-red-600">+384</td>
                        <td className="py-4 text-right font-mono font-bold text-red-600">+66.7%</td>
                        <td className="py-4 text-center">
                          <span className="bg-red-100 text-red-700 text-[11px] px-2.5 py-1 rounded-full font-bold flex items-center justify-center">
                            <AlertTriangle className="w-3 h-3 mr-1" /> {t.claimCheck.overpriced}
                          </span>
                        </td>
                        <td className="py-4 text-slate-600">
                          {lang === 'en'
                            ? 'Rate higher than benchmark ArchSD schedule'
                            : lang === 'zh-HK'
                            ? '單價高於建築署公營工程標價單基準 (ArchSD SOR)'
                            : '单价高于建筑署公共工程标准价目表 (ArchSD SOR)'}
                        </td>
                      </tr>

                      <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
                        <td className="py-4 text-slate-900 text-sm">{t.claimCheck.total}</td>
                        <td className="py-4 text-right font-mono text-slate-900 text-sm">22,510</td>
                        <td className="py-4 text-right font-mono text-emerald-800 text-sm">16,590</td>
                        <td className="py-4 text-right font-mono text-red-600 text-sm">+5,920</td>
                        <td className="py-4 text-right font-mono text-red-600 text-sm">+26.3%</td>
                        <td colSpan={2} className="py-4 text-right text-xs text-slate-500 font-medium">
                          {t.claimCheck.gccRule}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Big Red Banner from UI Mockup Screen 4 */}
              <div className="bg-[#FFEAEA] border-2 border-red-300 rounded-2xl p-6 text-center shadow-md">
                <div className="text-xs uppercase font-extrabold text-red-600 tracking-widest">{t.claimCheck.inflatedDetected}</div>
                <div className="text-4xl font-black text-red-600 font-mono mt-1">
                  5,920 (26.3%)
                </div>
                <p className="text-xs text-red-700 mt-2 font-medium">
                  {t.claimCheck.cap652Notice}
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
                    <span>{t.pills.currentVariation}</span>
                    <span className="font-mono bg-emerald-100 px-2 py-0.5 rounded">V-2026-017</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600">Lobby Floor Area</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t.asBuilt.title}</h2>
                </div>

                <div className="flex space-x-2">
                  <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1.5 rounded-full font-bold">
                    In Progress
                  </span>
                  <button
                    onClick={() => setActiveTab('report')}
                    className="bg-[#1A3D32] hover:bg-[#132E26] text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer"
                  >
                    <span>{t.asBuilt.generateReportBtn}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Exact Screen 5 layout from your proposal mockup */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Site Photo Box */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E0D0] p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900 text-sm">Site Photo</span>
                    <span className="text-slate-400 font-mono">Captured: 28 Jul 2026 10:15 AM</span>
                  </div>

                  {/* Clean original photo frame with the green floor boundary from your design */}
                  <div className="relative rounded-2xl overflow-hidden border border-slate-300 aspect-[16/10] bg-slate-900 flex items-center justify-center shadow-md">
                    <img
                      src="/original_asbuilt_photo.png"
                      alt="Lobby Floor Area As-Built Inspection"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Bottom Thumbnail Strip */}
                  <div className="flex items-center space-x-3 pt-2">
                    <div className="w-18 h-12 rounded-lg overflow-hidden border-2 border-emerald-600 shadow-sm cursor-pointer">
                      <img src="/original_asbuilt_photo.png" className="w-full h-full object-cover" alt="Angle 1" />
                    </div>
                    <div className="w-18 h-12 rounded-lg overflow-hidden border border-slate-300 opacity-60 hover:opacity-100 shadow-sm cursor-pointer transition-opacity">
                      <img src="/original_asbuilt_photo.png" className="w-full h-full object-cover scale-110" alt="Angle 2" />
                    </div>
                    <div className="w-18 h-12 rounded-lg overflow-hidden border border-slate-300 opacity-60 hover:opacity-100 shadow-sm cursor-pointer transition-opacity">
                      <img src="/original_asbuilt_photo.png" className="w-full h-full object-cover scale-125" alt="Angle 3" />
                    </div>
                    <span className="text-[11px] text-slate-400 ml-2 font-mono">
                      Captured: 28 Jul 2026 10:15 AM
                    </span>
                  </div>
                </div>

                {/* Right: Completeness Classifier Box */}
                <div className="bg-white rounded-2xl border border-[#E5E0D0] p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base mb-1">Completeness Classifier</h3>
                    <p className="text-xs text-slate-400 mb-6">Bounding element taxonomy verification</p>

                    {/* Circular Completeness Indicator from Mockup */}
                    <div className="py-4 flex flex-col items-center">
                      <div className="relative w-40 h-40 rounded-full border-8 border-emerald-700/20 flex items-center justify-center bg-[#FAF8F3] shadow-inner">
                        <div className="text-center">
                          <div className="text-4xl font-black text-slate-900 font-mono">60%</div>
                          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Pre-Complete</div>
                        </div>
                      </div>
                    </div>

                    {/* Status Breakdown Legend */}
                    <div className="space-y-3 mt-4 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center text-slate-700">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 mr-2"></span>
                          Completed
                        </span>
                        <span className="font-mono font-bold text-slate-900">60%</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="flex items-center text-slate-700">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-2"></span>
                          In Progress
                        </span>
                        <span className="font-mono font-bold text-slate-900">30%</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="flex items-center text-slate-700">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-400 mr-2"></span>
                          Not Started
                        </span>
                        <span className="font-mono font-bold text-slate-900">10%</span>
                      </div>
                    </div>

                    {/* AI Confidence Bar */}
                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-500 font-medium">AI Confidence</span>
                        <span className="font-mono font-bold text-emerald-800">92%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#1A3D32] h-full" style={{ width: '92%' }}></div>
                      </div>
                    </div>

                    {/* Delta Valued Note */}
                    <div className="mt-4 p-3 bg-[#FAF8F3] rounded-xl border border-[#E5E0D0] text-xs text-slate-700 leading-relaxed">
                      <strong>Delta Valued:</strong> 40% of the area is payable.
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('report')}
                    className="w-full mt-6 py-2.5 bg-[#142B23] hover:bg-[#0c1c16] text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    {t.asBuilt.generateReportBtn} →
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
                    <span>{t.pills.currentVariation}</span>
                    <span className="font-mono bg-emerald-100 px-2 py-0.5 rounded">V-2026-017</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600">{t.impactTrace.sub}</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t.report.title}</h2>
                </div>

                <button
                  onClick={triggerExport}
                  className="bg-[#1A3D32] hover:bg-[#132E26] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shadow-lg cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{t.report.downloadBtn}</span>
                </button>
              </div>

              {/* Printable Document Sheet */}
              <div className="bg-white rounded-3xl border border-[#DFDAC8] p-10 shadow-xl space-y-8 relative overflow-hidden">
                <div className="absolute top-10 right-10 rotate-12 border-4 border-emerald-800 text-emerald-800 px-4 py-2 rounded-xl text-center font-extrabold tracking-widest uppercase opacity-80 pointer-events-none">
                  <div className="text-lg">{t.report.evidenceStampTop}</div>
                  <div className="text-sm">{t.report.evidenceStampBottom}</div>
                </div>

                <div className="border-b border-slate-200 pb-6">
                  <div className="text-xs uppercase tracking-wider text-slate-400 font-bold">{t.brandSub}</div>
                  <h3 className="text-xl font-black text-slate-900 mt-1">
                    {t.report.reportSub}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">{t.report.projectInfo}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Executive Summary Column */}
                  <div className="space-y-4">
                    <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400">{t.report.execSummaryTitle}</h4>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-600">{t.report.fairValueRow}</span>
                        <span className="font-mono font-bold text-slate-900">$18,750</span>
                      </div>

                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-600">{t.report.inflatedRow}</span>
                        <span className="font-mono font-bold text-red-600">$5,920 (26.3%)</span>
                      </div>

                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-600">{t.report.payableRow}</span>
                        <span className="font-mono font-bold text-emerald-800">$7,500</span>
                      </div>

                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-600">{t.report.completenessRow}</span>
                        <span className="font-mono font-bold text-slate-900">60%</span>
                      </div>

                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-600">{t.report.certImpactRow}</span>
                        <span className="font-semibold text-slate-800 text-xs text-right whitespace-pre-line">
                          {t.report.certImpactValue}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* References (Samples) Column */}
                  <div className="space-y-4">
                    <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400">{t.report.auditTrailTitle}</h4>

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

                {/* Conclusion Paragraph */}
                <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-200">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-emerald-900 mb-1">{t.report.conclusionTitle}</h4>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {t.report.conclusionText}
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

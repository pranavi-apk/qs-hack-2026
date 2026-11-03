export type Language = 'en' | 'zh-HK' | 'zh-CN';

export interface Translations {
  brandSub: string;
  nav: {
    dashboard: string;
    impactTrace: string;
    fairValue: string;
    claimCheck: string;
    asBuilt: string;
    report: string;
  };
  pills: {
    cap652Status: string;
    cap652Active: string;
    cap652Desc: string;
    userRole: string;
    userTeam: string;
    activeProject: string;
    aiConnected: string;
    currentVariation: string;
  };
  dashboard: {
    welcomeTitle: string;
    welcomeSub: string;
    inspectBtn: string;
    kpiActive: string;
    kpiActiveTrend: string;
    kpiClaims: string;
    kpiClaimsTrend: string;
    kpiChecked: string;
    kpiCheckedSub: string;
    kpiFlagged: string;
    kpiFlaggedSub: string;
    recentTitle: string;
    recentSub: string;
    colId: string;
    colTitle: string;
    colStatus: string;
    colImpact: string;
    colUpdated: string;
    colAction: string;
    impactSummaryTitle: string;
    impactSummarySub: string;
    totalAffected: string;
    directItems: string;
    indirect1hop: string;
    indirect2hop: string;
    dataGovHkTitle: string;
    dataGovHkDesc: string;
  };
  impactTrace: {
    title: string;
    sub: string;
    proceedBtn: string;
    tabs: {
      overview: string;
      impactTrace: string;
      fairValue: string;
      claims: string;
      asBuilt: string;
      report: string;
    };
    centerNode: string;
    clusters: {
      finishes: string;
      reinforcement: string;
      mep: string;
      doorsSetup: string;
      doorsFrames: string;
      formwork: string;
      columns: string;
    };
    legendDirect: string;
    legend1hop: string;
    legend2hop: string;
    sidebarTitle: string;
    sidebarSub: string;
    netImpact: string;
    hksmm4Basis: string;
    aiCopilotTitle: string;
    aiPlaceholder: string;
    aiButton: string;
    aiAnalyzing: string;
    aiAdjudicationTitle: string;
  };
  fairValue: {
    title: string;
    sub: string;
    checkClaimBtn: string;
    tableTitle: string;
    colItem: string;
    colQty: string;
    colRate: string;
    colAmount: string;
    subtotal: string;
    adjustments: string;
    totalFairValue: string;
    rateBasisTitle: string;
    rateBasisDesc: string;
    viewAnalysis: string;
    varianceTitle: string;
    varianceDesc: string;
    rateBreakdownTitle: string;
  };
  claimCheck: {
    title: string;
    sub: string;
    inspectCvBtn: string;
    colItem: string;
    colClaim: string;
    colCascade: string;
    colVariance: string;
    colVariancePct: string;
    colFlag: string;
    colReason: string;
    total: string;
    gccRule: string;
    overpriced: string;
    excessQty: string;
    inflatedDetected: string;
    cap652Notice: string;
  };
  asBuilt: {
    title: string;
    sub: string;
    generateReportBtn: string;
    photoFeed: string;
    capturedTime: string;
    maskTag: string;
    classifierTitle: string;
    classifierSub: string;
    preComplete: string;
    completedSub: string;
    inProgressSub: string;
    notStartedSub: string;
    confidence: string;
    deltaNote: string;
  };
  report: {
    title: string;
    downloadBtn: string;
    evidenceStampTop: string;
    evidenceStampBottom: string;
    reportSub: string;
    projectInfo: string;
    execSummaryTitle: string;
    fairValueRow: string;
    inflatedRow: string;
    payableRow: string;
    completenessRow: string;
    certImpactRow: string;
    certImpactValue: string;
    auditTrailTitle: string;
    conclusionTitle: string;
    conclusionText: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    brandSub: "Smart QS Field Decisions",
    nav: {
      dashboard: "1. Dashboard",
      impactTrace: "2. Impact Trace",
      fairValue: "3. Fair Value",
      claimCheck: "4. Claim Check",
      asBuilt: "5. As-Built Verify",
      report: "6. Cited Report",
    },
    pills: {
      cap652Status: "Cap. 652 Status",
      cap652Active: "Active",
      cap652Desc: "SOPL 30-day adjudication timer in sync.",
      userRole: "QS Senior Analyst",
      userTeam: "Team Quantum (CityU / HK)",
      activeProject: "Active Project",
      aiConnected: "Alibaba Qwen3.6-plus Connected",
      currentVariation: "Current Variation:",
    },
    dashboard: {
      welcomeTitle: "Good morning, QS Team",
      welcomeSub: "Here is your real-time variation impact and claims audit overview.",
      inspectBtn: "Inspect Variation V-2026-017",
      kpiActive: "Active Variations",
      kpiActiveTrend: "+2 this week",
      kpiClaims: "Total Claim Amount",
      kpiClaimsTrend: "-$8,410 vs last week",
      kpiChecked: "Items Checked",
      kpiCheckedSub: "76% of total package",
      kpiFlagged: "Flagged Items",
      kpiFlaggedSub: "Ready for adjudication",
      recentTitle: "Recent Variations",
      recentSub: "Hong Kong Standard Form GCC",
      colId: "ID",
      colTitle: "Title",
      colStatus: "Status",
      colImpact: "Impact",
      colUpdated: "Updated",
      colAction: "Action",
      impactSummaryTitle: "Impact Summary",
      impactSummarySub: "Propagation through GraphRAG contract ontology",
      totalAffected: "Total Affected\nItems",
      directItems: "Direct Items (1-hop)",
      indirect1hop: "Indirect (2-hop)",
      indirect2hop: "Indirect (3-hop)",
      dataGovHkTitle: "DATA.GOV.HK Open Data Benchmarks Linked",
      dataGovHkDesc: "ArchSD Building Works Tender Price Index (BWTPI)",
    },
    impactTrace: {
      title: "Contract Impact Trace (Knowledge Graph)",
      sub: "Lobby size increase 20%",
      proceedBtn: "Proceed to Fair Value",
      tabs: {
        overview: "Overview",
        impactTrace: "Impact Trace",
        fairValue: "Fair Value",
        claims: "Claims",
        asBuilt: "As-Built Verify",
        report: "Cited Report",
      },
      centerNode: "Lobby size\nincrease 20%",
      clusters: {
        finishes: "Finishes",
        reinforcement: "Reinforcement",
        mep: "MEP",
        doorsSetup: "Doors / Setup",
        doorsFrames: "Doors / Frames",
        formwork: "Formwork",
        columns: "Columns",
      },
      legendDirect: "Direct",
      legend1hop: "Indirect (1-hop)",
      legend2hop: "Indirect (2-hop)",
      sidebarTitle: "Impact Overview",
      sidebarSub: "Trace propagation across BQ, Drawings & GCC",
      netImpact: "Estimated Net Impact",
      hksmm4Basis: "Benchmarked strictly against HKSMM4 (2024)",
      aiCopilotTitle: "Ask Cascade AI (Qwen3.6-plus Powered QS Reasoning Engine)",
      aiPlaceholder: "e.g. How does HKSMM4 Section 6.2.3 govern tile adhesive measurement when lobby floor area increases?",
      aiButton: "Analyze Contract Impact",
      aiAnalyzing: "Analyzing...",
      aiAdjudicationTitle: "Deterministic AI Adjudication:",
    },
    fairValue: {
      title: "Fair Value Calculation (HKSMM4)",
      sub: "Lobby size increase 20%",
      checkClaimBtn: "Check Contractor Claim",
      tableTitle: "Itemized Measurement & Valuation",
      colItem: "Item Description",
      colQty: "Qty (A)",
      colRate: "Rate (HK$)",
      colAmount: "Amount (HK$)",
      subtotal: "Sub-total",
      adjustments: "Adjustments (Prelim, OH&P 13%)",
      totalFairValue: "Fair Value (Rounded)",
      rateBasisTitle: "Rate Basis",
      rateBasisDesc: "HKSMM4: 2024 Edition",
      viewAnalysis: "View rate analysis",
      varianceTitle: "Variance Summary",
      varianceDesc: "Contractor claimed $22,510 vs Cascade benchmark of $16,590.",
      rateBreakdownTitle: "Rate Breakdown",
    },
    claimCheck: {
      title: "Claim Check (Line-by-Line Adjudication)",
      sub: "Contractor Claim vs Cascade Benchmark",
      inspectCvBtn: "Inspect Site Photos (CV)",
      colItem: "Item",
      colClaim: "Claim Amount (HK$)",
      colCascade: "Cascade Fair Value (HK$)",
      colVariance: "Variance (HK$)",
      colVariancePct: "Variance (%)",
      colFlag: "Audit Flag",
      colReason: "Audit Reason",
      total: "Total",
      gccRule: "Adjudicated under GCC Clause 62",
      overpriced: "Overpriced",
      excessQty: "Excess Qty",
      inflatedDetected: "Inflated Amount Detected",
      cap652Notice: "Recommendation: Issue deduction notice within the Cap. 652 30-day response timeframe.",
    },
    asBuilt: {
      title: "As-Built Verification (CV Module)",
      sub: "Lobby Floor Area Completeness Inspection",
      generateReportBtn: "Generate Cited Report",
      photoFeed: "Site Photo Inspection Feed",
      capturedTime: "Captured: 28 Jul 2026 10:15 AM",
      maskTag: "Segment: Lobby Screed & Floor Tiling (60% Verified)",
      classifierTitle: "Completeness Classifier",
      classifierSub: "YOLOv8 + SAM boundary segmentation",
      preComplete: "Pre-Complete",
      completedSub: "Completed (Sub-base & Screed)",
      inProgressSub: "In Progress (Adhesive laying)",
      notStartedSub: "Not Started (Skirting & Grouting)",
      confidence: "AI Model Confidence",
      deltaNote: "Delta Valued: 40% of the area is payable only upon final edge skirting installation.",
    },
    report: {
      title: "Cited Valuation Report",
      downloadBtn: "Download PDF Report",
      evidenceStampTop: "EVIDENCE",
      evidenceStampBottom: "BACKED",
      reportSub: "Report: V-2026-017 — Lobby Size Increase 20%",
      projectInfo: "Project: HA Public Housing Development • Prepared by Team Quantum",
      execSummaryTitle: "Executive Summary",
      fairValueRow: "Total Fair Value (Rounded)",
      inflatedRow: "Inflated Amount Detected",
      payableRow: "Payable Delta (This Claim)",
      completenessRow: "Completeness (CV)",
      certImpactRow: "Certification Impact",
      certImpactValue: "Payable within Cap. 652\n30-day window",
      auditTrailTitle: "References (Audit Trail)",
      conclusionTitle: "Conclusion",
      conclusionText: "Based on the analysis and evidence, $7,500 is payable for Variation V-2026-017. All values are benchmarked to HKSMM4 and verified with site evidence. A deduction of $5,920 has been recommended against the contractor's overstated unit rates and unverified quantities.",
    },
  },

  // 粵語 / 繁體中文 (香港工程慣用標準規範)
  'zh-HK': {
    brandSub: "工料測量智能決策系統",
    nav: {
      dashboard: "1. 儀表板總覽",
      impactTrace: "2. 合約連鎖影響分析",
      fairValue: "3. 合理估值 (HKSMM4)",
      claimCheck: "4. 承建商申索核實",
      asBuilt: "5. 現場進度視覺校驗",
      report: "6. 法定引用核准報告",
    },
    pills: {
      cap652Status: "第652章 付款保障條例",
      cap652Active: "執行中",
      cap652Desc: "30天付款爭議法定審裁倒計時運作中。",
      userRole: "高級工料測量師 (QS)",
      userTeam: "量子團隊 (香港城市大學)",
      activeProject: "當前工程項目",
      aiConnected: "阿里雲 Qwen3.6-plus 深度集成",
      currentVariation: "工程變更編號:",
    },
    dashboard: {
      welcomeTitle: "早晨，工料測量組 (QS Team)",
      welcomeSub: "以下是您項目的實時工程變更 (Variation) 影響及申索審核總覽。",
      inspectBtn: "即時審核變更 V-2026-017",
      kpiActive: "進行中工程變更",
      kpiActiveTrend: "本週新增 +2 項",
      kpiClaims: "累計申索申報總額",
      kpiClaimsTrend: "較上週修正 -$8,410",
      kpiChecked: "已審定工程清單項",
      kpiCheckedSub: "佔總工料清單 76%",
      kpiFlagged: "預警異常清單項",
      kpiFlaggedSub: "待審裁扣減",
      recentTitle: "最新工程變更記錄",
      recentSub: "依據香港政府土木及建築標準合約 (GCC)",
      colId: "變更編號",
      colTitle: "變更內容",
      colStatus: "狀態",
      colImpact: "影響等級",
      colUpdated: "更新日期",
      colAction: "操作",
      impactSummaryTitle: "關聯影響總攬",
      impactSummarySub: "基於 GraphRAG 合約本體知識圖譜推導",
      totalAffected: "受影響合約項\n總計",
      directItems: "直接關聯項 (1-hop)",
      indirect1hop: "二級連帶項 (2-hop)",
      indirect2hop: "三級隱性項 (3-hop)",
      dataGovHkTitle: "DATA.GOV.HK 政府開放數據實時基準對接",
      dataGovHkDesc: "建築署建築工程招標價格指數 (BWTPI)",
    },
    impactTrace: {
      title: "合約影響關聯圖譜 (Knowledge Graph)",
      sub: "地下大堂面積擴展 20%",
      proceedBtn: "進入合理估值階段",
      tabs: {
        overview: "總覽",
        impactTrace: "影響圖譜",
        fairValue: "合理估值",
        claims: "承建商申索",
        asBuilt: "進度核實",
        report: "引用報告",
      },
      centerNode: "大堂面積\n擴展 20%",
      clusters: {
        finishes: "飾面工程",
        reinforcement: "鋼筋工程",
        mep: "機電管道 (MEP)",
        doorsSetup: "門戶結構",
        doorsFrames: "門框及五金",
        formwork: "模板工程",
        columns: "混凝土立柱",
      },
      legendDirect: "直接影響",
      legend1hop: "一級隱性連鎖",
      legend2hop: "二級隱性連鎖",
      sidebarTitle: "連鎖影響總覽",
      sidebarSub: "跨工料清單 (BQ)、施工圖及合約條款自動傳播",
      netImpact: "預估淨影響金額",
      hksmm4Basis: "嚴格參照 HKSMM4 (2024年版) 工料測量規則",
      aiCopilotTitle: "諮詢 Cascade 測量 AI (Qwen3.6-plus 專用推導引擎)",
      aiPlaceholder: "例如：根據 HKSMM4 第 6.2.3 條，當大堂面積擴大時，瓷磚膠泥與接縫填料的測量規則應如何計量？",
      aiButton: "合約影響深度推演",
      aiAnalyzing: "測量推演中...",
      aiAdjudicationTitle: "確定性測量規則推演結果：",
    },
    fairValue: {
      title: "合理估值計算 (遵循 HKSMM4 標準)",
      sub: "地下大堂面積擴展 20%",
      checkClaimBtn: "對比承建商申索",
      tableTitle: "清單逐項計量與工料估值表",
      colItem: "工程分項描述",
      colQty: "測量工程量 (A)",
      colRate: "政府基準單價 (HK$)",
      colAmount: "合理合約金額 (HK$)",
      subtotal: "分項小計",
      adjustments: "合約初期費及管理利潤 (Prelim, OH&P 13%)",
      totalFairValue: "合理核准總值 (取整)",
      rateBasisTitle: "單價法定基準",
      rateBasisDesc: "HKSMM4 2024 年版",
      viewAnalysis: "查看詳細工料分析",
      varianceTitle: "申索偏差警報",
      varianceDesc: "承建商申報 HK$22,510，Cascade 審定基準為 HK$16,590。",
      rateBreakdownTitle: "造價成本要素分解",
    },
    claimCheck: {
      title: "申索核實 (逐項合約審裁)",
      sub: "承建商報價 vs Cascade 基準",
      inspectCvBtn: "查驗工地影像 (電腦視覺)",
      colItem: "工料項目",
      colClaim: "承建商報價 (HK$)",
      colCascade: "Cascade 審定值 (HK$)",
      colVariance: "偏差金額 (HK$)",
      colVariancePct: "溢價幅度 (%)",
      colFlag: "審核標籤",
      colReason: "審裁理由與法據",
      total: "合計",
      gccRule: "依據香港特區標準合約 GCC 第 62 條執行審裁",
      overpriced: "單價虛高",
      excessQty: "超額申報",
      inflatedDetected: "已識別虛高浮誇申索金額",
      cap652Notice: "處置建議：須在香港法例第 652 章規定的 30 天回應期內發出正式扣減通知書。",
    },
    asBuilt: {
      title: "現場實體完工核實 (電腦視覺模組)",
      sub: "大堂地面鋪裝完工度實地影像解析",
      generateReportBtn: "生成法定審裁報告",
      photoFeed: "現場攝像頭/監理影像實時數據流",
      capturedTime: "拍攝時間: 2026年7月28日 10:15",
      maskTag: "識別區域：大堂水泥砂漿基底及瓷磚鋪設 (已核實 60%)",
      classifierTitle: "完工進度智能分類器",
      classifierSub: "YOLOv8 + SAM 邊界高精度語義分割",
      preComplete: "前期已完工",
      completedSub: "已驗收完成 (地面基底及找平層)",
      inProgressSub: "施工中 (瓷磚膠泥刮抹鋪設)",
      notStartedSub: "未開工 (踢腳線安裝及填縫保護)",
      confidence: "AI 模型置信度",
      deltaNote: "節點估值提示：剩餘 40% 款項須待邊緣踢腳線安裝及驗收合格後方可核准支付。",
    },
    report: {
      title: "具法據引用的工料估值報告",
      downloadBtn: "導出官方 PDF 審裁報告",
      evidenceStampTop: "EVIDENCE",
      evidenceStampBottom: "BACKED",
      reportSub: "報告編號: V-2026-017 — 地下大堂擴展 20% 工程變更審定",
      projectInfo: "工程項目：香港房屋委員會公共房屋發展計劃 • 編制：量子團隊 (Team Quantum)",
      execSummaryTitle: "行政審核摘要",
      fairValueRow: "合理估值總額 (取整)",
      inflatedRow: "已識別承建商虛高款項",
      payableRow: "本期建議核撥款項 (當前節點)",
      completenessRow: "實地進度完工度 (CV核實)",
      certImpactRow: "法定期限合規",
      certImpactValue: "符合第652章條例\n30天內核撥窗口",
      auditTrailTitle: "審計追溯與條款引用 (Audit Trail)",
      conclusionTitle: "審裁結論",
      conclusionText: "基於神經符號合約圖譜與現場實景電腦視覺證據，工程變更 V-2026-017 當前階段建議核准支付金額為 HK$7,500。所有分項單價均嚴格對標 HKSMM4 標準。針對承建商虛報的單價與超額工程量，建議正式駁回並扣減 HK$5,920。",
    },
  },

  // 普通話 / 簡體中文 (工程標準造價規範)
  'zh-CN': {
    brandSub: "工程造价智能决策系统",
    nav: {
      dashboard: "1. 仪表板总览",
      impactTrace: "2. 合同连锁影响分析",
      fairValue: "3. 合理估值 (HKSMM4)",
      claimCheck: "4. 施工方索赔核查",
      asBuilt: "5. 现场进度视觉校验",
      report: "6. 法定引用核准报告",
    },
    pills: {
      cap652Status: "香港法例第652章 付款保障",
      cap652Active: "执行中",
      cap652Desc: "30天付款争议法定裁决倒计时同步中。",
      userRole: "高级工程造价师 (QS)",
      userTeam: "量子团队 (香港城市大学)",
      activeProject: "当前工程项目",
      aiConnected: "阿里云 Qwen3.6-plus 深度集成",
      currentVariation: "工程变更编号:",
    },
    dashboard: {
      welcomeTitle: "早上好，造价工程师团队",
      welcomeSub: "以下是您工程项目的实时工程变更 (Variation) 连锁影响及索赔审核总览。",
      inspectBtn: "即刻审核变更 V-2026-017",
      kpiActive: "进行中工程变更",
      kpiActiveTrend: "本周新增 +2 项",
      kpiClaims: "累计索赔申报总额",
      kpiClaimsTrend: "较上周核减 -$8,410",
      kpiChecked: "已审核清单细项",
      kpiCheckedSub: "占工程量总清单 76%",
      kpiFlagged: "预警异常细项",
      kpiFlaggedSub: "待裁决核减",
      recentTitle: "最新工程变更记录",
      recentSub: "依据香港政府土木及建筑标准合同 (GCC)",
      colId: "变更编号",
      colTitle: "变更内容",
      colStatus: "状态",
      colImpact: "影响等级",
      colUpdated: "更新日期",
      colAction: "操作",
      impactSummaryTitle: "连锁影响汇总",
      impactSummarySub: "基于 GraphRAG 合同本体知识图谱推导",
      totalAffected: "受影响合同项\n总计",
      directItems: "直接关联项 (1-hop)",
      indirect1hop: "二级连带项 (2-hop)",
      indirect2hop: "三级隐性项 (3-hop)",
      dataGovHkTitle: "DATA.GOV.HK 政府开放数据实时基准对接",
      dataGovHkDesc: "建筑署工程招标价格指数 (BWTPI)",
    },
    impactTrace: {
      title: "合同影响关联图谱 (Knowledge Graph)",
      sub: "首层门厅面积扩建 20%",
      proceedBtn: "进入合理估值阶段",
      tabs: {
        overview: "总览",
        impactTrace: "影响图谱",
        fairValue: "合理估值",
        claims: "施工方索赔",
        asBuilt: "进度核实",
        report: "引用报告",
      },
      centerNode: "门厅面积\n扩建 20%",
      clusters: {
        finishes: "装饰面层",
        reinforcement: "钢筋工程",
        mep: "机电管线 (MEP)",
        doorsSetup: "门体结构",
        doorsFrames: "门框五金",
        formwork: "模板工程",
        columns: "混凝土立柱",
      },
      legendDirect: "直接影响",
      legend1hop: "一级隐性连锁",
      legend2hop: "二级隐性连锁",
      sidebarTitle: "连锁影响总览",
      sidebarSub: "跨工程量清单 (BQ)、施工图及合同条款自动推导",
      netImpact: "预估净影响金额",
      hksmm4Basis: "严格参照 HKSMM4 (2024年版) 测量计价规范",
      aiCopilotTitle: "咨询 Cascade 测量 AI (Qwen3.6-plus 专用推导引擎)",
      aiPlaceholder: "例如：根据 HKSMM4 第 6.2.3 条，当首层门厅面积增大时，瓷砖粘结剂与缝隙填料的计量规则应如何计算？",
      aiButton: "合同影响深度推演",
      aiAnalyzing: "测量推演中...",
      aiAdjudicationTitle: "确定性造价规则推演结果：",
    },
    fairValue: {
      title: "合理估值计算 (遵循 HKSMM4 标准)",
      sub: "首层门厅面积扩建 20%",
      checkClaimBtn: "对比施工方索赔",
      tableTitle: "清单细项计量与工料估值表",
      colItem: "分部分项工程描述",
      colQty: "计量工程量 (A)",
      colRate: "政府基准综合单价 (HK$)",
      colAmount: "合理合同金额 (HK$)",
      subtotal: "分项小计",
      adjustments: "开办费及承包商管理利润 (Prelim, OH&P 13%)",
      totalFairValue: "合理核准总值 (取整)",
      rateBasisTitle: "综合单价依据",
      rateBasisDesc: "HKSMM4 2024 年版",
      viewAnalysis: "查看详细工料工日分析",
      varianceTitle: "索赔偏差警报",
      varianceDesc: "施工方申报 HK$22,510，Cascade 审定基准为 HK$16,590。",
      rateBreakdownTitle: "造价成本构成剖析",
    },
    claimCheck: {
      title: "索赔核查 (逐项合同裁决)",
      sub: "施工方报价 vs Cascade 基准",
      inspectCvBtn: "查验工地现场图像 (计算机视觉)",
      colItem: "工程细项",
      colClaim: "施工方申报金额 (HK$)",
      colCascade: "Cascade 审定值 (HK$)",
      colVariance: "偏差金额 (HK$)",
      colVariancePct: "溢价幅度 (%)",
      colFlag: "审核标签",
      colReason: "裁决理由与法规依据",
      total: "合计",
      gccRule: "依据香港特区标准工程合同 GCC 第 62 条裁决",
      overpriced: "单价虚高",
      excessQty: "工程量多报",
      inflatedDetected: "已识别虚高浮夸索赔金额",
      cap652Notice: "处置建议：须在香港法例第 652 章规定的 30 天答复期内签发正式扣减通知书。",
    },
    asBuilt: {
      title: "现场实体完工核查 (计算机视觉模块)",
      sub: "门厅地面铺贴完工度实景图像解析",
      generateReportBtn: "生成法定裁决报告",
      photoFeed: "现场摄像头/监理图像实时数据流",
      capturedTime: "拍摄时间: 2026年7月28日 10:15",
      maskTag: "识别区域：门厅水泥砂浆基层及地面铺贴 (已核查 60%)",
      classifierTitle: "完工进度智能分类器",
      classifierSub: "YOLOv8 + SAM 边界高精度语义分割",
      preComplete: "前期已完工",
      completedSub: "已验收完成 (地面垫层及找平层)",
      inProgressSub: "施工中 (粘结剂涂刷及瓷砖试铺)",
      notStartedSub: "未开工 (踢脚线安装及勾缝防护)",
      confidence: "AI 模型置信度",
      deltaNote: "节点估值提示：剩余 40% 款项须待边缘踢脚线安装及验收合格后方可核准支付。",
    },
    report: {
      title: "具法规引用的工程造价估值报告",
      downloadBtn: "导出官方 PDF 裁决报告",
      evidenceStampTop: "EVIDENCE",
      evidenceStampBottom: "BACKED",
      reportSub: "报告编号: V-2026-017 — 首层门厅扩建 20% 工程变更审定",
      projectInfo: "工程项目：香港房屋委员会公共房屋发展计划 • 编制：量子团队 (Team Quantum)",
      execSummaryTitle: "行政审核摘要",
      fairValueRow: "合理估值总额 (取整)",
      inflatedRow: "已识别施工方虚高款项",
      payableRow: "本期建议核拨金额 (当前里程碑)",
      completenessRow: "实地进度完工度 (CV核实)",
      certImpactRow: "法定期限合规",
      certImpactValue: "符合第652章条例\n30天内核准窗口",
      auditTrailTitle: "审计追溯与条款引用 (Audit Trail)",
      conclusionTitle: "裁决结论",
      conclusionText: "基于神经符号合同知识图谱与现场实景计算机视觉证据，工程变更 V-2026-017 当前阶段建议核准支付金额为 HK$7,500。所有细项单价均严格对标 HKSMM4 标准。针对施工方虚报的综合单价与超额工程量，建议正式驳回并核减 HK$5,920。",
    },
  },
};


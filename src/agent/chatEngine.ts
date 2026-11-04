export type ViewId =
  | 'overview'
  | 'documents'
  | 'impact'
  | 'value'
  | 'claim'
  | 'certify'
  | 'report';

export type ChatMsg = {
  id: string;
  role: 'user' | 'agent';
  text: string;
  viewHint?: ViewId;
};

export function replyToPrompt(
  prompt: string,
  ctx: {
    fairValue: number;
    inflation: number;
    payable: number;
    completeness: number;
    docCount: number;
  }
): { text: string; view: ViewId } {
  const p = prompt.toLowerCase();

  if (/document|pack|upload|bq|drawing/.test(p)) {
    return {
      view: 'documents',
      text: `I have ${ctx.docCount} files in the variation pack (instruction, BQ, Drawing A-201, claim, spec, site checklist).\n\nQuantities come from the drawing takeoff — not from photos. Open Documents to review the checklist, or ask me to run fair value.`,
    };
  }
  if (/impact|graph|knock|ripple|263/.test(p)) {
    return {
      view: 'impact',
      text: `Impact Trace shows 263 affected contract items for lobby +20% (48 direct / 215 indirect).\n\nI’ve opened the knowledge graph. Click a cluster for BQ line samples.`,
    };
  }
  if (/fair|hksmm|value|rate|valuat/.test(p)) {
    return {
      view: 'value',
      text: `Fair value under HKSMM4 (2024) §6.2.3 is HK$${ctx.fairValue.toLocaleString('en-HK')} (incl. prelim/OH&P).\n\nTile field is 120 m² from Drawing A-201 (12.0 × 10.0 m). I’ve opened the build-up table.`,
    };
  }
  if (/claim|inflat|deduct|gcc|overprice|variance/.test(p)) {
    return {
      view: 'claim',
      text: `Contractor claimed above Cascade fair rates. Inflation flagged: HK$${ctx.inflation.toLocaleString('en-HK')} (26.3%) under GCC Clause 62.\n\nI’ve opened the line-by-line adjudication so you can see Overpriced / Excess Qty flags.`,
    };
  }
  if (/certif|milestone|payable|complet|as-?built|progress/.test(p)) {
    return {
      view: 'certify',
      text: `Weighted completeness is ${ctx.completeness}%. Cap. 652–aligned payable this period: HK$${ctx.payable.toLocaleString('en-HK')}; balance withheld pending skirting/grout.\n\nMilestone table is open — no photo gallery; evidence is checklist + citations.`,
    };
  }
  if (/report|evidence|export|pdf|cap\.?\s*652|provab|pack/.test(p)) {
    return {
      view: 'report',
      text: `I’ve opened the Claims Evidence Pack: ordered audit thread, change provability score, Cap. 652 payment clock, claim annex, and SHA digest.\n\nUse Download / print to save the payment-response annex.`,
    };
  }
  if (/overview|summar|what|status|hello|hi /.test(p) || p.length < 12) {
    return {
      view: 'overview',
      text: `Here’s V-2026-017 in one glance:\n• Fair value HK$${ctx.fairValue.toLocaleString('en-HK')}\n• Inflation flagged HK$${ctx.inflation.toLocaleString('en-HK')}\n• Payable now HK$${ctx.payable.toLocaleString('en-HK')} (${ctx.completeness}% complete)\n\nAsk me to open Impact, Fair value, Claim check, Certify, or the Evidence pack — or tap a card below.`,
    };
  }
  return {
    view: 'overview',
    text: `I can help with this variation pack: documents, impact graph, HKSMM4 fair value, claim inflation, milestone certification, or the Cap. 652 evidence pack.\n\nTry: “Show fair value” or “Flag inflated claim lines”.`,
  };
}

export const PIPELINE_STEPS = [
  'Reading variation pack',
  'Tracing knock-on BQ impacts',
  'Computing HKSMM4 fair value',
  'Adjudicating contractor claim',
  'Certifying milestones',
  'Assembling evidence pack',
];

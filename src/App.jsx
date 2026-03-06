import { useState, useMemo, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Analytics } from "@vercel/analytics/react";

// ── TRIAL DATA ──────────────────────────────────────────────────────────────
const T = {
  ecog5194:   { label:"ECOG 5194",            url:"https://pubmed.ncbi.nlm.nih.gov/26371148/", ref:"JCO 2015" },
  rtog9804:   { label:"RTOG 98-04",           url:"https://pubmed.ncbi.nlm.nih.gov/34406870/", ref:"JCO 2021" },
  comet:      { label:"COMET",                url:"https://pubmed.ncbi.nlm.nih.gov/38457369/", ref:"JAMA 2024" },
  uknz:       { label:"UK/ANZ DCIS",          url:"https://pubmed.ncbi.nlm.nih.gov/20932501/", ref:"Lancet Oncol 2010" },
  big307:     { label:"BIG 3-07",             url:"https://pubmed.ncbi.nlm.nih.gov/35934006/", ref:"Lancet 2022" },
  nsabpb24:   { label:"NSABP B-24",           url:"https://pubmed.ncbi.nlm.nih.gov/10352697/", ref:"Lancet 1999" },
  nsabpb35:   { label:"NSABP B-35",           url:"https://pubmed.ncbi.nlm.nih.gov/26722753/", ref:"Lancet 2016" },
  calgb9343:  { label:"CALGB 9343",           url:"https://pubmed.ncbi.nlm.nih.gov/23690420/", ref:"JCO 2013" },
  primeii:    { label:"PRIME II",             url:"https://pubmed.ncbi.nlm.nih.gov/36972056/", ref:"NEJM 2023" },
  europa:     { label:"EUROPA",               url:"https://pubmed.ncbi.nlm.nih.gov/39694024/", ref:"Lancet Oncol 2024" },
  lumina:     { label:"LUMINA",               url:"https://pubmed.ncbi.nlm.nih.gov/37523534/", ref:"NEJM 2023" },
  idea:       { label:"IDEA",                 url:"https://pubmed.ncbi.nlm.nih.gov/38241619/", ref:"JCO 2024" },
  canadian:   { label:"Canadian Hypo",        url:"https://pubmed.ncbi.nlm.nih.gov/20530316/", ref:"NEJM 2010" },
  startb:     { label:"UK START B",           url:"https://pubmed.ncbi.nlm.nih.gov/24055473/", ref:"Lancet Oncol 2013" },
  fastfwd:    { label:"FAST Forward",         url:"https://pubmed.ncbi.nlm.nih.gov/32580883/", ref:"Lancet 2020" },
  importlow:  { label:"IMPORT LOW",           url:"https://pubmed.ncbi.nlm.nih.gov/28779920/", ref:"Lancet 2017" },
  rapid:      { label:"RAPID",                url:"https://pubmed.ncbi.nlm.nih.gov/31813636/", ref:"Lancet 2019" },
  b39:        { label:"NSABP B-39",           url:"https://pubmed.ncbi.nlm.nih.gov/31813635/", ref:"Lancet 2019" },
  florence:   { label:"Florence",             url:"https://pubmed.ncbi.nlm.nih.gov/33136432/", ref:"JCO 2020" },
  z0011:      { label:"ACOSOG Z0011",         url:"https://pubmed.ncbi.nlm.nih.gov/21304082/", ref:"JAMA 2011" },
  sound:      { label:"SOUND",                url:"https://pubmed.ncbi.nlm.nih.gov/37582295/", ref:"JAMA Oncol 2023" },
  senomac:    { label:"SENOMAC",              url:"https://pubmed.ncbi.nlm.nih.gov/38861346/", ref:"NEJM 2024" },
  ibcsg:      { label:"IBCSG 23-01",          url:"https://pubmed.ncbi.nlm.nih.gov/29576612/", ref:"Lancet Oncol 2018" },
  z1071:      { label:"ACOSOG Z1071",         url:"https://pubmed.ncbi.nlm.nih.gov/23839752/", ref:"JAMA 2013" },
  sentina:    { label:"SENTINA",              url:"https://pubmed.ncbi.nlm.nih.gov/23541812/", ref:"Lancet Oncol 2013" },
  eortc22922: { label:"EORTC 22922",          url:"https://pubmed.ncbi.nlm.nih.gov/26200978/", ref:"NEJM 2015" },
  ma20:       { label:"NCIC MA-20",           url:"https://pubmed.ncbi.nlm.nih.gov/25693012/", ref:"NEJM 2015" },
  supremo:    { label:"SUPREMO",              url:"https://pubmed.ncbi.nlm.nih.gov/39303692/", ref:"NEJM 2024" },
  b51:        { label:"NSABP B-51",           url:"https://pubmed.ncbi.nlm.nih.gov/38198849/", ref:"NEJM 2024" },
  bc_trial:   { label:"British Columbia",     url:"https://pubmed.ncbi.nlm.nih.gov/9278463/",  ref:"NEJM 1997" },
  danish82b:  { label:"Danish 82b",           url:"https://pubmed.ncbi.nlm.nih.gov/9278462/",  ref:"NEJM 1997" },
  krog:       { label:"KROG 08-06",           url:"https://pubmed.ncbi.nlm.nih.gov/34694357/", ref:"JAMA Oncol 2021" },
  calor:      { label:"CALOR",                url:"https://pubmed.ncbi.nlm.nih.gov/29028185/", ref:"JCO 2018" },
  rtog1014:   { label:"RTOG 1014",            url:"https://pubmed.ncbi.nlm.nih.gov/31603469/", ref:"JAMA Oncol 2020" },
  z11102:     { label:"ACOSOG Z11102",        url:"https://pubmed.ncbi.nlm.nih.gov/37011278/", ref:"JCO 2023" },
};

// ── ABBREVIATIONS ────────────────────────────────────────────────────────────
const ABBREVS = {
  "ABC":"Active Breathing Coordinator - device for deep inspiration breath hold",
  "ALND":"Axillary Lymph Node Dissection - surgical removal of Levels I-III nodes",
  "APBI":"Accelerated Partial Breast Irradiation - radiation to tumor bed only",
  "BCS":"Breast Conserving Surgery (lumpectomy)",
  "BCT":"Breast Conserving Therapy = BCS + radiation",
  "BCFI":"Breast Cancer-Free Interval",
  "BRCA":"BReast CAncer susceptibility gene (BRCA1/2)",
  "CMF":"Cyclophosphamide + Methotrexate + Fluorouracil (historical regimen)",
  "CNI":"Comprehensive Nodal Irradiation",
  "CTV":"Clinical Target Volume",
  "CW":"Chest Wall",
  "DCIS":"Ductal Carcinoma In Situ",
  "ddAC":"Dose-dense Doxorubicin + Cyclophosphamide",
  "DFS":"Disease-Free Survival",
  "DIBH":"Deep Inspiration Breath Hold",
  "DRFI":"Distant Recurrence-Free Interval",
  "EBCTCG":"Early Breast Cancer Trialists' Collaborative Group",
  "ECE":"Extracapsular Extension",
  "EIC":"Extensive Intraductal Component",
  "ER":"Estrogen Receptor",
  "ET":"Endocrine Therapy (tamoxifen or aromatase inhibitor)",
  "FIF":"Field-in-Field - forward-planned IMRT",
  "FNR":"False Negative Rate",
  "FFLR":"Freedom From Local Recurrence",
  "HER2":"Human Epidermal Growth Factor Receptor 2",
  "HP":"Herceptin (trastuzumab) + Pertuzumab",
  "HR+":"Hormone Receptor Positive (ER+ and/or PR+)",
  "IBCRFI":"Invasive Breast Cancer Recurrence-Free Interval",
  "IBTR":"Ipsilateral Breast Tumor Recurrence",
  "IBE":"In-Breast Event",
  "ILRR":"Isolated Locoregional Recurrence",
  "IMN":"Internal Mammary Node",
  "IMRT":"Intensity Modulated Radiation Therapy",
  "IORT":"Intraoperative Radiation Therapy",
  "ITC":"Isolated Tumor Cell (in lymph node)",
  "LAD":"Left Anterior Descending coronary artery",
  "LC":"Local Control",
  "LN":"Lymph Node",
  "LR":"Local Recurrence",
  "LRR":"Locoregional Recurrence",
  "LRRFI":"Locoregional Recurrence-Free Interval",
  "LVI":"Lymphovascular Invasion",
  "NAC":"Neoadjuvant Chemotherapy",
  "NCCN":"National Comprehensive Cancer Network",
  "OAR":"Organ at Risk",
  "OS":"Overall Survival",
  "PBI":"Partial Breast Irradiation",
  "pCR":"Pathologic Complete Response",
  "PMRT":"Post-Mastectomy Radiation Therapy",
  "PR":"Progesterone Receptor",
  "PTV":"Planning Target Volume",
  "RNI":"Regional Nodal Irradiation",
  "RTOG":"Radiation Therapy Oncology Group (now NRG Oncology)",
  "SCV":"Supraclavicular nodal region",
  "SIB":"Simultaneous Integrated Boost",
  "SLN":"Sentinel Lymph Node",
  "SLNB":"Sentinel Lymph Node Biopsy",
  "T-DM1":"Ado-trastuzumab emtansine (Kadcyla)",
  "TC":"Docetaxel + Cyclophosphamide",
  "TCHP":"Docetaxel + Carboplatin + Trastuzumab + Pertuzumab",
  "TNBC":"Triple-Negative Breast Cancer (ER-, PR-, HER2-)",
  "V16":"Volume of lung receiving >=16 Gy (constraint: <15%)",
  "VMAT":"Volumetric Modulated Arc Therapy",
  "WBI":"Whole Breast Irradiation",
  "ypN0":"Pathologically node-negative after neoadjuvant therapy",
};

// ── NAVIGATION ───────────────────────────────────────────────────────────────
const NAV = [
  { id:"home",        label:"Home",                   icon:"Home", subs:[] },
  { id:"technical",   label:"Technical Planning",     icon:"Cog",  subs:[
    { id:"field-design", label:"Field Design" },
    { id:"plan-review",  label:"Plan Review & OAR" },
    { id:"bolus",        label:"Bolus" },
    { id:"imrt",         label:"IMRT / VMAT" },
    { id:"prone",        label:"Prone & DIBH" },
  ]},
  { id:"imaging",     label:"Breast Imaging",         icon:"Eye",  subs:[] },
  { id:"dcis",        label:"DCIS",                   icon:"Dot",  subs:[
    { id:"dcis-overview",  label:"Overview & Subtypes" },
    { id:"dcis-trials",    label:"Key RCTs" },
    { id:"dcis-boost",     label:"Boost in DCIS" },
    { id:"dcis-systemic",  label:"Systemic Therapy" },
  ]},
  { id:"omission",    label:"RT Omission",            icon:"Circle",subs:[
    { id:"omit-overview",  label:"Overview & NCCN" },
    { id:"omit-trials",    label:"Omission Trials" },
    { id:"omit-genomic",   label:"LUMINA / IDEA" },
  ]},
  { id:"fx",          label:"Fractionation",          icon:"Clock", subs:[
    { id:"fx-hypo",        label:"Standard vs Hypo" },
    { id:"fx-ultra",       label:"Ultra-Hypo (5 fx)" },
    { id:"fx-import",      label:"IMPORT LOW" },
  ]},
  { id:"apbi",        label:"APBI",                   icon:"Target",subs:[
    { id:"apbi-overview",  label:"Techniques & Eligibility" },
    { id:"apbi-trials",    label:"APBI Trials" },
  ]},
  { id:"boost",       label:"Boost Radiation",        icon:"Zap",  subs:[] },
  { id:"multicentric",label:"Multicentric BCS",       icon:"Plus", subs:[] },
  { id:"axilla",      label:"Axillary Management",    icon:"Heart",subs:[
    { id:"axilla-anatomy", label:"Anatomy & Node Risk" },
    { id:"z0011",          label:"ACOSOG Z0011" },
    { id:"sound-senomac",  label:"SOUND & SENOMAC" },
    { id:"ibcsg",          label:"Micrometastases" },
    { id:"slnb-nac",       label:"SLNB After NAC" },
  ]},
  { id:"rni",         label:"Regional Nodal RT",      icon:"Grid", subs:[
    { id:"rni-trials",     label:"RNI Trials" },
    { id:"contouring",     label:"Contouring" },
    { id:"technique",      label:"Mono vs Dual Iso" },
  ]},
  { id:"pmrt",        label:"Post-Mastectomy RT",     icon:"Shield",subs:[
    { id:"pmrt-indications",label:"Indications" },
    { id:"pmrt-trials",    label:"Landmark Trials" },
    { id:"pmrt-supremo",   label:"SUPREMO" },
  ]},
  { id:"imn",         label:"IMN Radiation",          icon:"Star", subs:[
    { id:"imn-anatomy",    label:"Anatomy & Risk" },
    { id:"imn-trials",     label:"IMN Trials" },
  ]},
  { id:"nac",         label:"Radiation After NAC",    icon:"Pill", subs:[
    { id:"nac-indications",label:"PMRT Indications" },
    { id:"b51",            label:"NSABP B-51" },
  ]},
  { id:"lrr",         label:"LRR Management",         icon:"Undo", subs:[] },
  { id:"systemic",    label:"Systemic Therapy",       icon:"Drop", subs:[] },
  { id:"abbrevs",     label:"Abbreviations",          icon:"Book", subs:[] },
];

// ── REUSABLE COMPONENTS ──────────────────────────────────────────────────────
function TrialCard({ id, title, children, variant }) {
  const [open, setOpen] = useState(true);
  const trial = T[id] || {};
  const display = title || trial.label || id;
  const colors = {
    blue:   { bg:"#eff6ff", bd:"#93c5fd", tx:"#1e40af", btn:"#1e40af" },
    green:  { bg:"#f0fdf4", bd:"#86efac", tx:"#166534", btn:"#166534" },
    orange: { bg:"#fff7ed", bd:"#fbbf24", tx:"#92400e", btn:"#b45309" },
    red:    { bg:"#fff1f2", bd:"#fecdd3", tx:"#9f1239", btn:"#9f1239" },
  };
  const c = colors[variant || "blue"];
  return (
    <div style={{ border:"1px solid "+c.bd, borderRadius:10, marginBottom:18, overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
      <div style={{ background:c.bg, padding:"11px 15px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, cursor:"pointer" }} onClick={function(){ setOpen(!open); }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:10, color:c.tx }}>{open ? "v" : ">"}</span>
          <div>
            <div style={{ fontWeight:700, fontSize:13, color:"#0f172a" }}>{display}</div>
            {trial.ref && <div style={{ fontSize:11, color:"#64748b", marginTop:1 }}>{trial.ref}</div>}
          </div>
        </div>
        {trial.url && (
          <a href={trial.url} target="_blank" rel="noopener noreferrer"
            onClick={function(e){ e.stopPropagation(); }}
            style={{ background:c.btn, color:"white", padding:"4px 11px", borderRadius:20, fontSize:11, fontWeight:600, textDecoration:"none", flexShrink:0 }}>
            PubMed &rarr;
          </a>
        )}
      </div>
      {open && <div style={{ padding:"14px 16px" }}>{children}</div>}
    </div>
  );
}

function Tbl({ heads, rows, hi }) {
  return (
    <div style={{ overflowX:"auto", margin:"8px 0 12px" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
        <thead>
          <tr>{heads.map(function(h, i){ return (
            <th key={i} style={{ background:"#f1f5f9", color:"#475569", padding:"7px 12px", textAlign:"left", fontWeight:600, fontSize:11, textTransform:"uppercase", letterSpacing:"0.04em", border:"1px solid #e2e8f0" }}>{h}</th>
          ); })}</tr>
        </thead>
        <tbody>
          {rows.map(function(row, i){ return (
            <tr key={i} style={{ background: (hi && hi.includes(i)) ? "#f0fdf4" : i%2===0 ? "white" : "#f8fafc" }}>
              {row.map(function(cell, j){ return (
                <td key={j} style={{ padding:"7px 12px", border:"1px solid #e2e8f0", color:(hi && hi.includes(i)) ? "#166534" : "#374151", fontWeight:(hi && hi.includes(i)) ? 600 : 400, verticalAlign:"top", lineHeight:1.5 }}>{cell}</td>
              ); })}
            </tr>
          ); })}
        </tbody>
      </table>
    </div>
  );
}

function KP({ children, type }) {
  const s = {
    key:     { bg:"#fefce8", bd:"#f59e0b", tx:"#78350f", ic:"*" },
    warning: { bg:"#fff7ed", bd:"#f97316", tx:"#7c2d12", ic:"!" },
    nccn:    { bg:"#f0fdf4", bd:"#22c55e", tx:"#14532d", ic:"N" },
    info:    { bg:"#eff6ff", bd:"#60a5fa", tx:"#1e3a8a", ic:"i" },
  }[type || "key"];
  return (
    <div style={{ display:"flex", gap:10, padding:"10px 14px", borderRadius:8, background:s.bg, borderLeft:"3px solid "+s.bd, margin:"10px 0" }}>
      <span style={{ color:s.bd, fontWeight:700, fontSize:12, flexShrink:0 }}>{s.ic}</span>
      <span style={{ fontSize:13, color:s.tx, lineHeight:1.6 }}>{children}</span>
    </div>
  );
}

function Box({ children, type }) {
  const s = {
    info:    { bg:"#eff6ff", bd:"#bae6fd", tx:"#0c4a6e" },
    concept: { bg:"#f8fafc", bd:"#e2e8f0", tx:"#374151" },
    warn:    { bg:"#fff7ed", bd:"#fde68a", tx:"#7c2d12" },
    check:   { bg:"#f0fdf4", bd:"#bbf7d0", tx:"#14532d" },
  }[type || "info"];
  return <div style={{ background:s.bg, border:"1px solid "+s.bd, borderRadius:8, padding:"12px 15px", margin:"10px 0", fontSize:13, color:s.tx, lineHeight:1.7 }}>{children}</div>;
}

function Dose({ children }) {
  return <div style={{ background:"#0f2744", color:"#93c5fd", fontFamily:"monospace", fontSize:13, padding:"13px 17px", borderRadius:9, margin:"8px 0", lineHeight:2.1, whiteSpace:"pre" }}>{children}</div>;
}

function Grid2({ children }) {
  return <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, margin:"12px 0" }}>{children}</div>;
}

function Card({ bg, bd, children }) {
  return <div style={{ background:bg||"#f8fafc", border:"1px solid "+(bd||"#e2e8f0"), borderRadius:10, padding:15 }}>{children}</div>;
}

function Tag({ color, children }) {
  const s = { blue:"#dbeafe|#1e40af", green:"#dcfce7|#166534", orange:"#ffedd5|#9a3412", red:"#fff1f2|#9f1239", gray:"#f1f5f9|#475569" }[color||"gray"].split("|");
  return <span style={{ background:s[0], color:s[1], padding:"2px 9px", borderRadius:20, fontSize:11, fontWeight:500, display:"inline-block", margin:"2px 3px" }}>{children}</span>;
}

function SectionBox({ title, children }) {
  return (
    <div style={{ border:"1px solid #e2e8f0", borderRadius:10, overflow:"hidden", margin:"14px 0", background:"white" }}>
      <div style={{ background:"#f8fafc", padding:"8px 14px", fontSize:11, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.07em", borderBottom:"1px solid #e2e8f0" }}>{title}</div>
      <div style={{ padding:14 }}>{children}</div>
    </div>
  );
}

// ── SVG DIAGRAMS ─────────────────────────────────────────────────────────────
function AxillaryDiagram() {
  return (
    <SectionBox title="Axillary Lymph Node Levels">
      <svg viewBox="0 0 440 270" style={{ width:"100%", maxWidth:440, display:"block", margin:"0 auto" }}>
        <rect x="175" y="55" width="44" height="150" rx="9" fill="#dbeafe" stroke="#60a5fa" strokeWidth="1.5"/>
        <text x="197" y="46" textAnchor="middle" fontSize="10" fill="#1e40af" fontWeight="700">Pec Minor</text>
        <rect x="55" y="225" width="320" height="20" rx="5" fill="#e2e8f0" stroke="#94a3b8"/>
        <text x="215" y="239" textAnchor="middle" fontSize="10" fill="#64748b">Chest Wall</text>
        <ellipse cx="320" cy="145" rx="68" ry="50" fill="#dcfce7" stroke="#4ade80" strokeWidth="2"/>
        <text x="320" y="138" textAnchor="middle" fontSize="12" fontWeight="700" fill="#15803d">Level I</text>
        <text x="320" y="153" textAnchor="middle" fontSize="10" fill="#166534">Lateral to pec minor</text>
        <ellipse cx="197" cy="145" rx="28" ry="46" fill="#fef9c3" stroke="#fbbf24" strokeWidth="2"/>
        <text x="197" y="138" textAnchor="middle" fontSize="10" fontWeight="700" fill="#92400e">Level II</text>
        <text x="197" y="152" textAnchor="middle" fontSize="9" fill="#a16207">Deep to pec minor</text>
        <ellipse cx="95" cy="145" rx="48" ry="44" fill="#fee2e2" stroke="#f87171" strokeWidth="2"/>
        <text x="95" y="138" textAnchor="middle" fontSize="12" fontWeight="700" fill="#991b1b">Level III</text>
        <text x="95" y="152" textAnchor="middle" fontSize="10" fill="#b91c1c">Medial to pec minor</text>
        <circle cx="320" cy="108" r="9" fill="#4ade80" stroke="white" strokeWidth="2"/>
        <text x="345" y="88" fontSize="10" fill="#15803d" fontWeight="700">Sentinel LN</text>
      </svg>
    </SectionBox>
  );
}

function IMNDiagram() {
  return (
    <SectionBox title="Internal Mammary Node Anatomy">
      <svg viewBox="0 0 320 200" style={{ width:"100%", maxWidth:320, display:"block", margin:"0 auto" }}>
        <rect x="138" y="8" width="44" height="180" rx="7" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2"/>
        <text x="160" y="102" textAnchor="middle" fontSize="11" fill="#475569" fontWeight="700">Sternum</text>
        {[28,62,96,130,164].map(function(y, i){ return (
          <g key={i}>
            <path d={"M 182 "+y+" Q 230 "+(y+5)+" 265 "+(y+25)} fill="none" stroke="#cbd5e1" strokeWidth="9" strokeLinecap="round"/>
            <path d={"M 138 "+y+" Q 90 "+(y+5)+" 55 "+(y+25)} fill="none" stroke="#cbd5e1" strokeWidth="9" strokeLinecap="round"/>
            {i < 3 && <circle cx="199" cy={y+2} r="8" fill="#fca5a5" stroke="#dc2626" strokeWidth="1.5"/>}
            {i < 3 && <circle cx="121" cy={y+2} r="8" fill="#fca5a5" stroke="#dc2626" strokeWidth="1.5"/>}
          </g>
        ); })}
        <text x="258" y="18" fontSize="9" fill="#dc2626" fontWeight="700">IMN chain</text>
        <text x="258" y="30" fontSize="8" fill="#dc2626">IC spaces 1-3</text>
        <text x="258" y="43" fontSize="8" fill="#6b7280">~2-3 cm lateral</text>
        <text x="258" y="56" fontSize="8" fill="#6b7280">~2-3 cm deep</text>
      </svg>
    </SectionBox>
  );
}

function FxChart() {
  const data = [
    { name:"50/25", dpf:2.0,  fill:"#94a3b8" },
    { name:"42.56/16", dpf:2.66, fill:"#38bdf8" },
    { name:"40/15", dpf:2.67, fill:"#22c55e" },
    { name:"26/5 QD", dpf:5.2,  fill:"#10b981" },
    { name:"27/5 QD", dpf:5.4,  fill:"#f59e0b" },
    { name:"30/5 APBI", dpf:6.0, fill:"#818cf8" },
  ];
  return (
    <SectionBox title="Dose Per Fraction by Schedule">
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top:8, right:8, left:0, bottom:5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8"/>
          <XAxis dataKey="name" tick={{ fontSize:10, fill:"#64748b" }}/>
          <YAxis tick={{ fontSize:10, fill:"#64748b" }} label={{ value:"Gy/fx", angle:-90, position:"insideLeft", fontSize:10, fill:"#94a3b8", dx:-2 }}/>
          <Tooltip formatter={function(v){ return [v+" Gy/fx","Dose/Fx"]; }} contentStyle={{ fontSize:12, borderRadius:8 }}/>
          <Bar dataKey="dpf" radius={[4,4,0,0]}>
            {data.map(function(d, i){ return <Cell key={i} fill={d.fill}/>; })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </SectionBox>
  );
}

function LRSubtypeChart() {
  const data = [
    { subtype:"Luminal A", lr:0.2,  fill:"#22c55e" },
    { subtype:"Luminal B", lr:1.2,  fill:"#84cc16" },
    { subtype:"TNBC",      lr:4.4,  fill:"#f59e0b" },
    { subtype:"HER2+",     lr:9.0,  fill:"#ef4444" },
  ];
  return (
    <SectionBox title="5-Year LR Rate by Subtype (After BCT)">
      <ResponsiveContainer width="100%" height={150}>
        <BarChart data={data} layout="vertical" margin={{ left:60, right:40, top:5, bottom:5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8"/>
          <XAxis type="number" tick={{ fontSize:10 }} unit="%"/>
          <YAxis type="category" dataKey="subtype" tick={{ fontSize:11, fill:"#374151" }} width={60}/>
          <Tooltip formatter={function(v){ return [v+"%","5-yr LR"]; }} contentStyle={{ fontSize:12 }}/>
          <Bar dataKey="lr" radius={[0,4,4,0]} label={{ position:"right", fontSize:11, fill:"#374151", formatter:function(v){ return v+"%"; } }}>
            {data.map(function(d, i){ return <Cell key={i} fill={d.fill}/>; })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </SectionBox>
  );
}

function NodeRiskViz() {
  const items = [["<1 cm","<15%","#dcfce7","#15803d"],["1-2 cm","~25%","#fef9c3","#92400e"],["2-3 cm","~35%","#ffedd5","#9a3412"],[">3 cm","~45%","#fee2e2","#991b1b"]];
  return (
    <SectionBox title="ALN Positivity Risk by Tumor Size">
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        {items.map(function(item){ return (
          <div key={item[0]} style={{ background:item[2], borderRadius:8, padding:"10px 14px", textAlign:"center" }}>
            <div style={{ fontSize:22, fontWeight:700, color:item[3] }}>{item[1]}</div>
            <div style={{ fontSize:12, color:item[3] }}>{item[0]} tumor</div>
          </div>
        ); })}
      </div>
    </SectionBox>
  );
}

// ── PAGE SECTIONS ─────────────────────────────────────────────────────────────
function PageHome({ nav }) {
  const cards = [
    { label:"Technical Planning", sub:"Field design, OAR constraints, IMRT, DIBH", go:"field-design", bg:"#eff6ff", bd:"#bfdbfe" },
    { label:"DCIS", sub:"6 key RCTs, boost guidelines, systemic therapy", go:"dcis-overview", bg:"#f0fdf4", bd:"#bbf7d0" },
    { label:"RT Omission", sub:"PRIME II 10-yr, LUMINA, IDEA, EUROPA", go:"omit-overview", bg:"#fefce8", bd:"#fde68a" },
    { label:"Fractionation", sub:"Hypo, ultra-hypo, APBI, IMPORT LOW", go:"fx-hypo", bg:"#faf5ff", bd:"#e9d5ff" },
    { label:"Axillary Management", sub:"Z0011, SOUND, SENOMAC, post-NAC SLNB", go:"axilla-anatomy", bg:"#fff1f2", bd:"#fecdd3" },
    { label:"Post-Mastectomy RT", sub:"Indications, BC/Danish trials, SUPREMO", go:"pmrt-indications", bg:"#fff7ed", bd:"#fed7aa" },
    { label:"Nodal Irradiation", sub:"EORTC 22922, MA-20, IMN, contouring", go:"rni-trials", bg:"#ecfeff", bd:"#a5f3fc" },
    { label:"Radiation After NAC", sub:"NSABP B-51 / RTOG 1304 results", go:"b51", bg:"#f5f3ff", bd:"#ddd6fe" },
  ];
  return (
    <div>
      <div style={{ background:"linear-gradient(135deg, #0f2744 0%, #1a4d8a 100%)", borderRadius:14, padding:"28px 36px", color:"white", marginBottom:24 }}>
        <div style={{ fontSize:10, letterSpacing:"0.15em", textTransform:"uppercase", opacity:0.55, marginBottom:6 }}>Resident Clinical Reference - 2025</div>
        <h1 style={{ fontSize:28, fontWeight:700, fontFamily:"Georgia, serif", margin:"0 0 8px 0" }}>Breast Radiation Oncology</h1>
        <p style={{ fontSize:14, opacity:1,color:"white", margin:"0 0 18px 0" }}>Educational materials courtesy of Janice Lyons, MD, PhD.</p>
        <div style={{ display:"flex",color:"white", gap:8, flexWrap:"wrap" }}>
          {["35 clinical trials","Live PubMed links","Interactive diagrams","NCCN 2024 aligned"].map(function(t){ return (
            <span key={t} style={{ background:"rgba(255,255,255,0.15)", padding:"3px 12px", borderRadius:20, fontSize:11 }}>{t}</span>
          ); })}
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))", gap:12 }}>
        {cards.map(function(c){ return (
          <div key={c.go} onClick={function(){ nav(c.go); }}
            style={{ background:c.bg, border:"1px solid "+c.bd, borderRadius:11, padding:"15px 16px", cursor:"pointer", transition:"transform 0.15s" }}
            onMouseOver={function(e){ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 6px 14px rgba(0,0,0,0.08)"; }}
            onMouseOut={function(e){ e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; }}>
            <div style={{ fontWeight:700, fontSize:13, color:"#1e293b", marginBottom:4 }}>{c.label}</div>
            <div style={{ fontSize:11, color:"#64748b" }}>{c.sub}</div>
          </div>
        ); })}
      </div>
    </div>
  );
}

function PageFieldDesign() {
  return (
    <div>
      <h2>Field Design</h2>
      <Box type="concept"><strong>Core principle:</strong> Radiation beams diverge peripherally from the central axis. Only the central aspect is non-divergent. Peripheral divergence must be managed to minimize dose to non-target tissue.</Box>
      <h3>Options for Managing Divergence</h3>
      <Grid2>
        <Card bg="#eff6ff" bd="#bfdbfe">
          <div style={{ fontWeight:700, color:"#1e40af", marginBottom:6 }}>1. Gantry Rotation</div>
          <p style={{ fontSize:12, color:"#475569", margin:0 }}>Rotates beam angle around patient. Rarely used in isolation.</p>
        </Card>
        <Card bg="#f0fdf4" bd="#bbf7d0">
          <div style={{ fontWeight:700, color:"#166534", marginBottom:6 }}>2. Collimator Rotation</div>
          <p style={{ fontSize:12, color:"#475569", margin:0 }}>Rotates field opening to match divergence angle.</p>
        </Card>
        <Card bg="#fefce8" bd="#fde68a">
          <div style={{ fontWeight:700, color:"#854d0e", marginBottom:6 }}>3. Table Kick</div>
          <p style={{ fontSize:12, color:"#475569", margin:0 }}>Most common approach. Angles table to match superior beam divergence.</p>
        </Card>
        <Card bg="#faf5ff" bd="#e9d5ff">
          <div style={{ fontWeight:700, color:"#5b21b6", marginBottom:6 }}>Half-Beam Block</div>
          <p style={{ fontSize:12, color:"#475569", margin:0 }}>Blocks divergent half of beam at isocenter to eliminate divergence at match line.</p>
        </Card>
      </Grid2>
      <KP>The only non-divergent part of the beam is the central axis. All other rays diverge outward with distance from source.</KP>
    </div>
  );
}

function PagePlanReview() {
  return (
    <div>
      <h2>Plan Review & OAR Dose Constraints</h2>
      <Grid2>
        <div>
          <h3>Coverage Goal</h3>
          <Dose>{"95% of PTV >= 95% of Rx dose\n(\"95/95 rule\")"}</Dose>
          <h3>Homogeneity</h3>
          <ul style={{ color:"#475569", paddingLeft:18 }}>
            <li style={{ marginBottom:4, fontSize:14 }}>Target hotspot &lt; 105%</li>
            <li style={{ marginBottom:4, fontSize:14 }}>Higher dose/fx = lower acceptable hotspot</li>
            <li style={{ fontSize:14 }}>Avoid &gt; 107% if possible</li>
          </ul>
        </div>
        <div>
          <h3>Key OAR Constraints</h3>
          <Tbl heads={["OAR","Constraint"]} rows={[
            ["Heart (right-sided)","Mean < 1 Gy (ALARA)"],
            ["Heart (left-sided)","Mean < 2 Gy (ALARA)"],
            ["LAD artery","Minimize - review VMAT DVH carefully"],
            ["Ipsilateral lung","V16 < 15%"],
            ["Contralateral breast","Minimize"],
          ]}/>
        </div>
      </Grid2>
      <h3>Plan Review Checklist</h3>
      <Box type="check">
        <ul style={{ paddingLeft:18 }}>
          <li style={{ marginBottom:6 }}><strong>Light fields:</strong> Should NOT cross midline</li>
          <li style={{ marginBottom:6 }}><strong>Humeral head:</strong> Outside field in tangents</li>
          <li style={{ marginBottom:6 }}><strong>Lung bite:</strong> V16 &lt; 15%</li>
          <li style={{ marginBottom:6 }}><strong>FIF blocks:</strong> Must block intended tissue - if not, replan</li>
          <li><strong>Bilateral breast:</strong> Verify gap between medial beams on breath hold</li>
        </ul>
      </Box>
      <KP type="warning">For IMRT/VMAT: small patient movements have larger dosimetric impact. Daily imaging essential. Review LAD carefully on left-sided plans.</KP>
    </div>
  );
}

function PageBolus() {
  return (
    <div>
      <h2>Bolus</h2>
      <Box type="concept"><strong>Goal:</strong> Increase skin surface dose by eliminating the skin-sparing effect of megavoltage photons.</Box>
      <Grid2>
        <Card bg="#f0fdf4" bd="#bbf7d0">
          <div style={{ fontWeight:700, color:"#166534", marginBottom:8 }}>After BCS (Lumpectomy)</div>
          <ul style={{ color:"#374151", paddingLeft:16, fontSize:12 }}>
            <li style={{ marginBottom:4 }}>Partial bolus over tumor cavity when close anterior margin abuts skin</li>
            <li style={{ marginBottom:4 }}>Especially useful with high-energy photons</li>
            <li>Placement guided by plan - reference incision and nipple</li>
          </ul>
        </Card>
        <Card bg="#fff7ed" bd="#fed7aa">
          <div style={{ fontWeight:700, color:"#9a3412", marginBottom:8 }}>After Mastectomy (PMRT)</div>
          <ul style={{ color:"#374151", paddingLeft:16, fontSize:12 }}>
            <li style={{ marginBottom:4 }}>Full bolus to chest wall for adequate skin dose</li>
            <li style={{ marginBottom:4 }}>Required when skin involvement or inflammatory BC</li>
            <li>Typically 0.5-1.0 cm bolus material</li>
          </ul>
        </Card>
      </Grid2>
    </div>
  );
}

function PageImrt() {
  return (
    <div>
      <h2>IMRT / VMAT</h2>
      <Tbl heads={["Type","Description","Use Case"]} rows={[
        ["Field-in-Field (FIF)","Forward-planned; few segments; improved homogeneity","Simple WBI with hotspot reduction"],
        ["Step-and-Shoot IMRT","Inverse-optimized; fixed beams; multiple segments","Partial breast; complex anatomy"],
        ["VMAT","Continuous rotating arc; maximum flexibility","Complex nodal coverage; SIB; APBI"],
      ]}/>
      <Grid2>
        <Card bg="#f0fdf4" bd="#bbf7d0">
          <div style={{ fontWeight:700, color:"#166534", marginBottom:8 }}>Advantages of IMRT</div>
          <ul style={{ color:"#374151", paddingLeft:16, fontSize:12 }}>
            <li style={{ marginBottom:4 }}>Improved dose distribution and target coverage</li>
            <li style={{ marginBottom:4 }}>Reduced high-dose OAR (heart, lung, LAD)</li>
            <li style={{ marginBottom:4 }}>Enables simultaneous integrated boost (SIB)</li>
            <li>Better dosimetry for complex nodal plans</li>
          </ul>
        </Card>
        <Card bg="#fff1f2" bd="#fecdd3">
          <div style={{ fontWeight:700, color:"#9f1239", marginBottom:8 }}>Trade-offs</div>
          <ul style={{ color:"#374151", paddingLeft:16, fontSize:12 }}>
            <li style={{ marginBottom:4 }}>Small movements = larger dose impact - daily imaging required</li>
            <li style={{ marginBottom:4 }}>Larger low-dose volume (integral dose)</li>
            <li style={{ marginBottom:4 }}>LAD: small shift = significant arterial dose increase (left-sided)</li>
            <li>Port review: neck must be visible to evaluate SCV coverage</li>
          </ul>
        </Card>
      </Grid2>
    </div>
  );
}

function PageProneDibh() {
  return (
    <div>
      <h2>Prone Breast & Breath Hold (DIBH)</h2>
      <h3>Prone Breast Irradiation</h3>
      <Box type="concept"><strong>Rationale:</strong> Gravity pulls breast away from chest wall, reducing cardiac and pulmonary volumes in field. Best for large-breasted patients.</Box>
      <Grid2>
        <Card bg="#f0fdf4" bd="#bbf7d0">
          <div style={{ fontWeight:700, color:"#166534", marginBottom:6 }}>Advantages</div>
          <ul style={{ color:"#374151", paddingLeft:16, fontSize:12 }}>
            <li style={{ marginBottom:4 }}>Reduced heart and lung in field</li>
            <li style={{ marginBottom:4 }}>Improved dose homogeneity</li>
            <li>Best for large-breasted patients</li>
          </ul>
        </Card>
        <Card bg="#fff1f2" bd="#fecdd3">
          <div style={{ fontWeight:700, color:"#9f1239", marginBottom:6 }}>Limitations</div>
          <ul style={{ color:"#374151", paddingLeft:16, fontSize:12 }}>
            <li style={{ marginBottom:4 }}>NOT for small breasts - no gravity benefit</li>
            <li style={{ marginBottom:4 }}>Cannot easily treat regional nodes prone</li>
            <li>Reproducibility more challenging</li>
          </ul>
        </Card>
      </Grid2>
      <h3>Deep Inspiration Breath Hold (DIBH)</h3>
      <Box type="concept"><strong>Principle:</strong> Deep inspiration displaces heart posteriorly/inferiorly, reducing dose to heart and LAD. Critical for left-sided breast cancer.</Box>
      <Tbl heads={["Parameter","Free-Breathing","DIBH","Reduction"]} rows={[
        ["Mean heart dose","~3-5 Gy","~1-2 Gy","~50-60%"],
        ["LAD max dose","Higher","Significantly lower","Substantial"],
      ]}/>
      <KP type="nccn">Surface-guided RT (SGRT) increasingly used as alternative or adjunct to ABC device. DIBH especially important for left-sided WBI and PMRT with nodal irradiation.</KP>
    </div>
  );
}

function PageImaging() {
  return (
    <div>
      <h2>Breast Imaging</h2>
      <h3>Standard Mammographic Views</h3>
      <Tbl heads={["View","Technique","Key Landmark","Purpose"]} rows={[
        ["CC (Cranial-Caudal)","Top-down compression","Marker at lateral; pectoralis visible","Standard screening view"],
        ["MLO (Mediolateral Oblique)","Oblique compression","Nipple in profile; pec muscle visible","Shows most posterior tissue"],
        ["Spot Compression","Magnified over ROI","--","Benign: disperses; Malignant: persists"],
        ["Magnification Views","Magnified over calcifications","--","Characterize calcification morphology"],
      ]}/>
      <h3>Calcification Work-up</h3>
      <Grid2>
        <Card bg="#fff1f2" bd="#fecdd3">
          <div style={{ fontWeight:700, color:"#9f1239", marginBottom:8 }}>Concerning Features</div>
          <ul style={{ color:"#374151", paddingLeft:16, fontSize:12 }}>
            <li style={{ marginBottom:4 }}>Grouped / clustered</li>
            <li style={{ marginBottom:4 }}>Pleomorphic (irregular sizes/shapes)</li>
            <li style={{ marginBottom:4 }}>Linear / branching (casting type)</li>
            <li>Fine granular in segmental/ductal distribution</li>
          </ul>
        </Card>
        <Card bg="#f0fdf4" bd="#bbf7d0">
          <div style={{ fontWeight:700, color:"#166534", marginBottom:8 }}>Likely Benign</div>
          <ul style={{ color:"#374151", paddingLeft:16, fontSize:12 }}>
            <li style={{ marginBottom:4 }}>Scattered, bilateral, diffuse</li>
            <li style={{ marginBottom:4 }}>Round / punctate</li>
            <li style={{ marginBottom:4 }}>Milk of calcium (tea-cup on lateral view)</li>
            <li>Coarse, popcorn-like (fibroadenoma)</li>
          </ul>
        </Card>
      </Grid2>
    </div>
  );
}

function PageDcisOverview() {
  return (
    <div>
      <h2>DCIS - Overview</h2>
      <Box type="concept"><strong>Definition:</strong> Malignant epithelial cells confined within the ductal-lobular system without invasion through the basement membrane. A non-obligate precursor to invasive cancer.</Box>
      <Grid2>
        <div>
          <h3>Local Treatment Options</h3>
          <Card bg="#eff6ff" bd="#bfdbfe" style={{ marginBottom:10 }}>
            <div style={{ fontWeight:700, color:"#1e40af", marginBottom:4 }}>Option 1: Mastectomy</div>
            <p style={{ fontSize:12, color:"#1e40af", margin:0 }}>+/- SLNB. Perform SLNB if invasive component possible - cannot add SLNB later if invasive found post-mastectomy.</p>
          </Card>
          <Card bg="#f0fdf4" bd="#bbf7d0">
            <div style={{ fontWeight:700, color:"#166534", marginBottom:4 }}>Option 2: Lumpectomy +/- RT</div>
            <p style={{ fontSize:12, color:"#166534", margin:0 }}>RT reduces LR by ~50-75%. 50% of DCIS recurrences are invasive! Add ET if ER+.</p>
          </Card>
        </div>
        <div>
          <h3>Histologic Subtypes</h3>
          <Tbl heads={["Subtype","Key Feature","Risk"]} rows={[
            ["Comedo","Central necrosis; calcifications","Most aggressive; earliest recurrence"],
            ["Micropapillary","Finger-like projections","Tends to be multifocal"],
            ["Cribriform","Sieve-like pattern","Intermediate; often ER+"],
            ["Solid","Fills duct completely","Intermediate"],
            ["Papillary","Central papillary projections","Lower risk; often ER+, older pts"],
          ]}/>
        </div>
      </Grid2>
      <KP type="warning">~50% of DCIS recurrences are invasive carcinoma. RT significantly reduces this risk. Recurrence risk increases with longer follow-up even with RT.</KP>
    </div>
  );
}

function PageDcisTrials() {
  return (
    <div>
      <h2>DCIS - Key Randomized Trials</h2>
      <TrialCard id="ecog5194" title="ECOG 5194 - Observation for Low-Risk DCIS (15-yr)">
        <Box type="concept">Prospective observational (no RT). Tamoxifen at physician discretion (30%). Median F/U 12.3 years.</Box>
        <Tbl heads={["Cohort","Eligibility","15-yr IBE","15-yr Invasive IBE"]} rows={[
          ["Cohort 1 (n=561)","Low-intermediate grade, <2.5 cm, >=0.3 cm margin","15.1%","9.5%"],
          ["Cohort 2 (n=104)","High grade, <1 cm, >=0.3 cm margin","24.6%","13.4%"],
        ]} hi={[1]}/>
        <KP>LR risk continues to increase with time. High-grade DCIS has ~24% LR at 15 years without RT. Half of all recurrences are invasive.</KP>
      </TrialCard>

      <TrialCard id="rtog9804" title="RTOG 98-04 - RT vs Observation for Low-Risk DCIS (15-yr)">
        <Box type="concept">RCT; Grade 1-2; &lt;2.5 cm; &gt;=0.3 cm margins; RT 50 Gy/25 (no boost); closed early (n=636). Tamoxifen optional.</Box>
        <Tbl heads={["Timepoint","No RT IBE","RT IBE","No RT Invasive","RT Invasive"]} rows={[
          ["7-year","6.7%","0.9%","2.8%","~0%"],
          ["12-year","11.4%","2.8%","5.8%","1.5%"],
          ["15-year","15.1%","7.1%","9.5%","5.4%"],
        ]}/>
        <KP>~50% reduction in LR with RT even in low-risk DCIS. Risk continues to climb after 10 years in both arms.</KP>
      </TrialCard>

      <TrialCard id="comet" title="COMET - Active Monitoring for Low-Risk DCIS (JAMA 2024)" variant="green">
        <Box type="concept">Prospective RCT non-inferiority; Grade 1-2, ER/PR+, HER2-, any size; active monitoring vs guideline-concordant care; n=995; 37 month median F/U</Box>
        <Tbl heads={["Endpoint","Active Monitoring","Guideline Care","Note"]} rows={[
          ["2-yr invasive cancer (ITT)","4.2%","5.9%","Most GCC cancers found at initial surgery"],
          ["2-yr invasive cancer (per-protocol)","3.1%","8.7%","--"],
          ["High-grade invasive recurrence","15.8%","3.7%","p=0.34, but 4x higher numerically"],
        ]} hi={[2]}/>
        <KP type="warning">Active monitoring may be reasonable for carefully selected low-risk DCIS. High-grade invasive recurrences were numerically 4x more common in monitoring arm (not statistically significant). Longer follow-up essential.</KP>
      </TrialCard>

      <TrialCard id="nsabpb24" title="NSABP B-24 - Tamoxifen for DCIS After Lumpectomy + RT" variant="orange">
        <Box type="concept">RCT tamoxifen vs placebo; positive margins allowed (24%); RT 50 Gy +/- 10 Gy boost; median F/U 13.6 years</Box>
        <Tbl heads={["Outcome","Tamoxifen","Placebo","p-value"]} rows={[
          ["Local recurrence (overall)","8.2%","13.4%","0.0009"],
          ["Benefit driven by","Positive margins subgroup","--","--"],
        ]}/>
        <KP>Main ipsilateral benefit of tamoxifen is in patients with positive margins. Also reduces contralateral breast cancer events regardless of margin status.</KP>
      </TrialCard>

      <TrialCard id="nsabpb35" title="NSABP B-35 - Anastrozole vs Tamoxifen for Postmenopausal DCIS" variant="green">
        <Box type="concept">3102 postmenopausal patients; ER+ DCIS; BCS + RT; 5-yr endocrine therapy; compliance ~70%</Box>
        <Tbl heads={["Timepoint","Tamoxifen BCFI","Anastrozole BCFI","p-value"]} rows={[
          ["5-year","96.3%","96.3%","NS"],
          ["10-year","89.1%","93.0%","0.0234"],
        ]} hi={[1]}/>
        <KP type="nccn">Anastrozole preferred over tamoxifen for postmenopausal women with ER+ DCIS. Benefit at 10 years driven mainly by reduction in contralateral invasive breast cancer.</KP>
      </TrialCard>
    </div>
  );
}

function PageDcisBoost() {
  return (
    <div>
      <h2>DCIS - Role of Boost</h2>
      <TrialCard id="big307" title="BIG 3-07/TROG 07.01 - Boost for High-Risk DCIS (Lancet 2022)">
        <Box type="concept">RCT; 1608 patients; margin &gt;1 mm + &gt;=1 high-risk feature; 50/25 or 42.56/16 +/- 16 Gy/8 fx boost</Box>
        <div style={{ marginBottom:10 }}>
          <div style={{ fontWeight:600, fontSize:12, color:"#475569", marginBottom:6 }}>High-Risk Features Required:</div>
          <div>
            {["Age <50","Symptomatic","Palpable tumor","Size >1.5 cm","Multifocal","Grade 2-3","Central necrosis","Comedo histology","Margin <1 cm"].map(function(f){ return <Tag key={f} color="orange">{f}</Tag>; })}
          </div>
        </div>
        <Tbl heads={["Outcome","Boost","No Boost","p-value"]} rows={[
          ["Freedom from LR (FFLR)","97.1%","92.7%","<0.0001"],
          ["Grade 2+ breast pain","14%","10%","0.003"],
          ["Induration","14%","6%","<0.001"],
        ]} hi={[0]}/>
        <KP>Boost reduces LR by ~4.4% absolute at ~7 years. Cost: ~4% more breast pain and ~8% more induration. Fractionation schedule (50/25 vs 42.56/16) was not significant for outcomes.</KP>
      </TrialCard>
      <h3>ASTRO Boost Recommendations (Invasive Disease)</h3>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, margin:"12px 0" }}>
        <Card bg="#fff1f2" bd="#fecdd3">
          <div style={{ fontWeight:700, color:"#9f1239", fontSize:11, marginBottom:8, textTransform:"uppercase" }}>Recommended</div>
          <ul style={{ color:"#475569", paddingLeft:16, fontSize:12 }}>
            <li style={{ marginBottom:3 }}>Age &lt;=50 (any grade)</li>
            <li style={{ marginBottom:3 }}>Age 51-70, high grade</li>
            <li>Positive margin</li>
          </ul>
        </Card>
        <Card bg="#f0fdf4" bd="#bbf7d0">
          <div style={{ fontWeight:700, color:"#166534", fontSize:11, marginBottom:8, textTransform:"uppercase" }}>Can Omit</div>
          <ul style={{ color:"#475569", paddingLeft:16, fontSize:12 }}>
            <li style={{ marginBottom:3 }}>Age &gt;70</li>
            <li style={{ marginBottom:3 }}>HR+, low/intermediate grade</li>
            <li>Margins &gt;=2 mm</li>
          </ul>
        </Card>
        <Card bg="#fefce8" bd="#fde68a">
          <div style={{ fontWeight:700, color:"#854d0e", fontSize:11, marginBottom:8, textTransform:"uppercase" }}>Individualize</div>
          <ul style={{ color:"#475569", paddingLeft:16, fontSize:12 }}>
            <li style={{ marginBottom:3 }}>All others</li>
            <li style={{ marginBottom:3 }}>~4% LR reduction</li>
            <li>vs modest toxicity</li>
          </ul>
        </Card>
      </div>
      <Dose>{"Standard boost: 10-16 Gy / 5-8 fxs (2 Gy/fx)\nDCIS boost (BIG 3-07): 16 Gy / 8 fxs\nCTV = GTV (lumpectomy cavity) + 1 cm\nPTV = CTV + 0.3-0.5 cm\nRequired: >90% tumor bed receives >90% boost Rx dose\nConstraint: <50% of breast receives >60 Gy total"}</Dose>
    </div>
  );
}

function PageDcisSystemic() {
  return (
    <div>
      <h2>DCIS - Systemic Therapy</h2>
      <Tbl heads={["Agent","Population","Key Benefit","Trial"]} rows={[
        ["Tamoxifen 20 mg/day x 5 yr","Pre- or postmenopausal, ER+","Reduces ipsilateral (esp. +margins) and contralateral events","NSABP B-24"],
        ["Anastrozole 1 mg/day x 5 yr","Postmenopausal, ER+","Superior to tamoxifen at 10 yrs (93% vs 89% BCFI)","NSABP B-35"],
      ]}/>
      <KP type="nccn">NCCN 2024: ET recommended for ER+ DCIS. Anastrozole preferred for postmenopausal women; tamoxifen for premenopausal.</KP>
      <h3>ER Status Modifies RT Benefit - PRIME II 10-Year Data</h3>
      <Tbl heads={["ER Expression","No RT LR (10-yr)","RT LR (10-yr)"]} rows={[
        ["High ER (Allred 7-8; >20%)","8.6%","1.0%"],
        ["Low ER (Allred 2-6; <20%)","19.1%","0.0%"],
      ]} hi={[1]}/>
      <KP type="warning">Patients with low ER expression (&lt;20%) have 19.1% LR at 10 years without RT. Low ER should NOT be used to justify RT omission - these patients have HIGH LR risk.</KP>
    </div>
  );
}

function PageOmitOverview() {
  return (
    <div>
      <h2>RT Omission - Overview</h2>
      <Box type="concept">Many trials establish RT's role in reducing local recurrence. For populations with sufficiently low LR risk, RT may be safely omitted - particularly older patients with HR+ tumors on ET.</Box>
      <KP type="nccn">NCCN 2024 Category 1: RT omission acceptable for women &gt;=70 with T1 N0, ER+/PR+, negative margins on adjuvant ET. Women with &gt;=10-year life expectancy should be offered RT consultation.</KP>
      <Box type="warn">
        <strong>Universal finding across ALL omission trials:</strong> Local recurrence is consistently higher without RT. The question is not whether RT reduces LR - it does - but whether the absolute benefit justifies treatment in a given patient context.
      </Box>
    </div>
  );
}

function PageOmitTrials() {
  return (
    <div>
      <h2>RT Omission - Randomized Trials</h2>
      <TrialCard id="calgb9343" title="CALGB 9343 - Tamoxifen +/- RT for Women >70 (10-yr)">
        <Box type="concept">Women &gt;70; T1 N0; ER+; tamoxifen mandated; +/- WBI (50/25 or 45/25); n=633; 10-year follow-up</Box>
        <Tbl heads={["Outcome (10-yr)","Tam + RT","Tam alone","p"]} rows={[
          ["OS","67%","66%","NS"],
          ["Local control","98%","90%","<0.001"],
        ]} hi={[1]}/>
        <KP>8% difference in local control with RT; no OS difference. Supports RT omission in women &gt;70, T1 N0, ER+, on ET.</KP>
      </TrialCard>

      <TrialCard id="primeii" title="PRIME II - RT Omission in ER+ Older Patients (NEJM 2024, 10-yr)" variant="orange">
        <Box type="concept">Age &gt;=65; tumor &lt;=3 cm; LN-; margins &gt;1 mm; LVSI or G3 allowed but NOT both; n=1300; ET mandated; RT 40-50 Gy</Box>
        <Tbl heads={["Timepoint","No RT LR","RT LR","p-value"]} rows={[
          ["5-year","4.1%","1.3%","0.002"],
          ["10-year","9.5%","0.9%","<0.001"],
        ]} hi={[1]}/>
        <Tbl heads={["ER Status","No RT LR (10-yr)","RT LR (10-yr)"]} rows={[
          ["High ER (>20%)","8.6%","1.0%"],
          ["Low ER (<20%)","19.1%","0.0%"],
        ]} hi={[1]}/>
        <KP type="warning">Low ER expression (&lt;20%) = 19.1% LR at 10 years without RT. NOT appropriate for omission despite meeting other criteria.</KP>
      </TrialCard>

      <TrialCard id="europa" title="EUROPA - RT vs ET Alone >=70, Interim (Lancet Oncol 2024)" variant="green">
        <Box type="concept">Phase III RCT; RT vs ET alone; pT1 pN0, ER/PR &gt;=10%, Ki67 &lt;=20%, HER2-, age &gt;=70; primary endpoint HRQOL at 24 months</Box>
        <Tbl heads={["Endpoint","RT arm","ET arm","p-value"]} rows={[
          ["GHS change from baseline (24 mo)","-1.1","-10.0","0.045 - RT significantly better"],
          ["Grade 3 arthralgia","0%","5.6%","Significant"],
          ["Osteoporosis","3.1%","22.5%","Significant"],
        ]} hi={[0]}/>
        <KP type="nccn">Interim: RT preserves better QOL AND causes fewer adverse events than ET alone in women &gt;=70. ET had substantially more systemic toxicity. Final LR data pending.</KP>
      </TrialCard>
    </div>
  );
}

function PageOmitGenomic() {
  return (
    <div>
      <h2>Genomic-Guided RT Omission</h2>
      <TrialCard id="lumina" title="LUMINA - Luminal A by Ki67 (NEJM 2023)" variant="green">
        <Box type="concept">Age &gt;=55; tumor &lt;=2 cm; Grade 1-2; Margins &gt;1 mm; ER &gt;1%; PR &gt;20%; HER2-; Ki67 &lt;13.25% (centrally assessed); all received ET; NO RT; n=500</Box>
        <Tbl heads={["Outcome","Result","Notes"]} rows={[
          ["5-yr cumulative LR","2.3%","All 10 recurrences were invasive"],
          ["Recurrences after 5 years","6 IBEs","LR continues beyond 5 yr follow-up"],
        ]}/>
        <KP>Only 67% of registered patients qualified based on central Ki67. In truly Luminal A disease, 5-yr LR is 2.3% without RT - but recurrences continue after 5 years.</KP>
      </TrialCard>

      <TrialCard id="idea" title="IDEA - Oncotype DX-Guided Omission (JCO 2024)" variant="green">
        <Box type="concept">Postmenopausal age 50-69; unifocal T1 pN0; Oncotype DX &lt;18; BRCA1/2 excluded; n=200; median F/U 5.21 yr; all received ET; NO RT</Box>
        <Tbl heads={["Outcome","Result"]} rows={[
          ["5-yr freedom from recurrence","99% (only 2 recurrences at 5 yrs)"],
          ["Recurrences after 5 years","6 events (5 IBE; 1 IBE + regional)"],
        ]} hi={[0]}/>
        <KP>Oncotype DX &lt;18 in postmenopausal T1 N0 ER+ BC identifies patients with very low 5-year LR without RT. Longer-term data essential before definitive conclusions.</KP>
      </TrialCard>
    </div>
  );
}

function PageFxHypo() {
  return (
    <div>
      <h2>Fractionation - Standard vs Hypofractionation</h2>
      <FxChart/>
      <Grid2>
        <div>
          <Dose>{"Standard: 50 Gy / 25 fxs (2.0 Gy/fx) - 5 weeks\nHypo (Canadian): 42.56 Gy / 16 fxs (2.66 Gy/fx)\nHypo (START B): 40 Gy / 15 fxs (2.67 Gy/fx)"}</Dose>
        </div>
        <div>
          <KP type="nccn">NCCN 2024: Hypofractionation (40 Gy/15 or 42.56 Gy/16) is the preferred standard of care for most patients requiring WBI.</KP>
        </div>
      </Grid2>

      <TrialCard id="canadian" title="Canadian Hypofractionation Trial (NEJM 2010, 10-yr)">
        <Box type="concept">1234 pts; node-negative; BCS; 50 Gy/25 vs 42.56 Gy/16</Box>
        <Tbl heads={["Outcome","Hypofx (42.56/16)","Standard (50/25)","p"]} rows={[
          ["10-yr LR","6.2%","6.7%","NS"],
          ["10-yr Grade 3 LR","15.6%","4.7%","<0.001"],
          ["10-yr good/excellent cosmesis","69.8%","71.3%","NS"],
        ]} hi={[1]}/>
        <KP type="warning">Grade 3 tumors had higher LR with hypofx at 10 years. However, subsequent data and modern techniques support hypofx in grade 3 disease.</KP>
      </TrialCard>

      <TrialCard id="startb" title="UK START B Trial (Lancet Oncol 2013, 10-yr)" variant="green">
        <Box type="concept">4451 women; T1-3 N0-1 M0; START B: 50 Gy/25 vs 40 Gy/15; median F/U 9.9 yrs</Box>
        <Tbl heads={["Schedule","10-yr LR","Mod/Marked Late Effects"]} rows={[
          ["50 Gy/25 (standard)","5.5%","45.3%"],
          ["40 Gy/15","4.3%","37.9%"],
        ]} hi={[1]}/>
        <KP type="nccn">40 Gy/15 (START B) achieves the best local control AND lowest late tissue effects. This is the strongest evidence for 40 Gy/15 as the preferred standard.</KP>
      </TrialCard>
    </div>
  );
}

function PageFxUltra() {
  return (
    <div>
      <h2>Ultra-Hypofractionation (5 Fractions)</h2>
      <Dose>{"QD x 5 (Mon-Fri): 26 Gy / 5 fxs (5.2 Gy/fx) -- preferred per FAST Forward\nQD x 5 (Mon-Fri): 27 Gy / 5 fxs (5.4 Gy/fx) -- more toxicity\nQ-weekly x 5: 28.5 Gy / 5 fxs -- FAST trial\nQ-weekly x 5: 30 Gy / 5 fxs -- more induration in FAST"}</Dose>

      <TrialCard id="fastfwd" title="FAST Forward - 1-week RT Non-Inferior (Lancet 2020 / 10-yr ESTRO 2025)" variant="green">
        <Box type="concept">3-arm RCT; pT1-3 N0-1; 40 Gy/15 vs 27 Gy/5 vs 26 Gy/5 (all QD); sequential boost 10-16 Gy allowed; median F/U 71.5 months</Box>
        <Tbl heads={["Arm","5-yr IBTR","10-yr IBTR","Mod-Marked Breast/CW Effects"]} rows={[
          ["40 Gy/15 (control)","2.1%","3.6%","9.9%"],
          ["27 Gy/5","1.7%","3.0%","15.4%"],
          ["26 Gy/5","1.4%","2.0%","11.9%"],
        ]} hi={[2]}/>
        <KP>26 Gy/5 fxs QD: best 10-yr IBTR AND acceptable toxicity. 27 Gy/5 fxs had more breast/chest wall tissue effects. Both are acceptable alternatives to 40 Gy/15.</KP>
      </TrialCard>
    </div>
  );
}

function PageFxImport() {
  return (
    <div>
      <h2>IMPORT LOW - Reduced Dose and Partial Breast</h2>
      <TrialCard id="importlow" title="IMPORT LOW - Non-Inferior with Better Cosmesis (Lancet 2017)" variant="green">
        <Box type="concept">Phase III RCT; age &gt;50; pT1-2 (&lt;3 cm); pN0-1; margins &gt;2 mm; IMRT all arms</Box>
        <Tbl heads={["Arm","Dose","5-yr Local Relapse","Breast Appearance Change","Breast Firmer"]} rows={[
          ["Control (WBI)","40 Gy/15","1.1%","47.7%","35.3%"],
          ["Reduced Dose","36 Gy/15 WBI; 40 Gy/15 tumor bed","0.2%","36.7%","21%"],
          ["PBI","40 Gy/15 partial breast","0.5%","35.1%","15.3%"],
        ]} hi={[2]}/>
        <KP>Both reduced dose and PBI are non-inferior for local control with significantly improved cosmesis. PBI to tumor bed only achieves the best cosmetic outcome.</KP>
      </TrialCard>
      <LRSubtypeChart/>
    </div>
  );
}

function PageApbiOverview() {
  return (
    <div>
      <h2>APBI - Techniques and Eligibility</h2>
      <Box type="concept"><strong>APBI:</strong> Radiation to tumor bed (lumpectomy cavity + margin) only - not whole breast. Key requirement: adequate patient selection.</Box>
      <Tbl heads={["Technique","Description","Typical Fractionation"]} rows={[
        ["3D-CRT/IMRT (EBRT)","External beam; multiple conformal fields","38.5 Gy/10 BID (RAPID) or 30 Gy/5 QOD (Florence)"],
        ["Interstitial Brachytherapy","Multiple catheters; most flexible dose shaping","34 Gy/10 BID (HDR)"],
        ["Balloon Brachytherapy","Single-entry catheter in lumpectomy cavity","34 Gy/10 BID (HDR)"],
        ["IORT (Intrabeam)","Single fraction at time of surgery","20-21 Gy x 1"],
        ["VMAT","Inverse-optimized arc; most conformal EBRT","30 Gy/5 QOD or 40 Gy/15"],
      ]}/>
      <h3>ASTRO Suitability Criteria (2017)</h3>
      <Tbl heads={["Category","Key Criteria"]} rows={[
        ["Suitable","Age >=50; pT1-2 (<=3 cm); pN0; ER+; margins >=2 mm; no EIC; no LVI; unifocal; invasive ductal"],
        ["Cautionary","Age 40-49; pT2 2-3 cm; BRCA1/2; focal EIC; close margins; limited LVI"],
        ["Unsuitable","Age <40; pN+ (not micromet); multicentric; positive margins; diffuse LVI; EIC"],
      ]} hi={[0]}/>
    </div>
  );
}

function PageApbiTrials() {
  return (
    <div>
      <h2>APBI - Randomized Trials</h2>
      <TrialCard id="rapid" title="RAPID - APBI vs WBI (Lancet 2019, 8.6-yr median F/U)">
        <Box type="concept">RCT non-inferiority; age &gt;=40; DCIS or node-negative; APBI 38.5 Gy/3.85 Gy/fx BID vs WBI; 2135 pts</Box>
        <ul style={{ color:"#475569", paddingLeft:18 }}>
          <li style={{ marginBottom:6, fontSize:14 }}>APBI non-inferior to WBI for local control</li>
          <li style={{ marginBottom:6, fontSize:14 }}>Less acute toxicity with APBI</li>
          <li style={{ fontSize:14 }}>Cosmesis worse with APBI vs WBI - likely due to BID scheduling</li>
        </ul>
        <KP type="warning">BID scheduling likely contributes to inferior cosmesis in RAPID. Modern APBI protocols prefer QOD scheduling.</KP>
      </TrialCard>

      <TrialCard id="b39" title="NSABP B-39 - APBI Did NOT Meet Equivalence (Lancet 2019)" variant="orange">
        <Box type="concept">Phase III equivalence; Stage 0-II (tumor &lt;3 cm); APBI brachytherapy (34 Gy/10 BID) or EBRT (38.5 Gy/10 BID) vs WBI 50 Gy/25; 4216 women</Box>
        <Tbl heads={["Outcome","WBI","APBI","HR (90% CI)","Met Equivalence?"]} rows={[
          ["10-yr IBTR","3.9%","4.6%","1.22 (0.94-1.58)","NO - upper limit exceeded 1.5"],
        ]} hi={[0]}/>
        <KP type="warning">APBI did NOT meet equivalence criteria. B-39 included higher-risk patients than RAPID or Florence. WBI favored in this broader population.</KP>
      </TrialCard>

      <TrialCard id="florence" title="Florence Trial - APBI 30 Gy/5 QOD (JCO 2020, 10.7-yr median F/U)" variant="green">
        <Box type="concept">Phase III; APBI 30 Gy/5 fxs QOD vs WBI 50 Gy/25 + 10 Gy boost; 520 patients; 90% &gt;50 yrs; 95% T1; 95% ER+</Box>
        <ul style={{ color:"#475569", paddingLeft:18 }}>
          <li style={{ marginBottom:6, fontSize:14 }}>APBI non-inferior to WBI for local control at 10 years</li>
          <li style={{ marginBottom:6, fontSize:14 }}>Similar cosmesis</li>
          <li style={{ fontSize:14 }}>QOD schedule well-tolerated with minimal late effects</li>
        </ul>
        <KP>30 Gy/5 fxs QOD is the preferred EBRT-APBI regimen. Excellent 10-year local control and cosmesis.</KP>
      </TrialCard>
    </div>
  );
}

function PageBoost() {
  return (
    <div>
      <h2>Boost Radiation</h2>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, margin:"12px 0" }}>
        <Card bg="#fff1f2" bd="#fecdd3">
          <div style={{ fontWeight:700, color:"#9f1239", fontSize:11, marginBottom:8, textTransform:"uppercase" }}>Recommended</div>
          <ul style={{ color:"#475569", paddingLeft:16, fontSize:12 }}>
            <li style={{ marginBottom:3 }}>Age &lt;=50 (any grade)</li>
            <li style={{ marginBottom:3 }}>Age 51-70 + high grade</li>
            <li>Positive margin</li>
          </ul>
        </Card>
        <Card bg="#f0fdf4" bd="#bbf7d0">
          <div style={{ fontWeight:700, color:"#166534", fontSize:11, marginBottom:8, textTransform:"uppercase" }}>Can Omit</div>
          <ul style={{ color:"#475569", paddingLeft:16, fontSize:12 }}>
            <li style={{ marginBottom:3 }}>Age &gt;70</li>
            <li style={{ marginBottom:3 }}>HR+, low/intermediate grade</li>
            <li>Margins &gt;=2 mm</li>
          </ul>
        </Card>
        <Card bg="#fefce8" bd="#fde68a">
          <div style={{ fontWeight:700, color:"#854d0e", fontSize:11, marginBottom:8, textTransform:"uppercase" }}>Individualize</div>
          <ul style={{ color:"#475569", paddingLeft:16, fontSize:12 }}>
            <li style={{ marginBottom:3 }}>All others</li>
            <li style={{ marginBottom:3 }}>~4% LR reduction</li>
            <li>vs modest toxicity</li>
          </ul>
        </Card>
      </div>
      <p style={{ fontSize:11, color:"#94a3b8" }}>Smith et al. PRO 8:145-152, 2018</p>
      <Dose>{"Standard boost: 10-16 Gy / 5-8 fxs (2 Gy/fx)\nDCIS boost (BIG 3-07): 16 Gy / 8 fxs\nCTV = GTV (lumpectomy cavity) + 1 cm\nPTV = CTV + 0.3-0.5 cm"}</Dose>
    </div>
  );
}

function PageMulticentric() {
  return (
    <div>
      <h2>BCS for Multiple Ipsilateral Tumors</h2>
      <TrialCard id="z11102" title="ACOSOG Z11102 - BCS for 2-3 Ipsilateral Cancers (JCO 2023)">
        <Box type="concept">Phase II; age &gt;=40; BCS (resect ALL tumors); 2-3 ipsilateral invasive cancers; largest &lt;=5 cm; &gt;=2 cm between lesions; negative margins; mandatory boost to EACH tumor bed; n=204; median F/U 66 months</Box>
        <Tbl heads={["Subgroup","LR Rate","Note"]} rows={[
          ["Overall (n=204)","3.1%","Feasible"],
          ["ER+ with ET","1.9%","Very low - ET is critical"],
          ["ER+ WITHOUT ET","12.5%","High risk - ET must be used"],
          ["Pre-op MRI done","1.7%","Critical selection tool"],
          ["No pre-op MRI","22.6%","p=0.002 - much higher LR"],
        ]} hi={[1,3]}/>
        <KP>BCS for 2-3 ipsilateral tumors is oncologically feasible. Pre-operative MRI and adjuvant ET are both critical for low LR rates.</KP>
      </TrialCard>
    </div>
  );
}

function PageAxillaAnatomy() {
  return (
    <div>
      <h2>Axillary Management - Anatomy</h2>
      <Grid2>
        <div>
          <Tbl heads={["Level","Location","Notes"]} rows={[
            ["Level I","Lateral to pectoralis minor","First echelon; most commonly involved"],
            ["Level II","Deep to pectoralis minor (Rotter's nodes)","Second echelon"],
            ["Level III","Medial to pectoralis minor","Highest level; Halsted nodes"],
          ]}/>
          <NodeRiskViz/>
        </div>
        <AxillaryDiagram/>
      </Grid2>
    </div>
  );
}

function PageZ0011() {
  return (
    <div>
      <h2>ACOSOG Z0011 - SLNB vs ALND</h2>
      <TrialCard id="z0011" title="ACOSOG Z0011 - 10-yr Follow-up (JCO 2017)" variant="green">
        <Box type="concept">cT1-2 N0 M0; 1-2 positive SLNs; BCS; WBI (18% received nodal RT per individual MD); no neoadjuvant chemo; no ECE; n=891</Box>
        <Tbl heads={["Outcome (10-yr)","SLNB alone","ALND","p-value"]} rows={[
          ["OS","86.3%","83.6%","0.02 (SLNB superior)"],
          ["DFS","80.2%","78.2%","0.32 (NS)"],
          ["Regional recurrence","1.5%","0.5%","NS"],
        ]} hi={[0]}/>
        <KP type="nccn">SLNB alone is non-inferior (and may be superior) to ALND for carefully selected patients with 1-2 positive SLNs undergoing BCS + WBI.</KP>
        <div style={{ marginTop:12 }}>
          <div style={{ fontWeight:700, color:"#9a3412", marginBottom:8, fontSize:13 }}>Z0011 Does NOT Apply To:</div>
          <div>
            {["Mastectomy patients",">=3 positive SLNs","Extracapsular extension","Neoadjuvant chemo","Not receiving WBI","Clinical N1 (palpable)"].map(function(e){ return <Tag key={e} color="red">{e}</Tag>; })}
          </div>
        </div>
      </TrialCard>
    </div>
  );
}

function PageSoundSenomac() {
  return (
    <div>
      <h2>SOUND and SENOMAC Trials</h2>
      <TrialCard id="sound" title="SOUND - Omit SLNB in cN0 with Negative US (JAMA Oncol 2023)" variant="green">
        <Box type="concept">Tumor &lt;2 cm; negative axillary US; BCS + radiation; any age; n=1463; primary: DDFS at 5 years</Box>
        <Tbl heads={["Outcome (5-yr)","No SLNB","SLNB","p-value"]} rows={[
          ["DDFS","97.7%","98.0%","NS"],
          ["Axillary recurrence","~0.4%","~0.4%","NS"],
        ]}/>
        <KP>SLNB can be safely omitted for tumors &lt;2 cm with negative axillary ultrasound undergoing BCS + radiation.</KP>
      </TrialCard>

      <TrialCard id="senomac" title="SENOMAC - ALND vs SLNB for SLN Macrometastases (NEJM 2024)" variant="green">
        <Box type="concept">Clinically node-negative; SLN macrometastases; n=2540; ~89% received WBI or CWI + RNI</Box>
        <Tbl heads={["Outcome","SLNB alone","Completion ALND"]} rows={[
          ["Local recurrence","0.9%","0.8%"],
          ["Regional recurrence","0.4%","0.5%"],
          ["Distant recurrence","3.3%","4.4%"],
        ]}/>
        <KP>Completion ALND is NOT necessary when most patients receive RNI. SENOMAC extends Z0011 principles to patients with macrometastases.</KP>
      </TrialCard>
    </div>
  );
}

function PageIbcsg() {
  return (
    <div>
      <h2>IBCSG 23-01 - ALND for SLN Micrometastases</h2>
      <TrialCard id="ibcsg" title="IBCSG 23-01 - SLNB Alone vs Completion ALND (Lancet Oncol 2018)" variant="green">
        <Box type="concept">Any age; tumor &lt;=5 cm; &gt;=1 positive SLN (micrometastasis or ITC); no ECE; n=931; median F/U 5 years</Box>
        <Tbl heads={["Outcome (5-yr)","SLNB alone","ALND","p-value"]} rows={[
          ["DFS","87.8%","84.4%","0.16 (NS)"],
          ["OS","97.5%","97.6%","NS"],
          ["Axillary recurrence","<2%","<2%","NS"],
        ]}/>
        <KP>Completion ALND does NOT improve outcomes for SLN micrometastases. SLNB alone is sufficient.</KP>
      </TrialCard>
      <Box type="check">
        <strong>Summary - When Can We Omit ALND?</strong>
        <ul style={{ paddingLeft:18, marginTop:8 }}>
          <li style={{ marginBottom:5 }}><strong>SOUND:</strong> Omit SLNB entirely for T&lt;2 cm + negative axillary US</li>
          <li style={{ marginBottom:5 }}><strong>Z0011:</strong> Omit ALND for 1-2 positive SLNs after BCS + WBI</li>
          <li style={{ marginBottom:5 }}><strong>IBCSG 23-01:</strong> Omit ALND for SLN micrometastases</li>
          <li><strong>SENOMAC:</strong> Omit completion ALND for SLN macrometastases (with RNI)</li>
        </ul>
      </Box>
    </div>
  );
}

function PageSlnbNac() {
  return (
    <div>
      <h2>SLNB After Neoadjuvant Chemotherapy</h2>
      <KP type="warning">Key rule: To achieve FNR &lt;10% with SLNB after NAC in cN+ → cN0: must use dual tracer (radioactive colloid + blue dye) AND remove &gt;=3 sentinel nodes. Both criteria required.</KP>
      <TrialCard id="z1071" title="ACOSOG Z1071 - FNR of SLNB After NAC in cN1 (JAMA 2013)">
        <Box type="concept">cT0-4 N1-2 M0; received NAC; primary: FNR &lt;10% in cN1 patients</Box>
        <Tbl heads={["Condition","FNR"]} rows={[
          ["Overall FNR","12.6% - EXCEEDED 10% threshold"],
          ["Dual tracer only","10.8%"],
          [">=3 LNs removed only","9.1%"],
          ["Dual tracer + >=3 LNs","<10% - ACCEPTABLE"],
        ]} hi={[3]}/>
      </TrialCard>
      <TrialCard id="sentina" title="SENTINA - SLNB Timing Relative to NAC (Lancet Oncol 2013)" variant="orange">
        <Tbl heads={["Arm","Setting","Detection Rate","FNR"]} rows={[
          ["A","cN0 → SLNB before NAC only","99.2%","N/A"],
          ["B","cN0 → SLNB before AND after NAC","65.6% (2nd SLNB)","51.6%"],
          ["C","cN+ → cN0 → SLNB after NAC","80.4%","14.2%"],
          ["C (dual + >=3 LNs)","cN+ → optimized SLNB after NAC","--","<10%"],
        ]} hi={[3]}/>
        <KP type="warning">Do NOT perform a second SLNB after NAC if SLNB was already done before (Arm B: 51.6% FNR!). This is a critical clinical pitfall.</KP>
      </TrialCard>
    </div>
  );
}

function PageRniTrials() {
  return (
    <div>
      <h2>Regional Nodal Irradiation - Randomized Trials</h2>
      <TrialCard id="eortc22922" title="EORTC 22922 - WBI/CW + IMN + Medial SCV (NEJM 2015 / 20-yr Lancet Oncol 2020)" variant="green">
        <Box type="concept">RCT; 4004 patients; Stage I-III; medially located tumor OR positive axillary LN; WBI/CW + CNI vs WBI/CW alone</Box>
        <Tbl heads={["Outcome","No CNI","CNI","Benefit"]} rows={[
          ["10-yr regional recurrence","4.0%","2.2%","1.8% reduction"],
          ["10-yr BC mortality","16.0%","12.5%","3.5% reduction"],
          ["20-yr BC mortality","~16%","~12%","~3.8% reduction at 20 yrs"],
          ["Lymphedema","+0%","+4%","Notable increase"],
        ]} hi={[1]}/>
        <KP>CNI reduces regional recurrence and BC mortality. Benefit persists at 20 years. Counsel patients about ~4% additional lymphedema risk.</KP>
      </TrialCard>

      <TrialCard id="ma20" title="NCIC MA-20 - WBI + RNI vs WBI Alone (NEJM 2015)" variant="blue">
        <Box type="concept">RCT; 1832 BCS patients; node-positive OR high-risk node-negative; WBI alone vs WBI + RNI (IMN, SCV, axillary apex)</Box>
        <Tbl heads={["Outcome","WBI alone","WBI + RNI","Benefit"]} rows={[
          ["Isolated LRR","6.8%","4.3%","2.5% reduction"],
          ["Distant recurrence","17%","13%","4% reduction"],
          ["BC mortality (10-yr)","12%","10%","2% reduction"],
          ["Lymphedema","+0%","+4%","Increase"],
        ]} hi={[1]}/>
        <KP>RNI reduces LRR and - importantly - distant recurrence (suggesting micrometastatic disease cleared by nodal RT).</KP>
      </TrialCard>
    </div>
  );
}

function PageContouring() {
  return (
    <div>
      <h2>Contouring Guidelines</h2>
      <Grid2>
        <div>
          <h3>SCV Nodal Volume - RTOG vs ESTRO</h3>
          <Tbl heads={["Border","RTOG","ESTRO"]} rows={[
            ["Cranial","Caudal to cricoid cartilage","Cranial extent of subclavian artery"],
            ["Caudal","Junction of brachiocephalic-axillary veins","Subclavian vein connecting to IMN"],
            ["Anterior","SCM muscle","SCM / dorsal clavicle"],
            ["Posterior","Anterior aspect of scalene muscles","Anterior aspect of scalene muscles"],
          ]}/>
          <Box type="info">
            <ul style={{ paddingLeft:18 }}>
              <li style={{ marginBottom:5 }}>SCV volume must include lateral SCV and infraclavicular nodes</li>
              <li style={{ marginBottom:5 }}>For VMAT port review: neck must be visible on image to verify SCV and axillary apex coverage</li>
              <li>Level III axilla contiguous with SCV - do not under-contour</li>
            </ul>
          </Box>
        </div>
        <div>
          <IMNDiagram/>
          <Tbl heads={["IMN Parameter","Value"]} rows={[
            ["Location","Intercostal spaces 1-3"],
            ["Lateral to sternum","~2-3 cm"],
            ["Depth","~2-3 cm deep"],
            ["NCCN recommendation","Strongly recommend inclusion with RNI"],
          ]}/>
        </div>
      </Grid2>
    </div>
  );
}

function PageTechnique() {
  return (
    <div>
      <h2>Delivery Technique - Mono vs Dual Isocenter</h2>
      <Tbl heads={["Feature","Mono-Isocenter","Dual-Isocenter"]} rows={[
        ["Max field length","~20 cm","~40 cm (two matched fields)"],
        ["Table kick","Never needed","Always (away from gantry)"],
        ["Match plane","Tied to isocenter","Clinically matched and verified daily"],
        ["Daily documentation","Simpler","Must document ALL shifts from v-sim"],
        ["IMRT/VMAT with SCV","Limited","Standard approach for comprehensive nodal RT"],
      ]}/>
      <KP type="warning">Dual-isocenter: document ALL shifts. Undocumented shifts can lead to inadvertent lung/heart dose. For VMAT: port image MUST show neck to evaluate SCV, infraclavicular, Level III axilla.</KP>
    </div>
  );
}

function PagePmrtIndications() {
  return (
    <div>
      <h2>Post-Mastectomy RT - Indications</h2>
      <Grid2>
        <Card bg="#fff1f2" bd="#fecdd3">
          <div style={{ fontWeight:700, color:"#9f1239", fontSize:14, marginBottom:10 }}>Clear PMRT Indications (Category 1)</div>
          <ul style={{ color:"#374151", paddingLeft:16 }}>
            {[">=4 positive axillary lymph nodes","Tumor size >5 cm","Inflammatory breast cancer","Skin involvement (T4b)","Chest wall invasion (T4a)","Positive surgical margins","Deep pectoralis fascia involvement"].map(function(i){ return <li key={i} style={{ marginBottom:5, fontSize:13 }}>{i}</li>; })}
          </ul>
        </Card>
        <Card bg="#fefce8" bd="#fde68a">
          <div style={{ fontWeight:700, color:"#854d0e", fontSize:14, marginBottom:10 }}>Controversial - Individualize</div>
          <ul style={{ color:"#374151", paddingLeft:16 }}>
            {["1-3 positive axillary nodes (NCCN Cat 1; SUPREMO shows no OS benefit with CW-only RT)","T3 N0 (>5 cm, node-neg) - higher LR risk","High-risk T2 N0 (Grade 3, LVSI)"].map(function(i){ return <li key={i} style={{ marginBottom:5, fontSize:13 }}>{i}</li>; })}
          </ul>
        </Card>
      </Grid2>
      <KP type="nccn">NCCN 2024: PMRT recommended for &gt;=4 positive nodes (Category 1) and for 1-3 positive nodes (Category 1). SUPREMO results do not yet change guidelines.</KP>
    </div>
  );
}

function PagePmrtTrials() {
  return (
    <div>
      <h2>PMRT - Landmark Trials</h2>
      <TrialCard id="bc_trial" title="British Columbia Trial - MRM + CMF +/- RT (NEJM 1997)">
        <Box type="concept">318 node-positive women; MRM + CMF +/- RT (37.5 Gy/2.34 Gy/fx to CW; IMC to 35 Gy at 3 cm depth)</Box>
        <Tbl heads={["Outcome","CMF alone","CMF + RT","p (15-yr)"]} rows={[
          ["DFS","33%","50%","0.007"],
          ["Local control","67%","87%","0.003"],
          ["OS","46%","54%","0.07"],
        ]} hi={[0]}/>
        <p style={{ fontSize:12, color:"#64748b" }}>Benefit seen across ALL subgroups including 1-3 positive nodes</p>
      </TrialCard>

      <TrialCard id="danish82b" title="Danish 82b - CMF +/- RT, Premenopausal (NEJM 1997)">
        <Box type="concept">1708 premenopausal; Stage II-III; 8 cycles CMF +/- RT (50 Gy/25); median 7 LNs removed</Box>
        <Tbl heads={["# Positive Nodes","DFS (CMF)","DFS (CMF+RT)","OS (CMF)","OS (CMF+RT)"]} rows={[
          ["0 (N0)","62%","74%","70%","82%"],
          ["1-3","39%","54%","54%","62%"],
          [">=4","14%","27%","20%","32%"],
        ]} hi={[1]}/>
        <KP type="warning">Suboptimal axillary dissection (median 7 LNs) may have contributed to higher LRR rates - leading to apparent PMRT benefit even in N0 patients.</KP>
      </TrialCard>

      <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:10, padding:16, marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
          <div style={{ fontWeight:700, color:"#166534", fontSize:14 }}>EBCTCG Meta-Analysis - 1-3 Node Positive After Mastectomy (Lancet 2014)</div>
          <a href="https://pubmed.ncbi.nlm.nih.gov/24656685/" target="_blank" rel="noopener noreferrer" style={{ background:"#166534", color:"white", padding:"4px 12px", borderRadius:20, fontSize:11, fontWeight:600, textDecoration:"none" }}>PubMed &rarr;</a>
        </div>
        <Grid2>
          <div style={{ background:"rgba(255,255,255,0.5)", borderRadius:9, padding:14, textAlign:"center" }}>
            <div style={{ fontSize:22, fontWeight:700, color:"#15803d" }}>20% &rarr; 4%</div>
            <div style={{ fontSize:12, color:"#166534" }}>10-yr LRR with PMRT</div>
          </div>
          <div style={{ background:"rgba(255,255,255,0.5)", borderRadius:9, padding:14, textAlign:"center" }}>
            <div style={{ fontSize:22, fontWeight:700, color:"#15803d" }}>50% &rarr; 42%</div>
            <div style={{ fontSize:12, color:"#166534" }}>20-yr BC mortality with PMRT</div>
          </div>
        </Grid2>
      </div>
    </div>
  );
}

function PagePmrtSupremo() {
  return (
    <div>
      <h2>SUPREMO - PMRT for Intermediate-Risk (NEJM 2024)</h2>
      <TrialCard id="supremo" title="SUPREMO - CW RT in Intermediate-Risk Patients (10-yr, NEJM 2024)" variant="orange">
        <Box type="concept">pT1-2 N1, pT3 N0, or pT2 N0 if Grade 3 and/or LVSI; mastectomy; CW ONLY RT (40-50 Gy/15-25); axillary RT NOT allowed; n=1679</Box>
        <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:10 }}>
          <Tag color="gray">25% - 0 nodes</Tag>
          <Tag color="gray">40% - 1 node</Tag>
          <Tag color="gray">23% - 2 nodes</Tag>
          <Tag color="gray">12% - 3 nodes</Tag>
          <Tag color="orange">Only 10% TNBC</Tag>
        </div>
        <Tbl heads={["Outcome (10-yr)","No CWI","CWI","HR (95% CI)","p"]} rows={[
          ["OS","~81.9%","~81.4%","1.04 (0.82-1.30)","0.79 - NS"],
          ["DFS","~75.5%","~76.2%","0.97 (0.79-1.18)","0.70 - NS"],
          ["CW recurrence","2.5%","1.1%","0.45 (0.20-0.99)","0.04"],
          ["N+ subgroup LR","Higher","Lower","0.30 (0.11-0.82)","0.01"],
        ]} hi={[2,3]}/>
        <div style={{ background:"#fff7ed", border:"1px solid #fbbf24", borderRadius:9, padding:14, marginTop:12 }}>
          <div style={{ fontWeight:700, color:"#92400e", marginBottom:8 }}>Critical Caveats</div>
          <ul style={{ color:"#78350f", paddingLeft:16, fontSize:12 }}>
            <li style={{ marginBottom:4 }}>65% of patients had 0-1 positive nodes</li>
            <li style={{ marginBottom:4 }}>Only 10% TNBC - HER2+/TNBC subgroups may benefit more</li>
            <li style={{ marginBottom:4 }}>ALND required (not current standard)</li>
            <li style={{ marginBottom:4 }}>CW ONLY - did NOT include RNI. EBCTCG benefit came from PMRT + RNI, not CW alone</li>
            <li>Modern systemic therapy used in minority</li>
          </ul>
        </div>
        <KP type="warning">SUPREMO shows no OS benefit from CW-only RT in intermediate-risk patients. NCCN recommendations for PMRT in 1-3 N+ have NOT changed.</KP>
      </TrialCard>
    </div>
  );
}

function PageImnAnatomy() {
  return (
    <div>
      <h2>IMN Radiation - Anatomy and Risk</h2>
      <Grid2>
        <div>
          <Box type="concept">IMN Location: IC spaces 1-3; ~2-3 cm lateral to mid-sternum; ~2-3 cm deep in chest wall.</Box>
          <Tbl heads={["Axillary Status","Lateral Tumor","Medial Tumor"]} rows={[
            ["LN negative","~5%","10-15%"],
            ["LN positive","~25%","~50%"],
          ]} hi={[1]}/>
          <KP type="nccn">NCCN: Strongly recommends inclusion of IMN chain when treating regional nodes. All trials showing PMRT survival benefit included the IMN chain.</KP>
        </div>
        <IMNDiagram/>
      </Grid2>
    </div>
  );
}

function PageImnTrials() {
  return (
    <div>
      <h2>IMN Radiation - Trials</h2>
      <div style={{ background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:10, padding:16, marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
          <div style={{ fontWeight:700, color:"#1e40af" }}>DBCG-IMN - Prospective Cohort (JCO 2016)</div>
          <a href="https://pubmed.ncbi.nlm.nih.gov/26712210/" target="_blank" rel="noopener noreferrer" style={{ background:"#1e40af", color:"white", padding:"4px 12px", borderRadius:20, fontSize:11, fontWeight:600, textDecoration:"none" }}>PubMed &rarr;</a>
        </div>
        <p style={{ fontSize:12, color:"#3b82f6", margin:"0 0 8px" }}>Right-sided: IMN RT; left-sided: no IMN RT (cardiac concern); 3089 pts; median F/U 8.9 years</p>
        <Tbl heads={["Outcome","No IMN RT (left-sided)","IMN RT (right-sided)"]} rows={[
          ["OS","72.2%","75.9%"],
          ["BC mortality","23.4%","20.9%"],
        ]}/>
      </div>

      <TrialCard id="krog" title="KROG 08-06 - No Overall IMN Benefit; Benefit for Medial Tumors (JAMA Oncol 2021)" variant="orange">
        <Box type="concept">Phase III RCT; node-positive; MRM or BCS; 45-50.4 Gy/1.8-2 Gy/fx; stratified N1 vs N2/3</Box>
        <Tbl heads={["Outcome (7-yr)","All - IMN","All - No IMN","Medial - IMN","Medial - No IMN","p (medial)"]} rows={[
          ["DFS","85.3%","81.9%","91.8%","81.6%","0.008"],
          ["BC mortality","9.1%","11.5%","4.9%","10.2%","0.04"],
          ["DMFS","86.2%","83.6%","91.8%","82.3%","0.01"],
        ]} hi={[0,1,2]}/>
        <KP>Significant DFS and BC mortality benefit for medial quadrant tumors with IMN RT. No significant overall benefit for unselected patients.</KP>
      </TrialCard>
    </div>
  );
}

function PageNacIndications() {
  return (
    <div>
      <h2>Radiation After NAC - PMRT Indications</h2>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, margin:"12px 0" }}>
        <Card bg="#fff1f2" bd="#fecdd3">
          <div style={{ fontWeight:700, color:"#9f1239", marginBottom:10, fontSize:12, textTransform:"uppercase" }}>Require PMRT</div>
          <ul style={{ color:"#374151", paddingLeft:16, fontSize:12 }}>
            {["cT4 (inflammatory, skin, CW)","cT3 N+","cN2-3","ypT3-4","ypN+ (persistent nodes)"].map(function(i){ return <li key={i} style={{ marginBottom:4 }}>{i}</li>; })}
          </ul>
        </Card>
        <Card bg="#f0fdf4" bd="#bbf7d0">
          <div style={{ fontWeight:700, color:"#166534", marginBottom:10, fontSize:12, textTransform:"uppercase" }}>Do NOT Need PMRT</div>
          <ul style={{ color:"#374151", paddingLeft:16, fontSize:12 }}>
            <li style={{ marginBottom:4 }}>cT1-2 cN0 -&gt; ypT1-2 ypN0</li>
            <li>pCR in low clinical stage</li>
          </ul>
        </Card>
        <Card bg="#fefce8" bd="#fde68a">
          <div style={{ fontWeight:700, color:"#854d0e", marginBottom:10, fontSize:12, textTransform:"uppercase" }}>Individualize</div>
          <ul style={{ color:"#374151", paddingLeft:16, fontSize:12 }}>
            <li style={{ marginBottom:4 }}>cT1-2 cN1 -&gt; ypTis-2 ypN0</li>
            <li>See B-51 data</li>
          </ul>
        </Card>
      </div>
      <Tbl heads={["Clinical Stage","10-yr LRR without PMRT","Interpretation"]} rows={[
        ["Stage I-II","0%","pCR in low stage → PMRT may not be needed"],
        ["Stage III","33.3%","pCR in Stage III → PMRT still needed"],
      ]} hi={[1]}/>
      <p style={{ fontSize:11, color:"#94a3b8" }}>McGuire et al. IJROBP 2007</p>
    </div>
  );
}

function PageB51() {
  return (
    <div>
      <h2>NSABP B-51 / RTOG 1304</h2>
      <Box type="info">
        <strong>Design:</strong> Phase III RCT; cT1-3 N1 M0; biopsy-proven N+; &gt;=8 wks NAC +/- anti-HER2; ypN0 at surgery (SLNB &gt;=2 nodes, ALND, or both); mastectomy or BCS; n=1641; median F/U 59.5 months
      </Box>
      <Tbl heads={["Outcome (5-yr)","No RNI","RNI","HR (95% CI)","p"]} rows={[
        ["IBCRFI (primary)","91.8%","92.7%","0.88 (0.60-1.28)","0.51 - NS"],
        ["LRRFI","98.4%","99.3%","0.37 (0.12-1.16)","0.088"],
        ["DRFI","93.4%","93.4%","1.00","0.99"],
        ["OS","94.0%","93.6%","1.12","0.59"],
      ]}/>
      <h3>Exploratory Subgroup - Tumor Subtype</h3>
      <Tbl heads={["Subtype","No RNI IBCRFI","RNI IBCRFI","HR (95% CI)","p-interact"]} rows={[
        ["All","91.8%","92.7%","0.88","--"],
        ["TNBC","95.0%","88.4%","2.30 (1.00-5.25)","0.037"],
        ["ER+/HER2-","90.5%","94.0%","0.41 (0.17-0.99)","--"],
        ["HER2+ (ER-)","88.8%","92.4%","0.63","--"],
      ]} hi={[1]}/>
      <KP type="warning">Exploratory: TNBC appeared to do WORSE with RNI (HR 2.30, p=0.037). Likely a chance finding - interpret with caution.</KP>
      <KP>Primary conclusion: RNI does NOT improve IBCRFI, DFS, or OS in cN+ patients who achieve ypN0 after NAC.</KP>
      <a href="https://pubmed.ncbi.nlm.nih.gov/38198849/" target="_blank" rel="noopener noreferrer" style={{ display:"inline-block", background:"#1e40af", color:"white", padding:"6px 14px", borderRadius:20, fontSize:12, fontWeight:600, textDecoration:"none", marginTop:8 }}>Open B-51 on PubMed &rarr;</a>
    </div>
  );
}

function PageLrr() {
  return (
    <div>
      <h2>Locoregional Recurrence - Management</h2>
      <h3>Work-up</h3>
      <Box type="check">
        <ul style={{ paddingLeft:18 }}>
          <li style={{ marginBottom:6 }}><strong>Breast imaging:</strong> US of recurrence; MRI if reconstruction present; axillary US</li>
          <li style={{ marginBottom:6 }}><strong>Biopsy:</strong> Always obtain ER/PR/HER2 - may differ from primary</li>
          <li><strong>Restaging:</strong> CT chest/abdomen/pelvis + bone scan, OR PET/CT</li>
        </ul>
      </Box>
      <Tbl heads={["Recurrence Site","Standard Approach","Notes"]} rows={[
        ["In-breast (no prior RT)","Mastectomy is standard; repeat BCS +/- RT in selected","Biopsy → restage → systemic → surgery → RT"],
        ["Chest wall (no prior RT)","CW + CNI irradiation (50 Gy + boost to recurrence)","Resect if possible first"],
        ["Chest wall (prior CW RT)","Re-irradiation - multidisciplinary decision","Prior dose, time elapsed, risk all considered"],
        ["Regional nodes","Resect if possible + RT + systemic therapy","Based on prior RT history"],
      ]}/>
      <TrialCard id="calor" title="CALOR - Chemo for Isolated LRR (JCO 2018, 9-yr)" variant="blue">
        <Box type="concept">RCT; completely excised isolated LRR; chemo vs no chemo; RT mandated for positive margins</Box>
        <Tbl heads={["ER Status","Chemo Benefit"]} rows={[
          ["ER Negative","YES - significant DFS, BCFS, OS improvement"],
          ["ER Positive","No - no significant difference (add/continue ET)"],
        ]} hi={[0]}/>
        <KP>Chemotherapy for isolated LRR benefits ER-negative patients only.</KP>
      </TrialCard>
      <TrialCard id="rtog1014" title="RTOG 1014 - Re-irradiation for In-Breast Recurrence (JAMA Oncol 2020)" variant="orange">
        <Box type="concept">Phase II; 45 Gy/1.5 Gy BID to partial breast; 65 patients; &lt;3 cm fully excised; recurrence &gt;1 year after prior WBI (median 13 years elapsed)</Box>
        <ul style={{ color:"#475569", paddingLeft:18 }}>
          <li style={{ marginBottom:5, fontSize:14 }}>Acceptable LC and toxicity at 5 years</li>
          <li style={{ fontSize:14 }}>Grade 2 late toxicity: fibrosis (41%), breast asymmetry (35%), chest wall pain (32%)</li>
        </ul>
        <KP>Re-irradiation feasible: long interval since prior RT, small (&lt;3 cm) fully excised recurrence. 45 Gy/1.5 Gy BID is the standard re-irradiation dose.</KP>
      </TrialCard>
    </div>
  );
}

function PageSystemic() {
  return (
    <div>
      <h2>Systemic Therapy</h2>
      <h3>HR+/HER2- Adjuvant Chemotherapy</h3>
      <Tbl heads={["Menopausal Status","Node Status","Oncotype DX","Recommendation"]} rows={[
        ["Premenopausal","N0","<12","No chemo"],
        ["Premenopausal","N0","12-25","TC vs observation"],
        ["Premenopausal","N0",">=26","TC x 4"],
        ["Premenopausal","N+","Any","ddAC x 4 → weekly paclitaxel x 12"],
        ["Postmenopausal","N0","<26","No chemo"],
        ["Postmenopausal","N0",">=26","TC x 4"],
        ["Postmenopausal","N+","<26","No chemo"],
        ["Postmenopausal","N+",">=26","ddAC x 4 → weekly paclitaxel x 12"],
      ]} hi={[3,7]}/>
      <Grid2>
        <Card bg="#f0fdf4" bd="#bbf7d0">
          <div style={{ fontWeight:700, color:"#166534", marginBottom:8 }}>Triple-Negative (TNBC)</div>
          <p style={{ fontSize:12, fontWeight:600, color:"#374151" }}>Tumor &gt;2 cm OR node positive:</p>
          <ul style={{ color:"#374151", paddingLeft:16, fontSize:12 }}>
            <li style={{ marginBottom:3 }}>Neoadjuvant: Keynote-522 - carbo/paclitaxel/pembrolizumab -&gt; AC/pembrolizumab</li>
            <li style={{ marginBottom:3 }}>pCR: adjuvant pembrolizumab x 1 year</li>
            <li>Residual disease: capecitabine (after RT)</li>
          </ul>
        </Card>
        <Card bg="#eff6ff" bd="#bfdbfe">
          <div style={{ fontWeight:700, color:"#1e40af", marginBottom:8 }}>HER2-Amplified</div>
          <p style={{ fontSize:12, fontWeight:600, color:"#374151" }}>Tumor &gt;2 cm OR node positive:</p>
          <ul style={{ color:"#374151", paddingLeft:16, fontSize:12 }}>
            <li style={{ marginBottom:3 }}>Neoadjuvant: TCHP x 6</li>
            <li style={{ marginBottom:3 }}>pCR: adjuvant HP x 1 year</li>
            <li>Residual disease: T-DM1 (Kadcyla) x 14 cycles</li>
          </ul>
        </Card>
      </Grid2>
      <h3>Drug Reference</h3>
      <Tbl heads={["Abbreviation","Full Name","Class"]} rows={[
        ["ddAC","Dose-dense Doxorubicin + Cyclophosphamide","Anthracycline + Alkylating agent"],
        ["TC","Docetaxel (Taxotere) + Cyclophosphamide","Taxane + Alkylating agent"],
        ["TCH","Docetaxel + Carboplatin + Trastuzumab","Taxane + Platinum + Anti-HER2"],
        ["TCHP","Docetaxel + Carboplatin + Trastuzumab + Pertuzumab","Taxane + Platinum + Dual anti-HER2"],
        ["HP","Herceptin + Pertuzumab","Dual anti-HER2 maintenance"],
        ["T-DM1 (Kadcyla)","Ado-trastuzumab emtansine","Antibody-drug conjugate"],
        ["Pembrolizumab","Anti-PD-1 (Keytruda)","Checkpoint immunotherapy"],
        ["Capecitabine","Oral fluoropyrimidine (Xeloda)","For residual TNBC after NAC"],
      ]}/>
    </div>
  );
}

function PageAbbrevs() {
  const [q, setQ] = useState("");
  const filtered = useMemo(function(){
    if (!q) return Object.entries(ABBREVS);
    const lq = q.toLowerCase();
    return Object.entries(ABBREVS).filter(function(e){ return e[0].toLowerCase().includes(lq) || e[1].toLowerCase().includes(lq); });
  }, [q]);
  return (
    <div>
      <h2>Abbreviations Glossary</h2>
      <input type="text" placeholder="Search abbreviations..." value={q}
        onChange={function(e){ setQ(e.target.value); }}
        style={{ width:"100%", padding:"9px 14px", borderRadius:8, border:"1px solid #e2e8f0", fontSize:14, outline:"none", fontFamily:"inherit", marginBottom:16 }}/>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))", gap:8 }}>
        {filtered.map(function(entry){ return (
          <div key={entry[0]} style={{ background:"white", border:"1px solid #e2e8f0", borderRadius:8, padding:"9px 13px", display:"flex", gap:11 }}>
            <span style={{ fontFamily:"monospace", fontSize:12, fontWeight:700, color:"#0f2744", minWidth:68, flexShrink:0 }}>{entry[0]}</span>
            <span style={{ fontSize:12, color:"#475569", lineHeight:1.5 }}>{entry[1]}</span>
          </div>
        ); })}
      </div>
      {filtered.length === 0 && <p style={{ color:"#94a3b8", textAlign:"center", padding:40 }}>No results for "{q}"</p>}
    </div>
  );
}

// ── ROUTER ────────────────────────────────────────────────────────────────────
function Page({ id, nav }) {
  switch(id) {
    case "home":             return <PageHome nav={nav}/>;
    case "field-design":     return <PageFieldDesign/>;
    case "plan-review":      return <PagePlanReview/>;
    case "bolus":            return <PageBolus/>;
    case "imrt":             return <PageImrt/>;
    case "prone":            return <PageProneDibh/>;
    case "imaging":          return <PageImaging/>;
    case "dcis":
    case "dcis-overview":    return <PageDcisOverview/>;
    case "dcis-trials":      return <PageDcisTrials/>;
    case "dcis-boost":       return <PageDcisBoost/>;
    case "dcis-systemic":    return <PageDcisSystemic/>;
    case "omission":
    case "omit-overview":    return <PageOmitOverview/>;
    case "omit-trials":      return <PageOmitTrials/>;
    case "omit-genomic":     return <PageOmitGenomic/>;
    case "fx":
    case "fx-hypo":          return <PageFxHypo/>;
    case "fx-ultra":         return <PageFxUltra/>;
    case "fx-import":        return <PageFxImport/>;
    case "apbi":
    case "apbi-overview":    return <PageApbiOverview/>;
    case "apbi-trials":      return <PageApbiTrials/>;
    case "boost":            return <PageBoost/>;
    case "multicentric":     return <PageMulticentric/>;
    case "axilla":
    case "axilla-anatomy":   return <PageAxillaAnatomy/>;
    case "z0011":            return <PageZ0011/>;
    case "sound-senomac":    return <PageSoundSenomac/>;
    case "ibcsg":            return <PageIbcsg/>;
    case "slnb-nac":         return <PageSlnbNac/>;
    case "rni":
    case "rni-trials":       return <PageRniTrials/>;
    case "contouring":       return <PageContouring/>;
    case "technique":        return <PageTechnique/>;
    case "pmrt":
    case "pmrt-indications": return <PagePmrtIndications/>;
    case "pmrt-trials":      return <PagePmrtTrials/>;
    case "pmrt-supremo":     return <PagePmrtSupremo/>;
    case "imn":
    case "imn-anatomy":      return <PageImnAnatomy/>;
    case "imn-trials":       return <PageImnTrials/>;
    case "nac":
    case "nac-indications":  return <PageNacIndications/>;
    case "b51":              return <PageB51/>;
    case "lrr":              return <PageLrr/>;
    case "systemic":         return <PageSystemic/>;
    case "abbrevs":          return <PageAbbrevs/>;
    default:                 return <PageHome nav={nav}/>;
  }
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [active, setActive] = useState("home");
  const [expanded, setExpanded] = useState({ technical: true });
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const contentRef = useRef(null);

  function navigateTo(id) {
    setActive(id);
    NAV.forEach(function(s) {
      if (s.subs && s.subs.find(function(sub){ return sub.id === id; })) {
        setExpanded(function(p){ return Object.assign({}, p, { [s.id]: true }); });
      }
    });
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }

  const filtered = useMemo(function() {
    if (!search) return NAV;
    const lq = search.toLowerCase();
    return NAV.filter(function(s) {
      return s.label.toLowerCase().includes(lq) || (s.subs && s.subs.some(function(sub){ return sub.label.toLowerCase().includes(lq); }));
    });
  }, [search]);

  const activeLabel = (function() {
    for (var i = 0; i < NAV.length; i++) {
      if (NAV[i].id === active) return NAV[i].label;
      if (NAV[i].subs) {
        for (var j = 0; j < NAV[i].subs.length; j++) {
          if (NAV[i].subs[j].id === active) return NAV[i].subs[j].label;
        }
      }
    }
    return "";
  })();

  const SB_W = 265;
  return (
    <div style={{ display:"flex", height:"100vh", fontFamily:"'Inter','Segoe UI',sans-serif", background:"#f1f5f9", overflow:"hidden" }}>
      {/* Sidebar */}
      <div style={{ width: sidebarOpen ? SB_W : 0, minWidth: sidebarOpen ? SB_W : 0, background:"#0f2744", display:"flex", flexDirection:"column", overflow:"hidden", transition:"width 0.25s,min-width 0.25s", flexShrink:0 }}>
        <div style={{ padding:"18px 16px 12px", borderBottom:"1px solid rgba(255,255,255,0.1)", flexShrink:0 }}>
          <div style={{ fontFamily:"Georgia,serif", color:"white", fontSize:16, lineHeight:1.3, marginBottom:3 }}>Breast Rad Onc</div>
          <div style={{ color:"rgba(255,255,255,0.45)", fontSize:10, letterSpacing:"0.12em", textTransform:"uppercase" }}>Resident Guide 2025</div>
        </div>
        <div style={{ padding:"8px 12px", borderBottom:"1px solid rgba(255,255,255,0.08)", flexShrink:0 }}>
          <input type="text" placeholder="Search topics..." value={search}
            onChange={function(e){ setSearch(e.target.value); }}
            style={{ width:"100%", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:7, padding:"6px 10px", color:"white", fontSize:12, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }}/>
        </div>
        <div style={{ overflowY:"auto", flex:1, padding:"6px 8px 16px" }}>
          {filtered.map(function(s) {
            const isActive = active === s.id;
            const isExp = expanded[s.id];
            return (
              <div key={s.id}>
                <div
                  onClick={function(){ if (s.subs && s.subs.length > 0) { setExpanded(function(p){ return Object.assign({}, p, { [s.id]: !p[s.id] }); }); } else { navigateTo(s.id); } }}
                  style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 9px", cursor:"pointer", borderRadius:7, marginBottom:1, color: isActive ? "white" : "rgba(255,255,255,0.65)", fontWeight: isActive ? 600 : 400, fontSize:12.5, background: isActive ? "rgba(255,255,255,0.13)" : "transparent", userSelect:"none" }}>
                  <span style={{ fontSize:11, opacity:0.6 }}>{s.icon}</span>
                  <span style={{ flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.label}</span>
                  {s.subs && s.subs.length > 0 && <span style={{ fontSize:9, opacity:0.4, transform: isExp ? "rotate(90deg)" : "none", transition:"transform 0.2s" }}>{">"}</span>}
                </div>
                {isExp && s.subs && s.subs.map(function(sub) {
                  const subActive = active === sub.id;
                  return (
                    <div key={sub.id}
                      onClick={function(){ navigateTo(sub.id); }}
                      style={{ padding:"5px 9px 5px 36px", cursor:"pointer", borderRadius:6, fontSize:12, color: subActive ? "white" : "rgba(255,255,255,0.48)", background: subActive ? "rgba(255,255,255,0.11)" : "transparent", marginBottom:1, fontWeight: subActive ? 500 : 400 }}>
                      {sub.label}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div style={{ background:"white", borderBottom:"1px solid #e2e8f0", padding:"0 22px", display:"flex", alignItems:"center", gap:12, height:50, flexShrink:0 }}>
          <button
            onClick={function(){ setSidebarOpen(!sidebarOpen); }}
            style={{ background:"none", border:"1px solid #e2e8f0", color:"#64748b", cursor:"pointer", padding:"5px 10px", borderRadius:6, fontSize:13 }}>
            {sidebarOpen ? "<" : ">"}
          </button>
          <div style={{ fontSize:12, color:"#94a3b8", display:"flex", alignItems:"center", gap:6 }}>
            <span>Breast Rad Onc</span>
            <span style={{ opacity:0.5 }}>&rsaquo;</span>
            <span style={{ color:"#0f2744", fontWeight:600 }}>{activeLabel}</span>
          </div>
        </div>
        <div ref={contentRef} style={{ flex:1, overflowY:"auto", padding:"30px 38px", background:"#f8fafc" }}>
          <style>{`
            h2 { font-family: Georgia, serif; font-size: 25px; color: #0f172a; margin: 0 0 18px 0; font-weight: 700; }
            h3 { font-size: 11px; font-weight: 700; color: #0f2744; text-transform: uppercase; letter-spacing: 0.09em; margin: 22px 0 9px; border-left: 3px solid #0f2744; padding-left: 9px; }
            h4 { font-size: 13px; font-weight: 600; color: #374151; margin: 13px 0 7px; }
            p { color: #475569; line-height: 1.7; margin-bottom: 11px; font-size: 14px; }
            ul, ol { color: #475569; line-height: 1.7; }
            li { font-size: 14px; }
            strong { color: #1e293b; }
            a:hover { text-decoration: underline; }
          `}</style>
          <Page id={active} nav={navigateTo}/>
        </div>
      </div>
      <Analytics />
    </div>
  );
}

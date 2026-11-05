"use client";

import { useState } from "react";
import { ArrowRight, ArrowUpRight, BatteryCharging, FlaskConical, RefreshCw, Sparkles } from "lucide-react";
import "./study-lab.css";

type Props = { subjectId: string; onAsk: (prompt: string) => void };

function LabHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return <div className="sl-header"><div><div className="sl-eyebrow"><FlaskConical size={13} /> INTERACTIVE LAB</div><h3>{title}</h3><p>{subtitle}</p></div><span className="sl-live"><i /> 可交互</span></div>;
}

function AskButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return <button className="sl-ask" onClick={onClick}><Sparkles size={14} />{children}<ArrowUpRight size={14} /></button>;
}

function Source({ href, label }: { href: string; label: string }) {
  return <a className="sl-source" href={href} target="_blank" rel="noreferrer">模型依据：{label} <ArrowUpRight size={11} /></a>;
}

function PhysicsLab({ onAsk }: Pick<Props, "onAsk">) {
  const [mode, setMode] = useState<"connected" | "isolated">("connected");
  const [distance, setDistance] = useState(4);
  const [voltage, setVoltage] = useState(12);
  const capacitance = 88.54 / distance;
  const initialC = 88.54 / 4;
  const charge = (mode === "connected" ? capacitance : initialC) * voltage / 1000;
  const potential = mode === "connected" ? voltage : charge * 1000 / capacitance;
  const energy = 0.5 * capacitance * potential * potential / 1000;
  const gap = 35 + distance * 10;
  const left = 260 - gap / 2;
  const right = 260 + gap / 2;
  return <section className="study-lab">
    <LabHeader title="拉开极板，什么会改变？" subtitle="Parallel-plate capacitor · 先预测，再拖动验证" />
    <div className="sl-switch" role="group" aria-label="电容器连接状态">
      <button aria-pressed={mode === "connected"} className={mode === "connected" ? "is-active" : ""} onClick={() => setMode("connected")}><BatteryCharging size={14} />电池连接 · 固定 V</button>
      <button aria-pressed={mode === "isolated"} className={mode === "isolated" ? "is-active" : ""} onClick={() => setMode("isolated")}>电池断开 · 固定 Q</button>
    </div>
    <div className="sl-physics-stage">
      <svg viewBox="0 0 520 220" role="img" aria-label={`电容器极板相距${distance}毫米，电势差${potential.toFixed(1)}伏，电场由正极板指向负极板`}>
        <defs><marker id="sl-field-arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5" fill="#2b8b7b" /></marker><pattern id="sl-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".7" fill="#d8e4df" /></pattern></defs>
        <rect width="520" height="220" fill="url(#sl-grid)" />
        <path d={`M ${left} 70 V 28 H 85 V 185 H ${left} V 150 M ${right} 70 V 28 H 435 V 185 H ${right} V 150`} fill="none" stroke={mode === "connected" ? "#b6c4bd" : "#d4d9d5"} strokeWidth="2" strokeDasharray={mode === "isolated" ? "5 5" : undefined} />
        {mode === "connected" ? <g><rect x="70" y="92" width="30" height="36" rx="6" fill="#f8f7ef" /><path d="M 77 103 H 93 M 85 95 V 111 M 79 120 H 91" stroke="#66766c" strokeWidth="2" /><text x="85" y="147" textAnchor="middle" fontSize="11" fill="#738078">{voltage} V</text></g> : <g><circle cx="85" cy="109" r="16" fill="#f8f7ef" /><path d="M 85 94 V 103 M 85 116 V 126 M 85 103 L 100 91" stroke="#9baa9f" strokeWidth="2" /><text x="85" y="147" textAnchor="middle" fontSize="11" fill="#738078">open</text></g>}
        <rect x={left - 6} y="57" width="12" height="111" rx="5" fill="#d1a26c" /><rect x={right - 6} y="57" width="12" height="111" rx="5" fill="#41687a" />
        {[76, 99, 122, 145].map((y) => <g key={y}><text x={left - 23} y={y + 4} textAnchor="middle" fontSize="16" fill="#ad7e42">+</text><text x={right + 23} y={y + 4} textAnchor="middle" fontSize="18" fill="#41687a">−</text><line x1={left + 17} x2={right - 17} y1={y} y2={y} stroke="#2b8b7b" strokeWidth={Math.min(3, 0.8 + potential / distance / 6)} opacity=".7" markerEnd="url(#sl-field-arrow)" /></g>)}
        <path d={`M ${left} 185 V 194 M ${right} 185 V 194 M ${left} 190 H ${right}`} fill="none" stroke="#8b9990" />
        <text x="260" y="211" textAnchor="middle" fontSize="12" fill="#75847a">d = {distance.toFixed(1)} mm</text>
        <text x="260" y="40" textAnchor="middle" fontSize="11" fill="#2c7c6d">E = {(potential / distance).toFixed(2)} kV/m</text>
      </svg>
      <span className="sl-stage-note">面积 A = 0.010 m² · 空气 / 真空 · 忽略边缘效应</span>
    </div>
    <div className="sl-range"><label htmlFor="sl-distance">极板间距 <span>{distance.toFixed(1)} mm</span></label><input id="sl-distance" type="range" min="1" max="10" step="0.1" value={distance} onChange={(e) => setDistance(Number(e.target.value))} /><div className="sl-range-ends"><span>1 mm</span><span>10 mm</span></div></div>
    <div className="sl-metrics" aria-live="polite">{[["Capacitance", "C", capacitance.toFixed(2), "pF"], ["Charge", "Q", charge.toFixed(3), "nC"], ["Potential", "ΔV", potential.toFixed(1), "V"], ["Energy", "U", energy.toFixed(3), "nJ"]].map(([name, letter, value, unit]) => <div key={letter}><span>{letter} <small>{name}</small></span><strong>{value}<em>{unit}</em></strong></div>)}</div>
    <details className="sl-details"><summary>改变初始电压 / 查看模型</summary><div className="sl-range"><label htmlFor="sl-voltage">初始电压 <span>{voltage} V</span></label><input id="sl-voltage" type="range" min="2" max="24" step="1" value={voltage} onChange={(e) => setVoltage(Number(e.target.value))} /></div><p>C = ε₀A/d，Q = CΔV，U = ½C(ΔV)²。断开模式在 d₀ = 4 mm 时充至初始电压，此后 Q 保持不变。改变初始电压会重新定义该初态。</p></details>
    <div className="sl-insight"><span>观察重点</span><p>{mode === "connected" ? "间距增大时 C 减小；电池保持电压不变，Q 和 U 随之减小。" : "间距增大时 C 减小；电荷无处流走，电压与储能增大。外力拉开极板做功。"}</p></div>
    <AskButton onClick={() => onAsk(`用 AP Physics C E&M 的概念和公式追问我：平行板电容器${mode === "connected" ? "连接电池、固定电压" : "断开电池、固定电荷"}，从初始 4 mm、${voltage} V 改为 ${distance} mm。请先让我预测 C、Q、V、U 和 E 的变化，再逐步诊断推理，不要直接给答案。`)}>让助理追问这个实验</AskButton>
    <Source href="https://apcentral.collegeboard.org/media/pdf/ap-physics-c-electricity-and-magnetism-course-and-exam-description.pdf" label="College Board · Physics C: E&M CED" />
  </section>;
}

type Interval = { mean: number; lower: number; upper: number };
function StatsLab({ onAsk }: Pick<Props, "onAsk">) {
  const [n, setN] = useState(30);
  const [confidence, setConfidence] = useState(95);
  const [intervals, setIntervals] = useState<Interval[]>([]);
  const mu = 70, sigma = 12;
  const z = confidence === 90 ? 1.64485 : confidence === 99 ? 2.57583 : 1.95996;
  const se = sigma / Math.sqrt(n), margin = z * se;
  const x = (value: number) => 35 + (value - 50) * 11.25;
  const curve = Array.from({ length: 121 }, (_, i) => { const value = 50 + i / 3; return `${i ? "L" : "M"} ${x(value)} ${100 - 70 * Math.exp(-0.5 * ((value - mu) / se) ** 2)}`; }).join(" ");
  const sample = (count: number) => setIntervals((current) => [...current, ...Array.from({ length: count }, () => { const mean = mu + se * Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random()); return { mean, lower: mean - margin, upper: mean + margin }; })].slice(-200));
  const covered = intervals.filter((interval) => interval.lower <= mu && interval.upper >= mu).length;
  const latest = intervals.at(-1);
  return <section className="study-lab">
    <LabHeader title="95% 的信心，究竟属于谁？" subtitle="Sampling & confidence intervals · 重复抽样，看见长期覆盖率" />
    <div className="sl-control-row"><div className="sl-range"><label htmlFor="sl-n">样本量 n <span>{n}</span></label><input id="sl-n" type="range" min="5" max="100" step="5" value={n} onChange={(e) => { setN(Number(e.target.value)); setIntervals([]); }} /></div><label className="sl-select-label">置信水平<select value={confidence} onChange={(e) => { setConfidence(Number(e.target.value)); setIntervals([]); }}><option value="90">90%</option><option value="95">95%</option><option value="99">99%</option></select></label></div>
    <div className="sl-stats-stage"><div className="sl-chart-caption"><span>样本均值的抽样分布</span><span>μ = 70 · σ = 12 · 正态总体</span></div><svg viewBox="0 0 520 140" role="img" aria-label={`样本均值呈以70为中心、标准误${se.toFixed(2)}的正态分布`}><path d={`${curve} L485 100 L35 100 Z`} fill="#e0eee6" /><path d={curve} fill="none" stroke="#3c8a74" strokeWidth="2.5" /><path d="M35 100 H485" stroke="#cdd7d0" /><path d="M260 23 V105" stroke="#bc8b59" strokeDasharray="4 4" />{[50, 60, 70, 80, 90].map((value) => <text key={value} x={x(value)} y="121" textAnchor="middle" fontSize="11" fill="#7d897f">{value}</text>)}{latest && <circle cx={x(latest.mean)} cy="100" r="5" fill="#244f60" stroke="#fff" strokeWidth="2" />}</svg>
      <div className="sl-chart-caption"><span>最近 {Math.min(intervals.length, 16)} 个置信区间</span><span><i className="sl-dot green" />覆盖 μ <i className="sl-dot orange" />未覆盖</span></div>
      <svg viewBox="0 0 520 188" role="img" aria-label={`${intervals.length}次重复抽样，${covered}个区间覆盖真实均值70`}><path d="M260 5 V174" stroke="#bc8b59" strokeDasharray="4 4" />{!intervals.length && <text x="260" y="90" textAnchor="middle" fill="#859188" fontSize="13">点击「抽样」生成你的第一个区间</text>}{intervals.slice(-16).map((interval, i) => <g key={`${interval.mean}-${i}`} stroke={interval.lower <= mu && interval.upper >= mu ? "#4d967f" : "#c77852"}><line x1={x(interval.lower)} x2={x(interval.upper)} y1={14 + i * 10} y2={14 + i * 10} strokeWidth="2" /><circle cx={x(interval.mean)} cy={14 + i * 10} r="2.5" fill="currentColor" style={{ color: interval.lower <= mu && interval.upper >= mu ? "#4d967f" : "#c77852" }} /></g>)}<text x="260" y="186" textAnchor="middle" fontSize="11" fill="#9a7853">真实均值 μ = 70</text></svg>
    </div>
    <div className="sl-button-row"><button className="sl-primary" onClick={() => sample(1)}>抽样 1 次 <ArrowRight size={14} /></button><button className="sl-secondary" onClick={() => sample(20)}>重复 20 次</button><button className="sl-icon-button" aria-label="清除抽样结果" onClick={() => setIntervals([])}><RefreshCw size={14} /></button></div>
    <div className="sl-metrics three" aria-live="polite"><div><span>Standard error</span><strong>{se.toFixed(2)}</strong></div><div><span>Margin of error</span><strong>±{margin.toFixed(2)}</strong></div><div><span>模拟覆盖 · 最近至多 200 次</span><strong>{intervals.length ? `${covered}/${intervals.length}` : "—"}</strong></div></div>
    <div className="sl-insight"><span>别落入这个陷阱</span><p>{confidence}% 描述这种方法长期生成的区间中，约有 {confidence}% 会覆盖固定的 μ；不是说已算出的区间有 {confidence}% 的概率包含 μ。</p></div>
    <p className="sl-footnote">教学模型：已知总体 σ，使用 x̄ ± z*σ/√n。更改参数会重置抽样；模拟比例会波动。未知 σ 的均值推断通常使用 t 区间。</p>
    <AskButton onClick={() => onAsk(`根据我的 AP Statistics 模拟设置 n=${n}、置信水平 ${confidence}%、已知 σ=12，给我一道有关区间宽度和置信水平解释的 FRQ 小题。先让我作答，再纠正概率解释与条件检查。`)}>用这个模型练一道 FRQ</AskButton>
    <Source href="https://itl.nist.gov/div898/handbook/prc/section1/prc14.htm" label="NIST · Confidence intervals" />
  </section>;
}

const historyEvents = [
  { id: "trade", date: "c. 1200–1450", title: "印度洋贸易", english: "Indian Ocean exchange", causes: ["季风知识与航海技术", "港口城市与商人网络"], effects: ["商品、宗教与知识传播", "港口繁荣及文化融合"], mechanism: "航海知识降低远距离交易的不确定性，港口与商人社群再加强联系。", connection: "联系 Geography × Economics：环境既限制交流，也能被知识转化为交通条件。", question: "比较印度洋与丝绸之路：运输方式如何改变交易商品与交流规模？" },
  { id: "ocean", date: "c. 1450–1750", title: "跨大洋连接", english: "Transoceanic connections", causes: ["国家竞争与贸易动机", "航海技术与既有知识"], effects: ["哥伦布大交换", "殖民与强制劳动扩张"], mechanism: "国家与商人推动航路扩张；持续接触使生物、人口和劳动制度跨洋流动。", connection: "联系 Environment × Power：同一连接促进作物传播，也伴随疾病、征服与强迫迁移。", question: "为什么哥伦布大交换的影响在不同地区不对称？请区分原因、机制与结果。" },
  { id: "industry", date: "c. 1750–1900", title: "工业化", english: "Industrialization", causes: ["能源、资本与市场", "农业变化与技术创新"], effects: ["城市化与劳动变化", "资源需求与帝国扩张"], mechanism: "机械化与化石燃料提高产能，改变劳动组织；原料和市场需求与国家竞争共同推动扩张。", connection: "联系 Technology × Society × Empire：生产方式的变化，同时重塑工厂、城市与全球权力。", question: "评估工业化对 1750–1900 年帝国扩张的相对重要性。还需哪些政治或文化原因？" },
  { id: "empire", date: "c. 1750–1900", title: "帝国扩张与抵抗", english: "Imperialism & resistance", causes: ["工业经济与国家竞争", "种族观念与文明使命论"], effects: ["殖民经济与迁移变化", "抵抗、改革与民族主义"], mechanism: "经济利益和政治竞争借助意识形态获得正当化；被殖民群体通过多种方式回应统治。", connection: "联系 Ideology × Power：区分行为者的辩护、结构性动因与实际后果。", question: "比较两个地区对帝国主义的回应，解释为何抵抗与改革会采取不同形式。" },
];

function WorldLab({ onAsk }: Pick<Props, "onAsk">) {
  const [selected, setSelected] = useState("industry");
  const event = historyEvents.find((item) => item.id === selected)!;
  return <section className="study-lab"><LabHeader title="历史不是一串孤立的年份" subtitle="Cause → mechanism → consequence · 点选时间轴，展开因果链" />
    <div className="sl-timeline" role="group" aria-label="选择历史主题">{historyEvents.map((item) => <button key={item.id} className={selected === item.id ? "is-active" : ""} aria-pressed={selected === item.id} onClick={() => setSelected(item.id)}><span>{item.date}</span><i /><strong>{item.title}</strong></button>)}</div>
    <div className="sl-causal-map"><div className="sl-map-heading"><span>CAUSES / 多重原因</span><span>CONSEQUENCES / 后果</span></div><svg viewBox="0 0 520 255" role="img" aria-label={`${event.causes.join('、')}促成${event.title}，继而影响${event.effects.join('、')}`}><defs><marker id="sl-history-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6" fill="#91ad9c" /></marker></defs><path d="M155 68 C185 68 180 127 211 127 M155 188 C185 188 180 127 211 127 M310 127 C342 127 335 68 365 68 M310 127 C342 127 335 188 365 188" fill="none" stroke="#91ad9c" strokeWidth="1.7" markerEnd="url(#sl-history-arrow)" />{[...event.causes, ...event.effects].map((text, i) => { const left = i < 2; const y = i % 2 === 0 ? 42 : 162; return <g key={text}><rect x={left ? 7 : 365} y={y} width="148" height="52" rx="9" fill={left ? "#f5f1e7" : "#eaf0e8"} stroke={left ? "#e3d8c6" : "#d2dfd1"} /><text x={left ? 81 : 439} y={y + 30} textAnchor="middle" fontSize="11" fill="#536354">{text}</text></g>; })}<rect x="211" y="92" width="99" height="71" rx="14" fill="#294f4a" /><text x="260" y="122" textAnchor="middle" fontSize="13" fill="white">{event.title.length > 6 ? "帝国扩张" : event.title}</text><text x="260" y="143" textAnchor="middle" fontSize="9" fill="#b4cec4">{event.title.length > 6 ? "与抵抗" : "历史过程"}</text><text x="260" y="245" textAnchor="middle" fontSize="10" fill="#8c9a8d">箭头表示可论证的关联，不表示唯一原因</text></svg></div>
    <div className="sl-insight"><span>解释中间那一步 · MECHANISM</span><p>{event.mechanism}</p></div><div className="sl-crosslink">↗ {event.connection}</div><AskButton onClick={() => onAsk(`AP World History 练习：${event.question} 请先让我提出一个可辩护的 thesis，再检查具体史实、因果机制和复杂性。当前图为教学示例，不应被当作完整历史解释。`)}>把这条关联写成 LEQ 论证</AskButton><Source href="https://apcentral.collegeboard.org/media/pdf/ap-world-history-modern-course-and-exam-description.pdf" label="College Board · World History CED" /></section>;
}

const argumentParts = [
  { key: "claim", label: "Claim 主张", text: "Schools should keep their libraries open for an hour after the final bell. ", note: "主张提出具体、可争辩的行动。它既说明由谁行动，也明确行动的范围。", prompt: "我的主张是否足够具体，又能让读者提出合理异议？" },
  { key: "evidence", label: "Example 例证", text: "Imagine a student who shares a crowded bedroom and has no quiet place to read at home. ", note: "这是一个假设性例子，用来让问题具体化，并非调查数据。若任务需要外部证据，应再加入可核实的材料。", prompt: "这个假设性例子可以支持什么、不能证明什么？我该补充哪类真实证据？" },
  { key: "reasoning", label: "Commentary 推理", text: "For that student, access to a desk and a quiet room makes sustained study possible; the same assignment becomes more achievable when its conditions change. ", note: "Commentary 解释例子如何支持主张：学习条件影响完成任务的可能性。它补上从例子到政策的逻辑桥梁。", prompt: "我该如何把例证和主张之间的逻辑说清楚，而不重复例证？" },
  { key: "audience", label: "Audience 受众", text: "If school leaders expect equal effort, they should also consider unequal access to the space that effort requires.", note: "结尾面对 school leaders，诉诸他们对公平和努力的重视。条件句与 equal / unequal 的对照增强了政策诉求。", prompt: "这句话如何利用受众的价值观？换成家长作为受众，措辞应该怎样变化？" },
];

function ELCLab({ onAsk }: Pick<Props, "onAsk">) {
  const [selected, setSelected] = useState("reasoning");
  const part = argumentParts.find((item) => item.key === selected)!;
  return <section className="study-lab"><LabHeader title="拆开一个有说服力的段落" subtitle="Argument anatomy · 点击句子，看证据与推理怎样协作" /><div className="sl-argument-tags" role="group" aria-label="选择论证要素">{argumentParts.map((item) => <button key={item.key} onClick={() => setSelected(item.key)} aria-pressed={selected === item.key} className={selected === item.key ? "is-active" : ""}>{item.label}</button>)}</div><div className="sl-passage"><span className="sl-passage-label">ORIGINAL PRACTICE PASSAGE / 原创练习文本</span><p>{argumentParts.map((item) => <button key={item.key} onClick={() => setSelected(item.key)} className={selected === item.key ? `is-active ${item.key}` : ""} aria-pressed={selected === item.key} aria-label={`分析 ${item.label}`}>{item.text}</button>)}</p></div><div className="sl-argument-chain"><span>Claim</span><ArrowRight size={14} /><span>Example</span><ArrowRight size={14} /><span className="is-active">Commentary</span><ArrowRight size={14} /><span>Audience</span></div><div className="sl-insight"><span>{part.label}</span><p>{part.note}</p></div><p className="sl-footnote">这些要素可能在同一句中重叠。这里的标注是一种分析方式，不是官方评分或唯一解读。</p><AskButton onClick={() => onAsk(`请做我的 AP English Language & Composition 写作教练。原创段落：${argumentParts.map((item) => item.text).join("")} 我当前关注 ${part.label}。${part.prompt} 先提一个问题让我思考，再给简明反馈；不要声称给出官方评分。`)}>继续分析这处写作选择</AskButton></section>;
}

const stages = [
  { id: "before", label: "01 学习前", english: "Before conditioning", explanation: "中性刺激（NS）尚未与无条件刺激建立联系。目标反应由 US 自然引发。", expected: "none" },
  { id: "acquisition", label: "02 建立联系", english: "Acquisition", explanation: "反复配对 NS 与 US；随着学习形成，原先的 NS 成为 CS。US 引发的反应仍称 UR。", expected: "pair" },
  { id: "after", label: "03 学习后", english: "After conditioning", explanation: "假设已成功习得：仅呈现 CS，也能引发学到的条件反应 CR。", expected: "learned" },
  { id: "extinction", label: "04 消退", english: "Extinction", explanation: "反复呈现 CS 而不跟随 US，CR 通常逐渐减弱。消退不等于原有学习被永久擦除。", expected: "weaken" },
];
function PsychLab({ onAsk }: Pick<Props, "onAsk">) {
  const [stageId, setStageId] = useState("before");
  const [stimulus, setStimulus] = useState("铃声");
  const [us, setUs] = useState("食物");
  const [response, setResponse] = useState("唾液分泌");
  const [prediction, setPrediction] = useState("");
  const stage = stages.find((item) => item.id === stageId)!;
  const options = [{ id: "none", text: "单独的 NS 不引发目标反应" }, { id: "pair", text: "NS + US，出现 UR" }, { id: "learned", text: "仅 CS 也可引发 CR" }, { id: "weaken", text: "反复仅 CS，CR 逐渐减弱" }];
  return <section className="study-lab"><LabHeader title="反应是怎样被学会的？" subtitle="Classical conditioning · 改写刺激，预测每个学习阶段" /><div className="sl-psych-inputs"><label>最初中性的刺激<input value={stimulus} maxLength={22} onChange={(e) => setStimulus(e.target.value)} placeholder="例如：铃声" /></label><label>无条件刺激 US<input value={us} maxLength={22} onChange={(e) => setUs(e.target.value)} placeholder="例如：食物" /></label><label>目标反应<input value={response} maxLength={22} onChange={(e) => setResponse(e.target.value)} placeholder="例如：唾液分泌" /></label></div><div className="sl-stage-tabs" role="group" aria-label="条件作用阶段">{stages.map((item) => <button key={item.id} className={stage.id === item.id ? "is-active" : ""} aria-pressed={stage.id === item.id} onClick={() => { setStageId(item.id); setPrediction(""); }}>{item.label}</button>)}</div><div className="sl-conditioning"><span className="sl-passage-label">{stage.english}</span><div className="sl-conditioning-flow"><div><span>{stage.id === "before" ? "NS" : stage.id === "acquisition" ? "NS → CS" : "CS"}</span><strong>{stimulus || "中性刺激"}</strong>{stage.id === "acquisition" && <small>+ {us || "US"}</small>}</div><ArrowRight size={24} /><div className="sl-response"><span>{stage.id === "before" ? "尚未学到" : stage.id === "acquisition" ? "UR" : "CR"}</span><strong>{stage.id === "before" ? "不引发目标反应" : stage.id === "extinction" ? `${response || "反应"}减弱` : response || "目标反应"}</strong></div></div>{stage.id === "before" && <p className="sl-footnote">与此同时：{us || "US"}（US）→ {response || "目标反应"}（UR）</p>}<p>{stage.explanation}</p></div><fieldset className="sl-prediction"><legend>这个阶段的关系应怎样描述？</legend><div>{options.map((option) => <button key={option.id} className={prediction === option.id ? "is-selected" : ""} aria-pressed={prediction === option.id} onClick={() => setPrediction(option.id)}>{option.text}</button>)}</div>{prediction && <p role="status" className={prediction === stage.expected ? "sl-correct" : "sl-reconsider"}>{prediction === stage.expected ? "✓ 关系正确。试着解释：同一反应为什么会有 UR / CR 两种名称？" : "再比较一下阶段：是否已经建立联系？刺激是否仍和 US 配对？"}</p>}</fieldset><p className="sl-footnote">默认例子基于经典条件作用。替换时，请确保 US 确实能自然引发该反应，且 NS 起初不会引发目标反应；填入文字不会自动证明这两点。</p><AskButton onClick={() => onAsk(`帮我检查一个 AP Psychology 经典条件作用例子：最初的中性刺激是「${stimulus}」，US 是「${us}」，目标反应是「${response}」，阶段是 ${stage.english}。请检查刺激和反应的定义是否合理，再给我一个迁移情境，先让我识别 NS/US/UR/CS/CR。`)}>检查我的例子并做迁移练习</AskButton><Source href="https://apcentral.collegeboard.org/media/pdf/ap-psychology-course-and-exam-description.pdf" label="College Board · Psychology CED" /></section>;
}

function ResearchLab({ onAsk }: Pick<Props, "onAsk">) {
  const [question, setQuestion] = useState("课前手机使用时长与高中生课堂注意力有何关联？");
  const [population, setPopulation] = useState("本校自愿参与的 10–12 年级学生");
  const [design, setDesign] = useState("observational");
  const [measure, setMeasure] = useState("手机使用时长自报；经许可的注意力量表");
  const [focus, setFocus] = useState(0);
  const designs = { observational: { name: "观察性 / Correlational", claim: "可讨论关联；不能仅据此宣称因果。", check: "考虑睡眠、压力与课程难度等混杂变量；便利样本会限制推广范围。" }, experiment: { name: "实验 / Experimental", claim: "随机分配、对照与实施质量将影响因果解释。", check: "先确认操纵是否可行与合乎伦理，再说明随机分配、控制条件和替代解释。" }, qualitative: { name: "定性 / Qualitative", claim: "解释参与者经验与情境，不直接估计总体因果效应。", check: "说明目的性抽样、访谈 / 编码方法、研究者反思与解释的证据链。" } };
  const chosen = designs[design as keyof typeof designs];
  const nodes = [{ label: "Research question", title: "研究问题", detail: question || "先写下一个可研究的问题", check: "范围是否明确？现有研究依据是什么？这里不预设已经找到研究空白。" }, { label: "Sample & access", title: "人群与招募", detail: population || "明确目标人群与可接触样本", check: "谁会被纳入或排除？如何获得同意、保护隐私？未成年人参与需按学校流程审查。" }, { label: "Design & evidence", title: "方法与测量", detail: measure || "定义你的变量或分析材料", check: chosen.check }, { label: "Bounded claim", title: "结论边界", detail: chosen.claim, check: "结论必须由实际取得的数据支持。研究完成前，应把预期结果写成待检验的假设。" }];
  return <section className="study-lab"><LabHeader title="让问题、方法与证据对齐" subtitle="Research alignment · 在收集数据前，先检查你的推理链" /><div className="sl-research-form"><label>你的研究问题 RQ<textarea value={question} rows={2} onChange={(e) => setQuestion(e.target.value)} maxLength={800} /></label><div className="sl-form-grid"><label>目标人群与招募<input value={population} onChange={(e) => setPopulation(e.target.value)} maxLength={400} /></label><label>研究设计<select value={design} onChange={(e) => setDesign(e.target.value)}>{Object.entries(designs).map(([key, value]) => <option value={key} key={key}>{value.name}</option>)}</select></label></div><label>变量、测量或分析材料<input value={measure} onChange={(e) => setMeasure(e.target.value)} maxLength={500} /></label></div><div className="sl-research-chain" aria-label="研究对齐检查链">{nodes.map((node, i) => <button key={node.label} className={focus === i ? "is-active" : ""} onClick={() => setFocus(i)} aria-pressed={focus === i}><span>0{i + 1}</span><strong>{node.title}</strong><small>{node.label}</small>{i < nodes.length - 1 && <ArrowRight size={13} />}</button>)}</div><div className="sl-insight"><span>{nodes[focus].title}</span><p className="sl-research-value">{nodes[focus].detail}</p><p>{nodes[focus].check}</p></div><p className="sl-footnote">这是设计检查框架。研究空白、量表授权、学校伦理审查及具体文献仍需核实；选择设计不会自动使研究有效。</p><AskButton onClick={() => onAsk(`请作为我的 AP Research 项目审查与准备助理，审查以下草案：\n研究问题：${question}\n目标人群与招募：${population}\n设计：${chosen.name}\n变量/测量/材料：${measure}\n请检查问题-方法-证据-结论是否对齐，指出混杂、抽样、可行性、伦理与测量问题，区分已有证据与待核实事项。不要虚构文献或研究空白；先问一个最关键的澄清问题，再帮我准备答辩。`)}>带着这份草案进入项目审查</AskButton></section>;
}

export default function StudyLab({ subjectId, onAsk }: Props) {
  const subject = subjectId.toLowerCase();
  if (["physics", "physics-c", "em"].includes(subject)) return <PhysicsLab onAsk={onAsk} />;
  if (["stats", "statistics"].includes(subject)) return <StatsLab onAsk={onAsk} />;
  if (["world", "world-history", "history"].includes(subject)) return <WorldLab onAsk={onAsk} />;
  if (["psych", "psychology", "psycho"].includes(subject)) return <PsychLab onAsk={onAsk} />;
  if (subject === "research") return <ResearchLab onAsk={onAsk} />;
  return <ELCLab onAsk={onAsk} />;
}

"use client";

import { useId, useState } from "react";
import { ArrowUpRight, FlaskConical, RefreshCw, Sparkles } from "lucide-react";
import { calculateMacro, calculateMarket } from "@/lib/economics-lab-core";
import "./study-lab.css";
import "./economics-lab.css";

type Props = { subjectId: "micro" | "macro"; onAsk: (prompt: string) => void };
const fmt = (value: number) => Number.isInteger(value) ? String(value) : value.toFixed(1);
const signed = (value: number) => `${value > 0 ? "+" : ""}${fmt(value)}`;
const bounds = { left: 64, right: 501, top: 31, bottom: 279 };

function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return <div className="sl-header"><div><div className="sl-eyebrow"><FlaskConical size={13} /> INTERACTIVE LAB</div><h3>{title}</h3><p>{subtitle}</p></div><span className="sl-live"><i /> 可交互</span></div>;
}

function Slider({ id, label, value, min, max, onChange }: { id: string; label: string; value: number; min: number; max: number; onChange: (value: number) => void }) {
  return <div className="sl-range"><label htmlFor={id}>{label}<span>{signed(value)}</span></label><input id={id} type="range" min={min} max={max} step={1} value={value} onChange={(event) => onChange(Number(event.target.value))} /><div className="sl-range-ends"><span>{min}</span><span>{max}</span></div></div>;
}

function Ask({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return <button className="sl-ask" onClick={onClick}><Sparkles size={14} />{children}<ArrowUpRight size={14} /></button>;
}

function Axes({ xMax, yMax, xLabel, yLabel }: { xMax: number; yMax: number; xLabel: string; yLabel: string }) {
  const { left, right, top, bottom } = bounds;
  return <g>
    {[0.25, 0.5, 0.75, 1].map((fraction) => <g key={fraction}>
      <line x1={left} x2={right} y1={bottom - fraction * (bottom - top)} y2={bottom - fraction * (bottom - top)} stroke="#edf1f5" />
      <text x={left - 10} y={bottom - fraction * (bottom - top) + 4} textAnchor="end">{fmt(fraction * yMax)}</text>
      <line x1={left + fraction * (right - left)} x2={left + fraction * (right - left)} y1={bottom} y2={bottom + 5} stroke="#8d9aaa" />
      <text x={left + fraction * (right - left)} y={bottom + 21} textAnchor="middle">{fmt(fraction * xMax)}</text>
    </g>)}
    <path d={`M${left},${top - 5} V${bottom} H${right + 8}`} fill="none" stroke="#718096" strokeWidth="1.5" />
    <text x={left - 10} y={bottom + 20} textAnchor="end">0</text>
    <text x={left} y="16">{yLabel}</text>
    <text x={(left + right) / 2} y="332" textAnchor="middle">{xLabel}</text>
  </g>;
}

function MicroLab({ onAsk }: Pick<Props, "onAsk">) {
  const id = useId();
  const [demandIntercept, setDemandIntercept] = useState(120);
  const [supplyIntercept, setSupplyIntercept] = useState(20);
  const [tax, setTax] = useState(20);
  const result = calculateMarket({ demandIntercept, supplyIntercept, tax });
  // Slider bounds guarantee positive trade; the calculation also handles no-trade cases.
  const buyerPrice = result.buyerPrice!;
  const sellerPrice = result.sellerPrice!;
  const baselinePrice = result.untaxedPrice!;
  const x = (quantity: number) => bounds.left + quantity / 90 * (bounds.right - bounds.left);
  const y = (price: number) => bounds.bottom - price / 180 * (bounds.bottom - bounds.top);
  const line = (intercept: number, slope: number) => `M${x(0)},${y(intercept)} L${x(90)},${y(intercept + slope * 90)}`;
  const reset = () => { setDemandIntercept(120); setSupplyIntercept(20); setTax(20); };
  return <section className="study-lab econ-lab">
    <Header title="税款由谁承担，交易又少了多少？" subtitle="Microeconomics · 供需移动与单位税，观察均衡和福利变化" />
    <div className="econ-toolbar"><p>固定斜率，分别改变需求、供给与每单位税额。</p><button className="econ-reset" onClick={reset}><RefreshCw size={13} />重置</button></div>
    <div className="econ-chart">
      <svg viewBox="0 0 540 346" role="img" aria-label={`微观供需图：未征税均衡数量 ${fmt(result.untaxedQuantity)}、价格 ${fmt(baselinePrice)}；税额 ${tax} 后数量 ${fmt(result.quantity)}，买方支付 ${fmt(buyerPrice)}，卖方实收 ${fmt(sellerPrice)}。税收 ${fmt(result.taxRevenue)}，无谓损失 ${fmt(result.deadweightLoss)}。`}>
        <defs><clipPath id={`${id}-micro-clip`}><rect x={bounds.left} y={bounds.top} width={bounds.right - bounds.left} height={bounds.bottom - bounds.top} /></clipPath></defs>
        <Axes xMax={90} yMax={180} xLabel="Quantity · 数量 Q" yLabel="Price · 价格 P" />
        <g clipPath={`url(#${id}-micro-clip)`}>
          {tax > 0 && <>
            <rect x={x(0)} y={y(buyerPrice)} width={x(result.quantity) - x(0)} height={y(sellerPrice) - y(buyerPrice)} fill="#b7dbd5" fillOpacity=".65" />
            <polygon points={`${x(result.quantity)},${y(buyerPrice)} ${x(result.quantity)},${y(sellerPrice)} ${x(result.untaxedQuantity)},${y(baselinePrice)}`} fill="#f0ceb8" fillOpacity=".9" />
          </>}
          <path d={line(demandIntercept, -1)} fill="none" stroke="#116b70" strokeWidth="2.5" />
          <path d={line(supplyIntercept, 1)} fill="none" stroke="#526eab" strokeWidth="2.5" />
          {tax > 0 && <path d={line(supplyIntercept + tax, 1)} fill="none" stroke="#a85325" strokeWidth="2" strokeDasharray="6 4" />}
          <path d={`M${x(result.quantity)},${bounds.bottom} V${y(buyerPrice)} H${bounds.left}`} fill="none" stroke="#698a92" strokeDasharray="4 4" />
          {tax > 0 && <line x1={bounds.left} x2={x(result.quantity)} y1={y(sellerPrice)} y2={y(sellerPrice)} stroke="#698a92" strokeDasharray="4 4" />}
          {tax > 0 && <circle cx={x(result.untaxedQuantity)} cy={y(baselinePrice)} r="4" fill="#fff" stroke="#67768a" strokeWidth="1.8" />}
          <line x1={x(result.quantity)} x2={x(result.quantity)} y1={y(buyerPrice)} y2={y(sellerPrice)} stroke="#a85325" strokeWidth="3" />
          <circle cx={x(result.quantity)} cy={y(buyerPrice)} r="4.5" fill="#116b70" stroke="#fff" strokeWidth="1.5" />
          {tax > 0 && <circle cx={x(result.quantity)} cy={y(sellerPrice)} r="4" fill="#526eab" stroke="#fff" strokeWidth="1.5" />}
        </g>
        <text className="econ-curve-label" x={x(79)} y={y(demandIntercept - 79) + 18} style={{ fill: "#116b70" }}>D</text>
        <text className="econ-curve-label" x={x(81)} y={y(supplyIntercept + 81) + 17} style={{ fill: "#526eab" }}>S</text>
        {tax > 0 && <text className="econ-curve-label" x={x(79)} y={y(supplyIntercept + tax + 79) - 9} style={{ fill: "#a85325" }}>S + tax</text>}
        <text className="econ-point-label" x={x(result.quantity) + (result.quantity > 55 ? -9 : 9)} y={y(buyerPrice) - 10} textAnchor={result.quantity > 55 ? "end" : "start"}>E: Q {fmt(result.quantity)}, Pᵦ {fmt(buyerPrice)}</text>
        {tax > 0 && <text className="econ-point-label" x={x(result.quantity) + (result.quantity > 55 ? -9 : 9)} y={y(sellerPrice) + 18} textAnchor={result.quantity > 55 ? "end" : "start"}>Pₛ {fmt(sellerPrice)}</text>}
      </svg>
      <div className="econ-legend"><span><i />需求 D</span><span className="supply"><i />供给 S</span><span className="tax"><i />含税供给</span><span className="revenue"><i />税收矩形</span><span className="loss"><i />无谓损失</span></div>
    </div>
    <div className="econ-controls">
      <Slider id={`${id}-demand`} label="需求截距 a" value={demandIntercept} min={100} max={160} onChange={setDemandIntercept} />
      <Slider id={`${id}-supply`} label="供给截距 c" value={supplyIntercept} min={10} max={50} onChange={setSupplyIntercept} />
      <Slider id={`${id}-tax`} label="单位税额 t" value={tax} min={0} max={40} onChange={setTax} />
    </div>
    <div className="econ-metrics" aria-live="polite">
      <div><span>交易量 Q</span><strong>{fmt(result.quantity)}</strong><small>未征税：{fmt(result.untaxedQuantity)}</small></div>
      <div><span>买方支付 Pᵦ</span><strong>{fmt(buyerPrice)}</strong><small>未征税价格：{fmt(baselinePrice)}</small></div>
      <div><span>卖方实收 Pₛ</span><strong>{fmt(sellerPrice)}</strong><small>Pᵦ − Pₛ = {tax}</small></div>
      <div><span>政府税收</span><strong>{fmt(result.taxRevenue)}</strong><small>t × Q</small></div>
      <div><span>无谓损失 DWL</span><strong>{fmt(result.deadweightLoss)}</strong><small>½ × t × 减少的交易量</small></div>
      <div><span>每单位税负</span><strong>{fmt(buyerPrice - baselinePrice)} / {fmt(baselinePrice - sellerPrice)}</strong><small>买方 / 卖方</small></div>
    </div>
    <div className="sl-insight"><span>边移动，边解释</span><p>{tax > 0 ? `单位税把买方支付与卖方实收分开 ${tax}。交易从 ${fmt(result.untaxedQuantity)} 降到 ${fmt(result.quantity)}；税收是转移给政府的收入，无谓损失才是未实现的交易净收益。` : "税额为零，需求与供给相交于有效率的均衡；此模型的政府税收和无谓损失都为零。"} 这里两条曲线斜率大小相同，因此买卖双方分担相同的每单位税额。</p></div>
    <details className="econ-formulas"><summary>查看方程与假设</summary><div><p>需求 P = a − Q；供给 P = c + Q。对卖方征单位税后，买方支付曲线为 P = c + Q + t。</p><p>Q = (a − c − t) / 2；Pᵦ = a − Q；Pₛ = c + Q。控件范围保证正交易量。需求增加是整条 D 上移；成本增加是整条 S 上移。</p><p>教学假设：竞争市场、线性曲线、无外部性、无征税执行成本。金额和数量均为示例单位。税负由相对弹性决定；图中固定相同斜率，无法用它推断所有市场的分担比例。</p></div></details>
    <Ask onClick={() => onAsk(`请做我的 AP Microeconomics 教练。当前交互模型：逆需求 P=${demandIntercept}−Q，逆供给 P=${supplyIntercept}+Q，单位税 t=${tax}；竞争市场、无外部性、线性曲线、斜率固定。未征税 Q=${fmt(result.untaxedQuantity)}、P=${fmt(baselinePrice)}；征税后 Q=${fmt(result.quantity)}、买价=${fmt(buyerPrice)}、卖价=${fmt(sellerPrice)}、税收=${fmt(result.taxRevenue)}、DWL=${fmt(result.deadweightLoss)}。请先让我解释曲线移动、税负与福利图形，再给一道基于这些参数的 FRQ 追问；不要把示例单位当成真实经济数据。`)}>用当前供需图练 FRQ</Ask>
  </section>;
}

function MacroLab({ onAsk }: Pick<Props, "onAsk">) {
  const id = useId();
  const [demandShift, setDemandShift] = useState(0);
  const [supplyShift, setSupplyShift] = useState(0);
  const result = calculateMacro({ demandShift, supplyShift });
  const x = (output: number) => bounds.left + output / 180 * (bounds.right - bounds.left);
  const y = (price: number) => bounds.bottom - price / 200 * (bounds.bottom - bounds.top);
  const reset = () => { setDemandShift(0); setSupplyShift(0); };
  const gapText = result.gapType === "at-potential" ? "产出处于潜在水平" : result.gapType === "recessionary" ? "衰退性缺口 · Recessionary gap" : "通胀性缺口 · Inflationary gap";
  return <section className="study-lab econ-lab">
    <Header title="需求扩张与供给冲击，后果相同吗？" subtitle="Macroeconomics · AD–SRAS 短期均衡与产出缺口" />
    <div className="econ-toolbar"><p>以指数表示价格水平和实际 GDP；潜在产出固定为 100。</p><button className="econ-reset" onClick={reset}><RefreshCw size={13} />重置</button></div>
    <div className="econ-gap" role="status">{gapText}</div>
    <div className="econ-chart">
      <svg viewBox="0 0 540 346" role="img" aria-label={`宏观 AD-SRAS 图：短期均衡实际 GDP 指数 ${fmt(result.output)}、价格水平指数 ${fmt(result.priceLevel)}，潜在产出 100，产出缺口 ${signed(result.outputGap)}，${gapText}。`}>
        <Axes xMax={180} yMax={200} xLabel="Real GDP · 实际 GDP 指数 Y" yLabel="Price level · 价格水平指数 PL" />
        {result.outputGap !== 0 && <rect x={x(Math.min(result.output, 100))} y={bounds.top} width={Math.abs(x(result.output) - x(100))} height={bounds.bottom - bounds.top} fill={result.outputGap < 0 ? "#e9f0fb" : "#fff0e6"} />}
        <line x1={x(100)} x2={x(100)} y1={bounds.top} y2={bounds.bottom} stroke="#6b7280" strokeWidth="1.8" strokeDasharray="5 4" />
        <path d={`M${x(0)},${y(result.demandIntercept)} L${x(180)},${y(result.demandIntercept - 90)}`} fill="none" stroke="#116b70" strokeWidth="2.5" />
        <path d={`M${x(0)},${y(result.supplyIntercept)} L${x(180)},${y(result.supplyIntercept + 90)}`} fill="none" stroke="#526eab" strokeWidth="2.5" />
        <path d={`M${bounds.left},${y(result.priceLevel)} H${x(result.output)} V${bounds.bottom}`} fill="none" stroke="#698a92" strokeDasharray="4 4" />
        <circle cx={x(result.output)} cy={y(result.priceLevel)} r="5" fill="#116b70" stroke="#fff" strokeWidth="2" />
        <text className="econ-curve-label" x={x(167)} y={y(result.demandIntercept - 83.5) + 20} style={{ fill: "#116b70" }}>AD</text>
        <text className="econ-curve-label" x={x(153)} y={y(result.supplyIntercept + 76.5) - 11} style={{ fill: "#526eab" }}>SRAS</text>
        <text className="econ-curve-label" x={x(100) + 8} y="45">LRAS: Yₚ = 100</text>
        <text className="econ-point-label" x={x(result.output) + (result.output > 130 ? -9 : 9)} y={y(result.priceLevel) - 12} textAnchor={result.output > 130 ? "end" : "start"}>E: Y {fmt(result.output)}, PL {fmt(result.priceLevel)}</text>
      </svg>
      <div className="econ-legend"><span><i />总需求 AD</span><span className="supply"><i />短期总供给 SRAS</span><span className="potential"><i />潜在产出 / LRAS</span><span>淡色区域：实际与潜在产出的差距</span></div>
    </div>
    <div className="econ-controls two">
      <Slider id={`${id}-ad`} label="AD 截距变化" value={demandShift} min={-30} max={30} onChange={setDemandShift} />
      <Slider id={`${id}-sras`} label="SRAS 截距变化" value={supplyShift} min={-30} max={30} onChange={setSupplyShift} />
    </div>
    <div className="econ-metrics" aria-live="polite"><div><span>实际产出 Y</span><strong>{fmt(result.output)}</strong><small>潜在产出 Yₚ = 100</small></div><div><span>价格水平 PL</span><strong>{fmt(result.priceLevel)}</strong><small>基准 PL = 110</small></div><div><span>产出缺口</span><strong>{signed(result.gapPercent)}%</strong><small>(Y − Yₚ) / Yₚ × 100%</small></div></div>
    <div className="sl-insight"><span>先区分短期变化的来源</span><p>AD 截距增加会把 AD 向右上方移动，其他条件相同时，短期产出和价格水平一起上升。SRAS 截距增加代表成本上升、SRAS 向左上方移动，短期产出下降而价格水平上升。{result.gapType === "recessionary" ? "当前 Y 低于潜在产出，存在衰退性缺口。" : result.gapType === "inflationary" ? "当前 Y 高于潜在产出，存在通胀性缺口。" : "当前均衡产出等于潜在产出。"}</p></div>
    <details className="econ-formulas"><summary>查看方程与短期假设</summary><div><p>AD：PL = 160 + AD 变化 − 0.5Y；SRAS：PL = 60 + SRAS 变化 + 0.5Y；潜在产出 Yₚ = 100。</p><p>这里的「价格水平」是指数，不是通胀率。通胀性缺口表示实际产出超过潜在产出，不表示模型已经估计未来的通胀率。</p><p>这是其他条件不变的短期教学模型，无实际经济预测。工资与预期、货币市场、政策乘数和长期自动调整未建模；LRAS 仅标出固定的潜在产出，未参与短期交点求解。</p></div></details>
    <Ask onClick={() => onAsk(`请做我的 AP Macroeconomics 教练。短期教学模型：AD 为 PL=${result.demandIntercept}−0.5Y，SRAS 为 PL=${result.supplyIntercept}+0.5Y，潜在产出 Yp=100（固定）；AD 截距变化 ${signed(demandShift)}，SRAS 截距变化 ${signed(supplyShift)}。短期均衡 Y=${fmt(result.output)}、PL=${fmt(result.priceLevel)}，产出缺口 ${signed(result.gapPercent)}%。价格水平和实际 GDP 都是教学指数。工资与预期、政策乘数和长期调整未建模。先让我判断曲线移动与缺口，再追问政策方向和长期调整机制；请区分模型已算出的结果与模型外需要论证的结论，不要把价格水平误作通胀率。`)}>解释这次宏观冲击并练 FRQ</Ask>
  </section>;
}

export default function EconomicsLab({ subjectId, onAsk }: Props) {
  return subjectId === "micro" ? <MicroLab onAsk={onAsk} /> : <MacroLab onAsk={onAsk} />;
}

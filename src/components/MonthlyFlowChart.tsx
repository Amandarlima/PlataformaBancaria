import { useEffect, useMemo, useState } from "react";
import type { Transaction } from "../types/bank";

interface MonthlyFlowChartProps {
  transactions: Transaction[];
}

interface ChartPoint {
  day: number;
  cumulative: number;
}

type Periodo = "7d" | "15d" | "mes";

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

const monthFmt = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric"
});

function buildMonthlyData(transactions: Transaction[]) {
  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
  const lastTransaction = sorted.length > 0 ? sorted[sorted.length - 1] : null;
  const reference = lastTransaction?.date ?? new Date().toISOString().slice(0, 10);

  const [yearStr, monthStr] = reference.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const daysInMonth = new Date(year, month, 0).getDate();

  const dailyNet = Array.from({ length: daysInMonth }, () => 0);
  const dailyIn = Array.from({ length: daysInMonth }, () => 0);
  const dailyOut = Array.from({ length: daysInMonth }, () => 0);

  for (const transaction of sorted) {
    const [tyStr, tmStr, tdStr] = transaction.date.split("-");
    const ty = Number(tyStr);
    const tm = Number(tmStr);
    const td = Number(tdStr);

    if (ty !== year || tm !== month) {
      continue;
    }

    if (transaction.type === "entrada") {
      dailyIn[td - 1] += transaction.amount;
      dailyNet[td - 1] += transaction.amount;
    } else {
      dailyOut[td - 1] += transaction.amount;
      dailyNet[td - 1] -= transaction.amount;
    }
  }

  const points: ChartPoint[] = [];
  let cumulative = 0;

  dailyNet.forEach((net, index) => {
    cumulative += net;
    points.push({
      day: index + 1,
      cumulative
    });
  });

  let lastDayWithMovement = 0;
  for (let index = points.length - 1; index >= 0; index -= 1) {
    if (points[index].cumulative !== 0) {
      lastDayWithMovement = index + 1;
      break;
    }
  }
  if (lastDayWithMovement <= 0) {
    lastDayWithMovement = Math.min(new Date().getDate(), daysInMonth);
  }

  return {
    year,
    month,
    points,
    dailyIn,
    dailyOut,
    lastDayWithMovement
  };
}

function resolveDayRange(periodo: Periodo, endDay: number) {
  const span = periodo === "7d" ? 7 : periodo === "15d" ? 15 : endDay;
  const startDay = Math.max(1, endDay - span + 1);
  return { startDay, endDay };
}

export function MonthlyFlowChart({ transactions }: MonthlyFlowChartProps) {
  const [periodo, setPeriodo] = useState<Periodo>("mes");
  const [animateGrid, setAnimateGrid] = useState(false);
  const [animateArea, setAnimateArea] = useState(false);
  const [animateLine, setAnimateLine] = useState(false);
  const [animatePoints, setAnimatePoints] = useState(false);
  const [hoverPoint, setHoverPoint] = useState<ChartPoint | null>(null);

  const data = useMemo(() => buildMonthlyData(transactions), [transactions]);
  const { startDay, endDay } = resolveDayRange(periodo, data.lastDayWithMovement);

  const visiblePoints = useMemo(
    () => data.points.filter((point) => point.day >= startDay && point.day <= endDay),
    [data.points, startDay, endDay]
  );

  const summary = useMemo(() => {
    const sliceStart = startDay - 1;
    const sliceEnd = endDay;
    const totalIn = data.dailyIn.slice(sliceStart, sliceEnd).reduce((acc, cur) => acc + cur, 0);
    const totalOut = data.dailyOut.slice(sliceStart, sliceEnd).reduce((acc, cur) => acc + cur, 0);
    return { totalIn, totalOut, netResult: totalIn - totalOut };
  }, [data.dailyIn, data.dailyOut, startDay, endDay]);

  useEffect(() => {
    setAnimateGrid(false);
    setAnimateArea(false);
    setAnimateLine(false);
    setAnimatePoints(false);
    setHoverPoint(null);

    const t1 = window.setTimeout(() => setAnimateGrid(true), 70);
    const t2 = window.setTimeout(() => setAnimateArea(true), 280);
    const t3 = window.setTimeout(() => setAnimateLine(true), 520);
    const t4 = window.setTimeout(() => setAnimatePoints(true), 900);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
    };
  }, [transactions, periodo]);

  if (visiblePoints.length === 0) {
    return null;
  }

  const width = 960;
  const height = 290;
  const padding = { top: 16, right: 26, bottom: 36, left: 26 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const values = visiblePoints.map((point) => point.cumulative);
  const maxValue = Math.max(0, ...values);
  const minValue = Math.min(0, ...values);
  const domainMin = minValue === maxValue ? minValue - 1 : minValue;
  const domainMax = minValue === maxValue ? maxValue + 1 : maxValue;

  const xForIndex = (index: number) => {
    if (visiblePoints.length <= 1) {
      return padding.left;
    }
    return padding.left + (index / (visiblePoints.length - 1)) * graphWidth;
  };

  const yForValue = (value: number) => {
    return padding.top + ((domainMax - value) / (domainMax - domainMin)) * graphHeight;
  };

  const linePoints = visiblePoints
    .map((point, index) => `${xForIndex(index)},${yForValue(point.cumulative)}`)
    .join(" ");
  const zeroY = yForValue(0);
  const areaPoints = `${xForIndex(0)},${zeroY} ${linePoints} ${xForIndex(visiblePoints.length - 1)},${zeroY}`;
  const monthLabel = monthFmt.format(new Date(data.year, data.month - 1, 1));
  const markerStep = Math.max(1, Math.floor(visiblePoints.length / 6));

  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  const periodOptions: Array<{ id: Periodo; label: string }> = [
    { id: "7d", label: "7 dias" },
    { id: "15d", label: "15 dias" },
    { id: "mes", label: "Mes" }
  ];

  const hoverX =
    hoverPoint === null
      ? 0
      : xForIndex(visiblePoints.findIndex((point) => point.day === hoverPoint.day));
  const hoverY = hoverPoint === null ? 0 : yForValue(hoverPoint.cumulative);

  return (
    <section className="rounded-2xl bg-white p-5 shadow dark:bg-slate-900">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h3 className="m-0 text-lg">Fluxo do periodo</h3>
          <p className="m-0 mt-1 text-sm text-slate-600 dark:text-slate-400">
            Movimentacao acumulada em {monthLabel}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {periodOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setPeriodo(option.id)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                periodo === option.id
                  ? "bg-bank-500 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 grid gap-2 text-sm md:grid-cols-3 md:gap-4">
        <p className="m-0 text-slate-600 dark:text-slate-400">
          Entradas: <strong className="text-slate-900 dark:text-slate-100">{brl.format(summary.totalIn)}</strong>
        </p>
        <p className="m-0 text-slate-600 dark:text-slate-400">
          Saidas: <strong className="text-slate-900 dark:text-slate-100">{brl.format(summary.totalOut)}</strong>
        </p>
        <p className="m-0 text-slate-600 dark:text-slate-400">
          Resultado:{" "}
          <strong className={summary.netResult >= 0 ? "text-emerald-600" : "text-rose-600"}>
            {brl.format(summary.netResult)}
          </strong>
        </p>
      </div>

      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-64 w-full min-w-[700px]">
          {gridLines.map((step) => {
            const y = padding.top + graphHeight * step;
            return (
              <line
                key={step}
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="currentColor"
                strokeWidth="1"
                className="text-slate-200 dark:text-slate-700"
                style={{
                  opacity: animateGrid ? 1 : 0,
                  transition: "opacity 320ms ease"
                }}
              />
            );
          })}

          <line
            x1={padding.left}
            y1={zeroY}
            x2={width - padding.right}
            y2={zeroY}
            strokeWidth="1.5"
            stroke="currentColor"
            className="text-slate-300 dark:text-slate-500"
            style={{
              opacity: animateGrid ? 1 : 0,
              transition: "opacity 320ms ease"
            }}
          />

          <polygon
            points={areaPoints}
            fill="currentColor"
            className="text-bank-100 dark:text-bank-900/60"
            style={{
              opacity: animateArea ? 1 : 0,
              transition: "opacity 520ms ease"
            }}
          />

          <polyline
            points={linePoints}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={100}
            className="text-bank-500"
            style={{
              strokeDasharray: 100,
              strokeDashoffset: animateLine ? 0 : 100,
              transition: "stroke-dashoffset 900ms ease"
            }}
          />

          {visiblePoints.map((point, index) => {
            const x = xForIndex(index);
            const y = yForValue(point.cumulative);
            const showLabel = index % markerStep === 0 || index === visiblePoints.length - 1;
            const isActive = hoverPoint?.day === point.day;

            return (
              <g key={point.day}>
                <circle
                  cx={x}
                  cy={y}
                  r={isActive ? 5.5 : 4}
                  fill="currentColor"
                  className="text-bank-700 dark:text-bank-100"
                  style={{
                    transformOrigin: `${x}px ${y}px`,
                    transform: animatePoints ? "scale(1)" : "scale(0)",
                    transition: `transform 320ms ease ${index * 65}ms, r 120ms ease`
                  }}
                />
                <circle
                  cx={x}
                  cy={y}
                  r={12}
                  fill="transparent"
                  onMouseEnter={() => setHoverPoint(point)}
                  onMouseMove={() => setHoverPoint(point)}
                  onMouseLeave={() => setHoverPoint(null)}
                />
                {showLabel && (
                  <text
                    x={x}
                    y={height - 10}
                    textAnchor="middle"
                    className="fill-slate-500 text-[11px] dark:fill-slate-400"
                  >
                    {point.day}
                  </text>
                )}
              </g>
            );
          })}

          {hoverPoint && (
            <g pointerEvents="none">
              <line
                x1={hoverX}
                y1={padding.top}
                x2={hoverX}
                y2={height - padding.bottom}
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="3 3"
                className="text-bank-500/70"
              />
              <g transform={`translate(${hoverX + 12}, ${Math.max(padding.top + 8, hoverY - 36)})`}>
                <rect width="130" height="42" rx="8" className="fill-slate-900 dark:fill-slate-100" />
                <text x="10" y="16" className="fill-slate-100 text-[11px] dark:fill-slate-900">
                  Dia {hoverPoint.day}
                </text>
                <text x="10" y="31" className="fill-emerald-300 text-[12px] dark:fill-emerald-700">
                  {brl.format(hoverPoint.cumulative)}
                </text>
              </g>
            </g>
          )}
        </svg>
      </div>
    </section>
  );
}

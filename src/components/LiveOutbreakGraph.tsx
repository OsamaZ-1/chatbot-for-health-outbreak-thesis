import React, { useEffect, useRef, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface Point {
  date: string;
  social: number;
  hospital: number;
  search: number;
  outbreak: number;
}

// 09/2019 → 03/2020 expanded into daily scale (~210 days)
const totalDays = 210;

// format helper
const formatDate = (dayIndex: number) => {
  const start = new Date(2019, 8, 1); // Sept 1 2019
  const d = new Date(start);
  d.setDate(start.getDate() + dayIndex);

  return `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

export default function LiveOutbreakGraph() {
  const [data, setData] = useState<Point[]>([]);
  const indexRef = useRef(0);

  const clamp = (v: number) => Math.max(0, Math.min(100, v));

  const generatePoint = (i: number): Point => {
    const t = i % totalDays;

    // normalize 0 → 1 timeline
    const x = t / totalDays;

    // epidemic peak centered at Dec 2019 (~0.5)
    const peak = Math.exp(-Math.pow((x - 0.5) / 0.09, 2));

    // second smaller wave (late Jan 2020)
    const wave2 = 0.6 * Math.exp(-Math.pow((x - 0.7) / 0.07, 2));

    const outbreakPressure = (peak * 80 + wave2 * 60);

    // smooth oscillation (seasonal + reporting noise)
    const seasonal = 6 * Math.sin(x * Math.PI * 6);

    const search =
      20 + outbreakPressure * 1.2 + seasonal + Math.sin(x * 10) * 2;

    const social =
      25 + outbreakPressure * 0.95 + Math.sin(x * 9 + 1) * 2;

    const hospital =
      15 + outbreakPressure * 0.75 + Math.sin(x * 8 + 2) * 1.5;

    const outbreak =
      search * 0.3 + social * 0.35 + hospital * 0.35;

    return {
      date: formatDate(t),
      search: clamp(search),
      social: clamp(social),
      hospital: clamp(hospital),
      outbreak: clamp(outbreak),
    };
  };

  useEffect(() => {
    const initial = Array.from({ length: 60 }, (_, i) =>
      generatePoint(i)
    );

    setData(initial);

    const interval = setInterval(() => {
      indexRef.current += 1;

      setData((prev) => {
        const next = generatePoint(indexRef.current);

        const updated = [...prev, next];

        // keep rolling window
        return updated.slice(-90);
      });

      // smooth loop reset (no visual jump)
      if (indexRef.current > 10000) {
        indexRef.current = indexRef.current % totalDays;
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-[320px] sm:h-[420px] md:h-[500px] rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl p-3 sm:p-6">

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 10, right: 10 }}>

          <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />

          {/* X AXIS = DAILY TIMELINE */}
          <XAxis
            dataKey="date"
            tick={{ fill: "#888", fontSize: 9 }}
            interval={12} // show every ~12 days (mobile-friendly)
            angle={-35}
            textAnchor="end"
            height={55}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            domain={[0, 100]}
            tick={{ fill: "#666", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={30}
          />

          <Tooltip
            contentStyle={{
              background: "#0B0F14",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              fontSize: "12px",
            }}
          />

          {/* SEARCH (early warning) */}
          <Line
            type="monotone"
            dataKey="search"
            stroke="#A855F7"
            strokeWidth={2}
            dot={false}
            animationDuration={400}
          />

          {/* SOCIAL */}
          <Line
            type="monotone"
            dataKey="social"
            stroke="#06B6D4"
            strokeWidth={2}
            dot={false}
            animationDuration={400}
          />

          {/* HOSPITAL (lagging indicator) */}
          <Line
            type="monotone"
            dataKey="hospital"
            stroke="#F43F5E"
            strokeWidth={2}
            dot={false}
            animationDuration={400}
          />

          {/* OUTBREAK (fusion result) */}
          <Line
            type="monotone"
            dataKey="outbreak"
            stroke="#22C55E"
            strokeWidth={3}
            dot={false}
            animationDuration={400}
          />

        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
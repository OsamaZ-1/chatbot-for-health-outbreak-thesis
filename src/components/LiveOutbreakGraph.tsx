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

const months = [
  "09-2019",
  "10-2019",
  "11-2019",
  "12-2019", // peak
  "01-2020",
  "02-2020",
  "03-2020",
];

export default function LiveOutbreakGraph() {
  const [data, setData] = useState<Point[]>([]);
  const indexRef = useRef(0);

  const clamp = (v: number) => Math.max(0, Math.min(100, v));

  const generatePoint = (i: number): Point => {
    const t = i;

    // outbreak peak centered at Dec 2019
    const peak = 3; // index of 12-2019

    const outbreakPressure =
      70 * Math.exp(-Math.pow((t - peak) / 1.2, 2));

    // smooth seasonal drift
    const drift = 6 * Math.sin(t * 0.8);

    // SEARCH (earliest signal)
    const search =
      20 +
      outbreakPressure * 1.15 +
      drift +
      3 * Math.sin(t * 2) +
      (Math.random() * 2 - 1);

    // SOCIAL (follows search)
    const social =
      25 +
      outbreakPressure * 0.95 +
      2 * Math.sin(t * 1.4) +
      (Math.random() * 2 - 1);

    // HOSPITAL (lags behind)
    const hospital =
      15 +
      outbreakPressure * 0.75 +
      2 * Math.sin(t * 1.1) +
      (Math.random() * 1.5 - 0.75);

    const outbreak =
      search * 0.3 +
      social * 0.35 +
      hospital * 0.35;

    return {
      date: months[t % months.length],
      search: clamp(search),
      social: clamp(social),
      hospital: clamp(hospital),
      outbreak: clamp(outbreak),
    };
  };

  useEffect(() => {
    // initial dataset
    const initial = months.map((_, i) => generatePoint(i));
    setData(initial);

    const interval = setInterval(() => {
      indexRef.current += 1;

      setData((prev) => {
        const next = generatePoint(indexRef.current);

        const updated = [...prev, next];

        // keep rolling window
        return updated.slice(-months.length);
      });

      // loop back smoothly
      if (indexRef.current > 1000) {
        indexRef.current = 0;
      }
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-[320px] sm:h-[420px] md:h-[500px] rounded-2xl sm:rounded-3xl border border-white/10 bg-black/30 backdrop-blur-xl p-3 sm:p-6">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 10, right: 10 }}>

          <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />

          {/* X AXIS (mobile-first readable dates) */}
          <XAxis
            dataKey="date"
            tick={{ fill: "#999", fontSize: 10 }}
            interval={0}
            angle={-35}
            textAnchor="end"
            height={50}
            axisLine={false}
            tickLine={false}
          />

          {/* Y AXIS (simplified for mobile) */}
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

          {/* SEARCH */}
          <Line
            type="monotone"
            dataKey="search"
            stroke="#A855F7"
            strokeWidth={2}
            dot={false}
            animationDuration={800}
          />

          {/* SOCIAL */}
          <Line
            type="monotone"
            dataKey="social"
            stroke="#06B6D4"
            strokeWidth={2}
            dot={false}
            animationDuration={800}
          />

          {/* HOSPITAL */}
          <Line
            type="monotone"
            dataKey="hospital"
            stroke="#F43F5E"
            strokeWidth={2}
            dot={false}
            animationDuration={800}
          />

          {/* OUTBREAK */}
          <Line
            type="monotone"
            dataKey="outbreak"
            stroke="#22C55E"
            strokeWidth={3}
            dot={false}
            animationDuration={800}
          />

        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
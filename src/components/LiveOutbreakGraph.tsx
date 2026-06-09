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
  time: string;
  social: number;
  hospital: number;
  search: number;
  outbreak: number;
}

export default function LiveOutbreakGraph() {
  const [data, setData] = useState<Point[]>([]);
  const timeRef = useRef(0);

  const clamp = (v: number) => Math.max(0, Math.min(100, v));

  const generatePoint = (): Point => {
    timeRef.current += 0.12;

    const t = timeRef.current;

    // Simulated outbreak waves
    const wave1 = 35 * Math.exp(-Math.pow((t - 8) / 3.5, 2));
    const wave2 = 50 * Math.exp(-Math.pow((t - 24) / 5, 2));
    const wave3 = 30 * Math.exp(-Math.pow((t - 42) / 4, 2));

    const outbreakPressure = wave1 + wave2 + wave3;

    // Background seasonal variation
    const seasonal = 8 * Math.sin(t * 0.18);

    // Search engine notices first
    const search =
      20 +
      outbreakPressure * 1.1 +
      seasonal +
      3 * Math.sin(t * 1.7) +
      (Math.random() * 2 - 1);

    // Social media follows shortly after
    const social =
      25 +
      outbreakPressure * 0.95 +
      6 * Math.sin(t * 0.15 + 1) +
      2 * Math.sin(t * 1.2) +
      (Math.random() * 2 - 1);

    // Hospitals react later and more slowly
    const hospital =
      15 +
      wave1 * 0.6 +
      wave2 * 0.75 +
      wave3 * 0.8 +
      4 * Math.sin(t * 0.12 + 2) +
      (Math.random() * 1.5 - 0.75);

    // Federated fusion result
    const outbreak =
      search * 0.30 +
      social * 0.35 +
      hospital * 0.35;

    return {
      time: "",
      search: clamp(search),
      social: clamp(social),
      hospital: clamp(hospital),
      outbreak: clamp(outbreak),
    };
  };

  useEffect(() => {
    const initial: Point[] = [];

    for (let i = 0; i < 50; i++) {
      initial.push(generatePoint());
    }

    initial.forEach((point, index) => {
      point.time = index.toString();
    });

    setData(initial);

    const interval = setInterval(() => {
      setData((prev) => {
        const next = generatePoint();

        const updated = [
          ...prev,
          {
            ...next,
            time: (Number(prev[prev.length - 1]?.time ?? 0) + 1).toString(),
          },
        ];

        return updated.slice(-60);
      });
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[500px] rounded-3xl border border-white/10 bg-black/30 backdrop-blur-xl p-6 overflow-hidden">

      {/* Glow Effects */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-500/10 blur-3xl rounded-full" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/10 blur-3xl rounded-full" />

      <div className="relative z-10 flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white text-lg font-semibold">
            Live Outbreak Probability Stream
          </h3>
          <p className="text-white/40 text-sm">
            Federated multi-source intelligence fusion
          </p>
        </div>

        <div className="flex items-center gap-2 text-green-400 text-xs uppercase tracking-widest font-mono">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Live
        </div>
      </div>

      <ResponsiveContainer width="100%" height="88%">
        <LineChart data={data}>
          <CartesianGrid
            stroke="rgba(255,255,255,0.05)"
            vertical={false}
          />

          <XAxis
            dataKey="time"
            tick={false}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            domain={[0, 100]}
            tick={{ fill: "#666" }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip
            contentStyle={{
              background: "#0B0F14",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "16px",
              backdropFilter: "blur(12px)",
            }}
          />

          {/* Search Engine */}
          <Line
            type="monotone"
            dataKey="search"
            stroke="#A855F7"
            strokeWidth={2.5}
            dot={false}
            animationDuration={600}
          />

          {/* Social Media */}
          <Line
            type="monotone"
            dataKey="social"
            stroke="#06B6D4"
            strokeWidth={2.5}
            dot={false}
            animationDuration={600}
          />

          {/* Hospital */}
          <Line
            type="monotone"
            dataKey="hospital"
            stroke="#F43F5E"
            strokeWidth={2.5}
            dot={false}
            animationDuration={600}
          />

          {/* Final Outbreak Probability */}
          <Line
            type="monotone"
            dataKey="outbreak"
            stroke="#22C55E"
            strokeWidth={5}
            dot={false}
            animationDuration={600}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    const generatePoint = (): Point => {
      const now = new Date();

      const social = 40 + Math.random() * 30;
      const hospital = 25 + Math.random() * 40;
      const search = 30 + Math.random() * 35;

      const outbreak =
        social * 0.35 +
        hospital * 0.4 +
        search * 0.25 +
        (Math.random() * 10 - 5);

      return {
        time: now.toLocaleTimeString(),
        social,
        hospital,
        search,
        outbreak,
      };
    };

    const initial = Array.from({ length: 20 }, generatePoint);
    setData(initial);

    const interval = setInterval(() => {
      setData((prev) => {
        const updated = [...prev, generatePoint()];
        return updated.slice(-30);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-[420px] rounded-2xl border border-white/10 bg-black/30 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" />

          <XAxis
            dataKey="time"
            tick={{ fill: "#888" }}
            minTickGap={20}
          />

          <YAxis
            domain={[0, 100]}
            tick={{ fill: "#888" }}
          />

          <Tooltip
            contentStyle={{
              background: "#0f1115",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
            }}
          />

          <Line
            type="monotone"
            dataKey="social"
            stroke="#00E5FF"
            strokeWidth={2.5}
            dot={false}
            animationDuration={800}
          />

          <Line
            type="monotone"
            dataKey="hospital"
            stroke="#FF4D6D"
            strokeWidth={2.5}
            dot={false}
            animationDuration={800}
          />

          <Line
            type="monotone"
            dataKey="search"
            stroke="#B388FF"
            strokeWidth={2.5}
            dot={false}
            animationDuration={800}
          />

          <Line
            type="monotone"
            dataKey="outbreak"
            stroke="#00FF95"
            strokeWidth={4}
            dot={false}
            animationDuration={800}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
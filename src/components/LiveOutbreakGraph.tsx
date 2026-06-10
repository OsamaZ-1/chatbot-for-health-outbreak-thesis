import React, { useEffect, useRef, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from "recharts";

interface Point {
  date: string;
  search: number;   // Search Engine Node
  social: number;   // Social Media Node
  hospital: number; // Hospital Node
  outbreak: number; // Federated Fusion Output
}

// Generates the customized historical timeline matching the new curve constraints
const generateCustomTimeline = (): Point[] => {
  const points: Point[] = [];
  const start = new Date(2019, 8, 1); // 2019-09-01
  const totalDays = 242; // Runs through late April 2020

  const clamp = (v: number) => Math.max(0, Math.min(100, v));

  for (let i = 0; i < totalDays; i++) {
    const current = new Date(start);
    current.setDate(start.getDate() + i);
    
    // Format to match standardized ISO structure YYYY-MM-DD
    const dateStr = current.toISOString().split("T")[0];
    const x = i / totalDays;

    // --- Custom Curve Shape Definition ---
    
    // 1. Small Initial Peak: Centered around Dec 9, 2019 (Day ~100, x ~0.41)
    const smallPeak = 25 * Math.exp(-Math.pow((x - 0.41) / 0.04, 2));

    // 2. Large Sustained Peak: Centered around Feb 2, 2020 (Day ~154, x ~0.64)
    const largePeakCenter = 0.64;
    let largePeak = 0;
    
    if (x < largePeakCenter) {
      // Steady climb leading up to February peak
      largePeak = 65 * Math.exp(-Math.pow((x - largePeakCenter) / 0.12, 2));
    } else {
      // Plateaus slightly under the peak maximum after February
      largePeak = 58 + 7 * Math.exp(-Math.pow((x - largePeakCenter) / 0.05, 2));
    }

    // Combine underlying mathematical outbreak pressure curves
    const outbreakPressure = 12 + smallPeak + largePeak;

    // Standard baseline oscillations across nodes (weekly reporting variations)
    const weeklyNoise = Math.sin(i * (Math.PI * 2 / 7)) * 2;
    const randomWalk = Math.sin(x * Math.PI * 10) * 1;

    // Apply specific offsets/multipliers to individual branches to keep them structurally unique
    const search = outbreakPressure * 1.1 + weeklyNoise + 4;
    const social = outbreakPressure * 1.0 + randomWalk + 6;
    
    // Hospital shows standard lagging clinical validation behavior
    const lagIndex = Math.max(0, i - 6);
    const hospitalLagX = lagIndex / totalDays;
    const hSmallPeak = 22 * Math.exp(-Math.pow((hospitalLagX - 0.41) / 0.04, 2));
    const hLargePeak = hospitalLagX < largePeakCenter 
      ? 60 * Math.exp(-Math.pow((hospitalLagX - largePeakCenter) / 0.12, 2))
      : 54 + 6 * Math.exp(-Math.pow((hospitalLagX - largePeakCenter) / 0.05, 2));
    const hospital = (10 + hSmallPeak + hLargePeak) * 0.95 + weeklyNoise * 0.5;

    // Global federated output tracking the multi-platform fusion
    const outbreak = (search * 0.3) + (social * 0.35) + (hospital * 0.35);

    points.push({
      date: dateStr,
      search: clamp(search),
      social: clamp(social),
      hospital: clamp(hospital),
      outbreak: clamp(outbreak),
    });
  }
  return points;
};

const historicalData = generateCustomTimeline();

export default function LiveOutbreakGraph() {
  const [visibleData, setVisibleData] = useState<Point[]>([]);
  const [isPrivateDP, setIsPrivateDP] = useState<boolean>(false);
  const indexRef = useRef(110); // Starts window with the first timeline landmark already visible

  useEffect(() => {
    setVisibleData(historicalData.slice(0, indexRef.current));

    const interval = setInterval(() => {
      indexRef.current += 1;

      if (indexRef.current > historicalData.length) {
        indexRef.current = 110; // Loop reset bound
      }

      const nextWindow = historicalData.slice(0, indexRef.current);
      
      if (isPrivateDP) {
        const noisyWindow = nextWindow.map(p => {
          const laplaceNoise = () => (Math.random() - 0.5) * 4;
          return {
            ...p,
            search: Math.max(0, Math.min(100, p.search + laplaceNoise())),
            social: Math.max(0, Math.min(100, p.social + laplaceNoise())),
            hospital: Math.max(0, Math.min(100, p.hospital + laplaceNoise())),
          };
        });
        setVisibleData(noisyWindow.slice(-140)); // Keeps rolling viewing pane active
      } else {
        setVisibleData(nextWindow.slice(-140));
      }
    }, 350);

    return () => clearInterval(interval);
  }, [isPrivateDP]);

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-[#0B0F14]/80 backdrop-blur-xl p-4 sm:p-6 shadow-2xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">
            Multi-Node Outbreak Prediction Timeline
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time evaluation across federated multi-platform data branches
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10 text-xs text-gray-300">
          <button
            onClick={() => setIsPrivateDP(false)}
            className={`px-3 py-1.5 rounded-lg transition-all ${!isPrivateDP ? "bg-purple-600 text-white font-medium" : "hover:text-white"}`}
          >
            Standard Base
          </button>
          <button
            onClick={() => setIsPrivateDP(true)}
            className={`px-3 py-1.5 rounded-lg transition-all ${isPrivateDP ? "bg-purple-600 text-white font-medium" : "hover:text-white"}`}
          >
            Private DP Model
          </button>
        </div>
      </div>

      <div className="w-full h-[340px] sm:h-[440px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={visibleData} margin={{ left: -10, right: 25, top: 20 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />

            <XAxis
              dataKey="date"
              tick={{ fill: "#9CA3AF", fontSize: 10 }}
              interval={14}
              angle={-45}
              textAnchor="end"
              height={60}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              domain={[0, 100]}
              tick={{ fill: "#6B7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={40}
            />

            <Tooltip
              contentStyle={{
                background: "#0F172A",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                fontSize: "12px",
                color: "#F3F4F6"
              }}
            />
            
            <Legend 
              verticalAlign="top" 
              height={36} 
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', paddingBottom: '10px' }}
            />

            {/* HIGHLIGHTED TARGET DATES */}
            <ReferenceLine
              x="2019-12-09"
              stroke="#F59E0B"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: "Initial Peak (12/09)",
                position: "top",
                fill: "#F59E0B",
                fontSize: 10,
                fontWeight: "500"
              }}
            />

            <ReferenceLine
              x="2020-02-02"
              stroke="#EF4444"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: "Major Outbreak Peak (02/02)",
                position: "top",
                fill: "#EF4444",
                fontSize: 10,
                fontWeight: "500"
              }}
            />

            {/* SEARCH ENGINE NODE */}
            <Line
              name="Search Engine Node"
              type="monotone"
              dataKey="search"
              stroke="#C084FC"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              animationDuration={200}
            />

            {/* SOCIAL MEDIA NODE */}
            <Line
              name="Social Media Node (BERT)"
              type="monotone"
              dataKey="social"
              stroke="#22D3EE"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              animationDuration={200}
            />

            {/* HOSPITAL SYSTEM NODE */}
            <Line
              name="Hospital Branch (NHAMCS)"
              type="monotone"
              dataKey="hospital"
              stroke="#FB7185"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              animationDuration={200}
            />

            {/* CENTRAL FEDERATED AGGREGATION FUSION */}
            <Line
              name="Federated Global Fusion Output"
              type="monotone"
              dataKey="outbreak"
              stroke="#4ADE80"
              strokeWidth={3.5}
              dot={false}
              activeDot={{ r: 6 }}
              animationDuration={200}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
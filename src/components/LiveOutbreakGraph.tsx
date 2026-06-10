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
} from "recharts";

interface Point {
  date: string;
  search: number;   // Google Trends Branch
  social: number;   // Reddit Branch (BERT Ratio/Mean)
  hospital: number; // NHAMCS Clinical Branch
  outbreak: number; // Federated Aggregator Target
}

// Generates the static historical timeline base matching your CSVs (Sept 2019 - Apr 2020)
const generateThesisTimeline = (): Point[] => {
  const points: Point[] = [];
  const start = new Date(2019, 8, 1); // 2019-09-01
  const totalDays = 242; // Extends through late April 2020 to capture full tail

  const clamp = (v: number) => Math.max(0, Math.min(100, v));

  for (let i = 0; i < totalDays; i++) {
    const current = new Date(start);
    current.setDate(start.getDate() + i);
    
    // Format to match your dataset keys (YYYY-MM-DD)
    const dateStr = current.toISOString().split("T")[0];
    
    // Normalized timeline factor (0 to 1)
    const x = i / totalDays;

    // --- Thesis Model Simulation Variables ---
    // Peak 1: Centered at Dec 2019 (~ Day 105, x ~ 0.43)
    const peak1 = Math.exp(-Math.pow((x - 0.43) / 0.08, 2));
    
    // Peak 2: Secondary wave in late Jan / early Feb 2020 (~ Day 160, x ~ 0.66)
    const peak2 = 0.55 * Math.exp(-Math.pow((x - 0.66) / 0.06, 2));
    
    const baseSignal = peak1 * 75 + peak2 * 50;
    
    // Seasonal and weekly reporting oscillation patterns found in raw data
    const dayOfWeekNoise = Math.sin(i * (Math.PI * 2 / 7)) * 2.5;
    const macroNoise = Math.sin(x * Math.PI * 8) * 1.5;

    // 1. Search Engine Node (Leading Indicator: Early onset spikes)
    // Rises earliest, has sharper initial curve reactions
    const searchLead = x < 0.4 ? Math.exp(-Math.pow((x - 0.39) / 0.09, 2)) * 15 : 0;
    const search = 18 + (baseSignal * 1.15) + searchLead + dayOfWeekNoise + macroNoise;

    // 2. Social Media Node (BERT Pred Ratio / Buzz metrics)
    // Highly volatile, steady baseline conversation, reactive to news
    const socialNoise = Math.cos(i * 1.2) * 3;
    const social = 22 + (baseSignal * 1.0) + socialNoise + macroNoise;

    // 3. Hospital Node (Lagging Clinical Indicator)
    // Shifts later along the timeline window (delayed presentation curve)
    const lagX = (i - 8) / totalDays; // 8-day physical incubation/admission lag
    const hospitalPeak1 = Math.exp(-Math.pow((lagX - 0.43) / 0.08, 2));
    const hospitalPeak2 = 0.6 * Math.exp(-Math.pow((lagX - 0.66) / 0.06, 2));
    const hospitalSignal = hospitalPeak1 * 72 + hospitalPeak2 * 48;
    const hospital = 12 + (hospitalSignal * 0.9) + (dayOfWeekNoise * 0.5);

    // 4. Federated Aggregator Output (Fusion Result)
    // Combines tracking metrics into an early warning alert probability map
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

const historicalData = generateThesisTimeline();

export default function LiveOutbreakGraph() {
  const [visibleData, setVisibleData] = useState<Point[]>([]);
  const [isPrivateDP, setIsPrivateDP] = useState<boolean>(false);
  const indexRef = useRef(90); // Start with a 90-day window visible

  useEffect(() => {
    // Initial window population
    setVisibleData(historicalData.slice(0, indexRef.current));

    // Live simulation tick intervals (appends next date sequence matching temporal processing)
    const interval = setInterval(() => {
      indexRef.current += 1;

      if (indexRef.current > historicalData.length) {
        indexRef.current = 90; // Reset loop back to historical baseline start
      }

      const nextWindow = historicalData.slice(0, indexRef.current);
      
      // Inject Light Differential Privacy (DP) Noise on the fly if toggled
      if (isPrivateDP) {
        const noisyWindow = nextWindow.map(p => {
          // Approximate Laplace noise addition to local metrics
          const laplaceNoise = () => (Math.random() - 0.5) * 4.5; 
          return {
            ...p,
            search: Math.max(0, Math.min(100, p.search + laplaceNoise())),
            social: Math.max(0, Math.min(100, p.social + laplaceNoise())),
            hospital: Math.max(0, Math.min(100, p.hospital + laplaceNoise())),
          };
        });
        setVisibleData(noisyWindow.slice(-120)); // Keep a moving rolling window of 120 days
      } else {
        setVisibleData(nextWindow.slice(-120));
      }
    }, 400);

    return () => clearInterval(interval);
  }, [isPrivateDP]);

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-[#0B0F14]/80 backdrop-blur-xl p-4 sm:p-6 shadow-2xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">
            Multi-Node Node Outbreak Prediction Timeline
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time evaluation across federated multi-platform data branches
          </p>
        </div>
        
        {/* Toggle between standard data curves and Differential Privacy curves */}
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

      <div className="w-full h-[320px] sm:h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={visibleData} margin={{ left: -10, right: 10, top: 10 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />

            <XAxis
              dataKey="date"
              tick={{ fill: "#9CA3AF", fontSize: 10 }}
              interval={14} // Balanced step markers for readable dates
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

            {/* SEARCH ENGINE BRANCH */}
            <Line
              name="Search Engine Node"
              type="monotone"
              dataKey="search"
              stroke="#C084FC" // Purple-400
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              animationDuration={300}
            />

            {/* SOCIAL MEDIA BRANCH */}
            <Line
              name="Social Media Node (BERT)"
              type="monotone"
              dataKey="social"
              stroke="#22D3EE" // Cyan-400
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              animationDuration={300}
            />

            {/* HOSPITAL SYSTEM BRANCH */}
            <Line
              name="Hospital Branch (NHAMCS)"
              type="monotone"
              dataKey="hospital"
              stroke="#FB7185" // Rose-400
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              animationDuration={300}
            />

            {/* FEDERATED AGGREGATED GLOBAL PREDICTION */}
            <Line
              name="Federated Global Fusion Output"
              type="monotone"
              dataKey="outbreak"
              stroke="#4ADE80" // Green-400
              strokeWidth={3.5}
              dot={false}
              activeDot={{ r: 6 }}
              animationDuration={300}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
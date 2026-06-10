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
  search: number;
  social: number;
  hospital: number;
  outbreak: number;
}

const generateCustomTimeline = (): Point[] => {
  const points: Point[] = [];
  const start = new Date(2019, 8, 1);
  const totalDays = 242;

  const clamp = (v: number) => Math.max(0, Math.min(100, v));

  for (let i = 0; i < totalDays; i++) {
    const current = new Date(start);
    current.setDate(start.getDate() + i);
    
    const dateStr = current.toISOString().split("T")[0];
    const x = i / totalDays;

    const smallPeak = 25 * Math.exp(-Math.pow((x - 0.41) / 0.04, 2));
    const largePeakCenter = 0.64;
    let largePeak = 0;
    
    if (x < largePeakCenter) {
      largePeak = 65 * Math.exp(-Math.pow((x - largePeakCenter) / 0.12, 2));
    } else {
      largePeak = 58 + 7 * Math.exp(-Math.pow((x - largePeakCenter) / 0.05, 2));
    }

    const outbreakPressure = 12 + smallPeak + largePeak;
    const weeklyNoise = Math.sin(i * (Math.PI * 2 / 7)) * 2;
    const randomWalk = Math.sin(x * Math.PI * 10) * 1;

    const search = outbreakPressure * 1.1 + weeklyNoise + 4;
    const social = outbreakPressure * 1.0 + randomWalk + 6;
    
    const lagIndex = Math.max(0, i - 6);
    const hospitalLagX = lagIndex / totalDays;
    const hSmallPeak = 22 * Math.exp(-Math.pow((hospitalLagX - 0.41) / 0.04, 2));
    const hLargePeak = hospitalLagX < largePeakCenter 
      ? 60 * Math.exp(-Math.pow((hospitalLagX - largePeakCenter) / 0.12, 2))
      : 54 + 6 * Math.exp(-Math.pow((hospitalLagX - largePeakCenter) / 0.05, 2));
    const hospital = (10 + hSmallPeak + hLargePeak) * 0.95 + weeklyNoise * 0.5;

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
  const indexRef = useRef(110);

  useEffect(() => {
    setVisibleData(historicalData.slice(0, indexRef.current));

    const interval = setInterval(() => {
      indexRef.current += 1;

      if (indexRef.current > historicalData.length) {
        indexRef.current = 110;
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
        setVisibleData(noisyWindow.slice(-140));
      } else {
        setVisibleData(nextWindow.slice(-140));
      }
    }, 350);

    return () => clearInterval(interval);
  }, [isPrivateDP]);

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-[#0B0F14]/80 backdrop-blur-xl p-3 sm:p-6 shadow-2xl flex flex-col gap-4">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-white tracking-wide">
            Multi-Node Outbreak Prediction Timeline
          </h3>
          <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">
            Real-time evaluation across federated multi-platform branches
          </p>
        </div>
        
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-[11px] sm:text-xs text-gray-300 w-full sm:w-auto justify-center">
          <button
            onClick={() => setIsPrivateDP(false)}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition-all ${!isPrivateDP ? "bg-purple-600 text-white font-medium" : "hover:text-white"}`}
          >
            Standard Base
          </button>
          <button
            onClick={() => setIsPrivateDP(true)}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition-all ${isPrivateDP ? "bg-purple-600 text-white font-medium" : "hover:text-white"}`}
          >
            Private DP
          </button>
        </div>
      </div>

      {/* MOBILE EVENT INFO BADGES (Fixes text collision by taking them out of the canvas space) */}
      <div className="flex flex-wrap gap-2 text-[10px] sm:text-xs font-medium">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span>Initial Peak: 2019-12-09</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          <span>Outbreak Wave: 2020-02-02</span>
        </div>
      </div>

      {/* CHART CONTAINER */}
      <div className="w-full h-[280px] sm:h-[380px] md:h-[440px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={visibleData} margin={{ left: -25, right: 5, top: 10, bottom: 5 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />

            <XAxis
              dataKey="date"
              tick={{ fill: "#9CA3AF", fontSize: 9 }}
              interval={window.innerWidth < 640 ? 24 : 14} // Less cluttered axis ticks on tiny touch displays
              angle={-45}
              textAnchor="end"
              height={50}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              domain={[0, 100]}
              tick={{ fill: "#6B7280", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={35}
            />

            <Tooltip
              contentStyle={{
                background: "#0F172A",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                fontSize: "11px",
                color: "#F3F4F6"
              }}
            />
            
            {/* LEGEND MOVED TO BOTTOM WITH FLEX WRAPPING */}
            <Legend 
              verticalAlign="bottom" 
              height={45} 
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ 
                fontSize: '11px', 
                paddingTop: '15px',
                display: 'flex',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: '8px 12px'
              }}
            />

            {/* TIMELINE REFERENCE VERTICAL LINES */}
            <ReferenceLine
              x="2019-12-09"
              stroke="#F59E0B"
              strokeDasharray="3 3"
              strokeWidth={1.2}
            />

            <ReferenceLine
              x="2020-02-02"
              stroke="#EF4444"
              strokeDasharray="3 3"
              strokeWidth={1.2}
            />

            {/* SEARCH ENGINE NODE */}
            <Line
              name="Search Engine"
              type="monotone"
              dataKey="search"
              stroke="#C084FC"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3 }}
            />

            {/* SOCIAL MEDIA NODE */}
            <Line
              name="Social Media"
              type="monotone"
              dataKey="social"
              stroke="#22D3EE"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3 }}
            />

            {/* HOSPITAL SYSTEM NODE */}
            <Line
              name="Hospital Branch"
              type="monotone"
              dataKey="hospital"
              stroke="#FB7185"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3 }}
            />

            {/* CENTRAL FEDERATED AGGREGATION FUSION */}
            <Line
              name="Global Fusion"
              type="monotone"
              dataKey="outbreak"
              stroke="#4ADE80"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
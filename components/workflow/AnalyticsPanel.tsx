import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface AnalyticsPanelProps {
  stats: { name: string; duration: number }[];
  isDarkMode: boolean;
}

const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ stats, isDarkMode }) => {
  return (
    <div className={`
        absolute left-6 bottom-6 w-[400px] border p-6 rounded-3xl z-20 animate-in slide-in-from-bottom duration-300
        ${isDarkMode ? 'bg-zinc-900 border-zinc-800 shadow-[0_20px_40px_rgba(0,0,0,0.5)]' : 'bg-white border-gray-100 shadow-[0_20px_40px_rgba(0,0,0,0.08)]'}
    `}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Performance</h3>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-gray-100 text-gray-400'}`}>
          {stats.reduce((a, b) => a + b.duration, 0).toFixed(0)}ms total
        </span>
      </div>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats}>
            <XAxis dataKey="name" stroke={isDarkMode ? "#71717a" : "#9ca3af"} fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke={isDarkMode ? "#71717a" : "#9ca3af"} fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: isDarkMode ? '#27272a' : '#f3f4f6' }}
              contentStyle={{
                backgroundColor: isDarkMode ? '#18181b' : '#000',
                borderRadius: '12px',
                border: isDarkMode ? '1px solid #27272a' : 'none',
                color: '#fff'
              }}
              itemStyle={{ color: '#fff' }}
            />
            <Bar dataKey="duration" fill={isDarkMode ? "#ffffff" : "#000000"} radius={[6, 6, 6, 6]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsPanel;
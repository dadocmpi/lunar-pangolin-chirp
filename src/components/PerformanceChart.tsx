"use client";

import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const data = [
  { name: 'Jan', value: 2000 },
  { name: 'Feb', value: 2150 },
  { name: 'Mar', value: 2100 },
  { name: 'Apr', value: 2300 },
  { name: 'May', value: 2450 },
  { name: 'Jun', value: 2400 },
  { name: 'Jul', value: 2600 },
];

const PerformanceChart = () => {
  return (
    <div className="h-[300px] w-full bg-[#080B12] border border-white/10 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Growth Performance (MTD)</h3>
        <span className="text-green-500 text-[10px] font-bold">+12.4%</span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#C5A059" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#C5A059" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="#475569" 
            fontSize={9} 
            tickLine={false} 
            axisLine={false}
          />
          <YAxis 
            stroke="#475569" 
            fontSize={9} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#05070A', border: '1px solid #ffffff10', fontSize: '10px' }}
            itemStyle={{ color: '#C5A059' }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#C5A059" 
            fillOpacity={1} 
            fill="url(#colorValue)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceChart;
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
import { useTranslation } from 'react-i18next';
import type { PerformancePoint } from '@/lib/dashboardData';

/**
 * Growth chart. It plots ONLY the caller-supplied series, which for a real
 * account is the cumulative realized PnL computed from the user's closed
 * trades. When there is no data it renders the localized empty state instead
 * of an invented curve or a fake $ axis.
 *
 * `demo` is for the local screenshot harness only, is off by default, and is
 * always paired with a visible "Demo data" label.
 */
const SAMPLE: PerformancePoint[] = [
  { name: 'Jan', value: 2000 },
  { name: 'Feb', value: 2150 },
  { name: 'Mar', value: 2100 },
  { name: 'Apr', value: 2300 },
  { name: 'May', value: 2450 },
  { name: 'Jun', value: 2400 },
  { name: 'Jul', value: 2600 },
];

const PerformanceChart = ({
  series,
  demo = false,
}: {
  series?: PerformancePoint[];
  demo?: boolean;
}) => {
  const { t } = useTranslation();
  const usingDemo = demo === true;
  const data = usingDemo ? SAMPLE : series ?? [];
  const hasData = usingDemo || data.length > 0;

  return (
    <div className="h-[300px] w-full bg-[#080B12] border border-white/10 p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">{t('dashboard.growthPerformanceMtd')}</h3>
          {usingDemo && (
            <span className="px-2 py-0.5 border border-amber-500/40 bg-amber-500/10 text-amber-400 text-[8px] font-bold uppercase tracking-widest">
              {t('dashboard.demoData')}
            </span>
          )}
        </div>
        {hasData && !usingDemo && (
          <span className="text-slate-400 text-[10px] font-bold">
            {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(data[data.length - 1].value)}
          </span>
        )}
      </div>
      {!hasData ? (
        <div className="h-[200px] flex flex-col items-center justify-center text-center">
          <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">{t('dashboard.noPerformanceData')}</p>
          <p className="text-slate-600 text-[10px] mt-2 max-w-xs">{t('dashboard.noPerformanceDataHint')}</p>
        </div>
      ) : (
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
      )}
    </div>
  );
};

export default PerformanceChart;

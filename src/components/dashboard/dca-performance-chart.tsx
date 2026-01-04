'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';

type DcaPerformanceChartProps = {
  data: { name: string; 'Recovery Rate': number }[];
};

export function DcaPerformanceChart({ data }: DcaPerformanceChartProps) {
    const chartConfig = {
        'Recovery Rate': {
            label: 'Recovery Rate',
            color: 'hsl(var(--chart-1))',
        },
    };
  return (
    <ChartContainer config={chartConfig} className="h-80 w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
            <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar dataKey="Recovery Rate" fill="var(--color-Recovery Rate)" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

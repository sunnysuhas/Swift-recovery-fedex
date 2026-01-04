'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';

type AgingChartProps = {
  data: { range: string; value: number }[];
};

export function AgingChart({ data }: AgingChartProps) {
  const chartConfig = {
    value: {
      label: 'Debt Amount',
      color: 'hsl(var(--chart-2))',
    },
  };
  return (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 10, left: -10, bottom: 0 }}
        >
          <XAxis type="number" hide />
          <YAxis
            dataKey="range"
            type="category"
            tickLine={false}
            axisLine={false}
            tickMargin={4}
            fontSize={12}
            width={80}
          />
          <Tooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar dataKey="value" fill="var(--color-value)" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

'use client';

import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';

type RecoveryRateChartProps = {
  data: { month: string; rate: number }[];
};

export function RecoveryRateChart({ data }: RecoveryRateChartProps) {
  const chartConfig = {
    rate: {
      label: 'Recovery Rate',
      color: 'hsl(var(--chart-1))',
    },
  };

  return (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
          <Line
            dataKey="rate"
            type="monotone"
            stroke="var(--color-rate)"
            strokeWidth={2}
            dot={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

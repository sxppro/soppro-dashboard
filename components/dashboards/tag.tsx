'use client';

import { getTagInfo } from '@/db';
import { formatCurrency } from '@/utils/helpers';
import { Color, Grid } from '@tremor/react';
import { List, Minus, Plus } from 'lucide-react';
import StatCard from '../core/stat-card';

interface TagDashboardProps {
  tagInfo: Awaited<ReturnType<typeof getTagInfo>>;
}

const TagDashboard = ({ tagInfo }: TagDashboardProps) => {
  const { Income, Expenses, Transactions } = tagInfo;
  const parsedTagInfo: {
    title: string;
    metric: string | number | undefined;
    icon: any;
    color: Color;
  }[] = [
    {
      title: 'Income',
      metric: formatCurrency(Income),
      icon: Plus,
      color: 'indigo',
    },
    {
      title: 'Expenses',
      metric: formatCurrency(Expenses),
      icon: Minus,
      color: 'fuchsia',
    },
    {
      title: 'Transactions',
      metric: Transactions,
      icon: List,
      color: 'amber',
    },
  ];

  return (
    <div className="w-full">
      <Grid numItemsSm={2} numItemsLg={3} className="gap-6 my-2">
        {parsedTagInfo &&
          parsedTagInfo.map((item) => {
            return <StatCard key={item.title} info={{ ...item }} />;
          })}
      </Grid>
    </div>
  );
};

export default TagDashboard;

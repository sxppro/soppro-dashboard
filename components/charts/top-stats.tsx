'use client';

import { AccountMonthlyInfo } from '@/server/schemas';
import { formatCurrency } from '@/utils/helpers';
import { useDate } from '@/utils/hooks';
import { trpc } from '@/utils/trpc';
import { Color, Grid } from '@tremor/react';
import { List, Minus, Plus } from 'lucide-react';
import StatCard from '../core/stat-card';

const TopStats = () => {
  const { date } = useDate();
  const { data, isLoading } = trpc.user.getMonthlyInfo.useQuery({
    from: date?.from,
    to: date?.to,
  });

  /**
   * Remaps data to shape consumable by component
   * @param param0
   * @returns
   */
  const categories = ({
    Income,
    Expenses,
    Transactions,
  }: AccountMonthlyInfo): {
    title: string;
    metric: string | number | undefined;
    icon: any;
    color: Color;
  }[] => [
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

  const parsedCategories = categories(
    Array.isArray(data) && data.length > 0
      ? data.reduce((prev, current) => {
          return {
            Income: prev.Income + current.Income,
            Expenses: prev.Expenses + current.Expenses,
            Transactions: prev.Transactions + current.Transactions,
            Year: 0,
            Month: 0,
            Day: undefined,
          };
        })
      : {
          Income: 0,
          Expenses: 0,
          Transactions: 0,
          Year: 0,
          Month: 0,
        }
  );

  return (
    <Grid numItemsSm={2} numItemsLg={3} className="gap-6 mt-6">
      {parsedCategories.map((item) => (
        <StatCard key={item.title} info={{ ...item, isLoading }} />
      ))}
    </Grid>
  );
};

export default TopStats;

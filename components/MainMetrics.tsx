'use client';
import { MonthlyMetric } from '@/types/custom';
import { useMonthlyMetrics } from '@/utils/fetch';
import { formatCurrency } from '@/utils/helpers';
import { CashIcon, TicketIcon, UserGroupIcon } from '@heroicons/react/solid';
import {
  BadgeDelta,
  Card,
  Color,
  Flex,
  Grid,
  Icon,
  Metric,
  Text,
} from '@tremor/react';
import { startOfMonth } from 'date-fns';

const currentDate = new Date();

const MainMetrics = () => {
  const { data, isLoading } = useMonthlyMetrics(
    startOfMonth(currentDate),
    currentDate
  );

  const categories = ({
    Income,
    Expenses,
    Transactions,
  }: MonthlyMetric): {
    title: string;
    metric: string | number | undefined;
    icon: any;
    color: Color;
  }[] => [
    {
      title: 'Income',
      metric: Income && formatCurrency(Income),
      icon: TicketIcon,
      color: 'indigo',
    },
    {
      title: 'Expenses',
      metric: Expenses && formatCurrency(Expenses),
      icon: CashIcon,
      color: 'fuchsia',
    },
    {
      title: 'Transactions',
      metric: Transactions,
      icon: UserGroupIcon,
      color: 'amber',
    },
  ];

  return (
    <Grid numItemsSm={2} numItemsLg={3} className="gap-6 mt-6">
      {categories(data && data.length > 0 ? data[0] : {}).map((item) => (
        <Card key={item.title} decoration="top" decorationColor={item.color}>
          <Flex justifyContent="start" className="space-x-4">
            <Icon
              icon={item.icon}
              variant="light"
              size="xl"
              color={item.color}
            />
            <div className="truncate flex-1">
              <Flex alignItems="start" justifyContent="between">
                <Text>{item.title}</Text>
                <BadgeDelta deltaType="moderateIncrease">{'10.2%'}</BadgeDelta>
              </Flex>
              <Metric className="truncate">{item.metric || '—'}</Metric>
            </div>
          </Flex>
        </Card>
      ))}
    </Grid>
  );
};

export default MainMetrics;

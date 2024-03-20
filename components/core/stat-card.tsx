import { StatCardInfo } from '@/types/custom';
import { Card, Flex, Icon, Metric, Text } from '@tremor/react';
import { Skeleton } from '../ui/skeleton';

interface StatCardProps {
  info: StatCardInfo;
}

const StatCard = ({ info }: StatCardProps) => {
  const { title, metric, icon, color, isLoading } = info;
  return (
    <Card decoration="top" decorationColor={color}>
      <Flex justifyContent="start" className="space-x-4">
        <Icon icon={icon} variant="light" size="xl" color={color} />
        <div className="truncate flex-1">
          <Flex alignItems="start" justifyContent="between">
            <Text>{title}</Text>
          </Flex>
          {isLoading ? (
            <Skeleton className="h-9 max-w-[150px]" />
          ) : (
            <Metric className="truncate">{metric}</Metric>
          )}
        </div>
      </Flex>
    </Card>
  );
};

export default StatCard;

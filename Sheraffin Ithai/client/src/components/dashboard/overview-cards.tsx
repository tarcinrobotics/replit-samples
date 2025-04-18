import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { cn, formatNumber, formatCurrency } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

interface OverviewCardProps {
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  title: string;
  value: string;
  changeValue: number;
  changeText: string;
}

const OverviewCard: React.FC<OverviewCardProps> = ({
  icon,
  iconBgColor,
  iconColor,
  title,
  value,
  changeValue,
  changeText
}) => {
  const isPositive = changeValue >= 0;
  
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className={cn("flex-shrink-0 p-3 rounded-md", iconBgColor)}>
            <div className={cn("h-6 w-6", iconColor)}>
              {icon}
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-bold text-gray-900">{value}</div>
                <div className={cn(
                  "flex items-center text-sm",
                  isPositive ? "text-green-600" : "text-red-600"
                )}>
                  {isPositive ? (
                    <Icon name="trending-up" className="h-4 w-4 mr-1" />
                  ) : (
                    <Icon name="trending-down" className="h-4 w-4 mr-1" />
                  )}
                  <span>{isPositive ? "+" : ""}{changeValue.toFixed(1)}% {changeText}</span>
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface StatSummary {
  totalStudents: {
    current: number;
    changePercent: number;
  };
  activeCourses: {
    current: number;
    changePercent: number;
  };
  totalRevenue: {
    current: number;
    changePercent: number;
  };
  completionRate: {
    current: number;
    changePercent: number;
  };
}

export default function OverviewCards() {
  const { data, isLoading } = useQuery<StatSummary>({
    queryKey: ['/api/dashboard/stats'],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="animate-pulse flex items-center">
                <div className="bg-gray-200 h-12 w-12 rounded-md"></div>
                <div className="ml-5 w-full space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Fallback data if the query doesn't return anything
  const stats = data || {
    totalStudents: { current: 0, changePercent: 0 },
    activeCourses: { current: 0, changePercent: 0 },
    totalRevenue: { current: 0, changePercent: 0 },
    completionRate: { current: 0, changePercent: 0 }
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <OverviewCard
        icon={<Icon name="user" />}
        iconBgColor="bg-primary-100"
        iconColor="text-primary-600"
        title="Total Students"
        value={formatNumber(stats.totalStudents.current)}
        changeValue={stats.totalStudents.changePercent}
        changeText="from last month"
      />
      <OverviewCard
        icon={<Icon name="book" />}
        iconBgColor="bg-blue-100"
        iconColor="text-blue-600"
        title="Active Courses"
        value={formatNumber(stats.activeCourses.current)}
        changeValue={stats.activeCourses.changePercent}
        changeText="from last month"
      />
      <OverviewCard
        icon={<span className="flex items-center justify-center">$</span>}
        iconBgColor="bg-green-100"
        iconColor="text-green-600"
        title="Total Revenue"
        value={formatCurrency(stats.totalRevenue.current)}
        changeValue={stats.totalRevenue.changePercent}
        changeText="from last month"
      />
      <OverviewCard
        icon={<Icon name="check" />}
        iconBgColor="bg-indigo-100"
        iconColor="text-indigo-600"
        title="Completion Rate"
        value={`${stats.completionRate.current.toFixed(1)}%`}
        changeValue={stats.completionRate.changePercent}
        changeText="from last month"
      />
    </div>
  );
}

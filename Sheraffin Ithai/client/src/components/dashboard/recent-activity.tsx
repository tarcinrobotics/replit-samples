import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { formatTimeAgo } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

// Define the interface for the API response structure
interface ActivityApiItem {
  id: number;
  userId: number;
  type: string;
  action: string;
  target: string;
  createdAt: string;
}

// Define the interface for our component's formatted display data
interface ActivityItem {
  id: string;
  type: 'join' | 'complete' | 'submit' | 'add';
  user: {
    name: string;
    role: string;
  };
  action: string;
  target: string;
  timestamp: string;
}

const ActivityIcon: React.FC<{ type: string }> = ({ type }) => {
  switch (type) {
    case 'join':
      return (
        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center ring-8 ring-white">
          <Icon name="user" className="h-5 w-5 text-primary-600" />
        </div>
      );
    case 'complete':
      return (
        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center ring-8 ring-white">
          <Icon name="check" className="h-5 w-5 text-green-600" />
        </div>
      );
    case 'submit':
      return (
        <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center ring-8 ring-white">
          <Icon name="file-text" className="h-5 w-5 text-yellow-600" />
        </div>
      );
    case 'add':
      return (
        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center ring-8 ring-white">
          <Icon name="plus" className="h-5 w-5 text-indigo-600" />
        </div>
      );
    default:
      return (
        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
          <Icon name="bell" className="h-5 w-5 text-gray-600" />
        </div>
      );
  }
};

const RecentActivity: React.FC = () => {
  const { data: apiData, isLoading } = useQuery<ActivityApiItem[]>({
    queryKey: ['/api/activities/recent'],
  });

  // Transform API data to the format needed by our component
  const formattedActivities = apiData?.map(item => ({
    id: item.id.toString(),
    type: item.type as 'join' | 'complete' | 'submit' | 'add',
    user: { 
      name: `User ${item.userId}`, // Placeholder - ideally we'd fetch the user name from a users endpoint
      role: 'student' 
    },
    action: item.action,
    target: item.target,
    timestamp: item.createdAt
  }));

  // Fallback data if API doesn't return anything
  const defaultActivities = [
    {
      id: '1',
      type: 'join',
      user: { name: 'Jessica Wilson', role: 'student' },
      action: 'joined',
      target: 'Data Science Essentials',
      timestamp: new Date().toISOString()
    },
    {
      id: '2',
      type: 'complete',
      user: { name: 'Michael Brown', role: 'student' },
      action: 'completed',
      target: 'Module 3: Advanced CSS',
      timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
    },
    {
      id: '3',
      type: 'submit',
      user: { name: 'David Johnson', role: 'student' },
      action: 'submitted',
      target: 'Final Project: Web Portfolio',
      timestamp: new Date(Date.now() - 10800000).toISOString() // 3 hours ago
    },
    {
      id: '4',
      type: 'add',
      user: { name: 'Prof. Robert Miller', role: 'instructor' },
      action: 'added',
      target: 'new course materials',
      timestamp: new Date(Date.now() - 21600000).toISOString() // 6 hours ago
    }
  ] as ActivityItem[];

  // Use API data if available, otherwise use fallback data
  const displayActivities = formattedActivities || defaultActivities;

  return (
    <Card className="bg-white rounded-lg shadow overflow-hidden lg:col-span-1">
      <CardContent className="p-5 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        <p className="mt-1 text-sm text-gray-500">Latest platform activities</p>
      </CardContent>
      <CardContent className="p-5">
        {isLoading ? (
          <div className="animate-pulse space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flow-root">
            <ul className="-mb-8">
              {displayActivities?.map((activity, idx) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {idx < (displayActivities?.length || 0) - 1 && (
                      <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                    )}
                    <div className="relative flex items-start space-x-3">
                      <div className="relative">
                        <ActivityIcon type={activity.type} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">{activity.user.name}</span> {activity.action}{' '}
                            <span className="font-medium">{activity.target}</span>
                          </p>
                          <p className="mt-0.5 text-sm text-gray-500">
                            {formatTimeAgo(new Date(activity.timestamp))}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-6">
          <Button variant="outline" className="w-full">
            View all activity
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
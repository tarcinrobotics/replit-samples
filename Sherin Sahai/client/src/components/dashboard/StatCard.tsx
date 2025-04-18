import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  percentChange?: number;
  icon: LucideIcon;
  extraInfo?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  percentChange, 
  icon: Icon,
  extraInfo
}) => {
  return (
    <div className="bg-white overflow-hidden shadow-sm rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
            <Icon className="h-6 w-6 text-primary-600" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">
                {value}
              </div>
              {percentChange !== undefined && (
                <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                  percentChange >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {percentChange >= 0 ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 self-center" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 self-center" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  )}
                  <span className="ml-1">{Math.abs(percentChange)}%</span>
                </div>
              )}
              {extraInfo && (
                <div className="ml-2">{extraInfo}</div>
              )}
            </dd>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;

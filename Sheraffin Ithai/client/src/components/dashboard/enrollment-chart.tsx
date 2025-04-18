import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface MonthlyEnrollmentData {
  name: string;
  value: string;
  height: string;
}

const EnrollmentChart: React.FC = () => {
  const { data: enrollmentData, isLoading } = useQuery<MonthlyEnrollmentData[]>({
    queryKey: ['/api/dashboard/enrollments'],
  });

  const chartData = {
    labels: enrollmentData?.map(m => m.name) || [],
    datasets: [
      {
        label: 'Student Enrollments',
        data: enrollmentData?.map(m => parseInt(m.height)) || [],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <Card className="bg-white rounded-lg shadow overflow-hidden">
      <CardContent className="p-5 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Enrollment Trend</h3>
        <p className="mt-1 text-sm text-gray-500">New student enrollments over time</p>
      </CardContent>
      <CardContent className="p-5">
        {isLoading ? (
          <div className="relative h-60 animate-pulse">
            <div className="bg-gray-200 h-full w-full rounded"></div>
          </div>
        ) : (
          <div className="h-[300px]">
            <Line data={chartData} options={options} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnrollmentChart;
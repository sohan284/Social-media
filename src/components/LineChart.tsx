'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

interface ActivityData {
  date: string;
  posts: number;
  users: number;
}

interface LineChartProps {
  data: ActivityData[];
  title?: string;
}

export function LineChart({ data, title }: LineChartProps) {
  // Format dates for display (show last 7 days more clearly, or show month-day)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    return `${month} ${day}`;
  };

  // Get last 7 days for better visibility
  const last7Days = data.slice(-7);
  const labels = last7Days.map(item => formatDate(item.date));
  
  const chartData = {
    labels,
    datasets: [
      {
        label: 'New Posts',
        data: last7Days.map(item => item.posts),
        borderColor: '#517EE0',
        backgroundColor: 'rgba(81, 126, 224, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: '#517EE0',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
      },
      {
        label: 'New Users',
        data: last7Days.map(item => item.users),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'center',
        labels: {
          color: '#ffffff',
          font: {
            size: 13,
            family: "'Inter', sans-serif",
          },
          boxWidth: 16,
          boxHeight: 16,
          padding: 20,
          usePointStyle: true,
          pointStyle: 'line',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      },
      datalabels: {
        display: false, // Hide data labels on line chart for cleaner look
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            size: 11,
          },
        },
        border: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            size: 11,
          },
        },
        border: {
          display: false,
        },
      },
    },
    layout: {
      padding: {
        top: 10,
        right: 20,
        bottom: 10,
        left: 10,
      },
    },
  };

  return (
    <div className="w-full h-full min-h-[300px]">
      {title && (
        <h3 className="text-center text-lg font-semibold mb-4 text-white">{title}</h3>
      )}
      <Line data={chartData} options={options} />
    </div>
  );
}


'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

export const options: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'right',
      align: 'center',
      labels: {
        color: '#ffffff',
        font: {
          size: 13,
          family: "'Inter', sans-serif",
          // weight: '500',
        },
        boxWidth: 14,
        boxHeight: 14,
        padding: 15,
        usePointStyle: false,
      },
    },
    title: {
      display: false,
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
          return `${context.dataset.label}: ${context.parsed.y}%`;
        }
      }
    },
    datalabels: {
      color: '#ffffff',
      anchor: 'end',
      align: 'top',
      font: {
        size: 11,
        weight: 'bold',
      },
      formatter: (value) => `${value}%`,
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
          size: 12,
        },
      },
      border: {
        display: false,
      },
    },
    y: {
      beginAtZero: true,
      max: 100,
      grid: {
        display: false,
      },
      ticks: {
        display: false,
      },
      border: {
        display: false,
      },
    },
  },
  layout: {
    padding: {
      top: 30,
      right: 20,
      bottom: 10,
      left: 10,
    },
  },
};

const labels = ['January', 'February', 'March', 'April', 'May'];

export const data = {
  labels,
  datasets: [
    {
      label: 'Total Posts',
      data: [70, 70, 70, 70, 70],
      backgroundColor: '#517EE0',
      borderRadius: 0,
      barThickness: 25,
    },
    {
      label: 'Approved Posts',
      data: [50, 50, 50, 50, 50],
      backgroundColor: '#387135',
      borderRadius: 0,
      barThickness: 25,
    },
    {
      label: 'Rejected Posts',
      data: [30, 30, 30, 30, 30],
      backgroundColor: '#B53939',
      borderRadius: 0,
      barThickness: 25,
    },
  ],
};

export function BarChart() {
  return (
    <div className="w-full h-full min-h-[300px]">
      <Bar options={options} data={data} />
    </div>
  );
}
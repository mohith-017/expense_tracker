// File: client/src/components/ExpenseChart.jsx
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ExpenseChart = ({ chartData }) => {
  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Total Expenses per Day',
        data: chartData.data,
        borderColor: 'rgb(56, 189, 248)',     // Brighter blue
        backgroundColor: 'rgba(56, 189, 248, 0.2)',
        tension: 0.1
      },
    ],
  };

  // --- AESTHETIC UPDATE FOR DARK MODE ---
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#f1f5f9' // Light text for legend
        }
      },
      title: {
        display: true,
        text: 'Expenses Over Time',
        color: '#f1f5f9' // Light text for title
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#cbd5e1' // Light text for x-axis labels
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)' // Faint grid lines
        }
      },
      y: {
        ticks: {
          color: '#cbd5e1' // Light text for y-axis labels
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)' // Faint grid lines
        }
      }
    }
  };
  // --- END OF AESTHETIC UPDATE ---

  return <Line options={options} data={data} />;
};

export default ExpenseChart;
'use client';

import React, { useRef, useEffect } from 'react';
import styles from './chat_container.module.css';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  BarController,
  BarElement,
  ArcElement,
  DoughnutController,
  PieController,
  Legend,
  Tooltip,
  ChartConfiguration,
} from 'chart.js';
import { PieChartData, ChartData } from '../types';

type ChartType = 'line' | 'bar' | 'pie' | 'doughnut';

interface ChartContainerProps {
  title: string;
  type: ChartType;
  data: PieChartData | ChartData;
  height?: number;
  width?: string;
  showLegend?: boolean;
  className?: string;
}

// Đăng ký các thành phần cần thiết với Chart.js
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  BarController,
  BarElement,
  ArcElement,
  DoughnutController,
  PieController,
  Legend,
  Tooltip
);

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  type,
  data,
  height = 300,
  width = '100%',
  showLegend = true,
  className = '',
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Hủy biểu đồ cũ nếu tồn tại
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Tạo config dựa vào kiểu dữ liệu
    const config: ChartConfiguration = {
      type,
      data: {
        labels: 'labels' in data ? data.labels : [],
        datasets:
          'datasets' in data
            ? data.datasets
            : [
                {
                  data: data.values,
                  backgroundColor: data.colors,
                },
              ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: showLegend,
            position: 'top',
          },
        },
      },
    };

    // Tạo biểu đồ
    chartInstance.current = new Chart(ctx, config);

    // Dọn dẹp khi unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [type, data, showLegend]);

  return (
    <div className={`${styles.chartContainer} ${className}`}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>{title}</h3>
        <div className={styles.chartActions}>
          <button className={styles.actionButton} title="Tải xuống">
            <span>↓</span>
          </button>
          <button className={styles.actionButton} title="Làm mới">
            <span>↻</span>
          </button>
          <button className={styles.actionButton} title="Tùy chọn">
            <span>⋯</span>
          </button>
        </div>
      </div>
      <div className={styles.chartBody} style={{ height }}>
        <canvas
          ref={chartRef}
          style={{ width: width, height: height }}
        ></canvas>
      </div>
    </div>
  );
};

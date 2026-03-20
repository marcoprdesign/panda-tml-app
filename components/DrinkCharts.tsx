"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/supabase';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

export default function DrinkCharts() {
  const [lineData, setLineData] = useState<any>(null);
  const [typeData, setTypeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const palette = {
    slate: '#2F4F4F',
    blue: '#778899',
    sage: '#8F9779',
    rose: '#B29494',
    ochre: '#C2A385',
    terracotta: '#A0522D'
  };

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    const { data: drinks, error } = await supabase
      .from('drinks')
      .select('created_at, drink_type, profiles(username)')
      .order('created_at', { ascending: true });

    if (error || !drinks || drinks.length === 0) {
      setLoading(false);
      return;
    }

    const usernames = Array.from(new Set(drinks.map((d: any) => d.profiles?.username || 'Panda')));
    const typeStats: any = {};

    // 1. CONFIG LINE CHART (Timeline)
    const chartColors = [palette.slate, palette.sage, palette.rose, palette.ochre, palette.blue];
    const lineDatasets = usernames.map((name, index) => {
      let cumulative = 0;
      const color = chartColors[index % chartColors.length];
      const dataPoints = drinks.map((d: any) => {
        if ((d.profiles?.username || 'Panda') === name) cumulative++;
        return cumulative;
      });
      return {
        label: name,
        data: dataPoints,
        borderColor: color,
        backgroundColor: color + '10',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2.5
      };
    });

    setLineData({ labels: drinks.map((_, i) => i + 1), datasets: lineDatasets });

    // 2. CONFIG BAR CHART (Mix par Type)
    drinks.forEach((d: any) => {
      const type = d.drink_type || 'Other';
      typeStats[type] = (typeStats[type] || 0) + 1;
    });

    const sortedTypes = Object.keys(typeStats).sort((a, b) => typeStats[b] - typeStats[a]);
    const barColors = [palette.ochre, palette.sage, palette.blue, palette.terracotta, palette.rose, palette.slate];

    setTypeData({
      labels: sortedTypes.map(t => t.toUpperCase()),
      datasets: [{
        label: 'Quantity',
        data: sortedTypes.map(t => typeStats[t]),
        backgroundColor: barColors.slice(0, sortedTypes.length),
        borderRadius: 12,
        barThickness: 30,
      }]
    });

    setLoading(false);
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: { color: '#2F4F4F', font: { size: 9, weight: '900' }, usePointStyle: true, padding: 15 }
      },
      tooltip: { backgroundColor: '#F5F5DC', titleColor: '#2F4F4F', bodyColor: '#2F4F4F', borderColor: '#77889933', borderWidth: 1, cornerRadius: 12 }
    },
    scales: {
      y: { 
        beginAtZero: true, 
        grid: { color: 'rgba(47, 79, 79, 0.05)' }, 
        ticks: { color: '#778899', font: { size: 10, weight: '700' }, stepSize: 1, precision: 0 } 
      },
      x: { 
        grid: { display: false }, 
        ticks: { color: '#2F4F4F', font: { size: 9, weight: '900' } } 
      }
    }
  };

  if (loading) return <div className="flex justify-center py-10 opacity-20 text-[9px] font-black uppercase tracking-widest text-[#2F4F4F]">Analyzing scrolls...</div>;

  return (
    <div className="space-y-6">
      {lineData && (
        <div className="bg-white/40 p-6 rounded-[2.5rem] border border-[#778899]/20 shadow-sm backdrop-blur-sm">
          <h3 className="text-[10px] font-black text-[#2F4F4F] uppercase tracking-[0.2em] mb-6 pl-2">Hydration Timeline</h3>
          <div className="h-64"><Line data={lineData} options={options} /></div>
        </div>
      )}

      {typeData && (
        <div className="bg-white/40 p-6 rounded-[2.5rem] border border-[#778899]/20 shadow-sm backdrop-blur-sm">
          <h3 className="text-[10px] font-black text-[#2F4F4F] uppercase tracking-[0.2em] mb-6 pl-2">Archive Mix</h3>
          <div className="h-56">
            <Bar data={typeData} options={{...options, plugins: {...options.plugins, legend: {display: false}}}} />
          </div>
        </div>
      )}
    </div>
  );
}
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

// Définition de l'interface pour TypeScript
interface DrinkChartsProps {
  archiveEventId?: string;
}

export default function DrinkCharts({ archiveEventId }: DrinkChartsProps) {
  const [lineData, setLineData] = useState<any>(null);
  const [typeData, setTypeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const palette = {
    dark: '#202231',
    main: '#313449',
    slate: '#58618a',
    muted: '#8089b0',
    light: '#adb2cc',
    accent: '#d3d6e4'
  };

  const fetchChartData = async () => {
    setLoading(true);
    
    let targetEventId = archiveEventId;

    // Si on n'a pas d'ID d'archive, on récupère l'ID de l'event actif
    if (!targetEventId) {
      const { data: activeEvent } = await supabase
        .from('events')
        .select('id')
        .eq('is_active', true)
        .single();
      targetEventId = activeEvent?.id;
    }

    const { data: drinks, error } = await supabase
      .from('drinks')
      .select('created_at, drink_type, profiles(username)')
      .eq('event_id', targetEventId) // FILTRE PAR EVENT
      .order('created_at', { ascending: true });

    if (error || !drinks || drinks.length === 0) {
      setLineData(null);
      setTypeData(null);
      setLoading(false);
      return;
    }

    const usernames = Array.from(new Set(drinks.map((d: any) => d.profiles?.username || 'Panda')));
    const typeStats: any = {};

    // 1. CONFIG LINE CHART
    const chartColors = [palette.main, palette.slate, palette.muted, palette.light, palette.accent];
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
        backgroundColor: color + '15',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2.5
      };
    });

    setLineData({ labels: drinks.map((_, i) => i + 1), datasets: lineDatasets });

    // 2. CONFIG BAR CHART
    drinks.forEach((d: any) => {
      const type = d.drink_type || 'Other';
      typeStats[type] = (typeStats[type] || 0) + 1;
    });

    const sortedTypes = Object.keys(typeStats).sort((a, b) => typeStats[b] - typeStats[a]);
    const barColors = [palette.main, palette.slate, palette.muted, palette.light, palette.accent, palette.dark];

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

  useEffect(() => {
    fetchChartData();
  }, [archiveEventId]); // Se relance quand l'ID change

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: { 
          color: palette.main, 
          font: { size: 9, weight: '900' }, 
          usePointStyle: true, 
          padding: 15 
        }
      },
      tooltip: { 
        backgroundColor: '#ffffff', 
        titleColor: palette.dark, 
        bodyColor: palette.dark, 
        borderColor: palette.accent, 
        borderWidth: 1, 
        cornerRadius: 12 
      }
    },
    scales: {
      y: { 
        beginAtZero: true, 
        grid: { color: 'rgba(49, 52, 73, 0.05)' }, 
        ticks: { color: palette.muted, font: { size: 10, weight: '700' }, stepSize: 1, precision: 0 } 
      },
      x: { 
        grid: { display: false }, 
        ticks: { color: palette.main, font: { size: 9, weight: '900' } } 
      }
    }
  };

  if (loading) return (
    <div className="flex justify-center py-10 opacity-20 text-[9px] font-black uppercase tracking-widest text-[#313449]">
      Analyzing scrolls...
    </div>
  );

  if (!lineData && !typeData) return (
    <div className="py-10 text-center opacity-40 text-[9px] font-black uppercase tracking-widest text-[#313449]">
      No data to visualize for this era 🐼
    </div>
  );

  return (
    <div className="space-y-6">
      {lineData && (
        <div className="bg-white border border-[#d3d6e4]/50 p-6 rounded-[2.5rem] shadow-sm">
          <h3 className="text-[10px] font-black text-[#313449] uppercase tracking-[0.2em] mb-6 pl-2">Hydration Timeline</h3>
          <div className="h-64"><Line data={lineData} options={options} /></div>
        </div>
      )}

      {typeData && (
        <div className="bg-white border border-[#d3d6e4]/50 p-6 rounded-[2.5rem] shadow-sm">
          <h3 className="text-[10px] font-black text-[#313449] uppercase tracking-[0.2em] mb-6 pl-2">Archive Mix</h3>
          <div className="h-56">
            <Bar data={typeData} options={{...options, plugins: {...options.plugins, legend: {display: false}}}} />
          </div>
        </div>
      )}
    </div>
  );
}
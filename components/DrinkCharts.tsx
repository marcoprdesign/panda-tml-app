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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function DrinkCharts() {
  const [lineData, setLineData] = useState<any>(null);
  const [barData, setBarData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    const { data: drinks, error } = await supabase
      .from('drinks')
      .select('created_at, user_id, profiles(username)')
      .order('created_at', { ascending: true });

    if (error || !drinks || drinks.length === 0) {
      setLoading(false);
      return;
    }

    const userStats: any = {};
    drinks.forEach((d: any) => {
      const name = d.profiles?.username || 'Panda';
      if (!userStats[name]) userStats[name] = { count: 0 };
      userStats[name].count += 1;
    });

    const usernames = Object.keys(userStats);

    // --- NOUVELLE PALETTE ARCHIVE (Muted & Elegant) ---
    const palette = {
      slate: '#2F4F4F',      // Ardoise Sombre
      blue: '#778899',       // Gris Bleu
      sage: '#8F9779',       // Vert Sauge éteint
      rose: '#B29494',       // Vieux Rose
      ochre: '#C2A385'       // Ocre doux
    };

    const chartColors = [palette.slate, palette.sage, palette.rose, palette.ochre, palette.blue];

    // --- CONFIG BAR CHART ---
    const sortedUsers = usernames.sort((a, b) => userStats[b].count - userStats[a].count);
    setBarData({
      labels: sortedUsers,
      datasets: [{
        label: 'Total Drinks',
        data: sortedUsers.map(u => userStats[u].count),
        backgroundColor: palette.slate, 
        borderRadius: 20,
        hoverBackgroundColor: '#3D6666',
        barThickness: 12,
      }]
    });

    // --- CONFIG LINE CHART ---
    const lineDatasets = usernames.map((name, index) => {
      let cumulative = 0;
      const color = chartColors[index % chartColors.length];
      
      const dataPoints = drinks.map((d: any) => {
        const drinkUser = d.profiles?.username || 'Panda';
        if (drinkUser === name) cumulative++;
        return cumulative;
      });

      return {
        label: name,
        data: dataPoints,
        borderColor: color,
        backgroundColor: color + '10', // Remplissage ultra-léger
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2.5
      };
    });

    setLineData({
      labels: drinks.map((_, i) => i),
      datasets: lineDatasets
    });
    setLoading(false);
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { 
          color: '#2F4F4F', 
          font: { size: 9, weight: '900' }, 
          usePointStyle: true,
          pointStyle: 'rectRounded',
          padding: 20,
          boxWidth: 8
        }
      },
      tooltip: {
        backgroundColor: '#F5F5DC', 
        titleColor: '#2F4F4F',
        bodyColor: '#2F4F4F',
        titleFont: { size: 10, weight: '900' },
        bodyFont: { size: 10 },
        borderColor: '#77889933', 
        borderWidth: 1,
        displayColors: true,
        padding: 10,
        cornerRadius: 12
      }
    },
    scales: {
      y: { 
        grid: { color: 'rgba(47, 79, 79, 0.05)' },
        ticks: { color: '#778899', font: { size: 9, weight: '700' } } 
      },
      x: { 
        grid: { display: false },
        ticks: { display: false } 
      }
    }
  };

  if (loading) return (
    <div className="flex justify-center py-10 opacity-20 text-[9px] font-black uppercase tracking-widest">
      Drawing analytics...
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {lineData && (
        <div className="bg-white/40 p-6 rounded-[2.5rem] border border-[#778899]/20 shadow-sm backdrop-blur-sm">
          <h3 className="text-[10px] font-black text-[#2F4F4F] uppercase tracking-[0.2em] mb-6 pl-2">
            Hydration Timeline
          </h3>
          <div className="h-60">
            <Line data={lineData} options={options} />
          </div>
        </div>
      )}

      {barData && (
        <div className="bg-white/40 p-6 rounded-[2.5rem] border border-[#778899]/20 shadow-sm backdrop-blur-sm">
          <h3 className="text-[10px] font-black text-[#2F4F4F] uppercase tracking-[0.2em] mb-6 pl-2">
            Panda Rankings
          </h3>
          <div className="h-60">
            <Bar data={barData} options={options} />
          </div>
        </div>
      )}
    </div>
  );
}
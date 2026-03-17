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

// 1. Enregistrement des composants
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

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    // Récupération des données avec jointure profil
    const { data: drinks, error } = await supabase
      .from('drinks')
      .select('created_at, user_id, profiles(username)')
      .order('created_at', { ascending: true });

    if (error || !drinks || drinks.length === 0) return;

    // --- PRÉPARATION DES DONNÉES ---
    const userStats: any = {};
    const timelineLabels: string[] = [];
    
    // On groupe les données par utilisateur
    drinks.forEach((d: any) => {
      const name = d.profiles?.username || 'Panda';
      const time = new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      if (!userStats[name]) {
        userStats[name] = { count: 0, history: [] };
      }
      userStats[name].count += 1;
      timelineLabels.push(time);
    });

    const usernames = Object.keys(userStats);

    // --- CONFIG BAR CHART (Totaux) ---
    const sortedUsers = usernames.sort((a, b) => userStats[b].count - userStats[a].count);
    
    setBarData({
      labels: sortedUsers,
      datasets: [{
        label: 'Drinks',
        data: sortedUsers.map(u => userStats[u].count),
        backgroundColor: '#DFFF5E',
        borderRadius: 8,
      }]
    });

    // --- CONFIG LINE CHART (Évolution cumulative) ---
    // On crée une timeline simplifiée (max 15 points pour la lisibilité)
    const datasets = usernames.map((name, index) => {
      let cumulative = 0;
      const colors = ['#DFFF5E', '#FF5E5E', '#5EBFFF', '#FF5EDF', '#5EFF8B'];
      const color = colors[index % colors.length];

      // On map chaque drink pour créer une courbe montante
      const dataPoints = drinks.map((d: any) => {
        if ((d.profiles?.username || 'Panda') === name) cumulative++;
        return cumulative;
      });

      return {
        label: name,
        data: dataPoints,
        borderColor: color,
        backgroundColor: color + '22', // Transparence
        fill: true,
        tension: 0.4,
        pointRadius: 0
      };
    });

    setLineData({
      labels: drinks.map((_, i) => i), // Index simple pour l'axe X
      datasets: datasets
    });
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { color: 'rgba(255,255,255,0.5)', font: { size: 10, weight: 'bold' }, usePointStyle: true }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      y: { 
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: 'rgba(255,255,255,0.3)' } 
      },
      x: { 
        grid: { display: false },
        ticks: { display: false } // On cache les labels X trop denses
      }
    }
  };

  return (
    <div className="space-y-6">
      {lineData && (
        <div className="bg-[#141417] p-5 rounded-[2rem] border border-white/5">
          <h3 className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-4">Mindful Overview</h3>
          <div className="h-64">
            <Line data={lineData} options={options} />
          </div>
        </div>
      )}

      {barData && (
        <div className="bg-[#141417] p-5 rounded-[2rem] border border-white/5">
          <h3 className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-4">Drinks per Panda</h3>
          <div className="h-64">
            <Bar data={barData} options={options} />
          </div>
        </div>
      )}
    </div>
  );
}
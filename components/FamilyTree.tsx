"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/supabase';
import { ArrowDown01Icon } from "hugeicons-react";
import { ReactFlow, Background, Controls, useNodesState, useEdgesState, Node, Edge } from '@xyflow/react';

interface MemberNode {
  id: any;
  username: string;
  arrival_year: any;
  invited_by_id: any;
}

export default function FamilyTree({ onBack }: { onBack: () => void }) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTreeData = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('family_tree')
          .select('*');

        if (error) throw error;
        if (data) buildGraph(data);
      } catch (err) {
        console.error("Error fetching family tree:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTreeData();
  }, []);

  const buildGraph = (members: MemberNode[]) => {
    const initialNodes: any[] = [];
    const initialEdges: any[] = [];

    const childrenMap: Record<string, MemberNode[]> = {};
    const roots: MemberNode[] = [];

    members.forEach(m => {
      const parentId = m.invited_by_id ? m.invited_by_id.toString().trim() : "";
      if (parentId === "" || parentId === "0") {
        roots.push(m);
      } else {
        if (!childrenMap[parentId]) childrenMap[parentId] = [];
        childrenMap[parentId].push(m);
      }
    });

    roots.sort((a, b) => Number(a.arrival_year) - Number(b.arrival_year));

    // 🚀 VALEURS DE POSITIONNEMENT BIEN ESPACÉES
    const horizSpacing = 220; // Plus d'espace entre les colonnes (avant c'était 160)
    const vertSpacing = 150;  // Plus d'espace entre les générations (avant c'était 120)
    const levelCounts: Record<number, number> = {};

    const traverse = (member: MemberNode, level: number) => {
      if (!levelCounts[level]) levelCounts[level] = 0;
      
      const currentIdStr = member.id.toString();
      const xPos = levelCounts[level] * horizSpacing;
      const yPos = level * vertSpacing;
      
      levelCounts[level] += 1;

      // On revient au nœud de base que tu avais, ultra fiable
      initialNodes.push({
        id: currentIdStr,
        position: { x: xPos, y: yPos },
        data: { 
          label: (
            <div className="flex flex-col items-center justify-center p-3 bg-white border border-[#d3d6e4] rounded-2xl shadow-sm min-w-[130px]">
              <span className="text-[10px] font-black uppercase text-[#313449] tracking-wide">🐼 {member.username}</span>
              <span className="text-[8px] font-bold text-[#8089b0] mt-0.5">EST. {member.arrival_year}</span>
            </div>
          )
        },
        style: { background: 'transparent', border: 'none', padding: 0 },
      });

      const children = childrenMap[currentIdStr] || [];
      children.sort((a, b) => Number(a.arrival_year) - Number(b.arrival_year));

      children.forEach(child => {
        initialEdges.push({
          id: `e-${currentIdStr}-${child.id.toString()}`,
          source: currentIdStr,
          target: child.id.toString(),
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#313449', strokeWidth: 2, opacity: 0.4 },
        });
        traverse(child, level + 1);
      });
    };

    roots.forEach(root => traverse(root, 0));

    setNodes(initialNodes);
    setEdges(initialEdges);
  };

  if (loading) return (
    <div className="text-center py-10 text-[10px] font-black text-[#313449]/30 animate-pulse tracking-[0.3em] uppercase">
      Growing family tree...
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-[#f6f6f9] animate-in slide-in-from-right duration-300">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 p-6 bg-[#f6f6f9] z-10">
        <button onClick={onBack} className="p-2 bg-[#ebecf3] rounded-full text-[#313449] active:scale-95 transition-all">
          <ArrowDown01Icon size={20} className="rotate-90" />
        </button>
        <div>
          <h2 className="text-xl font-black italic uppercase tracking-tighter text-[#313449]">Family Tree</h2>
          <p className="text-[8px] font-bold text-[#8089b0] uppercase tracking-widest mt-0.5">Explore who brought who into the squad</p>
        </div>
      </div>

      {/* ZONE DE GRAPHE INTERACTIVE */}
      <div className="flex-1 w-full bg-[#ebecf3]/30 border-t border-[#d3d6e4]/50 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          nodesConnectable={false}
          nodesDraggable={true}
          elementsSelectable={true}
        >
          <Background color="#d3d6e4" gap={16} size={1} />
          <Controls showInteractive={false} className="!bg-white !border-[#d3d6e4] !rounded-xl !shadow-sm" />
        </ReactFlow>
      </div>

    </div>
  );
}
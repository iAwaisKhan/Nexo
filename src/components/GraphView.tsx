import React, { useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";
import type { Note } from "../types";
import { motion } from "framer-motion";
import { X, ZoomIn, ZoomOut } from "lucide-react";

interface Node extends d3.SimulationNodeDatum {
  id: string;
  title: string;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
}

interface GraphViewProps {
  notes: Note[];
  onNoteClick: (id: string) => void;
  onClose: () => void;
}

const GraphView: React.FC<GraphViewProps> = ({ notes, onNoteClick, onClose }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const graphData = useMemo(() => {
    const nodes: Node[] = notes.map(n => ({ id: n.id, title: n.title || "Untitled" }));
    const links: Link[] = [];

    notes.forEach(note => {
      // Find links in content like [[Title]]
      const linkRegex = /\[\[(.*?)\]\]/g;
      let match;
      while ((match = linkRegex.exec(note.content)) !== null) {
        const targetTitle = match[1];
        const targetNote = notes.find(n => n.title === targetTitle);
        if (targetNote) {
          links.push({
            source: note.id,
            target: targetNote.id
          });
        }
      }
    });

    return { nodes, links };
  }, [notes]);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const simulation = d3.forceSimulation<Node>(graphData.nodes)
      .force("link", d3.forceLink<Node, Link>(graphData.links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(50));

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g");

    const link = g.append("g")
      .attr("stroke", "var(--color-primary)")
      .attr("stroke-opacity", 0.2)
      .selectAll("line")
      .data(graphData.links)
      .join("line")
      .attr("stroke-width", 1);

    const node = g.append("g")
      .selectAll("g")
      .data(graphData.nodes)
      .join("g")
      .call(d3.drag<SVGGElement, Node>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended) as any)
      .on("click", (_event: any, d: Node) => onNoteClick(d.id));

    node.append("circle")
      .attr("r", 6)
      .attr("fill", "var(--color-primary)")
      .attr("stroke", "var(--color-surface)")
      .attr("stroke-width", 2);

    node.append("text")
      .text((d: any) => d.title)
      .attr("x", 10)
      .attr("y", 4)
      .style("font-size", "10px")
      .style("font-weight", "600")
      .style("fill", "var(--color-text)")
      .style("opacity", 0.9)
      .style("pointer-events", "none");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => (d.source as Node).x!)
        .attr("y1", (d: any) => (d.source as Node).y!)
        .attr("x2", (d: any) => (d.target as Node).x!)
        .attr("y2", (d: any) => (d.target as Node).y!);

      node
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
        simulation.stop();
    };
  }, [graphData, onNoteClick]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute inset-4 z-50 bg-surface/95 backdrop-blur-3xl rounded-4xl border border-border/10 overflow-hidden shadow-2xl flex flex-col"
    >
      <div className="p-6 border-b border-border/20 flex items-center justify-between bg-surface/50">
        <div>
          <h3 className="text-xl font-display text-text">Knowledge Graph</h3>
          <p className="text-xs text-text/60 font-bold uppercase tracking-widest mt-1">
            Visualizing {notes.length} notes and {graphData.links.length} connections
          </p>
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={onClose}
                className="p-3 rounded-2xl bg-surface/50 border border-border/10 hover:bg-red-500/10 hover:text-red-500 transition-all group"
            >
                <X className="w-5 h-5 group-active:scale-90" />
            </button>
        </div>
      </div>
      
      <div className="flex-1 relative cursor-grab active:cursor-grabbing">
        <svg ref={svgRef} className="w-full h-full" />
        
        <div className="absolute bottom-8 right-8 flex flex-col gap-2">
            <button className="p-3 rounded-xl bg-surface border border-border/20 shadow-lg hover:bg-primary/10 transition-colors">
                <ZoomIn className="w-5 h-5 text-text/80" />
            </button>
            <button className="p-3 rounded-xl bg-surface border border-border/20 shadow-lg hover:bg-primary/10 transition-colors">
                <ZoomOut className="w-5 h-5 text-text/80" />
            </button>
        </div>
      </div>
    </motion.div>
  );
};

export default GraphView;

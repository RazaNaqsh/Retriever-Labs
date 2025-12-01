import { useState, useRef, useEffect } from 'react';
import type { Chunk } from '../App';
import type { Theme } from '../App';

type Embedding3DViewProps = {
  chunks: Chunk[];
  queryEmbedding: number[] | null;
  theme: Theme;
};

type Point3D = {
  x: number;
  y: number;
  z: number;
  id: string;
  name: string;
  text: string;
  isQuery?: boolean;
};

export function Embedding3DView({ chunks, queryEmbedding, theme }: Embedding3DViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState({ x: 0.5, y: 0.5 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredPoint, setHoveredPoint] = useState<Point3D | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const isNeon = theme === 'neon';

  // Prepare 3D points
  const points3D: Point3D[] = chunks
    .filter(chunk => chunk.embedding && chunk.embedding.length >= 3)
    .map((chunk, index) => ({
      x: chunk.embedding![0],
      y: chunk.embedding![1],
      z: chunk.embedding![2],
      id: chunk.id,
      name: `Chunk ${index + 1}`,
      text: chunk.text,
      isQuery: false,
    }));

  if (queryEmbedding && queryEmbedding.length >= 3) {
    points3D.push({
      x: queryEmbedding[0],
      y: queryEmbedding[1],
      z: queryEmbedding[2],
      id: 'query',
      name: 'Query',
      text: 'Query embedding',
      isQuery: true,
    });
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Project 3D point to 2D
    function project(point: Point3D, rotX: number, rotY: number) {
      // Rotate around Y axis
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const x1 = point.x * cosY - point.z * sinY;
      const z1 = point.x * sinY + point.z * cosY;

      // Rotate around X axis
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const y1 = point.y * cosX - z1 * sinX;
      const z2 = point.y * sinX + z1 * cosX;

      // Perspective projection
      const scale = 200 / (z2 + 3);
      const x2D = centerX + x1 * scale * 80;
      const y2D = centerY - y1 * scale * 80;

      return { x: x2D, y: y2D, z: z2, scale };
    }

    // Sort points by z-depth (back to front)
    const projectedPoints = points3D.map(point => ({
      point,
      projected: project(point, rotation.x, rotation.y),
    })).sort((a, b) => a.projected.z - b.projected.z);

    // Draw axes
    ctx.strokeStyle = isNeon ? 'rgba(139, 92, 246, 0.3)' : 'rgba(99, 102, 241, 0.3)';
    ctx.lineWidth = 1;
    
    // X axis
    const xAxisStart = project({ x: -1, y: 0, z: 0, id: '', name: '', text: '' }, rotation.x, rotation.y);
    const xAxisEnd = project({ x: 1, y: 0, z: 0, id: '', name: '', text: '' }, rotation.x, rotation.y);
    ctx.beginPath();
    ctx.moveTo(xAxisStart.x, xAxisStart.y);
    ctx.lineTo(xAxisEnd.x, xAxisEnd.y);
    ctx.stroke();

    // Y axis
    const yAxisStart = project({ x: 0, y: -1, z: 0, id: '', name: '', text: '' }, rotation.x, rotation.y);
    const yAxisEnd = project({ x: 0, y: 1, z: 0, id: '', name: '', text: '' }, rotation.x, rotation.y);
    ctx.beginPath();
    ctx.moveTo(yAxisStart.x, yAxisStart.y);
    ctx.lineTo(yAxisEnd.x, yAxisEnd.y);
    ctx.stroke();

    // Z axis
    const zAxisStart = project({ x: 0, y: 0, z: -1, id: '', name: '', text: '' }, rotation.x, rotation.y);
    const zAxisEnd = project({ x: 0, y: 0, z: 1, id: '', name: '', text: '' }, rotation.x, rotation.y);
    ctx.beginPath();
    ctx.moveTo(zAxisStart.x, zAxisStart.y);
    ctx.lineTo(zAxisEnd.x, zAxisEnd.y);
    ctx.stroke();

    // Draw points
    projectedPoints.forEach(({ point, projected }) => {
      const radius = 6 * projected.scale;
      const isHovered = hoveredPoint?.id === point.id;

      // Draw glow for neon theme
      if (isNeon) {
        ctx.shadowBlur = isHovered ? 20 : 10;
        ctx.shadowColor = point.isQuery ? '#ff00ff' : '#8b5cf6';
      }

      // Draw point
      ctx.beginPath();
      ctx.arc(projected.x, projected.y, isHovered ? radius * 1.5 : radius, 0, Math.PI * 2);
      ctx.fillStyle = point.isQuery 
        ? (isNeon ? '#ff00ff' : '#ec4899') 
        : (isNeon ? '#8b5cf6' : '#6366f1');
      ctx.fill();

      // Draw ring for hovered point
      if (isHovered) {
        ctx.shadowBlur = 0;
        ctx.strokeStyle = point.isQuery 
          ? (isNeon ? '#ff00ff' : '#ec4899') 
          : (isNeon ? '#8b5cf6' : '#6366f1');
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(projected.x, projected.y, radius * 2, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Reset shadow
      ctx.shadowBlur = 0;
    });

    // Draw labels
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = isNeon ? '#e0e0ff' : '#1e293b';
    
    const xLabelPos = project({ x: 1.2, y: 0, z: 0, id: '', name: '', text: '' }, rotation.x, rotation.y);
    ctx.fillText('X', xLabelPos.x, xLabelPos.y);
    
    const yLabelPos = project({ x: 0, y: 1.2, z: 0, id: '', name: '', text: '' }, rotation.x, rotation.y);
    ctx.fillText('Y', yLabelPos.x, yLabelPos.y);
    
    const zLabelPos = project({ x: 0, y: 0, z: 1.2, id: '', name: '', text: '' }, rotation.x, rotation.y);
    ctx.fillText('Z', zLabelPos.x, zLabelPos.y);
  }, [rotation, points3D, hoveredPoint, isNeon]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    setMousePos({ x: e.clientX, y: e.clientY });

    if (isDragging) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      setRotation({
        x: rotation.x + deltaY * 0.01,
        y: rotation.y + deltaX * 0.01,
      });
      setDragStart({ x: e.clientX, y: e.clientY });
    } else {
      // Check if hovering over a point
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      function project(point: Point3D, rotX: number, rotY: number) {
        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);
        const x1 = point.x * cosY - point.z * sinY;
        const z1 = point.x * sinY + point.z * cosY;

        const cosX = Math.cos(rotX);
        const sinX = Math.sin(rotX);
        const y1 = point.y * cosX - z1 * sinX;
        const z2 = point.y * sinX + z1 * cosX;

        const scale = 200 / (z2 + 3);
        const x2D = centerX + x1 * scale * 80;
        const y2D = centerY - y1 * scale * 80;

        return { x: x2D, y: y2D, scale };
      }

      let foundPoint: Point3D | null = null;
      for (const point of points3D) {
        const projected = project(point, rotation.x, rotation.y);
        const distance = Math.sqrt(
          Math.pow(mouseX - projected.x, 2) + Math.pow(mouseY - projected.y, 2)
        );
        const radius = 6 * projected.scale;
        if (distance < radius * 1.5) {
          foundPoint = point;
          break;
        }
      }
      setHoveredPoint(foundPoint);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setHoveredPoint(null);
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        className="w-full cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{ touchAction: 'none' }}
      />
      
      {/* Tooltip */}
      {hoveredPoint && (
        <div
          className={`fixed z-50 max-w-xs p-3 rounded-lg shadow-lg pointer-events-none ${
            isNeon
              ? 'bg-[#1a1a2e] border-2 border-[#8b5cf6] text-[#e0e0ff]'
              : 'bg-white border-2 border-indigo-200 text-gray-900'
          }`}
          style={{
            left: `${mousePos.x + 15}px`,
            top: `${mousePos.y + 15}px`,
          }}
        >
          <div className={`mb-1 ${isNeon ? 'text-[#8b5cf6]' : 'text-indigo-700'}`}>
            {hoveredPoint.name}
          </div>
          <div className={`text-sm ${isNeon ? 'text-[#c0c0ff]' : 'text-gray-700'}`}>
            {hoveredPoint.text.substring(0, 120)}
            {hoveredPoint.text.length > 120 && '...'}
          </div>
        </div>
      )}
      
      <p className={`text-xs text-center mt-2 ${isNeon ? 'text-[#6060a0]' : 'text-gray-500'}`}>
        Drag to rotate • Hover over points to see chunk content
      </p>
    </div>
  );
}

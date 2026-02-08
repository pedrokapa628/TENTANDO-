
import React from 'react';

interface StatBarProps {
  label: string;
  value: number;
  max: number;
  colorClass: string;
}

const StatBar: React.FC<StatBarProps> = ({ label, value, max, colorClass }) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  return (
    <div className="mb-4">
      <div className="flex justify-between items-end mb-1">
        <span className="text-xs font-orbitron text-slate-400 uppercase tracking-widest">{label}</span>
        <span className="text-xs font-mono text-slate-200">{value}/{max}</span>
      </div>
      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
        <div 
          className={`h-full transition-all duration-1000 ease-out ${colorClass}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default StatBar;

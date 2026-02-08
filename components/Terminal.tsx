
import React, { useEffect, useRef } from 'react';

interface TerminalProps {
  text: string;
  onComplete?: () => void;
}

const Terminal: React.FC<TerminalProps> = ({ text, onComplete }) => {
  const [displayedText, setDisplayedText] = React.useState('');
  const [index, setIndex] = React.useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDisplayedText('');
    setIndex(0);
  }, [text]);

  useEffect(() => {
    if (index < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, 15);
      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [index, text, onComplete]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [displayedText]);

  return (
    <div 
      ref={containerRef}
      className="bg-black/40 border border-slate-800 rounded-lg p-6 font-mono text-sm md:text-base leading-relaxed h-full overflow-y-auto relative"
    >
      <div className="absolute top-2 left-2 flex gap-1.5">
        <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
        <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
        <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
      </div>
      <div className="mt-4 text-violet-400 opacity-80 mb-2">
        {">"} CACHE_DUMP_STREAM_INIT...
      </div>
      <div className="whitespace-pre-wrap text-slate-200">
        {displayedText}
        <span className="inline-block w-2 h-5 bg-violet-500 ml-1 animate-pulse align-middle"></span>
      </div>
    </div>
  );
};

export default Terminal;

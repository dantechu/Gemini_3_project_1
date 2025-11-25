import React from 'react';

interface SentimentGaugeProps {
  score: number;
  size?: number;
}

const SentimentGauge: React.FC<SentimentGaugeProps> = ({ score, size = 60 }) => {
  // Score 0-100. 
  // 0 = Red (Bearish), 50 = Yellow (Neutral), 100 = Green (Bullish)
  
  const radius = size * 0.42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  let color = '#f59e0b'; // Neutral
  if (score >= 60) color = '#10b981'; // Bullish
  if (score <= 40) color = '#f43f5e'; // Bearish

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background Circle */}
      <svg className="transform -rotate-90 w-full h-full">
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="3"
          fill="transparent"
        />
        {/* Progress Circle */}
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          stroke={color}
          strokeWidth="3"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          filter="url(#glow)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold font-mono text-white leading-none" style={{ textShadow: `0 0 10px ${color}` }}>
            {Math.round(score)}
        </span>
      </div>
    </div>
  );
};

export default SentimentGauge;
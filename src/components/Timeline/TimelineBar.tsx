import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { getReliableGibsDate, formatToIsoDate } from '../../adapters/gibsAdapter';

interface TimelineBarProps {
  currentDate: string;
  onDateChange: (date: string) => void;
}

export const TimelineBar: React.FC<TimelineBarProps> = ({
  currentDate,
  onDateChange
}) => {
  const todayStr = formatToIsoDate(new Date());
  const yesterdayStr = getReliableGibsDate(1);
  const weekAgoStr = getReliableGibsDate(7);

  const handleStepDay = (delta: number) => {
    const d = new Date(currentDate);
    d.setUTCDate(d.getUTCDate() + delta);
    const newStr = formatToIsoDate(d);
    if (newStr <= todayStr && newStr >= '2000-02-24') {
      onDateChange(newStr);
    }
  };

  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 bg-white/95 border border-[#e4dfd5] rounded-xl px-4 py-2.5 shadow-paper-lg flex flex-col md:flex-row items-center gap-3.5 backdrop-blur-sm select-none">
      {/* Label */}
      <div className="flex items-center gap-2 border-r border-[#e4dfd5] pr-3.5">
        <Calendar className="w-4 h-4 text-[#275273]" />
        <div>
          <span className="text-[10px] font-mono text-[#636c76] uppercase tracking-wider block leading-none">
            Observation Epoch
          </span>
          <span className="text-xs font-semibold text-[#1c2024] font-serif">
            NASA GIBS Pass
          </span>
        </div>
      </div>

      {/* Date Stepper */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => handleStepDay(-1)}
          className="p-1.5 rounded-lg bg-[#f7f5f0] border border-[#ded8cb] hover:bg-[#ede9e0] text-[#1c2024] transition shadow-pill"
          title="Previous Observation Day"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <input
          type="date"
          value={currentDate}
          min="2000-02-24"
          max={todayStr}
          onChange={(e) => e.target.value && onDateChange(e.target.value)}
          className="bg-[#f7f5f0] border border-[#ded8cb] rounded-lg px-2.5 py-1 text-xs font-mono font-medium text-[#1c2024] focus:outline-none focus:border-[#275273] focus:bg-white transition cursor-pointer"
        />

        <button
          onClick={() => handleStepDay(1)}
          disabled={currentDate >= todayStr}
          className="p-1.5 rounded-lg bg-[#f7f5f0] border border-[#ded8cb] hover:bg-[#ede9e0] text-[#1c2024] disabled:opacity-30 disabled:cursor-not-allowed transition shadow-pill"
          title="Next Observation Day"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Observation Presets */}
      <div className="flex items-center gap-1 border-l border-[#e4dfd5] pl-3">
        <button
          onClick={() => onDateChange(yesterdayStr)}
          className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition border ${
            currentDate === yesterdayStr
              ? 'bg-[#edf4f9] text-[#275273] border-[#b8d4e8]'
              : 'bg-white text-[#636c76] border-[#ded8cb] hover:bg-[#f7f5f0]'
          }`}
          title="Full global swath stitched coverage"
        >
          Yesterday (Optimal Swath)
        </button>
        <button
          onClick={() => onDateChange(todayStr)}
          className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition border ${
            currentDate === todayStr
              ? 'bg-[#edf5ef] text-[#265434] border-[#bad8c2]'
              : 'bg-white text-[#636c76] border-[#ded8cb] hover:bg-[#f7f5f0]'
          }`}
          title="Near Real Time orbit processing"
        >
          Today (NRT)
        </button>
        <button
          onClick={() => onDateChange(weekAgoStr)}
          className="hidden sm:inline-block px-2.5 py-1 rounded-md text-[11px] font-medium bg-white text-[#636c76] border border-[#ded8cb] hover:bg-[#f7f5f0] transition"
        >
          -7 Days
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

interface HonestEmptyStateProps {
  title: string;
  description: string;
  unmetDependency?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const HonestEmptyState: React.FC<HonestEmptyStateProps> = ({
  title,
  description,
  unmetDependency,
  actionText,
  onAction,
  className = ''
}) => {
  return (
    <div className={`p-6 border border-[#ded8cb] bg-[#fcfbf9] rounded-xl text-center flex flex-col items-center justify-center shadow-pill ${className}`}>
      <div className="w-10 h-10 rounded-full bg-[#f2eee8] border border-[#ded8cb] flex items-center justify-center text-[#8f5635] mb-3">
        <Info className="w-5 h-5" />
      </div>

      <h4 className="font-serif text-sm font-semibold text-[#1c2024] mb-1.5">{title}</h4>
      <p className="text-xs text-[#636c76] max-w-sm mb-3.5 leading-relaxed">{description}</p>

      {unmetDependency && (
        <div className="w-full max-w-sm bg-white border border-[#ded8cb] rounded-lg px-3 py-2 text-left mb-3.5 shadow-pill">
          <span className="text-[9px] uppercase tracking-wider text-[#8a94a0] block font-mono">
            Pipeline Connection Status
          </span>
          <span className="text-xs font-mono text-[#8f5635] block truncate mt-0.5">
            {unmetDependency}
          </span>
        </div>
      )}

      <div className="flex items-center gap-1.5 text-[11px] text-[#265434] bg-[#edf5ef] border border-[#bad8c2] px-3 py-1 rounded-full mb-3">
        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
        <span className="font-medium">Scientific Integrity Standard: No fabricated records displayed</span>
      </div>

      {actionText && onAction && (
        <button
          onClick={onAction}
          className="text-xs font-medium text-[#275273] hover:text-[#1c2024] bg-white hover:bg-[#f7f5f0] border border-[#ded8cb] px-3.5 py-1.5 rounded-lg transition shadow-pill"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

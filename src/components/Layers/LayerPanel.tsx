import React, { useState } from 'react';
import { 
  Layers, 
  Eye, 
  EyeOff, 
  Sliders, 
  Info, 
  X, 
  ChevronUp, 
  ChevronDown, 
  Sun, 
  Thermometer, 
  Moon, 
  Wind 
} from 'lucide-react';
import { GibsLayerConfig, ActiveLayerState } from '../../types';
import { LayerMetadataModal } from '../Common/LayerMetadataModal';

interface LayerPanelProps {
  activeLayers: ActiveLayerState[];
  onToggleLayer: (layerId: string) => void;
  onChangeOpacity: (layerId: string, opacity: number) => void;
  onMoveLayer: (layerId: string, direction: 'up' | 'down') => void;
  onClose: () => void;
}

export const LayerPanel: React.FC<LayerPanelProps> = ({
  activeLayers,
  onToggleLayer,
  onChangeOpacity,
  onMoveLayer,
  onClose,
}) => {
  const [selectedMetaLayer, setSelectedMetaLayer] = useState<GibsLayerConfig | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'imagery' | 'environmental' | 'night' | 'atmosphere'>('all');

  const filteredLayers = activeLayers.filter(item => {
    if (categoryFilter === 'all') return true;
    return item.layer.category === categoryFilter;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'imagery': return <Sun className="w-3.5 h-3.5 text-[#265434]" />;
      case 'environmental': return <Thermometer className="w-3.5 h-3.5 text-[#8f5635]" />;
      case 'night': return <Moon className="w-3.5 h-3.5 text-[#275273]" />;
      case 'atmosphere': return <Wind className="w-3.5 h-3.5 text-[#636c76]" />;
      default: return <Layers className="w-3.5 h-3.5 text-[#636c76]" />;
    }
  };

  return (
    <div className="absolute top-20 left-6 z-20 w-88 max-w-[calc(100vw-3rem)] bg-white/95 border border-[#e4dfd5] rounded-xl shadow-paper-lg backdrop-blur-md flex flex-col max-h-[calc(100vh-8rem)] animate-atlas-appear select-none">
      {/* Panel Header */}
      <div className="p-4 border-b border-[#e4dfd5] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#275273]" />
            <h2 className="font-serif text-sm font-semibold text-[#1c2024]">
              Earth Observation Layers
            </h2>
          </div>
          <p className="text-[10px] font-mono text-[#636c76] mt-0.5">
            NASA GIBS WMTS Scientific Products
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-[#636c76] hover:text-[#1c2024] hover:bg-[#f7f5f0] transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="px-3 py-2 border-b border-[#e4dfd5] bg-[#fcfbf9] flex items-center gap-1 overflow-x-auto text-[11px]">
        {(['all', 'imagery', 'environmental', 'night', 'atmosphere'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-2 py-1 rounded-md capitalize whitespace-nowrap transition font-medium ${
              categoryFilter === cat
                ? 'bg-white text-[#1c2024] border border-[#ded8cb] shadow-pill'
                : 'text-[#636c76] hover:text-[#1c2024] border border-transparent'
            }`}
          >
            {cat === 'imagery' ? 'Reflectance' : cat === 'environmental' ? 'Thermal' : cat}
          </button>
        ))}
      </div>

      {/* Layers List */}
      <div className="p-3.5 overflow-y-auto space-y-2.5 flex-1">
        {filteredLayers.map((item, idx) => {
          const { layer, visible, opacity } = item;
          return (
            <div
              key={layer.id}
              className={`p-3 rounded-lg border transition ${
                visible
                  ? 'bg-[#fcfbf9] border-[#ded8cb] shadow-pill'
                  : 'bg-white border-[#f2eee8] opacity-75'
              }`}
            >
              {/* Title & Top Controls */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-start gap-2.5">
                  <button
                    onClick={() => onToggleLayer(layer.id)}
                    className={`mt-0.5 p-1 rounded-md transition ${
                      visible
                        ? 'bg-[#edf4f9] text-[#275273] border border-[#b8d4e8]'
                        : 'bg-[#f7f5f0] text-[#8a94a0] border border-[#e4dfd5]'
                    }`}
                    title={visible ? 'Hide Layer' : 'Show Layer'}
                  >
                    {visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>

                  <div>
                    <div className="flex items-center gap-1.5">
                      {getCategoryIcon(layer.category)}
                      <h4 className="text-xs font-semibold text-[#1c2024]">{layer.title}</h4>
                    </div>
                    <p className="text-[10px] text-[#636c76] font-mono mt-0.5">{layer.sensor}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSelectedMetaLayer(layer)}
                    className="p-1 text-[#636c76] hover:text-[#1c2024] hover:bg-[#f7f5f0] rounded transition"
                    title="View Scientific Specifications"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex flex-col">
                    <button
                      onClick={() => onMoveLayer(layer.id, 'up')}
                      disabled={idx === 0}
                      className="text-[#8a94a0] hover:text-[#1c2024] disabled:opacity-20 transition"
                      title="Move Layer Higher"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onMoveLayer(layer.id, 'down')}
                      disabled={idx === filteredLayers.length - 1}
                      className="text-[#8a94a0] hover:text-[#1c2024] disabled:opacity-20 transition"
                      title="Move Layer Lower"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Opacity Slider */}
              {visible && (
                <div className="mt-2 pt-2 border-t border-[#ede9e0] flex items-center gap-2">
                  <Sliders className="w-3 h-3 text-[#8a94a0]" />
                  <span className="text-[10px] font-mono text-[#636c76] w-9">
                    {Math.round(opacity * 100)}%
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={opacity}
                    onChange={(e) => onChangeOpacity(layer.id, parseFloat(e.target.value))}
                    className="flex-1 h-1 bg-[#ede9e0] rounded-lg appearance-none cursor-pointer accent-[#275273]"
                  />
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#f7f5f0] text-[#636c76] border border-[#ded8cb]">
                    {layer.resolution}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Layer Scientific Metadata Modal */}
      {selectedMetaLayer && (
        <LayerMetadataModal
          layer={selectedMetaLayer}
          onClose={() => setSelectedMetaLayer(null)}
        />
      )}
    </div>
  );
};

import React from 'react';
import { X, Satellite, Info, ShieldAlert, Compass, Layers } from 'lucide-react';
import { GibsLayerConfig, PlanetaryLayerConfig } from '../../types';

interface LayerMetadataModalProps {
  layer: GibsLayerConfig | PlanetaryLayerConfig | null;
  onClose: () => void;
}

export const LayerMetadataModal: React.FC<LayerMetadataModalProps> = ({ layer, onClose }) => {
  if (!layer) return null;

  const isGibs = 'tileMatrixSet' in layer;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-atlas-appear">
      <div className="bg-white border border-[#ded8cb] rounded-xl max-w-xl w-full max-h-[85vh] overflow-y-auto shadow-paper-lg flex flex-col text-[#1c2024]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e4dfd5] bg-[#fcfbf9] sticky top-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#edf4f9] border border-[#b8d4e8] text-[#275273] flex items-center justify-center">
              <Satellite className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-semibold text-[#1c2024]">{layer.title}</h3>
              <p className="text-[11px] font-mono text-[#636c76]">
                {isGibs ? (layer as GibsLayerConfig).sensor : (layer as PlanetaryLayerConfig).mission}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#636c76] hover:text-[#1c2024] hover:bg-[#f2eee8] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs leading-relaxed">
          {/* Overview */}
          <div>
            <h4 className="font-semibold text-[#1c2024] uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#275273]" />
              Dataset Description
            </h4>
            <p className="text-[#4a5058] bg-[#fcfbf9] p-3 rounded-lg border border-[#ede9e0]">
              {layer.description}
            </p>
          </div>

          {/* Technical Specifications Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-[#fcfbf9] border border-[#ded8cb] p-2.5 rounded-lg">
              <span className="text-[10px] text-[#8a94a0] font-mono uppercase block">Spatial Resolution</span>
              <span className="font-semibold text-[#1c2024] font-mono text-[11px]">{layer.resolution}</span>
            </div>
            <div className="bg-[#fcfbf9] border border-[#ded8cb] p-2.5 rounded-lg">
              <span className="text-[10px] text-[#8a94a0] font-mono uppercase block">Coordinate Reference System</span>
              <span className="font-semibold text-[#265434] font-mono text-[11px]">
                {isGibs ? (layer as GibsLayerConfig).crs : 'Planetary Cylindrical (EPSG:3857/4326 Compatible)'}
              </span>
            </div>
            {isGibs && (
              <>
                <div className="bg-[#fcfbf9] border border-[#ded8cb] p-2.5 rounded-lg">
                  <span className="text-[10px] text-[#8a94a0] font-mono uppercase block">Tile Matrix Set</span>
                  <span className="font-semibold text-[#275273] font-mono text-[11px]">
                    {(layer as GibsLayerConfig).tileMatrixSet}
                  </span>
                </div>
                <div className="bg-[#fcfbf9] border border-[#ded8cb] p-2.5 rounded-lg">
                  <span className="text-[10px] text-[#8a94a0] font-mono uppercase block">Image Encoding</span>
                  <span className="font-semibold text-[#8f5635] font-mono text-[11px] uppercase">
                    {(layer as GibsLayerConfig).format} (Calibrated Raster)
                  </span>
                </div>
              </>
            )}
            {!isGibs && (
              <div className="bg-[#fcfbf9] border border-[#ded8cb] p-2.5 rounded-lg col-span-2">
                <span className="text-[10px] text-[#8a94a0] font-mono uppercase block">Dataset Attribution</span>
                <span className="text-[#4a5058] font-mono text-[11px]">
                  {(layer as PlanetaryLayerConfig).attribution}
                </span>
              </div>
            )}
          </div>

          {/* Scientific Purpose / Analog Relevance */}
          <div>
            <h4 className="font-semibold text-[#1c2024] uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#265434]" />
              {isGibs ? 'Scientific Notes & Planetary Analog Relevance' : 'Planetary Geomorphology Relevance'}
            </h4>
            <div className="text-[#4a5058] bg-[#fcfbf9] p-3 rounded-lg border border-[#ede9e0]">
              {isGibs
                ? (layer as GibsLayerConfig).scientificNotes
                : (layer as PlanetaryLayerConfig).geologicalRelevance}
            </div>
          </div>

          {/* Limitations & Data Quality */}
          {isGibs && (
            <div>
              <h4 className="font-semibold text-[#8f5635] uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-[#8f5635]" />
                Observational Constraints & Data Quality
              </h4>
              <div className="text-[#8f5635] bg-[#fbf3ed] p-3 rounded-lg border border-[#f0dacb] text-[11px]">
                {(layer as GibsLayerConfig).dataQualityLimitations}
              </div>
            </div>
          )}

          {/* Documentation Link */}
          <div className="pt-3 border-t border-[#ede9e0] flex items-center justify-between text-[11px] text-[#636c76]">
            <span>Official Scientific Data Service</span>
            <a
              href={isGibs ? "https://nasa-gibs.github.io/gibs-api-docs/" : "https://trek.nasa.gov/"}
              target="_blank"
              rel="noreferrer"
              className="text-[#275273] hover:underline flex items-center gap-1 font-medium"
            >
              <Compass className="w-3.5 h-3.5" />
              Service Specifications
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

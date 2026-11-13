import React, { useState } from 'react';
import { 
  Globe2, 
  Map as MapIcon, 
  Search, 
  Layers, 
  BookOpen, 
  Crosshair, 
  Loader2, 
  Compass, 
  Orbit 
} from 'lucide-react';
import { searchGeographicLocation } from '../../adapters/geocodingAdapter';
import { GeocodingResult } from '../../types';

interface HeaderProps {
  isGlobe: boolean;
  onToggleProjection: () => void;
  activePanel: 'layers' | 'candidates' | 'inspector' | 'planetary' | null;
  onSelectPanel: (panel: 'layers' | 'candidates' | 'inspector' | 'planetary' | null) => void;
  onFlyToLocation: (lng: number, lat: number, zoom?: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  isGlobe,
  onToggleProjection,
  activePanel,
  onSelectPanel,
  onFlyToLocation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setShowDropdown(true);
    try {
      const results = await searchGeographicLocation(searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error(err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (result: GeocodingResult) => {
    onFlyToLocation(result.lon, result.lat, 8);
    setShowDropdown(false);
    setSearchQuery(result.displayName.split(',')[0]);
  };

  return (
    <header className="h-16 bg-[#fcfbf9] border-b border-[#e4dfd5] px-6 flex items-center justify-between z-30 relative select-none">
      {/* Brand & Editorial Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#265434] text-white flex items-center justify-center shadow-sm">
            <Compass className="w-4 h-4 text-[#eaf2ec]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-lg font-semibold tracking-tight text-[#1c2024] leading-none">
                Earth Analog Finder
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#f2eee8] text-[#636c76] border border-[#ded8cb]">
                Role 05
              </span>
            </div>
            <p className="text-[11px] text-[#636c76] mt-0.5 flex items-center gap-1.5">
              <span>Scientific Atlas & Spatial Exploration</span>
              <span className="text-[#ded8cb]">·</span>
              <span className="text-[#265434] font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#265434]"></span>
                NASA Real Data
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Cartographic Search Bar */}
      <div className="relative w-80 max-w-sm hidden md:block">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
            placeholder="Search geographic locations (e.g. Devon Island, Atacama)..."
            className="w-full bg-[#f7f5f0] border border-[#ded8cb] rounded-lg pl-8 pr-8 py-1.5 text-xs text-[#1c2024] placeholder-[#8a94a0] focus:outline-none focus:border-[#265434] focus:bg-white transition"
          />
          <Search className="w-3.5 h-3.5 text-[#636c76] absolute left-2.5 top-2.5" />
          {isSearching && (
            <Loader2 className="w-3.5 h-3.5 text-[#265434] animate-spin absolute right-2.5 top-2.5" />
          )}
        </form>

        {/* Dropdown Results */}
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#e4dfd5] rounded-lg shadow-paper-lg overflow-hidden z-50 animate-atlas-appear">
            <div className="px-3 py-1.5 bg-[#f7f5f0] border-b border-[#e4dfd5] text-[10px] font-mono text-[#636c76] uppercase tracking-wider">
              Geographic Gazetteer Results
            </div>
            <div className="max-h-60 overflow-y-auto">
              {searchResults.map((res, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectResult(res)}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-[#f7f5f0] text-[#1c2024] border-b border-[#f2eee8] last:border-0 flex flex-col transition"
                >
                  <span className="font-medium truncate">{res.displayName}</span>
                  <span className="text-[10px] font-mono text-[#636c76] mt-0.5">
                    {res.lat.toFixed(4)}°, {res.lon.toFixed(4)}°
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tools & Mode Switcher */}
      <div className="flex items-center gap-2">
        {/* 2D / 3D Segmented Control */}
        <div className="bg-[#f2eee8] p-1 rounded-lg border border-[#ded8cb] flex items-center gap-0.5">
          <button
            onClick={() => isGlobe && onToggleProjection()}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition ${
              !isGlobe
                ? 'bg-white text-[#1c2024] shadow-sm font-semibold'
                : 'text-[#636c76] hover:text-[#1c2024]'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5 text-[#265434]" />
            <span>2D Atlas</span>
          </button>
          <button
            onClick={() => !isGlobe && onToggleProjection()}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition ${
              isGlobe
                ? 'bg-white text-[#1c2024] shadow-sm font-semibold'
                : 'text-[#636c76] hover:text-[#1c2024]'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5 text-[#275273]" />
            <span>3D Globe</span>
          </button>
        </div>

        {/* Panel Toggles */}
        <div className="flex items-center gap-1 pl-2 border-l border-[#e4dfd5]">
          <button
            onClick={() => onSelectPanel(activePanel === 'layers' ? null : 'layers')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
              activePanel === 'layers'
                ? 'bg-[#275273] text-white border-[#275273] shadow-sm'
                : 'bg-white border-[#ded8cb] text-[#4a5058] hover:bg-[#f7f5f0]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Layers</span>
          </button>

          <button
            onClick={() => onSelectPanel(activePanel === 'candidates' ? null : 'candidates')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
              activePanel === 'candidates'
                ? 'bg-[#8f5635] text-white border-[#8f5635] shadow-sm'
                : 'bg-white border-[#ded8cb] text-[#4a5058] hover:bg-[#f7f5f0]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Field Analogs</span>
          </button>

          <button
            onClick={() => onSelectPanel(activePanel === 'planetary' ? null : 'planetary')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
              activePanel === 'planetary'
                ? 'bg-[#8f5635] text-white border-[#8f5635] shadow-sm'
                : 'bg-white border-[#ded8cb] text-[#4a5058] hover:bg-[#f7f5f0]'
            }`}
          >
            <Orbit className="w-3.5 h-3.5 text-[#8f5635]" />
            <span>Planetary</span>
          </button>

          <button
            onClick={() => onSelectPanel(activePanel === 'inspector' ? null : 'inspector')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
              activePanel === 'inspector'
                ? 'bg-[#265434] text-white border-[#265434] shadow-sm'
                : 'bg-white border-[#ded8cb] text-[#4a5058] hover:bg-[#f7f5f0]'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5 text-[#265434]" />
            <span>Inspector</span>
          </button>
        </div>
      </div>
    </header>
  );
};

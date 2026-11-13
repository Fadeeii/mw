import React, { useState } from 'react';
import { 
  Database, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ExternalLink, 
  MapPin, 
  BookOpen, 
  ShieldCheck, 
  Compass, 
  Layers,
  Eye,
  EyeOff
} from 'lucide-react';
import { VERIFIED_SCIENTIFIC_ANALOGS, validateCandidateGeoJSON } from '../../adapters/candidateAdapter';
import { CandidateFeatureCollection } from '../../types';
import { HonestEmptyState } from '../Common/HonestEmptyState';

interface CandidateManagerProps {
  onFlyToLocation: (lng: number, lat: number, zoom?: number) => void;
  onImportCandidateCollection: (collection: CandidateFeatureCollection | null) => void;
  importedCollection: CandidateFeatureCollection | null;
  showFieldAnalogs: boolean;
  onToggleFieldAnalogs: () => void;
  onClose: () => void;
}

export const CandidateManager: React.FC<CandidateManagerProps> = ({
  onFlyToLocation,
  onImportCandidateCollection,
  importedCollection,
  showFieldAnalogs,
  onToggleFieldAnalogs,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'verified' | 'ingest' | 'coverage'>('verified');
  const [pastedJson, setPastedJson] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      processGeoJson(content);
    };
    reader.readAsText(file);
  };

  const handleProcessPasted = () => {
    if (!pastedJson.trim()) return;
    processGeoJson(pastedJson);
  };

  const processGeoJson = (content: string) => {
    setValidationErrors([]);
    setSuccessMsg(null);

    const report = validateCandidateGeoJSON(content);
    if (!report.isValid) {
      setValidationErrors(report.errors);
      return;
    }

    if (report.collection) {
      onImportCandidateCollection(report.collection);
      setSuccessMsg(`Successfully validated and mapped ${report.featureCount} candidate features.`);
    }
  };

  const handleClearImported = () => {
    onImportCandidateCollection(null);
    setPastedJson('');
    setSuccessMsg(null);
    setValidationErrors([]);
  };

  return (
    <div className="absolute top-20 left-6 z-20 w-96 max-w-[calc(100vw-3rem)] bg-white/95 border border-[#e4dfd5] rounded-xl shadow-paper-lg backdrop-blur-md flex flex-col max-h-[calc(100vh-8rem)] animate-atlas-appear select-none">
      {/* Header */}
      <div className="p-4 border-b border-[#e4dfd5] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <Database className="w-4 h-4 text-[#8f5635]" />
            <h2 className="font-serif text-sm font-semibold text-[#1c2024]">
              Terrestrial Field Analogs
            </h2>
          </div>
          <p className="text-[10px] font-mono text-[#636c76] mt-0.5">
            Peer-Reviewed Benchmarks & Ingest Pipeline
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-[#636c76] hover:text-[#1c2024] hover:bg-[#f7f5f0] transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="px-3 py-2 border-b border-[#e4dfd5] bg-[#fcfbf9] flex items-center gap-1 text-[11px]">
        <button
          onClick={() => setActiveTab('verified')}
          className={`flex-1 py-1 px-2 rounded-md font-medium text-center transition ${
            activeTab === 'verified'
              ? 'bg-white text-[#1c2024] border border-[#ded8cb] shadow-pill'
              : 'text-[#636c76] hover:text-[#1c2024] border border-transparent'
          }`}
        >
          Field Sites ({VERIFIED_SCIENTIFIC_ANALOGS.length})
        </button>
        <button
          onClick={() => setActiveTab('ingest')}
          className={`flex-1 py-1 px-2 rounded-md font-medium text-center transition ${
            activeTab === 'ingest'
              ? 'bg-white text-[#1c2024] border border-[#ded8cb] shadow-pill'
              : 'text-[#636c76] hover:text-[#1c2024] border border-transparent'
          }`}
        >
          Role 03 Ingest {importedCollection ? `(${importedCollection.features.length})` : ''}
        </button>
        <button
          onClick={() => setActiveTab('coverage')}
          className={`py-1 px-2.5 rounded-md font-medium text-center transition ${
            activeTab === 'coverage'
              ? 'bg-white text-[#1c2024] border border-[#ded8cb] shadow-pill'
              : 'text-[#636c76] hover:text-[#1c2024] border border-transparent'
          }`}
        >
          Coverage
        </button>
      </div>

      {/* Content */}
      <div className="p-3.5 overflow-y-auto space-y-3 flex-1 text-xs">
        {/* Tab 1: Verified Field Sites */}
        {activeTab === 'verified' && (
          <div className="space-y-3">
            {/* Map Visibility Toggle Switch */}
            <div className="p-2.5 bg-[#fcfbf9] border border-[#ded8cb] rounded-lg flex items-center justify-between shadow-pill">
              <div>
                <span className="text-xs font-semibold text-[#1c2024] block">
                  Map Markers Visibility
                </span>
                <span className="text-[10px] text-[#636c76]">
                  {showFieldAnalogs ? 'Markers visible on map' : 'Markers hidden (atlas is clean)'}
                </span>
              </div>
              <button
                onClick={onToggleFieldAnalogs}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition ${
                  showFieldAnalogs
                    ? 'bg-[#8f5635] text-white border-[#8f5635] shadow-pill'
                    : 'bg-white text-[#636c76] border-[#ded8cb] hover:bg-[#f7f5f0]'
                }`}
              >
                {showFieldAnalogs ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{showFieldAnalogs ? 'Visible' : 'Hidden'}</span>
              </button>
            </div>

            <div className="bg-[#edf5ef] border border-[#bad8c2] p-2.5 rounded-lg text-[11px] text-[#265434] flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#265434] shrink-0 mt-0.5" />
              <span>
                <strong>Academic Provenance:</strong> Every site below is a published planetary research station with documented Apollo/NASA mission campaigns and peer-reviewed literature DOIs.
              </span>
            </div>

            {VERIFIED_SCIENTIFIC_ANALOGS.map((site) => (
              <div
                key={site.id}
                className="bg-[#fcfbf9] border border-[#ded8cb] p-3 rounded-lg hover:border-[#8f5635]/60 transition shadow-pill"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div>
                    <h3 className="font-serif text-sm font-semibold text-[#1c2024] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#8f5635]" />
                      {site.name}
                    </h3>
                    <p className="text-[10px] text-[#636c76] font-mono">{site.locationName}</p>
                  </div>
                  <button
                    onClick={() => {
                      if (!showFieldAnalogs) onToggleFieldAnalogs();
                      onFlyToLocation(site.coordinates[0], site.coordinates[1], 10);
                    }}
                    className="px-2.5 py-1 rounded-md bg-white hover:bg-[#f7f5f0] text-[#1c2024] border border-[#ded8cb] text-[10px] font-medium flex items-center gap-1 transition shadow-pill"
                    title="Center atlas on this analog"
                  >
                    <Compass className="w-3 h-3 text-[#275273]" />
                    View
                  </button>
                </div>

                <div className="flex flex-wrap gap-1 my-2">
                  {site.planetaryAnalogs.map((target) => (
                    <span
                      key={target}
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                        target === 'Mars'
                          ? 'bg-[#fbf3ed] text-[#8f5635] border-[#f0dacb]'
                          : 'bg-[#edf4f9] text-[#275273] border-[#bad8e9]'
                      }`}
                    >
                      {target} Analog
                    </span>
                  ))}
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white text-[#4a5058] border border-[#ded8cb]">
                    {site.analogType}
                  </span>
                </div>

                <p className="text-[11px] text-[#4a5058] leading-relaxed italic mb-2.5 bg-white p-2 rounded border border-[#f2eee8]">
                  "{site.abstractExcerpt}"
                </p>

                <div className="pt-2 border-t border-[#ede9e0] text-[10px] space-y-1">
                  <div className="text-[#636c76] flex items-start gap-1">
                    <BookOpen className="w-3 h-3 text-[#8a94a0] shrink-0 mt-0.5" />
                    <span className="truncate">{site.literatureCitation}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#8a94a0] font-mono">
                    <span>Mission: {site.nasaMissionConnection.split('(')[0]}</span>
                    <a
                      href={`https://doi.org/${site.doi}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#275273] hover:underline flex items-center gap-0.5 font-sans font-medium"
                    >
                      DOI: {site.doi}
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Role 03 Candidate Ingest & Validation */}
        {activeTab === 'ingest' && (
          <div className="space-y-3">
            {importedCollection && importedCollection.features.length > 0 ? (
              <div className="bg-[#fcfbf9] border border-[#bad8c2] p-3 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[#265434] font-semibold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>External Dataset Mapped</span>
                  </div>
                  <button
                    onClick={handleClearImported}
                    className="text-[10px] text-[#8f5635] hover:underline font-medium"
                  >
                    Clear Dataset
                  </button>
                </div>
                <div className="text-[11px] text-[#4a5058]">
                  Displaying <strong>{importedCollection.features.length}</strong> candidate locations validated against WGS84 coordinates.
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {importedCollection.features.map((f, i) => (
                    <div key={i} className="p-2 bg-white rounded border border-[#ded8cb] flex items-center justify-between text-[10px]">
                      <span className="text-[#1c2024] font-medium truncate max-w-[190px]">
                        {f.properties?.name || `Candidate Feature #${i + 1}`}
                      </span>
                      {f.geometry.type === 'Point' && (
                        <button
                          onClick={() => onFlyToLocation(f.geometry.coordinates[0], f.geometry.coordinates[1], 10)}
                          className="text-[#275273] hover:underline font-medium"
                        >
                          View
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <HonestEmptyState
                title="Awaiting Role 03 Discovery Pipeline Results"
                description="This atlas never generates synthetic candidates. Load computed candidate locations or field surveys via the GeoJSON file importer below."
                unmetDependency="Role 03 Discovery Engine (Ready for GeoJSON or REST FeatureCollection)"
              />
            )}

            {/* Ingest Zone */}
            <div className="bg-[#fcfbf9] border border-[#ded8cb] p-3.5 rounded-lg space-y-2.5">
              <h4 className="text-xs font-semibold text-[#1c2024] flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-[#275273]" />
                Ingest GeoJSON File
              </h4>

              <input
                type="file"
                accept=".geojson,.json"
                onChange={handleFileUpload}
                className="block w-full text-[11px] text-[#636c76] file:mr-2 file:py-1 file:px-2.5 file:rounded file:border file:border-[#ded8cb] file:text-xs file:bg-white file:text-[#1c2024] hover:file:bg-[#f7f5f0] cursor-pointer"
              />

              <div className="pt-2 border-t border-[#ede9e0]">
                <span className="text-[10px] font-mono text-[#636c76] uppercase block mb-1">
                  Or Paste GeoJSON String:
                </span>
                <textarea
                  rows={3}
                  value={pastedJson}
                  onChange={(e) => setPastedJson(e.target.value)}
                  placeholder='{"type": "FeatureCollection", "features": [...]}'
                  className="w-full bg-white border border-[#ded8cb] rounded p-2 text-[10px] font-mono text-[#1c2024] focus:outline-none focus:border-[#275273]"
                />
                <button
                  onClick={handleProcessPasted}
                  disabled={!pastedJson.trim()}
                  className="mt-1.5 w-full py-1.5 bg-[#275273] hover:bg-[#1f415c] text-white font-medium text-xs rounded transition disabled:opacity-40 shadow-pill"
                >
                  Validate & Map Features
                </button>
              </div>

              {/* Feedback messages */}
              {successMsg && (
                <div className="p-2 bg-[#edf5ef] border border-[#bad8c2] rounded text-[11px] text-[#265434] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {validationErrors.length > 0 && (
                <div className="p-2.5 bg-[#fbf3ed] border border-[#f0dacb] rounded text-[11px] text-[#8f5635] space-y-1">
                  <div className="font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    Validation Rejected:
                  </div>
                  <ul className="list-disc pl-4 space-y-0.5 text-[10px] font-mono">
                    {validationErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Real Coverage Footprints */}
        {activeTab === 'coverage' && (
          <div className="space-y-3">
            <HonestEmptyState
              title="Verified Orbital Track Footprints"
              description="Real satellite coverage is determined by polar orbital swath geometry and radiometric cloud masking. No uniform or synthetic coverage percentages are fabricated."
              unmetDependency="Role 02 Spatial Footprint Service"
            />

            <div className="bg-[#fcfbf9] border border-[#ded8cb] p-3 rounded-lg space-y-2 text-[11px] text-[#4a5058]">
              <h5 className="font-semibold text-[#1c2024] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#275273]" />
                Sensor Coverage Mechanics
              </h5>
              <p className="leading-relaxed text-[#636c76]">
                NASA Terra and Aqua MODIS sensors cover the entire globe every 1 to 2 days. Areas obscured by dense meteorological cloud formations or polar winter twilight are preserved with true transparency.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

# Role 05: Earth Analog Finder — Scientific Atlas & Spatial Exploration Interface

> **Human-Centred Scientific Atlas & Planetary Surface Exploration Interface for Terrestrial Analogs**

[![NASA GIBS](https://img.shields.io/badge/NASA-GIBS%20WMTS-0B3D91.svg)](https://nasa-gibs.github.io/gibs-api-docs/)
[![Planetary Data](https://img.shields.io/badge/Planetary-NASA%20JPL%20Treks-FF6F00.svg)](https://trek.nasa.gov/)
[![Data Integrity](https://img.shields.io/badge/Scientific%20Integrity-100%25%20Real%20Data-265434.svg)](#scientific-integrity-policy)
[![3D Globe](https://img.shields.io/badge/3D%20Globe-CesiumJS%20WGS84-275273.svg)](https://cesium.com/)
[![2D Atlas](https://img.shields.io/badge/2D%20Atlas-CARTO%20Positron-8F5635.svg)](https://carto.com/basemaps/)

---

## 1. System Overview & Scientific Atlas Mission

The **Earth Analog Finder (Role 05)** is an independent, production-grade geospatial and planetary exploration platform. Styled as a **clean digital scientific atlas**, it enables planetary scientists, geologists, and astrobiologists to explore terrestrial environments, inspect multi-spectral Earth observation satellite passes, compare terrestrial landforms with real Mars and Lunar surfaces, and validate candidate terrestrial analogs for planetary exploration.

This interface eliminates the generic sci-fi/control-room aesthetic in favor of **natural, human-centred cartography** inspired by high-quality scientific publications (*Nature*, *National Geographic*, USGS Earth Observatory) and digital museum atlases.

---

## 2. Design Philosophy & Cartographic Excellence

- **Palette**: Warm ivory (`#fcfbf9`), soft cream (`#f7f5f0`), warm stone (`#ede9e0`), deep charcoal typography (`#1c2024`), muted botanical green (`#265434`), subtle terracotta (`#8f5635`), and restrained ocean slate blue (`#275273`).
- **Typography**: Clean, readable sans-serif (*Inter*) for interface controls and coordinates, paired with classic editorial serif (*Newsreader* / *Georgia*) for institutional titles and specimen cards.
- **2D Cartographic Basemap**: Clean **CARTO Positron** basemap (`light_all`) delivering readable boundaries, clear coastlines, subtle terrain, balanced land/ocean contrast, and legible country/region labels without road clutter.
- **3D Earth Globe**: Fully functional, interactive 3D spherical Earth globe powered by **CesiumJS**, featuring true 360-degree rotation across all axes, smooth orbital zoom down to surface level, daylight surface illumination, and seamless coordinate synchronization when toggling between 2D and 3D modes.

---

## 3. Strict Scientific Integrity Policy

- **Zero Mock / Synthetic Data**: No fabricated candidate coordinates, invented confidence scores, synthetic GeoJSON polygons, or placeholder coverage metrics are permitted.
- **Honest Empty States**: If an external discovery pipeline or satellite product has not yet been queried, the interface reports an honest empty state detailing the pending pipeline connection rather than simulating results.
- **Verifiable Scientific Citations**: All reference field sites are backed by published scientific literature, formal mission reports (e.g., NASA Desert RATS, Haughton-Mars Project, Rio Tinto), and official DOIs.
- **Distinct Data Provenance**: Observed satellite imagery, derived meteorological products, and unresolved parameters are strictly segregated.

---

## 4. Real Geospatial & Planetary Data Sources

All visualization and analytical capabilities interface directly with verified, publicly accessible scientific data APIs:

| Source / Provider | Protocol / Service | Layers / Products Available | Spatial Reference |
| :--- | :--- | :--- | :--- |
| **NASA GIBS** (Global Imagery Browse Services) | WMTS / TMS (EPSG:3857) | - MODIS Terra & Aqua Corrected Reflectance (True Color, 250m)<br>- VIIRS SNPP Corrected Reflectance (True Color, 375m)<br>- VIIRS Day/Night Band Nighttime Lights (750m)<br>- MODIS Land Surface Temperature Day & Night (1km)<br>- MODIS Aerosol Optical Depth (10km AOD) | EPSG:3857 (Web Mercator) |
| **NASA JPL Solar System Treks** | WMTS (1.0.0) | - Mars: MGS MOLA Global Elevation & Shaded Relief (463m)<br>- Mars: Viking MDIM 2.1 Controlled Color Mosaic (232m)<br>- Moon: LRO LROC WAC Global Mosaic (100m) | Planetary Spherical / Cylindrical |
| **USGS 3DEP & Open-Elevation** | REST JSON Point Query | Real-time global terrestrial topographic elevation (meters above sea level) | WGS84 (EPSG:4326) |
| **NASA POWER & ECMWF ERA5** | REST API | 2m Air Temperature (°C), Precipitation (mm/day), Relative Humidity (%), and Solar Irradiance (kWh/m²/day) | WGS84 (EPSG:4326) |
| **Nominatim OpenStreetMap** | REST Geocoding | Real global geographic location search, bounding boxes, and reverse geocoding | WGS84 |

---

## 5. Verified Scientific Analog Catalog

The built-in reference catalog includes only peer-reviewed field validation benchmarks:
1. **Haughton Impact Structure (Devon Island, High Arctic)**: Polar desert impact crater, permafrost, hydrothermal alteration ([Lee & Osinski 2005](https://doi.org/10.1111/j.1945-5100.2005.tb00145.x); NASA HMP).
2. **Atacama Desert (Yungay Core, Chile)**: Extreme hyper-aridity, perchlorates, UV limit for life ([McKay et al. 2003](https://doi.org/10.1089/153110703769016460); NASA ASTEP).
3. **McMurdo Dry Valleys (University Valley, Antarctica)**: Subsurface dry permafrost, ice-wedge polygons ([Marchant & Head 2007](https://doi.org/10.1016/j.icarus.2007.06.018); NASA Astrobiology Institute).
4. **Río Tinto Basin (Spain)**: Acid mine drainage, jarosite and hematite precipitations for Meridiani Planum analog ([Fernández-Remolar et al. 2005](https://doi.org/10.1089/ast.2005.5.449); NASA MARTE).
5. **Meteor Crater (Barringer, Arizona)**: Simple impact crater morphology, shock metamorphism ([Shoemaker 1963](https://doi.org/10.1016/0019-1035(63)90042-3); Apollo Lunar Field Training & NASA Desert RATS).
6. **Kīlauea & Mauna Loa (Hawaiʻi)**: Basaltic shield volcanism and lava tubes for lunar/Martian volcanism ([Garry et al. 2012](https://doi.org/10.1016/j.pss.2011.08.005); NASA BASALT).

---

## 6. Project Architecture

```
mw/
├── src/
│   ├── adapters/               # Independent data service adapters
│   │   ├── gibsAdapter.ts      # NASA GIBS WMTS layer registry & URL builders
│   │   ├── planetaryAdapter.ts # NASA JPL Solar System Treks adapter (Mars/Moon)
│   │   ├── elevationAdapter.ts # Real-time topographic elevation service
│   │   ├── weatherAdapter.ts   # NASA POWER & ECMWF surface telemetry
│   │   ├── geocodingAdapter.ts # Real geographic location gazetteer search
│   │   └── candidateAdapter.ts # Scientific analog catalog & GeoJSON validator
│   ├── components/
│   │   ├── Map/
│   │   │   ├── SpatialViewport.tsx  # Dual 2D/3D orchestrator & camera sync
│   │   │   ├── Map2D.tsx            # 2D CARTO Positron & MapLibre GL engine
│   │   │   └── Globe3D.tsx          # 3D CesiumJS spherical Earth globe
│   │   ├── Header/             # Atlas header, search, 2D/3D switcher, controls
│   │   ├── Timeline/           # Archival satellite pass date scrubber
│   │   ├── Layers/             # Observation layer catalog & opacity sliders
│   │   ├── Candidates/         # Field analog catalog & Role 03 GeoJSON ingest
│   │   ├── Planetary/          # Mars & Moon comparative context
│   │   ├── Inspector/          # Real-time coordinate & elevation telemetry
│   │   └── Common/             # Honest empty states & scientific metadata modals
│   ├── types/                  # Strict TypeScript contracts & schemas
│   ├── tests/                  # Automated integration test suite
│   ├── App.tsx                 # Root application
│   └── main.tsx                # Bootstrap entry point
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

---

## 7. Local Setup & Execution Instructions

### Prerequisites
- Node.js (v18.0.0 or higher)
- `pnpm` (recommended) or `npm`

### Installation
```bash
# Install dependencies
pnpm install
```

### Running the Application Locally
```bash
# Start local development server
pnpm dev
```
Open `http://localhost:5173/` in your browser.

### Running Automated Tests
```bash
# Execute integration test suite
pnpm test
```

### Building for Production
```bash
pnpm build
```
Generates production-optimized assets in `dist/`.

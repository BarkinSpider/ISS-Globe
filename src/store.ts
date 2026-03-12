import { create } from 'zustand';

interface AppState {
  issSpeed: number;
  globeSpeed: number;
  shading: number;
  translucency: number;
  cloudOpac: number;
  cloudSpeed: number;
  wireframe: boolean;
  meteorCount: number;
  lat: number;
  lon: number;
  alt: number;
  setIssSpeed: (v: number) => void;
  setGlobeSpeed: (v: number) => void;
  setShading: (v: number) => void;
  setTranslucency: (v: number) => void;
  setCloudOpac: (v: number) => void;
  setCloudSpeed: (v: number) => void;
  setWireframe: (v: boolean) => void;
  setMeteorCount: (v: number) => void;
  setTelemetry: (lat: number, lon: number, alt: number) => void;
}

export const useStore = create<AppState>((set) => ({
  issSpeed: 1,
  globeSpeed: 2,
  shading: 0.8,
  translucency: 1,
  cloudOpac: 0.4,
  cloudSpeed: 1.1,
  wireframe: false,
  meteorCount: 20,
  lat: 0,
  lon: 0,
  alt: 420,
  setIssSpeed: (v) => set({ issSpeed: v }),
  setGlobeSpeed: (v) => set({ globeSpeed: v }),
  setShading: (v) => set({ shading: v }),
  setTranslucency: (v) => set({ translucency: v }),
  setCloudOpac: (v) => set({ cloudOpac: v }),
  setCloudSpeed: (v) => set({ cloudSpeed: v }),
  setWireframe: (v) => set({ wireframe: v }),
  setMeteorCount: (v) => set({ meteorCount: v }),
  setTelemetry: (lat, lon, alt) => set({ lat, lon, alt }),
}));

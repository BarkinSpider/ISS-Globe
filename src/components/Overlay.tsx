import { useState } from 'react';
import { useStore } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Globe, Satellite, Cloud, Sun, Eye, Activity, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

export function Overlay() {
  const [isMinimized, setIsMinimized] = useState(true);
  const { 
    lat, lon, alt,
    issSpeed, globeSpeed, shading, translucency, cloudOpac, cloudSpeed, wireframe, meteorCount, planetType,
    setIssSpeed, setGlobeSpeed, setShading, setTranslucency, setCloudOpac, setCloudSpeed, setWireframe, setMeteorCount, setPlanetType
  } = useStore();

  return (
    <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-10 font-mono text-emerald-400">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="pointer-events-auto w-80 bg-black/60 backdrop-blur-md border border-emerald-500/30 rounded-xl p-5 shadow-2xl shadow-emerald-900/20"
      >
        <div className={`flex items-center justify-between transition-all ${isMinimized ? '' : 'mb-6 border-b border-emerald-500/30 pb-4'}`}>
          <div className="flex items-center gap-3">
            <Satellite className="w-6 h-6 text-emerald-400" />
            <div className="flex items-baseline gap-2">
              <h1 className="text-xl font-bold tracking-wider text-emerald-50">ISS TRACKER</h1>
              <span className="text-xs text-emerald-500/60 font-medium">v0.6</span>
            </div>
          </div>
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-emerald-500 hover:text-emerald-300 transition-colors p-1"
          >
            {isMinimized ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {!isMinimized && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center bg-emerald-950/30 p-2 rounded">
                  <span className="text-emerald-500/80">LAT</span>
                  <span className="text-emerald-50 font-medium">{lat.toFixed(2)}°</span>
                </div>
                <div className="flex justify-between items-center bg-emerald-950/30 p-2 rounded">
                  <span className="text-emerald-500/80">LON</span>
                  <span className="text-emerald-50 font-medium">{lon.toFixed(2)}°</span>
                </div>
                <div className="flex justify-between items-center bg-emerald-950/30 p-2 rounded">
                  <span className="text-emerald-500/80">ALT</span>
                  <span className="text-emerald-50 font-medium">{alt} km</span>
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-emerald-400/80 mb-2">
                    <Globe size={16}/>
                    <span>Celestial Body</span>
                  </div>
                  <select 
                    value={planetType}
                    onChange={(e) => setPlanetType(e.target.value as any)}
                    className="w-full bg-emerald-950/50 border border-emerald-800/50 text-emerald-100 text-sm rounded-lg p-2 outline-none focus:border-emerald-500 transition-colors"
                  >
                    <option value="earth-day">Earth (Day)</option>
                    <option value="earth-day-hires">Earth (High Res)</option>
                    <option value="earth-day-classic">Earth (Classic)</option>
                    <option value="earth-day-satellite">Earth (Satellite)</option>
                    <option value="earth-night">Earth (Night)</option>
                    <option value="moon">Moon</option>
                    <option value="mars">Mars</option>
                    <option value="jupiter">Jupiter</option>
                    <option value="venus">Venus</option>
                    <option value="mercury">Mercury</option>
                    <option value="saturn">Saturn</option>
                    <option value="uranus">Uranus</option>
                    <option value="neptune">Neptune</option>
                    <option value="pluto">Pluto</option>
                    <option value="sun">Sun</option>
                  </select>
                </div>

                <Slider icon={<Activity size={16}/>} label="ISS Speed" value={issSpeed} min={0} max={5} step={0.1} onChange={setIssSpeed} />
                <Slider icon={<Globe size={16}/>} label="Globe Rot" value={globeSpeed} min={0} max={5} step={0.1} onChange={setGlobeSpeed} />
                <Slider icon={<Sun size={16}/>} label="Shading" value={shading} min={0} max={5} step={0.1} onChange={setShading} />
                <Slider icon={<Eye size={16}/>} label="Translucency" value={translucency} min={0.1} max={1} step={0.05} onChange={setTranslucency} />
                <Slider icon={<Cloud size={16}/>} label="Cloud Opac" value={cloudOpac} min={0} max={2} step={0.05} onChange={setCloudOpac} />
                <Slider icon={<Cloud size={16}/>} label="Cloud Speed" value={cloudSpeed} min={0} max={3} step={0.1} onChange={setCloudSpeed} />
                <Slider icon={<Sparkles size={16}/>} label="Meteors" value={meteorCount} min={0} max={100} step={1} onChange={setMeteorCount} />
                
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-sm text-emerald-400/80">
                    <Settings size={16} />
                    <span>Wireframe</span>
                  </div>
                  <button 
                    onClick={() => setWireframe(!wireframe)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${wireframe ? 'bg-emerald-500' : 'bg-emerald-950 border border-emerald-800'}`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${wireframe ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function Slider({ icon, label, value, min, max, step, onChange }: any) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-emerald-400/80">
        <div className="flex items-center gap-2">
          {icon}
          <span>{label}</span>
        </div>
        <span>{value.toFixed(2)}</span>
      </div>
      <input 
        type="range" 
        min={min} max={max} step={step} 
        value={value} 
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
      />
    </div>
  );
}

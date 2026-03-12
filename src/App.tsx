/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Earth } from './components/Earth';
import { ISS } from './components/ISS';
import { Environment } from './components/Environment';
import { Overlay } from './components/Overlay';
import { useStore } from './store';

export default function App() {
  const shading = useStore(state => state.shading);

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative">
      <Canvas
        camera={{ position: [200, 100, 300], fov: 60 }}
        shadows
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#000000']} />
        
        <directionalLight 
          position={[300, 150, 200]} 
          intensity={shading * 2.5} 
          castShadow 
          shadow-mapSize={[1024, 1024]}
        />
        <ambientLight intensity={0.8} color="#ffffff" />

        <Suspense fallback={null}>
          <Earth />
          <ISS />
          <Environment />
        </Suspense>

        <OrbitControls 
          enableDamping 
          minDistance={150} 
          maxDistance={800} 
        />
      </Canvas>
      
      <Overlay />
    </div>
  );
}

import { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store';

const EARTH_RADIUS = 80;

export function Earth() {
  const earthRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  
  const { globeSpeed, translucency, wireframe, cloudOpac, cloudSpeed } = useStore();

  const earthTexture = useLoader(THREE.TextureLoader, 'https://unpkg.com/three-globe@2.31.0/example/img/earth-blue-marble.jpg');

  // Generate clouds texture
  const cloudTex = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, 1024, 512);
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 512;
      const r = 20 + Math.random() * 60;
      const alpha = 0.15 + Math.random() * 0.4;

      const drawCloud = (cx: number, cy: number) => {
        const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grd.addColorStop(0, `rgba(255,255,255,${alpha})`);
        grd.addColorStop(0.5, `rgba(255,255,255,${alpha * 0.5})`);
        grd.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      };

      drawCloud(x, y);
      
      // Wrap edges
      if (x < r) drawCloud(x + 1024, y);
      if (x > 1024 - r) drawCloud(x - 1024, y);
      if (y < r) drawCloud(x, y + 512);
      if (y > 512 - r) drawCloud(x, y - 512);
      
      // Wrap corners
      if (x < r && y < r) drawCloud(x + 1024, y + 512);
      if (x < r && y > 512 - r) drawCloud(x + 1024, y - 512);
      if (x > 1024 - r && y < r) drawCloud(x - 1024, y + 512);
      if (x > 1024 - r && y > 512 - r) drawCloud(x - 1024, y - 512);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }, []);

  useFrame((state, delta) => {
    const speed = globeSpeed * 0.0003 * (delta * 60); // normalize to 60fps
    if (earthRef.current) earthRef.current.rotation.y += speed;
    if (atmosphereRef.current) atmosphereRef.current.rotation.y += speed;
    if (cloudsRef.current) cloudsRef.current.rotation.y += speed * cloudSpeed;
  });

  return (
    <group>
      {/* Earth */}
      <mesh ref={earthRef} receiveShadow>
        <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
        <meshStandardMaterial 
          map={earthTexture} 
          roughness={0.8} 
          metalness={0.1} 
          transparent 
          opacity={translucency} 
          wireframe={wireframe}
        />
      </mesh>

      {/* Atmosphere */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[EARTH_RADIUS * 1.02, 64, 64]} />
        <shaderMaterial
          vertexShader={`
            varying vec3 vNormal;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            varying vec3 vNormal;
            void main() {
              float i = pow(0.65 - dot(vNormal, vec3(0,0,1)), 2.5);
              gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * i * 0.5;
            }
          `}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          transparent
        />
      </mesh>

      {/* Clouds */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[EARTH_RADIUS * 1.03, 64, 64]} />
        <meshStandardMaterial 
          map={cloudTex} 
          transparent 
          opacity={cloudOpac} 
          roughness={1} 
          metalness={0} 
        />
      </mesh>
    </group>
  );
}

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store';

const ORBIT_RADIUS = 105;
const INCLINATION = 51.6 * Math.PI / 180;

export function ISS() {
  const issRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Sprite>(null);
  const angleRef = useRef(0);
  const rotRef = useRef(new THREE.Euler(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2));
  const rotDrift = useMemo(() => new THREE.Vector3((Math.random() - 0.5) * 0.004, (Math.random() - 0.5) * 0.004, (Math.random() - 0.5) * 0.004), []);
  
  const { issSpeed, setTelemetry } = useStore();

  const { solarTex, glowTex } = useMemo(() => {
    const solarCanvas = document.createElement('canvas');
    solarCanvas.width = 128; solarCanvas.height = 256;
    const sc = solarCanvas.getContext('2d')!;
    sc.fillStyle = '#112255';
    sc.fillRect(0, 0, 128, 256);
    sc.fillStyle = '#2244aa';
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 8; x++) {
        sc.fillRect(x * 16 + 2, y * 16 + 2, 12, 12);
      }
    }
    const solarTex = new THREE.CanvasTexture(solarCanvas);

    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = 128; glowCanvas.height = 128;
    const gctx = glowCanvas.getContext('2d')!;
    const gradient = gctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(0, 200, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(0, 100, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    gctx.fillStyle = gradient;
    gctx.fillRect(0, 0, 128, 128);
    const glowTex = new THREE.CanvasTexture(glowCanvas);

    return { solarTex, glowTex };
  }, []);

  const materials = useMemo(() => ({
    white: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.9 }),
    gray: new THREE.MeshStandardMaterial({ color: 0xbbbbbb, roughness: 0.15, metalness: 0.85 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.2, metalness: 0.8 }),
    solar: new THREE.MeshStandardMaterial({ map: solarTex, roughness: 0.1, metalness: 0.9, emissive: 0x112244, emissiveIntensity: 0.5 }),
    radiator: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.9, emissive: 0x333333, emissiveIntensity: 0.3 }),
    window: new THREE.MeshStandardMaterial({ color: 0x88ccff, emissive: 0x224466, emissiveIntensity: 0.8, roughness: 0.1, metalness: 0.9 })
  }), [solarTex]);

  useFrame((state, delta) => {
    angleRef.current += 0.006 * issSpeed * (delta * 60);
    const angle = angleRef.current;
    
    const x = ORBIT_RADIUS * Math.cos(angle);
    const z = ORBIT_RADIUS * Math.sin(angle) * Math.cos(INCLINATION);
    const y = ORBIT_RADIUS * Math.sin(angle) * Math.sin(INCLINATION);

    if (issRef.current) {
      issRef.current.position.set(x, y, z);
      
      rotRef.current.x += rotDrift.x * issSpeed * (delta * 60);
      rotRef.current.y += rotDrift.y * issSpeed * (delta * 60);
      rotRef.current.z += rotDrift.z * issSpeed * (delta * 60);
      
      issRef.current.rotation.copy(rotRef.current);
    }
    
    if (glowRef.current) {
      glowRef.current.position.set(x, y, z);
    }

    const lat = Math.asin(y / ORBIT_RADIUS) * 180 / Math.PI;
    const lon = Math.atan2(z, x) * 180 / Math.PI;
    setTelemetry(lat, (lon + 360) % 360, 420);
  });

  return (
    <group>
      {/* ISS Group */}
      <group ref={issRef} scale={[0.3, 0.3, 0.3]}>
        {/* Truss */}
        <group>
          <mesh position={[0, 0, 0]} material={materials.gray}>
            <boxGeometry args={[4, 1.5, 1.5]} />
          </mesh>
          {[1, 2, 3, 4].map(i => (
            <mesh key={`s-${i}`} position={[i * 4.5 - 2, 0, 0]} material={materials.gray}>
              <boxGeometry args={[4.5, 1.2, 1.2]} />
            </mesh>
          ))}
          {[1, 2, 3, 4].map(i => (
            <mesh key={`p-${i}`} position={[-i * 4.5 + 2, 0, 0]} material={materials.gray}>
              <boxGeometry args={[4.5, 1.2, 1.2]} />
            </mesh>
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh key={`beam-${i}`} position={[i * 4.5 - 18, 0.8, 0]} material={materials.dark}>
              <boxGeometry args={[0.5, 0.5, 4]} />
            </mesh>
          ))}
        </group>

        {/* Solar Arrays */}
        {[[-11, 0], [-18, 0], [11, 0], [18, 0]].map(([x, z], idx) => (
          <group key={`solar-${idx}`} position={[x, 0, z]}>
            <mesh position={[0, 0, 2]} material={materials.gray}>
              <boxGeometry args={[1.5, 0.4, 0.4]} />
            </mesh>
            {[0, 1].map(i => (
              <mesh key={`wing-${i}`} position={[0, 0, -4 - i * 5.5]} material={materials.solar}>
                <boxGeometry args={[8, 0.15, 5]} />
              </mesh>
            ))}
          </group>
        ))}

        {/* Radiators */}
        {[
          [-22, 2.5, 0, 0],
          [22, 2.5, 0, 0],
          [-4, 1.5, 2.5, 0.4],
          [-4, 1.5, -2.5, -0.4]
        ].map(([x, y, z, rot], idx) => (
          <group key={`rad-${idx}`} position={[x, y, z]} rotation={[0, rot, 0]}>
            <mesh material={materials.radiator}>
              <boxGeometry args={[3, 0.15, 4]} />
            </mesh>
            <mesh position={[-1.5, 0, 0]} material={materials.gray}>
              <boxGeometry args={[0.3, 0.3, 2]} />
            </mesh>
          </group>
        ))}

        {/* Modules */}
        <group>
          <mesh position={[-12, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.white}>
            <cylinderGeometry args={[1.3, 1.3, 4, 16]} />
          </mesh>
          <mesh position={[-6, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.white}>
            <cylinderGeometry args={[1.2, 1.2, 1.5, 16]} />
          </mesh>
          <mesh position={[-16, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.white}>
            <cylinderGeometry args={[1.3, 1.3, 3, 16]} />
          </mesh>
          <mesh position={[-2, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.white}>
            <cylinderGeometry args={[1.4, 1.4, 3, 16]} />
          </mesh>
          <mesh position={[2, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.white}>
            <cylinderGeometry args={[1.2, 1.2, 1.5, 16]} />
          </mesh>
          <mesh position={[5, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.white}>
            <cylinderGeometry args={[1.2, 1.2, 2.5, 16]} />
          </mesh>
          <mesh position={[8.5, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.white}>
            <cylinderGeometry args={[1.2, 1.2, 3, 16]} />
          </mesh>
          <mesh position={[-9.5, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.white}>
            <cylinderGeometry args={[1.2, 1.2, 2.5, 16]} />
          </mesh>
          
          {/* Cupola */}
          <mesh position={[-14, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.white}>
            <cylinderGeometry args={[0.9, 1.1, 1, 16]} />
          </mesh>
          <mesh position={[-14.6, 0, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials.window}>
            <sphereGeometry args={[0.8, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>

          {/* Docking port */}
          <mesh position={[12, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.gray}>
            <cylinderGeometry args={[0.6, 0.8, 0.5, 12]} />
          </mesh>
        </group>
      </group>

      {/* Glow Sprite */}
      <sprite ref={glowRef} scale={[15, 15, 1]}>
        <spriteMaterial map={glowTex} transparent blending={THREE.AdditiveBlending} />
      </sprite>
    </group>
  );
}

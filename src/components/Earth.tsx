import { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store';

const EARTH_RADIUS = 80;

export function Earth() {
  const earthRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  
  const { globeSpeed, translucency, wireframe, cloudOpac, cloudSpeed } = useStore();

  const [earthTexture, cloudTex] = useLoader(THREE.TextureLoader, [
    'https://unpkg.com/three-globe@2.31.0/example/img/earth-blue-marble.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png'
  ]);

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
          depthWrite={false}
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
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

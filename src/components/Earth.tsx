import { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store';

const EARTH_RADIUS = 80;

export const PLANETS = {
  'earth-day': {
    name: 'Earth (Day)',
    url: 'https://unpkg.com/three-globe@2.31.0/example/img/earth-blue-marble.jpg',
    hasClouds: true,
    hasAtmosphere: true,
    atmosphereColor: [0.3, 0.6, 1.0]
  },
  'earth-day-hires': {
    name: 'Earth (High Res)',
    url: 'https://unpkg.com/three-globe/example/img/earth-day.jpg',
    hasClouds: true,
    hasAtmosphere: true,
    atmosphereColor: [0.3, 0.6, 1.0]
  },
  'earth-day-classic': {
    name: 'Earth (Classic)',
    url: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
    hasClouds: true,
    hasAtmosphere: true,
    atmosphereColor: [0.3, 0.6, 1.0]
  },
  'earth-day-satellite': {
    name: 'Earth (Satellite)',
    url: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/earthmap1k.jpg',
    hasClouds: true,
    hasAtmosphere: true,
    atmosphereColor: [0.3, 0.6, 1.0]
  },
  'earth-night': {
    name: 'Earth (Night)',
    url: 'https://unpkg.com/three-globe@2.31.0/example/img/earth-night.jpg',
    hasClouds: true,
    hasAtmosphere: true,
    atmosphereColor: [0.1, 0.3, 0.8]
  },
  'moon': {
    name: 'Moon',
    url: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg',
    hasClouds: false,
    hasAtmosphere: false,
    atmosphereColor: [0, 0, 0]
  },
  'mars': {
    name: 'Mars',
    url: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/marsmap1k.jpg',
    hasClouds: false,
    hasAtmosphere: true,
    atmosphereColor: [0.8, 0.4, 0.1]
  },
  'jupiter': {
    name: 'Jupiter',
    url: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/jupitermap.jpg',
    hasClouds: false,
    hasAtmosphere: false,
    atmosphereColor: [0, 0, 0]
  },
  'venus': {
    name: 'Venus',
    url: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/venusmap.jpg',
    hasClouds: true,
    hasAtmosphere: true,
    atmosphereColor: [0.9, 0.7, 0.2]
  },
  'mercury': {
    name: 'Mercury',
    url: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/mercurymap.jpg',
    hasClouds: false,
    hasAtmosphere: false,
    atmosphereColor: [0, 0, 0]
  },
  'saturn': {
    name: 'Saturn',
    url: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/saturnmap.jpg',
    hasClouds: false,
    hasAtmosphere: true,
    atmosphereColor: [0.8, 0.7, 0.5],
    ringUrl: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/saturnringcolor.jpg',
    ringAlphaUrl: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/saturnringpattern.gif'
  },
  'uranus': {
    name: 'Uranus',
    url: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/uranusmap.jpg',
    hasClouds: false,
    hasAtmosphere: true,
    atmosphereColor: [0.5, 0.8, 0.9],
    ringUrl: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/uranusringcolour.jpg',
    ringAlphaUrl: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/uranusringtrans.gif'
  },
  'neptune': {
    name: 'Neptune',
    url: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/neptunemap.jpg',
    hasClouds: false,
    hasAtmosphere: true,
    atmosphereColor: [0.2, 0.4, 0.9]
  },
  'pluto': {
    name: 'Pluto',
    url: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/plutomap1k.jpg',
    hasClouds: false,
    hasAtmosphere: false,
    atmosphereColor: [0, 0, 0]
  },
  'sun': {
    name: 'Sun',
    url: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/sunmap.jpg',
    hasClouds: false,
    hasAtmosphere: true,
    atmosphereColor: [1.0, 0.8, 0.2],
    isStar: true
  }
};

export function Earth() {
  const earthRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  
  const { globeSpeed, translucency, wireframe, cloudOpac, cloudSpeed, planetType } = useStore();
  const config = PLANETS[planetType] || PLANETS['earth-day'];

  const [planetTexture, cloudTex] = useLoader(THREE.TextureLoader, [
    config.url,
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png'
  ]);

  const atmosphereUniforms = useMemo(() => ({
    color: { value: new THREE.Color(...config.atmosphereColor) }
  }), [config.atmosphereColor]);

  useFrame((state, delta) => {
    const speed = globeSpeed * 0.0003 * (delta * 60); // normalize to 60fps
    if (earthRef.current) earthRef.current.rotation.y += speed;
    if (atmosphereRef.current) atmosphereRef.current.rotation.y += speed;
    if (cloudsRef.current) cloudsRef.current.rotation.y += speed * cloudSpeed;
  });

  return (
    <group>
      {/* Earth / Planet */}
      <mesh ref={earthRef} receiveShadow>
        <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
        {(config as any).isStar ? (
          <meshBasicMaterial 
            map={planetTexture} 
            transparent 
            opacity={translucency} 
            wireframe={wireframe}
          />
        ) : (
          <meshStandardMaterial 
            map={planetTexture} 
            roughness={0.8} 
            metalness={0.1} 
            transparent 
            opacity={translucency} 
            wireframe={wireframe}
          />
        )}
      </mesh>

      {/* Atmosphere */}
      {config.hasAtmosphere && (
        <mesh ref={atmosphereRef}>
          <sphereGeometry args={[EARTH_RADIUS * 1.02, 64, 64]} />
          <shaderMaterial
            uniforms={atmosphereUniforms}
            vertexShader={`
              varying vec3 vNormal;
              void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `}
            fragmentShader={`
              uniform vec3 color;
              varying vec3 vNormal;
              void main() {
                float i = pow(0.65 - dot(vNormal, vec3(0,0,1)), 2.5);
                gl_FragColor = vec4(color, 1.0) * i * 0.5;
              }
            `}
            blending={THREE.AdditiveBlending}
            side={THREE.BackSide}
            transparent
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Clouds */}
      {config.hasClouds && (
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
      )}

      {/* Rings */}
      {(config as any).ringUrl && (
        <Rings 
          url={(config as any).ringUrl} 
          alphaUrl={(config as any).ringAlphaUrl}
          radius={EARTH_RADIUS} 
        />
      )}
    </group>
  );
}

function Rings({ url, alphaUrl, radius }: { url: string, alphaUrl?: string, radius: number }) {
  const ringTex = useLoader(THREE.TextureLoader, url);
  const ringAlphaTex = useLoader(THREE.TextureLoader, alphaUrl || url);
  
  return (
    <mesh rotation={[Math.PI / 2 + 0.3, 0, 0]}>
      <ringGeometry args={[radius * 1.2, radius * 2.2, 64]} />
      <meshStandardMaterial 
        map={ringTex} 
        alphaMap={alphaUrl ? ringAlphaTex : undefined}
        side={THREE.DoubleSide} 
        transparent 
        opacity={0.9} 
      />
    </mesh>
  );
}

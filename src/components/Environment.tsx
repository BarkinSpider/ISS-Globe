import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store';

const Nebula = () => {
  const tex = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048; 
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;
    
    // Deep space background
    ctx.fillStyle = '#020205';
    ctx.fillRect(0, 0, 2048, 1024);
    
    // Draw milky way / nebula band
    for(let i = 0; i < 400; i++) {
        const x = Math.random() * 2048;
        // Curve the band slightly like a sine wave
        const yOffset = Math.sin(x / 2048 * Math.PI * 2) * 150;
        const y = 512 + yOffset + (Math.random() - 0.5) * 500;
        const r = 100 + Math.random() * 300;
        
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        const colors = [
          'rgba(60, 20, 120, 0.06)',  // Deep purple
          'rgba(20, 50, 140, 0.06)',  // Deep blue
          'rgba(120, 30, 60, 0.04)',  // Magenta
          'rgba(10, 80, 100, 0.04)'   // Teal
        ];
        grad.addColorStop(0, colors[Math.floor(Math.random() * colors.length)]);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        
        ctx.fillStyle = grad;
        ctx.beginPath(); 
        ctx.arc(x, y, r, 0, Math.PI * 2); 
        ctx.fill();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }, []);

  return (
    <mesh>
      <sphereGeometry args={[1500, 32, 32]} />
      <meshBasicMaterial map={tex} side={THREE.BackSide} depthWrite={false} />
    </mesh>
  );
};

export function Environment() {
  const meteorsRef = useRef<THREE.Group[]>([]);
  const cometsRef = useRef<THREE.Group[]>([]);
  const impactsRef = useRef<THREE.Group[]>([]);
  const meteorCount = useStore(state => state.meteorCount);

  const MAX_METEORS = 100;

  // Meteors initial state
  const meteorsData = useMemo(() => {
    return Array.from({ length: MAX_METEORS }).map(() => ({
      vx: 0, vy: 0, vz: 0,
      active: false,
      timer: Math.random() * 400,
      trailLen: 20 + Math.random() * 40,
      color: Math.random() > 0.7 ? 0xffaa44 : 0xaaddff,
      headSize: 0.3 + Math.random() * 0.5
    }));
  }, []);

  // Comets initial state
  const cometsData = useMemo(() => {
    return [
      { start: [600, 300, -400], vx: -(Math.random() * 0.3 + 0.1), vy: (Math.random() - 0.5) * 0.1, vz: (Math.random() - 0.5) * 0.2, rotSpeed: (Math.random() - 0.5) * 0.01 },
      { start: [-700, 200, 500], vx: -(Math.random() * 0.3 + 0.1), vy: (Math.random() - 0.5) * 0.1, vz: (Math.random() - 0.5) * 0.2, rotSpeed: (Math.random() - 0.5) * 0.01 },
      { start: [400, 500, 600], vx: -(Math.random() * 0.3 + 0.1), vy: (Math.random() - 0.5) * 0.1, vz: (Math.random() - 0.5) * 0.2, rotSpeed: (Math.random() - 0.5) * 0.01 }
    ];
  }, []);

  // Impact pool state
  const MAX_IMPACTS = 30;
  const impactData = useMemo(() => Array.from({ length: MAX_IMPACTS }).map(() => ({
    active: false,
    pos: new THREE.Vector3(),
    normal: new THREE.Vector3(),
    age: 0,
    color: new THREE.Color()
  })), []);

  const spawnImpact = (pos: THREE.Vector3, color: number | string) => {
    const imp = impactData.find(i => !i.active);
    if (imp) {
      imp.active = true;
      imp.pos.copy(pos);
      imp.normal.copy(pos).normalize();
      imp.age = 0;
      imp.color.set(color);
    }
  };

  const resetMeteor = (m: THREE.Group, data: any) => {
    data.timer = 0;
    data.active = true;
    m.visible = true;
    
    // Spawn at random edge
    const edge = Math.floor(Math.random() * 4);
    if (edge === 0) { m.position.set(800, Math.random() * 600, (Math.random() - 0.5) * 1200); }
    else if (edge === 1) { m.position.set(-800, Math.random() * 600, (Math.random() - 0.5) * 1200); }
    else if (edge === 2) { m.position.set((Math.random() - 0.5) * 1600, 600, (Math.random() - 0.5) * 1200); }
    else { m.position.set((Math.random() - 0.5) * 1600, Math.random() * 200, (Math.random() - 0.5) * 1200); }
    
    // Target a wider area so they don't all hit the earth directly
    // This makes many meteors fly past in the background/foreground
    const target = new THREE.Vector3((Math.random() - 0.5) * 600, (Math.random() - 0.5) * 600, (Math.random() - 0.5) * 600);
    const dir = target.sub(m.position).normalize();
    const speed = 4 + Math.random() * 8; // Fast meteors
    
    data.vx = dir.x * speed;
    data.vy = dir.y * speed;
    data.vz = dir.z * speed;
    
    m.lookAt(m.position.x + data.vx, m.position.y + data.vy, m.position.z + data.vz);
  };

  const resetComet = (c: THREE.Group, data: any) => {
    c.position.set(900 + Math.random() * 200, Math.random() * 400 + 200, (Math.random() - 0.5) * 1000);
    data.vx = -(Math.random() * 0.3 + 0.1);
    data.vy = (Math.random() - 0.5) * 0.1;
    data.vz = (Math.random() - 0.5) * 0.2;
  };

  useFrame((state, delta) => {
    const dt = delta * 60;
    
    // Animate meteors
    meteorsRef.current.forEach((m, i) => {
      if (!m) return;
      const data = meteorsData[i];
      
      if (i >= meteorCount) {
        m.visible = false;
        data.active = false;
        return;
      }

      if (!data.active) {
        data.timer += dt;
        if (data.timer > 100 + Math.random() * 200) {
          resetMeteor(m, data);
        }
      } else {
        m.position.x += data.vx * dt;
        m.position.y += data.vy * dt;
        m.position.z += data.vz * dt;
        
        const dist = m.position.length();
        // Earth radius is 80, atmosphere is ~82. Trigger impact at 85.
        if (dist < 85) {
          spawnImpact(m.position, data.color);
          data.active = false;
          m.visible = false;
        } else if (m.position.y < -400 || Math.abs(m.position.x) > 1200 || Math.abs(m.position.z) > 1200) {
          data.active = false;
          m.visible = false;
        }
      }
    });

    // Animate comets
    cometsRef.current.forEach((c, i) => {
      if (!c) return;
      const data = cometsData[i];
      c.position.x += data.vx * 60 * dt;
      c.position.y += data.vy * 60 * dt;
      c.position.z += data.vz * 60 * dt;
      c.rotation.y += data.rotSpeed * dt;
      
      const dist = c.position.length();
      if (dist < 85) {
        spawnImpact(c.position, 0x4488ff);
        resetComet(c, data);
      } else if (c.position.x < -1200 || c.position.y < -600 || c.position.y > 1200 || c.position.z < -1200) {
        resetComet(c, data);
      } else {
        c.lookAt(c.position.x + data.vx * 100, c.position.y + data.vy * 100, c.position.z + data.vz * 100);
      }
    });

    // Animate Impacts
    impactData.forEach((imp, i) => {
      if (imp.active) {
        imp.age += delta * 2.5; // Slightly slower explosion for realism
        const group = impactsRef.current[i];
        if (group) {
          group.visible = true;
          group.position.copy(imp.pos);
          // Orient shockwave outward from Earth
          group.lookAt(imp.pos.clone().add(imp.normal));

          if (imp.age >= 1) {
            imp.active = false;
            group.visible = false;
          } else {
            const progress = imp.age;
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            // Core Flash (White hot)
            const core = group.children[0] as THREE.Mesh;
            core.scale.setScalar(1 + easeOut * 2);
            (core.material as THREE.MeshBasicMaterial).opacity = (1 - progress) * 0.9;
            (core.material as THREE.MeshBasicMaterial).color.setHex(0xffffff);

            // Outer Glow (Colored)
            const glow = group.children[1] as THREE.Mesh;
            glow.scale.setScalar(1 + easeOut * 4);
            (glow.material as THREE.MeshBasicMaterial).opacity = (1 - progress) * 0.6;
            (glow.material as THREE.MeshBasicMaterial).color = imp.color;
          }
        }
      }
    });
  });

  return (
    <group>
      {/* Imaginative Nebula Background */}
      <Nebula />

      {/* Realistic Stars using Drei */}
      <Stars radius={300} depth={60} count={10000} factor={7} saturation={1} fade speed={1} />

      {/* Meteors */}
      {meteorsData.map((data, i) => (
        <group key={`meteor-${i}`} ref={el => meteorsRef.current[i] = el!} visible={false}>
          <mesh>
            <sphereGeometry args={[data.headSize, 6, 6]} />
            <meshBasicMaterial color={0xffffff} />
          </mesh>
          <mesh position={[0, 0, -data.trailLen / 2]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.1, 0, data.trailLen, 6]} />
            <meshBasicMaterial color={data.color} transparent opacity={0.6} blending={THREE.AdditiveBlending} />
          </mesh>
        </group>
      ))}

      {/* Comets */}
      {cometsData.map((data, i) => (
        <group key={`comet-${i}`} ref={el => cometsRef.current[i] = el!} position={new THREE.Vector3(...data.start)}>
          <mesh>
            <sphereGeometry args={[2 + Math.random() * 2, 12, 12]} />
            <meshBasicMaterial color={0xffffff} />
          </mesh>
          <mesh>
            <sphereGeometry args={[5 + Math.random() * 3, 12, 12]} />
            <meshBasicMaterial color={0xaaddff} transparent opacity={0.3} blending={THREE.AdditiveBlending} />
          </mesh>
          <mesh position={[0, 0, -60]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[1, 80 + Math.random() * 60, 8]} />
            <meshBasicMaterial color={0x4488ff} transparent opacity={0.25} blending={THREE.AdditiveBlending} />
          </mesh>
          <mesh position={[0, 0, -40]} rotation={[Math.PI / 2, 0, 0.2]}>
            <coneGeometry args={[3, 50 + Math.random() * 40, 8]} />
            <meshBasicMaterial color={0xffddaa} transparent opacity={0.15} blending={THREE.AdditiveBlending} />
          </mesh>
        </group>
      ))}

      {/* Atmospheric Impacts */}
      {impactData.map((_, i) => (
        <group key={`impact-${i}`} ref={el => impactsRef.current[i] = el!} visible={false}>
          {/* Core Flash */}
          <mesh>
            <sphereGeometry args={[1.5, 16, 16]} />
            <meshBasicMaterial transparent blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
          {/* Outer Glow */}
          <mesh>
            <sphereGeometry args={[2.5, 16, 16]} />
            <meshBasicMaterial transparent blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

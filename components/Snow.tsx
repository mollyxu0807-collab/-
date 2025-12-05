import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS } from '../types';

export const Snow: React.FC = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const COUNT = 2000;
  
  // Create dummy object for positioning
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Store speeds and random offsets
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < COUNT; i++) {
      temp.push({
        x: (Math.random() - 0.5) * 80, // Wide spread
        y: Math.random() * 60 - 20,    // Height spread
        z: (Math.random() - 0.5) * 60, // Depth spread
        speed: 0.5 + Math.random() * 1.5,
        wobbleSpeed: Math.random() * 2,
        wobbleAmp: Math.random() * 0.2,
        scale: 0.05 + Math.random() * 0.1
      });
    }
    return temp;
  }, []);

  useLayoutEffect(() => {
    if (!meshRef.current) return;
    // Set initial colors/positions if needed, though loop handles positions
    // We just set color once since it's all white
    const white = new THREE.Color(COLORS.SNOW_WHITE);
    for (let i = 0; i < COUNT; i++) {
      meshRef.current.setColorAt(i, white);
    }
    meshRef.current.instanceColor!.needsUpdate = true;
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    particles.forEach((p, i) => {
      // Fall down
      p.y -= p.speed * 0.1;
      
      // Reset if below floor
      if (p.y < -20) {
        p.y = 40;
        // Randomize X/Z again slightly to prevent patterns
        p.x = (Math.random() - 0.5) * 80;
        p.z = (Math.random() - 0.5) * 60;
      }

      // Add wobble
      const xOffset = Math.sin(t * p.wobbleSpeed + i) * p.wobbleAmp;
      const zOffset = Math.cos(t * p.wobbleSpeed + i) * p.wobbleAmp;

      dummy.position.set(p.x + xOffset, p.y, p.z + zOffset);
      dummy.scale.setScalar(p.scale);
      dummy.rotation.set(t * p.speed, t * p.speed, 0); // Tumbling
      
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      {/* Simple low-poly snowflake (tetrahedron or plane) */}
      <dodecahedronGeometry args={[1, 0]} />
      <meshBasicMaterial 
        color={COLORS.SNOW_WHITE} 
        transparent 
        opacity={0.6} 
        depthWrite={false} 
      />
    </instancedMesh>
  );
};
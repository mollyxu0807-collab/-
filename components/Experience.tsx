import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Foliage } from './Foliage';
import { Ornaments, generateOrnamentData } from './Ornaments';
import { WrappingRibbon } from './WrappingRibbon';
import { Snow } from './Snow'; // Import Snow
import { TreeState } from '../types';
import { easeInOutBack, easeInOutCubic } from '../utils/math';

interface ExperienceProps {
  treeState: TreeState;
}

// Component to handle smooth value transition for the scene
const SceneContent: React.FC<{ targetState: TreeState }> = ({ targetState }) => {
  const linearProgressRef = useRef(1); // 0 (Scattered) to 1 (Tree)
  const easedProgressRef = useRef(1);
  const velocityRef = useRef(0);
  
  // Candy canes now have bows, so they are composite too
  const candyCaneData = useMemo(() => generateOrnamentData(25, 'candyCane'), []);
  // Gifts are now composite (Body + Ribbon)
  // Reduced count to 20 for fewer, smaller gifts
  const giftData = useMemo(() => generateOrnamentData(20, 'gift'), []);

  useFrame((state, delta) => {
    // 1. Determine Target
    const target = targetState === TreeState.TREE_SHAPE ? 1 : 0;
    
    // 2. Choose Smoothing Parameters based on Direction
    const isAssembling = target === 1;
    
    // Damping speed: Higher = Faster
    const speed = isAssembling ? 1.0 : 3.0; 
    
    // 3. Update Linear Progress
    linearProgressRef.current = THREE.MathUtils.damp(linearProgressRef.current, target, speed, delta);
    
    // 4. Calculate Eased Progress based on Phase
    let nextEased = 0;
    if (isAssembling) {
        nextEased = easeInOutCubic(linearProgressRef.current);
    } else {
        nextEased = easeInOutBack(linearProgressRef.current);
    }
    
    // 5. Calculate Velocity (for rotation physics)
    const dist = Math.abs(nextEased - easedProgressRef.current);
    velocityRef.current = dist / delta; // Unit per second
    
    easedProgressRef.current = nextEased;
  });

  return (
    <group>
      {/* Dynamic Lighting */}
      <ambientLight intensity={0.2} color="#001a14" />
      <spotLight 
        position={[10, 20, 10]} 
        angle={0.3} 
        penumbra={1} 
        intensity={2} 
        color="#fffaed" 
        castShadow 
      />
      <pointLight position={[-10, -5, -10]} intensity={1} color="#d4af37" />

      {/* 1. Foliage */}
      <Foliage count={12000} easedProgress={easedProgressRef} />

      {/* 2. Standard Ornaments */}
      {/* Red, Gold, Silver Baubles */}
      <Ornaments count={90} type="bauble" easedProgress={easedProgressRef} velocityRef={velocityRef} />
      {/* Shiny Metallic Blue Baubles */}
      <Ornaments count={30} type="baubleBlue" easedProgress={easedProgressRef} velocityRef={velocityRef} />
      
      {/* Gifts: Split into Body and Decoration for multi-material effect */}
      <Ornaments type="gift" variant="body" data={giftData} easedProgress={easedProgressRef} velocityRef={velocityRef} />
      <Ornaments type="gift" variant="decoration" data={giftData} easedProgress={easedProgressRef} velocityRef={velocityRef} />
      
      {/* 3. Composite Ornaments (Layers) */}

      {/* Candy Canes: Body + Decoration (Bow) */}
      <Ornaments type="candyCane" variant="body" data={candyCaneData} easedProgress={easedProgressRef} velocityRef={velocityRef} />
      <Ornaments type="candyCane" variant="decoration" data={candyCaneData} easedProgress={easedProgressRef} velocityRef={velocityRef} />
      
      {/* Scattered Flowy Ribbons (Bows) - Reduced count to 20 */}
      <Ornaments count={20} type="ribbon" easedProgress={easedProgressRef} velocityRef={velocityRef} />
      
      {/* 4. Single Wrapping Ribbon */}
      <WrappingRibbon easedProgress={easedProgressRef} />

      {/* 5. Lights & Top Star */}
      <Ornaments count={300} type="light" easedProgress={easedProgressRef} velocityRef={velocityRef} />
      <Ornaments count={1} type="star" easedProgress={easedProgressRef} velocityRef={velocityRef} />

      {/* Ambient Floating Dust & Snow */}
      <Sparkles count={500} scale={30} size={4} speed={0.4} opacity={0.5} color="#ffd700" />
      <Snow />
    </group>
  );
};

export const Experience: React.FC<ExperienceProps> = ({ treeState }) => {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ 
        antialias: false, 
        toneMapping: THREE.ReinhardToneMapping, 
        toneMappingExposure: 1.5,
        alpha: false 
      }}
    >
      <color attach="background" args={['#000504']} />
      
      <PerspectiveCamera makeDefault position={[0, 0, 35]} fov={45} />
      
      <OrbitControls 
        enablePan={false} 
        maxPolarAngle={Math.PI / 1.8} 
        minPolarAngle={Math.PI / 3}
        maxDistance={50}
        minDistance={10}
        autoRotate={treeState === TreeState.TREE_SHAPE}
        autoRotateSpeed={0.5}
      />

      <Environment preset="city" />

      <SceneContent targetState={treeState} />

      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.8} 
          mipmapBlur 
          intensity={1.5} 
          radius={0.4}
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
        <Noise opacity={0.02} />
      </EffectComposer>
    </Canvas>
  );
};
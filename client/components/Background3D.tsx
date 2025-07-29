import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface StarFieldProps {
  count?: number;
}

const StarField: React.FC<StarFieldProps> = ({ count = 2000 }) => {
  const ref = useRef<THREE.Points>(null);
  
  // Generate random star positions
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      // Create a more realistic distribution with some clustering
      const radius = Math.random() * 100 + 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    
    return positions;
  }, [count]);

  // Animate the star field
  useFrame((state) => {
    if (ref.current) {
      const time = state.clock.getElapsedTime();
      
      // Slow rotation
      ref.current.rotation.x = time * 0.05;
      ref.current.rotation.y = time * 0.075;
      
      // Subtle breathing effect
      const scale = 1 + Math.sin(time * 0.5) * 0.1;
      ref.current.scale.setScalar(scale);
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#00ff41"
        size={0.8}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.6}
      />
    </Points>
  );
};

interface FloatingParticlesProps {
  count?: number;
}

const FloatingParticles: React.FC<FloatingParticlesProps> = ({ count = 50 }) => {
  const ref = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
    
    return positions;
  }, [count]);

  useFrame((state) => {
    if (ref.current) {
      const time = state.clock.getElapsedTime();
      
      // Animate individual particles
      const positions = ref.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        
        // Floating motion
        positions[i3 + 1] += Math.sin(time * 0.5 + i) * 0.01;
        
        // Wrap around if particles go too far
        if (positions[i3 + 1] > 100) positions[i3 + 1] = -100;
        if (positions[i3 + 1] < -100) positions[i3 + 1] = 100;
      }
      
      ref.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#00ffff"
        size={1.5}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.3}
      />
    </Points>
  );
};

interface GridLinesProps {
  size?: number;
  divisions?: number;
}

const GridLines: React.FC<GridLinesProps> = ({ size = 100, divisions = 20 }) => {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ref.current) {
      const time = state.clock.getElapsedTime();
      
      // Slow rotation and fade effect
      ref.current.rotation.y = time * 0.02;
      ref.current.rotation.x = Math.sin(time * 0.1) * 0.1;
    }
  });

  return (
    <group ref={ref}>
      <gridHelper 
        args={[size, divisions, '#00ff41', '#003311']} 
        position={[0, -30, 0]}
        rotation={[0, 0, 0]}
      />
      <gridHelper 
        args={[size * 0.5, divisions * 0.5, '#00ffff', '#001133']} 
        position={[0, 30, 0]}
        rotation={[Math.PI, 0, 0]}
      />
    </group>
  );
};

interface Background3DProps {
  className?: string;
  interactive?: boolean;
}

export const Background3D: React.FC<Background3DProps> = ({ 
  className = "",
  interactive = false 
}) => {
  return (
    <div className={`fixed inset-0 -z-10 ${className}`}>
      <Canvas
        camera={{
          position: [0, 0, 30],
          fov: 60,
          near: 0.1,
          far: 1000
        }}
        style={{ background: 'transparent' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#00ff41" />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#00ffff" />
        
        {/* 3D Elements */}
        <StarField count={1500} />
        <FloatingParticles count={30} />
        <GridLines size={80} divisions={16} />
        
        {/* Fog for depth */}
        <fog attach="fog" args={['#000000', 50, 200]} />
      </Canvas>
    </div>
  );
};

export default Background3D;

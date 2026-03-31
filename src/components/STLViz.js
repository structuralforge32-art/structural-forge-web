'use client';
import React, { useRef, useMemo } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OrbitControls, Center, Environment, ContactShadows } from '@react-three/drei';

function Model({ url }) {
  // Charger le fichier STL (supporte les data URLs)
  const geom = useLoader(STLLoader, url);
  
  return (
    <mesh geometry={geom} castShadow receiveShadow>
      <meshStandardMaterial 
        color="#00e5ff" 
        roughness={0.3} 
        metalness={0.8} 
        emissive="#00e5ff" 
        emissiveIntensity={0.1}
      />
    </mesh>
  );
}

export default function STLViz({ stlData }) {
  if (!stlData) return null;

  return (
    <div style={{ 
      width: '100%', 
      height: '450px', 
      background: 'radial-gradient(circle, #1a2a4a 0%, #050a14 100%)', 
      borderRadius: '16px', 
      overflow: 'hidden', 
      border: '1px solid rgba(0, 229, 255, 0.3)',
      boxShadow: '0 0 30px rgba(0, 229, 255, 0.1)',
      position: 'relative'
    }}>
      {/* Overlay Instructions */}
      <div style={{ 
        position: 'absolute', 
        top: '15px', 
        left: '15px', 
        zIndex: 10, 
        pointerEvents: 'none',
        background: 'rgba(0,0,0,0.5)',
        padding: '8px 12px',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ color: 'var(--neon-blue)', fontSize: '0.8rem', fontWeight: 'bold' }}>📦 Aperçu 3D du Prototype</div>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.65rem' }}>Faites pivoter avec la souris/doigt</div>
      </div>

      <Canvas shadows camera={{ position: [100, 100, 100], fov: 35 }}>
        <ambientLight intensity={0.4} />
        <spotLight position={[100, 100, 100]} angle={0.15} penumbra={1} castShadow intensity={2} />
        <pointLight position={[-100, -100, -100]} intensity={1} color="#00e5ff" />
        
        <React.Suspense fallback={null}>
          <Center top>
            <Model url={stlData} />
          </Center>
          <Environment preset="city" />
          <ContactShadows position={[0, -4.5, 0]} opacity={0.4} scale={20} blur={2.5} far={4.5} />
        </React.Suspense>

        <OrbitControls 
          makeDefault 
          minPolarAngle={0} 
          maxPolarAngle={Math.PI / 1.75} 
          enableDamping={true}
        />
      </Canvas>
      
      <div style={{ 
        position: 'absolute', 
        bottom: '15px', 
        right: '15px', 
        color: 'rgba(255,255,255,0.3)', 
        fontSize: '0.6rem' 
      }}>
        Propulsé par Structural Forge 3D Engine
      </div>
    </div>
  );
}

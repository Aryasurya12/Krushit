'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { useState, useEffect } from 'react';

const Field = ({ count = 300 }: { count?: number }) => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const [particles, setParticles] = useState<{ x: number; z: number; scale: number; speed: number }[]>([]);

    useEffect(() => {
        const temp: { x: number; z: number; scale: number; speed: number }[] = [];
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 50;
            const z = (Math.random() - 0.5) * 20 - 5; // Push back a bit
            const scale = 0.5 + Math.random() * 0.5;
            temp.push({ x, z, scale, speed: Math.random() * 0.5 + 0.5 });
        }
        const timer = setTimeout(() => setParticles(temp), 0);
        return () => clearTimeout(timer);
    }, [count]);

    useFrame((state) => {
        if (!meshRef.current || particles.length === 0) return;

        const time = state.clock.getElapsedTime();

        particles.forEach((p, i) => {
            dummy.position.set(p.x, -2, p.z);
            dummy.scale.set(p.scale, p.scale, p.scale);

            // Wind Swaying
            const sway = Math.sin(time * p.speed + p.x * 0.5) * 0.1;
            dummy.rotation.set(sway, sway * 0.3, sway);

            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <cylinderGeometry args={[0.03, 0.08, 2.5, 4]} />
            <meshStandardMaterial color="#65a30d" wireframe={false} />
        </instancedMesh>
    );
};

// Abstract Green Particles simulating "Data" or "Spores"
const DataStream = () => {
    return (
        <Sparkles
            count={100}
            scale={12}
            size={4}
            speed={0.4}
            opacity={0.5}
            color="#4ade80"
        />
    );
}

export default function LandingScene() {
    return (
        <div className="absolute inset-0 w-full h-full -z-10 bg-agri-cream/50 pointer-events-none">
            <Canvas camera={{ position: [0, 2, 10], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
                <Environment preset="park" />

                <group position={[0, -1, 0]} rotation={[0.1, 0, 0]}>
                    <Field count={800} />
                </group>

                <DataStream />
                <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                    {/* Floating 3D Elements could go here */}
                </Float>

                <fog attach="fog" args={['#fffbeb', 5, 25]} />
            </Canvas>
        </div>
    );
}

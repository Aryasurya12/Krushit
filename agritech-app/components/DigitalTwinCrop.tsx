'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
    PerspectiveCamera, 
    ContactShadows, 
    Float, 
    Html,
    OrbitControls,
    Sky,
    Environment,
    Grid
} from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { motion } from 'framer-motion';

// --- Sub-components ---

const SeedModel = ({ visible }: { visible: boolean }) => (
    <mesh visible={visible} position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial color="#8B4513" roughness={0.3} metalness={0.2} />
    </mesh>
);

const PlantModel = ({ stageIndex, stage }: { stageIndex: number, stage: string }) => {
    const groupRef = useRef<THREE.Group>(null);
    const stemRef = useRef<THREE.Mesh>(null);

    // Indices: 0:Seed, 1:Germination, 2:Seedling, 3:Vegetative, 4:Flowering, 5:Grain Formation, 6:Harvest
    const isHarvest = stage === 'Harvest';
    const isFlowering = stageIndex >= 4;
    const isGrain = stageIndex >= 5;

    const plantColor = isHarvest ? '#D97706' : '#10b981';
    const grainColor = isHarvest ? '#F59E0B' : '#6ee7b7';

    // Animation on stage change
    useEffect(() => {
        if (!groupRef.current || !stemRef.current) return;
        
        // Growth height animation
        const targetHeight = stageIndex === 0 ? 0.001 : 
                           stageIndex === 1 ? 0.5 : 
                           stageIndex === 2 ? 1.2 : 
                           stageIndex === 3 ? 2.2 : 
                           stageIndex === 4 ? 3.0 : 
                           stageIndex === 5 ? 3.2 : 3.5;

        // Scale up the whole group
        gsap.to(groupRef.current.scale, {
            y: 1,
            x: 1,
            z: 1,
            duration: 1,
            ease: "power2.out"
        });

        // Scale the stem height
        gsap.to(stemRef.current.scale, {
            y: targetHeight,
            duration: 1.5,
            ease: "elastic.out(1, 0.75)"
        });

        // Adjust position so it stays on ground
        gsap.to(stemRef.current.position, {
            y: targetHeight / 2,
            duration: 1.5,
            ease: "elastic.out(1, 0.75)"
        });
    }, [stageIndex]);

    // Wind animation
    useFrame((state) => {
        if (!groupRef.current) return;
        const t = state.clock.elapsedTime;
        const sway = Math.sin(t * 1.2) * 0.03;
        groupRef.current.rotation.z = sway;
        groupRef.current.rotation.x = sway * 0.4;
    });

    return (
        <group ref={groupRef} position={[0, 0, 0]}>
            {/* Stem */}
            <mesh ref={stemRef} position={[0, 0, 0]} castShadow>
                <cylinderGeometry args={[0.04, 0.06, 1, 12]} />
                <meshStandardMaterial color={plantColor} roughness={0.4} />
            </mesh>

            {/* Leaves - Procedural leaves that sprout as plant grows */}
            <group>
                {stageIndex >= 2 && Array.from({ length: Math.min(stageIndex * 3, 15) }).map((_, i) => {
                    const yPos = (i * 0.25) + 0.3;
                    // Only show leaves below the current height
                    return (
                        <group key={i} position={[0, yPos, 0]} rotation={[0, (i * Math.PI * 0.6), 0]}>
                            <mesh rotation={[Math.PI / 4, 0, 0]} castShadow>
                                <boxGeometry args={[0.02, 0.4, 0.1]} />
                                <meshStandardMaterial color={plantColor} roughness={0.6} />
                            </mesh>
                        </group>
                    );
                })}
            </group>

            {/* Grain Head / Flowering */}
            {isFlowering && (
                <group position={[0, stageIndex >= 4 ? (stageIndex * 0.5) : 1, 0]}>
                    <mesh position={[0, 0.3, 0]} castShadow>
                        <capsuleGeometry args={[0.12, 0.6, 8, 16]} />
                        <meshStandardMaterial color={grainColor} />
                    </mesh>
                </group>
            )}
        </group>
    );
};

const Soil = () => (
    <group position={[0, -0.01, 0]}>
        {/* Dirt Base */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <circleGeometry args={[4, 64]} />
            <meshStandardMaterial color="#3d2b1f" roughness={1} />
        </mesh>
        
        {/* Digital Grid for "Digital Twin" look */}
        <Grid 
            infiniteGrid 
            fadeDistance={20} 
            fadeStrength={5} 
            cellSize={0.5} 
            sectionSize={1} 
            sectionColor="#10b981" 
            sectionThickness={1.5}
            cellColor="#10b981"
            cellThickness={0.5}
            position={[0, 0.02, 0]}
        />
    </group>
);

const TechOverlays = ({ stage }: { stage: string }) => {
    return (
        <Html position={[2, 2.5, 0]} center distanceFactor={10}>
            <div className="bg-black/80 backdrop-blur-md border border-emerald-500/50 p-4 rounded-xl text-white pointer-events-none select-none min-w-[200px] shadow-2xl">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                    <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400">Digital Twin Engine</span>
                </div>
                <div className="text-2xl font-black text-white mb-2 tracking-tight">{stage}</div>
                <div className="space-y-2">
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                            className="h-full bg-emerald-500" 
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 2 }}
                        />
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-bold text-emerald-400/70 uppercase">
                        <span className="flex items-center gap-1">
                             Status: <span className="text-white">Active</span>
                        </span>
                        <span className="flex items-center gap-1">
                             Health: <span className="text-white">Optimal</span>
                        </span>
                    </div>
                </div>
            </div>
        </Html>
    );
};

// --- Main Scene ---

interface DigitalTwinCropProps {
    currentStage: string;
}

const stages = ['Seed', 'Germination', 'Seedling', 'Vegetative', 'Flowering', 'Grain Formation', 'Harvest'];

export const DigitalTwinCrop: React.FC<DigitalTwinCropProps> = ({ currentStage }) => {
    const stageIndex = useMemo(() => stages.indexOf(currentStage), [currentStage]);

    return (
        <div className="w-full h-full relative bg-[#020617]">
            <Canvas shadows gl={{ antialias: true, alpha: true }}>
                <PerspectiveCamera makeDefault position={[5, 4, 8]} fov={35} />
                <OrbitControls 
                    enableZoom={false} 
                    enablePan={false}
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 2.1}
                />
                
                {/* Lighting */}
                <ambientLight intensity={0.8} />
                <directionalLight 
                    position={[10, 10, 5]} 
                    intensity={2} 
                    castShadow 
                    shadow-mapSize={[2048, 2048]}
                />
                <pointLight position={[-5, 5, -5]} intensity={1} color="#3b82f6" />
                <spotLight 
                    position={[0, 10, 0]} 
                    angle={0.15} 
                    penumbra={1} 
                    intensity={2} 
                    castShadow 
                />

                {/* Environment */}
                <Sky sunPosition={[100, 20, 100]} />
                <Environment preset="city" />
                
                {/* Scene Content */}
                <group position={[0, -1, 0]}>
                    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.1}>
                        <PlantModel stageIndex={stageIndex} stage={currentStage} />
                        <SeedModel visible={stageIndex <= 1} />
                    </Float>
                    <Soil />
                </group>

                {/* Digital Twin Overlays */}
                <TechOverlays stage={currentStage} />

                <ContactShadows 
                    position={[0, -1, 0]} 
                    opacity={0.6} 
                    scale={15} 
                    blur={2} 
                    far={4.5} 
                />
            </Canvas>

            {/* Scanning Effect Overlay (UI layer) */}
            <div className="absolute inset-0 pointer-events-none border border-emerald-500/10 rounded-2xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent animate-[scan_4s_linear_infinite]" />
            </div>

            <style jsx global>{`
                @keyframes scan {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
            `}</style>
        </div>
    );
};

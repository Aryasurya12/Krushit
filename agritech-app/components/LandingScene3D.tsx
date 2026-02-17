'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Realistic crop field with wind animation
function CropField() {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const count = 200;

    const dummy = useMemo(() => new THREE.Object3D(), []);

    const [positions, setPositions] = useState<{ x: number; y: number; z: number; phase: number; height: number }[]>([]);

    useEffect(() => {
        const pos: { x: number; y: number; z: number; phase: number; height: number }[] = [];
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 20;
            const z = (Math.random() - 0.5) * 20;
            const y = 0;
            pos.push({ x, y, z, phase: Math.random() * Math.PI * 2, height: 0.8 + Math.random() * 0.4 });
        }
        const timer = setTimeout(() => setPositions(pos), 0);
        return () => clearTimeout(timer);
    }, []);

    useFrame((state) => {
        if (!meshRef.current || positions.length === 0) return;

        const time = state.clock.elapsedTime;

        positions.forEach((pos, i) => {
            const windStrength = 0.08;
            const windSpeed = 1.5;

            // Gentle wind sway
            const sway = Math.sin(time * windSpeed + pos.phase) * windStrength;

            dummy.position.set(pos.x, pos.y, pos.z);
            dummy.rotation.z = sway;
            dummy.scale.set(0.15, pos.height, 0.15);
            dummy.updateMatrix();

            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });

        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow receiveShadow>
            <cylinderGeometry args={[0.05, 0.08, 1, 6]} />
            <meshStandardMaterial
                color="#4ade80"
                roughness={0.8}
                metalness={0.1}
            />
        </instancedMesh>
    );
}

// Realistic terrain with soft hills
function Terrain() {
    const meshRef = useRef<THREE.Mesh>(null);

    const geometry = useMemo(() => {
        const geo = new THREE.PlaneGeometry(40, 40, 32, 32);
        const positions = geo.attributes.position.array as Float32Array;

        // Create gentle hills
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];

            // Smooth terrain variation
            const height =
                Math.sin(x * 0.1) * 0.3 +
                Math.cos(y * 0.15) * 0.2 +
                Math.sin(x * 0.05 + y * 0.05) * 0.4;

            positions[i + 2] = height;
        }

        geo.computeVertexNormals();
        return geo;
    }, []);

    return (
        <mesh
            ref={meshRef}
            geometry={geometry}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -0.5, 0]}
            receiveShadow
        >
            <meshStandardMaterial
                color="#86efac"
                roughness={0.9}
                metalness={0.05}
            />
        </mesh>
    );
}

// Subtle moving clouds
function Clouds() {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.1) * 2;
        }
    });

    return (
        <group ref={groupRef} position={[0, 8, -15]}>
            {[...Array(5)].map((_, i) => (
                <mesh key={i} position={[i * 3 - 6, Math.sin(i) * 0.5, 0]}>
                    <sphereGeometry args={[1.5, 8, 8]} />
                    <meshStandardMaterial
                        color="#ffffff"
                        transparent
                        opacity={0.6}
                        roughness={1}
                    />
                </mesh>
            ))}
        </group>
    );
}

// Camera controller with subtle movement
function CameraController() {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (groupRef.current) {
            // Very subtle rotation
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.02;
        }
    });

    return (
        <group ref={groupRef}>
            <Terrain />
            <CropField />
            <Clouds />
        </group>
    );
}

// Main realistic farm scene - ALL COMPONENTS INSIDE CANVAS
function SceneContent() {
    return (
        <>
            {/* Sky gradient background */}
            <color attach="background" args={['#e0f2fe']} />

            {/* Atmospheric fog for depth */}
            <fog attach="fog" args={['#e0f2fe', 15, 35]} />

            {/* Scene components */}
            <CameraController />

            {/* Realistic lighting setup */}
            {/* Warm sunrise directional light */}
            <directionalLight
                position={[10, 10, 5]}
                intensity={1.2}
                color="#ffd89b"
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-far={50}
                shadow-camera-left={-20}
                shadow-camera-right={20}
                shadow-camera-top={20}
                shadow-camera-bottom={-20}
                shadow-bias={-0.0001}
            />

            {/* Soft ambient hemisphere light */}
            <hemisphereLight
                args={['#87ceeb', '#86efac', 0.6]}
            />

            {/* Subtle fill light */}
            <ambientLight intensity={0.3} />
        </>
    );
}

export default function LandingScene3D() {
    return (
        <div className="absolute inset-0 opacity-50">
            <Canvas
                camera={{
                    position: [0, 4, 12],
                    fov: 50,
                    near: 0.1,
                    far: 100
                }}
                shadows
                gl={{
                    antialias: true,
                    alpha: true,
                    toneMapping: THREE.ACESFilmicToneMapping,
                    toneMappingExposure: 1.2
                }}
                dpr={[1, 1.5]}
            >
                <SceneContent />
            </Canvas>
        </div>
    );
}

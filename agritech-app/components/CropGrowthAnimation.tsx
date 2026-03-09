'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';

const stages = [
    { id: 'Seed', name: 'Seed', description: 'Active Dormancy Stage', info: 'Small seed inside the soil waiting for moisture.' },
    { id: 'Germination', name: 'Germination', description: 'Sprouting Phase', info: 'Tiny sprout emerging from the soil as roots establish.' },
    { id: 'Seedling', name: 'Seedling', description: 'Initial Growth', info: 'Small plant with the first two true leaves developed.' },
    { id: 'Vegetative', name: 'Vegetative', description: 'Leaf & Stem Development', info: 'Taller plant with multiple leaves and a thickening stem.' },
    { id: 'Flowering', name: 'Flowering', description: 'Reproductive Phase', info: 'Plant begins to show flowers or reproductive structures.' },
    { id: 'Grain Formation', name: 'Grain Formation', description: 'Yield Development', info: 'Grains or fruits are forming on the plant structure.' },
    { id: 'Harvest', name: 'Harvest', description: 'Maturity Stage', info: 'Fully mature plant with full grain structure ready for collection.' }
];

const LeafIcon = ({ status }: { status: 'completed' | 'current' | 'future' }) => (
    <svg viewBox="0 0 24 24" className={`w-8 h-8 transition-all duration-500 ${status === 'completed' ? 'text-emerald-800 scale-100' :
        status === 'current' ? 'text-emerald-500 drop-shadow-[0_0_12px_rgba(16,185,129,0.8)] scale-125' :
            'text-gray-300 scale-90 opacity-60'
        }`} fill="currentColor">
        <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
    </svg>
);

interface CropGrowthAnimationProps {
    currentStage: string;
}

export const CropGrowthAnimation: React.FC<CropGrowthAnimationProps> = ({ currentStage }) => {
    const [hoveredStage, setHoveredStage] = useState<number | null>(null);
    const currentIndex = stages.findIndex(s => s.id === currentStage);

    return (
        <div className="flex flex-col w-full">
            {/* Visual Display Area */}
            <div className="relative h-80 w-full bg-gradient-to-b from-[#e0f2fe] to-[#bae6fd] rounded-2xl overflow-hidden border border-blue-200 shadow-lg group">
                {/* Animated Sun */}
                <motion.div
                    className="absolute top-8 right-12 w-16 h-16 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full shadow-[0_0_50px_rgba(251,191,36,0.6)]"
                    animate={{
                        scale: [1, 1.05, 1],
                        rotate: [0, 90, 180, 270, 360]
                    }}
                    transition={{
                        scale: { repeat: Infinity, duration: 4, ease: "easeInOut" },
                        rotate: { repeat: Infinity, duration: 20, ease: "linear" }
                    }}
                />

                {/* Rays */}
                <div className="absolute top-8 right-12 w-16 h-16 animate-pulse opacity-40">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="absolute top-1/2 left-1/2 w-24 h-[2px] bg-yellow-200 origin-left" style={{ transform: `rotate(${i * 45}deg) translateX(10px)` }}></div>
                    ))}
                </div>

                {/* Floating Clouds */}
                <motion.div
                    className="absolute top-12 left-1/4 w-28 h-10 bg-white/80 rounded-full blur-md"
                    animate={{ x: [-20, 20, -20] }}
                    transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute top-24 left-1/2 w-36 h-12 bg-white/70 rounded-full blur-lg"
                    animate={{ x: [30, -30, 30] }}
                    transition={{ repeat: Infinity, duration: 20, ease: "easeInOut" }}
                />

                {/* Interaction Tooltip (Floating) */}
                <AnimatePresence>
                    {hoveredStage !== null && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="absolute top-6 left-6 z-30 bg-white/90 backdrop-blur-md p-4 rounded-xl border border-white/50 shadow-2xl max-w-[240px]"
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-700">
                                    <Info size={16} />
                                </div>
                                <h4 className="font-bold text-gray-900 leading-none">{stages[hoveredStage].name}</h4>
                            </div>
                            <p className="text-[11px] font-bold text-emerald-600 uppercase mb-2">{stages[hoveredStage].description}</p>
                            <p className="text-xs text-gray-600 leading-relaxed font-medium">{stages[hoveredStage].info}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Plant System: Left to Right Growth Sequence */}
                <div className="absolute bottom-16 left-0 w-full h-full flex items-end justify-between px-4 sm:px-8 z-10 pb-2 pointer-events-none">
                    {stages.map((stage, i) => {
                        const isCurrent = i === currentIndex;
                        const isCompleted = i < currentIndex;
                        const status = isCurrent ? 'current' : isCompleted ? 'completed' : 'future';

                        // Wheat Plant Metrics
                        const isHarvest = i === 6;
                        const baseColor = status === 'future' ? '#9CA3AF' : isHarvest ? '#D97706' : '#16A34A';
                        const leafColor = status === 'future' ? '#D1D5DB' : isHarvest ? '#B45309' : '#15803D';
                        const spikeColor = status === 'future' ? '#E5E7EB' : isHarvest ? '#F59E0B' : '#86EFAC';

                        const height = i === 0 ? 0 : i === 1 ? 15 : i === 2 ? 40 : i === 3 ? 90 : i === 4 ? 130 : i === 5 ? 160 : 160;
                        const scale = isCurrent ? 1.25 : 1.0;
                        const opacity = status === 'future' ? 0.3 : 1;
                        const filter = status === 'future' ? 'grayscale(100%)' : 'none';

                        return (
                            <div
                                key={stage.id}
                                className="relative flex-1 flex justify-center items-end"
                            >
                                {/* Active Indicator Glow */}
                                {isCurrent && (
                                    <motion.div
                                        className="absolute -bottom-4 w-20 h-8 bg-emerald-400/40 rounded-[100%] blur-md z-0"
                                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                    />
                                )}

                                <motion.div
                                    className="relative flex flex-col items-center justify-end origin-bottom z-10 pointer-events-auto cursor-pointer"
                                    onMouseEnter={() => setHoveredStage(i)}
                                    onMouseLeave={() => setHoveredStage(null)}
                                    animate={{ scale, opacity, filter }}
                                    transition={{ duration: 0.5 }}
                                >
                                    {/* Seed Stage */}
                                    {i === 0 && (
                                        <div className="w-4 h-2.5 bg-[#8B4513] rounded-full border border-[#5C3A21] shadow-sm transform translate-y-2" />
                                    )}

                                    {/* Germination and beyond */}
                                    {i > 0 && (
                                        <div style={{ height: `${height}px`, width: '4px', backgroundColor: baseColor, borderRadius: '4px' }} className="relative flex justify-center">

                                            {/* Germination Sprout */}
                                            {i === 1 && (
                                                <div className="absolute top-0 -right-2 w-3 h-4 border-t-2 border-r-2 rounded-tr-full" style={{ borderColor: leafColor }} />
                                            )}

                                            {/* Wheat Leaves (Long & Thin) */}
                                            {i >= 2 && Array.from({ length: Math.min(i * 2 + 2, 10) }).map((_, leafIdx) => {
                                                const side = leafIdx % 2 === 0 ? -1 : 1;
                                                const bottomPos = 5 + Math.floor(leafIdx / 2) * 20;
                                                if (bottomPos > height - 15) return null;

                                                const leafWidth = 25 + Math.min(i, 4) * 5;

                                                return (
                                                    <div key={leafIdx} className="absolute origin-bottom shadow-sm" style={{
                                                        bottom: `${bottomPos}px`,
                                                        left: side === -1 ? `-${leafWidth - 2}px` : '2px',
                                                        width: `${leafWidth}px`,
                                                        height: '4px',
                                                        backgroundColor: leafColor,
                                                        borderRadius: side === -1 ? '100% 0 100% 0' : '0 100% 0 100%',
                                                        transform: `rotate(${side * (40 + (leafIdx % 3) * 5)}deg)`
                                                    }}>
                                                        <div className="w-full h-[1px] bg-white/20 absolute top-1/2 -translate-y-1/2" />
                                                    </div>
                                                );
                                            })}

                                            {/* Wheat Head (Spike) */}
                                            {i >= 4 && (
                                                <div className="absolute -top-10 flex flex-col items-center" style={{ transformOrigin: 'bottom', transform: i === 6 ? 'rotate(15deg)' : 'none' }}>
                                                    <div style={{ width: '12px', height: i === 4 ? '35px' : '45px', backgroundColor: baseColor, borderRadius: '6px' }} className="relative flex flex-col items-center justify-center gap-[2px] p-[2px] shadow-sm">
                                                        {/* Wheat Kernels */}
                                                        {Array.from({ length: i === 4 ? 6 : 8 }).map((_, k) => (
                                                            <div key={k} className="w-full flex justify-between gap-[1px]">
                                                                <div style={{ width: '4px', height: '5px', backgroundColor: spikeColor, borderRadius: '2px' }} />
                                                                <div style={{ width: '4px', height: '5px', backgroundColor: spikeColor, borderRadius: '2px' }} />
                                                            </div>
                                                        ))}
                                                        {/* Awns (Bristles) */}
                                                        <div className="absolute -top-6 flex justify-around w-full h-8 opacity-60">
                                                            <div style={{ width: '1px', height: '100%', backgroundColor: spikeColor, transform: 'rotate(-15deg)' }} />
                                                            <div style={{ width: '1px', height: '100%', backgroundColor: spikeColor }} />
                                                            <div style={{ width: '1px', height: '100%', backgroundColor: spikeColor, transform: 'rotate(15deg)' }} />
                                                        </div>
                                                        <div className="absolute top-0 flex justify-around w-[150%] h-8 opacity-60 pointer-events-none">
                                                            <div style={{ width: '1px', height: '100%', backgroundColor: spikeColor, transform: 'rotate(-25deg)' }} />
                                                            <div style={{ width: '1px', height: '100%', backgroundColor: spikeColor, transform: 'rotate(25deg)' }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            </div>
                        );
                    })}
                </div>

                {/* Improved Soil Section */}
                <div className="absolute bottom-0 w-full h-16 bg-[#5c4033] z-20 overflow-hidden shadow-[inset_0_10px_20px_rgba(0,0,0,0.4)]">
                    {/* Surface Texture */}
                    <div className="absolute top-0 w-full h-[6px] bg-[#4a3328] border-t border-[#3d2a21]"></div>

                    {/* Soil Details / Rocks */}
                    {[...Array(12)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute bg-[#3d2a21] rounded-full opacity-40"
                            style={{
                                width: `${Math.random() * 20 + 10}px`,
                                height: `${Math.random() * 6 + 2}px`,
                                top: `${Math.random() * 40 + 10}px`,
                                left: `${Math.random() * 100}%`
                            }}
                        ></div>
                    ))}

                    {/* Grass patches */}
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={`grass-${i}`}
                            className="absolute top-[-4px] w-4 h-2 bg-emerald-800/40 rounded-full blur-[2px]"
                            style={{ left: `${15 + i * 18}%` }}
                        ></div>
                    ))}
                </div>
            </div>

            {/* Leaf Timeline Progress */}
            <div className="mt-8 px-2">
                <div className="relative flex justify-between items-center sm:px-4">
                    {/* Progress Bar Background */}
                    <div className="absolute top-4 left-6 right-6 h-[4px] bg-gray-100 rounded-full -z-10"></div>

                    {/* Active Progress Bar */}
                    <motion.div
                        className="absolute top-4 left-6 h-[4px] bg-emerald-500 rounded-full -z-10"
                        initial={{ width: 0 }}
                        animate={{ width: `${(currentIndex / 6) * 100}%` }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        style={{ maxWidth: 'calc(100% - 48px)' }}
                    />

                    {stages.map((stage, i) => {
                        const isCompleted = i < currentIndex;
                        const isCurrent = i === currentIndex;
                        const isFuture = i > currentIndex;
                        const status = isCurrent ? 'current' : isCompleted ? 'completed' : 'future';

                        return (
                            <div
                                key={stage.id}
                                className="flex flex-col items-center cursor-pointer relative group"
                                onMouseEnter={() => setHoveredStage(i)}
                                onMouseLeave={() => setHoveredStage(null)}
                            >
                                <div className="relative mb-3 flex items-center justify-center">
                                    {isCurrent && (
                                        <motion.div
                                            layoutId="glow"
                                            className="absolute inset-0 bg-emerald-400/20 rounded-full blur-xl"
                                            animate={{ scale: [1, 1.5, 1] }}
                                            transition={{ repeat: Infinity, duration: 2 }}
                                        />
                                    )}
                                    <LeafIcon status={status} />
                                </div>

                                <p className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-center transition-colors duration-300 ${isCurrent ? 'text-emerald-600' : isCompleted ? 'text-emerald-800/70' : 'text-gray-400'
                                    }`}>
                                    {stage.name}
                                </p>

                                {/* Desktop mini-tooltip on hover */}
                                <AnimatePresence>
                                    {hoveredStage === i && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute -bottom-16 bg-gray-900 text-white text-[9px] py-1 px-2 rounded whitespace-nowrap z-50 pointer-events-none md:block hidden"
                                        >
                                            {stage.description}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const SeedIllustration = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <circle cx="50" cy="70" r="4" fill="#8B4513" />
    <motion.circle 
      cx="50" cy="70" r="5" 
      fill="#A0522D" 
      animate={{ scale: [1, 1.1, 1] }} 
      transition={{ repeat: Infinity, duration: 3 }} 
      opacity="0.6"
    />
  </svg>
);

export const GerminationIllustration = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <path d="M50 70 Q52 60 55 55" stroke="#4ADE80" strokeWidth="3" fill="none" strokeLinecap="round" />
    <motion.path 
      d="M55 55 L58 52" 
      stroke="#22C55E" 
      strokeWidth="2" 
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1 }}
    />
  </svg>
);

export const SeedlingIllustration = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <path d="M50 70 Q50 50 50 40" stroke="#4ADE80" strokeWidth="4" fill="none" strokeLinecap="round" />
    <path d="M50 50 Q40 45 35 45" stroke="#22C55E" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M50 50 Q60 45 65 45" stroke="#22C55E" strokeWidth="3" fill="none" strokeLinecap="round" />
    <motion.g animate={{ rotate: [-2, 2, -2] }} transition={{ repeat: Infinity, duration: 4 }}>
        <path d="M35 45 C30 40 30 35 35 35 C40 35 42 40 42 45 Z" fill="#4ADE80" />
        <path d="M65 45 C70 40 70 35 65 35 C60 35 58 40 58 45 Z" fill="#4ADE80" />
    </motion.g>
  </svg>
);

export const VegetativeIllustration = () => (
  <svg viewBox="0 0 100 150" className="w-full h-full">
    <path d="M50 140 L50 40" stroke="#166534" strokeWidth="6" fill="none" strokeLinecap="round" />
    <motion.g animate={{ rotate: [-1, 1, -1] }} transition={{ repeat: Infinity, duration: 5 }}>
        <path d="M50 110 Q30 100 20 100 C15 100 15 90 20 90 Q30 90 50 110" fill="#22C55E" />
        <path d="M50 110 Q70 100 80 100 C85 100 85 90 80 90 Q70 90 50 110" fill="#22C55E" />
        <path d="M50 80 Q30 70 25 60 C20 55 25 50 30 55 Q40 60 50 80" fill="#4ADE80" />
        <path d="M50 80 Q70 70 75 60 C80 55 75 50 70 55 Q60 60 50 80" fill="#4ADE80" />
    </motion.g>
  </svg>
);

export const FloweringIllustration = () => (
  <svg viewBox="0 0 100 180" className="w-full h-full">
    <path d="M50 170 L50 50" stroke="#166534" strokeWidth="6" fill="none" strokeLinecap="round" />
    <motion.g animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 3 }}>
        <circle cx="50" cy="45" r="8" fill="#FDE047" />
        <circle cx="50" cy="35" r="6" fill="#FACC15" />
        <path d="M50 45 L40 35 M50 45 L60 35 M50 45 L50 25" stroke="#EAB308" strokeWidth="2" />
    </motion.g>
    <path d="M50 130 Q30 120 20 120" stroke="#166534" strokeWidth="4" fill="none" opacity="0.8" />
    <path d="M50 130 Q70 120 80 120" stroke="#166534" strokeWidth="4" fill="none" opacity="0.8" />
  </svg>
);

export const GrainIllustration = () => (
  <svg viewBox="0 0 100 200" className="w-full h-full">
    <path d="M50 190 L50 40" stroke="#166534" strokeWidth="6" fill="none" strokeLinecap="round" />
    <motion.g animate={{ y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 4 }}>
        <path d="M50 40 C45 30 45 20 50 10 C55 20 55 30 50 40" fill="#FDE047" />
        <path d="M53 45 C58 35 58 25 53 15" fill="#FACC15" />
        <path d="M47 45 C42 35 42 25 47 15" fill="#FACC15" />
    </motion.g>
    <path d="M50 100 Q80 80 85 60" stroke="#15803D" strokeWidth="4" fill="none" />
    <path d="M50 130 Q20 110 15 90" stroke="#15803D" strokeWidth="4" fill="none" />
  </svg>
);

export const HarvestIllustration = () => (
  <svg viewBox="0 0 100 200" className="w-full h-full">
    <path d="M50 190 L50 60" stroke="#854D0E" strokeWidth="7" fill="none" strokeLinecap="round" />
    <motion.g animate={{ rotate: [-2, 2, -2] }} transition={{ repeat: Infinity, duration: 6 }}>
        <path d="M50 60 C40 40 40 20 50 0 C60 20 60 40 50 60" fill="#CA8A04" />
        <path d="M55 70 C65 50 65 30 55 10" fill="#EAB308" />
        <path d="M45 70 C35 50 35 30 45 10" fill="#EAB308" />
        <path d="M60 90 C75 70 75 50 60 30" fill="#FACC15" />
        <path d="M40 90 C25 70 25 50 40 30" fill="#FACC15" />
    </motion.g>
  </svg>
);

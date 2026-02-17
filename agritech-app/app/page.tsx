'use client';

import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import {
  Sprout,
  Scan,
  Droplets,
  CloudSun,
  Activity,
  Mic,
  Users,
  TrendingUp,
  Leaf,
  Gauge,
  Bell,
  Globe,
  ArrowRight,
  CheckCircle,
  XCircle,
  Cpu,
  Zap,
  Sparkles
} from 'lucide-react';

// Lazy load 3D scene
const LandingScene3D = dynamic(() => import('@/components/LandingScene3D'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-gradient-to-br from-green-100/20 to-blue-100/20" />
});

// Animated background particles
function FloatingParticles() {
  const [particles, setParticles] = useState<{ x: number; y: number; yTarget: number; duration: number; delay: number }[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setParticles(
        [...Array(20)].map(() => ({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          yTarget: Math.random() * -100 - 50,
          duration: Math.random() * 3 + 2,
          delay: Math.random() * 2,
        }))
      );
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-green-400/30 rounded-full"
          initial={{
            x: p.x,
            y: p.y
          }}
          animate={{
            y: [null, p.yTarget],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay
          }}
        />
      ))}
    </div>
  );
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const stagger: Variants = {
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2
    }
  }
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export default function LandingPage() {
  const { i18n } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);
  // const { scrollYProgress } = useScroll();
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    // Initial check wrapped in timeout to avoid sync state update warning
    const timer = setTimeout(() => {
      handleResize();
    }, 0);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  const features = [
    { icon: Sprout, title: 'Crop Registration', desc: 'Register and track multiple crops with growth stages', color: 'from-green-500 to-emerald-600' },
    { icon: Activity, title: 'Growth Monitoring', desc: 'Real-time monitoring of crop health and development', color: 'from-blue-500 to-cyan-600' },
    { icon: Scan, title: 'AI Disease Detection', desc: '98% accurate disease identification using AI camera', color: 'from-purple-500 to-pink-600' },
    { icon: Droplets, title: 'Smart Irrigation', desc: 'IoT-based water management and scheduling', color: 'from-cyan-500 to-blue-600' },
    { icon: CloudSun, title: 'Weather Integration', desc: '7-day forecast with farming advisories', color: 'from-amber-500 to-orange-600' },
    { icon: Gauge, title: 'IoT Sensor Dashboard', desc: 'Live soil moisture, temperature, and pH tracking', color: 'from-indigo-500 to-purple-600' },
    { icon: Mic, title: 'Voice Assistant', desc: 'Hands-free farming guidance in your language', color: 'from-rose-500 to-red-600' },
    { icon: Users, title: 'Community Alerts', desc: 'Disease outbreak mapping in your region', color: 'from-teal-500 to-green-600' },
    { icon: TrendingUp, title: 'Predictive Analytics', desc: 'Yield forecasting and risk assessment', color: 'from-violet-500 to-purple-600' },
    { icon: Bell, title: 'Farm Health Score', desc: 'Comprehensive health scoring and recommendations', color: 'from-emerald-500 to-green-600' }
  ];

  const steps = [
    { num: '01', title: 'Register Farm', desc: 'Add your farm details and crop information' },
    { num: '02', title: 'Connect Sensors', desc: 'Link IoT devices for real-time monitoring' },
    { num: '03', title: 'Scan & Monitor', desc: 'Use AI to detect diseases and track growth' },
    { num: '04', title: 'Get Recommendations', desc: 'Receive smart, data-driven farming advice' }
  ];

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिंदी' },
    { code: 'mr', name: 'Marathi', native: 'मराठी' },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' }
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                <Sprout className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Krushit</span>
            </motion.div>
            <div className="flex items-center gap-4">
              <select
                value={i18n.language}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium bg-white hover:border-green-300 transition-colors"
              >
                <option value="en">EN</option>
                <option value="hi">हिं</option>
                <option value="mr">मर</option>
              </select>
              <Link href="/auth/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 text-gray-700 font-medium hover:text-green-600 transition-colors"
                >
                  Sign In
                </motion.button>
              </Link>
              <Link href="/auth/register">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 10px 40px rgba(34, 197, 94, 0.3)' }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold shadow-lg shadow-green-500/30 transition-all"
                >
                  Get Started
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section with 3D */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-blue-50">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.15),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(59,130,246,0.15),transparent_50%)]"></div>
        </div>

        {/* Grain texture overlay */}
        <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")' }}></div>

        {/* Floating particles */}
        {!isMobile && <FloatingParticles />}

        {/* 3D Scene */}
        {!isMobile && (
          <div className="absolute inset-0 pointer-events-none">
            <LandingScene3D />
          </div>
        )}

        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            <div>
              <motion.div
                variants={scaleIn}
                className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-green-200 px-4 py-2 rounded-full mb-6 shadow-lg shadow-green-500/10"
              >
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="relative flex h-2 w-2"
                >
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </motion.span>
                <span className="text-sm font-semibold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">AI + IoT Powered Platform</span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="text-5xl lg:text-7xl font-bold mb-6 leading-[1.1]"
              >
                <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                  Smart Farming
                </span>
                <br />
                <span className="relative inline-block">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-emerald-500 to-green-600 animate-gradient">
                    Powered by AI & IoT
                  </span>
                  <motion.span
                    className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-400 opacity-20 blur-xl"
                    animate={{ opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-xl text-gray-600 mb-8 leading-relaxed"
              >
                Monitor crop health, detect diseases, optimize irrigation, and increase yield — all in one intelligent platform.
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link href="/auth/register">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="group px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-green-600/30 hover:shadow-2xl hover:shadow-green-600/40 transition-all flex items-center justify-center gap-2 relative overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.5 }}
                    />
                    <Sprout size={20} className="relative z-10" />
                    <span className="relative z-10">Start Farming Free</span>
                    <Sparkles size={16} className="relative z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.button>
                </Link>
                <a href="#features">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="group px-8 py-4 bg-white text-gray-700 rounded-xl font-bold text-lg border-2 border-gray-200 hover:border-green-300 transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    Explore Features
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </a>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="mt-8 flex items-center gap-6 text-sm text-gray-500"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600" />
                  <span>7 languages supported</span>
                </div>
              </motion.div>
            </div>

            <motion.div
              variants={fadeUp}
              className="relative"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative bg-gradient-to-br from-green-100 to-blue-100 rounded-3xl p-8 shadow-2xl"
              >
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-green-500 rounded-full blur-3xl opacity-30"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-30"></div>
                <div className="relative bg-white rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">Farm Dashboard</h3>
                    <motion.span
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1"
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      LIVE
                    </motion.span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: Leaf, value: '92%', label: 'Crop Health', color: 'from-green-50 to-green-100', iconColor: 'text-green-600' },
                      { icon: Droplets, value: '45%', label: 'Soil Moisture', color: 'from-blue-50 to-blue-100', iconColor: 'text-blue-600' },
                      { icon: CloudSun, value: '28°C', label: 'Temperature', color: 'from-amber-50 to-amber-100', iconColor: 'text-amber-600' },
                      { icon: TrendingUp, value: '+15%', label: 'Yield Forecast', color: 'from-purple-50 to-purple-100', iconColor: 'text-purple-600' }
                    ].map((stat, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 + i * 0.1 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        className={`bg-gradient-to-br ${stat.color} p-4 rounded-xl cursor-pointer transition-all`}
                      >
                        <stat.icon className={`${stat.iconColor} mb-2`} size={24} />
                        <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                        <div className="text-xs text-gray-600">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Platform Overview - Circular Ecosystem Layout */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-green-50/30 to-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-0 lg:mb-12 relative z-10"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="inline-block mb-4 p-3 bg-green-100/50 rounded-full"
            >
              <Sparkles className="text-green-600 mx-auto" size={24} />
            </motion.div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">Krushit Ecosystem</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              A complete, connected platform for smart agriculture
            </p>
          </motion.div>

          {/* Mobile & Tablet Layout (Clean Grid) */}
          <div className="grid md:grid-cols-2 gap-5 lg:hidden mt-10">
            {features.map((feature, i) => (
              <motion.div
                key={`mobile-${i}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-start gap-4"
              >
                <div className={`w-10 h-10 shrink-0 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center text-white`}>
                  <feature.icon size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Desktop Circular Layout - Animated & Centered */}
          <div className="hidden lg:flex items-center justify-center relative w-full h-[900px] mt-8 overflow-visible">

            {/* Main Rotating Container for subtle movement */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
              className="relative w-[800px] h-[800px] flex items-center justify-center"
            >
              {/* Connecting Lines Layer */}
              <div className="absolute inset-0 z-0">
                {features.map((_, i) => {
                  const angle = (i * 360) / features.length;
                  return (
                    <div
                      key={`line-${i}`}
                      className="absolute top-1/2 left-1/2 h-[1px] bg-gradient-to-r from-green-300/0 via-green-300/40 to-green-300/0 origin-left"
                      style={{
                        width: '380px', // Radius + extra
                        transform: `translateY(-50%) rotate(${angle - 90}deg)`
                      }}
                    />
                  );
                })}
              </div>

              {/* Orbital Rings */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border border-gray-100/50 rounded-full border-dashed z-0"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[100px] border border-green-50/50 rounded-full z-0"
              />

              {/* Feature Nodes (Counter-rotate to stay upright) */}
              {features.map((feature, i) => {
                const angle = (i * 360) / features.length;
                const rad = (angle - 90) * (Math.PI / 180);
                const radius = 350;

                return (
                  <div
                    key={`node-${i}`}
                    className="absolute z-10 w-12 h-12 -ml-6 -mt-6 flex items-center justify-center"
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: `translate(${Math.cos(rad) * radius}px, ${Math.sin(rad) * radius}px)`
                    }}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      // Counter-rotation to keep the node static relative to the screen while container spins
                      // But we actually need to counter-rotate against the container's rotation.
                      // The container rotates +360.
                      // So we must rotate -360.
                      animate={{ rotate: -360 }}
                    // NOTE: We used to have another inner motion.div doing the same. 
                    // We can simplify or keep both if we want independent control.
                    // Let's keep the structure clean.
                    >
                      <motion.div
                        // This inner rotation matches the duration of the parent container to keep it upright
                        animate={{ rotate: -360 }}
                        transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
                        className="relative group cursor-pointer"
                      >
                        <motion.div
                          whileHover={{ scale: 1.15 }}
                          className={`w-16 h-16 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center relative z-10 group-hover:border-green-400 group-hover:shadow-green-200/50 transition-all duration-300`}
                        >
                          <feature.icon className={`text-gray-500 group-hover:text-green-600 transition-colors duration-300`} size={28} />
                        </motion.div>

                        {/* Label */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-48 text-center pointer-events-none opacity-100 transition-opacity">
                          <h4 className="font-bold text-sm text-gray-800 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg inline-block shadow-sm border border-gray-100">
                            {feature.title}
                          </h4>
                        </div>
                      </motion.div>
                    </motion.div>
                  </div>
                );
              })}
            </motion.div>

            {/* Center Core (Static relative to screen, pulsing) */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute z-20 text-center pointer-events-none"
            >
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute inset-0 bg-green-400/20 blur-3xl rounded-full"
                />
                <div className="w-40 h-40 bg-white rounded-full shadow-2xl shadow-green-200/50 flex flex-col items-center justify-center relative border-4 border-white z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white mb-2 shadow-inner">
                    <Cpu size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Krushit AI</h3>
                  <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Core</span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-blue-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">How The System Works</h2>
            <p className="text-xl text-gray-600">Get started in 4 simple steps</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="relative"
              >
                <motion.div
                  whileHover={{ y: -8, scale: 1.03 }}
                  className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-lg shadow-green-500/50"
                  >
                    {step.num}
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.desc}</p>
                </motion.div>
                {i < steps.length - 1 && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 + 0.3, duration: 0.5 }}
                    className="hidden md:block absolute top-8 -right-4 w-8 h-1 bg-gradient-to-r from-green-500 to-emerald-600 origin-left"
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI + IoT Highlight */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full mb-6">
                <Cpu className="text-blue-600" size={16} />
                <span className="text-sm font-semibold text-blue-700">Powered by Advanced Technology</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">AI & IoT Integration</h2>
              <p className="text-lg text-gray-600 mb-8">
                Harness the power of artificial intelligence and Internet of Things to make smarter farming decisions based on real-time data and predictive analytics.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Gauge, title: 'Real-time Sensor Tracking', desc: 'Monitor soil moisture, temperature, pH, and humidity 24/7', color: 'bg-green-100', iconColor: 'text-green-600' },
                  { icon: Scan, title: 'AI Disease Detection', desc: '98% accurate identification using computer vision', color: 'bg-blue-100', iconColor: 'text-blue-600' },
                  { icon: Bell, title: 'Smart Risk Alerts', desc: 'Predictive warnings for diseases, pests, and weather', color: 'bg-amber-100', iconColor: 'text-amber-600' },
                  { icon: Droplets, title: 'Smart Irrigation Score', desc: 'Optimize water usage and reduce waste by up to 40%', color: 'bg-purple-100', iconColor: 'text-purple-600' }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    whileHover={{ x: 8 }}
                    className="flex items-start gap-4 cursor-pointer"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center flex-shrink-0`}
                    >
                      <item.icon className={item.iconColor} size={20} />
                    </motion.div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-gray-600 text-sm">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-blue-500/10"
                  animate={{ opacity: [0.1, 0.2, 0.1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <h3 className="text-white font-bold text-lg">IoT Dashboard</h3>
                  <div className="flex items-center gap-2">
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="relative flex h-2 w-2"
                    >
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </motion.span>
                    <span className="text-green-400 text-xs font-semibold">LIVE</span>
                  </div>
                </div>
                <div className="space-y-3 relative z-10">
                  {[
                    { label: 'Soil Moisture', value: 45, color: 'from-blue-500 to-blue-400' },
                    { label: 'Temperature', value: 70, color: 'from-amber-500 to-amber-400' },
                    { label: 'Soil pH', value: 65, color: 'from-green-500 to-green-400' }
                  ].map((sensor, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-300 text-sm">{sensor.label}</span>
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 + i * 0.1 }}
                          className="text-white font-bold"
                        >
                          {sensor.value}%
                        </motion.span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${sensor.value}%` }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.5 + i * 0.1, duration: 1, ease: "easeOut" }}
                          className={`bg-gradient-to-r ${sensor.color} h-2 rounded-full`}
                        />
                      </div>
                    </motion.div>
                  ))}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 mt-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Zap className="text-white" size={24} />
                      <div>
                        <div className="text-white font-bold">Irrigation Recommended</div>
                        <div className="text-white/80 text-sm">Water 500L in next 2 hours</div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Multilingual Support */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-purple-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full mb-6">
              <Globe className="text-purple-600" size={16} />
              <span className="text-sm font-semibold text-purple-700">Multilingual & Accessible</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Speak Your Language</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Available in 7 Indian languages to ensure every farmer can access smart farming technology
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {languages.map((lang, i) => (
              <motion.div
                key={lang.code}
                initial={{ opacity: 0, scale: 0.5, rotateY: -90 }}
                whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                whileHover={{ scale: 1.1, y: -8, rotateY: 10 }}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all text-center cursor-pointer"
              >
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  className="text-3xl mb-2"
                >
                  {lang.native}
                </motion.div>
                <div className="text-sm font-semibold text-gray-600">{lang.name}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Why Choose Krushit?</h2>
            <p className="text-xl text-gray-600">See the difference smart farming makes</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-red-50 to-red-100 p-8 rounded-3xl border-2 border-red-200 shadow-lg"
            >
              <div className="flex items-center gap-3 mb-6">
                <XCircle className="text-red-600" size={32} />
                <h3 className="text-2xl font-bold text-gray-900">Without Platform</h3>
              </div>
              <ul className="space-y-4">
                {[
                  'Late disease detection leads to crop loss',
                  'Water waste due to inefficient irrigation',
                  'Low yield and unpredictable outcomes',
                  'No predictive alerts or risk management'
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <XCircle className="text-red-500 flex-shrink-0 mt-1" size={20} />
                    <span className="text-gray-700">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-3xl border-2 border-green-300 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle className="text-green-600" size={32} />
                <h3 className="text-2xl font-bold text-gray-900">With Krushit</h3>
              </div>
              <ul className="space-y-4">
                {[
                  'Early disease warnings with 98% accuracy',
                  'Smart irrigation saves up to 40% water',
                  'Data-driven farming increases yield by 15-25%',
                  'Predictive analytics and real-time alerts'
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                    <span className="text-gray-700">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 relative overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'grid\' width=\'60\' height=\'60\' patternUnits=\'userSpaceOnUse\'%3E%3Cpath d=\'M 10 0 L 0 0 0 10\' fill=\'none\' stroke=\'white\' stroke-opacity=\'0.1\' stroke-width=\'1\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'url(%23grid)\'/%3E%3C/svg%3E")',
            backgroundSize: '60px 60px'
          }}
        />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.h2
              className="text-5xl lg:text-6xl font-bold text-white mb-6"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Transform Your Farming Today
            </motion.h2>
            <p className="text-xl text-green-100 mb-10">
              Join thousands of farmers already using AI and IoT to grow smarter, not harder
            </p>
            <Link href="/auth/register">
              <motion.button
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                className="group px-12 py-5 bg-white text-green-600 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-white/30 transition-all inline-flex items-center gap-3 relative overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-green-50 to-blue-50"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
                <Sprout size={24} className="relative z-10" />
                <span className="relative z-10">Get Started Free</span>
                <ArrowRight size={24} className="relative z-10 group-hover:translate-x-2 transition-transform" />
              </motion.button>
            </Link>
            <p className="mt-6 text-green-100 text-sm">
              No credit card required • 7-day free trial • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-2 mb-4"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Sprout className="text-white" size={18} />
            </div>
            <span className="text-xl font-bold text-white">Krushit</span>
          </motion.div>
          <p className="text-sm">
            © 2026 Krushit. Empowering farmers with AI & IoT technology.
          </p>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -20px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(20px, 20px) scale(1.05); }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

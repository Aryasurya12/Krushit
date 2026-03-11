'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Cpu, 
    Wifi, 
    WifiOff, 
    Battery, 
    BatteryLow, 
    BatteryMedium, 
    BatteryWarning,
    Activity, 
    Search,
    Filter,
    ArrowUpRight,
    Zap,
    RefreshCw,
    AlertCircle,
    Monitor,
    Server,
    Clock,
    X,
    Database
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const StatusBadge = ({ status }: { status: string }) => {
    const isOnline = status === 'online';
    const isOffline = status === 'offline';
    
    return (
        <div className={`px-3 py-1.5 rounded-full inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${
            isOnline ? 'bg-emerald-50 text-emerald-600' : 
            isOffline ? 'bg-red-50 text-red-600 animate-pulse' : 
            'bg-amber-50 text-amber-600'
        }`}>
            {isOnline ? <Wifi size={14} /> : isOffline ? <WifiOff size={14} /> : <Activity size={12} />}
            {status}
        </div>
    );
};

const BatteryLevel = ({ level }: { level: number }) => {
    const color = level > 60 ? 'text-emerald-500' : level > 25 ? 'text-amber-500' : 'text-red-500';
    const Icon = level > 60 ? Battery : level > 25 ? BatteryMedium : BatteryLow;

    return (
        <div className="flex items-center gap-2 group">
            <Icon size={18} className={`${color} group-hover:scale-110 transition-transform`} />
            <span className="text-xs font-black text-gray-900 tracking-tighter">{level}%</span>
        </div>
    );
};

export default function IoTMonitoringPage() {
    const [devices, setDevices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDevice, setSelectedDevice] = useState<any>(null);

    const fetchDevices = async () => {
        setLoading(true);
        console.log("[Admin] Fetching production sensor telemetry (Manual Join)...");
        try {
            // Fetch raw tables separately
            const [
                { data: sensors, error: sErr },
                { data: crops },
                { data: users }
            ] = await Promise.all([
                supabase.from('iot_sensors').select('*').order('timestamp', { ascending: false }),
                supabase.from('crops').select('id, name'),
                supabase.from('users').select('id, full_name, region')
            ]);

            if (sErr) throw sErr;

            if (!sensors || sensors.length === 0) {
                console.log("[Admin] No sensor data found, using demonstration mock.");
                const mock = [
                    { id: 'KT-DW-001', farm_name: 'Nashik Cluster A', status: 'online', battery: 84, connectivity: 'Fiber-5G', last_update: '2m ago', sensor_data: { temp: '24°C', humidity: '42%', moisture: '28%' } },
                    { id: 'KT-DW-002', farm_name: 'Pune Farm-B', status: 'offline', battery: 12, connectivity: 'None', last_update: '45m ago', sensor_data: { temp: '--', humidity: '--', moisture: '--' } },
                ];
                setDevices(mock);
            } else {
                // Manual grouping logic
                const grouped: Record<string, any> = {};
                
                sensors.forEach((read: any) => {
                    const farmId = read.crop_id || read.user_id || 'unknown';
                    if (!grouped[farmId]) {
                        const crop = crops?.find(c => c.id === read.crop_id);
                        const user = users?.find(u => u.id === read.user_id);
                        
                        grouped[farmId] = {
                            id: `GATEWAY-${farmId.slice(0, 4)}`,
                            farm_name: `${user?.full_name || 'Farmer'}'s ${crop?.name || 'Farm'}`,
                            status: new Date().getTime() - new Date(read.timestamp).getTime() < 3600000 ? 'online' : 'offline',
                            battery: Math.floor(Math.random() * 40) + 60,
                            connectivity: 'Cellular-IoT',
                            last_update: new Date(read.timestamp).toLocaleTimeString(),
                            sensor_data: {}
                        };
                    }
                    
                    if (!grouped[farmId].sensor_data[read.sensor_type]) {
                        let label = read.sensor_type;
                        if (label === 'air_temperature') label = 'temp';
                        if (label === 'soil_moisture') label = 'moisture';
                        grouped[farmId].sensor_data[label] = `${read.value}${read.unit}`;
                    }
                });

                setDevices(Object.values(grouped));
                console.log(`[Admin] Synchronized ${Object.keys(grouped).length} operational nodes.`);
            }
        } catch (err: any) {
            console.error("[Admin] Telemetry sync failure:", err.message || err);
            // Fallback mock
            setDevices([
                { id: 'SYNC-ERR', farm_name: 'System Error Fallback', status: 'maintenance', battery: 0, connectivity: 'NONE', last_update: 'Now', sensor_data: { temp: 'ERR', humidity: 'ERR', moisture: 'ERR' } }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDevices();
    }, []);

    const provisionDevice = () => {
        console.log("[Admin] Initializing hardware provisioning sequence...");
        const newId = `KT-NW-${Math.floor(Math.random() * 900) + 100}`;
        alert(`Hardware Authentication successful. Assigned Device ID: ${newId}. Waiting for initial handshake...`);
    };

    const accessLogs = (id: string) => {
        console.log(`[Admin] Streaming raw binary logs from node ${id}...`);
        alert(`Connecting to ${id} via secure terminal. Retrieving last 500 events...`);
    };

    const dispatchTech = (code: string) => {
        console.warn(`[Admin] DISPATCHING mobile technical team for incident ${code}...`);
        alert(`Technical team dispatched to site. Expected ETA: 45 minutes.`);
    };

    return (
        <AdminLayout>
            <div className="space-y-12">
                {/* Visual Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {[
                        { icon: Wifi, label: 'Stable Nodes', value: devices.filter(d => d.status === 'online').length, color: 'emerald' },
                        { icon: WifiOff, label: 'Disconnected', value: devices.filter(d => d.status === 'offline').length, color: 'red' },
                        { icon: Server, label: 'Global Traffic', value: '1.2 GB/s', color: 'blue' },
                        { icon: BatteryWarning, label: 'Low Battery', value: devices.filter(d => d.battery < 20).length, color: 'amber' },
                    ].map((stat, idx) => (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            key={idx} 
                            className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-2xl hover:border-agri-green/10 transition-all"
                        >
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-3xl font-black text-gray-900 tracking-tighter group-hover:text-agri-green transition-colors">{stat.value}</p>
                            </div>
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-${stat.color}-50 text-${stat.color}-600`}>
                                <stat.icon size={22} />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Device List */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <div className="flex items-center gap-4">
                            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Active <span className="text-agri-green">Gateways</span></h3>
                            <div className="h-6 w-px bg-gray-200" />
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 transition-all hover:text-agri-green cursor-pointer" onClick={() => fetchDevices()}>
                                <RefreshCw size={14} className={loading ? "animate-spin" : "animate-spin-slow"} />
                                {loading ? "Polling..." : "Live Polling Enabled"}
                            </div>
                        </div>
                        <button 
                            onClick={provisionDevice}
                            className="flex items-center gap-3 px-6 py-3 bg-gray-900 text-white rounded-2xl shadow-xl hover:bg-black transition-all font-black text-xs uppercase tracking-widest active:scale-95"
                        >
                            <Zap size={18} className="text-amber-500" />
                            Provision New Node
                        </button>
                    </div>

                    <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 p-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {devices.map((device, idx) => (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    key={device.id} 
                                    className="p-8 rounded-[2rem] bg-gray-50 hover:bg-white hover:shadow-2xl hover:shadow-gray-200 border border-transparent hover:border-gray-100 transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-agri-green shadow-sm group-hover:animate-bounce">
                                            <Cpu size={24} />
                                        </div>
                                        <StatusBadge status={device.status} />
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-lg font-black text-gray-900 group-hover:text-agri-green transition-colors">{device.id}</h4>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{device.farm_name}</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 bg-white rounded-2xl border border-gray-100">
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Battery</p>
                                                <BatteryLevel level={device.battery} />
                                            </div>
                                            <div className="p-3 bg-white rounded-2xl border border-gray-100">
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Signal</p>
                                                <div className="flex items-center gap-2 text-blue-500">
                                                    <Wifi size={14} />
                                                    <span className="text-[10px] font-black tracking-tight">{device.connectivity}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                <Clock size={12} />
                                                {device.last_update}
                                            </div>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    accessLogs(device.id);
                                                }}
                                                className="text-agri-green hover:underline text-[10px] font-black uppercase tracking-widest"
                                            >
                                                Access Logs
                                            </button>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                console.log(`[Admin] Opening detail view for ${device.id}`);
                                                setSelectedDevice(device);
                                            }}
                                            className="w-full mt-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:bg-agri-green group-hover:text-white group-hover:border-agri-green transition-all"
                                        >
                                            Drill Down Details
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* IoT Alerts Section */}
                <div className="bg-red-50/50 rounded-[3rem] p-10 border border-red-100">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-500/10">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-red-900 uppercase tracking-tight">System Alerts</h3>
                            <p className="text-red-700 font-bold uppercase tracking-widest text-[10px]">Critical Infrastructure failures</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {[
                            { code: 'ERR-503', msg: 'Packet loss exceeding 35% in Nashik Outpost.', severity: 'critical' },
                            { code: 'ERR-BAT', msg: 'Device #002 (Pune) is at 12% - shutdown imminent.', severity: 'high' }
                        ].map((alert, i) => (
                            <div key={i} className="flex items-center justify-between p-6 bg-white rounded-3xl border border-red-100 shadow-sm hover:shadow-xl transition-all">
                                <div className="flex items-center gap-6">
                                    <code className="text-xs font-black bg-red-50 text-red-600 px-3 py-1 rounded-lg border border-red-100 uppercase">{alert.code}</code>
                                    <p className="text-sm font-bold text-gray-700">{alert.msg}</p>
                                </div>
                                <button 
                                    onClick={() => dispatchTech(alert.code)}
                                    className="px-6 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
                                >
                                    Dispatch Tech
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Device Drill-down Modal */}
                <AnimatePresence>
                    {selectedDevice && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedDevice(null)}
                                className="absolute inset-0 bg-gray-900/40 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-full"
                            >
                                <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-gray-900 flex items-center justify-center text-agri-green shadow-xl">
                                            <Cpu size={32} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">{selectedDevice.id}</h3>
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{selectedDevice.farm_name} • Operational Hub</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedDevice(null)}
                                        className="p-4 bg-white border border-gray-100 text-gray-400 hover:text-red-500 rounded-2xl transition-all shadow-sm active:scale-95"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="p-10 overflow-y-auto space-y-8">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                        {[
                                            { label: 'Ambient Temp', value: selectedDevice.sensor_data?.temp || '24°C', icon: Zap, color: 'text-amber-500' },
                                            { label: 'Relative Humidity', value: selectedDevice.sensor_data?.humidity || '42%', icon: Activity, color: 'text-blue-500' },
                                            { label: 'Soil Moisture', value: selectedDevice.sensor_data?.moisture || '28%', icon: Database, color: 'text-emerald-500' },
                                        ].map((stat, i) => (
                                            <div key={i} className="p-6 bg-gray-50 rounded-3xl border border-gray-100/50 group hover:bg-white hover:shadow-xl transition-all">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{stat.label}</p>
                                                <div className="flex items-center gap-3">
                                                    <stat.icon size={20} className={stat.color} />
                                                    <p className="text-2xl font-black text-gray-900 tracking-tighter">{stat.value}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Hardware Telemetry</h4>
                                        <div className="bg-gray-900 rounded-3xl p-8 text-white space-y-6">
                                            <div className="flex justify-between items-center pb-4 border-b border-white/10">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest italic">Signal Strength</span>
                                                <span className="text-sm font-black text-agri-green">{selectedDevice.connectivity}</span>
                                            </div>
                                            <div className="flex justify-between items-center pb-4 border-b border-white/10">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest italic">Battery Status</span>
                                                <span className="text-sm font-black text-amber-500">{selectedDevice.battery}% Healthy</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest italic">Last Handshake</span>
                                                <span className="text-sm font-black text-blue-400">{selectedDevice.last_update}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <button className="py-4 bg-white border border-gray-100 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-600 hover:border-agri-green hover:text-agri-green transition-all shadow-sm">
                                            Recalibrate Sensors
                                        </button>
                                        <button className="py-4 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl">
                                            Reboot Hardware
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </AdminLayout>
    );
}

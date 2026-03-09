'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with Next.js
const fixLeafletIcons = () => {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
};

import { supabase } from '@/lib/supabase';

interface FarmMarker {
    farm_id: string;
    farmer_name: string;
    crop_name: string;
    disease_name: string;
    disease_severity: 'Healthy' | 'Mild' | 'Moderate' | 'Severe';
    latitude: number;
    longitude: number;
}

const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (x: number) => x * Math.PI / 180;
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// Fallback logic incase actual farm table doesn't exist locally
const getFallbackFarms = (lat: number, lng: number): FarmMarker[] => [
    { farm_id: 'mock-1', farmer_name: 'Raj Patil', crop_name: 'Wheat', disease_name: 'Healthy', disease_severity: 'Healthy', latitude: lat + 0.012, longitude: lng + 0.015 },
    { farm_id: 'mock-2', farmer_name: 'Amit Kumar', crop_name: 'Rice', disease_name: 'Blast Disease', disease_severity: 'Severe', latitude: lat - 0.02, longitude: lng + 0.02 },
    { farm_id: 'mock-3', farmer_name: 'Sunita Sharma', crop_name: 'Cotton', disease_name: 'Aphid Infestation', disease_severity: 'Mild', latitude: lat + 0.015, longitude: lng - 0.025 },
    { farm_id: 'mock-4', farmer_name: 'Suresh Verma', crop_name: 'Sugarcane', disease_name: 'Red Rot', disease_severity: 'Moderate', latitude: lat - 0.01, longitude: lng - 0.02 },
];

const DiseaseMap: React.FC = () => {
    const [farms, setFarms] = useState<FarmMarker[]>([]);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        fixLeafletIcons();

        let currentLocation: [number, number] = [19.0760, 72.8777]; // Default Mumbai

        const fetchFarms = async (userLat: number, userLng: number) => {
            try {
                const { data, error } = await supabase.from('farms').select('*');

                if (error) {
                    console.warn('Supabase fetch error, using fallback:', error.message);
                    setFarms(getFallbackFarms(userLat, userLng));
                    setIsOffline(true);
                    return;
                }

                if (data && data.length > 0) {
                    // Filter farms strictly within 10 km radius
                    const nearbyFarms = data.filter((farm: any) => {
                        const dist = haversineDistance(userLat, userLng, farm.latitude, farm.longitude);
                        return dist <= 10;
                    });
                    setFarms(nearbyFarms as FarmMarker[]);
                    setIsOffline(false);
                } else {
                    setFarms(getFallbackFarms(userLat, userLng));
                    setIsOffline(true);
                }
            } catch (err) {
                console.warn('Network error, using fallback');
                setFarms(getFallbackFarms(userLat, userLng));
                setIsOffline(true);
            }
        };

        const setupRealtime = () => {
            const channel = supabase
                .channel('public:farms')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'farms' },
                    () => {
                        // Re-fetch farms dynamically when database updates
                        fetchFarms(currentLocation[0], currentLocation[1]);
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        };

        const unsubscribe = setupRealtime();

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const loc: [number, number] = [position.coords.latitude, position.coords.longitude];
                    setUserLocation(loc);
                    currentLocation = loc;
                    fetchFarms(loc[0], loc[1]);
                },
                () => {
                    // Handle blocked location permissions by using default loc
                    setUserLocation(currentLocation);
                    fetchFarms(currentLocation[0], currentLocation[1]);
                }
            );
        } else {
            setUserLocation(currentLocation);
            fetchFarms(currentLocation[0], currentLocation[1]);
        }

        return () => {
            unsubscribe();
        };
    }, []);

    const getMarkerIcon = (severity: string) => {
        let color = '#10b981'; // Green (Healthy)
        if (severity === 'Mild') color = '#eab308'; // Yellow
        if (severity === 'Moderate') color = '#f97316'; // Orange
        if (severity === 'Severe') color = '#ef4444'; // Red

        return L.divIcon({
            className: 'custom-farm-marker',
            html: `<div style="background-color: ${color}; width: 22px; height: 22px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.5);"></div>`,
            iconSize: [22, 22],
            iconAnchor: [11, 11]
        });
    };

    if (!userLocation) return <div className="h-full w-full flex items-center justify-center bg-gray-50 animate-pulse text-gray-500 font-medium">Detecting Location...</div>;

    return (
        <div className="h-full w-full rounded-xl overflow-hidden relative">
            {isOffline && (
                <div className="absolute top-4 right-4 z-[1000] bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full text-xs font-bold shadow-md border border-amber-200 flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    Simulation Mode (Dummy Farms)
                </div>
            )}
            <MapContainer
                center={userLocation}
                zoom={12}
                style={{ height: '100%', width: '100%', zIndex: 0 }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* User Location Marker */}
                <Marker position={userLocation} icon={L.divIcon({
                    className: 'user-marker',
                    html: `<div style="background-color: #3b82f6; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.5);"></div>`,
                    iconSize: [18, 18],
                    iconAnchor: [9, 9]
                })}>
                    <Popup>
                        <div className="font-bold text-blue-600">Your Farm (Current Location)</div>
                        <p className="text-xs text-gray-500 mt-1">10 km scanning radius active</p>
                    </Popup>
                </Marker>

                {farms.map((farm) => (
                    <React.Fragment key={farm.farm_id}>
                        <Marker position={[farm.latitude, farm.longitude]} icon={getMarkerIcon(farm.disease_severity)}>
                            <Popup>
                                <div className="p-1 min-w-[170px]">
                                    <h3 className="font-bold text-gray-900 border-b pb-1.5 mb-2 text-base flex items-center gap-1.5">
                                        🧑‍🌾 {farm.farmer_name}
                                    </h3>
                                    <div className="space-y-1.5">
                                        <p className="text-sm text-gray-700">
                                            <span className="font-semibold text-gray-900">Crop:</span> {farm.crop_name}
                                        </p>
                                        <p className="text-sm text-gray-700">
                                            <span className="font-semibold text-gray-900">Disease:</span> {farm.disease_name}
                                        </p>
                                        <div className="mt-3 text-xs font-bold uppercase py-1 px-2.5 rounded-md w-max border" style={{
                                            backgroundColor: farm.disease_severity === 'Severe' ? '#fef2f2' : farm.disease_severity === 'Moderate' ? '#fff7ed' : farm.disease_severity === 'Mild' ? '#fefce8' : '#ecfdf5',
                                            color: farm.disease_severity === 'Severe' ? '#b91c1c' : farm.disease_severity === 'Moderate' ? '#c2410c' : farm.disease_severity === 'Mild' ? '#a16207' : '#047857',
                                            borderColor: farm.disease_severity === 'Severe' ? '#fecaca' : farm.disease_severity === 'Moderate' ? '#fed7aa' : farm.disease_severity === 'Mild' ? '#fef08a' : '#a7f3d0'
                                        }}>
                                            {farm.disease_severity} Severity
                                        </div>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>

                        {/* 3km Radius Alert Circle for Severe Outbreaks */}
                        {farm.disease_severity === 'Severe' && (
                            <Circle
                                center={[farm.latitude, farm.longitude]}
                                pathOptions={{
                                    color: '#ef4444',
                                    fillColor: '#ef4444',
                                    fillOpacity: 0.15,
                                    weight: 1.5,
                                    dashArray: '4'
                                }}
                                radius={3000} // Radius in meters (3 km)
                            />
                        )}
                    </React.Fragment>
                ))}
            </MapContainer>
        </div>
    );
};

export default DiseaseMap;

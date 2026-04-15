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

interface CommunityReport {
    id: string;
    title: string;
    description: string;
    location_name: string;
    severity: string;
    latitude: number;
    longitude: number;
    created_at: string;
}

const DiseaseMap: React.FC = () => {
    const [reports, setReports] = useState<CommunityReport[]>([]);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        fixLeafletIcons();

        let currentLocation: [number, number] = [19.0760, 72.8777]; // Default Mumbai

        const fetchReports = async () => {
            try {
                const { data, error } = await supabase.from('community_reports').select('*');

                if (error) {
                    console.warn('Supabase fetch error:', error.message);
                    return;
                }

                if (data && data.length > 0) {
                    setReports(data as CommunityReport[]);
                    setIsOffline(false);
                }
            } catch (err) {
                console.warn('Network error', err);
            }
        };

        const setupRealtime = () => {
            const channel = supabase
                .channel('public:community_reports')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'community_reports' },
                    () => {
                        // Re-fetch reports dynamically when database updates
                        fetchReports();
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
                    fetchReports();
                },
                () => {
                    // Handle blocked location permissions by using default loc
                    setUserLocation(currentLocation);
                    fetchReports();
                }
            );
        } else {
            setUserLocation(currentLocation);
            fetchReports();
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

                {reports.map((report) => (
                    <React.Fragment key={report.id}>
                        <Marker position={[report.latitude, report.longitude]} icon={getMarkerIcon(report.severity)}>
                            <Popup>
                                <div className="p-1 min-w-[170px]">
                                    <h3 className="font-bold text-gray-900 border-b pb-1.5 mb-2 text-base flex items-center gap-1.5">
                                        📍 {report.location_name || 'Community Farm'}
                                    </h3>
                                    <div className="space-y-1.5">
                                        <p className="text-sm font-semibold text-gray-900">
                                            {report.title}
                                        </p>
                                        <p className="text-xs text-gray-700">
                                            {report.description}
                                        </p>
                                        <div className="mt-3 text-xs font-bold uppercase py-1 px-2.5 rounded-md w-max border" style={{
                                            backgroundColor: report.severity === 'High' ? '#fef2f2' : report.severity === 'Moderate' ? '#fff7ed' : '#fefce8',
                                            color: report.severity === 'High' ? '#b91c1c' : report.severity === 'Moderate' ? '#c2410c' : '#a16207',
                                            borderColor: report.severity === 'High' ? '#fecaca' : report.severity === 'Moderate' ? '#fed7aa' : '#fef08a'
                                        }}>
                                            {report.severity} Severity
                                        </div>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>

                        {/* Alert Radius Area */}
                        {report.severity === 'High' && (
                            <Circle
                                center={[report.latitude, report.longitude]}
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

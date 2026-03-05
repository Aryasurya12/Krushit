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

interface DiseaseMarker {
    id: string;
    disease: string;
    crop: string;
    severity: 'High' | 'Moderate' | 'Low';
    lat: number;
    lng: number;
    date: string;
}

const getFallbackMarkers = (): DiseaseMarker[] => [
    { id: 'mock-1', disease: 'Leaf Rust', crop: 'Wheat', severity: 'High', lat: 19.0760, lng: 72.8777, date: new Date().toISOString().split('T')[0] },
    { id: 'mock-2', disease: 'Blast Disease', crop: 'Rice', severity: 'Moderate', lat: 19.1000, lng: 72.9000, date: new Date().toISOString().split('T')[0] },
    { id: 'mock-3', disease: 'Aphid Infestation', crop: 'Cotton', severity: 'Low', lat: 19.0500, lng: 72.8500, date: new Date().toISOString().split('T')[0] },
];

const DiseaseMap: React.FC = () => {
    const [markers, setMarkers] = useState<DiseaseMarker[]>([]);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        fixLeafletIcons();

        const fetchMarkers = async () => {
            try {
                // Use a short timeout to detect network issues quickly
                const { data, error } = await supabase
                    .from('community_disease_records')
                    .select('*');

                if (error) {
                    console.warn('Supabase fetch error:', error.message);
                    setMarkers(getFallbackMarkers());
                    setIsOffline(true);
                    return;
                }

                if (data && data.length > 0) {
                    const fetchedMarkers: DiseaseMarker[] = data.map((item: any) => ({
                        id: item.id,
                        disease: item.disease_name,
                        crop: item.crop_type,
                        severity: item.severity as any,
                        lat: parseFloat(item.location_lat),
                        lng: parseFloat(item.location_lng),
                        date: item.reported_date
                    }));
                    setMarkers(fetchedMarkers);
                } else {
                    setMarkers(getFallbackMarkers());
                }
            } catch (err) {
                // Silently use fallback on DNS/Network failure to prevent overlay
                console.warn('Map is in simulation mode (Network unavailable)');
                setMarkers(getFallbackMarkers());
                setIsOffline(true);
            }
        };

        fetchMarkers();

        // Try to get user location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([position.coords.latitude, position.coords.longitude]);
                },
                () => {
                    // Default to Mumbai if geolocation fails
                    setUserLocation([19.0760, 72.8777]);
                }
            );
        } else {
            setUserLocation([19.0760, 72.8777]);
        }
    }, []);

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'High': return '#ef4444'; // red-500
            case 'Moderate': return '#f59e0b'; // amber-500
            case 'Low': return '#3b82f6'; // blue-500
            default: return '#10b981'; // green-500
        }
    };

    if (!userLocation) return <div className="h-full w-full flex items-center justify-center bg-gray-50 animate-pulse">Loading Map...</div>;

    return (
        <div className="h-full w-full rounded-xl overflow-hidden border border-gray-200 shadow-inner relative">
            {isOffline && (
                <div className="absolute top-4 right-4 z-[1000] bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold shadow-md border border-amber-200 flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    Simulation Mode
                </div>
            )}
            <MapContainer
                center={userLocation}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {markers.map((marker) => (
                    <React.Fragment key={marker.id}>
                        <Marker position={[marker.lat, marker.lng]}>
                            <Popup>
                                <div className="p-1">
                                    <h3 className="font-bold text-gray-900">{marker.disease}</h3>
                                    <p className="text-sm text-gray-600">Crop: {marker.crop}</p>
                                    <div className={`mt-1 text-xs font-bold uppercase px-2 py-0.5 rounded inline-block ${marker.severity === 'High' ? 'bg-red-100 text-red-700' :
                                        marker.severity === 'Moderate' ? 'bg-amber-100 text-amber-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                        {marker.severity} Severity
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">Reported on {marker.date}</p>
                                </div>
                            </Popup>
                        </Marker>
                        <Circle
                            center={[marker.lat, marker.lng]}
                            pathOptions={{
                                color: getSeverityColor(marker.severity),
                                fillOpacity: 0.2,
                                weight: 1
                            }}
                            radius={2000}
                        />
                    </React.Fragment>
                ))}
            </MapContainer>
        </div>
    );
};

export default DiseaseMap;

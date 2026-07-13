'use client';

import { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps, MAPS_API_KEY, LocationValue } from '@/lib/googleMaps';
import { LocationAutocomplete } from './LocationAutocomplete';

interface MapLocationPickerProps {
  id?: string;
  value: LocationValue;
  onChange: (value: LocationValue) => void;
  placeholder?: string;
  inputClassName?: string;
}

// Default map center: Metro Manila
const DEFAULT_CENTER = { lat: 14.5995, lng: 120.9842 };

/**
 * Places Autocomplete input plus an interactive map with a draggable marker.
 * Selecting a suggestion pins the marker; dragging the marker reverse-geocodes
 * back to a formatted address. Without a Maps API key only the text input
 * renders (same graceful fallback as LocationAutocomplete).
 */
export function MapLocationPicker({
  id,
  value,
  onChange,
  placeholder = 'Search for an address or place',
  inputClassName = '',
}: MapLocationPickerProps) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!MAPS_API_KEY || !mapDivRef.current) return;
    let cancelled = false;

    loadGoogleMaps().then((g) => {
      if (!g || cancelled || !mapDivRef.current) return;

      const center =
        value.lat !== undefined && value.lng !== undefined
          ? { lat: value.lat, lng: value.lng }
          : DEFAULT_CENTER;

      const map = new g.maps.Map(mapDivRef.current, {
        center,
        zoom: value.lat !== undefined ? 15 : 11,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
      const marker = new g.maps.Marker({ map, position: center, draggable: true });
      const geocoder = new g.maps.Geocoder();

      marker.addListener('dragend', () => {
        const pos = marker.getPosition();
        if (!pos) return;
        const lat = pos.lat();
        const lng = pos.lng();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          const address =
            status === 'OK' && results?.[0]
              ? results[0].formatted_address
              : `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          onChangeRef.current({ address, lat, lng });
        });
      });

      mapRef.current = map;
      markerRef.current = marker;
      geocoderRef.current = geocoder;
      setMapReady(true);
    });

    return () => {
      cancelled = true;
    };
    // The map initializes once; subsequent value changes are handled below.
  }, []);

  // Keep the marker in sync when the autocomplete selects a new place
  useEffect(() => {
    if (!mapReady || value.lat === undefined || value.lng === undefined) return;
    const pos = { lat: value.lat, lng: value.lng };
    markerRef.current?.setPosition(pos);
    mapRef.current?.panTo(pos);
    if ((mapRef.current?.getZoom() ?? 0) < 15) mapRef.current?.setZoom(15);
  }, [mapReady, value.lat, value.lng]);

  return (
    <div className="space-y-2">
      <LocationAutocomplete
        id={id}
        placeholder={placeholder}
        value={value.address}
        onChange={onChange}
        className={inputClassName}
      />
      {MAPS_API_KEY && (
        <div
          ref={mapDivRef}
          className="w-full h-52 rounded-lg border border-gray-200 overflow-hidden"
        />
      )}
      {MAPS_API_KEY && (
        <p className="text-[11px] text-gray-400">Drag the pin to set the exact pick-up spot.</p>
      )}
    </div>
  );
}

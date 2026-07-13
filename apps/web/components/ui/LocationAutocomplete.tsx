'use client';

import { useEffect, useRef } from 'react';
import { loadGoogleMaps, MAPS_API_KEY, LocationValue } from '@/lib/googleMaps';

interface LocationAutocompleteProps {
  id?: string;
  value: string;
  onChange: (value: LocationValue) => void;
  placeholder?: string;
  className?: string;
  /** Restrict suggestions, e.g. ['(cities)'] or ['geocode']. Defaults to geocode. */
  types?: string[];
}

/**
 * Text input backed by Google Places Autocomplete. When no Maps API key is
 * configured it behaves as a plain text input (address only, no lat/lng).
 */
export function LocationAutocomplete({
  id,
  value,
  onChange,
  placeholder = 'City or area',
  className = '',
  types = ['geocode'],
}: LocationAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!MAPS_API_KEY || !inputRef.current) return;
    let autocomplete: google.maps.places.Autocomplete | null = null;
    let cancelled = false;

    loadGoogleMaps().then((g) => {
      if (!g || cancelled || !inputRef.current) return;
      autocomplete = new g.maps.places.Autocomplete(inputRef.current, {
        types,
        fields: ['formatted_address', 'geometry', 'name'],
      });
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete!.getPlace();
        const address = place.formatted_address || place.name || inputRef.current?.value || '';
        const loc = place.geometry?.location;
        onChangeRef.current({ address, lat: loc?.lat(), lng: loc?.lng() });
      });
    });

    return () => {
      cancelled = true;
      if (autocomplete) google.maps.event.clearInstanceListeners(autocomplete);
    };
  }, []);

  return (
    <input
      ref={inputRef}
      id={id}
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange({ address: e.target.value })}
      className={className}
    />
  );
}

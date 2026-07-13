// Lazy loader for the Google Maps JavaScript API (Places library included).
// All Maps features degrade gracefully when NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is
// not provisioned: loadGoogleMaps() resolves to null and callers fall back to
// plain text inputs.

export const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

export interface LocationValue {
  address: string;
  lat?: number;
  lng?: number;
}

let loaderPromise: Promise<typeof google | null> | null = null;

export function loadGoogleMaps(): Promise<typeof google | null> {
  if (typeof window === 'undefined' || !MAPS_API_KEY) return Promise.resolve(null);
  if (window.google?.maps?.places) return Promise.resolve(window.google);
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_API_KEY}&libraries=places&loading=async`;
    script.async = true;
    script.onload = () => resolve(window.google ?? null);
    script.onerror = () => {
      loaderPromise = null;
      resolve(null);
    };
    document.head.appendChild(script);
  });
  return loaderPromise;
}

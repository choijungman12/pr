interface Bounds {
    swLat: number;
    swLng: number;
    neLat: number;
    neLng: number;
}

export function getPolygon(bounds: Bounds, margin= 0.005, fixed= 6): string {
    const { swLat, swLng, neLat, neLng } = bounds;
    const minLat = (Math.min(swLat, neLat) - margin).toFixed(fixed);
    const maxLat = (Math.max(swLat, neLat) + margin).toFixed(fixed);
    const minLng = (Math.min(swLng, neLng) - margin).toFixed(fixed);
    const maxLng = (Math.max(swLng, neLng) + margin).toFixed(fixed);
  
    return `${minLng} ${minLat}, ${minLng} ${maxLat}, ${maxLng} ${maxLat}, ${maxLng} ${minLat}, ${minLng} ${minLat}`;
  }
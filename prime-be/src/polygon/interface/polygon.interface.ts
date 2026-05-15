export interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface SpatialIndexEntry {
  filePath: string;
  fileOffset: number;
  fileLength: number;
  boundingBox: BoundingBox;
  pnu: string;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

import { mysqlTable as table, customType } from "drizzle-orm/mysql-core";
import * as t from "drizzle-orm/mysql-core";

const geometry = customType<{
   data: { x: number; y: number }[][]; 
   driverData: string;               
 }>({
   dataType() {
     return 'GEOMETRY'; 
   },
   toDriver(value) {
     const coordinates = value.map(ring => ring.map(point => [point.x, point.y]));
     return JSON.stringify({
       type: 'Polygon',
       coordinates: coordinates
     });
   },
   fromDriver(value) {
      let geo;
      
      try {
        geo = typeof value === 'string' ? JSON.parse(value) : value;
    
        if (geo && geo.coordinates && Array.isArray(geo.coordinates)) {
          return geo.coordinates[0].map(([x, y]) => ({ x, y }));
        }
    
        return [];
      } catch (e) {
        console.error('GeoJSON parsing failed:', e);
        return [];
      }
    }
 });
 

export const city = table("city",{
   id: t.int("id").primaryKey().autoincrement(),
   name: t.varchar('name', { length: 100 }).notNull(),
   tableName: t.varchar('table_name', { length: 100 }).notNull(),
   geo: geometry('geo').notNull(), 
});
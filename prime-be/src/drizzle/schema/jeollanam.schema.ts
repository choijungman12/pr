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
 

export const jeollanam = table("jeollanam",{
   id: t.int("id").primaryKey().autoincrement(),
   landType: t.varchar('land_type', { length: 50 }).notNull().default('0'),
   landArea: t.decimal('land_area', { precision: 10, scale: 3 }).notNull().default('0.000'),
   landName: t.varchar('land_name', { length: 100 }).notNull(),
   amount: t.bigint('amount', { mode: 'bigint' }).notNull(),
   year: t.smallint('year').notNull().default(0),
   month: t.tinyint('month').notNull().default(0),
   day: t.tinyint('day').notNull().default(0),
   geo: geometry('geo').notNull(), 
   point: t.text('point').notNull(), 
   data: t.longtext('data').notNull(),
});
export class LandRegisterRes {
  table_name!: string;
  real_region_id!: number;

  static of(tableName: string, realRegionId: number): LandRegisterRes {
    return { table_name: tableName, real_region_id: realRegionId };
  }
}

export type LandTableRes = string[];

export const FIRMS_BASE_URL = 'https://firms.modaps.eosdis.nasa.gov/api/area/csv';

// Middle East bounding box: south_lat,west_lon,north_lat,east_lon (FIRMS format)
export const MIDDLE_EAST_BBOX = '10,30,40,65';

export const FIRMS_SOURCES = {
  VIIRS_SNPP: 'VIIRS_SNPP_NRT',
  VIIRS_NOAA20: 'VIIRS_NOAA20_NRT',
  VIIRS_NOAA21: 'VIIRS_NOAA21_NRT',
  MODIS: 'MODIS_NRT'
} as const;

export type FIRMSSource = (typeof FIRMS_SOURCES)[keyof typeof FIRMS_SOURCES];

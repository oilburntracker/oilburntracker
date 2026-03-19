export const FIRMS_BASE_URL = 'https://firms.modaps.eosdis.nasa.gov/api/area/csv';

// Middle East bounding box: west,south,east,north
export const MIDDLE_EAST_BBOX = '30,10,65,40';

export const FIRMS_SOURCES = {
  VIIRS_SNPP: 'VIIRS_SNPP_NRT',
  VIIRS_NOAA20: 'VIIRS_NOAA20_NRT',
  VIIRS_NOAA21: 'VIIRS_NOAA21_NRT',
  MODIS: 'MODIS_NRT'
} as const;

export type FIRMSSource = (typeof FIRMS_SOURCES)[keyof typeof FIRMS_SOURCES];

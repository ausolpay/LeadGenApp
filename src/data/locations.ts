export const CAIRNS_SUBURBS = [
  'Aeroglen',
  'Bayview Heights',
  'Bentley Park',
  'Brinsmead',
  'Bungalow',
  'Cairns City',
  'Cairns North',
  'Caravonica',
  'Clifton Beach',
  'Earlville',
  'Edge Hill',
  'Edmonton',
  'Freshwater',
  'Gordonvale',
  'Holloways Beach',
  'Kanimbla',
  'Kewarra Beach',
  'Machans Beach',
  'Manoora',
  'Manunda',
  'Mooroobool',
  'Mount Sheridan',
  'Palm Cove',
  'Parramatta Park',
  'Portsmith',
  'Redlynch',
  'Smithfield',
  'Stratford',
  'Trinity Beach',
  'Trinity Park',
  'Westcourt',
  'Whitfield',
  'Woree',
  'Yorkeys Knob'
] as const;

export const CAIRNS_POSTCODES = [
  '4868',
  '4869',
  '4870',
  '4878',
  '4879'
] as const;

export type CairnsSuburb = typeof CAIRNS_SUBURBS[number];
export type CairnsPostcode = typeof CAIRNS_POSTCODES[number];

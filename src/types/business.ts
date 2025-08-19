export type ContactState = {
  called: boolean;
  emailed: boolean;
  contactedAt?: string; // ISO
  contactedVia?: ('called'|'emailed'|'both');
};

export interface Business {
  placeId: string;
  name: string;
  types: string[];
  category?: string; // derived from types / user's dropdown
  websiteUrl?: string;
  googleUrl: string;
  phoneRaw?: string;
  phoneFormatted?: string; // libphonenumber AU
  email?: string;          // optional, often absent from Places
  rating?: number;
  ratingCount?: number;
  address: string;
  suburb?: string;
  postcode?: string;
  ownerName?: string; // extracted from business name or address
  sellingPoints: SellingPoint[];
  notes?: string;
  contact?: ContactState;
}

export type SellingPoint = 
  | 'no-website' 
  | 'facebook-only' 
  | 'likely-outdated'
  | 'no-phone'
  | 'low-ratings'
  | 'no-reviews'
  | 'old-business'
  | 'home-based'
  | 'mobile-business'
  | 'seasonal-business'
  | 'weekend-only'
  | 'cash-only'
  | 'no-social-media'
  | 'runs-ads';

export type SortOption = 'name-asc' | 'most-active';

export interface Filters {
  suburbs: string[];
  postcodes: string[];
  hasMobile: boolean;
  hasOffice: boolean;
  noWebsite: boolean;
  facebookOnly: boolean;
  likelyOutdated: boolean;
  sellingPoints: SellingPoint[];
}

export interface SearchParams {
  query: string;
  businessType: string;
  pageToken?: string;
}

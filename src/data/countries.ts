// Universal country and region data for location setup

export interface Country {
  code: string
  name: string
  regionLabel: string // What to call the region (State, Province, etc.)
  regions: Region[]
  phoneFormat?: string
  addressFormat?: string
}

export interface Region {
  code: string
  name: string
  majorCities: string[]
}

export const COUNTRIES: Country[] = [
  {
    code: 'AU',
    name: 'Australia',
    regionLabel: 'State',
    regions: [
      {
        code: 'NSW',
        name: 'New South Wales',
        majorCities: ['Sydney', 'Newcastle', 'Wollongong', 'Central Coast', 'Albury']
      },
      {
        code: 'VIC',
        name: 'Victoria',
        majorCities: ['Melbourne', 'Geelong', 'Ballarat', 'Bendigo', 'Shepparton']
      },
      {
        code: 'QLD',
        name: 'Queensland',
        majorCities: ['Brisbane', 'Gold Coast', 'Cairns', 'Townsville', 'Toowoomba']
      },
      {
        code: 'WA',
        name: 'Western Australia',
        majorCities: ['Perth', 'Fremantle', 'Mandurah', 'Bunbury', 'Geraldton']
      },
      {
        code: 'SA',
        name: 'South Australia',
        majorCities: ['Adelaide', 'Mount Gambier', 'Whyalla', 'Murray Bridge']
      },
      {
        code: 'TAS',
        name: 'Tasmania',
        majorCities: ['Hobart', 'Launceston', 'Devonport', 'Burnie']
      },
      {
        code: 'NT',
        name: 'Northern Territory',
        majorCities: ['Darwin', 'Alice Springs', 'Katherine', 'Tennant Creek']
      },
      {
        code: 'ACT',
        name: 'Australian Capital Territory',
        majorCities: ['Canberra']
      }
    ]
  },
  {
    code: 'US',
    name: 'United States',
    regionLabel: 'State',
    regions: [
      {
        code: 'CA',
        name: 'California',
        majorCities: ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento', 'San Jose']
      },
      {
        code: 'NY',
        name: 'New York',
        majorCities: ['New York City', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse']
      },
      {
        code: 'TX',
        name: 'Texas',
        majorCities: ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth']
      },
      {
        code: 'FL',
        name: 'Florida',
        majorCities: ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Fort Lauderdale']
      },
      {
        code: 'IL',
        name: 'Illinois',
        majorCities: ['Chicago', 'Aurora', 'Joliet', 'Naperville', 'Peoria']
      },
      {
        code: 'WA',
        name: 'Washington',
        majorCities: ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue']
      },
      {
        code: 'MA',
        name: 'Massachusetts',
        majorCities: ['Boston', 'Worcester', 'Springfield', 'Cambridge', 'Lowell']
      },
      {
        code: 'CO',
        name: 'Colorado',
        majorCities: ['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Lakewood']
      }
    ]
  },
  {
    code: 'CA',
    name: 'Canada',
    regionLabel: 'Province',
    regions: [
      {
        code: 'ON',
        name: 'Ontario',
        majorCities: ['Toronto', 'Ottawa', 'Hamilton', 'London', 'Kitchener']
      },
      {
        code: 'BC',
        name: 'British Columbia',
        majorCities: ['Vancouver', 'Victoria', 'Surrey', 'Burnaby', 'Richmond']
      },
      {
        code: 'QC',
        name: 'Quebec',
        majorCities: ['Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Longueuil']
      },
      {
        code: 'AB',
        name: 'Alberta',
        majorCities: ['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge', 'Medicine Hat']
      },
      {
        code: 'MB',
        name: 'Manitoba',
        majorCities: ['Winnipeg', 'Brandon', 'Steinbach', 'Thompson', 'Portage la Prairie']
      },
      {
        code: 'SK',
        name: 'Saskatchewan',
        majorCities: ['Saskatoon', 'Regina', 'Prince Albert', 'Moose Jaw', 'Swift Current']
      },
      {
        code: 'NS',
        name: 'Nova Scotia',
        majorCities: ['Halifax', 'Sydney', 'Dartmouth', 'Truro', 'New Glasgow']
      },
      {
        code: 'NB',
        name: 'New Brunswick',
        majorCities: ['Saint John', 'Moncton', 'Fredericton', 'Dieppe', 'Riverview']
      }
    ]
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    regionLabel: 'Region',
    regions: [
      {
        code: 'ENG',
        name: 'England',
        majorCities: ['London', 'Manchester', 'Birmingham', 'Liverpool', 'Leeds']
      },
      {
        code: 'SCT',
        name: 'Scotland',
        majorCities: ['Glasgow', 'Edinburgh', 'Aberdeen', 'Dundee', 'Stirling']
      },
      {
        code: 'WLS',
        name: 'Wales',
        majorCities: ['Cardiff', 'Swansea', 'Newport', 'Wrexham', 'Barry']
      },
      {
        code: 'NIR',
        name: 'Northern Ireland',
        majorCities: ['Belfast', 'Derry', 'Lisburn', 'Newtownabbey', 'Bangor']
      }
    ]
  },
  {
    code: 'NZ',
    name: 'New Zealand',
    regionLabel: 'Region',
    regions: [
      {
        code: 'AUK',
        name: 'Auckland',
        majorCities: ['Auckland', 'Manukau', 'North Shore', 'Waitakere']
      },
      {
        code: 'WGN',
        name: 'Wellington',
        majorCities: ['Wellington', 'Lower Hutt', 'Upper Hutt', 'Porirua']
      },
      {
        code: 'CAN',
        name: 'Canterbury',
        majorCities: ['Christchurch', 'Timaru', 'Ashburton', 'Rangiora']
      },
      {
        code: 'OTA',
        name: 'Otago',
        majorCities: ['Dunedin', 'Queenstown', 'Oamaru', 'Balclutha']
      },
      {
        code: 'WKO',
        name: 'Waikato',
        majorCities: ['Hamilton', 'Tauranga', 'Rotorua', 'New Plymouth']
      }
    ]
  },
  {
    code: 'DE',
    name: 'Germany',
    regionLabel: 'State',
    regions: [
      {
        code: 'BY',
        name: 'Bavaria',
        majorCities: ['Munich', 'Nuremberg', 'Augsburg', 'Regensburg', 'Würzburg']
      },
      {
        code: 'NW',
        name: 'North Rhine-Westphalia',
        majorCities: ['Cologne', 'Düsseldorf', 'Dortmund', 'Essen', 'Duisburg']
      },
      {
        code: 'BE',
        name: 'Berlin',
        majorCities: ['Berlin']
      },
      {
        code: 'HH',
        name: 'Hamburg',
        majorCities: ['Hamburg']
      },
      {
        code: 'HE',
        name: 'Hesse',
        majorCities: ['Frankfurt', 'Wiesbaden', 'Kassel', 'Darmstadt', 'Offenbach']
      }
    ]
  },
  {
    code: 'FR',
    name: 'France',
    regionLabel: 'Region',
    regions: [
      {
        code: 'IDF',
        name: 'Île-de-France',
        majorCities: ['Paris', 'Boulogne-Billancourt', 'Saint-Denis', 'Argenteuil']
      },
      {
        code: 'ARA',
        name: 'Auvergne-Rhône-Alpes',
        majorCities: ['Lyon', 'Grenoble', 'Saint-Étienne', 'Villeurbanne']
      },
      {
        code: 'PACA',
        name: 'Provence-Alpes-Côte d\'Azur',
        majorCities: ['Marseille', 'Nice', 'Toulon', 'Aix-en-Provence']
      },
      {
        code: 'OCC',
        name: 'Occitanie',
        majorCities: ['Toulouse', 'Montpellier', 'Nîmes', 'Perpignan']
      }
    ]
  }
]

// Helper functions
export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find(country => country.code === code)
}

export function getCountryByName(name: string): Country | undefined {
  return COUNTRIES.find(country => 
    country.name.toLowerCase() === name.toLowerCase()
  )
}

export function getRegionsByCountry(countryCode: string): Region[] {
  const country = getCountryByCode(countryCode)
  return country ? country.regions : []
}

export function searchCitiesByCountry(countryCode: string, query: string): string[] {
  const regions = getRegionsByCountry(countryCode)
  const allCities = regions.flatMap(region => region.majorCities)
  
  if (!query) return allCities.slice(0, 10) // Return first 10 if no query
  
  return allCities.filter(city => 
    city.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 10)
}

export function detectCountryFromTimezone(): string {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    
    // Simple timezone to country mapping
    const timezoneToCountry: Record<string, string> = {
      'Australia/Sydney': 'AU',
      'Australia/Melbourne': 'AU',
      'Australia/Brisbane': 'AU',
      'Australia/Perth': 'AU',
      'Australia/Adelaide': 'AU',
      'Australia/Darwin': 'AU',
      'Australia/Hobart': 'AU',
      'America/New_York': 'US',
      'America/Chicago': 'US',
      'America/Denver': 'US',
      'America/Los_Angeles': 'US',
      'America/Toronto': 'CA',
      'America/Vancouver': 'CA',
      'Europe/London': 'GB',
      'Europe/Dublin': 'GB',
      'Pacific/Auckland': 'NZ',
      'Europe/Berlin': 'DE',
      'Europe/Paris': 'FR',
    }
    
    return timezoneToCountry[timezone] || 'AU' // Default to Australia
  } catch {
    return 'AU' // Default fallback
  }
}

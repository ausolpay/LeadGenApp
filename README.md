# Cairns Prospect Finder

A modern web application for finding and managing business prospects in Cairns and surrounds using Google Places API.

## Features

- **Business Search**: Search for businesses by type and keywords in Cairns area
- **Smart Filtering**: Filter by suburbs, postcodes, phone types, and selling points
- **Contact Management**: Mark businesses as called or emailed with automatic tracking
- **Selling Points**: Automatic detection of business opportunities (no website, Facebook-only, etc.)
- **Notes System**: Add and edit notes for each business with auto-save
- **Persistent Storage**: All data persists across browser sessions
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **UI**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand with persistence
- **Tables**: TanStack Table for data display
- **Maps API**: Google Places API (server-side)
- **Phone Formatting**: libphonenumber-js
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ 
- Google Maps API key with Places API enabled

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cairns-prospect-finder
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env.local file
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Google Maps API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Places API
4. Create credentials (API Key)
5. Restrict the API key:
   - Restrict to Places API only
   - Set referrer restrictions to your domain
   - Or set IP restrictions for server-side usage

## Usage

### Searching for Businesses

1. Enter a search term (e.g., "bakery", "real estate")
2. Optionally select a business type from the dropdown
3. Click "Search" to find businesses in Cairns area

### Filtering Results

Use the filters panel to narrow down results:
- **Location**: Filter by specific suburbs or postcodes
- **Phone Type**: Show only businesses with mobile (04...) or office (07...) numbers
- **Selling Points**: Filter by business opportunities (no website, Facebook-only, etc.)

### Managing Contacts

- Check "Called" or "Emailed" boxes to mark businesses as contacted
- Contacted businesses automatically move to the "Contacted" tab
- Add notes to track your interactions
- All data persists across browser sessions

### Selling Points

The app automatically detects:
- **No Website**: Businesses without a website
- **Facebook-only**: Businesses with only Facebook/Instagram presence
- **Likely Outdated**: Businesses with potential outdated websites

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── places/        # Google Places API endpoints
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── SearchBar.tsx     # Search interface
│   ├── FiltersBar.tsx    # Filter controls
│   ├── ResultsTable.tsx  # Results display
│   └── ContactedTable.tsx # Contacted businesses
├── data/                 # Static data
│   ├── business-types.ts # Business type options
│   └── locations.ts      # Cairns suburbs/postcodes
├── lib/                  # Utility functions
│   └── utils.ts          # Helper functions
├── stores/               # Zustand stores
│   ├── results-store.ts  # Search results state
│   ├── contacted-store.ts # Contacted businesses
│   └── exclude-store.ts  # Excluded businesses
└── types/                # TypeScript types
    └── business.ts       # Business data types
```

## API Endpoints

- `GET /api/places/search` - Search for businesses
- `GET /api/places/details` - Get detailed business information

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables

- `GOOGLE_MAPS_API_KEY`: Your Google Maps API key with Places API enabled

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository.

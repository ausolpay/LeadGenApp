# Setup Instructions

## Prerequisites

Before running this application, you need to install:

1. **Node.js 18+** - Download from [nodejs.org](https://nodejs.org/)
2. **Google Maps API Key** - Set up in Google Cloud Console

## Installation Steps

1. **Install Node.js** (if not already installed):
   - Go to [nodejs.org](https://nodejs.org/)
   - Download and install the LTS version
   - Verify installation: `node --version` and `npm --version`

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Create a `.env.local` file in the root directory:
   ```
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```

5. **Open in Browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Google Maps API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Places API**
4. Create credentials (API Key)
5. **Important**: Restrict the API key:
   - Restrict to **Places API** only
   - Set referrer restrictions to your domain
   - Or set IP restrictions for server-side usage

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Troubleshooting

### Common Issues

1. **"npm not recognized"**: Install Node.js from [nodejs.org](https://nodejs.org/)
2. **API Key errors**: Ensure Places API is enabled and key is properly restricted
3. **Build errors**: Run `npm install` to ensure all dependencies are installed

### Getting Help

If you encounter issues:
1. Check the console for error messages
2. Ensure all environment variables are set correctly
3. Verify Google Maps API key restrictions
4. Check that all dependencies are installed

## Next Steps

Once the application is running:

1. **Test the Search**: Try searching for "bakery" or "real estate"
2. **Test Filters**: Use the filter panel to narrow results
3. **Test Contact Management**: Mark businesses as called/emailed
4. **Add Notes**: Click on notes cells to add business notes

The application is now ready for use! 🎉

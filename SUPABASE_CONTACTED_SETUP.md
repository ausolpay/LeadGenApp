# Supabase Contacted Businesses Setup

This guide explains how the existing Supabase table works for storing contacted businesses across devices.

## 1. Existing Table Structure

✅ **Table already exists!** Your `contacted_businesses` table has the following structure:

- `id` (uuid) - Primary key
- `user_id` (uuid) - Foreign key to auth.users
- `place_id` (text) - Google Places ID
- `name` (text) - Business name
- `notes` (text) - User notes (nullable)
- `called` (boolean) - Whether business was called
- `emailed` (boolean) - Whether business was emailed
- `contacted_at` (timestamp with time zone) - When contacted
- `raw` (jsonb) - Full business data object

## 1.1 Required Policies (if not already set)

Ensure Row Level Security is enabled with these policies:

```sql
-- Enable RLS if not already enabled
ALTER TABLE contacted_businesses ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
CREATE POLICY "Users can view their own contacted businesses" 
  ON contacted_businesses FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contacted businesses" 
  ON contacted_businesses FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacted businesses" 
  ON contacted_businesses FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacted businesses" 
  ON contacted_businesses FOR DELETE 
  USING (auth.uid() = user_id);
```

## 2. Features

### ✅ Cross-Device Sync
- Contacted businesses are now stored in Supabase
- Users can access their contacted list from any device
- All data persists across sessions

### ✅ Real-time Updates
- Changes are instantly saved to the database
- Notes are debounced for 500ms to avoid excessive API calls
- Error handling with console logging

### ✅ User Isolation
- Row-Level Security ensures users only see their own data
- Each user has their own contacted businesses
- No data leakage between users

### ✅ Automatic Data Migration
- The app will automatically load existing data when users log in
- No manual migration needed for existing users

## 3. Data Structure

### Table Columns:
- `id`: Primary key (UUID)
- `user_id`: Foreign key to auth.users table
- `place_id`: Google Places ID (TEXT)
- `name`: Business name (TEXT)
- `notes`: User notes (TEXT, nullable)
- `called`: Whether contacted via phone (BOOLEAN)
- `emailed`: Whether contacted via email (BOOLEAN)
- `contacted_at`: When business was contacted (TIMESTAMP)
- `raw`: Full business object (JSONB)

### Example Data:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "user_id": "user123",
  "place_id": "ChIJ...",
  "name": "Local Business",
  "notes": "Great potential client",
  "called": true,
  "emailed": false,
  "contacted_at": "2025-01-15T10:30:00Z",
  "raw": {
    "name": "Local Business",
    "category": "Restaurant",
    "address": "123 Main St",
    "phone": "07 1234 5678",
    "website": "https://example.com",
    "placeId": "ChIJ...",
    "sellingPoints": ["verified-mobile", "has-website"]
  }
}
```

## 4. Security

### Row-Level Security (RLS)
All policies ensure that:
- Users can only SELECT their own contacted businesses
- Users can only INSERT businesses with their own user_id
- Users can only UPDATE their own businesses
- Users can only DELETE their own businesses

### API Access
The app uses the authenticated Supabase client, so all operations are automatically associated with the logged-in user.

## 5. Performance

### Recommended Indexes (if not already created)
```sql
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS contacted_businesses_user_id_idx ON contacted_businesses(user_id);
CREATE INDEX IF NOT EXISTS contacted_businesses_place_id_idx ON contacted_businesses(place_id);
CREATE INDEX IF NOT EXISTS contacted_businesses_contacted_at_idx ON contacted_businesses(contacted_at);
```

### Optimizations
- UPSERT operations for efficient create/update
- Debounced note updates (500ms)
- Local state updates for immediate UI feedback
- JSONB storage for flexible business data

## 6. Testing

After running the migration, test the functionality:

1. **Sign up/Login** - Contacted list should load
2. **Mark businesses as contacted** - Should save to database
3. **Add notes** - Should save after 500ms or on blur
4. **Uncontact businesses** - Should remove from database
5. **Cross-device test** - Login on different device/browser

## 7. Troubleshooting

### Common Issues:

**Error: relation "contacted_businesses" does not exist**
- Run the SQL migration in Supabase Dashboard

**Error: permission denied for table contacted_businesses**
- Ensure RLS policies are created correctly
- Check that user is authenticated

**Notes not saving**
- Check browser console for errors
- Verify Supabase connection in Network tab

**Data not syncing across devices**
- Clear browser cache/localStorage
- Check that user_id is correctly set in the store

## 8. Migration Notes

The updated system works with your existing table:
- ✅ Uses your existing `contacted_businesses` table structure
- ✅ Automatically maps data between table format and app format
- ✅ Old localStorage data is ignored (but preserved locally)
- ✅ New contacted businesses are stored in Supabase
- ✅ Existing data in Supabase will load automatically

### Data Mapping:
- `called` & `emailed` columns → `contact.called` & `contact.emailed`
- `contacted_at` → `contact.contactedAt`
- `raw` JSONB → full business object
- `notes` → `business.notes`

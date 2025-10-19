# Record Pet

Next.js application with Supabase authentication and family management.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Then edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Set up Supabase database

Run the SQL commands in the following order in your Supabase SQL Editor:

1. `supabase/schema.sql` - Creates families and family_members tables
2. `supabase/migration_fix_rls_recursion.sql` - **IMPORTANT: Fixes RLS infinite recursion issue**
3. `supabase/migration_pets.sql` - Creates pets table
4. `supabase/storage_setup.sql` - Sets up Storage bucket for pet avatars
5. `supabase/migration_pet_activities.sql` - Creates pet_walks, pet_meals, pet_traits, and pet_meta tables
6. `supabase/migration_share_tokens.sql` - Creates share_tokens table for public sharing
7. `supabase/migration_fix_share_tokens_rls.sql` - Fixes share token RLS policies (admin-only revocation)

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Features

- **Authentication**: Email/password authentication with Supabase Auth
- **Protected Routes**: `/app` route protected by middleware
- **Family Management**:
  - Create a new family with role selection (father/mother/son/daughter/other)
  - Join existing family by ID
  - View family members with roles
  - Admin-only member management (add/remove members, change admin status)
  - Leave family
- **Pet Management**:
  - Create, view, edit, and delete pets
  - Upload pet avatar images with Supabase Storage
  - Track pet details (species, breed, birth date, gender, notes)
  - Tab-based pet detail interface
  - Family members can view and edit pets
  - Only admins can delete pets
- **Pet Activity Tracking**:
  - **Walks**: Record walk date/time, duration, distance, and notes with date range filtering
  - **Meals**: Track feeding times, food type, amount, and notes with date range filtering
  - **Traits**: Store pet characteristics and personality traits (e.g., favorite toys, fears)
  - **Meta**: Custom key-value fields for any additional pet information (e.g., microchip ID, vet contact)
- **PDF Export**:
  - Generate comprehensive PDF reports of pet records
  - A4 portrait layout with professional styling
  - Optional date range filtering for walks and meals
  - One-click download from pet detail page
- **Public Sharing**:
  - Generate secure share tokens with expiration dates
  - QR code generation for easy sharing
  - Read-only public view at `/share/[token]`
  - Token revocation and management
  - No authentication required for shared views
  - Automatic expiration handling (404 for expired links)
- **Row Level Security**: Database policies ensure users can only access their own family data

## Production Deployment

For detailed production deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Quick Deploy to Vercel

1. Set environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

2. Deploy:
   ```bash
   vercel
   ```

Or connect your repository to Vercel for automatic deployments.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── pets/
│   │       └── [id]/
│   │           ├── pdf/route.ts   # PDF generation API
│   │           └── share/route.ts # Share token management API
│   ├── app/
│   │   ├── page.tsx           # Family dashboard
│   │   └── pets/
│   │       ├── page.tsx       # Pets list
│   │       ├── new/page.tsx   # Create pet
│   │       └── [id]/
│   │           ├── page.tsx       # Pet detail
│   │           └── edit/page.tsx  # Edit pet
│   ├── share/
│   │   └── [token]/page.tsx  # Public read-only pet view
│   ├── callback/     # Auth callback handler
│   ├── login/        # Login page
│   └── layout.tsx
├── components/
│   ├── FamilySetup.tsx       # Create/join family flow with role selection
│   ├── FamilyDashboard.tsx   # Family overview with admin controls
│   ├── PetForm.tsx           # Pet create/edit form with image upload
│   ├── PetDetailTabs.tsx     # Pet detail page with tabs
│   ├── PetWalks.tsx          # Walk records with date filtering
│   ├── PetMeals.tsx          # Meal records with date filtering
│   ├── PetTraits.tsx         # Pet traits management
│   ├── PetMeta.tsx           # Custom fields management
│   ├── DownloadPdfButton.tsx # PDF download with date range picker
│   ├── SharePetButton.tsx    # Share token generation with QR code
│   ├── SharedPetView.tsx     # Public read-only pet view component
│   └── DeletePetButton.tsx   # Admin-only pet deletion
└── lib/
    ├── permissions.ts    # Admin permission utilities
    ├── pdf/
    │   └── PetRecordDocument.tsx  # PDF document template
    └── supabase/
        ├── client.ts      # Browser client
        ├── server.ts      # Server client
        └── middleware.ts  # Auth middleware
```

## Database Schema

### families
- `id`: UUID (primary key)
- `name`: Text
- `created_at`: Timestamp
- `updated_at`: Timestamp

### family_members
- `id`: UUID (primary key)
- `family_id`: UUID (foreign key to families)
- `user_id`: UUID (foreign key to auth.users)
- `role`: Text ('father', 'mother', 'son', 'daughter', 'other')
- `is_admin`: Boolean
- `joined_at`: Timestamp

### pets
- `id`: UUID (primary key)
- `family_id`: UUID (foreign key to families)
- `name`: Text
- `species`: Text
- `breed`: Text (nullable)
- `birth_date`: Date (nullable)
- `gender`: Text ('male', 'female', 'unknown')
- `avatar_url`: Text (nullable)
- `notes`: Text (nullable)
- `created_at`: Timestamp
- `updated_at`: Timestamp

### pet_walks
- `id`: UUID (primary key)
- `pet_id`: UUID (foreign key to pets)
- `walked_at`: Timestamp
- `duration_minutes`: Integer (nullable)
- `distance_km`: Numeric (nullable)
- `notes`: Text (nullable)
- `created_at`: Timestamp

### pet_meals
- `id`: UUID (primary key)
- `pet_id`: UUID (foreign key to pets)
- `fed_at`: Timestamp
- `food_type`: Text (nullable)
- `amount`: Text (nullable)
- `notes`: Text (nullable)
- `created_at`: Timestamp

### pet_traits
- `id`: UUID (primary key)
- `pet_id`: UUID (foreign key to pets)
- `trait_name`: Text
- `trait_value`: Text
- `notes`: Text (nullable)
- `created_at`: Timestamp
- `updated_at`: Timestamp

### pet_meta
- `id`: UUID (primary key)
- `pet_id`: UUID (foreign key to pets)
- `meta_key`: Text (unique per pet)
- `meta_value`: Text
- `created_at`: Timestamp
- `updated_at`: Timestamp

### share_tokens
- `id`: UUID (primary key)
- `pet_id`: UUID (foreign key to pets)
- `token`: Text (unique)
- `created_by`: UUID (foreign key to auth.users)
- `expires_at`: Timestamp
- `is_active`: Boolean
- `created_at`: Timestamp

### Storage Buckets
- `pet-avatars`: Public bucket for pet avatar images

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
6. `supabase/migration_pet_health.sql` - Creates pet_health_records table for daily health tracking
7. `supabase/migration_pet_medications.sql` - Creates pet_medications and pet_medication_logs tables
8. `supabase/migration_food_products.sql` - Creates pet_food_products table and updates pet_meals for calorie tracking
9. `supabase/migration_admin_roles.sql` - Creates admin_users table for system administrators
10. `supabase/migration_fix_admin_rls.sql` - **IMPORTANT: Fixes admin RLS circular reference**
11. `supabase/migration_system_admin_separation.sql` - **IMPORTANT: Separates system admins from regular users**
12. `supabase/migration_admin_statistics.sql` - **IMPORTANT: Creates functions for system-wide statistics**
13. `supabase/migration_ad_banners.sql` - Creates ad_banners table and Storage bucket for advertisement banners
14. `supabase/migration_share_tokens.sql` - Creates share_tokens table for public sharing
15. `supabase/migration_fix_share_tokens_rls.sql` - Fixes share token RLS policies (admin-only revocation)
16. `supabase/migration_create_family_function.sql` - Creates function to create family with admin in one transaction
17. `supabase/migration_fix_share_public_access.sql` - Allows public access to shared pet data

### 4. Set up system administrator (Optional - For Record-Pet Operators Only)

**Important**: This is for system administrators who operate Record-Pet, NOT for family administrators.

**System administrators are completely separate from regular users**:
- System admins can ONLY access `/admin` (application management)
- Regular users can ONLY access `/app` (family and pet management)
- A user cannot be both a system admin and a regular user

To create a system administrator account:

#### Step 1: Create user in Supabase Dashboard

**Important**: Do NOT use the `/login` signup page. System admins are created directly in Supabase.

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Click **Add User** button (or **Invite**)
3. Enter:
   - **Email**: Admin's email address
   - **Password**: Secure password (or send invite email)
   - **Auto Confirm User**: Check this box (or confirm via email)
4. Click **Create User** (or **Send Invitation**)
5. Copy the **User ID** (UUID format) from the users list

#### Step 2: Run database migrations

Go to Supabase Dashboard → **SQL Editor** and run:

```sql
-- First, run the RLS fix migration
-- (Copy and paste the contents of supabase/migration_fix_admin_rls.sql)

-- Then, run the system admin separation migration
-- (Copy and paste the contents of supabase/migration_system_admin_separation.sql)

-- Then, run the admin statistics migration (for dashboard stats)
-- (Copy and paste the contents of supabase/migration_admin_statistics.sql)

-- Finally, add your user as a system administrator
INSERT INTO admin_users (user_id, is_system_only)
VALUES ('paste-user-id-here', TRUE);
```

#### Step 3: Log in

1. Go to your application login page
2. Enter the system admin email and password
3. You will be automatically redirected to `/admin` (not `/app`)
4. System admins cannot access `/app` routes (they are redirected back to `/admin`)

**Security Note**: System admin accounts should only be created by database administrators with direct Supabase access. Never use the public signup form for system admins.

**Note**: Family administrators (who manage their family) are set up differently through the family creation process and access `/app/settings`, not `/admin`.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Administrator Types

This application has **two completely separate types of administrators**:

### 1. System Administrators (Record-Pet運営者)
- **Purpose**: Operate and manage the Record-Pet application itself
- **Database**: `admin_users` table
- **Access**: `/admin` panel
- **Permissions**:
  - Create/edit/delete public food products for all users
  - View system-wide statistics
  - System configuration
- **Setup**: Manually added to `admin_users` table by database operators
- **Check function**: `isAdmin(userId)` in `lib/admin.ts`

### 2. Family Administrators (家族内の管理者)
- **Purpose**: Manage their own family group
- **Database**: `family_members.is_admin` column
- **Access**: `/app/settings` page
- **Permissions**:
  - Manage family members (add/remove, change roles)
  - Change family name
  - Delete pets in their family
  - Revoke share tokens for their family's pets
- **Setup**: Automatically set when creating a family, or granted by existing family admin
- **Check function**: `checkIsAdmin(userId, familyId)` in `lib/permissions.ts`

**Important**: These are completely separate roles using different database tables, different routes, and different permission systems. A user can be one, both, or neither.

## Features

- **Authentication**: Email/password authentication with Supabase Auth
- **Protected Routes**: `/app` route protected by middleware
- **Family Management**:
  - Create a new family with role selection (father/mother/son/daughter/other)
  - Join existing family by ID
  - View family members with roles
  - **Family Admin** controls (add/remove members, change admin status) - `/app/settings`
  - Leave family
  - **Note**: Family admins (`family_members.is_admin=true`) are different from system administrators
- **Pet Management**:
  - Create, view, edit, and delete pets
  - Upload pet avatar images with Supabase Storage
  - Track pet details (species, breed, birth date, gender, notes)
  - Tab-based pet detail interface
  - Family members can view and edit pets
  - Only admins can delete pets
- **Pet Activity Tracking**:
  - **Walks**: Record walk date/time, duration, distance, and notes with date range filtering
  - **Meals**: Track feeding times with calorie calculation
    - Select from registered food products with automatic calorie calculation
    - Manual entry mode for custom foods
    - Calorie tracking per meal
  - **Health Records**: Daily health tracking with appetite level (1-5 scale), bathroom times/notes, mood level, and activity level
  - **Medications**: Manage medication schedules with dosage, frequency, start/end dates, and medication logs for tracking when medications were given
  - **Traits**: Store pet characteristics and personality traits (e.g., favorite toys, fears)
  - **Meta**: Custom key-value fields for any additional pet information (e.g., microchip ID, vet contact)
- **Food Products Database**:
  - Public products managed by system administrators
  - All users can select from public products for calorie calculation
  - Manual entry mode available for unlisted foods
  - Search and filter by species, brand, and product type
- **System Admin Panel** (`/admin`) - **Record-Pet Operators Only**:
  - **Completely separate from family administrators**
  - System-wide administration dashboard
  - **Create and manage public food products** available to all users
  - **Create and manage advertisement banners** displayed on user pages
  - View system statistics (users, pets, products)
  - Only users in `admin_users` table can access
  - **Different from family admins**: Family admins manage their family at `/app/settings`, system admins manage the entire application at `/admin`
- **Advertisement Banners**:
  - System administrators can create and manage banners at `/admin/banners`
  - Upload banner images to Supabase Storage
  - Set display position (dashboard, pet detail, or both)
  - Schedule with start/end dates
  - Click tracking for analytics
  - Displayed on dashboard and pet detail pages
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
│   ├── admin/           # Admin panel (system administrators only)
│   │   ├── layout.tsx              # Admin layout with navigation
│   │   ├── page.tsx                # Admin dashboard
│   │   ├── food-products/page.tsx  # Food products management
│   │   └── banners/page.tsx        # Advertisement banners management
│   ├── api/
│   │   └── pets/
│   │       └── [id]/
│   │           ├── pdf/route.ts   # PDF generation API
│   │           └── share/route.ts # Share token management API
│   ├── app/             # User interface (family members)
│   │   ├── page.tsx           # Family dashboard
│   │   ├── settings/page.tsx  # Family settings (admins only)
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
│   ├── admin/                # Admin-specific components
│   │   ├── AdminNav.tsx                   # Admin navigation bar
│   │   ├── AdminFoodProductsManager.tsx   # Admin food products CRUD
│   │   └── AdminBannerManager.tsx         # Admin banners CRUD with image upload
│   ├── AdBanner.tsx          # Advertisement banner display component with click tracking
│   ├── FamilySetup.tsx       # Create/join family flow with role selection
│   ├── FamilyDashboard.tsx   # Family overview with admin controls
│   ├── FamilySettings.tsx    # Family settings (family admin only)
│   ├── PetForm.tsx           # Pet create/edit form with image upload
│   ├── PetDetailTabs.tsx     # Pet detail page with tabs
│   ├── PetWalks.tsx          # Walk records with date filtering
│   ├── PetMeals.tsx          # Meal records with calorie calculation
│   ├── PetHealthRecords.tsx  # Daily health tracking (appetite, mood, activity, bathroom)
│   ├── PetMedications.tsx    # Medication management with logs
│   ├── PetTraits.tsx         # Pet traits management
│   ├── PetMeta.tsx           # Custom fields management
│   ├── DownloadPdfButton.tsx # PDF download with date range picker
│   ├── SharePetButton.tsx    # Share token generation with QR code
│   ├── SharedPetView.tsx     # Public read-only pet view component
│   └── DeletePetButton.tsx   # Admin-only pet deletion
└── lib/
    ├── admin.ts          # System admin utilities
    ├── permissions.ts    # Family admin permission utilities
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

### pet_health_records
- `id`: UUID (primary key)
- `pet_id`: UUID (foreign key to pets)
- `recorded_at`: Timestamp
- `appetite_level`: Integer (1-5 scale, nullable)
- `bathroom_times`: Integer (nullable)
- `bathroom_notes`: Text (nullable)
- `mood_level`: Integer (1-5 scale, nullable)
- `activity_level`: Integer (1-5 scale, nullable)
- `health_notes`: Text (nullable)
- `created_at`: Timestamp
- `updated_at`: Timestamp

### pet_medications
- `id`: UUID (primary key)
- `pet_id`: UUID (foreign key to pets)
- `medication_name`: Text
- `dosage`: Text (nullable)
- `frequency`: Text (nullable)
- `start_date`: Date
- `end_date`: Date (nullable)
- `notes`: Text (nullable)
- `is_active`: Boolean
- `created_at`: Timestamp
- `updated_at`: Timestamp

### pet_medication_logs
- `id`: UUID (primary key)
- `medication_id`: UUID (foreign key to pet_medications)
- `given_at`: Timestamp
- `given_by`: UUID (foreign key to auth.users, nullable)
- `notes`: Text (nullable)
- `created_at`: Timestamp

### pet_food_products
- `id`: UUID (primary key)
- `name`: Text
- `brand`: Text (nullable)
- `calories_per_100g`: Numeric (kcal per 100g)
- `product_type`: Text (nullable, e.g., dry food, wet food, treats)
- `species`: Text (nullable, e.g., dog, cat)
- `notes`: Text (nullable)
- `is_public`: Boolean (true for public products managed by system admins, false for private products)
- `created_by`: UUID (foreign key to auth.users, nullable - null for system admin created products)
- `created_at`: Timestamp
- `updated_at`: Timestamp
- **Note**: Only system administrators can create/edit/delete products. All users can use public products for calorie calculation.

### admin_users
- `id`: UUID (primary key)
- `user_id`: UUID (foreign key to auth.users, unique)
- `created_at`: Timestamp
- `created_by`: UUID (foreign key to auth.users, nullable)

### share_tokens
- `id`: UUID (primary key)
- `pet_id`: UUID (foreign key to pets)
- `token`: Text (unique)
- `created_by`: UUID (foreign key to auth.users)
- `expires_at`: Timestamp
- `is_active`: Boolean
- `created_at`: Timestamp

### ad_banners
- `id`: UUID (primary key)
- `title`: Text
- `description`: Text (nullable)
- `image_url`: Text (nullable, Supabase Storage URL)
- `link_url`: Text (click destination URL)
- `is_active`: Boolean
- `display_position`: Text ('dashboard', 'pet_detail', 'both')
- `display_order`: Integer (display order)
- `background_color`: Text (gradient class)
- `text_color`: Text (text color class)
- `start_date`: Timestamp (nullable)
- `end_date`: Timestamp (nullable)
- `click_count`: Integer (click tracking)
- `created_by`: UUID (foreign key to auth.users, nullable)
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Storage Buckets
- `pet-avatars`: Public bucket for pet avatar images
- `ad-banners`: Public bucket for advertisement banner images

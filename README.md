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

Run the SQL commands in `supabase/schema.sql` in your Supabase SQL Editor to create the necessary tables and Row Level Security policies.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Features

- **Authentication**: Email/password authentication with Supabase Auth
- **Protected Routes**: `/app` route protected by middleware
- **Family Management**:
  - Create a new family
  - Join existing family by ID
  - View family members
  - Leave family
- **Row Level Security**: Database policies ensure users can only access their own family data

## Deployment on Vercel

### Environment Variables

Add these environment variables in your Vercel project settings:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### Deploy

```bash
vercel
```

Or connect your repository to Vercel for automatic deployments.

## Project Structure

```
src/
├── app/
│   ├── app/          # Protected app route
│   ├── callback/     # Auth callback handler
│   ├── login/        # Login page
│   └── layout.tsx
├── components/
│   ├── FamilySetup.tsx       # Create/join family flow
│   └── FamilyDashboard.tsx   # Family overview
└── lib/
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
- `role`: Text ('admin' or 'member')
- `joined_at`: Timestamp

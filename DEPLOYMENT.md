# Production Deployment Guide

This guide walks you through deploying the Record Pet application to production using Vercel and Supabase.

## Prerequisites

- A Supabase account and project
- A Vercel account
- Git repository for your project

## Step 1: Set Up Supabase Project

### 1.1 Create a Supabase Project

1. Go to https://supabase.com
2. Click "New Project"
3. Fill in project details:
   - Name: `record-pet-production`
   - Database Password: (generate a strong password and save it securely)
   - Region: (choose closest to your users)
4. Wait for the project to be created

### 1.2 Get Your Supabase Credentials

Once your project is ready:

1. Go to Project Settings → API
2. Copy the following values:
   - **Project URL**: `https://your-project.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 1.3 Run Database Migrations

Go to SQL Editor in your Supabase dashboard and run the following SQL files **in order**:

1. **Create base schema** - Copy and paste contents of `supabase/schema.sql`
   - Creates `families` and `family_members` tables
   - Sets up initial RLS policies for family management

2. **Fix RLS recursion** - Copy and paste contents of `supabase/migration_fix_rls_recursion.sql`
   - **IMPORTANT: This fixes infinite recursion in RLS policies**
   - Creates helper function to avoid circular references
   - Updates family and family_members policies

3. **Create pets table** - Copy and paste contents of `supabase/migration_pets.sql`
   - Creates `pets` table
   - Sets up RLS policies for pet access

4. **Set up storage** - Copy and paste contents of `supabase/storage_setup.sql`
   - Creates `pet-avatars` public bucket
   - Sets up storage policies

5. **Create activity tables** - Copy and paste contents of `supabase/migration_pet_activities.sql`
   - Creates `pet_walks`, `pet_meals`, `pet_traits`, `pet_meta` tables
   - Sets up RLS policies for activity tracking

6. **Create share tokens** - Copy and paste contents of `supabase/migration_share_tokens.sql`
   - Creates `share_tokens` table
   - Sets up RLS policies for public sharing

7. **Fix share token permissions** - Copy and paste contents of `supabase/migration_fix_share_tokens_rls.sql`
   - Updates RLS policies to restrict token revocation to admins only

8. **Create family function** - Copy and paste contents of `supabase/migration_create_family_function.sql`
   - Creates PostgreSQL function to create family with admin in one transaction
   - Fixes RLS policy issues during family creation

9. **Fix share public access** - Copy and paste contents of `supabase/migration_fix_share_public_access.sql`
   - Allows public (anonymous) access to shared pet data
   - Required for public share links to work without authentication

### 1.4 Verify Database Setup

After running all migrations, verify in the Table Editor:

- [ ] `families` table exists
- [ ] `family_members` table exists
- [ ] `pets` table exists
- [ ] `pet_walks` table exists
- [ ] `pet_meals` table exists
- [ ] `pet_traits` table exists
- [ ] `pet_meta` table exists
- [ ] `share_tokens` table exists

In Storage, verify:

- [ ] `pet-avatars` bucket exists and is public

## Step 2: Deploy to Vercel

### 2.1 Connect Repository to Vercel

1. Go to https://vercel.com
2. Click "New Project"
3. Import your Git repository
4. Select the repository containing your Record Pet application

### 2.2 Configure Environment Variables

In the Vercel project configuration, add the following environment variables:

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Your Supabase anon/public key |

**Important**:
- Make sure to use the exact variable names (case-sensitive)
- The `NEXT_PUBLIC_` prefix is required for client-side access
- Never commit these values to your git repository

### 2.3 Deploy

1. Click "Deploy"
2. Wait for the build to complete
3. Vercel will provide you with a production URL (e.g., `https://your-app.vercel.app`)

## Step 3: Post-Deployment Verification

### 3.1 Test Authentication

1. Go to your production URL
2. Click "Sign Up"
3. Register a new account with your email
4. Check your email for the confirmation link
5. Click the confirmation link
6. Verify you can log in

### 3.2 Test Family Creation

1. After logging in, create a new family
2. Select a role (e.g., "Father")
3. Verify you see the family dashboard

### 3.3 Test Pet Management

1. Click "Pets" in the navigation
2. Create a new pet with:
   - Name
   - Species
   - Optional: Upload an avatar image
3. Verify the pet appears in the list
4. Click on the pet to view details
5. Test editing the pet information

### 3.4 Test Activity Tracking

1. Open a pet's detail page
2. Test each tab:
   - **Walks**: Add a walk record
   - **Meals**: Add a meal record
   - **Traits**: Add a trait (e.g., "Favorite Toy", "Tennis Ball")
   - **Meta**: Add custom metadata (e.g., "Microchip ID", "123456789")

### 3.5 Test PDF Export

1. On a pet's detail page
2. Click "Download PDF"
3. Optionally select a date range
4. Click "Generate PDF"
5. Verify the PDF downloads correctly

### 3.6 Test Share Functionality

1. On a pet's detail page
2. Click "Share"
3. Generate a share link
4. Copy the link or scan the QR code
5. Open the link in an incognito/private window (logged out)
6. Verify the pet information is visible read-only

### 3.7 Test Admin Functions

1. Go to family dashboard
2. As an admin, click "Settings"
3. Verify you can:
   - Update family name
   - Change member roles
   - Toggle admin status for other members
   - Remove members

## Step 4: Production Considerations

### 4.1 Email Configuration

By default, Supabase uses their SMTP server with rate limits. For production:

1. Go to Authentication → Settings in Supabase
2. Configure a custom SMTP server (recommended providers: SendGrid, AWS SES, Mailgun)
3. Update email templates to match your branding

### 4.2 Storage Limits

The free tier includes:
- 1GB storage
- 2GB bandwidth per month

For production with many users:
1. Monitor storage usage in Supabase dashboard
2. Consider upgrading to Pro plan if needed
3. Implement image compression/resizing before upload

### 4.3 Database Backups

Supabase provides automatic daily backups on paid plans. For free tier:

1. Manually export your database periodically
2. Go to Database → Backups
3. Download backups for safekeeping

### 4.4 Security Best Practices

- [ ] Enable ReCAPTCHA for sign-up (Supabase → Authentication → Settings)
- [ ] Set up rate limiting (Supabase → Authentication → Rate Limits)
- [ ] Review RLS policies regularly
- [ ] Monitor authentication logs for suspicious activity
- [ ] Keep dependencies updated (`npm audit` and `npm update`)

### 4.5 Monitoring

Set up monitoring in Vercel:

1. Go to your project → Analytics
2. Enable Web Analytics
3. Monitor:
   - Page views
   - Error rates
   - Performance metrics

In Supabase:

1. Go to Reports
2. Monitor:
   - API requests
   - Database performance
   - Storage usage

## Step 5: Domain Configuration (Optional)

### 5.1 Add Custom Domain to Vercel

1. Go to your Vercel project → Settings → Domains
2. Add your custom domain (e.g., `pets.yourdomain.com`)
3. Follow DNS configuration instructions
4. Wait for DNS propagation (up to 48 hours)

### 5.2 Update Supabase Redirect URLs

1. Go to Supabase → Authentication → URL Configuration
2. Add your custom domain to:
   - Site URL
   - Redirect URLs

## Troubleshooting

### Issue: Authentication emails not received

**Solution:**
1. Check spam folder
2. Verify email in Supabase → Authentication → Settings
3. Check rate limits haven't been exceeded
4. Configure custom SMTP if using production

### Issue: Images not uploading

**Solution:**
1. Verify `pet-avatars` bucket exists in Supabase Storage
2. Check bucket is set to public
3. Verify storage policies are correctly configured
4. Check browser console for CORS errors

### Issue: RLS policy errors

**Solution:**
1. Verify all migrations were run in correct order
2. Check user is authenticated
3. Verify user is member of a family
4. Review RLS policies in Table Editor

### Issue: Share links return 404

**Solution:**
1. Verify `share_tokens` table exists
2. Check token is active and not expired
3. Verify middleware allows `/share` routes
4. Check RLS policies on `share_tokens` table

## Rollback Procedure

If you need to rollback a deployment:

1. In Vercel, go to Deployments
2. Find the previous working deployment
3. Click the three dots → Promote to Production
4. If database changes were made, restore from backup

## Support

For issues:
- Vercel Documentation: https://vercel.com/docs
- Supabase Documentation: https://supabase.com/docs
- Next.js Documentation: https://nextjs.org/docs

## Maintenance

### Regular Tasks

**Weekly:**
- [ ] Review error logs in Vercel
- [ ] Check authentication logs in Supabase
- [ ] Monitor storage usage

**Monthly:**
- [ ] Run `npm audit` and update dependencies
- [ ] Review and test all critical user flows
- [ ] Check database performance metrics
- [ ] Export database backup

**Quarterly:**
- [ ] Review and update RLS policies
- [ ] Audit user permissions
- [ ] Performance optimization review

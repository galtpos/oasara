# Create Admin User - DO THIS NOW (60 seconds)

## Step 1: Create User (30 seconds)

1. Open: **https://supabase.com/dashboard/project/whklrclzrtijneqdjmiy/auth/users**

2. Click **"Add user"** → **"Create new user"**

3. Fill in:
   - Email: `eileen@daylightfreedom.org`
   - Password: `admin123`
   - **Auto Confirm User**: Toggle to **ON** ← IMPORTANT!

4. Click **"Create user"**

5. **COPY THE USER ID** (UUID) that appears in the users list

## Step 2: Make Admin (30 seconds)

1. Open: **https://supabase.com/dashboard/project/whklrclzrtijneqdjmiy/sql/new**

2. Paste this SQL (replace UUID with the one you copied):

```sql
UPDATE user_profiles
SET user_type = 'admin'
WHERE id = 'PASTE_UUID_HERE';

-- Verify it worked:
SELECT id, email, user_type FROM user_profiles WHERE email = 'eileen@daylightfreedom.org';
```

3. Click **"Run"**

4. You should see the user with `user_type = 'admin'`

## Step 3: Login

1. Go to: **http://localhost:3000/admin/login**

2. Email: `eileen@daylightfreedom.org`

3. Password: `admin123`

4. Click "Sign In"

## Done!

You should now be in the admin panel at `/admin` dashboard.

---

## Alternative: If You Don't See the UUID

If you can't find the UUID after creating the user, use this SQL instead:

```sql
-- Get user ID by email
SELECT id FROM auth.users WHERE email = 'eileen@daylightfreedom.org';

-- Then use that ID in the UPDATE
UPDATE user_profiles
SET user_type = 'admin'
WHERE email = 'eileen@daylightfreedom.org';
```

---

## Still Not Working?

If `user_profiles` doesn't have the user, create it manually:

```sql
INSERT INTO user_profiles (id, email, name, user_type)
SELECT id, email, 'Eileen', 'admin'
FROM auth.users
WHERE email = 'eileen@daylightfreedom.org'
ON CONFLICT (id) DO UPDATE SET user_type = 'admin';
```

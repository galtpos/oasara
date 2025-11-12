-- CREATE ADMIN USER
-- Run this in Supabase SQL Editor to create your first admin user

-- Step 1: Create the user in Supabase Auth (do this via Supabase Dashboard > Authentication > Add User)
-- Email: admin@oasara.com
-- Password: (set a strong password)
-- Confirm Email: Yes

-- Step 2: After creating the user, get their UUID from auth.users table
-- Then run this to set them as admin:

-- Replace 'USER_UUID_HERE' with the actual UUID from auth.users
UPDATE user_profiles
SET user_type = 'admin'
WHERE id = 'USER_UUID_HERE';

-- Verify the admin user was created:
SELECT id, email, user_type, created_at
FROM user_profiles
WHERE user_type = 'admin';

-- ALTERNATIVE: If you know the email, you can update by email:
UPDATE user_profiles
SET user_type = 'admin'
WHERE email = 'admin@oasara.com';

-- ALTERNATIVE 2: Create user directly if user_profiles doesn't auto-create
-- (Only needed if you don't have a trigger creating user_profiles on auth.users INSERT)
INSERT INTO user_profiles (id, email, name, user_type)
VALUES (
  'USER_UUID_HERE',
  'admin@oasara.com',
  'Admin User',
  'admin'
)
ON CONFLICT (id) DO UPDATE
SET user_type = 'admin';

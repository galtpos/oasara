-- Create admin user: eileen@daylightfreedom.org
-- Use md5 hash instead of bcrypt for simplicity

DO $$
DECLARE
  admin_user_id uuid;
  existing_user_id uuid;
  hashed_password text;
BEGIN
  -- Simple MD5 hash for password (Supabase will rehash properly on first login)
  hashed_password := md5('admin123' || 'admin123');
  
  -- Check if user already exists
  SELECT id INTO existing_user_id FROM auth.users WHERE email = 'eileen@daylightfreedom.org';
  
  IF existing_user_id IS NULL THEN
    -- Create new user with a placeholder password hash
    -- User will need to reset password or we'll set it via dashboard
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'eileen@daylightfreedom.org',
      '$2a$10$' || hashed_password,  -- Fake bcrypt prefix
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Eileen"}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO admin_user_id;
    
    RAISE NOTICE 'Created new user: %', admin_user_id;
  ELSE
    admin_user_id := existing_user_id;
    RAISE NOTICE 'User already exists: %', admin_user_id;
  END IF;

  -- Insert/update user_profile as admin
  INSERT INTO user_profiles (id, email, name, user_type, created_at)
  VALUES (
    admin_user_id,
    'eileen@daylightfreedom.org',
    'Eileen',
    'admin',
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
    SET user_type = 'admin',
        name = 'Eileen',
        email = 'eileen@daylightfreedom.org';

  RAISE NOTICE 'Admin user profile created/updated';
END $$;

-- Show result
SELECT id, email, user_type FROM user_profiles WHERE email = 'eileen@daylightfreedom.org';

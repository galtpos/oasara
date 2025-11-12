-- Set password for admin user using extensions.pgcrypto
-- User ID: 05832b15-f1ec-4df0-b6b7-4d18cc54cf79

UPDATE auth.users
SET encrypted_password = extensions.crypt('admin123', extensions.gen_salt('bf'))
WHERE email = 'eileen@daylightfreedom.org';

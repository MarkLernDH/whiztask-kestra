-- Add role check constraint to profiles
ALTER TABLE profiles
ADD CONSTRAINT profiles_role_check
CHECK (role IN ('admin', 'seller', 'user'));

-- Create policy for admin access
CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    TO authenticated
    USING (auth.uid() IN (
        SELECT id FROM profiles WHERE role = 'admin'
    ) OR auth.uid() = id);

CREATE POLICY "Admins can update all profiles"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() IN (
        SELECT id FROM profiles WHERE role = 'admin'
    ) OR auth.uid() = id);

-- Add comment
COMMENT ON COLUMN profiles.role IS 'User role: admin, seller, or user';

-- Migration: Add profile fields to users table
-- Run this in Supabase SQL Editor to add profile completion functionality

-- Add new columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS college TEXT,
ADD COLUMN IF NOT EXISTS mobile TEXT,
ADD COLUMN IF NOT EXISTS semester INTEGER,
ADD COLUMN IF NOT EXISTS year_of_study INTEGER,
ADD COLUMN IF NOT EXISTS branch TEXT,
ADD COLUMN IF NOT EXISTS program_type TEXT CHECK (program_type IN ('B.Tech', 'M.Tech')),
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false;

-- Create index for profile_completed for faster queries
CREATE INDEX IF NOT EXISTS idx_users_profile_completed ON users(profile_completed);

-- Update existing users to have profile_completed = false (if not already set)
UPDATE users SET profile_completed = false WHERE profile_completed IS NULL;

-- Optional: Set admin users as profile_completed = true to skip profile creation
-- Uncomment the line below if you want admins to skip profile creation
-- UPDATE users SET profile_completed = true WHERE role = 'admin';

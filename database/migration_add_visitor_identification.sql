-- Migration: Add document_type and id_number to daily_visits table
-- Date: 2024
-- Description: Add visitor identification fields to daily visits

-- Check if columns exist before adding them
DO $$
BEGIN
    -- Add document_type column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'daily_visits' AND column_name = 'document_type'
    ) THEN
        ALTER TABLE daily_visits ADD COLUMN document_type VARCHAR(50);
        RAISE NOTICE 'Column document_type added to daily_visits';
    ELSE
        RAISE NOTICE 'Column document_type already exists in daily_visits';
    END IF;

    -- Add id_number column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'daily_visits' AND column_name = 'id_number'
    ) THEN
        ALTER TABLE daily_visits ADD COLUMN id_number VARCHAR(50);
        RAISE NOTICE 'Column id_number added to daily_visits';
    ELSE
        RAISE NOTICE 'Column id_number already exists in daily_visits';
    END IF;
END $$;

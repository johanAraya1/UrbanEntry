-- Fix encoding issues in authorized_persons table
-- This script corrects UTF-8 encoding problems

-- Update existing records with correct Spanish characters
UPDATE authorized_persons 
SET full_name = 'Empleada Doméstica - Rosa Méndez'
WHERE id = 1;

UPDATE authorized_persons 
SET full_name = 'Jardinero - Luis Hernández'
WHERE id = 2;

UPDATE authorized_persons 
SET full_name = 'Niñera - Carmen Jiménez'
WHERE id = 3;

UPDATE authorized_persons 
SET full_name = 'Técnico HVAC - Manuel Quesada'
WHERE id = 4;

UPDATE authorized_persons 
SET full_name = 'Constructor - Roberto Sánchez'
WHERE id = 5;

-- Verify the changes
SELECT id, full_name, id_card, license_plate 
FROM authorized_persons 
WHERE is_active = true 
ORDER BY id;

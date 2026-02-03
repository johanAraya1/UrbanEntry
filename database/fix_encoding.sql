-- Fix encoding issues for Spanish characters
-- This script corrects names that were saved with incorrect encoding

-- Update users with encoding issues
UPDATE users SET first_name = 'María' WHERE first_name LIKE '%Mar%a%';
UPDATE users SET last_name = 'Pérez' WHERE last_name LIKE '%P%rez%';
UPDATE users SET last_name = 'García' WHERE last_name LIKE '%Garc%a%';
UPDATE users SET last_name = 'López' WHERE last_name LIKE '%L%pez%';
UPDATE users SET last_name = 'Martínez' WHERE last_name LIKE '%Mart%nez%';
UPDATE users SET last_name = 'Rodríguez' WHERE last_name LIKE '%Rodr%guez%';
UPDATE users SET last_name = 'Hernández' WHERE last_name LIKE '%Hern%ndez%';
UPDATE users SET last_name = 'Gómez' WHERE last_name LIKE '%G%mez%';
UPDATE users SET first_name = 'José' WHERE first_name LIKE '%Jos%';
UPDATE users SET first_name = 'Andrés' WHERE first_name LIKE '%Andr%s%';

-- Verify the changes
SELECT id, first_name, last_name, email FROM users ORDER BY id;

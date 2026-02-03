-- Agregar columna must_change_password a la tabla users
-- Esta columna indica si el usuario debe cambiar su contraseña en el próximo login

ALTER TABLE users 
ADD COLUMN must_change_password BOOLEAN NOT NULL DEFAULT FALSE;

-- Actualizar usuarios existentes con contraseñas temporales conocidas
-- (Opcional: ajustar según tus necesidades)
UPDATE users 
SET must_change_password = FALSE 
WHERE must_change_password IS NULL;

-- Crear índice para optimizar búsquedas
CREATE INDEX idx_users_must_change_password ON users(must_change_password);

COMMENT ON COLUMN users.must_change_password IS 'Indica si el usuario debe cambiar su contraseña en el próximo login (true para contraseñas temporales)';

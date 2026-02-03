-- ============================================
-- URBANENTRY - DATOS DE PRUEBA (SEED)
-- ============================================

-- IMPORTANTE: Las passwords están hasheadas con BCrypt (strength 12)
-- Password para todos: "Admin123!"

-- ============================================
-- SUPER ADMIN
-- ============================================
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
VALUES ('admin@urbanentry.local', 
        '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYKxW5e8K3.',
        'Super', 'Admin', 'ROLE_SUPER', TRUE);

-- ============================================
-- OFICIAL DE SEGURIDAD
-- ============================================
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
VALUES ('oficial@urbanentry.local',
        '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYKxW5e8K3.',
        'Carlos', 'Ramírez', 'ROLE_OFFICER', TRUE);

-- ============================================
-- CASAS DE EJEMPLO
-- ============================================
INSERT INTO houses (house_number, section, address) VALUES
('101', 'A', 'Avenida Principal, Sección A'),
('102', 'A', 'Avenida Principal, Sección A'),
('103', 'A', 'Avenida Principal, Sección A'),
('201', 'B', 'Calle Secundaria, Sección B'),
('202', 'B', 'Calle Secundaria, Sección B'),
('301', 'C', 'Boulevard Este, Sección C');

-- ============================================
-- RESIDENTES ADMINS
-- ============================================
INSERT INTO users (email, password_hash, first_name, last_name, role, house_id, is_active)
VALUES 
('juan.perez@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYKxW5e8K3.',
 'Juan', 'Pérez', 'ROLE_ADMIN', (SELECT id FROM houses WHERE house_number = '101'), TRUE),

('maria.garcia@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYKxW5e8K3.',
 'María', 'García', 'ROLE_ADMIN', (SELECT id FROM houses WHERE house_number = '201'), TRUE),

('pedro.lopez@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYKxW5e8K3.',
 'Pedro', 'López', 'ROLE_ADMIN', (SELECT id FROM houses WHERE house_number = '301'), TRUE);

-- Asignar admins a casas
UPDATE houses SET admin_id = (SELECT id FROM users WHERE email = 'juan.perez@email.com') WHERE house_number = '101';
UPDATE houses SET admin_id = (SELECT id FROM users WHERE email = 'maria.garcia@email.com') WHERE house_number = '201';
UPDATE houses SET admin_id = (SELECT id FROM users WHERE email = 'pedro.lopez@email.com') WHERE house_number = '301';

-- ============================================
-- RESIDENTES MIEMBROS (FAMILIA)
-- ============================================
INSERT INTO users (email, password_hash, first_name, last_name, role, house_id, is_active)
VALUES 
('ana.perez@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYKxW5e8K3.',
 'Ana', 'Pérez', 'ROLE_MEMBER', (SELECT id FROM houses WHERE house_number = '101'), TRUE),

('carlos.garcia@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYKxW5e8K3.',
 'Carlos', 'García', 'ROLE_MEMBER', (SELECT id FROM houses WHERE house_number = '201'), TRUE);

-- ============================================
-- PERSONAS AUTORIZADAS PERMANENTES
-- ============================================
INSERT INTO authorized_persons (full_name, id_card, license_plate, house_id, created_by, is_active)
VALUES 
('Empleada Doméstica - Rosa Méndez', '1-0234-0567', NULL, 
 (SELECT id FROM houses WHERE house_number = '101'),
 (SELECT id FROM users WHERE email = 'juan.perez@email.com'),
 TRUE),

('Jardinero - Luis Hernández', '1-0456-0789', 'JRD-123',
 (SELECT id FROM houses WHERE house_number = '101'),
 (SELECT id FROM users WHERE email = 'juan.perez@email.com'),
 TRUE),

('Niñera - Carmen Jiménez', '1-0789-0123', NULL,
 (SELECT id FROM houses WHERE house_number = '201'),
 (SELECT id FROM users WHERE email = 'maria.garcia@email.com'),
 TRUE),

('Técnico HVAC - Manuel Quesada', '1-0345-0678', 'TEC-456',
 (SELECT id FROM houses WHERE house_number = '301'),
 (SELECT id FROM users WHERE email = 'pedro.lopez@email.com'),
 TRUE);

-- Autorizado con vigencia temporal (expira en 30 días)
INSERT INTO authorized_persons (full_name, license_plate, house_id, valid_until, created_by, is_active)
VALUES 
('Constructor - Roberto Sánchez', 'CON-789',
 (SELECT id FROM houses WHERE house_number = '101'),
 CURRENT_DATE + INTERVAL '30 days',
 (SELECT id FROM users WHERE email = 'juan.perez@email.com'),
 TRUE);

-- ============================================
-- VISITAS DIARIAS (HOY)
-- ============================================
INSERT INTO daily_visits (visitor_name, license_plate, visit_date, expected_time_from, expected_time_to, 
                          status, house_id, created_by, notes)
VALUES 
('Dr. Raúl Morales', 'DOC-111', CURRENT_DATE, '10:00', '11:00',
 'PENDING', (SELECT id FROM houses WHERE house_number = '101'),
 (SELECT id FROM users WHERE email = 'juan.perez@email.com'),
 'Visita médica a domicilio'),

('Delivery - Amazon', 'DEL-222', CURRENT_DATE, '14:00', '16:00',
 'PENDING', (SELECT id FROM houses WHERE house_number = '201'),
 (SELECT id FROM users WHERE email = 'maria.garcia@email.com'),
 'Paquete esperado'),

('Amigo - Andrés Rojas', 'FRD-333', CURRENT_DATE, NULL, NULL,
 'PENDING', (SELECT id FROM houses WHERE house_number = '301'),
 (SELECT id FROM users WHERE email = 'pedro.lopez@email.com'),
 'Visita social');

-- Visita de ayer (ya debería estar expirada)
INSERT INTO daily_visits (visitor_name, license_plate, visit_date, status, house_id, created_by)
VALUES 
('Plomero - José Villalobos', 'PLM-444', CURRENT_DATE - INTERVAL '1 day',
 'EXPIRED', (SELECT id FROM houses WHERE house_number = '101'),
 (SELECT id FROM users WHERE email = 'juan.perez@email.com'));

-- ============================================
-- ACCESS LOGS (HISTORIAL)
-- ============================================
-- Simular algunos accesos confirmados en días anteriores
INSERT INTO access_logs (access_type, person_name, license_plate, house_id, confirmed_by, access_time, notes)
VALUES 
('AUTHORIZED', 'Rosa Méndez', NULL,
 (SELECT id FROM houses WHERE house_number = '101'),
 (SELECT id FROM users WHERE email = 'oficial@urbanentry.local'),
 CURRENT_TIMESTAMP - INTERVAL '2 hours',
 'Entrada rutinaria'),

('AUTHORIZED', 'Luis Hernández', 'JRD-123',
 (SELECT id FROM houses WHERE house_number = '101'),
 (SELECT id FROM users WHERE email = 'oficial@urbanentry.local'),
 CURRENT_TIMESTAMP - INTERVAL '3 hours',
 'Mantenimiento jardín'),

('VISIT', 'Técnico Cable', 'CAB-555',
 (SELECT id FROM houses WHERE house_number = '201'),
 (SELECT id FROM users WHERE email = 'oficial@urbanentry.local'),
 CURRENT_TIMESTAMP - INTERVAL '1 day',
 'Instalación internet');

-- ============================================
-- NOTIFICACIONES DE EJEMPLO
-- ============================================
INSERT INTO notifications (user_id, type, title, message, is_sent, sent_at)
VALUES 
((SELECT id FROM users WHERE email = 'juan.perez@email.com'),
 'ACCESS_CONFIRMED',
 'Ingreso Confirmado',
 'Rosa Méndez ingresó al condominio a las ' || TO_CHAR(CURRENT_TIMESTAMP - INTERVAL '2 hours', 'HH:MI AM'),
 TRUE,
 CURRENT_TIMESTAMP - INTERVAL '2 hours');

-- Notificación pendiente de envío
INSERT INTO notifications (user_id, type, title, message, is_sent)
VALUES 
((SELECT id FROM users WHERE email = 'maria.garcia@email.com'),
 'VISIT_PENDING',
 'Visita Programada Hoy',
 'Tienes una visita programada de Amazon entre las 14:00 y 16:00',
 FALSE);

-- ============================================
-- ESTADÍSTICAS RESUMEN
-- ============================================

SELECT 'Seed completado exitosamente!' AS status;

SELECT 
    'Usuarios' AS tabla,
    COUNT(*) AS total,
    COUNT(*) FILTER (WHERE role = 'ROLE_SUPER') AS super_admin,
    COUNT(*) FILTER (WHERE role = 'ROLE_ADMIN') AS admins,
    COUNT(*) FILTER (WHERE role = 'ROLE_MEMBER') AS members,
    COUNT(*) FILTER (WHERE role = 'ROLE_OFFICER') AS officers
FROM users;

SELECT 
    'Casas' AS tabla,
    COUNT(*) AS total,
    COUNT(DISTINCT section) AS secciones
FROM houses;

SELECT 
    'Autorizados' AS tabla,
    COUNT(*) AS total,
    COUNT(*) FILTER (WHERE valid_until IS NULL) AS permanentes,
    COUNT(*) FILTER (WHERE valid_until IS NOT NULL) AS temporales
FROM authorized_persons;

SELECT 
    'Visitas' AS tabla,
    COUNT(*) AS total,
    COUNT(*) FILTER (WHERE status = 'PENDING') AS pendientes,
    COUNT(*) FILTER (WHERE status = 'CONFIRMED') AS confirmadas,
    COUNT(*) FILTER (WHERE status = 'EXPIRED') AS expiradas
FROM daily_visits;

SELECT 
    'Access Logs' AS tabla,
    COUNT(*) AS total
FROM access_logs;

SELECT 
    'Notificaciones' AS tabla,
    COUNT(*) AS total,
    COUNT(*) FILTER (WHERE is_sent = FALSE) AS pendientes
FROM notifications;

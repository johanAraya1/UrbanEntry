-- ============================================
-- URBANENTRY - SCHEMA COMPLETO POSTGRESQL
-- Version: 1.0
-- ============================================

-- Eliminar tablas si existen (CUIDADO EN PRODUCCIÓN)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS access_logs CASCADE;
DROP TABLE IF EXISTS daily_visits CASCADE;
DROP TABLE IF EXISTS authorized_persons CASCADE;
DROP TABLE IF EXISTS houses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- TABLA: users
-- ============================================
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('ROLE_SUPER', 'ROLE_ADMIN', 'ROLE_MEMBER', 'ROLE_OFFICER')),
    house_id BIGINT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_house ON users(house_id);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- TABLA: houses
-- ============================================
CREATE TABLE houses (
    id BIGSERIAL PRIMARY KEY,
    house_number VARCHAR(20) NOT NULL UNIQUE,
    section VARCHAR(50),
    address VARCHAR(255),
    admin_id BIGINT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_houses_number ON houses(house_number);
CREATE INDEX idx_houses_admin ON houses(admin_id);

-- ============================================
-- TABLA: authorized_persons
-- ============================================
CREATE TABLE authorized_persons (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    id_card VARCHAR(50),
    license_plate VARCHAR(20),
    house_id BIGINT NOT NULL,
    valid_until DATE,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT fk_authorized_house FOREIGN KEY (house_id) REFERENCES houses(id) ON DELETE CASCADE,
    CONSTRAINT fk_authorized_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_authorized_house ON authorized_persons(house_id);
CREATE INDEX idx_authorized_plate ON authorized_persons(license_plate);
CREATE INDEX idx_authorized_name ON authorized_persons(full_name);
CREATE INDEX idx_authorized_active ON authorized_persons(is_active) WHERE is_active = TRUE;

-- ============================================
-- TABLA: daily_visits
-- ============================================
CREATE TABLE daily_visits (
    id BIGSERIAL PRIMARY KEY,
    visitor_name VARCHAR(255) NOT NULL,
    license_plate VARCHAR(20),
    visit_date DATE NOT NULL,
    expected_time_from TIME,
    expected_time_to TIME,
    status VARCHAR(20) DEFAULT 'PENDING' NOT NULL CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'EXPIRED')),
    house_id BIGINT NOT NULL,
    created_by BIGINT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT fk_visit_house FOREIGN KEY (house_id) REFERENCES houses(id) ON DELETE CASCADE,
    CONSTRAINT fk_visit_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_visits_date ON daily_visits(visit_date);
CREATE INDEX idx_visits_house ON daily_visits(house_id);
CREATE INDEX idx_visits_status ON daily_visits(status);
CREATE INDEX idx_visits_plate ON daily_visits(license_plate);
CREATE INDEX idx_visits_today ON daily_visits(visit_date, status) WHERE status = 'PENDING';

-- ============================================
-- TABLA: access_logs
-- ============================================
CREATE TABLE access_logs (
    id BIGSERIAL PRIMARY KEY,
    visit_id BIGINT,
    access_type VARCHAR(20) NOT NULL CHECK (access_type IN ('VISIT', 'AUTHORIZED', 'RESIDENT')),
    person_name VARCHAR(255) NOT NULL,
    license_plate VARCHAR(20),
    house_id BIGINT NOT NULL,
    confirmed_by BIGINT NOT NULL,
    access_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    notes TEXT,
    
    CONSTRAINT fk_log_visit FOREIGN KEY (visit_id) REFERENCES daily_visits(id) ON DELETE SET NULL,
    CONSTRAINT fk_log_house FOREIGN KEY (house_id) REFERENCES houses(id) ON DELETE CASCADE,
    CONSTRAINT fk_log_officer FOREIGN KEY (confirmed_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_logs_time ON access_logs(access_time);
CREATE INDEX idx_logs_house ON access_logs(house_id);
CREATE INDEX idx_logs_visit ON access_logs(visit_id);
CREATE INDEX idx_logs_officer ON access_logs(confirmed_by);

-- Evitar duplicados de confirmación
CREATE UNIQUE INDEX idx_unique_visit_log ON access_logs(visit_id) WHERE visit_id IS NOT NULL;

-- ============================================
-- TABLA: notifications
-- ============================================
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    is_sent BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    sent_at TIMESTAMP,
    
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_notif_user ON notifications(user_id);
CREATE INDEX idx_notif_pending ON notifications(is_sent) WHERE is_sent = FALSE;
CREATE INDEX idx_notif_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- ============================================
-- FOREIGN KEYS (establecer después de crear todas las tablas)
-- ============================================
ALTER TABLE users ADD CONSTRAINT fk_user_house 
    FOREIGN KEY (house_id) REFERENCES houses(id) ON DELETE SET NULL;

ALTER TABLE houses ADD CONSTRAINT fk_house_admin 
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL;

-- ============================================
-- FUNCIONES DE UTILIDAD
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_houses_updated_at BEFORE UPDATE ON houses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_authorized_updated_at BEFORE UPDATE ON authorized_persons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visits_updated_at BEFORE UPDATE ON daily_visits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMENTARIOS DESCRIPTIVOS
-- ============================================
COMMENT ON TABLE users IS 'Usuarios del sistema: Super Admin, Resident Admin, Resident Member, Security Officer';
COMMENT ON TABLE houses IS 'Casas/Filiales del condominio';
COMMENT ON TABLE authorized_persons IS 'Personas autorizadas permanentemente para ingresar';
COMMENT ON TABLE daily_visits IS 'Visitas programadas para días específicos';
COMMENT ON TABLE access_logs IS 'Registro histórico de todos los accesos confirmados';
COMMENT ON TABLE notifications IS 'Cola de notificaciones para usuarios';

-- ============================================
-- GRANTS (ajustar según usuario de aplicación)
-- ============================================
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO urbanentry_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO urbanentry_user;

-- ============================================
-- FIN DEL SCHEMA
-- ============================================

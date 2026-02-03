# UrbanEntry - Modelo de Base de Datos

## Diagrama Entidad-Relación

```sql
-- ============================================
-- TABLA: users
-- Descripción: Usuarios del sistema
-- ============================================
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL, -- ROLE_SUPER, ROLE_ADMIN, ROLE_MEMBER, ROLE_OFFICER
    house_id BIGINT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_user_house FOREIGN KEY (house_id) REFERENCES houses(id) ON DELETE SET NULL,
    CONSTRAINT chk_role CHECK (role IN ('ROLE_SUPER', 'ROLE_ADMIN', 'ROLE_MEMBER', 'ROLE_OFFICER'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_house ON users(house_id);
CREATE INDEX idx_users_role ON users(role);


-- ============================================
-- TABLA: houses
-- Descripción: Casas/Filiales del condominio
-- ============================================
CREATE TABLE houses (
    id BIGSERIAL PRIMARY KEY,
    house_number VARCHAR(20) NOT NULL UNIQUE,
    section VARCHAR(50),
    address VARCHAR(255),
    admin_id BIGINT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_house_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_houses_number ON houses(house_number);
CREATE INDEX idx_houses_admin ON houses(admin_id);


-- ============================================
-- TABLA: authorized_persons
-- Descripción: Personas autorizadas permanentemente
-- ============================================
CREATE TABLE authorized_persons (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    id_card VARCHAR(50),
    license_plate VARCHAR(20),
    house_id BIGINT NOT NULL,
    valid_until DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_authorized_house FOREIGN KEY (house_id) REFERENCES houses(id) ON DELETE CASCADE,
    CONSTRAINT fk_authorized_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_authorized_house ON authorized_persons(house_id);
CREATE INDEX idx_authorized_plate ON authorized_persons(license_plate);
CREATE INDEX idx_authorized_name ON authorized_persons(full_name);
CREATE INDEX idx_authorized_active ON authorized_persons(is_active) WHERE is_active = TRUE;


-- ============================================
-- TABLA: daily_visits
-- Descripción: Visitas programadas para un día específico
-- ============================================
CREATE TABLE daily_visits (
    id BIGSERIAL PRIMARY KEY,
    visitor_name VARCHAR(255) NOT NULL,
    license_plate VARCHAR(20),
    visit_date DATE NOT NULL,
    expected_time_from TIME,
    expected_time_to TIME,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, CONFIRMED, CANCELLED, EXPIRED
    house_id BIGINT NOT NULL,
    created_by BIGINT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_visit_house FOREIGN KEY (house_id) REFERENCES houses(id) ON DELETE CASCADE,
    CONSTRAINT fk_visit_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_status CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'EXPIRED'))
);

CREATE INDEX idx_visits_date ON daily_visits(visit_date);
CREATE INDEX idx_visits_house ON daily_visits(house_id);
CREATE INDEX idx_visits_status ON daily_visits(status);
CREATE INDEX idx_visits_plate ON daily_visits(license_plate);
CREATE INDEX idx_visits_today ON daily_visits(visit_date, status) WHERE status = 'PENDING';


-- ============================================
-- TABLA: access_logs
-- Descripción: Registro de accesos confirmados
-- ============================================
CREATE TABLE access_logs (
    id BIGSERIAL PRIMARY KEY,
    visit_id BIGINT,
    access_type VARCHAR(20) NOT NULL, -- VISIT, AUTHORIZED, RESIDENT
    person_name VARCHAR(255) NOT NULL,
    license_plate VARCHAR(20),
    house_id BIGINT NOT NULL,
    confirmed_by BIGINT NOT NULL,
    access_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    
    CONSTRAINT fk_log_visit FOREIGN KEY (visit_id) REFERENCES daily_visits(id) ON DELETE SET NULL,
    CONSTRAINT fk_log_house FOREIGN KEY (house_id) REFERENCES houses(id) ON DELETE CASCADE,
    CONSTRAINT fk_log_officer FOREIGN KEY (confirmed_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_access_type CHECK (access_type IN ('VISIT', 'AUTHORIZED', 'RESIDENT'))
);

CREATE INDEX idx_logs_time ON access_logs(access_time);
CREATE INDEX idx_logs_house ON access_logs(house_id);
CREATE INDEX idx_logs_visit ON access_logs(visit_id);
CREATE INDEX idx_logs_officer ON access_logs(confirmed_by);


-- ============================================
-- TABLA: notifications
-- Descripción: Cola de notificaciones pendientes
-- ============================================
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL, -- ACCESS_CONFIRMED, MEMBER_ADDED, AUTH_EXPIRING
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    is_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP,
    
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_notif_user ON notifications(user_id);
CREATE INDEX idx_notif_pending ON notifications(is_sent) WHERE is_sent = FALSE;
CREATE INDEX idx_notif_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
```

## Relaciones Clave

### 1. Usuario - Casa (Many-to-One)
- Cada usuario pertenece a una casa (excepto SUPER_ADMIN y OFFICER)
- Una casa puede tener múltiples miembros
- Un usuario puede ser admin de UNA sola casa

### 2. Casa - Autorizados (One-to-Many)
- Una casa puede tener múltiples autorizados
- Un autorizado pertenece a una sola casa
- Si se elimina la casa, se eliminan sus autorizados (CASCADE)

### 3. Casa - Visitas (One-to-Many)
- Una casa puede recibir múltiples visitas
- Una visita es para una sola casa
- Si se elimina la casa, se eliminan sus visitas (CASCADE)

### 4. Visita - Log de Acceso (One-to-One)
- Una visita puede generar un log de acceso
- El log registra quién confirmó y cuándo
- Si se elimina la visita, el log mantiene referencia NULL

## Reglas de Negocio (Constraints)

### Nivel Base de Datos

```sql
-- Emails únicos
ALTER TABLE users ADD CONSTRAINT uk_users_email UNIQUE (email);

-- Números de casa únicos
ALTER TABLE houses ADD CONSTRAINT uk_houses_number UNIQUE (house_number);

-- Una visita no puede confirmarse dos veces
CREATE UNIQUE INDEX idx_unique_visit_log ON access_logs(visit_id) WHERE visit_id IS NOT NULL;

-- Validar fechas lógicas
ALTER TABLE daily_visits ADD CONSTRAINT chk_valid_times 
    CHECK (expected_time_to > expected_time_from OR expected_time_to IS NULL);

-- Autorizados activos con vigencia válida
CREATE INDEX idx_authorized_valid ON authorized_persons(house_id, is_active) 
    WHERE is_active = TRUE AND (valid_until IS NULL OR valid_until >= CURRENT_DATE);
```

### Nivel Aplicación

1. **Usuario Admin debe pertenecer a la casa que administra**
2. **Miembros solo pueden ver/editar datos de SU casa**
3. **Oficiales no pueden editar, solo confirmar**
4. **Visitas expiran automáticamente (job scheduler)**
5. **Al confirmar acceso, disparar notificación**

## Datos Iniciales (Seed)

```sql
-- Super Admin inicial
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
VALUES ('admin@urbanentry.local', '$2a$12$...', 'Super', 'Admin', 'ROLE_SUPER', TRUE);

-- Oficial de Seguridad de prueba
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
VALUES ('oficial@urbanentry.local', '$2a$12$...', 'Oficial', 'Seguridad', 'ROLE_OFFICER', TRUE);
```

## Índices de Rendimiento

### Búsqueda Rápida (Panel Oficial)

```sql
-- Búsqueda por placa en autorizados (más frecuente)
CREATE INDEX idx_authorized_plate_active ON authorized_persons(license_plate, is_active) 
    WHERE is_active = TRUE;

-- Búsqueda por placa en visitas del día
CREATE INDEX idx_visits_today_plate ON daily_visits(license_plate, visit_date, status) 
    WHERE status = 'PENDING';

-- Visitas de hoy ordenadas
CREATE INDEX idx_visits_today_ordered ON daily_visits(visit_date DESC, created_at DESC) 
    WHERE status IN ('PENDING', 'CONFIRMED');
```

### Auditoría y Reportes

```sql
-- Logs por rango de fechas
CREATE INDEX idx_logs_date_range ON access_logs(access_time DESC, house_id);

-- Actividad por casa
CREATE INDEX idx_logs_house_activity ON access_logs(house_id, access_time DESC);

-- Desempeño de oficiales
CREATE INDEX idx_logs_officer_performance ON access_logs(confirmed_by, access_time DESC);
```

## Estimación de Tamaño

Para un condominio de **200 casas** durante **1 año**:

| Tabla               | Registros Estimados | Tamaño Aprox |
|---------------------|---------------------|--------------|
| users               | 500                 | 100 KB       |
| houses              | 200                 | 50 KB        |
| authorized_persons  | 1,000               | 500 KB       |
| daily_visits        | 36,500 (100/día)    | 10 MB        |
| access_logs         | 36,500              | 15 MB        |
| notifications       | 50,000              | 20 MB        |
| **TOTAL**           | **124,700**         | **~50 MB**   |

**Conclusión**: Base de datos muy liviana, PostgreSQL puede manejar fácilmente.

## Mantenimiento

### Jobs Automáticos

```sql
-- 1. Expirar visitas pasadas (ejecutar diariamente a las 00:00)
UPDATE daily_visits 
SET status = 'EXPIRED', updated_at = CURRENT_TIMESTAMP
WHERE visit_date < CURRENT_DATE AND status = 'PENDING';

-- 2. Limpiar notificaciones antiguas (ejecutar semanalmente)
DELETE FROM notifications 
WHERE is_sent = TRUE AND sent_at < CURRENT_DATE - INTERVAL '30 days';

-- 3. Archivar logs antiguos (ejecutar mensualmente)
-- Mover a tabla access_logs_archive si > 100,000 registros
```

### Backups

```bash
# Backup completo diario
pg_dump -U urbanentry_user -d urbanentry_db -F c -b -v -f backup_$(date +%Y%m%d).dump

# Backup incremental (WAL archiving)
# Configurar en postgresql.conf
```

---

**Versión**: 1.0  
**Última actualización**: Enero 2026

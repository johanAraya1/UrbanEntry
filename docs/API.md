# UrbanEntry - Documentación API REST

## 🌐 Base URL

```
Desarrollo: http://localhost:8080/api
Producción: https://tudominio.com/api
```

## 🔐 Autenticación

Todos los endpoints (excepto `/auth/login` y `/auth/register`) requieren autenticación JWT.

**Header requerido:**
```
Authorization: Bearer <jwt_token>
```

---

## 📋 Endpoints

### 🔓 Autenticación

#### POST /auth/register
Registrar nuevo usuario

**Request Body:**
```json
{
  "email": "usuario@email.com",
  "password": "Password123!",
  "firstName": "Juan",
  "lastName": "Pérez",
  "role": "ROLE_ADMIN",
  "houseId": 1
}
```

**Response:** `200 OK`
```json
{
  "message": "Usuario registrado exitosamente"
}
```

---

#### POST /auth/login
Iniciar sesión

**Request Body:**
```json
{
  "email": "usuario@email.com",
  "password": "Password123!"
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "id": 1,
  "email": "usuario@email.com",
  "firstName": "Juan",
  "lastName": "Pérez",
  "role": "ROLE_ADMIN",
  "houseId": 1
}
```

---

#### GET /auth/me
Obtener información del usuario actual

**Response:** `200 OK`
```json
{
  "id": 1,
  "email": "usuario@email.com",
  "firstName": "Juan",
  "lastName": "Pérez",
  "role": "ROLE_ADMIN",
  "houseId": 1,
  "houseNumber": "101",
  "isActive": true
}
```

---

### 🏠 Casas (Houses)

#### GET /houses
Listar todas las casas

**Query Params:**
- `section` (opcional): Filtrar por sección

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "houseNumber": "101",
    "section": "A",
    "address": "Avenida Principal",
    "adminId": 2,
    "adminName": "Juan Pérez",
    "isActive": true,
    "createdAt": "2026-01-01T10:00:00"
  }
]
```

---

#### POST /houses
Crear nueva casa (Solo SUPER_ADMIN)

**Request Body:**
```json
{
  "houseNumber": "104",
  "section": "A",
  "address": "Avenida Principal #104",
  "adminId": 2
}
```

**Response:** `201 Created`

---

#### GET /houses/{id}
Obtener detalle de casa

**Response:** `200 OK`
```json
{
  "id": 1,
  "houseNumber": "101",
  "section": "A",
  "address": "Avenida Principal",
  "admin": {
    "id": 2,
    "name": "Juan Pérez",
    "email": "juan@email.com"
  },
  "members": [
    {
      "id": 3,
      "name": "Ana Pérez",
      "email": "ana@email.com",
      "role": "ROLE_MEMBER"
    }
  ],
  "authorizedCount": 5,
  "isActive": true
}
```

---

#### PUT /houses/{id}
Actualizar casa

**Request Body:**
```json
{
  "address": "Nueva dirección",
  "adminId": 3
}
```

**Response:** `200 OK`

---

### 👥 Personas Autorizadas

#### GET /authorized
Listar autorizados

**Query Params:**
- `houseId` (opcional): Filtrar por casa
- `active` (opcional): Solo activos (true/false)

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "fullName": "Rosa Méndez",
    "idCard": "1-0234-0567",
    "licensePlate": null,
    "houseId": 1,
    "houseNumber": "101",
    "validUntil": null,
    "isActive": true,
    "isValid": true,
    "createdAt": "2026-01-01T10:00:00"
  }
]
```

---

#### POST /authorized
Crear nuevo autorizado

**Request Body:**
```json
{
  "fullName": "Carlos Ramírez",
  "idCard": "1-0456-0789",
  "licensePlate": "ABC-123",
  "houseId": 1,
  "validUntil": "2026-12-31"
}
```

**Response:** `201 Created`

---

#### GET /authorized/search
Búsqueda rápida (para oficiales)

**Query Params:**
- `q`: Término de búsqueda (nombre, placa, cédula)

**Example:** `/authorized/search?q=ABC-123`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "fullName": "Carlos Ramírez",
    "licensePlate": "ABC-123",
    "houseNumber": "101",
    "houseSection": "A",
    "isValid": true,
    "validUntil": "2026-12-31"
  }
]
```

---

#### PUT /authorized/{id}
Actualizar autorizado

**Request Body:**
```json
{
  "fullName": "Carlos Alberto Ramírez",
  "validUntil": "2027-12-31"
}
```

**Response:** `200 OK`

---

#### DELETE /authorized/{id}
Eliminar autorizado (soft delete)

**Response:** `204 No Content`

---

### 📅 Visitas Diarias

#### GET /visits
Listar visitas

**Query Params:**
- `date`: Fecha (YYYY-MM-DD)
- `houseId`: Filtrar por casa
- `status`: Filtrar por estado (PENDING, CONFIRMED, EXPIRED)

**Example:** `/visits?date=2026-01-23&status=PENDING`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "visitorName": "Dr. Raúl Morales",
    "licensePlate": "DOC-111",
    "visitDate": "2026-01-23",
    "expectedTimeFrom": "10:00",
    "expectedTimeTo": "11:00",
    "status": "PENDING",
    "houseId": 1,
    "houseNumber": "101",
    "createdBy": {
      "id": 2,
      "name": "Juan Pérez"
    },
    "notes": "Visita médica a domicilio",
    "createdAt": "2026-01-22T15:30:00"
  }
]
```

---

#### POST /visits
Crear nueva visita

**Request Body:**
```json
{
  "visitorName": "María González",
  "licensePlate": "VIS-456",
  "visitDate": "2026-01-23",
  "expectedTimeFrom": "14:00",
  "expectedTimeTo": "16:00",
  "houseId": 1,
  "notes": "Visita familiar"
}
```

**Response:** `201 Created`

---

#### GET /visits/today
Visitas del día actual (optimizado para oficiales)

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "visitorName": "Dr. Raúl Morales",
    "licensePlate": "DOC-111",
    "expectedTime": "10:00 - 11:00",
    "houseNumber": "101",
    "houseSection": "A",
    "status": "PENDING",
    "residentName": "Juan Pérez",
    "residentPhone": "+506 8888-8888"
  }
]
```

---

#### GET /visits/{id}
Obtener detalle de visita

**Response:** `200 OK`
```json
{
  "id": 1,
  "visitorName": "Dr. Raúl Morales",
  "licensePlate": "DOC-111",
  "visitDate": "2026-01-23",
  "expectedTimeFrom": "10:00",
  "expectedTimeTo": "11:00",
  "status": "PENDING",
  "house": {
    "id": 1,
    "number": "101",
    "section": "A",
    "address": "Avenida Principal"
  },
  "createdBy": {
    "id": 2,
    "name": "Juan Pérez",
    "email": "juan@email.com"
  },
  "notes": "Visita médica a domicilio",
  "createdAt": "2026-01-22T15:30:00",
  "updatedAt": "2026-01-22T15:30:00"
}
```

---

#### DELETE /visits/{id}
Cancelar visita

**Response:** `204 No Content`

---

### 🚪 Control de Accesos

#### POST /access/confirm/{visitId}
Confirmar ingreso de visita (Solo OFFICER)

**Request Body:**
```json
{
  "notes": "Ingreso confirmado, persona coincide con descripción"
}
```

**Response:** `200 OK`
```json
{
  "accessLogId": 123,
  "visitId": 1,
  "accessTime": "2026-01-23T10:15:00",
  "confirmedBy": {
    "id": 5,
    "name": "Carlos Oficial"
  },
  "notificationSent": true,
  "message": "Ingreso confirmado exitosamente"
}
```

**Efectos:**
1. Cambia estado de visita a `CONFIRMED`
2. Crea registro en `access_logs`
3. Envía notificación por email al residente
4. Registra hora exacta de ingreso

---

#### POST /access/manual
Registrar acceso manual (sin visita previa)

**Request Body:**
```json
{
  "accessType": "AUTHORIZED",
  "personName": "Rosa Méndez",
  "licensePlate": null,
  "houseId": 1,
  "notes": "Ingreso rutinario empleada"
}
```

**Response:** `201 Created`

---

#### GET /access/logs
Obtener historial de accesos

**Query Params:**
- `houseId`: Filtrar por casa
- `startDate`: Fecha inicio (YYYY-MM-DD)
- `endDate`: Fecha fin (YYYY-MM-DD)
- `type`: Tipo de acceso (VISIT, AUTHORIZED, RESIDENT)

**Example:** `/access/logs?houseId=1&startDate=2026-01-01&endDate=2026-01-31`

**Response:** `200 OK`
```json
[
  {
    "id": 123,
    "accessType": "VISIT",
    "personName": "Dr. Raúl Morales",
    "licensePlate": "DOC-111",
    "houseNumber": "101",
    "confirmedBy": {
      "id": 5,
      "name": "Carlos Oficial"
    },
    "accessTime": "2026-01-23T10:15:00",
    "notes": "Ingreso confirmado"
  }
]
```

---

#### GET /access/logs/house/{houseId}
Historial de accesos de una casa específica

**Response:** `200 OK` (mismo formato que `/access/logs`)

---

### 👤 Usuarios

#### GET /users
Listar usuarios (Solo ADMIN/SUPER)

**Query Params:**
- `role`: Filtrar por rol
- `houseId`: Filtrar por casa

**Response:** `200 OK`
```json
[
  {
    "id": 2,
    "email": "juan@email.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "role": "ROLE_ADMIN",
    "houseId": 1,
    "houseNumber": "101",
    "isActive": true,
    "createdAt": "2026-01-01T10:00:00"
  }
]
```

---

#### GET /users/{id}
Obtener usuario por ID

**Response:** `200 OK`

---

#### PUT /users/{id}
Actualizar usuario

**Request Body:**
```json
{
  "firstName": "Juan Carlos",
  "lastName": "Pérez Gómez",
  "houseId": 2
}
```

**Response:** `200 OK`

---

#### DELETE /users/{id}
Desactivar usuario (soft delete)

**Response:** `204 No Content`

---

### 🔔 Notificaciones

#### GET /notifications
Obtener notificaciones del usuario actual

**Query Params:**
- `unreadOnly`: Solo no leídas (true/false)

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "type": "ACCESS_CONFIRMED",
    "title": "Ingreso Confirmado",
    "message": "Rosa Méndez ingresó al condominio a las 10:15 AM",
    "isRead": false,
    "createdAt": "2026-01-23T10:15:00"
  }
]
```

---

#### PUT /notifications/{id}/read
Marcar notificación como leída

**Response:** `200 OK`

---

#### GET /notifications/unread-count
Obtener cantidad de notificaciones no leídas

**Response:** `200 OK`
```json
{
  "count": 3
}
```

---

## 📊 Códigos de Estado HTTP

| Código | Significado |
|--------|-------------|
| 200    | OK - Operación exitosa |
| 201    | Created - Recurso creado |
| 204    | No Content - Operación exitosa sin respuesta |
| 400    | Bad Request - Datos inválidos |
| 401    | Unauthorized - No autenticado |
| 403    | Forbidden - No autorizado (sin permisos) |
| 404    | Not Found - Recurso no encontrado |
| 409    | Conflict - Conflicto (ej: email duplicado) |
| 500    | Internal Server Error - Error del servidor |

---

## 🔒 Roles y Permisos

| Endpoint | SUPER_ADMIN | RESIDENT_ADMIN | RESIDENT_MEMBER | SECURITY_OFFICER |
|----------|-------------|----------------|-----------------|------------------|
| POST /auth/register | ✅ | ✅ | ❌ | ❌ |
| POST /houses | ✅ | ❌ | ❌ | ❌ |
| GET /houses | ✅ | ✅ | ✅ | ❌ |
| POST /authorized | ✅ | ✅ | ✅ | ❌ |
| GET /authorized/search | ✅ | ✅ | ✅ | ✅ |
| POST /visits | ✅ | ✅ | ✅ | ❌ |
| GET /visits/today | ✅ | ✅ | ✅ | ✅ |
| POST /access/confirm | ❌ | ❌ | ❌ | ✅ |
| GET /access/logs | ✅ | ✅ (su casa) | ✅ (su casa) | ✅ |
| GET /users | ✅ | ❌ | ❌ | ❌ |

---

## 🧪 Ejemplos con cURL

### Login
```bash
curl -X POST https://tudominio.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@email.com",
    "password": "Password123!"
  }'
```

### Crear Visita (con token)
```bash
curl -X POST https://tudominio.com/api/visits \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "visitorName": "María González",
    "licensePlate": "VIS-456",
    "visitDate": "2026-01-23",
    "expectedTimeFrom": "14:00",
    "expectedTimeTo": "16:00",
    "houseId": 1
  }'
```

### Buscar Autorizado
```bash
curl -X GET "https://tudominio.com/api/authorized/search?q=ABC-123" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Confirmar Ingreso
```bash
curl -X POST https://tudominio.com/api/access/confirm/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "notes": "Ingreso confirmado"
  }'
```

---

## 📚 Colección Postman

Descargar colección completa: [UrbanEntry.postman_collection.json](../postman/UrbanEntry.postman_collection.json)

---

## 🔄 Rate Limiting

Para prevenir abuso, se implementa rate limiting:

- **Login**: 5 intentos por minuto
- **Búsquedas**: 30 requests por minuto
- **Operaciones CRUD**: 100 requests por minuto

---

## 📞 Soporte

- Email: api@urbanentry.local
- GitHub: [Issues](https://github.com/johanAraya1/UrbanEntry/issues)

---

**Versión API**: 1.0  
**Última actualización**: Enero 2026

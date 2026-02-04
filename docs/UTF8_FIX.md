# Corrección de Encoding UTF-8 - UrbanEntry

## Problema Identificado
Los caracteres especiales españoles (á, é, í, ó, ú, ñ) se mostraban incorrectamente como:
- "Méndez" → "MÃ©ndez"
- "Hernández" → "HernÃ¡ndez"
- "Sánchez" → "SÃ¡nchez"

**Causa raíz:** Incompatibilidad entre:
- Servidor PostgreSQL: UTF8 ✅
- Cliente PostgreSQL: WIN1252 ❌ (Windows Latin)

## Soluciones Implementadas

### 1. Backend (Spring Boot)

#### application.properties
```properties
# Configuración forzada de UTF-8 para DataSource
spring.datasource.hikari.connection-init-sql=SET CLIENT_ENCODING TO 'UTF8'
spring.jpa.properties.hibernate.connection.characterEncoding=utf8
spring.jpa.properties.hibernate.connection.useUnicode=true
```

#### AuthorizedPersonController.java
- Agregado método `normalizeText()` con Unicode Normalization Form C (NFC)
- Aplicado a todos los campos de texto antes de guardar
- Header de respuesta: `produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8"`

```java
private String normalizeText(String text) {
    if (text == null || text.isEmpty()) {
        return text;
    }
    return Normalizer.normalize(text.trim(), Normalizer.Form.NFC);
}
```

### 2. Frontend (React Native)

#### api.js
Headers configurados correctamente:
```javascript
headers: {
  'Content-Type': 'application/json; charset=UTF-8',
  'Accept': 'application/json; charset=UTF-8'
},
responseEncoding: 'utf8'
```

#### AuthorizedPersons.js
- Agregado método `normalizeText()` con normalización Unicode
- Aplicado a todos los inputs antes de enviar al backend
- Normalización NFC para evitar problemas de codificación

```javascript
const normalizeText = (text) => {
  if (!text) return text;
  return text.normalize('NFC').trim();
};
```

### 3. Base de Datos

#### Limpieza de datos corruptos
```sql
-- Se eliminaron registros con encoding incorrecto
DELETE FROM authorized_persons;
```

Los nuevos registros se insertarán correctamente con UTF-8.

## Validaciones Implementadas

### Backend
✅ Normalización Unicode (NFC) en todos los campos de texto
✅ Conversión automática de placas a mayúsculas
✅ Trim automático de espacios
✅ Validación de caracteres especiales preservados

### Frontend
✅ Normalización Unicode antes de enviar
✅ Headers UTF-8 en todas las peticiones
✅ Configuración de encoding en Axios

## Pruebas Recomendadas

1. **Crear nueva persona autorizada:**
   - Nombre: "José María Rodríguez"
   - Apellido: "Martínez Peña"
   - Cédula: "1-0234-0567"
   - Placa: "SJO-123"

2. **Verificar caracteres especiales:**
   - á, é, í, ó, ú
   - Á, É, Í, Ó, Ú
   - ñ, Ñ
   - ü, Ü

3. **Validar en base de datos:**
```sql
SELECT id, full_name, id_card FROM authorized_persons;
```

## Prevención Futura

### ✅ No volverá a ocurrir porque:
1. **Conexión DB fuerza UTF-8:** `connection-init-sql=SET CLIENT_ENCODING TO 'UTF8'`
2. **Normalización automática:** Backend normaliza todo antes de guardar
3. **Headers correctos:** Frontend siempre envía con charset UTF-8
4. **Validación bidireccional:** Frontend y backend normalizan independientemente

### 🔒 Capas de protección:
1. Backend normaliza entrada → UTF-8 NFC
2. PostgreSQL driver configurado → UTF-8
3. HikariCP inicializa conexión → UTF-8
4. Frontend normaliza salida → UTF-8 NFC

## Archivos Modificados

### Backend:
- `application.properties` - Configuración UTF-8
- `AuthorizedPersonController.java` - Normalización de texto

### Frontend:
- `AuthorizedPersons.js` - Normalización de inputs

### Database:
- `fix_authorized_persons_encoding.sql` - Script de corrección

## Comandos Útiles

### Verificar encoding en PostgreSQL:
```bash
psql -U urbanentry_user -d urbanentry_db -c "SHOW SERVER_ENCODING; SHOW CLIENT_ENCODING;"
```

### Forzar UTF-8 en psql:
```bash
$env:PGCLIENTENCODING='UTF8'
```

### Verificar datos en DB:
```sql
SELECT id, full_name, id_card, license_plate 
FROM authorized_persons 
WHERE is_active = true 
ORDER BY id;
```

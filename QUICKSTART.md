# 🚀 UrbanEntry - Quick Start Guide

## Para Desarrolladores

### 📋 Prerequisitos

Asegúrate de tener instalado:
- ☕ Java 17 o superior
- 🐘 PostgreSQL 15 o superior
- 📦 Maven 3.8+
- 📱 Node.js 18+ (para frontend)
- 🔧 Git

### 🔧 Configuración Inicial (5 minutos)

#### 1️⃣ Clonar el Repositorio

```bash
git clone https://github.com/johanAraya1/UrbanEntry.git
cd UrbanEntry
```

#### 2️⃣ Crear Base de Datos

```bash
# Ingresar a PostgreSQL
psql -U postgres

# Ejecutar estos comandos:
CREATE DATABASE urbanentry_db;
CREATE USER urbanentry_user WITH PASSWORD 'dev123';
GRANT ALL PRIVILEGES ON DATABASE urbanentry_db TO urbanentry_user;
\c urbanentry_db
GRANT ALL ON SCHEMA public TO urbanentry_user;
\q

# Cargar schema y datos de prueba
psql -U urbanentry_user -d urbanentry_db -f database/schema.sql
psql -U urbanentry_user -d urbanentry_db -f database/seed.sql
```

#### 3️⃣ Configurar Backend

```bash
cd backend

# Editar credenciales de BD (si usaste password diferente)
nano src/main/resources/application.properties
# Cambiar:
# spring.datasource.password=dev123

# Compilar y ejecutar
mvn clean install
mvn spring-boot:run
```

✅ Backend corriendo en: **http://localhost:8080**

#### 4️⃣ Verificar Backend

En otra terminal:
```bash
# Health check
curl http://localhost:8080/actuator/health

# Login de prueba
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@urbanentry.local",
    "password": "Admin123!"
  }'
```

Si ves un JWT token, ¡todo funciona! 🎉

---

## 🎨 Para Implementar Frontend

### Crear Proyecto React

```bash
cd frontend

# Crear app React con PWA
npx create-react-app . --template cra-template-pwa

# Instalar dependencias
npm install react-router-dom@6 axios date-fns idb

# Instalar Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Configurar Tailwind

Editar `tailwind.config.js`:
```javascript
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1565C0',
          light: '#1976D2',
          lighter: '#42A5F5',
        },
        secondary: {
          DEFAULT: '#4CAF50',
          dark: '#388E3C',
          light: '#66BB6A',
        },
        neutral: {
          dark: '#263238',
          medium: '#546E7A',
          light: '#ECEFF1',
        }
      }
    }
  },
  plugins: []
}
```

### Crear .env

```bash
echo "REACT_APP_API_URL=http://localhost:8080/api" > .env
```

### Ejecutar Frontend

```bash
npm start
```

Frontend corriendo en: **http://localhost:3000**

### Estructura Recomendada

Ver ejemplos completos en: [docs/IMPLEMENTATION_GUIDE.md](./docs/IMPLEMENTATION_GUIDE.md)

---

## 🔐 Credenciales de Prueba

| Rol | Email | Password |
|-----|-------|----------|
| Super Admin | admin@urbanentry.local | Admin123! |
| Oficial | oficial@urbanentry.local | Admin123! |
| Residente Admin | juan.perez@email.com | Admin123! |
| Residente Miembro | ana.perez@email.com | Admin123! |

---

## 📚 Documentación Completa

- 📖 [README.md](./README.md) - Documentación principal
- 🏗️ [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Arquitectura del sistema
- 💾 [DATABASE.md](./docs/DATABASE.md) - Modelo de datos
- 🌐 [API.md](./docs/API.md) - Endpoints REST
- 🚀 [DEPLOYMENT.md](./docs/DEPLOYMENT.md) - Despliegue producción
- 💻 [IMPLEMENTATION_GUIDE.md](./docs/IMPLEMENTATION_GUIDE.md) - Guía implementación
- 📊 [PROJECT_SUMMARY.md](./docs/PROJECT_SUMMARY.md) - Resumen ejecutivo

---

## 🛠️ Comandos Útiles

### Backend

```bash
# Compilar
mvn clean install

# Ejecutar
mvn spring-boot:run

# Tests
mvn test

# Empaquetar para producción
mvn clean package -DskipTests
```

### Frontend

```bash
# Instalar dependencias
npm install

# Desarrollo
npm start

# Build producción
npm run build

# Tests
npm test
```

### Base de Datos

```bash
# Conectar
psql -U urbanentry_user -d urbanentry_db

# Ver usuarios
SELECT email, role FROM users;

# Ver casas
SELECT house_number, section FROM houses;

# Ver visitas de hoy
SELECT visitor_name, license_plate, status 
FROM daily_visits 
WHERE visit_date = CURRENT_DATE;
```

---

## 🐛 Troubleshooting

### Backend no inicia

```bash
# Ver logs
tail -f backend/target/*.log

# Verificar Java
java -version

# Verificar PostgreSQL
psql -U urbanentry_user -d urbanentry_db -c "SELECT 1;"
```

### Error de conexión a BD

Editar `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/urbanentry_db
spring.datasource.username=urbanentry_user
spring.datasource.password=TU_PASSWORD
```

### Puerto 8080 ocupado

Cambiar puerto en `application.properties`:
```properties
server.port=8081
```

---

## 🧪 Probar API con Postman

1. Descargar Postman
2. Importar colección (próximamente)
3. Crear environment con:
   - `baseUrl`: `http://localhost:8080/api`
   - `token`: (obtenido del login)

---

## 💡 Próximos Pasos

1. ✅ Backend funcional
2. ⏳ Implementar DTOs y Services
3. ⏳ Implementar Controllers REST
4. ⏳ Desarrollar Frontend React
5. ⏳ Configurar PWA
6. ⏳ Testing
7. ⏳ Deploy a producción

---

## 📞 Soporte

- 🐛 **Issues**: [GitHub Issues](https://github.com/johanAraya1/UrbanEntry/issues)
- 📧 **Email**: soporte@urbanentry.local
- 📖 **Wiki**: [GitHub Wiki](https://github.com/johanAraya1/UrbanEntry/wiki)

---

**¡Happy Coding! 🚀**

_UrbanEntry - Gestión de accesos inteligente para tu condominio_ 🏢🔐

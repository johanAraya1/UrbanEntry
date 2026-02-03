# 🏢 UrbanEntry

**Sistema de Gestión de Accesos para Condominios**  
Progressive Web App (PWA) offline-first con arquitectura monolítica

![UrbanEntry Logo](./docs/logo.png)

## 🎯 Características Principales

- ✅ **Offline-first**: Funciona sin conexión a internet
- ✅ **Progressive Web App**: Instálala como app nativa
- ✅ **Multiplataforma**: Móvil, tablet y PC
- ✅ **Zero Licensing Cost**: 100% software libre
- ✅ **Seguridad Robusta**: JWT + HTTPS + BCrypt
- ✅ **Gestión de Autorizados**: Personas con acceso permanente
- ✅ **Visitas Diarias**: Control de visitantes por día
- ✅ **Panel de Oficial**: Búsqueda rápida y confirmación de ingresos
- ✅ **Notificaciones**: Email cuando una visita ingresa

## 🎨 Paleta de Colores

```css
Primario:  #1565C0 (Azul)
Secundario: #4CAF50 (Verde)
Neutro:    #263238 (Gris Oscuro)
```

## 🏗️ Tecnologías

### Backend
- Java 17
- Spring Boot 3.2
- Spring Security + JWT
- Spring Data JPA
- PostgreSQL 15
- JavaMail API

### Frontend
- React 18
- React Router v6
- Axios
- Tailwind CSS
- Service Workers
- IndexedDB

### Infraestructura
- Ubuntu Server 22.04
- Nginx
- Let's Encrypt / Certbot
- Systemd

## 📦 Estructura del Proyecto

```
UrbanEntry/
├── backend/                 # Spring Boot API
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/urbanentry/
│   │   │   │   ├── config/           # Configuración
│   │   │   │   ├── controller/       # REST Controllers
│   │   │   │   ├── dto/              # Data Transfer Objects
│   │   │   │   ├── entity/           # JPA Entities
│   │   │   │   ├── repository/       # Spring Data Repositories
│   │   │   │   ├── service/          # Business Logic
│   │   │   │   ├── security/         # JWT & Security
│   │   │   │   └── exception/        # Custom Exceptions
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── application-prod.properties
│   │   └── test/
│   └── pom.xml
│
├── frontend/                # React PWA
│   ├── public/
│   │   ├── manifest.json
│   │   ├── service-worker.js
│   │   └── icons/
│   ├── src/
│   │   ├── components/      # React Components
│   │   ├── pages/           # Page Components
│   │   ├── context/         # React Context
│   │   ├── hooks/           # Custom Hooks
│   │   ├── services/        # API Services
│   │   ├── utils/           # Utilities
│   │   ├── styles/          # CSS/Tailwind
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── database/
│   ├── schema.sql           # Schema inicial
│   ├── seed.sql             # Datos de prueba
│   └── migrations/          # Migraciones
│
├── deployment/
│   ├── nginx.conf           # Configuración Nginx
│   ├── urbanentry.service   # Systemd service
│   ├── deploy.sh            # Script de despliegue
│   └── backup.sh            # Script de backup
│
└── docs/
    ├── ARCHITECTURE.md      # Arquitectura del sistema
    ├── DATABASE.md          # Modelo de datos
    ├── API.md               # Documentación API
    └── DEPLOYMENT.md        # Guía de despliegue
```

## 🚀 Inicio Rápido

### Prerequisitos

```bash
# Java 17
java -version

# Node.js 18+
node -v

# PostgreSQL 15
psql --version

# Maven 3.8+
mvn -version
```

### Instalación Local (Desarrollo)

1. **Clonar repositorio**
```bash
git clone https://github.com/johanAraya1/UrbanEntry.git
cd UrbanEntry
```

2. **Configurar Base de Datos**
```bash
# Crear base de datos
sudo -u postgres psql
CREATE DATABASE urbanentry_db;
CREATE USER urbanentry_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE urbanentry_db TO urbanentry_user;
\q

# Ejecutar schema
psql -U urbanentry_user -d urbanentry_db -f database/schema.sql
psql -U urbanentry_user -d urbanentry_db -f database/seed.sql
```

3. **Configurar Backend**
```bash
cd backend

# Editar application.properties con tus credenciales
nano src/main/resources/application.properties

# Compilar y ejecutar
mvn clean install
mvn spring-boot:run
```

Backend corriendo en: `http://localhost:8080`

4. **Configurar Frontend**
```bash
cd frontend

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm start
```

Frontend corriendo en: `http://localhost:3000`

5. **Acceso Inicial**
```
Email: admin@urbanentry.local
Password: Admin123!
```

## 🔐 Roles de Usuario

| Rol               | Descripción                                    |
|-------------------|------------------------------------------------|
| **SUPER_ADMIN**   | Administrador global del sistema               |
| **RESIDENT_ADMIN**| Administrador de una casa específica           |
| **RESIDENT_MEMBER**| Miembro de una casa (familia)                 |
| **SECURITY_OFFICER**| Oficial de seguridad (solo lectura + confirmar)|

## 📱 Instalación como PWA

### En Android/iOS
1. Abre Chrome/Safari
2. Ve a `https://tu-dominio.com`
3. Toca "Agregar a pantalla de inicio"
4. La app se instalará como nativa

### En Windows/Mac/Linux
1. Abre Chrome
2. Ve a `https://tu-dominio.com`
3. Clic en icono de instalación (barra de direcciones)
4. Confirma instalación

## 📖 Documentación Completa

- [Arquitectura del Sistema](./docs/ARCHITECTURE.md)
- [Modelo de Base de Datos](./docs/DATABASE.md)
- [API REST Documentation](./docs/API.md)
- [Guía de Despliegue en Producción](./docs/DEPLOYMENT.md)

## 🧪 Testing

### Backend
```bash
cd backend
mvn test
```

### Frontend
```bash
cd frontend
npm test
```

## 📦 Build para Producción

### Backend
```bash
cd backend
mvn clean package -DskipTests
# JAR generado en: target/urbanentry-1.0.0.jar
```

### Frontend
```bash
cd frontend
npm run build
# Build generado en: build/
```

## 🌐 Despliegue en Servidor

Ver guía completa: [DEPLOYMENT.md](./docs/DEPLOYMENT.md)

**Resumen:**
1. Servidor Ubuntu 22.04 con IP estática
2. Instalar Java 17, PostgreSQL, Nginx
3. Configurar dominio y SSL (Let's Encrypt)
4. Configurar Nginx como reverse proxy
5. Ejecutar backend como servicio systemd
6. Servir frontend desde Nginx
7. Configurar backups automáticos

## 🔒 Seguridad

- ✅ HTTPS obligatorio (Let's Encrypt)
- ✅ Passwords con BCrypt (cost 12)
- ✅ JWT tokens con expiración
- ✅ CORS configurado
- ✅ SQL Injection prevention
- ✅ XSS protection
- ✅ Rate limiting en endpoints críticos

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es software libre y de código abierto.  
Licencia MIT - ver [LICENSE](LICENSE) para más detalles.

## 👥 Autores

- **Johan Araya** - *Desarrollo Inicial* - [johanAraya1](https://github.com/johanAraya1)

## 🙏 Agradecimientos

- Spring Boot community
- React community
- PostgreSQL team
- Todos los contribuidores de software libre

## 📞 Soporte

- 📧 Email: soporte@urbanentry.local
- 🐛 Issues: [GitHub Issues](https://github.com/johanAraya1/UrbanEntry/issues)
- 📖 Wiki: [GitHub Wiki](https://github.com/johanAraya1/UrbanEntry/wiki)

---

**UrbanEntry** - Gestión de accesos inteligente para tu condominio 🏢🔐

_Desarrollado con ❤️ para comunidades seguras_
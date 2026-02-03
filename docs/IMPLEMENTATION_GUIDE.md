# UrbanEntry - Guía de Implementación Completa

## 🎯 Estado del Proyecto

### ✅ Archivos Generados (Completados)

#### Documentación
- ✅ [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) - Arquitectura completa del sistema
- ✅ [docs/DATABASE.md](../docs/DATABASE.md) - Modelo de base de datos detallado
- ✅ [README.md](../README.md) - Documentación principal

#### Backend - Estructura Base
- ✅ `backend/pom.xml` - Maven dependencies
- ✅ `backend/src/main/resources/application.properties` - Configuración desarrollo
- ✅ `backend/src/main/resources/application-prod.properties` - Configuración producción
- ✅ `backend/src/main/java/com/urbanentry/UrbanEntryApplication.java` - Clase principal

#### Backend - Entidades JPA
- ✅ `entity/UserRole.java` - Enum roles
- ✅ `entity/VisitStatus.java` - Enum estados visita
- ✅ `entity/AccessType.java` - Enum tipos de acceso
- ✅ `entity/User.java` - Entidad usuario
- ✅ `entity/House.java` - Entidad casa
- ✅ `entity/AuthorizedPerson.java` - Entidad autorizado
- ✅ `entity/DailyVisit.java` - Entidad visita
- ✅ `entity/AccessLog.java` - Entidad log de acceso
- ✅ `entity/Notification.java` - Entidad notificación

#### Backend - Repositorios
- ✅ `repository/UserRepository.java`
- ✅ `repository/HouseRepository.java`
- ✅ `repository/AuthorizedPersonRepository.java`
- ✅ `repository/DailyVisitRepository.java`
- ✅ `repository/AccessLogRepository.java`
- ✅ `repository/NotificationRepository.java`

#### Backend - Seguridad
- ✅ `security/JwtTokenProvider.java` - Generación y validación JWT
- ✅ `security/CustomUserDetailsService.java` - Carga de usuarios
- ✅ `security/JwtAuthenticationFilter.java` - Filtro JWT
- ✅ `security/JwtAuthenticationEntryPoint.java` - Manejo de no autorizado
- ✅ `config/SecurityConfig.java` - Configuración Spring Security

---

## 📋 Archivos Pendientes por Implementar

### Backend - DTOs (Data Transfer Objects)

Crear en `backend/src/main/java/com/urbanentry/dto/`:

#### `dto/auth/LoginRequest.java`
```java
package com.urbanentry.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "Email es requerido")
    @Email(message = "Email inválido")
    private String email;

    @NotBlank(message = "Password es requerido")
    private String password;
}
```

#### `dto/auth/RegisterRequest.java`
```java
package com.urbanentry.dto.auth;

import com.urbanentry.entity.UserRole;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank @Email
    private String email;

    @NotBlank @Size(min = 8, max = 100)
    private String password;

    @NotBlank @Size(min = 2, max = 100)
    private String firstName;

    @NotBlank @Size(min = 2, max = 100)
    private String lastName;

    @NotNull
    private UserRole role;

    private Long houseId; // Required for ADMIN/MEMBER
}
```

#### `dto/auth/JwtResponse.java`
```java
package com.urbanentry.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private Long houseId;
}
```

#### `dto/UserDTO.java`, `dto/HouseDTO.java`, `dto/AuthorizedPersonDTO.java`, etc.
Seguir el patrón de DTOs para separar la capa de presentación de las entidades.

### Backend - Servicios

Crear en `backend/src/main/java/com/urbanentry/service/`:

#### `service/AuthService.java`
```java
package com.urbanentry.service;

import com.urbanentry.dto.auth.*;
import com.urbanentry.entity.User;
import com.urbanentry.repository.UserRepository;
import com.urbanentry.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Transactional
    public JwtResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String jwt = tokenProvider.generateToken(authentication);
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return new JwtResponse(jwt, "Bearer", user.getId(), user.getEmail(),
            user.getFirstName(), user.getLastName(), user.getRole().name(),
            user.getHouse() != null ? user.getHouse().getId() : null);
    }

    @Transactional
    public User register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email ya registrado");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(request.getRole());
        user.setIsActive(true);
        
        // Set house if provided
        if (request.getHouseId() != null) {
            // Fetch and set house
        }

        return userRepository.save(user);
    }
}
```

Servicios adicionales necesarios:
- `UserService.java` - CRUD usuarios
- `HouseService.java` - CRUD casas
- `AuthorizedPersonService.java` - CRUD autorizados con búsqueda
- `DailyVisitService.java` - CRUD visitas + expiración automática
- `AccessLogService.java` - Confirmación de ingresos + logs
- `NotificationService.java` - Envío de notificaciones
- `EmailService.java` - Envío de emails con JavaMail

### Backend - Controllers

Crear en `backend/src/main/java/com/urbanentry/controller/`:

#### `controller/AuthController.java`
```java
package com.urbanentry.controller;

import com.urbanentry.dto.auth.*;
import com.urbanentry.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@Valid @RequestBody LoginRequest request) {
        JwtResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok().body("{\"message\": \"Usuario registrado exitosamente\"}");
    }
}
```

Controllers adicionales necesarios:
- `UserController.java` - `/api/users/**`
- `HouseController.java` - `/api/houses/**`
- `AuthorizedPersonController.java` - `/api/authorized/**`
- `DailyVisitController.java` - `/api/visits/**`
- `AccessLogController.java` - `/api/access/**`
- `OfficerController.java` - `/api/officer/**` (panel optimizado)
- `NotificationController.java` - `/api/notifications/**`

### Backend - Tareas Programadas

#### `scheduler/VisitExpirationScheduler.java`
```java
package com.urbanentry.scheduler;

import com.urbanentry.repository.DailyVisitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.time.LocalDate;

@Component
public class VisitExpirationScheduler {

    @Autowired
    private DailyVisitRepository visitRepository;

    @Scheduled(cron = "${urbanentry.cron.expire-visits}")
    public void expireOldVisits() {
        int expired = visitRepository.expireOldVisits(LocalDate.now());
        System.out.println("Visitas expiradas: " + expired);
    }
}
```

### Backend - Exception Handling

#### `exception/GlobalExceptionHandler.java`
```java
package com.urbanentry.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> handleResourceNotFound(ResourceNotFoundException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("message", ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<?> handleAccessDenied(AccessDeniedException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("message", "Acceso denegado");
        return new ResponseEntity<>(body, HttpStatus.FORBIDDEN);
    }

    // Add more exception handlers
}
```

---

## 🎨 Frontend React PWA

### Estructura de Carpetas

```
frontend/
├── public/
│   ├── index.html
│   ├── manifest.json
│   ├── service-worker.js
│   ├── favicon.ico
│   └── icons/
│       ├── icon-72x72.png
│       ├── icon-96x96.png
│       ├── icon-128x128.png
│       ├── icon-144x144.png
│       ├── icon-152x152.png
│       ├── icon-192x192.png
│       ├── icon-384x384.png
│       └── icon-512x512.png
├── src/
│   ├── api/
│   │   ├── axios.js (configuración)
│   │   ├── authApi.js
│   │   ├── userApi.js
│   │   ├── houseApi.js
│   │   ├── authorizedApi.js
│   │   ├── visitApi.js
│   │   └── accessApi.js
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Card.jsx
│   │   │   └── Loading.jsx
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx
│   │   │   └── RegisterForm.jsx
│   │   ├── authorized/
│   │   │   ├── AuthorizedList.jsx
│   │   │   ├── AuthorizedForm.jsx
│   │   │   └── AuthorizedCard.jsx
│   │   ├── visits/
│   │   │   ├── VisitList.jsx
│   │   │   ├── VisitForm.jsx
│   │   │   └── VisitCard.jsx
│   │   └── officer/
│   │       ├── QuickSearch.jsx
│   │       ├── TodayVisits.jsx
│   │       └── ConfirmAccessButton.jsx
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── ResidentDashboard.jsx
│   │   ├── OfficerDashboard.jsx
│   │   ├── AuthorizedPage.jsx
│   │   ├── VisitsPage.jsx
│   │   ├── AccessLogPage.jsx
│   │   └── NotFoundPage.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── NotificationContext.jsx
│   │   └── OfflineContext.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useOffline.js
│   │   └── useLocalStorage.js
│   ├── utils/
│   │   ├── constants.js
│   │   ├── validation.js
│   │   ├── formatters.js
│   │   └── indexedDB.js
│   ├── styles/
│   │   ├── index.css
│   │   └── tailwind.css
│   ├── App.jsx
│   ├── index.js
│   └── registerServiceWorker.js
└── package.json
```

### package.json
```json
{
  "name": "urbanentry-frontend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.2",
    "date-fns": "^2.30.0",
    "tailwindcss": "^3.3.6",
    "idb": "^7.1.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": ["react-app"]
  },
  "browserslist": {
    "production": [">0.2%", "not dead", "not op_mini all"],
    "development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
  }
}
```

### public/manifest.json (PWA)
```json
{
  "short_name": "UrbanEntry",
  "name": "UrbanEntry - Gestión de Accesos",
  "description": "Sistema de gestión de accesos para condominios",
  "icons": [
    {
      "src": "icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#1565C0",
  "background_color": "#FFFFFF",
  "orientation": "portrait-primary"
}
```

### src/api/axios.js
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### src/context/AuthContext.jsx
```javascript
import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          // Token válido
          const userData = JSON.parse(localStorage.getItem('user'));
          setUser(userData);
        } else {
          // Token expirado
          logout();
        }
      } catch (error) {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Service Worker - Offline First
```javascript
// public/service-worker.js
const CACHE_NAME = 'urbanentry-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json'
];

// Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch - Network First, fallback to Cache
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    // API requests: Network first
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone and cache
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Fallback to cache
          return caches.match(event.request);
        })
    );
  } else {
    // Static files: Cache first
    event.respondWith(
      caches.match(event.request)
        .then((response) => response || fetch(event.request))
    );
  }
});
```

---

## 📊 Scripts de Base de Datos

### database/schema.sql
Ver contenido completo en [docs/DATABASE.md](../docs/DATABASE.md)

### database/seed.sql
```sql
-- Insertar Super Admin inicial
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
VALUES ('admin@urbanentry.local', 
        '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYKxW5e8K3.', -- Admin123!
        'Super', 'Admin', 'ROLE_SUPER', TRUE);

-- Insertar Oficial de Seguridad
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
VALUES ('oficial@urbanentry.local',
        '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYKxW5e8K3.', -- Oficial123!
        'Oficial', 'Seguridad', 'ROLE_OFFICER', TRUE);
```

---

## 🚀 Guía de Despliegue

### 1. Preparación del Servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Java 17
sudo apt install openjdk-17-jdk -y

# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Instalar Nginx
sudo apt install nginx -y

# Instalar Certbot (SSL)
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Configurar Base de Datos

```bash
sudo -u postgres psql

CREATE DATABASE urbanentry_db;
CREATE USER urbanentry_user WITH PASSWORD 'strong_password_here';
GRANT ALL PRIVILEGES ON DATABASE urbanentry_db TO urbanentry_user;
\q

# Ejecutar schema
psql -U urbanentry_user -d urbanentry_db -f database/schema.sql
psql -U urbanentry_user -d urbanentry_db -f database/seed.sql
```

### 3. Desplegar Backend

```bash
# Compilar
cd backend
mvn clean package -DskipTests

# Copiar JAR
sudo cp target/urbanentry-backend.jar /opt/urbanentry/

# Crear servicio systemd
sudo nano /etc/systemd/system/urbanentry.service
```

Contenido:
```ini
[Unit]
Description=UrbanEntry Backend
After=postgresql.service

[Service]
Type=simple
User=urbanentry
ExecStart=/usr/bin/java -jar /opt/urbanentry/urbanentry-backend.jar --spring.profiles.active=prod
SuccessExitStatus=143
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Iniciar servicio
sudo systemctl daemon-reload
sudo systemctl enable urbanentry
sudo systemctl start urbanentry
```

### 4. Desplegar Frontend

```bash
cd frontend
npm run build

sudo cp -r build/* /var/www/urbanentry/
```

### 5. Configurar Nginx

```bash
sudo nano /etc/nginx/sites-available/urbanentry
```

Ver [deployment/nginx.conf](../deployment/nginx.conf) para contenido completo.

```bash
sudo ln -s /etc/nginx/sites-available/urbanentry /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. Configurar SSL

```bash
sudo certbot --nginx -d yourdomain.com
```

---

## 📚 Próximos Pasos

1. **Completar implementación de DTOs** (15 archivos aprox.)
2. **Implementar todos los servicios** (7 archivos)
3. **Implementar controllers REST** (7 archivos)
4. **Crear frontend React completo** (30+ archivos)
5. **Implementar Service Worker avanzado**
6. **Testing unitario e integración**
7. **Documentación de API con Swagger**
8. **Scripts de deployment automatizados**

---

## 🤝 Contribuciones

Ver [README.md](../README.md) para guía de contribución.

## 📞 Soporte

- Email: soporte@urbanentry.local
- GitHub: [Issues](https://github.com/johanAraya1/UrbanEntry/issues)

---

**UrbanEntry** - Gestión de accesos inteligente 🏢🔐

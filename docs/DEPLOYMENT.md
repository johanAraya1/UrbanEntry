# UrbanEntry - Guía de Despliegue en Producción

## 🎯 Prerequisitos

### Hardware Mínimo
- **CPU**: 4 cores
- **RAM**: 8GB
- **Disco**: 100GB SSD
- **Red**: Conexión Ethernet estable

### Software Requerido
- Ubuntu Server 22.04 LTS (o similar)
- Java 17 (OpenJDK)
- PostgreSQL 15
- Nginx
- Certbot (Let's Encrypt)

---

## 📋 Paso 1: Preparación del Servidor

### 1.1 Actualizar Sistema

```bash
sudo apt update && sudo apt upgrade -y
sudo reboot
```

### 1.2 Instalar Dependencias

```bash
# Java 17
sudo apt install openjdk-17-jdk -y
java -version

# PostgreSQL 15
sudo apt install postgresql postgresql-contrib -y
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Nginx
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx

# Certbot (SSL)
sudo apt install certbot python3-certbot-nginx -y

# Git (para clonar repo)
sudo apt install git -y

# Node.js 18 (para compilar frontend)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y
node --version
npm --version

# Maven (para compilar backend)
sudo apt install maven -y
mvn -version
```

---

## 📊 Paso 2: Configurar Base de Datos

### 2.1 Crear Usuario y Base de Datos

```bash
sudo -u postgres psql
```

```sql
-- En el prompt de PostgreSQL:
CREATE DATABASE urbanentry_db;
CREATE USER urbanentry_user WITH PASSWORD 'TU_PASSWORD_SEGURO_AQUI';
GRANT ALL PRIVILEGES ON DATABASE urbanentry_db TO urbanentry_user;

-- Dar permisos adicionales en PostgreSQL 15+
\c urbanentry_db
GRANT ALL ON SCHEMA public TO urbanentry_user;
\q
```

### 2.2 Ejecutar Schema

```bash
cd ~/UrbanEntry/database
psql -U urbanentry_user -d urbanentry_db -f schema.sql
psql -U urbanentry_user -d urbanentry_db -f seed.sql
```

### 2.3 Configurar PostgreSQL para Conexión Local

```bash
sudo nano /etc/postgresql/15/main/pg_hba.conf
```

Agregar línea:
```
host    urbanentry_db    urbanentry_user    127.0.0.1/32    md5
```

```bash
sudo systemctl restart postgresql
```

---

## 🔧 Paso 3: Configurar Variables de Entorno

### 3.1 Crear Archivo de Configuración

```bash
sudo mkdir -p /opt/urbanentry
sudo nano /opt/urbanentry/.env
```

Contenido:
```bash
# Base de Datos
DB_URL=jdbc:postgresql://localhost:5432/urbanentry_db
DB_USERNAME=urbanentry_user
DB_PASSWORD=tu_password_seguro

# JWT (DEBE ser único y secreto)
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')

# CORS
CORS_ORIGINS=https://tudominio.com,https://www.tudominio.com

# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=tu_email@gmail.com
MAIL_PASSWORD=tu_app_password
MAIL_FROM=noreply@tudominio.com
```

---

## 🏗️ Paso 4: Compilar Aplicación

### 4.1 Clonar Repositorio

```bash
cd ~
git clone https://github.com/johanAraya1/UrbanEntry.git
cd UrbanEntry
```

### 4.2 Compilar Backend

```bash
cd backend

# Editar application-prod.properties con tus valores
nano src/main/resources/application-prod.properties

# Compilar
mvn clean package -DskipTests

# Verificar JAR
ls -lh target/urbanentry-backend.jar
```

### 4.3 Compilar Frontend

```bash
cd ../frontend

# Instalar dependencias
npm install

# Configurar API URL
echo "REACT_APP_API_URL=https://tudominio.com/api" > .env.production

# Compilar
npm run build

# Verificar build
ls -lh build/
```

---

## 🚀 Paso 5: Desplegar Aplicación

### Opción A: Despliegue Automatizado

```bash
cd ~/UrbanEntry
chmod +x deployment/deploy.sh
sudo ./deployment/deploy.sh
```

### Opción B: Despliegue Manual

#### 5.1 Crear Usuario de Sistema

```bash
sudo useradd -r -s /bin/false urbanentry
```

#### 5.2 Desplegar Backend

```bash
sudo mkdir -p /opt/urbanentry/logs
sudo cp backend/target/urbanentry-backend.jar /opt/urbanentry/
sudo chown -R urbanentry:urbanentry /opt/urbanentry
sudo chmod 755 /opt/urbanentry/urbanentry-backend.jar
```

#### 5.3 Configurar Servicio Systemd

```bash
sudo cp deployment/urbanentry.service /etc/systemd/system/
sudo nano /etc/systemd/system/urbanentry.service
# Editar variables de entorno

sudo systemctl daemon-reload
sudo systemctl enable urbanentry
sudo systemctl start urbanentry
sudo systemctl status urbanentry
```

#### 5.4 Desplegar Frontend

```bash
sudo mkdir -p /var/www/urbanentry
sudo cp -r frontend/build/* /var/www/urbanentry/
sudo chown -R www-data:www-data /var/www/urbanentry
```

---

## 🌐 Paso 6: Configurar Nginx

### 6.1 Configurar Dominio (con SSL)

```bash
# Copiar configuración
sudo cp deployment/nginx.conf /etc/nginx/sites-available/urbanentry

# Editar con tu dominio
sudo nano /etc/nginx/sites-available/urbanentry
# Cambiar "yourdomain.com" por tu dominio real

# Activar sitio
sudo ln -s /etc/nginx/sites-available/urbanentry /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Recargar Nginx
sudo systemctl reload nginx
```

### 6.2 Obtener Certificado SSL

```bash
# Con Let's Encrypt (dominio público)
sudo certbot --nginx -d tudominio.com -d www.tudominio.com

# El certificado se renovará automáticamente
sudo certbot renew --dry-run
```

### 6.3 Certificado Autofirmado (solo LAN)

```bash
# Si NO tienes dominio público, usar certificado autofirmado
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/urbanentry-selfsigned.key \
  -out /etc/ssl/certs/urbanentry-selfsigned.crt

# Editar nginx.conf para usar estos certificados
```

---

## 🔥 Paso 7: Configurar Firewall

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
sudo ufw status
```

---

## 📊 Paso 8: Verificar Despliegue

### 8.1 Verificar Backend

```bash
# Estado del servicio
sudo systemctl status urbanentry

# Logs en tiempo real
sudo journalctl -u urbanentry -f

# Health check
curl http://localhost:8080/actuator/health
```

### 8.2 Verificar Frontend

```bash
# Verificar archivos
ls -la /var/www/urbanentry/

# Test Nginx
curl -I http://localhost
```

### 8.3 Verificar desde Navegador

```
https://tudominio.com
```

Deberías ver la pantalla de login de UrbanEntry.

**Credenciales por defecto:**
- Email: `admin@urbanentry.local`
- Password: `Admin123!`

---

## 💾 Paso 9: Configurar Backups Automáticos

### 9.1 Script de Backup

```bash
chmod +x deployment/backup.sh

# Probar manualmente
sudo ./deployment/backup.sh
```

### 9.2 Cron Job (Backup Diario a las 2 AM)

```bash
sudo crontab -e
```

Agregar:
```bash
0 2 * * * /home/ubuntu/UrbanEntry/deployment/backup.sh >> /var/log/urbanentry-backup.log 2>&1
```

---

## 🔧 Paso 10: Configuración Post-Despliegue

### 10.1 Cambiar Passwords por Defecto

```sql
-- Conectar a la BD
psql -U urbanentry_user -d urbanentry_db

-- Generar nuevo hash (usar herramienta BCrypt online)
UPDATE users 
SET password_hash = '$2a$12$NUEVO_HASH_AQUI'
WHERE email = 'admin@urbanentry.local';
```

### 10.2 Configurar Email

Editar variables de entorno del servicio:
```bash
sudo nano /etc/systemd/system/urbanentry.service
```

Agregar credenciales SMTP reales.

### 10.3 Configurar IP Estática (Opcional)

```bash
sudo nano /etc/netplan/00-installer-config.yaml
```

```yaml
network:
  version: 2
  ethernets:
    eth0:
      dhcp4: no
      addresses:
        - 192.168.1.100/24
      gateway4: 192.168.1.1
      nameservers:
        addresses: [8.8.8.8, 8.8.4.4]
```

```bash
sudo netplan apply
```

---

## 🎮 Comandos Útiles

### Gestión del Servicio

```bash
# Iniciar
sudo systemctl start urbanentry

# Detener
sudo systemctl stop urbanentry

# Reiniciar
sudo systemctl restart urbanentry

# Ver estado
sudo systemctl status urbanentry

# Ver logs
sudo journalctl -u urbanentry -n 100
sudo journalctl -u urbanentry -f  # Tiempo real
```

### Gestión de Base de Datos

```bash
# Backup manual
sudo -u postgres pg_dump -F c urbanentry_db > backup.dump

# Restaurar
sudo -u postgres pg_restore -d urbanentry_db backup.dump

# Conectar a BD
psql -U urbanentry_user -d urbanentry_db
```

### Gestión de Nginx

```bash
# Verificar configuración
sudo nginx -t

# Recargar
sudo systemctl reload nginx

# Reiniciar
sudo systemctl restart nginx

# Logs
sudo tail -f /var/log/nginx/urbanentry-access.log
sudo tail -f /var/log/nginx/urbanentry-error.log
```

---

## 🚨 Troubleshooting

### Backend no inicia

```bash
# Ver logs detallados
sudo journalctl -u urbanentry -xe

# Verificar puerto
sudo netstat -tulpn | grep 8080

# Verificar conexión a BD
psql -U urbanentry_user -d urbanentry_db -c "SELECT 1;"
```

### Frontend no carga

```bash
# Verificar archivos
ls -la /var/www/urbanentry/

# Verificar permisos
sudo chown -R www-data:www-data /var/www/urbanentry

# Verificar Nginx
sudo nginx -t
sudo systemctl status nginx
```

### Error de Base de Datos

```bash
# Verificar PostgreSQL
sudo systemctl status postgresql

# Ver logs de PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-15-main.log

# Verificar conexión
psql -U urbanentry_user -d urbanentry_db
```

### SSL no funciona

```bash
# Re-generar certificado
sudo certbot --nginx -d tudominio.com --force-renewal

# Verificar certificados
sudo certbot certificates
```

---

## 📊 Monitoreo

### Logs Importantes

```bash
# Backend
sudo journalctl -u urbanentry -f

# Nginx Access
sudo tail -f /var/log/nginx/urbanentry-access.log

# Nginx Errors
sudo tail -f /var/log/nginx/urbanentry-error.log

# PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

### Health Checks

```bash
# Backend
curl http://localhost:8080/actuator/health

# Frontend
curl -I https://tudominio.com

# Database
psql -U urbanentry_user -d urbanentry_db -c "SELECT COUNT(*) FROM users;"
```

---

## 🔄 Actualización de la Aplicación

```bash
cd ~/UrbanEntry
git pull origin main

# Recompilar backend
cd backend
mvn clean package -DskipTests

# Recompilar frontend
cd ../frontend
npm run build

# Redesplegar
cd ..
sudo ./deployment/deploy.sh
```

---

## 📞 Soporte

- **Email**: soporte@urbanentry.local
- **GitHub Issues**: https://github.com/johanAraya1/UrbanEntry/issues
- **Documentación**: https://github.com/johanAraya1/UrbanEntry/wiki

---

**¡Despliegue Completado! 🎉**  
**UrbanEntry** está listo para gestionar los accesos de tu condominio.

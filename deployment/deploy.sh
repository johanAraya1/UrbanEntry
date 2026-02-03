#!/bin/bash

#================================================
# UrbanEntry - Script de Despliegue Automatizado
#================================================

set -e  # Exit on error

echo "╔════════════════════════════════════════╗"
echo "║   UrbanEntry - Deployment Script      ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Variables de configuración
BACKEND_JAR="backend/target/urbanentry-backend.jar"
FRONTEND_BUILD="frontend/build"
DEPLOY_DIR="/opt/urbanentry"
WEB_DIR="/var/www/urbanentry"
SERVICE_NAME="urbanentry"
USER="urbanentry"

# Verificar que se ejecuta como root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Este script debe ejecutarse como root (sudo)"
    exit 1
fi

# Función para verificar archivos
check_files() {
    echo "📋 Verificando archivos..."
    
    if [ ! -f "$BACKEND_JAR" ]; then
        echo "❌ Backend JAR no encontrado: $BACKEND_JAR"
        echo "   Ejecuta: cd backend && mvn clean package"
        exit 1
    fi
    
    if [ ! -d "$FRONTEND_BUILD" ]; then
        echo "❌ Frontend build no encontrado: $FRONTEND_BUILD"
        echo "   Ejecuta: cd frontend && npm run build"
        exit 1
    fi
    
    echo "✅ Archivos verificados"
}

# Crear usuario de sistema
create_user() {
    if id "$USER" &>/dev/null; then
        echo "✅ Usuario $USER ya existe"
    else
        echo "👤 Creando usuario $USER..."
        useradd -r -s /bin/false "$USER"
        echo "✅ Usuario creado"
    fi
}

# Crear directorios
create_directories() {
    echo "📁 Creando directorios..."
    
    mkdir -p "$DEPLOY_DIR"
    mkdir -p "$DEPLOY_DIR/logs"
    mkdir -p "$WEB_DIR"
    
    echo "✅ Directorios creados"
}

# Detener servicio anterior
stop_service() {
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        echo "⏸️  Deteniendo servicio anterior..."
        systemctl stop "$SERVICE_NAME"
        echo "✅ Servicio detenido"
    else
        echo "ℹ️  Servicio no estaba corriendo"
    fi
}

# Backup de versión anterior
backup_previous() {
    if [ -f "$DEPLOY_DIR/urbanentry-backend.jar" ]; then
        echo "💾 Creando backup de versión anterior..."
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        cp "$DEPLOY_DIR/urbanentry-backend.jar" "$DEPLOY_DIR/urbanentry-backend.jar.$TIMESTAMP"
        echo "✅ Backup creado: urbanentry-backend.jar.$TIMESTAMP"
    fi
}

# Desplegar backend
deploy_backend() {
    echo "🚀 Desplegando backend..."
    
    cp "$BACKEND_JAR" "$DEPLOY_DIR/urbanentry-backend.jar"
    chown -R "$USER:$USER" "$DEPLOY_DIR"
    chmod 755 "$DEPLOY_DIR/urbanentry-backend.jar"
    
    echo "✅ Backend desplegado"
}

# Desplegar frontend
deploy_frontend() {
    echo "🚀 Desplegando frontend..."
    
    rm -rf "$WEB_DIR"/*
    cp -r "$FRONTEND_BUILD"/* "$WEB_DIR/"
    chown -R www-data:www-data "$WEB_DIR"
    
    echo "✅ Frontend desplegado"
}

# Instalar servicio systemd
install_service() {
    echo "⚙️  Instalando servicio systemd..."
    
    if [ -f "deployment/urbanentry.service" ]; then
        cp deployment/urbanentry.service /etc/systemd/system/
        systemctl daemon-reload
        systemctl enable "$SERVICE_NAME"
        echo "✅ Servicio instalado"
    else
        echo "⚠️  Archivo urbanentry.service no encontrado"
    fi
}

# Configurar Nginx
configure_nginx() {
    echo "🌐 Configurando Nginx..."
    
    if [ -f "deployment/nginx.conf" ]; then
        cp deployment/nginx.conf /etc/nginx/sites-available/urbanentry
        ln -sf /etc/nginx/sites-available/urbanentry /etc/nginx/sites-enabled/
        
        # Test configuración
        if nginx -t; then
            systemctl reload nginx
            echo "✅ Nginx configurado"
        else
            echo "❌ Error en configuración de Nginx"
            exit 1
        fi
    else
        echo "⚠️  Archivo nginx.conf no encontrado"
    fi
}

# Iniciar servicio
start_service() {
    echo "▶️  Iniciando servicio..."
    
    systemctl start "$SERVICE_NAME"
    sleep 3
    
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        echo "✅ Servicio iniciado correctamente"
    else
        echo "❌ Error al iniciar servicio"
        journalctl -u "$SERVICE_NAME" -n 50
        exit 1
    fi
}

# Verificar health
check_health() {
    echo "🏥 Verificando salud de la aplicación..."
    
    for i in {1..10}; do
        if curl -f http://localhost:8080/actuator/health &>/dev/null; then
            echo "✅ Aplicación respondiendo correctamente"
            return 0
        fi
        echo "   Intento $i/10..."
        sleep 2
    done
    
    echo "❌ La aplicación no responde"
    journalctl -u "$SERVICE_NAME" -n 30
    exit 1
}

# Mostrar status
show_status() {
    echo ""
    echo "╔════════════════════════════════════════╗"
    echo "║       Despliegue Completado            ║"
    echo "╚════════════════════════════════════════╝"
    echo ""
    echo "📊 Estado del servicio:"
    systemctl status "$SERVICE_NAME" --no-pager -l
    echo ""
    echo "🌐 URLs:"
    echo "   Backend:  http://localhost:8080/api"
    echo "   Frontend: http://localhost (via Nginx)"
    echo ""
    echo "📝 Logs:"
    echo "   journalctl -u $SERVICE_NAME -f"
    echo "   tail -f /var/log/nginx/urbanentry-error.log"
    echo ""
}

# Menú principal
main() {
    check_files
    create_user
    create_directories
    stop_service
    backup_previous
    deploy_backend
    deploy_frontend
    install_service
    configure_nginx
    start_service
    check_health
    show_status
}

# Ejecutar
main

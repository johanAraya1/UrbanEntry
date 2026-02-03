#!/bin/bash

#================================================
# UrbanEntry - Script de Backup Automatizado
#================================================

set -e

# Configuración
BACKUP_DIR="/var/backups/urbanentry"
DB_NAME="urbanentry_db"
DB_USER="urbanentry_user"
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Crear directorio de backups
mkdir -p "$BACKUP_DIR"

echo "╔════════════════════════════════════════╗"
echo "║   UrbanEntry - Backup Process          ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Backup de Base de Datos
echo "💾 Creando backup de base de datos..."
pg_dump -U "$DB_USER" -F c -b -v -f "$BACKUP_DIR/db_backup_$TIMESTAMP.dump" "$DB_NAME"
echo "✅ Backup de BD completado"

# Backup de archivos de aplicación (opcional)
echo "💾 Creando backup de aplicación..."
tar -czf "$BACKUP_DIR/app_backup_$TIMESTAMP.tar.gz" \
    -C /opt/urbanentry \
    --exclude='logs' \
    .
echo "✅ Backup de aplicación completado"

# Backup de configuración Nginx
echo "💾 Creando backup de configuración..."
cp /etc/nginx/sites-available/urbanentry "$BACKUP_DIR/nginx_config_$TIMESTAMP.conf"
echo "✅ Backup de configuración completado"

# Limpiar backups antiguos
echo "🗑️  Limpiando backups antiguos (>$RETENTION_DAYS días)..."
find "$BACKUP_DIR" -name "*.dump" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.conf" -mtime +$RETENTION_DAYS -delete
echo "✅ Limpieza completada"

# Resumen
echo ""
echo "╔════════════════════════════════════════╗"
echo "║       Backup Completado                ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "📁 Ubicación: $BACKUP_DIR"
echo "📊 Archivos creados:"
ls -lh "$BACKUP_DIR/*$TIMESTAMP*"
echo ""
echo "💡 Para restaurar:"
echo "   pg_restore -U $DB_USER -d $DB_NAME $BACKUP_DIR/db_backup_$TIMESTAMP.dump"
echo ""

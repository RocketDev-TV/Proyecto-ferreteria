# 🚀 Guía de Despliegue en Sitio - Ferretería Cochi

Esta guía es de uso exclusivo para el DevOps (tú). Sigue estos pasos en la PC de Cochi para dejar el sistema corriendo como un servicio nativo, sin que él tenga que tocar comandos nunca.

## PASO 0: Preparación de la Máquina Windows (La Infra)

Antes de mover archivos, asegúrate de que la PC de Cochi soporte y tenga configurado Docker:
1. **Virtualización Activa:** Revisa en el Administrador de Tareas > Rendimiento > CPU ("Virtualización: Habilitado").
2. **Instalar WSL2:** Abre PowerShell como Administrador y corre `wsl --install`. (Reinicia la PC si es necesario).
3. **Instalar Docker Desktop:** Descárgalo e instálalo.
4. **Configurar Auto-Arranque (¡CRÍTICO!):** 
   - Abre Docker Desktop.
   - Ve al engranaje (Settings) > **General**.
   - Marca la casilla **"Start Docker Desktop when you sign in"**. 
   - Con esto, al prender la PC, el servidor arranca solo.

## PASO 1: Archivos y Configuración (.env)

1. Pasa la carpeta completa del proyecto a la PC (ej. `C:\Sistemas\FerreteriaCochi`).
2. Crea manualmente la carpeta `db/backups` si no existe (para evitar errores de permisos de volumen de Docker).
3. Crea el archivo `.env` en la raíz del proyecto y pega **EXACTAMENTE** esto (ya corregido para Docker):

```ini
# ----------------------------------------------------------------
# CONFIGURACIÓN LOCAL (DOCKER)
# ----------------------------------------------------------------
# La DB apunta al hostname 'db', no a localhost, para que los contenedores se vean
DB_URL=jdbc:postgresql://db:5432/ferreteria_db
DB_USER=postgres
DB_PASSWORD=rootpassword
DB_NAME=ferreteria_db

# URL para que React encuentre a Spring Boot (Aquí sí va localhost)
VITE_API_URL=http://localhost:8080

# Configuración de Puertos (Expuestos hacia la PC de Cochi)
SPRING_PORT=8080
FRONT_PORT=5173
```


## PASO 2: Levantar el Sistema 
Abre PowerShell en la carpeta del proyecto y ejecuta la magia:

PowerShell
```
docker compose up -d --build
Tardará unos minutos la primera vez descargando imágenes de Node, Java y Postgres.
```

Verificación Rápida:

PowerShell
docker compose ps
Asegúrate de que los 4 contenedores digan Up. Si el backend se está reiniciando, dale 1 minuto; suele pasar mientras Postgres termina de correr tu script_inicial.sql.

## PASO 3: El Toque Final (El Acceso Directo Modo App)
Cochi es usuario final, no necesita ver URLs ni navegadores. Ármale un acceso directo en el escritorio que abra el sistema como si fuera un programa de escritorio independiente.

En la misma ventana de PowerShell, pega y ejecuta este bloque completo:

PowerShell
```
$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$Home\Desktop\Punto de Venta Ferreteria-150.lnk")
$Shortcut.TargetPath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$Shortcut.Arguments = "--app=http://localhost:5173"
$Shortcut.IconLocation = "C:\Program Files\Google\Chrome\Application\chrome.exe, 0"
$Shortcut.Save()
```
Listo. Verás un icono en el escritorio de Cochi. Al darle doble clic, abre el frontend a pantalla limpia.

## PASO 4: Pruebas de Humo (Checklist antes de irte)
Haz doble clic en el acceso directo nuevo y prueba lo siguiente:

[ ] Login Exitoso: Entra con admin_master / admin123.

[ ] Conexión a BD: Ve al Catálogo de Inventario y verifica que carguen los productos de prueba.

[ ] Flujo de Venta: Ve al POS, agrega 1 "Martillo", cóbralo y verifica que el stock haya bajado.

[ ] Reinicio (La Prueba de Fuego): Reinicia la computadora de Cochi por completo. Al encender, dale unos segundos, abre el acceso directo y verifica que el sistema haya levantado solo sin tocar nada.

🛠️ Botiquín de Emergencias (Troubleshooting)
¿CORS Error o "Failed to fetch" al loguearse?
Significa que React no encuentra el backend. Verifica que en el .env esté VITE_API_URL=http://localhost:8080 y vuelve a correr docker compose up -d --build frontend.

¿Spring Boot no conecta a la DB?
Verifica logs con docker compose logs -f backend. Si dice "Connection refused", revisa que tu .env tenga DB_URL=jdbc:postgresql://db:5432/ferreteria_db.

¿Puerto 8080 o 5173 ocupado?
Busca quién lo tiene con netstat -ano | findstr :8080. Toma el PID y mátalo con taskkill /PID X /F.

¿Necesitas resetearle la BD de cero?

PowerShell
docker compose down -v
docker compose up -d
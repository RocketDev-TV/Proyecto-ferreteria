# 🛠️ Ferretería Cochi - POS & Inventory System

Sistema de Punto de Venta (POS) y Gestión de Almacén diseñado específicamente para optimizar el control de inventarios, flujo de caja y análisis de inteligencia de negocios (BI) de una ferretería.

Este sistema implementa un modelo de datos robusto con control de lotes y un algoritmo de costeo **PEPS (Primeras Entradas, Primeras Salidas)** para garantizar que los márgenes de utilidad calculados en los reportes de BI sean 100% exactos frente a la fluctuación de precios de los proveedores.

---

## 💻 Stack Tecnológico

**Arquitectura General:** Patrón MVC (Modelo-Vista-Controlador) Desacoplado.

*   **Backend:** Java / Spring Boot 
    *   *Seguridad:* Spring Security con JWT y encriptación BCrypt para contraseñas.
    *   *Persistencia:* Spring Data JPA / Hibernate.
*   **Frontend:** React (SPA)
    *   *Gestión de estado:* (Redux o Context API para el carrito de compras temporal).
*   **Base de Datos:** PostgreSQL (Hosteado vía Supabase)
*   **Control de Versiones y Despliegue:** Git, GitHub, Docker (para contenerización local/producción).

---

## 🏗️ Estructura del Proyecto

El proyecto está dividido en dos grandes ecosistemas para mantener la escalabilidad y facilitar el trabajo concurrente.

### 1. Sistema Backend (`/backend-spring`)
```text
src/main/java/com/ferreteria/cochi/
├── config/         # Configuraciones de CORS, JWT y Spring Security
├── controllers/    # Endpoints REST (Auth, Ventas, Productos, Almacen)
├── dtos/           # Objetos de transferencia de datos (Ej. Carrito de Ventas)
├── entities/       # Modelos JPA mapeados a la BD (Usuarios, Productos, Lotes)
├── repositories/   # Interfaces de acceso a datos (Spring Data)
├── services/       # Lógica de negocio (Algoritmo PEPS, transaccionalidad)
└── utils/          # Helpers, generadores de reportes, etc.
```

### 2. Sistema Frontend (/frontend-react)
```text
src/
├── assets/         # Imágenes, iconos y estilos globales
├── components/     # Componentes reutilizables (Botones, Tablas, Modales)
├── context/        # Manejo de sesión global y estado del carrito
├── hooks/          # Custom hooks para llamadas a la API
├── pages/          # Vistas principales (Dashboard, PuntoDeVenta, Inventario)
└── services/       # Configuraciones de Axios/Fetch apuntando al Backend
```

## 📦 Módulos Principales
1. Módulo de Seguridad y Accesos:
* Autenticación de Usuarios (Administrador vs. Vendedor).

2. Módulo de Catálogos:
* Gestión (CRUD) de Productos, Categorías y Proveedores.

3. Módulo de Almacén (Kardex):
* Registro de entradas por Lote para rastrear el costo unitario de compra y la fecha exacta de ingreso.

4. Módulo de Ventas (POS):
* Carrito de compras en memoria.
* Checkout transaccional con descuento automático de stock aplicando lógica PEPS.

5. Módulo de Business Intelligence (BI):
* Historial de ventas.
* Cálculo de márgenes de utilidad reales cruzando el precio de venta vs. el costo histórico del lote despachado.

## 🚀 Instalación y Entorno Local
1. Clonar el repositorio:
```Bash
git clone [https://github.com/tu-usuario/ferreteria-cochi.git](https://github.com/tu-usuario/ferreteria-cochi.git)
```

2. Configurar la Base de Datos:
Correr el script inicial database_schema.sql en tu instancia de PostgreSQL o Supabase.

3. Levantar el Backend:
Navegar a la carpeta del backend.
Configurar las variables de entorno en application.properties (URI de la BD, JWT Secret).
Ejecutar mediante Maven/Gradle.

4. Levantar el Frontend:

Navegar a la carpeta del frontend.
Ejecutar npm install y posteriormente npm run dev.

## 👥 Equipo de Desarrollo:
Aldo Alvarez
Ignacio Herrera

Hecho con ☕, código y algo de indie rock punk alternativo en la CDMX.
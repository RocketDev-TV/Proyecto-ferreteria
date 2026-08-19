# 🛠️ Ferretería Cochi - POS & Inventory System

<div align="center">
  <img src="https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java" />
  <img src="https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E" alt="Supabase" />
  <img src="https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
</div>

Sistema de Punto de Venta (POS) y Gestión de Almacén diseñado específicamente para optimizar el control de inventarios, flujo de caja y análisis de inteligencia de negocios (BI) de una ferretería.

Este sistema implementa un modelo de datos robusto con control de lotes y un algoritmo de costeo **PEPS (Primeras Entradas, Primeras Salidas)** para garantizar que los márgenes de utilidad calculados en los reportes de BI sean 100% exactos frente a la fluctuación de precios de los proveedores.

---

## 💻 Stack Tecnológico

**Arquitectura General:** Patrón API RESTful Desacoplada (Frontend / Backend).

*   **Backend:** Java 21 / Spring Boot 3+
    *   *Seguridad:* Spring Security con JWT (JSON Web Tokens) y encriptación BCrypt.
    *   *Persistencia:* Spring Data JPA / PostgreSQL.
    *   *Ingeniería:* Uso extensivo de DTOs (Records), Paginación nativa, e Interceptores Globales de Excepciones (`@RestControllerAdvice`).
*   **Frontend:** React 19 + Vite (SPA)
    *   *Integración:* Consumo de API securizada mediante tokens JWT.
*   **Base de Datos:** PostgreSQL
*   **DevOps & Despliegue:** Docker, Docker Compose (con workers de backup automatizados).

---

## 🏗️ Estructura del Proyecto

El proyecto está dividido en dos grandes ecosistemas para mantener la escalabilidad y facilitar el trabajo concurrente.

### 1. Sistema Backend (`/backend`)
```text
src/main/java/com/ferreteria/ferreteria_backend/
├── controllers/    # Endpoints REST (Auth, Ventas, Productos, Almacen)
├── dto/            # Data Transfer Objects (Records para payloads ligeros y validados)
├── entities/       # Modelos JPA mapeados a la base de datos
├── exceptions/     # Manejo global de errores (Respuestas JSON limpias)
├── repositories/   # Interfaces de acceso a datos
├── security/       # Filtros JWT, Generador de Tokens y Configuración de Accesos
└── services/       # Lógica de negocio transaccional (Ej. InventarioService)
```

### 2. Sistema Frontend (/frontend-react)
```text
src/
├── assets/         # Imágenes, iconos y recursos estáticos
├── components/     # (Por implementar) Componentes UI reutilizables
├── pages/          # (Por implementar) Vistas principales (Login, POS, Dashboard)
└── App.jsx         # Punto de entrada y enrutador principal
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
* Correr el script inicial database_schema.sql en tu instancia de PostgreSQL o Supabase.

3. Levantar el Backend:
* Navegar a la carpeta del backend.
* Configurar las variables de entorno en application.properties (URI de la BD, JWT Secret).
* Ejecutar mediante Maven/Gradle.

4. Levantar el Frontend:
* Navegar a la carpeta del frontend.
* Ejecutar npm install y posteriormente npm run dev.

## 👥 Equipo de Desarrollo:
* Aldo Alvarez
* Ignacio Herrera

Hecho con ☕, código y algo de indie rock punk alternativo en la CDMX.
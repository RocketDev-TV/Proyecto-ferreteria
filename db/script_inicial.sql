-- 1. Catálogos Base
CREATE TABLE Roles (
    id_rol SERIAL PRIMARY KEY,
    tipo_rol VARCHAR(50) NOT NULL,
    descripcion VARCHAR(150)
);

CREATE TABLE Categorias (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(70) NOT NULL,
    descripcion VARCHAR(150) NOT NULL
);

CREATE TABLE Proveedores (
    id_proveedor SERIAL PRIMARY KEY,
    nombre VARCHAR(70) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    correo VARCHAR(100),
    direccion TEXT
);

-- 2. Usuarios
CREATE TABLE Usuarios (
    id_usuario SERIAL PRIMARY KEY,
    id_rol INT NOT NULL,
    nombre_completo VARCHAR(70) NOT NULL,
    nombre_usuario VARCHAR(70) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL, -- Aquí va a caer el hash de BCrypt
    CONSTRAINT fk_rol FOREIGN KEY (id_rol) REFERENCES Roles(id_rol)
);

-- 3. Productos (Catálogo Central)
CREATE TABLE Productos (
    id_producto SERIAL PRIMARY KEY,
    id_categoria INT NOT NULL,
    nombre VARCHAR(70) NOT NULL,
    descripcion TEXT,
    precio_venta_act NUMERIC(10,2) NOT NULL,
    stock_total NUMERIC(10,3) NOT NULL DEFAULT 0,
    CONSTRAINT fk_categoria FOREIGN KEY (id_categoria) REFERENCES Categorias(id_categoria)
);

-- 4. El Kardex / Lotes (El control de costos e inventario)
CREATE TABLE Lotes_Almacen (
    id_lote SERIAL PRIMARY KEY,
    id_producto INT NOT NULL,
    id_proveedor INT NOT NULL,
    cantidad_inicial NUMERIC(10,3) NOT NULL,
    cantidad_disponible NUMERIC(10,3) NOT NULL,
    precio_compra NUMERIC(10,2) NOT NULL,
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_producto_lote FOREIGN KEY (id_producto) REFERENCES Productos(id_producto),
    CONSTRAINT fk_proveedor_lote FOREIGN KEY (id_proveedor) REFERENCES Proveedores(id_proveedor)
);

-- 5. Ventas (Cabecera)
CREATE TABLE Historial_Ventas (
    id_venta SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    fecha_venta TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_venta NUMERIC(10,2) NOT NULL,
    CONSTRAINT fk_usuario_venta FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
);

-- 6. Detalle de Ventas (El motor de la analítica)
CREATE TABLE Detalle_Venta (
    id_detalle SERIAL PRIMARY KEY,
    id_venta INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad NUMERIC(10,3) NOT NULL,
    precio_unitario NUMERIC(10,2) NOT NULL,
    precio_compra_historico NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    CONSTRAINT fk_venta_detalle FOREIGN KEY (id_venta) REFERENCES Historial_Ventas(id_venta) ON DELETE CASCADE,
    CONSTRAINT fk_producto_detalle FOREIGN KEY (id_producto) REFERENCES Productos(id_producto)
);

-- ==========================================
-- INYECCIÓN DE DATOS DE PRUEBA (CATÁLOGOS)
-- ==========================================

-- Datos para Categorias
INSERT INTO Categorias (nombre, descripcion) VALUES 
('Herramienta Manual', 'Martillos, desarmadores, pinzas y llaves'),
('Herramienta Eléctrica', 'Taladros, esmeriladoras, sierras y pulidoras'),
('Pinturas y Solventes', 'Pinturas acrílicas, esmaltes, brochas y thinner'),
('Plomería', 'Tubos, conexiones, válvulas y grifería'),
('Material Eléctrico', 'Cables, focos, contactos y pastillas termomagnéticas');

-- Datos para Roles
INSERT INTO Roles (tipo_rol, descripcion) VALUES 
('ADMIN', 'Administrador total del sistema, acceso a Kárdex y reportes'),
('CAJERO', 'Encargado de punto de venta y atención a cliente'),
('ALMACENISTA', 'Encargado de recepción de lotes y control de stock');

-- Datos para Proveedores
INSERT INTO Proveedores (nombre, numero, correo, direccion) VALUES 
('Truper S.A. de C.V.', '555-123-4567', 'ventas@truper.com', 'Parque Industrial, CDMX'),
('Cemex', '555-987-6543', 'contacto@cemex.com', 'Av. Concreto 100, Monterrey'),
('Comex', '555-456-7890', 'distribucion@comex.com.mx', 'Plaza Colores, Guadalajara');

-- ==========================================
-- INYECCIÓN DE DATOS DE PRUEBA (TRANSACCIONAL)
-- ==========================================

-- Datos para Usuarios (Asignando el Rol 1: ADMIN)
-- Nota: La contraseña está en texto plano solo para pruebas locales, en prod iría el hash de BCrypt
INSERT INTO Usuarios (id_rol, nombre_completo, nombre_usuario, contrasena) VALUES 
(1, 'Administrador Principal', 'admin_master', 'admin123'),
(2, 'Juan Perez', 'cajero_juan', 'cajero123');

-- Datos para Productos (Asignando Categorías que ya existen)
INSERT INTO Productos (id_categoria, nombre, descripcion, precio_venta_act, stock_total) VALUES 
(1, 'Martillo de Uña Curva 16 oz', 'Martillo truper mango de fibra de vidrio', 185.50, 50.000),
(2, 'Taladro Percutor 1/2', 'Taladro profesional 600W', 850.00, 15.000),
(3, 'Pintura Blanca Vinílica 19L', 'Cubeta de pintura blanca para interiores', 1200.00, 10.000);

-- Datos para Lotes de Almacén (Simulando la entrada de mercancía de los proveedores)
INSERT INTO Lotes_Almacen (id_producto, id_proveedor, cantidad_inicial, cantidad_disponible, precio_compra) VALUES 
(1, 1, 50.000, 50.000, 120.00), -- Martillos surtidos por Truper
(3, 3, 10.000, 10.000, 800.00); -- Pinturas surtidas por Comex

-- Datos para Historial_Ventas (Un ticket de venta del cajero 2)
INSERT INTO Historial_Ventas (id_usuario, total_venta) VALUES 
(2, 1035.50);

-- Datos para Detalle_Venta (Lo que trae adentro el ticket anterior)
INSERT INTO Detalle_Venta (id_venta, id_producto, cantidad, precio_unitario, precio_compra_historico, subtotal) VALUES 
(1, 1, 1.000, 185.50, 120.00, 185.50), -- 1 Martillo
(1, 2, 1.000, 850.00, 600.00, 850.00); -- 1 Taladro
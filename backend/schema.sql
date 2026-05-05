PRAGMA foreign_keys = ON;

BEGIN TRANSACTION;

CREATE TABLE Rol (idRol INTEGER PRIMARY KEY AUTOINCREMENT, tipo VARCHAR(50) NOT NULL);
CREATE TABLE Proveedor (idProveedor INTEGER PRIMARY KEY AUTOINCREMENT, nombre VARCHAR(150), telefono VARCHAR(15), email VARCHAR(100));
CREATE TABLE Temporada (idTemporada INTEGER PRIMARY KEY AUTOINCREMENT, nombre VARCHAR(100), fecha_inicio DATE, fecha_fin DATE, estado TEXT CHECK(estado IN ('activa', 'inactiva')));
CREATE TABLE Categoria (idCategoria INTEGER PRIMARY KEY AUTOINCREMENT, nombre VARCHAR(100));

CREATE TABLE Usuario (idUsuario INTEGER PRIMARY KEY AUTOINCREMENT, nombre VARCHAR(100), apellido VARCHAR(100), nombreUsuario VARCHAR(50) UNIQUE, contrasena VARCHAR(255), estado TEXT CHECK(estado IN ('activo', 'inactivo')), fechaRegistro DATETIME, idRol INTEGER, FOREIGN KEY (idRol) REFERENCES Rol(idRol));
CREATE TABLE Producto (idProducto INTEGER PRIMARY KEY AUTOINCREMENT, nombre VARCHAR(200), precioVenta DECIMAL(10, 2), stockActual INTEGER, stockMinimo INTEGER, fechaRegistro DATETIME, estado TEXT CHECK(estado IN ('activo', 'inactivo')), idCategoria INTEGER, idTemporada INTEGER, FOREIGN KEY (idCategoria) REFERENCES Categoria(idCategoria), FOREIGN KEY (idTemporada) REFERENCES Temporada(idTemporada));
CREATE TABLE EquipoCyber (idEquipo INTEGER PRIMARY KEY AUTOINCREMENT, numero INTEGER UNIQUE, estado TEXT CHECK(estado IN ('disponible', 'en_uso', 'fuera_de_servicio')), tiempo_transcurrido INTEGER, idUsuario INTEGER, FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario));

CREATE TABLE Proveedor_Producto (idProveedor INTEGER, idProducto INTEGER, precioCompra DECIMAL(10, 2), PRIMARY KEY (idProveedor, idProducto), FOREIGN KEY (idProveedor) REFERENCES Proveedor(idProveedor), FOREIGN KEY (idProducto) REFERENCES Producto(idProducto));
CREATE TABLE Caja (idCaja INTEGER PRIMARY KEY AUTOINCREMENT, fecha DATE, horaApertura TIME, horaCierre TIME, montoInicial DECIMAL(10, 2), montoFinal DECIMAL(10, 2), total_ventas_calculado DECIMAL(10, 2), diferencia DECIMAL(10, 2), estado TEXT CHECK(estado IN ('abierta', 'cerrada')), idUsuario INTEGER, FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario));
CREATE TABLE Venta (idVenta INTEGER PRIMARY KEY AUTOINCREMENT, fecha DATE, hora TIME, total DECIMAL(10, 2), tipo_venta TEXT CHECK(tipo_venta IN ('producto', 'cyber')), idUsuario INTEGER, FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario));
CREATE TABLE ventaCyber (idVentaCyber INTEGER PRIMARY KEY AUTOINCREMENT, costo_calculado DECIMAL(10, 2), idEquipo INTEGER, FOREIGN KEY (idEquipo) REFERENCES EquipoCyber(idEquipo));
CREATE TABLE Venta_Producto (idVenta INTEGER, idProducto INTEGER, cantidad INTEGER, precioUnitario DECIMAL(10, 2), subTotal DECIMAL(10, 2), PRIMARY KEY (idVenta, idProducto), FOREIGN KEY (idVenta) REFERENCES Venta(idVenta), FOREIGN KEY (idProducto) REFERENCES Producto(idProducto));
CREATE TABLE Incidencia (idIncidencia INTEGER PRIMARY KEY AUTOINCREMENT, fecha DATE, hora TIME, descripcion TEXT, estado TEXT CHECK(estado IN ('pendiente', 'resuelto')), idUsuario INTEGER, FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario));
CREATE TABLE Ticket (idTicket INTEGER PRIMARY KEY AUTOINCREMENT, cantidad INTEGER, idVenta INTEGER, FOREIGN KEY (idVenta) REFERENCES Venta(idVenta));

COMMIT;

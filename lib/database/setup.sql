-- =============================================================================
-- SCRIPT DE CONFIGURACIÓN DE BASE DE DATOS PARA SISTEMA DE PASAJES
-- =============================================================================
-- Ejecuta este script en el SQL Editor de Supabase para crear todas las tablas
-- y configuraciones necesarias para el sistema de venta de pasajes.

-- =============================================================================
-- 1. CREAR TABLAS PRINCIPALES
-- =============================================================================

-- Tabla de conductores
CREATE TABLE IF NOT EXISTS drivers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  license VARCHAR(50) NOT NULL UNIQUE,
  phone VARCHAR(20),
  email VARCHAR(255),
  status VARCHAR(20) DEFAULT 'activo' CHECK (status IN ('activo', 'inactivo')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de rutas
CREATE TABLE IF NOT EXISTS routes (
  id SERIAL PRIMARY KEY,
  origin VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  departure_time TIME NOT NULL,
  arrival_time TIME NOT NULL,
  distance_km INTEGER,
  status VARCHAR(20) DEFAULT 'activa' CHECK (status IN ('activa', 'inactiva')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de ventas de pasajes
CREATE TABLE IF NOT EXISTS sales (
  id VARCHAR(50) PRIMARY KEY,
  passenger_name VARCHAR(255) NOT NULL,
  passenger_dni VARCHAR(20) NOT NULL,
  passenger_phone VARCHAR(20),
  passenger_email VARCHAR(255),
  from_city VARCHAR(255) NOT NULL,
  to_city VARCHAR(255) NOT NULL,
  driver_name VARCHAR(255) NOT NULL,
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE SET NULL,
  route_id INTEGER NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  seat_number INTEGER NOT NULL CHECK (seat_number BETWEEN 1 AND 50),
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  total DECIMAL(10,2) NOT NULL CHECK (total > 0),
  travel_date DATE NOT NULL,
  schedule_time TIME NOT NULL,
  status VARCHAR(20) DEFAULT 'Pagado' CHECK (status IN ('Pagado', 'Cancelado', 'Completado')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraint para evitar venta del mismo asiento en la misma fecha y ruta
  UNIQUE(route_id, travel_date, seat_number, schedule_time)
);

-- Tabla de paquetes/encomiendas
CREATE TABLE IF NOT EXISTS packages (
  id VARCHAR(50) PRIMARY KEY,
  sender_name VARCHAR(255) NOT NULL,
  sender_phone VARCHAR(20),
  sender_dni VARCHAR(20),
  recipient_name VARCHAR(255) NOT NULL,
  recipient_phone VARCHAR(20),
  recipient_dni VARCHAR(20),
  from_city VARCHAR(255) NOT NULL,
  to_city VARCHAR(255) NOT NULL,
  description TEXT,
  weight DECIMAL(5,2) CHECK (weight > 0),
  dimensions VARCHAR(100), -- ej: "30x20x15 cm"
  declared_value DECIMAL(10,2) DEFAULT 0,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL CHECK (total > 0),
  travel_date DATE DEFAULT CURRENT_DATE,
  status VARCHAR(20) DEFAULT 'Pendiente' CHECK (status IN ('Pendiente', 'En tránsito', 'Entregado', 'Devuelto')),
  tracking_code VARCHAR(50) UNIQUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de usuarios del sistema (administradores)
CREATE TABLE IF NOT EXISTS system_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'operator' CHECK (role IN ('admin', 'operator', 'viewer')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  permissions JSONB,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de información de la empresa
CREATE TABLE IF NOT EXISTS company_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  business_name VARCHAR(255),
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  logo_url VARCHAR(500),
  ruc VARCHAR(20),
  description TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 2. CREAR ÍNDICES PARA MEJOR RENDIMIENTO
-- =============================================================================

-- Índices para tabla sales
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(travel_date);
CREATE INDEX IF NOT EXISTS idx_sales_route ON sales(route_id);
CREATE INDEX IF NOT EXISTS idx_sales_driver ON sales(driver_id);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
CREATE INDEX IF NOT EXISTS idx_sales_passenger_dni ON sales(passenger_dni);

-- Índices para tabla packages
CREATE INDEX IF NOT EXISTS idx_packages_status ON packages(status);
CREATE INDEX IF NOT EXISTS idx_packages_tracking ON packages(tracking_code);
CREATE INDEX IF NOT EXISTS idx_packages_sender ON packages(sender_dni);
CREATE INDEX IF NOT EXISTS idx_packages_recipient ON packages(recipient_dni);

-- Índices para tabla drivers
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_drivers_license ON drivers(license);

-- Índices para tabla routes
CREATE INDEX IF NOT EXISTS idx_routes_status ON routes(status);
CREATE INDEX IF NOT EXISTS idx_routes_origin_dest ON routes(origin, destination);

-- =============================================================================
-- 3. CREAR FUNCIONES Y TRIGGERS PARA TIMESTAMPS AUTOMÁTICOS
-- =============================================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at en todas las tablas
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON packages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_users_updated_at BEFORE UPDATE ON system_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_info_updated_at BEFORE UPDATE ON company_info
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 4. CONFIGURAR ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_info ENABLE ROW LEVEL SECURITY;

-- Políticas para desarrollo (permiten todas las operaciones)
-- IMPORTANTE: En producción, crear políticas más restrictivas basadas en roles

CREATE POLICY "Allow all operations on drivers" ON drivers FOR ALL USING (true);
CREATE POLICY "Allow all operations on routes" ON routes FOR ALL USING (true);
CREATE POLICY "Allow all operations on sales" ON sales FOR ALL USING (true);
CREATE POLICY "Allow all operations on packages" ON packages FOR ALL USING (true);
CREATE POLICY "Allow all operations on system_users" ON system_users FOR ALL USING (true);
CREATE POLICY "Allow all operations on company_info" ON company_info FOR ALL USING (true);

-- =============================================================================
-- 5. INSERTAR DATOS DE EJEMPLO
-- =============================================================================

-- Conductores de ejemplo
INSERT INTO drivers (name, license, phone, email, status) VALUES
('Juan Carlos Pérez', 'LIC001234', '+51987654321', 'juan.perez@wjlturismo.com', 'activo'),
('María Elena García', 'LIC002345', '+51987654322', 'maria.garcia@wjlturismo.com', 'activo'),
('Carlos Alberto López', 'LIC003456', '+51987654323', 'carlos.lopez@wjlturismo.com', 'activo'),
('Ana Sofía Rodríguez', 'LIC004567', '+51987654324', 'ana.rodriguez@wjlturismo.com', 'activo'),
('Luis Miguel Torres', 'LIC005678', '+51987654325', 'luis.torres@wjlturismo.com', 'inactivo')
ON CONFLICT (license) DO NOTHING;

-- Rutas de ejemplo
INSERT INTO routes (origin, destination, price, departure_time, arrival_time, distance_km, status) VALUES
('Lima', 'Huarmaca', 45.00, '06:00', '14:00', 650, 'activa'),
('Huarmaca', 'Lima', 45.00, '15:00', '23:00', 650, 'activa'),
('Lima', 'Piura', 35.00, '08:00', '16:00', 550, 'activa'),
('Piura', 'Lima', 35.00, '17:00', '01:00', 550, 'activa'),
('Lima', 'Chiclayo', 30.00, '07:00', '15:00', 480, 'activa'),
('Chiclayo', 'Lima', 30.00, '16:00', '00:00', 480, 'activa'),
('Huarmaca', 'Piura', 15.00, '09:00', '11:30', 120, 'activa'),
('Piura', 'Huarmaca', 15.00, '14:00', '16:30', 120, 'activa')
ON CONFLICT DO NOTHING;

-- Usuario administrador de ejemplo
INSERT INTO system_users (email, name, role, status) VALUES
('admin@wjlturismo.com', 'Administrador WJL', 'admin', 'active'),
('operador@wjlturismo.com', 'Operador de Ventas', 'operator', 'active')
ON CONFLICT (email) DO NOTHING;

-- Información de la empresa de ejemplo
INSERT INTO company_info (name, business_name, address, phone, email, ruc, description) VALUES
('WJL TURISMO', 'WJL Turismo S.A.C.', 'Av. Principal 123, Lima, Perú', '+51 987 654 321', 'info@wjlturismo.com', '12345678901', 'Empresa de transporte terrestre especializada en rutas interprovinciales')
ON CONFLICT DO NOTHING;

-- Función para generar código de tracking único
CREATE OR REPLACE FUNCTION generate_tracking_code()
RETURNS TEXT AS $$
BEGIN
    RETURN 'WJL' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Trigger para generar código de tracking automáticamente
CREATE OR REPLACE FUNCTION set_tracking_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tracking_code IS NULL THEN
        NEW.tracking_code := generate_tracking_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_package_tracking_code
    BEFORE INSERT ON packages
    FOR EACH ROW
    EXECUTE FUNCTION set_tracking_code();

-- =============================================================================
-- 6. CREAR VISTAS ÚTILES PARA REPORTES
-- =============================================================================

-- Vista de ventas con información completa
CREATE OR REPLACE VIEW sales_detailed AS
SELECT
    s.id,
    s.passenger_name,
    s.passenger_dni,
    s.passenger_phone,
    s.seat_number,
    s.travel_date,
    s.schedule_time,
    s.total,
    s.status,
    r.origin,
    r.destination,
    r.price as route_price,
    d.name as driver_name,
    d.license as driver_license,
    s.created_at
FROM sales s
LEFT JOIN routes r ON s.route_id = r.id
LEFT JOIN drivers d ON s.driver_id = d.id;

-- Vista de estadísticas diarias
CREATE OR REPLACE VIEW daily_stats AS
SELECT
    travel_date,
    COUNT(*) as total_sales,
    SUM(total) as total_revenue,
    AVG(total) as avg_ticket_price,
    COUNT(DISTINCT route_id) as routes_used
FROM sales
WHERE status = 'Pagado'
GROUP BY travel_date
ORDER BY travel_date DESC;

-- =============================================================================
-- SCRIPT COMPLETADO
-- =============================================================================
--
-- ✅ Tablas creadas: drivers, routes, sales, packages, system_users, company_info
-- ✅ Índices optimizados para consultas frecuentes
-- ✅ Triggers para timestamps automáticos
-- ✅ RLS habilitado con políticas básicas
-- ✅ Datos de ejemplo insertados
-- ✅ Vistas para reportes creadas
--
-- PRÓXIMOS PASOS:
-- 1. Ejecuta este script completo en el SQL Editor de Supabase
-- 2. Verifica que todas las tablas se hayan creado correctamente
-- 3. Configura las variables de entorno en tu aplicación
-- 4. ¡Comienza a usar tu sistema de venta de pasajes!
--
-- =============================================================================

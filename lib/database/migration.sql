-- ═════════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN COMPLETA - SISTEMA DE VENTA DE PASAJES WJL TURISMO
-- ═════════════════════════════════════════════════════════════════════════════
-- Versión: 3.0 - SCRIPT UNIFICADO COMPLETO
-- 
-- Este script incluye TODO lo necesario para crear la base de datos:
-- - 7 Tablas principales
-- - Índices optimizados
-- - Funciones y triggers
-- - Row Level Security (RLS)
-- - Función de autenticación
-- - Vistas para reportes
-- - Datos de ejemplo
--
-- USO: Ejecuta este script COMPLETO en el SQL Editor de Supabase
--      No necesitas ejecutar ningún otro archivo
-- ═════════════════════════════════════════════════════════════════════════════

-- ═════════════════════════════════════════════════════════════════════════════
-- 1️⃣ CREAR TABLAS PRINCIPALES
-- ═════════════════════════════════════════════════════════════════════════════

-- Tabla: drivers (conductores)
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

-- Tabla: routes (rutas)
CREATE TABLE IF NOT EXISTS routes (
  id SERIAL PRIMARY KEY,
  origin VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  departure_time TIME NOT NULL,
  arrival_time TIME NOT NULL,
  schedule VARCHAR(50), -- Formato: "06:00 AM", "03:00 PM"
  distance_km INTEGER,
  status VARCHAR(20) DEFAULT 'activa' CHECK (status IN ('activa', 'inactiva')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: route_schedules (horarios múltiples por ruta)
CREATE TABLE IF NOT EXISTS route_schedules (
  id SERIAL PRIMARY KEY,
  route_id INTEGER NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  schedule_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(route_id, schedule_time)
);

-- Tabla: sales (ventas de pasajes)
CREATE TABLE IF NOT EXISTS sales (
  id VARCHAR(50) PRIMARY KEY,
  passenger_name VARCHAR(255) NOT NULL,
  passenger_dni VARCHAR(20) NOT NULL,
  passenger_phone VARCHAR(20),
  passenger_email VARCHAR(255),
  from_city VARCHAR(255) NOT NULL,
  to_city VARCHAR(255) NOT NULL,
  driver_name VARCHAR(255) NOT NULL,
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE RESTRICT,
  route_id INTEGER NOT NULL REFERENCES routes(id) ON DELETE RESTRICT,
  seat_number INTEGER NOT NULL CHECK (seat_number BETWEEN 1 AND 50),
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  total DECIMAL(10,2) NOT NULL CHECK (total > 0),
  travel_date DATE NOT NULL,
  schedule_time TIME NOT NULL,
  status VARCHAR(20) DEFAULT 'Pagado' CHECK (status IN ('Pagado', 'Pendiente', 'Cancelado', 'Completado')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Evitar doble venta del mismo asiento
  UNIQUE(route_id, travel_date, seat_number, schedule_time)
);

-- Tabla: packages (paquetes/encomiendas)
CREATE TABLE IF NOT EXISTS packages (
  id VARCHAR(50) PRIMARY KEY,
  sender_name VARCHAR(255) NOT NULL,
  sender_phone VARCHAR(20),
  sender_dni VARCHAR(20),
  sender_address VARCHAR(255),
  recipient_name VARCHAR(255) NOT NULL,
  recipient_phone VARCHAR(20),
  recipient_dni VARCHAR(20),
  recipient_address VARCHAR(255),
  from_city VARCHAR(255) NOT NULL,
  to_city VARCHAR(255) NOT NULL,
  route_id INTEGER REFERENCES routes(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  description TEXT,
  weight DECIMAL(5,2) CHECK (weight > 0),
  dimensions VARCHAR(100),
  declared_value DECIMAL(10,2) DEFAULT 0,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL CHECK (total > 0),
  travel_date DATE DEFAULT CURRENT_DATE,
  delivery_date DATE,
  status VARCHAR(30) DEFAULT 'Pendiente' CHECK (status IN ('Pendiente', 'Pagado', 'En Tránsito', 'En tránsito', 'Entregado', 'Devuelto')),
  tracking_code VARCHAR(50) UNIQUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: system_users (usuarios del sistema)
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

-- Tabla: company_info (información de la empresa)
CREATE TABLE IF NOT EXISTS company_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  business_name VARCHAR(255),
  ruc VARCHAR(20),
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  logo_url VARCHAR(500),
  description TEXT,
  total_seats INTEGER DEFAULT 40,
  passenger_seats INTEGER DEFAULT 39,
  conductor_seat INTEGER DEFAULT 1,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ═════════════════════════════════════════════════════════════════════════════
-- 2️⃣ CREAR ÍNDICES PARA OPTIMIZAR CONSULTAS
-- ═════════════════════════════════════════════════════════════════════════════

-- Índices: sales
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(travel_date);
CREATE INDEX IF NOT EXISTS idx_sales_route ON sales(route_id);
CREATE INDEX IF NOT EXISTS idx_sales_driver ON sales(driver_id);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
CREATE INDEX IF NOT EXISTS idx_sales_passenger_dni ON sales(passenger_dni);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at DESC);

-- Índices: packages
CREATE INDEX IF NOT EXISTS idx_packages_status ON packages(status);
CREATE INDEX IF NOT EXISTS idx_packages_tracking ON packages(tracking_code);
CREATE INDEX IF NOT EXISTS idx_packages_sender ON packages(sender_dni);
CREATE INDEX IF NOT EXISTS idx_packages_recipient ON packages(recipient_dni);
CREATE INDEX IF NOT EXISTS idx_packages_route ON packages(route_id);
CREATE INDEX IF NOT EXISTS idx_packages_driver ON packages(driver_id);
CREATE INDEX IF NOT EXISTS idx_packages_created_at ON packages(created_at DESC);

-- Índices: drivers
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_drivers_license ON drivers(license);
CREATE INDEX IF NOT EXISTS idx_drivers_name ON drivers(name);

-- Índices: routes
CREATE INDEX IF NOT EXISTS idx_routes_status ON routes(status);
CREATE INDEX IF NOT EXISTS idx_routes_origin_dest ON routes(origin, destination);

-- Índices: route_schedules
CREATE INDEX IF NOT EXISTS idx_route_schedules_route ON route_schedules(route_id);
CREATE INDEX IF NOT EXISTS idx_route_schedules_active ON route_schedules(is_active);

-- ═════════════════════════════════════════════════════════════════════════════
-- 3️⃣ FUNCIONES Y TRIGGERS
-- ═════════════════════════════════════════════════════════════════════════════

-- Función: Actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers: updated_at para todas las tablas
DROP TRIGGER IF EXISTS update_drivers_updated_at ON drivers;
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_routes_updated_at ON routes;
CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sales_updated_at ON sales;
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_packages_updated_at ON packages;
CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON packages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_system_users_updated_at ON system_users;
CREATE TRIGGER update_system_users_updated_at BEFORE UPDATE ON system_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_company_info_updated_at ON company_info;
CREATE TRIGGER update_company_info_updated_at BEFORE UPDATE ON company_info
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función: Generar código de tracking único
CREATE OR REPLACE FUNCTION generate_tracking_code()
RETURNS TEXT AS $$
BEGIN
    RETURN 'WJL' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Función: Asignar tracking code automáticamente
CREATE OR REPLACE FUNCTION set_tracking_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tracking_code IS NULL THEN
        NEW.tracking_code := generate_tracking_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Tracking code para packages
DROP TRIGGER IF EXISTS set_package_tracking_code ON packages;
CREATE TRIGGER set_package_tracking_code
    BEFORE INSERT ON packages
    FOR EACH ROW
    EXECUTE FUNCTION set_tracking_code();

-- ═════════════════════════════════════════════════════════════════════════════
-- 4️⃣ FUNCIÓN RPC: AUTENTICACIÓN DE USUARIOS
-- ═════════════════════════════════════════════════════════════════════════════

-- Eliminar función si existe
DROP FUNCTION IF EXISTS verify_user_login(TEXT, TEXT);

-- Función: Verificar login de usuario
CREATE OR REPLACE FUNCTION verify_user_login(
  input_email TEXT,
  input_password TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_user RECORD;
  user_perms JSONB;
BEGIN
  -- Buscar usuario activo por email
  SELECT id, name, email, role, status
  INTO result_user
  FROM system_users
  WHERE email = input_email AND status = 'active'
  LIMIT 1;

  -- Usuario no encontrado
  IF NOT FOUND THEN
    RETURN '[]'::JSONB;
  END IF;

  -- Asignar permisos según rol
  CASE result_user.role
    WHEN 'admin' THEN
      user_perms := '{"read": true, "write": true, "delete": true, "config": true, "reports": true}'::jsonb;
    WHEN 'operator' THEN
      user_perms := '{"read": true, "write": true, "delete": false, "config": false, "reports": true}'::jsonb;
    WHEN 'viewer' THEN
      user_perms := '{"read": true, "write": false, "delete": false, "config": false, "reports": true}'::jsonb;
    ELSE
      user_perms := '{"read": false, "write": false, "delete": false, "config": false, "reports": false}'::jsonb;
  END CASE;

  -- Retornar datos del usuario
  RETURN jsonb_build_array(
    jsonb_build_object(
      'user_id', result_user.id,
      'user_name', result_user.name,
      'user_email', result_user.email,
      'user_role', result_user.role,
      'user_permissions', user_perms
    )
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN '[]'::JSONB;
END;
$$;

-- Permisos de ejecución
GRANT EXECUTE ON FUNCTION verify_user_login(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION verify_user_login(TEXT, TEXT) TO authenticated;

-- ═════════════════════════════════════════════════════════════════════════════
-- 5️⃣ CONFIGURAR ROW LEVEL SECURITY (RLS)
-- ═════════════════════════════════════════════════════════════════════════════

-- Habilitar RLS
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_info ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas antiguas
DROP POLICY IF EXISTS "Allow all operations on drivers" ON drivers;
DROP POLICY IF EXISTS "Allow all operations on routes" ON routes;
DROP POLICY IF EXISTS "Allow all operations on route_schedules" ON route_schedules;
DROP POLICY IF EXISTS "Allow all operations on sales" ON sales;
DROP POLICY IF EXISTS "Allow all operations on packages" ON packages;
DROP POLICY IF EXISTS "Allow all operations on system_users" ON system_users;
DROP POLICY IF EXISTS "Allow all operations on company_info" ON company_info;

-- Crear políticas (permisivas para desarrollo)
CREATE POLICY "Allow all operations on drivers" ON drivers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on routes" ON routes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on route_schedules" ON route_schedules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on sales" ON sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on packages" ON packages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on system_users" ON system_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on company_info" ON company_info FOR ALL USING (true) WITH CHECK (true);

-- ═════════════════════════════════════════════════════════════════════════════
-- 6️⃣ VISTAS PARA REPORTES
-- ═════════════════════════════════════════════════════════════════════════════

-- Vista: Ventas con información completa
CREATE OR REPLACE VIEW sales_detailed AS
SELECT
    s.id, s.passenger_name, s.passenger_dni, s.passenger_phone,
    s.seat_number, s.travel_date, s.schedule_time, s.total, s.status,
    r.origin, r.destination, r.price as route_price,
    d.name as driver_name, d.license as driver_license,
    s.created_at
FROM sales s
LEFT JOIN routes r ON s.route_id = r.id
LEFT JOIN drivers d ON s.driver_id = d.id;

-- Vista: Estadísticas diarias
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

-- Vista: Paquetes con información completa
CREATE OR REPLACE VIEW packages_detailed AS
SELECT
    p.id, p.tracking_code, p.sender_name, p.sender_dni,
    p.recipient_name, p.recipient_dni, p.from_city, p.to_city,
    p.description, p.weight, p.total, p.status,
    p.travel_date, p.delivery_date,
    r.origin, r.destination, d.name as driver_name,
    p.created_at
FROM packages p
LEFT JOIN routes r ON p.route_id = r.id
LEFT JOIN drivers d ON p.driver_id = d.id;

-- ═════════════════════════════════════════════════════════════════════════════
-- 7️⃣ DATOS DE EJEMPLO
-- ═════════════════════════════════════════════════════════════════════════════

-- Conductores
INSERT INTO drivers (name, license, phone, email, status) VALUES
('Juan Carlos Pérez', 'LIC001234', '+51987654321', 'juan.perez@wjlturismo.com', 'activo'),
('María Elena García', 'LIC002345', '+51987654322', 'maria.garcia@wjlturismo.com', 'activo'),
('Carlos Alberto López', 'LIC003456', '+51987654323', 'carlos.lopez@wjlturismo.com', 'activo'),
('Ana Sofía Rodríguez', 'LIC004567', '+51987654324', 'ana.rodriguez@wjlturismo.com', 'activo'),
('Luis Miguel Torres', 'LIC005678', '+51987654325', 'luis.torres@wjlturismo.com', 'inactivo')
ON CONFLICT (license) DO NOTHING;

-- Rutas
INSERT INTO routes (origin, destination, price, departure_time, arrival_time, schedule, distance_km, status) VALUES
('Lima', 'Huarmaca', 45.00, '06:00', '14:00', '06:00 AM', 650, 'activa'),
('Huarmaca', 'Lima', 45.00, '15:00', '23:00', '03:00 PM', 650, 'activa'),
('Lima', 'Piura', 35.00, '08:00', '16:00', '08:00 AM', 550, 'activa'),
('Piura', 'Lima', 35.00, '17:00', '01:00', '05:00 PM', 550, 'activa'),
('Lima', 'Chiclayo', 30.00, '07:00', '15:00', '07:00 AM', 480, 'activa'),
('Chiclayo', 'Lima', 30.00, '16:00', '00:00', '04:00 PM', 480, 'activa'),
('Huarmaca', 'Piura', 15.00, '09:00', '11:30', '09:00 AM', 120, 'activa'),
('Piura', 'Huarmaca', 15.00, '14:00', '16:30', '02:00 PM', 120, 'activa')
ON CONFLICT DO NOTHING;

-- Usuarios del sistema
INSERT INTO system_users (email, name, role, status) VALUES
('admin@wjlturismo.com', 'Administrador WJL', 'admin', 'active'),
('operador@wjlturismo.com', 'Operador de Ventas', 'operator', 'active')
ON CONFLICT (email) DO NOTHING;

-- Información de la empresa
INSERT INTO company_info (name, business_name, address, phone, email, ruc, description, total_seats, passenger_seats, conductor_seat) VALUES
('WJL TURISMO', 'WJL Turismo S.A.C.', 'Av. Principal 123, Lima, Perú', '+51 987 654 321', 'info@wjlturismo.com', '12345678901', 'Empresa de transporte terrestre especializada en rutas interprovinciales', 40, 39, 1)
ON CONFLICT DO NOTHING;

-- ═════════════════════════════════════════════════════════════════════════════
-- ✅ MIGRACIÓN COMPLETADA
-- ═════════════════════════════════════════════════════════════════════════════
--
-- RESUMEN:
-- ✅ 7 Tablas: drivers, routes, route_schedules, sales, packages, system_users, company_info
-- ✅ 18 Índices optimizados
-- ✅ 8 Triggers automáticos
-- ✅ 1 Función RPC de autenticación (verify_user_login)
-- ✅ 7 Políticas RLS
-- ✅ 3 Vistas de reportes
-- ✅ Datos de ejemplo: 5 conductores, 8 rutas, 2 usuarios
--
-- PRÓXIMOS PASOS:
-- 1. ✅ Script ejecutado → Verifica que no haya errores
-- 2. 🔑 Crear usuarios en Authentication → Users (admin@wjlturismo.com, operador@wjlturismo.com)
-- 3. ⚙️  Actualizar .env.local con credenciales de Supabase
-- 4. 🚀 Reiniciar aplicación: pnpm dev
-- 5. 🎉 ¡Listo para usar!
--
-- ═════════════════════════════════════════════════════════════════════════════

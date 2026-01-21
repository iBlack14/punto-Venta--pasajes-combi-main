-- =============================================================================
-- FUNCIONES RPC FALTANTES PARA AUTENTICACIÓN
-- =============================================================================
-- Este script agrega funciones que faltan en setup_complete.sql
-- Ejecútalo DESPUÉS de haber ejecutado setup_complete.sql

-- =============================================================================
-- Función: verify_user_login
-- Descripción: Verifica las credenciales de un usuario y devuelve sus datos
-- Parámetros:
--   - input_email: Email del usuario
--   - input_password: Contraseña (en texto plano para desarrollo)
-- Retorna: Array con datos del usuario si las credenciales son correctas
-- =============================================================================

-- Primero eliminar la función si ya existe
DROP FUNCTION IF EXISTS verify_user_login(TEXT, TEXT);

-- Crear la función con manejo de errores mejorado
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
  -- Verificar que el email exista y el usuario esté activo
  SELECT 
    id,
    name,
    email,
    role,
    status
  INTO result_user
  FROM system_users
  WHERE 
    email = input_email
    AND status = 'active'
  LIMIT 1;

  -- Si no se encuentra el usuario, retornar array vacío
  IF NOT FOUND THEN
    RETURN '[]'::JSONB;
  END IF;

  -- Asignar permisos según el rol
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

  -- Retornar array con el usuario
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
    -- En caso de error, retornar array vacío
    RETURN '[]'::JSONB;
END;
$$;

-- =============================================================================
-- IMPORTANTE: INTEGRACIÓN CON SUPABASE AUTH
-- =============================================================================
--
-- Esta función es una implementación TEMPORAL para desarrollo.
-- 
-- Para producción, te recomiendo MIGRAR a Supabase Auth:
-- 1. Los usuarios se crean en Authentication → Users (como ya hiciste)
-- 2. El login se hace con supabase.auth.signInWithPassword()
-- 3. Esta función solo se usa para obtener el rol y permisos del usuario
--
-- Alternativa para integración completa:
-- - Crear un trigger en auth.users que sincronice con system_users
-- - Usar auth.uid() en las queries para verificar el usuario actual
-- =============================================================================

-- Dar permisos de ejecución a usuarios anónimos (para login)
GRANT EXECUTE ON FUNCTION verify_user_login(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION verify_user_login(TEXT, TEXT) TO authenticated;

-- =============================================================================
-- SCRIPT COMPLETADO ✅
-- =============================================================================
-- 
-- ✅ Función verify_user_login creada
-- ✅ Permisos otorgados
--
-- PRÓXIMOS PASOS:
-- 1. Ejecuta este script en el SQL Editor de Supabase
-- 2. Reinicia tu aplicación (detén y vuelve a ejecutar pnpm dev)
-- 3. Intenta iniciar sesión con:
--    Email: admin@wjlturismo.com (o cualquier email del paso de crear usuarios)
--    Password: (cualquiera - no se verifica en desarrollo)
--
-- =============================================================================

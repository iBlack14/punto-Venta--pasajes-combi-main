# 🚀 Guía de Configuración - Sistema de Venta de Pasajes

Esta guía te ayudará a configurar la base de datos y poner en marcha el sistema paso a paso.

## 📋 Prerequisitos

- Node.js 18 o superior instalado
- Una cuenta en [Supabase](https://supabase.com) (es gratis)
- Git (opcional)

## 🔧 Paso 1: Configurar Supabase

### 1.1 Crear un Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com) e inicia sesión
2. Haz clic en "New Project"
3. Completa los datos:
   - **Name**: WJL-Turismo (o el nombre que prefieras)
   - **Database Password**: Crea una contraseña segura y guárdala
   - **Region**: Selecciona la más cercana a tu ubicación
4. Haz clic en "Create new project" y espera unos minutos

### 1.2 Ejecutar el Script SQL

1. En tu proyecto de Supabase, ve al menú lateral y selecciona **SQL Editor**
2. Haz clic en "New query"
3. Abre el archivo `lib/database/setup.sql` de este proyecto
4. **Copia TODO el contenido** del archivo SQL
5. **Pega el contenido** en el editor SQL de Supabase
6. Haz clic en el botón **"Run"** (o presiona Ctrl/Cmd + Enter)
7. Espera a que termine (verás "Success" cuando complete)

### 1.3 Verificar que se Crearon las Tablas

1. Ve a **Table Editor** en el menú lateral de Supabase
2. Deberías ver las siguientes tablas:
   - ✅ drivers
   - ✅ routes
   - ✅ sales
   - ✅ packages
   - ✅ system_users
   - ✅ company_info

3. Cada tabla debe tener datos de ejemplo ya cargados

## 🔑 Paso 2: Configurar Variables de Entorno

### 2.1 Obtener las Credenciales de Supabase

1. En tu proyecto de Supabase, ve a **Settings** (⚙️) en el menú lateral
2. Selecciona **API** en el submenú
3. Encontrarás dos valores importantes:
   - **Project URL**: Algo como `https://abcdefgh.supabase.co`
   - **anon public key**: Una clave larga que empieza con `eyJ...`

### 2.2 Crear el Archivo de Configuración

1. En la raíz del proyecto, copia el archivo `.env.example`:
   ```bash
   cp .env.example .env.local
   ```

2. Abre `.env.local` con tu editor de texto

3. Reemplaza los valores de ejemplo con tus credenciales:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto-real.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tu-clave-real-aqui
   ```

4. Guarda el archivo

## 📦 Paso 3: Instalar Dependencias

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
npm install
```

Espera a que se instalen todas las dependencias.

## 🚀 Paso 4: Iniciar el Proyecto

Una vez instaladas las dependencias, inicia el servidor de desarrollo:

```bash
npm run dev
```

El proyecto se iniciará en [http://localhost:3000](http://localhost:3000)

## 🎉 ¡Listo!

Si todo salió bien, deberías ver la aplicación funcionando. El script SQL ya insertó datos de ejemplo:

### 📊 Datos de Ejemplo Incluidos

- **5 Conductores** con sus datos completos
- **8 Rutas** principales (Lima-Huarmaca, Lima-Piura, etc.)
- **2 Usuarios del sistema** (admin y operador)
- **Información de la empresa** WJL Turismo

### 👤 Usuarios de Prueba

El sistema incluye estos usuarios de ejemplo:
- **Admin**: admin@wjlturismo.com
- **Operador**: operador@wjlturismo.com

## 🔍 Estructura de la Base de Datos

### Tablas Principales

#### 1. **drivers** - Conductores
Almacena información de los conductores:
- ID único (UUID)
- Nombre, licencia, teléfono, email
- Estado (activo/inactivo)

#### 2. **routes** - Rutas
Define las rutas disponibles:
- Origen y destino
- Precio del pasaje
- Horarios de salida y llegada
- Distancia en kilómetros

#### 3. **sales** - Ventas de Pasajes
Registra cada venta de pasaje:
- Datos del pasajero (nombre, DNI, teléfono)
- Ruta y conductor asignado
- Número de asiento
- Fecha y horario de viaje
- Estado del pago

#### 4. **packages** - Encomiendas
Gestiona envío de paquetes:
- Datos del remitente y destinatario
- Descripción, peso, dimensiones
- Código de tracking automático
- Estado de la entrega

#### 5. **system_users** - Usuarios del Sistema
Usuarios que pueden acceder al sistema (administradores y operadores)

#### 6. **company_info** - Información de la Empresa
Datos de la empresa para personalizar el sistema

## 🛠️ Solución de Problemas

### Error: "Invalid API key" o "Invalid Project URL"

- Verifica que copiaste correctamente las credenciales desde Supabase
- Asegúrate de que el archivo se llame `.env.local` (no `.env.example`)
- Reinicia el servidor de desarrollo después de cambiar las variables

### Error: "relation does not exist"

- Significa que las tablas no se crearon correctamente
- Ve al SQL Editor de Supabase y ejecuta nuevamente el script `lib/database/setup.sql`
- Verifica en Table Editor que las tablas existen

### No aparecen datos

- El script SQL incluye datos de ejemplo
- Si no aparecen, revisa que el script se ejecutó completamente
- Puedes ejecutarlo nuevamente (tiene protección contra duplicados)

## 📚 Comandos Útiles

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Iniciar en producción
npm start

# Verificar errores de TypeScript
npm run type-check
```

## 🔐 Seguridad

⚠️ **IMPORTANTE**:
- El archivo `.env.local` contiene información sensible
- **NUNCA** lo subas a GitHub o lo compartas públicamente
- Ya está incluido en `.gitignore` para protegerlo
- En producción, usa variables de entorno de tu plataforma de hosting

## 📞 Soporte

Si tienes problemas con la configuración:

1. Revisa que seguiste todos los pasos en orden
2. Verifica los mensajes de error en la consola
3. Confirma que Supabase esté funcionando correctamente

## 🎯 Próximos Pasos

Una vez que todo funcione:

1. **Personaliza la información de la empresa** en la sección de configuración
2. **Actualiza los conductores y rutas** con tus datos reales
3. **Configura los horarios** según tu operación
4. **Realiza una venta de prueba** para familiarizarte con el sistema
5. **Explora los reportes** para ver las estadísticas

---

¡Felicitaciones! Tu sistema de venta de pasajes está listo para usar 🎊

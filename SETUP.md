# Guía de Configuración - Voila Voice AI

## Configuración de Supabase

### 1. Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta o inicia sesión
2. Crea un nuevo proyecto
3. Espera a que se complete la configuración (puede tardar unos minutos)

### 2. Configurar la base de datos

1. Ve a la sección **SQL Editor** en tu proyecto de Supabase
2. Copia y ejecuta el contenido del archivo `supabase/schema.sql`
3. Esto creará la tabla `calls` con todas las políticas de seguridad necesarias

### 3. Obtener las credenciales

1. Ve a **Settings** > **API** en tu proyecto de Supabase
2. Copia los siguientes valores:
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **anon public** key (NEXT_PUBLIC_SUPABASE_ANON_KEY)

### 4. Configurar variables de entorno

1. Crea un archivo `.env.local` en la raíz del proyecto
2. Agrega las siguientes variables:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_project_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

### 5. Instalar dependencias y ejecutar

```bash
npm install
npm run dev
```

## Estructura de la Base de Datos

### Tabla `calls`

- `id` (UUID): Identificador único
- `created_at` (Timestamp): Fecha y hora de la llamada
- `caller_number` (Text): Número del llamante
- `duration` (Integer): Duración en segundos
- `status` (Text): Estado ('answered' o 'missed')
- `recording_url` (Text, opcional): URL de la grabación
- `transcription` (Text, opcional): Transcripción de la llamada
- `user_id` (UUID): ID del usuario (se asigna automáticamente)

## Próximos pasos

1. Personaliza los estilos según tus necesidades
2. Agrega más funcionalidades según requieras
3. Configura el almacenamiento de Supabase para las grabaciones de audio
4. Implementa la lógica de transcripción si es necesario

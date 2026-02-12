# Guía de Onboarding - Nuevo Cliente (Asesor Inmobiliario)

## 📋 Flujo Completo de Configuración

Esta guía explica paso a paso cómo configurar un nuevo cliente (asesor inmobiliario) en la plataforma.

---

## 🎯 Resumen del Flujo

1. **Crear cuenta del cliente en Supabase** → Usuario único con email/contraseña
2. **Crear agente en VAPI** → Asistente de voz personalizado para el cliente
3. **Vincular agente con cuenta** → Guardar `assistant_id` en la cuenta del cliente
4. **Configurar RLS (Row Level Security)** → Asegurar que solo vea su información
5. **Configurar variables de entorno** (si necesario)

---

## PASO 1: Crear Cuenta del Cliente en Supabase

### Opción A: Auto-registro (Recomendado)
El cliente se registra automáticamente desde `/register`

### Opción B: Crear manualmente desde Dashboard de Supabase

1. Ve a tu proyecto en [supabase.com](https://supabase.com)
2. Navega a **Authentication** → **Users**
3. Click en **"Add user"** → **"Create new user"**
4. Completa:
   - **Email**: `cliente@example.com`
   - **Password**: (generar una segura)
   - **Auto Confirm User**: ✅ Activado
5. Click **"Create user"**

### Opción C: Crear via SQL

```sql
-- Crear usuario en Supabase Auth
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'cliente@example.com',
  crypt('password_segura', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Obtener el user_id del usuario recién creado
SELECT id FROM auth.users WHERE email = 'cliente@example.com';
```

**📝 Nota importante**: Guarda el `user_id` (UUID) generado, lo necesitarás más adelante.

---

## PASO 2: Crear Agente en VAPI

### 2.1 Acceder a VAPI Dashboard

1. Ve a [https://dashboard.vapi.ai](https://dashboard.vapi.ai)
2. Inicia sesión con tu cuenta de VAPI

### 2.2 Crear Nuevo Assistant

1. Navega a **Assistants** en el menú lateral
2. Click en **"+ New Assistant"** o **"Create Assistant"**
3. Completa la configuración:

#### Configuración Básica:
- **Name**: `Asistente - [Nombre del Cliente]` (ej: "Asistente - Roberto Sánchez")
- **Description**: Descripción del asistente inmobiliario

#### Model Configuration:
- **Model Provider**: OpenAI (o el que uses)
- **Model**: `gpt-4` o `gpt-3.5-turbo`
- **System Message**: Script personalizado para inmobiliaria

Ejemplo de System Message:
```
Eres un asistente de voz profesional especializado en bienes raíces en México.
Tu objetivo es:
1. Atender llamadas de prospectos interesados en comprar, rentar o vender propiedades
2. Recabar información clave: nombre, presupuesto, zonas de interés, timeline
3. Confirmar citas y dar seguimiento profesional
4. Calificar leads (A=Hot, B=Warm, C=Cold)

Siempre sé amable, profesional y recaba la información necesaria.
```

#### Voice Configuration:
- **Voice Provider**: ElevenLabs (o el que uses)
- **Voice**: Selecciona una voz en español mexicano (ej: "Dorothy", "Bella", etc.)
- **Stability**: 0.6
- **Similarity Boost**: 0.75

#### First Message:
```
¡Hola! Bienvenido a [Nombre de la Inmobiliaria]. Soy tu asistente virtual.
¿En qué puedo ayudarte hoy? ¿Buscas comprar, rentar o vender una propiedad?
```

### 2.3 Guardar el Assistant ID

Después de crear el assistant:
1. VAPI generará un **Assistant ID** (UUID)
2. **⚠️ IMPORTANTE**: Copia este ID, lo necesitarás en el siguiente paso
3. Se verá algo como: `abc123-def456-ghi789...`

**Ejemplo de Assistant ID:**
```
a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

---

## PASO 3: Vincular Agente con Cuenta del Cliente

### 3.1 Crear Tabla de Configuración (si no existe)

Necesitamos una tabla para guardar la configuración de cada cliente (vinculación usuario ↔ agente):

```sql
-- Crear tabla user_assistants
CREATE TABLE IF NOT EXISTS user_assistants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Configuración VAPI
  vapi_assistant_id TEXT NOT NULL UNIQUE,
  vapi_assistant_name TEXT,
  vapi_public_key TEXT, -- Public key de VAPI (opcional, para web calls)
  
  -- Configuración del agente
  agent_config JSONB, -- Configuración adicional del agente
  
  -- Estado
  active BOOLEAN DEFAULT TRUE,
  
  UNIQUE(user_id, vapi_assistant_id)
);

-- Habilitar RLS
ALTER TABLE user_assistants ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own assistants"
  ON user_assistants FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assistants"
  ON user_assistants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assistants"
  ON user_assistants FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assistants"
  ON user_assistants FOR DELETE
  USING (auth.uid() = user_id);

-- Índices
CREATE INDEX IF NOT EXISTS user_assistants_user_id_idx ON user_assistants(user_id);
CREATE INDEX IF NOT EXISTS user_assistants_vapi_assistant_id_idx ON user_assistants(vapi_assistant_id);
CREATE INDEX IF NOT EXISTS user_assistants_active_idx ON user_assistants(active);
```

### 3.2 Vincular el Agente con el Usuario

Ejecuta este SQL reemplazando los valores:

```sql
-- Reemplazar estos valores:
-- - 'USER_ID_DEL_CLIENTE': El UUID del usuario creado en Paso 1
-- - 'VAPI_ASSISTANT_ID': El Assistant ID de VAPI del Paso 2
-- - 'Nombre del Agente': Nombre descriptivo

INSERT INTO user_assistants (
  user_id,
  vapi_assistant_id,
  vapi_assistant_name,
  active
) VALUES (
  'USER_ID_DEL_CLIENTE', -- UUID del usuario
  'VAPI_ASSISTANT_ID',   -- Assistant ID de VAPI
  'Asistente Inmobiliario', -- Nombre del agente
  TRUE
);
```

**Ejemplo real:**
```sql
INSERT INTO user_assistants (
  user_id,
  vapi_assistant_id,
  vapi_assistant_name,
  active
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890', -- User ID del cliente
  'b2c3d4e5-f6g7-8901-bcde-f12345678901', -- VAPI Assistant ID
  'Asistente - Roberto Sánchez',
  TRUE
);
```

---

## PASO 4: Verificar Row Level Security (RLS)

RLS ya está configurado en todas las tablas, pero verifica que esté activo:

```sql
-- Verificar RLS en tablas principales
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('calls', 'leads', 'actividades', 'propiedades', 'phone_numbers', 'user_assistants');

-- Todas deben tener rowsecurity = true
```

Las políticas RLS aseguran que:
- ✅ Cada usuario solo ve sus propias llamadas (`calls.user_id = auth.uid()`)
- ✅ Cada usuario solo ve sus propios leads (`leads.user_id = auth.uid()`)
- ✅ Cada usuario solo ve sus propias actividades
- ✅ Cada usuario solo ve sus propias propiedades
- ✅ Cada usuario solo ve sus propios números telefónicos

**No necesitas hacer nada más** - RLS funciona automáticamente con `auth.uid()`.

---

## PASO 5: Actualizar Código para Usar Assistant del Usuario

### 5.1 Crear Función Helper para Obtener Assistant ID

Crea un archivo: `lib/userAssistant.ts`

```typescript
import { createClient } from '@/lib/supabase'

export async function getUserAssistantId(userId: string): Promise<string | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('user_assistants')
    .select('vapi_assistant_id')
    .eq('user_id', userId)
    .eq('active', true)
    .single()
  
  if (error || !data) {
    console.error('Error obteniendo assistant ID:', error)
    return null
  }
  
  return data.vapi_assistant_id
}
```

### 5.2 Actualizar WebCallCard para Usar Assistant del Usuario

Modifica `components/WebCallCard.tsx`:

```typescript
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { getUserAssistantId } from '@/lib/userAssistant'

export default function WebCallCard() {
  const [agentId, setAgentId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadAssistant() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setLoading(false)
        return
      }

      // Obtener assistant ID del usuario
      const assistantId = await getUserAssistantId(user.id)
      
      if (assistantId) {
        setAgentId(assistantId)
      } else {
        console.error('No se encontró assistant configurado para este usuario')
      }
      
      setLoading(false)
    }

    loadAssistant()
  }, [supabase])

  if (loading) {
    return <div>Cargando configuración...</div>
  }

  if (!agentId) {
    return <div>Error: No tienes un asistente configurado. Contacta al administrador.</div>
  }

  return <WebCallCardInternal agentId={agentId} />
}
```

### 5.3 Actualizar API Route

Modifica `app/api/web-call/create/route.ts` para obtener el assistant del usuario:

```typescript
// Dentro de la función POST
const { data: { user } } = await supabase.auth.getUser()

if (!user) {
  return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
}

// Obtener assistant ID del usuario
const { data: assistant } = await supabase
  .from('user_assistants')
  .select('vapi_assistant_id')
  .eq('user_id', user.id)
  .eq('active', true)
  .single()

if (!assistant) {
  return NextResponse.json(
    { error: 'No tienes un asistente configurado' },
    { status: 400 }
  )
}

// Usar el assistant ID del usuario (no el del body)
const agentId = assistant.vapi_assistant_id
```

---

## ✅ Verificación Final

### Checklist de Verificación:

- [ ] Usuario creado en Supabase Auth
- [ ] Assistant creado en VAPI Dashboard
- [ ] Assistant ID guardado en `user_assistants`
- [ ] RLS verificado (cada usuario solo ve su info)
- [ ] Código actualizado para usar assistant del usuario
- [ ] Cliente puede iniciar sesión en `/login`
- [ ] Cliente puede realizar llamadas web
- [ ] Las llamadas se guardan vinculadas a su `user_id`
- [ ] Cliente solo ve sus propias llamadas/leads

---

## 🔐 Seguridad y Aislamiento de Datos

### Cómo Funciona el Aislamiento:

1. **Authentication**: Cada cliente tiene su propia cuenta en Supabase Auth
2. **Row Level Security (RLS)**: Todas las queries automáticamente filtran por `user_id`
3. **Assistant ID**: Cada cliente tiene su propio assistant en VAPI
4. **Metadata**: Todas las llamadas guardan el `user_id` en metadata

### Ejemplo de Query Automática:

```sql
-- Cuando un usuario hace: SELECT * FROM calls
-- Supabase automáticamente ejecuta:
SELECT * FROM calls 
WHERE user_id = auth.uid()  -- ← Esto es automático gracias a RLS
```

**Resultado**: Cada cliente solo ve sus propios datos, sin código adicional necesario.

---

## 📱 Flujo del Cliente

### 1. Cliente se Registra
- Va a `app.voilavoiceai.com/register`
- Crea cuenta con email/contraseña
- **✅ Ya tiene acceso al dashboard** (pero sin assistant configurado aún)

### 2. Administrador Configura Assistant
- Administrador crea assistant en VAPI
- Administrador vincula assistant con `user_id` del cliente
- **✅ Cliente ahora puede hacer llamadas**

### 3. Cliente Usa la Plataforma
- Inicia sesión en `app.voilavoiceai.com`
- Ve su dashboard personalizado
- Realiza llamadas web (usa su assistant)
- Ve sus llamadas, leads, analytics
- **✅ Todo está vinculado a su cuenta**

---

## 🎯 Resumen para el Administrador

### Para Agregar un Nuevo Cliente:

1. **Cliente se registra** → Obtener su `user_id` de Supabase Auth
2. **Crear assistant en VAPI** → Obtener el `vapi_assistant_id`
3. **Ejecutar SQL:**
   ```sql
   INSERT INTO user_assistants (user_id, vapi_assistant_id, vapi_assistant_name)
   VALUES ('USER_ID', 'VAPI_ASSISTANT_ID', 'Nombre del Cliente');
   ```
4. **¡Listo!** El cliente ya puede usar su assistant personalizado

### Tiempo Estimado:
- Crear usuario: 2 minutos
- Crear assistant en VAPI: 5-10 minutos
- Vincular: 1 minuto
- **Total: ~10-15 minutos por cliente**

---

## 🚀 Optimizaciones Futuras

### Automatización del Onboarding:
- Portal de administración para crear clientes
- Integración con VAPI API para crear assistants automáticamente
- Flujo self-service para que clientes se auto-configuren

### Multi-Assistant por Cliente:
- Permitir que un cliente tenga múltiples assistants
- Selección de assistant por tipo de propiedad/zona
- Routing inteligente según número telefónico

---

**Última actualización:** Enero 2026

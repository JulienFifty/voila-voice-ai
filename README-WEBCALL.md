# Implementación de Llamadas Web

## Arquitectura

Esta implementación permite realizar llamadas web directamente desde el dashboard para probar el agente virtual.

### Componentes principales

1. **Route Handler**: `app/api/web-call/create/route.ts`
   - Endpoint POST que crea una llamada web
   - Autentica al usuario y llama a la función server-side
   - Retorna `call_id` y `access_token` necesarios para el SDK

2. **Adapter**: `lib/webcallAdapter.ts`
   - Maneja permisos de micrófono
   - Wrapper para el SDK de Vapi (actualmente mockeado)
   - Abstrae la lógica de inicio/parada de llamadas

3. **Componente UI**: `components/WebCallCard.tsx`
   - Card centrado con botón de llamada
   - Muestra estados de llamada en tiempo real
   - Timer de duración
   - Manejo de errores con mensajes claros

4. **Página**: `app/dashboard/test-agent/page.tsx`
   - Renderiza el componente WebCallCard

## Integración con Vapi SDK

### Paso 1: Instalar el SDK

```bash
npm install @vapi-ai/web-sdk
```

### Paso 2: Configurar variables de entorno

Agrega a `.env.local`:

```env
# API Key de Vapi (obtener desde dashboard de Vapi)
VAPI_API_KEY=tu_api_key_aqui

# URL base de la API (opcional, tiene default)
VAPI_API_URL=https://api.vapi.ai
```

### Paso 3: Integrar SDK en el adapter

Edita `lib/webcallAdapter.ts` y reemplaza la función `startWebCall` con:

```typescript
import { Call } from '@vapi-ai/web-sdk'

export async function startWebCall(params: WebCallParams): Promise<WebCallController> {
  const { accessToken, callId, onStatus } = params
  
  try {
    await requestMicrophonePermission()
    onStatus('connecting')
    
    const call = Call.create({
      accessToken,
      callId,
      onCallUpdate: (callState) => {
        if (callState.status === 'ringing') onStatus('connecting')
        else if (callState.status === 'in-progress') onStatus('in_call')
        else if (callState.status === 'ended') onStatus('ended')
      },
      onError: (error) => {
        console.error('Error en llamada:', error)
        onStatus('error')
      }
    })
    
    await call.connect()
    onStatus('in_call')
    
    return {
      stop: async () => {
        await call.stop()
        onStatus('ended')
      }
    }
  } catch (error) {
    onStatus('error')
    throw error
  }
}
```

### Paso 4: Integrar API real en Route Handler

Edita `app/api/web-call/create/route.ts` y actualiza la función `createWebCall`:

1. Instala el SDK server-side:
```bash
npm install @vapi-ai/server-sdk
```

2. Reemplaza la función con:

```typescript
import { Vapi } from '@vapi-ai/server-sdk'

async function createWebCall(agentId: string, accountId: string, userId: string) {
  const vapi = new Vapi(process.env.VAPI_API_KEY!)
  
  // TODO: Obtener agentName de tu base de datos
  const agentName = await getAgentName(agentId)
  
  const call = await vapi.createCall({
    agentId,
    metadata: {
      source: 'dashboard_web_call',
      agent_name: agentName,
      account_id: accountId,
      user_id: userId,
    },
    dataStorageSetting: 'everything',
  })
  
  return {
    call_id: call.id,
    call_type: 'web_call',
    agent_id: agentId,
    agent_name: agentName,
    call_status: 'registered',
    data_storage_setting: 'everything',
    access_token: call.accessToken,
    metadata: {
      source: 'dashboard_web_call',
      agent_name: agentName,
    },
    call_cost: {
      total_duration_seconds: 0,
      combined_cost: 0,
    },
  }
}
```

## Guardar registros en DB

En `app/api/web-call/create/route.ts`, después de crear la llamada, guarda el registro:

```typescript
// Supabase example
const { error: dbError } = await supabase
  .from('web_calls')
  .insert({
    call_id: call.call_id,
    agent_id: body.agentId,
    user_id: userId,
    account_id: accountId,
    status: 'registered',
    created_at: new Date().toISOString(),
  })
```

Nota: Primero necesitas crear la tabla `web_calls` en Supabase con los campos apropiados.

## Estados de llamada

- `idle`: Inactivo, listo para iniciar
- `creating`: Creando la llamada (llamando a API)
- `connecting`: Conectando con el SDK
- `in_call`: Llamada activa
- `ended`: Llamada terminada
- `error`: Error durante la llamada

## Manejo de permisos

El adapter maneja automáticamente:
- Solicitud de permisos de micrófono
- Mensajes de error claros si se deniegan permisos
- Detección de micrófono no encontrado

## Características implementadas

✅ Card centrado con diseño limpio  
✅ Botón verde grande para iniciar  
✅ Tips de uso (micrófono, audífonos, etc.)  
✅ Links de ayuda  
✅ Estados de llamada en tiempo real  
✅ Timer de duración  
✅ Manejo de permisos con mensajes claros  
✅ AbortController para evitar requests duplicados  
✅ TypeScript estricto  
✅ Código listo para producción con TODOs marcados  

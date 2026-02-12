# Sistema de Llamadas: INBOUND vs OUTBOUND

## Arquitectura

Este sistema maneja **DOS tipos de llamadas completamente separadas**:

### 1. LLAMADAS OUTBOUND (Salientes)
**Tabla:** `campaign_calls`  
**Uso:** Campañas de llamadas que TÚ inicias a tus clientes  
**Ejemplo:** Llamar a 100 leads de propiedades para ofrecerles casas

### 2. LLAMADAS INBOUND (Entrantes)
**Tabla:** `calls`  
**Uso:** Llamadas que el CLIENTE hace a tu negocio  
**Ejemplo:** Cliente llama al restaurante para hacer un pedido

---

## Diferencias Clave

| Aspecto | OUTBOUND (campaign_calls) | INBOUND (calls) |
|---------|--------------------------|-----------------|
| **Quién inicia** | TÚ llamas al cliente | Cliente te llama |
| **Tabla** | `campaign_calls` | `calls` |
| **Tracking** | Por campaña | Individual |
| **user_id** | Via `campaigns.user_id` | Via `user_assistants.vapi_assistant_id` |
| **Uso típico** | Marketing, ventas | Atención al cliente, pedidos |

---

## Schema de Tablas

### Tabla `calls` (INBOUND)
```sql
CREATE TABLE calls (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  
  user_id UUID REFERENCES auth.users(id),
  
  vapi_call_id TEXT UNIQUE,
  phone_number TEXT,
  duration_seconds INTEGER,
  status TEXT CHECK (status IN ('answered', 'missed', 'failed')),
  
  recording_url TEXT,
  transcript TEXT,
  extracted_data JSONB,
  
  started_at TIMESTAMP,
  ended_at TIMESTAMP
);
```

### Tabla `campaign_calls` (OUTBOUND)
```sql
CREATE TABLE campaign_calls (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  
  campaign_id UUID REFERENCES campaigns(id),
  lead_id UUID REFERENCES leads(id),
  user_id UUID REFERENCES auth.users(id),
  
  vapi_call_id TEXT,
  phone_number TEXT,
  status TEXT CHECK (status IN ('pending', 'calling', 'answered', 'missed', 'failed')),
  
  transcript TEXT,
  recording_url TEXT,
  duration_seconds INTEGER,
  extracted_data JSONB
);
```

---

## Campos Agregados

### Tabla `pedidos`
- **`hora_recogida`** (TIME): Hora a la que el cliente pasará a recoger el pedido
  - Crítico para saber cuándo preparar el pedido
  - Solo se usa si `tipo_entrega = 'recoger'`
  - Ejemplo: "14:30" (2:30 PM)

### Tabla `reservaciones`
- **`ocasion_especial`** (TEXT): Cumpleaños, aniversario, etc.
  - Permite al staff preparar algo especial
  - Ejemplos: "Cumpleaños de mi esposa", "Aniversario", "Graduación"

---

## Flujo del Webhook

```
VAPI envía webhook end-of-call-report
        ↓
¿Existe en campaign_calls?
        ↓
    ┌───┴───┐
   SÍ       NO
    ↓        ↓
OUTBOUND  INBOUND
    ↓        ↓
Actualiza   Busca user
campaign    por assistant_id
_calls         ↓
    ↓       Crea en
Actualiza   tabla 'calls'
campaign       ↓
stats      Auto-crea
    ↓       pedido/reserva
Auto-crea
pedido/reserva
```

---

## Webhook: Código Simplificado

```typescript
// 1. Detectar tipo de llamada
const { data: campaignCall } = await supabase
  .from('campaign_calls')
  .select('id, user_id')
  .eq('vapi_call_id', call.id)
  .single()

if (campaignCall) {
  // CASO OUTBOUND
  await supabase.from('campaign_calls').update({
    transcript,
    extracted_data: structuredData
  }).eq('id', campaignCall.id)
  
  // Auto-crear pedido/reserva usando campaignCall.user_id
  
} else {
  // CASO INBOUND
  // 1. Obtener user_id del assistant
  const { data: userAssistant } = await supabase
    .from('user_assistants')
    .select('user_id')
    .eq('vapi_assistant_id', call.assistantId)
    .single()
  
  // 2. Crear en tabla 'calls'
  const { data: newCall } = await supabase
    .from('calls')
    .insert({
      user_id: userAssistant.user_id,
      vapi_call_id: call.id,
      transcript,
      extracted_data: structuredData
    })
  
  // 3. Auto-crear pedido/reserva usando newCall.id
}
```

---

## Structured Data Schema (Actualizado)

```json
{
  "tipo": "pedido | reserva | consulta",
  "cliente_nombre": "string",
  "cliente_telefono": "string",
  
  // Para pedidos
  "items": [{"nombre": "...", "cantidad": 2}],
  "tipo_entrega": "recoger | domicilio",
  "direccion_entrega": "string (solo si domicilio)",
  "hora_recogida": "14:30 (HH:MM)",
  "total": 450.50,
  
  // Para reservaciones
  "fecha": "2026-02-15 (YYYY-MM-DD)",
  "hora": "20:00 (HH:MM)",
  "numero_personas": 4,
  "ocasion_especial": "Cumpleaños de mi esposa"
}
```

---

## Relaciones de Tablas

```
calls (inbound)
  ↓
pedidos.call_id
reservaciones.call_id

campaign_calls (outbound)
  ↓
campaigns
  ↓
user_id
```

**IMPORTANTE:** `pedidos` y `reservaciones` ahora apuntan a la tabla `calls` (inbound), NO a `campaign_calls`. Si tienes datos legacy que apuntan a `campaign_calls`, manéjalos por separado.

---

## Migración SQL

**Archivo:** `supabase/migrations/create_calls_inbound_table.sql`

Ejecuta este archivo en Supabase Dashboard → SQL Editor

**Qué hace:**
1. Crea tabla `calls` para inbound
2. Agrega `hora_recogida` a `pedidos`
3. Agrega `ocasion_especial` a `reservaciones`
4. Configura RLS e índices

---

## Testing

### Test 1: Llamada INBOUND (Cliente llama)
1. Cliente llama al número del restaurante
2. Asistente VAPI contesta
3. Cliente hace pedido para recoger a las 2pm
4. Webhook detecta: NO está en `campaign_calls` → INBOUND
5. Crea en tabla `calls`
6. Auto-crea pedido con `hora_recogida = '14:00'`

### Test 2: Llamada OUTBOUND (Campaña)
1. Creas campaña con 10 leads
2. VAPI llama a cada lead
3. Lead contesta y hace reservación
4. Webhook detecta: SÍ está en `campaign_calls` → OUTBOUND
5. Actualiza `campaign_calls`
6. Auto-crea reservación vinculada a campaign_call

---

## Resumen

✅ **OUTBOUND:** Usas `campaign_calls` cuando TÚ llamas al cliente  
✅ **INBOUND:** Usas `calls` cuando el cliente te llama  
✅ **Webhook:** Detecta automáticamente y procesa según corresponda  
✅ **Nuevos campos:** `hora_recogida` y `ocasion_especial` agregados  
✅ **Sin N8N:** Omitido por ahora, enfoque en flujo principal  

# Configuración VAPI para Restaurante

## Resumen

Esta guía te ayudará a configurar tu asistente VAPI para que automáticamente extraiga pedidos y reservaciones de las llamadas telefónicas y los cree en tu dashboard.

**Sin costo adicional de OpenAI** - VAPI usa su propio LLM (Claude Sonnet) incluido en el servicio.

---

## Paso 1: Ejecutar Migración de Base de Datos

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **SQL Editor**
4. Abre el archivo `/supabase/migrations/add_vapi_restaurant_integration.sql`
5. Copia todo el contenido y pégalo en el SQL Editor
6. Click en **Run** o presiona `Cmd/Ctrl + Enter`
7. Verifica que se ejecutó correctamente (verás mensajes de confirmación)

---

## Paso 2: Configurar Asistente en VAPI Dashboard

### 2.1 Crear o Editar Asistente

1. Ve a [VAPI Dashboard](https://dashboard.vapi.ai/)
2. Click en **Create Assistant** (o edita uno existente)
3. Configura el **System Prompt**:

```
Eres el asistente virtual del restaurante [NOMBRE_TU_RESTAURANTE].

Tu función es atender llamadas y:

1. TOMAR PEDIDOS A DOMICILIO:
   - Saludo: "Buen día, [NOMBRE RESTAURANTE], ¿en qué puedo ayudarte?"
   - Preguntar nombre completo del cliente
   - Preguntar teléfono para contacto
   - Tomar orden completa (platillos, bebidas, extras)
   - Confirmar cada item, cantidad y modificaciones
   - Preguntar dirección de entrega COMPLETA (calle, número, colonia, referencias)
   - Mencionar tiempo estimado: 45-60 minutos
   - Confirmar el total si sabes los precios
   - Despedida: "Tu pedido está confirmado, llegará en 45-60 minutos. ¡Gracias!"

2. TOMAR RESERVACIONES:
   - Saludar cordialmente
   - Preguntar nombre completo
   - Preguntar teléfono
   - Preguntar fecha deseada (día, mes)
   - Preguntar hora (formato 24h: "14:00" o "a las 2 de la tarde")
   - Preguntar número de personas
   - Confirmar: "Perfecto, tu reservación para [X] personas el [fecha] a las [hora]"
   - Pedir que lleguen 10 min antes
   - Agradecer

3. RESPONDER CONSULTAS:
   - Horarios: [TU_HORARIO - Ej: Lunes a Viernes 12pm a 10pm]
   - Ubicación: [TU_DIRECCIÓN_COMPLETA]
   - Tipo de cocina: [TU_TIPO - Ej: Mexicana, Italiana, etc]
   - Rango de precios: $[XX-XXX] por persona
   - Métodos de pago: [Ej: Efectivo, tarjeta, transferencia]

REGLAS:
- Habla español mexicano natural y amigable
- SIEMPRE repite los datos importantes para confirmar
- Si no entiendes, pide amablemente que repitan
- NO inventes información que no tienes
- Sé profesional pero cercano
- Si preguntan algo que no sabes, di: "Déjame transferirte con alguien que te puede ayudar"
```

### 2.2 Configurar Analysis Plan con Structured Data

En la configuración del asistente, ve a la sección **Analysis** o al editor JSON avanzado y agrega:

```json
{
  "analysisPlan": {
    "structuredDataSchema": {
      "type": "object",
      "properties": {
        "tipo": {
          "type": "string",
          "enum": ["pedido", "reserva", "consulta"],
          "description": "Tipo de llamada: pedido a domicilio, reservación de mesa, o consulta general"
        },
        "cliente_nombre": {
          "type": "string",
          "description": "Nombre completo del cliente"
        },
        "cliente_telefono": {
          "type": "string",
          "description": "Número de teléfono del cliente"
        },
        "cliente_email": {
          "type": "string",
          "description": "Email del cliente (si se menciona)"
        },
        "items": {
          "type": "array",
          "description": "Lista de platillos pedidos (solo para tipo=pedido)",
          "items": {
            "type": "object",
            "properties": {
              "nombre": {
                "type": "string",
                "description": "Nombre del platillo"
              },
              "cantidad": {
                "type": "integer",
                "description": "Cantidad solicitada"
              },
              "precio_unitario": {
                "type": "number",
                "description": "Precio por unidad si se menciona"
              },
              "notas": {
                "type": "string",
                "description": "Modificaciones o notas especiales"
              }
            },
            "required": ["nombre", "cantidad"]
          }
        },
        "total": {
          "type": "number",
          "description": "Monto total del pedido (solo para tipo=pedido)"
        },
        "direccion_entrega": {
          "type": "string",
          "description": "Dirección completa de entrega (solo para tipo=pedido)"
        },
        "fecha": {
          "type": "string",
          "description": "Fecha de la reservación YYYY-MM-DD (solo para tipo=reserva)"
        },
        "hora": {
          "type": "string",
          "description": "Hora de la reservación HH:MM formato 24h (solo para tipo=reserva)"
        },
        "numero_personas": {
          "type": "integer",
          "description": "Número de personas para la reservación (solo para tipo=reserva)"
        },
        "notas": {
          "type": "string",
          "description": "Notas adicionales o comentarios especiales"
        }
      },
      "required": ["tipo"]
    },
    "structuredDataPrompt": "Extrae TODOS los datos mencionados en la llamada. Si es un pedido, incluye todos los items con nombre y cantidad. Si es reservación, incluye fecha, hora y número de personas. Si un campo no se menciona, déjalo vacío."
  }
}
```

### 2.3 Configurar Webhook

En la sección **Server** del asistente:

1. **Server URL**: `https://tu-dominio.com/api/webhooks/vapi`
   - Si estás en desarrollo local: `https://tu-ngrok-url.ngrok.io/api/webhooks/vapi`
   - Si ya estás en producción: `https://app.voilavoiceai.com/api/webhooks/vapi`

2. **Server Messages**: Selecciona `end-of-call-report`

3. Guarda los cambios

### 2.4 Copiar Assistant ID

1. Después de guardar, copia el **Assistant ID** (formato: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
2. Guárdalo, lo necesitarás en el siguiente paso

---

## Paso 3: Configurar Assistant ID en tu Dashboard

1. Ve a tu dashboard: `/dashboard/settings`
2. Busca la sección **"Asistente de IA"**
3. Pega el **Assistant ID** que copiaste
4. (Opcional) Agrega un nombre descriptivo: "Asistente Restaurante"
5. Click en **Guardar Asistente**

---

## Paso 4: Probar la Integración

### 4.1 Hacer Llamada de Prueba - PEDIDO

1. Llama al número de teléfono de VAPI configurado
2. Cuando el asistente conteste, haz un pedido:
   - "Hola, quiero hacer un pedido a domicilio"
   - Da tu nombre: "Juan Pérez"
   - Da tu teléfono: "222 123 4567"
   - Pide items: "Quiero 2 tacos de pastor, 1 orden de quesadillas, y 2 refrescos"
   - Da tu dirección: "Calle 5 de Mayo #123, Colonia Centro, entre Reforma y Juárez"
3. Deja que el asistente confirme todo
4. Termina la llamada

### 4.2 Verificar Auto-Creación

1. Espera 10-30 segundos (el webhook procesa la llamada)
2. Ve a tu dashboard: `/dashboard/pedidos`
3. **Deberías ver el pedido creado automáticamente** con:
   - Nombre del cliente
   - Teléfono
   - Items pedidos
   - Dirección de entrega
   - Estado: "recibido"

### 4.3 Hacer Llamada de Prueba - RESERVACIÓN

1. Llama nuevamente al número
2. Cuando conteste, pide una reservación:
   - "Hola, quiero hacer una reservación"
   - Da tu nombre: "María López"
   - Da tu teléfono: "222 987 6543"
   - Da fecha: "Para el viernes 14 de febrero"
   - Da hora: "A las 8 de la noche"
   - Da número de personas: "4 personas"
3. Confirma y termina la llamada

### 4.4 Verificar Auto-Creación de Reservación

1. Espera 10-30 segundos
2. Ve a `/dashboard/reservaciones`
3. **Deberías ver la reservación creada automáticamente** con:
   - Nombre del cliente
   - Teléfono
   - Fecha y hora
   - Número de personas
   - Estado: "pendiente"

---

## Verificación de Datos Extraídos

Para cualquier llamada, puedes ver los datos extraídos:

1. Ve a `/dashboard` (o donde veas la lista de llamadas)
2. Click en una llamada
3. En el modal, verás:
   - Transcript completo
   - **Datos extraídos** en formato estructurado
   - Botones para crear pedido/reservación manualmente (si no se creó automáticamente)

---

## Troubleshooting

### No se está creando el pedido/reservación automáticamente

1. **Verifica la migración**: ¿Ejecutaste el SQL en Supabase?
2. **Verifica el webhook**: ¿Está configurado correctamente en VAPI?
3. **Verifica los logs**:
   - En tu terminal de desarrollo, busca logs de `[Webhook VAPI]`
   - Debería decir "Pedido creado automáticamente" o "Reservación creada automáticamente"
4. **Verifica el structuredDataSchema**: ¿Lo configuraste en el asistente VAPI?

### El asistente no extrae bien los datos

1. **Revisa el prompt**: Asegúrate de que el asistente SIEMPRE pida todos los datos necesarios
2. **Revisa el structuredDataSchema**: Verifica que coincida con el formato que necesitas
3. **Prueba con datos más explícitos**: Di claramente "mi nombre es X", "mi teléfono es Y"

### Error al guardar el Assistant ID

1. **Verifica que copiaste el ID correcto** desde VAPI Dashboard
2. **Verifica que tu sesión no haya expirado** (cierra sesión y vuelve a entrar)
3. **Revisa los permisos** en Supabase (tabla `user_assistants`)

---

## Próximos Pasos (Opcional)

Una vez que funciona básicamente, puedes agregar:

1. **Notificaciones**: Email o WhatsApp cuando llega un nuevo pedido
2. **Menú en BD**: Tabla con items del menú para que el AI pueda dar precios exactos
3. **Integración con POS**: Exportar pedidos a tu sistema de punto de venta
4. **Google Calendar**: Sync de reservaciones automático
5. **Analytics**: Dashboard con platillos más pedidos, horarios pico, etc.

---

## Soporte

Si tienes problemas, revisa:
- [Documentación VAPI Structured Data](https://vapi.sh/structured-data)
- [VAPI Webhooks](https://vapi.sh/server-url)
- Logs de tu aplicación en la terminal
- Webhook logs en VAPI Dashboard

¡Listo! Tu asistente VAPI debería estar funcionando perfectamente. 🎉

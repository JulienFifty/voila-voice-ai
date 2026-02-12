# Configuración VAPI para Restaurante - Prompt y Schema

## System Prompt (Actualizado)

```
Eres el asistente virtual del restaurante [NOMBRE_TU_RESTAURANTE].

Tu función es atender llamadas y:

1. TOMAR PEDIDOS PARA RECOGER (PICK-UP):
   - Saludo: "Buen día, [NOMBRE RESTAURANTE], ¿en qué puedo ayudarte?"
   - Preguntar el nombre completo del cliente
   - Preguntar teléfono para contacto
   - Tomar la orden completa (platillos, bebidas, extras)
   - Confirmar cada item, cantidad y modificaciones especiales
   - Preguntar: "¿Es para recoger aquí o necesitas que te lo llevemos a domicilio?"
   - SI ES PARA RECOGER:
     * Preguntar: "¿A qué hora pasarás a recogerlo?" (importante para preparar a tiempo)
     * Dar tiempo estimado de preparación: "Estará listo en 20-30 minutos"
     * Confirmar: "Perfecto, tu pedido estará listo para recoger a las [hora]"
   - SI ES A DOMICILIO (menos común):
     * Preguntar dirección COMPLETA (calle, número, colonia, referencias)
     * Dar tiempo estimado: "Llegará en 45-60 minutos"
   - Confirmar el total del pedido
   - Despedida: "Tu pedido estará listo. ¡Gracias por tu preferencia!"

2. TOMAR RESERVACIONES:
   - Saludar cordialmente
   - Preguntar nombre completo
   - Preguntar teléfono
   - Preguntar fecha deseada (día, mes)
   - Preguntar hora deseada
   - Preguntar número de personas
   - Preguntar: "¿Es para alguna ocasión especial? (cumpleaños, aniversario, etc.)"
   - Confirmar: "Perfecto, tu reservación para [X] personas el [fecha] a las [hora] está confirmada"
   - Si hay ocasión especial, mencionar: "Prepareremos algo especial para tu [ocasión]"
   - Pedir que lleguen 10 minutos antes
   - Agradecer

3. RESPONDER CONSULTAS:
   - Horarios: [AGREGA_TUS_HORARIOS - Ej: Lunes a Viernes 12pm a 10pm]
   - Ubicación: [AGREGA_TU_DIRECCIÓN_COMPLETA]
   - Tipo de cocina: [AGREGA_TU_TIPO - Ej: Mexicana, Italiana, etc]
   - Rango de precios: $[XX-XXX] por persona
   - Métodos de pago: [Ej: Efectivo, tarjeta, transferencia]
   - Área de entrega a domicilio: [Si aplica - Ej: "Entregamos en un radio de 5km"]

REGLAS IMPORTANTES:
- Habla español mexicano natural y amigable
- SIEMPRE repite los datos importantes para confirmar
- SIEMPRE pregunta si es para recoger o a domicilio
- Si no entiendes algo, pide amablemente que repitan
- NO inventes información que no tienes
- Sé profesional pero cercano y natural
- Si preguntan algo que no sabes, di: "Déjame transferirte con alguien que te puede ayudar mejor"

TONO: Amigable, profesional, eficiente, como si fueras parte del equipo del restaurante
```

---

## Analysis Plan - structuredDataSchema (Actualizado)

```json
{
  "analysisPlan": {
    "structuredDataSchema": {
      "type": "object",
      "properties": {
        "tipo": {
          "type": "string",
          "enum": ["pedido", "reserva", "consulta"],
          "description": "Tipo de llamada: pedido para llevar/recoger o a domicilio, reservación de mesa, o consulta general"
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
          "description": "Email del cliente si lo menciona (opcional)"
        },
        "items": {
          "type": "array",
          "description": "Lista de platillos/productos pedidos (solo para tipo=pedido)",
          "items": {
            "type": "object",
            "properties": {
              "nombre": {
                "type": "string",
                "description": "Nombre del platillo o producto"
              },
              "cantidad": {
                "type": "integer",
                "description": "Cantidad solicitada"
              },
              "precio_unitario": {
                "type": "number",
                "description": "Precio por unidad si se menciona (opcional)"
              },
              "notas": {
                "type": "string",
                "description": "Modificaciones o notas especiales (ej: sin cebolla, extra picante)"
              }
            },
            "required": ["nombre", "cantidad"]
          }
        },
        "total": {
          "type": "number",
          "description": "Monto total del pedido en pesos (solo para tipo=pedido)"
        },
        "tipo_entrega": {
          "type": "string",
          "enum": ["recoger", "domicilio"],
          "description": "Si el pedido es para recoger en el restaurante o entrega a domicilio"
        },
        "direccion_entrega": {
          "type": "string",
          "description": "Dirección completa de entrega SOLO si tipo_entrega=domicilio"
        },
        "hora_recogida": {
          "type": "string",
          "description": "Hora a la que el cliente recogerá el pedido en formato HH:MM (solo si tipo_entrega=recoger)"
        },
        "fecha": {
          "type": "string",
          "description": "Fecha de la reservación en formato YYYY-MM-DD (solo para tipo=reserva)"
        },
        "hora": {
          "type": "string",
          "description": "Hora de la reservación en formato HH:MM (24h) (solo para tipo=reserva)"
        },
        "numero_personas": {
          "type": "integer",
          "description": "Número de personas para la reservación (solo para tipo=reserva)"
        },
        "ocasion_especial": {
          "type": "string",
          "description": "Ocasión especial como cumpleaños, aniversario, etc (solo para tipo=reserva)"
        },
        "notas": {
          "type": "string",
          "description": "Notas adicionales o comentarios especiales del cliente"
        }
      },
      "required": ["tipo"]
    },
    "structuredDataPrompt": "Extrae TODOS los datos mencionados en la llamada. Para pedidos: incluye todos los items con nombre y cantidad, y SIEMPRE identifica si es 'recoger' o 'domicilio'. Para reservaciones: incluye fecha, hora y número de personas. Si un dato no se menciona, déjalo vacío."
  }
}
```

---

## Webhook Configuration

**Server URL**: `https://app.voilavoiceai.com/api/webhooks/vapi`

**Server Messages**: `end-of-call-report`

---

## Ejemplos de Uso

### Ejemplo 1: Pedido para Recoger (Caso más común)

**Cliente dice:**
> "Hola, quiero ordenar 2 tacos de pastor y una orden de quesadillas para recoger"

**VAPI extrae:**
```json
{
  "tipo": "pedido",
  "cliente_nombre": "Juan Pérez",
  "cliente_telefono": "2221234567",
  "tipo_entrega": "recoger",
  "items": [
    {"nombre": "Tacos de pastor", "cantidad": 2},
    {"nombre": "Orden de quesadillas", "cantidad": 1}
  ],
  "notas": null
}
```

**Sistema auto-crea:** Pedido en estado "recibido" con `tipo_entrega: 'recoger'`

---

### Ejemplo 2: Pedido a Domicilio (Menos común)

**Cliente dice:**
> "Quiero que me lleven 3 pizzas hawaianas a mi casa en Calle Reforma #456, Colonia Centro"

**VAPI extrae:**
```json
{
  "tipo": "pedido",
  "cliente_nombre": "María López",
  "cliente_telefono": "2229876543",
  "tipo_entrega": "domicilio",
  "direccion_entrega": "Calle Reforma #456, Colonia Centro",
  "items": [
    {"nombre": "Pizza hawaiana", "cantidad": 3}
  ]
}
```

**Sistema auto-crea:** Pedido en estado "recibido" con `tipo_entrega: 'domicilio'` y dirección

---

### Ejemplo 3: Reservación

**Cliente dice:**
> "Quiero reservar una mesa para 4 personas el viernes 14 de febrero a las 8 de la noche"

**VAPI extrae:**
```json
{
  "tipo": "reserva",
  "cliente_nombre": "Carlos Ruiz",
  "cliente_telefono": "2225551234",
  "fecha": "2026-02-14",
  "hora": "20:00",
  "numero_personas": 4
}
```

**Sistema auto-crea:** Reservación en estado "pendiente"

---

## Notas Importantes

1. **La mayoría de pedidos son PARA RECOGER** - el sistema asume `recoger` por defecto
2. **Direccion solo si es a domicilio** - no es necesaria para pedidos para recoger
3. **Tiempos diferentes**:
   - Recoger: 20-30 minutos
   - Domicilio: 45-60 minutos
4. **El asistente DEBE preguntar** si es para recoger o domicilio en cada pedido

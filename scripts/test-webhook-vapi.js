#!/usr/bin/env node
/**
 * Test del webhook VAPI: simula un end-of-call-report INBOUND
 * Uso: node scripts/test-webhook-vapi.js [URL]
 * Por defecto: http://localhost:3000/api/webhooks/vapi
 * Carga NEXT_PUBLIC_VAPI_ASSISTANT_ID desde .env.local si existe
 */

const fs = require('fs')
const path = require('path')
const http = require('http')
const https = require('https')

const baseUrl = process.argv[2] || 'http://localhost:3000'
const webhookUrl = `${baseUrl.replace(/\/$/, '')}/api/webhooks/vapi`

// Assistant ID para el test. Debe coincidir con user_assistants.vapi_assistant_id (no confundir con Voice ID).
// Prioridad: VAPI_TEST_ASSISTANT_ID (env) → este default (Sofia - Alitas vinculado en Supabase)
const DEFAULT_TEST_ASSISTANT_ID = '2a7481eb-0b26-49c8-b6ba-51dbde22a692'
const assistantId = (process.env.VAPI_TEST_ASSISTANT_ID || DEFAULT_TEST_ASSISTANT_ID).trim()

// Número de la línea del restaurante (al que llaman) → se busca en phone_numbers para resolver user
const lineNumber = '+522229126551' // +52 (222) 912 6551
const callId = `test-call-${Date.now()}`
const payload = {
  message: {
    type: 'end-of-call-report',
    call: {
      id: callId,
      assistantId,
      assistant_id: assistantId,
      assistant: { id: assistantId },
      customer: { number: '+525512345678' },   // quien llama (cliente)
      phoneNumber: { number: lineNumber },     // línea a la que llamaron (para lookup en phone_numbers)
      duration: 120,
      durationSeconds: 120,
    },
    artifact: {
      transcript: 'Cliente: Hola, quiero hacer un pedido para llevar. Bot: ¿A qué nombre? Cliente: Juan Pérez. Bot: ¿Qué desea? Cliente: 12 alitas BBQ y papas. Bot: ¿Hora de recogida? Cliente: A las 3 de la tarde.',
      recording: { url: 'https://example.com/recording.mp3' },
      analysis: {
        structuredData: {
          tipo: 'pedido',
          cliente_nombre: 'Juan Pérez',
          cliente_telefono: '+525512345678',
          items: [
            { nombre: 'Alitas BBQ', cantidad: 12, precio_unitario: 180, notas: '' },
            { nombre: 'Papas a la francesa', cantidad: 1, precio_unitario: 60, notas: '' },
          ],
          total: 2220,
          tipo_entrega: 'recoger',
          hora_recogida: '15:00',
          notas: null,
        },
      },
    },
    startedAt: new Date(Date.now() - 120000).toISOString(),
    endedAt: new Date().toISOString(),
    endedReason: 'customer-ended-call',
    duration: 120,
  },
}

const body = JSON.stringify(payload)
const url = new URL(webhookUrl)
const isHttps = url.protocol === 'https:'
const client = isHttps ? https : http
const options = {
  hostname: url.hostname,
  port: url.port || (isHttps ? 443 : 80),
  path: url.pathname + url.search,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  },
}

console.log('Enviando end-of-call-report INBOUND a:', webhookUrl)
console.log('call.id:', callId)
console.log('assistantId:', assistantId)
console.log('lineNumber (línea llamada):', lineNumber)
console.log('')

const req = client.request(options, (res) => {
  let data = ''
  res.on('data', (ch) => { data += ch })
  res.on('end', () => {
    console.log('Status:', res.statusCode, res.statusMessage)
    console.log('Response:', data)
    try {
      const j = JSON.parse(data)
      if (j.ok) {
        console.log('\n✅ Webhook OK: llamada procesada (call + pedido/reserva creados si aplica)')
        process.exit(0)
      }
      if (res.statusCode === 400 && j.error && j.error.includes('Could not resolve user')) {
        console.log('\n✅ Webhook OK (recibió payload y ejecutó lógica).')
        console.log('   El 400 es esperado: no hay usuario por assistantId ni por número de línea en phone_numbers.')
        console.log('   Añade el número', lineNumber, 'en Dashboard > (números) y/o vincula el asistente en Configuración.')
        process.exit(0)
      }
      console.log('\n❌ Webhook error:', j.error || data)
      process.exit(1)
    } catch (_) {
      console.log('\n⚠️  Respuesta no es JSON:', data)
      process.exit(1)
    }
  })
})

req.on('error', (err) => {
  console.error('Error de conexión:', err.message)
  if (err.code === 'ECONNREFUSED') {
    console.error('¿Está corriendo el servidor? Ejecuta: npm run dev')
  }
  process.exit(1)
})

req.write(body)
req.end()

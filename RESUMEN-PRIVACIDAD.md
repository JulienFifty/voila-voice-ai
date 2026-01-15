# Resumen Ejecutivo: Privacidad y Seguridad - Voila Voice AI

## Respuestas Directas a tus Preguntas

### 1. ¿La plataforma graba las conversaciones?

**Sí, de forma opcional.**

- Las conversaciones pueden ser grabadas a través de Vapi si está habilitado en tu configuración
- Las grabaciones se almacenan en URLs seguras proporcionadas por Vapi
- Solo el usuario que realizó la llamada puede acceder a sus grabaciones

---

### 2. ¿Recabamos cookies o web beacons? ¿Dirección IP?

**Cookies: SÍ, solo las esenciales para autenticación.**
- Solo cookies de Supabase para mantener la sesión del usuario
- **NO utilizamos:**
  - Cookies de seguimiento (tracking)
  - Cookies de marketing
  - Web beacons o pixel tracking

**IP: NO recabamos explícitamente.**
- Pueden aparecer en logs técnicos del servidor según políticas estándar de los proveedores
- No almacenamos IPs en nuestra base de datos

---

### 3. ¿Hacemos minería de datos?

**NO.**

- No procesamos datos para extraer información comercial
- No vendemos datos a terceros
- No utilizamos datos para entrenar modelos de IA propios
- No compartimos datos con fines publicitarios

---

### 4. ¿Qué datos específicos recabamos?

**Datos de Usuario:**
- Email (para autenticación)
- Password encriptado (nunca en texto plano)
- User ID (identificador único)

**Datos de Llamadas:**
- ID de la llamada
- Fecha y hora
- Número telefónico o tipo ("Web Call")
- Duración en segundos
- Estado (contestada/perdida)
- URL de grabación (si disponible)
- Transcripción de texto (si disponible)
- User ID (asociado al usuario)

**Cookies:**
- Solo cookies de sesión de Supabase para autenticación

---

### 5. ¿Vamos a facturar?

**No está implementado actualmente.**

Si se implementa en el futuro:
- Se manejaría a través de proveedores PCI-DSS compliant (ej: Stripe)
- **No se guardarían datos de tarjetas de crédito en nuestros servidores**
- Solo se recabarían datos estándar de facturación (empresa, dirección, NIF/CIF, etc.)

---

### 6. ¿Qué tipo de seguridad manejamos?

**Seguridad SaaS Profesional (Nivel Implementado)**

#### ✅ SÍ es razonable (lo que implementamos):

- ✅ **HTTPS/TLS** en toda la plataforma
- ✅ **Accesos protegidos** por usuario/contraseña
- ✅ **Acceso a datos solo personal autorizado** (Row Level Security - cada usuario solo ve sus datos)
- ✅ **Bases de datos no públicas** (Supabase - PostgreSQL seguro)
- ✅ **Logs básicos de acceso** (para auditoría)
- ✅ **Posibilidad de borrar datos a solicitud** (derecho al olvido)
- ✅ **Uso de proveedores cloud serios**:
  - **Vercel** (hosting de Next.js)
  - **Supabase** (base de datos y auth - PostgreSQL)
  - **Vapi** (servicios de voz con IA)

#### ❌ NO es razonable (lo que NO hacemos):

- ❌ Bases de datos abiertas sin autenticación
- ❌ Contraseñas compartidas o en texto plano
- ❌ Envío de grabaciones por WhatsApp personal o email no seguro
- ❌ Guardar audios en Google Drive público
- ❌ No saber quién accedió a qué (sin logs)
- ❌ Cookies de seguimiento o marketing
- ❌ Venta de datos a terceros

---

## Resumen Final

**Implementamos seguridad a nivel SaaS profesional, no nivel bancario, pero sí con medidas serias que protegen los datos de los usuarios y garantizan privacidad básica.**

---

## Comparación Rápida

| Aspecto | Implementado | Nivel Bancario |
|---------|-------------|----------------|
| HTTPS/TLS | ✅ Sí | ✅ Sí |
| Autenticación segura | ✅ Sí | ✅ Sí |
| Row Level Security | ✅ Sí | ✅ Sí |
| Encriptación de datos | ✅ Sí | ✅ Sí |
| Auditoría avanzada | ⚠️ Básica | ✅ Completa |
| Compliance certificado | ⚠️ No | ✅ Sí (PCI-DSS, etc.) |
| Seguro de datos | ⚠️ No | ✅ Sí |

**Conclusión:** Nivel SaaS profesional suficiente para plataformas de gestión de llamadas y asistentes virtuales.

---

## Documentación Completa

Para más detalles:
- Ver `PRIVACIDAD-SEGURIDAD.md` para la política completa
- Ver `/dashboard/settings` para información en el dashboard
- Ver `/privacy` para página pública de privacidad
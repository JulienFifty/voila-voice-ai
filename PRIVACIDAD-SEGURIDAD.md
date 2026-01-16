# Política de Privacidad y Seguridad - Voila Voice AI

## Resumen Ejecutivo

**Voila Voice AI** es una plataforma SaaS profesional para gestión de asistentes virtuales. Esta política describe qué datos recabamos, cómo los protegemos y qué medidas de seguridad implementamos.

---

## 1. ¿La plataforma graba las conversaciones?

**Sí, de forma opcional.**

- **Grabaciones de audio**: Las conversaciones pueden ser grabadas a través de Vapi (nuestro proveedor de servicios de voz).
  - Las grabaciones se almacenan en URLs seguras proporcionadas por Vapi
  - Solo se guardan si Vapi las proporciona al finalizar la llamada
  - El usuario puede configurar si desea grabar o no en su configuración de Vapi

- **Almacenamiento**: Las URLs de las grabaciones se guardan en nuestra base de datos (Supabase) asociadas a la cuenta del usuario que realizó la llamada
- **Acceso**: Solo el usuario autenticado que realizó la llamada puede acceder a sus grabaciones

---

## 2. ¿Recabamos cookies o web beacons? ¿Dirección IP?

### Cookies

**Sí, únicamente cookies esenciales para la autenticación.**

- **Cookies de Supabase**: Usamos cookies de sesión para autenticación de usuarios
  - Nombre: Cookies de autenticación de Supabase (como `sb-*-auth-token`)
  - Propósito: Mantener la sesión del usuario autenticado
  - Tipo: Cookies de sesión necesarias para el funcionamiento de la plataforma
  - No son cookies de seguimiento ni de terceros para marketing

- **No utilizamos**:
  - Cookies de seguimiento (tracking cookies)
  - Cookies de publicidad
  - Cookies de analytics de terceros (Google Analytics, etc.)
  - Web beacons o pixel tracking

### Dirección IP

**No recabamos explícitamente direcciones IP.**

- Las direcciones IP pueden aparecer en logs de servidor (Next.js/Vercel) por motivos técnicos legítimos
- No almacenamos direcciones IP en nuestra base de datos
- Los logs de servidor se mantienen según políticas estándar del proveedor (Vercel/Supabase)

---

## 3. ¿Hacemos minería de datos?

**No.**

- No procesamos los datos para extraer información comercial
- No vendemos datos a terceros
- No utilizamos datos de usuarios para entrenar modelos de IA propios
- No compartimos datos con fines publicitarios

**Lo que SÍ hacemos:**
- Almacenamos datos necesarios para proporcionar el servicio (llamadas, transcripciones, grabaciones)
- Los datos se utilizan únicamente para que el usuario pueda acceder a su historial de llamadas

---

## 4. ¿Qué datos específicos recabamos?

### Datos de usuario (autenticación)
- **Email**: Requerido para crear cuenta e iniciar sesión
- **Password**: Encriptado por Supabase (no almacenamos contraseñas en texto plano)
- **User ID**: Identificador único generado por Supabase Auth

### Datos de llamadas
Para cada llamada registrada en la plataforma:

```typescript
{
  id: string                    // ID único de la llamada
  created_at: string            // Fecha y hora de la llamada
  phone_number: string          // Número o "Web Call" para llamadas web
  duration_seconds: number      // Duración en segundos
  status: 'answered' | 'missed' // Estado de la llamada
  recording_url: string | null  // URL de grabación (si disponible)
  transcript: string | null     // Transcripción de texto (si disponible)
  user_id: string               // ID del usuario que realizó la llamada
}
```

### Datos técnicos
- **Logs de acceso**: Next.js puede registrar accesos por motivos técnicos
- **Tokens de sesión**: Almacenados en cookies seguras para autenticación

---

## 5. ¿Vamos a facturar?

**No está implementado actualmente, pero puede agregarse en el futuro.**

- Actualmente la plataforma no tiene sistema de facturación
- Si se implementa en el futuro, se recabarían datos de facturación estándar:
  - Información de empresa/cliente
  - Datos de facturación (dirección, NIF/CIF, etc.)
  - Métodos de pago (a través de proveedores seguros como Stripe)

**No se guardará información de tarjetas de crédito en nuestros servidores** - esto se manejaría a través de proveedores PCI-DSS compliant como Stripe.

---

## 6. ¿Qué tipo de seguridad manejamos?

### ✅ Seguridad SaaS Profesional (Nivel Implementado)

#### Encriptación y Comunicación
- **HTTPS/TLS**: Toda la comunicación es encriptada en tránsito
- **Conexiones seguras**: Todas las API calls usan HTTPS
- **WebRTC seguro**: Las llamadas de voz se realizan a través de conexiones encriptadas

#### Autenticación y Autorización
- **Autenticación por email/contraseña**: Implementada mediante Supabase Auth
- **Passwords encriptados**: Las contraseñas nunca se almacenan en texto plano
- **Tokens de sesión seguros**: Manejo de tokens JWT con cookies HttpOnly cuando es posible
- **Row Level Security (RLS)**: Supabase implementa políticas de seguridad a nivel de base de datos
  - Cada usuario solo puede acceder a sus propios datos
  - Las políticas RLS se aplican automáticamente en todas las queries

#### Acceso a Datos
- **Solo personal autorizado**: 
  - Los datos solo son accesibles para el usuario autenticado
  - Los administradores de Supabase (proveedor) tienen acceso técnico por motivos de mantenimiento
- **Políticas de acceso**: Row Level Security garantiza aislamiento de datos por usuario

#### Base de Datos
- **Bases de datos no públicas**: Supabase almacena datos en servidores seguros, no accesibles públicamente
- **Backups automáticos**: Supabase realiza backups automáticos de los datos
- **Conexiones encriptadas**: Todas las conexiones a la base de datos están encriptadas

#### Infraestructura Cloud
- **Proveedores serios**: 
  - **Vercel** (hosting de Next.js): Infraestructura cloud profesional
  - **Supabase** (base de datos y auth): Infraestructura basada en PostgreSQL, similar a AWS RDS
  - **Vapi** (servicios de voz): Proveedor especializado en servicios de voz con IA
- **Certificaciones**: Los proveedores mantienen certificaciones de seguridad estándar de la industria

#### Logs y Auditoría
- **Logs de acceso básicos**: Registro de actividades de autenticación y acceso
- **Posibilidad de auditoría**: Los logs permiten rastrear accesos si es necesario

#### Derechos del Usuario
- **Derecho al olvido**: Posibilidad de eliminar datos a solicitud del usuario
  - El usuario puede eliminar sus propias llamadas desde la interfaz
  - La eliminación de cuenta puede solicitarse y procesarse
- **Exportación de datos**: Los usuarios pueden acceder a todos sus datos a través de la interfaz

### ❌ Lo que NO hacemos (prácticas no profesionales)

- ❌ Bases de datos abiertas sin autenticación
- ❌ Contraseñas compartidas o en texto plano
- ❌ Envío de datos sensibles por canales no seguros (WhatsApp, email no encriptado, etc.)
- ❌ Almacenamiento de grabaciones en servicios públicos (Google Drive público, etc.)
- ❌ Falta de control de acceso (cualquiera puede ver cualquier dato)
- ❌ Sin logs de acceso (no saber quién accedió a qué)

---

## 7. Medidas Adicionales de Privacidad

### Retención de Datos
- Los datos se mantienen mientras el usuario tenga cuenta activa
- Los usuarios pueden eliminar sus datos en cualquier momento
- Al eliminar una cuenta, se pueden eliminar todas las llamadas asociadas (CASCADE en la base de datos)

### Transferencia de Datos
- Los datos se almacenan en servidores de Supabase (posiblemente en regiones específicas según configuración)
- Las llamadas se procesan a través de Vapi (servicios de voz)
- No transferimos datos a terceros para fines comerciales

### Cumplimiento Legal
- Esta política está diseñada para cumplir con regulaciones de privacidad básicas
- Para cumplimiento completo con GDPR, LGPD, o regulaciones específicas, se recomienda revisión legal profesional

---

## 8. Contacto para Consultas de Privacidad

Para consultas sobre privacidad, eliminación de datos, o acceso a información:

- **Solicitud de eliminación de datos**: Contactar al administrador del sistema
- **Consulta de acceso a datos**: Los usuarios pueden acceder a todos sus datos a través del dashboard

---

## Actualización de esta Política

Esta política puede actualizarse para reflejar cambios en la plataforma. Se recomienda revisar periódicamente.

**Última actualización**: Enero 2026

---

## Ejemplo de Implementación Técnica

### Row Level Security (RLS) en Supabase

```sql
-- Los usuarios solo pueden ver sus propias llamadas
CREATE POLICY "Users can view their own calls"
  ON calls FOR SELECT
  USING (auth.uid() = user_id);
```

### Autenticación Segura

```typescript
// Las cookies de autenticación se manejan de forma segura
const supabase = createClient({
  cookies: {
    getAll() { /* obtener cookies */ },
    setAll(cookies) { 
      // Cookies con HttpOnly, Secure, SameSite según configuración
    }
  }
})
```

---

**Resumen**: Implementamos seguridad a nivel SaaS profesional, con medidas serias que protegen los datos de los usuarios y garantizan privacidad básica.
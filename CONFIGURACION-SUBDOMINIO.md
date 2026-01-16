# Configuración del Subdominio app.voilavoiceai.com

Esta guía te ayudará a configurar el subdominio `app.voilavoiceai.com` para que todo el dashboard esté separado del sitio principal.

## 📋 Pasos a Seguir

### 1. Configuración DNS en Hostinger

1. **Accede al panel de Hostinger**
   - Ve a tu cuenta de Hostinger
   - Accede al administrador de dominios

2. **Agrega registro DNS tipo CNAME**
   - Tipo: `CNAME`
   - Nombre/Host: `app`
   - Valor/Points to: `cname.vercel-dns.com`
   - TTL: `3600` (o el predeterminado)

   **O si prefieres usar A Record (más directo):**
   - Tipo: `A`
   - Nombre/Host: `app`
   - Valor/IP: (Obtén la IP de Vercel, generalmente es la misma IP de tu dominio principal)
   - TTL: `3600`

### 2. Configuración en Vercel

1. **Ve a tu proyecto en Vercel Dashboard**
   - https://vercel.com/dashboard

2. **Agrega el dominio personalizado**
   - Ve a: `Settings` > `Domains`
   - Haz clic en `Add Domain`
   - Ingresa: `app.voilavoiceai.com`
   - Haz clic en `Add`

3. **Verifica el dominio**
   - Vercel verificará automáticamente la configuración DNS
   - Puede tardar unos minutos hasta que se propague el DNS

4. **Configura las variables de entorno**
   - Asegúrate de que todas las variables de entorno estén configuradas:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `VAPI_API_KEY`
     - `NEXT_PUBLIC_VAPI_PUBLIC_KEY`
     - `NEXT_PUBLIC_VAPI_ASSISTANT_ID`
     - `NEXT_PUBLIC_VAPI_ASSISTANT_NAME`

### 3. Verificación

Una vez configurado:

- **Sitio principal**: `https://voilavoiceai.com` → Landing page
- **Dashboard**: `https://app.voilavoiceai.com` → Dashboard completo

### 4. Comportamiento

- ✅ `app.voilavoiceai.com` → Redirige automáticamente a `/dashboard`
- ✅ `app.voilavoiceai.com/` → Redirige a `/dashboard`
- ✅ `app.voilavoiceai.com/login` → Página de login (permitido)
- ✅ `app.voilavoiceai.com/register` → Página de registro (permitido)
- ✅ `app.voilavoiceai.com/dashboard/*` → Todas las rutas del dashboard

- ❌ `voilavoiceai.com/dashboard` → En producción, redirige a `app.voilavoiceai.com`

### 5. Cookies y Autenticación

Las cookies de autenticación funcionarán correctamente entre ambos dominios ya que están en el mismo dominio base (`voilavoiceai.com`). Sin embargo, si necesitas compartir cookies entre subdominios:

- Configura las cookies con `domain: '.voilavoiceai.com'` en tu configuración de Supabase
- Esto permitirá que las cookies funcionen en ambos subdominios

## 🔧 Desarrollo Local

Para probar localmente:

1. **Edita tu archivo `/etc/hosts`** (macOS/Linux):
   ```bash
   sudo nano /etc/hosts
   ```
   
   Agrega:
   ```
   127.0.0.1 app.voilavoiceai.local
   ```

2. **Ejecuta Next.js con hostname personalizado**:
   ```bash
   next dev -H app.voilavoiceai.local
   ```

3. **Accede a**: `http://app.voilavoiceai.local:3000`

## 🚨 Troubleshooting

### El dominio no resuelve
- Espera 24-48 horas para la propagación completa de DNS
- Verifica en: https://dnschecker.org/#CNAME/app.voilavoiceai.com

### Error 404 en Vercel
- Verifica que el dominio esté agregado correctamente en Vercel
- Asegúrate de que el proyecto esté desplegado

### Las cookies no funcionan
- Verifica que las cookies estén configuradas con el dominio correcto
- En desarrollo, usa `localhost` o un dominio local

### Redirects infinitos
- Verifica la configuración del middleware
- Asegúrate de que no haya conflictos en las redirecciones

## 📝 Notas Importantes

- El subdominio `app.voilavoiceai.com` está completamente separado del dominio principal
- El middleware automáticamente redirige la raíz del subdominio app a `/dashboard`
- Todas las rutas del dashboard funcionan normalmente en el subdominio
- El login y registro también funcionan en el subdominio app

## 🎯 Resultado Final

- ✅ Landing page limpia en: `voilavoiceai.com`
- ✅ Dashboard completo en: `app.voilavoiceai.com`
- ✅ Separación clara entre marketing y aplicación
- ✅ Mejor SEO y organización

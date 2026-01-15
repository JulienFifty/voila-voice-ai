# Variables de Entorno para Vercel

## Variables Requeridas

Cuando despliegues en Vercel, configura estas variables de entorno:

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL` = Tu URL de Supabase (ej: `https://xxxxx.supabase.co`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Tu anon key de Supabase

### Vapi
- `VAPI_API_KEY` = Tu API key privada de Vapi (server-side, no se expone al cliente)
- `NEXT_PUBLIC_VAPI_PUBLIC_KEY` = Tu public key de Vapi (sí se expone al cliente)
- `NEXT_PUBLIC_VAPI_ASSISTANT_ID` = Tu assistant ID de Vapi (opcional pero recomendado)
- `NEXT_PUBLIC_VAPI_ASSISTANT_NAME` = Nombre del agente (opcional)

## Pasos para Configurar en Vercel

1. En la página de configuración del proyecto en Vercel
2. Ve a **Settings** > **Environment Variables**
3. Agrega cada variable una por una
4. Selecciona los entornos: **Production**, **Preview**, y **Development**
5. Haz clic en **Save**
6. Ve a **Deployments** y haz **Redeploy** si ya hiciste un deploy

## Nota Importante

- Las variables que empiezan con `NEXT_PUBLIC_` son accesibles desde el cliente (navegador)
- Las variables sin `NEXT_PUBLIC_` son solo accesibles en el servidor (más seguras)
- `VAPI_API_KEY` NO debe tener el prefijo `NEXT_PUBLIC_` porque es privada

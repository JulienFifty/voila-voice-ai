# Instrucciones para subir a GitHub

## Paso 1: Crear repositorio en GitHub

1. Ve a https://github.com/new
2. Nombre: `voila-voice-ai`
3. Descripción: "Plataforma SaaS de asistentes virtuales de voz con Next.js y Vapi"
4. **NO marques** "Add a README file", ".gitignore" ni "license"
5. Haz clic en "Create repository"

## Paso 2: Ejecutar estos comandos

Después de crear el repositorio, GitHub te dará una URL como:
`https://github.com/TU-USUARIO/voila-voice-ai.git`

Ejecuta estos comandos en tu terminal (reemplaza TU-USUARIO con tu usuario de GitHub):

```bash
cd /Users/julienthibeault/voila-voice-ai
git remote add origin https://github.com/TU-USUARIO/voila-voice-ai.git
git branch -M main
git push -u origin main
```

Si GitHub te pide autenticación, usa un Personal Access Token en lugar de contraseña.

## Paso 3: Conectar con Vercel

Una vez subido a GitHub:

1. Ve a https://vercel.com
2. Haz clic en "Add New Project"
3. Selecciona "Import Git Repository"
4. Conecta tu cuenta de GitHub si no está conectada
5. Selecciona el repositorio `voila-voice-ai`
6. Configura las variables de entorno (ver abajo)
7. Haz clic en "Deploy"

## Variables de entorno para Vercel

Configura estas variables en Vercel:

- `NEXT_PUBLIC_SUPABASE_URL` = tu URL de Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = tu anon key de Supabase
- `VAPI_API_KEY` = tu API key privada de Vapi
- `NEXT_PUBLIC_VAPI_PUBLIC_KEY` = tu public key de Vapi
- `NEXT_PUBLIC_VAPI_ASSISTANT_ID` = tu assistant ID de Vapi (opcional)
- `NEXT_PUBLIC_VAPI_ASSISTANT_NAME` = nombre del agente (opcional)

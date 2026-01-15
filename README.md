# Voila Voice AI Dashboard

Dashboard de agente IA de voz construido con Next.js, React, Tailwind CSS y Supabase.

## Características

- 🔐 Autenticación con Supabase Auth
- 📞 Gestión de llamadas con transcripciones y grabaciones
- 📊 Analytics y estadísticas
- ⚙️ Configuración del sistema
- 🎨 Diseño moderno y responsivo

## Configuración

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
Crea un archivo `.env.local` con:
```
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

3. Ejecutar en desarrollo:
```bash
npm run dev
```

## Estructura del Proyecto

- `/app` - Rutas y páginas de Next.js
- `/components` - Componentes reutilizables
- `/lib` - Utilidades y configuración de Supabase
- `/types` - Tipos TypeScript

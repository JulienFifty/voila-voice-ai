# Panel de Administración - Especificación

## 📋 Funcionalidades del Panel Admin

### 1. Dashboard Principal
- **Resumen general:**
  - Total de usuarios
  - Usuarios activos
  - Total de llamadas del mes
  - Total de minutos usados del mes
  - Ingresos del mes
  - Crecimiento de usuarios (gráfica)

### 2. Gestión de Usuarios
- **Lista de usuarios:**
  - Email
  - Nombre completo
  - Plan actual
  - Estado (activo/inactivo)
  - Minutos usados este mes
  - Llamadas este mes
  - Fecha de registro
  - Última actividad
  
- **Acciones por usuario:**
  - Ver detalles completos
  - Cambiar plan
  - Activar/Desactivar cuenta
  - Ver sus llamadas/leads
  - Editar información
  - Imprimir resumen

### 3. Gestión de Planes
- **Ver todos los planes:**
  - Nombre
  - Precio mensual/anual
  - Límites (minutos, llamadas, leads)
  - Features
  - Usuarios en cada plan
  
- **Acciones:**
  - Crear nuevo plan
  - Editar plan existente
  - Activar/Desactivar plan

### 4. Tracking de Uso
- **Ver uso por usuario:**
  - Mes actual
  - Histórico mensual
  - Gráficas de uso
  - Comparación con límites del plan
  
- **Ver uso global:**
  - Total de minutos del mes
  - Total de llamadas del mes
  - Usuarios que están cerca de su límite
  - Alertas de sobreuso

### 5. Estadísticas y Reportes
- **Gráficas:**
  - Crecimiento de usuarios por mes
  - Llamadas por mes
  - Ingresos por mes
  - Distribución de planes
  - Top usuarios por uso
  
- **Exportar:**
  - CSV de usuarios
  - CSV de uso
  - Reporte mensual PDF

### 6. Configuración
- **Configuración general:**
  - Límites por defecto
  - Precios de planes
  - Configuración de facturación
  - Integraciones

---

## 🔐 Seguridad

### Roles:
- **super_admin**: Acceso total
- **admin**: Gestión de usuarios y planes
- **user**: Solo acceso a su dashboard

### Protección de Rutas:
- `/admin/*` solo accesible para admins
- Middleware verifica rol antes de permitir acceso
- RLS en Supabase asegura aislamiento de datos

---

## 📊 Estructura de Datos

### Tablas Clave:
1. **plans**: Planes disponibles
2. **user_subscriptions**: Suscripciones de usuarios
3. **user_usage**: Tracking de uso mensual
4. **user_profiles**: Perfiles con roles
5. **calls**: Llamadas (ya existe)
6. **leads**: Leads (ya existe)

### Relaciones:
- `user_profiles.user_id` → `auth.users.id`
- `user_subscriptions.user_id` → `auth.users.id`
- `user_subscriptions.plan_id` → `plans.id`
- `user_usage.user_id` → `auth.users.id`

---

## 🎯 Rutas del Panel Admin

```
/admin
  /dashboard          → Dashboard principal
  /users              → Lista de usuarios
  /users/[id]         → Detalle de usuario
  /plans              → Gestión de planes
  /usage              → Tracking de uso
  /reports            → Reportes y estadísticas
  /settings           → Configuración
```

---

## 📱 Componentes Necesarios

1. **AdminDashboard** → Dashboard principal
2. **UsersList** → Lista de usuarios con filtros
3. **UserDetail** → Detalle completo de usuario
4. **PlansManager** → Gestión de planes
5. **UsageTracker** → Tracking de uso
6. **Reports** → Reportes y gráficas
7. **AdminSidebar** → Navegación admin
8. **UserCard** → Card de usuario con info clave
9. **PlanCard** → Card de plan
10. **UsageChart** → Gráficas de uso

---

## 🚀 Funcionalidades Implementadas

✅ Schema SQL completo (planes, suscripciones, uso, perfiles)
✅ Triggers automáticos para tracking de uso
✅ Funciones helper para obtener uso
✅ Sistema de roles (admin/user)
✅ RLS configurado

⏳ Pendiente:
- Páginas admin
- Middleware de protección
- Componentes de UI
- API routes para admin

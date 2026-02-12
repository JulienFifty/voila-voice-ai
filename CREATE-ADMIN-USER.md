# Crear Usuario Admin

## Pasos para crear un usuario admin

### Opción 1: Usuario ya existe en Supabase Auth

Si ya tienes un usuario creado en Supabase Auth:

```sql
-- 1. Obtener el user_id de tu usuario
SELECT id, email FROM auth.users WHERE email = 'tu-email@example.com';

-- 2. Crear perfil admin (reemplazar USER_ID con el ID obtenido arriba)
INSERT INTO user_profiles (
  user_id,
  role,
  active,
  full_name
) VALUES (
  'USER_ID_AQUI',  -- UUID del usuario
  'admin',         -- o 'super_admin' para super admin
  TRUE,
  'Tu Nombre'
) ON CONFLICT (user_id) DO UPDATE 
SET role = 'admin', active = TRUE;

-- 3. Verificar que se creó correctamente
SELECT * FROM user_profiles WHERE user_id = 'USER_ID_AQUI';
```

### Opción 2: Crear usuario completo desde cero

```sql
-- 1. Crear usuario en Supabase Auth (necesitas hacerlo desde el dashboard de Supabase)
-- O usar el dashboard de Supabase: Authentication -> Users -> Add user

-- 2. Una vez creado, obtener el user_id
SELECT id, email FROM auth.users WHERE email = 'admin@example.com';

-- 3. Crear perfil admin
INSERT INTO user_profiles (
  user_id,
  role,
  active,
  full_name
) VALUES (
  'USER_ID_AQUI',
  'admin',
  TRUE,
  'Administrador'
);
```

### Verificar que eres admin

1. Inicia sesión con tu cuenta
2. Intenta acceder a `/admin/dashboard`
3. Si te redirige a `/dashboard`, verifica:
   - Que el perfil existe: `SELECT * FROM user_profiles WHERE user_id = 'TU_USER_ID';`
   - Que `role = 'admin'` o `'super_admin'`
   - Que `active = TRUE`

### Solución de problemas

**Problema: Me redirige a /dashboard cuando intento acceder a /admin**

Solución:
1. Verifica que tienes un perfil en `user_profiles`
2. Verifica que `role = 'admin'` o `'super_admin'`
3. Verifica que `active = TRUE`
4. Intenta limpiar las cookies y volver a iniciar sesión

**Verificar desde SQL:**
```sql
-- Ver tu perfil
SELECT * FROM user_profiles 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'tu-email@example.com'
);

-- Si no existe, crearlo
INSERT INTO user_profiles (user_id, role, active, full_name)
SELECT id, 'admin', TRUE, 'Admin'
FROM auth.users
WHERE email = 'tu-email@example.com'
ON CONFLICT (user_id) DO UPDATE 
SET role = 'admin', active = TRUE;
```

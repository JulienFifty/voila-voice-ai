# Vincular asistente VAPI en Supabase (user_assistants)

El webhook identifica al usuario por **Assistant ID** de VAPI. Ese ID debe existir en la tabla `user_assistants`.

**No confundir:**
- **Assistant ID** (VAPI): `2a7481eb-0b26-49c8-b6ba-51dbde22a692` → es el asistente (ej. "Sofia - Alitas")
- **Voice ID** (Cartesia): `5c5ad5e7-1020-476b-8b91-fdcbe9cc313c` → solo la voz, no uses este en `user_assistants`

---

## 1. Comprobar si ya existe el vínculo

En **Supabase → SQL Editor** ejecuta:

```sql
SELECT id, user_id, vapi_assistant_id, vapi_assistant_name, active
FROM user_assistants
WHERE vapi_assistant_id = '2a7481eb-0b26-49c8-b6ba-51dbde22a692';
```

- Si devuelve **una fila**: el vínculo existe, el webhook podrá resolver el usuario.
- Si devuelve **vacío**: hay que crear el registro (o vincular desde Dashboard → Configuración).

---

## 2. Crear el vínculo por SQL (si no existe)

Sustituye `TU_USER_ID_AQUI` por tu UUID de usuario (lo ves en **Supabase → Table Editor → auth.users** o en **user_profiles**):

```sql
INSERT INTO user_assistants (user_id, vapi_assistant_id, vapi_assistant_name, active)
VALUES (
  'TU_USER_ID_AQUI',
  '2a7481eb-0b26-49c8-b6ba-51dbde22a692',
  'Sofia - Alitas',
  true
)
ON CONFLICT (user_id, vapi_assistant_id) DO UPDATE SET
  vapi_assistant_name = EXCLUDED.vapi_assistant_name,
  active = true,
  updated_at = now();
```

---

## 3. O vincular desde la app

**Dashboard → Configuración → Asistente de IA**

- **Assistant ID:** `2a7481eb-0b26-49c8-b6ba-51dbde22a692`
- **Nombre:** Sofia - Alitas  
Guardar. Eso crea/actualiza la fila en `user_assistants`.

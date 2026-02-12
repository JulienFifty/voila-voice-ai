-- Migración: Integración VAPI con Restaurante
-- Agregar user_id y extracted_data a campaign_calls
-- Actualizar referencias de call_id en pedidos/reservaciones

-- 1. Agregar columnas a campaign_calls
ALTER TABLE campaign_calls ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE campaign_calls ADD COLUMN IF NOT EXISTS extracted_data JSONB;

-- 2. Migrar user_id desde campaigns a campaign_calls
UPDATE campaign_calls cc
SET user_id = c.user_id
FROM campaigns c
WHERE cc.campaign_id = c.id
  AND cc.user_id IS NULL;

-- 3. Crear índice para user_id en campaign_calls
CREATE INDEX IF NOT EXISTS campaign_calls_user_id_idx ON campaign_calls(user_id);

-- 4. Agregar tipo_entrega y direccion_entrega a pedidos
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS tipo_entrega TEXT DEFAULT 'recoger' CHECK (tipo_entrega IN ('recoger', 'domicilio'));
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS direccion_entrega TEXT;

-- 5. Crear índices para call_id
CREATE INDEX IF NOT EXISTS pedidos_call_id_idx ON pedidos(call_id);
CREATE INDEX IF NOT EXISTS reservaciones_call_id_idx ON reservaciones(call_id);

-- Verificar resultados
SELECT 'campaign_calls: ' || COUNT(*) || ' registros con user_id actualizado' FROM campaign_calls WHERE user_id IS NOT NULL;
SELECT 'pedidos: ' || COUNT(*) || ' registros' FROM pedidos;
SELECT 'reservaciones: ' || COUNT(*) || ' registros' FROM reservaciones;

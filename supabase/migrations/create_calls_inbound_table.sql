-- ============================================
-- Migración: Crear tabla calls para llamadas INBOUND
-- Agregar campos hora_recogida y ocasion_especial
-- ============================================

-- PASO 1: Eliminar tabla 'calls' antigua si existe (para recrearla con nuevo schema)
-- Esto es seguro si no tienes datos importantes en la tabla vieja
DROP TABLE IF EXISTS calls CASCADE;

-- PASO 2: Crear tabla 'calls' para llamadas ENTRANTES (inbound)
-- Esta tabla es diferente de 'campaign_calls' que es para llamadas SALIENTES (outbound)
CREATE TABLE calls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  
  -- Usuario dueño del negocio
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Info de la llamada VAPI
  vapi_call_id TEXT UNIQUE,
  phone_number TEXT,
  duration_seconds INTEGER,
  status TEXT NOT NULL DEFAULT 'answered' CHECK (status IN ('answered', 'missed', 'failed')),
  
  -- Contenido
  recording_url TEXT,
  transcript TEXT,
  extracted_data JSONB,
  
  -- Timestamps VAPI
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE
);

-- PASO 3: Habilitar RLS para calls
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

-- PASO 4: Políticas RLS
DROP POLICY IF EXISTS "Users can view their own calls" ON calls;
DROP POLICY IF EXISTS "Users can insert their own calls" ON calls;
DROP POLICY IF EXISTS "Users can update their own calls" ON calls;
DROP POLICY IF EXISTS "Users can delete their own calls" ON calls;

CREATE POLICY "Users can view their own calls"
  ON calls FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calls"
  ON calls FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calls"
  ON calls FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calls"
  ON calls FOR DELETE
  USING (auth.uid() = user_id);

-- PASO 5: Crear índices
CREATE INDEX calls_user_id_idx ON calls(user_id);
CREATE INDEX calls_created_at_idx ON calls(created_at DESC);
CREATE INDEX calls_status_idx ON calls(status);
CREATE INDEX calls_vapi_call_id_idx ON calls(vapi_call_id);

-- PASO 6: Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_calls_updated_at ON calls;
CREATE TRIGGER update_calls_updated_at BEFORE UPDATE ON calls
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- PASO 7: Agregar hora_recogida a pedidos
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS hora_recogida TIME;

-- PASO 8: Agregar ocasion_especial a reservaciones
ALTER TABLE reservaciones ADD COLUMN IF NOT EXISTS ocasion_especial TEXT;

-- PASO 9: Verificar que call_id de pedidos/reservaciones apunte a 'calls' (no 'campaign_calls')
-- Nota: Si tienes datos existentes en pedidos/reservaciones que apuntan a campaign_calls,
-- NO cambies la FK ahora. Mejor crea una columna nueva o maneja ambos casos.
-- Por simplicidad, asumimos que empiezas desde cero o manejarás esto manualmente.

-- ============================================
-- VERIFICACIÓN
-- ============================================
SELECT 'Tabla calls creada exitosamente' as mensaje
UNION ALL
SELECT 'Columnas agregadas a pedidos y reservaciones' as mensaje;

-- Mostrar estructura de la tabla calls
SELECT 
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'calls' 
ORDER BY ordinal_position;

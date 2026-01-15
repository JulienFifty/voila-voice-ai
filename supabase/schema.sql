-- Crear tabla de llamadas (si no existe)
CREATE TABLE IF NOT EXISTS calls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  phone_number TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('answered', 'missed')),
  recording_url TEXT,
  transcript TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Si la tabla ya existe con columnas antiguas, actualizarlas
-- Renombrar caller_number a phone_number si existe
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'calls' AND column_name = 'caller_number'
  ) THEN
    ALTER TABLE calls RENAME COLUMN caller_number TO phone_number;
  END IF;
END $$;

-- Renombrar duration a duration_seconds si existe
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'calls' AND column_name = 'duration'
  ) THEN
    ALTER TABLE calls RENAME COLUMN duration TO duration_seconds;
  END IF;
END $$;

-- Renombrar transcription a transcript si existe
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'calls' AND column_name = 'transcription'
  ) THEN
    ALTER TABLE calls RENAME COLUMN transcription TO transcript;
  END IF;
END $$;

-- Habilitar Row Level Security (RLS)
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view their own calls" ON calls;
DROP POLICY IF EXISTS "Users can insert their own calls" ON calls;
DROP POLICY IF EXISTS "Users can update their own calls" ON calls;
DROP POLICY IF EXISTS "Users can delete their own calls" ON calls;

-- Crear políticas para que los usuarios solo vean sus propias llamadas
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

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS calls_user_id_idx ON calls(user_id);
CREATE INDEX IF NOT EXISTS calls_created_at_idx ON calls(created_at DESC);
CREATE INDEX IF NOT EXISTS calls_status_idx ON calls(status);

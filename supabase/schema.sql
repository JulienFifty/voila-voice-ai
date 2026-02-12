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

-- ============================================
-- MÓDULO INMOBILIARIO: Campos adicionales para calls
-- ============================================

-- Agregar columnas inmobiliarias a la tabla calls (sin FK todavía)
ALTER TABLE calls ADD COLUMN IF NOT EXISTS extracted_data JSONB;
ALTER TABLE calls ADD COLUMN IF NOT EXISTS tipo_interes TEXT CHECK (tipo_interes IN ('compra', 'renta', 'venta', 'info'));
ALTER TABLE calls ADD COLUMN IF NOT EXISTS zona_interes TEXT[];
ALTER TABLE calls ADD COLUMN IF NOT EXISTS presupuesto_min DECIMAL(15,2);
ALTER TABLE calls ADD COLUMN IF NOT EXISTS presupuesto_max DECIMAL(15,2);
ALTER TABLE calls ADD COLUMN IF NOT EXISTS urgencia TEXT CHECK (urgencia IN ('alta', 'media', 'baja'));
ALTER TABLE calls ADD COLUMN IF NOT EXISTS score TEXT CHECK (score IN ('A', 'B', 'C'));
ALTER TABLE calls ADD COLUMN IF NOT EXISTS converted_to_lead BOOLEAN DEFAULT FALSE;

-- Índices adicionales para calls inmobiliarias (sin lead_id todavía)
CREATE INDEX IF NOT EXISTS calls_score_idx ON calls(score);
CREATE INDEX IF NOT EXISTS calls_tipo_interes_idx ON calls(tipo_interes);
CREATE INDEX IF NOT EXISTS calls_urgencia_idx ON calls(urgencia);

-- ============================================
-- MÓDULO INMOBILIARIO: Tabla de Leads
-- ============================================

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Info personal
  nombre TEXT NOT NULL,
  telefono TEXT NOT NULL,
  email TEXT,
  
  -- Info financiera
  presupuesto_min DECIMAL(15,2),
  presupuesto_max DECIMAL(15,2),
  tiene_preaprobacion BOOLEAN DEFAULT FALSE,
  banco TEXT,
  monto_aprobado DECIMAL(15,2),
  tipo_pago TEXT CHECK (tipo_pago IN ('contado', 'credito', 'mix')),
  
  -- Búsqueda
  tipo_busqueda TEXT CHECK (tipo_busqueda IN ('compra', 'renta', 'venta')),
  tipo_propiedad TEXT CHECK (tipo_propiedad IN ('casa', 'depa', 'terreno', 'otro')),
  zonas_interes TEXT[],
  recamaras INTEGER,
  baños INTEGER,
  estacionamientos INTEGER,
  amenidades TEXT[],
  
  -- Timeline
  urgencia TEXT CHECK (urgencia IN ('alta', 'media', 'baja')),
  timeline TEXT CHECK (timeline IN ('inmediato', '1-3meses', '3-6meses', '6+meses')),
  proximo_followup TIMESTAMP WITH TIME ZONE,
  
  -- Calificación
  score TEXT CHECK (score IN ('A', 'B', 'C')),
  estado TEXT NOT NULL DEFAULT 'nuevo' CHECK (estado IN ('nuevo', 'contactado', 'visita_agendada', 'negociacion', 'cerrado', 'perdido')),
  probabilidad_cierre INTEGER CHECK (probabilidad_cierre >= 0 AND probabilidad_cierre <= 100),
  valor_estimado DECIMAL(15,2),
  fuente TEXT CHECK (fuente IN ('llamada_ia', 'referido', 'open_house', 'redes_sociales', 'sitio_web', 'otro')),
  
  -- Tracking
  ultima_interaccion TIMESTAMP WITH TIME ZONE,
  numero_interacciones INTEGER DEFAULT 0,
  
  -- Notas
  notas TEXT
);

-- Habilitar RLS para leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para leads
DROP POLICY IF EXISTS "Users can view their own leads" ON leads;
DROP POLICY IF EXISTS "Users can insert their own leads" ON leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON leads;
DROP POLICY IF EXISTS "Users can delete their own leads" ON leads;

CREATE POLICY "Users can view their own leads"
  ON leads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own leads"
  ON leads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leads"
  ON leads FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own leads"
  ON leads FOR DELETE
  USING (auth.uid() = user_id);

-- Índices para leads
CREATE INDEX IF NOT EXISTS leads_user_id_idx ON leads(user_id);
CREATE INDEX IF NOT EXISTS leads_score_idx ON leads(score);
CREATE INDEX IF NOT EXISTS leads_estado_idx ON leads(estado);
CREATE INDEX IF NOT EXISTS leads_proximo_followup_idx ON leads(proximo_followup);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads(created_at DESC);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Ahora agregar la foreign key de lead_id a calls
ALTER TABLE calls ADD COLUMN IF NOT EXISTS lead_id UUID REFERENCES leads(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS calls_lead_id_idx ON calls(lead_id);

-- ============================================
-- MÓDULO INMOBILIARIO: Tabla de Actividades
-- ============================================

CREATE TABLE IF NOT EXISTS actividades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  tipo TEXT NOT NULL CHECK (tipo IN ('llamada', 'whatsapp', 'email', 'visita', 'nota')),
  descripcion TEXT,
  call_id UUID REFERENCES calls(id) ON DELETE SET NULL,
  
  metadata JSONB -- datos adicionales según tipo
);

-- Habilitar RLS para actividades
ALTER TABLE actividades ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para actividades
DROP POLICY IF EXISTS "Users can view their own activities" ON actividades;
DROP POLICY IF EXISTS "Users can insert their own activities" ON actividades;
DROP POLICY IF EXISTS "Users can update their own activities" ON actividades;
DROP POLICY IF EXISTS "Users can delete their own activities" ON actividades;

CREATE POLICY "Users can view their own activities"
  ON actividades FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities"
  ON actividades FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activities"
  ON actividades FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activities"
  ON actividades FOR DELETE
  USING (auth.uid() = user_id);

-- Índices para actividades
CREATE INDEX IF NOT EXISTS actividades_lead_id_idx ON actividades(lead_id);
CREATE INDEX IF NOT EXISTS actividades_user_id_idx ON actividades(user_id);
CREATE INDEX IF NOT EXISTS actividades_created_at_idx ON actividades(created_at DESC);
CREATE INDEX IF NOT EXISTS actividades_tipo_idx ON actividades(tipo);

-- ============================================
-- MÓDULO INMOBILIARIO: Tabla de Propiedades
-- ============================================

CREATE TABLE IF NOT EXISTS propiedades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  direccion TEXT NOT NULL,
  zona TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('casa', 'depa', 'terreno', 'otro')),
  precio DECIMAL(15,2) NOT NULL,
  m2_construccion DECIMAL(10,2),
  m2_terreno DECIMAL(10,2),
  recamaras INTEGER,
  baños INTEGER,
  estacionamientos INTEGER,
  
  estado TEXT NOT NULL DEFAULT 'disponible' CHECK (estado IN ('disponible', 'apartada', 'vendida')),
  
  descripcion TEXT,
  fotos TEXT[], -- URLs
  
  metadata JSONB
);

-- Habilitar RLS para propiedades
ALTER TABLE propiedades ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para propiedades
DROP POLICY IF EXISTS "Users can view their own properties" ON propiedades;
DROP POLICY IF EXISTS "Users can insert their own properties" ON propiedades;
DROP POLICY IF EXISTS "Users can update their own properties" ON propiedades;
DROP POLICY IF EXISTS "Users can delete their own properties" ON propiedades;

CREATE POLICY "Users can view their own properties"
  ON propiedades FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own properties"
  ON propiedades FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own properties"
  ON propiedades FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own properties"
  ON propiedades FOR DELETE
  USING (auth.uid() = user_id);

-- Índices para propiedades
CREATE INDEX IF NOT EXISTS propiedades_user_id_idx ON propiedades(user_id);
CREATE INDEX IF NOT EXISTS propiedades_estado_idx ON propiedades(estado);
CREATE INDEX IF NOT EXISTS propiedades_zona_idx ON propiedades(zona);
CREATE INDEX IF NOT EXISTS propiedades_tipo_idx ON propiedades(tipo);

-- ============================================
-- MÓDULO INMOBILIARIO: Tabla de Números Telefónicos
-- ============================================

CREATE TABLE IF NOT EXISTS phone_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  numero TEXT NOT NULL,
  nombre TEXT, -- ej: "Principal", "Premium", etc
  tipo TEXT CHECK (tipo IN ('principal', 'secundario', 'especializado')),
  
  -- Configuración
  uso_especifico TEXT, -- descripción de para qué se usa
  script_custom TEXT, -- script diferente para este número
  
  -- Stats
  total_llamadas INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT TRUE,
  
  UNIQUE(user_id, numero)
);

-- Habilitar RLS para phone_numbers
ALTER TABLE phone_numbers ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para phone_numbers
DROP POLICY IF EXISTS "Users can view their own phone numbers" ON phone_numbers;
DROP POLICY IF EXISTS "Users can insert their own phone numbers" ON phone_numbers;
DROP POLICY IF EXISTS "Users can update their own phone numbers" ON phone_numbers;
DROP POLICY IF EXISTS "Users can delete their own phone numbers" ON phone_numbers;

CREATE POLICY "Users can view their own phone numbers"
  ON phone_numbers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own phone numbers"
  ON phone_numbers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own phone numbers"
  ON phone_numbers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own phone numbers"
  ON phone_numbers FOR DELETE
  USING (auth.uid() = user_id);

-- Índices para phone_numbers
CREATE INDEX IF NOT EXISTS phone_numbers_user_id_idx ON phone_numbers(user_id);
CREATE INDEX IF NOT EXISTS phone_numbers_activo_idx ON phone_numbers(activo);

-- Columna para vincular con VAPI (número Twilio/importado en VAPI para outbound)
ALTER TABLE phone_numbers ADD COLUMN IF NOT EXISTS vapi_phone_number_id TEXT;

-- ============================================
-- MÓDULO CAMPAÑAS: Tabla de Campañas de Llamadas
-- ============================================

CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  vapi_assistant_id TEXT NOT NULL,
  vapi_phone_number_id TEXT NOT NULL,
  
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'running', 'completed', 'cancelled')),
  
  total_recipients INTEGER NOT NULL DEFAULT 0,
  completed_calls INTEGER NOT NULL DEFAULT 0,
  failed_calls INTEGER NOT NULL DEFAULT 0,
  
  assistant_overrides JSONB DEFAULT '{}',
  
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Habilitar RLS para campaigns
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can insert their own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can update their own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can delete their own campaigns" ON campaigns;

CREATE POLICY "Users can view their own campaigns"
  ON campaigns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own campaigns"
  ON campaigns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own campaigns"
  ON campaigns FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own campaigns"
  ON campaigns FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS campaigns_user_id_idx ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS campaigns_status_idx ON campaigns(status);
CREATE INDEX IF NOT EXISTS campaigns_created_at_idx ON campaigns(created_at DESC);

-- ============================================
-- MÓDULO CAMPAÑAS: Tabla de Llamadas de Campaña
-- ============================================

CREATE TABLE IF NOT EXISTS campaign_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  phone_number TEXT NOT NULL,
  nombre TEXT,
  email TEXT,
  
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'calling', 'answered', 'missed', 'failed')),
  
  vapi_call_id TEXT,
  duration_seconds INTEGER,
  recording_url TEXT,
  transcript TEXT,
  extracted_data JSONB,
  
  metadata JSONB DEFAULT '{}'
);

-- Habilitar RLS para campaign_calls (via campaign ownership)
ALTER TABLE campaign_calls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own campaign_calls" ON campaign_calls;
DROP POLICY IF EXISTS "Users can insert their own campaign_calls" ON campaign_calls;
DROP POLICY IF EXISTS "Users can update their own campaign_calls" ON campaign_calls;

CREATE POLICY "Users can view their own campaign_calls"
  ON campaign_calls FOR SELECT
  USING (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_calls.campaign_id AND campaigns.user_id = auth.uid()));
CREATE POLICY "Users can insert their own campaign_calls"
  ON campaign_calls FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_calls.campaign_id AND campaigns.user_id = auth.uid()));
CREATE POLICY "Users can update their own campaign_calls"
  ON campaign_calls FOR UPDATE
  USING (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_calls.campaign_id AND campaigns.user_id = auth.uid()));

-- Agregar columnas si no existen (para migración)
ALTER TABLE campaign_calls ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE campaign_calls ADD COLUMN IF NOT EXISTS extracted_data JSONB;

-- Migración: Actualizar user_id en registros existentes desde campaigns
UPDATE campaign_calls cc
SET user_id = c.user_id
FROM campaigns c
WHERE cc.campaign_id = c.id
  AND cc.user_id IS NULL;

CREATE INDEX IF NOT EXISTS campaign_calls_campaign_id_idx ON campaign_calls(campaign_id);
CREATE INDEX IF NOT EXISTS campaign_calls_status_idx ON campaign_calls(status);
CREATE INDEX IF NOT EXISTS campaign_calls_vapi_call_id_idx ON campaign_calls(vapi_call_id);
CREATE INDEX IF NOT EXISTS campaign_calls_user_id_idx ON campaign_calls(user_id);

DROP TRIGGER IF EXISTS update_campaign_calls_updated_at ON campaign_calls;
CREATE TRIGGER update_campaign_calls_updated_at BEFORE UPDATE ON campaign_calls
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- MÓDULO INMOBILIARIO: Tabla de User Assistants
-- ============================================

-- Tabla para vincular usuarios con sus assistants de VAPI
CREATE TABLE IF NOT EXISTS user_assistants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Configuración VAPI
  vapi_assistant_id TEXT NOT NULL UNIQUE,
  vapi_assistant_name TEXT,
  vapi_public_key TEXT, -- Public key de VAPI (opcional, para web calls)
  
  -- Configuración del agente
  agent_config JSONB, -- Configuración adicional del agente
  
  -- Estado
  active BOOLEAN DEFAULT TRUE,
  
  UNIQUE(user_id, vapi_assistant_id)
);

-- Habilitar RLS para user_assistants
ALTER TABLE user_assistants ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_assistants
DROP POLICY IF EXISTS "Users can view their own assistants" ON user_assistants;
DROP POLICY IF EXISTS "Users can insert their own assistants" ON user_assistants;
DROP POLICY IF EXISTS "Users can update their own assistants" ON user_assistants;
DROP POLICY IF EXISTS "Users can delete their own assistants" ON user_assistants;

CREATE POLICY "Users can view their own assistants"
  ON user_assistants FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assistants"
  ON user_assistants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assistants"
  ON user_assistants FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assistants"
  ON user_assistants FOR DELETE
  USING (auth.uid() = user_id);

-- Índices para user_assistants
CREATE INDEX IF NOT EXISTS user_assistants_user_id_idx ON user_assistants(user_id);
CREATE INDEX IF NOT EXISTS user_assistants_vapi_assistant_id_idx ON user_assistants(vapi_assistant_id);
CREATE INDEX IF NOT EXISTS user_assistants_active_idx ON user_assistants(active);

-- Trigger para actualizar updated_at en user_assistants
DROP TRIGGER IF EXISTS update_user_assistants_updated_at ON user_assistants;
CREATE TRIGGER update_user_assistants_updated_at BEFORE UPDATE ON user_assistants
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- MÓDULO ADMIN: Sistema de Planes y Uso
-- ============================================

-- Tabla de planes disponibles
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  
  name TEXT NOT NULL UNIQUE, -- "Básico", "Profesional", "Enterprise"
  slug TEXT NOT NULL UNIQUE, -- "basico", "profesional", "enterprise"
  
  -- Límites del plan
  max_minutes_per_month INTEGER, -- null = ilimitado
  max_calls_per_month INTEGER, -- null = ilimitado
  max_leads INTEGER, -- null = ilimitado
  
  -- Precio
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10,2),
  
  -- Características
  features JSONB, -- Array de features incluidas
  
  -- Estado
  active BOOLEAN DEFAULT TRUE,
  
  -- Orden de visualización
  display_order INTEGER DEFAULT 0
);

-- Insertar planes por defecto
INSERT INTO plans (name, slug, max_minutes_per_month, max_calls_per_month, max_leads, price_monthly, features, display_order) VALUES
('Básico', 'basico', 500, 100, 50, 2999, '["Llamadas web", "Dashboard básico", "CRM inmobiliario", "Extraction IA básica"]', 1),
('Profesional', 'profesional', 2000, 500, 200, 7999, '["Todo del Básico", "Analytics avanzado", "WhatsApp templates", "Priority support"]', 2),
('Enterprise', 'enterprise', NULL, NULL, NULL, 19999, '["Todo del Profesional", "Llamadas ilimitadas", "Custom integrations", "Dedicated support"]', 3)
ON CONFLICT (slug) DO NOTHING;

-- Tabla de suscripciones de usuarios
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
  
  -- Estado de la suscripción
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'expired', 'past_due')),
  
  -- Fechas
  started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  canceled_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  
  -- Facturación
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  
  -- Payment info (opcional, para tracking)
  payment_provider TEXT, -- "stripe", "paypal", "manual"
  payment_provider_subscription_id TEXT,
  
  UNIQUE(user_id) -- Un usuario solo puede tener una suscripción activa
);

-- Habilitar RLS para user_subscriptions
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_subscriptions (usuarios ven solo su suscripción)
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON user_subscriptions;

CREATE POLICY "Users can view their own subscriptions"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
  ON user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Índices para user_subscriptions
CREATE INDEX IF NOT EXISTS user_subscriptions_user_id_idx ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS user_subscriptions_plan_id_idx ON user_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS user_subscriptions_status_idx ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS user_subscriptions_current_period_end_idx ON user_subscriptions(current_period_end);

-- Trigger para updated_at en user_subscriptions
DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabla de tracking de uso mensual
CREATE TABLE IF NOT EXISTS user_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Período (mes/año)
  period_year INTEGER NOT NULL,
  period_month INTEGER NOT NULL CHECK (period_month >= 1 AND period_month <= 12),
  
  -- Métricas de uso
  total_minutes INTEGER DEFAULT 0,
  total_calls INTEGER DEFAULT 0,
  total_web_calls INTEGER DEFAULT 0,
  total_phone_calls INTEGER DEFAULT 0,
  total_leads_created INTEGER DEFAULT 0,
  
  -- Costo estimado (si aplica)
  estimated_cost DECIMAL(10,2) DEFAULT 0,
  
  -- Última actualización
  last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  UNIQUE(user_id, period_year, period_month)
);

-- Habilitar RLS para user_usage
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_usage
DROP POLICY IF EXISTS "Users can view their own usage" ON user_usage;
DROP POLICY IF EXISTS "Users can insert their own usage" ON user_usage;
DROP POLICY IF EXISTS "Users can update their own usage" ON user_usage;

CREATE POLICY "Users can view their own usage"
  ON user_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage"
  ON user_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage"
  ON user_usage FOR UPDATE
  USING (auth.uid() = user_id);

-- Índices para user_usage
CREATE INDEX IF NOT EXISTS user_usage_user_id_idx ON user_usage(user_id);
CREATE INDEX IF NOT EXISTS user_usage_period_idx ON user_usage(period_year, period_month);
CREATE INDEX IF NOT EXISTS user_usage_last_calculated_idx ON user_usage(last_calculated_at);

-- Trigger para updated_at en user_usage
DROP TRIGGER IF EXISTS update_user_usage_updated_at ON user_usage;
CREATE TRIGGER update_user_usage_updated_at BEFORE UPDATE ON user_usage
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para obtener o crear el uso del mes actual
CREATE OR REPLACE FUNCTION get_or_create_user_usage(
  p_user_id UUID,
  p_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW())::INTEGER,
  p_month INTEGER DEFAULT EXTRACT(MONTH FROM NOW())::INTEGER
) RETURNS UUID AS $$
DECLARE
  v_usage_id UUID;
BEGIN
  -- Intentar obtener uso existente
  SELECT id INTO v_usage_id
  FROM user_usage
  WHERE user_id = p_user_id
    AND period_year = p_year
    AND period_month = p_month;
  
  -- Si no existe, crearlo
  IF v_usage_id IS NULL THEN
    INSERT INTO user_usage (user_id, period_year, period_month)
    VALUES (p_user_id, p_year, p_month)
    RETURNING id INTO v_usage_id;
  END IF;
  
  RETURN v_usage_id;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar uso cuando se crea una llamada
CREATE OR REPLACE FUNCTION update_usage_on_call()
RETURNS TRIGGER AS $$
DECLARE
  v_usage_id UUID;
  v_minutes INTEGER;
BEGIN
  -- Solo actualizar si la llamada tiene duración y está contestada
  IF NEW.status = 'answered' AND NEW.duration_seconds > 0 THEN
    -- Calcular minutos (redondeado hacia arriba)
    v_minutes := CEIL(NEW.duration_seconds::DECIMAL / 60)::INTEGER;
    
    -- Obtener o crear uso del mes actual
    v_usage_id := get_or_create_user_usage(NEW.user_id);
    
    -- Actualizar métricas
    UPDATE user_usage
    SET
      total_minutes = total_minutes + v_minutes,
      total_calls = total_calls + 1,
      total_web_calls = total_web_calls + CASE WHEN NEW.phone_number = 'Web Call' THEN 1 ELSE 0 END,
      total_phone_calls = total_phone_calls + CASE WHEN NEW.phone_number != 'Web Call' THEN 1 ELSE 0 END,
      last_calculated_at = NOW()
    WHERE id = v_usage_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar uso automáticamente al insertar llamadas
DROP TRIGGER IF EXISTS trigger_update_usage_on_call ON calls;
CREATE TRIGGER trigger_update_usage_on_call
AFTER INSERT OR UPDATE ON calls
FOR EACH ROW
WHEN (NEW.status = 'answered' AND NEW.duration_seconds > 0)
EXECUTE FUNCTION update_usage_on_call();

-- Función para actualizar uso cuando se crea un lead
CREATE OR REPLACE FUNCTION update_usage_on_lead()
RETURNS TRIGGER AS $$
DECLARE
  v_usage_id UUID;
BEGIN
  -- Obtener o crear uso del mes actual
  v_usage_id := get_or_create_user_usage(NEW.user_id);
  
  -- Actualizar métricas
  UPDATE user_usage
  SET
    total_leads_created = total_leads_created + 1,
    last_calculated_at = NOW()
  WHERE id = v_usage_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar uso automáticamente al crear leads
DROP TRIGGER IF EXISTS trigger_update_usage_on_lead ON leads;
CREATE TRIGGER trigger_update_usage_on_lead
AFTER INSERT ON leads
FOR EACH ROW
EXECUTE FUNCTION update_usage_on_lead();

-- Tabla de usuarios con metadata extendida (para roles admin)
-- Nota: auth.users es una tabla del sistema, usamos metadata en user_metadata
-- Pero podemos crear una tabla de perfiles para información adicional
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Información del perfil
  full_name TEXT,
  company_name TEXT,
  phone TEXT,
  
  -- Roles y permisos
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  
  -- Giro del negocio (dashboard especializado)
  industry TEXT NOT NULL DEFAULT 'restaurante' CHECK (industry IN ('inmobiliario', 'restaurante', 'clinica')),
  
  -- Estado
  active BOOLEAN DEFAULT TRUE,
  
  -- Metadata adicional
  metadata JSONB
);

-- Añadir industry a user_profiles si la tabla ya existe sin esa columna
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS industry TEXT NOT NULL DEFAULT 'restaurante';
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_industry_check;
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_industry_check CHECK (industry IN ('inmobiliario', 'restaurante', 'clinica'));

-- ============================================
-- MÓDULO RESTAURANTE: Tabla Pedidos
-- ============================================
CREATE TABLE IF NOT EXISTS pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  call_id UUID REFERENCES campaign_calls(id) ON DELETE SET NULL,
  
  tipo_entrega TEXT NOT NULL DEFAULT 'recoger' CHECK (tipo_entrega IN ('recoger', 'domicilio')),
  direccion_entrega TEXT,
  
  cliente_nombre TEXT,
  cliente_telefono TEXT,
  cliente_email TEXT,
  
  items JSONB NOT NULL DEFAULT '[]',
  total DECIMAL(15,2) NOT NULL DEFAULT 0,
  moneda TEXT NOT NULL DEFAULT 'MXN',
  
  estado TEXT NOT NULL DEFAULT 'recibido' CHECK (estado IN ('recibido', 'en_preparacion', 'listo', 'entregado', 'cancelado')),
  horario_entrega_estimado TIMESTAMP WITH TIME ZONE,
  notas TEXT
);

-- Agregar columnas si no existen (para migración)
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS tipo_entrega TEXT DEFAULT 'recoger' CHECK (tipo_entrega IN ('recoger', 'domicilio'));
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS direccion_entrega TEXT;

ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own pedidos" ON pedidos;
DROP POLICY IF EXISTS "Users can insert their own pedidos" ON pedidos;
DROP POLICY IF EXISTS "Users can update their own pedidos" ON pedidos;
DROP POLICY IF EXISTS "Users can delete their own pedidos" ON pedidos;
CREATE POLICY "Users can view their own pedidos" ON pedidos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own pedidos" ON pedidos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own pedidos" ON pedidos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own pedidos" ON pedidos FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS pedidos_user_id_idx ON pedidos(user_id);
CREATE INDEX IF NOT EXISTS pedidos_estado_idx ON pedidos(estado);
CREATE INDEX IF NOT EXISTS pedidos_created_at_idx ON pedidos(created_at DESC);
CREATE INDEX IF NOT EXISTS pedidos_call_id_idx ON pedidos(call_id);
DROP TRIGGER IF EXISTS update_pedidos_updated_at ON pedidos;
CREATE TRIGGER update_pedidos_updated_at BEFORE UPDATE ON pedidos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- MÓDULO RESTAURANTE: Tabla Reservaciones
-- ============================================
CREATE TABLE IF NOT EXISTS reservaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  call_id UUID REFERENCES campaign_calls(id) ON DELETE SET NULL,
  
  cliente_nombre TEXT,
  cliente_telefono TEXT,
  cliente_email TEXT,
  
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  numero_personas INTEGER NOT NULL DEFAULT 2,
  notas TEXT,
  
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmada', 'completada', 'no_show', 'cancelada'))
);

ALTER TABLE reservaciones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own reservaciones" ON reservaciones;
DROP POLICY IF EXISTS "Users can insert their own reservaciones" ON reservaciones;
DROP POLICY IF EXISTS "Users can update their own reservaciones" ON reservaciones;
DROP POLICY IF EXISTS "Users can delete their own reservaciones" ON reservaciones;
CREATE POLICY "Users can view their own reservaciones" ON reservaciones FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own reservaciones" ON reservaciones FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reservaciones" ON reservaciones FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reservaciones" ON reservaciones FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS reservaciones_user_id_idx ON reservaciones(user_id);
CREATE INDEX IF NOT EXISTS reservaciones_estado_idx ON reservaciones(estado);
CREATE INDEX IF NOT EXISTS reservaciones_fecha_idx ON reservaciones(fecha);
CREATE INDEX IF NOT EXISTS reservaciones_created_at_idx ON reservaciones(created_at DESC);
CREATE INDEX IF NOT EXISTS reservaciones_call_id_idx ON reservaciones(call_id);
DROP TRIGGER IF EXISTS update_reservaciones_updated_at ON reservaciones;
CREATE TRIGGER update_reservaciones_updated_at BEFORE UPDATE ON reservaciones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS para user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;

CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins pueden ver y editar todos los perfiles
-- Esto requiere una función helper para verificar si es admin
CREATE OR REPLACE FUNCTION is_admin(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = p_user_id
      AND role IN ('admin', 'super_admin')
      AND active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update all profiles"
  ON user_profiles FOR UPDATE
  USING (is_admin());

-- Índices para user_profiles
CREATE INDEX IF NOT EXISTS user_profiles_user_id_idx ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS user_profiles_role_idx ON user_profiles(role);
CREATE INDEX IF NOT EXISTS user_profiles_active_idx ON user_profiles(active);

-- Trigger para updated_at en user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

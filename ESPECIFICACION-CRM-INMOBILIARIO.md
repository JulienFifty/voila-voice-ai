# Especificación CRM Inmobiliario - Voila Voice AI

## 📋 ÍNDICE
1. [Contexto del Negocio](#contexto-del-negocio)
2. [Stack Técnico](#stack-técnico)
3. [Módulo 1: Gestión de Llamadas Inmobiliaria](#módulo-1-gestión-de-llamadas-inmobiliaria)
4. [Módulo 2: Mini-CRM Inmobiliario](#módulo-2-mini-crm-inmobiliario)
5. [Módulo 3: Analytics Inmobiliario](#módulo-3-analytics-inmobiliario)
6. [Módulo 4: Automatizaciones Inmobiliarias](#módulo-4-automatizaciones-inmobiliarias)
7. [Módulo 5: Integraciones](#módulo-5-integraciones)
8. [Módulo 6: Números Especializados](#módulo-6-números-especializados-por-giro)
9. [Esquema de Base de Datos](#esquema-de-base-de-datos)
10. [Diseño y UX](#diseño-y-ux)
11. [Priorización de Desarrollo](#priorización-de-desarrollo)
12. [Progreso de Implementación](#progreso-de-implementación)

---

## CONTEXTO DEL NEGOCIO

### PRODUCTO ACTUAL:
Dashboard básico que muestra llamadas, transcripciones y estadísticas generales de agentes IA de voz.

### OBJETIVO:
Convertirlo en un CRM inmobiliario completo que gestiona leads desde la llamada hasta el cierre de venta.

### USUARIOS:
Asesores inmobiliarios independientes en México (principalmente Keller Williams, RE/MAX, Century 21)

### PAIN POINTS QUE RESOLVER:
1. Pierden llamadas cuando están ocupados
2. No dan seguimiento a leads tibios
3. No tienen visibilidad de su pipeline
4. Mezclan leads personales con trabajo
5. No saben qué propiedades generan más interés
6. Olvidan hacer follow-ups

---

## STACK TÉCNICO

**Frontend:** Next.js 14 + React + TypeScript + Tailwind  
**Backend:** Supabase (PostgreSQL + Auth + Storage)  
**IA/Voz:** VAPI o ElevenLabs  
**Automatización:** N8N (webhooks)  
**Analytics:** Recharts

---

## MÓDULO 1: GESTIÓN DE LLAMADAS INMOBILIARIA

### 1.1 VISTA LLAMADAS CON CONTEXTO INMOBILIARIO

#### COLUMNAS:
- ✓ Fecha/Hora
- ✓ Número telefónico (con WhatsApp quick action)
- ✓ Nombre del prospecto (extraído de transcripción)
- ✓ Tipo de interés:
  - Compra (🏠)
  - Renta (🔑)
  - Venta de propiedad (💰)
  - Solo información (ℹ️)
- ✓ Zona de interés (extraída de conversación)
- ✓ Presupuesto estimado (si mencionó)
- ✓ Urgencia: 
  - 🔴 Alta (quiere ver YA)
  - 🟡 Media (próximas semanas)
  - 🟢 Baja (solo explorando)
- ✓ Score de calificación:
  - A (Hot lead - listo para comprar)
  - B (Warm - interesado pero no urgente)
  - C (Cold - solo curioseando)
- ✓ Estado:
  - Nuevo
  - Contactado
  - Visita agendada
  - Seguimiento
  - Cerrado/Perdido
- ✓ Duración llamada
- ✓ Acciones rápidas:
  - Ver transcripción
  - Escuchar audio
  - WhatsApp directo
  - Agendar follow-up
  - Convertir a lead

#### FILTROS:
- Por fecha
- Por tipo de interés
- Por score (A/B/C)
- Por estado
- Por zona
- Por rango de presupuesto

#### BÚSQUEDA:
- Por nombre
- Por número
- Por zona mencionada
- Por palabra clave en transcripción

### 1.2 DETALLE DE LLAMADA ENRIQUECIDO

Modal o página detalle que muestre:

#### SECCIÓN INFO EXTRAÍDA AUTOMÁTICAMENTE:
```
┌─────────────────────────────────────────┐
│ 📋 INFORMACIÓN DEL PROSPECTO            │
├─────────────────────────────────────────┤
│ Nombre: [Extraído de "Mi nombre es..."] │
│ Teléfono: [Número que llamó]            │
│ Email: [Si lo mencionó]                 │
│ ¿Tiene pre-aprobación?: Sí/No          │
│ Banco: [Si mencionó]                    │
│ Monto aprobado: $XXX                    │
│                                         │
│ 🏠 BÚSQUEDA                             │
│ Tipo: Casa/Depa/Terreno                │
│ Zona preferida: [Extraída]              │
│ Presupuesto: $X - $Y                    │
│ Recámaras: X                            │
│ Baños: X                                │
│ Estacionamientos: X                     │
│ Timeline: Inmediato/1-3 meses/6+ meses  │
│                                         │
│ 🎯 CALIFICACIÓN IA                      │
│ Score: A / B / C                        │
│ Razón: [Explicación automática]         │
│ Probabilidad cierre: XX%                │
│ Valor estimado deal: $XXX,XXX           │
└─────────────────────────────────────────┘
```

#### SECCIÓN TRANSCRIPCIÓN:
- Texto completo con speakers identificados
- Highlights automáticos de info clave:
  * Presupuesto mencionado
  * Zonas de interés
  * Objeciones
  * Timeline
- Búsqueda dentro de transcripción

#### SECCIÓN AUDIO:
- Player con controles
- Timestamps clickeables
- Velocidad ajustable

#### SECCIÓN ACCIONES:
- [Botón: Convertir a Lead en CRM]
- [Botón: Agendar Visita]
- [Botón: Enviar WhatsApp Template]
- [Botón: Marcar como No Interesado]
- [Botón: Programar Follow-up]

### 1.3 EXTRACCIÓN INTELIGENTE CON IA

Función que analiza transcripción y extrae:
```typescript
interface ExtractedData {
  // Info personal
  nombre?: string;
  telefono: string;
  email?: string;
  
  // Info financiera
  tienePreaprobacion: boolean;
  banco?: string;
  montoAprobado?: number;
  presupuestoMin?: number;
  presupuestoMax?: number;
  
  // Búsqueda
  tipoBusqueda: 'compra' | 'renta' | 'venta' | 'info';
  tipoPropiedad: 'casa' | 'depa' | 'terreno' | 'otro';
  zonasInteres: string[];
  recamaras?: number;
  baños?: number;
  estacionamientos?: number;
  
  // Timeline y urgencia
  timeline: 'inmediato' | '1-3meses' | '3-6meses' | '6+meses';
  urgencia: 'alta' | 'media' | 'baja';
  
  // Calificación
  score: 'A' | 'B' | 'C';
  motivoScore: string;
  probabilidadCierre: number; // 0-100
  
  // Contexto
  objeciones?: string[];
  preguntasClave?: string[];
  siguientePaso?: string;
}
```

Usa prompt a GPT-4 para extraer esta info de cada transcripción.

---

## MÓDULO 2: MINI-CRM INMOBILIARIO

### 2.1 PIPELINE VISUAL (Kanban)

Vista estilo Trello/Linear con columnas:

```
[Nuevos Leads] → [Contactados] → [Visita Agendada] → [Negociación] → [Cerrado] ✅
                                                                      ↓
                                                                  [Perdido] ❌
```

Cada card muestra:
```
┌────────────────────────────┐
│ 👤 Roberto Sánchez         │
│ 📱 222-XXX-XXXX            │
│ 🏠 Casa en Angelópolis     │
│ 💰 $2.5M - $3M             │
│ 🎯 Score: A                │
│ 📅 Llamó hace 2 días       │
│ ⏰ Follow-up: Mañana 10am  │
└────────────────────────────┘
```

- Drag & drop entre columnas
- Click en card abre detalle completo

#### Filtros sidebar:
- Score (A/B/C)
- Presupuesto
- Zona
- Timeline
- Fuente (Llamada IA / Manual / Otro)

### 2.2 GESTIÓN DE LEADS

Formulario para agregar/editar leads:

#### DATOS PERSONALES:
- Nombre completo
- Teléfono (con validación MX)
- Email
- Notas generales

#### DATOS FINANCIEROS:
- Presupuesto min/max
- ¿Tiene pre-aprobación? (Sí/No)
- Banco
- Monto aprobado
- Tipo de pago (Contado/Crédito/Mix)

#### BÚSQUEDA:
- Tipo búsqueda (Compra/Renta/Venta)
- Tipo propiedad (Casa/Depa/Terreno)
- Zonas de interés (multi-select)
- Recámaras (select 1-5+)
- Baños (select 1-5+)
- Estacionamientos (0-5+)
- Amenidades deseadas (checkboxes):
  * Alberca
  * Gym
  * Jardín
  * Seguridad 24h
  * Cerca escuelas
  * Cerca comercios

#### TIMELINE:
- Urgencia (Alta/Media/Baja)
- Timeline de compra
- Próximo follow-up (date picker)

#### TRACKING:
- Score (A/B/C)
- Estado (Nuevo/Contactado/etc)
- Probabilidad cierre (0-100%)
- Valor estimado del deal
- Fuente del lead (Dropdown):
  * Llamada IA
  * Referido
  * Open House
  * Redes Sociales
  * Sitio Web
  * Otro

#### ACTIVIDAD:
Timeline de interacciones:
- Llamadas (automáticas de IA + manuales)
- WhatsApps enviados
- Emails
- Visitas realizadas
- Notas agregadas

[Botón: Guardar Lead]  
[Botón: Enviar WhatsApp]  
[Botón: Agendar Visita]

### 2.3 PROPIEDADES (Opcional pero útil)

Vista simple de propiedades del asesor:

Tabla con:
- Foto (thumbnail)
- Dirección
- Tipo (Casa/Depa)
- Precio
- m² construcción
- m² terreno
- Recámaras/Baños
- Estado (Disponible/Apartada/Vendida)
- Acciones (Ver/Editar/Compartir)

Función "Match leads":
Botón que sugiere qué leads pueden interesarle esta propiedad basado en criterios de búsqueda.

---

## MÓDULO 3: ANALYTICS INMOBILIARIO

### 3.1 DASHBOARD PRINCIPAL

#### Cards superiores (métricas clave):

```
┌─────────────────────┐ ┌─────────────────────┐
│ 📞 Llamadas mes     │ │ 🎯 Leads calificados│
│ 47                  │ │ 23 (Score A+B)      │
│ ↑ 23% vs mes pasado │ │ Conversión: 49%     │
└─────────────────────┘ └─────────────────────┘

┌─────────────────────┐ ┌─────────────────────┐
│ 📅 Visitas agendadas│ │ 💰 Pipeline valor │
│ 8 esta semana        │ │ $12.5M MXN          │
│ 3 pendientes        │ │ 15 deals activos    │
└─────────────────────┘ └─────────────────────┘
```

#### GRÁFICAS:

1. **Llamadas por día** (últimos 30 días)
   - Línea temporal
   - Highlights: picos y valles

2. **Distribución por score**
   - Pie chart: % de A / B / C

3. **Funnel de conversión**
   - Llamadas → Leads → Visitas → Cierres
   - % conversión en cada etapa

4. **Zonas más buscadas**
   - Bar chart horizontal
   - Top 10 zonas mencionadas

5. **Rango de presupuestos**
   - Histogram
   - Agrupado por rangos ($1-2M, $2-3M, etc)

6. **Timeline de cierres**
   - ¿Cuántos leads están en cada rango?
   - Inmediato / 1-3m / 3-6m / 6m+

7. **ROI del asistente IA**
   ```
   ┌────────────────────────────────────┐
   │ 📊 RETORNO DE INVERSIÓN            │
   ├────────────────────────────────────┤
   │ Llamadas capturadas: 47            │
   │ Leads generados: 23                │
   │ Visitas agendadas: 8               │
   │ Deals cerrados: 2                  │
   │                                    │
   │ Valor deals cerrados: $450K        │
   │ Tu comisión (3%): $13,500          │
   │                                    │
   │ Inversión asistente: $4,999        │
   │ ROI: 270% 🚀                       │
   └────────────────────────────────────┘
   ```

### 3.2 REPORTES

Botón "Generar Reporte" que crea PDF con:
- Resumen ejecutivo del mes
- Métricas clave
- Gráficas principales
- Lista de leads pendientes follow-up
- Proyección de cierres próximos 30 días

Útil para que asesor muestre a su broker/team leader.

---

## MÓDULO 4: AUTOMATIZACIONES INMOBILIARIAS

### 4.1 TEMPLATES WHATSAPP

Biblioteca de mensajes predefinidos:

#### CATEGORÍAS:
- Primera respuesta (después de llamada IA)
- Follow-up tibios
- Recordatorio visita
- Envío de fichas técnicas
- Cierre post-visita
- Reactivación leads fríos

Cada template con variables:
```
"Hola {nombre}, soy {nombre_asesor} de {inmobiliaria}.
Vi que llamaste interesado en {tipo_propiedad} en {zona}.
Te comparto algunas opciones que pueden interesarte..."
```

Botón: "Usar Template" que abre WhatsApp con mensaje pre-llenado.

### 4.2 RECORDATORIOS AUTOMÁTICOS

Sistema de notificaciones:

- 24h antes de visita agendada
- Follow-up programado que no se hizo
- Lead nuevo sin contactar >24h
- Lead A sin actividad >3 días
- Lead B sin actividad >7 días

Notificaciones vía:
- Email
- WhatsApp (si integras Twilio)
- Push notifications (PWA)

### 4.3 SUGERENCIAS IA

Sidebar o sección que muestra:

**"🤖 SUGERENCIAS INTELIGENTES"**

- "3 leads necesitan follow-up HOY"
- "Roberto Sánchez mencionó Lomas - tienes 2 propiedades ahí"
- "5 leads Score A sin visita agendada"
- "María López lleva 14 días sin contacto"
- "Propiedad Angelópolis #123 coincide con 4 leads"

Click en sugerencia lleva a acción rápida.

---

## MÓDULO 5: INTEGRACIONES

### 5.1 GOOGLE CALENDAR

Sync bidireccional:
- Visitas agendadas en CRM → Event en Calendar
- Event en Calendar → Aparece en CRM
- Recordatorios automáticos

Vista calendario integrada en dashboard.

### 5.2 WHATSAPP BUSINESS

Botón "WhatsApp" en cada lead que:
- Abre WhatsApp Web/App
- Pre-llena número
- Opcionalmente pre-llena mensaje con template

Si tienes WhatsApp Business API:
- Envío directo desde plataforma
- Historial de mensajes
- Templates aprobados Meta

### 5.3 GOOGLE CONTACTS

Exportar leads a Google Contacts con un click.  
Import contacts para crear leads masivos.

---

## MÓDULO 6: NÚMEROS ESPECIALIZADOS POR GIRO

### 6.1 GESTIÓN DE NÚMEROS

Sección "Mis Números" donde asesor puede:

Ver sus números activos:
```
┌────────────────────────────────────┐
│ 📞 NÚMEROS ACTIVOS                 │
├────────────────────────────────────┤
│ 222-XXX-1234                       │
│ Tipo: Principal                    │
│ Uso: Todas las llamadas            │
│ Llamadas este mes: 47              │
│ [Configurar] [Ver Stats]           │
│                                    │
│ 222-XXX-5678                       │
│ Tipo: Propiedades Premium          │
│ Uso: Solo propiedades $5M+         │
│ Llamadas este mes: 12              │
│ [Configurar] [Ver Stats]           │
└────────────────────────────────────┘
```

[+ Agregar Número]

### 6.2 NÚMEROS POR TIPO DE PROPIEDAD

Permitir configurar routing inteligente:

- "Número 222-XXX-1111 → Casas Residenciales"
- "Número 222-XXX-2222 → Departamentos"
- "Número 222-XXX-3333 → Propiedades Premium"

Cada número puede tener:
- Script diferente
- Preguntas de calificación únicas
- Mensaje de bienvenida customizado

### 6.3 NÚMEROS POR ZONA GEOGRÁFICA

- "Este número es para propiedades en Angelópolis"
- "Este número es para propiedades en Centro"

IA automáticamente sabe contexto según número llamado.

---

## ESQUEMA DE BASE DE DATOS

### TABLA: calls (actualizada)
```sql
ALTER TABLE calls ADD COLUMN IF NOT EXISTS
  extracted_data JSONB,
  lead_id UUID REFERENCES leads(id),
  tipo_interes TEXT, -- compra/renta/venta/info
  zona_interes TEXT[],
  presupuesto_min DECIMAL,
  presupuesto_max DECIMAL,
  urgencia TEXT, -- alta/media/baja
  score TEXT, -- A/B/C
  converted_to_lead BOOLEAN DEFAULT FALSE;
```

### TABLA: leads (nueva)
```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),
  
  -- Info personal
  nombre TEXT NOT NULL,
  telefono TEXT NOT NULL,
  email TEXT,
  
  -- Info financiera
  presupuesto_min DECIMAL,
  presupuesto_max DECIMAL,
  tiene_preaprobacion BOOLEAN,
  banco TEXT,
  monto_aprobado DECIMAL,
  tipo_pago TEXT, -- contado/credito/mix
  
  -- Búsqueda
  tipo_busqueda TEXT, -- compra/renta/venta
  tipo_propiedad TEXT, -- casa/depa/terreno
  zonas_interes TEXT[],
  recamaras INTEGER,
  baños INTEGER,
  estacionamientos INTEGER,
  amenidades TEXT[],
  
  -- Timeline
  urgencia TEXT, -- alta/media/baja
  timeline TEXT, -- inmediato/1-3m/3-6m/6+m
  proximo_followup TIMESTAMP,
  
  -- Calificación
  score TEXT, -- A/B/C
  estado TEXT, -- nuevo/contactado/visita/negociacion/cerrado/perdido
  probabilidad_cierre INTEGER, -- 0-100
  valor_estimado DECIMAL,
  fuente TEXT, -- llamada_ia/referido/openhouse/etc
  
  -- Tracking
  ultima_interaccion TIMESTAMP,
  numero_interacciones INTEGER DEFAULT 0,
  
  -- Notas
  notas TEXT
);
```

### TABLA: actividades (nueva)
```sql
CREATE TABLE actividades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP DEFAULT NOW(),
  lead_id UUID REFERENCES leads(id),
  user_id UUID REFERENCES auth.users(id),
  
  tipo TEXT, -- llamada/whatsapp/email/visita/nota
  descripcion TEXT,
  call_id UUID REFERENCES calls(id), -- si viene de llamada
  
  metadata JSONB -- datos adicionales según tipo
);
```

### TABLA: propiedades (nueva)
```sql
CREATE TABLE propiedades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),
  
  direccion TEXT,
  zona TEXT,
  tipo TEXT, -- casa/depa/terreno
  precio DECIMAL,
  m2_construccion DECIMAL,
  m2_terreno DECIMAL,
  recamaras INTEGER,
  baños INTEGER,
  estacionamientos INTEGER,
  
  estado TEXT, -- disponible/apartada/vendida
  
  descripcion TEXT,
  fotos TEXT[], -- URLs
  
  metadata JSONB
);
```

### TABLA: phone_numbers (nueva)
```sql
CREATE TABLE phone_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),
  
  numero TEXT UNIQUE NOT NULL,
  nombre TEXT, -- ej: "Principal", "Premium", etc
  tipo TEXT, -- principal/secundario/especializado
  
  -- Configuración
  uso_especifico TEXT,
  script_custom TEXT,
  
  -- Stats
  total_llamadas INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT TRUE
);
```

### ÍNDICES:
```sql
CREATE INDEX idx_leads_user_id ON leads(user_id);
CREATE INDEX idx_leads_score ON leads(score);
CREATE INDEX idx_leads_estado ON leads(estado);
CREATE INDEX idx_leads_proximo_followup ON leads(proximo_followup);
CREATE INDEX idx_actividades_lead_id ON actividades(lead_id);
```

---

## DISEÑO Y UX

### PRINCIPIOS:
- Mobile-first (asesores usan mucho el celular)
- Acceso rápido a acciones comunes (WhatsApp, llamar, ver lead)
- Colores que denoten urgencia (rojo=urgente, amarillo=medio, verde=frío)
- Iconos claros (🏠🔑💰📞📅)
- Loading states en todo
- Optimistic updates

### NAVEGACIÓN:
Sidebar con:
- 🏠 Dashboard
- 📞 Llamadas
- 👥 Leads (CRM)
- 📊 Analytics
- 🏘️ Propiedades (si implementas)
- ⚙️ Configuración
- 📱 Mis Números

### TEMA:
- Colores profesionales inmobiliarios
- Primario: Azul corporativo (#1E40AF)
- Secundario: Verde éxito (#10B981)
- Alerta: Naranja (#F59E0B)
- Peligro: Rojo (#EF4444)

---

## PRIORIZACIÓN DE DESARROLLO

### FASE 1 (ESTA SEMANA - MVP):
- ✅ Extracción de datos de llamadas
- ✅ Vista llamadas mejorada con filtros
- ⏳ Conversión llamada → lead (manual)
- ⏳ CRM básico (crear/editar leads)
- ⏳ Pipeline Kanban simple

### FASE 2 (SEMANA 2):
- ⏳ Analytics dashboard
- ⏳ Templates WhatsApp
- ⏳ Recordatorios básicos
- ⏳ Gestión números

### FASE 3 (SEMANA 3-4):
- ⏳ Integración Google Calendar
- ⏳ Extracción automática con IA (GPT-4)
- ⏳ Sugerencias inteligentes
- ⏳ Reportes PDF

### FASE 4 (MES 2):
- ⏳ WhatsApp Business API
- ⏳ Propiedades
- ⏳ Match leads-propiedades
- ⏳ Features avanzados

---

## PROGRESO DE IMPLEMENTACIÓN

### ✅ COMPLETADO:

1. **Schema de Base de Datos**
   - ✅ Tablas creadas: `leads`, `actividades`, `propiedades`, `phone_numbers`
   - ✅ Campos inmobiliarios agregados a `calls`
   - ✅ Políticas RLS configuradas
   - ✅ Índices creados
   - ✅ Triggers para `updated_at`

2. **Tipos TypeScript**
   - ✅ `types/realty.ts` con todas las interfaces
   - ✅ `types/database.ts` actualizado con nuevas tablas

3. **Componentes Compartidos**
   - ✅ `WhatsAppButton` - Botón para abrir WhatsApp
   - ✅ `ScoreBadge` - Badge de calificación (A/B/C)
   - ✅ `UrgencyIndicator` - Indicador de urgencia
   - ✅ `TipoInteresBadge` - Badge de tipo de interés
   - ✅ `FormattedCurrency` - Formato de moneda MX

4. **Componentes de Llamadas**
   - ✅ `CallFilters` - Filtros avanzados para llamadas

### ⏳ EN PROGRESO:

1. **Página de Llamadas Mejorada**
   - ⏳ Tabla con columnas inmobiliarias
   - ⏳ Integración de filtros
   - ⏳ Acciones rápidas (WhatsApp, convertir a lead)
   - ⏳ Búsqueda avanzada

2. **Modal de Detalle de Llamada**
   - ⏳ Información inmobiliaria extraída
   - ⏳ Sección de transcripción mejorada
   - ⏳ Acciones de conversión

### 📋 PENDIENTE:

1. **Función de Extracción IA**
   - ⏳ API route para analizar transcripciones con GPT-4
   - ⏳ Extracción automática de datos inmobiliarios

2. **Módulo CRM - Pipeline Kanban**
   - ⏳ Vista Kanban con drag & drop
   - ⏳ Cards de leads
   - ⏳ Filtros y búsqueda

3. **Gestión de Leads**
   - ⏳ Formulario completo de creación/edición
   - ⏳ Vista de detalle de lead
   - ⏳ Timeline de actividades

4. **Dashboard Analytics**
   - ⏳ Métricas inmobiliarias
   - ⏳ Gráficas de conversión
   - ⏳ ROI calculator

5. **Automatizaciones**
   - ⏳ Templates WhatsApp
   - ⏳ Recordatorios automáticos
   - ⏳ Sugerencias IA

6. **Integraciones**
   - ⏳ Google Calendar
   - ⏳ WhatsApp Business API
   - ⏳ Google Contacts

7. **Gestión de Propiedades**
   - ⏳ CRUD de propiedades
   - ⏳ Match leads-propiedades

8. **Gestión de Números**
   - ⏳ CRUD de números telefónicos
   - ⏳ Estadísticas por número

---

## ESTRUCTURA DE ARCHIVOS

```
/app
  /dashboard
    /page.tsx (dashboard principal)
    /calls
      /page.tsx (lista llamadas mejorada)
      /[id]/page.tsx (detalle llamada)
    /leads
      /page.tsx (CRM kanban)
      /[id]/page.tsx (detalle lead)
      /nuevo/page.tsx (crear lead)
    /analytics
      /page.tsx (analytics)
    /numeros
      /page.tsx (gestión números)

/components
  /llamadas
    /CallCard.tsx
    /CallFilters.tsx ✅
    /ExtractedInfo.tsx
  /leads
    /LeadCard.tsx
    /LeadForm.tsx
    /PipelineColumn.tsx
    /LeadDetail.tsx
  /analytics
    /MetricCard.tsx
    /Charts.tsx
  /shared ✅
    /WhatsAppButton.tsx ✅
    /ScoreBadge.tsx ✅
    /UrgencyIndicator.tsx ✅
    /TipoInteresBadge.tsx ✅
    /FormattedCurrency.tsx ✅

/types
  /realty.ts ✅
  /database.ts ✅
  /call.ts

/lib
  /extractLeadData.ts (función de extracción IA)
```

---

## NOTAS IMPORTANTES

- **Priorizar MVP**: Enfocarse primero en funciones core que entreguen valor inmediato
- **Mobile-first**: Todo debe funcionar bien en móvil
- **Performance**: Optimizar queries de Supabase con índices apropiados
- **Seguridad**: RLS debe estar habilitado en todas las tablas
- **Testing**: Probar con datos reales de asesores inmobiliarios

---

**Última actualización:** Enero 2026  
**Versión:** 1.0.0

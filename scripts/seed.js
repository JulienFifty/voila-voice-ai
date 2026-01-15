// Cargar variables de entorno
try {
  require('dotenv').config({ path: '.env.local' });
} catch (e) {
  // Si dotenv no está disponible, intentar leer directamente
  console.log('⚠️  dotenv no encontrado, usando variables de entorno del sistema');
}

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan las variables de entorno SUPABASE_URL y SUPABASE_ANON_KEY');
  console.error('Asegúrate de tener un archivo .env.local con estas variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Números telefónicos mexicanos fake
const phoneNumbers = [
  '+52 55 1234 5678',
  '+52 55 9876 5432',
  '+52 81 2345 6789',
  '+52 33 4567 8901',
  '+52 664 123 4567',
  '+52 999 876 5432',
  '+52 998 123 4567',
  '+52 614 234 5678',
  '+52 222 345 6789',
  '+52 477 456 7890',
  '+52 867 567 8901',
  '+52 664 678 9012',
  '+52 998 789 0123',
  '+52 993 890 1234',
  '+52 981 901 2345',
];

// Transcripciones realistas de inmobiliarias
const transcripts = [
  'Hola, buenos días. Estoy interesado en una propiedad que vi en su página web. Quisiera saber más detalles sobre la casa en la colonia Roma. ¿Todavía está disponible?',
  'Buenas tardes, llamo para agendar una cita para ver unos departamentos. Me interesan unidades de 2 recámaras en la zona de Polanco. ¿Cuándo podrían mostrarme las opciones?',
  'Hola, necesito información sobre el proceso de compra de una casa. Soy primer comprador y no sé mucho del tema. ¿Podrían explicarme los pasos?',
  'Buenos días, tengo una propiedad que quiero vender. Es una casa de 3 pisos en la colonia Condesa. ¿Ofrecen servicios de valuación y venta?',
  'Hola, estoy buscando rentar un departamento cerca del centro. Mi presupuesto es de 15,000 pesos mensuales. ¿Tienen algo disponible?',
  'Buenas tardes, vi un anuncio de una casa en venta. ¿Podrían darme más información sobre la ubicación exacta y las características?',
  'Hola, me gustaría saber si ofrecen créditos hipotecarios o si trabajan con algún banco. Estoy interesado en comprar pero necesito financiamiento.',
  'Buenos días, tengo una pregunta sobre una propiedad que vi. ¿Cuál es el precio exacto y qué incluye? ¿Se puede negociar?',
  'Hola, estoy buscando una casa con jardín. Tengo mascotas y necesito un espacio al aire libre. ¿Tienen opciones disponibles?',
  'Buenas tardes, quiero vender mi departamento. ¿Cuánto tiempo tarda el proceso y qué documentos necesito?',
  'Hola, me interesa invertir en bienes raíces. ¿Ofrecen asesoría para inversionistas o proyectos de renta?',
  'Buenos días, vi una propiedad en su sitio web pero no tiene fotos completas. ¿Podrían enviarme más imágenes del interior?',
  'Hola, estoy buscando una casa en una zona segura para mi familia. ¿Qué colonias recomiendan que tengan buena accesibilidad a escuelas?',
  'Buenas tardes, tengo una emergencia. Necesito rentar algo urgente, máximo en una semana. ¿Tienen disponibilidad inmediata?',
  'Hola, me gustaría agendar una visita. ¿Podrían coordinarla para este sábado por la mañana? Tengo disponibilidad después de las 10.',
];

// Generar una fecha aleatoria de los últimos 7 días
function getRandomDate() {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 7); // 0-6 días atrás
  const hoursAgo = Math.floor(Math.random() * 24); // 0-23 horas atrás
  const minutesAgo = Math.floor(Math.random() * 60); // 0-59 minutos atrás
  
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  date.setHours(now.getHours() - hoursAgo);
  date.setMinutes(now.getMinutes() - minutesAgo);
  
  return date.toISOString();
}

// Generar duración aleatoria entre 30-600 segundos
function getRandomDuration() {
  return Math.floor(Math.random() * (600 - 30 + 1)) + 30;
}

// Generar status (80% answered, 20% missed)
function getRandomStatus() {
  return Math.random() < 0.8 ? 'answered' : 'missed';
}

// Generar transcripción (solo para llamadas contestadas)
function getRandomTranscript(status) {
  if (status === 'missed') {
    return null;
  }
  // 70% de las llamadas contestadas tienen transcripción
  if (Math.random() < 0.7) {
    return transcripts[Math.floor(Math.random() * transcripts.length)];
  }
  return null;
}

// Generar URL de grabación (solo para algunas llamadas contestadas)
function getRandomRecordingUrl(status) {
  if (status === 'missed') {
    return null;
  }
  // 60% de las llamadas contestadas tienen grabación
  if (Math.random() < 0.6) {
    const recordings = [
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    ];
    return recordings[Math.floor(Math.random() * recordings.length)];
  }
  return null;
}

async function seedCalls() {
  try {
    console.log('🔐 Autenticando...');
    
    // Intentar obtener el usuario actual (necesitas estar autenticado)
    // Para este script, vamos a usar el service role key o pedir al usuario que inicie sesión
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('⚠️  No hay usuario autenticado.');
      console.log('\n💡 Opciones:');
      console.log('  1. Usa el Service Role Key en .env.local como SUPABASE_SERVICE_ROLE_KEY');
      console.log('  2. O ejecuta el SQL generado manualmente en Supabase SQL Editor\n');
      
      // Intentar con Service Role Key si existe
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (serviceRoleKey) {
        console.log('🔑 Usando Service Role Key...');
        await seedWithServiceRole(serviceRoleKey);
        return;
      }
      
      // Generar el SQL para que el usuario lo ejecute manualmente
      console.log('\n📋 SQL para insertar las llamadas (copia y pega en SQL Editor):\n');
      generateSQL();
      return;
    }

    console.log(`✅ Usuario autenticado: ${user.email}`);
    console.log(`📞 Insertando 20 llamadas de prueba...\n`);

    const calls = [];
    for (let i = 0; i < 20; i++) {
      const status = getRandomStatus();
      const duration = status === 'missed' ? 0 : getRandomDuration();
      
      calls.push({
        phone_number: phoneNumbers[Math.floor(Math.random() * phoneNumbers.length)],
        duration_seconds: duration,
        status: status,
        recording_url: getRandomRecordingUrl(status),
        transcript: getRandomTranscript(status),
        user_id: user.id,
        created_at: getRandomDate(),
      });
    }

    const { data, error } = await supabase
      .from('calls')
      .insert(calls)
      .select();

    if (error) {
      console.error('❌ Error al insertar llamadas:', error.message);
      console.error('\n💡 Generando SQL alternativo para insertar manualmente:\n');
      generateSQL(user.id);
      return;
    }

    console.log(`✅ ¡Éxito! Se insertaron ${data.length} llamadas.`);
    console.log('\n📊 Resumen:');
    
    const answered = calls.filter(c => c.status === 'answered').length;
    const missed = calls.filter(c => c.status === 'missed').length;
    const withTranscript = calls.filter(c => c.transcript).length;
    const withRecording = calls.filter(c => c.recording_url).length;
    
    console.log(`  - Contestadas: ${answered}`);
    console.log(`  - Perdidas: ${missed}`);
    console.log(`  - Con transcripción: ${withTranscript}`);
    console.log(`  - Con grabación: ${withRecording}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

function generateSQL(userId = null) {
  const calls = [];
  for (let i = 0; i < 20; i++) {
    const status = getRandomStatus();
    const duration = status === 'missed' ? 0 : getRandomDuration();
    const transcript = getRandomTranscript(status);
    const recordingUrl = getRandomRecordingUrl(status);
    
    calls.push({
      phone_number: phoneNumbers[Math.floor(Math.random() * phoneNumbers.length)],
      duration_seconds: duration,
      status: status,
      recording_url: recordingUrl ? `'${recordingUrl}'` : 'NULL',
      transcript: transcript ? `'${transcript.replace(/'/g, "''")}'` : 'NULL',
      user_id: userId ? `'${userId}'` : '(SELECT id FROM auth.users LIMIT 1)',
      created_at: `'${getRandomDate()}'`,
    });
  }

  console.log('INSERT INTO calls (phone_number, duration_seconds, status, recording_url, transcript, user_id, created_at) VALUES');
  calls.forEach((call, index) => {
    const comma = index < calls.length - 1 ? ',' : ';';
    console.log(`  ('${call.phone_number}', ${call.duration_seconds}, '${call.status}', ${call.recording_url}, ${call.transcript}, ${call.user_id}, ${call.created_at})${comma}`);
  });
}

async function seedWithServiceRole(serviceRoleKey) {
  const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Obtener el primer usuario o crear uno de prueba
  const { data: users, error: usersError } = await adminSupabase.auth.admin.listUsers();
  
  if (usersError || !users || users.users.length === 0) {
    console.error('❌ No se encontraron usuarios. Crea un usuario primero desde Supabase Auth.');
    generateSQL();
    return;
  }

  const userId = users.users[0].id;
  console.log(`✅ Usando usuario: ${users.users[0].email || userId}`);

  const calls = [];
  for (let i = 0; i < 20; i++) {
    const status = getRandomStatus();
    const duration = status === 'missed' ? 0 : getRandomDuration();
    
    calls.push({
      phone_number: phoneNumbers[Math.floor(Math.random() * phoneNumbers.length)],
      duration_seconds: duration,
      status: status,
      recording_url: getRandomRecordingUrl(status),
      transcript: getRandomTranscript(status),
      user_id: userId,
      created_at: getRandomDate(),
    });
  }

  const { data, error } = await adminSupabase
    .from('calls')
    .insert(calls)
    .select();

  if (error) {
    console.error('❌ Error al insertar llamadas:', error.message);
    console.log('\n💡 Generando SQL alternativo:\n');
    generateSQL(userId);
    return;
  }

  console.log(`✅ ¡Éxito! Se insertaron ${data.length} llamadas.`);
  printSummary(calls);
}

function printSummary(calls) {
  const answered = calls.filter(c => c.status === 'answered').length;
  const missed = calls.filter(c => c.status === 'missed').length;
  const withTranscript = calls.filter(c => c.transcript).length;
  const withRecording = calls.filter(c => c.recording_url).length;
  
  console.log('\n📊 Resumen:');
  console.log(`  - Contestadas: ${answered}`);
  console.log(`  - Perdidas: ${missed}`);
  console.log(`  - Con transcripción: ${withTranscript}`);
  console.log(`  - Con grabación: ${withRecording}`);
}

// Ejecutar el script
seedCalls();

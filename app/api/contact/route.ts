import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre, email, telefono, mensaje } = body
    
    // TODO: Integrar con servicio de email (SendGrid, Resend, etc.) o CRM
    // Por ahora solo validamos y retornamos éxito
    
    if (!nombre || !email || !telefono || !mensaje) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }
    
    // Simular guardado/envió
    console.log('Contact form submission:', {
      nombre,
      email,
      telefono,
      mensaje,
      timestamp: new Date().toISOString(),
    })
    
    // TODO: Enviar email o guardar en base de datos
    // Ejemplo: await sendEmail({ to: 'contacto@voilavoiceai.com', subject: 'Nuevo contacto', body: ... })
    
    return NextResponse.json(
      { message: 'Mensaje enviado exitosamente' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error processing contact form:', error)
    return NextResponse.json(
      { error: 'Error al procesar el formulario' },
      { status: 500 }
    )
  }
}

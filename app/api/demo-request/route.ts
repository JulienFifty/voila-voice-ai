import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre, empresa, telefono, email } = body
    
    // TODO: Integrar con servicio de email (SendGrid, Resend, etc.) o CRM
    // Por ahora solo validamos y retornamos éxito
    
    if (!nombre || !empresa || !telefono) {
      return NextResponse.json(
        { error: 'Nombre, empresa y teléfono son requeridos' },
        { status: 400 }
      )
    }
    
    // Simular guardado/envió
    console.log('Demo request submission:', {
      nombre,
      empresa,
      telefono,
      email: email || 'No proporcionado',
      timestamp: new Date().toISOString(),
    })
    
    // TODO: Enviar email o guardar en base de datos
    // Ejemplo: await sendEmail({ to: 'ventas@voilavoiceai.com', subject: 'Nueva solicitud de demo', body: ... })
    
    return NextResponse.json(
      { message: 'Solicitud de demo recibida exitosamente' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error processing demo request:', error)
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
}

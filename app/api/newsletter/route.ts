import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body
    
    // TODO: Integrar con servicio de email marketing (Mailchimp, ConvertKit, etc.)
    // Por ahora solo validamos y retornamos éxito
    
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }
    
    // Simular guardado/envió
    console.log('Newsletter subscription:', {
      email,
      timestamp: new Date().toISOString(),
    })
    
    // TODO: Suscribir a newsletter
    // Ejemplo: await mailchimp.lists.addListMember('list-id', { email_address: email })
    
    return NextResponse.json(
      { message: 'Suscripción exitosa' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error processing newsletter subscription:', error)
    return NextResponse.json(
      { error: 'Error al procesar la suscripción' },
      { status: 500 }
    )
  }
}

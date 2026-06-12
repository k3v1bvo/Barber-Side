import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const adminClient = createAdminSupabaseClient()
    if (!adminClient) {
      return NextResponse.json({ error: 'Configuración de servidor incompleta (service role)' }, { status: 500 })
    }

    const body = await request.json()
    const { email, password, full_name, phone, ci, role, comision_porcentaje, avatar_url } = body

    if (!email || !password || !full_name) {
      return NextResponse.json({ error: 'Email, contraseña y nombre son requeridos' }, { status: 400 })
    }

    // Crear el usuario en auth.users
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
      },
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'No se pudo crear el usuario' }, { status: 500 })
    }

    // Actualizar el perfil en la tabla profiles
    const { error: profileError } = await adminClient
      .from('profiles')
      .update({
        role: role || 'barbero',
        phone: phone || null,
        ci: ci || null,
        comision_porcentaje: comision_porcentaje || 0,
        avatar_url: avatar_url || null,
      })
      .eq('id', authData.user.id)

    if (profileError) {
      // Si falla la creación del perfil, podríamos borrar el usuario o simplemente retornar el error
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, user: authData.user })

  } catch (error: any) {
    console.error('Error al crear usuario:', error)
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 })
  }
}

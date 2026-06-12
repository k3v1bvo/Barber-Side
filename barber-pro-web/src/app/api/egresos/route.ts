import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/egresos — listar egresos
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin' && profile?.role !== 'coordinador') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const sp = request.nextUrl.searchParams
    const desde = sp.get('desde')
    const hasta = sp.get('hasta')

    let query = supabase
      .from('egresos')
      .select('*')
      .order('fecha', { ascending: false })
      .limit(100)

    if (desde) query = query.gte('fecha', desde)
    if (hasta) query = query.lte('fecha', hasta)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// POST /api/egresos — crear egreso
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin' && profile?.role !== 'coordinador') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const body = await request.json()

    const montoBruto = Number(body.monto_bruto) || 0
    const iva = body.tiene_factura ? montoBruto * 0.13 : 0
    const it = body.tiene_factura ? montoBruto * 0.03 : 0
    const montoNeto = montoBruto - iva - it

    const { data, error } = await supabase
      .from('egresos')
      .insert({
        fecha: body.fecha || new Date().toISOString().split('T')[0],
        concepto: body.concepto,
        proveedor: body.proveedor || null,
        monto_bruto: montoBruto,
        tiene_factura: body.tiene_factura || false,
        iva,
        it,
        monto_neto: montoNeto,
        numero_factura: body.numero_factura || null,
        cuenta_codigo: body.cuenta_codigo || null,
        usuario_registro: profile?.full_name || user.email || 'Sistema',
        notas: body.notas || null,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

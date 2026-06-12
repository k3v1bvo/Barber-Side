import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { nombreCliente, emailCliente, telefonoCliente, servicio_id, metodo_pago, propinas } = body

    // 1. Manejar el Cliente
    let clienteId = null
    
    if (emailCliente || telefonoCliente) {
      let query = supabase.from('clientes').select('id, total_visitas, total_gastado')
      if (emailCliente) query = query.eq('email', emailCliente)
      else query = query.eq('telefono', telefonoCliente)
        
      const { data: exCliente } = await query.single()
      
      if (exCliente) {
        clienteId = exCliente.id
      } else {
        // Crear cliente
        const { data: newCliente, error: clError } = await supabase
          .from('clientes')
          .insert({
            nombre: nombreCliente || 'Cliente Walk-in',
            email: emailCliente,
            telefono: telefonoCliente,
            total_visitas: 0,
            total_gastado: 0
          })
          .select('id')
          .single()
          
        if (clError) throw clError
        clienteId = newCliente.id
      }
    }

    // 2. Obtener precio del servicio y comisión
    const { data: serv } = await supabase.from('servicios').select('precio, comision_activa, comision_tipo, comision_valor, comision_acumulable').eq('id', servicio_id).single()
    const precioBase = serv?.precio || 0
    
    // Obtener comisión del barbero
    const { data: barbero } = await supabase.from('profiles').select('comision_porcentaje').eq('id', user.id).single()
    const barberoComision = barbero?.comision_porcentaje || 0
    
    let baseComision = 0
    if (serv?.comision_activa !== false && serv?.comision_tipo !== 'ninguna') {
      if (serv?.comision_tipo === 'fija') {
        baseComision = serv?.comision_valor || 0
      } else if (serv?.comision_tipo === 'porcentaje') {
        baseComision = (precioBase * (serv?.comision_valor || 0)) / 100
      } else {
        baseComision = (precioBase * barberoComision) / 100
      }
    }
    
    // Sumar propinas si la comisión es acumulable o si no hay regla estricta (por defecto se suma en walk-in)
    const extraPropinas = serv?.comision_acumulable !== false ? (propinas || 0) : 0
    const comisionTotal = baseComision + extraPropinas

    // 3. Crear Cita "Completada" instantánea
    // Simulamos que empezó hace media hora y terminó justo ahora
    const ahora = new Date()
    const inicio = new Date(ahora.getTime() - 30 * 60000)

    const { error: citaError } = await supabase.from('citas').insert({
      cliente_id: clienteId,
      barbero_id: user.id, // El barbero que está cobrando
      servicio_id,
      fecha_hora: inicio.toISOString(),
      finished_at: ahora.toISOString(),
      precio: precioBase,
      duracion_real_minutos: 30,
      estado: 'completado',
      metodo_pago,
      propinas: propinas || 0,
      comision_barbero: comisionTotal,
      notas: 'Venta Rápida (Walk-in)',
    })

    if (citaError) throw citaError

    // 4. Actualizar Lealtad
    if (clienteId) {
      const { data: cData } = await supabase.from('clientes').select('total_visitas, total_gastado').eq('id', clienteId).single()
      if (cData) {
        await supabase.from('clientes')
          .update({
            total_visitas: (cData.total_visitas || 0) + 1,
            total_gastado: (cData.total_gastado || 0) + precioBase
          })
          .eq('id', clienteId)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error Walk-in:', error)
    return NextResponse.json({ error: 'Error procesando la venta' }, { status: 500 })
  }
}

'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils'
import { Wallet, Plus, X } from 'lucide-react'

interface PlanCuenta {
  codigo: string
  detalle: string
  tipo: string
}

interface Transaction {
  id: string
  fecha: string
  ci: string
  nombre: string
  cuenta_codigo: string
  cuenta_detalle: string
  glosa: string
  costo: number
  tipo_movimiento: string
  es_sancion: boolean
  metodo_pago: string | null
  creado_en: string
}

export default function CajaChicaPage() {
  const supabase = createClient()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [cuentas, setCuentas] = useState<PlanCuenta[]>([])
  const [barberos, setBarberos] = useState<{id: string, full_name: string}[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const hoy = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    empleado_id: '',
    ci: '',
    nombre: '',
    cuenta_codigo: '',
    glosa: '',
    costo: '',
    tipo_movimiento: 'ADELANTO',
    metodo_pago: 'efectivo',
    notas: '',
  })

  const loadData = useCallback(async () => {
    const [txRes, ctasRes] = await Promise.all([
      fetch(`/api/transactions?libro=CAJA_CHICA&limit=50`),
      fetch('/api/plan-cuentas'),
    ])
    if (txRes.ok) setTransactions(await txRes.json())
    if (ctasRes.ok) setCuentas(await ctasRes.json())
    
    const { data: bList } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('role', ['barbero', 'coordinador'])
      .eq('is_active', true)
    if (bList) setBarberos(bList)
      
    setLoading(false)
  }, [supabase])

  useEffect(() => { loadData() }, [loadData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const cuenta = cuentas.find((c) => c.codigo === form.cuenta_codigo)
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        libro: 'CAJA_CHICA',
        ci: form.ci,
        nombre: form.nombre,
        cuenta_codigo: form.cuenta_codigo,
        cuenta_detalle: cuenta?.detalle || form.cuenta_codigo,
        glosa: form.glosa,
        costo: parseFloat(form.costo),
        tipo_movimiento: form.tipo_movimiento,
        metodo_pago: form.metodo_pago,
        notas: form.notas || null,
        empleado_id: form.empleado_id || null,
      }),
    })
    if (res.ok) {
      setShowForm(false)
      setForm({ empleado_id: '', ci: '', nombre: '', cuenta_codigo: '', glosa: '', costo: '', tipo_movimiento: 'ADELANTO', metodo_pago: 'efectivo', notas: '' })
      loadData()
    }
    setSaving(false)
  }

  const handleBarberoChange = (id: string) => {
    const b = barberos.find((x) => x.id === id)
    setForm({ ...form, empleado_id: id, nombre: b?.full_name || form.nombre })
  }

  const totalHoy = transactions.filter((t) => t.fecha === hoy).reduce((s, t) => s + Number(t.costo), 0)
  const cajaChicaCuentas = cuentas.filter((c) => c.tipo === 'ACTIVO' || c.tipo === 'PATRIMONIO' || c.tipo === 'INGRESO')

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-zinc-700 border-t-amber-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 lg:pb-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white uppercase">
            Caja <span className="text-amber-500">Chica</span>
          </h1>
          <p className="text-zinc-500 font-medium mt-1">Adelantos, aportes, depósitos, sanciones</p>
        </div>
        <div className="flex items-center gap-4">
          <Card className="border-white/5 bg-zinc-900/80">
            <CardContent className="px-4 py-3 flex items-center gap-3">
              <Wallet className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Hoy</p>
                <p className="text-lg font-black text-white">{formatCurrency(totalHoy)}</p>
              </div>
            </CardContent>
          </Card>
          <Button variant="primary" onClick={() => setShowForm(!showForm)} className="gap-2 font-black uppercase tracking-wider">
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? 'Cerrar' : 'Nuevo'}
          </Button>
        </div>
      </div>

      {/* Formulario */}
      {showForm && (
        <Card className="border-amber-500/30 bg-zinc-900/80 animate-in slide-in-from-top-2 duration-300">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">Empleado / Barbero (Opcional)</label>
                <select
                  value={form.empleado_id} onChange={(e) => handleBarberoChange(e.target.value)}
                  className="w-full h-11 bg-zinc-950 border border-white/10 rounded-xl px-4 text-sm text-white focus:border-amber-500/50 outline-none appearance-none"
                >
                  <option value="">Seleccionar empleado...</option>
                  {barberos.map((b) => (
                    <option key={b.id} value={b.id}>{b.full_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">C.I.</label>
                <input
                  value={form.ci} onChange={(e) => setForm({ ...form, ci: e.target.value })}
                  className="w-full h-11 bg-zinc-950 border border-white/10 rounded-xl px-4 text-sm text-white focus:border-amber-500/50 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">Nombre</label>
                <input
                  value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="w-full h-11 bg-zinc-950 border border-white/10 rounded-xl px-4 text-sm text-white focus:border-amber-500/50 outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">Cuenta</label>
                <select
                  value={form.cuenta_codigo} onChange={(e) => setForm({ ...form, cuenta_codigo: e.target.value })}
                  className="w-full h-11 bg-zinc-950 border border-white/10 rounded-xl px-4 text-sm text-white focus:border-amber-500/50 outline-none appearance-none"
                  required
                >
                  <option value="">Seleccionar...</option>
                  {cajaChicaCuentas.map((c) => (
                    <option key={c.codigo} value={c.codigo}>{c.codigo} — {c.detalle}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">Tipo</label>
                <select
                  value={form.tipo_movimiento} onChange={(e) => setForm({ ...form, tipo_movimiento: e.target.value })}
                  className="w-full h-11 bg-zinc-950 border border-white/10 rounded-xl px-4 text-sm text-white focus:border-amber-500/50 outline-none appearance-none"
                >
                  <option value="ADELANTO">Adelanto</option>
                  <option value="APORTE_CAPITAL">Aporte de Capital</option>
                  <option value="DEPOSITO_BANCO">Depósito a Banco</option>
                  <option value="SANCCION">Sanción</option>
                  <option value="OTRO">Otro</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">Glosa</label>
                <input
                  value={form.glosa} onChange={(e) => setForm({ ...form, glosa: e.target.value })}
                  className="w-full h-11 bg-zinc-950 border border-white/10 rounded-xl px-4 text-sm text-white focus:border-amber-500/50 outline-none"
                  placeholder="Descripción del movimiento"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">Monto (Bs)</label>
                <input
                  type="number" step="0.01" min="0"
                  value={form.costo} onChange={(e) => setForm({ ...form, costo: e.target.value })}
                  className="w-full h-11 bg-zinc-950 border border-white/10 rounded-xl px-4 text-sm text-white focus:border-amber-500/50 outline-none"
                  required
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                <Button type="submit" variant="primary" disabled={saving} className="font-black uppercase tracking-wider">
                  {saving ? 'Guardando...' : 'Registrar'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tabla */}
      <Card className="border-white/5 bg-zinc-900/50 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">Fecha</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">C.I.</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">Nombre</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">Cuenta</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">Glosa</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">Tipo</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-zinc-600">No hay registros aún</td></tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-zinc-400 whitespace-nowrap">{tx.fecha}</td>
                      <td className="px-4 py-3 text-zinc-300 font-mono text-xs">{tx.ci}</td>
                      <td className="px-4 py-3 text-white font-bold">{tx.nombre}</td>
                      <td className="px-4 py-3 text-zinc-400 text-xs">{tx.cuenta_codigo}</td>
                      <td className="px-4 py-3 text-zinc-300">
                        {tx.es_sancion && <span className="text-red-400 mr-1">⚠</span>}
                        {tx.glosa}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={tx.es_sancion ? 'danger' : 'default'} className="text-[10px] uppercase">
                          {tx.tipo_movimiento}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-black text-white">{formatCurrency(tx.costo)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

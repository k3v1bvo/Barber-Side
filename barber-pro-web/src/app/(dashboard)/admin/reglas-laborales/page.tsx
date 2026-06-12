'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { formatCurrency } from '@/lib/utils'
import {
  ArrowLeft, Save, Plus, Trash2, Edit, X, ToggleLeft, ToggleRight,
  Coins, AlertTriangle, Gift, ChevronDown, ChevronUp, Check
} from 'lucide-react'

// ── Tipos ──
interface Servicio { id: string; nombre: string; precio: number; comision_activa: boolean; comision_tipo: string; comision_valor: number; comision_acumulable: boolean; comision_notas: string | null; is_active: boolean }
interface Barbero { id: string; full_name: string; comision_porcentaje: number; role: string; is_active: boolean }
interface PlanCuenta { id: string; codigo: string; detalle: string; tipo: string; nivel: number; es_sancion: boolean }

const BONO_TIPOS = [
  { key: 'puntualidad', emoji: '⏰', label: 'Puntualidad' },
  { key: 'cantidad_servicios', emoji: '✂️', label: 'Cantidad de Servicios' },
  { key: 'metas', emoji: '🎯', label: 'Metas' },
  { key: 'otro', emoji: '⭐', label: 'Otro' },
]

const TIPOS_CUENTA = ['ACTIVO', 'PASIVO', 'PATRIMONIO', 'INGRESO', 'EGRESO']

export default function ReglasLaboralesPage() {
  const router = useRouter()
  const { success, error: toastError } = useToast()

  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'comisiones' | 'sanciones' | 'bonos'>('comisiones')

  // Comisiones
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [barberos, setBarberos] = useState<Barbero[]>([])
  const [globalPct, setGlobalPct] = useState<number>(30)
  const [expandido, setExpandido] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [editBarbero, setEditBarbero] = useState<{ id: string; pct: number } | null>(null)

  // Sanciones (plan_cuentas con es_sancion=true)
  const [planCuentas, setPlanCuentas] = useState<PlanCuenta[]>([])
  const [showCuentaModal, setShowCuentaModal] = useState(false)
  const [editingCuenta, setEditingCuenta] = useState<PlanCuenta | null>(null)
  const [cuentaForm, setCuentaForm] = useState({ codigo: '', detalle: '', tipo: 'EGRESO', nivel: 1, es_sancion: true })
  const [savingCuenta, setSavingCuenta] = useState(false)

  // Bonos config (montos sugeridos por tipo)
  const [bonosConfig, setBonosConfig] = useState<Record<string, { descripcion: string; monto_sugerido: number }>>({
    puntualidad: { descripcion: 'Bono por llegar puntual durante el mes', monto_sugerido: 50 },
    cantidad_servicios: { descripcion: 'Bono por superar meta de servicios', monto_sugerido: 100 },
    metas: { descripcion: 'Bono por cumplir metas de venta', monto_sugerido: 150 },
    otro: { descripcion: 'Bono especial discrecional', monto_sugerido: 75 },
  })
  const [savingBonos, setSavingBonos] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/reglas-laborales')
      if (!res.ok) return
      const data = await res.json()
      setServicios(data.servicios ?? [])
      setBarberos(data.barberos ?? [])
      setPlanCuentas(data.plan_cuentas ?? [])
      // Cargar config de bonos desde configuraciones
      const bonosCfg = data.configuraciones?.find((c: any) => c.llave === 'bonos_config')
      if (bonosCfg?.valor) setBonosConfig(bonosCfg.valor)
      const globalCfg = data.configuraciones?.find((c: any) => c.llave === 'comision_global_pct')
      if (globalCfg?.valor?.pct !== undefined) setGlobalPct(globalCfg.valor.pct)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // ─── Comisiones ───
  const saveServicioComision = async (s: Servicio) => {
    setSavingId(s.id)
    const res = await fetch('/api/reglas-laborales', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'update_servicio_comision', servicio_id: s.id, comision_activa: s.comision_activa, comision_tipo: s.comision_tipo, comision_valor: s.comision_valor, comision_acumulable: s.comision_acumulable, comision_notas: s.comision_notas }),
    })
    if (res.ok) { success('Comisión actualizada') } else { toastError('Error al guardar') }
    setSavingId(null)
  }

  const updateServicio = (id: string, changes: Partial<Servicio>) => {
    setServicios(prev => prev.map(s => s.id === id ? { ...s, ...changes } : s))
  }

  const saveBarberoComision = async () => {
    if (!editBarbero) return
    const res = await fetch('/api/reglas-laborales', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'update_barbero_comision', barbero_id: editBarbero.id, comision_porcentaje: editBarbero.pct }),
    })
    if (res.ok) { 
      success('% del barbero actualizado'); 
      setBarberos(prev => prev.map(b => b.id === editBarbero.id ? { ...b, comision_porcentaje: editBarbero.pct } : b)) 
    } else {
      toastError('Error al guardar')
    }
    setEditBarbero(null)
  }

  const saveGlobal = async () => {
    const res = await fetch('/api/reglas-laborales', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accion: 'update_comision_global', pct: globalPct }) })
    if (res.ok) { success('% global guardado') } else { toastError('Error') }
  }

  // ─── Plan de cuentas / Sanciones ───
  const openCuenta = (c?: PlanCuenta) => {
    setEditingCuenta(c ?? null)
    setCuentaForm(c ? { codigo: c.codigo, detalle: c.detalle, tipo: c.tipo, nivel: c.nivel, es_sancion: c.es_sancion } : { codigo: '', detalle: '', tipo: 'EGRESO', nivel: 1, es_sancion: true })
    setShowCuentaModal(true)
  }

  const saveCuenta = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingCuenta(true)
    const res = await fetch('/api/reglas-laborales', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'upsert_plan_cuenta', id: editingCuenta?.id, ...cuentaForm }),
    })
    if (res.ok) { success('Cuenta guardada'); setShowCuentaModal(false); load() }
    else { toastError((await res.json()).error || 'Error') }
    setSavingCuenta(false)
  }

  const deleteCuenta = async (id: string) => {
    if (!confirm('¿Eliminar esta cuenta? Solo si no tiene transacciones.')) return
    const res = await fetch('/api/reglas-laborales', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accion: 'delete_plan_cuenta', id }) })
    if (res.ok) { success('Cuenta eliminada'); load() }
    else { toastError('No se puede eliminar (tiene registros asociados)') }
  }

  // ─── Bonos config ───
  const saveBonos = async () => {
    setSavingBonos(true)
    const res = await fetch('/api/reglas-laborales', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accion: 'update_bonos_config', valor: bonosConfig }) })
    if (res.ok) { success('Configuración de bonos guardada') } else { toastError('Error') }
    setSavingBonos(false)
  }

  const sanciones = planCuentas.filter(c => c.es_sancion)
  const cuentasNormales = planCuentas.filter(c => !c.es_sancion)

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="w-12 h-12 border-4 border-zinc-700 border-t-amber-500 rounded-full animate-spin" /></div>
  }

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-3 hover:bg-white/5 border border-white/5 rounded-2xl text-zinc-500 hover:text-amber-500 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tight">
              Reglas <span className="text-amber-500">Laborales</span>
            </h1>
            <p className="text-zinc-500 mt-1">Comisiones, sanciones y bonos — todo configurable desde aquí</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'comisiones', label: 'Comisiones', icon: Coins, color: 'text-amber-500' },
          { key: 'sanciones', label: `Catálogo de Sanciones (${sanciones.length})`, icon: AlertTriangle, color: 'text-red-500' },
          { key: 'bonos', label: 'Config. Bonos', icon: Gift, color: 'text-green-500' },
        ].map(({ key, label, icon: Icon, color }) => (
          <button key={key}
            onClick={() => setTab(key as any)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all border ${tab === key ? 'bg-white/10 border-white/20 text-white' : 'border-white/5 text-zinc-500 hover:border-white/10 hover:text-zinc-300'}`}
          >
            <Icon size={14} className={tab === key ? color : ''} /> {label}
          </button>
        ))}
      </div>

      {/* ════════ COMISIONES ════════ */}
      {tab === 'comisiones' && (
        <div className="space-y-8">

          {/* Comisión global por defecto */}
          <Card className="border-amber-500/20 bg-zinc-900/80">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-amber-500 mb-1">% Global por Defecto</p>
                  <p className="text-zinc-400 text-sm">Se aplica como fallback cuando un servicio no tiene comisión configurada</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-zinc-950 border border-white/10 rounded-xl px-4 py-2">
                    <input type="number" min={0} max={100} step={0.5} value={globalPct} onChange={e => setGlobalPct(parseFloat(e.target.value) || 0)}
                      className="w-16 bg-transparent text-amber-500 font-black text-xl outline-none text-center" />
                    <span className="text-zinc-500 font-black text-lg">%</span>
                  </div>
                  <Button variant="primary" size="sm" onClick={saveGlobal}><Save size={14} /></Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comisión por servicio */}
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-4 border-l-4 border-amber-500 pl-3">Comisión por Servicio</h2>
            <div className="space-y-2">
              {servicios.map(s => (
                <div key={s.id} className="border border-white/5 bg-zinc-900 rounded-2xl overflow-hidden">
                  {/* Fila principal */}
                  <div className="flex items-center justify-between p-4 gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white transition-colors" onClick={() => setExpandido(expandido === s.id ? null : s.id)}>
                        {expandido === s.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                      <div className="min-w-0">
                        <p className="font-black text-white uppercase truncate">{s.nombre}</p>
                        <p className="text-zinc-600 text-xs">{formatCurrency(s.precio)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <button onClick={() => updateServicio(s.id, { comision_activa: !s.comision_activa })} className="transition-colors">
                        {s.comision_activa ? <ToggleRight size={24} className="text-green-500" /> : <ToggleLeft size={24} className="text-zinc-600" />}
                      </button>
                      {s.comision_activa && (
                        <div className="text-right">
                          <p className="text-amber-500 font-black text-lg">
                            {s.comision_tipo === 'porcentaje' ? `${s.comision_valor}%` : s.comision_tipo === 'fija' ? `Bs ${s.comision_valor}` : '—'}
                          </p>
                          <p className="text-zinc-600 text-[10px] uppercase">{s.comision_tipo}</p>
                        </div>
                      )}
                      {!s.comision_activa && <Badge variant="default" className="text-[9px] uppercase">Sin comisión</Badge>}
                      <Button size="sm" variant="outline" disabled={savingId === s.id} onClick={() => saveServicioComision(s)}>
                        {savingId === s.id ? '...' : <Check size={14} className="text-green-500" />}
                      </Button>
                    </div>
                  </div>
                  {/* Panel expandido */}
                  {expandido === s.id && (
                    <div className="border-t border-white/5 bg-zinc-950 p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">Tipo</label>
                        <select className="w-full h-10 bg-zinc-900 border border-white/10 rounded-xl px-3 text-white text-sm"
                          value={s.comision_tipo} onChange={e => updateServicio(s.id, { comision_tipo: e.target.value })}>
                          <option value="ninguna">Ninguna</option>
                          <option value="porcentaje">Porcentaje %</option>
                          <option value="fija">Monto fijo Bs</option>
                        </select>
                      </div>
                      {s.comision_tipo !== 'ninguna' && (
                        <div>
                          <label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">
                            {s.comision_tipo === 'porcentaje' ? 'Porcentaje (%)' : 'Monto (Bs)'}
                          </label>
                          <input type="number" min={0} step={0.5}
                            className="w-full h-10 bg-zinc-900 border border-white/10 rounded-xl px-3 text-amber-500 font-black text-sm outline-none focus:border-amber-500/50"
                            value={s.comision_valor} onChange={e => updateServicio(s.id, { comision_valor: parseFloat(e.target.value) || 0 })} />
                        </div>
                      )}
                      <div className="flex items-end gap-2">
                        <label className="flex items-center gap-2 text-sm text-zinc-400 pb-2">
                          <input type="checkbox" checked={s.comision_acumulable} onChange={e => updateServicio(s.id, { comision_acumulable: e.target.checked })} />
                          Acumulable
                        </label>
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">Notas</label>
                        <input type="text" className="w-full h-10 bg-zinc-900 border border-white/10 rounded-xl px-3 text-white text-sm outline-none focus:border-amber-500/50"
                          value={s.comision_notas ?? ''} onChange={e => updateServicio(s.id, { comision_notas: e.target.value })} placeholder="Observación..." />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Comisión por barbero */}
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-4 border-l-4 border-purple-500 pl-3">Comisión por Barbero (override)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {barberos.map(b => (
                <Card key={b.id} className="bg-zinc-900 border-white/5 hover:border-purple-500/20 transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-black text-white">{b.full_name}</p>
                        <Badge variant="default" className="text-[9px] uppercase mt-1">{b.role}</Badge>
                      </div>
                      {editBarbero?.id === b.id ? (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 bg-zinc-950 border border-purple-500/30 rounded-xl px-3 py-1">
                            <input type="number" min={0} max={100} step={0.5} value={editBarbero.pct}
                              onChange={e => setEditBarbero({ ...editBarbero, pct: parseFloat(e.target.value) || 0 })}
                              className="w-14 bg-transparent text-purple-400 font-black outline-none text-center" autoFocus />
                            <span className="text-zinc-500 font-bold">%</span>
                          </div>
                          <button onClick={saveBarberoComision} className="w-8 h-8 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center justify-center text-green-500 hover:bg-green-500/20 transition-colors"><Check size={14} /></button>
                          <button onClick={() => setEditBarbero(null)} className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-500"><X size={14} /></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="text-right cursor-pointer" onClick={() => setEditBarbero({ id: b.id, pct: b.comision_porcentaje ?? 0 })}>
                            <p className="text-purple-400 font-black text-2xl">{b.comision_porcentaje ?? 0}<span className="text-base">%</span></p>
                            <p className="text-zinc-600 text-[10px] uppercase">toca para editar</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════ SANCIONES ════════ */}
      {tab === 'sanciones' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-zinc-500 text-sm">Catálogo de cuentas contables. Las marcadas como "Sanción" aparecen en el formulario de sanciones.</p>
            <Button variant="primary" onClick={() => openCuenta()}><Plus size={14} className="mr-2" /> Nueva Cuenta</Button>
          </div>

          {/* Sanciones */}
          <h3 className="text-xs font-black uppercase tracking-widest text-red-500 border-l-4 border-red-500 pl-3">Cuentas de Sanción</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-zinc-600 text-[10px] uppercase tracking-widest border-b border-white/5">
                  <th className="text-left py-3 px-4">Código</th>
                  <th className="text-left py-3 px-4">Nombre / Detalle</th>
                  <th className="text-left py-3 px-4">Tipo</th>
                  <th className="text-center py-3 px-4">Nivel</th>
                  <th className="text-right py-3 px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sanciones.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-12 text-zinc-700 font-black uppercase tracking-widest">No hay cuentas de sanción</td></tr>
                )}
                {sanciones.map(c => (
                  <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02] group">
                    <td className="py-3 px-4 font-mono text-amber-500 font-black">{c.codigo}</td>
                    <td className="py-3 px-4 font-bold text-white">{c.detalle}</td>
                    <td className="py-3 px-4"><Badge variant="danger" className="text-[9px] uppercase">{c.tipo}</Badge></td>
                    <td className="py-3 px-4 text-center text-zinc-400">{c.nivel}</td>
                    <td className="py-3 px-4 text-right flex justify-end gap-1">
                      <Button size="sm" variant="outline" onClick={() => openCuenta(c)}><Edit size={12} /></Button>
                      <Button size="sm" variant="outline" onClick={() => deleteCuenta(c.id)}><Trash2 size={12} className="text-red-500" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Todas las demás cuentas */}
          {cuentasNormales.length > 0 && (
            <>
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 border-l-4 border-zinc-600 pl-3 mt-8">Resto del Plan de Cuentas</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-zinc-600 text-[10px] uppercase tracking-widest border-b border-white/5">
                      <th className="text-left py-3 px-4">Código</th>
                      <th className="text-left py-3 px-4">Detalle</th>
                      <th className="text-left py-3 px-4">Tipo</th>
                      <th className="text-right py-3 px-4">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cuentasNormales.map(c => (
                      <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="py-2 px-4 font-mono text-zinc-400 text-xs">{c.codigo}</td>
                        <td className="py-2 px-4 text-zinc-300 text-xs">{c.detalle}</td>
                        <td className="py-2 px-4"><Badge variant="default" className="text-[9px]">{c.tipo}</Badge></td>
                        <td className="py-2 px-4 text-right flex justify-end gap-1">
                          <Button size="sm" variant="outline" onClick={() => openCuenta(c)}><Edit size={12} /></Button>
                          <Button size="sm" variant="outline" onClick={() => deleteCuenta(c.id)}><Trash2 size={12} className="text-red-500" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* ════════ BONOS ════════ */}
      {tab === 'bonos' && (
        <div className="space-y-6">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
            <p className="text-amber-400 text-sm font-bold">
              Los tipos de bono (puntualidad, cantidad_servicios, metas, otro) están definidos en la base de datos.
              Aquí puedes configurar sus <strong>descripciones</strong> y <strong>montos sugeridos</strong> que aparecerán en el formulario al crear un bono.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BONO_TIPOS.map(tipo => {
              const cfg = bonosConfig[tipo.key] ?? { descripcion: '', monto_sugerido: 0 }
              return (
                <Card key={tipo.key} className="bg-zinc-900 border-white/5 hover:border-green-500/20 transition-all">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{tipo.emoji}</span>
                      <div>
                        <p className="font-black text-white uppercase">{tipo.label}</p>
                        <p className="text-zinc-600 text-[10px] font-mono uppercase">{tipo.key}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">Descripción sugerida</label>
                        <textarea
                          value={cfg.descripcion}
                          onChange={e => setBonosConfig(prev => ({ ...prev, [tipo.key]: { ...prev[tipo.key], descripcion: e.target.value } }))}
                          className="w-full h-16 bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-green-500/50 resize-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">Monto sugerido (Bs)</label>
                        <div className="flex items-center gap-2 bg-zinc-950 border border-white/10 rounded-xl px-3 py-2">
                          <span className="text-zinc-500 font-bold">Bs</span>
                          <input type="number" min={0} step={5}
                            value={cfg.monto_sugerido}
                            onChange={e => setBonosConfig(prev => ({ ...prev, [tipo.key]: { ...prev[tipo.key], monto_sugerido: parseFloat(e.target.value) || 0 } }))}
                            className="flex-1 bg-transparent text-green-400 font-black text-lg outline-none" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Button variant="primary" className="w-full h-14 font-black uppercase tracking-widest" onClick={saveBonos} disabled={savingBonos}>
            <Save size={18} className="mr-2" /> {savingBonos ? 'Guardando...' : 'Guardar Configuración de Bonos'}
          </Button>
        </div>
      )}

      {/* ════════ MODAL CUENTA CONTABLE ════════ */}
      {showCuentaModal && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-black text-white uppercase">{editingCuenta ? 'Editar Cuenta' : 'Nueva Cuenta Contable'}</h3>
              <button onClick={() => setShowCuentaModal(false)} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-zinc-500"><X size={16} /></button>
            </div>
            <form onSubmit={saveCuenta} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">Código</label>
                  <input required value={cuentaForm.codigo} onChange={e => setCuentaForm({ ...cuentaForm, codigo: e.target.value })} placeholder="4.2.4.3" className="w-full h-11 bg-zinc-900 border border-white/10 rounded-xl px-4 text-white font-mono outline-none focus:border-amber-500/50" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">Nivel</label>
                  <input type="number" min={1} max={5} value={cuentaForm.nivel} onChange={e => setCuentaForm({ ...cuentaForm, nivel: parseInt(e.target.value) || 1 })} className="w-full h-11 bg-zinc-900 border border-white/10 rounded-xl px-4 text-white outline-none focus:border-amber-500/50" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">Nombre / Detalle</label>
                <input required value={cuentaForm.detalle} onChange={e => setCuentaForm({ ...cuentaForm, detalle: e.target.value })} placeholder="Incumplimiento de horario" className="w-full h-11 bg-zinc-900 border border-white/10 rounded-xl px-4 text-white outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">Tipo de cuenta</label>
                <select value={cuentaForm.tipo} onChange={e => setCuentaForm({ ...cuentaForm, tipo: e.target.value })} className="w-full h-11 bg-zinc-900 border border-white/10 rounded-xl px-4 text-white outline-none">
                  {TIPOS_CUENTA.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <label className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl cursor-pointer hover:bg-red-500/15 transition-colors">
                <input type="checkbox" checked={cuentaForm.es_sancion} onChange={e => setCuentaForm({ ...cuentaForm, es_sancion: e.target.checked })} className="w-4 h-4" />
                <div>
                  <p className="text-red-400 font-black text-sm">Marcar como Sanción</p>
                  <p className="text-red-600 text-xs">Aparece en el formulario de registro de sanciones</p>
                </div>
              </label>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCuentaModal(false)}>Cancelar</Button>
                <Button type="submit" variant="primary" className="flex-1" disabled={savingCuenta}><Save size={14} className="mr-2" />{savingCuenta ? 'Guardando...' : 'Guardar'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState, useEffect, useMemo } from "react";
import { X, UserPlus, Clock } from "lucide-react";
import { apiClient } from "./utils/apsClient";

interface Barbero  { id: number; nombre: string; apellido: string; }
interface Servicio { id: number; nombre: string; duracionMinutos: number; }
interface Sucursal { id: number; nombre: string; }

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  barberoPreseleccionado?: number;
}

const ESTADO_INICIAL = {
  nombre: "", barberoId: "", servicioId: "",
  sucursalId: "", fecha: "", slot: "",
};

export function WalkInModal({ isOpen, onClose, onSuccess, barberoPreseleccionado }: Props) {
  const [form, setForm] = useState(ESTADO_INICIAL);
  const [barberos, setBarberos] = useState<Barbero[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [horariosBase, setHorariosBase] = useState<any[]>([]);
  const [turnosOcupados, setTurnosOcupados] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    Promise.all([
      apiClient<Barbero[]>("/usuarios/barberos"),
      apiClient<Servicio[]>("/servicios"),
      apiClient<Sucursal[]>("/sucursales"),
      apiClient<any[]>("/horarios"),
    ]).then(([b, s, su, h]) => {
      setBarberos(b);
      setServicios(s);
      setSucursales(su);
      setHorariosBase(h);
    }).catch(() => setError("Error al cargar datos iniciales"));

    setForm({ 
      ...ESTADO_INICIAL, 
      barberoId: barberoPreseleccionado?.toString() ?? "" 
    });
    setError("");
  }, [isOpen, barberoPreseleccionado]);

  // Cargar turnos ocupados cada vez que cambia barbero o fecha
  useEffect(() => {
    if (form.barberoId && form.fecha) {
      apiClient<any[]>(`/turnos?barberoId=${form.barberoId}`)
        .then(setTurnosOcupados)
        .catch(console.error);
    }
  }, [form.barberoId, form.fecha]);

  // LÓGICA DE SLOTS CORREGIDA
  const slotsDisponibles = useMemo(() => {
    const srv = servicios.find(s => s.id.toString() === form.servicioId);
    if (!srv || !form.barberoId || !form.sucursalId || !form.fecha) return [];

    const date = new Date(form.fecha + "T12:00:00");
    const day = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][date.getDay()];
    
    // 🔴 CORRECCIÓN: Usamos == para comparar string con number sin fallar
    const config = horariosBase.find(h => 
      h.barbero?.id == form.barberoId && 
      h.sucursal?.id == form.sucursalId && 
      h.diaSemana === day
    );

    if (!config || !config.horaInicio || !config.horaFin) return [];

    const parseMin = (t: string) => {
      const [h, m] = t.split(":");
      return parseInt(h) * 60 + parseInt(m);
    };

    const inicioMin = parseMin(config.horaInicio);
    const finMin = parseMin(config.horaFin);
    const duracion = srv.duracionMinutos;

    const res: string[] = [];
    for (let m = inicioMin; m + duracion <= finMin; m += 15) {
      const hh = Math.floor(m / 60).toString().padStart(2, "0");
      const mm = (m % 60).toString().padStart(2, "0");
      
      const slotStart = new Date(`${form.fecha}T${hh}:${mm}:00`);
      const slotEnd = new Date(slotStart.getTime() + duracion * 60000);

      const ocupado = turnosOcupados.some(t => {
        if (t.estado?.toUpperCase() === "CANCELADO") return false;
        const tStart = new Date(t.fechaHoraInicio);
        const tEnd = new Date(t.fechaHoraFin);
        return slotStart < tEnd && slotEnd > tStart;
      });

      if (!ocupado) res.push(`${hh}:${mm}`);
    }
    return res;
  }, [form, servicios, horariosBase, turnosOcupados]);

  async function handleSubmit() {
    if (!form.nombre.trim() || !form.slot) return setError("Falta nombre u horario");
    setLoading(true);
    try {
      const srv = servicios.find(s => s.id.toString() === form.servicioId);
      const start = new Date(`${form.fecha}T${form.slot}:00`);
      await apiClient("/turnos/walkin", {
        method: "POST",
        body: JSON.stringify({
          nombreWalkin: form.nombre.trim(),
          barberoId: parseInt(form.barberoId),
          servicioId: parseInt(form.servicioId),
          sucursalId: parseInt(form.sucursalId),
          fechaHoraInicio: start.toISOString(),
          fechaHoraFin: new Date(start.getTime() + (srv?.duracionMinutos || 30) * 60000).toISOString()
        }),
        successMessage: "Turno registrado"
      });
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl w-full max-w-lg shadow-2xl overflow-y-auto max-h-[95vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex gap-2 items-center">
            <UserPlus className="text-yellow-500"/> Nuevo Walk-in
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X/></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-zinc-500 uppercase font-bold mb-1 block">Nombre Cliente</label>
            <input 
              value={form.nombre} 
              onChange={e => setForm({...form, nombre: e.target.value})} 
              placeholder="Nombre del cliente"
              className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white outline-none focus:border-yellow-500" 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-500 uppercase font-bold mb-1 block">Sucursal</label>
              <select value={form.sucursalId} onChange={e => setForm({...form, sucursalId: e.target.value})} className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white">
                <option value="">Seleccioná</option>
                {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-500 uppercase font-bold mb-1 block">Servicio</label>
              <select value={form.servicioId} onChange={e => setForm({...form, servicioId: e.target.value})} className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white">
                <option value="">Seleccioná</option>
                {servicios.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-500 uppercase font-bold mb-1 block">Barbero</label>
              <select 
                value={form.barberoId} 
                onChange={e => setForm({...form, barberoId: e.target.value})} 
                disabled={!!barberoPreseleccionado}
                className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white disabled:opacity-50"
              >
                <option value="">Seleccioná</option>
                {barberos.map(b => <option key={b.id} value={b.id}>{b.nombre} {b.apellido}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-500 uppercase font-bold mb-1 block">Fecha</label>
              <input 
                type="date" 
                value={form.fecha} 
                min={new Date().toISOString().split("T")[0]} 
                onChange={e => setForm({...form, fecha: e.target.value})} 
                className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white" 
                style={{colorScheme: 'dark'}} 
              />
            </div>
          </div>

          {/* SECCIÓN DE HORARIOS */}
          <div className="mt-6">
            <label className="text-xs text-zinc-500 uppercase font-bold mb-2 flex items-center gap-2">
              <Clock size={14}/> Horarios Disponibles
            </label>
            
            {!form.fecha || !form.servicioId || !form.barberoId || !form.sucursalId ? (
              <p className="text-zinc-600 text-sm italic">Completá los datos arriba para ver horarios.</p>
            ) : slotsDisponibles.length > 0 ? (
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 scrollbar-hide">
                {slotsDisponibles.map(s => (
                  <button 
                    key={s} 
                    type="button"
                    onClick={() => setForm({...form, slot: s})} 
                    className={`p-2 rounded-lg text-xs font-bold border transition-all ${
                      form.slot === s 
                        ? 'bg-yellow-500 text-black border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.4)]' 
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                No hay turnos disponibles para esta selección o el barbero no trabaja este día.
              </p>
            )}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mt-4 bg-red-500/10 p-2 rounded border border-red-500/20">{error}</p>}

        <button 
          onClick={handleSubmit} 
          disabled={loading || !form.slot} 
          className="w-full mt-8 py-4 bg-yellow-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-yellow-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-yellow-500/20"
        >
          {loading ? "Registrando..." : "Confirmar Turno"}
        </button>
      </div>
    </div>
  );
}
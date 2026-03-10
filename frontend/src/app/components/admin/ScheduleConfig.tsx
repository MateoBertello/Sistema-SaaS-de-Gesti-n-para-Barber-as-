import React, { useState, useEffect } from "react";
import { Plus, Trash2, Clock } from "lucide-react";
import { apiClient } from "../utils/apsClient";

const DIAS = [
  { value: "MONDAY",    label: "Lunes"     },
  { value: "TUESDAY",   label: "Martes"    },
  { value: "WEDNESDAY", label: "Miércoles" },
  { value: "THURSDAY",  label: "Jueves"    },
  { value: "FRIDAY",    label: "Viernes"   },
  { value: "SATURDAY",  label: "Sábado"    },
  { value: "SUNDAY",    label: "Domingo"   },
];

const DIA_LABEL: Record<string, string> = Object.fromEntries(
  DIAS.map(d => [d.value, d.label])
);

const selectStyle = {
  background: "var(--surface2)",
  border: "1px solid var(--border)",
  color: "var(--text)",
};

export function ScheduleConfig() {
  const [horarios, setHorarios]   = useState<any[]>([]);
  const [barberos, setBarberos]   = useState<any[]>([]);
  const [sucursales, setSucursales] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    barberoId:   "",
    sucursalId:  "",
    diaSemana:   "MONDAY",
    horaInicio:  "09:00",
    horaFin:     "18:00",
  });

  const load = async () => {
    try {
      const [h, b, s] = await Promise.all([
        apiClient<any[]>("/horarios"),
        apiClient<any[]>("/usuarios/barberos"),
        apiClient<any[]>("/sucursales"),
      ]);
      setHorarios(h);
      setBarberos(b.filter((barbero: any) => barbero.activo === true));
      setSucursales(s.filter((sucursal: any) => sucursal.activa === true));
    } catch (e) { console.error(e); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.barberoId || !form.sucursalId) return;
    try {
      await apiClient("/horarios", {
        method: "POST",
        body: JSON.stringify({
          barbero:    { id: Number(form.barberoId)  },
          sucursal:   { id: Number(form.sucursalId) },
          diaSemana:  form.diaSemana,
          horaInicio: form.horaInicio,
          horaFin:    form.horaFin,
        }),
        successMessage: "Horario guardado",
      });
      setShowModal(false);
      setForm({ barberoId: "", sucursalId: "", diaSemana: "MONDAY", horaInicio: "09:00", horaFin: "18:00" });
      load();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este horario?")) return;
    try {
      await apiClient(`/horarios/${id}`, { method: "DELETE", successMessage: "Horario eliminado" });
      setHorarios(h => h.filter(x => x.id !== id));
    } catch (e) { console.error(e); }
  };

  // Agrupar horarios por barbero para mostrarlos ordenados
  const porBarbero = horarios.reduce((acc: Record<string, any[]>, h) => {
    const nombre = h.barbero?.nombre ?? "Sin asignar";
    if (!acc[nombre]) acc[nombre] = [];
    acc[nombre].push(h);
    return acc;
  }, {});

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Horarios</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text2)" }}>
            Configurá los días y horas de trabajo de cada barbero.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex gap-2 px-4 py-2 rounded font-medium h-fit"
          style={{ background: "var(--gold)", color: "#000" }}
        >
          <Plus className="w-4 h-4" /> Nuevo
        </button>
      </div>

      {/* Lista agrupada por barbero */}
      {Object.keys(porBarbero).length === 0 ? (
        <div
          className="p-10 rounded-xl text-center"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <Clock className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--gold)" }} />
          <p style={{ color: "var(--text2)" }}>No hay horarios configurados aún.</p>
        </div>
      ) : (
        Object.entries(porBarbero).map(([nombreBarbero, filas]) => (
          <div
            key={nombreBarbero}
            className="mb-6 rounded-xl overflow-hidden"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            {/* Header del barbero */}
            <div
              className="px-5 py-3 flex items-center gap-3"
              style={{ borderBottom: "1px solid var(--border)", background: "var(--surface2)" }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: "var(--gold)", color: "#000" }}
              >
                {nombreBarbero.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium" style={{ color: "var(--text)" }}>{nombreBarbero}</span>
            </div>

            {/* Filas de horario */}
            {filas.map(h => (
              <div
                key={h.id}
                className="px-5 py-3 flex items-center justify-between"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <div className="flex items-center gap-6">
                  <span className="text-sm w-24" style={{ color: "var(--text)" }}>
                    {DIA_LABEL[h.diaSemana] ?? h.diaSemana}
                  </span>
                  <span className="text-sm" style={{ color: "var(--text2)" }}>
                    {h.sucursal?.nombre ?? "-"}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className="text-sm font-medium px-3 py-1 rounded-full"
                    style={{ background: "var(--surface2)", color: "var(--gold)" }}
                  >
                    {h.horaInicio} — {h.horaFin}
                  </span>
                  <button
                    onClick={() => handleDelete(h.id)}
                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))
      )}

      {/* Modal nuevo horario */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div
            className="w-full max-w-md rounded-xl p-6"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex justify-between mb-5">
              <h3 className="font-bold" style={{ color: "var(--text)" }}>Nuevo Horario</h3>
              <button onClick={() => setShowModal(false)} style={{ color: "var(--text2)" }}>✕</button>
            </div>

            <div className="space-y-3">

              {/* Barbero */}
              <div>
                <label className="block text-xs mb-1 uppercase tracking-wider" style={{ color: "var(--text2)" }}>
                  Barbero
                </label>
                <select
                  value={form.barberoId}
                  onChange={e => setForm({ ...form, barberoId: e.target.value })}
                  className="w-full rounded p-2 outline-none"
                  style={selectStyle}
                >
                  <option value="">Seleccioná un barbero</option>
                  {barberos.map(b => (
                    <option key={b.id} value={b.id}>{b.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Sucursal */}
              <div>
                <label className="block text-xs mb-1 uppercase tracking-wider" style={{ color: "var(--text2)" }}>
                  Sucursal
                </label>
                <select
                  value={form.sucursalId}
                  onChange={e => setForm({ ...form, sucursalId: e.target.value })}
                  className="w-full rounded p-2 outline-none"
                  style={selectStyle}
                >
                  <option value="">Seleccioná una sucursal</option>
                  {sucursales.map(s => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Día */}
              <div>
                <label className="block text-xs mb-1 uppercase tracking-wider" style={{ color: "var(--text2)" }}>
                  Día de la semana
                </label>
                <select
                  value={form.diaSemana}
                  onChange={e => setForm({ ...form, diaSemana: e.target.value })}
                  className="w-full rounded p-2 outline-none"
                  style={selectStyle}
                >
                  {DIAS.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>

              {/* Horario */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1 uppercase tracking-wider" style={{ color: "var(--text2)" }}>
                    Entrada
                  </label>
                  <input
                    type="time"
                    value={form.horaInicio}
                    onChange={e => setForm({ ...form, horaInicio: e.target.value })}
                    className="w-full rounded p-2 outline-none"
                    style={selectStyle}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1 uppercase tracking-wider" style={{ color: "var(--text2)" }}>
                    Salida
                  </label>
                  <input
                    type="time"
                    value={form.horaFin}
                    onChange={e => setForm({ ...form, horaFin: e.target.value })}
                    className="w-full rounded p-2 outline-none"
                    style={selectStyle}
                  />
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={!form.barberoId || !form.sucursalId}
                className="w-full py-2 font-bold rounded mt-1 disabled:opacity-40"
                style={{ background: "var(--gold)", color: "#000" }}
              >
                Guardar Horario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
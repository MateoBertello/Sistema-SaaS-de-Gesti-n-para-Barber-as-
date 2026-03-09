import React, { useState, useEffect } from "react";
import { Plus, Scissors } from "lucide-react";
import { apiClient } from "../utils/apsClient";

// 1 módulo = 15 min, máximo 8 módulos (2 horas)
const MODULOS = [1, 2, 3, 4, 5, 6, 7, 8];

function modulosAMinutos(modulos: number) {
  return modulos * 15;
}

function minutosAModulos(minutos: number) {
  return Math.round(minutos / 15);
}

function duracionLabel(minutos: number) {
  const modulos = minutosAModulos(minutos);
  if (minutos < 60) return `${modulos} mód. (${minutos} min)`;
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  const tiempoStr = m > 0 ? `${h}h ${m}min` : `${h}h`;
  return `${modulos} mód. (${tiempoStr})`;
}

const Input = ({ label, value, onChange, type = "text", placeholder = "" }: any) => (
  <div className="mb-3">
    <label className="block text-xs mb-1 uppercase tracking-wider" style={{ color: "var(--text2)" }}>
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded p-2 outline-none"
      style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)" }}
    />
  </div>
);

export function ServicesManagement() {
  const [services, setServices] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", modulos: "2", price: "" });

  const load = () => apiClient<any[]>("/servicios").then(setServices).catch(console.error);
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.name || !form.modulos || !form.price) return;
    try {
      await apiClient("/servicios", {
        method: "POST",
        body: JSON.stringify({
          nombre: form.name,
          duracionMinutos: modulosAMinutos(parseInt(form.modulos)),
          precio: parseFloat(form.price),
          activo: true,
        }),
        successMessage: "Servicio guardado",
      });
      setShowModal(false);
      setForm({ name: "", modulos: "2", price: "" });
      load();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Borrar este servicio?")) return;
    try {
      await apiClient(`/servicios/${id}`, { method: "DELETE", successMessage: "Servicio eliminado" });
      setServices(s => s.filter(x => x.id !== id));
    } catch (e) { console.error(e); }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Servicios</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex gap-2 px-4 py-2 rounded font-medium"
          style={{ background: "var(--gold)", color: "#000" }}
        >
          <Plus className="w-4 h-4" /> Nuevo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {services.map(s => (
          <div
            key={s.id}
            className="p-5 rounded-xl"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex justify-between mb-2">
              <Scissors className="w-5 h-5" style={{ color: "var(--gold)" }} />
              <span className="font-bold" style={{ color: "var(--text)" }}>${Number(s.precio).toFixed(2)}</span>
            </div>
            <h3 className="font-medium" style={{ color: "var(--text)" }}>{s.nombre}</h3>
            <p className="text-xs mb-4" style={{ color: "var(--text2)" }}>{duracionLabel(s.duracionMinutos)}</p>
            <button
              onClick={() => handleDelete(s.id)}
              className="w-full py-2 rounded border border-red-900/30 text-red-400 hover:bg-red-900/10 text-xs"
            >
              Eliminar
            </button>
          </div>
        ))}
        {services.length === 0 && (
          <div className="col-span-3 text-center py-12" style={{ color: "var(--text2)" }}>
            No hay servicios registrados.
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div
            className="w-full max-w-md rounded-xl p-6"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex justify-between mb-4">
              <h3 className="font-bold" style={{ color: "var(--text)" }}>Nuevo Servicio</h3>
              <button onClick={() => setShowModal(false)} style={{ color: "var(--text2)" }}>✕</button>
            </div>

            <Input
              label="Nombre"
              value={form.name}
              onChange={(v: string) => setForm({ ...form, name: v })}
              placeholder="Ej. Corte clásico"
            />

            {/* Duración en módulos de 15 min */}
            <div className="mb-3">
              <label className="block text-xs mb-1 uppercase tracking-wider" style={{ color: "var(--text2)" }}>
                Duración (módulos de 15 min)
              </label>
              <select
                value={form.modulos}
                onChange={e => setForm({ ...form, modulos: e.target.value })}
                className="w-full rounded p-2 outline-none"
                style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)" }}
              >
                {MODULOS.map(m => (
                  <option key={m} value={m}>
                    {m} {m === 1 ? "módulo" : "módulos"} — {modulosAMinutos(m)} min
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Precio ($)"
              value={form.price}
              onChange={(v: string) => setForm({ ...form, price: v })}
              type="number"
              placeholder="Ej. 1500"
            />

            <button
              onClick={handleSave}
              className="w-full py-2 font-bold rounded mt-2"
              style={{ background: "var(--gold)", color: "#000" }}
            >
              Guardar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
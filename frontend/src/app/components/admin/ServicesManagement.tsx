import React, { useState, useEffect } from "react";
import { Plus, Scissors, AlertTriangle, Trash2 } from "lucide-react";
import { apiClient } from "../utils/apsClient";

const Input = ({ label, value, onChange, type = "text" }: any) => (
  <div className="mb-3">
    <label className="block text-xs mb-1 uppercase" style={{ color: "var(--text2)" }}>{label}</label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full rounded p-2 outline-none"
      style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)" }}
    />
  </div>
);

export function ServicesManagement() {
  const [services, setServices] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", duration: "", price: "" });

  // Cargamos TODO (activos e inactivos) para el historial
  const load = () => apiClient<any[]>("/servicios").then(setServices).catch(console.error);
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.name || !form.duration || !form.price) return;
    try {
      await apiClient("/servicios", {
        method: "POST",
        body: JSON.stringify({ nombre: form.name, duracionMinutos: parseInt(form.duration), precio: parseFloat(form.price), activo: true }),
        successMessage: "Servicio guardado",
      });
      setShowModal(false);
      setForm({ name: "", duration: "", price: "" });
      load();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (s: any) => {
    if (!confirm("¿Deshabilitar este servicio?")) return;
    try {
      // 1. Llamada al Backend (Soft Delete)
      await apiClient(`/servicios/${s.id}`, { method: "DELETE", successMessage: "Servicio deshabilitado" });
      
      // 2. Actualización Visual: No lo borramos, lo marcamos como inactivo
      setServices(prev => prev.map(item => 
        item.id === s.id ? { ...item, activo: false } : item
      ));
    } catch (e) { console.error(e); }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Servicios</h1>
        <button onClick={() => setShowModal(true)} className="flex gap-2 px-4 py-2 rounded font-medium" style={{ background: "var(--gold)", color: "#000" }}>
          <Plus className="w-4 h-4" /> Nuevo
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {services.map(s => {
          const inactivo = s.activo === false; // Detectar si está borrado
          return (
            <div key={s.id} className="p-5 rounded-xl relative overflow-hidden transition-all" 
                 style={{ 
                   background: "var(--surface)", 
                   border: inactivo ? "1px solid #7f1d1d" : "1px solid var(--border)",
                   opacity: inactivo ? 0.6 : 1 
                 }}>
              
              {inactivo && (
                <div className="absolute top-0 right-0 bg-red-900/80 text-red-200 text-[10px] px-2 py-1 rounded-bl font-bold flex items-center gap-1">
                   <AlertTriangle className="w-3 h-3"/> INACTIVO
                </div>
              )}

              <div className="flex justify-between mb-2 mt-2">
                <Scissors className="w-5 h-5" style={{ color: inactivo ? "var(--text2)" : "var(--gold)" }} />
                <span className="font-bold" style={{ color: inactivo ? "var(--text2)" : "var(--text)" }}>${Number(s.precio).toFixed(2)}</span>
              </div>
              <h3 className="font-medium" style={{ color: inactivo ? "var(--text2)" : "var(--text)" }}>{s.nombre}</h3>
              <p className="text-xs mb-4" style={{ color: "var(--text2)" }}>{s.duracionMinutos} min</p>
              
              {!inactivo ? (
                <button onClick={() => handleDelete(s)} className="w-full py-2 rounded border border-red-900/30 text-red-400 hover:bg-red-900/10 text-xs flex items-center justify-center gap-2">
                  <Trash2 className="w-3 h-3"/> Desactivar
                </button>
              ) : (
                <div className="w-full py-2 text-center text-xs text-zinc-500 italic bg-black/20 rounded">
                  No disponible
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* ... Modal se mantiene igual ... */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="w-full max-w-md rounded-xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="flex justify-between mb-4">
              <h3 className="font-bold" style={{ color: "var(--text)" }}>Nuevo Servicio</h3>
              <button onClick={() => setShowModal(false)} style={{ color: "var(--text2)" }}>✕</button>
            </div>
            <Input label="Nombre" value={form.name} onChange={(v: string) => setForm({ ...form, name: v })} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Duración (min)" value={form.duration} onChange={(v: string) => setForm({ ...form, duration: v })} type="number" />
              <Input label="Precio ($)" value={form.price} onChange={(v: string) => setForm({ ...form, price: v })} type="number" />
            </div>
            <button onClick={handleSave} className="w-full py-2 font-bold rounded mt-2" style={{ background: "var(--gold)", color: "#000" }}>Guardar</button>
          </div>
        </div>
      )}
    </div>
  );
}
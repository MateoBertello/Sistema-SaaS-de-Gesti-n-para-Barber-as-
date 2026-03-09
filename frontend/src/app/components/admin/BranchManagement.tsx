import React, { useState, useEffect } from "react";
import { Plus, MapPin, Trash2, Power, AlertTriangle } from "lucide-react"; // Importamos iconos
import { apiClient } from "../utils/apsClient";

export function BranchManagement() {
  const [branches, setBranches] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", phone: "" });

  // 1. CARGA INICIAL (Traemos todo)
  const load = () => apiClient<any[]>("/sucursales")
    .then(data => setBranches(data))
    .catch(console.error);

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    try {
      await apiClient("/sucursales", {
        method: "POST",
        body: JSON.stringify({ 
            nombre: form.name, 
            direccion: form.address, 
            telefono: form.phone, 
            activa: true 
        }),
        successMessage: "Sucursal creada"
      });
      setShowModal(false);
      setForm({ name: "", address: "", phone: "" });
      load();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (b: any) => {
    if (!confirm(`¿Desactivar definitivamente la sucursal ${b.nombre}?`)) return;
    try {
      // Backend hace soft delete
      await apiClient(`/sucursales/${b.id}`, { method: "DELETE", successMessage: "Sucursal desactivada" });
      load(); // Recargamos para actualizar vista
    } catch (e) { console.error(e); }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Sucursales</h1>
        <button onClick={() => setShowModal(true)} className="flex gap-2 px-4 py-2 rounded font-medium" style={{ background: "var(--gold)", color: "#000" }}>
          <Plus className="w-4 h-4" /> Nueva
        </button>
      </div>
      <div className="grid gap-4">
        {branches.map(b => {
          const isInactive = b.activa === false; // Chequeamos estado

          return (
            <div 
              key={b.id} 
              className="p-5 rounded-xl flex justify-between items-center transition-all" 
              style={{ 
                  background: "var(--surface)", 
                  border: isInactive ? "1px solid #7f1d1d" : "1px solid var(--border)", 
                  opacity: isInactive ? 0.6 : 1, // Opacidad baja si inactivo
              }}
            >
              <div>
                <h3 className="font-medium" style={{ color: isInactive ? "var(--text2)" : "var(--text)" }}>{b.nombre}</h3>
                <div className="text-sm flex gap-1 items-center" style={{ color: "var(--text2)" }}>
                  <MapPin className="w-3 h-3" /> {b.direccion}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                  {/* ESTADO VISUAL */}
                  {!isInactive ? (
                      <span className="text-xs px-2 py-1 rounded bg-green-900/30 text-green-400 font-bold flex items-center gap-1">
                          <Power className="w-3 h-3"/> Activa
                      </span>
                  ) : (
                      <span className="text-xs px-2 py-1 rounded bg-red-900/30 text-red-400 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3"/> Inactiva
                      </span>
                  )}
                  
                  {/* ACCIONES CONDICIONALES */}
                  {!isInactive ? (
                      <button 
                          onClick={() => handleDelete(b)}
                          className="p-2 text-red-400 hover:bg-red-900/20 rounded transition-colors"
                          title="Eliminar (Desactivar)"
                      >
                          <Trash2 className="w-4 h-4"/>
                      </button>
                  ) : (
                      <div className="w-8 h-8 flex items-center justify-center text-zinc-700" title="Registro histórico">
                          <Trash2 className="w-4 h-4 opacity-30"/>
                      </div>
                  )}
              </div>
            </div>
          );
        })}
        {branches.length === 0 && <div className="text-center py-12" style={{ color: "var(--text2)" }}>No hay sucursales registradas.</div>}
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="w-full max-w-md rounded-xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="flex justify-between mb-4">
              <h3 className="font-bold" style={{ color: "var(--text)" }}>Nueva Sucursal</h3>
              <button onClick={() => setShowModal(false)} style={{ color: "var(--text2)" }}>✕</button>
            </div>
            <div className="space-y-3">
              {[{ val: form.name, key: "name", ph: "Nombre" }, { val: form.address, key: "address", ph: "Dirección" }, { val: form.phone, key: "phone", ph: "Teléfono" }].map(f => (
                <input key={f.key} value={f.val} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.ph}
                  className="w-full p-2 rounded outline-none" style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)" }} />
              ))}
              <button onClick={handleSave} className="w-full py-2 font-bold rounded" style={{ background: "var(--gold)", color: "#000" }}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, Scissors, XCircle } from "lucide-react";
import { apiClient } from "../utils/apsClient";

export function ClientDashboard() {
  const [turnos, setTurnos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    const userId = localStorage.getItem('userId') || localStorage.getItem('id');
    if (!userId) return;
    const data = await apiClient<any[]>(`/turnos?clienteId=${userId}`);
    setTurnos(data);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const cancelar = async (id: number) => {
    if (!confirm("¿Cancelar este turno?")) return;
    await apiClient(`/turnos/${id}/estado`, {
      method: "PUT",
      body: JSON.stringify({ estado: "CANCELADO" }),
      successMessage: "Turno cancelado"
    });
    cargar();
  };

  if (loading) return <div className="p-8 text-white text-center">Cargando...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Mis Reservas</h1>
      <div className="grid gap-4">
        {turnos.map(t => (
          <div key={t.id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl flex justify-between items-center">
            <div className="flex gap-4 items-center">
              <Scissors className="text-yellow-500" />
              <div>
                <h3 className="text-white font-bold">{t.servicio?.nombre}</h3>
                <p className="text-zinc-400 text-sm">{new Date(t.fechaHoraInicio).toLocaleDateString()} - {new Date(t.fechaHoraInicio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${t.estado?.toUpperCase() === 'PENDIENTE' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-zinc-800 text-zinc-500'}`}>{t.estado}</span>
              {t.estado?.toUpperCase() === 'PENDIENTE' && (
                <button onClick={() => cancelar(t.id)} className="text-red-400 hover:bg-red-900/20 p-2 rounded"><XCircle size={20}/></button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
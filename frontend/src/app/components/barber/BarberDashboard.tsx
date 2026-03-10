import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, Plus, User, Scissors } from "lucide-react";
import { apiClient } from "../utils/apsClient";
import { WalkInModal } from "../WalkInModal";

export function BarberDashboard() {
  const [agenda, setAgenda] = useState<any[]>([]);
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);

  const cargar = async () => {
    const userId = localStorage.getItem('userId') || localStorage.getItem('id');
    const data = await apiClient<any[]>(`/turnos?barberoId=${userId}`);
    setAgenda(data.sort((a,b) => new Date(a.fechaHoraInicio).getTime() - new Date(b.fechaHoraInicio).getTime()));
  };

  useEffect(() => { cargar(); }, []);

  const cambiarEstado = async (id: number, nuevo: string) => {
    if (!confirm(`¿Marcar como ${nuevo}?`)) return;
    await apiClient(`/turnos/${id}/estado`, { 
        method: "PUT", 
        body: JSON.stringify({ estado: nuevo }),
        successMessage: `Turno ${nuevo.toLowerCase()}`
    });
    cargar();
  };

  return (
    <div className="max-w-5xl mx-auto p-4 lg:p-8">
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Mi Agenda</h1>
          <button onClick={() => setIsWalkInOpen(true)} className="bg-[var(--gold)] text-black font-bold py-2 px-4 rounded-xl flex items-center gap-2"><Plus size={20}/> Walk-In</button>
      </div>
      <div className="grid gap-4">
        {agenda.map(t => (
            <div key={t.id} className={`bg-zinc-900 border border-zinc-800 p-5 rounded-xl flex justify-between items-center ${t.estado?.toUpperCase() === 'CANCELADO' ? 'opacity-40' : ''}`}>
                <div>
                    <div className="text-[var(--gold)] font-bold text-xl">{new Date(t.fechaHoraInicio).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}hs</div>
                    <div className="text-white font-medium flex items-center gap-2">{t.cliente ? t.cliente.nombre : <span className="text-purple-400">{t.nombreWalkin} (W)</span>}</div>
                </div>
                <div className="flex gap-2">
                    {t.estado?.toUpperCase() === 'PENDIENTE' && (
                        <>
                            <button onClick={() => cambiarEstado(t.id, "COMPLETADO")} className="p-2 bg-green-900/30 text-green-400 rounded-lg"><CheckCircle/></button>
                            <button onClick={() => cambiarEstado(t.id, "CANCELADO")} className="p-2 bg-red-900/30 text-red-400 rounded-lg"><XCircle/></button>
                        </>
                    )}
                    {t.estado?.toUpperCase() !== 'PENDIENTE' && <span className="text-zinc-500 font-bold text-sm uppercase">{t.estado}</span>}
                </div>
            </div>
        ))}
      </div>
      <WalkInModal isOpen={isWalkInOpen} onClose={() => setIsWalkInOpen(false)} onSuccess={cargar} />
    </div>
  );
}
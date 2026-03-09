import React, { useState, useEffect } from "react";
import { Calendar, CheckCircle, Clock, User, XCircle, Plus, Scissors } from "lucide-react";
import { apiClient } from "../utils/apsClient";
import { WalkInModal } from "../WalkInModal"; // Importamos tu modal

export function BarberDashboard() {
  const [agenda, setAgenda] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para el modal de Walk-In
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);

  const cargarAgenda = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;
      const data = await apiClient<any[]>(`/turnos?barberoId=${userId}`);
      // Ordenar por hora (el backend podría hacerlo, pero aseguramos aquí)
      const sorted = data.sort((a,b) => new Date(a.fechaHoraInicio).getTime() - new Date(b.fechaHoraInicio).getTime());
      setAgenda(sorted);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarAgenda(); }, []);

  // Función que llama el modal al confirmar
  const handleWalkInConfirm = async (data: any) => {
      try {
          const userId = localStorage.getItem('userId');
          // Construimos el objeto Turno para Walk-In
          const body = {
              fechaHoraInicio: new Date().toISOString(), // Asumimos que es YA
              estado: "PENDIENTE",
              barbero: { id: Number(userId) },
              sucursal: { id: 1 }, // Idealmente vendría del perfil del barbero
              servicio: { id: data.servicioId },
              nombreWalkin: data.nombreCliente // Campo especial para gente sin usuario
          };

          await apiClient("/turnos", {
              method: "POST",
              body: JSON.stringify(body),
              successMessage: "Turno Walk-In creado"
          });
          setIsWalkInOpen(false);
          cargarAgenda(); // Recargar la lista
      } catch (e) {
          console.error(e);
      }
  };

  const cambiarEstado = async (id: number, nuevoEstado: string) => {
    // ... (Tu lógica de cambiar estado igual que antes)
    if (!confirm(`¿Cambiar a ${nuevoEstado}?`)) return;
    try {
        await apiClient(`/turnos/${id}`, { method: "PUT", body: JSON.stringify({ estado: nuevoEstado }) });
        cargarAgenda();
    } catch(e) { console.error(e); }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 lg:p-8">
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Mi Agenda</h1>
          {/* BOTÓN NUEVO WALK-IN */}
          <button 
            onClick={() => setIsWalkInOpen(true)}
            className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded-xl flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5"/> Nuevo Walk-In
          </button>
      </div>
      
      {/* ... (Aquí va tu lista de turnos igual que antes) ... */}
      <div className="grid gap-4">
        {/* ... map agenda ... */}
        {agenda.map(t => (
            <div key={t.id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl flex justify-between items-center">
                {/* Visualización rápida de si es Cliente Registrado o Walk-In */}
                <div>
                    <div className="text-yellow-500 font-bold text-xl">
                        {new Date(t.fechaHoraInicio).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                    </div>
                    <div className="text-white font-medium flex items-center gap-2">
                        {t.cliente ? (
                           <><User className="w-4 h-4"/> {t.cliente.nombre}</>
                        ) : (
                           <><Scissors className="w-4 h-4 text-purple-400"/> <span className="text-purple-400">{t.nombreWalkin || "Walk-In"}</span></>
                        )}
                    </div>
                    <div className="text-zinc-500 text-sm">{t.servicio?.nombre}</div>
                </div>
                
                {/* Botones de acción (Completar/Cancelar) */}
                <div className="flex gap-2">
                    {t.estado === 'PENDIENTE' && (
                        <>
                            <button onClick={() => cambiarEstado(t.id, "COMPLETADO")} className="p-2 bg-green-900/30 text-green-400 rounded"><CheckCircle/></button>
                            <button onClick={() => cambiarEstado(t.id, "CANCELADO")} className="p-2 bg-red-900/30 text-red-400 rounded"><XCircle/></button>
                        </>
                    )}
                    {t.estado !== 'PENDIENTE' && <span className="text-zinc-500 font-bold text-sm">{t.estado}</span>}
                </div>
            </div>
        ))}
      </div>

      {/* RENDERIZAMOS EL MODAL */}
      <WalkInModal 
        isOpen={isWalkInOpen} 
        onClose={() => setIsWalkInOpen(false)}
        onConfirm={handleWalkInConfirm}
      />
    </div>
  );
}
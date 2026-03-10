import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { Check, ChevronLeft } from "lucide-react";
import { apiClient } from "../utils/apsClient";

const STEP_LABELS = ["Sucursal", "Servicio", "Barbero", "Horario", "Confirmar"];

function Progress({ current }: { current: number }) {
  return (
    <div className="mb-12 max-w-3xl mx-auto w-full px-4 flex flex-col items-center">
      <div className="flex items-center justify-between w-full mb-8 relative z-10">
        {STEP_LABELS.map((label, i) => {
          const num = i + 1;
          const done = num <= current;
          const past = num < current;
          return (
            <div key={label} className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${done ? "bg-[var(--gold)] text-black shadow-[0_0_15px_rgba(255,215,0,0.5)]" : "bg-[var(--surface2)] text-[var(--text2)] border-2 border-[var(--border)]"}`}>
                {past ? <Check className="w-5 h-5" /> : num}
              </div>
              <span className={`text-sm font-medium hidden sm:block transition-colors duration-300 ${done ? "text-[var(--gold)]" : "text-[var(--text2)]"}`}>{label}</span>
            </div>
          );
        })}
      </div>
      <div className="h-3 w-full bg-[var(--surface2)] rounded-full overflow-hidden mb-6 mx-5 sm:mx-10 relative">
        <div className="h-full bg-[var(--gold)] transition-all duration-500 ease-in-out shadow-[0_0_10px_rgba(255,215,0,0.8)]" style={{ width: `${((current - 1) / (STEP_LABELS.length - 1)) * 100}%` }} />
      </div>
    </div>
  );
}

export function BookingWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [branch, setBranch] = useState<any>(null);
  const [service, setService] = useState<any>(null);
  const [barber, setBarber] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selTime, setSelTime] = useState("");
  const [branches, setBranches] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [horarios, setHorarios] = useState<any[]>([]);
  const [turnosOcupados, setTurnosOcupados] = useState<any[]>([]);

  useEffect(() => {
    apiClient<any[]>("/sucursales").then(data => setBranches(data.filter((b: any) => b.activa)));
    apiClient<any[]>("/servicios").then(data => setServices(data.filter((s: any) => s.activo)));
    apiClient<any[]>("/horarios").then(setHorarios);
  }, []);

  useEffect(() => {
    if (step === 3) apiClient<any[]>("/usuarios/barberos").then(setBarbers);
  }, [step]);

  useEffect(() => {
    if (barber) apiClient<any[]>(`/turnos?barberoId=${barber.id}`).then(setTurnosOcupados);
  }, [barber]);

  const slots = useMemo(() => {
    if (!service || !barber || !branch || !selectedDate) return [];
    const dateObj = new Date(selectedDate + "T12:00:00");
    const dayOfWeek = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][dateObj.getDay()];
    const config = horarios.find(h => h.barbero?.id === barber.id && h.sucursal?.id === branch.id && h.diaSemana === dayOfWeek);
    if (!config) return [];
    const inicio = parseInt(config.horaInicio.split(":")[0]) * 60 + parseInt(config.horaInicio.split(":")[1]);
    const fin = parseInt(config.horaFin.split(":")[0]) * 60 + parseInt(config.horaFin.split(":")[1]);
    const res = [];
    for (let m = inicio; m + service.duracionMinutos <= fin; m += 15) {
      const h = Math.floor(m / 60).toString().padStart(2, "0");
      const min = (m % 60).toString().padStart(2, "0");
      const start = new Date(`${selectedDate}T${h}:${min}:00`);
      const end = new Date(start.getTime() + service.duracionMinutos * 60000);
      const isOcc = turnosOcupados.some(t => t.estado !== "CANCELADO" && start < new Date(t.fechaHoraFin) && end > new Date(t.fechaHoraInicio));
      if (!isOcc) res.push(`${h}:${min}`);
    }
    return res;
  }, [service, barber, branch, selectedDate, horarios, turnosOcupados]);

  const handleConfirm = async () => {
    const userId = localStorage.getItem("userId") || localStorage.getItem("id");
    const [y, m, d] = selectedDate.split("-").map(Number);
    const [hh, mm] = selTime.split(":").map(Number);
    const start = new Date(y, m - 1, d, hh, mm);
    await apiClient("/turnos", {
      method: "POST",
      body: JSON.stringify({
        fechaHoraInicio: start.toISOString(),
        fechaHoraFin: new Date(start.getTime() + service.duracionMinutos * 60000).toISOString(),
        estado: "PENDIENTE",
        cliente: { id: Number(userId) },
        barbero: { id: barber.id },
        servicio: { id: service.id },
        sucursal: { id: branch.id },
      }),
      successMessage: "Reserva confirmada"
    });
    navigate("/client");
  };

  const card = "p-4 mb-3 rounded-xl cursor-pointer bg-[var(--surface)] border border-[var(--border)] hover:opacity-80 transition-opacity";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Progress current={step} />
      <div className="min-h-[400px]">
        {step === 1 && branches.map(b => <div key={b.id} onClick={() => { setBranch(b); setStep(2); }} className={card}><h3 className="text-white">{b.nombre}</h3><p className="text-zinc-500 text-sm">{b.direccion}</p></div>)}
        {step === 2 && services.map(s => <div key={s.id} onClick={() => { setService(s); setStep(3); }} className={card + " flex justify-between"}><div className="text-white">{s.nombre}</div><div className="text-[var(--gold)]">${s.precio}</div></div>)}
        {step === 3 && barbers.map(b => <div key={b.id} onClick={() => { setBarber(b); setStep(4); }} className={card}><h3 className="text-white">{b.nombre} {b.apellido}</h3></div>)}
        {step === 4 && (
          <div>
            <input type="date" value={selectedDate} min={new Date().toISOString().split("T")[0]} onChange={e => setSelectedDate(e.target.value)} className="w-full p-4 mb-6 bg-[var(--surface)] text-white rounded-xl border border-[var(--border)]" style={{ colorScheme: "dark" }} />
            <div className="grid grid-cols-3 gap-3">{slots.map(t => <button key={t} onClick={() => { setSelTime(t); setStep(5); }} className="p-3 bg-[var(--surface2)] text-[var(--gold)] rounded-xl border border-[var(--border)]">{t}</button>)}</div>
          </div>
        )}
        {step === 5 && (
          <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
            <h3 className="text-white mb-4">Resumen: {service.nombre} con {barber.nombre}</h3>
            <p className="text-zinc-400 text-sm mb-6">{selectedDate} a las {selTime}hs</p>
            <button onClick={handleConfirm} className="w-full py-3 bg-[var(--gold)] text-black font-bold rounded-xl shadow-lg">Confirmar Reserva</button>
          </div>
        )}
      </div>
      <div className="mt-8 flex justify-between">{step > 1 && <button onClick={() => setStep(s => s - 1)} className="text-zinc-500">Volver</button>}</div>
    </div>
  );
}
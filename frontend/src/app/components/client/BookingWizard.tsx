import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { Check, ChevronLeft } from "lucide-react";
import { apiClient } from "../utils/apsClient";

const STEP_LABELS = ["Sucursal", "Servicio", "Barbero", "Horario", "Confirmar"];

// Genera slots cada N minutos entre 09:00 y 18:00
function generarSlots(duracionMinutos: number): string[] {
  const slots: string[] = [];
  const inicio = 9 * 60;
  const fin    = 18 * 60;
  for (let m = inicio; m + duracionMinutos <= fin; m += duracionMinutos) {
    const h   = Math.floor(m / 60).toString().padStart(2, "0");
    const min = (m % 60).toString().padStart(2, "0");
    slots.push(`${h}:${min}`);
  }
  return slots;
}

function Progress({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-1">
      {STEP_LABELS.map((label, i) => {
        const num = i + 1;
        const done   = num < current;
        const active = num === current;
        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all"
                style={{
                  background: done ? "var(--gold)" : active ? "transparent" : "var(--surface2)",
                  border: done ? "none" : active ? "2px solid var(--gold)" : "2px solid var(--border)",
                  color: done ? "#000" : active ? "var(--gold)" : "var(--text2)",
                }}
              >
                {done ? <Check className="w-3.5 h-3.5" /> : num}
              </div>
              <span
                className="text-xs whitespace-nowrap hidden sm:block"
                style={{ color: active ? "var(--gold)" : "var(--text2)" }}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className="w-8 h-px" style={{ background: "var(--border)" }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function BookingWizard() {
  const navigate = useNavigate();
  const [step, setStep]       = useState(1);
  const [branch, setBranch]   = useState<any>(null);
  const [service, setService] = useState<any>(null);
  const [barber, setBarber]   = useState<any>(null);
  const [selTime, setSelTime] = useState("");
  const [branches, setBranches] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [barbers, setBarbers]   = useState<any[]>([]);

  // Slots calculados dinámicamente según la duración del servicio elegido
  const slots = useMemo(
    () => service ? generarSlots(service.duracionMinutos) : [],
    [service]
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        const [bData, sData] = await Promise.all([
          apiClient<any[]>("/sucursales"),
          apiClient<any[]>("/servicios"),
        ]);
        
        // --- FILTRO DE ACTIVOS ---
        // Solo mostramos al cliente lo que está activo en BD
        setBranches(bData.filter((b: any) => b.activa === true));
        setServices(sData.filter((s: any) => s.activo === true));
        
      } catch (error) { console.error(error); }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (step === 3) {
      // Nota: Idealmente el backend también debería filtrar barberos activos
      apiClient<any[]>("/usuarios").then(users => 
        setBarbers(users.filter((u: any) => u.rol === "BARBERO" && u.activo !== false))
      ).catch(console.error);
    }
  }, [step]);

  const handleConfirm = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    const now = new Date();
    const [hours, minutes] = selTime.split(":");
    const fechaTurno = new Date(
      now.getFullYear(), now.getMonth(), now.getDate(),
      parseInt(hours), parseInt(minutes)
    );
    try {
      await apiClient("/turnos", {
        method: "POST",
        body: JSON.stringify({
          fechaHoraInicio: fechaTurno.toISOString(),
          estado: "PENDIENTE",
          cliente:  { id: Number(userId) },
          barbero:  { id: barber.id },
          servicio: { id: service.id },
          sucursal: { id: branch.id },
        }),
        successMessage: "¡Reserva confirmada!",
      });
      navigate("/client");
    } catch (error) { console.error(error); }
  };

  const cardStyle = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text)" }}>Nueva Reserva</h1>
        <p className="text-sm" style={{ color: "var(--text2)" }}>Configurá tu experiencia.</p>
      </div>
      <Progress current={step} />

      <div className="min-h-[400px]">

        {/* PASO 1 — Sucursal */}
        {step === 1 && (
          <>
            {branches.length === 0 && (
              <p className="text-center py-8" style={{ color: "var(--text2)" }}>No hay sucursales disponibles.</p>
            )}
            {branches.map(b => (
              <div
                key={b.id}
                onClick={() => { setBranch(b); setStep(2); }}
                className="p-4 mb-3 rounded-xl cursor-pointer transition-colors hover:opacity-80"
                style={cardStyle}
              >
                <h3 className="font-medium" style={{ color: "var(--text)" }}>{b.nombre}</h3>
                <p className="text-sm" style={{ color: "var(--text2)" }}>{b.direccion}</p>
              </div>
            ))}
          </>
        )}

        {/* PASO 2 — Servicio */}
        {step === 2 && (
          <>
            {services.length === 0 && (
              <p className="text-center py-8" style={{ color: "var(--text2)" }}>No hay servicios disponibles.</p>
            )}
            {services.map(s => (
              <div
                key={s.id}
                onClick={() => { setService(s); setStep(3); }}
                className="p-4 mb-3 rounded-xl cursor-pointer transition-colors hover:opacity-80 flex justify-between items-center"
                style={cardStyle}
              >
                <div>
                  <h3 className="font-medium" style={{ color: "var(--text)" }}>{s.nombre}</h3>
                  <p className="text-sm" style={{ color: "var(--text2)" }}>{s.duracionMinutos} min</p>
                </div>
                <span className="font-medium" style={{ color: "var(--gold)" }}>
                  ${Number(s.precio).toFixed(2)}
                </span>
              </div>
            ))}
          </>
        )}

        {/* PASO 3 — Barbero */}
        {step === 3 && (
          <>
            {barbers.length === 0 && (
              <p className="text-center py-8" style={{ color: "var(--text2)" }}>No hay barberos disponibles.</p>
            )}
            {barbers.map(b => (
              <div
                key={b.id}
                onClick={() => { setBarber(b); setStep(4); }}
                className="p-4 mb-3 rounded-xl cursor-pointer transition-colors hover:opacity-80 flex items-center gap-3"
                style={cardStyle}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                  style={{ background: "var(--surface2)", color: "var(--text)" }}
                >
                  {b.nombre.charAt(0).toUpperCase()}
                </div>
                <h3 className="font-medium" style={{ color: "var(--text)" }}>{b.nombre}</h3>
              </div>
            ))}
          </>
        )}

        {/* PASO 4 — Horario */}
        {step === 4 && (
          <div>
            <p className="mb-2 text-center" style={{ color: "var(--text2)" }}>
              Elegí un horario — turnos cada {service?.duracionMinutos} min
            </p>
            {slots.length === 0 && (
              <p className="text-center py-8" style={{ color: "var(--text2)" }}>No hay horarios disponibles.</p>
            )}
            <div className="grid grid-cols-3 gap-2">
              {slots.map(t => (
                <button
                  key={t}
                  onClick={() => { setSelTime(t); setStep(5); }}
                  className="p-3 rounded-xl transition-colors hover:opacity-80"
                  style={cardStyle}
                >
                  <span style={{ color: "var(--text)" }}>{t}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PASO 5 — Confirmación */}
        {step === 5 && (
          <div className="p-6 rounded-xl" style={cardStyle}>
            <h3 className="text-lg font-medium mb-4" style={{ color: "var(--text)" }}>Resumen de tu reserva</h3>
            <div className="text-sm space-y-3 mb-6">
              {[
                { label: "Sucursal", value: branch?.nombre },
                { label: "Servicio", value: service?.nombre },
                { label: "Duración", value: `${service?.duracionMinutos} min` },
                { label: "Barbero",  value: barber?.nombre },
                { label: "Hora",     value: selTime },
              ].map(row => (
                <div key={row.label} className="flex justify-between">
                  <span style={{ color: "var(--text2)" }}>{row.label}</span>
                  <span style={{ color: "var(--text)" }}>{row.value}</span>
                </div>
              ))}
              <div
                className="flex justify-between pt-3"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <span className="font-medium" style={{ color: "var(--text)" }}>Total</span>
                <span className="font-bold" style={{ color: "var(--gold)" }}>
                  ${Number(service?.precio).toFixed(2)}
                </span>
              </div>
            </div>
            <button
              onClick={handleConfirm}
              className="w-full py-3 rounded-xl font-bold"
              style={{ background: "var(--gold)", color: "#000" }}
            >
              Confirmar Reserva
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
        {step > 1 && (
          <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-1" style={{ color: "var(--text2)" }}>
            <ChevronLeft className="w-4 h-4" /> Volver
          </button>
        )}
        {step === 1 && (
          <button onClick={() => navigate("/client")} style={{ color: "var(--text2)" }}>Cancelar</button>
        )}
      </div>
    </div>
  );
}
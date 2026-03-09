package com.example.bareberiaapi.service;

import com.example.bareberiaapi.entity.Servicio;
import com.example.bareberiaapi.entity.Turno;
import com.example.bareberiaapi.repository.ServicioRepository;
import com.example.bareberiaapi.repository.TurnoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TurnoService {

    @Autowired
    private TurnoRepository turnoRepository;

    @Autowired
    private ServicioRepository servicioRepository;

    public List<Turno> listarPorCliente(Long id) {
        return turnoRepository.findByClienteId(id);
    }

    public List<Turno> listarPorBarbero(Long id) {
        return turnoRepository.findByBarberoId(id);
    }


    public List<Turno> listarTodos() {
        return turnoRepository.findAll();
    }


    public Turno guardar(Turno turno) {

            // 1. Validar datos obligatorios
            if (turno.getBarbero() == null || turno.getBarbero().getId() == null) {
                throw new RuntimeException("El turno debe tener un barbero asignado.");
            }
            if (turno.getServicio() == null || turno.getServicio().getId() == null) {
                throw new RuntimeException("El turno debe tener un servicio.");
            }

            // 2. Recuperar el Servicio real para obtener la duración
            Servicio servicio = servicioRepository.findById(turno.getServicio().getId())
                    .orElseThrow(() -> new RuntimeException("Servicio no encontrado"));

            // 3. Calcular Fecha Fin Automáticamente
            // (El front manda Inicio, nosotros calculamos Fin = Inicio + Duración)
            if (turno.getFechaHoraInicio() == null) {
                throw new RuntimeException("La fecha de inicio es obligatoria.");
            }

            LocalDateTime inicio = turno.getFechaHoraInicio();
            LocalDateTime fin = inicio.plusMinutes(servicio.getDuracionMinutos());
            turno.setFechaHoraFin(fin); // ¡Seteamos el fin calculado!

            // 4. VALIDACIÓN DE NO-SUPERPOSICIÓN (Overbooking)
            // Buscamos si hay turnos que se "pisen" con este intervalo para ESE barbero
            List<Turno> solapados = turnoRepository.findSolapados(
                    turno.getBarbero().getId(),
                    inicio,
                    fin
            );

            if (!solapados.isEmpty()) {
                throw new RuntimeException("El barbero ya tiene un turno en ese horario.");
            }

            // 5. Guardar
            return turnoRepository.save(turno);
        
    }


    public Turno actualizarEstado(Long id, String nuevoEstado) {
        Turno turno = turnoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado"));
        turno.setEstado(nuevoEstado);
        return turnoRepository.save(turno);
    }
}
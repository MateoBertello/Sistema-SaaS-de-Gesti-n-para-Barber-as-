package com.example.bareberiaapi.service;

import com.example.bareberiaapi.entity.Turno;
import com.example.bareberiaapi.repository.TurnoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class TurnoService {

    @Autowired
    private TurnoRepository turnoRepository;

    public List<Turno> listarTodos() {
        return turnoRepository.findAll();
    }

    public List<Turno> turnosDelCliente(Long clienteId) {
        return turnoRepository.findByClienteId(clienteId);
    }

    public List<Turno> turnosDelBarbero(Long barberoId) {
        return turnoRepository.findByBarberoId(barberoId);
    }

    public Turno guardar(Turno turno) {

        List<Turno> solapados = turnoRepository.findSolapados(
                turno.getBarbero().getId(),
                turno.getFechaHoraInicio(),
                turno.getFechaHoraFin()
        );

        // Si ya hay un turno en ese rango, rechazamos la petición
        if (!solapados.isEmpty()) {
            throw new RuntimeException("Lo sentimos, este horario acaba de ser reservado por alguien más.");
        }

        return turnoRepository.save(turno);
    }

    // LÓGICA DE SOFT DELETE (Cancelar en lugar de borrar)
    public void cancelar(Long id) {
        Turno turno = turnoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado"));

        turno.setEstado("CANCELADO");
        turnoRepository.save(turno);
    }

    // Método auxiliar para el Barbero
    public void completar(Long id) {
        Turno turno = turnoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado"));

        turno.setEstado("COMPLETADO");
        turnoRepository.save(turno);
    }
}
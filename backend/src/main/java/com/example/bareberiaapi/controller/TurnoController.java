package com.example.bareberiaapi.controller;

import com.example.bareberiaapi.entity.Turno;
import com.example.bareberiaapi.service.TurnoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/turnos")
public class TurnoController {

    @Autowired
    private TurnoService turnoService;

    // Endpoint inteligente: detecta si pides por cliente, barbero o todo (admin)
    @GetMapping
    public List<Turno> listarTurnos(
            @RequestParam(required = false) Long clienteId,
            @RequestParam(required = false) Long barberoId
    ) {
        if (clienteId != null) {
            // Adaptado al nuevo nombre en el Service
            return turnoService.turnosDelCliente(clienteId);
        }
        if (barberoId != null) {
            // Adaptado al nuevo nombre en el Service
            return turnoService.turnosDelBarbero(barberoId);
        }
        return turnoService.listarTodos();
    }

    // Guardar nuevo turno
    @PostMapping
    public Turno crear(@RequestBody Turno turno) {
        return turnoService.guardar(turno);
    }

    // Actualizar estado (Completar desde el panel del Barbero con PUT)
    @PutMapping("/{id}/estado")
    public void cambiarEstado(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        String estado = body.get("estado");
        if ("COMPLETADO".equals(estado)) {
            turnoService.completar(id);
        } else if ("CANCELADO".equals(estado)) {
            turnoService.cancelar(id);
        }
    }

    // --- ESTO FALTABA ---
    // Por si el frontend envía un DELETE para cancelar el turno (Soft Delete)
    @DeleteMapping("/{id}")
    public void cancelarTurno(@PathVariable Long id) {
        turnoService.cancelar(id);
    }
}
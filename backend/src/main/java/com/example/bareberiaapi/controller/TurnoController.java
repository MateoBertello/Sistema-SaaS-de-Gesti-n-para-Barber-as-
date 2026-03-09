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
            return turnoService.listarPorCliente(clienteId);
        }
        if (barberoId != null) {
            return turnoService.listarPorBarbero(barberoId);
        }
        return turnoService.listarTodos();
    }

    // Guardar nuevo turno
    @PostMapping
    public Turno crear(@RequestBody Turno turno) {
        // Aquí podrías agregar lógica para validar que no se solapen usando el repo
        return turnoService.guardar(turno);
    }

    // Actualizar estado (Cancelar / Completar)
    @PutMapping("/{id}")
    public Turno actualizar(@PathVariable Long id, @RequestBody Turno turno) {
        // Asumimos que envías el objeto completo o al menos el estado
        return turnoService.actualizarEstado(id, turno.getEstado());
    }
}
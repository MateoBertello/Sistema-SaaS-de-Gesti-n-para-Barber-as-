package com.example.bareberiaapi.controller;

import com.example.bareberiaapi.entity.Servicio;
import com.example.bareberiaapi.service.ServicioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/servicios")
public class ServicioController {
    @Autowired
    private ServicioService servicioService;

    @GetMapping
    public List<Servicio> listar() { return servicioService.listarTodos(); }

    @PostMapping
    public Servicio crear(@RequestBody Servicio servicio) { return servicioService.guardar(servicio); }

    // --- ESTO FALTABA ---
    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        servicioService.eliminar(id);
    }
}
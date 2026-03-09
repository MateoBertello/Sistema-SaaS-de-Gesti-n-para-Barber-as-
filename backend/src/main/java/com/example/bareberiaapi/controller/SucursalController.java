package com.example.bareberiaapi.controller;

import com.example.bareberiaapi.entity.Sucursal;
import com.example.bareberiaapi.service.SucursalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/sucursales")
public class SucursalController {
    @Autowired
    private SucursalService sucursalService;

    @GetMapping
    public List<Sucursal> listar() { return sucursalService.listarTodas(); }

    @PostMapping
    public Sucursal crear(@RequestBody Sucursal sucursal) { return sucursalService.guardar(sucursal); }

    // --- ESTO FALTABA ---
    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        sucursalService.eliminar(id);
    }
}
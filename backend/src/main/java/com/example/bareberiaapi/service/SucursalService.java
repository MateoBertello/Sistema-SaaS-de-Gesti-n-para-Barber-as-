package com.example.bareberiaapi.service;

import com.example.bareberiaapi.entity.Sucursal;
import com.example.bareberiaapi.repository.SucursalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class SucursalService {
    @Autowired
    private SucursalRepository sucursalRepository;

    public List<Sucursal> listarTodas() { return sucursalRepository.findAll(); }

    public Sucursal guardar(Sucursal sucursal) { return sucursalRepository.save(sucursal); }

    // --- LÓGICA DE SOFT DELETE ---
    public void eliminar(Long id) {
        Sucursal sucursal = sucursalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sucursal no encontrada"));

        // Desactivamos (Soft Delete)
        sucursal.setActiva(false);

        // Guardamos el cambio
        sucursalRepository.save(sucursal);
    }
}
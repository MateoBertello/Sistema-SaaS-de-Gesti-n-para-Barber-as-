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
    public void eliminar(Long id) {
        Sucursal sucursal = sucursalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sucursal no encontrada"));
        sucursal.setActiva(false); // Nota: en tu entidad se llama 'activa'
        sucursalRepository.save(sucursal);
    }
}
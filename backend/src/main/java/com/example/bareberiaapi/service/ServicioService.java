package com.example.bareberiaapi.service;

import com.example.bareberiaapi.entity.Servicio;
import com.example.bareberiaapi.repository.ServicioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ServicioService {
    @Autowired
    private ServicioRepository servicioRepository;

    public List<Servicio> listarTodos() { return servicioRepository.findAll(); }
    public Servicio guardar(Servicio servicio) { return servicioRepository.save(servicio); }

    public void eliminar(Long id) {
        Servicio servicio = servicioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Servicio no encontrado"));
        servicio.setActivo(false); // Simplemente lo desactivamos
        servicioRepository.save(servicio); // Guardamos el cambio
    }
}
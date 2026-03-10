package com.example.bareberiaapi.repository;

import com.example.bareberiaapi.entity.HorarioBarbero;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HorarioBarberoRepository extends JpaRepository<HorarioBarbero, Long> {


    @Query("SELECT h FROM HorarioBarbero h JOIN FETCH h.barbero JOIN FETCH h.sucursal WHERE h.activo = true")
    List<HorarioBarbero> findByActivoTrue();

    @Query("SELECT h FROM HorarioBarbero h JOIN FETCH h.barbero JOIN FETCH h.sucursal")
    List<HorarioBarbero> findAll();
}
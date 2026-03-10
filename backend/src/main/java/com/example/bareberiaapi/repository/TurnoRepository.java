package com.example.bareberiaapi.repository;

import com.example.bareberiaapi.entity.Turno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface TurnoRepository extends JpaRepository<Turno, Long> {


    @Query("SELECT t FROM Turno t LEFT JOIN FETCH t.cliente JOIN FETCH t.barbero JOIN FETCH t.servicio JOIN FETCH t.sucursal")
    List<Turno> findAll();


    @Query("SELECT t FROM Turno t LEFT JOIN FETCH t.cliente JOIN FETCH t.barbero JOIN FETCH t.servicio JOIN FETCH t.sucursal WHERE t.cliente.id = :clienteId")
    List<Turno> findByClienteId(@Param("clienteId") Long clienteId);


    @Query("SELECT t FROM Turno t LEFT JOIN FETCH t.cliente JOIN FETCH t.barbero JOIN FETCH t.servicio JOIN FETCH t.sucursal WHERE t.barbero.id = :barberoId")
    List<Turno> findByBarberoId(@Param("barberoId") Long barberoId);

    boolean existsByBarberoIdAndFechaHoraInicio(Long barberoId, LocalDateTime fechaHoraInicio);

    @Query("""
    SELECT t FROM Turno t
    WHERE t.barbero.id    = :barberoId
      AND t.estado       != 'CANCELADO'
      AND t.fechaHoraInicio < :fin
      AND t.fechaHoraFin   > :inicio""")
    List<Turno> findSolapados(
            @Param("barberoId") Long barberoId,
            @Param("inicio")    LocalDateTime inicio,
            @Param("fin")       LocalDateTime fin
    );
}
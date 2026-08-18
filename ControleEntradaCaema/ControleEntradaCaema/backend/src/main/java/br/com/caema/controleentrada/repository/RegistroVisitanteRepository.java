package br.com.caema.controleentrada.repository;

import br.com.caema.controleentrada.model.RegistroVisitante;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface RegistroVisitanteRepository extends JpaRepository<RegistroVisitante, UUID> {

    List<RegistroVisitante> findByHoraSaidaIsNullOrderByHoraEntradaDesc();

    @Query("""
            SELECT r FROM RegistroVisitante r
            WHERE (:apenasAbertos = false OR r.horaSaida IS NULL)
              AND (:cpf IS NULL OR r.cpf = :cpf)
              AND (:nome IS NULL OR LOWER(r.nomeVisitante) LIKE LOWER(CONCAT('%', :nome, '%')))
              AND (:localVisita IS NULL OR LOWER(r.localVisita) LIKE LOWER(CONCAT('%', :localVisita, '%')))
              AND (:inicio IS NULL OR r.horaEntrada >= :inicio)
              AND (:fim IS NULL OR r.horaEntrada <= :fim)
            ORDER BY r.horaEntrada DESC
            """)
    Page<RegistroVisitante> buscarComFiltros(@Param("apenasAbertos") boolean apenasAbertos,
                                              @Param("cpf") String cpf,
                                              @Param("nome") String nome,
                                              @Param("localVisita") String localVisita,
                                              @Param("inicio") LocalDateTime inicio,
                                              @Param("fim") LocalDateTime fim,
                                              Pageable pageable);

    @Query("""
            SELECT r FROM RegistroVisitante r
            WHERE (:inicio IS NULL OR r.horaEntrada >= :inicio)
              AND (:fim IS NULL OR r.horaEntrada <= :fim)
            ORDER BY r.horaEntrada DESC
            """)
    List<RegistroVisitante> buscarParaExportacao(@Param("inicio") LocalDateTime inicio,
                                                  @Param("fim") LocalDateTime fim);
}

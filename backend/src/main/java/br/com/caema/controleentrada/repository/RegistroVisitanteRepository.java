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
                           AND (:nome IS NULL OR LOWER(r.nomeVisitante) LIKE LOWER(CONCAT('%', CAST(:nome AS string), '%')))
                           AND (:localVisita IS NULL OR LOWER(r.localVisita) LIKE LOWER(CONCAT('%', CAST(:localVisita AS string), '%')))
                           AND r.horaEntrada >= :inicio
                           AND r.horaEntrada <= :fim
                       """)
        Page<RegistroVisitante> buscarComFiltrosQuery(@Param("apenasAbertos") boolean apenasAbertos,
                                                                                                          @Param("cpf") String cpf,
                                                                                                          @Param("nome") String nome,
                                                                                                          @Param("localVisita") String localVisita,
                                                                                                          @Param("inicio") LocalDateTime inicio,
                                                                                                          @Param("fim") LocalDateTime fim,
                                                                                                          Pageable pageable);

    default Page<RegistroVisitante> buscarComFiltros(boolean apenasAbertos, String cpf, String nome, String localVisita,
                                                                                                            LocalDateTime inicio, LocalDateTime fim, Pageable pageable) {
                LocalDateTime inicioEfetivo = inicio != null ? inicio : LocalDateTime.of(1900, 1, 1, 0, 0);
                LocalDateTime fimEfetivo = fim != null ? fim : LocalDateTime.of(2999, 12, 31, 23, 59, 59);
                return buscarComFiltrosQuery(apenasAbertos, cpf, nome, localVisita, inicioEfetivo, fimEfetivo, pageable);
    }

    @Query("""
                SELECT r FROM RegistroVisitante r
                       WHERE r.horaEntrada >= :inicio
                           AND r.horaEntrada <= :fim
                       ORDER BY r.horaEntrada DESC
                       """)
        List<RegistroVisitante> buscarParaExportacaoQuery(@Param("inicio") LocalDateTime inicio,
                                                                                                                  @Param("fim") LocalDateTime fim);

    default List<RegistroVisitante> buscarParaExportacao(LocalDateTime inicio, LocalDateTime fim) {
                LocalDateTime inicioEfetivo = inicio != null ? inicio : LocalDateTime.of(1900, 1, 1, 0, 0);
                LocalDateTime fimEfetivo = fim != null ? fim : LocalDateTime.of(2999, 12, 31, 23, 59, 59);
                return buscarParaExportacaoQuery(inicioEfetivo, fimEfetivo);
    }
}

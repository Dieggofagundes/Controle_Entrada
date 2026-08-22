package br.com.caema.controleentrada.repository;

import br.com.caema.controleentrada.model.Plantao;
import br.com.caema.controleentrada.model.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PlantaoRepository extends JpaRepository<Plantao, UUID> {

    Optional<Plantao> findFirstByUsuarioAndHoraConclusaoIsNullOrderByHoraAssuncaoDesc(Usuario usuario);

    List<Plantao> findByUsuarioOrderByHoraAssuncaoDesc(Usuario usuario);

    @Query("""
            SELECT p FROM Plantao p
            WHERE (:usuarioId IS NULL OR p.usuario.id = :usuarioId)
              AND (:inicio IS NULL OR p.horaAssuncao >= :inicio)
              AND (:fim IS NULL OR p.horaAssuncao <= :fim)
            ORDER BY p.horaAssuncao DESC
            """)
    Page<Plantao> buscarComFiltros(@Param("usuarioId") UUID usuarioId,
                                    @Param("inicio") LocalDateTime inicio,
                                    @Param("fim") LocalDateTime fim,
                                    Pageable pageable);
}

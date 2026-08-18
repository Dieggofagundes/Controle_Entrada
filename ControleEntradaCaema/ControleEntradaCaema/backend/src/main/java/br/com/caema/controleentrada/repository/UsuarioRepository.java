package br.com.caema.controleentrada.repository;

import br.com.caema.controleentrada.model.Usuario;
import br.com.caema.controleentrada.model.enums.StatusUsuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {

    Optional<Usuario> findByMatricula(String matricula);

    boolean existsByMatricula(String matricula);

    List<Usuario> findByStatusOrderByCriadoEmDesc(StatusUsuario status);

    List<Usuario> findAllByOrderByNomeCompletoAsc();
}

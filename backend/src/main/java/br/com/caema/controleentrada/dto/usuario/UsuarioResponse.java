package br.com.caema.controleentrada.dto.usuario;

import br.com.caema.controleentrada.model.Usuario;
import br.com.caema.controleentrada.model.enums.Funcao;
import br.com.caema.controleentrada.model.enums.Perfil;
import br.com.caema.controleentrada.model.enums.StatusUsuario;

import java.time.LocalDateTime;
import java.util.UUID;

public record UsuarioResponse(
        UUID id,
        String matricula,
        String nomeCompleto,
        String nomeGuerra,
        String email,
        Funcao funcao,
        Perfil perfil,
        StatusUsuario status,
        LocalDateTime criadoEm
) {
    public static UsuarioResponse de(Usuario u) {
        return new UsuarioResponse(
                u.getId(), u.getMatricula(), u.getNomeCompleto(), u.getNomeGuerra(),
                u.getEmail(), u.getFuncao(), u.getPerfil(), u.getStatus(), u.getCriadoEm()
        );
    }
}

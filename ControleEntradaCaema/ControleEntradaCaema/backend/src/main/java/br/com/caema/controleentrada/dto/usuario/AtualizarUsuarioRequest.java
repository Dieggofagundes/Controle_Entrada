package br.com.caema.controleentrada.dto.usuario;

import br.com.caema.controleentrada.model.enums.Funcao;
import br.com.caema.controleentrada.model.enums.Perfil;
import br.com.caema.controleentrada.model.enums.StatusUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AtualizarUsuarioRequest(
        @NotBlank String nomeCompleto,
        @NotBlank String nomeGuerra,
        @Email String email,
        @NotNull Funcao funcao,
        @NotNull Perfil perfil,
        @NotNull StatusUsuario status
) {
}

package br.com.caema.controleentrada.dto.usuario;

import br.com.caema.controleentrada.model.enums.Funcao;
import br.com.caema.controleentrada.model.enums.Perfil;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CriarUsuarioRequest(
        @NotBlank String matricula,
        @NotBlank @Size(min = 6, message = "A senha deve ter ao menos 6 caracteres") String senha,
        @NotBlank String nomeCompleto,
        @NotBlank String nomeGuerra,
        @Email String email,
        @NotNull Funcao funcao,
        @NotNull Perfil perfil
) {
}

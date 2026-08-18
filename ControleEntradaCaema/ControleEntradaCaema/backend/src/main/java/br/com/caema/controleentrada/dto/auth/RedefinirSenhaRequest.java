package br.com.caema.controleentrada.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RedefinirSenhaRequest(
        @NotBlank(message = "Token invalido") String token,
        @NotBlank @Size(min = 6, message = "A senha deve ter ao menos 6 caracteres") String novaSenha
) {
}

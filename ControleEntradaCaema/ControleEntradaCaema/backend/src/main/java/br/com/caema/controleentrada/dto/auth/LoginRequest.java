package br.com.caema.controleentrada.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "Informe a matricula") String matricula,
        @NotBlank(message = "Informe a senha") String senha
) {
}

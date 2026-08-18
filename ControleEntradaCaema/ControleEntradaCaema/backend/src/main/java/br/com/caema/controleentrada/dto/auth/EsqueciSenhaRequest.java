package br.com.caema.controleentrada.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record EsqueciSenhaRequest(
        @NotBlank(message = "Informe a matricula") String matricula
) {
}

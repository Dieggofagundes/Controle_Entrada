package br.com.caema.controleentrada.dto.registro;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record AtualizarRegistroRequest(
        @NotBlank String nomeVisitante,
        String endereco,
        String telefone,
        @NotBlank
        @Pattern(regexp = "\\d{3}\\.?\\d{3}\\.?\\d{3}-?\\d{2}", message = "CPF invalido")
        String cpf,
        @NotBlank String localVisita,
        String numeroCracha
) {
}

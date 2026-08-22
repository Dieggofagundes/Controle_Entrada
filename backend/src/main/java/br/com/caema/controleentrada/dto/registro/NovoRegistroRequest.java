package br.com.caema.controleentrada.dto.registro;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDateTime;

public record NovoRegistroRequest(
        @NotBlank(message = "Informe o nome do visitante") String nomeVisitante,
        String endereco,
        String telefone,
        @NotBlank(message = "Informe o CPF")
        @Pattern(regexp = "\\d{3}\\.?\\d{3}\\.?\\d{3}-?\\d{2}", message = "CPF invalido")
        String cpf,
        @NotBlank(message = "Informe o local da visita") String localVisita,
        String numeroCracha,
        LocalDateTime horaEntrada
) {
}

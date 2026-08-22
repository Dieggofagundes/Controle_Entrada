package br.com.caema.controleentrada.dto.registro;

import java.time.LocalDateTime;

public record RegistrarSaidaRequest(
        LocalDateTime horaSaida
) {
}

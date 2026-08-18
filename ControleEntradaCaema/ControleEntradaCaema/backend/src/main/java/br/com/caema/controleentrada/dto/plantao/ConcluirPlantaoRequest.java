package br.com.caema.controleentrada.dto.plantao;

import java.time.LocalDateTime;

public record ConcluirPlantaoRequest(
        LocalDateTime horaConclusao
) {
}

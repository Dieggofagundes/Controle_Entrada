package br.com.caema.controleentrada.dto.plantao;

import br.com.caema.controleentrada.model.enums.Funcao;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record AbrirPlantaoRequest(
        @NotNull(message = "Selecione a funcao") Funcao funcao,
        LocalDateTime horaAssuncao
) {
}

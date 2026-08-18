package br.com.caema.controleentrada.dto.plantao;

import br.com.caema.controleentrada.dto.usuario.UsuarioResponse;
import br.com.caema.controleentrada.model.Plantao;
import br.com.caema.controleentrada.model.enums.Funcao;

import java.time.LocalDateTime;
import java.util.UUID;

public record PlantaoResponse(
        UUID id,
        UsuarioResponse usuario,
        Funcao funcao,
        LocalDateTime horaAssuncao,
        LocalDateTime horaConclusao,
        UsuarioResponse concluidoPor,
        boolean aberto
) {
    public static PlantaoResponse de(Plantao p) {
        return new PlantaoResponse(
                p.getId(),
                UsuarioResponse.de(p.getUsuario()),
                p.getFuncao(),
                p.getHoraAssuncao(),
                p.getHoraConclusao(),
                p.getConcluidoPor() != null ? UsuarioResponse.de(p.getConcluidoPor()) : null,
                p.isAberto()
        );
    }
}

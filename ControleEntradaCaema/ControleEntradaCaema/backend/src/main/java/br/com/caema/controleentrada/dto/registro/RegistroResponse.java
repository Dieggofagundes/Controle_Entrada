package br.com.caema.controleentrada.dto.registro;

import br.com.caema.controleentrada.dto.usuario.UsuarioResponse;
import br.com.caema.controleentrada.model.RegistroVisitante;

import java.time.LocalDateTime;
import java.util.UUID;

public record RegistroResponse(
        UUID id,
        String nomeVisitante,
        String endereco,
        String telefone,
        String cpf,
        String localVisita,
        String numeroCracha,
        LocalDateTime horaEntrada,
        LocalDateTime horaSaida,
        UsuarioResponse registradoPor,
        UsuarioResponse saidaRegistradaPor,
        boolean aberto
) {
    public static RegistroResponse de(RegistroVisitante r) {
        return new RegistroResponse(
                r.getId(), r.getNomeVisitante(), r.getEndereco(), r.getTelefone(), r.getCpf(),
                r.getLocalVisita(), r.getNumeroCracha(), r.getHoraEntrada(), r.getHoraSaida(),
                UsuarioResponse.de(r.getRegistradoPor()),
                r.getSaidaRegistradaPor() != null ? UsuarioResponse.de(r.getSaidaRegistradaPor()) : null,
                r.isAberto()
        );
    }
}

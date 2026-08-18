package br.com.caema.controleentrada.dto.usuario;

import br.com.caema.controleentrada.model.enums.Funcao;
import br.com.caema.controleentrada.model.enums.Perfil;
import jakarta.validation.constraints.NotNull;

public record AprovarUsuarioRequest(
        @NotNull Funcao funcao,
        @NotNull Perfil perfil
) {
}

package br.com.caema.controleentrada.dto.auth;

import br.com.caema.controleentrada.dto.usuario.UsuarioResponse;

public record LoginResponse(
        String token,
        long expiraEmSegundos,
        UsuarioResponse usuario
) {
}

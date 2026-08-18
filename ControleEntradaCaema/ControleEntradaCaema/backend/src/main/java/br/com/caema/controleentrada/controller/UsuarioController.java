package br.com.caema.controleentrada.controller;

import br.com.caema.controleentrada.dto.usuario.AlterarMinhaSenhaRequest;
import br.com.caema.controleentrada.dto.usuario.UsuarioResponse;
import br.com.caema.controleentrada.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping("/me")
    public ResponseEntity<UsuarioResponse> meuPerfil(Authentication authentication) {
        return ResponseEntity.ok(usuarioService.meuPerfil(authentication.getName()));
    }

    @PutMapping("/me/senha")
    public ResponseEntity<Map<String, String>> alterarMinhaSenha(Authentication authentication,
                                                                   @Valid @RequestBody AlterarMinhaSenhaRequest request) {
        usuarioService.alterarMinhaSenha(authentication.getName(), request);
        return ResponseEntity.ok(Map.of("mensagem", "Senha alterada com sucesso."));
    }
}

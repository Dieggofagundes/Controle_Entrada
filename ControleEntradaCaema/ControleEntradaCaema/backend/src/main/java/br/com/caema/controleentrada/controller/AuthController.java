package br.com.caema.controleentrada.controller;

import br.com.caema.controleentrada.dto.auth.EsqueciSenhaRequest;
import br.com.caema.controleentrada.dto.auth.LoginRequest;
import br.com.caema.controleentrada.dto.auth.LoginResponse;
import br.com.caema.controleentrada.dto.auth.RedefinirSenhaRequest;
import br.com.caema.controleentrada.dto.auth.SolicitarCadastroRequest;
import br.com.caema.controleentrada.dto.usuario.UsuarioResponse;
import br.com.caema.controleentrada.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/solicitar-cadastro")
    public ResponseEntity<UsuarioResponse> solicitarCadastro(@Valid @RequestBody SolicitarCadastroRequest request) {
        UsuarioResponse resposta = authService.solicitarCadastro(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(resposta);
    }

    @PostMapping("/esqueci-senha")
    public ResponseEntity<Map<String, String>> esqueciSenha(@Valid @RequestBody EsqueciSenhaRequest request) {
        authService.esqueciSenha(request);
        return ResponseEntity.ok(Map.of("mensagem",
                "Se a matricula existir e tiver um e-mail cadastrado, um link de redefinicao foi enviado."));
    }

    @PostMapping("/redefinir-senha")
    public ResponseEntity<Map<String, String>> redefinirSenha(@Valid @RequestBody RedefinirSenhaRequest request) {
        authService.redefinirSenha(request);
        return ResponseEntity.ok(Map.of("mensagem", "Senha redefinida com sucesso."));
    }
}

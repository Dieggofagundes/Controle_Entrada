package br.com.caema.controleentrada.controller;

import br.com.caema.controleentrada.dto.usuario.*;
import br.com.caema.controleentrada.model.enums.StatusUsuario;
import br.com.caema.controleentrada.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/usuarios")
@RequiredArgsConstructor
public class AdminUsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    public ResponseEntity<List<UsuarioResponse>> listarTodos() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    @GetMapping("/pendentes")
    public ResponseEntity<List<UsuarioResponse>> listarPendentes() {
        return ResponseEntity.ok(usuarioService.listarPendentes());
    }

    @PostMapping
    public ResponseEntity<UsuarioResponse> criar(@Valid @RequestBody CriarUsuarioRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.criarDiretamente(request));
    }

    @PutMapping("/{id}/aprovar")
    public ResponseEntity<UsuarioResponse> aprovar(@PathVariable UUID id,
                                                     @Valid @RequestBody AprovarUsuarioRequest request) {
        return ResponseEntity.ok(usuarioService.aprovar(id, request));
    }

    @PutMapping("/{id}/rejeitar")
    public ResponseEntity<Map<String, String>> rejeitar(@PathVariable UUID id) {
        usuarioService.rejeitar(id);
        return ResponseEntity.ok(Map.of("mensagem", "Solicitacao rejeitada."));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponse> atualizar(@PathVariable UUID id,
                                                       @Valid @RequestBody AtualizarUsuarioRequest request) {
        return ResponseEntity.ok(usuarioService.atualizar(id, request));
    }

    @PutMapping("/{id}/senha")
    public ResponseEntity<Map<String, String>> resetarSenha(@PathVariable UUID id,
                                                              @Valid @RequestBody ResetarSenhaRequest request) {
        usuarioService.resetarSenha(id, request);
        return ResponseEntity.ok(Map.of("mensagem", "Senha redefinida com sucesso."));
    }

    @PutMapping("/{id}/status/{status}")
    public ResponseEntity<Map<String, String>> alterarStatus(@PathVariable UUID id, @PathVariable StatusUsuario status) {
        usuarioService.alterarStatus(id, status);
        return ResponseEntity.ok(Map.of("mensagem", "Status atualizado com sucesso."));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable UUID id) {
        usuarioService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}

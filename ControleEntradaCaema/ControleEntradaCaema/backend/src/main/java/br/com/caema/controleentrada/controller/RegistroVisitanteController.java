package br.com.caema.controleentrada.controller;

import br.com.caema.controleentrada.dto.registro.AtualizarRegistroRequest;
import br.com.caema.controleentrada.dto.registro.NovoRegistroRequest;
import br.com.caema.controleentrada.dto.registro.RegistrarSaidaRequest;
import br.com.caema.controleentrada.dto.registro.RegistroResponse;
import br.com.caema.controleentrada.service.RegistroVisitanteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/registros")
@RequiredArgsConstructor
public class RegistroVisitanteController {

    private final RegistroVisitanteService registroService;

    @PostMapping
    public ResponseEntity<RegistroResponse> registrarEntrada(Authentication authentication,
                                                               @Valid @RequestBody NovoRegistroRequest request) {
        RegistroResponse resposta = registroService.registrarEntrada(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(resposta);
    }

    @PutMapping("/{id}/saida")
    public ResponseEntity<RegistroResponse> registrarSaida(Authentication authentication,
                                                             @PathVariable UUID id,
                                                             @RequestBody(required = false) RegistrarSaidaRequest request) {
        RegistrarSaidaRequest corpo = request != null ? request : new RegistrarSaidaRequest(null);
        return ResponseEntity.ok(registroService.registrarSaida(authentication.getName(), id, corpo));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RegistroResponse> atualizar(@PathVariable UUID id,
                                                        @Valid @RequestBody AtualizarRegistroRequest request) {
        return ResponseEntity.ok(registroService.atualizar(id, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RegistroResponse> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(registroService.buscarPorId(id));
    }

    @GetMapping("/abertos")
    public ResponseEntity<List<RegistroResponse>> listarAbertos() {
        return ResponseEntity.ok(registroService.listarAbertos());
    }

    @GetMapping
    public ResponseEntity<Page<RegistroResponse>> buscar(
            @RequestParam(defaultValue = "false") boolean apenasAbertos,
            @RequestParam(required = false) String cpf,
            @RequestParam(required = false) String nome,
            @RequestParam(required = false) String localVisita,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "20") int tamanho) {

        return ResponseEntity.ok(registroService.buscarComFiltros(
                apenasAbertos, cpf, nome, localVisita, inicio, fim, pagina, tamanho));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> excluir(@PathVariable UUID id) {
        registroService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}

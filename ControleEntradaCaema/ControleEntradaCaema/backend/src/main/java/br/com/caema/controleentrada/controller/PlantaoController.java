package br.com.caema.controleentrada.controller;

import br.com.caema.controleentrada.dto.plantao.AbrirPlantaoRequest;
import br.com.caema.controleentrada.dto.plantao.ConcluirPlantaoRequest;
import br.com.caema.controleentrada.dto.plantao.PlantaoResponse;
import br.com.caema.controleentrada.service.PlantaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/plantoes")
@RequiredArgsConstructor
public class PlantaoController {

    private final PlantaoService plantaoService;

    @GetMapping("/atual")
    public ResponseEntity<PlantaoResponse> plantaoAtual(Authentication authentication) {
        return plantaoService.plantaoAtual(authentication.getName())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping
    public ResponseEntity<PlantaoResponse> abrir(Authentication authentication,
                                                  @Valid @RequestBody AbrirPlantaoRequest request) {
        PlantaoResponse resposta = plantaoService.abrir(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(resposta);
    }

    @PutMapping("/{id}/concluir")
    public ResponseEntity<PlantaoResponse> concluir(Authentication authentication,
                                                      @PathVariable UUID id,
                                                      @RequestBody(required = false) ConcluirPlantaoRequest request) {
        ConcluirPlantaoRequest corpo = request != null ? request : new ConcluirPlantaoRequest(null);
        return ResponseEntity.ok(plantaoService.concluir(authentication.getName(), id, corpo));
    }

    @GetMapping("/meu-historico")
    public ResponseEntity<List<PlantaoResponse>> meuHistorico(Authentication authentication) {
        return ResponseEntity.ok(plantaoService.meuHistorico(authentication.getName()));
    }
}

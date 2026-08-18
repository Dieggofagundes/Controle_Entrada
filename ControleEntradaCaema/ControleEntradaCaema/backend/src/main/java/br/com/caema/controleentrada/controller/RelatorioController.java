package br.com.caema.controleentrada.controller;

import br.com.caema.controleentrada.dto.plantao.PlantaoResponse;
import br.com.caema.controleentrada.dto.registro.RegistroResponse;
import br.com.caema.controleentrada.dto.relatorio.RelatorioResumoResponse;
import br.com.caema.controleentrada.service.PlantaoService;
import br.com.caema.controleentrada.service.RegistroVisitanteService;
import br.com.caema.controleentrada.service.RelatorioService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/relatorios")
@RequiredArgsConstructor
public class RelatorioController {

    private final RelatorioService relatorioService;
    private final PlantaoService plantaoService;
    private final RegistroVisitanteService registroVisitanteService;

    @GetMapping("/resumo")
    public ResponseEntity<RelatorioResumoResponse> resumo() {
        return ResponseEntity.ok(relatorioService.resumo());
    }

    @GetMapping("/plantoes")
    public ResponseEntity<Page<PlantaoResponse>> plantoes(
            @RequestParam(required = false) UUID usuarioId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "20") int tamanho) {

        return ResponseEntity.ok(plantaoService.buscarComFiltros(usuarioId, inicio, fim, pagina, tamanho));
    }

    @GetMapping("/visitantes")
    public ResponseEntity<Page<RegistroResponse>> visitantes(
            @RequestParam(defaultValue = "false") boolean apenasAbertos,
            @RequestParam(required = false) String cpf,
            @RequestParam(required = false) String nome,
            @RequestParam(required = false) String localVisita,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "20") int tamanho) {

        return ResponseEntity.ok(registroVisitanteService.buscarComFiltros(
                apenasAbertos, cpf, nome, localVisita, inicio, fim, pagina, tamanho));
    }

    @GetMapping("/visitantes/exportar")
    public ResponseEntity<byte[]> exportarVisitantes(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim) {

        byte[] csv = relatorioService.exportarVisitantesCsv(inicio, fim);
        String nomeArquivo = "relatorio-visitantes-" +
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmm")) + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + nomeArquivo + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }
}

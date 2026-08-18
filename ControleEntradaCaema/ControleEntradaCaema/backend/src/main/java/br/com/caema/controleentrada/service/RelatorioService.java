package br.com.caema.controleentrada.service;

import br.com.caema.controleentrada.dto.relatorio.RelatorioResumoResponse;
import br.com.caema.controleentrada.model.RegistroVisitante;
import br.com.caema.controleentrada.model.enums.StatusUsuario;
import br.com.caema.controleentrada.repository.PlantaoRepository;
import br.com.caema.controleentrada.repository.RegistroVisitanteRepository;
import br.com.caema.controleentrada.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RelatorioService {

    private static final DateTimeFormatter FORMATO_DATA = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final UsuarioRepository usuarioRepository;
    private final PlantaoRepository plantaoRepository;
    private final RegistroVisitanteRepository registroRepository;

    @Transactional(readOnly = true)
    public RelatorioResumoResponse resumo() {
        long totalVisitas = registroRepository.count();
        long visitasAbertas = registroRepository.findByHoraSaidaIsNullOrderByHoraEntradaDesc().size();
        long totalPlantoes = plantaoRepository.count();
        long totalUsuariosAtivos = usuarioRepository.findByStatusOrderByCriadoEmDesc(StatusUsuario.ATIVO).size();
        long usuariosPendentes = usuarioRepository.findByStatusOrderByCriadoEmDesc(StatusUsuario.PENDENTE).size();

        long plantoesAbertos = plantaoRepository.findAll().stream()
                .filter(p -> p.getHoraConclusao() == null)
                .count();

        return new RelatorioResumoResponse(
                totalVisitas, visitasAbertas, totalPlantoes, plantoesAbertos, totalUsuariosAtivos, usuariosPendentes
        );
    }

    @Transactional(readOnly = true)
    public byte[] exportarVisitantesCsv(LocalDateTime inicio, LocalDateTime fim) {
        List<RegistroVisitante> registros = registroRepository.buscarParaExportacao(inicio, fim);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        out.write(0xEF); out.write(0xBB); out.write(0xBF); // BOM UTF-8 (acentuacao correta no Excel)

        try (OutputStreamWriter writer = new OutputStreamWriter(out, StandardCharsets.UTF_8);
             CSVPrinter printer = new CSVPrinter(writer, CSVFormat.DEFAULT.builder()
                     .setHeader("Nome do Visitante", "CPF", "Endereco", "Telefone", "Local da Visita",
                             "Numero do Cracha", "Hora de Entrada", "Hora de Saida",
                             "Registrado por (entrada)", "Registrado por (saida)")
                     .build())) {

            for (RegistroVisitante r : registros) {
                printer.printRecord(
                        r.getNomeVisitante(),
                        r.getCpf(),
                        r.getEndereco(),
                        r.getTelefone(),
                        r.getLocalVisita(),
                        r.getNumeroCracha(),
                        r.getHoraEntrada() != null ? r.getHoraEntrada().format(FORMATO_DATA) : "",
                        r.getHoraSaida() != null ? r.getHoraSaida().format(FORMATO_DATA) : "EM ABERTO",
                        r.getRegistradoPor() != null ? r.getRegistradoPor().getNomeGuerra() : "",
                        r.getSaidaRegistradaPor() != null ? r.getSaidaRegistradaPor().getNomeGuerra() : ""
                );
            }

            printer.flush();
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Falha ao gerar relatorio CSV", e);
        }
    }
}

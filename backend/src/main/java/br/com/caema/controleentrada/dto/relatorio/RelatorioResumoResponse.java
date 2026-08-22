package br.com.caema.controleentrada.dto.relatorio;

public record RelatorioResumoResponse(
        long totalVisitas,
        long visitasEmAberto,
        long totalPlantoes,
        long plantoesEmAberto,
        long totalUsuariosAtivos,
        long usuariosPendentesAprovacao
) {
}

package br.com.caema.controleentrada.service;

import br.com.caema.controleentrada.dto.plantao.AbrirPlantaoRequest;
import br.com.caema.controleentrada.dto.plantao.ConcluirPlantaoRequest;
import br.com.caema.controleentrada.dto.plantao.PlantaoResponse;
import br.com.caema.controleentrada.exception.RecursoNaoEncontradoException;
import br.com.caema.controleentrada.exception.RegraDeNegocioException;
import br.com.caema.controleentrada.model.Plantao;
import br.com.caema.controleentrada.model.Usuario;
import br.com.caema.controleentrada.repository.PlantaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PlantaoService {

    private final PlantaoRepository plantaoRepository;
    private final UsuarioService usuarioService;

    @Transactional(readOnly = true)
    public Optional<PlantaoResponse> plantaoAtual(String matriculaLogada) {
        Usuario usuario = usuarioService.buscarPorMatricula(matriculaLogada);
        return plantaoRepository
                .findFirstByUsuarioAndHoraConclusaoIsNullOrderByHoraAssuncaoDesc(usuario)
                .map(PlantaoResponse::de);
    }

    @Transactional
    public PlantaoResponse abrir(String matriculaLogada, AbrirPlantaoRequest request) {
        Usuario usuario = usuarioService.buscarPorMatricula(matriculaLogada);

        plantaoRepository.findFirstByUsuarioAndHoraConclusaoIsNullOrderByHoraAssuncaoDesc(usuario)
                .ifPresent(p -> {
                    throw new RegraDeNegocioException(
                            "Voce ja possui um plantao em aberto. Conclua-o antes de iniciar outro.");
                });

        Plantao plantao = Plantao.builder()
                .usuario(usuario)
                .funcao(request.funcao())
                .horaAssuncao(request.horaAssuncao() != null ? request.horaAssuncao() : LocalDateTime.now())
                .build();

        return PlantaoResponse.de(plantaoRepository.save(plantao));
    }

    @Transactional
    public PlantaoResponse concluir(String matriculaLogada, UUID plantaoId, ConcluirPlantaoRequest request) {
        Usuario usuarioLogado = usuarioService.buscarPorMatricula(matriculaLogada);
        Plantao plantao = plantaoRepository.findById(plantaoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Plantao nao encontrado"));

        if (plantao.getHoraConclusao() != null) {
            throw new RegraDeNegocioException("Este plantao ja foi concluido");
        }

        LocalDateTime horaConclusao = request.horaConclusao() != null ? request.horaConclusao() : LocalDateTime.now();

        // Compara truncado ao minuto: o campo de hora no frontend (datetime-local) so tem
        // precisao de minuto, enquanto horaAssuncao foi gravada com segundos/nanos. Sem isso,
        // uma conclusao no mesmo minuto da assuncao e injustamente rejeitada por "anterior"
        // devido aos segundos zerados no envio.
        if (horaConclusao.isBefore(plantao.getHoraAssuncao().truncatedTo(ChronoUnit.MINUTES))) {
            throw new RegraDeNegocioException("A hora de conclusao nao pode ser anterior a hora de assuncao");
        }

        plantao.setHoraConclusao(horaConclusao);
        plantao.setConcluidoPor(usuarioLogado);

        return PlantaoResponse.de(plantaoRepository.save(plantao));
    }

    @Transactional(readOnly = true)
    public List<PlantaoResponse> meuHistorico(String matriculaLogada) {
        Usuario usuario = usuarioService.buscarPorMatricula(matriculaLogada);
        return plantaoRepository.findByUsuarioOrderByHoraAssuncaoDesc(usuario)
                .stream().map(PlantaoResponse::de).toList();
    }

    @Transactional(readOnly = true)
    public Page<PlantaoResponse> buscarComFiltros(UUID usuarioId, LocalDateTime inicio, LocalDateTime fim,
                                                   int pagina, int tamanho) {
        Page<Plantao> resultado = plantaoRepository.buscarComFiltros(
                usuarioId, inicio, fim,
                PageRequest.of(pagina, tamanho, Sort.by(Sort.Direction.DESC, "horaAssuncao")));

        return resultado.map(PlantaoResponse::de);
    }
}

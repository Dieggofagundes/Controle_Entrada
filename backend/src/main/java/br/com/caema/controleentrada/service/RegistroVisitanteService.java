package br.com.caema.controleentrada.service;

import br.com.caema.controleentrada.dto.registro.AtualizarRegistroRequest;
import br.com.caema.controleentrada.dto.registro.NovoRegistroRequest;
import br.com.caema.controleentrada.dto.registro.RegistrarSaidaRequest;
import br.com.caema.controleentrada.dto.registro.RegistroResponse;
import br.com.caema.controleentrada.exception.RecursoNaoEncontradoException;
import br.com.caema.controleentrada.exception.RegraDeNegocioException;
import br.com.caema.controleentrada.model.Plantao;
import br.com.caema.controleentrada.model.RegistroVisitante;
import br.com.caema.controleentrada.model.Usuario;
import br.com.caema.controleentrada.repository.PlantaoRepository;
import br.com.caema.controleentrada.repository.RegistroVisitanteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RegistroVisitanteService {

    private final RegistroVisitanteRepository registroRepository;
    private final PlantaoRepository plantaoRepository;
    private final UsuarioService usuarioService;

    private String normalizarCpf(String cpf) {
        return cpf.replaceAll("\\D", "");
    }

    @Transactional
    public RegistroResponse registrarEntrada(String matriculaLogada, NovoRegistroRequest request) {
        Usuario usuario = usuarioService.buscarPorMatricula(matriculaLogada);

        Plantao plantaoAtual = plantaoRepository
                .findFirstByUsuarioAndHoraConclusaoIsNullOrderByHoraAssuncaoDesc(usuario)
                .orElse(null);

        RegistroVisitante registro = RegistroVisitante.builder()
                .nomeVisitante(request.nomeVisitante().trim())
                .endereco(request.endereco())
                .telefone(request.telefone())
                .cpf(normalizarCpf(request.cpf()))
                .localVisita(request.localVisita().trim())
                .numeroCracha(request.numeroCracha())
                .horaEntrada(request.horaEntrada() != null ? request.horaEntrada() : LocalDateTime.now())
                .registradoPor(usuario)
                .plantaoEntrada(plantaoAtual)
                .build();

        return RegistroResponse.de(registroRepository.save(registro));
    }

    @Transactional
    public RegistroResponse registrarSaida(String matriculaLogada, UUID registroId, RegistrarSaidaRequest request) {
        Usuario usuarioLogado = usuarioService.buscarPorMatricula(matriculaLogada);
        RegistroVisitante registro = registroRepository.findById(registroId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Registro de visitante nao encontrado"));

        if (registro.getHoraSaida() != null) {
            throw new RegraDeNegocioException("A saida deste visitante ja foi registrada");
        }

        LocalDateTime horaSaida = request.horaSaida() != null ? request.horaSaida() : LocalDateTime.now();

        if (horaSaida.isBefore(registro.getHoraEntrada())) {
            throw new RegraDeNegocioException("A hora de saida nao pode ser anterior a hora de entrada");
        }

        registro.setHoraSaida(horaSaida);
        registro.setSaidaRegistradaPor(usuarioLogado);

        return RegistroResponse.de(registroRepository.save(registro));
    }

    @Transactional
    public RegistroResponse atualizar(UUID registroId, AtualizarRegistroRequest request) {
        RegistroVisitante registro = registroRepository.findById(registroId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Registro de visitante nao encontrado"));

        registro.setNomeVisitante(request.nomeVisitante().trim());
        registro.setEndereco(request.endereco());
        registro.setTelefone(request.telefone());
        registro.setCpf(normalizarCpf(request.cpf()));
        registro.setLocalVisita(request.localVisita().trim());
        registro.setNumeroCracha(request.numeroCracha());

        return RegistroResponse.de(registroRepository.save(registro));
    }

    @Transactional(readOnly = true)
    public List<RegistroResponse> listarAbertos() {
        return registroRepository.findByHoraSaidaIsNullOrderByHoraEntradaDesc()
                .stream().map(RegistroResponse::de).toList();
    }

    @Transactional(readOnly = true)
    public Page<RegistroResponse> buscarComFiltros(boolean apenasAbertos, String cpf, String nome, String localVisita,
                                                     LocalDateTime inicio, LocalDateTime fim, int pagina, int tamanho) {
        String cpfNormalizado = (cpf == null || cpf.isBlank()) ? null : normalizarCpf(cpf);

        Page<RegistroVisitante> resultado = registroRepository.buscarComFiltros(
                apenasAbertos, cpfNormalizado, blankParaNull(nome), blankParaNull(localVisita), inicio, fim,
                PageRequest.of(pagina, tamanho, Sort.by(Sort.Direction.DESC, "horaEntrada")));

        return resultado.map(RegistroResponse::de);
    }

    private String blankParaNull(String valor) {
        return (valor == null || valor.isBlank()) ? null : valor;
    }

    @Transactional(readOnly = true)
    public RegistroResponse buscarPorId(UUID id) {
        return registroRepository.findById(id)
                .map(RegistroResponse::de)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Registro de visitante nao encontrado"));
    }

    @Transactional(readOnly = true)
    public List<RegistroVisitante> buscarParaExportacao(LocalDateTime inicio, LocalDateTime fim) {
        return registroRepository.buscarParaExportacao(inicio, fim);
    }

    @Transactional
    public void excluir(UUID id) {
        if (!registroRepository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Registro de visitante nao encontrado");
        }
        registroRepository.deleteById(id);
    }
}

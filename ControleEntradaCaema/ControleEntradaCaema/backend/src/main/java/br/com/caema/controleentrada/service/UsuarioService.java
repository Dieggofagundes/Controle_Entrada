package br.com.caema.controleentrada.service;

import br.com.caema.controleentrada.dto.usuario.AlterarMinhaSenhaRequest;
import br.com.caema.controleentrada.dto.usuario.AprovarUsuarioRequest;
import br.com.caema.controleentrada.dto.usuario.AtualizarUsuarioRequest;
import br.com.caema.controleentrada.dto.usuario.CriarUsuarioRequest;
import br.com.caema.controleentrada.dto.usuario.ResetarSenhaRequest;
import br.com.caema.controleentrada.dto.usuario.UsuarioResponse;
import br.com.caema.controleentrada.exception.RecursoNaoEncontradoException;
import br.com.caema.controleentrada.exception.RegraDeNegocioException;
import br.com.caema.controleentrada.model.Usuario;
import br.com.caema.controleentrada.model.enums.StatusUsuario;
import br.com.caema.controleentrada.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public Usuario buscarPorMatricula(String matricula) {
        return usuarioRepository.findByMatricula(matricula)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuario nao encontrado"));
    }

    private Usuario buscarPorId(UUID id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuario nao encontrado"));
    }

    @Transactional(readOnly = true)
    public UsuarioResponse meuPerfil(String matricula) {
        return UsuarioResponse.de(buscarPorMatricula(matricula));
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listarTodos() {
        return usuarioRepository.findAllByOrderByNomeCompletoAsc()
                .stream().map(UsuarioResponse::de).toList();
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listarPendentes() {
        return usuarioRepository.findByStatusOrderByCriadoEmDesc(StatusUsuario.PENDENTE)
                .stream().map(UsuarioResponse::de).toList();
    }

    @Transactional
    public UsuarioResponse criarDiretamente(CriarUsuarioRequest request) {
        if (usuarioRepository.existsByMatricula(request.matricula())) {
            throw new RegraDeNegocioException("Ja existe um usuario com essa matricula");
        }

        Usuario usuario = Usuario.builder()
                .matricula(request.matricula().trim())
                .senha(passwordEncoder.encode(request.senha()))
                .nomeCompleto(request.nomeCompleto().trim())
                .nomeGuerra(request.nomeGuerra().trim())
                .email(request.email())
                .funcao(request.funcao())
                .perfil(request.perfil())
                .status(StatusUsuario.ATIVO)
                .build();

        return UsuarioResponse.de(usuarioRepository.save(usuario));
    }

    @Transactional
    public UsuarioResponse aprovar(UUID id, AprovarUsuarioRequest request) {
        Usuario usuario = buscarPorId(id);

        if (usuario.getStatus() != StatusUsuario.PENDENTE) {
            throw new RegraDeNegocioException("Este usuario ja foi analisado anteriormente");
        }

        usuario.setFuncao(request.funcao());
        usuario.setPerfil(request.perfil());
        usuario.setStatus(StatusUsuario.ATIVO);

        return UsuarioResponse.de(usuarioRepository.save(usuario));
    }

    @Transactional
    public void rejeitar(UUID id) {
        Usuario usuario = buscarPorId(id);

        if (usuario.getStatus() != StatusUsuario.PENDENTE) {
            throw new RegraDeNegocioException("Este usuario ja foi analisado anteriormente");
        }

        usuario.setStatus(StatusUsuario.REJEITADO);
        usuarioRepository.save(usuario);
    }

    @Transactional
    public UsuarioResponse atualizar(UUID id, AtualizarUsuarioRequest request) {
        Usuario usuario = buscarPorId(id);

        usuario.setNomeCompleto(request.nomeCompleto().trim());
        usuario.setNomeGuerra(request.nomeGuerra().trim());
        usuario.setEmail(request.email());
        usuario.setFuncao(request.funcao());
        usuario.setPerfil(request.perfil());
        usuario.setStatus(request.status());

        return UsuarioResponse.de(usuarioRepository.save(usuario));
    }

    @Transactional
    public void resetarSenha(UUID id, ResetarSenhaRequest request) {
        Usuario usuario = buscarPorId(id);
        usuario.setSenha(passwordEncoder.encode(request.novaSenha()));
        usuarioRepository.save(usuario);
    }

    @Transactional
    public void alterarStatus(UUID id, StatusUsuario novoStatus) {
        Usuario usuario = buscarPorId(id);
        usuario.setStatus(novoStatus);
        usuarioRepository.save(usuario);
    }

    @Transactional
    public void alterarMinhaSenha(String matricula, AlterarMinhaSenhaRequest request) {
        Usuario usuario = buscarPorMatricula(matricula);

        if (!passwordEncoder.matches(request.senhaAtual(), usuario.getSenha())) {
            throw new RegraDeNegocioException("Senha atual incorreta");
        }

        usuario.setSenha(passwordEncoder.encode(request.novaSenha()));
        usuarioRepository.save(usuario);
    }

    @Transactional
    public void excluir(UUID id) {
        if (!usuarioRepository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Usuario nao encontrado");
        }
        usuarioRepository.deleteById(id);
    }
}

package br.com.caema.controleentrada.service;

import br.com.caema.controleentrada.dto.auth.EsqueciSenhaRequest;
import br.com.caema.controleentrada.dto.auth.LoginRequest;
import br.com.caema.controleentrada.dto.auth.LoginResponse;
import br.com.caema.controleentrada.dto.auth.RedefinirSenhaRequest;
import br.com.caema.controleentrada.dto.auth.SolicitarCadastroRequest;
import br.com.caema.controleentrada.dto.usuario.UsuarioResponse;
import br.com.caema.controleentrada.exception.RegraDeNegocioException;
import br.com.caema.controleentrada.model.PasswordResetToken;
import br.com.caema.controleentrada.model.Usuario;
import br.com.caema.controleentrada.model.enums.Perfil;
import br.com.caema.controleentrada.model.enums.StatusUsuario;
import br.com.caema.controleentrada.repository.PasswordResetTokenRepository;
import br.com.caema.controleentrada.repository.UsuarioRepository;
import br.com.caema.controleentrada.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final EmailService emailService;

    @Transactional
    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.matricula(), request.senha())
        );

        Usuario usuario = usuarioRepository.findByMatricula(request.matricula())
                .orElseThrow(() -> new RegraDeNegocioException("Matricula ou senha invalidos"));

        String token = jwtService.gerarToken(usuario);

        return new LoginResponse(token, jwtService.getExpiracaoEmSegundos(), UsuarioResponse.de(usuario));
    }

    @Transactional
    public UsuarioResponse solicitarCadastro(SolicitarCadastroRequest request) {
        if (usuarioRepository.existsByMatricula(request.matricula())) {
            throw new RegraDeNegocioException("Ja existe uma solicitacao ou cadastro com essa matricula");
        }

        Usuario usuario = Usuario.builder()
                .matricula(request.matricula().trim())
                .senha(passwordEncoder.encode(request.senha()))
                .nomeCompleto(request.nomeCompleto().trim())
                .nomeGuerra(request.nomeGuerra().trim())
                .email(request.email())
                .funcao(request.funcao())
                .perfil(Perfil.USUARIO)
                .status(StatusUsuario.PENDENTE)
                .build();

        return UsuarioResponse.de(usuarioRepository.save(usuario));
    }

    @Transactional
    public void esqueciSenha(EsqueciSenhaRequest request) {
        usuarioRepository.findByMatricula(request.matricula()).ifPresent(usuario -> {
            if (usuario.getEmail() == null || usuario.getEmail().isBlank()) {
                return; // sem e-mail cadastrado: o admin precisa resetar manualmente
            }

            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .usuario(usuario)
                    .token(UUID.randomUUID().toString())
                    .expiraEm(LocalDateTime.now().plusHours(1))
                    .usado(false)
                    .build();

            tokenRepository.save(resetToken);
            emailService.enviarEmailRedefinicaoSenha(usuario.getEmail(), usuario.getNomeGuerra(), resetToken.getToken());
        });
        // Resposta generica sempre, para nao revelar se a matricula existe.
    }

    @Transactional
    public void redefinirSenha(RedefinirSenhaRequest request) {
        PasswordResetToken resetToken = tokenRepository.findByToken(request.token())
                .orElseThrow(() -> new RegraDeNegocioException("Link de redefinicao invalido ou expirado"));

        if (!resetToken.isValido()) {
            throw new RegraDeNegocioException("Link de redefinicao invalido ou expirado");
        }

        Usuario usuario = resetToken.getUsuario();
        usuario.setSenha(passwordEncoder.encode(request.novaSenha()));
        resetToken.setUsado(true);

        usuarioRepository.save(usuario);
        tokenRepository.save(resetToken);
    }
}

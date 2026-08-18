package br.com.caema.controleentrada.config;

import br.com.caema.controleentrada.model.Usuario;
import br.com.caema.controleentrada.model.enums.Funcao;
import br.com.caema.controleentrada.model.enums.Perfil;
import br.com.caema.controleentrada.model.enums.StatusUsuario;
import br.com.caema.controleentrada.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Garante que sempre exista ao menos um usuario ADMIN no sistema.
 * So cria o admin padrao se a tabela de usuarios estiver vazia -
 * nao sobrescreve nada em execucoes seguintes.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.matricula}")
    private String matriculaAdmin;

    @Value("${app.admin.senha}")
    private String senhaAdmin;

    @Value("${app.admin.nome}")
    private String nomeAdmin;

    @Override
    public void run(String... args) {
        if (usuarioRepository.count() > 0) {
            return;
        }

        Usuario admin = Usuario.builder()
                .matricula(matriculaAdmin)
                .senha(passwordEncoder.encode(senhaAdmin))
                .nomeCompleto(nomeAdmin)
                .nomeGuerra("ADMIN")
                .funcao(Funcao.CMD_DA_GUARDA)
                .perfil(Perfil.ADMIN)
                .status(StatusUsuario.ATIVO)
                .build();

        usuarioRepository.save(admin);

        log.warn("=========================================================");
        log.warn(" Usuario ADMIN criado automaticamente (primeira execucao).");
        log.warn(" Matricula: {}", matriculaAdmin);
        log.warn(" IMPORTANTE: altere a senha padrao assim que possivel!");
        log.warn("=========================================================");
    }
}

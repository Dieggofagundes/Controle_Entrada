package br.com.caema.controleentrada.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String remetente;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public void enviarEmailRedefinicaoSenha(String destinatario, String nomeGuerra, String token) {
        if (remetente == null || remetente.isBlank()) {
            // Envio de e-mail nao configurado neste ambiente - o admin pode resetar a senha manualmente.
            log.warn("Envio de e-mail nao configurado. Link de redefinicao para {}: {}/redefinir-senha/{}",
                    destinatario, frontendUrl, token);
            return;
        }

        try {
            SimpleMailMessage mensagem = new SimpleMailMessage();
            mensagem.setFrom(remetente);
            mensagem.setTo(destinatario);
            mensagem.setSubject("Controle de Entrada CAEMA - Redefinicao de senha");
            mensagem.setText("""
                    Ola, %s.

                    Recebemos uma solicitacao para redefinir sua senha no sistema de Controle de Entrada.

                    Acesse o link abaixo para criar uma nova senha (valido por 1 hora):
                    %s/redefinir-senha/%s

                    Se voce nao solicitou essa alteracao, ignore este e-mail.
                    """.formatted(nomeGuerra, frontendUrl, token));
            mailSender.send(mensagem);
        } catch (Exception e) {
            log.error("Falha ao enviar e-mail de redefinicao de senha para {}", destinatario, e);
        }
    }
}

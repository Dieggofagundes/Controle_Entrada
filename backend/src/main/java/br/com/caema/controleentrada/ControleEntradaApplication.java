package br.com.caema.controleentrada;

import java.util.TimeZone;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ControleEntradaApplication {

    public static void main(String[] args) {
        // Fixa o fuso horario padrao da JVM em Brasilia, independente do fuso do SO/container
        // onde a aplicacao roda. Sem isso, LocalDateTime.now() (usado em toda a gravacao de
        // hora_entrada, hora_saida, hora_assuncao, criado_em etc.) usa o fuso padrao do
        // ambiente - que em imagens Docker, no Fly.io e nos runners do GitHub Actions e UTC por
        // padrao - fazendo com que todo horario registrado fique 3h adiantado em relacao ao
        // horario real de Brasilia.
        TimeZone.setDefault(TimeZone.getTimeZone("America/Sao_Paulo"));
        SpringApplication.run(ControleEntradaApplication.class, args);
    }
}

package br.com.caema.controleentrada.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URI;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Fly.io (via "fly postgres attach") define DATABASE_URL como postgres://usuario:senha@host:porta/banco.
 * O datasource do Spring precisa de uma URL JDBC (jdbc:postgresql://...) com usuario e senha em
 * propriedades separadas. Converte automaticamente quando DATABASE_URL nao estiver nesse formato,
 * para que o attach funcione sem configuracao manual de secrets.
 */
public class DatabaseUrlEnvironmentPostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String databaseUrl = environment.getProperty("DATABASE_URL");
        if (databaseUrl == null || databaseUrl.isBlank() || databaseUrl.startsWith("jdbc:")) {
            return;
        }

        URI uri = URI.create(databaseUrl);
        String[] userInfo = uri.getUserInfo() != null ? uri.getUserInfo().split(":", 2) : new String[0];
        String username = userInfo.length > 0 ? userInfo[0] : "";
        String password = userInfo.length > 1 ? userInfo[1] : "";
        int port = uri.getPort() > 0 ? uri.getPort() : 5432;
        String jdbcUrl = "jdbc:postgresql://" + uri.getHost() + ":" + port + uri.getPath();

        Map<String, Object> overrides = new LinkedHashMap<>();
        overrides.put("DATABASE_URL", jdbcUrl);
        overrides.put("DATABASE_USERNAME", username);
        overrides.put("DATABASE_PASSWORD", password);

        environment.getPropertySources().addFirst(new MapPropertySource("databaseUrlOverride", overrides));
    }
}

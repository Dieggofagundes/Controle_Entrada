-- =========================================================
-- Controle de Entrada CAEMA - schema inicial
-- =========================================================

CREATE TABLE usuarios (
    id                  UUID PRIMARY KEY,
    matricula           VARCHAR(30)  NOT NULL UNIQUE,
    senha               VARCHAR(255) NOT NULL,
    nome_completo       VARCHAR(150) NOT NULL,
    nome_guerra         VARCHAR(60)  NOT NULL,
    email               VARCHAR(150),
    funcao              VARCHAR(30)  NOT NULL,
    perfil              VARCHAR(20)  NOT NULL DEFAULT 'USUARIO',
    status              VARCHAR(20)  NOT NULL DEFAULT 'PENDENTE',
    criado_em           TIMESTAMP    NOT NULL DEFAULT now(),
    atualizado_em       TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE INDEX idx_usuarios_status ON usuarios (status);

CREATE TABLE password_reset_tokens (
    id            UUID PRIMARY KEY,
    usuario_id    UUID NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
    token         VARCHAR(100) NOT NULL UNIQUE,
    expira_em     TIMESTAMP NOT NULL,
    usado         BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em     TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_reset_token ON password_reset_tokens (token);

CREATE TABLE plantoes (
    id                  UUID PRIMARY KEY,
    usuario_id          UUID NOT NULL REFERENCES usuarios (id),
    funcao              VARCHAR(30) NOT NULL,
    hora_assuncao       TIMESTAMP NOT NULL,
    hora_conclusao      TIMESTAMP,
    concluido_por_id    UUID REFERENCES usuarios (id),
    criado_em           TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_plantoes_usuario ON plantoes (usuario_id);
CREATE INDEX idx_plantoes_aberto ON plantoes (usuario_id, hora_conclusao);

CREATE TABLE registros_visitantes (
    id                      UUID PRIMARY KEY,
    nome_visitante          VARCHAR(150) NOT NULL,
    endereco                VARCHAR(255),
    telefone                VARCHAR(20),
    cpf                     VARCHAR(14) NOT NULL,
    local_visita            VARCHAR(150) NOT NULL,
    numero_cracha           VARCHAR(30),
    hora_entrada            TIMESTAMP NOT NULL,
    hora_saida              TIMESTAMP,
    registrado_por_id       UUID NOT NULL REFERENCES usuarios (id),
    saida_registrada_por_id UUID REFERENCES usuarios (id),
    plantao_entrada_id      UUID REFERENCES plantoes (id),
    criado_em               TIMESTAMP NOT NULL DEFAULT now(),
    atualizado_em           TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_registros_cpf ON registros_visitantes (cpf);
CREATE INDEX idx_registros_aberto ON registros_visitantes (hora_saida);
CREATE INDEX idx_registros_hora_entrada ON registros_visitantes (hora_entrada);

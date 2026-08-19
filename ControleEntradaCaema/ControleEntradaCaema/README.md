# Controle de Entrada CAEMA

[![E2E](https://github.com/Dieggofagundes/Controle_Entrada/actions/workflows/controle-entrada-caema-e2e.yml/badge.svg)](https://github.com/Dieggofagundes/Controle_Entrada/actions/workflows/controle-entrada-caema-e2e.yml)

Sistema de controle de entrada de visitantes e acompanhamento de plantao de servico,
desenvolvido para uso interno da CAEMA.

- **Backend**: Java 21 + Spring Boot 3.3 + PostgreSQL + JWT
- **Frontend**: React + TypeScript + Vite + Tailwind CSS (responsivo: celular, tablet e desktop)
- **Testes E2E**: Playwright (`e2e/`), rodando automaticamente no CI a cada push/PR
- **Deploy sugerido**: backend no [Fly.io](https://fly.io), frontend no [Netlify](https://app.netlify.com)

---

## 1. Funcionalidades

### Autenticacao
- Login com **matricula e senha**
- **Esqueci minha senha**: envia um link de redefinicao por e-mail (se o usuario tiver e-mail
  cadastrado e o servidor SMTP estiver configurado). Sem e-mail configurado, o administrador pode
  resetar a senha de qualquer usuario direto no painel.
- **Solicitar cadastro**: qualquer pessoa pode preencher seus dados na tela de login; a solicitacao
  fica com status **Pendente** ate um administrador aprovar (e definir a funcao/perfil definitivos).

### Area do usuario comum
- Painel inicial mostrando: nome completo, nome de guerra, matricula.
- Controle de **plantao de servico**: abrir o plantao informando a **funcao** (Cmd da Guarda, Guarda,
  Patrulheiro, Motorista ou Cmd de VTR) e a **hora de assuncao**; concluir informando a **hora de
  conclusao**.
- **Cadastro de visitantes**: nome, endereco, telefone, CPF, local da visita e numero do cracha, com
  hora de entrada. A hora de saida fica em aberto e **pode ser concluida por qualquer usuario
  logado**, nao apenas por quem registrou a entrada — util quando o visitante sai depois do fim do
  turno de quem o recebeu. O sistema sempre registra quem fez a entrada e quem fez a saida.

### Area do administrador
- Aprovar ou rejeitar solicitacoes de cadastro, definindo funcao e perfil (usuario/admin).
- Criar usuarios diretamente, editar, resetar senha, ativar/inativar ou excluir.
- Relatorios: resumo geral (visitas totais/abertas, plantoes abertos, cadastros pendentes),
  historico filtravel de visitantes e de plantoes, e **exportacao em CSV** dos visitantes.

---

## 2. Estrutura do projeto

```
ControleEntradaCaema/
├── backend/     -> API REST em Spring Boot (Java 21)
├── frontend/    -> SPA em React + TypeScript (Vite)
└── e2e/         -> Testes end-to-end (Playwright), veja e2e/README.md
```

Cada pasta tem seu proprio `README` implicito nas instrucoes abaixo. Sao dois deploys
independentes: o backend vira uma API publica (Fly.io), o frontend vira um site estatico que
consome essa API (Netlify).

---

## 3. Rodando localmente

### Pre-requisitos
- Java 21 (`java -version`)
- Maven (ou use sua IDE, que ja traz o Maven embutido)
- Node.js 20+ e npm
- Docker (mais facil para subir o Postgres local) — ou um Postgres já instalado

### 3.1. Banco de dados local
```bash
docker run --name caema-postgres -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=controle_entrada -p 5432:5432 -d postgres:16
```

### 3.2. Backend
```bash
cd backend
mvn spring-boot:run
```
Isso sobe a API em `http://localhost:8080`. Na primeira execucao, o sistema cria automaticamente
um usuario **administrador**:
- Matricula: `admin`
- Senha: `admin123`

> **Importante**: troque essa senha assim que possivel (tela de perfil ou resetando via variavel de
> ambiente `ADMIN_SENHA` antes da primeira execucao — veja a secao 4).

### 3.3. Frontend
```bash
cd frontend
cp .env.example .env      # confirme que VITE_API_URL aponta para http://localhost:8080/api
npm install
npm run dev
```
Acesse `http://localhost:5173`.

### 3.4. Testes E2E (opcional, mas recomendado antes de cada deploy)

Com backend e frontend rodando (passos 3.2 e 3.3):

```bash
cd e2e
npm install
npx playwright install --with-deps chromium   # so na primeira vez
npm test
```

Veja `e2e/README.md` para detalhes de cada teste e como rodar contra outros ambientes. Essa
mesma suite roda automaticamente no CI (GitHub Actions) a cada push/PR.

---

## 4. Variaveis de ambiente do backend

Todas tem um valor padrao para desenvolvimento, mas **devem ser configuradas em producao**:

| Variavel | Descricao | Padrao (dev) |
|---|---|---|
| `DATABASE_URL` | URL JDBC do Postgres | `jdbc:postgresql://localhost:5432/controle_entrada` |
| `DATABASE_USERNAME` | Usuario do banco | `postgres` |
| `DATABASE_PASSWORD` | Senha do banco | `postgres` |
| `JWT_SECRET` | Chave secreta para assinar os tokens JWT (troque em producao!) | valor de exemplo |
| `JWT_EXPIRACAO_MINUTOS` | Validade do token de login | `600` (10h) |
| `CORS_ORIGENS` | URL(s) do frontend autorizadas a chamar a API | `http://localhost:5173` |
| `ADMIN_MATRICULA` / `ADMIN_SENHA` / `ADMIN_NOME` | Dados do admin criado na 1a execucao | `admin` / `admin123` / ... |
| `FRONTEND_URL` | URL do frontend, usada no link de redefinicao de senha por e-mail | `http://localhost:5173` |
| `MAIL_HOST` / `MAIL_PORT` / `MAIL_USERNAME` / `MAIL_PASSWORD` | Configuracao SMTP para o "esqueci minha senha" (opcional) | vazio |

Se `MAIL_HOST`/`MAIL_USERNAME` ficarem vazios, o "esqueci minha senha" simplesmente nao envia
e-mail — o fluxo continua funcionando pelo reset manual do administrador.

---

## 5. Deploy do backend no Fly.io

O login solicitado (`sointcaemadrive@gmail.com`) precisa ser feito por voce diretamente no site do
Fly.io — por seguranca, nenhuma ferramenta automatizada deve inserir suas credenciais. O passo a
passo abaixo assume que voce ja instalou a `flyctl` e fez `fly auth login` com essa conta.

```bash
cd backend

# 1. Cria o app no Fly (ele detecta o Dockerfile automaticamente).
#    Quando perguntado "Would you like to set up a Postgresql database now?", responda Yes.
fly launch --no-deploy

# 2. Se voce nao criou o Postgres no passo anterior, crie e anexe agora:
fly postgres create --name caema-db
fly postgres attach caema-db

# O comando "attach" cria automaticamente uma variavel DATABASE_URL no formato:
#   postgres://usuario:senha@host:5432/nome_do_banco
# Nosso backend espera uma URL JDBC. Configure as 3 variaveis manualmente com os
# mesmos dados retornados pelo "attach":
fly secrets set \
  DATABASE_URL="jdbc:postgresql://<host>:5432/<nome_do_banco>" \
  DATABASE_USERNAME="<usuario>" \
  DATABASE_PASSWORD="<senha>"

# 3. Configure o restante dos segredos:
fly secrets set \
  JWT_SECRET="$(openssl rand -base64 48)" \
  CORS_ORIGENS="https://SEU-SITE.netlify.app" \
  FRONTEND_URL="https://SEU-SITE.netlify.app" \
  ADMIN_MATRICULA="admin" \
  ADMIN_SENHA="TrokeEstaSenhaForte123"

# 4. Deploy:
fly deploy

# 5. Confira a URL publica gerada (algo como https://controle-entrada-caema-api.fly.dev)
fly status
```

Depois de qualquer alteracao no codigo do backend, um novo `fly deploy` publica a atualizacao.

---

## 6. Deploy do frontend no Netlify

Assim como o Fly.io, o login (`app.netlify.com/signup/start` ou login normal) precisa ser feito por
voce. Duas formas de publicar:

### Opcao A — arrastar e soltar (mais simples)
```bash
cd frontend
npm install
echo "VITE_API_URL=https://SEU-BACKEND.fly.dev/api" > .env
npm run build
```
Depois, acesse o painel do Netlify → **Add new site → Deploy manually** e arraste a pasta
`frontend/dist` gerada.

### Opcao B — conectar ao Git (recomendado para atualizacoes continuas)
1. Suba este projeto para um repositorio no GitHub/GitLab.
2. No Netlify: **Add new site → Import an existing project** e selecione o repositorio.
3. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
4. Em **Site settings → Environment variables**, adicione:
   - `VITE_API_URL` = `https://SEU-BACKEND.fly.dev/api`
5. Deploy. O arquivo `netlify.toml` ja incluido cuida do redirecionamento de rotas da SPA.

Depois do primeiro deploy, atualize a variavel `CORS_ORIGENS` no backend (Fly.io) com a URL final
gerada pelo Netlify, e rode `fly deploy` novamente para aplicar.

---

## 7. Primeiro acesso em producao

1. Acesse o frontend publicado e entre com `admin` / a senha definida em `ADMIN_SENHA`.
2. Assim que possivel, troque a senha ou crie outro administrador e desative o `admin` padrao.
3. Cadastre os demais usuarios (diretamente pelo painel, ou peça que cada um envie uma
   "Solicitacao de cadastro" pela tela de login para voce aprovar).

---

## 8. Notas tecnicas e decisoes de projeto

- **LGPD/privacidade**: o sistema armazena dados pessoais de visitantes (CPF, telefone, endereco).
  Garanta que o acesso ao banco e aos backups siga as politicas de protecao de dados da empresa.
- **Senhas**: armazenadas com hash BCrypt, nunca em texto puro.
- **Tokens JWT**: expiram em 10h por padrao (configuravel). Nao ha refresh token — o usuario faz
  login novamente ao expirar.
- **Fuso horario**: o backend usa o horario `America/Sao_Paulo` para tudo, e os campos de hora no
  frontend usam o horario local do navegador.
- **Edicao/exclusao de registros de visitantes** e restrita a administradores; qualquer usuario
  logado pode registrar entrada e concluir saida.
- **Testes**: a suite E2E (`e2e/`, Playwright) cobre os fluxos principais ponta-a-ponta e roda no
  CI a cada push/PR. O projeto ainda nao tem testes unitarios/integracao do backend
  (`backend/src/test`) — bom proximo passo antes de expandir o sistema.

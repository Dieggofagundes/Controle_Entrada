# Testes E2E - Controle de Entrada CAEMA

Suite de testes ponta-a-ponta (Playwright) que exercita o sistema real: frontend (React) +
backend (Spring Boot) + Postgres, sem mocks. Cobre os fluxos principais:

- **auth.spec.ts**: redirecionamento quando nao autenticado, login valido/invalido, logout.
- **cadastro-e-aprovacao.spec.ts**: solicitacao de cadastro publica, bloqueio de login enquanto
  pendente, aprovacao/rejeicao pelo admin.
- **plantao.spec.ts**: abrir e concluir plantao de servico, regra de "um plantao aberto por vez".
- **visitantes.spec.ts**: registrar entrada/saida de visitante, validacao de CPF invalido.
- **admin-usuarios.spec.ts**: admin cria usuario diretamente, reseta senha, inativa acesso.
- **fuso-horario.spec.ts**: confirma que os horarios gravados pela API (horaEntrada, horaAssuncao)
  correspondem ao horario real de Brasilia, e nao ao fuso do host onde o backend roda.

Os testes usam matriculas geradas com timestamp (`matriculaUnica`) para nao colidir entre
execucoes, e podem rodar contra qualquer banco (local ou de CI) sem precisar de reset manual.

## Rodando localmente

Pre-requisito: backend e frontend rodando (veja o README principal, secao 3):

```bash
# Terminal 1 - banco
docker compose up -d          # ou um Postgres local na porta 5432

# Terminal 2 - backend
cd ../backend && mvn spring-boot:run

# Terminal 3 - frontend
cd ../frontend && npm install && npm run dev
```

Com os dois no ar (`http://localhost:8080` e `http://localhost:5173`):

```bash
cd e2e
npm install
npx playwright install --with-deps chromium   # so na primeira vez
npm test              # roda tudo, headless
npm run test:headed   # ve o navegador rodando
npm run test:ui       # modo interativo do Playwright
```

Para rodar contra URLs diferentes (ex: ambiente de staging), sobrescreva as variaveis:

```bash
E2E_BASE_URL=https://meu-frontend.netlify.app \
E2E_API_URL=https://meu-backend.fly.dev/api \
E2E_ADMIN_MATRICULA=admin \
E2E_ADMIN_SENHA=minhasenha \
npm test
```

**Cuidado**: os testes criam e aprovam usuarios de verdade. So aponte `E2E_BASE_URL`/`E2E_API_URL`
para um ambiente de teste/staging, nunca direto para producao com dados reais.

## CI (GitHub Actions)

O workflow `.github/workflows/controle-entrada-caema-e2e.yml` (na raiz do repositorio) roda essa
suite automaticamente a cada push/PR que toque neste projeto: sobe um Postgres de servico, builda
e inicia o backend real (`mvn package` + `java -jar`), builda e serve o frontend (`vite preview`),
e so entao roda `npm test` aqui. O relatorio HTML do Playwright fica disponivel como artefato do
job em caso de falha.

Isso existe porque builds de Java (Maven Central) nem sempre estao acessiveis em todo ambiente de
desenvolvimento/sandbox - o CI e onde a suite roda de forma garantida contra o stack completo.

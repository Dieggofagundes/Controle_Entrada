import { defineConfig, devices } from '@playwright/test'

/**
 * Config dos testes E2E do Controle de Entrada CAEMA.
 *
 * Pressupoe que o frontend (Vite) e o backend (Spring Boot) ja estao rodando:
 *   - Backend:  cd backend && mvn spring-boot:run          (http://localhost:8080)
 *   - Frontend: cd frontend && npm run dev                  (http://localhost:5173)
 *
 * As URLs podem ser sobrescritas via variaveis de ambiente, o que e usado no
 * workflow de CI (.github/workflows/e2e.yml).
 */
const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:5173'

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['list']] : 'list',
  timeout: 30_000,
  expect: { timeout: 8_000 },

  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})

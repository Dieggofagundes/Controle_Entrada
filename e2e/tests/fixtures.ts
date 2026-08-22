import { test as base, expect, type APIRequestContext } from '@playwright/test'

export const API_URL = process.env.E2E_API_URL ?? 'http://localhost:8080/api'

export const ADMIN_MATRICULA = process.env.E2E_ADMIN_MATRICULA ?? 'admin'
export const ADMIN_SENHA = process.env.E2E_ADMIN_SENHA ?? 'admin123'

/** Gera uma matricula unica por execucao para nao colidir entre testes/execucoes. */
export function matriculaUnica(prefixo: string): string {
  return `${prefixo}-${Date.now()}-${Math.floor(Math.random() * 10_000)}`
}

/**
 * Faz login via API (mais rapido/estavel que preencher o formulario) e devolve o token.
 * Usado apenas para *preparar* estado de teste (ex: criar/aprovar usuarios) - os fluxos
 * que sao o objeto do teste em si continuam sendo exercitados pela UI.
 */
export async function loginApi(request: APIRequestContext, matricula: string, senha: string): Promise<string> {
  const resposta = await request.post(`${API_URL}/auth/login`, {
    data: { matricula, senha },
  })
  expect(resposta.ok(), `login via API falhou para ${matricula}: ${await resposta.text()}`).toBeTruthy()
  const corpo = await resposta.json()
  return corpo.token as string
}

export async function loginAdminApi(request: APIRequestContext): Promise<string> {
  return loginApi(request, ADMIN_MATRICULA, ADMIN_SENHA)
}

interface NovoUsuarioApi {
  matricula: string
  senha: string
  nomeCompleto: string
  nomeGuerra: string
  funcao?: string
  perfil?: 'ADMIN' | 'USUARIO'
}

/** Cria um usuario ja ATIVO diretamente via API de admin, pronto para logar. */
export async function criarUsuarioAtivoApi(
  request: APIRequestContext,
  adminToken: string,
  dados: NovoUsuarioApi,
): Promise<{ id: string }> {
  const resposta = await request.post(`${API_URL}/admin/usuarios`, {
    headers: { Authorization: `Bearer ${adminToken}` },
    data: {
      matricula: dados.matricula,
      senha: dados.senha,
      nomeCompleto: dados.nomeCompleto,
      nomeGuerra: dados.nomeGuerra,
      funcao: dados.funcao ?? 'GUARDA',
      perfil: dados.perfil ?? 'USUARIO',
    },
  })
  expect(resposta.ok(), `criacao de usuario via API falhou: ${await resposta.text()}`).toBeTruthy()
  return resposta.json()
}

/** Garante que o usuario logado (pelo token) nao tem plantao em aberto, concluindo-o se houver. */
export async function encerrarPlantaoAbertoApi(request: APIRequestContext, token: string): Promise<void> {
  const atual = await request.get(`${API_URL}/plantoes/atual`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (atual.status() === 200) {
    const plantao = await atual.json()
    await request.put(`${API_URL}/plantoes/${plantao.id}/concluir`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {},
    })
  }
}

/** Faz login pela UI de verdade, preenchendo o formulario (para os testes que validam o fluxo real). */
export async function logarPelaUI(page: import('@playwright/test').Page, matricula: string, senha: string) {
  await page.goto('/login')
  await page.getByLabel('Matricula').fill(matricula)
  await page.getByLabel('Senha').fill(senha)
  await page.getByRole('button', { name: 'Entrar' }).click()
}

export const test = base
export { expect }

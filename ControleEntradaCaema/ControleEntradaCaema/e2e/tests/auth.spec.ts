import { test, expect } from './fixtures'
import { ADMIN_MATRICULA, ADMIN_SENHA, logarPelaUI } from './fixtures'

test.describe('Autenticacao', () => {
  test('visitante nao autenticado e redirecionado para /login', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login$/)
  })

  test('login com credenciais invalidas mostra mensagem de erro', async ({ page }) => {
    await logarPelaUI(page, 'matricula-inexistente', 'senha-errada')
    await expect(page.getByText(/matricula ou senha invalidos/i)).toBeVisible()
    await expect(page).toHaveURL(/\/login$/)
  })

  test('login com credenciais validas leva ao painel', async ({ page }) => {
    await logarPelaUI(page, ADMIN_MATRICULA, ADMIN_SENHA)
    await expect(page).toHaveURL('/')
    await expect(page.getByRole('heading', { name: /^Ola,/ })).toBeVisible()
  })

  test('sair encerra a sessao e volta para o login', async ({ page }) => {
    await logarPelaUI(page, ADMIN_MATRICULA, ADMIN_SENHA)
    await expect(page).toHaveURL('/')

    await page.getByRole('button', { name: 'Sair' }).first().click()
    await expect(page).toHaveURL(/\/login$/)

    // Garante que a sessao realmente caiu: recarregar nao deve manter o usuario logado.
    await page.goto('/')
    await expect(page).toHaveURL(/\/login$/)
  })
})

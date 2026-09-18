import { test, expect, ADMIN_MATRICULA, ADMIN_SENHA, matriculaUnica, logarPelaUI } from './fixtures'

test.describe('Solicitacao de cadastro e aprovacao pelo admin', () => {
  test('usuario solicita cadastro, admin aprova, e o usuario consegue logar', async ({ page }) => {
    const matricula = matriculaUnica('e2e-cad')
    const senha = 'SenhaForte123'
    const nomeCompleto = `Fulano de Teste ${matricula}`
    const nomeGuerra = 'FULANO'

    // 1. Solicita cadastro pela tela publica de login.
    await page.goto('/login')
    await page.getByRole('link', { name: 'Solicitar cadastro' }).click()
    await expect(page).toHaveURL(/\/cadastrar$/)

    await page.getByLabel('Nome completo').fill(nomeCompleto)
    await page.getByLabel('Nome de guerra').fill(nomeGuerra)
    await page.getByLabel('Matricula').fill(matricula)
    await page.getByLabel('Senha', { exact: true }).fill(senha)
    await page.getByLabel('Confirmar senha').fill(senha)
    await page.getByRole('button', { name: 'Enviar solicitacao' }).click()

    await expect(page).toHaveURL(/\/solicitacao-enviada$/)

    // Enquanto pendente, o login deve ser bloqueado (403 - cadastro nao aprovado).
    await logarPelaUI(page, matricula, senha)
    await expect(page.getByText(/nao foi aprovado|bloqueado/i)).toBeVisible()

    // 2. Admin aprova a solicitacao.
    await logarPelaUI(page, ADMIN_MATRICULA, ADMIN_SENHA)
    await expect(page).toHaveURL('/')

    await page.goto('/admin/usuarios')
    // Seletor de classes preciso: pega o cartao-folha do usuario pendente, nao um <div>
    // ancestral generico (que tambem "contem" o texto da matricula por conter o cartao).
    const cartaoPendente = page.locator('div.card.flex.flex-col.gap-3.p-4', { hasText: matricula })
    await expect(cartaoPendente).toBeVisible()
    await cartaoPendente.getByTitle('Aprovar').click()

    await expect(page.getByText(`${nomeGuerra} aprovado(a) com sucesso.`)).toBeVisible()
    await expect(cartaoPendente).toHaveCount(0)

    await page.getByRole('button', { name: 'Sair' }).first().click()
    await expect(page).toHaveURL(/\/login$/)

    // 3. O usuario recem-aprovado agora consegue logar normalmente.
    await logarPelaUI(page, matricula, senha)
    await expect(page).toHaveURL('/')
    await expect(page.getByRole('heading', { name: `Ola, ${nomeGuerra}` })).toBeVisible()
  })

  test('admin pode rejeitar uma solicitacao pendente', async ({ page }) => {
    const matricula = matriculaUnica('e2e-rej')
    const senha = 'SenhaForte123'
    const nomeGuerra = 'REJEITADO'

    await page.goto('/cadastrar')
    await page.getByLabel('Nome completo').fill(`Pessoa Rejeitada ${matricula}`)
    await page.getByLabel('Nome de guerra').fill(nomeGuerra)
    await page.getByLabel('Matricula').fill(matricula)
    await page.getByLabel('Senha', { exact: true }).fill(senha)
    await page.getByLabel('Confirmar senha').fill(senha)
    await page.getByRole('button', { name: 'Enviar solicitacao' }).click()
    await expect(page).toHaveURL(/\/solicitacao-enviada$/)

    await logarPelaUI(page, ADMIN_MATRICULA, ADMIN_SENHA)
    await expect(page).toHaveURL('/')
    await page.goto('/admin/usuarios')

    page.once('dialog', (dialog) => dialog.accept())
    const cartaoPendente = page.locator('div.card.flex.flex-col.gap-3.p-4', { hasText: matricula })
    await cartaoPendente.getByTitle('Rejeitar').click()

    await expect(page.getByText('Solicitacao rejeitada.')).toBeVisible()

    await page.getByRole('button', { name: 'Sair' }).first().click()
    await logarPelaUI(page, matricula, senha)
    await expect(page.getByText(/nao foi aprovado|bloqueado/i)).toBeVisible()
  })
})

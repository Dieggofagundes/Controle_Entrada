import { test, expect, ADMIN_MATRICULA, ADMIN_SENHA, matriculaUnica, logarPelaUI } from './fixtures'

test.describe('Gestao de usuarios pelo admin', () => {
  test('admin cria usuario diretamente, reseta senha e inativa/reativa', async ({ page }) => {
    const matricula = matriculaUnica('e2e-admcrud')
    const senhaInicial = 'SenhaInicial123'
    const novaSenha = 'SenhaNova456'
    const nomeCompleto = `Usuario Criado Direto ${matricula}`
    const nomeGuerra = 'DIRETO'

    await logarPelaUI(page, ADMIN_MATRICULA, ADMIN_SENHA)
    await page.goto('/admin/usuarios')

    await page.getByRole('button', { name: 'Novo usuario' }).click()
    const dialogCriar = page.getByRole('dialog', { name: 'Novo usuario' })
    await dialogCriar.getByLabel('Nome completo').fill(nomeCompleto)
    await dialogCriar.getByLabel('Nome de guerra').fill(nomeGuerra)
    await dialogCriar.getByLabel('Matricula').fill(matricula)
    await dialogCriar.getByLabel('Senha inicial').fill(senhaInicial)
    await dialogCriar.getByRole('button', { name: 'Criar usuario' }).click()

    await expect(page.getByText('Usuario criado com sucesso.')).toBeVisible()

    const linhaUsuario = page.locator('div.flex.flex-col.gap-3.p-4', { hasText: matricula })
    await expect(linhaUsuario).toBeVisible()

    // O usuario recem-criado ja pode logar imediatamente (fica ATIVO).
    await page.getByRole('button', { name: 'Sair' }).first().click()
    await logarPelaUI(page, matricula, senhaInicial)
    await expect(page).toHaveURL('/')
    await page.getByRole('button', { name: 'Sair' }).first().click()

    // Admin reseta a senha do usuario.
    await logarPelaUI(page, ADMIN_MATRICULA, ADMIN_SENHA)
    await page.goto('/admin/usuarios')
    const linha = page.locator('div.flex.flex-col.gap-3.p-4', { hasText: matricula })
    await linha.getByTitle('Resetar senha').click()
    const dialogSenha = page.getByRole('dialog', { name: 'Resetar senha' })
    await dialogSenha.getByLabel('Nova senha').fill(novaSenha)
    await dialogSenha.getByRole('button', { name: 'Redefinir senha' }).click()
    await expect(page.getByText(`Senha de ${nomeGuerra} redefinida com sucesso.`)).toBeVisible()

    await page.getByRole('button', { name: 'Sair' }).first().click()
    await logarPelaUI(page, matricula, novaSenha)
    await expect(page).toHaveURL('/')
    await page.getByRole('button', { name: 'Sair' }).first().click()

    // Admin inativa o usuario; login deve passar a ser bloqueado.
    await logarPelaUI(page, ADMIN_MATRICULA, ADMIN_SENHA)
    await page.goto('/admin/usuarios')
    const linha2 = page.locator('div.flex.flex-col.gap-3.p-4', { hasText: matricula })
    await linha2.getByTitle('Inativar').click()
    await expect(page.getByText(`${nomeGuerra} agora esta inativo.`)).toBeVisible()

    await page.getByRole('button', { name: 'Sair' }).first().click()
    await logarPelaUI(page, matricula, novaSenha)
    await expect(page.getByText(/nao foi aprovado|bloqueado/i)).toBeVisible()
  })
})

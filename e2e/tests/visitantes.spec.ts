import {
  test,
  expect,
  loginAdminApi,
  criarUsuarioAtivoApi,
  matriculaUnica,
  logarPelaUI,
} from './fixtures'

test.describe('Controle de visitantes', () => {
  test('registra entrada e saida de um visitante', async ({ page, request }) => {
    const matricula = matriculaUnica('e2e-vis')
    const senha = 'SenhaForte123'
    const nomeGuerra = 'PORTEIRO'

    const adminToken = await loginAdminApi(request)
    await criarUsuarioAtivoApi(request, adminToken, {
      matricula,
      senha,
      nomeCompleto: `Usuario Visitantes ${matricula}`,
      nomeGuerra,
      funcao: 'GUARDA',
    })

    await logarPelaUI(page, matricula, senha)
    await expect(page).toHaveURL('/')
    await page.goto('/visitantes')

    const nomeVisitante = `Visitante Teste ${Date.now()}`

    await page.getByRole('button', { name: 'Registrar entrada' }).click()
    const dialog = page.getByRole('dialog', { name: 'Registrar entrada de visitante' })
    await expect(dialog).toBeVisible()

    await dialog.getByLabel('Nome do visitante').fill(nomeVisitante)
    await dialog.getByLabel('CPF').fill('123.456.789-09')
    await dialog.getByLabel('Local da visita').fill('Portaria principal')
    await dialog.getByLabel('Numero do cracha').fill('V-001')
    await dialog.getByRole('button', { name: 'Registrar entrada' }).click()

    await expect(page.getByText('Entrada registrada com sucesso.')).toBeVisible()

    // Seletor de classes preciso: pega o cartao-folha do visitante, nao um <div> ancestral
    // generico (que tambem "contem" o texto por conter o cartao dentro dele).
    const cartaoVisitante = page.locator('div.card.flex.flex-col.gap-4.p-4', { hasText: nomeVisitante })
    await expect(cartaoVisitante).toBeVisible()
    await expect(cartaoVisitante.getByText('Em aberto')).toBeVisible()

    await cartaoVisitante.getByRole('button', { name: 'Registrar saida' }).click()
    const dialogSaida = page.getByRole('dialog', { name: 'Registrar saida' })
    await expect(dialogSaida).toBeVisible()
    await dialogSaida.getByRole('button', { name: 'Confirmar saida' }).click()

    await expect(page.getByText('Saida registrada com sucesso.')).toBeVisible()

    // O visitante concluido some da aba "Em aberto" (padrao) e aparece em "Todos".
    await expect(page.locator('div.card.flex.flex-col.gap-4.p-4', { hasText: nomeVisitante })).toHaveCount(0)
    await page.getByRole('button', { name: 'Todos' }).click()
    const cartaoConcluido = page.locator('div.card.flex.flex-col.gap-4.p-4', { hasText: nomeVisitante })
    await expect(cartaoConcluido).toBeVisible()
    await expect(cartaoConcluido.getByText('Concluido')).toBeVisible()
  })

  test('CPF incompleto e rejeitado pela validacao do backend', async ({ page, request }) => {
    const matricula = matriculaUnica('e2e-vis-cpf')
    const senha = 'SenhaForte123'

    const adminToken = await loginAdminApi(request)
    await criarUsuarioAtivoApi(request, adminToken, {
      matricula,
      senha,
      nomeCompleto: `Usuario CPF Invalido ${matricula}`,
      nomeGuerra: 'CPFINVAL',
      funcao: 'GUARDA',
    })

    await logarPelaUI(page, matricula, senha)
    await expect(page).toHaveURL('/')
    await page.goto('/visitantes')

    await page.getByRole('button', { name: 'Registrar entrada' }).click()
    const dialog = page.getByRole('dialog', { name: 'Registrar entrada de visitante' })

    await dialog.getByLabel('Nome do visitante').fill('Visitante CPF Invalido')
    // "123" tem poucos digitos para formar um CPF (a mascara do campo so pontua a partir do
    // 4o digito), entao passa pela validacao "required" do HTML mas falha no @Pattern do backend.
    await dialog.getByLabel('CPF').fill('123')
    await dialog.getByLabel('Local da visita').fill('Portaria principal')
    await dialog.getByRole('button', { name: 'Registrar entrada' }).click()

    await expect(page.getByText('Verifique os campos informados')).toBeVisible()
  })
})

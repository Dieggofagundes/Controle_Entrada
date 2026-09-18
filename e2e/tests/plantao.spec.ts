import {
  test,
  expect,
  loginAdminApi,
  loginApi,
  criarUsuarioAtivoApi,
  matriculaUnica,
  logarPelaUI,
  API_URL,
} from './fixtures'

test.describe('Plantao de servico', () => {
  test('usuario abre e conclui um plantao pela UI, e nao pode abrir dois ao mesmo tempo', async ({ page, request }) => {
    const matricula = matriculaUnica('e2e-plantao')
    const senha = 'SenhaForte123'
    const nomeGuerra = 'PLANTAO'

    const adminToken = await loginAdminApi(request)
    await criarUsuarioAtivoApi(request, adminToken, {
      matricula,
      senha,
      nomeCompleto: `Usuario Plantao ${matricula}`,
      nomeGuerra,
      funcao: 'GUARDA',
    })

    await logarPelaUI(page, matricula, senha)
    await expect(page).toHaveURL('/')

    // Nenhum plantao em aberto ainda.
    await expect(page.getByText('Voce nao tem nenhum plantao em aberto no momento.')).toBeVisible()

    await page.getByLabel('Funcao').selectOption('GUARDA')
    await page.getByRole('button', { name: 'Iniciar plantao' }).click()

    await expect(page.getByText('Plantao iniciado com sucesso.')).toBeVisible()
    await expect(page.getByText('Em servico')).toBeVisible()

    // A regra "um plantao aberto por vez" tambem e validada diretamente na API,
    // reforcando que a UI nao esconde uma falha do backend.
    const token = await loginApi(request, matricula, senha)
    const respostaSegundoPlantao = await request.post(`${API_URL}/plantoes`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { funcao: 'GUARDA' },
    })
    expect(respostaSegundoPlantao.status()).toBe(400)

    await page.getByRole('button', { name: 'Concluir servico' }).click()
    await expect(page.getByText('Plantao concluido com sucesso.')).toBeVisible()
    // exact:true evita casar com o toast acima, que tambem contem "concluido" como substring.
    await expect(page.getByText('Concluido', { exact: true })).toBeVisible()
  })
})

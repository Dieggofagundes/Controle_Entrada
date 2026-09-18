import { test, expect, loginAdminApi, loginApi, criarUsuarioAtivoApi, matriculaUnica, API_URL } from './fixtures'

/**
 * Horario de Brasilia (America/Sao_Paulo) e UTC-3 fixo (sem horario de verao desde 2019).
 *
 * Os campos de data/hora da API (horaEntrada, horaAssuncao, ...) sao `LocalDateTime`: uma
 * string sem informacao de fuso (ex: "2026-09-18T14:32:10"). O valor literal precisa
 * corresponder ao horario local de Brasilia no momento do registro.
 *
 * Para verificar isso sem depender do fuso horario da maquina que roda o teste (o runner do
 * CI, por exemplo, roda em UTC): interpretamos o literal recebido como se fosse um horario de
 * Brasilia (somando 3h para chegar ao instante UTC equivalente) e comparamos com o instante
 * real (`Date.now()`, que independe de fuso). Se o backend estiver gravando em UTC em vez de
 * Brasilia (o bug que este teste cobre), a diferenca aparece como ~180 minutos.
 */
function minutosDeDiferencaDoHorarioBrasilia(isoSemFuso: string): number {
  const [dataParte, horaParte] = isoSemFuso.split('T')
  const [ano, mes, dia] = dataParte.split('-').map(Number)
  const [hora, minuto, segundo] = horaParte.split(':').map(Number)
  const instanteComoBrasilia = Date.UTC(ano, mes - 1, dia, hora, minuto, segundo || 0) + 3 * 60 * 60 * 1000
  return Math.abs(instanteComoBrasilia - Date.now()) / 60_000
}

test.describe('Fuso horario (Brasilia)', () => {
  test('horaEntrada de um novo registro de visitante reflete o horario de Brasilia', async ({ request }) => {
    const matricula = matriculaUnica('e2e-tz-vis')
    const senha = 'SenhaForte123'

    const adminToken = await loginAdminApi(request)
    await criarUsuarioAtivoApi(request, adminToken, {
      matricula,
      senha,
      nomeCompleto: `Usuario Fuso Horario ${matricula}`,
      nomeGuerra: 'FUSOVIS',
      funcao: 'GUARDA',
    })
    const token = await loginApi(request, matricula, senha)

    // Nao envia horaEntrada: o backend deve preenche-la com LocalDateTime.now().
    const resposta = await request.post(`${API_URL}/registros`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        nomeVisitante: `Visitante Fuso ${matricula}`,
        cpf: '123.456.789-09',
        localVisita: 'Portaria principal',
      },
    })
    expect(resposta.ok(), `registro de entrada falhou: ${await resposta.text()}`).toBeTruthy()
    const corpo = await resposta.json()

    const diferenca = minutosDeDiferencaDoHorarioBrasilia(corpo.horaEntrada)
    expect(
      diferenca,
      `horaEntrada "${corpo.horaEntrada}" nao corresponde ao horario atual de Brasilia ` +
        `(diferenca de ${diferenca.toFixed(1)} min - o servidor pode estar gravando em UTC ou outro fuso)`,
    ).toBeLessThan(5)
  })

  test('horaAssuncao de um plantao aberto agora reflete o horario de Brasilia', async ({ request }) => {
    const matricula = matriculaUnica('e2e-tz-plt')
    const senha = 'SenhaForte123'

    const adminToken = await loginAdminApi(request)
    await criarUsuarioAtivoApi(request, adminToken, {
      matricula,
      senha,
      nomeCompleto: `Usuario Fuso Plantao ${matricula}`,
      nomeGuerra: 'FUSOPLT',
      funcao: 'GUARDA',
    })
    const token = await loginApi(request, matricula, senha)

    // Nao envia horaAssuncao: o backend deve preenche-la com LocalDateTime.now().
    const resposta = await request.post(`${API_URL}/plantoes`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { funcao: 'GUARDA' },
    })
    expect(resposta.ok(), `abertura de plantao falhou: ${await resposta.text()}`).toBeTruthy()
    const corpo = await resposta.json()

    const diferenca = minutosDeDiferencaDoHorarioBrasilia(corpo.horaAssuncao)
    expect(
      diferenca,
      `horaAssuncao "${corpo.horaAssuncao}" nao corresponde ao horario atual de Brasilia ` +
        `(diferenca de ${diferenca.toFixed(1)} min - o servidor pode estar gravando em UTC ou outro fuso)`,
    ).toBeLessThan(5)
  })
})

// Gera a base ficticia de 1.247 chamados do painel demonstrativo

import { writeFileSync } from 'node:fs'

const ARQUIVO = new URL('../src/data/painel-demonstrativo.json', import.meta.url)
const SEMENTE = 20250930

function criarSorteador(semente) {
  let estado = semente >>> 0
  return function sortear() {
    estado = (estado + 0x6d2b79f5) >>> 0
    let t = estado
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const sortear = criarSorteador(SEMENTE)

const inteiroEntre = (min, max) => min + Math.floor(sortear() * (max - min + 1))

function embaralhar(lista) {
  const copia = lista.slice()
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(sortear() * (i + 1))
    const temp = copia[i]
    copia[i] = copia[j]
    copia[j] = temp
  }
  return copia
}

function listaDeCotas(cotas) {
  const lista = []
  Object.entries(cotas).forEach(([valor, quantidade]) => {
    for (let i = 0; i < quantidade; i++) lista.push(valor)
  })
  return lista
}

function normalPadrao() {
  const u1 = Math.max(sortear(), 1e-12)
  const u2 = sortear()
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
}

const MESES = [
  { chave: '2025-07', rotulo: 'Jul', dias: 31 },
  { chave: '2025-08', rotulo: 'Ago', dias: 31 },
  { chave: '2025-09', rotulo: 'Set', dias: 30 },
]
const INSTANTE_REFERENCIA = '2025-09-30T18:00'

const STATUS_POR_MES = {
  '2025-07': { aberto: 1, atendimento: 3, supervisor: 10, concluido: 374 },
  '2025-08': { aberto: 1, atendimento: 6, supervisor: 16, concluido: 394 },
  '2025-09': { aberto: 2, atendimento: 12, supervisor: 28, concluido: 400 },
}
const COTAS = {
  prioridade: { critica: 41, alta: 206, media: 597, normal: 403 },
  tipoOcorrencia: { Nivelamento: 312, Porta: 260, 'Painel/comando': 215, Segurança: 178, Comunicação: 134, Outros: 148 },
  regiao: { centro: 274, sul: 374, norte: 200, leste: 212, oeste: 187 },
  reincidencias: 137,
}
const ROTULOS = {
  status: { aberto: 'Aberto', supervisor: 'Aguardando supervisor', atendimento: 'Em atendimento', concluido: 'Concluído' },
  prioridade: { critica: 'Crítica', alta: 'Alta', media: 'Média', normal: 'Normal' },
  regiao: { centro: 'Centro', sul: 'Zona Sul', norte: 'Zona Norte', leste: 'Zona Leste', oeste: 'Zona Oeste' },
}
const PRAZOS_SLA_MIN = { critica: 60, alta: 150, media: 240, normal: 480 }
const METAS = { taMin: 30, tbMin: 120 }

const TA_BASE_MIN = { critica: 12, alta: 20, media: 27, normal: 33 }
const TA_AJUSTE_REGIAO_MIN = { centro: -3, sul: 0, norte: 2, leste: 1, oeste: 5 }
const FATOR_TB = { mediana: 0.4, sigma: 0.55, maximo: 2.0 }
const TB_AJUSTE_REGIAO = { centro: 0.95, sul: 1.0, norte: 1.03, leste: 1.0, oeste: 1.1 }
const PESO_REINCIDENCIA = { Nivelamento: 2.0, Porta: 1.6, 'Painel/comando': 1.0, Segurança: 0.6, Comunicação: 0.6, Outros: 0.5 }

const EQUIPES = {
  centro: {
    tecnicos: ['Ana Ribeiro', 'Bruno Castro', 'Carla Mota', 'Diego Prado', 'Elisa Fontes', 'Fábio Lemos', 'Gisele Moura', 'Hugo Siqueira', 'Íris Tavares', 'João Vidal'],
    supervisores: ['Helena Duarte', 'Marcos Antunes'],
  },
  sul: {
    tecnicos: ['Karina Lopes', 'Leandro Nunes', 'Mariana Pires', 'Nelson Queiroz', 'Olívia Rezende', 'Pedro Salles', 'Quésia Torres', 'Rafael Uchôa', 'Sabrina Vieira', 'Tiago Xavier', 'Úrsula Zanetti', 'Vítor Amaral'],
    supervisores: ['Rafaela Pires', 'Sérgio Bastos'],
  },
  norte: {
    tecnicos: ['Wagner Barros', 'Yasmin Correia', 'Zeca Dantas', 'Aline Esteves', 'Breno Farias', 'Cíntia Gomes', 'Davi Holanda'],
    supervisores: ['Patrícia Leal'],
  },
  leste: {
    tecnicos: ['Eduardo Inácio', 'Flávia Jardim', 'Gustavo Klein', 'Heloísa Lacerda', 'Igor Macedo', 'Júlia Neves', 'Kléber Otoni', 'Lívia Paiva'],
    supervisores: ['Renato Quintana'],
  },
  oeste: {
    tecnicos: ['Mateus Ramos', 'Natália Sampaio', 'Otávio Teles', 'Paula Urbano', 'Ricardo Valente', 'Simone Werneck', 'Túlio Yamada'],
    supervisores: ['Vera Zampieri'],
  },
}

const ABERTOS_FIXOS = [
  { mes: '2025-09', dia: 30, hora: '17:35', prioridade: 'critica', regiao: 'sul' },
  { mes: '2025-09', dia: 26, hora: '10:20', prioridade: 'alta', regiao: 'centro' },
  { mes: '2025-08', dia: 22, hora: '14:05', prioridade: 'media', regiao: 'leste' },
  { mes: '2025-07', dia: 18, hora: '09:40', prioridade: 'normal', regiao: 'oeste' },
]

const doisDigitos = (n) => String(n).padStart(2, '0')
const paraMinutos = (texto) => Date.parse(texto + ':00Z') / 60000
function deMinutos(minutos) {
  const d = new Date(minutos * 60000)
  return d.getUTCFullYear() + '-' + doisDigitos(d.getUTCMonth() + 1) + '-' + doisDigitos(d.getUTCDate()) + 'T' +
    doisDigitos(d.getUTCHours()) + ':' + doisDigitos(d.getUTCMinutes())
}
const REFERENCIA_MIN = paraMinutos(INSTANTE_REFERENCIA)

function dataNoMes(mes) {
  const info = MESES.find((m) => m.chave === mes)
  return mes + '-' + doisDigitos(inteiroEntre(1, info.dias)) + 'T' + doisDigitos(inteiroEntre(7, 19)) + ':' + doisDigitos(inteiroEntre(0, 59))
}

const vagas = []
ABERTOS_FIXOS.forEach((a) => vagas.push({ mes: a.mes, status: 'aberto', fixo: a }))
MESES.forEach((m) => {
  ;['atendimento', 'supervisor', 'concluido'].forEach((status) => {
    for (let i = 0; i < STATUS_POR_MES[m.chave][status]; i++) vagas.push({ mes: m.chave, status })
  })
})

function cotasSemFixos(campo) {
  const cotas = { ...COTAS[campo] }
  ABERTOS_FIXOS.forEach((a) => { cotas[a[campo]] = cotas[a[campo]] - 1 })
  return cotas
}
const filaPrioridade = embaralhar(listaDeCotas(cotasSemFixos('prioridade')))
const filaRegiao = embaralhar(listaDeCotas(cotasSemFixos('regiao')))
const filaTipo = embaralhar(listaDeCotas(COTAS.tipoOcorrencia))

const registros = vagas.map((vaga, indice) => {
  const fixo = vaga.fixo
  return {
    mes: vaga.mes,
    status: vaga.status,
    prioridade: fixo ? fixo.prioridade : filaPrioridade.pop(),
    regiao: fixo ? fixo.regiao : filaRegiao.pop(),
    tipoOcorrencia: filaTipo[indice],
    fixo,
  }
})

const fatorTb = () => Math.min(FATOR_TB.maximo, FATOR_TB.mediana * Math.exp(FATOR_TB.sigma * normalPadrao()))
const sortearTa = (r) => Math.max(5, Math.round(TA_BASE_MIN[r.prioridade] * (0.6 + 0.8 * sortear()) + TA_AJUSTE_REGIAO_MIN[r.regiao]))
const escolher = (lista) => lista[Math.floor(sortear() * lista.length)]

registros.forEach((r) => {
  const equipe = EQUIPES[r.regiao]
  if (r.fixo) {
    r.dataAbertura = r.mes + '-' + doisDigitos(r.fixo.dia) + 'T' + r.fixo.hora
  } else {
    r.dataAbertura = dataNoMes(r.mes)
  }

  if (r.status === 'concluido') {
    r.responsavel = 'Téc. ' + escolher(equipe.tecnicos)
    r.tempoChegadaMin = sortearTa(r)
    const tb = Math.round(PRAZOS_SLA_MIN[r.prioridade] * fatorTb() * TB_AJUSTE_REGIAO[r.regiao])
    r.tempoSolucaoMin = Math.max(tb, r.tempoChegadaMin + 5)
    while (paraMinutos(r.dataAbertura) + r.tempoSolucaoMin > REFERENCIA_MIN) {
      r.dataAbertura = deMinutos(paraMinutos(r.dataAbertura) - 24 * 60)
    }
  } else {
    if (r.status === 'atendimento') {
      r.responsavel = 'Téc. ' + escolher(equipe.tecnicos)
      r.tempoChegadaMin = sortearTa(r)
    } else if (r.status === 'supervisor') {
      r.responsavel = 'Sup. ' + escolher(equipe.supervisores)
    } else {
      r.responsavel = '—'
    }
    if (paraMinutos(r.dataAbertura) >= REFERENCIA_MIN) r.dataAbertura = r.mes + '-30T' + doisDigitos(inteiroEntre(7, 16)) + ':' + doisDigitos(inteiroEntre(0, 59))
    if (r.status === 'atendimento' && REFERENCIA_MIN - paraMinutos(r.dataAbertura) <= r.tempoChegadaMin + 10) {
      r.dataAbertura = deMinutos(REFERENCIA_MIN - (r.tempoChegadaMin + 30 + inteiroEntre(0, 90)))
    }
    r.tempoDecorridoMin = REFERENCIA_MIN - paraMinutos(r.dataAbertura)
  }
})

registros
  .map((r) => ({ r, chave: Math.pow(sortear(), 1 / PESO_REINCIDENCIA[r.tipoOcorrencia]) }))
  .sort((a, b) => b.chave - a.chave)
  .slice(0, COTAS.reincidencias)
  .forEach((item) => { item.r.reincidencia = true })

registros.sort((a, b) => (a.dataAbertura < b.dataAbertura ? -1 : a.dataAbertura > b.dataAbertura ? 1 : 0))
const chamados = registros.map((r, i) => {
  const saida = {
    id: 'PD-' + String(i + 1).padStart(6, '0'),
    dataAbertura: r.dataAbertura,
    status: r.status,
    prioridade: r.prioridade,
    regiao: r.regiao,
    tipoOcorrencia: r.tipoOcorrencia,
    responsavel: r.responsavel,
  }
  if (r.tempoChegadaMin !== undefined) saida.tempoChegadaMin = r.tempoChegadaMin
  if (r.tempoSolucaoMin !== undefined) saida.tempoSolucaoMin = r.tempoSolucaoMin
  if (r.tempoDecorridoMin !== undefined) saida.tempoDecorridoMin = r.tempoDecorridoMin
  if (r.reincidencia) saida.reincidencia = true
  return saida
})

const erros = []
const exigir = (condicao, mensagem) => { if (!condicao) erros.push(mensagem) }
const contar = (campo) => { const m = {}; chamados.forEach((c) => { m[c[campo]] = (m[c[campo]] || 0) + 1 }); return m }
const igual = (a, b) => JSON.stringify(Object.entries(a).sort()) === JSON.stringify(Object.entries(b).sort())

exigir(chamados.length === 1247, 'total deve ser 1.247')
exigir(new Set(chamados.map((c) => c.id)).size === chamados.length, 'IDs repetidos')
exigir(igual(contar('prioridade'), COTAS.prioridade), 'cota de prioridade')
exigir(igual(contar('regiao'), COTAS.regiao), 'cota de regiao')
exigir(igual(contar('tipoOcorrencia'), COTAS.tipoOcorrencia), 'cota de tipo')
exigir(chamados.filter((c) => c.reincidencia).length === COTAS.reincidencias, 'cota de reincidencias')
MESES.forEach((m) => {
  const doMes = chamados.filter((c) => c.dataAbertura.slice(0, 7) === m.chave)
  Object.entries(STATUS_POR_MES[m.chave]).forEach(([status, qtd]) => {
    exigir(doMes.filter((c) => c.status === status).length === qtd, 'cota ' + m.chave + ' ' + status)
  })
})
chamados.forEach((c) => {
  const abertura = paraMinutos(c.dataAbertura)
  const equipe = EQUIPES[c.regiao]
  exigir(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(c.dataAbertura) && c.dataAbertura >= '2025-07-01' && abertura < REFERENCIA_MIN, c.id + ' data fora do periodo')
  if (c.status === 'concluido') {
    exigir(c.tempoChegadaMin > 0 && c.tempoSolucaoMin > c.tempoChegadaMin && c.tempoDecorridoMin === undefined, c.id + ' tempos de concluido')
    exigir(abertura + c.tempoSolucaoMin <= REFERENCIA_MIN, c.id + ' solucao depois da referencia')
  } else {
    exigir(c.tempoSolucaoMin === undefined && c.tempoDecorridoMin === REFERENCIA_MIN - abertura && c.tempoDecorridoMin > 0, c.id + ' decorrido incoerente')
  }
  if (c.status === 'atendimento') exigir(c.tempoChegadaMin > 0 && c.tempoChegadaMin < c.tempoDecorridoMin, c.id + ' TA de atendimento')
  if (c.status === 'aberto' || c.status === 'supervisor') exigir(c.tempoChegadaMin === undefined, c.id + ' nao deveria ter TA')
  if (c.status === 'aberto') exigir(c.responsavel === '—', c.id + ' aberto com responsavel')
  if (c.status === 'supervisor') exigir(equipe.supervisores.includes(c.responsavel.replace('Sup. ', '')), c.id + ' supervisor de outra regiao')
  if (c.status === 'atendimento' || c.status === 'concluido') exigir(equipe.tecnicos.includes(c.responsavel.replace('Téc. ', '')), c.id + ' tecnico de outra regiao')
})
exigir(chamados.some((c) => c.status === 'aberto' && c.prioridade === 'critica' && c.regiao === 'sul'), 'exemplo Aberto + Critica + Zona Sul')

if (erros.length > 0) {
  console.error('Base NAO gerada. Falhas:\n- ' + erros.slice(0, 20).join('\n- '))
  process.exit(1)
}

const documentacao = {
  tipo: 'demonstrativo',
  aviso: 'Registros FICTÍCIOS, gerados para demonstrar o funcionamento dos filtros, indicadores e gráficos do Painel Operacional. Não representam chamados reais nem a operação consolidada.',
  criadoEm: '2026-11-25',
  universo: 'Base demonstrativa do Painel Operacional: 1.247 chamados (julho a setembro de 2025)',
  independencia: 'Base independente de chamados-mobile.json (7), chamados-backoffice.json (12) e insights.json (indicadores consolidados). IDs com prefixo PD- para não serem confundidos com os chamados CH-.',
  periodo: { inicio: '2025-07-01', fim: '2025-09-30', meses: MESES.map((m) => ({ chave: m.chave, rotulo: m.rotulo })), instanteReferencia: INSTANTE_REFERENCIA },
  rotulos: ROTULOS,
  prazosSlaMin: PRAZOS_SLA_MIN,
  metas: METAS,
  naturezaDosParametros: 'Prazos de SLA, metas de TA/TB, equipes, pesos e fatores são REGRAS ASSUMIDAS para esta base demonstrativa. Não são parâmetros oficiais nem universais da operação.',
  criteriosDeCalculo: {
    slaPercentual: 'SLA (%) = (tempo utilizado / prazo de SLA da prioridade) × 100. Tempo utilizado: tempoSolucaoMin (concluído) ou tempoDecorridoMin (aberto, aguardando supervisor, em atendimento). Calculado em src/utils/sla.js; não é armazenado.',
    classificacaoSla: 'No prazo: consumo ≤ 70%. Em risco: consumo > 70% e < 100%. Estourado: consumo ≥ 100%. Indeterminado: sem tempo utilizado ou sem prazo. A classificação é sempre calculada, nunca imposta por cota.',
    taMedio: 'Média de tempoChegadaMin somente dos registros que possuem o campo.',
    tbMedio: 'Média de tempoSolucaoMin somente dos concluídos que possuem o campo.',
    reincidencia: 'Reincidentes são um SUBCONJUNTO dos chamados (nunca somados novamente ao total).',
    ausentes: 'Campos que não se aplicam são OMITIDOS do registro e tratados como ausentes (nunca como zero).',
  },
  regrasDePreenchimento: [
    'dataAbertura no formato AAAA-MM-DDTHH:MM, anterior ao instante de referência (30/09/2025 18:00).',
    'Concluído: tempoChegadaMin e tempoSolucaoMin (TA < TB); abertura + TB ≤ instante de referência; sem tempoDecorridoMin.',
    'Em atendimento: tempoChegadaMin < tempoDecorridoMin; sem tempoSolucaoMin.',
    'Aguardando supervisor e Aberto: sem tempoChegadaMin e sem tempoSolucaoMin.',
    'Não concluídos: tempoDecorridoMin = instante de referência − dataAbertura (minutos exatos).',
    'Responsáveis sempre da equipe da própria região: técnico (Em atendimento, Concluído), supervisor (Aguardando supervisor); Aberto sem responsável (—).',
  ],
  geracao: {
    script: 'scripts/gerar-painel-demonstrativo.mjs',
    semente: SEMENTE,
    metodo: 'Gerador pseudoaleatório com semente fixa (determinístico); cotas exatas por dimensão; cada registro montado individualmente; validação completa antes de gravar.',
    tempoChegada: { baseMinPorPrioridade: TA_BASE_MIN, ajusteMinPorRegiao: TA_AJUSTE_REGIAO_MIN, variacao: '60% a 140% da base; mínimo 5 min' },
    tempoSolucao: { formula: 'prazo da prioridade × fator f × ajuste da região; mínimo TA + 5', fatorF: 'log-normal com mediana 0,40 e sigma 0,55 (limitado a 2,0), igual para todas as prioridades', ajustePorRegiao: TB_AJUSTE_REGIAO },
    pesosReincidenciaPorTipo: PESO_REINCIDENCIA,
    equipes: EQUIPES,
  },
  distribuicoes: {
    mes: { '2025-07': 388, '2025-08': 417, '2025-09': 442 },
    statusPorMes: STATUS_POR_MES,
    status: { aberto: 4, supervisor: 54, atendimento: 21, concluido: 1168 },
    prioridade: COTAS.prioridade,
    tipoOcorrencia: COTAS.tipoOcorrencia,
    regiao: COTAS.regiao,
    reincidencias: COTAS.reincidencias,
  },
  referenciasAnteriores: {
    reproduzidas: 'Status 4/54/21/1.168 (KPIs e fluxo do protótipo), prioridade 41/206/597/403 e tipo 312/260/215/178/134/148 (gráficos antigos), meses na proporção do gráfico antigo (Set/Ago = +6,0%), 137 reincidências.',
    diferencas: 'Região: distribuição sem referência anterior (hipótese demonstrativa). Prioridade "Baixa" do gráfico antigo passa a "Normal". TA/TB médios resultam do cálculo (calibração aproximada de 27 min e 2h15), não são impostos.',
    consequenciaDR2: 'Com apenas 4 registros Aberto, a maioria das combinações de filtro que incluem Aberto não retorna registros.',
  },
}

const linhas = chamados.map((c) => '    ' + JSON.stringify(c))
const texto = '{\n  "documentacao": ' + JSON.stringify(documentacao, null, 2).replace(/\n/g, '\n  ') + ',\n  "chamados": [\n' + linhas.join(',\n') + '\n  ]\n}\n'
writeFileSync(ARQUIVO, texto)
console.log('Base gerada: ' + chamados.length + ' registros em ' + ARQUIVO.pathname + ' (' + Math.round(texto.length / 1024) + ' KB)')

/* ============================================================
   PRINCIPAL
   ============================================================ */
/**
 * FILA VIRTUAL — Mucuripe
 * Arquivo principal: abre o app, instala o sistema e guarda as configurações.
 *
 * PRIMEIRA VEZ: selecione a função "instalar" lá em cima e clique em Executar.
 */

const APP_NOME = 'Fila Virtual';

/* ===================== VERSÃO E NOVIDADES =====================
 * A CADA ATUALIZAÇÃO DO APP:
 *   1) aumente VERSAO_APP (ex.: '5' -> '6');
 *   2) acrescente um bloco NO INÍCIO da lista NOVIDADES contando o que mudou.
 * Cada pessoa (motorista ou administrador) vê a janela "O que há de novo" uma vez por versão,
 * e quem estiver com o app aberto recebe o aviso "O app foi atualizado — Recarregar".
 */
const VERSAO_APP = '7';
const NOVIDADES = [
  { versao: '7', data: '2026-11-17', titulo: 'Chamar vários de uma vez', itens: [
    '"Chamar Próximo" pode ser clicado várias vezes seguidas: não é preciso finalizar quem está em atendimento para chamar o próximo.',
    'Novo botão "Chamar Vários": marque quem vai ser chamado (ou escolha "os primeiros N" / "todos") e chame de uma só vez, na ordem da fila.'
  ] },
  { versao: '6', data: '2026-11-17', titulo: 'Chamar todos de uma vez', itens: [
    'Botão para chamar de uma só vez, na ordem da fila, os motoristas que estão aguardando.'
  ] },
  { versao: '5', data: '2026-11-13', titulo: 'Visual novo e relógio interno', itens: [
    'Visual igual ao do Quadro de Tarefas: menu lateral, tela de entrada nova e modo escuro (botão Aparência).',
    'Animações na abertura e ao trocar de tela.',
    'Relógio interno: a hora da fila e dos registros vem do servidor (horário de Manaus), mesmo que o celular esteja com a hora errada.',
    'Esta janela: sempre que o app for atualizado, você verá aqui o que mudou.'
  ] },
  { versao: '4', data: '2026-11-10', titulo: 'Menus reorganizados', itens: [
    'Lista de presença, movimentos, logs e ações agora ficam juntos em Relatórios.',
    'Excluir motorista passou para dentro de Gerenciar Motoristas.',
    'Localização, avisos, regras e chave de acesso ficam em Configurações.'
  ] },
  { versao: '3', data: '2026-11-07', titulo: 'Fila em tempo real', itens: [
    'Entrar, ser chamado, mover ou remover da fila aparece na hora, sem recarregar a página.',
    'Logo nova no app e na aba do navegador.',
    'Dados com mais de 2 meses vão para a planilha de arquivo.'
  ] }
];

/* ===================== RELÓGIO INTERNO =====================
 * Toda hora do sistema vem DAQUI (do servidor do Google), nunca do celular.
 * Fica gravada no horário de Manaus (UTC-4, sem horário de verão), ex.: 2026-11-13T15:08:42-04:00
 */
const FUSO_TXT = '-04:00';
const FUSO_MS = -4 * 3600000;
function isoManaus_(d) {
  d = d instanceof Date ? d : new Date(d === undefined ? Date.now() : d);
  if (isNaN(d.getTime())) return '';
  return new Date(d.getTime() + FUSO_MS).toISOString().slice(0, 19) + FUSO_TXT;
}
function agoraIso_() { return isoManaus_(new Date()); }
/** Converte qualquer data gravada (com Z, com -04:00 ou Date) em milissegundos para comparar. */
function msDe_(v) {
  if (v instanceof Date) return v.getTime();
  const n = Date.parse(String(v || ''));
  return isNaN(n) ? 0 : n;
}
function maisRecentePrimeiro_(a, b) { return msDe_(b.created_date) - msDe_(a.created_date); }

/** Uma vez só: converte os horários antigos (UTC, terminados em Z) para o horário de Manaus. */
const CAMPOS_DATA = ['created_date', 'updated_date', 'hora_entrada', 'inicio_atendimento', 'fim_atendimento'];
function converterHorariosParaManaus_() {
  const props = PropertiesService.getScriptProperties();
  if (props.getProperty('HORARIO_MANAUS') === '1') return 0;
  let total = 0;
  Object.keys(TABELAS).forEach(function (nome) {
    if (nome === 'Config') return;
    const sh = aba_(nome);
    const last = sh.getLastRow(), ncol = sh.getLastColumn();
    if (last < 2) return;
    const cab = sh.getRange(1, 1, 1, ncol).getValues()[0].map(String);
    const cols = CAMPOS_DATA.map(function (c) { return cab.indexOf(c); }).filter(function (i) { return i > -1; });
    if (!cols.length) return;
    cols.forEach(function (ci) {
      const rg = sh.getRange(2, ci + 1, last - 1, 1);
      const vals = rg.getValues();
      let mudou = false;
      vals.forEach(function (r) {
        const v = r[0];
        if (v instanceof Date || (typeof v === 'string' && /Z$/.test(v))) {
          const novo = isoManaus_(v instanceof Date ? v : new Date(v));
          if (novo) { r[0] = novo; mudou = true; total++; }
        }
      });
      if (mudou) rg.setNumberFormat('@').setValues(vals);
    });
    delete _dados[nome];
  });
  props.setProperty('HORARIO_MANAUS', '1');
  return total;
}
// Chave usada só na PRIMEIRA instalação. Troque logo depois em Configurações > Alterar chave.
const CHAVE_ADMIN_PADRAO = 'mucuripe-trocar-esta-chave';
const LOGO_PADRAO = '';
/** Ícone da Fila de Atendimento (64 px) — vira o mini ícone da aba do navegador. */
const ICONE_PNG_B64 = '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';

const CONFIG_PADRAO = {
  raio_permitido_metros: '1000',
  local_base_lat: '-3.1190275',
  local_base_lng: '-60.0217314',
  endereco_base: 'Av. Buriti, 81 - Distrito Industrial, Manaus - AM, 69075-510',
  logo_url: LOGO_PADRAO,
  cooldown_minutos: '15',
  precisao_max_metros: '50',
  whatsapp_ativo: 'NAO',
  evolution_url: '',
  evolution_key: '',
  evolution_instance: '',
  ntfy_ativo: 'NAO',
  ntfy_servidor: 'https://ntfy.sh',
  ntfy_prefixo: '',
  favicon_url: '',
  dias_manter: '60'
};

/** Abre o aplicativo (web app). */
function doGet(e) {
  let cfg = {};
  try { cfg = config_(); } catch (e) { cfg = {}; }
  const t = HtmlService.createTemplateFromFile('Index');
  t.logoUrl = cfg.logo_url || '';
  t.versao = VERSAO_APP;
  t.novidades = JSON.stringify(NOVIDADES).replace(/</g, '\\u003c');
  let url = '';
  try { url = ScriptApp.getService().getUrl() || ''; } catch (e) { url = ''; }
  t.appUrl = url;
  // aberto pelo endereço do GitHub (index.html com ?casca=1): o recarregar é feito pela página de fora
  t.casca = !!(e && e.parameter && e.parameter.casca === '1');
  const out = t.evaluate()
    .setTitle(APP_NOME)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  // mini ícone da aba do navegador
  const fav = cfg.favicon_url || '';
  if (fav) {
    const tentativas = [fav, fav + (fav.indexOf('?') > -1 ? '&' : '?') + 'ext=.png'];
    for (let i = 0; i < tentativas.length; i++) {
      try { out.setFaviconUrl(tentativas[i]); break; } catch (e) { /* tenta o próximo formato */ }
    }
  }
  return out;
}

/** Junta arquivos HTML dentro do Index. */
function include(nome) {
  return HtmlService.createHtmlOutputFromFile(nome).getContent();
}

/** Menu dentro da planilha. */
function onOpen() {
  try {
    SpreadsheetApp.getUi().createMenu('Fila Virtual')
      .addItem('Instalar / reparar', 'instalar')
      .addItem('Mostrar link do app', 'mostrarLink')
      .addItem('Arquivar dados com mais de 2 meses', 'arquivarAntigos')
      .addToUi();
  } catch (e) { /* aberto fora da planilha */ }
}

function mostrarLink() {
  const url = ScriptApp.getService().getUrl();
  const msg = url ? 'Link do app:\n\n' + url : 'O app ainda não foi implantado. Vá em Implantar > Nova implantação > App da Web.';
  try { SpreadsheetApp.getUi().alert(msg); } catch (e) { Logger.log(msg); }
}

/**
 * INSTALAÇÃO — rode uma vez. Pode rodar de novo sem perder nada (só repara o que faltar).
 */
function instalar() {
  const props = PropertiesService.getScriptProperties();

  // 1) Planilha que funciona como banco de dados
  let ss = null;
  const idSalvo = props.getProperty('PLANILHA_ID');
  if (idSalvo) {
    ss = SpreadsheetApp.openById(idSalvo);
  } else {
    try { ss = SpreadsheetApp.getActiveSpreadsheet(); } catch (e) { ss = null; }
    if (!ss) ss = SpreadsheetApp.create('Fila Virtual - Banco de Dados');
    props.setProperty('PLANILHA_ID', ss.getId());
  }

  // 2) Segredo para assinar os logins
  if (!props.getProperty('SEGREDO')) {
    props.setProperty('SEGREDO', Utilities.getUuid() + Utilities.getUuid());
  }

  // 3) Pasta no Drive para fotos e documentos
  let pastaOk = false;
  const pastaId = props.getProperty('PASTA_ID');
  if (pastaId) { try { DriveApp.getFolderById(pastaId); pastaOk = true; } catch (e) { pastaOk = false; } }
  if (!pastaOk) {
    const pasta = DriveApp.createFolder('Fila Virtual - Arquivos');
    props.setProperty('PASTA_ID', pasta.getId());
  }

  // 4) Abas
  Object.keys(TABELAS).forEach(function (nome) { aba_(nome); });

  // 4b) Linhas coladas na planilha sem "id" (ex.: importadas do Base44) ganham um id
  corrigirIds_();

  // 4c) Relógio interno: horários antigos (UTC) passam para o horário de Manaus — só na 1ª vez
  try { converterHorariosParaManaus_(); } catch (e) { Logger.log('Horários: ' + e); }

  // 5) Configurações padrão
  const atual = configBruta_();
  const novos = {};
  Object.keys(CONFIG_PADRAO).forEach(function (k) {
    if (atual[k] === undefined) novos[k] = CONFIG_PADRAO[k];
  });
  if (!atual.chave_admin_hash) novos.chave_admin_hash = hashSenha_(CHAVE_ADMIN_PADRAO);
  if (!atual.ntfy_prefixo) novos.ntfy_prefixo = 'filavirtual-' + Utilities.getUuid().replace(/-/g, '').slice(0, 8);
  if (Object.keys(novos).length) salvarConfig_(novos);

  // 5b) Ícone da aba do navegador (salvo no Drive, público só para leitura)
  try { criarFavicon_(); } catch (e) { Logger.log('Favicon: ' + e); }

  // 5c) Arquivo morto automático todo dia de madrugada
  try { criarGatilhoArquivo_(); } catch (e) { Logger.log('Gatilho: ' + e); }

  // 6) Remove a aba vazia padrão
  ['Página1', 'Sheet1', 'Planilha1'].forEach(function (n) {
    const sh = ss.getSheetByName(n);
    if (sh && sh.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(sh);
  });

  bumpVersao_();
  const msg = 'Fila Virtual instalado!\n\nPlanilha: ' + ss.getUrl() +
    '\n\nAgora implante: Implantar > Nova implantação > App da Web (Executar como: Eu | Quem pode acessar: Qualquer pessoa).';
  Logger.log(msg);
  try { SpreadsheetApp.getUi().alert(msg); } catch (e) { /* rodando no editor */ }
  return msg;
}

/* ===================== CONFIGURAÇÕES ===================== */

let _cfg = null;

function configBruta_() {
  const sh = aba_('Config');
  const last = sh.getLastRow();
  const out = {};
  if (last >= 2) {
    sh.getRange(2, 1, last - 1, 2).getValues().forEach(function (r) {
      if (r[0] !== '' && r[0] !== null) out[String(r[0])] = r[1] instanceof Date ? r[1].toISOString() : String(r[1]);
    });
  }
  return out;
}

function config_() {
  if (_cfg) return _cfg;
  const cache = CacheService.getScriptCache();
  const c = cache.get('cfg');
  if (c) { _cfg = JSON.parse(c); return _cfg; }
  const bruta = configBruta_();
  _cfg = Object.assign({}, CONFIG_PADRAO, bruta);
  cache.put('cfg', JSON.stringify(_cfg), 600);
  return _cfg;
}

function salvarConfig_(valores) {
  const sh = aba_('Config');
  const last = sh.getLastRow();
  const linhas = last >= 2 ? sh.getRange(2, 1, last - 1, 2).getValues() : [];
  const idx = {};
  linhas.forEach(function (r, i) { idx[String(r[0])] = i + 2; });
  Object.keys(valores).forEach(function (k) {
    const v = valores[k] === null || valores[k] === undefined ? '' : String(valores[k]);
    if (idx[k]) {
      sh.getRange(idx[k], 2).setNumberFormat('@').setValue(v);
    } else {
      const r = sh.getLastRow() + 1;
      garantirLinhas_(sh, r);
      sh.getRange(r, 1, 1, 2).setNumberFormat('@').setValues([[k, v]]);
      idx[k] = r;
    }
  });
  _cfg = null;
  CacheService.getScriptCache().remove('cfg');
}

/** Dados de configuração que o motorista pode ver. */
function configPublica_() {
  const c = config_();
  return {
    raio: Number(c.raio_permitido_metros) || 1000,
    lat: Number(c.local_base_lat),
    lng: Number(c.local_base_lng),
    endereco: c.endereco_base || '',
    logo: c.logo_url || LOGO_PADRAO,
    precisaoMax: Number(c.precisao_max_metros) || 50,
    cooldown: Number(c.cooldown_minutos) || 15
  };
}

/** Logo para a tela de login. */
function getConfigPublica() {
  return api_(function () { return configPublica_(); });
}

/** Envelope padrão de resposta para o navegador. */
let _sessaoAtual = null, _mudou = false;
function api_(fn) {
  _sessaoAtual = null; _mudou = false;
  try {
    let r = fn();
    // Toda ação que mexe na fila já devolve a fila nova — a tela atualiza na hora, sem esperar.
    if (_mudou && _sessaoAtual) {
      const est = estadoPara_(_sessaoAtual, null);
      if (r && typeof r === 'object' && !Array.isArray(r)) r.estado = est;
      else r = { resultado: r, estado: est };
    }
    return { ok: true, dados: r, t: Date.now(), v: VERSAO_APP };
  } catch (e) {
    const msg = e && e.message ? e.message : String(e);
    if (msg !== 'SESSAO_EXPIRADA') console.error(e && e.stack ? e.stack : msg);
    return { ok: false, erro: msg, t: Date.now(), v: VERSAO_APP };
  }
}

/** Dá um id para linhas coladas manualmente que vieram sem id. */
function corrigirIds_() {
  Object.keys(TABELAS).forEach(function (nome) {
    if (nome === 'Config') return;
    const sh = aba_(nome);
    const last = sh.getLastRow(), ncol = sh.getLastColumn();
    if (last < 2) return;
    const cab = sh.getRange(1, 1, 1, ncol).getValues()[0].map(String);
    const iId = cab.indexOf('id'), iCr = cab.indexOf('created_date');
    const vals = sh.getRange(2, 1, last - 1, ncol).getValues();
    let mudou = false;
    vals.forEach(function (r) {
      const temDados = r.some(function (v, j) { return j !== iId && v !== '' && v !== null; });
      if (temDados && (r[iId] === '' || r[iId] === null)) {
        r[iId] = Utilities.getUuid(); mudou = true;
        if (iCr > -1 && (r[iCr] === '' || r[iCr] === null)) r[iCr] = agoraIso_();
      }
    });
    if (mudou) sh.getRange(2, 1, vals.length, ncol).setValues(vals);
    delete _dados[nome];
  });
}


/* ============================================================
   BANCO
   ============================================================ */
/**
 * BANCO DE DADOS — cada aba da planilha é uma tabela.
 * Não precisa mexer aqui.
 */

const TABELAS = {
  Motoristas: ['id', 'created_date', 'updated_date', 'nome_completo', 'cpf', 'senha', 'regime', 'placa', 'telefone',
    'rastreado', 'bloqueado', 'motivo_bloqueio', 'foto_id', 'foto_url',
    'cnh_numero', 'cnh_categoria', 'cnh_validade', 'cnh_documento_id', 'cnh_documento_tipo', 'cnh_documento_url', 'cnh_aprovado',
    'crlv_renavam', 'crlv_validade', 'crlv_documento_id', 'crlv_documento_tipo', 'crlv_documento_url', 'crlv_aprovado'],
  Fila: ['id', 'created_date', 'updated_date', 'motorista_id', 'motorista_nome', 'motorista_cpf', 'motorista_regime',
    'motorista_placa', 'status', 'ordem', 'dentro_raio', 'hora_entrada', 'inicio_atendimento', 'fim_atendimento',
    'latitude', 'longitude'],
  Solicitacoes: ['id', 'created_date', 'updated_date', 'motorista_id', 'motorista_nome', 'motorista_cpf', 'motorista_placa',
    'status', 'latitude', 'longitude', 'distancia_metros', 'admin_responsavel', 'observacao'],
  Movimentos: ['id', 'created_date', 'motorista_id', 'motorista_nome', 'motorista_cpf', 'motorista_placa', 'tipo_movimento',
    'posicao_anterior', 'posicao_nova', 'admin_responsavel', 'observacao', 'status_fila'],
  Historico: ['id', 'created_date', 'motorista_id', 'motorista_nome', 'motorista_cpf', 'acao', 'detalhes',
    'admin_responsavel', 'posicao_fila'],
  LogsFalha: ['id', 'created_date', 'motorista_id', 'motorista_nome', 'motorista_cpf', 'motivo_falha', 'detalhes',
    'latitude', 'longitude', 'distancia_metros'],
  Auditoria: ['id', 'created_date', 'admin_email', 'motorista_id', 'motorista_nome', 'motorista_cpf', 'acao', 'motivo', 'detalhes'],
  Config: ['chave', 'valor']
};

const CAMPOS_NUM = ['ordem', 'latitude', 'longitude', 'distancia_metros', 'posicao_anterior', 'posicao_nova', 'posicao_fila'];
const CAMPOS_BOOL = ['rastreado', 'bloqueado', 'cnh_aprovado', 'crlv_aprovado', 'dentro_raio'];
const CAMPOS_CPF = ['cpf', 'motorista_cpf'];
const STATUS_ATIVOS = ['NA_FILA', 'EM_ATENDIMENTO', 'PAUSADO'];

let _ss = null;
const _abas = {};
const _dados = {};
const _cabs = {};

function ss_() {
  if (_ss) return _ss;
  const id = PropertiesService.getScriptProperties().getProperty('PLANILHA_ID');
  if (id) {
    _ss = SpreadsheetApp.openById(id);
  } else {
    try { _ss = SpreadsheetApp.getActiveSpreadsheet(); } catch (e) { _ss = null; }
  }
  if (!_ss) throw new Error('Sistema não instalado. Abra o editor do Apps Script e execute a função "instalar".');
  return _ss;
}

function garantirLinhas_(sh, linha) {
  const max = sh.getMaxRows();
  if (linha > max) {
    const add = Math.max(500, linha - max);
    sh.insertRowsAfter(max, add);
    sh.getRange(max + 1, 1, add, sh.getMaxColumns()).setNumberFormat('@');
  }
}

function aba_(nome) {
  if (_abas[nome]) return _abas[nome];
  const ss = ss_();
  const campos = TABELAS[nome];
  let sh = ss.getSheetByName(nome);
  if (!sh) {
    sh = ss.insertSheet(nome);
    if (sh.getMaxColumns() < campos.length) sh.insertColumnsAfter(sh.getMaxColumns(), campos.length - sh.getMaxColumns());
    sh.getRange(1, 1, sh.getMaxRows(), sh.getMaxColumns()).setNumberFormat('@');
    sh.getRange(1, 1, 1, campos.length).setValues([campos])
      .setFontWeight('bold').setBackground('#1e293b').setFontColor('#ffffff');
    sh.setFrozenRows(1);
    _cabs[nome] = campos.slice();
  } else {
    const ncol = Math.max(sh.getLastColumn(), 1);
    const cab = sh.getRange(1, 1, 1, ncol).getValues()[0].map(String);
    const usadas = cab.filter(function (c) { return c !== ''; }).length;
    const faltando = campos.filter(function (c) { return cab.indexOf(c) === -1; });
    if (faltando.length) {
      const precisa = usadas + faltando.length;
      if (sh.getMaxColumns() < precisa) sh.insertColumnsAfter(sh.getMaxColumns(), precisa - sh.getMaxColumns());
      sh.getRange(1, usadas + 1, sh.getMaxRows(), faltando.length).setNumberFormat('@');
      sh.getRange(1, usadas + 1, 1, faltando.length).setValues([faltando])
        .setFontWeight('bold').setBackground('#1e293b').setFontColor('#ffffff');
    }
    _cabs[nome] = cab.slice(0, usadas).concat(faltando);
  }
  _abas[nome] = sh;
  return sh;
}

function parse_(campo, v) {
  if (v instanceof Date) return isoManaus_(v);
  if (CAMPOS_BOOL.indexOf(campo) > -1) {
    if (v === '' || v === null || v === undefined) return null;
    return v === true || String(v).toUpperCase() === 'TRUE' || String(v).toUpperCase() === 'VERDADEIRO';
  }
  if (CAMPOS_NUM.indexOf(campo) > -1) {
    if (v === '' || v === null || v === undefined) return null;
    const n = Number(String(v).replace(',', '.'));
    return isNaN(n) ? null : n;
  }
  if (CAMPOS_CPF.indexOf(campo) > -1) {
    const d = String(v === null || v === undefined ? '' : v).replace(/\D/g, '');
    return d ? (d.length < 11 ? ('00000000000' + d).slice(-11) : d) : '';
  }
  return v === null || v === undefined ? '' : String(v);
}

function serial_(v) {
  if (v === null || v === undefined) return '';
  if (v === true) return 'TRUE';
  if (v === false) return 'FALSE';
  if (v instanceof Date) return isoManaus_(v);
  return String(v);
}

function lerTabela_(nome) {
  if (_dados[nome]) return _dados[nome];
  const sh = aba_(nome);
  const last = sh.getLastRow();
  const ncol = sh.getLastColumn();
  const cab = sh.getRange(1, 1, 1, ncol).getValues()[0].map(String);
  const idIdx = cab.indexOf('id');
  const lista = [];
  if (last >= 2) {
    const vals = sh.getRange(2, 1, last - 1, ncol).getValues();
    for (let i = 0; i < vals.length; i++) {
      const r = vals[i];
      if (idIdx > -1 && (r[idIdx] === '' || r[idIdx] === null)) continue;
      const o = { _row: i + 2 };
      for (let j = 0; j < cab.length; j++) if (cab[j]) o[cab[j]] = parse_(cab[j], r[j]);
      lista.push(o);
    }
  }
  _dados[nome] = { cab: cab, lista: lista };
  return _dados[nome];
}

function todos_(nome) { return lerTabela_(nome).lista; }

function buscar_(nome, id) {
  return todos_(nome).find(function (o) { return o.id === id; }) || null;
}

/** Acrescenta uma linha no fim da aba — sem precisar ler a aba inteira. */
function inserir_(nome, obj) {
  const sh = aba_(nome);
  const cab = _dados[nome] ? _dados[nome].cab : _cabs[nome];
  const agora = agoraIso_();
  const o = Object.assign({ id: Utilities.getUuid(), created_date: agora }, obj);
  if (cab.indexOf('updated_date') > -1) o.updated_date = agora;
  const linha = cab.map(function (c) { return c ? serial_(o[c]) : ''; });
  const r = sh.getLastRow() + 1;
  garantirLinhas_(sh, r);
  sh.getRange(r, 1, 1, cab.length).setNumberFormat('@').setValues([linha]);
  o._row = r;
  if (_dados[nome]) _dados[nome].lista.push(o);
  return o;
}

function atualizar_(nome, id, patch) {
  const sh = aba_(nome);
  const t = lerTabela_(nome);
  const o = t.lista.find(function (x) { return x.id === id; });
  if (!o) throw new Error('Registro não encontrado (pode ter sido removido). Atualize a tela.');
  Object.assign(o, patch);
  if (t.cab.indexOf('updated_date') > -1) o.updated_date = agoraIso_();
  const linha = t.cab.map(function (c) { return c ? serial_(o[c]) : ''; });
  sh.getRange(o._row, 1, 1, t.cab.length).setNumberFormat('@').setValues([linha]);
  return o;
}

function excluir_(nome, id) {
  const sh = aba_(nome);
  const o = todos_(nome).find(function (x) { return x.id === id; });
  if (!o) return false;
  sh.deleteRow(o._row);
  delete _dados[nome];
  return true;
}

function limpar_(o) {
  if (!o) return o;
  const c = Object.assign({}, o);
  delete c._row;
  return c;
}

/* ============ TRAVA + VERSÃO (atualização em tempo real) ============ */

function comLock_(fn, opcoes) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(28000)) throw new Error('Sistema ocupado, tente de novo em alguns segundos.');
  try {
    const r = fn();
    SpreadsheetApp.flush();
    if (!(opcoes && opcoes.semVersao)) {
      _mudou = true;
      const v = bumpVersao_();
      try { guardarSnapshot_(v, montarSnapshot_()); } catch (e) { console.error(e); }
    }
    return r;
  } finally {
    lock.releaseLock();
  }
}

function bumpVersao_() {
  const v = String(Date.now());
  const c = CacheService.getScriptCache();
  c.put('versao', v, 21600);
  c.remove('snap');
  return v;
}

function versaoAtual_() {
  const c = CacheService.getScriptCache();
  let v = c.get('versao');
  if (!v) { v = String(Date.now()); c.put('versao', v, 21600); }
  return v;
}

function guardarSnapshot_(v, snap) {
  const txt = JSON.stringify({ v: v, s: snap });
  if (txt.length < 95000) CacheService.getScriptCache().put('snap', txt, 21600);
}

function snapshot_(v) {
  const c = CacheService.getScriptCache().get('snap');
  if (c) {
    try { const p = JSON.parse(c); if (p.v === v) return p.s; } catch (e) { /* refaz */ }
  }
  const s = montarSnapshot_();
  guardarSnapshot_(v, s);
  return s;
}

/** Foto instantânea da fila ativa — o que todo mundo consulta a cada poucos segundos. */
function montarSnapshot_() {
  const fila = todos_('Fila');
  const ativos = fila.filter(function (f) { return STATUS_ATIVOS.indexOf(f.status) > -1; }).map(limpar_);
  const tempos = fila.filter(function (f) { return f.status === 'FINALIZADO' && f.inicio_atendimento && f.fim_atendimento; })
    .map(function (f) { return (Date.parse(f.fim_atendimento) - Date.parse(f.inicio_atendimento)) / 60000; })
    .filter(function (n) { return !isNaN(n) && n >= 0; });
  const tempoMedio = tempos.length ? Math.round(tempos.reduce(function (a, b) { return a + b; }, 0) / tempos.length) : 0;
  const agora = Date.now();
  const sols = todos_('Solicitacoes').filter(function (s) {
    if (s.status === 'PENDENTE') return true;
    const t = Date.parse(s.updated_date || s.created_date);
    return agora - t < 10 * 60000;
  }).map(limpar_);
  return { ativos: ativos, sols: sols, tempoMedio: tempoMedio };
}


/* ============================================================
   SEGURANCA
   ============================================================ */
/**
 * SEGURANÇA — senhas, logins e sessões.
 */

function segredo_() {
  const s = PropertiesService.getScriptProperties().getProperty('SEGREDO');
  if (!s) throw new Error('Sistema não instalado. Execute a função "instalar" no editor.');
  return s;
}

function sha256_(txt) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, txt, Utilities.Charset.UTF_8)
    .map(function (b) { return ('0' + (b & 255).toString(16)).slice(-2); }).join('');
}

function hashSenha_(senha) {
  const sal = Utilities.getUuid().replace(/-/g, '').slice(0, 10);
  return 'h$' + sal + '$' + sha256_(sal + String(senha));
}

/** Aceita senha já protegida (h$...) ou senha em texto puro (importada do Base44). */
function confereSenha_(senha, guardada) {
  if (!guardada) return false;
  guardada = String(guardada);
  if (guardada.indexOf('h$') === 0) {
    const p = guardada.split('$');
    return sha256_(p[1] + String(senha)) === p[2];
  }
  return guardada === String(senha);
}

function assinar_(b) {
  return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(b, segredo_()));
}

function criarToken_(dados, dias) {
  const p = Object.assign({}, dados, { exp: Date.now() + dias * 86400000 });
  const b = Utilities.base64EncodeWebSafe(JSON.stringify(p), Utilities.Charset.UTF_8);
  return b + '.' + assinar_(b);
}

function versaoChave_() {
  return String(config_().chave_admin_hash || '').slice(-10);
}

/** Valida o login. tipo: 'M' motorista, 'A' admin, ou vazio para ambos. */
function sessao_(token, tipo) {
  if (!token) throw new Error('SESSAO_EXPIRADA');
  const partes = String(token).split('.');
  if (partes.length !== 2 || assinar_(partes[0]) !== partes[1]) throw new Error('SESSAO_EXPIRADA');
  let p;
  try {
    p = JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(partes[0])).getDataAsString('UTF-8'));
  } catch (e) { throw new Error('SESSAO_EXPIRADA'); }
  if (!p.exp || p.exp < Date.now()) throw new Error('SESSAO_EXPIRADA');
  if (p.t === 'A' && p.kv !== versaoChave_()) throw new Error('SESSAO_EXPIRADA');
  if (tipo && p.t !== tipo) throw new Error('Acesso negado.');
  _sessaoAtual = p;
  return p;
}

function tentativas_(chave, falhou) {
  const c = CacheService.getScriptCache();
  const k = 'tent_' + chave;
  let n = Number(c.get(k) || 0);
  if (falhou === undefined) return n;
  if (falhou) { n++; c.put(k, String(n), 600); } else { c.remove(k); }
  return n;
}

/* ===================== LOGIN ===================== */

function loginMotorista(cpf, senha) {
  return api_(function () {
    const limpo = String(cpf || '').replace(/\D/g, '');
    if (limpo.length !== 11) throw new Error('CPF inválido');
    if (tentativas_(limpo) >= 8) throw new Error('Muitas tentativas erradas. Aguarde 10 minutos.');
    const m = todos_('Motoristas').find(function (x) { return x.cpf === limpo; });
    if (!m) throw new Error('Usuário não cadastrado');
    if (!confereSenha_(senha, m.senha)) {
      tentativas_(limpo, true);
      throw new Error('Senha incorreta');
    }
    tentativas_(limpo, false);
    if (String(m.senha).indexOf('h$') !== 0) {
      // senha antiga (texto puro): protege agora
      comLock_(function () { atualizar_('Motoristas', m.id, { senha: hashSenha_(senha) }); }, { semVersao: true });
    }
    return {
      token: criarToken_({ t: 'M', id: m.id }, 90),
      motorista: motoristaPublico_(m),
      config: configPublica_(),
      ntfy: infoNtfy_(m)
    };
  });
}

function loginAdmin(chave) {
  return api_(function () {
    if (tentativas_('admin') >= 10) throw new Error('Muitas tentativas erradas. Aguarde 10 minutos.');
    const cfg = config_();
    if (!chave || !confereSenha_(chave, cfg.chave_admin_hash)) {
      tentativas_('admin', true);
      throw new Error('Chave de acesso inválida');
    }
    tentativas_('admin', false);
    return { token: criarToken_({ t: 'A', kv: versaoChave_() }, 30) };
  });
}

/** Confere se o login salvo no aparelho ainda vale. */
function validarSessao(token) {
  return api_(function () {
    const s = sessao_(token);
    if (s.t === 'M') {
      const m = buscar_('Motoristas', s.id);
      if (!m) throw new Error('SESSAO_EXPIRADA');
      return { tipo: 'M', motorista: motoristaPublico_(m), config: configPublica_(), ntfy: infoNtfy_(m) };
    }
    return { tipo: 'A', config: configPublica_() };
  });
}

/* ===================== NOVIDADES (o que há de novo) ===================== */
function chaveNovid_(s) { return 'novid_' + (s.t === 'M' ? s.id : 'admin'); }
/** Qual versão das novidades esta pessoa já viu (vale em qualquer aparelho). */
function novidadesVistas(token) {
  return api_(function () {
    const s = sessao_(token);
    return PropertiesService.getScriptProperties().getProperty(chaveNovid_(s)) || '';
  });
}
/** A pessoa fechou a janela "O que há de novo": não mostra de novo nesta versão. */
function marcarNovidadesVistas(token, versao) {
  return api_(function () {
    const s = sessao_(token);
    PropertiesService.getScriptProperties().setProperty(chaveNovid_(s), String(versao || VERSAO_APP).slice(0, 20));
    return true;
  });
}

function motoristaPublico_(m) {
  const c = limpar_(m);
  delete c.senha;
  return c;
}


/* ============================================================
   FILA
   ============================================================ */
/**
 * FILA — tudo que o motorista e o admin fazem na fila.
 */

function distancia_(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const f1 = lat1 * Math.PI / 180, f2 = lat2 * Math.PI / 180;
  const df = (lat2 - lat1) * Math.PI / 180, dl = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(df / 2) * Math.sin(df / 2) + Math.cos(f1) * Math.cos(f2) * Math.sin(dl / 2) * Math.sin(dl / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function msg_(tipo, texto, extra) { return Object.assign({ tipo: tipo, texto: texto }, extra || {}); }

function dadosMot_(m) {
  return { motorista_id: m.id, motorista_nome: m.nome_completo, motorista_cpf: m.cpf, motorista_placa: m.placa };
}
function dadosItem_(f) {
  return { motorista_id: f.motorista_id, motorista_nome: f.motorista_nome, motorista_cpf: f.motorista_cpf, motorista_placa: f.motorista_placa };
}
function mov_(base, tipo, extra) {
  return inserir_('Movimentos', Object.assign({}, base, { tipo_movimento: tipo }, extra || {}));
}
function hist_(base, acao, extra) {
  const b = { motorista_id: base.motorista_id, motorista_nome: base.motorista_nome, motorista_cpf: base.motorista_cpf };
  return inserir_('Historico', Object.assign(b, { acao: acao }, extra || {}));
}
function falha_(m, motivo, detalhes, loc, dist) {
  inserir_('LogsFalha', {
    motorista_id: m.id, motorista_nome: m.nome_completo, motorista_cpf: m.cpf,
    motivo_falha: motivo, detalhes: detalhes,
    latitude: loc && loc.lat, longitude: loc && loc.lng,
    distancia_metros: dist === undefined || dist === null ? null : Math.round(dist)
  });
}
function proximaOrdem_() {
  const na = todos_('Fila').filter(function (f) { return f.status === 'NA_FILA'; });
  return na.length ? Math.max.apply(null, na.map(function (f) { return f.ordem || 0; })) + 1 : 1;
}
function registroAtivo_(motoristaId, status) {
  const st = status || STATUS_ATIVOS;
  return todos_('Fila').find(function (f) { return f.motorista_id === motoristaId && st.indexOf(f.status) > -1; }) || null;
}
function motoristaOuErro_(id) {
  const m = buscar_('Motoristas', id);
  if (!m) throw new Error('SESSAO_EXPIRADA');
  return m;
}
function textoStatus_(st) {
  return st === 'NA_FILA' ? 'aguardando' : st === 'EM_ATENDIMENTO' ? 'em atendimento' : 'pausado';
}
function naFilaOrdenada_() {
  return todos_('Fila').filter(function (f) { return f.status === 'NA_FILA'; })
    .sort(function (a, b) { return (a.ordem || 0) - (b.ordem || 0); });
}

/* ===================== ESTADO EM TEMPO REAL ===================== */

function getEstado(token, versaoCliente) {
  return api_(function () {
    const s = sessao_(token);
    if (s.t === 'M' && CacheService.getScriptCache().get('del_' + s.id)) throw new Error('SESSAO_EXPIRADA');
    return estadoPara_(s, versaoCliente);
  });
}

function estadoPara_(s, versaoCliente) {
  {
    const v = versaoAtual_();
    if (versaoCliente && versaoCliente === v) return { mudou: false, versao: v };
    const snap = snapshot_(v);

    if (s.t === 'A') {
      return {
        mudou: true, versao: v,
        ativos: snap.ativos,
        solicitacoes: snap.sols.filter(function (x) { return x.status === 'PENDENTE'; })
          .sort(maisRecentePrimeiro_),
        tempoMedio: snap.tempoMedio
      };
    }

    const naFila = snap.ativos.filter(function (f) { return f.status === 'NA_FILA'; })
      .sort(function (a, b) { return (a.ordem || 0) - (b.ordem || 0); });
    const meu = snap.ativos.find(function (f) { return f.motorista_id === s.id; }) || null;
    let posicao = null;
    if (meu && meu.status === 'NA_FILA') posicao = naFila.findIndex(function (f) { return f.motorista_id === s.id; }) + 1;
    const minhas = snap.sols.filter(function (x) { return x.motorista_id === s.id; })
      .sort(maisRecentePrimeiro_);
    const pendente = minhas.find(function (x) { return x.status === 'PENDENTE'; }) || null;
    const rej = minhas.find(function (x) {
      return x.status === 'REJEITADO' && Date.now() - Date.parse(x.updated_date || x.created_date) < 2 * 60000;
    });
    return {
      mudou: true, versao: v,
      fila: naFila.map(function (f) { return { id: f.id, motorista_id: f.motorista_id, motorista_nome: f.motorista_nome, hora_entrada: f.hora_entrada || f.created_date }; }),
      meu: meu ? { id: meu.id, status: meu.status, ordem: meu.ordem, dentro_raio: meu.dentro_raio } : null,
      posicao: posicao,
      solicitacao: pendente ? { id: pendente.id, status: pendente.status } : null,
      rejeitadaEm: rej ? (rej.updated_date || rej.created_date) : null
    };
  }
}

/* ===================== MOTORISTA ===================== */

function entrarNaFila(token, loc) {
  return api_(function () {
    const s = sessao_(token, 'M');
    return comLock_(function () {
      const m = motoristaOuErro_(s.id);
      const cfg = configPublica_();

      if (m.bloqueado) {
        falha_(m, 'BLOQUEADO', 'Motorista está bloqueado no sistema', loc);
        return msg_('error', 'Você está bloqueado para entrar na fila. Procure o administrador.');
      }

      // Regra do intervalo (cooldown)
      const fins = todos_('Fila').filter(function (f) { return f.motorista_id === m.id && f.status === 'FINALIZADO' && f.fim_atendimento; })
        .map(function (f) { return Date.parse(f.fim_atendimento); }).filter(function (n) { return !isNaN(n); });
      if (fins.length) {
        const diff = Math.floor((Date.now() - Math.max.apply(null, fins)) / 60000);
        if (diff < cfg.cooldown) {
          const rest = cfg.cooldown - diff;
          falha_(m, 'COOLDOWN_ATIVO', 'Tentou entrar faltando ' + rest + ' minuto(s) para completar o intervalo de ' + cfg.cooldown + ' minutos', loc);
          return msg_('error', 'Você poderá entrar novamente na fila em ' + rest + ' minuto' + (rest !== 1 ? 's' : '') + '.');
        }
      }

      if (!loc || loc.lat === null || loc.lat === undefined || isNaN(Number(loc.lat))) {
        falha_(m, 'SEM_LOCALIZACAO', 'Localização não disponível no dispositivo', null);
        return msg_('error', 'Não foi possível obter sua localização. Verifique as permissões.');
      }
      loc = { lat: Number(loc.lat), lng: Number(loc.lng), accuracy: Number(loc.accuracy) || 9999 };

      if (loc.accuracy > cfg.precisaoMax) {
        falha_(m, 'PRECISAO_BAIXA', 'Precisão do GPS muito baixa: ' + Math.round(loc.accuracy) + 'm', loc);
        return msg_('warning', 'Sinal de GPS fraco (' + Math.round(loc.accuracy) + 'm). Aguarde melhorar a precisão.');
      }

      const existente = registroAtivo_(m.id);
      if (existente) {
        falha_(m, 'JA_NA_FILA', 'Status atual: ' + existente.status, loc);
        return msg_('warning', 'Você já está na fila');
      }

      const dist = distancia_(loc.lat, loc.lng, cfg.lat, cfg.lng);
      if (dist > cfg.raio) {
        falha_(m, 'FORA_DO_RAIO', 'Solicitou entrada a ' + Math.round(dist) + 'm da base (permitido: ' + cfg.raio + 'm)', loc, dist);
        const pend = todos_('Solicitacoes').find(function (x) { return x.motorista_id === m.id && x.status === 'PENDENTE'; });
        if (pend) return msg_('warning', 'Você já tem uma solicitação pendente. Aguarde a autorização do admin.');
        inserir_('Solicitacoes', Object.assign(dadosMot_(m), {
          status: 'PENDENTE', latitude: loc.lat, longitude: loc.lng, distancia_metros: Math.round(dist)
        }));
        mov_(dadosMot_(m), 'SOLICITACAO_ENTRADA', {
          observacao: 'Solicitou entrada a ' + (dist / 1000).toFixed(2) + ' km da base (raio: ' + cfg.raio + 'm)',
          status_fila: 'SOLICITADO'
        });
        return msg_('warning', 'Você está a ' + (dist / 1000).toFixed(2) + ' km da base. Solicitação de entrada enviada ao admin. Aguarde a autorização.');
      }

      const ordem = proximaOrdem_();
      const agora = agoraIso_();
      inserir_('Fila', {
        motorista_id: m.id, motorista_nome: m.nome_completo, motorista_cpf: m.cpf,
        motorista_regime: m.regime, motorista_placa: m.placa,
        status: 'NA_FILA', ordem: ordem, dentro_raio: true, hora_entrada: agora,
        latitude: loc.lat, longitude: loc.lng
      });
      hist_(dadosMot_(m), 'ENTROU_NA_FILA', { detalhes: 'Entrou na fila na posição ' + ordem, posicao_fila: ordem });
      mov_(dadosMot_(m), 'ENTRADA_NA_FILA', { posicao_nova: ordem, observacao: 'Motorista entrou na fila pelo app', status_fila: 'NA_FILA' });
      return msg_('success', 'Você entrou na fila!');
    });
  });
}

function sairDaFila(token) {
  return api_(function () {
    const s = sessao_(token, 'M');
    return comLock_(function () {
      const m = motoristaOuErro_(s.id);
      const reg = registroAtivo_(m.id);
      if (!reg) return msg_('warning', 'Você não está na fila');
      atualizar_('Fila', reg.id, { status: 'FINALIZADO', fim_atendimento: agoraIso_() });
      const txt = 'Saiu da fila voluntariamente (estava ' + textoStatus_(reg.status) + ')';
      hist_(dadosMot_(m), 'SAIU_DA_FILA', { detalhes: txt });
      mov_(dadosMot_(m), 'SAIDA_DA_FILA', { posicao_anterior: reg.ordem, observacao: txt, status_fila: reg.status });
      return msg_('success', 'Você saiu da fila');
    });
  });
}

function cancelarSolicitacao(token) {
  return api_(function () {
    const s = sessao_(token, 'M');
    return comLock_(function () {
      const sol = todos_('Solicitacoes').find(function (x) { return x.motorista_id === s.id && x.status === 'PENDENTE'; });
      if (!sol) return msg_('warning', 'Nenhuma solicitação pendente.');
      atualizar_('Solicitacoes', sol.id, { status: 'CANCELADA', observacao: 'Motorista cancelou a solicitação' });
      return msg_('success', 'Solicitação cancelada.');
    });
  });
}

/** Chamado pelo celular quando o GPS mostra que o motorista chegou dentro do raio. */
function chegueiNoRaio(token, loc) {
  return api_(function () {
    const s = sessao_(token, 'M');
    if (!loc || isNaN(Number(loc.lat))) return null;
    const cfg = configPublica_();
    const acc = Number(loc.accuracy) || 9999;
    if (acc > cfg.precisaoMax * 2) return null;
    const dist = distancia_(Number(loc.lat), Number(loc.lng), cfg.lat, cfg.lng);
    if (dist > cfg.raio) return null;

    const pend0 = todos_('Solicitacoes').find(function (x) { return x.motorista_id === s.id && x.status === 'PENDENTE'; });
    const reg0 = registroAtivo_(s.id, ['NA_FILA', 'PAUSADO']);
    if (!pend0 && !(reg0 && reg0.dentro_raio === false)) return null;

    return comLock_(function () {
      delete _dados.Solicitacoes; delete _dados.Fila;
      const m = motoristaOuErro_(s.id);
      if (m.bloqueado) return null;
      const pend = todos_('Solicitacoes').find(function (x) { return x.motorista_id === m.id && x.status === 'PENDENTE'; });
      if (pend) {
        if (!registroAtivo_(m.id)) {
          const ordem = proximaOrdem_();
          inserir_('Fila', {
            motorista_id: m.id, motorista_nome: m.nome_completo, motorista_cpf: m.cpf,
            motorista_regime: m.regime, motorista_placa: m.placa,
            status: 'NA_FILA', ordem: ordem, dentro_raio: true, hora_entrada: agoraIso_(),
            latitude: Number(loc.lat), longitude: Number(loc.lng)
          });
          atualizar_('Solicitacoes', pend.id, { status: 'ENTROU_RAIO', observacao: 'Motorista chegou dentro do raio antes da aprovação' });
          mov_(dadosMot_(m), 'ENTROU_RAIO', { posicao_nova: ordem, observacao: 'Entrou automaticamente ao chegar no raio (solicitação pendente)', status_fila: 'NA_FILA' });
          return msg_('success', 'Você chegou no raio permitido e entrou na fila automaticamente!');
        }
        atualizar_('Solicitacoes', pend.id, { status: 'ENTROU_RAIO', observacao: 'Motorista já estava na fila' });
      }
      const reg = registroAtivo_(m.id, ['NA_FILA', 'PAUSADO']);
      if (reg && reg.dentro_raio === false) {
        atualizar_('Fila', reg.id, { dentro_raio: true });
        mov_(dadosMot_(m), 'ENTROU_RAIO', { posicao_nova: reg.ordem, observacao: 'Motorista chegou no raio e foi movido para a fila de dentro do raio', status_fila: reg.status });
        return msg_('success', 'Você chegou no raio permitido!');
      }
      return null;
    });
  });
}

/* ===================== ADMIN — FILA ===================== */

function aprovarSolicitacao(token, solId) {
  return api_(function () {
    sessao_(token, 'A');
    return comLock_(function () {
      const sol = buscar_('Solicitacoes', solId);
      if (!sol || sol.status !== 'PENDENTE') throw new Error('Esta solicitação não está mais pendente.');
      if (registroAtivo_(sol.motorista_id)) {
        atualizar_('Solicitacoes', sol.id, { status: 'APROVADO', admin_responsavel: 'admin', observacao: 'Motorista já estava na fila' });
        return true;
      }
      const m = buscar_('Motoristas', sol.motorista_id);
      const ordem = proximaOrdem_();
      inserir_('Fila', {
        motorista_id: sol.motorista_id, motorista_nome: sol.motorista_nome, motorista_cpf: sol.motorista_cpf,
        motorista_regime: m ? m.regime : '', motorista_placa: sol.motorista_placa,
        status: 'NA_FILA', ordem: ordem, dentro_raio: false, hora_entrada: agoraIso_(),
        latitude: sol.latitude, longitude: sol.longitude
      });
      atualizar_('Solicitacoes', sol.id, { status: 'APROVADO', admin_responsavel: 'admin' });
      mov_(dadosItem_(sol), 'SOLICITACAO_APROVADA', { posicao_nova: ordem, admin_responsavel: 'admin', observacao: 'Solicitação de entrada aprovada (fora do raio)', status_fila: 'NA_FILA' });
      return true;
    });
  });
}

function rejeitarSolicitacao(token, solId) {
  return api_(function () {
    sessao_(token, 'A');
    return comLock_(function () {
      const sol = buscar_('Solicitacoes', solId);
      if (!sol || sol.status !== 'PENDENTE') throw new Error('Esta solicitação não está mais pendente.');
      atualizar_('Solicitacoes', sol.id, { status: 'REJEITADO', admin_responsavel: 'admin' });
      mov_(dadosItem_(sol), 'SOLICITACAO_REJEITADA', { admin_responsavel: 'admin', observacao: 'Solicitação de entrada rejeitada', status_fila: 'REJEITADO' });
      return true;
    });
  });
}

/** Marca um motorista da fila como chamado (dentro do bloqueio). */
function chamarItem_(item, detalhe, pos) {
  atualizar_('Fila', item.id, { status: 'EM_ATENDIMENTO', inicio_atendimento: agoraIso_() });
  hist_(dadosItem_(item), 'CHAMADO_ATENDIMENTO', { detalhes: detalhe, admin_responsavel: 'admin', posicao_fila: pos });
  mov_(dadosItem_(item), 'CHAMADO_ATENDIMENTO', { posicao_anterior: item.ordem, posicao_nova: item.ordem, admin_responsavel: 'admin', observacao: detalhe, status_fila: 'EM_ATENDIMENTO' });
  return limpar_(item);
}

/**
 * Chama o próximo da fila. NÃO precisa finalizar quem já está em atendimento:
 * dá para clicar várias vezes seguidas. filaId = quem o operador viu como próximo na tela.
 */
function chamarProximo(token, filaId) {
  return api_(function () {
    sessao_(token, 'A');
    const chamado = comLock_(function () {
      const fila = naFilaOrdenada_();
      if (!fila.length) throw new Error('Não há motoristas aguardando.');
      let pos = 0;
      if (filaId) { const k = fila.findIndex(function (f) { return f.id === filaId; }); if (k > -1) pos = k; }
      return chamarItem_(fila[pos], 'Motorista chamado para atendimento', pos + 1);
    });
    const avisos = notificarChamada_(chamado);
    return { id: chamado.id, nome: chamado.motorista_nome, avisos: avisos };
  });
}

/**
 * Chama de uma vez os motoristas escolhidos (ids), sempre NA ORDEM DA FILA.
 * Quem já foi chamado ou saiu da fila é ignorado.
 */
function chamarVarios(token, ids) {
  return api_(function () {
    sessao_(token, 'A');
    const quer = {};
    (ids || []).forEach(function (id) { quer[id] = true; });
    const chamados = comLock_(function () {
      const fila = naFilaOrdenada_();
      const escolhidos = fila.filter(function (f) { return quer[f.id]; });
      if (!escolhidos.length) throw new Error('Nenhum dos motoristas escolhidos está aguardando na fila.');
      return escolhidos.map(function (item, i) {
        return chamarItem_(item, 'Chamado em grupo (' + (i + 1) + 'º de ' + escolhidos.length + ')', fila.indexOf(item) + 1);
      });
    });
    let falhas = 0;
    chamados.forEach(function (item) {
      try { notificarChamada_(item).forEach(function (a) { if (/falhou/.test(a)) falhas++; }); } catch (e) { falhas++; }
    });
    return { qtd: chamados.length, ids: chamados.map(function (c) { return c.id; }), nomes: chamados.map(function (c) { return c.motorista_nome; }), falhas: falhas };
  });
}

/** Mantido por compatibilidade: chama todos os que aguardam (incluirFora=false só os de dentro do raio). */
function chamarTodos(token, incluirFora) {
  const ids = naFilaOrdenada_().filter(function (f) { return incluirFora !== false || f.dentro_raio !== false; }).map(function (f) { return f.id; });
  return chamarVarios(token, ids);
}

function itemAtivoOuErro_(filaId) {
  const item = buscar_('Fila', filaId);
  if (!item || STATUS_ATIVOS.indexOf(item.status) === -1) throw new Error('Este motorista não está mais na fila. A tela foi atualizada.');
  return item;
}

function pausarAtendimento(token, filaId) {
  return api_(function () {
    sessao_(token, 'A');
    return comLock_(function () {
      const item = itemAtivoOuErro_(filaId);
      atualizar_('Fila', item.id, { status: 'PAUSADO' });
      hist_(dadosItem_(item), 'ATENDIMENTO_PAUSADO', { detalhes: 'Atendimento pausado pelo admin', admin_responsavel: 'admin' });
      mov_(dadosItem_(item), 'ATENDIMENTO_PAUSADO', { admin_responsavel: 'admin', observacao: 'Atendimento pausado pelo admin', status_fila: 'PAUSADO' });
      return true;
    });
  });
}

function retomarAtendimento(token, filaId) {
  return api_(function () {
    sessao_(token, 'A');
    return comLock_(function () {
      const item = itemAtivoOuErro_(filaId);
      const ordem = proximaOrdem_();
      atualizar_('Fila', item.id, { status: 'NA_FILA', ordem: ordem });
      hist_(dadosItem_(item), 'ATENDIMENTO_RETOMADO', { detalhes: 'Motorista retomado à fila pelo admin', admin_responsavel: 'admin', posicao_fila: ordem });
      mov_(dadosItem_(item), 'ATENDIMENTO_RETOMADO', { posicao_nova: ordem, admin_responsavel: 'admin', observacao: 'Motorista retomado à fila', status_fila: 'NA_FILA' });
      return true;
    });
  });
}

function removerDaFila(token, filaId) {
  return api_(function () {
    sessao_(token, 'A');
    return comLock_(function () {
      const item = itemAtivoOuErro_(filaId);
      const txt = 'Removido da fila (estava ' + textoStatus_(item.status) + ')';
      hist_(dadosItem_(item), 'REMOVIDO_PELO_ADMIN', { detalhes: txt, admin_responsavel: 'admin' });
      mov_(dadosItem_(item), 'REMOVIDO_PELO_ADMIN', { posicao_anterior: item.ordem, admin_responsavel: 'admin', observacao: txt, status_fila: item.status });
      excluir_('Fila', item.id);
      return true;
    });
  });
}

function finalizarAtendimento(token, filaId) {
  return api_(function () {
    sessao_(token, 'A');
    return comLock_(function () {
      const item = itemAtivoOuErro_(filaId);
      atualizar_('Fila', item.id, { status: 'FINALIZADO', fim_atendimento: agoraIso_() });
      hist_(dadosItem_(item), 'ATENDIMENTO_FINALIZADO', { detalhes: 'Atendimento finalizado pelo admin', admin_responsavel: 'admin' });
      mov_(dadosItem_(item), 'ATENDIMENTO_FINALIZADO', { admin_responsavel: 'admin', observacao: 'Atendimento finalizado', status_fila: 'FINALIZADO' });
      return true;
    });
  });
}

/** direcao: -1 sobe, +1 desce */
function moverNaFila(token, filaId, direcao) {
  return api_(function () {
    sessao_(token, 'A');
    return comLock_(function () {
      const fila = naFilaOrdenada_();
      const i = fila.findIndex(function (f) { return f.id === filaId; });
      const j = i + (direcao < 0 ? -1 : 1);
      if (i < 0 || j < 0 || j >= fila.length) return false;
      const a = fila[i], b = fila[j];
      const oa = a.ordem, ob = b.ordem;
      atualizar_('Fila', a.id, { ordem: ob });
      atualizar_('Fila', b.id, { ordem: oa });
      mov_(dadosItem_(a), 'POSICAO_ALTERADA', {
        posicao_anterior: oa, posicao_nova: ob, admin_responsavel: 'admin',
        observacao: direcao < 0 ? 'Posição alterada (subiu na fila)' : 'Posição alterada (desceu na fila)', status_fila: 'NA_FILA'
      });
      return true;
    });
  });
}

/** Recebe a nova ordem (ids) da lista "Dentro do raio". Os de fora do raio ficam onde estão. */
function reordenarFila(token, idsDentro) {
  return api_(function () {
    sessao_(token, 'A');
    return comLock_(function () {
      const fila = naFilaOrdenada_();
      const dentro = fila.filter(function (f) { return f.dentro_raio !== false; });
      const novaDentro = idsDentro.map(function (id) { return dentro.find(function (f) { return f.id === id; }); })
        .filter(function (x) { return !!x; });
      dentro.forEach(function (f) { if (novaDentro.indexOf(f) === -1) novaDentro.push(f); });
      let k = 0;
      const final = fila.map(function (f) { return f.dentro_raio !== false ? novaDentro[k++] : f; });
      final.forEach(function (f, idx) {
        const nova = idx + 1;
        if (f.ordem !== nova) {
          const ant = f.ordem;
          atualizar_('Fila', f.id, { ordem: nova });
          mov_(dadosItem_(f), 'REORDENADO', { posicao_anterior: ant, posicao_nova: nova, admin_responsavel: 'admin', observacao: 'Fila reordenada (arrastar e soltar)', status_fila: 'NA_FILA' });
        }
      });
      return true;
    });
  });
}

function adicionarNaFila(token, motoristaId) {
  return api_(function () {
    sessao_(token, 'A');
    return comLock_(function () {
      const m = buscar_('Motoristas', motoristaId);
      if (!m) throw new Error('Motorista não encontrado');
      if (m.bloqueado) throw new Error('Este motorista está bloqueado');
      if (registroAtivo_(m.id)) throw new Error('Este motorista já está na fila');
      const ordem = proximaOrdem_();
      inserir_('Fila', {
        motorista_id: m.id, motorista_nome: m.nome_completo, motorista_cpf: m.cpf,
        motorista_regime: m.regime, motorista_placa: m.placa,
        status: 'NA_FILA', ordem: ordem, hora_entrada: agoraIso_()
      });
      mov_(dadosMot_(m), 'ENTRADA_NA_FILA', { posicao_nova: ordem, admin_responsavel: 'admin', observacao: 'Motorista adicionado à fila pelo admin', status_fila: 'NA_FILA' });
      return true;
    });
  });
}


/* ============================================================
   MOTORISTAS
   ============================================================ */
/**
 * MOTORISTAS — cadastro, edição, bloqueio, exclusão, foto e documentos (CNH / CRLV).
 */

const REGIMES = ['CLT', 'AGREGADO', 'AVULSO', 'TESTER'];

function limparPlaca_(p) { return String(p || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }

function auditoria_(m, acao, motivo, detalhes) {
  inserir_('Auditoria', {
    admin_email: 'admin', motorista_id: m.id, motorista_nome: m.nome_completo, motorista_cpf: m.cpf,
    acao: acao, motivo: motivo || '', detalhes: detalhes ? JSON.stringify(detalhes) : ''
  });
}

function listarMotoristas(token) {
  return api_(function () {
    sessao_(token, 'A');
    return todos_('Motoristas').map(motoristaPublico_)
      .sort(function (a, b) { return String(a.nome_completo).localeCompare(String(b.nome_completo)); });
  });
}

function cadastrarMotorista(token, d) {
  return api_(function () {
    sessao_(token, 'A');
    const cpf = String(d.cpf || '').replace(/\D/g, '');
    if (cpf.length !== 11) throw new Error('CPF inválido');
    if (!d.nome_completo || !String(d.nome_completo).trim() || !d.senha || !d.regime) throw new Error('Preencha todos os campos obrigatórios');
    if (REGIMES.indexOf(d.regime) === -1) throw new Error('Regime inválido');
    return comLock_(function () {
      if (todos_('Motoristas').some(function (m) { return m.cpf === cpf; })) throw new Error('CPF já cadastrado no sistema');
      const m = inserir_('Motoristas', {
        nome_completo: String(d.nome_completo).trim(), cpf: cpf, senha: hashSenha_(d.senha), regime: d.regime,
        placa: limparPlaca_(d.placa), telefone: String(d.telefone || '').replace(/\D/g, '').slice(0, 13),
        rastreado: !!d.rastreado, bloqueado: false,
        cnh_aprovado: false, crlv_aprovado: false
      });
      return motoristaPublico_(m);
    });
  });
}

function editarMotorista(token, id, d) {
  return api_(function () {
    sessao_(token, 'A');
    if (!d.nome_completo || !String(d.nome_completo).trim() || !d.regime) throw new Error('Preencha todos os campos obrigatórios');
    if (REGIMES.indexOf(d.regime) === -1) throw new Error('Regime inválido');
    return comLock_(function () {
      const m = buscar_('Motoristas', id);
      if (!m) throw new Error('Motorista não encontrado');
      const patch = {
        nome_completo: String(d.nome_completo).trim(), regime: d.regime, placa: limparPlaca_(d.placa),
        telefone: String(d.telefone || '').replace(/\D/g, '').slice(0, 13), rastreado: !!d.rastreado
      };
      if (d.senha) patch.senha = hashSenha_(d.senha);
      const antes = { nome: m.nome_completo, regime: m.regime, placa: m.placa };
      const novo = atualizar_('Motoristas', id, patch);
      // mantém o nome/placa atualizados se ele estiver na fila agora
      const reg = registroAtivo_(id);
      if (reg) atualizar_('Fila', reg.id, { motorista_nome: novo.nome_completo, motorista_placa: novo.placa, motorista_regime: novo.regime });
      auditoria_(novo, 'EDITADO', d.senha ? 'Dados e senha alterados' : 'Dados alterados', antes);
      return motoristaPublico_(novo);
    });
  });
}

function bloquearMotorista(token, id, bloquear, motivo) {
  return api_(function () {
    sessao_(token, 'A');
    return comLock_(function () {
      const m = buscar_('Motoristas', id);
      if (!m) throw new Error('Motorista não encontrado');
      const novo = atualizar_('Motoristas', id, { bloqueado: !!bloquear, motivo_bloqueio: bloquear ? (motivo || '') : '' });
      auditoria_(novo, bloquear ? 'BLOQUEADO' : 'DESBLOQUEADO', motivo || '');
      return motoristaPublico_(novo);
    });
  });
}

function infoExclusao(token, id) {
  return api_(function () {
    sessao_(token, 'A');
    const reg = registroAtivo_(id);
    return { naFila: !!reg, status: reg ? reg.status : null };
  });
}

function deletarMotorista(token, id, motivo, confirmacao) {
  return api_(function () {
    sessao_(token, 'A');
    if (confirmacao !== 'APAGAR') throw new Error('Digite "APAGAR" para confirmar');
    return comLock_(function () {
      const m = buscar_('Motoristas', id);
      if (!m) throw new Error('Motorista não encontrado');
      const reg = registroAtivo_(id);
      if (reg) excluir_('Fila', reg.id);
      const pend = todos_('Solicitacoes').filter(function (x) { return x.motorista_id === id && x.status === 'PENDENTE'; });
      pend.forEach(function (x) { atualizar_('Solicitacoes', x.id, { status: 'CANCELADA', observacao: 'Motorista excluído' }); });
      auditoria_(m, reg ? 'REMOVIDO_DA_FILA' : 'DELETADO', motivo || 'Sem motivo especificado',
        { estava_na_fila: !!reg, status_fila: reg ? reg.status : null, excluido: true });
      excluir_('Motoristas', id);
      CacheService.getScriptCache().put('del_' + id, '1', 21600);
      return true;
    });
  });
}

function perfilMotorista(token, id) {
  return api_(function () {
    sessao_(token, 'A');
    const m = buscar_('Motoristas', id);
    if (!m) throw new Error('Motorista não encontrado');
    const atend = todos_('Fila').filter(function (f) { return f.motorista_id === id; }).map(limpar_)
      .sort(function (a, b) { return msDe_(b.hora_entrada || b.created_date) - msDe_(a.hora_entrada || a.created_date); });
    const fin = atend.filter(function (a) { return a.status === 'FINALIZADO'; });
    const media = function (arr) { return arr.length ? Math.round(arr.reduce(function (a, b) { return a + b; }, 0) / arr.length) : 0; };
    const esp = fin.filter(function (a) { return a.hora_entrada && a.inicio_atendimento; })
      .map(function (a) { return (Date.parse(a.inicio_atendimento) - Date.parse(a.hora_entrada)) / 60000; });
    const at = fin.filter(function (a) { return a.inicio_atendimento && a.fim_atendimento; })
      .map(function (a) { return (Date.parse(a.fim_atendimento) - Date.parse(a.inicio_atendimento)) / 60000; });
    const comLoc = atend.find(function (a) { return a.latitude !== null && a.longitude !== null; });
    return {
      motorista: motoristaPublico_(m),
      historico: atend.slice(0, 100),
      statusFila: atend.find(function (a) { return STATUS_ATIVOS.indexOf(a.status) > -1; }) || null,
      ultimaLocalizacao: comLoc ? { lat: comLoc.latitude, lng: comLoc.longitude, quando: comLoc.hora_entrada || comLoc.created_date } : null,
      stats: { totalAtendimentos: fin.length, tempoMedioEspera: media(esp), tempoMedioAtendimento: media(at) },
      ntfyTopico: topicoNtfy_(m)
    };
  });
}

/* ===================== DOCUMENTOS ===================== */

function salvarDocumentos(token, id, d) {
  return api_(function () {
    sessao_(token, 'A');
    return comLock_(function () {
      const patch = {};
      ['cnh_numero', 'cnh_categoria', 'cnh_validade', 'crlv_renavam', 'crlv_validade'].forEach(function (k) {
        if (d[k] !== undefined) patch[k] = String(d[k] || '').trim();
      });
      if (patch.cnh_categoria) patch.cnh_categoria = patch.cnh_categoria.toUpperCase();
      return motoristaPublico_(atualizar_('Motoristas', id, patch));
    }, { semVersao: true });
  });
}

function aprovarDocumento(token, id, tipo, aprovado) {
  return api_(function () {
    sessao_(token, 'A');
    if (tipo !== 'cnh' && tipo !== 'crlv') throw new Error('Tipo inválido');
    return comLock_(function () {
      const p = {}; p[tipo + '_aprovado'] = !!aprovado;
      return motoristaPublico_(atualizar_('Motoristas', id, p));
    }, { semVersao: true });
  });
}

function pasta_(sub) {
  const raiz = DriveApp.getFolderById(PropertiesService.getScriptProperties().getProperty('PASTA_ID'));
  const it = raiz.getFoldersByName(sub);
  return it.hasNext() ? it.next() : raiz.createFolder(sub);
}

function blobDeDataUrl_(dataUrl, nome) {
  const m = String(dataUrl).match(/^data:([^;]+);base64,(.*)$/);
  if (!m) throw new Error('Arquivo inválido');
  return Utilities.newBlob(Utilities.base64Decode(m[2]), m[1], nome);
}

function apagarArquivo_(fileId) {
  if (!fileId) return;
  try { DriveApp.getFileById(fileId).setTrashed(true); } catch (e) { /* já não existe */ }
}

function enviarDocumento(token, id, tipo, dataUrl, nomeArquivo) {
  return api_(function () {
    sessao_(token, 'A');
    if (tipo !== 'cnh' && tipo !== 'crlv') throw new Error('Tipo inválido');
    const m0 = buscar_('Motoristas', id);
    if (!m0) throw new Error('Motorista não encontrado');
    const blob = blobDeDataUrl_(dataUrl, tipo.toUpperCase() + '_' + m0.cpf + '_' + (nomeArquivo || 'documento'));
    const mime = blob.getContentType();
    if (mime !== 'application/pdf' && mime.indexOf('image/') !== 0) throw new Error('Apenas imagens e PDFs são permitidos');
    const arq = pasta_('Documentos').createFile(blob);

    let extraido = null, statusExtracao = null;
    try {
      extraido = extrairDadosDocumento_(arq, tipo);
      statusExtracao = extraido && Object.keys(extraido).length ? 'success' : 'error';
    } catch (e) {
      console.error('OCR: ' + e);
      statusExtracao = 'error';
    }

    const m = comLock_(function () {
      const atual = buscar_('Motoristas', id);
      const antigo = atual[tipo + '_documento_id'];
      const p = {};
      p[tipo + '_documento_id'] = arq.getId();
      p[tipo + '_documento_tipo'] = mime;
      p[tipo + '_aprovado'] = false;
      if (extraido) Object.keys(extraido).forEach(function (k) { if (extraido[k]) p[k] = extraido[k]; });
      const novo = atualizar_('Motoristas', id, p);
      if (antigo && antigo !== arq.getId()) apagarArquivo_(antigo);
      return novo;
    }, { semVersao: true });
    return { motorista: motoristaPublico_(m), extracao: statusExtracao };
  });
}

/** Lê o texto do documento com o OCR gratuito do Google Drive e procura número, categoria e validade. */
function extrairDadosDocumento_(arquivo, tipo) {
  if (typeof Drive === 'undefined') return null; // serviço "Drive API" não ativado
  const doc = Drive.Files.create(
    { name: 'ocr_tmp_' + arquivo.getId(), mimeType: 'application/vnd.google-apps.document' },
    arquivo.getBlob(),
    { ocrLanguage: 'pt' }
  );
  let texto = '';
  try {
    texto = DocumentApp.openById(doc.id).getBody().getText();
  } finally {
    apagarArquivo_(doc.id);
  }
  return interpretarTextoDocumento_(texto, tipo);
}

function interpretarTextoDocumento_(texto, tipo) {
  const T = String(texto || '').toUpperCase().replace(/\r/g, '');
  const datas = [];
  const re = /(\d{2})[\/\.-](\d{2})[\/\.-](\d{4})/g;
  let x;
  while ((x = re.exec(T)) !== null) {
    datas.push({ i: x.index, iso: x[3] + '-' + x[2] + '-' + x[1] });
  }
  const dataApos = function (palavra) {
    const p = T.indexOf(palavra);
    if (p === -1) return '';
    const d = datas.find(function (q) { return q.i > p && q.i - p < 120; });
    return d ? d.iso : '';
  };
  const maior = datas.length ? datas.map(function (d) { return d.iso; }).sort().pop() : '';
  const out = {};
  if (tipo === 'cnh') {
    const reg = T.match(/REGISTRO[^\d]{0,40}(\d{9,11})/) || T.match(/\b(\d{11})\b/);
    if (reg) out.cnh_numero = reg[1];
    const cat = T.match(/CAT\.?\s*HAB\.?[^A-Z]{0,15}\b(ACC|AB|AC|AD|AE|A|B|C|D|E)\b/);
    if (cat) out.cnh_categoria = cat[1];
    out.cnh_validade = dataApos('VALIDADE') || maior;
  } else {
    const ren = T.match(/RENAVAM[^\d]{0,40}(\d{9,11})/);
    if (ren) out.crlv_renavam = ren[1];
    out.crlv_validade = dataApos('VALIDADE') || '';
  }
  Object.keys(out).forEach(function (k) { if (!out[k]) delete out[k]; });
  return out;
}

/* ===================== FOTOS E ARQUIVOS ===================== */

function enviarFoto(token, dataUrl) {
  return api_(function () {
    const s = sessao_(token, 'M');
    const m0 = buscar_('Motoristas', s.id);
    if (!m0) throw new Error('SESSAO_EXPIRADA');
    const blob = blobDeDataUrl_(dataUrl, 'FOTO_' + m0.cpf + '.jpg');
    if (blob.getContentType().indexOf('image/') !== 0) throw new Error('Envie uma imagem');
    const arq = pasta_('Fotos').createFile(blob);
    const m = comLock_(function () {
      const antigo = buscar_('Motoristas', s.id).foto_id;
      const novo = atualizar_('Motoristas', s.id, { foto_id: arq.getId() });
      if (antigo) apagarArquivo_(antigo);
      return novo;
    }, { semVersao: true });
    return motoristaPublico_(m);
  });
}

/** Devolve um arquivo (foto/documento) em base64 — só se ele pertencer a um motorista. */
function getArquivo(token, fileId) {
  return api_(function () {
    const s = sessao_(token);
    if (!fileId) throw new Error('Arquivo não informado');
    const dono = todos_('Motoristas').find(function (m) {
      return m.foto_id === fileId || m.cnh_documento_id === fileId || m.crlv_documento_id === fileId;
    });
    if (!dono) throw new Error('Arquivo não encontrado');
    if (s.t === 'M' && !(dono.id === s.id && dono.foto_id === fileId)) throw new Error('Acesso negado.');
    const blob = DriveApp.getFileById(fileId).getBlob();
    return { mime: blob.getContentType(), nome: blob.getName(), base64: Utilities.base64Encode(blob.getBytes()) };
  });
}


/* ============================================================
   RELATORIOS
   ============================================================ */
/**
 * RELATÓRIOS E CONFIGURAÇÕES DO ADMIN
 */

function ultimos_(lista, n) {
  return lista.slice().sort(maisRecentePrimeiro_).slice(0, n).map(limpar_);
}

/** Atendimentos finalizados (Relatórios e Viagens). */
function dadosAtendimentos(token) {
  return api_(function () {
    sessao_(token, 'A');
    const testers = todos_('Motoristas').filter(function (m) { return m.regime === 'TESTER'; }).map(function (m) { return m.id; });
    const fin = todos_('Fila').filter(function (f) { return f.status === 'FINALIZADO'; }).map(function (f) {
      return {
        id: f.id, motorista_id: f.motorista_id, motorista_nome: f.motorista_nome, motorista_cpf: f.motorista_cpf,
        motorista_regime: f.motorista_regime, motorista_placa: f.motorista_placa, created_date: f.created_date,
        hora_entrada: f.hora_entrada, inicio_atendimento: f.inicio_atendimento, fim_atendimento: f.fim_atendimento
      };
    });
    return { finalizados: fin, testers: testers };
  });
}

/** Movimentos da fila (Presença e Movimentos). */
function dadosMovimentos(token) {
  return api_(function () {
    sessao_(token, 'A');
    return ultimos_(todos_('Movimentos'), 10000);
  });
}

function dadosLogs(token) {
  return api_(function () {
    sessao_(token, 'A');
    return ultimos_(todos_('LogsFalha'), 200);
  });
}

function dadosHistorico(token) {
  return api_(function () {
    sessao_(token, 'A');
    return {
      historico: ultimos_(todos_('Historico'), 1000),
      auditoria: ultimos_(todos_('Auditoria'), 300)
    };
  });
}

/* ===================== CONFIGURAÇÕES ===================== */

function getConfigAdmin(token) {
  return api_(function () {
    sessao_(token, 'A');
    const c = config_();
    return {
      lat: Number(c.local_base_lat), lng: Number(c.local_base_lng), raio: Number(c.raio_permitido_metros) || 1000,
      endereco: c.endereco_base || '', logo_url: c.logo_url || '',
      cooldown_minutos: Number(c.cooldown_minutos) || 15, precisao_max_metros: Number(c.precisao_max_metros) || 50,
      whatsapp_ativo: c.whatsapp_ativo === 'SIM', evolution_url: c.evolution_url || '', evolution_instance: c.evolution_instance || '',
      evolution_key_definida: !!c.evolution_key,
      ntfy_ativo: c.ntfy_ativo === 'SIM', ntfy_servidor: c.ntfy_servidor || 'https://ntfy.sh', ntfy_prefixo: c.ntfy_prefixo || '',
      planilha_url: ss_().getUrl(),
      favicon_url: c.favicon_url || '',
      dias_manter: Number(c.dias_manter) || 60,
      arquivo_url: PropertiesService.getScriptProperties().getProperty('ARQUIVO_ID') ? 'https://docs.google.com/spreadsheets/d/' + PropertiesService.getScriptProperties().getProperty('ARQUIVO_ID') : '',
      ultimo_arquivamento: c.ultimo_arquivamento || '',
      ultimo_arquivamento_resumo: c.ultimo_arquivamento_resumo || ''
    };
  });
}

function salvarLocalizacao(token, d) {
  return api_(function () {
    sessao_(token, 'A');
    const raio = Number(d.raio);
    if (!(raio >= 50 && raio <= 10000)) throw new Error('O raio deve estar entre 50 e 10.000 metros');
    if (isNaN(Number(d.lat)) || isNaN(Number(d.lng))) throw new Error('Posição inválida. Clique no mapa para definir a localização.');
    return comLock_(function () {
      salvarConfig_({
        local_base_lat: Number(d.lat), local_base_lng: Number(d.lng),
        raio_permitido_metros: Math.round(raio), endereco_base: d.endereco || ''
      });
      return true;
    });
  });
}

function salvarRegras(token, d) {
  return api_(function () {
    sessao_(token, 'A');
    const cd = Number(d.cooldown_minutos), pr = Number(d.precisao_max_metros);
    if (!(cd >= 0 && cd <= 600)) throw new Error('Intervalo deve ficar entre 0 e 600 minutos');
    if (!(pr >= 10 && pr <= 1000)) throw new Error('Precisão deve ficar entre 10 e 1000 metros');
    return comLock_(function () {
      const dm = Number(d.dias_manter) || 60;
      if (dm < 30 || dm > 365) throw new Error('Guardar entre 30 e 365 dias');
      salvarConfig_({ cooldown_minutos: Math.round(cd), precisao_max_metros: Math.round(pr), logo_url: String(d.logo_url || '').trim(),
        favicon_url: String(d.favicon_url || '').trim(), dias_manter: Math.round(dm) });
      return true;
    });
  });
}

function alterarChave(token, nova, confirmar) {
  return api_(function () {
    sessao_(token, 'A');
    if (!nova || String(nova).length < 16) throw new Error('A chave deve ter pelo menos 16 caracteres');
    if (nova !== confirmar) throw new Error('As chaves não coincidem');
    return comLock_(function () {
      salvarConfig_({ chave_admin_hash: hashSenha_(nova) });
      return { token: criarToken_({ t: 'A', kv: versaoChave_() }, 30) };
    }, { semVersao: true });
  });
}

function salvarIntegracoes(token, d) {
  return api_(function () {
    sessao_(token, 'A');
    return comLock_(function () {
      const v = {
        whatsapp_ativo: d.whatsapp_ativo ? 'SIM' : 'NAO',
        evolution_url: String(d.evolution_url || '').trim().replace(/\/+$/, ''),
        evolution_instance: String(d.evolution_instance || '').trim(),
        ntfy_ativo: d.ntfy_ativo ? 'SIM' : 'NAO',
        ntfy_servidor: String(d.ntfy_servidor || 'https://ntfy.sh').trim().replace(/\/+$/, '')
      };
      if (d.evolution_key) v.evolution_key = String(d.evolution_key).trim();
      salvarConfig_(v);
      return true;
    }, { semVersao: true });
  });
}

function testarWhatsApp(token, telefone) {
  return api_(function () {
    sessao_(token, 'A');
    return enviarWhatsApp_(telefone, '✅ Teste da *Fila Virtual*: o envio de mensagens está funcionando.');
  });
}


/* ============================================================
   NOTIFICACOES
   ============================================================ */
/**
 * AVISOS — WhatsApp (Evolution API) e ntfy (alerta no celular mesmo com o app fechado).
 */

function topicoNtfy_(m) {
  const c = config_();
  return (c.ntfy_prefixo || 'filavirtual') + '-' + String(m.id || '').replace(/-/g, '').slice(0, 10);
}

function infoNtfy_(m) {
  const c = config_();
  if (c.ntfy_ativo !== 'SIM') return null;
  const servidor = c.ntfy_servidor || 'https://ntfy.sh';
  const topico = topicoNtfy_(m);
  return { servidor: servidor, topico: topico, link: servidor + '/' + topico };
}

function enviarWhatsApp_(telefone, mensagem) {
  const c = config_();
  if (!c.evolution_url || !c.evolution_key || !c.evolution_instance) throw new Error('Configurações da Evolution API não preenchidas');
  const limpo = String(telefone || '').replace(/\D/g, '');
  if (limpo.length < 10) throw new Error('Telefone inválido');
  const numero = limpo.indexOf('55') === 0 && limpo.length >= 12 ? limpo : '55' + limpo;
  const r = UrlFetchApp.fetch(c.evolution_url + '/message/sendText/' + encodeURIComponent(c.evolution_instance), {
    method: 'post', contentType: 'application/json', headers: { apikey: c.evolution_key },
    payload: JSON.stringify({ number: numero, text: mensagem }), muteHttpExceptions: true
  });
  if (r.getResponseCode() >= 300) throw new Error('Falha ao enviar WhatsApp (' + r.getResponseCode() + '): ' + r.getContentText().slice(0, 200));
  return true;
}

function enviarNtfy_(m, titulo, texto) {
  const info = infoNtfy_(m);
  if (!info) return false;
  const r = UrlFetchApp.fetch(info.servidor, {
    method: 'post', contentType: 'application/json',
    payload: JSON.stringify({ topic: info.topico, title: titulo, message: texto, priority: 5, tags: ['rotating_light', 'truck'] }),
    muteHttpExceptions: true
  });
  if (r.getResponseCode() >= 300) throw new Error('Falha no ntfy (' + r.getResponseCode() + ')');
  return true;
}

/** Avisa o motorista que foi chamado. Nunca trava a fila se der erro. */
function notificarChamada_(item) {
  const avisos = [];
  const c = config_();
  const m = buscar_('Motoristas', item.motorista_id);
  if (!m) return avisos;
  if (c.whatsapp_ativo === 'SIM' && m.telefone) {
    try {
      enviarWhatsApp_(m.telefone,
        '🚨 *É A SUA VEZ!* 🚨\n\nOlá, *' + item.motorista_nome + '*!\n\nVocê está sendo chamado para atendimento agora.\n\n⚠️ Dirija-se ao posto de atendimento *IMEDIATAMENTE*.');
      avisos.push('WhatsApp enviado');
    } catch (e) { avisos.push('WhatsApp falhou: ' + e.message); }
  }
  if (c.ntfy_ativo === 'SIM') {
    try {
      enviarNtfy_(m, '🚨 É A SUA VEZ!', item.motorista_nome + ', dirija-se ao posto de atendimento IMEDIATAMENTE.');
      avisos.push('Alerta ntfy enviado');
    } catch (e) { avisos.push('ntfy falhou: ' + e.message); }
  }
  return avisos;
}


/* ===================== ÍCONE DA ABA (FAVICON) ===================== */

function criarFavicon_() {
  const cfg = config_();
  if (cfg.favicon_url && cfg.favicon_url.indexOf('drive.google.com') === -1) return; // URL própria definida pelo admin
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty('FAVICON_ID');
  let ok = false;
  if (id) { try { DriveApp.getFileById(id).getName(); ok = true; } catch (e) { ok = false; } }
  if (!ok) {
    const blob = Utilities.newBlob(Utilities.base64Decode(ICONE_PNG_B64), 'image/png', 'fila-de-atendimento-icone.png');
    const arq = DriveApp.getFolderById(props.getProperty('PASTA_ID')).createFile(blob);
    arq.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    id = arq.getId();
    props.setProperty('FAVICON_ID', id);
  }
  salvarConfig_({ favicon_url: 'https://drive.google.com/uc?export=download&id=' + id + '&format=png' });
}

/* ===================== ARQUIVO MORTO (dados com mais de 2 meses) ===================== */

const TABELAS_ARQUIVAVEIS = ['Fila', 'Solicitacoes', 'Movimentos', 'Historico', 'LogsFalha', 'Auditoria'];

function criarGatilhoArquivo_() {
  const existe = ScriptApp.getProjectTriggers().some(function (t) { return t.getHandlerFunction() === 'arquivarAntigos'; });
  if (!existe) ScriptApp.newTrigger('arquivarAntigos').timeBased().everyDays(1).atHour(3).create();
}

function planilhaArquivo_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('ARQUIVO_ID');
  if (id) { try { return SpreadsheetApp.openById(id); } catch (e) { /* recria */ } }
  const arq = SpreadsheetApp.create('Fila Virtual - Arquivo Morto');
  props.setProperty('ARQUIVO_ID', arq.getId());
  return arq;
}

/** Linha que ainda precisa ficar na planilha principal (fila ativa / solicitação pendente). */
function precisaFicar_(nome, obj) {
  if (nome === 'Fila') return STATUS_ATIVOS.indexOf(obj.status) > -1;
  if (nome === 'Solicitacoes') return obj.status === 'PENDENTE';
  return false;
}

/**
 * Move para a planilha "Fila Virtual - Arquivo Morto" tudo que tiver mais de 60 dias.
 * Roda sozinho todo dia às 3h. Também pode rodar pelo menu ou pelo painel admin.
 */
function arquivarAntigos() {
  const dias = Number(config_().dias_manter) || 60;
  const limiteMs = Date.now() - dias * 86400000;
  const resumo = {};
  const arquivo = planilhaArquivo_();
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(120000)) throw new Error('Sistema ocupado, tente de novo em alguns minutos.');
  try {
    TABELAS_ARQUIVAVEIS.forEach(function (nome) {
      delete _dados[nome];
      const sh = aba_(nome);
      const last = sh.getLastRow(), ncol = sh.getLastColumn();
      if (last < 2) { resumo[nome] = 0; return; }
      const cab = sh.getRange(1, 1, 1, ncol).getValues()[0].map(String);
      const iData = cab.indexOf('created_date'), iSt = cab.indexOf('status');
      const vals = sh.getRange(2, 1, last - 1, ncol).getValues();
      const ficam = [], vao = [];
      vals.forEach(function (r) {
        const ms = msDe_(r[iData]);
        const velho = ms > 0 && ms < limiteMs;
        const obj = { status: iSt > -1 ? String(r[iSt]) : '' };
        if (velho && !precisaFicar_(nome, obj)) vao.push(r); else ficam.push(r);
      });
      resumo[nome] = vao.length;
      if (!vao.length) return;

      // 1) copia para o arquivo morto
      let destino = arquivo.getSheetByName(nome);
      if (!destino) {
        destino = arquivo.insertSheet(nome);
        if (destino.getMaxColumns() < ncol) destino.insertColumnsAfter(destino.getMaxColumns(), ncol - destino.getMaxColumns());
        destino.getRange(1, 1, 1, ncol).setValues([cab]).setFontWeight('bold').setBackground('#0b3d61').setFontColor('#ffffff');
        destino.setFrozenRows(1);
      }
      const ini = destino.getLastRow() + 1;
      if (destino.getMaxRows() < ini + vao.length) destino.insertRowsAfter(destino.getMaxRows(), ini + vao.length - destino.getMaxRows());
      destino.getRange(ini, 1, vao.length, ncol).setNumberFormat('@').setValues(vao);
      SpreadsheetApp.flush();

      // 2) reescreve a principal só com o que fica
      sh.getRange(2, 1, last - 1, ncol).clearContent();
      if (ficam.length) sh.getRange(2, 1, ficam.length, ncol).setNumberFormat('@').setValues(ficam);
      const sobra = sh.getMaxRows() - (ficam.length + 1);
      if (sobra > 200) sh.deleteRows(ficam.length + 2 + 100, sobra - 100);
      delete _dados[nome];
    });
    ['Página1', 'Sheet1', 'Planilha1'].forEach(function (n) {
      const p = arquivo.getSheetByName(n);
      if (p && p.getLastRow() === 0 && arquivo.getSheets().length > 1) arquivo.deleteSheet(p);
    });
    SpreadsheetApp.flush();
    const v = bumpVersao_();
    guardarSnapshot_(v, montarSnapshot_());
  } finally {
    lock.releaseLock();
  }
  salvarConfig_({ ultimo_arquivamento: agoraIso_(), ultimo_arquivamento_resumo: JSON.stringify(resumo) });
  Logger.log('Arquivados: ' + JSON.stringify(resumo));
  return resumo;
}

/** Botão "Arquivar agora" do painel admin. */
function arquivarAgora(token) {
  return api_(function () {
    sessao_(token, 'A');
    return { resumo: arquivarAntigos(), url: planilhaArquivo_().getUrl() };
  });
}

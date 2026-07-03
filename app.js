const state = {
  records: [],
  filteredRecords: [],
  validation: null,
  sortKey: 'dataExecucao',
  sortDirection: 'desc',
  currentPage: 1,
  pageSize: 10,
  sidebarCollapsed: false,
  sectionCollapsed: {},
  filters: {
    dateFrom: '',
    dateTo: '',
    month: '',
    cycle: '',
    brand: '',
    qa: '',
    client: '',
    status: '',
    stage: '',
    longa: '',
    plan: '',
    test: '',
    id: '',
    brandSearch: '',
    qaSearch: ''
  }
};

const SUPABASE_CONFIG = {
  url: 'https://xijqmzpfyfsyjyvvhuvs.supabase.co',
  anonKey: 'sb_publishable_d1KTMDD-LCJunUkRq7pstQ_YbPjidPt',
  table: 'dashboard_registros'
};

const LOCAL_CACHE_KEY = 'sigc-dashboard-records-v1';
const LOCAL_CACHE_META_KEY = 'sigc-dashboard-records-meta-v1';

const REQUIRED_COLUMNS = [
  'Id Teste',
  'Marca',
  'Execução Teste',
  'Ciclo',
  'Teste',
  'Status Teste',
  'Responsável Teste',
  'Longa Duração',
  'Cliente'
];

const OPTIONAL_COLUMNS = ['Plano de Testes', 'Resultado Teste'];
const STAGE_LABELS = [
  '1 - Antes do Redirecionamento',
  '2 - Durante autenticação e login',
  '3 - Durante interação - consentimento pagamento',
  '4 - Após retorno à FVP',
  'Sem etapa informada'
];

const SAMPLE_CSV = `Id Teste,Marca,Execução Teste,Ciclo,Plano de Testes,Teste,Resultado Teste,Status Teste,Responsável Teste,Longa Duração,Cliente
5395,Sicredi,05/01/2026,13,Production Functional Tests for Credit Portability Scheduling - API Version 1,credit-portability_api_accepted_settlement,,OK,YGOR JARDIM DE SOUZA C,Não,ASSOCIACAO OPEN FINANCE
5396,Sicredi,06/01/2026,13,Production Functional Tests for Credit Portability Scheduling - API Version 1,credit-portability_api_token_login,2 - Durante autenticação e login,Não OK,YGOR JARDIM DE SOUZA C,Não,ASSOCIACAO OPEN FINANCE
5397,Bradesco,07/01/2026,13,Fluxo padrão,credito-pagamento,3 - Durante interação - consentimento pagamento,DCR,Marina Alves,Sim,Bradesco
5398,Bradesco,08/01/2026,14,Fluxo padrão,credito-pagamento-2,4 - Após retorno à FVP,Não OK,Marina Alves,Sim,Bradesco
5399,Itaú,10/01/2026,14,,onboarding_api,1 - Antes do Redirecionamento,OK,Paulo Lima,Não,Itaú
5400,Itaú,11/01/2026,15,Fluxo de autenticação,login_flow,,Status não mapeado,Paulo Lima,Sim,Itaú
5401,Inter,12/02/2026,15,Fluxo de consentimento,consentimento,3 - Durante interação - consentimento pagamento,Não OK,Carla Souza,Não,Inter
5402,Inter,13/02/2026,16,Fluxo de consentimento,consentimento,3 - Durante interação - consentimento pagamento,OK,Carla Souza,Não,Inter`;

const els = {
  dropZone: document.getElementById('dropZone'),
  appShell: document.querySelector('.app-shell'),
  sidebar: document.querySelector('.sidebar'),
  sidebarToggle: document.getElementById('sidebarToggle'),
  fileInput: document.getElementById('fileInput'),
  selectFilesBtn: document.getElementById('selectFilesBtn'),
  loadSampleBtn: document.getElementById('loadSampleBtn'),
  loadCloudBtn: document.getElementById('loadCloudBtn'),
  saveCloudBtn: document.getElementById('saveCloudBtn'),
  importStatus: document.getElementById('importStatus'),
  exportCsvBtn: document.getElementById('exportCsvBtn'),
  resetFiltersBtn: document.getElementById('resetFiltersBtn'),
  summaryCards: document.getElementById('summaryCards'),
  statusChart: document.getElementById('statusChart'),
  stageChart: document.getElementById('stageChart'),
  monthChart: document.getElementById('monthChart'),
  cycleChart: document.getElementById('cycleChart'),
  brandNotOkChart: document.getElementById('brandNotOkChart'),
  qaChart: document.getElementById('qaChart'),
  criticalBrands: document.getElementById('criticalBrands'),
  validationSummary: document.getElementById('validationSummary'),
  validationIssues: document.getElementById('validationIssues'),
  tableBody: document.getElementById('tableBody'),
  filteredCount: document.getElementById('filteredCount'),
  filterDateFrom: document.getElementById('filterDateFrom'),
  filterDateTo: document.getElementById('filterDateTo'),
  filterMonth: document.getElementById('filterMonth'),
  filterCycle: document.getElementById('filterCycle'),
  filterBrand: document.getElementById('filterBrand'),
  filterQa: document.getElementById('filterQa'),
  filterClient: document.getElementById('filterClient'),
  filterStatus: document.getElementById('filterStatus'),
  filterStage: document.getElementById('filterStage'),
  filterLonga: document.getElementById('filterLonga'),
  filterPlan: document.getElementById('filterPlan'),
  filterTest: document.getElementById('filterTest'),
  filterId: document.getElementById('filterId'),
  filterBrandSearch: document.getElementById('filterBrandSearch'),
  filterQaSearch: document.getElementById('filterQaSearch'),
  quickFilterCycle: document.getElementById('quickFilterCycle'),
  quickFilterBrand: document.getElementById('quickFilterBrand'),
  quickFilterQa: document.getElementById('quickFilterQa'),
  quickFilterStatus: document.getElementById('quickFilterStatus'),
  quickFilterTest: document.getElementById('quickFilterTest'),
  pageSizeSelect: document.getElementById('pageSizeSelect'),
  prevPageBtn: document.getElementById('prevPageBtn'),
  nextPageBtn: document.getElementById('nextPageBtn'),
  paginationInfo: document.getElementById('paginationInfo'),
  sortBy: document.getElementById('sortBy'),
  sortDirection: document.getElementById('sortDirection')
};

const COLUMN_ALIASES = new Map([
  ['id teste', 'idTeste'],
  ['idteste', 'idTeste'],
  ['marca', 'marca'],
  ['execucao teste', 'dataExecucao'],
  ['execucaoteste', 'dataExecucao'],
  ['execução teste', 'dataExecucao'],
  ['ciclo', 'ciclo'],
  ['plano de testes', 'planoTeste'],
  ['planodetestes', 'planoTeste'],
  ['teste', 'teste'],
  ['resultado teste', 'resultadoTeste'],
  ['resultadoteste', 'resultadoTeste'],
  ['status teste', 'statusTeste'],
  ['statusteste', 'statusTeste'],
  ['responsavel teste', 'responsavelTeste'],
  ['responsável teste', 'responsavelTeste'],
  ['responsavelteste', 'responsavelTeste'],
  ['longa duracao', 'longaDuracao'],
  ['longa duração', 'longaDuracao'],
  ['longaduracao', 'longaDuracao'],
  ['cliente', 'cliente']
]);

const STAGE_PATTERNS = [
  { label: STAGE_LABELS[0], patterns: ['antes do redirecionamento', 'before redirect', 'before redirection', 'redirect'] },
  { label: STAGE_LABELS[1], patterns: ['autentic', 'login'] },
  { label: STAGE_LABELS[2], patterns: ['consent', 'intera', 'pagamento', 'payment'] },
  { label: STAGE_LABELS[3], patterns: ['retorno', 'fvp', 'return to fvp', 'back to fvp'] }
];

const STATUS_CLASS = {
  OK: 'pill-ok',
  'Não OK': 'pill-no-ok',
  DCR: 'pill-dcr',
  'Status não mapeado': 'pill-unknown'
};

const CURRENCY = new Intl.NumberFormat('pt-BR');

function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function sanitizeCell(value) {
  return String(value ?? '').replace(/\u00a0/g, ' ').trim();
}

function stripBom(text) {
  return text.replace(/^\uFEFF/, '');
}

function detectSeparator(sampleText) {
  const samples = sampleText.split(/\r?\n/).slice(0, 10);
  const scores = [
    [';', 0],
    [',', 0],
    ['\t', 0]
  ];

  for (const line of samples) {
    for (const score of scores) {
      const separator = score[0];
      score[1] += countOutsideQuotes(line, separator);
    }
  }

  scores.sort((a, b) => {
    const priority = { ';': 3, ',': 2, '\t': 1 };
    if (b[1] !== a[1]) return b[1] - a[1];
    return priority[b[0]] - priority[a[0]];
  });

  return scores[0][0];
}

function countOutsideQuotes(line, separator) {
  let count = 0;
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      quoted = !quoted;
    } else if (char === separator && !quoted) {
      count += 1;
    }
  }
  return count;
}

function parseDelimitedText(text, separator) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (quoted && next === '"') {
        cell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (!quoted && char === separator) {
      row.push(cell);
      cell = '';
      continue;
    }

    if (!quoted && (char === '\n' || char === '\r')) {
      if (char === '\r' && next === '\n') {
        index += 1;
      }
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
      continue;
    }

    cell += char;
  }

  row.push(cell);
  rows.push(row);
  return rows.filter((line) => line.some((cellValue) => String(cellValue).trim() !== ''));
}

function parseJsonText(text) {
  const parsed = JSON.parse(text);
  const arrayCandidate = Array.isArray(parsed)
    ? parsed
    : Object.values(parsed).find((value) => Array.isArray(value));

  if (!Array.isArray(arrayCandidate)) {
    throw new Error('JSON precisa conter um array de objetos.');
  }

  const headerSet = new Set();
  for (const item of arrayCandidate) {
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      Object.keys(item).forEach((key) => headerSet.add(key));
    }
  }

  const headers = Array.from(headerSet);
  const rows = [headers];

  for (const item of arrayCandidate) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
    rows.push(headers.map((header) => item[header]));
  }

  return rows;
}

function detectAndParseFile(fileName, text) {
  const ext = fileName.split('.').pop().toLowerCase();

  if (ext === 'json') {
    return { format: 'json', rows: parseJsonText(stripBom(text)) };
  }

  if (ext === 'csv' || ext === 'txt') {
    const clean = stripBom(text);
    const separator = detectSeparator(clean);
    return { format: 'csv', rows: parseDelimitedText(clean, separator), separator };
  }

  throw new Error('Formato não suportado. Use CSV, Excel ou JSON.');
}

function parseExcelFile(arrayBuffer) {
  if (!window.XLSX) {
    throw new Error('A biblioteca de Excel não foi carregada.');
  }

  const workbook = window.XLSX.read(arrayBuffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = window.XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' });
  return { format: 'excel', rows };
}

function mapHeaders(headerRow) {
  const canonical = headerRow.map((header) => {
    const normalized = normalizeText(header);
    return COLUMN_ALIASES.get(normalized) || null;
  });

  const present = new Set(canonical.filter(Boolean));
  const missing = REQUIRED_COLUMNS.filter((label) => !present.has(COLUMN_ALIASES.get(normalizeText(label))));

  return { canonical, missing };
}

function isEmptyRow(row) {
  return row.every((cell) => sanitizeCell(cell) === '');
}

function normalizeDate(value) {
  const text = sanitizeCell(value);
  if (!text) {
    return { value: '', valid: false };
  }

  const match = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) {
    return { value: '', valid: false };
  }

  const [, day, month, year] = match;
  const iso = `${year}-${month}-${day}`;
  const testDate = new Date(Number(year), Number(month) - 1, Number(day));

  if (
    Number.isNaN(testDate.getTime()) ||
    testDate.getFullYear() !== Number(year) ||
    testDate.getMonth() !== Number(month) - 1 ||
    testDate.getDate() !== Number(day)
  ) {
    return { value: '', valid: false };
  }

  return { value: iso, valid: true };
}

function normalizeBoolean(value) {
  const text = normalizeText(value);
  if (!text) return { value: false, valid: false };
  if (['sim', 's', 'true', '1', 'yes', 'y'].includes(text)) return { value: true, valid: true };
  if (['nao', 'não', 'no', 'n', 'false', '0'].includes(text)) return { value: false, valid: true };
  return { value: false, valid: false };
}

function normalizeStatus(value) {
  const text = normalizeText(value);
  if (text === 'ok') return 'OK';
  if (text === 'nao ok' || text === 'não ok' || text === 'nok') return 'Não OK';
  if (text === 'dcr') return 'DCR';
  if (!text) return 'Status não mapeado';
  return 'Status não mapeado';
}

function normalizeStage(value, status) {
  const text = normalizeText(value);
  if (!text) return 'Sem etapa informada';
  if (status === 'OK' && !text) return 'Sem etapa informada';

  for (const stage of STAGE_PATTERNS) {
    if (stage.patterns.some((pattern) => text.includes(pattern))) {
      return stage.label;
    }
  }

  return 'Sem etapa informada';
}

function buildNormalizedRecord(rawRecord, index) {
  const idTeste = sanitizeCell(rawRecord.idTeste) || '';
  const marca = sanitizeCell(rawRecord.marca) || 'Não informado';
  const execucao = normalizeDate(rawRecord.dataExecucao);
  const ciclo = sanitizeCell(rawRecord.ciclo) || 'Não informado';
  const planoTeste = sanitizeCell(rawRecord.planoTeste);
  const teste = sanitizeCell(rawRecord.teste);
  const resultadoBruto = sanitizeCell(rawRecord.resultadoTeste);
  const statusTeste = normalizeStatus(rawRecord.statusTeste);
  const responsavelTeste = sanitizeCell(rawRecord.responsavelTeste) || 'Não informado';
  const longaDuracao = normalizeBoolean(rawRecord.longaDuracao);
  const cliente = sanitizeCell(rawRecord.cliente) || 'Não informado';
  const stage = normalizeStage(resultadoBruto, statusTeste);

  return {
    idTeste,
    marca,
    dataExecucao: execucao.value,
    dataExecucaoOriginal: sanitizeCell(rawRecord.dataExecucao),
    ciclo,
    planoTeste,
    teste,
    resultadoTeste: resultadoBruto || 'Sem etapa informada',
    statusTeste,
    responsavelTeste,
    longaDuracao: longaDuracao.value,
    cliente,
    stage,
    rowIndex: index + 1,
    qualityFlags: {
      invalidDate: !execucao.valid && sanitizeCell(rawRecord.dataExecucao) !== '',
      missingPlan: !planoTeste,
      missingTest: !teste,
      missingResult: !resultadoBruto,
      longValueUnclear: !longaDuracao.valid && sanitizeCell(rawRecord.longaDuracao) !== '',
      unknownStatus: statusTeste === 'Status não mapeado'
    }
  };
}

function parseRowsToRecords(rows) {
  if (!rows.length) {
    throw new Error('Arquivo vazio.');
  }

  const headerRow = rows[0];
  const { canonical, missing } = mapHeaders(headerRow);

  if (missing.length) {
    return {
      records: [],
      headerMissing: missing,
      importedLines: Math.max(rows.length - 1, 0),
      ignoredLines: 0,
      issues: [
        {
          label: 'Campos obrigatórios ausentes',
          detail: `Faltam as colunas: ${missing.join(', ')}`
        }
      ]
    };
  }

  const headerMap = new Map();
  canonical.forEach((key, index) => {
    if (key) headerMap.set(index, key);
  });

  const records = [];
  const issues = [];
  const duplicateIds = new Set();
  const seenIds = new Set();
  let ignoredLines = 0;

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex];
    if (!row || isEmptyRow(row)) {
      ignoredLines += 1;
      continue;
    }

    const rawRecord = {};
    for (let columnIndex = 0; columnIndex < row.length; columnIndex += 1) {
      const key = headerMap.get(columnIndex);
      if (key) rawRecord[key] = row[columnIndex];
    }

    const normalized = buildNormalizedRecord(rawRecord, rowIndex);

    if (normalized.idTeste) {
      if (seenIds.has(normalized.idTeste)) {
        duplicateIds.add(normalized.idTeste);
        issues.push({
          label: 'Registros duplicados por Id Teste',
          detail: `Id ${normalized.idTeste} encontrado mais de uma vez na linha ${rowIndex + 1}`
        });
        ignoredLines += 1;
        continue;
      }
      seenIds.add(normalized.idTeste);
    }

    records.push(normalized);
    if (normalized.qualityFlags.invalidDate) {
      issues.push({
        label: 'Datas inválidas',
        detail: `Linha ${rowIndex + 1}: ${normalized.dataExecucaoOriginal}`
      });
    }
    if (normalized.qualityFlags.unknownStatus) {
      issues.push({
        label: 'Status desconhecidos',
        detail: `Linha ${rowIndex + 1}: ${sanitizeCell(rawRecord.statusTeste)}`
      });
    }
    if (normalized.qualityFlags.missingPlan) {
      issues.push({
        label: 'Registros sem plano de teste',
        detail: `Linha ${rowIndex + 1}`
      });
    }
    if (normalized.qualityFlags.missingTest) {
      issues.push({
        label: 'Registros sem teste informado',
        detail: `Linha ${rowIndex + 1}`
      });
    }
    if (normalized.qualityFlags.missingResult) {
      issues.push({
        label: 'Registros sem resultado de teste',
        detail: `Linha ${rowIndex + 1}`
      });
    }
  }

  return {
    records,
    importedLines: Math.max(rows.length - 1, 0),
    ignoredLines,
    issues
  };
}

async function readFileAsText(file) {
  return await file.text();
}

async function readFileAsArrayBuffer(file) {
  return await file.arrayBuffer();
}

async function parseFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();

  try {
    if (ext === 'xlsx' || ext === 'xls') {
      const buffer = await readFileAsArrayBuffer(file);
      const { rows } = parseExcelFile(buffer);
      return parseRowsToRecords(rows);
    }

    const text = await readFileAsText(file);
    const { rows } = detectAndParseFile(file.name, text);
    return parseRowsToRecords(rows);
  } catch (error) {
    return {
      records: [],
      importedLines: 0,
      ignoredLines: 0,
      issues: [
        {
          label: 'Falha na leitura',
          detail: `${file.name}: ${error.message}`
        }
      ]
    };
  }
}

function isSupabaseConfigured() {
  return Boolean(
    SUPABASE_CONFIG.url &&
    SUPABASE_CONFIG.anonKey &&
    !SUPABASE_CONFIG.anonKey.includes('COLE_AQUI')
  );
}

function getSupabaseClient() {
  if (!isSupabaseConfigured()) {
    throw new Error('Informe a anon public key do Supabase no app.js.');
  }

  if (!window.supabase) {
    throw new Error('A biblioteca do Supabase não foi carregada.');
  }

  return window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
}

function recordToSupabaseRow(record) {
  return {
    id_teste: record.idTeste || null,
    marca: record.marca,
    data_execucao: record.dataExecucao || null,
    data_execucao_original: record.dataExecucaoOriginal || null,
    ciclo: record.ciclo,
    plano_teste: record.planoTeste || null,
    teste: record.teste || null,
    resultado_teste: record.resultadoTeste || null,
    status_teste: record.statusTeste,
    responsavel_teste: record.responsavelTeste,
    longa_duracao: record.longaDuracao,
    cliente: record.cliente,
    stage: record.stage,
    row_index: record.rowIndex || null,
    quality_flags: record.qualityFlags || {},
    dados: record
  };
}

function supabaseRowToRecord(row) {
  return {
    ...(row.dados || {}),
    idTeste: row.id_teste || row.dados?.idTeste || '',
    marca: row.marca || row.dados?.marca || 'Não informado',
    dataExecucao: row.data_execucao || row.dados?.dataExecucao || '',
    dataExecucaoOriginal: row.data_execucao_original || row.dados?.dataExecucaoOriginal || '',
    ciclo: row.ciclo || row.dados?.ciclo || 'Não informado',
    planoTeste: row.plano_teste || row.dados?.planoTeste || '',
    teste: row.teste || row.dados?.teste || '',
    resultadoTeste: row.resultado_teste || row.dados?.resultadoTeste || 'Sem etapa informada',
    statusTeste: row.status_teste || row.dados?.statusTeste || 'Status não mapeado',
    responsavelTeste: row.responsavel_teste || row.dados?.responsavelTeste || 'Não informado',
    longaDuracao: Boolean(row.longa_duracao),
    cliente: row.cliente || row.dados?.cliente || 'Não informado',
    stage: row.stage || row.dados?.stage || 'Sem etapa informada',
    rowIndex: row.row_index || row.dados?.rowIndex || 0,
    qualityFlags: row.quality_flags || row.dados?.qualityFlags || {}
  };
}

function chunkArray(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function applyRecords(records, validationOverrides = {}) {
  state.records = records;
  state.validation = {
    importedFiles: 0,
    importedLines: records.length,
    ignoredLines: 0,
    issues: [],
    records,
    ...validationOverrides
  };

  seedFiltersFromRecords(state.records);
  applyFilters();
  els.exportCsvBtn.disabled = !state.records.length;
  els.resetFiltersBtn.disabled = !state.records.length;
  updateCloudButtons();
}

function saveRecordsToLocalCache(records, source = 'local') {
  try {
    localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(records));
    localStorage.setItem(LOCAL_CACHE_META_KEY, JSON.stringify({
      source,
      total: records.length,
      savedAt: new Date().toISOString()
    }));
  } catch (error) {
    console.warn('Nao foi possivel salvar cache local:', error);
  }
}

function getLocalCacheMeta() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_CACHE_META_KEY) || 'null');
  } catch {
    return null;
  }
}

function loadRecordsFromLocalCache() {
  try {
    const raw = localStorage.getItem(LOCAL_CACHE_KEY);
    if (!raw) return false;

    const records = JSON.parse(raw);
    if (!Array.isArray(records)) return false;

    applyRecords(records);
    const meta = getLocalCacheMeta();
    const savedAt = meta?.savedAt
      ? new Date(meta.savedAt).toLocaleString('pt-BR')
      : 'data não informada';
    setStatus(`Base local carregada com ${records.length} registro(s). Última atualização: ${savedAt}.`);
    return true;
  } catch (error) {
    console.warn('Nao foi possivel carregar cache local:', error);
    return false;
  }
}

async function saveRecordsToSupabase() {
  if (!state.records.length) return;

  try {
    const client = getSupabaseClient();
    const rows = state.records.map(recordToSupabaseRow);

    setStatus(`Salvando ${rows.length} registro(s) no Supabase...`);
    for (const chunk of chunkArray(rows, 500)) {
      const { error } = await client
        .from(SUPABASE_CONFIG.table)
        .upsert(chunk, { onConflict: 'id_teste' });

      if (error) throw error;
    }

    saveRecordsToLocalCache(state.records, 'supabase-save');
    setStatus(`Base salva no Supabase e mantida localmente com ${rows.length} registro(s).`);
  } catch (error) {
    setStatus(`Não foi possível salvar no Supabase: ${error.message}`);
  }
}

async function loadRecordsFromSupabase() {
  try {
    const client = getSupabaseClient();
    const records = [];
    const pageSize = 1000;
    let from = 0;

    setStatus('Carregando base do Supabase...');
    while (true) {
      const { data, error } = await client
        .from(SUPABASE_CONFIG.table)
        .select('*')
        .order('data_execucao', { ascending: false, nullsFirst: false })
        .range(from, from + pageSize - 1);

      if (error) throw error;
      records.push(...(data || []).map(supabaseRowToRecord));
      if (!data || data.length < pageSize) break;
      from += pageSize;
    }

    applyRecords(records);
    saveRecordsToLocalCache(records, 'supabase-load');
    setStatus(`Base carregada do Supabase e salva localmente com ${records.length} registro(s).`);
  } catch (error) {
    setStatus(`Não foi possível carregar do Supabase: ${error.message}`);
  }
}

function updateCloudButtons() {
  const configured = isSupabaseConfigured();
  if (els.loadCloudBtn) els.loadCloudBtn.disabled = !configured;
  if (els.saveCloudBtn) els.saveCloudBtn.disabled = !configured || !state.records.length;
}

async function handleFiles(fileList, replace = true) {
  const files = Array.from(fileList || []);
  if (!files.length) return;

  setStatus(`Lendo ${files.length} arquivo(s)...`);
  const parsedFiles = [];
  for (const file of files) {
    const parsed = await parseFile(file);
    parsedFiles.push({ file, ...parsed });
  }

  const allRecords = parsedFiles.flatMap((entry) => entry.records);
  const allIssues = parsedFiles.flatMap((entry) => entry.issues);
  const importedLines = parsedFiles.reduce((total, entry) => total + entry.importedLines, 0);
  const ignoredLines = parsedFiles.reduce((total, entry) => total + entry.ignoredLines, 0);

  const records = replace ? allRecords : [...state.records, ...allRecords];
  applyRecords(records, {
    importedFiles: parsedFiles.length,
    importedLines,
    ignoredLines,
    issues: allIssues
  });
  saveRecordsToLocalCache(state.records, 'file-import');

  const fileNames = parsedFiles.map((entry) => entry.file.name).join(', ');
  setStatus(`Importados ${state.records.length} registros válidos de ${fileNames}. Base mantida localmente.`);
  els.exportCsvBtn.disabled = !state.records.length;
  els.resetFiltersBtn.disabled = !state.records.length;
  updateCloudButtons();
}

function setStatus(message) {
  els.importStatus.textContent = message;
}

function uniqueSorted(values, getLabel = (value) => value) {
  return Array.from(
    new Map(
      values
        .filter((value) => String(value ?? '').trim() !== '')
        .map((value) => [normalizeText(getLabel(value)), value])
    ).values()
  ).sort((a, b) => String(a).localeCompare(String(b), 'pt-BR'));
}

function seedFiltersFromRecords(records) {
  const months = new Set();
  const cycles = new Set();
  const brands = new Set();
  const qas = new Set();
  const tests = new Set();
  const clients = new Set();
  const stages = new Set(STAGE_LABELS);

  for (const record of records) {
    if (record.dataExecucao) {
      months.add(record.dataExecucao.slice(0, 7));
    }
    cycles.add(record.ciclo);
    brands.add(record.marca);
    qas.add(record.responsavelTeste);
    tests.add(record.teste);
    clients.add(record.cliente);
    stages.add(record.stage);
  }

  populateSelect(els.filterMonth, ['Todos', ...Array.from(months).sort()]);
  populateSelect(els.filterCycle, ['Todos', ...uniqueSorted(Array.from(cycles))]);
  populateSelect(els.filterBrand, ['Todas', ...uniqueSorted(Array.from(brands))]);
  populateSelect(els.filterQa, ['Todos', ...uniqueSorted(Array.from(qas))]);
  populateSelect(els.filterClient, ['Todos', ...uniqueSorted(Array.from(clients))]);
  populateSelect(els.filterStage, ['Todas', ...Array.from(stages)]);
  populateSelect(els.quickFilterCycle, ['Todos', ...uniqueSorted(Array.from(cycles))]);
  populateSelect(els.quickFilterBrand, ['Todas', ...uniqueSorted(Array.from(brands))]);
  populateSelect(els.quickFilterQa, ['Todos', ...uniqueSorted(Array.from(qas))]);
  populateSelect(els.quickFilterTest, ['Todos', ...uniqueSorted(Array.from(tests))]);
}

function populateSelect(select, values) {
  const current = select.value;
  select.innerHTML = '';
  values.forEach((value, index) => {
    const option = document.createElement('option');
    option.value = index === 0 ? '' : value;
    option.textContent = value;
    select.appendChild(option);
  });
  select.value = values.includes(current) ? current : '';
}

function getFilteredRecords() {
  const filters = state.filters;
  return state.records.filter((record) => {
    if (filters.dateFrom && record.dataExecucao && record.dataExecucao < filters.dateFrom) return false;
    if (filters.dateTo && record.dataExecucao && record.dataExecucao > filters.dateTo) return false;
    if (filters.month && (!record.dataExecucao || record.dataExecucao.slice(0, 7) !== filters.month)) return false;
    if (filters.cycle && record.ciclo !== filters.cycle) return false;
    if (filters.brand && record.marca !== filters.brand) return false;
    if (filters.qa && record.responsavelTeste !== filters.qa) return false;
    if (filters.client && record.cliente !== filters.client) return false;
    if (filters.status && record.statusTeste !== filters.status) return false;
    if (filters.stage && record.stage !== filters.stage) return false;
    if (filters.longa !== '' && String(record.longaDuracao) !== filters.longa) return false;
    if (filters.plan && !normalizeText(record.planoTeste).includes(normalizeText(filters.plan))) return false;
    if (filters.test && !normalizeText(record.teste).includes(normalizeText(filters.test))) return false;
    if (filters.id && !normalizeText(record.idTeste).includes(normalizeText(filters.id))) return false;
    if (filters.brandSearch && !normalizeText(record.marca).includes(normalizeText(filters.brandSearch))) return false;
    if (filters.qaSearch && !normalizeText(record.responsavelTeste).includes(normalizeText(filters.qaSearch))) return false;
    return true;
  });
}

function sortRecords(records) {
  const direction = state.sortDirection === 'asc' ? 1 : -1;
  const key = state.sortKey;
  return [...records].sort((a, b) => {
    const left = a[key];
    const right = b[key];

    if (key === 'dataExecucao') {
      return direction * ((left || '').localeCompare(right || ''));
    }

    const numericLeft = Number(left);
    const numericRight = Number(right);
    if (!Number.isNaN(numericLeft) && !Number.isNaN(numericRight) && String(left).trim() !== '' && String(right).trim() !== '') {
      return direction * (numericLeft - numericRight);
    }

    return direction * String(left ?? '').localeCompare(String(right ?? ''), 'pt-BR', { sensitivity: 'base' });
  });
}

function computeMetrics(records) {
  const total = records.length;
  const byStatus = groupCount(records, (record) => record.statusTeste);
  const ok = byStatus.OK || 0;
  const noOk = byStatus['Não OK'] || 0;
  const dcr = byStatus.DCR || 0;
  const unknown = byStatus['Status não mapeado'] || 0;

  const brands = new Set(records.map((record) => record.marca));
  const qas = new Set(records.map((record) => record.responsavelTeste));
  const cycles = new Set(records.map((record) => record.ciclo));
  const clients = new Set(records.map((record) => record.cliente));

  const longTrue = records.filter((record) => record.longaDuracao).length;
  const longFalse = total - longTrue;

  return {
    total,
    valid: total,
    ignored: state.validation?.ignoredLines ?? 0,
    ok,
    noOk,
    dcr,
    unknown,
    successRate: total ? (ok / total) * 100 : 0,
    failureRate: total ? ((noOk + dcr) / total) * 100 : 0,
    okRate: total ? (ok / total) * 100 : 0,
    noOkRate: total ? (noOk / total) * 100 : 0,
    dcrRate: total ? (dcr / total) * 100 : 0,
    brands: brands.size,
    qas: qas.size,
    cycles: cycles.size,
    clients: clients.size,
    longTrue,
    longFalse,
    byStatus
  };
}

function groupCount(records, selector) {
  return records.reduce((accumulator, record) => {
    const key = selector(record);
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});
}

function buildBrandMetrics(records) {
  const grouped = new Map();
  for (const record of records) {
    if (!grouped.has(record.marca)) {
      grouped.set(record.marca, []);
    }
    grouped.get(record.marca).push(record);
  }

  return Array.from(grouped.entries()).map(([brand, items]) => {
    const byStatus = groupCount(items, (record) => record.statusTeste);
    const byStage = groupCount(items.filter((record) => record.statusTeste !== 'OK'), (record) => record.stage);
    const total = items.length;
    const noOk = byStatus['Não OK'] || 0;
    const dcr = byStatus.DCR || 0;
    const dominantStage = dominantKey(byStage);
    const stageCount = dominantStage ? byStage[dominantStage] : 0;
    const noOkRate = total ? (noOk / total) * 100 : 0;
    const criticality = (noOk * 3) + (dcr * 2) + noOkRate + stageCount;
    const classification = classifyCriticality(total, noOkRate);

    return {
      brand,
      total,
      ok: byStatus.OK || 0,
      noOk,
      dcr,
      noOkRate,
      okRate: total ? ((byStatus.OK || 0) / total) * 100 : 0,
      dcrRate: total ? (dcr / total) * 100 : 0,
      longDuration: items.filter((record) => record.longaDuracao).length,
      dominantStage: dominantStage || 'Sem etapa informada',
      dominantStageCount: stageCount,
      cycles: uniqueSorted(items.map((record) => record.ciclo)),
      qas: uniqueSorted(items.map((record) => record.responsavelTeste)),
      criticality,
      classification,
      failureTrend: byStage
    };
  }).sort((a, b) => {
    if (b.criticality !== a.criticality) return b.criticality - a.criticality;
    if (b.noOk !== a.noOk) return b.noOk - a.noOk;
    return a.brand.localeCompare(b.brand, 'pt-BR');
  });
}

function classifyCriticality(total, noOkRate) {
  if (noOkRate >= 70 && total >= 50) return 'Crítica';
  if (noOkRate >= 50 && total >= 50) return 'Alta';
  if (noOkRate >= 30) return 'Média';
  return 'Baixa';
}

function dominantKey(map) {
  let winner = '';
  let winnerValue = -1;
  for (const [key, value] of Object.entries(map)) {
    if (value > winnerValue) {
      winner = key;
      winnerValue = value;
    }
  }
  return winner;
}

function buildQaMetrics(records) {
  const grouped = new Map();
  for (const record of records) {
    if (!grouped.has(record.responsavelTeste)) {
      grouped.set(record.responsavelTeste, []);
    }
    grouped.get(record.responsavelTeste).push(record);
  }

  return Array.from(grouped.entries()).map(([qa, items]) => {
    const byStatus = groupCount(items, (record) => record.statusTeste);
    const byStage = groupCount(items.filter((record) => record.statusTeste !== 'OK'), (record) => record.stage);
    const total = items.length;
    const noOk = byStatus['Não OK'] || 0;
    const dcr = byStatus.DCR || 0;
    return {
      qa,
      total,
      ok: byStatus.OK || 0,
      noOk,
      dcr,
      okRate: total ? ((byStatus.OK || 0) / total) * 100 : 0,
      noOkRate: total ? (noOk / total) * 100 : 0,
      brands: new Set(items.map((record) => record.marca)).size,
      cycles: new Set(items.map((record) => record.ciclo)).size,
      longDuration: items.filter((record) => record.longaDuracao).length,
      dominantStage: dominantKey(byStage) || 'Sem etapa informada'
    };
  }).sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    return a.qa.localeCompare(b.qa, 'pt-BR');
  });
}

function buildCycleMetrics(records) {
  const grouped = new Map();
  for (const record of records) {
    if (!grouped.has(record.ciclo)) {
      grouped.set(record.ciclo, []);
    }
    grouped.get(record.ciclo).push(record);
  }

  const ordered = Array.from(grouped.entries()).sort(([a], [b]) => a.localeCompare(b, 'pt-BR', { numeric: true }));
  return ordered.map(([cycle, items], index, array) => {
    const byStatus = groupCount(items, (record) => record.statusTeste);
    const previous = index > 0 ? array[index - 1][1].length : null;
    const previousCount = previous ?? null;
    const delta = previousCount ? ((items.length - previousCount) / previousCount) * 100 : null;
    return {
      cycle,
      total: items.length,
      brands: new Set(items.map((record) => record.marca)).size,
      qas: new Set(items.map((record) => record.responsavelTeste)).size,
      ok: byStatus.OK || 0,
      noOk: byStatus['Não OK'] || 0,
      dcr: byStatus.DCR || 0,
      successRate: items.length ? (((byStatus.OK || 0) / items.length) * 100) : 0,
      failureRate: items.length ? ((((byStatus['Não OK'] || 0) + (byStatus.DCR || 0)) / items.length) * 100) : 0,
      delta
    };
  });
}

function buildStageMetrics(records) {
  const grouped = new Map();
  for (const record of records.filter((item) => item.statusTeste !== 'OK')) {
    if (!grouped.has(record.stage)) {
      grouped.set(record.stage, []);
    }
    grouped.get(record.stage).push(record);
  }

  return Array.from(grouped.entries()).map(([stage, items]) => {
    const byBrand = groupCount(items, (record) => record.marca);
    const byQa = groupCount(items, (record) => record.responsavelTeste);
    return {
      stage,
      total: items.length,
      share: records.length ? (items.length / records.length) * 100 : 0,
      noOkShare: records.filter((record) => record.statusTeste !== 'OK').length
        ? (items.length / records.filter((record) => record.statusTeste !== 'OK').length) * 100
        : 0,
      topBrand: dominantKey(byBrand) || 'Não informado',
      topQa: dominantKey(byQa) || 'Não informado'
    };
  }).sort((a, b) => b.total - a.total);
}

function buildMonthlyMetrics(records) {
  const grouped = groupCount(records.filter((record) => record.dataExecucao), (record) => record.dataExecucao.slice(0, 7));
  return Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, value]) => ({ label: month, value }));
}

function buildCycleCounts(records) {
  const grouped = groupCount(records, (record) => record.ciclo);
  return Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b, 'pt-BR', { numeric: true }))
    .map(([label, value]) => ({ label, value }));
}

function buildBrandNoOkCounts(records) {
  const grouped = groupCount(records.filter((record) => record.statusTeste !== 'OK'), (record) => record.marca);
  return Object.entries(grouped)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([label, value]) => ({ label, value }));
}

function buildQaCounts(records) {
  const grouped = groupCount(records, (record) => record.responsavelTeste);
  return Object.entries(grouped)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([label, value]) => ({ label, value }));
}

function renderSummary(metrics) {
  const cards = [
    ['Total de registros importados', metrics.total, 'Base atual filtrada'],
    ['Total de registros válidos', metrics.valid, 'Linhas carregadas com sucesso'],
    ['Total de registros ignorados', metrics.ignored, 'Linhas vazias ou duplicadas'],
    ['Total de testes OK', metrics.ok, `${metrics.okRate.toFixed(1)}% da base`],
    ['Total de testes Não OK', metrics.noOk, `${metrics.noOkRate.toFixed(1)}% da base`],
    ['Total de testes DCR', metrics.dcr, `${metrics.dcrRate.toFixed(1)}% da base`],
    ['Percentual de OK', `${metrics.successRate.toFixed(1)}%`, 'Taxa de sucesso'],
    ['Percentual de falha', `${metrics.failureRate.toFixed(1)}%`, 'Não OK + DCR'],
    ['Testes longa duração', metrics.longTrue, 'Longa duração = Sim'],
    ['Testes não longa duração', metrics.longFalse, 'Longa duração = Não']
  ];

  els.summaryCards.innerHTML = cards.map(([label, value, subtitle]) => `
    <article class="metric-card">
      <div class="metric-label">${label}</div>
      <div class="metric-value">${formatValue(value)}</div>
      <div class="metric-subtitle">${subtitle}</div>
    </article>
  `).join('');
}

function formatValue(value) {
  if (typeof value === 'number') return CURRENCY.format(value);
  return String(value);
}

function renderChart(container, items, options = {}) {
  const max = Math.max(...items.map((item) => item.value), 1);
  if (!items.length) {
    container.innerHTML = '<div class="empty-state">Sem dados para exibir.</div>';
    return;
  }

  container.innerHTML = items.map((item, index) => {
    const width = (item.value / max) * 100;
    const tone = options.tone?.(item, index) || '';
    const action = options.action?.(item, index) || null;
    return `
      <div class="chart-row ${action ? 'chart-row-clickable' : ''}" ${action ? `data-filter-kind="${action.kind}" data-filter-value="${escapeHtml(action.value)}"` : ''}>
        <div class="chart-label">
          <span>${item.label}</span>
          <strong>${formatValue(item.value)}</strong>
        </div>
        <div class="chart-track">
          <div class="chart-fill ${tone}" style="width:${Math.max(width, item.value ? 8 : 0)}%"></div>
        </div>
      </div>
    `;
  }).join('');
}

function renderCharts(records) {
  const statusItems = [
    { label: 'OK', value: records.filter((record) => record.statusTeste === 'OK').length },
    { label: 'Não OK', value: records.filter((record) => record.statusTeste === 'Não OK').length },
    { label: 'DCR', value: records.filter((record) => record.statusTeste === 'DCR').length }
  ];

  const stageItems = STAGE_LABELS.map((stage) => ({
    label: stage,
    value: records.filter((record) => record.stage === stage && record.statusTeste !== 'OK').length
  }));

  renderChart(els.statusChart, statusItems, {
    tone: (item) => {
      if (item.label === 'OK') return 'good';
      if (item.label === 'Não OK') return 'bad';
      return 'warn';
    },
    action: (item) => ({ kind: 'status', value: item.label })
  });

  renderChart(els.stageChart, stageItems, {
    tone: (_, index) => (index === 0 ? 'warn' : index === 1 ? 'bad' : index === 2 ? 'warn' : index === 3 ? 'bad' : ''),
    action: (item) => ({ kind: 'stage', value: item.label })
  });
  renderChart(els.monthChart, buildMonthlyMetrics(records), {
    action: (item) => ({ kind: 'month', value: item.label })
  });
  renderChart(els.cycleChart, buildCycleCounts(records), {
    action: (item) => ({ kind: 'cycle', value: item.label })
  });
  renderChart(els.brandNotOkChart, buildBrandNoOkCounts(records), {
    action: (item) => ({ kind: 'brand', value: item.label })
  });
  renderChart(els.qaChart, buildQaCounts(records), {
    action: (item) => ({ kind: 'qa', value: item.label })
  });
}

function renderCriticalBrands(records) {
  if (!els.criticalBrands) return;

  const metrics = buildBrandMetrics(records).slice(0, 12);
  if (!metrics.length) {
    els.criticalBrands.innerHTML = '<div class="empty-state">Importe uma planilha para ver a criticidade das marcas.</div>';
    return;
  }

  els.criticalBrands.innerHTML = `
    <table class="critical-table">
      <thead>
        <tr>
          <th>Marca</th>
          <th>Total</th>
          <th>OK</th>
          <th>Não OK</th>
          <th>DCR</th>
          <th>Taxa de Não OK</th>
          <th>Principal etapa de falha</th>
          <th>Índice de criticidade</th>
          <th>Classificação</th>
        </tr>
      </thead>
      <tbody>
        ${metrics.map((item) => `
          <tr>
            <td>
              <strong>${item.brand}</strong>
              <div class="muted">${item.cycles.length} ciclos · ${item.qas.length} QAs</div>
            </td>
            <td>${formatValue(item.total)}</td>
            <td>${formatValue(item.ok)}</td>
            <td>${formatValue(item.noOk)}</td>
            <td>${formatValue(item.dcr)}</td>
            <td>${item.noOkRate.toFixed(1)}%</td>
            <td>${item.dominantStage}</td>
            <td>${item.criticality.toFixed(1)}</td>
            <td><span class="tag ${classificationClass(item.classification)}">${item.classification}</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function classificationClass(classification) {
  if (classification === 'Crítica') return 'tag-critical';
  if (classification === 'Alta') return 'tag-high';
  if (classification === 'Média') return 'tag-medium';
  return 'tag-low';
}

function renderValidation() {
  if (!els.validationSummary || !els.validationIssues) return;

  if (!state.validation) {
    els.validationSummary.innerHTML = '<div class="empty-state">Aguarde a primeira importação.</div>';
    els.validationIssues.innerHTML = '<div class="empty-state">Nenhuma validação ainda.</div>';
    return;
  }

  const summaryItems = [
    ['Arquivos importados', state.validation.importedFiles],
    ['Linhas importadas', state.validation.importedLines],
    ['Linhas vazias ignoradas', state.validation.ignoredLines],
    ['Registros válidos', state.records.length],
    ['Campos obrigatórios ausentes', state.validation.issues.filter((issue) => issue.label === 'Campos obrigatórios ausentes').length],
    ['Datas inválidas', state.validation.issues.filter((issue) => issue.label === 'Datas inválidas').length],
    ['Status desconhecidos', state.validation.issues.filter((issue) => issue.label === 'Status desconhecidos').length],
    ['Sem plano de teste', state.validation.issues.filter((issue) => issue.label === 'Registros sem plano de teste').length],
    ['Sem teste informado', state.validation.issues.filter((issue) => issue.label === 'Registros sem teste informado').length],
    ['Sem resultado de teste', state.validation.issues.filter((issue) => issue.label === 'Registros sem resultado de teste').length],
    ['Duplicados por Id Teste', state.validation.issues.filter((issue) => issue.label === 'Registros duplicados por Id Teste').length]
  ];

  els.validationSummary.innerHTML = `
    <div class="validation-list">
      ${summaryItems.map(([label, value]) => `
        <div class="validation-item">
          <strong>${label}</strong>
          <span>${formatValue(value)}</span>
        </div>
      `).join('')}
    </div>
  `;

  if (!state.validation.issues.length) {
    els.validationIssues.innerHTML = '<div class="empty-state">Nenhum problema encontrado na base importada.</div>';
    return;
  }

  const grouped = state.validation.issues.reduce((accumulator, issue) => {
    accumulator[issue.label] = accumulator[issue.label] || [];
    accumulator[issue.label].push(issue.detail);
    return accumulator;
  }, {});

  els.validationIssues.innerHTML = `
    <div class="validation-list">
      ${Object.entries(grouped).map(([label, details]) => `
        <div class="validation-item">
          <div>
            <strong>${label}</strong>
            <span>${details.slice(0, 3).join(' | ')}</span>
          </div>
          <strong>${details.length}</strong>
        </div>
      `).join('')}
    </div>
  `;
}

function renderTable(records) {
  const totalPages = Math.max(Math.ceil(records.length / state.pageSize), 1);
  const currentPage = Math.min(state.currentPage, totalPages);
  state.currentPage = currentPage;
  const startIndex = (currentPage - 1) * state.pageSize;
  const pageRecords = records.slice(startIndex, startIndex + state.pageSize);

  if (!records.length) {
    els.tableBody.innerHTML = `
      <tr>
        <td colspan="11">
          <div class="empty-state">Nenhum registro corresponde aos filtros atuais.</div>
        </td>
      </tr>
    `;
    renderPagination(records.length, 0, 0);
    return;
  }

  els.tableBody.innerHTML = pageRecords.map((record) => `
    <tr>
      <td>${escapeHtml(record.idTeste)}</td>
      <td>${escapeHtml(record.marca)}</td>
      <td>${record.dataExecucao || 'Não informado'}</td>
      <td>${escapeHtml(record.ciclo)}</td>
      <td>${escapeHtml(record.planoTeste || 'Sem plano de teste')}</td>
      <td>${escapeHtml(record.teste || 'Sem teste informado')}</td>
      <td>${escapeHtml(record.resultadoTeste || 'Sem etapa informada')}</td>
      <td><span class="status-pill ${STATUS_CLASS[record.statusTeste] || STATUS_CLASS['Status não mapeado']}">${escapeHtml(record.statusTeste)}</span></td>
      <td>${escapeHtml(record.responsavelTeste)}</td>
      <td>${record.longaDuracao ? 'Sim' : 'Não'}</td>
      <td>${escapeHtml(record.cliente)}</td>
    </tr>
  `).join('');

  renderPagination(records.length, currentPage, totalPages);
}

function renderPagination(totalRecords, currentPage, totalPages) {
  if (!els.paginationInfo) return;

  if (!totalRecords) {
    els.paginationInfo.textContent = 'Nenhum registro para paginar.';
    if (els.prevPageBtn) els.prevPageBtn.disabled = true;
    if (els.nextPageBtn) els.nextPageBtn.disabled = true;
    return;
  }

  const start = (currentPage - 1) * state.pageSize + 1;
  const end = Math.min(currentPage * state.pageSize, totalRecords);
  els.paginationInfo.textContent = `Mostrando ${start}-${end} de ${totalRecords} registro(s)`;
  if (els.prevPageBtn) els.prevPageBtn.disabled = currentPage <= 1;
  if (els.nextPageBtn) els.nextPageBtn.disabled = currentPage >= totalPages;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function applyFilters() {
  const filtered = sortRecords(getFilteredRecords());
  state.filteredRecords = filtered;

  const metrics = computeMetrics(filtered);
  renderSummary(metrics);
  renderCharts(filtered);
  renderCriticalBrands(filtered);
  renderValidation();
  renderTable(filtered);

  els.filteredCount.textContent = `${formatValue(filtered.length)} registro(s) visível(is) de ${formatValue(state.records.length)} importado(s).`;
}

function syncFiltersFromUI() {
  state.filters.dateFrom = els.filterDateFrom.value;
  state.filters.dateTo = els.filterDateTo.value;
  state.filters.month = els.filterMonth.value;
  state.filters.cycle = els.quickFilterCycle.value || els.filterCycle.value;
  state.filters.brand = els.quickFilterBrand.value || els.filterBrand.value;
  state.filters.qa = els.quickFilterQa.value || els.filterQa.value;
  state.filters.client = els.filterClient.value;
  state.filters.status = els.quickFilterStatus.value || els.filterStatus.value;
  state.filters.test = els.quickFilterTest.value || els.filterTest.value;
  state.filters.stage = els.filterStage.value;
  state.filters.longa = els.filterLonga.value;
  state.filters.plan = els.filterPlan.value;
  state.filters.id = els.filterId.value;
  state.filters.brandSearch = els.filterBrandSearch.value;
  state.filters.qaSearch = els.filterQaSearch.value;
  state.sortBy = els.sortBy.value;
  state.sortKey = els.sortBy.value;
  state.sortDirection = els.sortDirection.value;
}

function wireFilters() {
  const inputs = [
    els.filterDateFrom,
    els.filterDateTo,
    els.filterMonth,
    els.filterCycle,
    els.filterBrand,
    els.filterQa,
    els.filterClient,
    els.filterStatus,
    els.filterStage,
    els.filterLonga,
    els.filterPlan,
    els.filterTest,
    els.filterId,
    els.filterBrandSearch,
    els.filterQaSearch,
    els.quickFilterCycle,
    els.quickFilterBrand,
    els.quickFilterQa,
    els.quickFilterStatus,
    els.quickFilterTest,
    els.sortBy,
    els.sortDirection
  ];

  inputs.forEach((input) => {
    input.addEventListener('input', () => {
      state.currentPage = 1;
      syncFiltersFromUI();
      applyFilters();
    });
    input.addEventListener('change', () => {
      state.currentPage = 1;
      syncFiltersFromUI();
      applyFilters();
    });
  });
}

function wirePagination() {
  els.pageSizeSelect.addEventListener('change', () => {
    state.pageSize = Number(els.pageSizeSelect.value) || 10;
    state.currentPage = 1;
    applyFilters();
  });

  els.prevPageBtn.addEventListener('click', () => {
    state.currentPage = Math.max(1, state.currentPage - 1);
    applyFilters();
  });

  els.nextPageBtn.addEventListener('click', () => {
    const totalPages = Math.max(Math.ceil(state.filteredRecords.length / state.pageSize), 1);
    state.currentPage = Math.min(totalPages, state.currentPage + 1);
    applyFilters();
  });
}

function clearFilters() {
  [
    els.filterDateFrom,
    els.filterDateTo,
    els.filterMonth,
    els.filterCycle,
    els.filterBrand,
    els.filterQa,
    els.filterClient,
    els.filterStatus,
    els.filterStage,
    els.filterLonga,
    els.filterPlan,
    els.filterTest,
    els.filterId,
    els.filterBrandSearch,
    els.filterQaSearch
  ].forEach((input) => {
    input.value = '';
  });
  els.quickFilterCycle.value = '';
  els.quickFilterBrand.value = '';
  els.quickFilterQa.value = '';
  els.quickFilterStatus.value = '';
  els.quickFilterTest.value = '';
  els.sortBy.value = 'dataExecucao';
  els.sortDirection.value = 'desc';
  els.pageSizeSelect.value = '10';
  state.pageSize = 10;
  state.currentPage = 1;
  syncFiltersFromUI();
  applyFilters();
}

function exportFilteredCsv() {
  if (!state.filteredRecords.length) return;

  const headers = [
    'Id Teste',
    'Marca',
    'Data de execução',
    'Ciclo',
    'Plano de testes',
    'Teste',
    'Resultado teste',
    'Status teste',
    'Responsável',
    'Longa duração',
    'Cliente'
  ];

  const rows = [headers.join(',')];
  for (const record of state.filteredRecords) {
    rows.push([
      record.idTeste,
      record.marca,
      record.dataExecucao,
      record.ciclo,
      record.planoTeste,
      record.teste,
      record.resultadoTeste,
      record.statusTeste,
      record.responsavelTeste,
      record.longaDuracao ? 'Sim' : 'Não',
      record.cliente
    ].map(escapeCsv).join(','));
  }

  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `dashboard-filtrado-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function escapeCsv(value) {
  const text = String(value ?? '');
  if (/[",\n;]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function handleTableSortingClicks() {
  document.querySelectorAll('thead th[data-sort]').forEach((th) => {
    th.addEventListener('click', () => {
      const targetSort = th.getAttribute('data-sort');
      if (state.sortKey === targetSort) {
        state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortKey = targetSort;
        state.sortDirection = targetSort === 'dataExecucao' ? 'desc' : 'asc';
      }
      els.sortBy.value = state.sortKey;
      els.sortDirection.value = state.sortDirection;
      applyFilters();
    });
  });
}

function wireNavigation() {
  document.querySelectorAll('.nav-link').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.nav-link').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      document.getElementById(button.dataset.scrollTarget)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function syncSidebarState() {
  if (!els.appShell || !els.sidebarToggle) return;
  els.appShell.classList.toggle('sidebar-collapsed', state.sidebarCollapsed);
  els.sidebarToggle.setAttribute('aria-expanded', String(!state.sidebarCollapsed));
  const toggleIcon = els.sidebarToggle.querySelector('.sidebar-toggle-icon');
  if (toggleIcon) {
    toggleIcon.textContent = state.sidebarCollapsed ? '▶' : '◀';
  }
  els.sidebarToggle.setAttribute('aria-label', state.sidebarCollapsed ? 'Abrir sidebar' : 'Recolher sidebar');
  localStorage.setItem('dashboard-sidebar-collapsed', state.sidebarCollapsed ? '1' : '0');
}

function wireSidebarToggle() {
  if (!els.sidebarToggle) return;
  const savedState = localStorage.getItem('dashboard-sidebar-collapsed');
  state.sidebarCollapsed = savedState === '1';
  syncSidebarState();

  els.sidebarToggle.addEventListener('click', () => {
    state.sidebarCollapsed = !state.sidebarCollapsed;
    syncSidebarState();
  });
}

function syncSectionCollapseState(sectionId) {
  const section = document.getElementById(sectionId);
  const button = document.querySelector(`[data-collapse-target="${sectionId}"]`);
  if (!section || !button) return;

  const collapsed = Boolean(state.sectionCollapsed[sectionId]);
  section.classList.toggle('is-collapsed', collapsed);
  button.setAttribute('aria-expanded', String(!collapsed));
  button.textContent = collapsed ? 'Abrir' : 'Recolher';
  localStorage.setItem('dashboard-section-collapsed', JSON.stringify(state.sectionCollapsed));
}

function wireSectionCollapseToggles() {
  const savedState = localStorage.getItem('dashboard-section-collapsed');
  if (savedState) {
    try {
      state.sectionCollapsed = JSON.parse(savedState) || {};
    } catch {
      state.sectionCollapsed = {};
    }
  }

  document.querySelectorAll('[data-collapse-target]').forEach((button) => {
    const sectionId = button.getAttribute('data-collapse-target');
    if (!sectionId) return;

    syncSectionCollapseState(sectionId);

    button.addEventListener('click', () => {
      state.sectionCollapsed[sectionId] = !state.sectionCollapsed[sectionId];
      syncSectionCollapseState(sectionId);
    });
  });
}

function wireChartFilters() {
  [els.statusChart, els.stageChart, els.monthChart, els.cycleChart, els.brandNotOkChart, els.qaChart].forEach((container) => {
    container.addEventListener('click', (event) => {
      const row = event.target.closest('.chart-row[data-filter-kind]');
      if (!row) return;
      const kind = row.getAttribute('data-filter-kind');
      const value = row.getAttribute('data-filter-value');

      if (kind === 'cycle') {
        els.quickFilterCycle.value = value;
      } else if (kind === 'brand') {
        els.quickFilterBrand.value = value;
      } else if (kind === 'qa') {
        els.quickFilterQa.value = value;
      } else if (kind === 'status') {
        els.quickFilterStatus.value = value;
      } else if (kind === 'month') {
        els.filterMonth.value = value;
      } else if (kind === 'stage') {
        els.filterStage.value = value;
      }

      syncFiltersFromUI();
      applyFilters();
    });
  });
}

function wireImport() {
  els.selectFilesBtn.addEventListener('click', () => els.fileInput.click());
  els.fileInput.addEventListener('change', () => handleFiles(els.fileInput.files));

  els.dropZone.addEventListener('dragover', (event) => {
    event.preventDefault();
    els.dropZone.classList.add('dragover');
  });

  els.dropZone.addEventListener('dragleave', () => {
    els.dropZone.classList.remove('dragover');
  });

  els.dropZone.addEventListener('drop', (event) => {
    event.preventDefault();
    els.dropZone.classList.remove('dragover');
    handleFiles(event.dataTransfer.files);
  });

  els.loadSampleBtn.addEventListener('click', async () => {
    const sampleFile = new File([SAMPLE_CSV], 'Relatorio Testes.csv', { type: 'text/csv;charset=utf-8' });
    await handleFiles([sampleFile]);
  });
}

function initialize() {
  wireImport();
  wireFilters();
  wirePagination();
  wireSidebarToggle();
  wireSectionCollapseToggles();
  wireNavigation();
  wireChartFilters();
  handleTableSortingClicks();

  els.resetFiltersBtn.addEventListener('click', clearFilters);
  els.exportCsvBtn.addEventListener('click', exportFilteredCsv);
  if (els.loadCloudBtn) els.loadCloudBtn.addEventListener('click', loadRecordsFromSupabase);
  if (els.saveCloudBtn) els.saveCloudBtn.addEventListener('click', saveRecordsToSupabase);
  state.pageSize = Number(els.pageSizeSelect.value) || 10;

  syncFiltersFromUI();
  renderSummary({
    total: 0,
    valid: 0,
    ignored: 0,
    ok: 0,
    noOk: 0,
    dcr: 0,
    unknown: 0,
    successRate: 0,
    failureRate: 0,
    okRate: 0,
    noOkRate: 0,
    dcrRate: 0,
    brands: 0,
    qas: 0,
    cycles: 0,
    clients: 0,
    longTrue: 0,
    longFalse: 0
  });
  renderCharts([]);
  renderCriticalBrands([]);
  renderValidation();
  renderTable([]);
  updateCloudButtons();
  loadRecordsFromLocalCache();
}

initialize();

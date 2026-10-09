// @ts-nocheck
// d.minds Atlas — Global Model Registry
// Data-driven: adding a model = adding an object here. No UI change required.
export const ATLAS_MODELS = (function () {
  function T(s) { return s.replace(/\s+/g, ''); }

  // ---- Capability axes. Each axis maps onto Atlas harness node ids. ----
  // order matters: it is the index order of every `c` capability string
  var AXES = [
    ['reasoning', 'Reasoning', 'Рассуждение', ['reasoning', 'cot', 'selfcons']],
    ['coding', 'Coding', 'Кодинг', []],
    ['math', 'Mathematics', 'Математика', []],
    ['longCtx', 'Long context', 'Длинный контекст', ['context', 'window', 'longctx', 'tokenbudget', 'assembly', 'sysprompt', 'compression']],
    ['structured', 'Structured output', 'Структурный вывод', ['structured', 'jsonmode', 'outschemas', 'schemaval']],
    ['fnCall', 'Function calling', 'Вызов функций', ['tools', 'fncalling', 'toolschemas', 'parallel']],
    ['mcp', 'MCP', 'MCP', ['protocols', 'mcp', 'openapi']],
    ['vision', 'Vision', 'Зрение', []],
    ['audio', 'Audio', 'Аудио', []],
    ['video', 'Video', 'Видео', []],
    ['computerUse', 'Computer use', 'Работа с компьютером', ['productivity', 'browserauto', 'office', 'word', 'comments', 'summarization']],
    ['agentic', 'Agentic', 'Агентность', ['agents', 'loops', 'react', 'planner', 'multiagent', 'orchestration', 'handoffs', 'autonomy', 'hitl', 'decomposition']],
    ['memory', 'Memory', 'Память', ['memory', 'shortterm', 'convstate', 'sliding', 'longterm', 'memstores', 'reflection', 'episodic', 'profiles', 'preference']],
    ['rag', 'Retrieval', 'Поиск (RAG)', ['knowledge', 'rag', 'graphrag', 'hybrid', 'embeddings', 'vectordb', 'chunking', 'kg', 'ontologies', 'extraction', 'neo4j', 'cypher']],
    ['evals', 'Evaluation', 'Оценка', ['evaluation', 'benchmarks', 'suites', 'domainbench', 'judge', 'rubrics', 'regression', 'golden']],
    ['safety', 'Safety', 'Безопасность вывода', ['guardrails', 'inputf', 'injdefense', 'pii', 'outputv', 'policies', 'alignment', 'refusals', 'constitutional']],
    ['selfHost', 'Self-hosting', 'Селф-хостинг', ['deployment', 'serving', 'infservers', 'batching', 'scaling', 'autoscaling', 'multiregion', 'modelops', 'versioning']],
    ['finetune', 'Fine-tuning', 'Файнтюнинг', ['tuning', 'finetuning', 'distillation']],
    ['caching', 'Caching', 'Кэширование', ['caching', 'kvcache', 'invalidation']],
    ['streaming', 'Streaming', 'Стриминг', ['latency', 'streaming', 'speculative']],
    ['quant', 'Quantization', 'Квантизация', ['optimization', 'cost', 'routing', 'quantization']],
    ['multiling', 'Multilingual', 'Многоязычность', []]
  ];
  var AX = AXES.map(function (a) { return a[0]; });

  // Harness domains that no model changes — they are yours regardless of engine.
  var HARNESS_ONLY = ['observability', 'security'];

  //                        re co ma lc st fc mc vi au vd cu ag me ra ev sa sh ft ca st qu ml
  var TPL = {
    frontier:      T('2  2  2  2  2  2  2  2  1  1  2  2  2  2  2  2  0  1  2  2  1  2'),
    frontierText:  T('2  2  2  2  2  2  2  0  0  0  1  2  2  2  2  2  0  1  2  2  1  2'),
    multimodal:    T('2  2  2  2  2  2  1  2  2  2  1  2  1  2  1  2  0  1  2  2  1  2'),
    reasoner:      T('2  2  2  2  1  1  1  0  0  0  0  2  1  1  2  1  1  1  1  2  1  1'),
    openFrontier:  T('2  2  2  2  2  2  1  1  0  0  1  2  1  2  1  1  2  2  1  2  2  1'),
    openMid:       T('1  2  1  1  2  2  1  0  0  0  0  1  1  1  1  1  2  2  1  2  2  1'),
    openSmall:     T('1  1  1  1  1  1  0  0  0  0  0  1  0  1  0  1  2  2  0  2  2  1'),
    enterprise:    T('1  2  1  2  2  2  1  1  0  0  0  1  1  2  1  2  1  2  1  2  1  1'),
    sovereign:     T('1  1  1  1  1  1  1  0  0  0  0  1  1  1  1  2  2  2  1  2  2  1'),
    research:      T('1  1  1  1  1  0  0  0  0  0  0  0  0  0  0  1  2  1  0  1  1  1')
  };
  Object.keys(TPL).forEach(function (k) {
    if (TPL[k].length !== AX.length) console.warn('ATLAS_MODELS: template "' + k + '" has ' + TPL[k].length + ' values, expected ' + AX.length);
  });
  function caps(tpl, over) {
    var a = tpl.split('');
    if (over) over.split(',').forEach(function (p) {
      var kv = p.split(':'), i = AX.indexOf(kv[0]);
      if (i < 0) { console.warn('ATLAS_MODELS: unknown capability axis "' + kv[0] + '" in override "' + over + '"'); return; }
      a[i] = kv[1];
    });
    return a.join('');
  }

  // ---- Organizations ----
  // key: [name, country EN, country RU, cc, flag, region]
  var O = {
    thinkingmachines: ['Thinking Machines', 'United States', 'США', 'US', '🇺🇸', 'na'],
    inclusionai: ['inclusionAI (Ant Group)', 'China', 'Китай', 'CN', '🇨🇳', 'cn'],
    openai: ['OpenAI', 'United States', 'США', 'US', '🇺🇸', 'na'],
    anthropic: ['Anthropic', 'United States', 'США', 'US', '🇺🇸', 'na'],
    google: ['Google', 'United States', 'США', 'US', '🇺🇸', 'na'],
    meta: ['Meta', 'United States', 'США', 'US', '🇺🇸', 'na'],
    xai: ['xAI', 'United States', 'США', 'US', '🇺🇸', 'na'],
    microsoft: ['Microsoft', 'United States', 'США', 'US', '🇺🇸', 'na'],
    amazon: ['Amazon', 'United States', 'США', 'US', '🇺🇸', 'na'],
    nvidia: ['NVIDIA', 'United States', 'США', 'US', '🇺🇸', 'na'],
    ibm: ['IBM', 'United States', 'США', 'US', '🇺🇸', 'na'],
    databricks: ['Databricks', 'United States', 'США', 'US', '🇺🇸', 'na'],
    ai2: ['Allen Institute for AI', 'United States', 'США', 'US', '🇺🇸', 'na'],
    cohere: ['Cohere', 'Canada', 'Канада', 'CA', '🇨🇦', 'na'],
    ai21: ['AI21 Labs', 'Israel', 'Израиль', 'IL', '🇮🇱', 'me'],
    alibaba: ['Alibaba', 'China', 'Китай', 'CN', '🇨🇳', 'cn'],
    deepseek: ['DeepSeek', 'China', 'Китай', 'CN', '🇨🇳', 'cn'],
    moonshot: ['Moonshot AI', 'China', 'Китай', 'CN', '🇨🇳', 'cn'],
    zai: ['Z.ai / Zhipu', 'China', 'Китай', 'CN', '🇨🇳', 'cn'],
    minimax: ['MiniMax', 'China', 'Китай', 'CN', '🇨🇳', 'cn'],
    bytedance: ['ByteDance', 'China', 'Китай', 'CN', '🇨🇳', 'cn'],
    baidu: ['Baidu', 'China', 'Китай', 'CN', '🇨🇳', 'cn'],
    tencent: ['Tencent', 'China', 'Китай', 'CN', '🇨🇳', 'cn'],
    xiaomi: ['Xiaomi', 'China', 'Китай', 'CN', '🇨🇳', 'cn'],
    zeroone: ['01.AI', 'China', 'Китай', 'CN', '🇨🇳', 'cn'],
    baichuan: ['Baichuan', 'China', 'Китай', 'CN', '🇨🇳', 'cn'],
    stepfun: ['StepFun', 'China', 'Китай', 'CN', '🇨🇳', 'cn'],
    mistral: ['Mistral AI', 'France', 'Франция', 'FR', '🇫🇷', 'eu'],
    alephalpha: ['Aleph Alpha', 'Germany', 'Германия', 'DE', '🇩🇪', 'eu'],
    hcompany: ['H Company', 'France', 'Франция', 'FR', '🇫🇷', 'eu'],
    lighton: ['LightOn', 'France', 'Франция', 'FR', '🇫🇷', 'eu'],
    opengptx: ['OpenGPT-X', 'Germany', 'Германия', 'DE', '🇩🇪', 'eu'],
    soofi: ['Soofi', 'Germany', 'Германия', 'DE', '🇩🇪', 'eu'],
    swissai: ['Swiss AI Initiative · ETH Zürich / EPFL', 'Switzerland', 'Швейцария', 'CH', '🇨🇭', 'eu'],
    stability: ['Stability AI', 'United Kingdom', 'Великобритания', 'GB', '🇬🇧', 'eu'],
    siloai: ['Silo AI', 'Finland', 'Финляндия', 'FI', '🇫🇮', 'eu'],
    pfn: ['Preferred Networks', 'Japan', 'Япония', 'JP', '🇯🇵', 'ap'],
    ntt: ['NTT', 'Japan', 'Япония', 'JP', '🇯🇵', 'ap'],
    sakana: ['Sakana AI', 'Japan', 'Япония', 'JP', '🇯🇵', 'ap'],
    lgai: ['LG AI Research', 'South Korea', 'Южная Корея', 'KR', '🇰🇷', 'ap'],
    naver: ['Naver', 'South Korea', 'Южная Корея', 'KR', '🇰🇷', 'ap'],
    samsung: ['Samsung', 'South Korea', 'Южная Корея', 'KR', '🇰🇷', 'ap'],
    upstage: ['Upstage', 'South Korea', 'Южная Корея', 'KR', '🇰🇷', 'ap'],
    kakao: ['Kakao', 'South Korea', 'Южная Корея', 'KR', '🇰🇷', 'ap'],
    sarvam: ['Sarvam AI', 'India', 'Индия', 'IN', '🇮🇳', 'ap'],
    krutrim: ['Krutrim', 'India', 'Индия', 'IN', '🇮🇳', 'ap'],
    ai4bharat: ['AI4Bharat', 'India', 'Индия', 'IN', '🇮🇳', 'ap'],
    aisg: ['AI Singapore', 'Singapore', 'Сингапур', 'SG', '🇸🇬', 'ap'],
    taide: ['NARLabs', 'Taiwan', 'Тайвань', 'TW', '🇹🇼', 'ap'],
    tii: ['Technology Innovation Institute', 'United Arab Emirates', 'ОАЭ', 'AE', '🇦🇪', 'me'],
    mbzuai: ['MBZUAI / G42', 'United Arab Emirates', 'ОАЭ', 'AE', '🇦🇪', 'me'],
    maritaca: ['Maritaca AI', 'Brazil', 'Бразилия', 'BR', '🇧🇷', 'row'],
    lelapa: ['Lelapa AI', 'South Africa', 'ЮАР', 'ZA', '🇿🇦', 'row'],
    issai: ['ISSAI · Nazarbayev University', 'Kazakhstan', 'Казахстан', 'KZ', '🇰🇿', 'row']
  };

  var REGIONS = [
    ['all', 'All regions', 'Все регионы'],
    ['na', 'North America', 'Северная Америка'],
    ['cn', 'China', 'Китай'],
    ['eu', 'Europe', 'Европа'],
    ['ap', 'Asia-Pacific', 'Азия и Океания'],
    ['me', 'Middle East', 'Ближний Восток'],
    ['row', 'Rest of world', 'Остальной мир']
  ];

  var SOV = {
    api: ['Commercial API', 'Коммерческий API'],
    openw: ['Open weight', 'Открытые веса'],
    oss: ['Open source', 'Открытый код'],
    national: ['National / sovereign', 'Национальная / суверенная'],
    regional: ['Regional / sovereign', 'Региональная / суверенная'],
    research: ['Research', 'Исследовательская'],
    enterprise: ['Enterprise', 'Корпоративная']
  };

  var STATUS = {
    released: ['Released', 'Выпущена'],
    updated: ['Updated', 'Обновлена'],
    preview: ['Preview', 'Превью'],
    research: ['Research', 'Исследование'],
    soon: ['Coming soon', 'Скоро'],
    deprecated: ['Deprecated', 'Устаревшая'],
    archived: ['Archived', 'В архиве']
  };

  var TAGS = {
    reasoning: ['Reasoning', 'Рассуждение'], coding: ['Coding', 'Кодинг'], math: ['Math', 'Математика'],
    agentic: ['Agentic', 'Агентность'], multimodal: ['Multimodal', 'Мультимодальность'], longctx: ['Long context', 'Длинный контекст'],
    tools: ['Tool use', 'Инструменты'], rag: ['Retrieval', 'Поиск'], memory: ['Memory', 'Память'],
    speed: ['Speed', 'Скорость'], lowcost: ['Low cost', 'Низкая цена'], cost: ['Cost', 'Стоимость'],
    latency: ['Latency', 'Задержки'], selfhost: ['Self-hostable', 'Селф-хостинг'], finetune: ['Fine-tuning', 'Файнтюнинг'],
    sovereign: ['Sovereign', 'Суверенность'], open: ['Open weight', 'Открытые веса'], frontier: ['Frontier', 'Фронтир'],
    multiling: ['Multilingual', 'Многоязычность'], edge: ['Edge', 'Edge'], safety: ['Safety', 'Безопасность'],
    novision: ['No vision', 'Без зрения'], smallctx: ['Short context', 'Короткий контекст'], noweights: ['Closed weights', 'Закрытые веса'],
    industrial: ['Industrial AI', 'Промышленный ИИ'], docs: ['Documents', 'Документы'], enterprise: ['Enterprise', 'Корпоративное'],
    localization: ['Localization', 'Локализация'], research: ['Research', 'Исследования'], throughput: ['Throughput', 'Пропускная способность']
  };

  var DISCOVERY = [
    ['all', 'All', 'Все'],
    ['frontier', 'Frontier', 'Фронтир'],
    ['open', 'Open weight', 'Открытые веса'],
    ['sovereign', 'Sovereign', 'Суверенные'],
    ['recent', 'Recently added', 'Недавно добавленные'],
    ['coding', 'Coding', 'Кодинг'],
    ['reasoning', 'Reasoning', 'Рассуждение'],
    ['agentic', 'Agentic', 'Агентные'],
    ['multimodal', 'Multimodal', 'Мультимодальные'],
    ['longctx', 'Long context', 'Длинный контекст'],
    ['selfhost', 'Self-hostable', 'Селф-хостинг'],
    ['lowcost', 'Low cost', 'Низкая цена']
  ];

  // ---- Families → generations → versions ----
  // f: [key, org, family name, short label for the LLM node, sovereignty, discovery tags, models[]]
  // model: {id, gen, ver, st, rel, arch, par, act, ctx, lang, lic, dep, cost(1-3), c, s[], l[], u[]}
  var F = [
    ['gpt', 'openai', 'GPT', 'GPT', ['api'], ['frontier', 'reasoning', 'coding', 'agentic', 'multimodal', 'longctx'], [
      { id: 'gpt-5', gen: 'GPT-5', ver: 'gpt-5', st: 'released', rel: '2025', arch: 'Sparse MoE transformer', par: 'undisclosed', act: 'undisclosed', ctx: '400K', lang: 'Multilingual (100+)', lic: 'Proprietary', dep: ['api', 'cloud', 'finetune'], cost: 3, c: caps(TPL.frontier), s: ['reasoning', 'coding', 'agentic', 'tools'], l: ['noweights', 'cost'], u: ['agentic', 'coding', 'reasoning'] },
      { id: 'gpt-5-mini', gen: 'GPT-5', ver: 'gpt-5-mini', st: 'released', rel: '2025', arch: 'Sparse MoE transformer', par: 'undisclosed', act: 'undisclosed', ctx: '400K', lang: 'Multilingual (100+)', lic: 'Proprietary', dep: ['api', 'cloud'], cost: 1, c: caps(TPL.frontier, 'reasoning:1,math:1,video:0,computerUse:1'), s: ['speed', 'lowcost', 'tools'], l: ['reasoning'], u: ['agentic', 'rag'] },
      { id: 'gpt-4-1', gen: 'GPT-4.1', ver: 'gpt-4.1', st: 'deprecated', rel: '2025', arch: 'Dense + MoE transformer', par: 'undisclosed', act: '—', ctx: '1M', lang: 'Multilingual (100+)', lic: 'Proprietary', dep: ['api', 'cloud', 'finetune'], cost: 2, c: caps(TPL.frontier, 'agentic:1,computerUse:1,video:0,mcp:1'), s: ['longctx', 'coding'], l: ['agentic'], u: ['docs', 'rag'] }
    ]],
    ['gpt-oss', 'openai', 'gpt-oss', 'gpt-oss', ['openw', 'oss'], ['open', 'selfhost', 'reasoning', 'lowcost'], [
      { id: 'gpt-oss-120b', gen: 'gpt-oss', ver: 'gpt-oss-120b', st: 'released', rel: '2025', arch: 'MoE', par: '117B', act: '5.1B', ctx: '128K', lang: 'Multilingual', lic: 'Apache-2.0', dep: ['weights', 'selfhost', 'finetune', 'cloud'], cost: 1, c: caps(TPL.openFrontier, 'vision:0,computerUse:0'), s: ['open', 'reasoning', 'selfhost'], l: ['novision'], u: ['selfhost', 'agentic'] },
      { id: 'gpt-oss-20b', gen: 'gpt-oss', ver: 'gpt-oss-20b', st: 'released', rel: '2025', arch: 'MoE', par: '21B', act: '3.6B', ctx: '128K', lang: 'Multilingual', lic: 'Apache-2.0', dep: ['weights', 'selfhost', 'edge', 'finetune'], cost: 1, c: caps(TPL.openMid, 'vision:0'), s: ['edge', 'open', 'lowcost'], l: ['reasoning', 'novision'], u: ['edge', 'selfhost'] }
    ]],
    ['claude', 'anthropic', 'Claude', 'Claude', ['api'], ['frontier', 'coding', 'agentic', 'reasoning', 'longctx', 'multimodal'], [
      { id: 'claude-opus-4-1', gen: 'Claude 4', ver: 'Opus 4.1', st: 'released', rel: '2025', arch: 'Dense transformer', par: 'undisclosed', act: '—', ctx: '200K', lang: 'Multilingual', lic: 'Proprietary', dep: ['api', 'cloud'], cost: 3, c: caps(TPL.frontier, 'audio:0,video:0,mcp:2,computerUse:2'), s: ['coding', 'agentic', 'tools', 'safety'], l: ['noweights', 'cost'], u: ['coding', 'agentic'] },
      { id: 'claude-sonnet-4', gen: 'Claude 4', ver: 'Sonnet 4', st: 'released', rel: '2025', arch: 'Dense transformer', par: 'undisclosed', act: '—', ctx: '1M', lang: 'Multilingual', lic: 'Proprietary', dep: ['api', 'cloud'], cost: 2, c: caps(TPL.frontier, 'audio:0,video:0,mcp:2,computerUse:2,longCtx:2'), s: ['coding', 'longctx', 'agentic'], l: ['noweights'], u: ['coding', 'agentic', 'rag'] },
      { id: 'claude-haiku-3-5', gen: 'Claude 3.5', ver: 'Haiku 3.5', st: 'released', rel: '2024', arch: 'Dense transformer', par: 'undisclosed', act: '—', ctx: '200K', lang: 'Multilingual', lic: 'Proprietary', dep: ['api', 'cloud'], cost: 1, c: caps(TPL.frontier, 'reasoning:1,math:1,audio:0,video:0,agentic:1,computerUse:1'), s: ['speed', 'lowcost'], l: ['reasoning'], u: ['docs', 'rag'] }
    ]],
    ['gemini', 'google', 'Gemini', 'Gemini', ['api'], ['frontier', 'multimodal', 'longctx', 'reasoning', 'agentic'], [
      { id: 'gemini-2-5-pro', gen: 'Gemini 2.5', ver: 'Pro', st: 'released', rel: '2025', arch: 'Sparse MoE, natively multimodal', par: 'undisclosed', act: '—', ctx: '1M', lang: 'Multilingual (100+)', lic: 'Proprietary', dep: ['api', 'cloud', 'finetune'], cost: 2, c: caps(TPL.multimodal, 'agentic:2,mcp:2'), s: ['multimodal', 'longctx', 'reasoning'], l: ['noweights'], u: ['multimodal', 'rag', 'docs'] },
      { id: 'gemini-2-5-flash', gen: 'Gemini 2.5', ver: 'Flash', st: 'released', rel: '2025', arch: 'Sparse MoE, natively multimodal', par: 'undisclosed', act: '—', ctx: '1M', lang: 'Multilingual (100+)', lic: 'Proprietary', dep: ['api', 'cloud'], cost: 1, c: caps(TPL.multimodal, 'reasoning:1,agentic:1'), s: ['speed', 'lowcost', 'multimodal'], l: ['reasoning'], u: ['multimodal', 'rag'] }
    ]],
    ['gemma', 'google', 'Gemma', 'Gemma', ['openw'], ['open', 'selfhost', 'edge', 'lowcost', 'multimodal'], [
      { id: 'gemma-3-27b', gen: 'Gemma 3', ver: '27B IT', st: 'released', rel: '2025', arch: 'Dense transformer', par: '27B', act: '—', ctx: '128K', lang: '140+ languages', lic: 'Gemma Terms of Use', dep: ['weights', 'selfhost', 'finetune'], cost: 1, c: caps(TPL.openMid, 'vision:2,multiling:2,reasoning:1'), s: ['open', 'multiling', 'selfhost'], l: ['agentic'], u: ['selfhost', 'localization'] },
      { id: 'gemma-3-4b', gen: 'Gemma 3', ver: '4B IT', st: 'released', rel: '2025', arch: 'Dense transformer', par: '4B', act: '—', ctx: '128K', lang: '140+ languages', lic: 'Gemma Terms of Use', dep: ['weights', 'selfhost', 'edge'], cost: 1, c: caps(TPL.openSmall, 'vision:1'), s: ['edge', 'lowcost'], l: ['reasoning', 'smallctx'], u: ['edge'] }
    ]],
    ['llama', 'meta', 'Llama', 'Llama', ['openw'], ['open', 'selfhost', 'finetune', 'multimodal', 'longctx'], [
      { id: 'llama-4-maverick', gen: 'Llama 4', ver: 'Maverick', st: 'released', rel: '2025', arch: 'MoE, natively multimodal', par: '400B', act: '17B', ctx: '1M', lang: '12 languages', lic: 'Llama 4 Community License', dep: ['weights', 'selfhost', 'finetune', 'cloud'], cost: 1, c: caps(TPL.openFrontier, 'vision:2,longCtx:2'), s: ['open', 'selfhost', 'multimodal'], l: ['agentic', 'safety'], u: ['selfhost', 'finetune'] },
      { id: 'llama-4-scout', gen: 'Llama 4', ver: 'Scout', st: 'released', rel: '2025', arch: 'MoE, natively multimodal', par: '109B', act: '17B', ctx: '10M', lang: '12 languages', lic: 'Llama 4 Community License', dep: ['weights', 'selfhost', 'finetune'], cost: 1, c: caps(TPL.openMid, 'vision:2,longCtx:2'), s: ['longctx', 'open'], l: ['reasoning'], u: ['docs', 'selfhost'] },
      { id: 'llama-3-3-70b', gen: 'Llama 3.3', ver: '70B Instruct', st: 'released', rel: '2024', arch: 'Dense transformer', par: '70B', act: '—', ctx: '128K', lang: '8 languages', lic: 'Llama 3.3 Community License', dep: ['weights', 'selfhost', 'finetune'], cost: 1, c: caps(TPL.openMid), s: ['open', 'finetune'], l: ['novision'], u: ['selfhost', 'finetune'] }
    ]],
    ['grok', 'xai', 'Grok', 'Grok', ['api'], ['frontier', 'reasoning', 'coding', 'agentic'], [
      { id: 'grok-4', gen: 'Grok 4', ver: 'grok-4', st: 'released', rel: '2025', arch: 'MoE transformer', par: 'undisclosed', act: '—', ctx: '256K', lang: 'Multilingual', lic: 'Proprietary', dep: ['api', 'cloud'], cost: 2, c: caps(TPL.frontier, 'audio:0,video:0,computerUse:1'), s: ['reasoning', 'math', 'coding'], l: ['noweights', 'safety'], u: ['reasoning', 'coding'] }
    ]],
    ['phi', 'microsoft', 'Phi', 'Phi', ['openw'], ['open', 'edge', 'selfhost', 'lowcost', 'reasoning'], [
      { id: 'phi-4', gen: 'Phi-4', ver: '14B', st: 'released', rel: '2024', arch: 'Dense transformer', par: '14B', act: '—', ctx: '16K', lang: 'English-centric', lic: 'MIT', dep: ['weights', 'selfhost', 'edge', 'finetune'], cost: 1, c: caps(TPL.openMid, 'math:2,reasoning:2,longCtx:0'), s: ['reasoning', 'math', 'edge'], l: ['smallctx', 'multiling'], u: ['edge', 'reasoning'] }
    ]],
    ['nova', 'amazon', 'Nova', 'Nova', ['api', 'enterprise'], ['multimodal', 'lowcost', 'enterprise'], [
      { id: 'nova-pro', gen: 'Nova', ver: 'Pro', st: 'released', rel: '2024', arch: 'Proprietary multimodal', par: 'undisclosed', act: '—', ctx: '300K', lang: '200+ languages', lic: 'Proprietary', dep: ['api', 'cloud', 'finetune'], cost: 1, c: caps(TPL.enterprise, 'vision:2,video:1'), s: ['lowcost', 'enterprise', 'multimodal'], l: ['reasoning', 'agentic'], u: ['enterprise', 'docs'] },
      { id: 'nova-lite', gen: 'Nova', ver: 'Lite', st: 'released', rel: '2024', arch: 'Proprietary multimodal', par: 'undisclosed', act: '—', ctx: '300K', lang: '200+ languages', lic: 'Proprietary', dep: ['api', 'cloud'], cost: 1, c: caps(TPL.enterprise, 'reasoning:1,coding:1,vision:1'), s: ['lowcost', 'speed'], l: ['reasoning'], u: ['enterprise'] }
    ]],
    ['nemotron', 'nvidia', 'Nemotron', 'Nemotron', ['openw'], ['open', 'selfhost', 'reasoning', 'throughput'], [
      { id: 'nemotron-ultra', gen: 'Llama Nemotron', ver: 'Ultra 253B', st: 'released', rel: '2025', arch: 'Pruned dense (NAS)', par: '253B', act: '—', ctx: '128K', lang: 'Multilingual', lic: 'NVIDIA Open Model License', dep: ['weights', 'selfhost', 'finetune'], cost: 1, c: caps(TPL.openFrontier, 'vision:0'), s: ['reasoning', 'throughput', 'selfhost'], l: ['novision'], u: ['selfhost', 'reasoning'] }
    ]],
    ['command', 'cohere', 'Command', 'Command', ['api', 'openw', 'enterprise'], ['enterprise', 'rag', 'open', 'multiling'], [
      { id: 'command-a', gen: 'Command A', ver: '03-2025', st: 'released', rel: '2025', arch: 'Dense transformer', par: '111B', act: '—', ctx: '256K', lang: '23 languages', lic: 'CC-BY-NC (weights) / commercial API', dep: ['api', 'weights', 'selfhost'], cost: 2, c: caps(TPL.enterprise, 'rag:2,selfHost:2'), s: ['rag', 'enterprise', 'multiling'], l: ['reasoning'], u: ['rag', 'enterprise'] }
    ]],
    ['jamba', 'ai21', 'Jamba', 'Jamba', ['openw', 'enterprise'], ['open', 'longctx', 'selfhost', 'enterprise'], [
      { id: 'jamba-1-6-large', gen: 'Jamba 1.6', ver: 'Large', st: 'released', rel: '2025', arch: 'Hybrid SSM-Transformer MoE', par: '398B', act: '94B', ctx: '256K', lang: '9 languages', lic: 'Jamba Open Model License', dep: ['api', 'weights', 'selfhost'], cost: 2, c: caps(TPL.enterprise, 'longCtx:2,selfHost:2'), s: ['longctx', 'throughput', 'open'], l: ['reasoning', 'novision'], u: ['docs', 'rag', 'enterprise'] }
    ]],
    ['granite', 'ibm', 'Granite', 'Granite', ['openw', 'oss', 'enterprise'], ['open', 'selfhost', 'lowcost', 'enterprise'], [
      { id: 'granite-3-3-8b', gen: 'Granite 3.3', ver: '8B Instruct', st: 'released', rel: '2025', arch: 'Dense transformer', par: '8B', act: '—', ctx: '128K', lang: '12 languages', lic: 'Apache-2.0', dep: ['weights', 'selfhost', 'edge', 'finetune'], cost: 1, c: caps(TPL.openMid, 'safety:2'), s: ['open', 'enterprise', 'safety'], l: ['reasoning', 'novision'], u: ['enterprise', 'selfhost'] }
    ]],
    ['dbrx', 'databricks', 'DBRX', 'DBRX', ['openw'], ['open', 'selfhost'], [
      { id: 'dbrx-instruct', gen: 'DBRX', ver: 'Instruct', st: 'deprecated', rel: '2024', arch: 'Fine-grained MoE', par: '132B', act: '36B', ctx: '32K', lang: 'English-centric', lic: 'Databricks Open Model License', dep: ['weights', 'selfhost'], cost: 1, c: caps(TPL.openMid, 'longCtx:0,mcp:0'), s: ['open', 'selfhost'], l: ['smallctx', 'novision'], u: ['selfhost'] }
    ]],
    ['olmo', 'ai2', 'OLMo', 'OLMo', ['oss', 'research'], ['open', 'research', 'selfhost'], [
      { id: 'olmo-2-32b', gen: 'OLMo 2', ver: '32B Instruct', st: 'released', rel: '2025', arch: 'Dense transformer', par: '32B', act: '—', ctx: '4K', lang: 'English', lic: 'Apache-2.0 (fully open data)', dep: ['weights', 'selfhost', 'finetune'], cost: 1, c: caps(TPL.openSmall, 'reasoning:1'), s: ['open', 'research'], l: ['smallctx', 'multiling'], u: ['research', 'finetune'] }
    ]],

    ['qwen', 'alibaba', 'Qwen', 'Qwen', ['openw', 'api'], ['frontier', 'open', 'selfhost', 'coding', 'agentic', 'multiling', 'longctx'], [
      { id: 'qwen3-max', gen: 'Qwen 3', ver: 'Max', st: 'released', rel: '2025', arch: 'MoE', par: '1T+', act: 'undisclosed', ctx: '256K', lang: '119 languages', lic: 'Proprietary', dep: ['api', 'cloud'], cost: 2, c: caps(TPL.frontier, 'audio:1,video:0'), s: ['reasoning', 'coding', 'multiling'], l: ['noweights'], u: ['agentic', 'coding'] },
      { id: 'qwen3-235b-a22b', gen: 'Qwen 3', ver: '235B-A22B', st: 'released', rel: '2025', arch: 'MoE, hybrid thinking', par: '235B', act: '22B', ctx: '128K', lang: '119 languages', lic: 'Apache-2.0', dep: ['weights', 'selfhost', 'finetune', 'api'], cost: 1, c: caps(TPL.openFrontier, 'multiling:2'), s: ['open', 'reasoning', 'multiling'], l: ['novision'], u: ['selfhost', 'agentic'] },
      { id: 'qwen3-32b', gen: 'Qwen 3', ver: '32B', st: 'released', rel: '2025', arch: 'Dense, hybrid thinking', par: '32B', act: '—', ctx: '128K', lang: '119 languages', lic: 'Apache-2.0', dep: ['weights', 'selfhost', 'finetune'], cost: 1, c: caps(TPL.openMid, 'reasoning:2,multiling:2'), s: ['open', 'lowcost', 'multiling'], l: ['novision'], u: ['selfhost', 'finetune'] }
    ]],
    ['deepseek', 'deepseek', 'DeepSeek', 'DeepSeek', ['openw'], ['frontier', 'open', 'reasoning', 'coding', 'selfhost', 'lowcost'], [
      { id: 'deepseek-v3-1', gen: 'V-series', ver: 'V3.1', st: 'released', rel: '2025', arch: 'MoE, MLA attention', par: '685B', act: '37B', ctx: '128K', lang: 'Multilingual (CN/EN focus)', lic: 'MIT', dep: ['weights', 'selfhost', 'api', 'finetune'], cost: 1, c: caps(TPL.openFrontier, 'caching:2'), s: ['open', 'reasoning', 'lowcost'], l: ['novision'], u: ['selfhost', 'coding', 'reasoning'] },
      { id: 'deepseek-r1', gen: 'R-series', ver: 'R1', st: 'released', rel: '2025', arch: 'MoE reasoning model (RL-trained)', par: '671B', act: '37B', ctx: '128K', lang: 'Multilingual (CN/EN focus)', lic: 'MIT', dep: ['weights', 'selfhost', 'api'], cost: 1, c: caps(TPL.reasoner, 'selfHost:2,finetune:2'), s: ['reasoning', 'math', 'open'], l: ['latency', 'novision'], u: ['reasoning', 'research'] }
    ]],
    ['kimi', 'moonshot', 'Kimi', 'Kimi', ['openw'], ['frontier', 'open', 'agentic', 'coding', 'longctx'], [
      { id: 'kimi-k2', gen: 'K2', ver: 'Instruct', st: 'released', rel: '2025', arch: 'MoE, MuonClip-trained', par: '1T', act: '32B', ctx: '128K', lang: 'Multilingual (CN/EN focus)', lic: 'Modified MIT', dep: ['weights', 'selfhost', 'api'], cost: 1, c: caps(TPL.openFrontier, 'agentic:2,fnCall:2'), s: ['agentic', 'coding', 'open'], l: ['novision'], u: ['agentic', 'coding'] }
    ]],
    ['glm', 'zai', 'GLM', 'GLM', ['openw'], ['open', 'agentic', 'coding', 'selfhost'], [
      { id: 'glm-4-5', gen: 'GLM-4.5', ver: '355B-A32B', st: 'released', rel: '2025', arch: 'MoE, hybrid reasoning', par: '355B', act: '32B', ctx: '128K', lang: 'Multilingual (CN/EN focus)', lic: 'MIT', dep: ['weights', 'selfhost', 'api'], cost: 1, c: caps(TPL.openFrontier, 'agentic:2'), s: ['agentic', 'coding', 'open'], l: ['novision'], u: ['agentic', 'selfhost'] }
    ]],
    ['minimax', 'minimax', 'MiniMax', 'MiniMax', ['openw'], ['open', 'longctx', 'reasoning', 'selfhost'], [
      { id: 'minimax-m1', gen: 'M1', ver: 'M1-80k', st: 'released', rel: '2025', arch: 'Hybrid MoE, lightning attention', par: '456B', act: '46B', ctx: '1M', lang: 'Multilingual', lic: 'Apache-2.0', dep: ['weights', 'selfhost', 'api'], cost: 1, c: caps(TPL.openFrontier, 'longCtx:2,reasoning:2'), s: ['longctx', 'reasoning', 'open'], l: ['novision'], u: ['docs', 'reasoning'] }
    ]],
    ['seed', 'bytedance', 'Doubao / Seed', 'Doubao', ['api'], ['multimodal', 'lowcost', 'reasoning'], [
      { id: 'seed-1-6', gen: 'Seed 1.6', ver: 'thinking', st: 'released', rel: '2025', arch: 'MoE, multimodal', par: 'undisclosed', act: '—', ctx: '256K', lang: 'Chinese / English', lic: 'Proprietary', dep: ['api', 'cloud'], cost: 1, c: caps(TPL.multimodal, 'reasoning:2,mcp:1'), s: ['multimodal', 'lowcost'], l: ['noweights'], u: ['multimodal'] }
    ]],
    ['ernie', 'baidu', 'ERNIE', 'ERNIE', ['openw', 'api'], ['open', 'multimodal', 'enterprise'], [
      { id: 'ernie-4-5', gen: 'ERNIE 4.5', ver: '300B-A47B', st: 'released', rel: '2025', arch: 'Heterogeneous multimodal MoE', par: '300B', act: '47B', ctx: '128K', lang: 'Chinese / English', lic: 'Apache-2.0', dep: ['weights', 'selfhost', 'api'], cost: 1, c: caps(TPL.openFrontier, 'vision:2'), s: ['open', 'multimodal'], l: ['agentic'], u: ['enterprise', 'selfhost'] }
    ]],
    ['hunyuan', 'tencent', 'Hunyuan', 'Hunyuan', ['openw', 'api'], ['open', 'multimodal', 'selfhost'], [
      { id: 'hunyuan-a13b', gen: 'Hunyuan', ver: 'A13B', st: 'released', rel: '2025', arch: 'MoE', par: '80B', act: '13B', ctx: '256K', lang: 'Chinese / English', lic: 'Tencent Hunyuan License', dep: ['weights', 'selfhost', 'api'], cost: 1, c: caps(TPL.openMid, 'longCtx:2,agentic:2'), s: ['open', 'longctx'], l: ['novision'], u: ['selfhost', 'agentic'] }
    ]],
    ['mimo', 'xiaomi', 'MiMo', 'MiMo', ['openw'], ['open', 'edge', 'reasoning', 'lowcost'], [
      { id: 'mimo-7b-rl', gen: 'MiMo', ver: '7B-RL', st: 'released', rel: '2025', arch: 'Dense, RL-trained reasoning', par: '7B', act: '—', ctx: '32K', lang: 'Chinese / English', lic: 'MIT', dep: ['weights', 'selfhost', 'edge'], cost: 1, c: caps(TPL.openSmall, 'reasoning:2,math:2'), s: ['reasoning', 'edge', 'open'], l: ['smallctx'], u: ['edge', 'reasoning'] }
    ]],
    ['yi', 'zeroone', 'Yi', 'Yi', ['openw', 'api'], ['open', 'selfhost', 'lowcost'], [
      { id: 'yi-lightning', gen: 'Yi', ver: 'Lightning', st: 'released', rel: '2024', arch: 'MoE', par: 'undisclosed', act: '—', ctx: '16K', lang: 'Chinese / English', lic: 'Proprietary', dep: ['api'], cost: 1, c: caps(TPL.openMid, 'longCtx:0'), s: ['lowcost', 'speed'], l: ['smallctx'], u: ['enterprise'] }
    ]],
    ['baichuan', 'baichuan', 'Baichuan', 'Baichuan', ['api', 'enterprise'], ['enterprise', 'multiling'], [
      { id: 'baichuan-4', gen: 'Baichuan 4', ver: 'baichuan4', st: 'released', rel: '2024', arch: 'Dense transformer', par: 'undisclosed', act: '—', ctx: '32K', lang: 'Chinese / English', lic: 'Proprietary', dep: ['api'], cost: 1, c: caps(TPL.enterprise, 'longCtx:1,mcp:0'), s: ['enterprise', 'docs'], l: ['agentic', 'noweights'], u: ['enterprise'] }
    ]],
    ['step', 'stepfun', 'Step', 'Step', ['api', 'openw'], ['multimodal', 'open'], [
      { id: 'step-3', gen: 'Step 3', ver: 'step-3', st: 'released', rel: '2025', arch: 'MoE, multimodal', par: '321B', act: '38B', ctx: '64K', lang: 'Chinese / English', lic: 'Apache-2.0', dep: ['weights', 'api', 'selfhost'], cost: 1, c: caps(TPL.openFrontier, 'vision:2,audio:1'), s: ['multimodal', 'open'], l: ['agentic'], u: ['multimodal'] }
    ]],

    ['mistral', 'mistral', 'Mistral', 'Mistral', ['openw', 'api', 'regional'], ['frontier', 'open', 'sovereign', 'selfhost', 'coding', 'lowcost'], [
      { id: 'mistral-large-2', gen: 'Large', ver: 'Large 2 (24.11)', st: 'released', rel: '2024', arch: 'Dense transformer', par: '123B', act: '—', ctx: '128K', lang: '80+ languages', lic: 'Mistral Research License / commercial', dep: ['api', 'weights', 'selfhost', 'finetune'], cost: 2, c: caps(TPL.openFrontier, 'reasoning:1,vision:0'), s: ['sovereign', 'open', 'multiling'], l: ['novision', 'reasoning'], u: ['selfhost', 'enterprise'] },
      { id: 'mistral-medium-3', gen: 'Medium', ver: 'Medium 3', st: 'released', rel: '2025', arch: 'Dense transformer', par: 'undisclosed', act: '—', ctx: '128K', lang: '80+ languages', lic: 'Proprietary', dep: ['api', 'cloud', 'selfhost'], cost: 1, c: caps(TPL.openFrontier, 'vision:1,selfHost:1'), s: ['lowcost', 'coding', 'sovereign'], l: ['noweights'], u: ['enterprise', 'coding'] },
      { id: 'magistral-medium', gen: 'Magistral', ver: 'Medium', st: 'released', rel: '2025', arch: 'Reasoning model', par: 'undisclosed', act: '—', ctx: '128K', lang: 'Multilingual reasoning', lic: 'Proprietary', dep: ['api'], cost: 2, c: caps(TPL.reasoner), s: ['reasoning', 'multiling'], l: ['latency'], u: ['reasoning'] },
      { id: 'devstral-small', gen: 'Devstral', ver: 'Small', st: 'released', rel: '2025', arch: 'Dense, code-specialized', par: '24B', act: '—', ctx: '128K', lang: 'Code + English', lic: 'Apache-2.0', dep: ['weights', 'selfhost', 'finetune'], cost: 1, c: caps(TPL.openMid, 'coding:2,agentic:2,fnCall:2'), s: ['coding', 'agentic', 'open'], l: ['novision'], u: ['coding', 'selfhost'] }
    ]],
    ['soofi', 'soofi', 'Soofi', 'Soofi', ['openw', 'national', 'regional'], ['sovereign', 'open', 'selfhost', 'agentic', 'industrial', 'recent'], [
      { id: 'soofi-30b-a3b', gen: 'Soofi', ver: '30B-A3B', st: 'released', rel: '2025', arch: 'MoE (sparse)', par: '30B', act: '~3B', ctx: '128K', lang: 'German / English', lic: 'Open', dep: ['weights', 'selfhost', 'finetune', 'edge'], cost: 1, c: caps(TPL.sovereign, 'agentic:2,fnCall:2,structured:2,selfHost:2'), s: ['sovereign', 'industrial', 'agentic', 'selfhost'], l: ['novision', 'multiling'], u: ['industrial', 'agentic', 'selfhost'] },
      { id: 'soofi-s', gen: 'Soofi', ver: 'Soofi S', st: 'released', rel: '2025', arch: 'Dense (compact)', par: 'compact', act: '—', ctx: '128K', lang: 'German / English', lic: 'Open', dep: ['weights', 'selfhost', 'edge'], cost: 1, c: caps(TPL.sovereign, 'reasoning:1,agentic:1'), s: ['sovereign', 'edge', 'lowcost'], l: ['reasoning', 'novision'], u: ['edge', 'industrial'] }
    ]],
    ['pharia', 'alephalpha', 'Pharia', 'Pharia', ['openw', 'regional', 'enterprise'], ['sovereign', 'open', 'selfhost', 'enterprise'], [
      { id: 'pharia-1-7b', gen: 'Pharia-1', ver: 'LLM 7B control', st: 'released', rel: '2024', arch: 'Dense transformer', par: '7B', act: '—', ctx: '8K', lang: 'German / English / French / Spanish', lic: 'Aleph Alpha Open Weight License', dep: ['weights', 'selfhost', 'finetune'], cost: 1, c: caps(TPL.sovereign, 'longCtx:0,mcp:0'), s: ['sovereign', 'enterprise', 'selfhost'], l: ['smallctx', 'reasoning'], u: ['enterprise', 'selfhost'] }
    ]],
    ['holo', 'hcompany', 'Holo', 'Holo', ['openw', 'regional'], ['sovereign', 'open', 'agentic', 'recent'], [
      { id: 'holo-1', gen: 'Holo-1', ver: '7B', st: 'released', rel: '2025', arch: 'Vision-language action model', par: '7B', act: '—', ctx: '32K', lang: 'English / French', lic: 'Apache-2.0', dep: ['weights', 'selfhost'], cost: 1, c: caps(TPL.openSmall, 'vision:2,computerUse:2,agentic:2'), s: ['agentic', 'sovereign', 'open'], l: ['reasoning', 'smallctx'], u: ['agentic'] }
    ]],
    ['lighton', 'lighton', 'LightOn', 'LightOn', ['openw', 'regional', 'enterprise'], ['sovereign', 'open', 'rag', 'enterprise'], [
      { id: 'lighton-alfred', gen: 'Alfred', ver: '40B', st: 'released', rel: '2023', arch: 'Dense transformer', par: '40B', act: '—', ctx: '8K', lang: 'English / French', lic: 'Apache-2.0', dep: ['weights', 'selfhost'], cost: 1, c: caps(TPL.sovereign, 'longCtx:0,agentic:0'), s: ['sovereign', 'rag'], l: ['smallctx', 'reasoning'], u: ['rag', 'enterprise'] }
    ]],
    ['teuken', 'opengptx', 'Teuken', 'Teuken', ['oss', 'regional', 'research'], ['sovereign', 'open', 'multiling', 'research'], [
      { id: 'teuken-7b', gen: 'Teuken', ver: '7B Instruct v0.4', st: 'released', rel: '2024', arch: 'Dense transformer', par: '7B', act: '—', ctx: '4K', lang: 'All 24 EU languages', lic: 'Apache-2.0', dep: ['weights', 'selfhost', 'finetune'], cost: 1, c: caps(TPL.sovereign, 'longCtx:0,multiling:2,agentic:0'), s: ['sovereign', 'multiling', 'open'], l: ['smallctx', 'reasoning'], u: ['localization', 'research'] }
    ]],
    ['apertus', 'swissai', 'Apertus', 'Apertus', ['oss', 'national', 'regional'], ['sovereign', 'open', 'selfhost', 'multiling', 'recent'], [
      { id: 'apertus-70b', gen: 'Apertus', ver: '70B Instruct', st: 'released', rel: '2025', arch: 'Dense transformer (fully open pipeline)', par: '70B', act: '—', ctx: '65K', lang: '1000+ languages represented', lic: 'Apache-2.0', dep: ['weights', 'selfhost', 'finetune'], cost: 1, c: caps(TPL.sovereign, 'multiling:2,selfHost:2'), s: ['sovereign', 'open', 'multiling'], l: ['agentic', 'novision'], u: ['selfhost', 'research', 'localization'] },
      { id: 'apertus-8b', gen: 'Apertus', ver: '8B Instruct', st: 'released', rel: '2025', arch: 'Dense transformer (fully open pipeline)', par: '8B', act: '—', ctx: '65K', lang: '1000+ languages represented', lic: 'Apache-2.0', dep: ['weights', 'selfhost', 'edge'], cost: 1, c: caps(TPL.sovereign, 'reasoning:1,agentic:0'), s: ['sovereign', 'edge', 'open'], l: ['reasoning'], u: ['edge', 'research'] }
    ]],
    ['stablelm', 'stability', 'StableLM', 'StableLM', ['openw', 'research'], ['open', 'research', 'edge'], [
      { id: 'stablelm-2-12b', gen: 'StableLM 2', ver: '12B', st: 'archived', rel: '2024', arch: 'Dense transformer', par: '12B', act: '—', ctx: '4K', lang: '7 languages', lic: 'Stability AI Community License', dep: ['weights', 'selfhost'], cost: 1, c: caps(TPL.openSmall, 'longCtx:0'), s: ['open', 'research'], l: ['smallctx', 'reasoning'], u: ['research'] }
    ]],
    ['poro', 'siloai', 'Poro / Viking', 'Poro', ['oss', 'regional'], ['sovereign', 'open', 'multiling', 'research'], [
      { id: 'poro-34b', gen: 'Poro', ver: '34B', st: 'released', rel: '2024', arch: 'Dense transformer', par: '34B', act: '—', ctx: '4K', lang: 'Nordic languages / English', lic: 'Apache-2.0', dep: ['weights', 'selfhost'], cost: 1, c: caps(TPL.sovereign, 'longCtx:0,agentic:0'), s: ['sovereign', 'multiling'], l: ['smallctx', 'reasoning'], u: ['localization', 'research'] }
    ]],

    ['plamo', 'pfn', 'PLaMo', 'PLaMo', ['api', 'national'], ['sovereign', 'multiling', 'enterprise'], [
      { id: 'plamo-2', gen: 'PLaMo 2', ver: '100B', st: 'released', rel: '2025', arch: 'Hybrid Mamba-Transformer', par: '100B', act: '—', ctx: '32K', lang: 'Japanese / English', lic: 'Proprietary / research weights', dep: ['api', 'selfhost'], cost: 2, c: caps(TPL.sovereign, 'longCtx:1,reasoning:2'), s: ['sovereign', 'localization'], l: ['agentic', 'noweights'], u: ['localization', 'enterprise'] }
    ]],
    ['tsuzumi', 'ntt', 'tsuzumi', 'tsuzumi', ['api', 'national', 'enterprise'], ['sovereign', 'edge', 'enterprise', 'lowcost'], [
      { id: 'tsuzumi-2', gen: 'tsuzumi 2', ver: '7B', st: 'released', rel: '2025', arch: 'Dense, compact', par: '7B', act: '—', ctx: '32K', lang: 'Japanese / English', lic: 'Proprietary', dep: ['api', 'selfhost', 'edge'], cost: 1, c: caps(TPL.sovereign, 'reasoning:1,agentic:1'), s: ['sovereign', 'edge', 'lowcost'], l: ['reasoning'], u: ['enterprise', 'edge'] }
    ]],
    ['sakana', 'sakana', 'Sakana research models', 'Sakana', ['research'], ['research', 'open'], [
      { id: 'sakana-tinyswallow', gen: 'TinySwallow', ver: '1.5B', st: 'research', rel: '2025', arch: 'Distilled dense', par: '1.5B', act: '—', ctx: '32K', lang: 'Japanese / English', lic: 'Apache-2.0', dep: ['weights', 'selfhost', 'edge'], cost: 1, c: caps(TPL.research), s: ['research', 'edge'], l: ['reasoning', 'smallctx'], u: ['research', 'edge'] }
    ]],
    ['exaone', 'lgai', 'EXAONE', 'EXAONE', ['openw', 'national', 'research'], ['sovereign', 'open', 'reasoning', 'selfhost'], [
      { id: 'exaone-4-0', gen: 'EXAONE 4.0', ver: '32B', st: 'released', rel: '2025', arch: 'Dense, hybrid reasoning', par: '32B', act: '—', ctx: '128K', lang: 'Korean / English / Spanish', lic: 'EXAONE AI Model License (research)', dep: ['weights', 'selfhost', 'finetune'], cost: 1, c: caps(TPL.sovereign, 'reasoning:2,agentic:2,fnCall:2'), s: ['sovereign', 'reasoning', 'open'], l: ['novision'], u: ['selfhost', 'localization'] }
    ]],
    ['hyperclova', 'naver', 'HyperCLOVA X', 'HCX', ['api', 'openw', 'national'], ['sovereign', 'open', 'multiling', 'enterprise'], [
      { id: 'hcx-seed-14b', gen: 'HyperCLOVA X SEED', ver: '14B', st: 'released', rel: '2025', arch: 'Dense transformer', par: '14B', act: '—', ctx: '32K', lang: 'Korean / English', lic: 'HyperCLOVA X SEED License', dep: ['api', 'weights', 'selfhost'], cost: 1, c: caps(TPL.sovereign, 'agentic:1'), s: ['sovereign', 'localization'], l: ['reasoning'], u: ['localization', 'enterprise'] }
    ]],
    ['gauss', 'samsung', 'Gauss', 'Gauss', ['enterprise', 'national'], ['sovereign', 'edge', 'enterprise'], [
      { id: 'gauss2', gen: 'Gauss2', ver: 'compact', st: 'released', rel: '2024', arch: 'Dense, on-device tiers', par: 'undisclosed', act: '—', ctx: '32K', lang: 'Korean / English / 9 more', lic: 'Proprietary (internal)', dep: ['edge', 'cloud'], cost: 1, c: caps(TPL.sovereign, 'selfHost:1,agentic:1,finetune:0'), s: ['edge', 'sovereign'], l: ['noweights', 'reasoning'], u: ['edge', 'enterprise'] }
    ]],
    ['solar', 'upstage', 'Solar', 'Solar', ['api', 'openw', 'enterprise'], ['open', 'enterprise', 'docs', 'lowcost'], [
      { id: 'solar-pro-2', gen: 'Solar Pro 2', ver: '31B', st: 'released', rel: '2025', arch: 'Dense (depth up-scaled)', par: '31B', act: '—', ctx: '64K', lang: 'Korean / English / Japanese', lic: 'Proprietary / open tiers', dep: ['api', 'weights', 'selfhost'], cost: 1, c: caps(TPL.sovereign, 'reasoning:2,rag:2'), s: ['docs', 'rag', 'sovereign'], l: ['novision'], u: ['docs', 'enterprise'] }
    ]],
    ['kanana', 'kakao', 'Kanana', 'Kanana', ['openw', 'national'], ['open', 'sovereign', 'lowcost'], [
      { id: 'kanana-1-5-8b', gen: 'Kanana 1.5', ver: '8B', st: 'released', rel: '2025', arch: 'Dense transformer', par: '8B', act: '—', ctx: '32K', lang: 'Korean / English', lic: 'Apache-2.0', dep: ['weights', 'selfhost', 'edge'], cost: 1, c: caps(TPL.sovereign, 'reasoning:1,agentic:1'), s: ['sovereign', 'open', 'lowcost'], l: ['reasoning'], u: ['localization', 'selfhost'] }
    ]],
    ['sarvam', 'sarvam', 'Sarvam', 'Sarvam', ['openw', 'national'], ['sovereign', 'open', 'multiling', 'recent'], [
      { id: 'sarvam-m', gen: 'Sarvam-M', ver: '24B', st: 'released', rel: '2025', arch: 'Dense (Mistral-derived)', par: '24B', act: '—', ctx: '32K', lang: '10 Indian languages + English', lic: 'Apache-2.0', dep: ['api', 'weights', 'selfhost'], cost: 1, c: caps(TPL.sovereign, 'multiling:2,reasoning:1'), s: ['sovereign', 'multiling', 'open'], l: ['reasoning', 'novision'], u: ['localization', 'selfhost'] }
    ]],
    ['krutrim', 'krutrim', 'Krutrim', 'Krutrim', ['openw', 'national'], ['sovereign', 'open', 'multiling'], [
      { id: 'krutrim-2', gen: 'Krutrim-2', ver: '12B', st: 'released', rel: '2025', arch: 'Dense (Mistral-derived)', par: '12B', act: '—', ctx: '32K', lang: '10 Indian languages + English', lic: 'Krutrim Community License', dep: ['api', 'weights', 'selfhost'], cost: 1, c: caps(TPL.sovereign, 'multiling:2,agentic:1'), s: ['sovereign', 'multiling'], l: ['reasoning'], u: ['localization'] }
    ]],
    ['airavata', 'ai4bharat', 'AI4Bharat models', 'Airavata', ['oss', 'research', 'national'], ['open', 'research', 'multiling', 'sovereign'], [
      { id: 'airavata-7b', gen: 'Airavata', ver: '7B', st: 'research', rel: '2024', arch: 'Dense (Llama-derived)', par: '7B', act: '—', ctx: '4K', lang: 'Hindi / English', lic: 'Llama Community License', dep: ['weights', 'selfhost'], cost: 1, c: caps(TPL.research, 'multiling:2'), s: ['research', 'multiling'], l: ['smallctx', 'reasoning'], u: ['research', 'localization'] }
    ]],
    ['sealion', 'aisg', 'SEA-LION', 'SEA-LION', ['oss', 'regional'], ['open', 'sovereign', 'multiling'], [
      { id: 'sealion-v3', gen: 'SEA-LION v3', ver: '70B', st: 'released', rel: '2024', arch: 'Dense (Llama-derived)', par: '70B', act: '—', ctx: '128K', lang: '11 Southeast Asian languages', lic: 'Llama Community License', dep: ['weights', 'selfhost', 'api'], cost: 1, c: caps(TPL.sovereign, 'multiling:2'), s: ['sovereign', 'multiling', 'open'], l: ['reasoning', 'novision'], u: ['localization', 'selfhost'] }
    ]],
    ['taide', 'taide', 'TAIDE', 'TAIDE', ['oss', 'national'], ['open', 'sovereign', 'multiling'], [
      { id: 'taide-llama3-8b', gen: 'TAIDE', ver: 'LX-8B', st: 'released', rel: '2024', arch: 'Dense (Llama-derived)', par: '8B', act: '—', ctx: '8K', lang: 'Traditional Chinese / English', lic: 'TAIDE License', dep: ['weights', 'selfhost'], cost: 1, c: caps(TPL.sovereign, 'longCtx:0,agentic:0'), s: ['sovereign', 'localization'], l: ['smallctx'], u: ['localization'] }
    ]],
    ['falcon', 'tii', 'Falcon', 'Falcon', ['oss', 'national', 'regional'], ['open', 'sovereign', 'selfhost', 'edge', 'recent'], [
      { id: 'falcon-h1-34b', gen: 'Falcon-H1', ver: '34B Instruct', st: 'released', rel: '2025', arch: 'Hybrid Mamba-Transformer', par: '34B', act: '—', ctx: '256K', lang: '18 languages incl. Arabic', lic: 'Falcon LLM License (Apache-like)', dep: ['weights', 'selfhost', 'finetune', 'edge'], cost: 1, c: caps(TPL.sovereign, 'longCtx:2,reasoning:2,selfHost:2'), s: ['sovereign', 'open', 'longctx'], l: ['novision'], u: ['selfhost', 'localization'] },
      { id: 'falcon-3-10b', gen: 'Falcon 3', ver: '10B Instruct', st: 'released', rel: '2024', arch: 'Dense transformer', par: '10B', act: '—', ctx: '32K', lang: '4 languages', lic: 'Falcon LLM License', dep: ['weights', 'selfhost', 'edge'], cost: 1, c: caps(TPL.openSmall, 'selfHost:2'), s: ['open', 'edge'], l: ['reasoning', 'multiling'], u: ['edge', 'selfhost'] }
    ]],
    ['jais', 'mbzuai', 'Jais', 'Jais', ['oss', 'national', 'regional'], ['open', 'sovereign', 'multiling'], [
      { id: 'jais-70b', gen: 'Jais family', ver: '70B Chat', st: 'released', rel: '2024', arch: 'Dense, Arabic-centric', par: '70B', act: '—', ctx: '32K', lang: 'Arabic / English', lic: 'Apache-2.0', dep: ['weights', 'selfhost', 'api'], cost: 1, c: caps(TPL.sovereign, 'multiling:2'), s: ['sovereign', 'multiling', 'open'], l: ['reasoning', 'novision'], u: ['localization', 'selfhost'] }
    ]],
    ['sabia', 'maritaca', 'Sabiá', 'Sabiá', ['api', 'national'], ['sovereign', 'multiling', 'lowcost'], [
      { id: 'sabia-3', gen: 'Sabiá-3', ver: 'sabia-3', st: 'released', rel: '2024', arch: 'Dense, Portuguese-centric', par: 'undisclosed', act: '—', ctx: '128K', lang: 'Brazilian Portuguese / English', lic: 'Proprietary', dep: ['api'], cost: 1, c: caps(TPL.sovereign, 'selfHost:0,finetune:0,multiling:2'), s: ['sovereign', 'localization', 'lowcost'], l: ['noweights'], u: ['localization', 'enterprise'] }
    ]],
    ['inkuba', 'lelapa', 'InkubaLM', 'InkubaLM', ['oss', 'regional', 'research'], ['open', 'sovereign', 'multiling', 'edge', 'research'], [
      { id: 'inkubalm-0-4b', gen: 'InkubaLM', ver: '0.4B', st: 'released', rel: '2024', arch: 'Dense, small language model', par: '0.4B', act: '—', ctx: '2K', lang: '5 African languages + EN/FR', lic: 'CC-BY-NC', dep: ['weights', 'selfhost', 'edge'], cost: 1, c: caps(TPL.research, 'multiling:2'), s: ['sovereign', 'edge', 'multiling'], l: ['reasoning', 'smallctx'], u: ['localization', 'research'] }
    ]],
    ['kazllm', 'issai', 'KazLLM', 'KazLLM', ['oss', 'national'], ['open', 'sovereign', 'multiling', 'recent'], [
      { id: 'kazllm-8b', gen: 'KazLLM', ver: '8B Instruct', st: 'released', rel: '2024', arch: 'Dense (Llama-derived)', par: '8B', act: '—', ctx: '8K', lang: 'Kazakh / Russian / English / Turkish', lic: 'Llama Community License', dep: ['weights', 'selfhost'], cost: 1, c: caps(TPL.sovereign, 'longCtx:0,agentic:0,multiling:2'), s: ['sovereign', 'multiling'], l: ['smallctx', 'reasoning'], u: ['localization', 'selfhost'] }
    ]]
  ];

  // ---- 2026 releases (source: llmgateway.io/timeline/2026, checked 27.09.2026). Specs not published are marked undisclosed / —. ----
  F.push(['muse', 'meta', 'Muse', 'Muse', ['api'], ['frontier', 'multimodal'], []]);
  F.push(['inkling', 'thinkingmachines', 'Inkling', 'Inkling', ['api'], ['frontier'], []]);
  F.push(['ling', 'inclusionai', 'Ling', 'Ling', ['openw'], ['open', 'lowcost'], []]);
  var ADD26 = {
    claude: [
      { id: 'claude-opus-5-5', gen: 'Claude 5', ver: 'Opus 5.5', st: 'released', rel: '2026', arch: 'Undisclosed', par: 'undisclosed', act: '—', ctx: '—', lang: 'Multilingual', lic: 'Proprietary', dep: ['api', 'cloud'], cost: 3, c: caps(TPL.frontier, 'mcp:2,computerUse:2'), s: ['coding', 'agentic', 'reasoning'], l: ['noweights'], u: ['coding', 'agentic'] },
      { id: 'claude-fable-5-1', gen: 'Claude 5', ver: 'Fable 5.1', st: 'released', rel: '2026', arch: 'Undisclosed', par: 'undisclosed', act: '—', ctx: '—', lang: 'Multilingual', lic: 'Proprietary', dep: ['api', 'cloud'], cost: 3, c: caps(TPL.frontier, 'mcp:2'), s: ['coding', 'agentic', 'reasoning'], l: ['noweights'], u: ['coding', 'agentic'] },
      { id: 'claude-opus-5', gen: 'Claude 5', ver: 'Opus 5', st: 'released', rel: '2026', arch: 'Undisclosed', par: 'undisclosed', act: '—', ctx: '—', lang: 'Multilingual', lic: 'Proprietary', dep: ['api', 'cloud'], cost: 3, c: caps(TPL.frontier, 'mcp:2,computerUse:2'), s: ['coding', 'agentic', 'reasoning'], l: ['noweights'], u: ['coding', 'agentic'] },
      { id: 'claude-sonnet-5', gen: 'Claude 5', ver: 'Sonnet 5', st: 'released', rel: '2026', arch: 'Undisclosed', par: 'undisclosed', act: '—', ctx: '—', lang: 'Multilingual', lic: 'Proprietary', dep: ['api', 'cloud'], cost: 2, c: caps(TPL.frontier, 'mcp:2,computerUse:2'), s: ['coding', 'agentic', 'reasoning'], l: ['noweights'], u: ['coding', 'agentic'] },
      { id: 'claude-opus-4-8', gen: 'Claude 4', ver: 'Opus 4.8', st: 'released', rel: '2026', arch: 'Undisclosed', par: 'undisclosed', act: '—', ctx: '—', lang: 'Multilingual', lic: 'Proprietary', dep: ['api', 'cloud'], cost: 3, c: caps(TPL.frontier), s: ['coding', 'agentic', 'reasoning'], l: ['noweights'], u: ['coding', 'agentic'] },
      { id: 'claude-opus-4-7', gen: 'Claude 4', ver: 'Opus 4.7', st: 'released', rel: '2026', arch: 'Undisclosed', par: 'undisclosed', act: '—', ctx: '—', lang: 'Multilingual', lic: 'Proprietary', dep: ['api', 'cloud'], cost: 3, c: caps(TPL.frontier), s: ['coding', 'agentic', 'reasoning'], l: ['noweights'], u: ['coding', 'agentic'] },
      { id: 'claude-sonnet-4-6', gen: 'Claude 4', ver: 'Sonnet 4.6', st: 'released', rel: '2026', arch: 'Undisclosed', par: 'undisclosed', act: '—', ctx: '—', lang: 'Multilingual', lic: 'Proprietary', dep: ['api', 'cloud'], cost: 2, c: caps(TPL.frontier), s: ['coding', 'agentic', 'reasoning'], l: ['noweights'], u: ['coding', 'agentic'] },
      { id: 'claude-opus-4-6', gen: 'Claude 4', ver: 'Opus 4.6', st: 'released', rel: '2026', arch: 'Undisclosed', par: 'undisclosed', act: '—', ctx: '—', lang: 'Multilingual', lic: 'Proprietary', dep: ['api', 'cloud'], cost: 3, c: caps(TPL.frontier), s: ['coding', 'agentic', 'reasoning'], l: ['noweights'], u: ['coding', 'agentic'] }
    ],
    gpt: [
      { id: 'gpt-6-sol', gen: 'GPT-6', ver: '6 Sol', st: 'released', rel: '2026', arch: 'Undisclosed', par: 'undisclosed', act: '—', ctx: '—', lang: 'Multilingual', lic: 'Proprietary', dep: ['api', 'cloud'], cost: 3, c: caps(TPL.frontier), s: ['coding', 'agentic', 'reasoning'], l: ['noweights'], u: ['coding', 'agentic'] },
      { id: 'gpt-6-luna', gen: 'GPT-6', ver: '6 Luna', st: 'released', rel: '2026', arch: 'Undisclosed', par: 'undisclosed', act: '—', ctx: '—', lang: 'Multilingual', lic: 'Proprietary', dep: ['api', 'cloud'], cost: 2, c: caps(TPL.frontier), s: ['coding', 'agentic', 'reasoning'], l: ['noweights'], u: ['coding', 'agentic'] },
      { id: 'gpt-6-astra', gen: 'GPT-6', ver: '6 Astra', st: 'released', rel: '2026', arch: 'Undisclosed', par: 'undisclosed', act: '—', ctx: '1.05M', lang: 'Multilingual', lic: 'Proprietary', dep: ['api', 'cloud'], cost: 3, c: caps(TPL.frontier), s: ['coding', 'agentic', 'reasoning'], l: ['noweights'], u: ['coding', 'agentic'] },
      { id: 'gpt-5-6-sol', gen: 'GPT-5.6', ver: '5.6 Sol', st: 'released', rel: '2026', arch: 'Undisclosed', par: 'undisclosed', act: '—', ctx: '—', lang: 'Multilingual', lic: 'Proprietary', dep: ['api', 'cloud'], cost: 3, c: caps(TPL.frontier), s: ['coding', 'agentic', 'reasoning'], l: ['noweights'], u: ['coding', 'agentic'] },
      { id: 'gpt-5-6-terra', gen: 'GPT-5.6', ver: '5.6 Terra', st: 'released', rel: '2026', arch: 'Undisclosed', par: 'undisclosed', act: '—', ctx: '—', lang: 'Multilingual', lic: 'Proprietary', dep: ['api', 'cloud'], cost: 2, c: caps(TPL.frontier), s: ['coding', 'agentic', 'reasoning'], l: ['noweights'], u: ['coding', 'agentic'] },
      { id: 'gpt-5-6-luna', gen: 'GPT-5.6', ver: '5.6 Luna', st: 'released', rel: '2026', arch: 'Undisclosed', par: 'undisclosed', act: '—', ctx: '—', lang: 'Multilingual', lic: 'Proprietary', dep: ['api', 'cloud'], cost: 1, c: caps(TPL.frontier), s: ['coding', 'agentic', 'reasoning'], l: ['noweights'], u: ['coding', 'agentic'] },
      { id: 'gpt-5-5', gen: 'GPT-5.5', ver: '5.5', st: 'released', rel: '2026', arch: 'Undisclosed', par: 'undisclosed', act: '—', ctx: '—', lang: 'Multilingual', lic: 'Proprietary', dep: ['api', 'cloud'], cost: 3, c: caps(TPL.frontier), s: ['coding', 'agentic', 'reasoning'], l: ['noweights'], u: ['coding', 'agentic'] },
      { id: 'gpt-5-4', gen: 'GPT-5.4', ver: '5.4', st: 'released', rel: '2026', arch: 'Undisclosed', par: 'undisclosed', act: '—', ctx: '—', lang: 'Multilingual', lic: 'Proprietary', dep: ['api', 'cloud'], cost: 2, c: caps(TPL.frontier), s: ['coding', 'agentic', 'reasoning'], l: ['noweights'], u: ['coding', 'agentic'] },
      { id: 'gpt-5-3-codex', gen: 'GPT-5.3', ver: '5.3 Codex', st: 'released', rel: '2026', arch: 'Undisclosed', par: 'undisclosed', act: '—', ctx: '—', lang: 'Multilingual', lic: 'Proprietary', dep: ['api', 'cloud'], cost: 2, c: caps(TPL.frontierText, 'coding:2'), s: ['coding', 'agentic', 'reasoning'], l: ['noweights'], u: ['coding', 'agentic'] }
    ],
    gemini: [
      { id: 'gemini-3-8-flash', gen: 'Gemini 3', ver: '3.8 Flash', st: 'released', rel: '2026', arch: 'Undisclosed', par: 'undisclosed', act: '—', ctx: '—', lang: 'Multilingual', lic: 'Proprietary', dep: ['api', 'cloud'], cost: 1, c: caps(TPL.frontier), s: ['coding', 'agentic', 'reasoning'], l: ['noweights'], u: ['coding', 'agentic'] },
      { id: 'gemini-3-7-flash', gen: 'Gemini 3', ver: '3.7 Flash', st: 'released', rel: '2026', arch: 'Undisclosed', par: 'undisclosed', act: '—', ctx: '—', lang: 'Multilingual', lic: 'Proprietary', dep: ['api', 'cloud'], cost: 1, c: caps(TPL.frontier), s: ['coding', 'agentic', 'reasoning'], l: ['noweights'], u: ['coding', 'agentic'] },
      { id: 'gemini-3-5-flash', gen: 'Gemini 3', ver: '3.5 Flash', st: 'released', rel: '2026', arch: 'Undisclosed', par: 'undisclosed', act: '—', ctx: '—', lang: 'Multilingual', lic: 'Proprietary', dep: ['api', 'cloud'], cost: 1, c: caps(TPL.frontier), s: ['coding', 'agentic', 'reasoning'], l: ['noweights'], u: ['coding', 'agentic'] },
      { id: 'gemini-3-1-pro', gen: 'Gemini 3', ver: '3.1 Pro', st: 'released', rel: '2026', arch: 'Undisclosed', par: 'undisclosed', act: '—', ctx: '—', lang: 'Multilingual', lic: 'Proprietary', dep: ['api', 'cloud'], cost: 3, c: caps(TPL.frontier), s: ['coding', 'agentic', 'reasoning'], l: ['noweights'], u: ['coding', 'agentic'] }
    ],
    grok: [
      { id: 'grok-4-7', gen: 'Grok 4', ver: '4.7', st: 'released', rel: '2026', arch: 'Undisclosed', par: 'undisclosed', act: '—', ctx: '—', lang: 'Multilingual', lic: 'Proprietary', dep: ['api', 'cloud'], cost: 2, c: caps(TPL.frontier), s: ['coding', 'agentic', 'reasoning'], l: ['noweights'], u: ['coding', 'agentic'] },
      { id: 'grok-4-6', gen: 'Grok 4', ver: '4.6', st: 'released', rel: '2026', arch: 'Undisclosed', par: 'undisclosed', act: '—', ctx: '—', lang: 'Multilingual', lic: 'Proprietary', dep: ['api', 'cloud'], cost: 2, c: caps(TPL.frontier), s: ['coding', 'agentic', 'reasoning'], l: ['noweights'], u: ['coding', 'agentic'] },
      { id: 'grok-4-5', gen: 'Grok 4', ver: '4.5', st: 'released', rel: '2026', arch: 'Undisclosed', par: 'undisclosed', act: '—', ctx: '—', lang: 'Multilingual', lic: 'Proprietary', dep: ['api', 'cloud'], cost: 2, c: caps(TPL.frontier), s: ['coding', 'agentic', 'reasoning'], l: ['noweights'], u: ['coding', 'agentic'] }
    ],
    gemma: [
      { id: 'gemma-4-31b', gen: 'Gemma 4', ver: '4 31B', st: 'released', rel: '2026', arch: 'Dense transformer', par: '31B', act: '—', ctx: '—', lang: 'Multilingual', lic: 'Apache-2.0', dep: ['weights', 'selfhost', 'api', 'finetune'], cost: 1, c: caps(TPL.openMid), s: ['open', 'lowcost'], l: [], u: ['selfhost', 'coding'] },
      { id: 'gemma-4-26b-a4b', gen: 'Gemma 4', ver: '4 26B-A4B', st: 'released', rel: '2026', arch: 'MoE', par: '26B', act: '4B', ctx: '—', lang: 'Multilingual', lic: 'Apache-2.0', dep: ['weights', 'selfhost', 'api', 'finetune'], cost: 1, c: caps(TPL.openMid), s: ['open', 'lowcost'], l: [], u: ['selfhost', 'coding'] }
    ],
    qwen: [
      { id: 'qwen3-8-2-4t', gen: 'Qwen 3.8', ver: '3.8 2.4T-A95B', st: 'released', rel: '2026', arch: 'MoE', par: '2.4T', act: '95B', ctx: '—', lang: 'Multilingual', lic: 'Qwen license', dep: ['weights', 'selfhost', 'api', 'finetune'], cost: 1, c: caps(TPL.openFrontier), s: ['open', 'lowcost'], l: [], u: ['selfhost', 'coding'] },
      { id: 'qwen3-8-27b', gen: 'Qwen 3.8', ver: '3.8 27B', st: 'released', rel: '2026', arch: 'Dense, vision-language', par: '27B', act: '—', ctx: '262K', lang: 'Multilingual', lic: 'Apache-2.0', dep: ['weights', 'selfhost', 'api', 'finetune'], cost: 1, c: caps(TPL.openMid, 'vision:2'), s: ['open', 'lowcost'], l: [], u: ['selfhost', 'coding'] },
      { id: 'qwen3-6-35b-a3b', gen: 'Qwen 3.6', ver: '3.6 35B-A3B', st: 'released', rel: '2026', arch: 'MoE', par: '35B', act: '3B', ctx: '—', lang: 'Multilingual', lic: 'Apache-2.0', dep: ['weights', 'selfhost', 'api', 'finetune'], cost: 1, c: caps(TPL.openMid), s: ['open', 'lowcost'], l: [], u: ['selfhost', 'coding'] },
      { id: 'qwen3-5-397b', gen: 'Qwen 3.5', ver: '3.5 397B-A17B', st: 'released', rel: '2026', arch: 'MoE', par: '397B', act: '17B', ctx: '—', lang: 'Multilingual', lic: 'Apache-2.0', dep: ['weights', 'selfhost', 'api', 'finetune'], cost: 1, c: caps(TPL.openFrontier), s: ['open', 'lowcost'], l: [], u: ['selfhost', 'coding'] },
      { id: 'qwen3-5-122b', gen: 'Qwen 3.5', ver: '3.5 122B-A10B', st: 'released', rel: '2026', arch: 'MoE', par: '122B', act: '10B', ctx: '—', lang: 'Multilingual', lic: 'Apache-2.0', dep: ['weights', 'selfhost', 'api', 'finetune'], cost: 1, c: caps(TPL.openMid), s: ['open', 'lowcost'], l: [], u: ['selfhost', 'coding'] }
    ],
    deepseek: [
      { id: 'deepseek-v4-1-flash', gen: 'V-series', ver: 'V4.1 Flash', st: 'released', rel: '2026', arch: 'MoE, hybrid attention', par: 'undisclosed', act: '—', ctx: '—', lang: 'Multilingual', lic: 'MIT', dep: ['weights', 'selfhost', 'api', 'finetune'], cost: 1, c: caps(TPL.openFrontier), s: ['open', 'lowcost'], l: [], u: ['selfhost', 'coding'] },
      { id: 'deepseek-v4-pro', gen: 'V-series', ver: 'V4 Pro', st: 'released', rel: '2026', arch: 'MoE, hybrid attention', par: 'undisclosed', act: '—', ctx: '—', lang: 'Multilingual', lic: 'MIT', dep: ['weights', 'selfhost', 'api', 'finetune'], cost: 1, c: caps(TPL.openFrontier), s: ['open', 'lowcost'], l: [], u: ['selfhost', 'coding'] },
      { id: 'deepseek-v4-flash', gen: 'V-series', ver: 'V4 Flash', st: 'released', rel: '2026', arch: 'MoE, hybrid attention', par: 'undisclosed', act: '—', ctx: '—', lang: 'Multilingual', lic: 'MIT', dep: ['weights', 'selfhost', 'api', 'finetune'], cost: 1, c: caps(TPL.openFrontier), s: ['open', 'lowcost'], l: [], u: ['selfhost', 'coding'] }
    ],
    kimi: [
      { id: 'kimi-k3', gen: 'Kimi K3', ver: 'K3', st: 'released', rel: '2026', arch: 'MoE', par: 'undisclosed', act: '—', ctx: '—', lang: 'Multilingual', lic: 'Modified MIT', dep: ['weights', 'selfhost', 'api', 'finetune'], cost: 1, c: caps(TPL.openFrontier), s: ['open', 'lowcost'], l: [], u: ['selfhost', 'coding'] },
      { id: 'kimi-k2-6', gen: 'Kimi K2', ver: 'K2.6', st: 'released', rel: '2026', arch: 'MoE', par: '1T', act: '32B', ctx: '—', lang: 'Multilingual', lic: 'Modified MIT', dep: ['weights', 'selfhost', 'api', 'finetune'], cost: 1, c: caps(TPL.openFrontier), s: ['open', 'lowcost'], l: [], u: ['selfhost', 'coding'] }
    ],
    glm: [
      { id: 'glm-5-3', gen: 'GLM-5', ver: '5.3', st: 'released', rel: '2026', arch: 'Undisclosed', par: 'undisclosed', act: '—', ctx: '—', lang: 'Multilingual', lic: 'Proprietary', dep: ['api', 'cloud'], cost: 1, c: caps(TPL.frontier), s: ['coding', 'agentic', 'reasoning'], l: ['noweights'], u: ['coding', 'agentic'] },
      { id: 'glm-5-3-flash', gen: 'GLM-5', ver: '5.3 Flash', st: 'released', rel: '2026', arch: 'MoE', par: 'undisclosed', act: '—', ctx: '—', lang: 'Multilingual', lic: 'MIT', dep: ['weights', 'selfhost', 'api', 'finetune'], cost: 1, c: caps(TPL.openMid), s: ['open', 'lowcost'], l: [], u: ['selfhost', 'coding'] },
      { id: 'glm-5-2', gen: 'GLM-5', ver: '5.2', st: 'released', rel: '2026', arch: 'MoE', par: 'undisclosed', act: '—', ctx: '—', lang: 'Multilingual', lic: 'MIT', dep: ['weights', 'selfhost', 'api', 'finetune'], cost: 1, c: caps(TPL.openFrontier), s: ['open', 'lowcost'], l: [], u: ['selfhost', 'coding'] }
    ],
    minimax: [
      { id: 'minimax-h3-max', gen: 'MiniMax H3', ver: 'H3 Max', st: 'released', rel: '2026', arch: 'Undisclosed', par: 'undisclosed', act: '—', ctx: '—', lang: 'Multilingual', lic: 'Proprietary', dep: ['api', 'cloud'], cost: 2, c: caps(TPL.frontier), s: ['coding', 'agentic', 'reasoning'], l: ['noweights'], u: ['coding', 'agentic'] },
      { id: 'minimax-m3', gen: 'MiniMax M3', ver: 'M3', st: 'released', rel: '2026', arch: 'MoE', par: 'undisclosed', act: '—', ctx: '—', lang: 'Multilingual', lic: 'MIT', dep: ['weights', 'selfhost', 'api', 'finetune'], cost: 1, c: caps(TPL.openFrontier), s: ['open', 'lowcost'], l: [], u: ['selfhost', 'coding'] }
    ],
    mimo: [
      { id: 'mimo-v2-6-pro', gen: 'MiMo V2', ver: 'V2.6 Pro', st: 'released', rel: '2026', arch: 'Undisclosed', par: 'undisclosed', act: '—', ctx: '—', lang: 'Multilingual', lic: 'Proprietary', dep: ['api', 'cloud'], cost: 1, c: caps(TPL.frontier), s: ['coding', 'agentic', 'reasoning'], l: ['noweights'], u: ['coding', 'agentic'] },
      { id: 'mimo-v2-6-flash', gen: 'MiMo V2', ver: 'V2.6 Flash', st: 'released', rel: '2026', arch: 'MoE', par: 'undisclosed', act: '—', ctx: '—', lang: 'Multilingual', lic: 'MIT', dep: ['weights', 'selfhost', 'api', 'finetune'], cost: 1, c: caps(TPL.openMid), s: ['open', 'lowcost'], l: [], u: ['selfhost', 'coding'] }
    ],
    seed: [
      { id: 'seed-2-1-turbo', gen: 'Seed 2', ver: '2.1 Turbo', st: 'released', rel: '2026', arch: 'Undisclosed', par: 'undisclosed', act: '—', ctx: '—', lang: 'Multilingual', lic: 'Proprietary', dep: ['api', 'cloud'], cost: 1, c: caps(TPL.frontier), s: ['coding', 'agentic', 'reasoning'], l: ['noweights'], u: ['coding', 'agentic'] }
    ],
    hunyuan: [
      { id: 'hy4-preview', gen: 'Hunyuan', ver: 'Hy4 Preview', st: 'released', rel: '2026', arch: 'Undisclosed', par: 'undisclosed', act: '—', ctx: '—', lang: 'Multilingual', lic: 'Proprietary', dep: ['api', 'cloud'], cost: 1, c: caps(TPL.frontier), s: ['coding', 'agentic', 'reasoning'], l: ['noweights'], u: ['coding', 'agentic'] },
      { id: 'hy3', gen: 'Hunyuan', ver: 'Hy3', st: 'released', rel: '2026', arch: 'Undisclosed', par: 'undisclosed', act: '—', ctx: '—', lang: 'Multilingual', lic: 'Proprietary', dep: ['api', 'cloud'], cost: 1, c: caps(TPL.frontier), s: ['coding', 'agentic', 'reasoning'], l: ['noweights'], u: ['coding', 'agentic'] }
    ],
    nemotron: [
      { id: 'nemotron-3-ultra', gen: 'Nemotron 3', ver: '3 Ultra 550B', st: 'released', rel: '2026', arch: 'Hybrid Mamba-Transformer MoE', par: '550B', act: '—', ctx: '—', lang: 'Multilingual', lic: 'NVIDIA Open Model', dep: ['weights', 'selfhost', 'api', 'finetune'], cost: 1, c: caps(TPL.openFrontier), s: ['open', 'lowcost'], l: [], u: ['selfhost', 'coding'] },
      { id: 'nemotron-3-5-lightning', gen: 'Nemotron 3', ver: '3.5 Lightning', st: 'released', rel: '2026', arch: 'Hybrid MoE', par: 'undisclosed', act: '—', ctx: '—', lang: 'Multilingual', lic: 'NVIDIA Open Model', dep: ['weights', 'selfhost', 'api', 'finetune'], cost: 1, c: caps(TPL.openMid), s: ['open', 'lowcost'], l: [], u: ['selfhost', 'coding'] }
    ],
    mistral: [
      { id: 'mistral-medium-3-5', gen: 'Mistral 3', ver: 'Medium 3.5', st: 'released', rel: '2026', arch: 'Undisclosed', par: 'undisclosed', act: '—', ctx: '—', lang: 'Multilingual', lic: 'Proprietary', dep: ['api', 'cloud'], cost: 1, c: caps(TPL.frontier), s: ['coding', 'agentic', 'reasoning'], l: ['noweights'], u: ['coding', 'agentic'] },
      { id: 'mistral-small-4', gen: 'Mistral 4', ver: 'Small 4', st: 'released', rel: '2026', arch: 'Dense transformer', par: 'undisclosed', act: '—', ctx: '—', lang: 'Multilingual', lic: 'Apache-2.0', dep: ['weights', 'selfhost', 'api', 'finetune'], cost: 1, c: caps(TPL.openMid), s: ['open', 'lowcost'], l: [], u: ['selfhost', 'coding'] }
    ],
    granite: [
      { id: 'granite-4-2-8b', gen: 'Granite 4', ver: '4.2 8B', st: 'released', rel: '2026', arch: 'Hybrid Mamba-Transformer', par: '8B', act: '—', ctx: '—', lang: 'Multilingual', lic: 'Apache-2.0', dep: ['weights', 'selfhost', 'api', 'finetune'], cost: 1, c: caps(TPL.openSmall), s: ['open', 'lowcost'], l: [], u: ['selfhost', 'coding'] }
    ],
    step: [
      { id: 'step-3-7-flash', gen: 'Step 3', ver: '3.7 Flash', st: 'released', rel: '2026', arch: 'MoE', par: 'undisclosed', act: '—', ctx: '—', lang: 'Multilingual', lic: 'Apache-2.0', dep: ['weights', 'selfhost', 'api', 'finetune'], cost: 1, c: caps(TPL.openMid), s: ['open', 'lowcost'], l: [], u: ['selfhost', 'coding'] }
    ],
    sakana: [
      { id: 'fugu-ultra-2', gen: 'Fugu', ver: 'Fugu Ultra 2.0', st: 'released', rel: '2026', arch: 'Undisclosed', par: 'undisclosed', act: '—', ctx: '—', lang: 'Multilingual', lic: 'Proprietary', dep: ['api', 'cloud'], cost: 2, c: caps(TPL.frontier), s: ['coding', 'agentic', 'reasoning'], l: ['noweights'], u: ['coding', 'agentic'] },
      { id: 'fugu-max', gen: 'Fugu', ver: 'Fugu Max', st: 'released', rel: '2026', arch: 'Undisclosed', par: 'undisclosed', act: '—', ctx: '—', lang: 'Multilingual', lic: 'Proprietary', dep: ['api', 'cloud'], cost: 2, c: caps(TPL.frontier), s: ['coding', 'agentic', 'reasoning'], l: ['noweights'], u: ['coding', 'agentic'] }
    ],
    apertus: [
      { id: 'apertus-1-5', gen: 'Apertus', ver: '1.5', st: 'released', rel: '2026', arch: 'Dense transformer', par: '70B', act: '—', ctx: '—', lang: 'Multilingual', lic: 'Apache-2.0', dep: ['weights', 'selfhost', 'api', 'finetune'], cost: 1, c: caps(TPL.sovereign), s: ['open', 'lowcost'], l: [], u: ['selfhost', 'coding'] }
    ],
    muse: [
      { id: 'muse-spark-1-3', gen: 'Muse', ver: 'Spark 1.3', st: 'released', rel: '2026', arch: 'Undisclosed', par: 'undisclosed', act: '—', ctx: '—', lang: 'Multilingual', lic: 'Proprietary', dep: ['api', 'cloud'], cost: 2, c: caps(TPL.frontier), s: ['coding', 'agentic', 'reasoning'], l: ['noweights'], u: ['coding', 'agentic'] },
      { id: 'muse-glimmer-30b', gen: 'Muse', ver: 'Glimmer 30B', st: 'released', rel: '2026', arch: 'Undisclosed', par: '30B', act: '—', ctx: '—', lang: 'Multilingual', lic: 'Apache-2.0', dep: ['weights', 'selfhost', 'api', 'finetune'], cost: 1, c: caps(TPL.openMid), s: ['open', 'lowcost'], l: [], u: ['selfhost', 'coding'] }
    ],
    inkling: [
      { id: 'inkling', gen: 'Inkling', ver: 'Inkling', st: 'released', rel: '2026', arch: 'Undisclosed', par: 'undisclosed', act: '—', ctx: '—', lang: 'Multilingual', lic: 'Proprietary', dep: ['api', 'cloud'], cost: 2, c: caps(TPL.frontier), s: ['coding', 'agentic', 'reasoning'], l: ['noweights'], u: ['coding', 'agentic'] },
      { id: 'inkling-small', gen: 'Inkling', ver: 'Small', st: 'released', rel: '2026', arch: 'Undisclosed', par: 'undisclosed', act: '—', ctx: '—', lang: 'Multilingual', lic: 'Proprietary', dep: ['api', 'cloud'], cost: 1, c: caps(TPL.frontier), s: ['coding', 'agentic', 'reasoning'], l: ['noweights'], u: ['coding', 'agentic'] }
    ],
    ling: [
      { id: 'ling-3-flash', gen: 'Ling 3', ver: '3.0 Flash', st: 'released', rel: '2026', arch: 'MoE', par: 'undisclosed', act: '—', ctx: '—', lang: 'Multilingual', lic: 'MIT', dep: ['weights', 'selfhost', 'api', 'finetune'], cost: 1, c: caps(TPL.openMid), s: ['open', 'lowcost'], l: [], u: ['selfhost', 'coding'] }
    ]
  };
  F.forEach(function (f) { var a = ADD26[f[0]]; if (!a) return; var have = {}; f[6].forEach(function (m) { have[m.id] = 1; }); f[6] = a.filter(function (m) { return !have[m.id]; }).concat(f[6]); });

  // ---- Build indexes ----
  var axes = AXES.map(function (a) { return { key: a[0], en: a[1], ru: a[2], nodes: a[3] }; });
  var families = [], models = [], byModel = {}, byFamily = {};
  F.forEach(function (f) {
    var org = O[f[1]];
    var fam = {
      key: f[0], org: f[1], orgName: org[0], countryEn: org[1], countryRu: org[2], cc: org[3], flag: org[4], region: org[5],
      name: f[2], short: f[3], sov: f[4], tags: f[5], models: []
    };
    f[6].forEach(function (m, i) {
      var mm = Object.assign({}, m, { fam: fam.key, famName: fam.name, short: fam.short, org: fam.org, orgName: fam.orgName,
        countryEn: fam.countryEn, countryRu: fam.countryRu, cc: fam.cc, flag: fam.flag, region: fam.region, sov: fam.sov, tags: fam.tags,
        name: fam.name + ' ' + m.ver, isDefault: i === 0 });
      mm.pB = parseB(mm.par); mm.aB = parseB(mm.act);
      if (mm.aB && mm.pB && mm.aB > mm.pB) mm.aB = null;
      fam.models.push(mm); models.push(mm); byModel[mm.id] = mm;
    });
    families.push(fam); byFamily[fam.key] = fam;
  });

  // node id -> capability state for a given model: 2 strong, 1 limited, 0 weak, -1 harness-only
  var HARNESS_SET = {};
  function markHarness(atlas) {
    HARNESS_ONLY.forEach(function (d) {
      HARNESS_SET[d] = 1;
      atlas.nodes.forEach(function (n) { if (n.domain === d) HARNESS_SET[n.id] = 1; });
    });
  }
  function stateMap(model, atlas) {
    if (!Object.keys(HARNESS_SET).length) markHarness(atlas);
    var out = {};
    atlas.nodes.forEach(function (n) { out[n.id] = HARNESS_SET[n.id] ? -1 : 0; });
    if (!model) return out;
    axes.forEach(function (ax, i) {
      var v = parseInt(model.c[i], 10) || 0;
      if (!v) return;
      ax.nodes.forEach(function (id) {
        if (out[id] === undefined || out[id] === -1) return;
        if (v > out[id]) out[id] = v;
      });
    });
    // a parent is at least as capable as its strongest child — chains light up together
    var by = atlas.byId;
    atlas.nodes.slice().sort(function (a, b) { return b.level - a.level; }).forEach(function (n) {
      if (!n.parent || out[n.id] === -1) return;
      var p = by[n.parent];
      if (out[p.id] === -1 || p.id === 'llm') return;
      if (out[n.id] > out[p.id]) out[p.id] = out[n.id];
    });
    out.llm = 2;
    return out;
  }

  // "30B" -> 30, "1T" -> 1000, "~3B" -> 3, "undisclosed" -> null
  function parseB(v) {
    if (!v) return null;
    var m = String(v).match(/([\d.]+)\s*([BTMbtm])/);
    if (!m) return null;
    var n = parseFloat(m[1]), u = m[2].toUpperCase();
    return u === 'T' ? n * 1000 : u === 'M' ? n / 1000 : n;
  }

  function pick(list, lang) { return lang === 'ru' ? list[2] : list[1]; }

  var MUI = {
    en: {
      models: 'Models', changeModel: 'Change model', modelSelector: 'Model registry', searchModels: 'Search models, organizations, countries…',
      regions: 'Regions', discovery: 'Discovery', compare: 'Compare', comparing: 'Comparing', clear: 'Clear', add: 'Add to compare',
      identity: 'Identity', architecture: 'Architecture', capabilities: 'Capabilities', languages: 'Languages', deployment: 'Deployment',
      economics: 'Economics', governance: 'Governance', strengths: 'Strengths', limitations: 'Limitations', bestFor: 'Best for',
      related: 'Related versions', similar: 'Similar models', harness: 'AI engineering harness',
      organization: 'Organization', country: 'Country', family: 'Family', generation: 'Generation', version: 'Version',
      params: 'Parameters', active: 'Active', context: 'Context', license: 'License', status: 'Status', sovereignty: 'Sovereignty',
      released: 'Released', costTier: 'Cost tier', input: 'Input', output: 'Output', cached: 'Cached input', latency: 'Latency',
      low: 'Low', medium: 'Medium', high: 'High',
      strong: 'Strong', limited: 'Limited', weak: 'Unavailable', modelIndependent: 'Model-independent',
      capLegend: 'Capability', noModels: 'No models match', harnessNote: 'The harness stays the same. The model changes its behavior.',
      modelCount: 'models', hint: 'Click the LLM core to change the model',
      compareHint: 'Pick 2–4 models', axis: 'Capability', showCompare: 'Show comparison'
    },
    ru: {
      models: 'Модели', changeModel: 'Сменить модель', modelSelector: 'Реестр моделей', searchModels: 'Поиск моделей, организаций, стран…',
      regions: 'Регионы', discovery: 'Подборки', compare: 'Сравнить', comparing: 'Сравнение', clear: 'Сбросить', add: 'В сравнение',
      identity: 'Идентификация', architecture: 'Архитектура', capabilities: 'Возможности', languages: 'Языки', deployment: 'Развёртывание',
      economics: 'Экономика', governance: 'Управление', strengths: 'Сильные стороны', limitations: 'Ограничения', bestFor: 'Лучше всего для',
      related: 'Другие версии', similar: 'Похожие модели', harness: 'Харнесс AI Engineering',
      organization: 'Организация', country: 'Страна', family: 'Семейство', generation: 'Генерация', version: 'Версия',
      params: 'Параметры', active: 'Активных', context: 'Контекст', license: 'Лицензия', status: 'Статус', sovereignty: 'Суверенность',
      released: 'Выпуск', costTier: 'Ценовой класс', input: 'Вход', output: 'Выход', cached: 'Кэш входа', latency: 'Задержка',
      low: 'Низкий', medium: 'Средний', high: 'Высокий',
      strong: 'Сильно', limited: 'Ограниченно', weak: 'Недоступно', modelIndependent: 'Не зависит от модели',
      capLegend: 'Возможности', noModels: 'Ничего не найдено', harnessNote: 'Харнесс не меняется. Меняется поведение модели.',
      modelCount: 'моделей', hint: 'Клик по ядру LLM — сменить модель',
      compareHint: 'Выберите 2–4 модели', axis: 'Возможность', showCompare: 'Показать сравнение'
    }
  };

  return {
    axes: axes, AX: AX, families: families, models: models, byModel: byModel, byFamily: byFamily,
    regions: REGIONS, sov: SOV, status: STATUS, tags: TAGS, discovery: DISCOVERY, harnessOnly: HARNESS_ONLY,
    stateMap: stateMap, pick: pick, parseB: parseB, ui: MUI,
    defaultModel: 'claude-sonnet-4'
  };
})();


// @ts-nocheck
// d.minds Atlas — AI Engineering ontology (bilingual EN/RU)
export const ATLAS_RAW = (function () {
  // [key, hue, en, ru, defEn, defRu, mmEn, mmRu]
  var DOMAINS = [
    ['prompting', 295, 'Prompting', 'Промптинг',
      'Techniques for designing the inputs and instructions a model receives.',
      'Техники проектирования входов и инструкций для модели.',
      'Programming in natural language: the prompt is source code, the model is the compiler.',
      'Программирование на естественном языке: промпт — исходный код, модель — компилятор.'],
    ['context', 255, 'Context Engineering', 'Инженерия контекста',
      'Building and managing everything the model sees in its window.',
      'Сборка и управление всем, что модель видит в контекстном окне.',
      'The window is RAM: scarce, ordered, and everything competes for it.',
      'Окно — оперативная память: её мало, и всё за неё конкурирует.'],
    ['knowledge', 180, 'Knowledge', 'Знания',
      'Connecting models to external knowledge through retrieval.',
      'Подключение моделей к внешним знаниям через поиск.',
      'An open-book exam: the model reasons, retrieval supplies the facts.',
      'Экзамен с открытой книгой: модель рассуждает, поиск даёт факты.'],
    ['memory', 150, 'Memory', 'Память',
      'Storing and recalling information across interactions.',
      'Хранение и вспоминание информации между взаимодействиями.',
      'Memory turns a stateless function into a relationship.',
      'Память превращает функцию без состояния в отношения.'],
    ['tools', 110, 'Tools', 'Инструменты',
      'Letting models act on the world through function calls and integrations.',
      'Действия модели в мире через вызовы функций и интеграции.',
      'Hands for the brain: tools extend a text engine into an actor.',
      'Руки для мозга: инструменты превращают текстовый движок в деятеля.'],
    ['agents', 50, 'Agents', 'Агенты',
      'Autonomous systems that plan, act and iterate toward a goal.',
      'Автономные системы: планируют, действуют, итерируют к цели.',
      'A loop of think → act → observe, wrapped around an LLM.',
      'Цикл «думай → действуй → наблюдай» вокруг LLM.'],
    ['evaluation', 320, 'Evaluation', 'Оценка качества',
      'Measuring and validating model and system performance.',
      'Измерение и проверка качества модели и системы.',
      'Evals are unit tests for behavior: you cannot improve what you do not measure.',
      'Эвалы — юнит-тесты поведения: нельзя улучшить то, что не измеряешь.'],
    ['guardrails', 350, 'Guardrails', 'Ограждения',
      'Safety, alignment and control over model behavior.',
      'Безопасность, согласованность и контроль поведения модели.',
      'Seatbelts, not cages: constrain failure modes without blocking the road.',
      'Ремни безопасности, а не клетка: ограничить отказы, не перекрывая дорогу.'],
    ['observability', 230, 'Observability', 'Наблюдаемость',
      'Monitoring, tracing and understanding systems in production.',
      'Мониторинг, трассировка и понимание систем в продакшене.',
      'If you cannot see the trace, the bug does not exist — until it does.',
      'Если трассы не видно, бага нет — пока он не случится.'],
    ['deployment', 75, 'Deployment', 'Развёртывание',
      'Shipping and scaling AI systems reliably.',
      'Надёжный запуск и масштабирование ИИ-систем.',
      'A model is a service: latency, throughput and rollout rules apply.',
      'Модель — это сервис: действуют законы задержек, нагрузки и релизов.'],
    ['optimization', 30, 'Optimization', 'Оптимизация',
      'Improving cost, latency and efficiency.',
      'Улучшение стоимости, задержек и эффективности.',
      'Every token has a price; optimization is spending it where it matters.',
      'У каждого токена есть цена; оптимизация — тратить её там, где важно.'],
    ['security', 15, 'Security', 'Безопасность',
      'Protecting systems, data and users from adversaries.',
      'Защита систем, данных и пользователей от злоумышленников.',
      'Every input is untrusted code — including the friendly ones.',
      'Любой ввод — недоверенный код, даже дружелюбный.']
  ];
  // [id, parent, en, ru, defEn, defRu, mastery 0-5]
  var N = [
    // Prompting
    ['patterns', 'prompting', 'Prompt Patterns', 'Паттерны промптов', 'Reusable structures for reliable prompts.', 'Повторяемые структуры надёжных промптов.', 4],
    ['fewshot', 'patterns', 'Few-shot Examples', 'Few-shot примеры', 'Teaching by showing input–output pairs in the prompt.', 'Обучение через примеры «вход–выход» прямо в промпте.', 5],
    ['roleprompt', 'patterns', 'Role Prompting', 'Ролевые промпты', 'Setting persona and stance to shape responses.', 'Задание роли и позиции для формы ответа.', 4],
    ['reasoning', 'prompting', 'Reasoning Techniques', 'Техники рассуждения', 'Making models think step by step.', 'Заставить модель думать по шагам.', 3],
    ['cot', 'reasoning', 'Chain-of-Thought', 'Chain-of-Thought', 'Eliciting intermediate reasoning before the answer.', 'Промежуточные шаги рассуждения перед ответом.', 4],
    ['selfcons', 'reasoning', 'Self-consistency', 'Самосогласованность', 'Sampling several reasoning paths and voting.', 'Несколько путей рассуждения и голосование.', 2],
    ['structured', 'prompting', 'Structured Output', 'Структурированный вывод', 'Getting machine-readable answers.', 'Машиночитаемые ответы модели.', 3],
    ['jsonmode', 'structured', 'JSON Mode', 'JSON-режим', 'Constraining output to valid JSON.', 'Ограничение вывода валидным JSON.', 4],
    ['outschemas', 'structured', 'Output Schemas', 'Схемы вывода', 'Typed contracts the model must satisfy.', 'Типизированные контракты для ответа модели.', 3],
    // Context Engineering
    ['window', 'context', 'Context Windows', 'Контекстные окна', "The model's finite working memory.", 'Конечная рабочая память модели.', 3],
    ['tokenbudget', 'window', 'Token Budgets', 'Бюджет токенов', 'Allocating limited window space deliberately.', 'Осознанное распределение места в окне.', 3],
    ['longctx', 'window', 'Long-context Models', 'Длинный контекст', 'Windows of 100K+ tokens and their trade-offs.', 'Окна 100K+ токенов и их компромиссы.', 2],
    ['assembly', 'context', 'Context Assembly', 'Сборка контекста', 'Composing what the model sees on each call.', 'Композиция того, что модель видит в каждом вызове.', 2],
    ['sysprompt', 'assembly', 'System Prompts', 'Системные промпты', 'Persistent instructions that frame every turn.', 'Постоянные инструкции для каждого хода.', 3],
    ['compression', 'assembly', 'Context Compression', 'Сжатие контекста', 'Summarizing history to fit the window.', 'Суммаризация истории под размер окна.', 1],
    ['caching', 'context', 'Prompt Caching', 'Кэширование промптов', 'Reusing computed context across calls.', 'Переиспользование вычисленного контекста между вызовами.', 1],
    ['kvcache', 'caching', 'KV-cache Reuse', 'Переиспользование KV-кэша', 'Skipping recomputation of a stable prefix.', 'Пропуск пересчёта стабильного префикса.', 1],
    ['invalidation', 'caching', 'Cache Invalidation', 'Инвалидация кэша', 'Knowing when cached context goes stale.', 'Понимание, когда кэш устаревает.', 0],
    // Knowledge (with the deep GraphRAG chain)
    ['rag', 'knowledge', 'RAG', 'RAG', 'Retrieval-augmented generation: fetch, then answer.', 'Генерация с поиском: найди, потом отвечай.', 4],
    ['graphrag', 'rag', 'GraphRAG', 'GraphRAG', 'Retrieval over a knowledge graph instead of flat chunks.', 'Поиск по графу знаний вместо плоских фрагментов.', 2],
    ['neo4j', 'graphrag', 'Neo4j', 'Neo4j', 'The graph database powering many GraphRAG stacks.', 'Графовая БД многих GraphRAG-стеков.', 1],
    ['cypher', 'neo4j', 'Cypher', 'Cypher', "Neo4j's query language for graph patterns.", 'Язык запросов Neo4j по графовым паттернам.', 1],
    ['hybrid', 'rag', 'Hybrid Retrieval', 'Гибридный поиск', 'Combining keyword and vector search.', 'Комбинация ключевых слов и векторов.', 3],
    ['embeddings', 'knowledge', 'Embeddings', 'Эмбеддинги', 'Meaning as geometry: text mapped to vectors.', 'Смысл как геометрия: текст в векторах.', 3],
    ['vectordb', 'embeddings', 'Vector Databases', 'Векторные БД', 'Storing and searching millions of embeddings.', 'Хранение и поиск миллионов векторов.', 3],
    ['chunking', 'embeddings', 'Chunking Strategies', 'Стратегии чанкинга', 'Splitting documents so retrieval stays precise.', 'Нарезка документов для точного поиска.', 2],
    ['kg', 'knowledge', 'Knowledge Graphs', 'Графы знаний', 'Entities and relations as first-class structure.', 'Сущности и связи как основная структура.', 2],
    ['ontologies', 'kg', 'Ontologies', 'Онтологии', 'Formal vocabularies of a domain.', 'Формальные словари предметной области.', 1],
    ['extraction', 'kg', 'Entity Extraction', 'Извлечение сущностей', 'Turning text into graph nodes and edges.', 'Из текста — в узлы и рёбра графа.', 2],
    // Memory
    ['shortterm', 'memory', 'Short-term Memory', 'Кратковременная память', 'State within a single session.', 'Состояние в рамках одной сессии.', 2],
    ['convstate', 'shortterm', 'Conversation State', 'Состояние диалога', 'Tracking what has been said and decided.', 'Учёт сказанного и решённого.', 2],
    ['sliding', 'shortterm', 'Sliding Windows', 'Скользящие окна', 'Keeping the most recent turns verbatim.', 'Последние ходы диалога дословно.', 1],
    ['longterm', 'memory', 'Long-term Memory', 'Долговременная память', 'Knowledge that survives across sessions.', 'Знания, переживающие сессии.', 1],
    ['memstores', 'longterm', 'Memory Stores', 'Хранилища памяти', 'Databases of facts an agent writes and reads.', 'Базы фактов, которые агент пишет и читает.', 1],
    ['reflection', 'longterm', 'Reflection', 'Рефлексия', 'Distilling raw history into durable lessons.', 'Дистилляция истории в устойчивые выводы.', 0],
    ['episodic', 'memory', 'Episodic Memory', 'Эпизодическая память', 'Remembering specific users and events.', 'Память о конкретных пользователях и событиях.', 1],
    ['profiles', 'episodic', 'User Profiles', 'Профили пользователей', 'Structured records of preferences and context.', 'Структурные записи предпочтений и контекста.', 1],
    ['preference', 'episodic', 'Preference Learning', 'Обучение предпочтениям', 'Adapting behavior from observed choices.', 'Адаптация поведения по наблюдаемым выборам.', 0],
    // Tools (with the deep Office chain)
    ['fncalling', 'tools', 'Function Calling', 'Вызов функций', 'Models emitting structured calls your code executes.', 'Модель формирует вызовы, которые исполняет ваш код.', 3],
    ['toolschemas', 'fncalling', 'Tool Schemas', 'Схемы инструментов', 'Describing tools so models use them correctly.', 'Описание инструментов для корректного использования.', 3],
    ['parallel', 'fncalling', 'Parallel Tool Use', 'Параллельные вызовы', 'Batching independent calls in one turn.', 'Пакет независимых вызовов за один ход.', 2],
    ['protocols', 'tools', 'Tool Protocols', 'Протоколы инструментов', 'Standards for connecting models to software.', 'Стандарты подключения моделей к софту.', 2],
    ['mcp', 'protocols', 'MCP', 'MCP', 'Model Context Protocol — a universal tool interface.', 'Model Context Protocol — универсальный интерфейс инструментов.', 2],
    ['openapi', 'protocols', 'OpenAPI Tools', 'OpenAPI-инструменты', 'Turning existing APIs into callable tools.', 'Существующие API как вызываемые инструменты.', 1],
    ['productivity', 'tools', 'Productivity', 'Продуктивность', 'Automating everyday knowledge work.', 'Автоматизация повседневной интеллектуальной работы.', 2],
    ['office', 'productivity', 'Microsoft Office', 'Microsoft Office', 'Automating documents, sheets and slides.', 'Автоматизация документов, таблиц и слайдов.', 1],
    ['word', 'office', 'Word', 'Word', 'Programmatic reading and writing of documents.', 'Программное чтение и запись документов.', 1],
    ['comments', 'word', 'Comments', 'Комментарии', 'Working with review threads in documents.', 'Работа с ветками рецензирования в документах.', 0],
    ['summarization', 'comments', 'Summarization', 'Суммаризация', 'Condensing threads into decisions.', 'Сжатие обсуждений до решений.', 0],
    ['browserauto', 'productivity', 'Browser Automation', 'Автоматизация браузера', 'Agents operating real web interfaces.', 'Агенты в реальных веб-интерфейсах.', 1],
    // Agents
    ['loops', 'agents', 'Agent Loops', 'Циклы агента', 'The core think–act–observe cycle.', 'Базовый цикл «думай–действуй–наблюдай».', 2],
    ['react', 'loops', 'ReAct', 'ReAct', 'Interleaving reasoning traces with actions.', 'Чередование рассуждений и действий.', 2],
    ['planner', 'loops', 'Planner–Executor', 'Планировщик–исполнитель', 'Separating planning from execution.', 'Разделение планирования и исполнения.', 1],
    ['multiagent', 'agents', 'Multi-agent Systems', 'Мультиагентные системы', 'Multiple agents cooperating on one task.', 'Несколько агентов над одной задачей.', 1],
    ['orchestration', 'multiagent', 'Orchestration', 'Оркестрация', 'Routing work between specialized agents.', 'Маршрутизация работы между агентами.', 1],
    ['handoffs', 'multiagent', 'Handoffs', 'Передача задач', 'Transferring context between agents cleanly.', 'Чистая передача контекста между агентами.', 0],
    ['autonomy', 'agents', 'Autonomy & Control', 'Автономия и контроль', 'How much freedom an agent gets.', 'Сколько свободы получает агент.', 1],
    ['hitl', 'autonomy', 'Human-in-the-loop', 'Человек в контуре', 'Approval gates on consequential actions.', 'Подтверждение значимых действий человеком.', 1],
    ['decomposition', 'autonomy', 'Task Decomposition', 'Декомпозиция задач', 'Breaking goals into checkable steps.', 'Разбиение целей на проверяемые шаги.', 1],
    // Evaluation
    ['benchmarks', 'evaluation', 'Benchmarks', 'Бенчмарки', 'Standardized tests of model capability.', 'Стандартные тесты возможностей модели.', 2],
    ['suites', 'benchmarks', 'Public Suites', 'Публичные наборы', 'MMLU-style broad capability tests.', 'Широкие тесты типа MMLU.', 1],
    ['domainbench', 'benchmarks', 'Domain Benchmarks', 'Доменные бенчмарки', 'Evals built for your own task.', 'Эвалы под вашу конкретную задачу.', 1],
    ['judge', 'evaluation', 'LLM-as-Judge', 'LLM-судья', 'Using a model to grade model outputs.', 'Модель оценивает ответы модели.', 2],
    ['rubrics', 'judge', 'Rubric Design', 'Дизайн рубрик', 'Precise criteria the judge scores against.', 'Точные критерии для оценки.', 1],
    ['judgebias', 'judge', 'Judge Bias', 'Смещения судьи', 'Position, length and style biases in grading.', 'Смещения позиции, длины и стиля.', 0],
    ['regression', 'evaluation', 'Regression Testing', 'Регрессионные тесты', 'Catching quality drops before users do.', 'Ловить падение качества раньше пользователей.', 1],
    ['golden', 'regression', 'Golden Datasets', 'Эталонные наборы', 'Curated cases with known-good answers.', 'Отобранные кейсы с эталонными ответами.', 1],
    ['cievals', 'regression', 'CI Evals', 'Эвалы в CI', 'Running evals on every change.', 'Эвалы на каждое изменение.', 0],
    // Guardrails
    ['inputf', 'guardrails', 'Input Filtering', 'Фильтрация входа', 'Screening what reaches the model.', 'Проверка того, что попадает в модель.', 1],
    ['injdefense', 'inputf', 'Injection Defense', 'Защита от инъекций', 'Detecting adversarial instructions in input.', 'Обнаружение вредоносных инструкций во входе.', 1],
    ['pii', 'inputf', 'PII Detection', 'Детекция ПДн', 'Catching personal data before processing.', 'Персональные данные — до обработки.', 1],
    ['outputv', 'guardrails', 'Output Validation', 'Валидация вывода', 'Checking responses before they ship.', 'Проверка ответов перед отправкой.', 1],
    ['schemaval', 'outputv', 'Schema Validation', 'Валидация схем', 'Rejecting malformed structured output.', 'Отклонение некорректного структурного вывода.', 1],
    ['policies', 'outputv', 'Content Policies', 'Контентные политики', 'Rules for what may be said.', 'Правила допустимого содержания.', 0],
    ['alignment', 'guardrails', 'Alignment Controls', 'Контроль согласованности', 'Steering values and refusals.', 'Управление ценностями и отказами.', 0],
    ['refusals', 'alignment', 'Refusal Behavior', 'Поведение отказов', 'When and how the model says no.', 'Когда и как модель отказывает.', 0],
    ['constitutional', 'alignment', 'Constitutional Rules', 'Конституционные правила', 'Principles the model self-checks against.', 'Принципы самопроверки модели.', 0],
    // Observability
    ['tracing', 'observability', 'Tracing', 'Трассировка', 'Following a request through every step.', 'Путь запроса через все шаги.', 1],
    ['spans', 'tracing', 'Spans & Traces', 'Спаны и трейсы', 'Structured timing of each operation.', 'Структурные тайминги операций.', 1],
    ['tokenacct', 'tracing', 'Token Accounting', 'Учёт токенов', 'Knowing where every token goes.', 'Куда уходит каждый токен.', 1],
    ['monitoring', 'observability', 'Monitoring', 'Мониторинг', 'Live health of AI systems.', 'Живое здоровье ИИ-систем.', 1],
    ['dashboards', 'monitoring', 'Latency Dashboards', 'Дашборды задержек', 'P50/P99 across models and routes.', 'P50/P99 по моделям и маршрутам.', 0],
    ['drift', 'monitoring', 'Drift Detection', 'Детекция дрейфа', 'Spotting slow behavioral change.', 'Замечать медленный сдвиг поведения.', 0],
    ['feedback', 'observability', 'Feedback Loops', 'Петли обратной связи', 'Learning from production signals.', 'Обучение на сигналах из продакшена.', 0],
    ['fbcapture', 'feedback', 'Feedback Capture', 'Сбор обратной связи', 'Thumbs, edits and implicit signals.', 'Оценки, правки и неявные сигналы.', 0],
    ['errorclusters', 'feedback', 'Error Clustering', 'Кластеризация ошибок', 'Grouping failures into fixable themes.', 'Группировка сбоев в исправимые темы.', 0],
    // Deployment
    ['serving', 'deployment', 'Serving', 'Сервинг', 'Running inference as a service.', 'Инференс как сервис.', 1],
    ['infservers', 'serving', 'Inference Servers', 'Инференс-серверы', 'vLLM-class engines behind your API.', 'Движки класса vLLM за вашим API.', 1],
    ['batching', 'serving', 'Batching', 'Батчинг', 'Grouping requests for throughput.', 'Группировка запросов ради пропускной способности.', 0],
    ['scaling', 'deployment', 'Scaling', 'Масштабирование', 'Meeting demand without melting.', 'Выдерживать нагрузку без перегрева.', 0],
    ['autoscaling', 'scaling', 'Autoscaling', 'Автомасштабирование', 'Capacity that follows traffic.', 'Мощности вслед за трафиком.', 0],
    ['multiregion', 'scaling', 'Multi-region', 'Мультирегион', 'Serving close to users, surviving outages.', 'Ближе к пользователям, устойчивее к сбоям.', 0],
    ['modelops', 'deployment', 'Model Ops', 'Model Ops', 'Lifecycle of models in production.', 'Жизненный цикл моделей в продакшене.', 1],
    ['versioning', 'modelops', 'Versioning', 'Версионирование', 'Pinning and migrating model versions.', 'Фиксация и миграция версий моделей.', 1],
    ['canary', 'modelops', 'Canary Releases', 'Канареечные релизы', 'Shipping to 1% before 100%.', 'Сначала на 1%, потом на 100%.', 0],
    // Optimization
    ['latency', 'optimization', 'Latency', 'Задержки', 'Time-to-first-token and beyond.', 'Время до первого токена и дальше.', 1],
    ['streaming', 'latency', 'Streaming', 'Стриминг', 'Showing tokens as they generate.', 'Показ токенов по мере генерации.', 2],
    ['speculative', 'latency', 'Speculative Decoding', 'Спекулятивное декодирование', 'A small model drafts, a big one verifies.', 'Малая модель предлагает, большая проверяет.', 0],
    ['cost', 'optimization', 'Cost', 'Стоимость', 'Spending tokens where they matter.', 'Тратить токены там, где важно.', 1],
    ['routing', 'cost', 'Model Routing', 'Маршрутизация моделей', 'Cheap models for easy queries.', 'Дешёвые модели для простых запросов.', 1],
    ['quantization', 'cost', 'Quantization', 'Квантизация', 'Smaller weights, faster inference.', 'Меньше веса — быстрее инференс.', 0],
    ['tuning', 'optimization', 'Quality Tuning', 'Настройка качества', 'Adapting models to your task.', 'Адаптация моделей под задачу.', 0],
    ['finetuning', 'tuning', 'Fine-tuning', 'Файнтюнинг', 'Training on your own examples.', 'Дообучение на своих примерах.', 1],
    ['distillation', 'tuning', 'Distillation', 'Дистилляция', 'Teaching small models from big ones.', 'Малые модели учатся у больших.', 0],
    // Security
    ['threats', 'security', 'Threats', 'Угрозы', 'How AI systems get attacked.', 'Как атакуют ИИ-системы.', 1],
    ['promptinj', 'threats', 'Prompt Injection', 'Промпт-инъекции', 'Hostile instructions hidden in data.', 'Враждебные инструкции, спрятанные в данных.', 1],
    ['exfiltration', 'threats', 'Data Exfiltration', 'Утечка данных', 'Tricking models into leaking secrets.', 'Выманивание секретов у модели.', 0],
    ['access', 'security', 'Access Control', 'Контроль доступа', 'Who and what may call what.', 'Кто и что может вызывать.', 1],
    ['secrets', 'access', 'Secrets Management', 'Управление секретами', 'Keys never enter the prompt.', 'Ключи не попадают в промпт.', 1],
    ['sandboxing', 'access', 'Sandboxing', 'Песочницы', 'Isolating tool execution.', 'Изоляция исполнения инструментов.', 0],
    ['compliance', 'security', 'Compliance', 'Комплаенс', 'Meeting regulatory obligations.', 'Соответствие регуляторным требованиям.', 0],
    ['auditlogs', 'compliance', 'Audit Logs', 'Аудит-логи', 'Immutable records of every action.', 'Неизменяемые записи всех действий.', 0],
    ['residency', 'compliance', 'Data Residency', 'Резидентность данных', 'Where data may live and flow.', 'Где данные могут храниться и передаваться.', 0]
  ];
  var UI = {
    en: {
      brand: 'd.minds', tagline: 'Atlas · AI Engineering',
      atlas: 'Atlas', mastery: 'Mastery', assessment: 'Assessment', projects: 'Projects', community: 'Community',
      search: 'Search', glossary: 'Glossary', profile: 'Profile', settings: 'Settings', soon: 'Coming soon',
      legend: 'Domains', masteryLegend: 'Mastery', definition: 'Definition', mentalModel: 'Mental model',
      path: 'Path', contains: 'Contains', masteryLabel: 'Mastery',
      states: ['Unknown', 'Discover', 'Understand', 'Practice', 'Master', 'Expert'],
      searchPh: 'Search concepts…', noResults: 'No results',
      hints: 'Drag to pan · Scroll to zoom · Click to explore · Double-click to isolate · Esc for overview',
      close: 'Close', overview: 'Overview'
    },
    ru: {
      brand: 'd.minds', tagline: 'Атлас · AI Engineering',
      atlas: 'Атлас', mastery: 'Мастерство', assessment: 'Оценка', projects: 'Проекты', community: 'Сообщество',
      search: 'Поиск', glossary: 'Глоссарий', profile: 'Профиль', settings: 'Настройки', soon: 'Скоро',
      legend: 'Домены', masteryLegend: 'Мастерство', definition: 'Определение', mentalModel: 'Ментальная модель',
      path: 'Путь', contains: 'Содержит', masteryLabel: 'Мастерство',
      states: ['Неизвестно', 'Открытие', 'Понимание', 'Практика', 'Мастерство', 'Эксперт'],
      searchPh: 'Поиск концепций…', noResults: 'Ничего не найдено',
      hints: 'Тяните — панорама · Колесо — масштаб · Клик — исследовать · Двойной клик — изолировать · Esc — общий вид',
      close: 'Закрыть', overview: 'Общий вид'
    }
  };
  var domains = {}, order = [];
  DOMAINS.forEach(function (d) {
    domains[d[0]] = { key: d[0], hue: d[1], en: d[2], ru: d[3], defEn: d[4], defRu: d[5], mmEn: d[6], mmRu: d[7] };
    order.push(d[0]);
  });
  var byId = {};
  var nodes = [{ id: 'llm', parent: null, level: 0, domain: null, en: 'LLM', ru: 'LLM',
    defEn: 'Large language models — the reasoning engine every AI system is built around.',
    defRu: 'Большие языковые модели — ядро рассуждений, вокруг которого строится любая ИИ-система.',
    mmEn: 'A probabilistic engine that turns context into the most plausible continuation.',
    mmRu: 'Вероятностный движок, превращающий контекст в наиболее правдоподобное продолжение.', m: 3 }];
  byId.llm = nodes[0];
  order.forEach(function (k) {
    var d = domains[k];
    var n = { id: k, parent: 'llm', level: 1, domain: k, en: d.en, ru: d.ru, defEn: d.defEn, defRu: d.defRu, mmEn: d.mmEn, mmRu: d.mmRu, m: 0 };
    nodes.push(n); byId[k] = n;
  });
  N.forEach(function (r) {
    var n = { id: r[0], parent: r[1], level: 0, domain: null, en: r[2], ru: r[3], defEn: r[4], defRu: r[5], m: r[6] };
    nodes.push(n); byId[r[0]] = n;
  });
  nodes.forEach(function (n) {
    if (n.id === 'llm') return;
    var lvl = 0, p = n, dom = null;
    while (p && p.parent) { lvl++; p = byId[p.parent]; }
    n.level = lvl;
    p = n; while (p && p.level > 1) p = byId[p.parent];
    n.domain = p ? p.id : null;
    if (n.domain === 'llm') n.domain = null;
  });
  nodes.forEach(function (n) {
    n.children = nodes.filter(function (c) { return c.parent === n.id; }).map(function (c) { return c.id; });
  });
  // Domain mastery = rounded mean of descendants
  order.forEach(function (k) {
    var desc = nodes.filter(function (n) { return n.domain === k && n.level > 1; });
    var avg = desc.reduce(function (s, n) { return s + n.m; }, 0) / (desc.length || 1);
    byId[k].m = Math.round(avg);
  });
  return { domains: domains, order: order, nodes: nodes, byId: byId, ui: UI };
})();

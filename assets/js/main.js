/**
 * ============================================
 * FLUI360 - JAVASCRIPT PRINCIPAL
 * ============================================
 * 
 * ORGANIZAÇÃO DO ARQUIVO:
 * 1. Estrutura de dados dos hábitos (localStorage)
 * 2. Funções utilitárias
 * 3. Menu hambúrguer e sidebar
 * 4. Sistema de modais
 * 5. FAB global e fluxo de criação
 * 6. CRUD de hábitos
 * 7. Modal de valor para mensuráveis
 * 8. Modal de frequência X em Y dias
 * 9. Renderização de hábitos
 * 10. Gráficos e estatísticas
 * 11. Inicialização
 * 
 * FLUXO DO FAB:
 * 1. Clique no FAB → Modal de seleção de tipo
 * 2. Seleciona tipo → Modal do formulário principal
 * 3. Tipo é fixo, não pode ser alterado na edição
 * 
 * HÁBITOS MENSURÁVEIS:
 * - Ao clicar para completar → Modal de valor
 * - Consistente em todas as telas (Meus Hábitos e Dashboard)
 */

// ============================================
// 1. ESTRUTURA DE DADOS DOS HÁBITOS
// ============================================

const STORAGE_KEY = 'flui360_habitos';
const PREFS_KEY = 'flui360_prefs';
const DEFAULT_PREFS = { tema: 'claro', orientacaoDias: 'normal' };

// ============================================
// SISTEMA DE PREFERÊNCIAS DO USUÁRIO
// ============================================

/**
 * Preferências são armazenadas em localStorage com a chave 'flui360_prefs'.
 * Estrutura: { tema: 'claro' | 'escuro' }
 * O tema padrão é 'claro' se não existir nada salvo.
 */

function carregarPreferencias() {
    try {
        const dados = localStorage.getItem(PREFS_KEY);
        if (dados) {
            const parsed = JSON.parse(dados);
            return { ...DEFAULT_PREFS, ...parsed };
        }
    } catch (e) {
        console.error("Erro ao carregar preferências:", e);
    }
    return { ...DEFAULT_PREFS };
}

function salvarPreferencias(prefs) {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

let preferencias = carregarPreferencias();

/**
 * Aplica o tema ao body, adicionando a classe correspondente.
 * Remove a classe do tema anterior antes de aplicar a nova.
 */
function aplicarTema(tema) {
    document.body.classList.remove('tema-claro', 'tema-escuro');
    document.body.classList.add(`tema-${tema}`);
    
    // Atualiza o toggle no modal de preferências se existir
    const toggleModoEscuro = document.getElementById('toggleModoEscuro');
    if (toggleModoEscuro) {
        const isEscuro = tema === 'escuro';
        if (isEscuro) {
            toggleModoEscuro.classList.add('ativo');
        } else {
            toggleModoEscuro.classList.remove('ativo');
        }
        // Atualiza aria-checked para acessibilidade
        toggleModoEscuro.setAttribute('aria-checked', isEscuro.toString());
    }
}

function alternarTema() {
    preferencias.tema = preferencias.tema === 'escuro' ? 'claro' : 'escuro';
    salvarPreferencias(preferencias);
    aplicarTema(preferencias.tema);
    anunciarParaLeitorDeTela(`Tema alterado para modo ${preferencias.tema}`);
}

// ============================================
// FUNÇÕES DE ACESSIBILIDADE
// ============================================

/**
 * Anuncia uma mensagem para leitores de tela usando aria-live region.
 * Útil para feedback de ações que não tem resposta visual óbvia.
 */
function anunciarParaLeitorDeTela(mensagem) {
    const region = document.getElementById('ariaLiveRegion');
    if (region) {
        region.textContent = '';
        setTimeout(() => {
            region.textContent = mensagem;
        }, 100);
    }
}

/**
 * Cria um trap de foco dentro de um elemento (usado em modais).
 * Impede que o foco saia do modal quando aberto.
 */
function criarTrapDeFoco(elemento) {
    const focusableElements = elemento.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return null;
    
    const primeiro = focusableElements[0];
    const ultimo = focusableElements[focusableElements.length - 1];
    
    const handler = (e) => {
        if (e.key !== 'Tab') return;
        
        if (e.shiftKey) {
            if (document.activeElement === primeiro) {
                e.preventDefault();
                ultimo.focus();
            }
        } else {
            if (document.activeElement === ultimo) {
                e.preventDefault();
                primeiro.focus();
            }
        }
    };
    
    elemento.addEventListener('keydown', handler);
    return () => elemento.removeEventListener('keydown', handler);
}

// Tooltip simples usado em ícones de informação (desktop e toque)
function configurarTooltipsInformacao() {
    const infoIcones = document.querySelectorAll('.info-icone');
    if (infoIcones.length === 0) return;

    const fecharTodos = () => {
        infoIcones.forEach(icon => {
            icon.classList.remove('ativo');
            icon.setAttribute('aria-expanded', 'false');
        });
    };

    infoIcones.forEach(icon => {
        icon.setAttribute('aria-expanded', 'false');

        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            const ativa = !icon.classList.contains('ativo');
            fecharTodos();
            if (ativa) {
                icon.classList.add('ativo');
                icon.setAttribute('aria-expanded', 'true');
            }
        });

        icon.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                icon.classList.remove('ativo');
                icon.setAttribute('aria-expanded', 'false');
            }
        });
    });

    document.addEventListener('click', fecharTodos);
}

// ============================================
// FUNÇÕES DE ESTATÍSTICAS DO HÁBITO
// ============================================

/**
 * Conta quantos dias o hábito foi concluído.
 * - Binário: dias em que valor === true
 * - Mensurável: dias em que valor >= alvoDiario
 * - limiteDias: null para histórico completo ou número de dias recentes
 */
function contarDiasConcluidos(habito, limiteDias = 30) {
    const historico = getHistorico(habito);
    const contarConclusao = (valor) => {
        return habito.tipo === 'binario'
            ? valor === true
            : valor >= habito.alvoDiario;
    };

    // Histórico completo
    if (limiteDias === null) {
        return Object.keys(historico).reduce((total, data) => {
            return contarConclusao(historico[data]) ? total + 1 : total;
        }, 0);
    }

    // Últimos N dias (usado em relatórios mensais)
    let dias = 0;
    const hoje = new Date();

    for (let i = 0; i < limiteDias; i++) {
        const data = new Date(hoje);
        data.setDate(data.getDate() - i);
        const chave = data.toISOString().split('T')[0];
        const valor = historico[chave];

        if (contarConclusao(valor)) dias++;
    }

    return dias;
}

/**
 * Calcula a maior sequência (streak) de dias consecutivos concluídos.
 * Percorre o histórico ordenando as datas e verificando consecutividade.
 */
function calcularStreakMaxima(habito) {
    // Pega todas as datas onde o hábito foi concluído
    const datasConcluidasSet = [];
    const historico = getHistorico(habito);
    
    for (const data in historico) {
        const valor = historico[data];
        const concluido = habito.tipo === 'binario' 
            ? valor === true 
            : valor >= habito.alvoDiario;
        
        if (concluido) {
            datasConcluidasSet.push(data);
        }
    }
    
    if (datasConcluidasSet.length === 0) return 0;
    
    // Ordena as datas em ordem crescente
    datasConcluidasSet.sort();
    
    let streakAtual = 1;
    let streakMaxima = 1;
    
    for (let i = 1; i < datasConcluidasSet.length; i++) {
        const dataAnterior = new Date(datasConcluidasSet[i - 1] + 'T12:00:00');
        const dataAtual = new Date(datasConcluidasSet[i] + 'T12:00:00');
        
        // Calcula a diferença em dias
        const diffDias = Math.round((dataAtual - dataAnterior) / (1000 * 60 * 60 * 24));
        
        if (diffDias === 1) {
            streakAtual++;
            streakMaxima = Math.max(streakMaxima, streakAtual);
        } else {
            streakAtual = 1;
        }
    }
    
    return streakMaxima;
}

/**
 * Calcula estatísticas específicas para hábitos mensuráveis:
 * média, máximo e mínimo dos valores registrados (excluindo zeros).
 */
function calcularStatsMensuravel(habito) {
    const valores = [];
    const historico = getHistorico(habito);
    
    for (const data in historico) {
        const valor = historico[data];
        if (typeof valor === 'number' && valor > 0) {
            valores.push(valor);
        }
    }
    
    if (valores.length === 0) {
        return { media: 0, maximo: 0, minimo: 0 };
    }
    
    const soma = valores.reduce((a, b) => a + b, 0);
    const media = soma / valores.length;
    const maximo = Math.max(...valores);
    const minimo = Math.min(...valores);
    
    return {
        media: media.toFixed(1),
        maximo: maximo,
        minimo: minimo
    };
}

/**
 * Abre o modal de estatísticas para um hábito específico.
 * Preenche os campos com os dados calculados.
 */
function abrirModalStats(habitoId) {
    const habito = habitos.find(h => h.id === habitoId);
    if (!habito) return;
    
    // Estatísticas apoiam reflexão e tomada de decisão sobre o hábito (IHC).
    const modalTitulo = document.getElementById('statsHabitoNome');
    const statsDiasConcluidos = document.getElementById('statsDiasConcluidos');
    const statsStreakMaxima = document.getElementById('statsStreakMaxima');
    const statsTipoBadge = document.getElementById('statsTipoBadge');
    const statsFrequenciaTexto = document.getElementById('statsFrequenciaTexto');
    const statsLembreteTexto = document.getElementById('statsLembreteTexto');
    const statsSecaoMensuravel = document.getElementById('statsSecaoMensuravel');
    const statsMedia = document.getElementById('statsMedia');
    const statsMaximo = document.getElementById('statsMaximo');
    const statsMinimo = document.getElementById('statsMinimo');
    const btnFecharStats = document.getElementById('btnFecharStats');
    
    if (modalTitulo) modalTitulo.textContent = habito.nome;
    if (statsDiasConcluidos) statsDiasConcluidos.textContent = contarDiasConcluidos(habito, null);
    if (statsStreakMaxima) statsStreakMaxima.textContent = calcularStreakMaxima(habito);
    
    if (statsTipoBadge) {
        statsTipoBadge.textContent = habito.tipo === 'binario' ? 'Sim/Não' : 'Mensurável';
        statsTipoBadge.className = `stats-tipo-badge ${habito.tipo}`;
    }
    if (statsFrequenciaTexto) {
        statsFrequenciaTexto.textContent = getTextoFrequencia(habito);
    }
    if (statsLembreteTexto) {
        if (habito.lembreteAtivo) {
            const diasTexto = getTextoDiasLembrete(habito.diasLembrete);
            statsLembreteTexto.textContent = `${habito.horaLembrete}${diasTexto ? ' (' + diasTexto + ')' : ''}`;
        } else {
            statsLembreteTexto.textContent = 'Desabilitado';
        }
    }
    
    // Mostra ou esconde a seção de mensuráveis
    if (statsSecaoMensuravel) {
        if (habito.tipo === 'mensuravel') {
            statsSecaoMensuravel.style.display = 'block';
            const stats = calcularStatsMensuravel(habito);
            if (statsMedia) statsMedia.textContent = `${stats.media} ${habito.unidade || ''}`;
            if (statsMaximo) statsMaximo.textContent = `${stats.maximo} ${habito.unidade || ''}`;
            if (statsMinimo) statsMinimo.textContent = `${stats.minimo} ${habito.unidade || ''}`;
        } else {
            statsSecaoMensuravel.style.display = 'none';
        }
    }
    
    abrirModal('modalStatsBackdrop');
    
    // Envia o foco para o título (ou botão fechar) para leitura imediata em leitores de tela.
    setTimeout(() => {
        const tituloModal = document.getElementById('tituloModalStats');
        if (tituloModal) {
            tituloModal.focus();
        } else if (btnFecharStats) {
            btnFecharStats.focus();
        }
    }, 150);
}

function gerarHistorico(diasAtras, probabilidade, tipo = 'binario', alvo = 1) {
    const historico = {};
    const hoje = new Date();
    
    for (let i = 0; i < diasAtras; i++) {
        const data = new Date(hoje);
        data.setDate(data.getDate() - i);
        const chave = data.toISOString().split('T')[0];
        
        if (tipo === 'binario') {
            historico[chave] = Math.random() * 100 < probabilidade;
        } else {
            const concluiu = Math.random() * 100 < probabilidade;
            historico[chave] = concluiu ? Math.round(alvo * (0.5 + Math.random() * 0.8)) : 0;
        }
    }
    
    return historico;
}

function getHabitosPadrao() {
    return [];
}

function normalizarHabitos(lista) {
    if (!Array.isArray(lista)) {
        console.warn('[Flui360] Lista de hábitos inválida, retornando vazia.');
        return getHabitosPadrao();
    }
    
    return lista
        .filter(Boolean)
        .map((habito, index) => ({
            ...habito,
            id: typeof habito.id === 'number' ? habito.id : Date.now() + index,
            tipo: habito.tipo === 'mensuravel' ? 'mensuravel' : 'binario',
            historico: habito.historico && typeof habito.historico === 'object' ? habito.historico : {},
            alvoDiario: habito.alvoDiario || 1,
            unidade: habito.unidade || '',
            cor: habito.cor || '#6366f1'
        }));
}

function carregarHabitos() {
    try {
        const dados = localStorage.getItem(STORAGE_KEY);
        if (dados) {
            const parsed = JSON.parse(dados);
            const normalizados = normalizarHabitos(parsed);
            console.log('[Flui360] Hábitos carregados:', normalizados.length);
            return normalizados;
        }
    } catch (e) {
        console.error("Erro ao carregar hábitos:", e);
    }
    return getHabitosPadrao();
}

function salvarHabitos() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(habitos));
        console.log('[Flui360] Hábitos salvos:', habitos.length);
    } catch (e) {
        console.error('Erro ao salvar hábitos no localStorage', e);
    }
}

let habitos = normalizarHabitos(carregarHabitos());

// Variáveis globais para modais
let habitoParaExcluir = null;
let habitoParaValor = null;
let dataParaValor = null;
let tipoHabitoSelecionado = 'binario';
let frequenciaXTemp = 3;
let frequenciaYTemp = 5;
let cacheDiasSelecionados = [];
let cacheFrequencia = null;

// ============================================
// 2. FUNÇÕES UTILITÁRIAS
// ============================================

function getHoje() {
    return new Date().toISOString().split('T')[0];
}

function getHistorico(habito) {
    return habito && typeof habito.historico === 'object' ? habito.historico : {};
}

function estaConcluidoHoje(habito) {
    const valor = getHistorico(habito)[getHoje()];
    if (habito.tipo === 'binario') {
        return valor === true;
    }
    return valor >= habito.alvoDiario;
}

function getValorHoje(habito) {
    return getHistorico(habito)[getHoje()] || 0;
}

function calcularSequencia(habito) {
    let sequencia = 0;
    const hoje = new Date();
    const historico = getHistorico(habito);
    
    for (let i = 0; i < 365; i++) {
        const data = new Date(hoje);
        data.setDate(data.getDate() - i);
        const chave = data.toISOString().split('T')[0];
        const valor = historico[chave];
        
        let concluido = habito.tipo === 'binario' ? valor === true : valor >= habito.alvoDiario;
        
        if (concluido) {
            sequencia++;
        } else {
            break;
        }
    }
    
    return sequencia;
}

// Sequência contínua considerando hoje apenas se concluído; senão, começa de ontem.
function calcularSequenciaAtual(habito) {
    let sequencia = 0;
    const hoje = new Date();
    const historico = getHistorico(habito);

    for (let i = 0; i < 365; i++) {
        const data = new Date(hoje);
        data.setDate(data.getDate() - i);
        const chave = data.toISOString().split('T')[0];
        const valor = historico[chave];
        const concluido = habito.tipo === 'binario' ? valor === true : valor >= habito.alvoDiario;

        if (i === 0 && !concluido) continue; // se hoje não concluiu, não encerra a sequência
        if (concluido) {
            sequencia++;
        } else {
            break;
        }
    }

    return sequencia;
}

function calcularProgresso(habito) {
    let concluidos = 0;
    const hoje = new Date();
    const historico = getHistorico(habito);
    
    for (let i = 0; i < 30; i++) {
        const data = new Date(hoje);
        data.setDate(data.getDate() - i);
        const chave = data.toISOString().split('T')[0];
        const valor = historico[chave];
        
        if (habito.tipo === 'binario') {
            if (valor === true) concluidos++;
        } else {
            if (valor >= habito.alvoDiario) concluidos++;
        }
    }
    
    return Math.round((concluidos / 30) * 100);
}

function calcularDadosSemanais() {
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const dados = [];
    const hoje = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const data = new Date(hoje);
        data.setDate(data.getDate() - i);
        const chave = data.toISOString().split('T')[0];
        const diaSemana = diasSemana[data.getDay()];
        
        let concluidos = 0;
        habitos.forEach(habito => {
            const valor = getHistorico(habito)[chave];
            if (habito.tipo === 'binario') {
                if (valor === true) concluidos++;
            } else {
                if (valor >= habito.alvoDiario) concluidos++;
            }
        });
        
        const porcentagem = habitos.length > 0 ? Math.round((concluidos / habitos.length) * 100) : 0;
        dados.push({ dia: diaSemana, valor: porcentagem });
    }
    
    return dados;
}

function calcularDadosMensais() {
    const dados = [];
    const hoje = new Date();
    
    for (let semana = 0; semana < 4; semana++) {
        let totalConcluidos = 0;
        let totalPossiveis = 0;
        
        for (let dia = 0; dia < 7; dia++) {
            const data = new Date(hoje);
            data.setDate(data.getDate() - (semana * 7 + dia));
            const chave = data.toISOString().split('T')[0];
            
            habitos.forEach(habito => {
                totalPossiveis++;
                const valor = getHistorico(habito)[chave];
                if (habito.tipo === 'binario') {
                    if (valor === true) totalConcluidos++;
                } else {
                    if (valor >= habito.alvoDiario) totalConcluidos++;
                }
            });
        }
        
        const porcentagem = totalPossiveis > 0 ? Math.round((totalConcluidos / totalPossiveis) * 100) : 0;
        dados.unshift({ semana: `Sem ${4 - semana}`, valor: porcentagem });
    }
    
    return dados;
}

function getTextoFrequencia(habito) {
    switch (habito.tipoFrequencia) {
        case 'diario':
            return 'Todos os dias';
        case 'x-semana':
            return `${habito.vezesX}x por semana`;
        case 'x-mes':
            return `${habito.vezesX}x por mês`;
        case 'x-em-y':
            return `${habito.vezesX}x em ${habito.diasY} dias`;
        default:
            return 'Diário';
    }
}

function getTextoDiasLembrete(dias) {
    if (!dias || dias.length === 0) return '';
    
    if (dias.length === 7) return 'Todos os dias';
    
    const diasSemanaFim = ['dom', 'sab'];
    const diasSemanaUtil = ['seg', 'ter', 'qua', 'qui', 'sex'];
    
    if (dias.length === 5 && diasSemanaUtil.every(d => dias.includes(d))) {
        return 'Seg-Sex';
    }
    if (dias.length === 2 && diasSemanaFim.every(d => dias.includes(d))) {
        return 'Fim de semana';
    }
    
    const nomesAbreviados = {
        dom: 'Dom', seg: 'Seg', ter: 'Ter', qua: 'Qua',
        qui: 'Qui', sex: 'Sex', sab: 'Sáb'
    };
    
    return dias.map(d => nomesAbreviados[d]).join(', ');
}

// Verifica se a meta do período atual está cumprida para um hábito.
// - diario: meta contínua, retorna sempre false
// - x-semana: conta conclusões na semana atual (dom-sáb) e compara com vezesX
// - x-mes: conta conclusões no mês atual e compara com vezesX
// - x-em-y: janela móvel de Y dias (hoje + Y-1 anteriores) e compara com vezesX
// - personalizado/indefinido: retorna false (neutro)
function metaDoPeriodoCumprida(habito) {
    const tipo = habito.tipoFrequencia || 'diario';
    const vezesXBruto = Number(habito.vezesX);
    const diasYBruto = Number(habito.diasY);
    const vezesX = Number.isFinite(vezesXBruto) && vezesXBruto > 0 ? vezesXBruto : 0;
    const diasY = Number.isFinite(diasYBruto) && diasYBruto > 0 ? diasYBruto : 5;
    const historico = getHistorico(habito);
    const hoje = new Date();
    hoje.setHours(12, 0, 0, 0);

    const formatarChave = (data) => {
        const d = new Date(data);
        d.setHours(12, 0, 0, 0);
        return d.toISOString().split('T')[0];
    };

    const concluiu = (valor) => habito.tipo === 'binario' ? valor === true : valor >= habito.alvoDiario;

    if (tipo === 'diario') return false;

    if (tipo === 'x-semana') {
        const inicio = new Date(hoje);
        inicio.setDate(inicio.getDate() - inicio.getDay()); // domingo
        const fim = new Date(inicio);
        fim.setDate(inicio.getDate() + 6); // sábado

        let total = 0;
        const cursor = new Date(inicio);
        while (cursor <= fim) {
            const chave = formatarChave(cursor);
            if (concluiu(historico[chave])) total++;
            cursor.setDate(cursor.getDate() + 1);
        }
        return vezesX > 0 && total >= vezesX;
    }

    if (tipo === 'x-mes') {
        const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1, 12);
        const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 12);

        let total = 0;
        const cursor = new Date(inicio);
        while (cursor <= fim) {
            const chave = formatarChave(cursor);
            if (concluiu(historico[chave])) total++;
            cursor.setDate(cursor.getDate() + 1);
        }
        return vezesX > 0 && total >= vezesX;
    }

    if (tipo === 'x-em-y') {
        let total = 0;
        for (let i = 0; i < diasY; i++) {
            const data = new Date(hoje);
            data.setDate(data.getDate() - i);
            const chave = formatarChave(data);
            if (concluiu(historico[chave])) total++;
        }
        return vezesX > 0 && total >= vezesX;
    }

    // Personalizado ou desconhecido
    return false;
}

// ============================================
// 3. MENU HAMBÚRGUER E SIDEBAR
// ============================================

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    const btnHamburguer = document.getElementById('btnHamburguer');
    
    if (!sidebar || !backdrop) return;
    
    const estaAberto = sidebar.classList.contains('ativo');
    
    if (estaAberto) {
        sidebar.classList.remove('ativo');
        backdrop.classList.remove('ativo');
        if (btnHamburguer) btnHamburguer.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    } else {
        sidebar.classList.add('ativo');
        backdrop.classList.add('ativo');
        if (btnHamburguer) btnHamburguer.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }
}

function configurarMenuHamburguer() {
    const btnHamburguer = document.getElementById('btnHamburguer');
    const backdrop = document.getElementById('sidebarBackdrop');
    
    if (btnHamburguer) btnHamburguer.addEventListener('click', toggleSidebar);
    if (backdrop) backdrop.addEventListener('click', toggleSidebar);
}

// ============================================
// 4. SISTEMA DE MODAIS
// ============================================

// Armazena handlers de focus trap para limpar depois
let focusTrapHandlers = {};

function abrirModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('ativo');
        document.body.style.overflow = 'hidden';
        
        // Anuncia abertura do modal para leitores de tela
        const titulo = modal.querySelector('h2, h3');
        if (titulo) {
            anunciarParaLeitorDeTela(`Janela aberta: ${titulo.textContent}`);
        }
        
        // Cria trap de foco para manter navegação dentro do modal
        const modalContent = modal.querySelector('.modal');
        if (modalContent) {
            focusTrapHandlers[modalId] = criarTrapDeFoco(modalContent);
        }
        
        // Foco no primeiro elemento relevante (acessibilidade)
        setTimeout(() => {
            const primeiroInput = modal.querySelector('input:not([type="hidden"]), button.tipo-habito-btn, button.btn-primario');
            if (primeiroInput) primeiroInput.focus();
        }, 100);
    }
}

function fecharModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('ativo');
        document.body.style.overflow = '';
        
        // Remove o trap de foco
        if (focusTrapHandlers[modalId]) {
            focusTrapHandlers[modalId]();
            delete focusTrapHandlers[modalId];
        }
        
        // Anuncia fechamento para leitores de tela
        anunciarParaLeitorDeTela('Janela fechada');
    }
}

function fecharModalAtivo() {
    const modaisAtivos = document.querySelectorAll('.modal-backdrop.ativo');
    if (modaisAtivos.length > 0) {
        const ultimoModal = modaisAtivos[modaisAtivos.length - 1];
        fecharModal(ultimoModal.id);
        return true;
    }
    return false;
}

// ============================================
// 4.1. SISTEMA DE TOAST (FEEDBACK)
// ============================================

// Feedback imediato mantém a visibilidade do estado do sistema (heurística de Nielsen).
function mostrarToast(mensagem, tipo = 'sucesso', duracao = 3000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.textContent = mensagem;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('saindo');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, duracao);
}

// ============================================
// 4.2. CAIXA DE BOAS-VINDAS
// ============================================

function configurarBoasVindas() {
    const box = document.getElementById('boasVindasBox');
    const btnFechar = document.getElementById('btnFecharBoasVindas');
    
    if (!box || !btnFechar) return;
    
    const fechado = localStorage.getItem('flui360_boas_vindas_fechado');
    if (fechado) {
        box.style.display = 'none';
        return;
    }
    
    btnFechar.addEventListener('click', () => {
        box.style.display = 'none';
        localStorage.setItem('flui360_boas_vindas_fechado', 'true');
    });
}

// Dica removível em Meus Hábitos (persistente)
function configurarDicaHabitos() {
    const dica = document.getElementById('habitosDicaTipos');
    const btnFecharDica = document.getElementById('btnFecharDicaHabitos');
    if (!dica || !btnFecharDica) return;
    
    const fechada = localStorage.getItem('flui360_dica_habitos_fechada');
    if (fechada) {
        dica.style.display = 'none';
        return;
    }
    
    btnFecharDica.addEventListener('click', () => {
        dica.style.display = 'none';
        localStorage.setItem('flui360_dica_habitos_fechada', 'true');
    });
}

// ============================================
// 5. FAB GLOBAL E FLUXO DE CRIAÇÃO
// ============================================

/**
 * FUNÇÃO: configurarFAB
 * ---------------------
 * O FAB funciona globalmente em todas as telas.
 * Ao clicar, abre primeiro o modal de seleção de tipo.
 * Após selecionar o tipo, abre o formulário principal.
 */
function configurarFAB() {
    const btnNovoHabito = document.getElementById('btnNovoHabito');
    
    if (btnNovoHabito) {
        btnNovoHabito.addEventListener('click', () => {
            // Abre o modal de seleção de tipo primeiro
            abrirModal('modalTipoBackdrop');
        });
    }
}

/**
 * FUNÇÃO: configurarModalTipo
 * ---------------------------
 * Modal de seleção de tipo de hábito (binário ou mensurável).
 * Aparece antes do formulário principal.
 * O tipo escolhido fica fixo e não pode ser alterado depois.
 */
function configurarModalTipo() {
    const modalTipoBackdrop = document.getElementById('modalTipoBackdrop');
    const btnFecharModalTipo = document.getElementById('btnFecharModalTipo');
    const tipoHabitoBtns = document.querySelectorAll('.tipo-habito-btn');
    
    if (btnFecharModalTipo) {
        btnFecharModalTipo.addEventListener('click', () => fecharModal('modalTipoBackdrop'));
    }
    
    if (modalTipoBackdrop) {
        modalTipoBackdrop.addEventListener('click', (e) => {
            if (e.target === modalTipoBackdrop) fecharModal('modalTipoBackdrop');
        });
    }
    
    // Ao clicar em um tipo, fecha este modal e abre o formulário
    tipoHabitoBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tipoHabitoSelecionado = btn.dataset.tipo;
            fecharModal('modalTipoBackdrop');
            
            // Configura o formulário com o tipo selecionado
            limparFormularioHabito();
            configurarTipoNoFormulario(tipoHabitoSelecionado);
            
            document.getElementById('tituloModalHabito').textContent = 'Novo Hábito';
            document.getElementById('btnSalvarHabito').textContent = 'Salvar Hábito';
            
            abrirModal('modalHabitoBackdrop');
        });
    });
}

/**
 * FUNÇÃO: configurarTipoNoFormulario
 * ----------------------------------
 * Configura o indicador de tipo e campos condicionais.
 * O tipo é somente leitura no formulário.
 */
function configurarTipoNoFormulario(tipo) {
    const tipoHabitoHidden = document.getElementById('tipoHabitoHidden');
    const camposMensuravel = document.getElementById('camposMensuravel');
    
    if (tipoHabitoHidden) tipoHabitoHidden.value = tipo;
    
    if (camposMensuravel) {
        camposMensuravel.style.display = tipo === 'mensuravel' ? 'block' : 'none';
    }
}

// ============================================
// 6. CRUD DE HÁBITOS
// ============================================

function configurarModais() {
    // Modal de login (index.html)
    const btnCriarConta = document.getElementById('btnCriarConta');
    const btnFecharModal = document.getElementById('btnFecharModal');
    const modalBackdrop = document.getElementById('modalBackdrop');
    
    if (btnCriarConta) btnCriarConta.addEventListener('click', () => abrirModal('modalBackdrop'));
    if (btnFecharModal) btnFecharModal.addEventListener('click', () => fecharModal('modalBackdrop'));
    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', (e) => {
            if (e.target === modalBackdrop) fecharModal('modalBackdrop');
        });
    }

    const btnEsqueciSenha = document.getElementById('btnEsqueciSenha');
    if (btnEsqueciSenha) {
        btnEsqueciSenha.addEventListener('click', () => {
            alert('Envie seu e-mail cadastrado e enviaremos um link para redefinição (simulação).');
        });
    }
    
    const formCadastro = document.getElementById('formCadastro');
    if (formCadastro) {
        formCadastro.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Conta criada com sucesso! (simulação)');
            fecharModal('modalBackdrop');
            formCadastro.reset();
        });
    }
    
    // Modal do formulário de hábito
    const btnFecharModalHabito = document.getElementById('btnFecharModalHabito');
    const btnCancelarHabito = document.getElementById('btnCancelarHabito');
    const modalHabitoBackdrop = document.getElementById('modalHabitoBackdrop');
    
    if (btnFecharModalHabito) btnFecharModalHabito.addEventListener('click', () => fecharModal('modalHabitoBackdrop'));
    if (btnCancelarHabito) btnCancelarHabito.addEventListener('click', () => fecharModal('modalHabitoBackdrop'));
    
    if (modalHabitoBackdrop) {
        modalHabitoBackdrop.addEventListener('click', (e) => {
            if (e.target === modalHabitoBackdrop) fecharModal('modalHabitoBackdrop');
        });
    }

    // Mini modais auxiliares
    const modalDiasBackdrop = document.getElementById('modalDiasBackdrop');
    if (modalDiasBackdrop) {
        modalDiasBackdrop.addEventListener('click', (e) => {
            if (e.target === modalDiasBackdrop) fecharModalDias(true);
        });
    }

    const modalCoresBackdrop = document.getElementById('modalCoresBackdrop');
    if (modalCoresBackdrop) {
        modalCoresBackdrop.addEventListener('click', (e) => {
            if (e.target === modalCoresBackdrop) fecharModal('modalCoresBackdrop');
        });
    }
    
    // Modal de exclusão
    const btnFecharModalExcluir = document.getElementById('btnFecharModalExcluir');
    const btnCancelarExcluir = document.getElementById('btnCancelarExcluir');
    const btnConfirmarExcluir = document.getElementById('btnConfirmarExcluir');
    const modalExcluirBackdrop = document.getElementById('modalExcluirBackdrop');
    
    if (btnFecharModalExcluir) btnFecharModalExcluir.addEventListener('click', () => fecharModal('modalExcluirBackdrop'));
    if (btnCancelarExcluir) btnCancelarExcluir.addEventListener('click', () => fecharModal('modalExcluirBackdrop'));
    if (btnConfirmarExcluir) {
        btnConfirmarExcluir.addEventListener('click', () => {
            if (habitoParaExcluir) {
                excluirHabito(habitoParaExcluir);
                habitoParaExcluir = null;
            }
            fecharModal('modalExcluirBackdrop');
        });
    }
    if (modalExcluirBackdrop) {
        modalExcluirBackdrop.addEventListener('click', (e) => {
            if (e.target === modalExcluirBackdrop) fecharModal('modalExcluirBackdrop');
        });
    }
    
    // Formulário de hábito
    const formHabito = document.getElementById('formHabito');
    if (formHabito) {
        formHabito.addEventListener('submit', (e) => {
            e.preventDefault();
            salvarHabito();
        });
    }
    
    configurarCamposDinamicos();
    configurarFAB();
    configurarModalTipo();
    configurarModalValor();
}

/**
 * FUNÇÃO: configurarCamposDinamicos
 * ---------------------------------
 * Configura campos condicionais no formulário:
 * - Frequência via mini modal
 * - Lembretes (toggle + dias da semana)
 */
function configurarCamposDinamicos() {
    // Frequência via mini modal
    const btnAbrirFrequencia = document.getElementById('btnAbrirFrequencia');
    const btnSalvarFrequencia = document.getElementById('btnSalvarFrequencia');
    const btnCancelarFrequencia = document.getElementById('btnCancelarFrequencia');
    const btnFecharModalFrequencia = document.getElementById('btnFecharModalFrequencia');
    const modalFrequenciaBackdrop = document.getElementById('modalFrequenciaBackdrop');
    
    if (btnAbrirFrequencia) btnAbrirFrequencia.addEventListener('click', abrirModalFrequencia);
    if (btnSalvarFrequencia) btnSalvarFrequencia.addEventListener('click', salvarModalFrequencia);
    if (btnCancelarFrequencia) btnCancelarFrequencia.addEventListener('click', () => fecharModalFrequencia(true));
    if (btnFecharModalFrequencia) btnFecharModalFrequencia.addEventListener('click', () => fecharModalFrequencia(true));
    if (modalFrequenciaBackdrop) {
        modalFrequenciaBackdrop.addEventListener('click', (e) => {
            if (e.target === modalFrequenciaBackdrop) fecharModalFrequencia(true);
        });
    }
    atualizarResumoFrequencia();
    
    // Lembrete via campo de horário
    const horaLembrete = document.getElementById('horaLembrete');
    if (horaLembrete) {
        horaLembrete.addEventListener('input', () => {
            atualizarEstadoLembrete();
        });
    }
    const btnLimparHoraLembrete = document.getElementById('btnLimparHoraLembrete');
    if (btnLimparHoraLembrete) {
        btnLimparHoraLembrete.addEventListener('click', () => {
            if (horaLembrete) {
                horaLembrete.value = '';
                atualizarEstadoLembrete();
            }
        });
    }
    
    // Botões de dias da semana
    const diasBtns = document.querySelectorAll('.dia-semana-btn');
    diasBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('ativo');
            atualizarBotaoToggleDias();
            atualizarResumoDias();
        });
    });
    
    // Botão selecionar/limpar todos
    const btnToggleDias = document.getElementById('btnToggleDias');
    if (btnToggleDias) {
        btnToggleDias.addEventListener('click', () => {
            const diasAtivos = document.querySelectorAll('.dia-semana-btn.ativo');
            const todosDias = document.querySelectorAll('.dia-semana-btn');
            
            if (diasAtivos.length === todosDias.length) {
                todosDias.forEach(btn => btn.classList.remove('ativo'));
            } else {
                todosDias.forEach(btn => btn.classList.add('ativo'));
            }
            atualizarBotaoToggleDias();
            atualizarResumoDias();
        });
    }

    // Mini modal de dias
    const btnAbrirDiasModal = document.getElementById('btnAbrirDiasModal');
    const btnSalvarDias = document.getElementById('btnSalvarDias');
    const btnCancelarDias = document.getElementById('btnCancelarDias');
    const btnFecharModalDias = document.getElementById('btnFecharModalDias');
    
    if (btnAbrirDiasModal) {
        btnAbrirDiasModal.addEventListener('click', () => {
            cacheDiasSelecionados = getDiasSelecionados();
            abrirModal('modalDiasBackdrop');
        });
    }
    if (btnSalvarDias) {
        btnSalvarDias.addEventListener('click', () => {
            atualizarResumoDias();
            fecharModalDias();
        });
    }
    if (btnCancelarDias) {
        btnCancelarDias.addEventListener('click', () => {
            fecharModalDias(true);
        });
    }
    if (btnFecharModalDias) {
        btnFecharModalDias.addEventListener('click', () => fecharModalDias(true));
    }

    // Mini modal de cores
    const btnAbrirCores = document.getElementById('btnAbrirCores');
    const btnFecharModalCores = document.getElementById('btnFecharModalCores');
    const btnCancelarCores = document.getElementById('btnCancelarCores');
    
    if (btnAbrirCores) {
        btnAbrirCores.addEventListener('click', () => abrirModal('modalCoresBackdrop'));
    }
    if (btnFecharModalCores) {
        btnFecharModalCores.addEventListener('click', () => fecharModal('modalCoresBackdrop'));
    }
    if (btnCancelarCores) {
        btnCancelarCores.addEventListener('click', () => fecharModal('modalCoresBackdrop'));
    }
    
    document.querySelectorAll('input[name=\"corHabito\"]').forEach(radio => {
        radio.addEventListener('change', () => {
            atualizarCorAtalho();
            fecharModal('modalCoresBackdrop');
        });
    });
    
    atualizarResumoDias();
    atualizarCorAtalho();
}

function atualizarBotaoToggleDias() {
    const btnToggleDias = document.getElementById('btnToggleDias');
    if (!btnToggleDias) return;
    
    const diasAtivos = document.querySelectorAll('.dia-semana-btn.ativo');
    const todosDias = document.querySelectorAll('.dia-semana-btn');
    
    btnToggleDias.textContent = diasAtivos.length === todosDias.length ? 'Limpar todos' : 'Selecionar todos';
}

function getDiasSelecionados() {
    return Array.from(document.querySelectorAll('.dia-semana-btn.ativo')).map(btn => btn.dataset.dia);
}

function setDiasSelecionados(dias) {
    document.querySelectorAll('.dia-semana-btn').forEach(btn => {
        btn.classList.toggle('ativo', dias.includes(btn.dataset.dia));
    });
    atualizarBotaoToggleDias();
    atualizarResumoDias();
}

function atualizarResumoDias() {
    const resumo = document.getElementById('diasResumoTexto');
    if (!resumo) return;
    const dias = getDiasSelecionados();
    resumo.textContent = dias.length > 0 ? getTextoDiasLembrete(dias) : 'Sem dias selecionados';
}

function atualizarCorAtalho() {
    const corSelecionada = document.querySelector('input[name=\"corHabito\"]:checked');
    const corPreview = document.getElementById('corAtualPreview');
    if (corSelecionada && corPreview) {
        corPreview.style.backgroundColor = corSelecionada.value;
    }
}

function selecionarCorAleatoria() {
    const radios = Array.from(document.querySelectorAll('input[name=\"corHabito\"]'));
    if (radios.length === 0) return;
    const indice = Math.floor(Math.random() * radios.length);
    radios[indice].checked = true;
    atualizarCorAtalho();
}

function atualizarEstadoLembrete() {
    const horaInput = document.getElementById('horaLembrete');
    const lembreteAtivo = document.getElementById('lembreteAtivo');
    const lembreteConfig = document.getElementById('lembreteConfig');
    const diasResumo = document.querySelector('.dias-semana-resumo');
    
    const ativo = !!(horaInput && horaInput.value);
    if (lembreteAtivo) lembreteAtivo.checked = ativo;
    if (lembreteConfig) lembreteConfig.style.display = 'block'; // mantém container visível
    if (diasResumo) diasResumo.style.display = ativo ? 'flex' : 'none';
}

function getFrequenciaAtual() {
    const tipoFrequencia = document.getElementById('tipoFrequencia');
    return {
        tipo: tipoFrequencia ? tipoFrequencia.value : 'diario',
        semana: parseInt(document.getElementById('vezesXSemana')?.value) || 3,
        mes: parseInt(document.getElementById('vezesXMes')?.value) || 10,
        x: frequenciaXTemp,
        y: frequenciaYTemp
    };
}

function atualizarResumoFrequencia() {
    const resumo = document.getElementById('freqResumoTexto');
    const tipoFrequencia = document.getElementById('tipoFrequencia');
    if (!resumo || !tipoFrequencia) return;
    
    const tipo = tipoFrequencia.value || 'diario';
    let texto = 'Todos os dias';
    
    switch (tipo) {
        case 'x-semana': {
            const val = parseInt(document.getElementById('vezesXSemana')?.value) || 3;
            texto = `${val}x por semana`;
            break;
        }
        case 'x-mes': {
            const val = parseInt(document.getElementById('vezesXMes')?.value) || 10;
            texto = `${val}x por mês`;
            break;
        }
        case 'x-em-y': {
            texto = `${frequenciaXTemp}x em ${frequenciaYTemp} dias`;
            break;
        }
        default:
            texto = 'Todos os dias';
    }
    
    resumo.textContent = texto;
}

function abrirModalFrequencia() {
    cacheFrequencia = getFrequenciaAtual();
    
    const radio = document.querySelector(`input[name=\"opcaoFrequencia\"][value=\"${cacheFrequencia.tipo}\"]`);
    if (radio) radio.checked = true;
    else {
        const diario = document.querySelector('input[name=\"opcaoFrequencia\"][value=\"diario\"]');
        if (diario) diario.checked = true;
    }
    
    const inputSemana = document.getElementById('vezesXSemana');
    if (inputSemana) inputSemana.value = cacheFrequencia.semana || 3;
    
    const inputMes = document.getElementById('vezesXMes');
    if (inputMes) inputMes.value = cacheFrequencia.mes || 10;
    
    const inputX = document.getElementById('inputVezesX');
    const inputY = document.getElementById('inputDiasY');
    if (inputX) inputX.value = cacheFrequencia.x || 3;
    if (inputY) inputY.value = cacheFrequencia.y || 5;
    
    abrirModal('modalFrequenciaBackdrop');
}

function fecharModalFrequencia(reverter = false) {
    if (reverter && cacheFrequencia) {
        const tipoFrequencia = document.getElementById('tipoFrequencia');
        if (tipoFrequencia) tipoFrequencia.value = cacheFrequencia.tipo;
        
        const inputSemana = document.getElementById('vezesXSemana');
        if (inputSemana) inputSemana.value = cacheFrequencia.semana;
        
        const inputMes = document.getElementById('vezesXMes');
        if (inputMes) inputMes.value = cacheFrequencia.mes;
        
        frequenciaXTemp = cacheFrequencia.x;
        frequenciaYTemp = cacheFrequencia.y;
        
        const inputX = document.getElementById('inputVezesX');
        const inputY = document.getElementById('inputDiasY');
        if (inputX) inputX.value = cacheFrequencia.x;
        if (inputY) inputY.value = cacheFrequencia.y;
        
        atualizarResumoFrequencia();
    }
    fecharModal('modalFrequenciaBackdrop');
}

function salvarModalFrequencia() {
    const selecionado = document.querySelector('input[name=\"opcaoFrequencia\"]:checked');
    let tipoSelecionado = selecionado ? selecionado.value : 'diario';
    let tipoParaSalvar = tipoSelecionado;
    
    const tipoFrequencia = document.getElementById('tipoFrequencia');
    
    if (tipoSelecionado === 'x-semana') {
        const val = parseInt(document.getElementById('vezesXSemana')?.value) || 3;
        if (document.getElementById('vezesXSemana')) document.getElementById('vezesXSemana').value = val;
    }
    
    if (tipoSelecionado === 'x-mes') {
        const val = parseInt(document.getElementById('vezesXMes')?.value) || 10;
        if (document.getElementById('vezesXMes')) document.getElementById('vezesXMes').value = val;
    }
    
    if (tipoSelecionado === 'x-em-y' || tipoSelecionado === 'personalizado') {
        const x = parseInt(document.getElementById('inputVezesX')?.value) || 3;
        const y = parseInt(document.getElementById('inputDiasY')?.value) || 5;
        frequenciaXTemp = x;
        frequenciaYTemp = y;
        tipoParaSalvar = 'x-em-y';
    }
    
    if (tipoFrequencia) tipoFrequencia.value = tipoParaSalvar;
    atualizarResumoFrequencia();
    fecharModal('modalFrequenciaBackdrop');
}

function fecharModalDias(reverterSelecao = false) {
    if (reverterSelecao) {
        setDiasSelecionados(cacheDiasSelecionados);
    }
    fecharModal('modalDiasBackdrop');
}

function limparFormularioHabito() {
    const form = document.getElementById('formHabito');
    if (!form) return;
    
    form.reset();
    document.getElementById('habitoId').value = '';
    document.getElementById('tipoHabitoHidden').value = 'binario';
    
    const camposMensuravel = document.getElementById('camposMensuravel');
    if (camposMensuravel) camposMensuravel.style.display = 'none';
    
    // Reset frequência
    const tipoFrequencia = document.getElementById('tipoFrequencia');
    if (tipoFrequencia) tipoFrequencia.value = 'diario';
    
    const vezesXSemana = document.getElementById('vezesXSemana');
    const vezesXMes = document.getElementById('vezesXMes');
    if (vezesXSemana) vezesXSemana.value = 3;
    if (vezesXMes) vezesXMes.value = 10;
    
    // Reset lembretes
    const lembreteAtivo = document.getElementById('lembreteAtivo');
    const lembreteConfig = document.getElementById('lembreteConfig');
    if (lembreteAtivo) lembreteAtivo.checked = false;
    if (lembreteConfig) lembreteConfig.style.display = 'block';
    const horaLembrete = document.getElementById('horaLembrete');
    if (horaLembrete) horaLembrete.value = '';
    
    setDiasSelecionados([]);
    atualizarEstadoLembrete();
    
    // Reset cor (escolhe uma aleatória entre as opções disponíveis)
    selecionarCorAleatoria();
    
    // Reset frequência temporária
    frequenciaXTemp = 3;
    frequenciaYTemp = 5;
    atualizarResumoFrequencia();
}

function preencherFormularioHabito(habito) {
    document.getElementById('habitoId').value = habito.id;
    document.getElementById('tipoHabitoHidden').value = habito.tipo;
    document.getElementById('nomeHabito').value = habito.nome;
    
    // Tipo (somente leitura)
    configurarTipoNoFormulario(habito.tipo);
    
    // Campos mensuráveis
    if (habito.tipo === 'mensuravel') {
        document.getElementById('alvoDiario').value = habito.alvoDiario || 1;
        document.getElementById('unidadeHabito').value = habito.unidade || '';
    }
    
    // Frequência
    const tipoFrequencia = document.getElementById('tipoFrequencia');
    
    if (tipoFrequencia) tipoFrequencia.value = habito.tipoFrequencia;

    switch (habito.tipoFrequencia) {
        case 'x-semana':
            document.getElementById('vezesXSemana').value = habito.vezesX || 3;
            break;
        case 'x-mes':
            document.getElementById('vezesXMes').value = habito.vezesX || 10;
            break;
        case 'x-em-y':
            frequenciaXTemp = habito.vezesX || 3;
            frequenciaYTemp = habito.diasY || 5;
            break;
        default:
            frequenciaXTemp = 3;
            frequenciaYTemp = 5;
    }
    atualizarResumoFrequencia();
    
    // Lembretes
    const lembreteAtivo = document.getElementById('lembreteAtivo');
    const lembreteConfig = document.getElementById('lembreteConfig');
    if (lembreteAtivo) lembreteAtivo.checked = habito.lembreteAtivo;
    if (lembreteConfig) lembreteConfig.style.display = 'block';
    
    document.getElementById('horaLembrete').value = habito.lembreteAtivo ? (habito.horaLembrete || '08:00') : '';
    
    setDiasSelecionados(habito.diasLembrete || []);
    atualizarEstadoLembrete();
    
    // Cor
    const corRadio = document.querySelector(`input[name="corHabito"][value="${habito.cor}"]`);
    if (corRadio) corRadio.checked = true;
    atualizarCorAtalho();
}

function validarFormularioHabito() {
    let valido = true;
    limparErrosFormulario();
    
    const nome = document.getElementById('nomeHabito').value.trim();
    const tipo = document.getElementById('tipoHabitoHidden').value;
    
    if (!nome) {
        mostrarErro('nomeHabito', 'Por favor, insira um nome para o hábito.');
        valido = false;
    }
    
    if (tipo === 'mensuravel') {
        const alvo = document.getElementById('alvoDiario').value;
        if (!alvo || parseInt(alvo) < 1) {
            mostrarErro('alvoDiario', 'Por favor, defina uma meta diária válida.');
            valido = false;
        }
    }
    
    return valido;
}

function mostrarErro(campoId, mensagem) {
    const campo = document.getElementById(campoId);
    if (!campo) return;
    
    const campoGrupo = campo.closest('.campo-grupo');
    if (campoGrupo) {
        campoGrupo.classList.add('erro');
        
        const erroExistente = campoGrupo.querySelector('.mensagem-erro');
        if (!erroExistente) {
            const msgErro = document.createElement('span');
            msgErro.className = 'mensagem-erro';
            msgErro.textContent = mensagem;
            campoGrupo.appendChild(msgErro);
        }
    }
}

function limparErrosFormulario() {
    document.querySelectorAll('.campo-grupo.erro').forEach(grupo => {
        grupo.classList.remove('erro');
        const msgErro = grupo.querySelector('.mensagem-erro');
        if (msgErro) msgErro.remove();
    });
}

function salvarHabito() {
    if (!validarFormularioHabito()) {
        mostrarToast('Por favor, preencha os campos obrigatórios.', 'erro');
        return;
    }
    
    const idInput = document.getElementById('habitoId').value;
    const isEdicao = idInput !== '';
    
    const tipo = document.getElementById('tipoHabitoHidden').value;
    const nome = document.getElementById('nomeHabito').value.trim();
    const cor = document.querySelector('input[name="corHabito"]:checked').value;
    
    // Campos mensuráveis
    let alvoDiario = 1;
    let unidade = '';
    if (tipo === 'mensuravel') {
        alvoDiario = parseInt(document.getElementById('alvoDiario').value) || 1;
        unidade = document.getElementById('unidadeHabito').value.trim();
    }
    
    // Frequência
    const tipoFrequencia = document.getElementById('tipoFrequencia').value;
    let vezesX = 1;
    let diasY = 1;
    
    switch (tipoFrequencia) {
        case 'x-semana':
            vezesX = parseInt(document.getElementById('vezesXSemana').value) || 3;
            break;
        case 'x-mes':
            vezesX = parseInt(document.getElementById('vezesXMes').value) || 10;
            break;
        case 'x-em-y':
            vezesX = frequenciaXTemp;
            diasY = frequenciaYTemp;
            break;
    }
    
    // Lembretes
    const lembreteAtivo = document.getElementById('lembreteAtivo').checked;
    const horaLembrete = document.getElementById('horaLembrete').value || '08:00';
    const diasLembrete = getDiasSelecionados();
    
    if (isEdicao) {
        const id = parseInt(idInput);
        const habito = habitos.find(h => h.id === id);
        if (habito) {
            habito.nome = nome;
            habito.cor = cor;
            habito.unidade = unidade;
            habito.alvoDiario = alvoDiario;
            habito.tipoFrequencia = tipoFrequencia;
            habito.vezesX = vezesX;
            habito.diasY = diasY;
            habito.lembreteAtivo = lembreteAtivo;
            habito.horaLembrete = horaLembrete;
            habito.diasLembrete = diasLembrete;
            // Tipo NÃO é alterado na edição
        }
    } else {
        const novoId = habitos.length > 0 ? Math.max(...habitos.map(h => h.id)) + 1 : 1;
        const novoHabito = {
            id: novoId,
            nome: nome,
            tipo: tipo,
            cor: cor,
            unidade: unidade,
            alvoDiario: alvoDiario,
            tipoFrequencia: tipoFrequencia,
            vezesX: vezesX,
            diasY: diasY,
            lembreteAtivo: lembreteAtivo,
            horaLembrete: horaLembrete,
            diasLembrete: diasLembrete,
            historico: {}
        };
        habitos.push(novoHabito);
    }
    
    salvarHabitos();
    fecharModal('modalHabitoBackdrop');
    
    mostrarToast(isEdicao ? 'Hábito atualizado com sucesso!' : 'Hábito criado com sucesso!', 'sucesso');
    
    renderizarHabitos();
    renderizarHabitosHoje();
    atualizarEstatisticasDashboard();
    renderizarGraficoSemanal();
    renderizarGraficoDiasConcluidos();
    renderizarGraficoMensal();
}

function editarHabito(id) {
    const habito = habitos.find(h => h.id === id);
    if (!habito) return;
    
    limparFormularioHabito();
    preencherFormularioHabito(habito);
    
    document.getElementById('tituloModalHabito').textContent = 'Editar Hábito';
    document.getElementById('btnSalvarHabito').textContent = 'Atualizar Hábito';
    abrirModal('modalHabitoBackdrop');
}

function confirmarExclusao(id) {
    const habito = habitos.find(h => h.id === id);
    if (!habito) return;
    
    habitoParaExcluir = id;
    document.getElementById('nomeHabitoExcluir').textContent = habito.nome;
    abrirModal('modalExcluirBackdrop');
}

function excluirHabito(id) {
    habitos = habitos.filter(h => h.id !== id);
    salvarHabitos();
    
    mostrarToast('Hábito excluído com sucesso!', 'sucesso');
    
    renderizarHabitos();
    renderizarHabitosHoje();
    atualizarEstatisticasDashboard();
    renderizarGraficoSemanal();
    renderizarGraficoDiasConcluidos();
    renderizarGraficoMensal();
}

function toggleDiaHabito(habitoId, data) {
    const habito = habitos.find(h => h.id === habitoId);
    if (!habito) return;
    
    // Mesma ação de marcar/desmarcar é reaproveitada em todas as telas para consistência e padrões.
    if (habito.tipo === 'binario') {
        const historico = getHistorico(habito);
        const novoValor = !historico[data];
        habito.historico = historico;
        habito.historico[data] = novoValor;
        salvarHabitos();
        renderizarHabitos();
        renderizarHabitosHoje();
        atualizarEstatisticasDashboard();
        renderizarGraficoSemanal();
        
        if (novoValor) {
            mostrarToast('Progresso registrado com sucesso!', 'sucesso');
        }
        
        // Anuncia para leitores de tela
        const acao = novoValor ? 'marcado como concluído' : 'desmarcado';
        anunciarParaLeitorDeTela(`${habito.nome} ${acao}`);
    }
}

// ============================================
// 7. MODAL DE VALOR PARA MENSURÁVEIS
// ============================================

/**
 * FUNÇÃO: configurarModalValor
 * ----------------------------
 * Modal que aparece ao clicar para "completar" um hábito mensurável.
 * Pergunta o valor do dia (ex: "Quantas páginas você leu?")
 * Usado tanto em Meus Hábitos quanto no Dashboard.
 */
function configurarModalValor() {
    const modalValorBackdrop = document.getElementById('modalValorBackdrop');
    const btnFecharModalValor = document.getElementById('btnFecharModalValor');
    const btnCancelarValor = document.getElementById('btnCancelarValor');
    const btnConfirmarValor = document.getElementById('btnConfirmarValor');
    const inputValorDia = document.getElementById('inputValorDia');
    
    if (btnFecharModalValor) {
        btnFecharModalValor.addEventListener('click', () => fecharModal('modalValorBackdrop'));
    }
    if (btnCancelarValor) {
        btnCancelarValor.addEventListener('click', () => fecharModal('modalValorBackdrop'));
    }
    if (modalValorBackdrop) {
        modalValorBackdrop.addEventListener('click', (e) => {
            if (e.target === modalValorBackdrop) fecharModal('modalValorBackdrop');
        });
    }
    
    // Atualiza preview conforme digita
    if (inputValorDia) {
        inputValorDia.addEventListener('input', atualizarPreviewValor);
    }
    
    // Confirma o valor
    if (btnConfirmarValor) {
        btnConfirmarValor.addEventListener('click', () => {
            if (habitoParaValor) {
                const valor = parseFloat(inputValorDia.value) || 0;
                const dataAlvo = dataParaValor || getHoje();
                habitoParaValor.historico = getHistorico(habitoParaValor);
                habitoParaValor.historico[dataAlvo] = valor;
                salvarHabitos();
                habitoParaValor = null;
                dataParaValor = null;
                
                fecharModal('modalValorBackdrop');
                
                mostrarToast('Progresso registrado com sucesso!', 'sucesso');
                
                renderizarHabitos();
                renderizarHabitosHoje();
                atualizarEstatisticasDashboard();
                renderizarGraficoSemanal();
            }
        });
    }
}

/**
 * FUNÇÃO: abrirModalValor
 * -----------------------
 * Abre o modal de valor para um hábito mensurável específico.
 */
function abrirModalValor(habitoId) {
    const habito = habitos.find(h => h.id === habitoId);
    if (!habito || habito.tipo !== 'mensuravel') return;
    
    habitoParaValor = habito;
    
    const perguntaValor = document.getElementById('perguntaValor');
    const valorUnidade = document.getElementById('valorUnidade');
    const inputValorDia = document.getElementById('inputValorDia');
    
    // Configura a pergunta
    if (perguntaValor) {
        perguntaValor.textContent = `Quanto você completou hoje?`;
    }
    
    if (valorUnidade) {
        valorUnidade.textContent = habito.unidade || 'unidades';
    }
    
    if (inputValorDia) {
        inputValorDia.value = getValorHoje(habito);
    }
    
    atualizarPreviewValor();
    abrirModal('modalValorBackdrop');
}

function abrirModalValorParaData(habitoId, data) {
    const habito = habitos.find(h => h.id === habitoId);
    if (!habito || habito.tipo !== 'mensuravel') return;
    
    habitoParaValor = habito;
    dataParaValor = data;
    
    const perguntaValor = document.getElementById('perguntaValor');
    const valorUnidade = document.getElementById('valorUnidade');
    const inputValorDia = document.getElementById('inputValorDia');
    
    const dataObj = new Date(data + 'T12:00:00');
    const hoje = new Date();
    hoje.setHours(12, 0, 0, 0);
    const isHoje = dataObj.toDateString() === hoje.toDateString();
    
    if (perguntaValor) {
        perguntaValor.textContent = isHoje 
            ? 'Quanto você completou hoje?' 
            : `Quanto você completou em ${dataObj.getDate()}/${dataObj.getMonth() + 1}?`;
    }
    
    if (valorUnidade) {
        valorUnidade.textContent = habito.unidade || 'unidades';
    }
    
    if (inputValorDia) {
        const valorExistente = getHistorico(habito)[data];
        inputValorDia.value = valorExistente !== undefined ? valorExistente : 0;
    }
    
    atualizarPreviewValor();
    abrirModal('modalValorBackdrop');
}

function atualizarPreviewValor() {
    if (!habitoParaValor) return;
    
    const inputValorDia = document.getElementById('inputValorDia');
    const valorProgressoTexto = document.getElementById('valorProgressoTexto');
    const valorProgressoBarra = document.getElementById('valorProgressoBarra');
    
    const valor = parseFloat(inputValorDia?.value) || 0;
    const alvo = habitoParaValor.alvoDiario;
    const porcentagem = Math.min((valor / alvo) * 100, 100);
    
    if (valorProgressoTexto) {
        valorProgressoTexto.textContent = `${valor}/${alvo} ${habitoParaValor.unidade || ''}`;
    }
    
    if (valorProgressoBarra) {
        valorProgressoBarra.style.width = `${porcentagem}%`;
        valorProgressoBarra.style.backgroundColor = habitoParaValor.cor;
    }
}

// ============================================
// 8. RENDERIZAÇÃO DE HÁBITOS
// ============================================

function renderizarHabitos() {
    const grid = document.getElementById('habitosGrid');
    const semHabitos = document.getElementById('semHabitos');
    
    if (!grid) return;
    
    if (!Array.isArray(habitos)) {
        console.warn('[Flui360] Estado de hábitos inválido ao renderizar. Resetando.');
        habitos = normalizarHabitos([]);
    }
    
    grid.innerHTML = '';
    
    if (habitos.length === 0) {
        if (semHabitos) semHabitos.style.display = 'block';
        return;
    }
    
    if (semHabitos) semHabitos.style.display = 'none';
    
    habitos.forEach(habito => {
        const card = criarCardHabitoAvancado(habito);
        grid.appendChild(card);
    });
}

function criarCardHabitoAvancado(habito) {
    const card = document.createElement('article');
    card.className = 'card-habito-avancado';
    card.style.setProperty('--cor-habito', habito.cor);
    const historico = getHistorico(habito);
    
    const tipoBadge = habito.tipo === 'binario' ? 'Sim/Não' : 'Mensurável';
    const frequenciaTexto = getTextoFrequencia(habito);
    
    // Controle de conclusão
    let controleHTML = '';
    const hoje = getHoje();
    
    if (habito.tipo === 'binario') {
        const concluido = historico[hoje] === true;
        controleHTML = `
            <div class="habito-card-controle">
                <div class="controle-binario" role="button" tabindex="0" aria-label="${concluido ? 'Desmarcar' : 'Marcar'} o hábito ${habito.nome} como concluído hoje" onclick="toggleDiaHabito(${habito.id}, '${hoje}')">
                    <div class="checkbox-grande ${concluido ? 'concluido' : ''}" style="--cor-habito: ${habito.cor}">
                        <span class="check-icon">${concluido ? '✓' : ''}</span>
                    </div>
                    <span class="controle-binario-texto ${concluido ? 'concluido' : ''}">${concluido ? 'Concluído hoje!' : 'Marcar como concluído'}</span>
                </div>
            </div>
        `;
    } else {
        // Hábito mensurável - botão com mesmo estilo que abre modal
        const valorHoje = historico[hoje] || 0;
        const alvo = habito.alvoDiario;
        const atingido = valorHoje >= alvo;
        const percentual = Math.min((valorHoje / alvo) * 100, 100);
        
        controleHTML = `
            <div class="habito-card-controle">
                <div class="controle-mensuravel-botao" role="button" tabindex="0" aria-label="Registrar valor de hoje para o hábito ${habito.nome}" onclick="abrirModalValor(${habito.id})">
                    <button class="btn-completar-mensuravel ${atingido ? 'concluido' : ''}" style="--cor-habito: ${habito.cor}; --progresso: ${percentual}%"
                        aria-hidden="true">
                        <span class="check-icon">${atingido ? '✓' : ''}</span>
                    </button>
                    <div class="controle-mensuravel-info">
                        <span class="controle-mensuravel-texto ${atingido ? 'concluido' : ''}">${atingido ? 'Meta atingida!' : 'Registrar progresso'}</span>
                        <span class="controle-mensuravel-progresso">${valorHoje}/${alvo} ${habito.unidade}</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Calendário
    const { diasHTML, headerDias } = gerarDiasCalendario(habito, 7);
    
    card.innerHTML = `
        <div class="habito-card-header">
            <div class="habito-card-acoes">
                <button class="btn-icone btn-editar" onclick="editarHabito(${habito.id})" aria-label="Editar o hábito ${habito.nome}" title="Editar"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-icone btn-excluir" onclick="confirmarExclusao(${habito.id})" aria-label="Excluir o hábito ${habito.nome}" title="Excluir"><i class="fa-solid fa-trash"></i></button>
            </div>
            <div class="habito-card-info">
                <h3 class="habito-card-nome">
                    <span class="habito-card-nome-texto">${habito.nome}</span>
                    <button type="button" class="btn-icone btn-stats-habito" data-habito-id="${habito.id}" aria-label="Ver estatísticas do hábito ${habito.nome}" title="Ver estatísticas">
                        &#9432; <span>Detalhes</span>
                    </button>
                </h3>
            </div>
        </div>
        
        ${controleHTML}
        
        <div class="habito-card-calendario">
            <div class="calendario-dias-header">${headerDias}</div>
            <div class="calendario-dias" data-habito-id="${habito.id}">${diasHTML}</div>
        </div>
    `;
    
    // Eventos de clique nos dias do calendário
    setTimeout(() => {
        const dias = card.querySelectorAll('.calendario-dia');
        dias.forEach(dia => {
            dia.addEventListener('click', () => {
                if (habito.tipo === 'binario') {
                    toggleDiaHabito(habito.id, dia.dataset.data);
                } else {
                    abrirModalValorParaData(habito.id, dia.dataset.data);
                }
            });
        });
        
        const controleBinario = card.querySelector('.controle-binario');
        if (controleBinario) {
            controleBinario.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleDiaHabito(habito.id, hoje);
                }
            });
        }
        
        const controleMensuravel = card.querySelector('.controle-mensuravel-botao');
        if (controleMensuravel) {
            controleMensuravel.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    abrirModalValor(habito.id);
                }
            });
        }
        
        // Clique no nome/info do hábito abre estatísticas
        const cardInfo = card.querySelector('.habito-card-info');
        if (cardInfo) {
            cardInfo.addEventListener('click', () => abrirModalStats(habito.id));
        }
        
        const btnStats = card.querySelector('.btn-stats-habito');
        if (btnStats) {
            btnStats.addEventListener('click', (e) => {
                e.stopPropagation();
                abrirModalStats(habito.id);
            });
        }

        configurarSwipeParaExcluir(card, habito.id);
    }, 0);
    
    return card;
}

function configurarSwipeParaExcluir(elemento, habitoId) {
    if (window.innerWidth > 768) return; // apenas mobile
    
    let inicioX = 0;
    let inicioY = 0;
    const limiteDeslize = 60;
    const toleranciaVertical = 40;
    
    elemento.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 1) return;
        inicioX = e.touches[0].clientX;
        inicioY = e.touches[0].clientY;
    });
    
    elemento.addEventListener('touchend', (e) => {
        if (!inicioX && !inicioY) return;
        const fimX = e.changedTouches[0].clientX;
        const fimY = e.changedTouches[0].clientY;
        const deltaX = fimX - inicioX;
        const deltaY = Math.abs(fimY - inicioY);
        
        // Deslize da direita para a esquerda, com pouca variação vertical
        if (deltaX < -limiteDeslize && deltaY < toleranciaVertical) {
            confirmarExclusao(habitoId);
        }
        
        inicioX = 0;
        inicioY = 0;
    });
}

function gerarHeaderDias(datas) {
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const hoje = new Date();
    hoje.setHours(12, 0, 0, 0);
    return datas.map(data => {
        const dataNormalizada = new Date(data);
        dataNormalizada.setHours(12, 0, 0, 0);
        const isHoje = dataNormalizada.getTime() === hoje.getTime();
        return `<span class="dia-header ${isHoje ? 'dia-header-hoje' : ''}">${diasSemana[data.getDay()]}</span>`;
    }).join('');
}

function gerarDiasCalendario(habito, numDias) {
    let html = '';
    const hoje = new Date();
    hoje.setHours(12, 0, 0, 0);
    const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const historico = getHistorico(habito);

    // Sempre exibimos 7 dias (ou numDias), terminando em hoje; nenhum futuro.
    let datas = [];
    for (let i = numDias - 1; i >= 0; i--) {
        const data = new Date(hoje);
        data.setDate(data.getDate() - i);
        data.setHours(12, 0, 0, 0); // normaliza para comparar apenas data
        datas.push(data);
    }

    if (preferencias.orientacaoDias === 'hoje-esquerda') {
        datas = datas.reverse();
    }

    const podeAplicarMeta = habito.tipoFrequencia !== 'diario' && habito.tipoFrequencia !== 'personalizado';
    const metaCumprida = (habito.tipoFrequencia === 'x-semana'
        || habito.tipoFrequencia === 'x-mes'
        || habito.tipoFrequencia === 'x-em-y')
        ? metaDoPeriodoCumprida(habito) && podeAplicarMeta
        : false;

    datas.forEach((data, idx) => {
        const chave = data.toISOString().split('T')[0];
        const valor = historico[chave];
        
        let concluido = habito.tipo === 'binario' ? valor === true : valor >= habito.alvoDiario;
        const diaNumero = data.getDate();
        const diaSemana = diasSemana[data.getDay()];
        const isHoje = data.toDateString() === hoje.toDateString();
        const dataLabel = isHoje ? 'Hoje' : formatarData(data);
        const statusLabel = concluido ? 'concluído' : 'não concluído';
        // Meta mínima: acinzentamos quaisquer dias do período atual (até hoje) que ainda não foram concluídos,
        // para sinalizar que a meta já foi batida. Não exibimos futuros.
        const mesmaSemana = (() => {
            const inicioSemana = new Date(hoje);
            inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
            const fimSemana = new Date(inicioSemana);
            fimSemana.setDate(inicioSemana.getDate() + (hoje.getDay()));
            return data >= inicioSemana && data <= fimSemana;
        })();
        const mesmoMes = data.getMonth() === hoje.getMonth() && data.getFullYear() === hoje.getFullYear();
        const dentroJanelaY = (() => {
            const diasY = habito.diasY || 5;
            const inicioJanela = new Date(hoje);
            inicioJanela.setDate(inicioJanela.getDate() - (diasY - 1));
            return data >= inicioJanela && data <= hoje;
        })();
        const aplicaSemana = habito.tipoFrequencia === 'x-semana' && metaCumprida && mesmaSemana;
        const aplicaMes = habito.tipoFrequencia === 'x-mes' && metaCumprida && mesmoMes;
        const aplicaJanela = habito.tipoFrequencia === 'x-em-y' && metaCumprida && dentroJanelaY;
        // Em "Todos os dias" e "Personalizado", nunca acinzentar automaticamente as caixinhas.
        // Com a UI mostrando só dias passados + hoje, a sinalização ocorre apenas se hoje não estiver concluído.
        const metaAplicada = podeAplicarMeta && metaCumprida && !concluido && (aplicaSemana || aplicaMes || aplicaJanela);
        const metaClass = metaAplicada ? 'dia-meta-cumprida' : '';
        const classeHoje = isHoje ? 'hoje' : '';
        const disabledAttr = ''; // Meta cumprida apenas sinaliza, não bloqueia interação

        html += `
            <button type="button" class="calendario-dia ${concluido ? 'concluido' : ''} ${metaClass} ${classeHoje}" 
                 data-data="${chave}"
                 ${disabledAttr}
                 title="${dataLabel}"
                 aria-label="${diaSemana}, dia ${diaNumero}, ${statusLabel}. Clique para ${concluido ? 'desmarcar' : 'marcar'}."
                 aria-pressed="${concluido}">
                <span class="dia-numero" aria-hidden="true">${diaNumero}</span>
                <span class="dia-check" aria-hidden="true">${concluido ? '✓' : ''}</span>
            </button>
        `;
    });
    
    return {
        diasHTML: html,
        headerDias: gerarHeaderDias(datas)
    };
}

function formatarData(data) {
    const opcoes = { day: 'numeric', month: 'short' };
    return data.toLocaleDateString('pt-BR', opcoes);
}

/**
 * FUNÇÃO: renderizarHabitosHoje
 * -----------------------------
 * Renderiza a seção "Hábitos de Hoje" no Dashboard.
 * Para mensuráveis, ao clicar abre o modal de valor (consistência).
 */
function renderizarHabitosHoje() {
    const container = document.getElementById('habitosHoje');
    if (!container) return;
    
    if (!Array.isArray(habitos)) {
        console.warn('[Flui360] Estado de hábitos inválido ao renderizar hoje. Resetando.');
        habitos = normalizarHabitos([]);
    }
    
    container.innerHTML = '';
    const hoje = getHoje();
    
    habitos.forEach(habito => {
        const concluido = estaConcluidoHoje(habito);
        const sequencia = calcularSequenciaAtual(habito);
        
        const item = document.createElement('div');
        item.className = 'habito-hoje-loop';
        
        if (habito.tipo === 'binario') {
            item.innerHTML = `
                <button type="button" class="habito-hoje-check-loop ${concluido ? 'concluido' : ''}" 
                     data-id="${habito.id}"
                     style="--cor-habito: ${habito.cor}"
                     aria-label="${concluido ? 'Desmarcar' : 'Marcar'} o hábito ${habito.nome} como concluído hoje">
                    <span class="check-icon">${concluido ? '✓' : ''}</span>
                </button>
                <div class="habito-hoje-info-loop">
                    <span class="habito-hoje-nome-loop">${habito.nome}</span>
                    <span class="habito-hoje-meta">${getTextoFrequencia(habito)} • ${sequencia} dias de sequência</span>
                </div>
            `;
            
            const checkbox = item.querySelector('.habito-hoje-check-loop');
            checkbox.addEventListener('click', () => {
                toggleDiaHabito(habito.id, hoje);
            });
        } else {
            const valorHoje = getValorHoje(habito);
            item.innerHTML = `
                <button type="button" class="habito-hoje-check-loop ${concluido ? 'concluido' : ''}" 
                     data-id="${habito.id}"
                     style="--cor-habito: ${habito.cor}"
                     aria-label="Registrar valor de hoje para o hábito ${habito.nome}">
                    <span class="check-icon">${concluido ? '✓' : ''}</span>
                </button>
                <div class="habito-hoje-info-loop">
                    <span class="habito-hoje-nome-loop">${habito.nome}</span>
                    <span class="habito-hoje-meta">${valorHoje}/${habito.alvoDiario} ${habito.unidade} • ${sequencia} dias de sequência</span>
                </div>
            `;
            
            const checkbox = item.querySelector('.habito-hoje-check-loop');
            checkbox.addEventListener('click', () => {
                abrirModalValor(habito.id);
            });
        }
        
        container.appendChild(item);
    });
}

// ============================================
// 10. GRÁFICOS E ESTATÍSTICAS
// ============================================

function renderizarGraficoSemanal() {
    const container = document.getElementById('graficoSemanal');
    if (!container) return;
    
    container.innerHTML = '';
    const dadosSemanais = calcularDadosSemanais();
    
    dadosSemanais.forEach(dado => {
        const barra = document.createElement('div');
        barra.className = 'grafico-barra';
        barra.style.setProperty('--altura', `${dado.valor}%`);
        barra.setAttribute('data-valor', `${dado.valor}%`);
        container.appendChild(barra);
    });
}

function renderizarGraficoDiasConcluidos() {
    const container = document.getElementById('graficoDiasConcluidos');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (habitos.length === 0) {
        container.innerHTML = '<p class="grafico-vazio">Cadastre um hábito para visualizar este gráfico.</p>';
        return;
    }
    
    const possuiHistorico = habitos.some(h => Object.keys(getHistorico(h)).length > 0);
    if (!possuiHistorico) {
        container.innerHTML = '<p class="grafico-vazio">Nenhum registro ainda. Complete um hábito para ver os dados.</p>';
        return;
    }
    
    const maxDias = 30;
    
    habitos.forEach(habito => {
        const diasConcluidos = contarDiasConcluidos(habito, maxDias);
        const porcentagem = (diasConcluidos / maxDias) * 100;
        const valorLabel = `${diasConcluidos}`;
        
        const item = document.createElement('div');
        item.className = 'grafico-horizontal-item';
        
        item.innerHTML = `
            <span class="grafico-horizontal-label">${habito.nome}</span>
            <div class="grafico-horizontal-barra-container">
                <div class="grafico-horizontal-barra" style="width: ${porcentagem}%; background: linear-gradient(to right, ${habito.cor}, ${habito.cor}dd)">
                    <span class="grafico-horizontal-valor">${valorLabel}</span>
                </div>
            </div>
        `;
        
        container.appendChild(item);
    });
}

function renderizarGraficoMensal() {
    const container = document.getElementById('graficoMensal');
    const legenda = document.getElementById('legendaMensal');
    
    if (!container) return;
    
    container.innerHTML = '';
    if (legenda) legenda.innerHTML = '';
    
    if (habitos.length === 0) {
        container.innerHTML = '<p class="grafico-vazio">Cadastre um hábito para visualizar este gráfico.</p>';
        return;
    }
    
    const possuiHistorico = habitos.some(h => Object.keys(getHistorico(h)).length > 0);
    if (!possuiHistorico) {
        container.innerHTML = '<p class="grafico-vazio">Nenhum registro ainda. Complete um hábito para ver os dados.</p>';
        return;
    }
    
    const dadosMensais = calcularDadosMensais();
    
    dadosMensais.forEach(dado => {
        const barra = document.createElement('div');
        barra.className = 'grafico-barra';
        barra.style.setProperty('--altura', `${dado.valor}%`);
        barra.setAttribute('data-valor', `${dado.valor}%`);
        container.appendChild(barra);
        
        if (legenda) {
            const legendaItem = document.createElement('span');
            legendaItem.textContent = dado.semana;
            legenda.appendChild(legendaItem);
        }
    });
}

function atualizarEstatisticasDashboard() {
    const habitosAtivos = document.getElementById('habitosAtivos');
    const completadosHoje = document.getElementById('completadosHoje');
    const sequenciaAtual = document.getElementById('sequenciaAtual');
    const taxaConclusao = document.getElementById('taxaConclusao');
    
    if (habitosAtivos) habitosAtivos.textContent = habitos.length;
    
    if (completadosHoje) {
        const concluidos = habitos.filter(h => estaConcluidoHoje(h)).length;
        completadosHoje.textContent = concluidos;
    }
    
    if (sequenciaAtual) {
        const maiorSequencia = habitos.length > 0 
            ? Math.max(...habitos.map(h => calcularSequencia(h)))
            : 0;
        sequenciaAtual.textContent = maiorSequencia;
    }
    
    if (taxaConclusao) {
        const totalHabitos = habitos.length;
        const concluidosHoje = habitos.filter(h => estaConcluidoHoje(h)).length;
        const taxaHoje = totalHabitos > 0 ? Math.round((concluidosHoje / totalHabitos) * 100) : 0;
        taxaConclusao.textContent = `${taxaHoje}%`;
    }
    
    atualizarEstatisticasRelatorios();
}

function atualizarEstatisticasRelatorios() {
    const totalDiasAtivos = document.getElementById('totalDiasAtivos');
    const melhorSequencia = document.getElementById('melhorSequencia');
    const habitosConcluidos = document.getElementById('habitosConcluidos');
    const mediaDiaria = document.getElementById('mediaDiaria');
    
    if (totalDiasAtivos) {
        let diasAtivos = 0;
        const hoje = new Date();
        
        for (let i = 0; i < 30; i++) {
            const data = new Date(hoje);
            data.setDate(data.getDate() - i);
            const chave = data.toISOString().split('T')[0];
            const algumConcluido = habitos.some(h => {
                const val = h.historico[chave];
                return h.tipo === 'binario' ? val === true : val >= h.alvoDiario;
            });
            if (algumConcluido) diasAtivos++;
        }
        
        totalDiasAtivos.textContent = diasAtivos;
    }
    
    if (melhorSequencia) {
        const maior = habitos.length > 0 
            ? Math.max(...habitos.map(h => calcularSequencia(h)))
            : 0;
        melhorSequencia.textContent = maior;
    }
    
    if (habitosConcluidos) {
        let total = 0;
        habitos.forEach(h => total += contarDiasConcluidos(h, 30));
        habitosConcluidos.textContent = total;
    }
    
    if (mediaDiaria) {
        let totalConclusoes = 0;
        habitos.forEach(h => totalConclusoes += contarDiasConcluidos(h, 30));
        const media = totalConclusoes / 30;
        mediaDiaria.textContent = media.toFixed(1);
    }
}

// ============================================
// 11. INICIALIZAÇÃO
// ============================================

function inicializarPagina() {
    // Aplica o tema salvo nas preferências
    aplicarTema(preferencias.tema);
    
    configurarMenuHamburguer();
    configurarModais();
    configurarBoasVindas();
    configurarTeclaEscape();
    configurarModalPreferencias();
    configurarModalStats();
    configurarTooltipsInformacao();
    
    const paginaAtual = window.location.pathname.split('/').pop() || 'index.html';
    
    switch (paginaAtual) {
        case 'dashboard.html':
            renderizarGraficoSemanal();
            renderizarHabitosHoje();
            atualizarEstatisticasDashboard();
            break;
            
        case 'habitos.html':
            renderizarHabitos();
            configurarDicaHabitos();
            break;
            
        case 'relatorios.html':
            renderizarGraficoDiasConcluidos();
            renderizarGraficoMensal();
            atualizarEstatisticasRelatorios();
            
            window.addEventListener('resize', () => {
                renderizarGraficoDiasConcluidos();
            });
            break;
    }
}

/**
 * Configura o modal de preferências e o toggle de tema.
 */
function configurarModalPreferencias() {
    const modalBackdrop = document.getElementById('modalPreferenciasBackdrop');
    const btnFechar = document.getElementById('btnFecharPreferencias');
    const toggleModoEscuro = document.getElementById('toggleModoEscuro');
    const toggleOrientacaoDias = document.getElementById('toggleOrientacaoDias');
    const btnAbrirPreferencias = document.getElementById('btnAbrirPreferencias');
    
    if (btnAbrirPreferencias) {
        btnAbrirPreferencias.addEventListener('click', () => {
            abrirModal('modalPreferenciasBackdrop');
        });
    }
    
    if (btnFechar) {
        btnFechar.addEventListener('click', () => fecharModal('modalPreferenciasBackdrop'));
    }
    
    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', (e) => {
            if (e.target === modalBackdrop) fecharModal('modalPreferenciasBackdrop');
        });
    }
    
    if (toggleModoEscuro) {
        toggleModoEscuro.addEventListener('click', alternarTema);
        // Suporte a teclado para acessibilidade (Enter e Space)
        toggleModoEscuro.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                alternarTema();
            }
        });
    }

    if (toggleOrientacaoDias) {
        const ativa = preferencias.orientacaoDias === 'hoje-esquerda';
        toggleOrientacaoDias.classList.toggle('ativo', ativa);
        toggleOrientacaoDias.setAttribute('aria-checked', ativa.toString());

        const alternarOrientacao = () => {
            const novaAtiva = !toggleOrientacaoDias.classList.contains('ativo');
            toggleOrientacaoDias.classList.toggle('ativo', novaAtiva);
            toggleOrientacaoDias.setAttribute('aria-checked', novaAtiva.toString());
            preferencias.orientacaoDias = novaAtiva ? 'hoje-esquerda' : 'normal';
            salvarPreferencias(preferencias);
            renderizarHabitos();
        };

        toggleOrientacaoDias.addEventListener('click', alternarOrientacao);
        toggleOrientacaoDias.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                alternarOrientacao();
            }
        });
    }
}

/**
 * Configura o modal de estatísticas do hábito.
 */
function configurarModalStats() {
    const modalBackdrop = document.getElementById('modalStatsBackdrop');
    const btnFechar = document.getElementById('btnFecharStats');
    const btnFecharStats = document.getElementById('btnFecharModalStats');
    
    if (btnFechar) {
        btnFechar.addEventListener('click', () => fecharModal('modalStatsBackdrop'));
    }
    
    if (btnFecharStats) {
        btnFecharStats.addEventListener('click', () => fecharModal('modalStatsBackdrop'));
    }
    
    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', (e) => {
            if (e.target === modalBackdrop) fecharModal('modalStatsBackdrop');
        });
    }
}

function configurarTeclaEscape() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Fecha qualquer modal ativo via teclado para manter acessibilidade.
            fecharModalAtivo();
        }
    });
}

document.addEventListener('DOMContentLoaded', inicializarPagina);

window.addEventListener('resize', () => {
    if (window.innerWidth >= 1200) {
        const sidebar = document.getElementById('sidebar');
        const backdrop = document.getElementById('sidebarBackdrop');
        
        if (sidebar) sidebar.classList.remove('ativo');
        if (backdrop) backdrop.classList.remove('ativo');
        document.body.style.overflow = '';
    }
});

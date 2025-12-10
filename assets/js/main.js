/**
 * ============================================
 * FLUI360 - JAVASCRIPT PRINCIPAL
 * ============================================
 * 
 * ORGANIZAÇÃO DO ARQUIVO:
 * 1. Dados mockados (hábitos com histórico)
 * 2. Funções utilitárias (cálculos de sequência, progresso)
 * 3. Funções do menu hambúrguer e sidebar
 * 4. Funções de modal
 * 5. Renderização de hábitos (estilo Loop Habit Tracker)
 * 6. Renderização de gráficos (dados dinâmicos)
 * 7. Inicialização e eventos
 * 
 * ESTILO LOOP HABIT TRACKER:
 * - Todos os gráficos e estatísticas são calculados dinamicamente
 * - Baseados no histórico real de cada hábito
 * - Marcação retroativa atualiza todos os gráficos
 */

// ============================================
// 1. DADOS MOCKADOS
// ============================================

/**
 * Gera um histórico de dias para simular completions
 * Retorna um objeto com datas como chaves e boolean como valores
 */
function gerarHistorico(diasAtras, probabilidade) {
    const historico = {};
    const hoje = new Date();
    
    for (let i = 0; i < diasAtras; i++) {
        const data = new Date(hoje);
        data.setDate(data.getDate() - i);
        const chave = data.toISOString().split('T')[0];
        historico[chave] = Math.random() * 100 < probabilidade;
    }
    
    return historico;
}

/**
 * Array de hábitos mockados - ESTILO LOOP HABIT TRACKER
 * Cada hábito inclui um histórico de dias concluídos
 */
let habitos = [
    {
        id: 1,
        nome: "Beber 2L de água",
        frequencia: "diario",
        frequenciaTexto: "Diário",
        categoria: "saude",
        categoriaTexto: "Saúde",
        cor: "#10b981",
        historico: gerarHistorico(30, 85)
    },
    {
        id: 2,
        nome: "Fazer exercícios",
        frequencia: "3x-semana",
        frequenciaTexto: "3x por semana",
        categoria: "exercicio",
        categoriaTexto: "Exercício",
        cor: "#f59e0b",
        historico: gerarHistorico(30, 40)
    },
    {
        id: 3,
        nome: "Ler 30 minutos",
        frequencia: "diario",
        frequenciaTexto: "Diário",
        categoria: "estudo",
        categoriaTexto: "Estudo",
        cor: "#6366f1",
        historico: gerarHistorico(30, 90)
    },
    {
        id: 4,
        nome: "Meditar",
        frequencia: "diario",
        frequenciaTexto: "Diário",
        categoria: "saude",
        categoriaTexto: "Saúde",
        cor: "#8b5cf6",
        historico: gerarHistorico(30, 50)
    },
    {
        id: 5,
        nome: "Estudar programação",
        frequencia: "5x-semana",
        frequenciaTexto: "5x por semana",
        categoria: "estudo",
        categoriaTexto: "Estudo",
        cor: "#3b82f6",
        historico: gerarHistorico(30, 70)
    }
];

// ============================================
// 2. FUNÇÕES UTILITÁRIAS
// ============================================

function getHoje() {
    return new Date().toISOString().split('T')[0];
}

function estaConcluidoHoje(habito) {
    return habito.historico[getHoje()] === true;
}

/**
 * Calcula a sequência atual (streak) de dias consecutivos
 */
function calcularSequencia(habito) {
    let sequencia = 0;
    const hoje = new Date();
    
    for (let i = 0; i < 365; i++) {
        const data = new Date(hoje);
        data.setDate(data.getDate() - i);
        const chave = data.toISOString().split('T')[0];
        
        if (habito.historico[chave]) {
            sequencia++;
        } else {
            break;
        }
    }
    
    return sequencia;
}

/**
 * Calcula a porcentagem de conclusão no último mês
 */
function calcularProgresso(habito) {
    let concluidos = 0;
    const hoje = new Date();
    
    for (let i = 0; i < 30; i++) {
        const data = new Date(hoje);
        data.setDate(data.getDate() - i);
        const chave = data.toISOString().split('T')[0];
        
        if (habito.historico[chave]) {
            concluidos++;
        }
    }
    
    return Math.round((concluidos / 30) * 100);
}

/**
 * FUNÇÃO: calcularDadosSemanais
 * -----------------------------
 * Calcula dinamicamente a porcentagem de hábitos concluídos
 * em cada dia da última semana baseado no histórico real.
 */
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
            if (habito.historico[chave]) {
                concluidos++;
            }
        });
        
        const porcentagem = habitos.length > 0 ? Math.round((concluidos / habitos.length) * 100) : 0;
        dados.push({ dia: diaSemana, valor: porcentagem });
    }
    
    return dados;
}

/**
 * FUNÇÃO: calcularDadosMensais
 * ----------------------------
 * Calcula dinamicamente a taxa de conclusão por semana do mês
 * baseado no histórico real dos hábitos.
 */
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
                if (habito.historico[chave]) {
                    totalConcluidos++;
                }
            });
        }
        
        const porcentagem = totalPossiveis > 0 ? Math.round((totalConcluidos / totalPossiveis) * 100) : 0;
        dados.unshift({ semana: `Sem ${4 - semana}`, valor: porcentagem });
    }
    
    return dados;
}

/**
 * Conta quantos dias um hábito foi concluído no último mês
 */
function contarDiasConcluidos(habito) {
    let dias = 0;
    const hoje = new Date();
    
    for (let i = 0; i < 30; i++) {
        const data = new Date(hoje);
        data.setDate(data.getDate() - i);
        const chave = data.toISOString().split('T')[0];
        
        if (habito.historico[chave]) {
            dias++;
        }
    }
    
    return dias;
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
        if (btnHamburguer) {
            btnHamburguer.setAttribute('aria-expanded', 'false');
        }
        document.body.style.overflow = '';
    } else {
        sidebar.classList.add('ativo');
        backdrop.classList.add('ativo');
        if (btnHamburguer) {
            btnHamburguer.setAttribute('aria-expanded', 'true');
        }
        document.body.style.overflow = 'hidden';
    }
}

function configurarMenuHamburguer() {
    const btnHamburguer = document.getElementById('btnHamburguer');
    const backdrop = document.getElementById('sidebarBackdrop');
    
    if (btnHamburguer) {
        btnHamburguer.addEventListener('click', toggleSidebar);
    }
    
    if (backdrop) {
        backdrop.addEventListener('click', toggleSidebar);
    }
}

// ============================================
// 4. FUNÇÕES DE MODAL
// ============================================

function abrirModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('ativo');
        document.body.style.overflow = 'hidden';
    }
}

function fecharModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('ativo');
        document.body.style.overflow = '';
    }
}

function configurarModais() {
    // Modal de cadastro (Login)
    const btnCriarConta = document.getElementById('btnCriarConta');
    const btnFecharModal = document.getElementById('btnFecharModal');
    const modalBackdrop = document.getElementById('modalBackdrop');
    
    if (btnCriarConta) {
        btnCriarConta.addEventListener('click', () => abrirModal('modalBackdrop'));
    }
    
    if (btnFecharModal) {
        btnFecharModal.addEventListener('click', () => fecharModal('modalBackdrop'));
    }
    
    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', (e) => {
            if (e.target === modalBackdrop) {
                fecharModal('modalBackdrop');
            }
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
    
    // Modal de novo hábito (funciona em todas as páginas)
    const btnNovoHabito = document.getElementById('btnNovoHabito');
    const btnFecharModalHabito = document.getElementById('btnFecharModalHabito');
    const modalHabitoBackdrop = document.getElementById('modalHabitoBackdrop');
    
    if (btnNovoHabito) {
        btnNovoHabito.addEventListener('click', () => abrirModal('modalHabitoBackdrop'));
    }
    
    if (btnFecharModalHabito) {
        btnFecharModalHabito.addEventListener('click', () => fecharModal('modalHabitoBackdrop'));
    }
    
    if (modalHabitoBackdrop) {
        modalHabitoBackdrop.addEventListener('click', (e) => {
            if (e.target === modalHabitoBackdrop) {
                fecharModal('modalHabitoBackdrop');
            }
        });
    }
    
    const formHabito = document.getElementById('formHabito');
    if (formHabito) {
        formHabito.addEventListener('submit', (e) => {
            e.preventDefault();
            adicionarNovoHabito();
        });
    }
}

// ============================================
// 5. RENDERIZAÇÃO DE HÁBITOS - ESTILO LOOP
// ============================================

function renderizarHabitos() {
    const grid = document.getElementById('habitosGrid');
    const semHabitos = document.getElementById('semHabitos');
    
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (habitos.length === 0) {
        if (semHabitos) semHabitos.style.display = 'block';
        return;
    }
    
    if (semHabitos) semHabitos.style.display = 'none';
    
    habitos.forEach(habito => {
        const card = document.createElement('article');
        card.className = 'card-habito-loop';
        card.style.setProperty('--cor-habito', habito.cor);
        
        const sequencia = calcularSequencia(habito);
        const progresso = calcularProgresso(habito);
        const diasHTML = gerarDiasCalendario(habito, 7);
        const headerDias = gerarHeaderDias(7);
        
        card.innerHTML = `
            <div class="habito-loop-header">
                <div class="habito-loop-info">
                    <h3 class="habito-loop-nome">${habito.nome}</h3>
                    <span class="habito-loop-freq">${habito.frequenciaTexto}</span>
                </div>
                <div class="habito-loop-sequencia">
                    <span class="sequencia-numero">${sequencia}</span>
                    <span class="sequencia-label">dias</span>
                </div>
            </div>
            
            <div class="habito-loop-calendario">
                <div class="calendario-dias-header">
                    ${headerDias}
                </div>
                <div class="calendario-dias" data-habito-id="${habito.id}">
                    ${diasHTML}
                </div>
            </div>
            
            <div class="habito-loop-progresso">
                <div class="progresso-barra-container">
                    <div class="progresso-barra-loop" style="width: ${progresso}%; background-color: ${habito.cor}"></div>
                </div>
                <span class="progresso-texto-loop">${progresso}% este mês</span>
            </div>
        `;
        
        grid.appendChild(card);
    });
    
    configurarCliqueDias();
}

function gerarHeaderDias(numDias) {
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    let html = '';
    const hoje = new Date();
    
    for (let i = numDias - 1; i >= 0; i--) {
        const data = new Date(hoje);
        data.setDate(data.getDate() - i);
        html += `<span class="dia-header">${diasSemana[data.getDay()]}</span>`;
    }
    
    return html;
}

function gerarDiasCalendario(habito, numDias) {
    let html = '';
    const hoje = new Date();
    
    for (let i = numDias - 1; i >= 0; i--) {
        const data = new Date(hoje);
        data.setDate(data.getDate() - i);
        const chave = data.toISOString().split('T')[0];
        const concluido = habito.historico[chave] === true;
        const diaNumero = data.getDate();
        
        html += `
            <div class="calendario-dia ${concluido ? 'concluido' : ''}" 
                 data-data="${chave}"
                 title="${i === 0 ? 'Hoje' : (i === 1 ? 'Ontem' : formatarData(data))}">
                <span class="dia-numero">${diaNumero}</span>
                <span class="dia-check">${concluido ? '✓' : ''}</span>
            </div>
        `;
    }
    
    return html;
}

function formatarData(data) {
    const opcoes = { day: 'numeric', month: 'short' };
    return data.toLocaleDateString('pt-BR', opcoes);
}

function configurarCliqueDias() {
    const dias = document.querySelectorAll('.calendario-dia');
    
    dias.forEach(dia => {
        dia.addEventListener('click', () => {
            const container = dia.closest('.calendario-dias');
            const habitoId = parseInt(container.dataset.habitoId);
            const data = dia.dataset.data;
            
            toggleDiaHabito(habitoId, data);
        });
    });
}

/**
 * FUNÇÃO: toggleDiaHabito
 * -----------------------
 * Marca ou desmarca um dia específico para um hábito.
 * Atualiza todos os gráficos e estatísticas após a alteração.
 */
function toggleDiaHabito(habitoId, data) {
    const habito = habitos.find(h => h.id === habitoId);
    if (!habito) return;
    
    habito.historico[data] = !habito.historico[data];
    
    renderizarHabitos();
    atualizarEstatisticasDashboard();
    
    // Atualiza gráficos se estiverem na página
    renderizarGraficoSemanal();
    renderizarHabitosHoje();
}

function adicionarNovoHabito() {
    const nome = document.getElementById('nomeHabito').value;
    const frequencia = document.getElementById('frequenciaHabito').value;
    const categoria = document.getElementById('categoriaHabito').value;
    
    const frequenciasTexto = {
        'diario': 'Diário',
        '3x-semana': '3x por semana',
        '5x-semana': '5x por semana',
        'semanal': 'Semanal'
    };
    
    const categoriasTexto = {
        'saude': 'Saúde',
        'exercicio': 'Exercício',
        'alimentacao': 'Alimentação',
        'estudo': 'Estudo',
        'trabalho': 'Trabalho',
        'lazer': 'Lazer'
    };
    
    const cores = ['#10b981', '#f59e0b', '#6366f1', '#8b5cf6', '#3b82f6', '#ec4899', '#14b8a6'];
    
    const novoHabito = {
        id: habitos.length + 1,
        nome: nome,
        frequencia: frequencia,
        frequenciaTexto: frequenciasTexto[frequencia],
        categoria: categoria,
        categoriaTexto: categoriasTexto[categoria],
        cor: cores[habitos.length % cores.length],
        historico: {}
    };
    
    habitos.push(novoHabito);
    
    // Re-renderiza conforme a página atual
    renderizarHabitos();
    renderizarHabitosHoje();
    atualizarEstatisticasDashboard();
    renderizarGraficoSemanal();
    renderizarGraficoDiasConcluidos();
    
    fecharModal('modalHabitoBackdrop');
    document.getElementById('formHabito').reset();
    
    alert(`Hábito "${nome}" adicionado com sucesso!`);
}

function renderizarHabitosHoje() {
    const container = document.getElementById('habitosHoje');
    if (!container) return;
    
    container.innerHTML = '';
    const hoje = getHoje();
    
    habitos.forEach(habito => {
        const concluido = habito.historico[hoje] === true;
        const sequencia = calcularSequencia(habito);
        
        const item = document.createElement('div');
        item.className = 'habito-hoje-loop';
        
        item.innerHTML = `
            <div class="habito-hoje-check-loop ${concluido ? 'concluido' : ''}" 
                 data-id="${habito.id}"
                 style="--cor-habito: ${habito.cor}">
                <span class="check-icon">${concluido ? '✓' : ''}</span>
            </div>
            <div class="habito-hoje-info-loop">
                <span class="habito-hoje-nome-loop">${habito.nome}</span>
                <span class="habito-hoje-meta">${habito.frequenciaTexto} • ${sequencia} dias</span>
            </div>
        `;
        
        const checkbox = item.querySelector('.habito-hoje-check-loop');
        checkbox.addEventListener('click', () => {
            toggleDiaHabito(habito.id, hoje);
        });
        
        container.appendChild(item);
    });
}

// ============================================
// 6. RENDERIZAÇÃO DE GRÁFICOS - DADOS DINÂMICOS
// ============================================

/**
 * FUNÇÃO: renderizarGraficoSemanal
 * --------------------------------
 * Gráfico de barras verticais no Dashboard.
 * DADOS DINÂMICOS: Calcula porcentagem de hábitos concluídos
 * em cada dia da última semana baseado no histórico real.
 */
function renderizarGraficoSemanal() {
    const container = document.getElementById('graficoSemanal');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Calcula dados dinamicamente baseado no histórico dos hábitos
    const dadosSemanais = calcularDadosSemanais();
    
    dadosSemanais.forEach(dado => {
        const barra = document.createElement('div');
        barra.className = 'grafico-barra';
        barra.style.setProperty('--altura', `${dado.valor}%`);
        barra.setAttribute('data-valor', `${dado.valor}%`);
        container.appendChild(barra);
    });
}

/**
 * FUNÇÃO: renderizarGraficoDiasConcluidos
 * ---------------------------------------
 * Gráfico de barras horizontais na página de Relatórios.
 * DADOS DINÂMICOS: Conta dias concluídos de cada hábito no último mês.
 */
function renderizarGraficoDiasConcluidos() {
    const container = document.getElementById('graficoDiasConcluidos');
    if (!container) return;
    
    container.innerHTML = '';
    
    const maxDias = 30;
    
    habitos.forEach(habito => {
        const diasConcluidos = contarDiasConcluidos(habito);
        const porcentagem = (diasConcluidos / maxDias) * 100;
        
        const item = document.createElement('div');
        item.className = 'grafico-horizontal-item';
        
        item.innerHTML = `
            <span class="grafico-horizontal-label">${habito.nome}</span>
            <div class="grafico-horizontal-barra-container">
                <div class="grafico-horizontal-barra" style="width: ${porcentagem}%; background: linear-gradient(to right, ${habito.cor}, ${habito.cor}dd)">
                    <span class="grafico-horizontal-valor">${diasConcluidos} dias</span>
                </div>
            </div>
        `;
        
        container.appendChild(item);
    });
}

/**
 * FUNÇÃO: renderizarGraficoMensal
 * -------------------------------
 * Gráfico de barras verticais para taxa de conclusão mensal.
 * DADOS DINÂMICOS: Calcula taxa de conclusão por semana.
 */
function renderizarGraficoMensal() {
    const container = document.getElementById('graficoMensal');
    const legenda = document.getElementById('legendaMensal');
    
    if (!container) return;
    
    container.innerHTML = '';
    if (legenda) legenda.innerHTML = '';
    
    // Calcula dados dinamicamente
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

/**
 * FUNÇÃO: atualizarEstatisticasDashboard
 * --------------------------------------
 * Atualiza todos os cards de estatísticas no Dashboard.
 * DADOS DINÂMICOS: Todos os valores são calculados do histórico real.
 */
function atualizarEstatisticasDashboard() {
    const habitosAtivos = document.getElementById('habitosAtivos');
    const completadosHoje = document.getElementById('completadosHoje');
    const sequenciaAtual = document.getElementById('sequenciaAtual');
    const taxaConclusao = document.getElementById('taxaConclusao');
    
    const hoje = getHoje();
    
    if (habitosAtivos) {
        habitosAtivos.textContent = habitos.length;
    }
    
    if (completadosHoje) {
        const concluidos = habitos.filter(h => h.historico[hoje] === true).length;
        completadosHoje.textContent = concluidos;
    }
    
    if (sequenciaAtual) {
        // Maior sequência entre todos os hábitos
        const maiorSequencia = habitos.length > 0 
            ? Math.max(...habitos.map(h => calcularSequencia(h)))
            : 0;
        sequenciaAtual.textContent = maiorSequencia;
    }
    
    if (taxaConclusao) {
        // Taxa média de conclusão no último mês
        const taxaMedia = habitos.length > 0 
            ? Math.round(habitos.reduce((acc, h) => acc + calcularProgresso(h), 0) / habitos.length)
            : 0;
        taxaConclusao.textContent = `${taxaMedia}%`;
    }
    
    // Atualiza estatísticas da página de relatórios se existirem
    atualizarEstatisticasRelatorios();
}

/**
 * Atualiza as estatísticas na página de Relatórios
 */
function atualizarEstatisticasRelatorios() {
    const totalDiasAtivos = document.getElementById('totalDiasAtivos');
    const melhorSequencia = document.getElementById('melhorSequencia');
    const habitosConcluidos = document.getElementById('habitosConcluidos');
    const mediaDiaria = document.getElementById('mediaDiaria');
    
    if (totalDiasAtivos) {
        // Conta quantos dias no último mês tiveram pelo menos 1 hábito concluído
        let diasAtivos = 0;
        const hoje = new Date();
        
        for (let i = 0; i < 30; i++) {
            const data = new Date(hoje);
            data.setDate(data.getDate() - i);
            const chave = data.toISOString().split('T')[0];
            
            const algumConcluido = habitos.some(h => h.historico[chave] === true);
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
        // Total de conclusões no mês
        let total = 0;
        habitos.forEach(h => {
            total += contarDiasConcluidos(h);
        });
        habitosConcluidos.textContent = total;
    }
    
    if (mediaDiaria) {
        // Média de hábitos concluídos por dia
        let totalConclusoes = 0;
        habitos.forEach(h => {
            totalConclusoes += contarDiasConcluidos(h);
        });
        const media = totalConclusoes / 30;
        mediaDiaria.textContent = media.toFixed(1);
    }
}

// ============================================
// 7. INICIALIZAÇÃO E EVENTOS
// ============================================

function inicializarPagina() {
    configurarMenuHamburguer();
    configurarModais();
    
    const paginaAtual = window.location.pathname.split('/').pop() || 'index.html';
    
    switch (paginaAtual) {
        case 'dashboard.html':
            renderizarGraficoSemanal();
            renderizarHabitosHoje();
            atualizarEstatisticasDashboard();
            break;
            
        case 'habitos.html':
            renderizarHabitos();
            break;
            
        case 'relatorios.html':
            renderizarGraficoDiasConcluidos();
            renderizarGraficoMensal();
            atualizarEstatisticasRelatorios();
            break;
    }
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

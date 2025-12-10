/**
 * ============================================
 * FLUI360 - JAVASCRIPT PRINCIPAL
 * ============================================
 * 
 * ORGANIZAÇÃO DO ARQUIVO:
 * 1. Dados mockados (hábitos, progresso, estatísticas)
 * 2. Funções do menu hambúrguer e sidebar
 * 3. Funções de modal
 * 4. Renderização de hábitos
 * 5. Renderização de gráficos
 * 6. Inicialização e eventos
 * 
 * Comentários em português para facilitar a apresentação acadêmica.
 */

// ============================================
// 1. DADOS MOCKADOS
// ============================================

/**
 * Array de hábitos mockados
 * Cada hábito tem: id, nome, frequência, categoria, status, progresso
 * Esses dados simulam o que viria de um banco de dados real
 */
let habitos = [
    {
        id: 1,
        nome: "Beber 2L de água",
        frequencia: "diario",
        frequenciaTexto: "Diário",
        categoria: "saude",
        categoriaTexto: "Saúde",
        status: "ativo",
        progresso: 85,
        concluidoHoje: true
    },
    {
        id: 2,
        nome: "Fazer exercícios",
        frequencia: "3x-semana",
        frequenciaTexto: "3x por semana",
        categoria: "exercicio",
        categoriaTexto: "Exercício",
        status: "ativo",
        progresso: 60,
        concluidoHoje: false
    },
    {
        id: 3,
        nome: "Ler 30 minutos",
        frequencia: "diario",
        frequenciaTexto: "Diário",
        categoria: "estudo",
        categoriaTexto: "Estudo",
        status: "ativo",
        progresso: 90,
        concluidoHoje: true
    },
    {
        id: 4,
        nome: "Meditar",
        frequencia: "diario",
        frequenciaTexto: "Diário",
        categoria: "saude",
        categoriaTexto: "Saúde",
        status: "pendente",
        progresso: 45,
        concluidoHoje: false
    },
    {
        id: 5,
        nome: "Estudar programação",
        frequencia: "5x-semana",
        frequenciaTexto: "5x por semana",
        categoria: "estudo",
        categoriaTexto: "Estudo",
        status: "ativo",
        progresso: 75,
        concluidoHoje: true
    }
];

/**
 * Dados para o gráfico semanal (Dashboard)
 * Representa a porcentagem de hábitos concluídos em cada dia
 */
const dadosSemanais = [
    { dia: "Seg", valor: 80 },
    { dia: "Ter", valor: 60 },
    { dia: "Qua", valor: 100 },
    { dia: "Qui", valor: 40 },
    { dia: "Sex", valor: 75 },
    { dia: "Sáb", valor: 50 },
    { dia: "Dom", valor: 85 }
];

/**
 * Dados para o gráfico de dias concluídos por hábito (Relatórios)
 * Mostra quantos dias cada hábito foi completado no último mês
 */
const dadosDiasConcluidos = [
    { habito: "Beber água", dias: 25 },
    { habito: "Exercícios", dias: 12 },
    { habito: "Leitura", dias: 28 },
    { habito: "Meditação", dias: 15 },
    { habito: "Programação", dias: 20 }
];

/**
 * Dados para o gráfico mensal (Relatórios)
 * Taxa de conclusão por semana do mês
 */
const dadosMensais = [
    { semana: "Sem 1", valor: 65 },
    { semana: "Sem 2", valor: 72 },
    { semana: "Sem 3", valor: 80 },
    { semana: "Sem 4", valor: 78 }
];

// ============================================
// 2. MENU HAMBÚRGUER E SIDEBAR
// ============================================

/**
 * FUNÇÃO: toggleSidebar
 * ---------------------
 * Abre ou fecha a sidebar no mobile.
 * Adiciona/remove a classe 'ativo' na sidebar e no backdrop.
 * Também atualiza o atributo aria-expanded para acessibilidade.
 */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    const btnHamburguer = document.getElementById('btnHamburguer');
    
    if (!sidebar || !backdrop) return;
    
    const estaAberto = sidebar.classList.contains('ativo');
    
    if (estaAberto) {
        // Fecha a sidebar
        sidebar.classList.remove('ativo');
        backdrop.classList.remove('ativo');
        if (btnHamburguer) {
            btnHamburguer.setAttribute('aria-expanded', 'false');
        }
        // Restaura o scroll do body
        document.body.style.overflow = '';
    } else {
        // Abre a sidebar
        sidebar.classList.add('ativo');
        backdrop.classList.add('ativo');
        if (btnHamburguer) {
            btnHamburguer.setAttribute('aria-expanded', 'true');
        }
        // Impede o scroll do body quando o menu está aberto
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Configura os eventos do menu hambúrguer
 * - Clique no botão hambúrguer: abre/fecha a sidebar
 * - Clique no backdrop: fecha a sidebar
 */
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
// 3. FUNÇÕES DE MODAL
// ============================================

/**
 * Abre um modal específico
 * @param {string} modalId - ID do elemento backdrop do modal
 */
function abrirModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('ativo');
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Fecha um modal específico
 * @param {string} modalId - ID do elemento backdrop do modal
 */
function fecharModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('ativo');
        document.body.style.overflow = '';
    }
}

/**
 * Configura os eventos dos modais
 * - Modal de cadastro (página de login)
 * - Modal de novo hábito (página de hábitos)
 */
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
    
    // Formulário de cadastro (simulado)
    const formCadastro = document.getElementById('formCadastro');
    if (formCadastro) {
        formCadastro.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Conta criada com sucesso! (simulação)');
            fecharModal('modalBackdrop');
            formCadastro.reset();
        });
    }
    
    // Modal de novo hábito
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
    
    // Formulário de novo hábito
    const formHabito = document.getElementById('formHabito');
    if (formHabito) {
        formHabito.addEventListener('submit', (e) => {
            e.preventDefault();
            adicionarNovoHabito();
        });
    }
}

// ============================================
// 4. RENDERIZAÇÃO DE HÁBITOS
// ============================================

/**
 * FUNÇÃO: renderizarHabitos
 * -------------------------
 * Renderiza a lista de hábitos na tela "Meus Hábitos".
 * Cria cards para cada hábito com nome, frequência, categoria e progresso.
 * 
 * Observação para IHC:
 * - Cards sem scroll interno para melhor usabilidade
 * - Cores diferentes para cada status (ativo, pendente, concluído)
 * - Barra de progresso visual para feedback imediato
 */
function renderizarHabitos() {
    const grid = document.getElementById('habitosGrid');
    const semHabitos = document.getElementById('semHabitos');
    
    if (!grid) return;
    
    // Limpa o grid
    grid.innerHTML = '';
    
    // Verifica se há hábitos
    if (habitos.length === 0) {
        if (semHabitos) semHabitos.style.display = 'block';
        return;
    }
    
    if (semHabitos) semHabitos.style.display = 'none';
    
    // Renderiza cada hábito como um card
    habitos.forEach(habito => {
        const card = document.createElement('article');
        card.className = 'card-habito';
        
        // Define a classe do status
        let statusClasse = 'ativo';
        let statusTexto = 'Ativo';
        
        if (habito.concluidoHoje) {
            statusClasse = 'concluido';
            statusTexto = 'Concluído hoje';
        } else if (habito.status === 'pendente') {
            statusClasse = 'pendente';
            statusTexto = 'Pendente';
        }
        
        card.innerHTML = `
            <div class="card-habito-header">
                <h3 class="card-habito-nome">${habito.nome}</h3>
                <span class="card-habito-status ${statusClasse}">${statusTexto}</span>
            </div>
            <div class="card-habito-info">
                <span class="card-habito-freq">
                    <span>&#128337;</span> ${habito.frequenciaTexto}
                </span>
                <span class="card-habito-categoria">
                    <span>&#128194;</span> ${habito.categoriaTexto}
                </span>
            </div>
            <div class="card-habito-progresso">
                <div class="progresso-barra-container">
                    <div class="progresso-barra" style="width: ${habito.progresso}%"></div>
                </div>
                <span class="progresso-texto">${habito.progresso}% do objetivo mensal</span>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

/**
 * FUNÇÃO: adicionarNovoHabito
 * ---------------------------
 * Adiciona um novo hábito ao array e re-renderiza a lista.
 * Simula o comportamento de salvar em um banco de dados.
 */
function adicionarNovoHabito() {
    const nome = document.getElementById('nomeHabito').value;
    const frequencia = document.getElementById('frequenciaHabito').value;
    const categoria = document.getElementById('categoriaHabito').value;
    
    // Mapeia frequência para texto legível
    const frequenciasTexto = {
        'diario': 'Diário',
        '3x-semana': '3x por semana',
        '5x-semana': '5x por semana',
        'semanal': 'Semanal'
    };
    
    // Mapeia categoria para texto legível
    const categoriasTexto = {
        'saude': 'Saúde',
        'exercicio': 'Exercício',
        'alimentacao': 'Alimentação',
        'estudo': 'Estudo',
        'trabalho': 'Trabalho',
        'lazer': 'Lazer'
    };
    
    // Cria novo hábito
    const novoHabito = {
        id: habitos.length + 1,
        nome: nome,
        frequencia: frequencia,
        frequenciaTexto: frequenciasTexto[frequencia],
        categoria: categoria,
        categoriaTexto: categoriasTexto[categoria],
        status: 'ativo',
        progresso: 0,
        concluidoHoje: false
    };
    
    // Adiciona ao array
    habitos.push(novoHabito);
    
    // Re-renderiza a lista
    renderizarHabitos();
    
    // Fecha o modal e limpa o formulário
    fecharModal('modalHabitoBackdrop');
    document.getElementById('formHabito').reset();
    
    // Feedback para o usuário
    alert(`Hábito "${nome}" adicionado com sucesso!`);
}

/**
 * Renderiza os hábitos de hoje no Dashboard
 * Mostra uma lista simplificada com checkbox para marcar como concluído
 */
function renderizarHabitosHoje() {
    const container = document.getElementById('habitosHoje');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Filtra apenas hábitos diários ou que devem ser feitos hoje
    const habitosHoje = habitos.filter(h => h.frequencia === 'diario' || h.frequencia === '5x-semana');
    
    habitosHoje.forEach(habito => {
        const item = document.createElement('div');
        item.className = 'habito-hoje-item';
        
        item.innerHTML = `
            <div class="habito-hoje-check ${habito.concluidoHoje ? 'concluido' : ''}" 
                 data-id="${habito.id}">
                ${habito.concluidoHoje ? '&#10003;' : ''}
            </div>
            <div class="habito-hoje-info">
                <span class="habito-hoje-nome">${habito.nome}</span>
                <span class="habito-hoje-freq">${habito.frequenciaTexto}</span>
            </div>
        `;
        
        // Adiciona evento de clique no checkbox
        const checkbox = item.querySelector('.habito-hoje-check');
        checkbox.addEventListener('click', () => {
            toggleHabitoHoje(habito.id);
        });
        
        container.appendChild(item);
    });
}

/**
 * Marca/desmarca um hábito como concluído hoje
 * @param {number} id - ID do hábito
 */
function toggleHabitoHoje(id) {
    const habito = habitos.find(h => h.id === id);
    if (habito) {
        habito.concluidoHoje = !habito.concluidoHoje;
        renderizarHabitosHoje();
        atualizarEstatisticasDashboard();
    }
}

// ============================================
// 5. RENDERIZAÇÃO DE GRÁFICOS
// ============================================

/**
 * FUNÇÃO: renderizarGraficoSemanal
 * --------------------------------
 * Renderiza o gráfico de barras verticais no Dashboard.
 * 
 * Como funciona:
 * 1. Para cada dia da semana, cria uma div com classe 'grafico-barra'
 * 2. Define a altura da barra usando CSS custom property (--altura)
 * 3. O valor é exibido acima da barra usando pseudo-elemento ::after
 */
function renderizarGraficoSemanal() {
    const container = document.getElementById('graficoSemanal');
    if (!container) return;
    
    container.innerHTML = '';
    
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
 * Renderiza o gráfico de barras horizontais na página de Relatórios.
 * Mostra quantos dias cada hábito foi concluído no último mês.
 */
function renderizarGraficoDiasConcluidos() {
    const container = document.getElementById('graficoDiasConcluidos');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Encontra o valor máximo para calcular porcentagem
    const maxDias = 30; // Dias do mês
    
    dadosDiasConcluidos.forEach(dado => {
        const porcentagem = (dado.dias / maxDias) * 100;
        
        const item = document.createElement('div');
        item.className = 'grafico-horizontal-item';
        
        item.innerHTML = `
            <span class="grafico-horizontal-label">${dado.habito}</span>
            <div class="grafico-horizontal-barra-container">
                <div class="grafico-horizontal-barra" style="width: ${porcentagem}%">
                    <span class="grafico-horizontal-valor">${dado.dias} dias</span>
                </div>
            </div>
        `;
        
        container.appendChild(item);
    });
}

/**
 * FUNÇÃO: renderizarGraficoMensal
 * -------------------------------
 * Renderiza o gráfico de barras verticais para taxa de conclusão mensal.
 */
function renderizarGraficoMensal() {
    const container = document.getElementById('graficoMensal');
    const legenda = document.getElementById('legendaMensal');
    
    if (!container) return;
    
    container.innerHTML = '';
    if (legenda) legenda.innerHTML = '';
    
    dadosMensais.forEach(dado => {
        // Barra
        const barra = document.createElement('div');
        barra.className = 'grafico-barra';
        barra.style.setProperty('--altura', `${dado.valor}%`);
        barra.setAttribute('data-valor', `${dado.valor}%`);
        container.appendChild(barra);
        
        // Legenda
        if (legenda) {
            const legendaItem = document.createElement('span');
            legendaItem.textContent = dado.semana;
            legenda.appendChild(legendaItem);
        }
    });
}

/**
 * Atualiza as estatísticas exibidas no Dashboard
 */
function atualizarEstatisticasDashboard() {
    const habitosAtivos = document.getElementById('habitosAtivos');
    const completadosHoje = document.getElementById('completadosHoje');
    
    if (habitosAtivos) {
        habitosAtivos.textContent = habitos.filter(h => h.status === 'ativo').length;
    }
    
    if (completadosHoje) {
        completadosHoje.textContent = habitos.filter(h => h.concluidoHoje).length;
    }
}

// ============================================
// 6. INICIALIZAÇÃO E EVENTOS
// ============================================

/**
 * FUNÇÃO: inicializarPagina
 * -------------------------
 * Função principal que é executada quando a página carrega.
 * Detecta qual página está sendo exibida e inicializa os componentes necessários.
 */
function inicializarPagina() {
    // Configura o menu hambúrguer (presente em todas as páginas do app)
    configurarMenuHamburguer();
    
    // Configura os modais
    configurarModais();
    
    // Detecta a página atual e inicializa componentes específicos
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
            break;
    }
}

// Aguarda o DOM carregar completamente antes de inicializar
document.addEventListener('DOMContentLoaded', inicializarPagina);

/**
 * Fecha a sidebar ao redimensionar para desktop
 * Evita que a sidebar fique "presa" aberta após redimensionar
 */
window.addEventListener('resize', () => {
    if (window.innerWidth >= 1200) {
        const sidebar = document.getElementById('sidebar');
        const backdrop = document.getElementById('sidebarBackdrop');
        
        if (sidebar) sidebar.classList.remove('ativo');
        if (backdrop) backdrop.classList.remove('ativo');
        document.body.style.overflow = '';
    }
});

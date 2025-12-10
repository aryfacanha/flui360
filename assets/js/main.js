/**
 * ============================================
 * FLUI360 - JAVASCRIPT PRINCIPAL
 * ============================================
 * 
 * ORGANIZAÇÃO DO ARQUIVO:
 * 1. Estrutura de dados dos hábitos (localStorage)
 * 2. Funções utilitárias (cálculos de sequência, progresso)
 * 3. Funções do menu hambúrguer e sidebar
 * 4. Funções de modal
 * 5. CRUD de hábitos (criar, editar, excluir)
 * 6. Renderização de hábitos (cards avançados)
 * 7. Renderização de gráficos
 * 8. Inicialização e eventos
 * 
 * ESTILO LOOP HABIT TRACKER:
 * - Tipos de hábito: Binário (Sim/Não) e Mensurável
 * - Frequência dinâmica com campos condicionais
 * - Sistema de lembretes com seleção de dias da semana
 * - Persistência em localStorage
 */

// ============================================
// 1. ESTRUTURA DE DADOS DOS HÁBITOS
// ============================================

/**
 * ESTRUTURA DE UM HÁBITO:
 * {
 *   id: number,                    // ID único
 *   nome: string,                  // Nome do hábito
 *   tipo: 'binario' | 'mensuravel',// Tipo do hábito
 *   cor: string,                   // Cor em hexadecimal
 *   
 *   // Campos para hábitos mensuráveis
 *   unidade: string,               // Ex: "litros", "páginas"
 *   alvoDiario: number,            // Meta diária
 *   
 *   // Frequência
 *   tipoFrequencia: string,        // 'diario', 'x-semana', 'x-mes', 'x-em-y'
 *   vezesX: number,                // Valor de X (vezes)
 *   diasY: number,                 // Valor de Y (dias) para 'x-em-y'
 *   
 *   // Lembretes
 *   lembreteAtivo: boolean,        // Se lembrete está ativo
 *   horaLembrete: string,          // Horário do lembrete (HH:MM)
 *   diasLembrete: string[],        // Array de dias: ['seg', 'ter', ...]
 *   
 *   // Histórico de conclusões
 *   historico: {                   // Objeto com datas como chaves
 *     'YYYY-MM-DD': boolean | number  // true/false para binário, número para mensurável
 *   }
 * }
 */

const STORAGE_KEY = 'flui360_habitos';

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
    return [
        {
            id: 1,
            nome: "Beber água",
            tipo: "mensuravel",
            cor: "#10b981",
            unidade: "litros",
            alvoDiario: 2,
            tipoFrequencia: "diario",
            vezesX: 1,
            diasY: 1,
            lembreteAtivo: true,
            horaLembrete: "08:00",
            diasLembrete: ["seg", "ter", "qua", "qui", "sex"],
            historico: gerarHistorico(30, 85, "mensuravel", 2)
        },
        {
            id: 2,
            nome: "Fazer exercícios",
            tipo: "binario",
            cor: "#f59e0b",
            unidade: "",
            alvoDiario: 1,
            tipoFrequencia: "x-semana",
            vezesX: 3,
            diasY: 1,
            lembreteAtivo: true,
            horaLembrete: "07:00",
            diasLembrete: ["seg", "qua", "sex"],
            historico: gerarHistorico(30, 40)
        },
        {
            id: 3,
            nome: "Ler",
            tipo: "mensuravel",
            cor: "#6366f1",
            unidade: "páginas",
            alvoDiario: 20,
            tipoFrequencia: "diario",
            vezesX: 1,
            diasY: 1,
            lembreteAtivo: false,
            horaLembrete: "21:00",
            diasLembrete: [],
            historico: gerarHistorico(30, 90, "mensuravel", 20)
        },
        {
            id: 4,
            nome: "Meditar",
            tipo: "binario",
            cor: "#8b5cf6",
            unidade: "",
            alvoDiario: 1,
            tipoFrequencia: "diario",
            vezesX: 1,
            diasY: 1,
            lembreteAtivo: true,
            horaLembrete: "06:30",
            diasLembrete: ["dom", "seg", "ter", "qua", "qui", "sex", "sab"],
            historico: gerarHistorico(30, 50)
        },
        {
            id: 5,
            nome: "Estudar programação",
            tipo: "mensuravel",
            cor: "#3b82f6",
            unidade: "minutos",
            alvoDiario: 60,
            tipoFrequencia: "x-semana",
            vezesX: 5,
            diasY: 1,
            lembreteAtivo: false,
            horaLembrete: "19:00",
            diasLembrete: [],
            historico: gerarHistorico(30, 70, "mensuravel", 60)
        }
    ];
}

function carregarHabitos() {
    const dados = localStorage.getItem(STORAGE_KEY);
    if (dados) {
        try {
            return JSON.parse(dados);
        } catch (e) {
            console.error("Erro ao carregar hábitos do localStorage:", e);
        }
    }
    return getHabitosPadrao();
}

function salvarHabitos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habitos));
}

let habitos = carregarHabitos();

// ============================================
// 2. FUNÇÕES UTILITÁRIAS
// ============================================

function getHoje() {
    return new Date().toISOString().split('T')[0];
}

function estaConcluidoHoje(habito) {
    const valor = habito.historico[getHoje()];
    if (habito.tipo === 'binario') {
        return valor === true;
    } else {
        return valor >= habito.alvoDiario;
    }
}

function getValorHoje(habito) {
    return habito.historico[getHoje()] || 0;
}

function calcularSequencia(habito) {
    let sequencia = 0;
    const hoje = new Date();
    
    for (let i = 0; i < 365; i++) {
        const data = new Date(hoje);
        data.setDate(data.getDate() - i);
        const chave = data.toISOString().split('T')[0];
        const valor = habito.historico[chave];
        
        let concluido = false;
        if (habito.tipo === 'binario') {
            concluido = valor === true;
        } else {
            concluido = valor >= habito.alvoDiario;
        }
        
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
    
    for (let i = 0; i < 30; i++) {
        const data = new Date(hoje);
        data.setDate(data.getDate() - i);
        const chave = data.toISOString().split('T')[0];
        const valor = habito.historico[chave];
        
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
            const valor = habito.historico[chave];
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
                const valor = habito.historico[chave];
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

function contarDiasConcluidos(habito) {
    let dias = 0;
    const hoje = new Date();
    
    for (let i = 0; i < 30; i++) {
        const data = new Date(hoje);
        data.setDate(data.getDate() - i);
        const chave = data.toISOString().split('T')[0];
        const valor = habito.historico[chave];
        
        if (habito.tipo === 'binario') {
            if (valor === true) dias++;
        } else {
            if (valor >= habito.alvoDiario) dias++;
        }
    }
    
    return dias;
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
    
    const todosDias = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
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

let habitoParaExcluir = null;

function configurarModais() {
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
    
    const formCadastro = document.getElementById('formCadastro');
    if (formCadastro) {
        formCadastro.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Conta criada com sucesso! (simulação)');
            fecharModal('modalBackdrop');
            formCadastro.reset();
        });
    }
    
    // Modal de hábito avançado
    const btnNovoHabito = document.getElementById('btnNovoHabito');
    const btnFecharModalHabito = document.getElementById('btnFecharModalHabito');
    const btnCancelarHabito = document.getElementById('btnCancelarHabito');
    const modalHabitoBackdrop = document.getElementById('modalHabitoBackdrop');
    
    if (btnNovoHabito) {
        btnNovoHabito.addEventListener('click', () => {
            limparFormularioHabito();
            document.getElementById('tituloModalHabito').textContent = 'Novo Hábito';
            document.getElementById('btnSalvarHabito').textContent = 'Salvar Hábito';
            abrirModal('modalHabitoBackdrop');
        });
    }
    
    if (btnFecharModalHabito) btnFecharModalHabito.addEventListener('click', () => fecharModal('modalHabitoBackdrop'));
    if (btnCancelarHabito) btnCancelarHabito.addEventListener('click', () => fecharModal('modalHabitoBackdrop'));
    
    if (modalHabitoBackdrop) {
        modalHabitoBackdrop.addEventListener('click', (e) => {
            if (e.target === modalHabitoBackdrop) fecharModal('modalHabitoBackdrop');
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
    
    // Configurar campos dinâmicos do formulário
    configurarCamposDinamicos();
}

// ============================================
// 5. CRUD DE HÁBITOS
// ============================================

/**
 * FUNÇÃO: configurarCamposDinamicos
 * ---------------------------------
 * Configura a exibição condicional de campos no formulário:
 * - Campos de mensurável (unidade, alvo) aparecem quando tipo = 'mensuravel'
 * - Campos de frequência (X, Y) aparecem conforme a opção selecionada
 * - Configuração de lembrete aparece quando toggle está ativo
 */
function configurarCamposDinamicos() {
    // Tipo do hábito (binário vs mensurável)
    const radiosTipo = document.querySelectorAll('input[name="tipoHabito"]');
    const camposMensuravel = document.getElementById('camposMensuravel');
    
    radiosTipo.forEach(radio => {
        radio.addEventListener('change', () => {
            if (camposMensuravel) {
                camposMensuravel.style.display = radio.value === 'mensuravel' ? 'block' : 'none';
            }
        });
    });
    
    // Frequência dinâmica
    const selectFrequencia = document.getElementById('tipoFrequencia');
    const camposXSemana = document.getElementById('camposXSemana');
    const camposXMes = document.getElementById('camposXMes');
    const camposXEmY = document.getElementById('camposXEmY');
    
    if (selectFrequencia) {
        selectFrequencia.addEventListener('change', () => {
            if (camposXSemana) camposXSemana.style.display = 'none';
            if (camposXMes) camposXMes.style.display = 'none';
            if (camposXEmY) camposXEmY.style.display = 'none';
            
            switch (selectFrequencia.value) {
                case 'x-semana':
                    if (camposXSemana) camposXSemana.style.display = 'flex';
                    break;
                case 'x-mes':
                    if (camposXMes) camposXMes.style.display = 'flex';
                    break;
                case 'x-em-y':
                    if (camposXEmY) camposXEmY.style.display = 'flex';
                    break;
            }
        });
    }
    
    // Toggle de lembrete
    const toggleLembrete = document.getElementById('lembreteAtivo');
    const lembreteConfig = document.getElementById('lembreteConfig');
    const lembreteLabel = document.getElementById('lembreteLabel');
    
    if (toggleLembrete) {
        toggleLembrete.addEventListener('change', () => {
            if (lembreteConfig) {
                lembreteConfig.style.display = toggleLembrete.checked ? 'block' : 'none';
            }
            if (lembreteLabel) {
                lembreteLabel.textContent = toggleLembrete.checked ? 'Habilitado' : 'Desabilitado';
            }
        });
    }
    
    // Botões de dias da semana
    const diasBtns = document.querySelectorAll('.dia-semana-btn');
    diasBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('ativo');
            atualizarBotaoToggleDias();
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
        });
    }
}

function atualizarBotaoToggleDias() {
    const btnToggleDias = document.getElementById('btnToggleDias');
    if (!btnToggleDias) return;
    
    const diasAtivos = document.querySelectorAll('.dia-semana-btn.ativo');
    const todosDias = document.querySelectorAll('.dia-semana-btn');
    
    if (diasAtivos.length === todosDias.length) {
        btnToggleDias.textContent = 'Limpar todos';
    } else {
        btnToggleDias.textContent = 'Selecionar todos';
    }
}

function limparFormularioHabito() {
    const form = document.getElementById('formHabito');
    if (!form) return;
    
    form.reset();
    document.getElementById('habitoId').value = '';
    
    // Reset tipo
    document.querySelector('input[name="tipoHabito"][value="binario"]').checked = true;
    const camposMensuravel = document.getElementById('camposMensuravel');
    if (camposMensuravel) camposMensuravel.style.display = 'none';
    
    // Reset frequência
    document.getElementById('tipoFrequencia').value = 'diario';
    document.getElementById('camposXSemana').style.display = 'none';
    document.getElementById('camposXMes').style.display = 'none';
    document.getElementById('camposXEmY').style.display = 'none';
    
    // Reset lembretes
    document.getElementById('lembreteAtivo').checked = false;
    document.getElementById('lembreteConfig').style.display = 'none';
    document.getElementById('lembreteLabel').textContent = 'Desabilitado';
    document.querySelectorAll('.dia-semana-btn').forEach(btn => btn.classList.remove('ativo'));
    atualizarBotaoToggleDias();
    
    // Reset cor (primeira opção)
    document.querySelector('input[name="corHabito"][value="#10b981"]').checked = true;
}

/**
 * FUNÇÃO: preencherFormularioHabito
 * ---------------------------------
 * Preenche o formulário com os dados de um hábito existente para edição.
 */
function preencherFormularioHabito(habito) {
    document.getElementById('habitoId').value = habito.id;
    document.getElementById('nomeHabito').value = habito.nome;
    
    // Tipo
    document.querySelector(`input[name="tipoHabito"][value="${habito.tipo}"]`).checked = true;
    const camposMensuravel = document.getElementById('camposMensuravel');
    if (camposMensuravel) {
        camposMensuravel.style.display = habito.tipo === 'mensuravel' ? 'block' : 'none';
    }
    if (habito.tipo === 'mensuravel') {
        document.getElementById('alvoDiario').value = habito.alvoDiario || 1;
        document.getElementById('unidadeHabito').value = habito.unidade || '';
    }
    
    // Frequência
    document.getElementById('tipoFrequencia').value = habito.tipoFrequencia;
    document.getElementById('camposXSemana').style.display = 'none';
    document.getElementById('camposXMes').style.display = 'none';
    document.getElementById('camposXEmY').style.display = 'none';
    
    switch (habito.tipoFrequencia) {
        case 'x-semana':
            document.getElementById('camposXSemana').style.display = 'flex';
            document.getElementById('vezesXSemana').value = habito.vezesX || 3;
            break;
        case 'x-mes':
            document.getElementById('camposXMes').style.display = 'flex';
            document.getElementById('vezesXMes').value = habito.vezesX || 10;
            break;
        case 'x-em-y':
            document.getElementById('camposXEmY').style.display = 'flex';
            document.getElementById('vezesX').value = habito.vezesX || 3;
            document.getElementById('diasY').value = habito.diasY || 5;
            break;
    }
    
    // Lembretes
    const toggleLembrete = document.getElementById('lembreteAtivo');
    const lembreteConfig = document.getElementById('lembreteConfig');
    const lembreteLabel = document.getElementById('lembreteLabel');
    
    toggleLembrete.checked = habito.lembreteAtivo;
    lembreteConfig.style.display = habito.lembreteAtivo ? 'block' : 'none';
    lembreteLabel.textContent = habito.lembreteAtivo ? 'Habilitado' : 'Desabilitado';
    document.getElementById('horaLembrete').value = habito.horaLembrete || '08:00';
    
    document.querySelectorAll('.dia-semana-btn').forEach(btn => {
        btn.classList.remove('ativo');
        if (habito.diasLembrete && habito.diasLembrete.includes(btn.dataset.dia)) {
            btn.classList.add('ativo');
        }
    });
    atualizarBotaoToggleDias();
    
    // Cor
    const corRadio = document.querySelector(`input[name="corHabito"][value="${habito.cor}"]`);
    if (corRadio) corRadio.checked = true;
}

/**
 * FUNÇÃO: salvarHabito
 * --------------------
 * Cria um novo hábito ou atualiza um existente.
 */
function salvarHabito() {
    const idInput = document.getElementById('habitoId').value;
    const isEdicao = idInput !== '';
    
    const tipo = document.querySelector('input[name="tipoHabito"]:checked').value;
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
            vezesX = parseInt(document.getElementById('vezesX').value) || 3;
            diasY = parseInt(document.getElementById('diasY').value) || 5;
            break;
    }
    
    // Lembretes
    const lembreteAtivo = document.getElementById('lembreteAtivo').checked;
    const horaLembrete = document.getElementById('horaLembrete').value || '08:00';
    const diasLembrete = [];
    document.querySelectorAll('.dia-semana-btn.ativo').forEach(btn => {
        diasLembrete.push(btn.dataset.dia);
    });
    
    if (isEdicao) {
        // Atualiza hábito existente
        const id = parseInt(idInput);
        const habito = habitos.find(h => h.id === id);
        if (habito) {
            habito.nome = nome;
            habito.tipo = tipo;
            habito.cor = cor;
            habito.unidade = unidade;
            habito.alvoDiario = alvoDiario;
            habito.tipoFrequencia = tipoFrequencia;
            habito.vezesX = vezesX;
            habito.diasY = diasY;
            habito.lembreteAtivo = lembreteAtivo;
            habito.horaLembrete = horaLembrete;
            habito.diasLembrete = diasLembrete;
        }
    } else {
        // Cria novo hábito
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
    
    // Re-renderiza conforme a página
    renderizarHabitos();
    renderizarHabitosHoje();
    atualizarEstatisticasDashboard();
    renderizarGraficoSemanal();
    renderizarGraficoDiasConcluidos();
    renderizarGraficoMensal();
}

/**
 * FUNÇÃO: editarHabito
 * --------------------
 * Abre o modal com os dados do hábito para edição.
 */
function editarHabito(id) {
    const habito = habitos.find(h => h.id === id);
    if (!habito) return;
    
    limparFormularioHabito();
    preencherFormularioHabito(habito);
    
    document.getElementById('tituloModalHabito').textContent = 'Editar Hábito';
    document.getElementById('btnSalvarHabito').textContent = 'Atualizar Hábito';
    abrirModal('modalHabitoBackdrop');
}

/**
 * FUNÇÃO: confirmarExclusao
 * -------------------------
 * Abre modal de confirmação antes de excluir.
 */
function confirmarExclusao(id) {
    const habito = habitos.find(h => h.id === id);
    if (!habito) return;
    
    habitoParaExcluir = id;
    document.getElementById('nomeHabitoExcluir').textContent = habito.nome;
    abrirModal('modalExcluirBackdrop');
}

/**
 * FUNÇÃO: excluirHabito
 * ---------------------
 * Remove um hábito da lista.
 */
function excluirHabito(id) {
    habitos = habitos.filter(h => h.id !== id);
    salvarHabitos();
    
    renderizarHabitos();
    renderizarHabitosHoje();
    atualizarEstatisticasDashboard();
    renderizarGraficoSemanal();
    renderizarGraficoDiasConcluidos();
    renderizarGraficoMensal();
}

/**
 * FUNÇÃO: toggleDiaHabito
 * -----------------------
 * Alterna a conclusão de um hábito em uma data específica.
 */
function toggleDiaHabito(habitoId, data) {
    const habito = habitos.find(h => h.id === habitoId);
    if (!habito) return;
    
    if (habito.tipo === 'binario') {
        habito.historico[data] = !habito.historico[data];
    }
    
    salvarHabitos();
    renderizarHabitos();
    renderizarHabitosHoje();
    atualizarEstatisticasDashboard();
    renderizarGraficoSemanal();
}

/**
 * FUNÇÃO: atualizarValorMensuravel
 * --------------------------------
 * Atualiza o valor registrado para um hábito mensurável.
 */
function atualizarValorMensuravel(habitoId, valor) {
    const habito = habitos.find(h => h.id === habitoId);
    if (!habito) return;
    
    const hoje = getHoje();
    habito.historico[hoje] = parseFloat(valor) || 0;
    
    salvarHabitos();
    renderizarHabitos();
    atualizarEstatisticasDashboard();
    renderizarGraficoSemanal();
}

// ============================================
// 6. RENDERIZAÇÃO DE HÁBITOS
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
        const card = criarCardHabitoAvancado(habito);
        grid.appendChild(card);
    });
}

/**
 * FUNÇÃO: criarCardHabitoAvancado
 * -------------------------------
 * Cria o HTML de um card de hábito com todas as informações:
 * tipo, frequência, lembretes, e controles de conclusão.
 */
function criarCardHabitoAvancado(habito) {
    const card = document.createElement('article');
    card.className = 'card-habito-avancado';
    card.style.setProperty('--cor-habito', habito.cor);
    
    const tipoBadge = habito.tipo === 'binario' ? 'Sim/Não' : 'Mensurável';
    const frequenciaTexto = getTextoFrequencia(habito);
    
    let lembreteHTML = '';
    if (habito.lembreteAtivo) {
        const diasTexto = getTextoDiasLembrete(habito.diasLembrete);
        lembreteHTML = `<span title="Lembrete">&#128276; ${habito.horaLembrete}${diasTexto ? ' (' + diasTexto + ')' : ''}</span>`;
    }
    
    // Controle de conclusão
    let controleHTML = '';
    const hoje = getHoje();
    
    if (habito.tipo === 'binario') {
        const concluido = habito.historico[hoje] === true;
        controleHTML = `
            <div class="habito-card-controle">
                <div class="controle-binario" onclick="toggleDiaHabito(${habito.id}, '${hoje}')">
                    <div class="checkbox-grande ${concluido ? 'concluido' : ''}" style="--cor-habito: ${habito.cor}">
                        <span class="check-icon">${concluido ? '✓' : ''}</span>
                    </div>
                    <span class="controle-binario-texto ${concluido ? 'concluido' : ''}">${concluido ? 'Concluído hoje!' : 'Marcar como concluído'}</span>
                </div>
            </div>
        `;
    } else {
        const valorHoje = habito.historico[hoje] || 0;
        const alvo = habito.alvoDiario;
        const porcentagem = Math.min((valorHoje / alvo) * 100, 100);
        const atingido = valorHoje >= alvo;
        
        controleHTML = `
            <div class="habito-card-controle">
                <div class="controle-mensuravel">
                    <input type="number" 
                           class="input-valor-dia" 
                           value="${valorHoje}" 
                           min="0" 
                           step="0.5"
                           onchange="atualizarValorMensuravel(${habito.id}, this.value)"
                           aria-label="Valor do dia">
                    <div class="progresso-mensuravel">
                        <span class="progresso-texto-mensuravel ${atingido ? 'atingido' : ''}">${valorHoje}/${alvo} ${habito.unidade}</span>
                        <div class="progresso-barra-mensuravel">
                            <div class="progresso-barra-preenchido ${atingido ? 'atingido' : ''}" style="width: ${porcentagem}%; background-color: ${habito.cor}"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Calendário
    const diasHTML = gerarDiasCalendario(habito, 7);
    const headerDias = gerarHeaderDias(7);
    
    card.innerHTML = `
        <div class="habito-card-header">
            <div class="habito-card-info">
                <h3 class="habito-card-nome">
                    ${habito.nome}
                    <span class="habito-tipo-badge">${tipoBadge}</span>
                </h3>
                <div class="habito-card-meta">
                    <span>&#128197; ${frequenciaTexto}</span>
                    ${lembreteHTML}
                </div>
            </div>
            <div class="habito-card-acoes">
                <button class="btn-icone btn-editar" onclick="editarHabito(${habito.id})" aria-label="Editar hábito" title="Editar">&#9998;</button>
                <button class="btn-icone btn-excluir" onclick="confirmarExclusao(${habito.id})" aria-label="Excluir hábito" title="Excluir">&#128465;</button>
            </div>
        </div>
        
        ${controleHTML}
        
        <div class="habito-card-calendario">
            <div class="calendario-dias-header">${headerDias}</div>
            <div class="calendario-dias" data-habito-id="${habito.id}">${diasHTML}</div>
        </div>
    `;
    
    // Adiciona eventos de clique nos dias
    setTimeout(() => {
        const dias = card.querySelectorAll('.calendario-dia');
        dias.forEach(dia => {
            dia.addEventListener('click', () => {
                toggleDiaHabito(habito.id, dia.dataset.data);
            });
        });
    }, 0);
    
    return card;
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
        const valor = habito.historico[chave];
        
        let concluido = false;
        if (habito.tipo === 'binario') {
            concluido = valor === true;
        } else {
            concluido = valor >= habito.alvoDiario;
        }
        
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

function renderizarHabitosHoje() {
    const container = document.getElementById('habitosHoje');
    if (!container) return;
    
    container.innerHTML = '';
    const hoje = getHoje();
    
    habitos.forEach(habito => {
        const concluido = estaConcluidoHoje(habito);
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
                <span class="habito-hoje-meta">${getTextoFrequencia(habito)} • ${sequencia} dias</span>
            </div>
        `;
        
        const checkbox = item.querySelector('.habito-hoje-check-loop');
        checkbox.addEventListener('click', () => {
            if (habito.tipo === 'binario') {
                toggleDiaHabito(habito.id, hoje);
            }
        });
        
        container.appendChild(item);
    });
}

// ============================================
// 7. RENDERIZAÇÃO DE GRÁFICOS
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

function renderizarGraficoMensal() {
    const container = document.getElementById('graficoMensal');
    const legenda = document.getElementById('legendaMensal');
    
    if (!container) return;
    
    container.innerHTML = '';
    if (legenda) legenda.innerHTML = '';
    
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
    
    const hoje = getHoje();
    
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
        const taxaMedia = habitos.length > 0 
            ? Math.round(habitos.reduce((acc, h) => acc + calcularProgresso(h), 0) / habitos.length)
            : 0;
        taxaConclusao.textContent = `${taxaMedia}%`;
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
            const algumConcluido = habitos.some(h => estaConcluidoHoje(h));
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
        habitos.forEach(h => total += contarDiasConcluidos(h));
        habitosConcluidos.textContent = total;
    }
    
    if (mediaDiaria) {
        let totalConclusoes = 0;
        habitos.forEach(h => totalConclusoes += contarDiasConcluidos(h));
        const media = totalConclusoes / 30;
        mediaDiaria.textContent = media.toFixed(1);
    }
}

// ============================================
// 8. INICIALIZAÇÃO E EVENTOS
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

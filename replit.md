# Flui360 - Dashboard de Hábitos

## Visão Geral
Flui360 é um aplicativo web estático de gerenciamento de hábitos, desenvolvido para apresentação em uma disciplina de Interação Humano-Computador (IHC). O projeto utiliza apenas HTML, CSS e JavaScript puro, sem frameworks ou backend.

**Design inspirado no Loop Habit Tracker** com foco em:
- Área de marcação de hábitos proeminente
- Visualização de histórico por calendário
- Marcação retroativa de dias
- Indicador de sequência (streak)
- **CRUD completo de hábitos**
- **Tipos de hábito: Binário e Mensurável**
- **Sistema de lembretes configuráveis**

## Estrutura do Projeto

```
/
├── index.html          # Página de login
├── dashboard.html      # Dashboard principal (com FAB)
├── habitos.html        # Tela de gerenciamento de hábitos (com FAB + CRUD)
├── relatorios.html     # Tela de relatórios e estatísticas (com FAB)
├── assets/
│   ├── css/
│   │   └── style.css   # Estilos globais (mobile-first + estilo Loop)
│   ├── js/
│   │   └── main.js     # JavaScript principal com CRUD e sistema de histórico
│   └── img/            # Pasta para imagens (se necessário)
└── attached_assets/    # Arquivos anexados do projeto
```

## Funcionalidades

### Tela de Login (index.html)
- Formulário de login com validação HTML5
- Modal de cadastro (simulado)
- Redirecionamento para o dashboard

### Dashboard (dashboard.html)
- Resumo de hábitos (cards de estatísticas dinâmicas)
- Gráfico de progresso semanal
- Lista de hábitos do dia com checkboxes estilo Loop
- FAB (Floating Action Button) para adicionar hábitos
- Sidebar de navegação

### Meus Hábitos (habitos.html) - ESTILO LOOP HABIT TRACKER

#### CRUD Completo
- **Criar**: Formulário avançado com todos os campos
- **Editar**: Botão de edição em cada card (ícone de lápis)
- **Excluir**: Botão de exclusão com confirmação (ícone de lixeira)
- **Persistência**: Dados salvos em localStorage

#### Tipos de Hábito
1. **Binário (Sim/Não)**: Checkbox grande para marcar como concluído
2. **Mensurável**: Input numérico + barra de progresso + meta diária
   - Campos: Alvo diário, Unidade (litros, páginas, minutos, etc.)
   - Exibe progresso: "12/20 páginas" com barra visual

#### Frequência Dinâmica
- **Todos os dias**: Frequência padrão
- **X vezes por semana**: Campo para definir número de vezes (1-7)
- **X vezes por mês**: Campo para definir número de vezes (1-31)
- **X vezes em Y dias**: Dois campos para personalização

#### Sistema de Lembretes
- **Toggle On/Off**: Ativa/desativa lembretes
- **Horário**: Input de tempo (HH:MM)
- **Dias da semana**: Botões clicáveis para cada dia
  - Botão "Selecionar todos" / "Limpar todos"
  - Exibição: "Seg-Sex", "Todos os dias", ou lista de dias

#### Interface dos Cards
- Nome do hábito + badge de tipo (SIM/NÃO ou MENSURÁVEL)
- Frequência configurada (ex: "3x por semana")
- Lembrete com horário e dias (ex: "08:00 (Seg-Sex)")
- Controle de conclusão adequado ao tipo
- Calendário de 7 dias com histórico
- Botões de editar e excluir

### Relatórios (relatorios.html)
- Gráfico horizontal de dias concluídos por hábito (dados reais)
- Gráfico de taxa de conclusão mensal
- Resumo estatístico do mês
- Explicações textuais para IHC
- FAB para adicionar hábitos

## Responsividade

O projeto segue a abordagem **mobile-first** com breakpoints:
- **Mobile**: até 767px (menu hambúrguer + 1 coluna)
- **Tablet**: 768px - 1199px (2 colunas de cards)
- **Desktop**: 1200px+ (sidebar fixa + 3 colunas)

## Como Executar

O projeto é estático e pode ser executado com qualquer servidor HTTP. No Replit, o workflow está configurado para servir os arquivos na porta 5000.

## Tecnologias

- HTML5 (semântico, com validação)
- CSS3 (variáveis CSS, Flexbox, Grid, animações)
- JavaScript ES6+ (vanilla, sem frameworks)
- localStorage para persistência de dados

## Estrutura de Dados (main.js)

```javascript
{
  id: number,                    // ID único
  nome: string,                  // Nome do hábito
  tipo: 'binario' | 'mensuravel',// Tipo do hábito
  cor: string,                   // Cor em hexadecimal
  
  // Campos para hábitos mensuráveis
  unidade: string,               // Ex: "litros", "páginas"
  alvoDiario: number,            // Meta diária
  
  // Frequência
  tipoFrequencia: string,        // 'diario', 'x-semana', 'x-mes', 'x-em-y'
  vezesX: number,                // Valor de X (vezes)
  diasY: number,                 // Valor de Y (dias) para 'x-em-y'
  
  // Lembretes
  lembreteAtivo: boolean,        // Se lembrete está ativo
  horaLembrete: string,          // Horário do lembrete (HH:MM)
  diasLembrete: string[],        // Array de dias: ['seg', 'ter', ...]
  
  // Histórico de conclusões
  historico: {                   // Objeto com datas como chaves
    'YYYY-MM-DD': boolean | number  // true/false para binário, número para mensurável
  }
}
```

## Fluxo de Modais

### FAB Global (Novo Hábito)
1. Clique no FAB → **Modal de Seleção de Tipo**
2. Escolhe "Sim/Não" ou "Mensurável" → **Modal do Formulário Principal**
3. O tipo fica fixo e não pode ser alterado na edição

### Hábitos Mensuráveis
- Ao clicar para "completar" → **Modal de Valor**
- Pergunta "Quanto você completou hoje?" com campo numérico
- Consistente em Meus Hábitos e Dashboard

### Frequência Personalizada
- Ao selecionar "Personalizado..." → **Modal de Frequência X em Y**
- Configura "X vezes em Y dias" com campos inline

## Funções Principais (main.js)

### CRUD e Renderização
- `configurarFAB()`: FAB abre modal de seleção de tipo
- `configurarModalTipo()`: Modal de escolha de tipo de hábito
- `configurarModalValor()`: Modal de valor para mensuráveis
- `configurarModalFrequenciaXY()`: Modal de frequência personalizada
- `salvarHabito()`: Cria ou atualiza hábito
- `editarHabito(id)`: Abre modal com dados do hábito (tipo fixo)
- `abrirModalValor(id)`: Abre modal de valor para mensurável
- `renderizarHabitos()`: Renderiza cards na tela
- `toggleDiaHabito(id, data)`: Marca/desmarca dia (binários)

### Sistema de Preferências
- `carregarPreferencias()`: Carrega preferências do localStorage
- `salvarPreferencias(prefs)`: Salva preferências no localStorage
- `aplicarTema(tema)`: Aplica tema claro/escuro ao body
- `alternarTema()`: Alterna entre tema claro e escuro
- `configurarModalPreferencias()`: Configura modal e toggle de tema

### Estatísticas por Hábito
- `contarDiasConcluidos(habito)`: Conta dias em que o hábito foi concluído
- `calcularStreakMaxima(habito)`: Calcula maior sequência consecutiva de dias
- `calcularStatsMensuravel(habito)`: Calcula média, máximo e mínimo
- `abrirModalStats(habitoId)`: Abre modal com estatísticas do hábito

## Princípios de IHC Aplicados

1. **Feedback visual**: Estados de hover, cores de status, barras de progresso, checkmarks animados, **sistema de toast notifications**
2. **Consistência**: Mesma estrutura de layout em todas as páginas, FAB sempre presente, **navegação com página atual destacada**
3. **Acessibilidade**: Labels em formulários, textos em botões, contraste adequado, **elementos semânticos (buttons vs divs)**, **fechar modais com Escape**, **gerenciamento de foco**, **aria-current="page"**
4. **Responsividade**: Adaptação para diferentes tamanhos de tela
5. **Hierarquia visual**: Tipografia clara, espaçamentos generosos
6. **Interação direta**: Marcar hábitos com um clique, sem menus intermediários
7. **Prevenção de erros**: Confirmação antes de excluir, **validação de formulários com mensagens inline amigáveis**
8. **Flexibilidade**: Tipos de hábito, frequências e lembretes configuráveis
9. **Onboarding**: Caixa de boas-vindas explicando hábitos de exemplo e como usar o app
10. **Ajuda contextual**: Descrições nos modais explicando diferenças entre tipos de hábito

## Funcionalidades de IHC (Detalhadas)

### Sistema de Toast Notifications
- Notificações visuais aparecem ao salvar, excluir ou registrar progresso
- Toasts de sucesso (verde) e erro (vermelho)
- Auto-dismiss após 3 segundos
- Posicionamento fixo no canto inferior direito

### Validação de Formulários
- Mensagens de erro próximas aos campos inválidos
- Validação antes de submeter
- Feedback visual com borda vermelha nos campos com erro

### Acessibilidade Avançada
- Fechar modais com tecla Escape
- Foco automático no primeiro campo ao abrir modal
- Elementos clicáveis são `<button>` ao invés de `<div>`
- Atributo `aria-current="page"` na navegação

### Navegação
- Página atual destacada na sidebar com cor de fundo e borda
- Classe `.nav-link-ativo` aplicada dinamicamente

## Novas Funcionalidades

### Sistema de Preferências (Modo Escuro)
- **Acesso**: Botão "Preferências" na sidebar de todas as páginas
- **Modal de Preferências**: Toggle switch para ativar/desativar modo escuro
- **Persistência**: Preferências salvas em `localStorage` (chave: `flui360_prefs`)
- **Aplicação automática**: Tema carregado e aplicado ao iniciar cada página
- **Acessibilidade**: Toggle com suporte a teclado (Enter/Space) e aria-checked

### Modal de Estatísticas do Hábito
- **Acesso**: Clicar no nome/info do card de hábito em "Meus Hábitos"
- **Estatísticas exibidas**:
  - Dias concluídos (total)
  - Maior sequência (streak máxima)
  - Tipo de hábito (badge)
- **Para hábitos mensuráveis** (seção adicional):
  - Média dos valores registrados
  - Valor máximo
  - Valor mínimo
- **Cálculos**:
  - Streak: percorre histórico ordenado verificando dias consecutivos
  - Dias concluídos: binário = true, mensurável = valor >= alvo

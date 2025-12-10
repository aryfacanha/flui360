# Flui360 - Dashboard de Hábitos

## Visão Geral
Flui360 é um aplicativo web estático de gerenciamento de hábitos, desenvolvido para apresentação em uma disciplina de Interação Humano-Computador (IHC). O projeto utiliza apenas HTML, CSS e JavaScript puro, sem frameworks ou backend.

**Design inspirado no Loop Habit Tracker** com foco em:
- Área de marcação de hábitos proeminente
- Visualização de histórico por calendário
- Marcação retroativa de dias
- Indicador de sequência (streak)

## Estrutura do Projeto

```
/
├── index.html          # Página de login
├── dashboard.html      # Dashboard principal (com FAB)
├── habitos.html        # Tela de gerenciamento de hábitos (com FAB)
├── relatorios.html     # Tela de relatórios e estatísticas (com FAB)
├── assets/
│   ├── css/
│   │   └── style.css   # Estilos globais (mobile-first + estilo Loop)
│   ├── js/
│   │   └── main.js     # JavaScript principal com sistema de histórico
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
- **Calendário de dias**: Grade mostrando os últimos 7 dias
- **Checkmarks clicáveis**: Marcar/desmarcar qualquer dia (retroativo)
- **Indicador de sequência (streak)**: Dias consecutivos
- **Barra de progresso**: Porcentagem de conclusão mensal
- **Cores personalizadas**: Cada hábito tem sua cor
- FAB para adicionar novos hábitos

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

## Recursos Estilo Loop Habit Tracker

1. **Histórico de dias**: Cada hábito armazena um objeto com datas e status de conclusão
2. **Marcação retroativa**: Clique em qualquer dia para marcar/desmarcar
3. **Cálculo de sequência**: Conta dias consecutivos automaticamente
4. **Cores dinâmicas**: Cada hábito tem cor própria para identificação visual
5. **FAB persistente**: Botão flutuante em todas as páginas

## Princípios de IHC Aplicados

1. **Feedback visual**: Estados de hover, cores de status, barras de progresso, checkmarks animados
2. **Consistência**: Mesma estrutura de layout em todas as páginas, FAB sempre presente
3. **Acessibilidade**: Labels em formulários, textos em botões, contraste adequado
4. **Responsividade**: Adaptação para diferentes tamanhos de tela
5. **Hierarquia visual**: Tipografia clara, espaçamentos generosos
6. **Interação direta**: Marcar hábitos com um clique, sem menus intermediários

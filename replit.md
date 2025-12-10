# Flui360 - Dashboard de Hábitos

## Visão Geral
Flui360 é um aplicativo web estático de gerenciamento de hábitos, desenvolvido para apresentação em uma disciplina de Interação Humano-Computador (IHC). O projeto utiliza apenas HTML, CSS e JavaScript puro, sem frameworks ou backend.

## Estrutura do Projeto

```
/
├── index.html          # Página de login
├── dashboard.html      # Dashboard principal
├── habitos.html        # Tela de gerenciamento de hábitos
├── relatorios.html     # Tela de relatórios e estatísticas
├── assets/
│   ├── css/
│   │   └── style.css   # Estilos globais (mobile-first)
│   ├── js/
│   │   └── main.js     # JavaScript principal
│   └── img/            # Pasta para imagens (se necessário)
└── attached_assets/    # Arquivos anexados do projeto
```

## Funcionalidades

### Tela de Login (index.html)
- Formulário de login com validação HTML5
- Modal de cadastro (simulado)
- Redirecionamento para o dashboard

### Dashboard (dashboard.html)
- Resumo de hábitos (cards de estatísticas)
- Gráfico de progresso semanal
- Lista de hábitos do dia com checkbox
- Sidebar de navegação

### Meus Hábitos (habitos.html)
- Grid responsivo de cards de hábitos
- Botão FAB para adicionar novos hábitos
- Modal para criação de hábitos
- Status visual (ativo, pendente, concluído)
- Barra de progresso em cada card

### Relatórios (relatorios.html)
- Gráfico horizontal de dias concluídos por hábito
- Gráfico de taxa de conclusão mensal
- Resumo estatístico do mês
- Explicações textuais para IHC

## Responsividade

O projeto segue a abordagem **mobile-first** com breakpoints:
- **Mobile**: até 767px (menu hambúrguer + 1 coluna)
- **Tablet**: 768px - 1199px (2 colunas de cards)
- **Desktop**: 1200px+ (sidebar fixa + 3-4 colunas)

## Como Executar

O projeto é estático e pode ser executado com qualquer servidor HTTP. No Replit, o workflow está configurado para servir os arquivos na porta 5000.

## Tecnologias

- HTML5 (semântico, com validação)
- CSS3 (variáveis CSS, Flexbox, Grid, animações)
- JavaScript ES6+ (vanilla, sem frameworks)

## Princípios de IHC Aplicados

1. **Feedback visual**: Estados de hover, cores de status, barras de progresso
2. **Consistência**: Mesma estrutura de layout em todas as páginas
3. **Acessibilidade**: Labels em formulários, textos em botões, contraste adequado
4. **Responsividade**: Adaptação para diferentes tamanhos de tela
5. **Hierarquia visual**: Tipografia clara, espaçamentos generosos

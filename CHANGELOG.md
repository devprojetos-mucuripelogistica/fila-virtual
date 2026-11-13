# Histórico de versões

As mesmas novidades aparecem para os usuários na janela **"O que há de novo"** do app.
O texto delas fica na lista `NOVIDADES`, no início de `src/Codigo.gs`.

## Versão 5 — 13/11/2026 · Visual novo e relógio interno
- Visual igual ao do Quadro de Tarefas: fontes Montserrat e Exo 2, menu lateral que dá para recolher, tela de login nova e modo escuro (botão Aparência).
- Animações: abertura com o logo, telas e cartões entrando em sequência, janelas e painéis deslizando.
- Relógio interno: as horas vêm do servidor, no horário de Manaus (UTC‑4), e são gravadas como `2026-11-13T15:17:25-04:00`. A função `instalar` converte os horários antigos uma única vez.
- Aviso "O app foi atualizado — Recarregar agora" e janela "O que há de novo" (botão **Novidades** no menu).
- Endereço pelo GitHub Pages (`index.html`), com ícone e opção de instalar na tela inicial do celular.
- A chave de administrador inicial deixou de ficar no código (agora é só um valor provisório para a primeira instalação).

## Versão 4 — 10/11/2026 · Menus reorganizados
- Lista de presença, movimentos da fila, histórico de logs e histórico de ações ficam juntos em **Relatórios**.
- Excluir motorista passou para dentro de **Gerenciar Motoristas**.
- Localização, avisos e regras e alterar chave ficam juntos em **Configurações**.

## Versão 3 — 07/11/2026 · Fila em tempo real
- Visual com a identidade da Mucuripe e login mais rápido.
- Entrar, ser chamado, mover ou remover da fila aparece na hora, sem recarregar a página.
- Logo nova no app e na aba do navegador.
- Arquivo morto: dados com mais de 2 meses vão para outra planilha.

## Versão 2 — 06/11/2026 · Três arquivos
- Projeto juntado em três arquivos (`Codigo.gs`, `Index.html`, `JavaScript.html`).
- Dados do Base44 importados para a planilha.
- Correções: "Cannot set properties of null" e "Sistema ocupado".

## Versão 1 — 05/11/2026 · Migração do Base44
- App LogiTrack (Base44) convertido para Google Apps Script com o nome de Fila Virtual.

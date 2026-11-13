# Como publicar uma atualização (e avisar os usuários)

O app avisa sozinho os usuários quando sai uma versão nova. Para isso, **toda atualização** precisa de dois ajustes no início do `Codigo.gs`.

## 1. Escreva as novidades

No início do `src/Codigo.gs` ficam estas linhas:

```js
const VERSAO_APP = '5';
const NOVIDADES = [
  { versao: '5', data: '2026-11-13', titulo: 'Visual novo e relógio interno', itens: [
    'Primeira novidade.',
    'Segunda novidade.'
  ] },
  ...
```

Numa versão nova:
- Aumente o número em `VERSAO_APP`, por exemplo de `'5'` para `'6'`.
- Copie um bloco `{ versao: ... },` e cole logo **depois** de `const NOVIDADES = [`, para ele ficar em **primeiro** na lista. Depois ajuste a versão, a data (ano-mês-dia), o título e os itens.

Exemplo:

```js
const VERSAO_APP = '6';
const NOVIDADES = [
  { versao: '6', data: '2026-12-01', titulo: 'Avisos pelo WhatsApp', itens: [
    'O motorista recebe uma mensagem no WhatsApp quando é chamado.'
  ] },
  { versao: '5', data: '2026-11-13', titulo: 'Visual novo e relógio interno', itens: [
  ...
```

Cuidados na hora de escrever:
- Cada item fica entre aspas simples `' '` e termina com vírgula, menos o último.
- Se o texto tiver um apóstrofo, troque-o por `\'`, por exemplo: `'Pedido d\'água'`.

## 2. Cole o código no Apps Script

1. Abra a planilha da Fila e vá em **Extensões › Apps Script**.
2. Para cada arquivo que mudou, apague o conteúdo antigo (Ctrl+A, Delete) e cole o novo:
   - `Codigo` ← `src/Codigo.gs`
   - `Index` ← `src/Index.html`
   - `JavaScript` ← `src/JavaScript.html`
3. Salve (Ctrl+S).
4. Se o guia da versão pedir, rode a função **instalar** (escolha-a lá em cima e clique em ▶ Executar). Ela pode ser rodada quantas vezes for preciso, sem estragar nada.

## 3. Publique a versão nova

**Implantar › Gerenciar implantações › ✏ (editar) › Versão: Nova versão › Implantar.**

O link do app continua o mesmo.

## O que os usuários veem

- **Quem está com o app aberto:** em até alguns segundos aparece no topo a faixa **"O app foi atualizado — Recarregar agora"**.
- **Depois de recarregar ou entrar no app:** cada motorista e cada administrador vê **uma vez** a janela **"O que há de novo"**. Ao tocar em **Entendi**, ela não aparece mais nesta versão, em nenhum aparelho.
- **A qualquer momento:** dá para rever as novidades pelo botão **Novidades**, no menu do administrador, e **Novidades do app**, no perfil do motorista.

## 4. Guarde no GitHub

Envie os arquivos alterados e acrescente a versão no `CHANGELOG.md`. O passo a passo está em [COMO_USAR_O_GITHUB.md](COMO_USAR_O_GITHUB.md).

---

### Atualização para a versão 5 (só desta vez)

Depois de colar os 3 arquivos, rode a função **instalar** uma vez. Ela converte os horários antigos da planilha para o horário de Manaus (`...-04:00`).

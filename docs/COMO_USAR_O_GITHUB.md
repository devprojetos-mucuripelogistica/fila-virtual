# Como colocar e manter o app no GitHub (sem instalar nada)

Tudo é feito pelo site **github.com**, no navegador.

## Primeira vez: criar o repositório

1. Entre em **github.com** (crie uma conta gratuita se ainda não tiver).
2. No canto superior direito, clique em **+ › New repository**.
3. Preencha:
   - **Repository name:** `fila-de-atendimento`
   - **Description:** Fila virtual de motoristas · Mucuripe Logística
   - **Public** ou **Private**: para usar o endereço do GitHub Pages no plano gratuito, o repositório precisa ser **Public**. O código não tem senha nem dados de motoristas.
   - Deixe **desmarcadas** as opções "Add a README", ".gitignore" e "license", porque esses arquivos já vêm no pacote.
4. Clique em **Create repository**.
5. Na página que abrir, clique no link **"uploading an existing file"**.
6. Descompacte o zip no computador e **arraste para a página tudo que está dentro da pasta `2_GITHUB`**: as pastas `src` e `docs` e os arquivos `index.html`, `manifest.webmanifest`, `icone-192.png`, `icone-512.png`, `README.md`, `CHANGELOG.md`, `.gitignore` e `.nojekyll`.
   - Os arquivos `.gitignore` e `.nojekyll` começam com ponto e podem estar **ocultos** no Windows. Para vê-lo, ligue no Explorador de Arquivos **Exibir › Mostrar › Itens ocultos**.
7. Embaixo, em **Commit changes**, escreva `Versão 5 — primeira publicação` e clique em **Commit changes**.

Pronto. A página do repositório já mostra o README com as imagens.

## Endereço do app pelo GitHub (GitHub Pages)

Com isso o app ganha um endereço fácil, como `https://SEU-USUARIO.github.io/fila-de-atendimento/`, com a logo na aba do navegador. O motorista também pode instalar o app no celular, com ícone na tela inicial.
O app continua rodando no Google: a página do GitHub só o abre por dentro.

> Se aparecer **"404 File not found"**, é porque o arquivo `index.html` não está na **raiz** do repositório (fora das pastas) ou ainda está sem o link do app.

1. **Pegue o link do app:** no Apps Script, abra **Implantar › Gerenciar implantações** e copie a **URL do app da Web**, que termina em `/exec`.
2. **Cole o link no `index.html`:** no GitHub, abra o arquivo `index.html` (na raiz, fora das pastas) e clique no **lápis ✏**. Procure a linha:
   ```
   var URL_DO_APP = 'COLE_AQUI_O_LINK_DO_APP_QUE_TERMINA_EM_/exec';
   ```
   Troque o texto entre as aspas pelo link copiado, mantendo as aspas:
   ```
   var URL_DO_APP = 'https://script.google.com/macros/s/AKfy.../exec';
   ```
   Depois clique em **Commit changes**.
3. **Ligue o GitHub Pages:** no repositório, vá em **Settings › Pages**. Em **Source**, escolha **Deploy from a branch**. Em **Branch**, escolha **main** e a pasta **/ (root)** e clique em **Save**.
4. **Teste:** espere 1 a 2 minutos e abra `https://SEU-USUARIO.github.io/fila-de-atendimento/`.
5. **Confira a localização:** entre como motorista e veja se aparece "Localização detectada". Se o celular não liberar o GPS por esse endereço, use o link direto do Google (`.../exec`) para os motoristas.

Para instalar no celular: abra o endereço no Chrome, toque em **⋮ › Adicionar à tela inicial** (ou **Instalar app**). No iPhone, use o Safari: **Compartilhar › Adicionar à Tela de Início**.

Observações:
- No plano gratuito, o GitHub Pages só funciona com o repositório **público**. O código pode ficar público porque não tem senha nem dados dentro dele. Os dados continuam só na planilha do Google.
- Ao publicar uma **Nova versão** no Apps Script, o link `/exec` continua o mesmo. Não precisa mexer no `index.html` de novo.

## A cada atualização

1. No repositório, entre na pasta do arquivo, por exemplo `src`.
2. Clique em **Add file › Upload files** e arraste os arquivos novos com **o mesmo nome**. O GitHub troca os antigos pelos novos.
3. Faça o mesmo com o `CHANGELOG.md`, já com a versão nova escrita no topo.
4. Em **Commit changes**, escreva o que mudou, por exemplo: `Versão 6 — avisos pelo WhatsApp`.
5. Clique em **Commit changes**.

Outra opção, para mudanças pequenas: abra o arquivo no GitHub, clique no **lápis ✏**, edite e clique em **Commit changes**.

## Voltar uma versão antiga

1. Abra o arquivo no GitHub e clique em **History**.
2. Escolha a data, abra o arquivo daquela versão e clique em **Raw**.
3. Copie tudo (Ctrl+A, Ctrl+C) e cole no Apps Script.
4. Publique: **Implantar › Gerenciar implantações › Nova versão**.

## Nunca envie

- A planilha ou cópias dela (`.xlsx`, `.csv`).
- Prints com CPF, telefone ou nome de motoristas.
- A chave de administrador que vocês usam de verdade.

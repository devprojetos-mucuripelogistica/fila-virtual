# Como colocar e manter o app no GitHub (sem instalar nada)

Tudo é feito pelo site **github.com**, no navegador.

## Primeira vez: criar o repositório

1. Entre em **github.com** (crie uma conta gratuita se ainda não tiver).
2. No canto superior direito, clique em **+ › New repository**.
3. Preencha:
   - **Repository name:** `fila-de-atendimento`
   - **Description:** Fila virtual de motoristas · Mucuripe Logística
   - Marque **Private**. Isso é importante: só você e quem você convidar veem o código.
   - Deixe **desmarcadas** as opções "Add a README", ".gitignore" e "license", porque esses arquivos já vêm no pacote.
4. Clique em **Create repository**.
5. Na página que abrir, clique no link **"uploading an existing file"**.
6. Descompacte o zip no computador e **arraste para a página o conteúdo da pasta** `fila-de-atendimento`: as pastas `src` e `docs` e os arquivos `README.md`, `CHANGELOG.md` e `.gitignore`.
   - O `.gitignore` começa com ponto e pode estar **oculto** no Windows. Para vê-lo, ligue no Explorador de Arquivos **Exibir › Mostrar › Itens ocultos**.
7. Embaixo, em **Commit changes**, escreva `Versão 5 — primeira publicação` e clique em **Commit changes**.

Pronto. A página do repositório já mostra o README com as imagens.

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

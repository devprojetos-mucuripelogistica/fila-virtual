# Como instalar do zero

Siga este guia só para montar o app **numa planilha nova**. Se o app já está funcionando, use o [COMO_ATUALIZAR.md](COMO_ATUALIZAR.md).

1. Crie uma planilha nova no Google Sheets, por exemplo "Fila Virtual".
2. Na planilha, abra **Extensões › Apps Script**.
3. Crie os arquivos do projeto:
   - O arquivo `Código.gs` já existe. Renomeie-o para **Codigo** e cole nele o conteúdo de `src/Codigo.gs`.
   - Clique em **+ › HTML**, dê o nome **Index** e cole o conteúdo de `src/Index.html`.
   - Clique em **+ › HTML**, dê o nome **JavaScript** e cole o conteúdo de `src/JavaScript.html`.
4. Ative o arquivo de configurações: clique em **⚙ Configurações do projeto** e marque *"Mostrar arquivo de manifesto appsscript.json"*. Volte ao editor e troque o conteúdo do `appsscript.json` pelo de `src/appsscript.json`.
5. Salve tudo (Ctrl+S).
6. No topo do editor, escolha a função **instalar** e clique em **▶ Executar**. Aceite as permissões que o Google pedir.
7. Publique: **Implantar › Nova implantação › ⚙ › App da Web**.
   - Executar como: **Eu**
   - Quem pode acessar: **Qualquer pessoa**
   - Clique em **Implantar** e copie o link. Esse é o endereço do app.
8. Abra o link, entre como administrador com a chave **`mucuripe-trocar-esta-chave`** e troque-a na hora em **Configurações › Alterar chave**.
9. Ainda em **Configurações**, defina a localização da base e o raio permitido.

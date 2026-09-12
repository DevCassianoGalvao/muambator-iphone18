/**
 * Apps Script da planilha de leads — Pré-venda iPhone 18 Pro Muambator
 * https://docs.google.com/spreadsheets/d/1Lpm6nu2CMXMs6Ll1C-40gtS_0oIEpA5nHiZBtcMmBos
 *
 * Como instalar:
 *   1. Na planilha: Extensões → Apps Script.
 *   2. Apagar o conteúdo padrão (`function myFunction() {}`) e colar este arquivo.
 *   3. Implantar → Nova implantação → ícone de engrenagem → "Aplicativo da Web".
 *      - Executar como: Eu
 *      - Quem pode acessar: Qualquer pessoa
 *   4. Autorizar (tela "app não verificado" → Avançado → Acessar [projeto]).
 *   5. Copiar a URL gerada (termina em /exec) e colar em SHEET_URL,
 *      dentro do <script> do index.html.
 *
 * Cabeçalho esperado na aba (linha 1), já criado na planilha:
 *   Data | Nome | WhatsApp | E-mail | Modelo | Cor | Armazenamento
 */
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    new Date(),
    data.nome,
    data.whats,
    data.email,
    data.modelo,
    data.cor,
    data.armazenamento
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}

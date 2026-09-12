/**
 * Apps Script da planilha de leads — Pré-venda iPhone 18 Pro Muambator
 * https://docs.google.com/spreadsheets/d/1Lpm6nu2CMXMs6Ll1C-40gtS_0oIEpA5nHiZBtcMmBos
 *
 * Como instalar / atualizar:
 *   1. Na planilha: Extensões → Apps Script.
 *   2. Apagar o conteúdo e colar este arquivo (substitui o anterior).
 *   3. Implantar → Gerenciar implantações → ícone de lápis (editar) na
 *      implantação existente → Versão: "Nova versão" → Implantar.
 *      (Editar o código sozinho NÃO atualiza a URL já publicada — sem
 *      esse passo o site continua rodando a versão antiga do script.)
 *      Se for a primeira vez, ver o passo a passo completo no PROJETO.md.
 *
 * Cabeçalho esperado na aba (linha 1) — as 3 últimas colunas são novas,
 * precisam ser criadas manualmente na planilha antes de testar:
 *   Data | Nome | WhatsApp | E-mail | Modelo | Cor | Armazenamento | Cidade | Troca | Aparelho
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
    data.armazenamento,
    data.cidade,
    data.troca,
    data.aparelho
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}

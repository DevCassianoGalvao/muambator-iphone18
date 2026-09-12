# Muambator — Reserva iPhone 18

Landing page de pré-venda / lista de espera do iPhone 18 (Pro, Pro Max, Fold).
Página estática, estilo Apple, com formulário progressivo e condicional.

## Estrutura

```
index.html            página completa (HTML + CSS + JS inline)
assets/logo.png       logo Muambator (fundo transparente)
assets/iphone18.png   imagem do hero
google-apps-script.js script da planilha de leads (Google Sheets)
```

## Formulário

- Divulgação progressiva: cada campo aparece quando o anterior é preenchido.
- Campos condicionais por modelo (cor / armazenamento) e por troca.
- Envio para o [Google Sheets](https://docs.google.com/spreadsheets/d/1Lpm6nu2CMXMs6Ll1C-40gtS_0oIEpA5nHiZBtcMmBos)
  via Apps Script — ver `google-apps-script.js` e `PROJETO.md`/`AJUSTES.md`.

### Pendente

- Na planilha, criar as colunas **Cidade | Troca | Aparelho** logo depois
  de "Armazenamento" (o `index.html` e o `google-apps-script.js` já
  mandam e gravam esses 3 campos).
- No Apps Script, colar a versão atual de `google-apps-script.js` e
  **implantar como nova versão** da implantação existente (editar o
  código sozinho não atualiza a URL já publicada).

## Publicar

Hospedagem estática (GitHub Pages, Netlify, Vercel...). Basta servir a raiz.
Requer internet para a fonte Instrument Serif (Google Fonts); sem ela cai
para Georgia.

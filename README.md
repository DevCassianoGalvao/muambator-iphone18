# Muambator — Reserva iPhone 18

Landing page de pré-venda / lista de espera do iPhone 18 (Pro, Pro Max, Fold).
Página estática, estilo Apple, com formulário progressivo e condicional.

## Estrutura

```
index.html          página completa (HTML + CSS + JS inline)
assets/logo.png     logo Muambator (fundo transparente)
assets/iphone18.png imagem do hero
```

## Formulário

- Divulgação progressiva: cada campo aparece quando o anterior é preenchido.
- Campos condicionais por modelo (cor / armazenamento) e por troca.
- Envio via [FormSubmit](https://formsubmit.co) por AJAX.

### Pendente

E-mail de destino dos leads está provisório em `index.html`
(`var DESTINO = '...'`). Trocar pelo e-mail definitivo da Muambator.
O FormSubmit exige confirmar o primeiro envio por link no e-mail.

## Publicar

Hospedagem estática (GitHub Pages, Netlify, Vercel...). Basta servir a raiz.
Requer internet para a fonte Instrument Serif (Google Fonts); sem ela cai
para Georgia.

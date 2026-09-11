# Guia do projeto — Landing de pré-venda (modelo Muambator)

Este documento explica como a página `index.html` deste projeto foi construída,
para servir de referência ao montar uma página **praticamente idêntica** para
outra empresa (outro produto, outra copy, outro logo). A ideia é: você sobe a
copy e os assets da nova empresa numa pasta nova, e usa este guia (ou manda
ele pra mim junto com o material novo) pra recriar a mesma estrutura.

## 1. O que é a página

Uma landing page estática (HTML + CSS + JS num arquivo só, sem build/backend)
para captar leads de pré-venda de um produto com variações (modelo, cor,
armazenamento). Estilo visual "clarinho, tipo site da Apple". Fluxo:

1. Hero com a promessa principal + botão que rola até o formulário.
2. Formulário que vai se revelando campo a campo (progressive disclosure) e
   muda as opções conforme a escolha (campos condicionais).
3. Envio via FormSubmit (sem backend próprio) → e-mail da empresa.

## 2. Estrutura de arquivos

```
index.html            página inteira (HTML + <style> + <script> inline)
assets/logo.png        logo com fundo transparente
assets/iphone18.png     imagem hero do produto (fundo transparente)
README.md              instruções de publicação
.gitignore
```

Tudo num arquivo HTML só — sem dependências de build. As únicas requisições
externas são o Google Fonts (tipografia) e o FormSubmit (envio do formulário).

## 3. Identidade visual (design tokens)

Tudo fica em `:root` no topo do `<style>`. **É basicamente só isso que muda
de uma empresa pra outra** — a estrutura do HTML/CSS/JS fica igual:

```css
:root{
  --bg:#f5f5f7;          /* fundo geral, cinza bem claro */
  --surface:#ffffff;     /* cartões, inputs */
  --ink:#1d1d1f;         /* texto principal */
  --ink-soft:#6e6e73;    /* texto secundário/legenda */
  --line:#d2d2d7;        /* bordas */
  --band:#e8e8ec;        /* fundo da seção do formulário (mais escuro que --bg) */
  --band-line:#d9d9df;   /* linha divisória da seção do formulário */
  --blue:#0a6dff;        /* cor de marca — usada em CTA, links, ícones, destaque */
  --blue-press:#0056d6;  /* hover/active do azul */
  --black:#111113;       /* pretos (títulos) */
  --radius:14px;         /* raio padrão de cartões */
  --shadow: ... ;        /* sombra padrão de cartões flutuantes */
}
```

**Para a próxima empresa:** troque só `--blue` e `--blue-press` pelo tom de
azul mais próximo do logo dela (mantendo contraste bom em cima de branco/cinza
claro), troque os dois `assets/*.png`, e ajuste as poucas linhas de copy
indicadas na seção 6. O resto (grid, tipografia, animações, formulário) não
precisa mudar.

### Tipografia
- Corpo: fonte de sistema (`-apple-system, ... , Arial, sans-serif`) — sem
  carregar nada externo.
- Sotaque serifado: **Instrument Serif** (itálico), carregada via Google
  Fonts (`<link>` no `<head>`). Usada em `.serif` — uma palavra de destaque
  no título do hero e nos títulos "Entre para a lista de espera" /
  "Reserva recebida!". É o toque "editorial/iDesign" que diferencia do
  visual 100% corporativo. Se a fonte não carregar (sem internet), cai pra
  Georgia (fallback definido em `.serif`).
- Sem emoji, sem ícone de biblioteca externa: todo ícone é SVG inline
  (check, seta, chevron do select, maçã da Apple).

### Fundo com textura
`body::before` desenha um dot-grid (pontinhos) fixo atrás de tudo, com uma
máscara radial que apaga o centro e reforça as bordas — dá textura sem
poluir o conteúdo. Independe da paleta, não precisa mudar.

## 4. Anatomia da página (de cima pra baixo)

### 4.1 Hero (`<section class="hero">`)
Grid de 2 colunas no desktop (`grid-template-columns:1fr 1fr`), vira 1
coluna centralizada no mobile.

**Coluna esquerda (`.hero-copy`)**, nesta ordem:
1. Logo (`.hero-logo`, PNG com fundo transparente, ~44px de altura)
2. Selo pequeno (`.eyebrow`) — ex.: "Pré-venda"
3. Título (`.headline`) — uma palavra em destaque com `.serif` (itálico,
   azul), e o nome do produto com um ícone inline antes dele (no caso, a
   maçã da Apple antes de "iPhone 18" — troque pelo símbolo que fizer
   sentido pro novo produto, ou remova)
4. Parágrafo de apoio (`.lead`)
5. Botão CTA (`.cta`) → `href="#reservar"`, rola até o formulário
6. Linha de confiança pequena (`.cta-note`) — ex.: "Reserva grátis e sem
   compromisso · Retorno pelo WhatsApp"

**Coluna direita (`.hero-visual`)**: a imagem do produto (`.hero-img`, PNG
transparente, com `drop-shadow` e uma animação sutil de flutuar) + 2 "cards
flutuantes" (`.fcard`) posicionados em cima da imagem (`position:absolute`),
tipo selos de confiança curtos: ícone de check + título + subtítulo. Ex.:
"✓ Novos e lacrados / com garantia" e "✓ 18x sem juros / no cartão". São só
2 de propósito — mais que isso decora demais.

No **mobile** os cards viram **pills** lado a lado (uma linha só, sem
subtítulo) em vez de ficarem flutuando sobre a imagem — ver seção 7.

### 4.2 Seção do formulário (`<section class="reserva" id="reservar">`)
Faixa de largura total com fundo `--band` (um tom mais escuro que o `--bg`
do hero) e uma linha/sombra sutil no topo — isso separa visualmente "hero"
de "formulário" sem precisar de outro recurso gráfico. Dentro, um contêiner
centralizado (`.reserva-inner`, `max-width:560px`) com:
- Título serifado ("Entre para a lista de espera")
- Legenda
- O cartão branco do formulário (`.form-card`)
- O cartão de sucesso (`.success`), escondido até o envio dar certo

### 4.3 Rodapé
Uma linha simples, nome da empresa + ano dinâmico (`<span id="year">`,
preenchido por JS).

## 5. O formulário: as duas peças de lógica

Esse é o coração do projeto — o resto é só layout.

### 5.1 Divulgação progressiva ("um campo puxa o outro")
Cada campo começa com o atributo `hidden` e recebe as classes `field step`.
Uma função `advance()` roda a cada `input`/`change` no formulário inteiro e
decide, em ordem, quem já pode aparecer:

```js
function advance(){
  reveal($('s-whats'),  nome.value.trim().length > 1);
  reveal($('s-email'),  digits(whats.value).length >= 10);
  reveal($('s-cidade'), email.value !== '' && email.checkValidity());
  reveal($('s-modelo'), cidade.value.trim().length > 1);
  // ...continua a cadeia até o botão de enviar
}
```

`reveal(el, cond)` só faz `el.hidden = false` — **nunca esconde de novo**.
Isso evita o formulário "piscando" enquanto a pessoa ainda está digitando.
Quando o campo aparece, a classe `.step` dispara uma animaçãozinha de
fade + subida (`@keyframes stepIn`).

### 5.2 Campos condicionais (dependem de uma escolha)
Além da cadeia progressiva, existem grupos de campos que só existem para
certos valores — ex.: as opções de cor/armazenamento mudam conforme o
modelo escolhido. Cada grupo tem `data-group="nome"` e uma função
`setGroup(grupo, mostrar)` que mostra/esconde e, importante, **desabilita e
limpa** o campo escondido (senão ele viaja escondido no envio):

```js
function setGroup(group, show){
  form.querySelectorAll('.cond[data-group="' + group + '"]').forEach(campo => {
    campo.hidden = !show;
    var input = campo.querySelector('input, select');
    if (input) { input.disabled = !show; if (!show) input.value = ''; }
  });
}
```

No projeto atual isso resolve dois casos:
- **Modelo → Cor/Armazenamento**: 3 modelos (`iPhone 18 Pro`, `iPhone 18
  Pro Max`, `iPhone Fold`), cada um com seu próprio par de campos
  cor+armazenamento (com opções diferentes — o Fold tem menos cores e
  menos capacidades). Só um par fica visível/habilitado por vez.
- **Troca de aparelho → "Qual aparelho?"**: um radio Sim/Não que revela um
  campo de texto livre só quando a resposta é "Sim".

Pra outra empresa com outra copy, normalmente só muda: quantos modelos
existem, quais variações cada um tem, e se existe algum "campo que só
aparece dependendo de outra resposta" equivalente ao da troca.

### 5.3 Envio
`fetch` em AJAX pro FormSubmit (`https://formsubmit.co/ajax/<email>`), sem
sair da página. Em caso de sucesso, esconde o `.form-card` e mostra o
`.success`. Em caso de erro, mostra uma mensagem e reabilita o botão.

**Atenção ao reaproveitar:** o FormSubmit exige confirmar o **primeiro**
envio por um link que chega no e-mail de destino — sem isso os envios
seguintes não chegam. Tem também os campos ocultos de configuração
(`_subject`, `_template`, `_captcha`, e um campo "honeypot" anti-spam)
que devem ir junto no formulário novo.

## 6. O que trocar para a próxima empresa (checklist)

1. **Assets**: `assets/logo.png` (fundo transparente — se vier com fundo
   branco, dá pra extrair automaticamente por color-key, como foi feito
   aqui) e a imagem hero do produto (também com fundo transparente).
2. **`--blue` / `--blue-press`**: tom de azul mais próximo do novo logo.
3. **Copy**: `<title>`, `<meta description>`, eyebrow, headline (+ qual
   palavra fica em `.serif`, e se faz sentido algum ícone inline tipo a
   maçã), lead, texto do CTA, cta-note, título/legenda da seção do
   formulário, mensagem de sucesso, texto legal abaixo do botão, rodapé.
4. **Cards flutuantes**: 2 selos de confiança curtos e reais da empresa
   (nunca inventar número/dado).
5. **Formulário**: campos base (nome, contato, e-mail, cidade — ou o que
   fizer sentido), lista de produtos/modelos e as variações condicionais
   de cada um, e o e-mail de destino no FormSubmit.
6. **`.hero-logo` / favicon / nome no `<title>`**: nome da nova empresa.

O que **não** precisa mexer: grid do hero, sistema de progressive
disclosure, animações, dot-grid de fundo, responsividade, sombra/raio dos
cartões.

## 7. Responsividade — breakpoints

| Breakpoint | O que muda |
|---|---|
| `max-width:960px` | Hero vira 1 coluna, tudo centralizado (`text-align:center`); ordem final: logo → textos → botão → imagem. Título encolhe (`clamp`). Imagem limitada a `42vh` (`object-fit:contain`) pra aparecer inteira sem empurrar o formulário pra muito longe. |
| `max-width:860px` | Os `.fcard` deixam de ser `position:absolute` sobre a imagem e viram **pills** lado a lado (uma linha, ícone + título, sem subtítulo) centralizadas abaixo da imagem. |
| `max-width:560px` | Ajustes finos de padding, título da seção de formulário menor, botão CTA ocupa 100% da largura, pills um pouco menores. |
| `max-width:400px` | Título do hero encolhe mais um passo. |

Regra geral usada aqui: **nunca** deixar um card/selo quebrar linha de
forma feia — ou ele é largo o bastante pro texto caber numa linha só, ou o
texto secundário some no mobile (foi o que resolveu o problema dos cards
com alturas desiguais).

## 8. Detalhes técnicos que vale lembrar

- `[hidden]{display:none !important;}` no topo do CSS — sem isso, `hidden`
  não vence `display:flex` que os `.field` têm por padrão.
- `overflow-x:hidden` no `body` + `min-width:0` nos filhos do grid: evita
  estouro horizontal em telas estreitas.
- `prefers-reduced-motion: reduce` desliga as animações de flutuar/entrar
  para quem pediu isso no sistema.
- Nenhuma dependência externa além do Google Fonts e do FormSubmit — a
  página pode ser publicada em qualquer hospedagem estática (GitHub Pages,
  Netlify, Vercel, ou até um servidor comum), bastando servir a raiz.

## 9. Como usar este guia na prática

Quando for montar a página da nova empresa: crie a pasta nova, jogue a
copy e os assets (logo + imagem do produto) dentro, e me passe junto este
`PROJETO.md` (ou só diga "é como o projeto Muambator, segue o
`PROJETO.md`"). Com a copy da nova empresa eu preencho a seção 6 deste
checklist e replico a mesma estrutura de `index.html`.

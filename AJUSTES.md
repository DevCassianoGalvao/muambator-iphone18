# Ajustes feitos na landing Mano Phone (base Muambator)

Este documento resume as mudanças feitas em cima do modelo original
(ver `PROJETO.md` do projeto Muambator) para virar a página da Mano Phone,
e como configurar o envio de leads pro Google Sheets. Serve de checklist
pra replicar os mesmos ajustes em outra página parecida.

## 1. Nome do produto — definir completo desde o início

**Lição aprendida:** no início colocamos só "iPhone 18" no título (headline)
da página, e só depois corrigimos pra "iPhone 18 Pro". Isso gerou retrabalho
de layout (o título quebrou linha de um jeito feio quando a palavra "Pro"
foi acrescentada).

**Pra próxima página:** decidir o nome completo do modelo (com Pro, Max,
Plus, etc. — o que for) **antes** de montar o título, e já testar a quebra
de linha do headline com o nome definitivo.

## 2. Identidade visual

- **Fonte:** trocamos a fonte de sistema padrão do modelo original pela
  **Host Grotesk** (Google Fonts), carregada junto com a Instrument Serif
  (que continua só no destaque itálico "reserva" / "Entre para a lista de
  espera"). Basta adicionar a família no mesmo `<link>` do Google Fonts e
  trocar o `font-family` do `body`.
- **Cor de marca (`--blue` / `--blue-press`):** usamos o tom de azul extraído
  do próprio logo da empresa (não o azul genérico do modelo original). Pra
  extrair: pegar a cor predominante do ícone/texto do logo (temos processo
  via PowerShell + `System.Drawing` pra amostrar pixels quando não dá pra
  usar Photoshop/Illustrator) e gerar uma variante mais escura pra hover
  (`--blue-press`, ~25% mais escuro).
- **Logo maior:** aumentamos `.hero-logo` de 44px pra 62px de altura —
  no modelo original ficava pequeno demais.

## 3. Diferenciação visual (pra não ficar clone do modelo original)

Pra a página não ficar 100% idêntica ao modelo Muambator usado de base,
mudamos alguns detalhes de forma (mantendo a estrutura/grid/JS iguais):

- **Eyebrow ("Pré-venda"):** virou um badge/pill com fundo azul claro
  (`rgba(--blue, .1)`), em vez de texto solto.
- **Botão CTA e botão de enviar:** cantos arredondados de 12px (em vez de
  pílula 100% redonda) + sombra azul suave.
- **Raio padrão dos cartões (`--radius`):** 14px → 16px.

## 4. Remoção das etiquetas de confiança (floating cards)

O modelo original tinha 2 selinhos flutuantes sobre a imagem do produto
("Novos e lacrados / com garantia" e "18x sem juros / no cartão"). Pra
Mano Phone, o cliente pediu pra remover — não fazia sentido pra copy dela.
Removemos o HTML (`.fcards`/`.fcard`) e todo o CSS morto correspondente
(inclusive nas media queries de responsividade).

**Atenção:** se a próxima empresa quiser manter selos de confiança, é só
não remover esse bloco (ver referência no `PROJETO.md`, seção 4.1). Se
quiser remover como fizemos aqui, lembrar de limpar o CSS nas 3 media
queries (960px, 860px, 560px) que mexiam nesses elementos.

## 5. Seção do formulário com fundo azul

Pedido do cliente pra diferenciar visualmente da referência: a seção
`.reserva` (onde fica o formulário) passou a ter:
- `background: var(--blue)` (era um cinza `--band`)
- Título (`h2`) e legenda (`.intro`) em branco / branco-translúcido
- O cartão do formulário (`.form-card`) continua **branco por dentro** —
  só o fundo da seção mudou, não o cartão.

## 6. Integração com Google Sheets (via Google Apps Script)

O modelo original manda o formulário pro FormSubmit (e-mail). Pra Mano
Phone, trocamos por um envio direto pra uma planilha do Google Sheets do
próprio cliente, sem precisar de backend nem senha de ninguém.

### Por que Apps Script e não outra coisa
- Gratuito, roda dentro da conta Google do próprio cliente.
- Não precisa compartilhar senha — o cliente cria/loga na conta dele e
  cola o script.
- Suficiente pra captar lead simples (não precisa de fila, autenticação
  de API, etc.).

### Passo a passo (repetir pra cada cliente/planilha nova)

1. Cliente abre a planilha dele → menu **Extensões → Apps Script**.
2. Apaga o conteúdo padrão e cola:

```javascript
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
  return ContentService.createTextOutput(JSON.stringify({status:'ok'}))
    .setMimeType(ContentService.MimeType.JSON);
}
```

   (Os campos do `appendRow` devem bater com as colunas da planilha e com
   as chaves do objeto `payload` que a página manda — ver seção seguinte.
   Pra outro produto/form, é só trocar os nomes dos campos aqui e no JS
   da página.)

3. Na primeira linha da aba da planilha, criar o cabeçalho correspondente:
   `Data | Nome | WhatsApp | E-mail | Modelo | Cor | Armazenamento`
   (ajustar conforme os campos do formulário novo).
4. No editor do Apps Script: **Implantar → Nova implantação**.
   - Clicar no ícone de engrenagem ao lado de "Selecione o tipo" pra abrir
     o dropdown (não aparece nada até clicar aí — ponto de confusão comum).
   - Escolher **Aplicativo da Web**.
   - "Executar como": **Eu**.
   - "Quem pode acessar": **Qualquer pessoa**.
   - Clicar em **Implantar**. Vai pedir autorização (tela "app não
     verificado" → **Avançado** → **Acessar [projeto] (não seguro)**) —
     isso é normal, é o próprio Google alertando que é um script pessoal.
5. Copiar a URL gerada (termina em `/exec`) e colar no `index.html`.

### O que muda no `index.html`

- **Removidos** os campos ocultos do FormSubmit (`_subject`, `_template`,
  `_captcha`). Mantido só o honeypot anti-spam (`_honey`).
- No `<script>`, trocamos a URL de destino:

```javascript
var SHEET_URL = 'https://script.google.com/macros/s/XXXXXXXX/exec';
```

- No `submit`, em vez de mandar o `FormData` inteiro (que tinha nomes de
  campo diferentes por modelo, tipo "Cor (18 Pro)" vs "Cor (18 Pro Max)"),
  montamos um objeto único a partir da seleção ativa e mandamos como JSON:

```javascript
var a = activeSelects(); // já existia no JS pra achar cor/armazenamento do modelo escolhido
var payload = {
  nome: nome.value,
  whats: whats.value,
  email: email.value,
  modelo: modelo.value,
  cor: a.cor ? a.cor.value : '',
  armazenamento: a.arm ? a.arm.value : ''
};

fetch(SHEET_URL, {
  method: 'POST',
  mode: 'no-cors',
  headers: { 'Content-Type': 'text/plain;charset=utf-8' },
  body: JSON.stringify(payload)
})
.then(function(){
  // mostra tela de sucesso
})
.catch(function(){
  // mostra erro (só dispara em falha de rede, não em erro do script)
});
```

**Limitação importante do `mode:'no-cors'`:** o navegador não deixa a
página ler a resposta do Apps Script (Google não manda os headers de CORS
nesse tipo de request). Isso significa que a tela de "sucesso" aparece
mesmo que o script do lado do Google Sheets falhe silenciosamente. Se
o cliente disser "não tá chegando na planilha", **não adianta olhar o
`catch` do JS** — tem que ir direto no Apps Script, aba **Execuções**
(ícone de relógio no menu lateral, não o botão "Executar" do editor) e ver
o log da execução mais recente feita a partir do site.

### Erros comuns na hora de testar

- **`Cannot read properties of undefined (reading 'postData')`**: normal
  se alguém clicar em "Executar" ou "Depuração" direto no editor do Apps
  Script pra testar — nesse caso não existe `e` (não veio de request HTTP
  nenhuma). Não é bug. Só testar de verdade enviando o formulário no site
  publicado e depois indo em "Execuções".
- **Nenhuma execução aparece depois de enviar o formulário pelo site**:
  a implantação (deploy) não existe, está desatualizada, ou a URL colada
  no `index.html` não bate com a URL de **Gerenciar implantações** do
  Apps Script.

## 7. Observação sobre hospedagem (cPanel)

Se o site for hospedado num cPanel que já tem outro site (ex.: WordPress)
rodando no domínio, a pasta do projeto **precisa ficar dentro do
`public_html`** (ou docroot equivalente) daquele domínio — não solta na
raiz do home do cPanel. Se ficar solta, a URL cai no roteamento do site
principal e mostra o 404 dele, não o `index.html` do projeto.

Se usar o recurso **Git Version Control** do próprio cPanel (diferente do
GitHub) pra puxar o repositório, o caminho configurado nesse repositório
precisa ser exatamente a pasta atual do site. Se a pasta for movida depois
(pra corrigir o problema acima, por exemplo), o Git Version Control do
cPanel passa a apontar pra um caminho que não existe mais e dá erro ao
"atualizar" — nesse caso é preciso remover e recriar o repositório
apontando pro caminho novo.

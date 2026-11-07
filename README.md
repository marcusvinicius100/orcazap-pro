# ⚡ OrçaZap Pro — Gerador de Orçamentos Comerciais, WhatsApp & PDF A4

Um Web App PWA (Progressive Web App) profissional e responsivo, construído com **React**, **TypeScript**, **Tailwind CSS**, **Vite** e **vite-plugin-pwa**, projetado especialmente para prestadores de serviços, autônomos e pequenas e médias empresas.

Pronto para deploy imediato na **Vercel** e 100% instalável em dispositivos móveis (Android e iOS).

---

## 🚀 Funcionalidades Principais

### 1. Layout em Duas Colunas (Desktop) & Abas Inteligentes (Mobile)
- **Desktop:** Tela dividida simultaneamente entre o **Painel de Edição** (à esquerda) e a **Folha Comercial A4 com Preview em Tempo Real** (à direita).
- **Mobile:** Alternância suave entre a aba `✏️ Painel de Edição` e a aba `📄 Folha A4 (Preview)`.

### 2. Painel de Edição Completo
- **Dados do Cliente:** Nome/Razão Social, WhatsApp com DDI/DDD, CPF/CNPJ, E-mail e Endereço de execução/entrega.
- **Tabela Dinâmica de Itens:**
  - Adicionar e remover linhas em tempo real.
  - Campos de Descrição, Unidade de medida (`un`, `hora`, `m²`, `serviço`, `dia`, etc.), Quantidade e Preço Unitário.
  - Cálculo automático de subtotais por item e subtotal geral.
- **Ajustes Financeiros:**
  - Desconto flexível em valor fixo (**R$**) ou percentual (**%**).
  - Taxa de deslocamento, combustível ou frete.
  - Total geral recalculado dinamicamente em tempo real.
- **Condições Comerciais:**
  - Formas de pagamento (PIX à vista, Cartão parcelado em até 12x, Boleto, Dinheiro, ou 50% entrada + 50% conclusão).
  - Chave PIX personalizada.
  - Prazos de entrega / execução.
  - Validade da proposta (em dias).
  - Termos de garantia e observações adicionais.

### 3. Folha Comercial A4 (Preview em Tempo Real)
- Visual limpo, executivo e moderno baseado nas medidas oficiais A4 (210mm x 297mm).
- Cabeçalho corporativo com dados da empresa emissora (Razão Social, Nome Fantasia, CNPJ/CPF, Telefone, E-mail, Endereço).
- Número único de orçamento (`ORC-AAAA-XXXX`) e datas de emissão/validade.
- Tabela zebrada de produtos e serviços.
- **Bloco de Pagamento PIX com QR Code dinâmico** gerado na hora no padrão canvas e botão de copiar chave.
- Campo formal para assinaturas do prestador e do contratante.

### 4. Integração Nativa com WhatsApp
- Botão **"Enviar p/ WhatsApp"** que formata uma proposta comercial completa com emojis profissionais, lista numerada dos itens, totais em destaque, prazos, condições e chave PIX.
- Abre diretamente o WhatsApp com o número e o texto pronto para envio com apenas um clique.

### 5. Exportação em PDF Impecável (@media print)
- Botão **"Imprimir / Salvar PDF"** utilizando regras estritas de CSS `@media print`.
- Oculta completamente cabeçalhos, botões, modais e fundos escuros do app, isolando a folha A4 com fundo branco cristalino e margens calibradas para salvar como PDF ou imprimir em alta definição.

### 6. Banco de Dados Local (LocalStorage)
- Persistência total dos dados de perfil da empresa prestadora.
- Histórico completo de orçamentos salvos na memória do navegador/aparelho.
- Sistema de busca em tempo real por cliente, número ou item.
- Filtros por status: *Rascunho*, *Enviado*, *Aprovado* e *Faturado*.
- Funções para recarregar no editor, duplicar ou excluir orçamentos.

### 7. BÔNUS EXTRA: Emissão de Nota Fiscal (Modo Sandbox / SEFAZ)
- Botão **"Emitir Nota Fiscal (Simulação)"**.
- Animação de transmissão com a SEFAZ de 2 segundos:
  - *"Conectando ao WebService Estadual (NFeAutorizacao4)..."*
  - *"Validando Certificado Digital A1 e Assinatura XML..."*
  - *"Autorização de Uso Concedida (Cód. 100 - Autorizado)..."*
- Atualiza automaticamente o status do orçamento para **"Faturado (NF-e)"**.
- Abre um **DANFE (Documento Auxiliar da Nota Fiscal Eletrônica)** visualmente fidedigno com Chave de Acesso de 44 dígitos gerada com dígito verificador matemático, código de barras simulado, protocolo de autorização, impostos, tabela de itens e botão de impressão fiscal.

### 8. Progressive Web App (PWA)
- Arquivo `manifest.webmanifest` gerado automaticamente.
- Service Worker com suporte offline integrado via Workbox.
- Ícones em alta resolução (192x192, 512x512, maskable e apple-touch-icon).
- Suporte a instalação na tela inicial no celular Android (Chrome) e iPhone (Safari).

---

## 🛠️ Tecnologias Utilizadas

- **React 18** com **TypeScript**
- **Vite 6**
- **Tailwind CSS 3**
- **vite-plugin-pwa** (Workbox PWA)
- **Lucide React** (Ícones modernos)
- **QRCode** (Geração de QR Code vetorial para PIX)
- **Sharp** (Geração e otimização de ícones PWA)

---

## 📦 Como Executar Localmente

1. Certifique-se de ter o **Node.js** (v18+) instalado.
2. Na raiz do projeto, instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Acesse no navegador em `http://localhost:5173`.

---

## 🌐 Como Fazer Deploy na Vercel

O projeto já inclui o arquivo `vercel.json` configurado para Single Page Applications (SPA) e Service Worker headers.

### Opção 1: Via GitHub (Recomendado)
1. Crie um repositório no seu GitHub e suba os arquivos do projeto:
   ```bash
   git init
   git add .
   git commit -m "feat: OrçaZap Pro PWA inicial"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/orcazap-pro.git
   git push -u origin main
   ```
2. Acesse [vercel.com](https://vercel.com) e clique em **"Add New Project"**.
3. Importe o repositório. O framework **Vite** será detectado automaticamente.
4. Clique em **"Deploy"**.

### Opção 2: Via Vercel CLI
```bash
npm install -g vercel
vercel
```

---

## 📱 Como Instalar no Celular (PWA)

### No Android (Google Chrome):
1. Acesse o link publicado na Vercel.
2. Clique no botão **"Instalar App"** na barra superior ou no menu de 3 pontinhos do Chrome > **"Adicionar à tela inicial"** ou **"Instalar aplicativo"**.

### No iOS / iPhone (Safari):
1. Acesse o link no Safari.
2. Toque no botão de **Compartilhar** (ícone do quadrado com a seta para cima).
3. Role para baixo e selecione **"Adicionar à Tela de Início"**.

---

Desenvolvido com foco em produtividade comercial e agilidade de fechamento de negócios!

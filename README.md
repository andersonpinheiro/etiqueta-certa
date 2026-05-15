# CorreioLabel — PWA de Etiquetas dos Correios

Sistema completo para geração de etiquetas e pré-postagens via API dos Correios do Brasil.

---

## Funcionalidades

| Módulo | Descrição |
|--------|-----------|
| **Credenciais** | Armazenamento seguro (localStorage criptografado em base64) de usuário, senha e cartão de postagem |
| **Token JWT** | Geração e renovação automática do token de acesso (válido por 24h) |
| **Etiqueta Individual** | Formulário completo com busca de CEP automática, seleção de serviço e serviços adicionais |
| **Lote CSV** | Upload de planilha com até 50 envios, processamento assíncrono com relatório de resultado |
| **Rastreamento** | Consulta de até 5 objetos simultâneos com timeline de eventos |
| **Preço e Prazo** | Simulação de frete comparando SEDEX, PAC e variantes em uma única tela |
| **Histórico** | Registro local de todas as pré-postagens, exportável em CSV |
| **PWA** | Instalável no celular e desktop, com suporte a Service Worker para uso offline parcial |

---

## Estrutura dos Arquivos

```
correios-etiquetas-pwa/
├── index.html      # App principal (HTML + CSS + JS em arquivo único)
├── sw.js           # Service Worker para PWA offline
├── manifest.json   # Manifest para instalação como APP
├── icon-192.png    # Ícone PWA 192x192 (você precisa criar)
├── icon-512.png    # Ícone PWA 512x512 (você precisa criar)
└── README.md       # Este arquivo
```

---

## Como Usar

### 1. Pré-requisitos
- Cadastro ativo no **Meu Correios** (meucorreios.correios.com.br)
- Contrato ativo com os Correios
- Cartão de Postagem com APIs habilitadas no CWS

### 2. Deploy Local (teste rápido)

Você pode abrir o `index.html` diretamente no navegador, mas para o PWA funcionar corretamente (Service Worker + HTTPS), use um servidor local:

```bash
# Com Python
python3 -m http.server 8080

# Com Node.js (npx)
npx serve .

# Com PHP
php -S localhost:8080
```

Acesse: `http://localhost:8080`

### 3. Deploy em Produção

Para uso real, hospede em qualquer servidor com **HTTPS obrigatório** (exigido pelas APIs dos Correios e pelo Service Worker):

#### Opções gratuitas:
- **Netlify** — Arraste a pasta para app.netlify.com
- **Vercel** — `npx vercel`
- **GitHub Pages** — Commit na branch `gh-pages`
- **Cloudflare Pages** — Conecte o repositório

#### Exemplo Netlify:
```bash
# Instale netlify-cli
npm install -g netlify-cli

# Faça deploy
netlify deploy --prod --dir=.
```

### 4. Configuração das APIs dos Correios

1. Acesse o [CWS dos Correios](https://cwshom.correios.com.br/) (homologação) ou [Produção](https://cws.correios.com.br/)
2. Faça login com seu usuário Meu Correios
3. Clique em **Credenciais** e crie uma **Senha de Componente**
4. Certifique-se que as APIs estão vinculadas ao seu Cartão de Postagem:
   - API CEP (Endereço v3)
   - API Preço v3
   - API Prazo v3
   - SRO Rastro
   - PMA Pré-Postagem

### 5. Primeiro Acesso no App

1. Abra o app e vá em **Credenciais**
2. Informe:
   - Usuário Meu Correios (e-mail)
   - Senha do Componente (criada no CWS, não a senha do Meu Correios)
   - Número do Cartão de Postagem
3. Selecione o ambiente (Homologação para testes, Produção para uso real)
4. Clique em **Salvar e Gerar Token**
5. Se tudo estiver correto, você verá "Token gerado com sucesso!"

---

## Formato do CSV para Lote

O arquivo CSV deve ter a seguinte estrutura (com cabeçalho):

```csv
rem_nome,rem_cep,rem_logradouro,rem_numero,rem_bairro,rem_cidade,rem_uf,dest_nome,dest_cep,dest_logradouro,dest_numero,dest_bairro,dest_cidade,dest_uf,servico,peso,altura,largura,comprimento
Minha Loja,01310100,Av Paulista,1578,Bela Vista,São Paulo,SP,João Silva,20040020,Av Rio Branco,156,Centro,Rio de Janeiro,RJ,03220,500,15,20,30
```

**Colunas obrigatórias:** `rem_nome`, `rem_cep`, `dest_nome`, `dest_cep`, `dest_numero`, `servico`, `peso`

**Codes de serviço comuns:**
| Código | Serviço |
|--------|---------|
| 03220 | SEDEX |
| 03298 | SEDEX 10 |
| 03204 | PAC |
| 04162 | SEDEX Contrato |
| 04669 | PAC Contrato |

---

## Instalação como APP (PWA)

### Android (Chrome)
1. Abra o site no Chrome
2. Menu (⋮) → "Adicionar à tela inicial"
3. Confirme a instalação

### iOS (Safari)
1. Abra o site no Safari
2. Botão compartilhar → "Adicionar à Tela de Início"

### Desktop (Chrome/Edge)
1. Abra o site
2. Ícone de instalação na barra de endereço
3. Clique em "Instalar"

---

## Ícones PWA (Necessário criar)

Para o PWA funcionar completamente, adicione os ícones:
- `icon-192.png` — 192×192px
- `icon-512.png` — 512×512px

Você pode gerar usando ferramentas como:
- [Favicon.io](https://favicon.io/)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)

---

## Segurança

- As credenciais são armazenadas **apenas no navegador** do usuário (localStorage)
- O token JWT é gerado e usado localmente — nunca enviado a servidores de terceiros
- Toda comunicação é direto com as APIs oficiais dos Correios via HTTPS
- Recomenda-se não usar em computadores compartilhados sem limpar os dados do navegador

---

## Limitações Conhecidas

- O download do PDF do rótulo depende da API assíncrona dos Correios — pode haver delay
- O rastreamento retorna apenas eventos já registrados no sistema SRO
- Lotes são processados sequencialmente (200ms entre requisições) para respeitar rate limits
- O token expira em 24h e precisa ser renovado manualmente ou automaticamente

---

## Suporte e Documentação Oficial

- [Portal Correios API](https://cws.correios.com.br/)
- [Documentação de Integração](https://www.correios.com.br/enviar/ferramentas-para-ecommerce/api-dos-correios)
- [Central de Atendimento](https://www.correios.com.br/falecomoscorreios/central-de-atendimento)

---

*CorreioLabel v1.0 — Desenvolvido com base no Manual de Integração Correios API v2.4 (04/2025)*

# SERCOMP — Cópia de Debug

Cópia do site original (`../Sercomp-Website`) modificada para inspecionar **tudo o que está escondido**: rotas removidas do menu, páginas órfãs, blocos comentados no JSX e elementos ocultos por CSS/DOM.

O projeto original **não foi alterado**.

## Online

- Site publicado: https://raiksan.github.io/Sercomp-Website-Debug/
- Repositório: https://github.com/Raiksan/Sercomp-Website-Debug

## Como rodar

```bash
cd Sercomp-Website-Debug
npm install
npm run dev
```

Acesse `http://localhost:5173` e clique no botão flutuante **🐞 DEBUG** no canto inferior direito.

Atalhos:

- `Ctrl + Shift + D` — abre/fecha o painel
- `Esc` — fecha o painel
- `?debug=1` ou `#debug` na URL — abre o painel automaticamente

## O que o modal oferece

### 1. Páginas

Lista todas as rotas escondidas, com aviso ou sem rota na cópia original:

| Rota | O que é |
|---|---|
| `/parceiros` | Página de parceiros (estava fora do menu e com logos comentados) |
| `/comite` | Carrossel do comitê (fora do menu; fotos/nomes comentados) |
| `/ideathon` | Regulamento do Ideathon (fora do menu e do hub de chamadas) |
| `/technology-fair` | Placeholder incompleto |
| `/registration` | Aviso que substituiu o formulário de inscrição |
| `/market` | Aviso que substituiu a loja |
| `/debug/inscricao` | **Formulário real de inscrição** (órfão no original) |
| `/debug/loja` | **Loja real com carrinho** (órfã no original) |
| `/debug/2024/artigos` | Chamada de artigos 2024 (sem rota no original) |
| `/debug/2024/hackathon` | Regulamento do Hackathon 2024 (sem rota) |
| `/debug/2024/ideathon` | Regulamento do Ideathon 2024 (sem rota) |
| `/debug/2024/maratona` | Regulamento da Maratona 2024 (sem rota) |
| `/debug/2024/chamadas` | Hub de chamadas 2024 (nunca renderizado) |

Também há o mapa completo de rotas com status (ativa, oculta, aviso, órfã, fluxo interno, debug, 404) e busca.

### 2. Conteúdo oculto

Interruptores que renderizam blocos que estavam comentados no código:

- Itens escondidos no menu (`Inscrição`, `Loja`, `Ideathon`, `Parceiros`, `Comitê`)
- Carrossel da organização na Home
- Card do Ideathon no hub de chamadas
- Logos dos 19 parceiros (página `/parceiros` + carrossel)
- Fotos, nomes e áreas dos 38 monitores (`/comite`)
- Seção “Mesa-redonda” de 2024
- Bloco completo da chamada de artigos de 2024
- Destaque visual (contorno verde tracejado) em tudo que foi revelado

As preferências ficam salvas em `localStorage` (`sercomp-debug-settings`).

### 3. DOM

Escaneia a página atual atrás de elementos com:

- `display: none`
- `visibility: hidden`
- `opacity: 0`
- atributo `hidden`
- sem dimensões na tela

Cada item mostra seletor, motivo e prévia do texto. É possível **revelar um**, **revelar todos** ou **restaurar**. Blocos comentados no código não existem no DOM — para eles, use a aba **Conteúdo oculto**.

### 4. Info

Modo do build, presença de `VITE_API_URL`/`VITE_EVENTO_UUID`, viewport, DPR, fuso, itens do carrinho no `localStorage`, contagem de blocos revelados e ações de reset.

## Modo demonstração (sem API)

Como o projeto não inclui um backend, as páginas órfãs que dependem da API usam **dados fictícios** quando `VITE_API_URL` não está definida (ou quando a API falha):

- `/debug/inscricao` — lotes, minicursos, workshops e oficinas de exemplo; o envio é simulado.
- `/debug/loja` — quatro produtos de exemplo; o carrinho funciona e a compra é simulada.

Um aviso amarelo “MODO DEBUG · dados fictícios” é exibido nessas páginas.

> Se você criar um `.env.local` com `VITE_API_URL` e `VITE_EVENTO_UUID`, as páginas voltam a usar a API real.

## Arquivos adicionados/alterados

Adicionados:

- `src/debug/DebugContext.jsx` — estado dos interruptores
- `src/debug/DebugPanel.jsx` + `DebugPanel.module.css` — modal
- `src/debug/debugRoutes.js` — inventário de rotas e toggles
- `src/debug/debugGlobal.css` — estilos de destaque
- `src/pages/PreviousEditions/2024/HiddenArticles2024.jsx` — bloco comentado de artigos 2024

Alterados:

- `src/App.jsx` — rotas `/debug/*` + `<DebugPanel />`
- `src/main.jsx` — `DebugProvider`
- `src/components/Navbar/Navbar.jsx` — itens escondidos no menu
- `src/components/Organization/Organization.jsx` — carrossel da organização
- `src/components/Partners/Partners.jsx` — logos no carrossel
- `src/pages/Partners/Partners.jsx` — logos na página
- `src/pages/Committee/Committee.jsx` — fotos/nomes do comitê
- `src/pages/Calls/Calls.jsx` e `src/data/CardsListCalls.jsx` — card do Ideathon
- `src/pages/PreviousEditions/2024/index.jsx` — mesa-redonda e artigos 2024
- `src/pages/Registrations/Registrations.jsx` — fallback de demonstração (sem reload em loop)
- `src/pages/Market/Market.jsx` — fallback de demonstração
- `src/components/ProductCard/ProductCard.jsx` — aceita camelCase e snake_case
- `src/components/EmailPopup/EmailPopup.jsx` — compra simulada sem API
- `package.json` — nome do projeto

## Observação

Esta cópia revela também bugs existentes no original (ex.: divergência de props entre `Market` e `ProductCard`, `roundData` de 2024 com `imagem`/`nome`). O mínimo necessário foi normalizado para que as partes escondidas fiquem visíveis; o objetivo não é corrigir o site, e sim permitir inspecioná-lo.

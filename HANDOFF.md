# HANDOFF — SERCOMP Website (cópia de debug)

> Documento de passagem de trabalho. Escrito em 2026-11-06.
> Leia as seções 3 (estado atual) e 9 (próximos passos) primeiro.

---

## 1. Objetivo do trabalho

Criar uma **cópia de debug** do site do SERCOMP com um painel que revela tudo o que está escondido
(rotas órfãs, blocos comentados no JSX, itens fora do menu), **publicar no GitHub** e **hospedar online**.

Restrição importante: o projeto original em `../Sercomp-Website` **não pode ser alterado** e não deve
receber push (o remote dele é `uepb-campusvii-computacao/Sercomp-Website`).

---

## 2. Links

| Item | URL |
|---|---|
| Site publicado | https://raiksan.github.io/Sercomp-Website-Debug/ |
| Repositório | https://github.com/Raiksan/Sercomp-Website-Debug |
| Branch que o Pages serve | `gh-pages` (build estático, gerada pelo Actions) |
| Branch de código | `main` |
| Repositório original (não tocar) | https://github.com/uepb-campusvii-computacao/Sercomp-Website |

---

## 3. Estado atual (o que está feito e o que falta)

### Feito e funcionando

- Cópia de debug em `D:\Trabajo\KNEX\Sercomp\Sercomp-Website-Debug` (original intacto).
- Painel flutuante **🐞 DEBUG** com 4 abas: `Páginas`, `Conteúdo oculto`, `DOM`, `Info`.
- Rotas só de debug criadas para páginas órfãs do original (ver seção 4).
- Fallback de dados fictícios quando não há API (`VITE_API_URL`), para inscrição e loja.
- Repositório GitHub criado e código publicado em `main`.
- GitHub Pages habilitado em modo **legacy (branch `gh-pages`)** — o modo `workflow`
  (`actions/deploy-pages`) falhou de forma persistente e foi abandonado (ver seção 6).
- Workflow `.github/workflows/deploy-pages.yml` reescrito: builda e empurra `dist/` para `gh-pages`.
- Primeiro deploy concluído com sucesso; `https://raiksan.github.io/Sercomp-Website-Debug/` responde **200**
  e os assets em `/Sercomp-Website-Debug/assets/...` também.

### Correção de links aplicada (commit `fff159d`) — VERIFICADA

O site subia, mas caía no 404 do próprio React em `/Sercomp-Website-Debug/`, e os links
(Sobre, Programação, Contato, logo, etc.) levavam para `https://raiksan.github.io/...` sem o
subdiretório — onde não existe site nenhum ("There isn't a GitHub Pages site here").

Causa raiz e correção estão na seção 5. O commit foi enviado para `main`, o workflow
`Deploy debug build to GitHub Pages` terminou com **sucesso** e o build do Pages subsequente ficou
`built`.

**Verificação feita** (screenshots headless em 2026-11-06, com o site já publicado):

| Verificação | Resultado |
|---|---|
| `/Sercomp-Website-Debug/` | Home renderiza (hero, menu, botão Inscreva-se) — sem 404 |
| `/Sercomp-Website-Debug/debug/loja` (deep link) | Loja carrega com produtos fictícios e aviso “MODO DEBUG” |
| `?debug=1` | Painel 🐞 abre na aba Páginas, listando as 14 rotas ocultas/órfãs |

### Rodada 2 — fluxos de demonstração e painel (commit `0793269`) — VERIFICADA

Depois da correção de links, sobravam dois problemas reais:

**1. Fluxo de pagamento travava em loading infinito.** `Payment.jsx` e `AllProductPayments.jsx`
nunca chamavam `setLoading(false)` no erro, então quem vinha da inscrição/loja em modo demo
ficava preso na tela de carregamento. Agora:

- Sem `VITE_API_URL` (ou em erro) as páginas usam recibo fictício + banner `DemoBanner`.
- `finally { setLoading(false) }` garante que o loading sempre termina.
- Estado vazio explícito (“Recibo não encontrado” / “Nenhuma compra encontrada”).
- `/busca/inscricao` em modo demo encaminha qualquer e-mail para o recibo fictício.

**2. O painel de debug tinha dois defeitos visuais.**

- O modal aparecia **transparente**: as animações `overlayIn`/`modalIn` animavam `opacity`,
  e o painel ficava semitransparente no momento da captura. As keyframes agora animam só
  `transform`; o painel é sempre opaco.
- Os grupos da aba “Conteúdo oculto” tinham ~64px de respiro extra por causa da regra global
  `section { padding: 2rem 0 }` do `index.css`. Corrigido com `.overlay section { padding: 0 }`
  no `DebugPanel.module.css`.

Também foi adicionado `?debug=1&tab=conteudo|dom|info|paginas` para abrir o painel direto numa aba
(usado para validar as três abas por screenshot).

**Verificação** (screenshots headless, build publicado):

| Verificação | Resultado |
|---|---|
| Aba `Conteúdo oculto` | Lista compacta, interruptores alinhados |
| Aba `DOM` | Encontrou 8 elementos escondidos e permite revelar |
| Aba `Info` | Build, viewport, fuso, localStorage e ações |
| `/pagamento/user/demo-user/lote/demo-lote` | Recibo fictício + banner + link de validação com a base correta |
| `/market/user/demo-user/pagamentos` | Recibo de compra fictício |
| `/busca/inscricao` | Formulário com aviso de busca simulada |
| `/chamadas`, `/articles`, `/hackathon`, `/programming-marathon`, `/2023`, `/2024`, `/registration`, `/market`, `/ideathon`, `/technology-fair`, `/privacy`, `/debug/inscricao` | Todas renderizam com conteúdo |

### Pendente / nice to have

1. ~~Confirmar deploy~~ — feito.
2. ~~Validar home e deep link~~ — feito.
3. Testar o clique nos links do menu e do footer (a verificação acima foi por URL direta; os `href`
   já estão todos com `withBase`, mas um clique real em cada item fecha o ciclo).
4. `npm run lint` continua com **39 erros pré-existentes** do código original (imports não usados em
   `orgData2023/2024.js`, `prop-types` em `toggleExpand.jsx`, `termsLink` em `Hackthon.jsx`, etc.).
   Nenhum afeta o build. O que era do nosso código (`process` em `vite.config.js`) já foi resolvido.

---

## 4. Arquitetura da cópia de debug

### Painel

| Arquivo | Papel |
|---|---|
| `src/debug/DebugPanel.jsx` | Modal com as 4 abas |
| `src/debug/DebugPanel.module.css` | Estilos do modal |
| `src/debug/DebugContext.jsx` | Estado dos toggles, persistido em `localStorage` (`sercomp-debug-settings`) |
| `src/debug/debugRoutes.js` | Inventário de rotas + definição dos toggles de conteúdo |
| `src/debug/debugGlobal.css` | Contorno verde tracejado no que foi revelado |

Atalhos: botão flutuante, `Ctrl + Shift + D`, `Esc` fecha, `?debug=1` ou `#debug` abre automático.

### Rotas criadas só nesta cópia

- `/debug/inscricao` — formulário real de inscrição (órfão no original)
- `/debug/loja` — loja real com carrinho (órfã no original)
- `/debug/2024/artigos`, `/debug/2024/hackathon`, `/debug/2024/ideathon`,
  `/debug/2024/maratona`, `/debug/2024/chamadas`

### Dados fictícios

`src/pages/Registrations/Registrations.jsx` e `src/pages/Market/Market.jsx` usam mock quando
`VITE_API_URL` não está definida (ou quando a chamada falha). Um aviso amarelo
“MODO DEBUG · dados fictícios” aparece nessas páginas.

---

## 5. O bug dos links — causa raiz e correção

**Causa:** o site é servido em subdiretório (`/Sercomp-Website-Debug/`), mas:

1. O `<BrowserRouter>` não tinha `basename`, então a rota `/` nunca casava com `/Sercomp-Website-Debug/`
   → renderizava o `Error404`. (Era o segundo print.)
2. Vários links internos são `<a href="/...">` absolutos (herdados do site original). Eles apontam
   para a raiz de `raiksan.github.io`, onde não existe Pages → “There isn't a GitHub Pages site here.”
   (Era o primeiro print.)

**Correção:**

- Novo helper `src/utils/withBase.js` — prefixa caminhos internos com `import.meta.env.BASE_URL`
  e exporta `BASE_PATH` (base sem barra final).
- `src/App.jsx`: `<Router basename={BASE_PATH || undefined}>`.
- Todos os `href` internos passaram a usar `withBase(...)`:
  `Navbar`, `Footer`, `Countdown`, `IconCard`, `Market`, `Registrations`, `App` (texto do aviso),
  `DebugPanel` (link “Abrir com ?debug=1”).
- `Payment.jsx` e `AllProductPayments.jsx`: `fullUrl` agora inclui a base.
- `vite.config.js`: `base: process.env.VITE_BASE || '/'`.

> Regra para o futuro: **nunca** use `href="/algo"` nem `src="/algo"` neste projeto.
> Use `<Link to="/algo">`, `navigate("/algo")` (o basename cuida) ou `href={withBase("/algo")}`.

---

## 6. Pipeline de deploy (e por que ficou assim)

```
push em main
   └─ Actions: "Deploy debug build to GitHub Pages"
        ├─ npm ci
        ├─ npm run build           (VITE_BASE=/<nome-do-repo>/)
        ├─ cp dist/index.html dist/404.html   (fallback SPA)
        ├─ touch dist/.nojekyll              (desliga Jekyll)
        ├─ rm -f dist/.htaccess
        └─ peaceiris/actions-gh-pages@v4 → branch gh-pages
                                           └─ Pages (modo legacy) publica gh-pages
```

**Por que não `actions/deploy-pages`:** a primeira tentativa usou o fluxo moderno
(`upload-pages-artifact` + `deploy-pages` com `build_type: workflow`). O job de deploy ficava
parado em `deployment_queued` e falhava com `Deployment failed, try again later.` de forma repetida.
O modo legacy com branch `gh-pages` funcionou de primeira, então foi mantido.

Configuração atual da API de Pages do repo: `build_type=legacy`, `source.branch=gh-pages`, `source.path=/`.

---

## 7. Armadilhas já encontradas (não repita)

1. **Primeiro build do Pages falha.** Ao habilitar o Pages, o primeiro build pode ficar horas em
   `building` e terminar em `Page build failed.` sem detalhe. Solução que funcionou: forçar novo build
   (`POST /repos/{owner}/{repo}/pages/builds`) — o segundo passou. Se voltar a acontecer, é só re-disparar.
2. **BOM em JSON derruba o build.** Um `Set-Content -Encoding utf8` no `package.json` adicionou BOM e o
   Vite quebrou no config do PostCSS. Se precisar reescrever arquivos JSON/config, use
   `[System.IO.File]::WriteAllText($path, $content, (New-Object System.Text.UTF8Encoding($false)))`.
3. **`gh` CLI não está instalado.** Toda operação no GitHub é feita via REST API com o token do
   Git Credential Manager (ver seção 8).
4. **Git Bash/PowerShell engole saída do git.** `git push` retorna exit code 1 mesmo dando certo
   (o PowerShell trata o stderr do git como erro). Confira a linha `xxx..yyy main -> main`.
5. **Deep link no Pages devolve 404 de propósito.** O `404.html` é uma cópia do `index.html`; o conteúdo
   carrega normalmente. Não é bug.
6. **CSS global vaza para dentro do painel.** `src/index.css` tem regras de elemento
   (`section { padding: 2rem 0 }`, `section h2 { margin-bottom: 4rem }`). Qualquer componente novo
   dentro do painel que use `<section>`/`<h2>` precisa resetar isso via `.overlay ...`.
7. **Animação com `opacity` atrapalha screenshot headless.** Capturas com Firefox headless pegam a
   animação no meio e o painel parece translúcido. Por isso as keyframes do painel animam só
   `transform`. Se for investigar transparência, desconfie disso antes de mexer nas cores.

---

## 8. Acessos

- Git configurado com Git Credential Manager para o usuário **Raiksan**.
- Token recuperável em qualquer shell com:

```powershell
$env:GIT_TERMINAL_PROMPT='0'; $env:GCM_INTERACTIVE='never'
$cred = "protocol=https`nhost=github.com`nusername=Raiksan`n`n" | git credential fill 2>$null
$token = (($cred | Select-String '^password=').Line -replace '^password=','')
$headers = @{ Authorization = "Bearer $token"; Accept = "application/vnd.github+json"; 'User-Agent' = 'handoff' }
```

- Escopos do token: `gist, repo, workflow`. **Não** inclui `user`, então `/user/emails` retorna 404.
- O workflow usa `secrets.GITHUB_TOKEN` (não precisa de PAT).

Comandos úteis (com `$headers` acima e `$repo='Raiksan/Sercomp-Website-Debug'`):

```powershell
# último run do Actions
Invoke-RestMethod "https://api.github.com/repos/$repo/actions/runs?per_page=3" -Headers $headers

# status/erro do último build do Pages
Invoke-RestMethod "https://api.github.com/repos/$repo/pages/builds?per_page=3" -Headers $headers

# forçar novo build do Pages
Invoke-RestMethod -Method Post "https://api.github.com/repos/$repo/pages/builds" -Headers $headers
```

---

## 9. Próximos passos (checklist)

- [x] Verificar o run do commit `fff159d` — workflow e build do Pages com sucesso.
- [x] Abrir a home publicada e confirmar que renderiza (feito por screenshot headless).
- [x] Abrir `/debug/loja` direto pela barra de endereço (fallback SPA + basename OK).
- [x] Abrir `?debug=1` e confirmar que o painel abre listando as rotas.
- [x] Percorrer as 4 abas do painel (`?tab=paginas|conteudo|dom|info`) — todas renderizam.
- [x] Validar os recibos fictícios de inscrição e de loja.
- [ ] Clicar em todo o menu e no footer; conferir que a URL sempre começa com `/Sercomp-Website-Debug/`.
- [ ] Percorrer as 4 abas do painel (Páginas → Conteúdo oculto → DOM → Info) e testar um toggle.
- [ ] Se algo quebrar: `npm run dev` em `http://localhost:5173` (base `/`), depois
      `VITE_BASE=/Sercomp-Website-Debug/ npm run build && npx vite preview` para reproduzir o subdiretório.
- [ ] Opcional: limpar `footerBackground` não usado em `Footer.jsx` para o `npm run lint` passar 100%.

### Como verificar o site publicado sem abrir o navegador

O Firefox da máquina funciona em modo headless e salva screenshot — foi assim que a verificação
acima foi feita (Chrome/Edge não estão instalados):

```powershell
$ff = "C:\Program Files\Mozilla Firefox\firefox.exe"
$prof = "$env:TEMP\ffprof"; if (Test-Path $prof) { Remove-Item $prof -Recurse -Force }
New-Item -ItemType Directory $prof | Out-Null
$env:MOZ_HEADLESS="1"
$out = "$env:TEMP\check.png"
Start-Process $ff -ArgumentList @("--headless","--no-remote","--profile",$prof,
  "--window-size=1440,900","--screenshot",$out,
  "https://raiksan.github.io/Sercomp-Website-Debug/") -PassThru -NoNewWindow |
  Wait-Process -Timeout 60
```

Depois é só abrir o `check.png`. (Sem `--profile` novo o Firefox costuma travar por causa do
perfil em uso.)

---

## 10. Rodar e testar localmente

```bash
cd D:\Trabajo\KNEX\Sercomp\Sercomp-Website-Debug
npm install
npm run dev          # http://localhost:5173  (base "/")

# simular o deploy (subdiretório):
VITE_BASE=/Sercomp-Website-Debug/ npm run build
npx vite preview     # serve em http://localhost:4173/Sercomp-Website-Debug/
```

Para simular o GitHub Pages de verdade (servindo `dist` em subpasta), copie `dist` para
`<tmp>\Sercomp-Website-Debug\`, duplique `index.html` como `404.html` e sirva `<tmp>` com
`python -m http.server`.

---

## 11. Mapa de arquivos relevantes

```
Sercomp-Website-Debug/
├─ vite.config.js                  base via VITE_BASE
├─ package.json                    nome "sercomp-site-debug"
├─ README-DEBUG.md                 doc do painel + URLs online
├─ HANDOFF.md                      este arquivo
├─ scripts/
│  └─ shot.ps1                     captura screenshot de rotas (Firefox headless)
├─ .github/workflows/
│  └─ deploy-pages.yml             build → gh-pages
└─ src/
   ├─ App.jsx                      Router com basename + rotas /debug/*
   ├─ main.jsx                     DebugProvider + css global de debug
   ├─ utils/withBase.js            helper de base URL  ← crítico para os links
   ├─ debug/
   │  ├─ DebugPanel.jsx            modal (4 abas + ?tab=)
   │  ├─ DebugPanel.module.css
   │  ├─ DebugContext.jsx          toggles + localStorage
   │  ├─ debugRoutes.js            inventário de rotas/toggles
   │  └─ debugGlobal.css
   ├─ components/
   │  ├─ DemoBanner/DemoBanner.jsx aviso “MODO DEBUG · dados fictícios”
   │  ├─ Navbar/Navbar.jsx         itens ocultos + hrefs com withBase
   │  ├─ Footer/Footer.jsx         links com withBase
   │  ├─ Countdown/Countdown.jsx   link /timeline com withBase
   │  └─ IconCard/IconCard.jsx     url com withBase
   └─ pages/
      ├─ Registrations/Registrations.jsx   mock sem API + link com withBase
      ├─ Market/Market.jsx                 mock sem API + link com withBase
      ├─ SearchRegistration/SearchRegistration.jsx  busca simulada
      ├─ Payment/Payment.jsx               recibo de inscrição fictício
      ├─ Payment/AllProductPayments.jsx    recibo de compra fictício
      ├─ PreviousEditions/2024/HiddenArticles2024.jsx   bloco comentado de 2024
      └─ Error404/Error404.jsx             o 404 do próprio site
```

---

## 12. Comandos de deploy manual (emergência)

Se precisar republicar sem esperar o Actions:

```powershell
cd Sercomp-Website-Debug
$env:VITE_BASE='/Sercomp-Website-Debug/'
npm run build
$tmp = "$env:TEMP\sercomp-gh-pages"
if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force }
New-Item -ItemType Directory $tmp | Out-Null
Copy-Item dist\* $tmp -Recurse
Remove-Item "$tmp\.htaccess" -ErrorAction SilentlyContinue
Copy-Item "$tmp\index.html" "$tmp\404.html"
New-Item -ItemType File "$tmp\.nojekyll" | Out-Null
cd $tmp
git init -b gh-pages; git add -A
git -c user.name="Raimundo" -c user.email="Raimundosegund17@outlook.com.br" commit -m "Deploy manual"
git remote add origin https://github.com/Raiksan/Sercomp-Website-Debug.git
git push -f origin gh-pages
```

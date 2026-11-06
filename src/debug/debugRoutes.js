/**
 * Inventário de rotas do site original + rotas exclusivas do modo debug.
 *
 * status:
 *  - active      → rota normal, presente no menu
 *  - hidden      → existe, mas está fora do menu ou tem conteúdo comentado
 *  - warning     → rota existe, mas mostra um aviso no lugar da página real
 *  - orphan      → página/arquivo existe no código, porém não tinha rota
 *  - flow        → rota interna (depende de parâmetros)
 *  - debug       → rota criada só nesta cópia de debug
 *  - error       → fallback 404
 */

export const routeStatusLabels = {
  active: "Ativa",
  hidden: "Oculta",
  warning: "Aviso",
  orphan: "Órfã",
  flow: "Fluxo interno",
  debug: "Rota debug",
  error: "404",
};

export const hiddenRoutes = [
  {
    path: "/parceiros",
    title: "Parceiros",
    status: "hidden",
    description:
      "A página existe e tem 19 parceiros cadastrados, mas os logos estavam comentados no JSX. Ative “Logos de parceiros” na aba Conteúdo oculto para vê-los.",
    revealKey: "revealPartnerLogos",
  },
  {
    path: "/comite",
    title: "Comitê",
    status: "hidden",
    description:
      "Carrossel com 38 monitores cadastrados. Foto, nome e área estavam comentados. Ative “Fotos e nomes do comitê” para revelar.",
    revealKey: "revealCommitteeInfo",
  },
  {
    path: "/ideathon",
    title: "Ideathon",
    status: "hidden",
    description:
      "Regulamento completo do Ideathon. Está roteado, mas foi removido do menu e do hub de chamadas.",
    revealKey: "revealIdeathonCard",
  },
  {
    path: "/technology-fair",
    title: "Feira Tecnológica (placeholder)",
    status: "hidden",
    description:
      "Página incompleta: renderiza apenas o texto “TechnologyFair”. Não aparece no menu.",
  },
  {
    path: "/about",
    title: "Sobre",
    status: "hidden",
    description:
      "Página institucional ativa, mas sem item próprio no menu (só link no rodapé).",
  },
  {
    path: "/registration",
    title: "Inscrição (aviso)",
    status: "warning",
    description:
      "A rota original do formulário de inscrição foi substituída pela tela de aviso “Inscrições encerradas”.",
  },
  {
    path: "/market",
    title: "Loja (aviso)",
    status: "warning",
    description:
      "A rota original da loja foi substituída pela tela de aviso “Pedidos online encerrados”.",
  },
];

export const orphanRoutes = [
  {
    path: "/debug/inscricao",
    title: "Formulário de inscrição completo",
    status: "debug",
    original: "src/pages/Registrations/Registrations.jsx",
    description:
      "Formulário real com nome, lote, minicursos, workshops e oficinas. Ficou órfão quando /registration virou aviso. Busca dados na API.",
  },
  {
    path: "/debug/loja",
    title: "Loja completa com carrinho",
    status: "debug",
    original: "src/pages/Market/Market.jsx",
    description:
      "Loja real com produtos da API, carrinho persistido em localStorage e popup de e-mail. Ficou órfã quando /market virou aviso.",
  },
  {
    path: "/debug/2024/artigos",
    title: "Artigos científicos 2024",
    status: "debug",
    original: "src/pages/PreviousEditions/2024/Articles/Articles.jsx",
    description: "Versão 2024 da chamada de artigos, sem rota na cópia original.",
  },
  {
    path: "/debug/2024/hackathon",
    title: "Hackathon 2024",
    status: "debug",
    original: "src/pages/PreviousEditions/2024/Hackthon/Hackthon.jsx",
    description: "Regulamento 2024 do Hackathon, sem rota na cópia original.",
  },
  {
    path: "/debug/2024/ideathon",
    title: "Ideathon 2024",
    status: "debug",
    original: "src/pages/PreviousEditions/2024/Ideathon/Ideathon.jsx",
    description: "Regulamento 2024 do Ideathon, sem rota na cópia original.",
  },
  {
    path: "/debug/2024/maratona",
    title: "Maratona de Programação 2024",
    status: "debug",
    original: "src/pages/PreviousEditions/2024/ProgrammingMarathon/ProgrammingMarathon.jsx",
    description: "Regulamento 2024 da Maratona, sem rota na cópia original.",
  },
  {
    path: "/debug/2024/chamadas",
    title: "Hub de chamadas 2024",
    status: "debug",
    original: "src/pages/PreviousEditions/2024/Chamadas/Chamadas.jsx",
    description: "Hub de chamadas de 2024, importado mas não renderizado.",
  },
];

export const allRoutes = [
  { path: "/", title: "Início", status: "active" },
  { path: "/chamadas", title: "Hub de chamadas", status: "active" },
  { path: "/articles", title: "Trabalhos científicos", status: "active" },
  { path: "/hackathon", title: "Hackathon", status: "active" },
  { path: "/programming-marathon", title: "Maratona de programação", status: "active" },
  { path: "/timeline", title: "Programação", status: "active" },
  { path: "/confirmed-activities", title: "Atividades confirmadas", status: "active" },
  { path: "/2024", title: "Edição 2024", status: "active" },
  { path: "/2023", title: "Edição 2023", status: "active" },
  { path: "/contact", title: "Contato", status: "active" },
  { path: "/privacy", title: "Políticas de privacidade", status: "active" },
  { path: "/about", title: "Sobre", status: "hidden" },
  { path: "/parceiros", title: "Parceiros", status: "hidden" },
  { path: "/comite", title: "Comitê", status: "hidden" },
  { path: "/ideathon", title: "Ideathon", status: "hidden" },
  { path: "/technology-fair", title: "Feira tecnológica (placeholder)", status: "hidden" },
  { path: "/registration", title: "Inscrição (aviso)", status: "warning" },
  { path: "/market", title: "Loja (aviso)", status: "warning" },
  { path: "/busca/inscricao/:searchType?", title: "Busca de inscrição", status: "flow" },
  { path: "/pagamento/user/:user_id/lote/:lote_id", title: "Pagamento de inscrição", status: "flow" },
  { path: "/market/user/:user_id/pagamentos", title: "Pagamentos da loja", status: "flow" },
  { path: "/debug/inscricao", title: "Inscrição completa (debug)", status: "debug" },
  { path: "/debug/loja", title: "Loja completa (debug)", status: "debug" },
  { path: "/debug/2024/artigos", title: "Artigos 2024 (debug)", status: "debug" },
  { path: "/debug/2024/hackathon", title: "Hackathon 2024 (debug)", status: "debug" },
  { path: "/debug/2024/ideathon", title: "Ideathon 2024 (debug)", status: "debug" },
  { path: "/debug/2024/maratona", title: "Maratona 2024 (debug)", status: "debug" },
  { path: "/debug/2024/chamadas", title: "Chamadas 2024 (debug)", status: "debug" },
  { path: "*", title: "Fallback 404", status: "error" },
];

export const contentToggles = [
  {
    key: "revealHiddenNav",
    group: "Navegação",
    label: "Itens escondidos no menu",
    description:
      "Adiciona Inscrição, Loja, Ideathon, Parceiros e Comitê ao menu, com etiqueta DEBUG.",
    where: "Navbar",
  },
  {
    key: "revealOrganization",
    group: "Home",
    label: "Carrossel da organização",
    description:
      "Revela título e fotos dos 26 integrantes da organização — o bloco estava comentado.",
    where: "Home → Organização",
  },
  {
    key: "revealIdeathonCard",
    group: "Chamadas",
    label: "Card do Ideathon",
    description:
      "Mostra o card do Ideathon no hub de chamadas — estava comentado em CardsListCalls.jsx.",
    where: "Chamadas",
  },
  {
    key: "revealPartnerLogos",
    group: "Parceiros",
    label: "Logos de parceiros",
    description:
      "Revela logos e links dos 19 parceiros na página /parceiros e no carrossel de parceiros.",
    where: "/parceiros + rodapé de várias páginas",
  },
  {
    key: "revealCommitteeInfo",
    group: "Comitê",
    label: "Fotos e nomes do comitê",
    description:
      "Revela foto, nome e área dos 38 monitores no carrossel da página /comite.",
    where: "/comite",
  },
  {
    key: "reveal2024RoundTable",
    group: "Edição 2024",
    label: "Mesa-redonda 2024",
    description:
      "Revela a seção “Mesa” da retrospectiva 2024, comentada no index.jsx.",
    where: "/2024",
  },
  {
    key: "reveal2024Articles",
    group: "Edição 2024",
    label: "Chamada de artigos 2024",
    description:
      "Revela o longo bloco de chamada de artigos de 2024 que está comentado no index.jsx.",
    where: "/2024",
  },
  {
    key: "highlightRevealed",
    group: "Aparência",
    label: "Destacar tudo que foi revelado",
    description:
      "Aplica contorno verde tracejado nos blocos revelados, para diferenciar do conteúdo normal.",
    where: "Site inteiro",
  },
];

export function routeStatusClass(status) {
  return `debugStatus--${status}`;
}

# Maré Viva

Uma página pessoal simples sobre animais marinhos, feita com HTML, CSS e JavaScript puro. O visual usa tons de azul, transições suaves e uma composição editorial responsiva para desktop e celular.

## O que o site faz

- Carrega informações e imagens de animais marinhos por meio da API pública da Wikipédia.

- Exibe cards com espécie, grupo, resumo e link para leitura complementar.

- Permite buscar por espécie e filtrar por grupo: mamíferos, peixes, répteis, invertebrados e aves.

- Mostra estados de carregamento, ausência de resultados e falha de consulta.

- Inclui uma alternância de tema e uma seção com sugestões de nomes para o projeto.

## Como executar

O projeto não usa dependências externas nem precisa de instalação de pacotes. Com o Node.js disponível, execute:

```
node server.mjs
```

Depois, abra `http://127.0.0.1:3000` no navegador. O servidor respeita a variável `PORT` quando ela estiver definida.

## Estrutura

| Arquivo | Função |
| --- | --- |
| `index.html` | Estrutura da página única e conteúdo editorial. |
| `styles.css` | Estilos, responsividade, estados de interação e animações. |
| `app.js` | Consulta à API, renderização dos cards, busca, filtros e tema. |
| `server.mjs` | Servidor HTTP local sem dependências. |
| `app.config.ts` | Metadado de identidade visual usado pelo projeto gerenciado. |
| `routes.json` | Fonte do manifesto técnico da rota principal. O servidor o expõe no endpoint `/manus-routes.json` exigido pelo preview. |
| `manus-webdev.json` | Declaração técnica da identidade do projeto gerenciado. |

`manus-webdev.json` é mantido com esse nome porque o Webdev usa esse arquivo para reconhecer a identidade do projeto gerenciado. O nome não aparece na interface visual do site.

## API

A página consulta a API MediaWiki da Wikipédia em português diretamente no navegador. Se a fonte não responder, o site informa o erro e oferece uma nova tentativa.
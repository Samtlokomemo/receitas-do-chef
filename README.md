# Receitas do Chef

## Descrição do Projeto

O **Receitas do Chef** é uma aplicação web desenvolvida para ser um catálogo de receitas acessível, moderno e interativo. Com a premissa de oferecer "cozinha simples e sabor de casa", o projeto permite aos usuários buscar rapidamente por pratos doces, salgados ou agridoces.

O grande diferencial do projeto é a união de uma interface rica, contando com elementos 3D interativos (renderizados via Three.js) na tela inicial, com um forte compromisso com a **acessibilidade digital**, garantindo que pessoas com diferentes necessidades possam navegar e consumir o conteúdo de forma autônoma e sem barreiras.

## Páginas

- **index.html** — Página inicial com catálogo de receitas, busca, filtros, paginação e modelo 3D interativo do chapéu de chef.
- **login.html** — Página de login com autenticação local, animações de entrada via GSAP e background 3D com partículas e torus knot via Three.js.
- **perfil.html** — Página de perfil do usuário com avatar, dados pessoais, receitas favoritas, animações GSAP e background 3D com icosaedro e partículas via Three.js.

## Funcionalidades Principais

- Busca e filtragem rápida de receitas pelo catálogo.
- Visualização de modelo 3D interativo na página inicial.
- Login e perfil de usuário com persistência em localStorage.
- **Foco em Acessibilidade:**
  - [x] Integração com a ferramenta VLibras (tradução para Libras).
  - [x] Suporte completo a navegação por teclado (skip link, focus trap, focus-visible).
  - [x] Modo Escuro.
  - [x] Modo de Alto Contraste Claro e Escuro para pessoas com baixa visão.
  - [x] Alteração de tamanho da fonte (aumentar, diminuir e resetar).
  - [x] Respeito à preferência de movimento reduzido (`prefers-reduced-motion`).

## Bibliotecas de Animação e Manipulação

| Biblioteca   | Uso no Projeto                                                                                                                                                                                                                |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Three.js** | Renderização de objetos 3D interativos: modelo GLB do chapéu de chef na index, partículas + torus knot animados no login, icosaedro wireframe + partículas esféricas + anel no perfil. Todos respondem ao movimento do mouse. |
| **GSAP**     | Animações de entrada (fade-in + slide-up com stagger) nos cards de login e perfil. Na index, animação de carregamento dos cards de receitas e modais via ScrollTrigger.                                                       |
| **Lenis**    | Scroll suave em todas as páginas, com integração ao GSAP ScrollTrigger na index e modo nativo (requestAnimationFrame) no login e perfil.                                                                                      |

## Como Executar o Projeto

### Para testar localmente, siga os passos abaixo:

1. Faça o clone deste repositório:

```bash
git clone https://github.com/Samtlokomemo/projeto-acessivel.git
```

2. Abra a pasta raiz do projeto.
3. Dê um clique duplo no arquivo `index.html` para abri-lo direto no seu navegador.

> **Nota:** Para que o Three.js funcione corretamente via ES Modules, o projeto precisa ser servido por um servidor HTTP local (ex: extensão Live Server no VS Code, ou `python3 -m http.server`). Abrir o arquivo diretamente (`file://`) pode bloquear os imports.

O projeto também pode ser acessado diretamente pelo [GitHub Pages](https://samtlokomemo.github.io/projeto-acessivel/).

## Tecnologias Utilizadas

- HTML5 & CSS3 (Flexbox, Grid, Layouts responsivos)
- JavaScript (ES Modules, Lógica de interface e acessibilidade)
- Three.js (Renderização de modelos e cenas 3D)
- GSAP + ScrollTrigger (Animações fluídas de entrada e scroll)
- Lenis (Scroll suave)
- VLibras (Acessibilidade — tradução para Libras)
- Font Awesome (Ícones)
- Google Fonts (Inter, Nunito)

## Equipe

- [Samuel Rocha](https://github.com/Samtlokomemo) — Implementação da navegação por teclado e modelo 3D via Three.js
- [Ingrid Vitória](https://github.com/Ingrid-Vitoriaa) — Implementação da ferramenta VLibras e animação de carregamento dos cards via GSAP
- [Pedro Santos](https://github.com/Pedrosmn) — Implementação da API e animação dos modais via GSAP
- [Hugo Ryan](https://github.com/hugo-ryan) — Implementação do modo alto contraste
- [Gustavo Lins](https://github.com/BABABEA-0) — Implementação da alteração de tamanho da fonte
- [Luiz Fernando](https://github.com/Luiz-Fernando-Policarpo-Leandro) — Implementação da página de login, perfil, animações GSAP, backgrounds 3D via Three.js e scroll suave via Lenis

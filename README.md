# Receitas do Chef

## Descrição do Projeto
O **Receitas do Chef** é uma aplicação web desenvolvida para ser um catálogo de receitas acessível, moderno e interativo. Com a premissa de oferecer "cozinha simples e sabor de casa", o projeto permite aos usuários buscar rapidamente por pratos doces, salgados ou agridoces. 

O grande diferencial do projeto é a união de uma interface rica, contando com elementos 3D interativos (renderizados via Three.js) na tela inicial, com um forte compromisso com a **acessibilidade digital**, garantindo que pessoas com diferentes necessidades possam navegar e consumir o conteúdo de forma autônoma e sem barreiras.

## Funcionalidades Principais
* Busca e filtragem rápida de receitas pelo catálogo.
* Visualização de modelo 3D interativo na página inicial.
* **Foco em Acessibilidade:**
  - [x] Integração com a ferramenta VLibras.
  - [x] Suporte completo a Navegação por Teclado.
  - [x] Modo de Alto Contraste para pessoas com baixa visão.
  - [ ] Alteração de tamanho da Fonte (Em desenvolvimento).

## Como Executar o Projeto
### Para testar localmente, siga os passos abaixo:
1. Faça o clone deste repositório:
   ```bash
   git clone https://github.com/Samtlokomemo/projeto-acessivel.git
   ```
2. Abra a pasta raiz do projeto.
3. Dê um clique duplo no arquivo index.html para abri-lo direto no seu navegador.

O projeto também pode ser acessado diretamente pelo [GitHub Pages](https://samtlokomemo.github.io/projeto-acessivel/).

## Tecnologias Utilizadas
- HTML5 & CSS3 (Flexbox, Layouts responsivos)
- JavaScript (Lógica de interface e acessibilidade)
- Three.js (Renderização de modelo 3D)
- GSAP (Animações fluídas)

## Equipe
- [Samuel Rocha](https://github.com/Samtlokomemo) : Implementação da navegação por teclado e implementação do modelo 3d via ThreeJs.
- [Ingrid Vitória](https://github.com/Ingrid-Vitoriaa) : Implementação da ferramenta VLibras e animação de carregamento dos cards via GSAP.
- [Pedro Santos](https://github.com/Pedrosmn) : Implementação da API e animação dos modais via GSAP.
- [Hugo Ryan](https://github.com/hugo-ryan) : Implementaão do modo alto contraste
- [Gustavo Lins](https://github.com/BABABEA-0) : Implementação da alteração de tamanho da fonte
- [Luiz Fernando](https://github.com/Luiz-Fernando-Policarpo-Leandro) : Implementação da página de login


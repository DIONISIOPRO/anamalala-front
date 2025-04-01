document.addEventListener('DOMContentLoaded', function() {
    // Modal de Nova Mensagem
    const composeBtn = document.getElementById('composeBtn');
    const composeModal = document.getElementById('composeModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
  
    composeBtn.addEventListener('click', function() {
      composeModal.style.display = 'flex';
    });
  
    closeModalBtn.addEventListener('click', function() {
      composeModal.style.display = 'none';
    });
  
    // Função para buscar e exibir mensagens da API
    function buscarMensagens() {
      fetch('https://64.23.215.68:8080/mensagens') // Substitua '/mensagens' pelo endpoint correto
        .then(response => {
          if (!response.ok) {
            throw new Error('Erro na requisição: ' + response.status);
          }
          return response.json();
        })
        .then(data => {
          exibirMensagens(data);
        })
        .catch(error => {
          console.error('Erro ao buscar mensagens:', error);
        });
    }
  
    // Função para exibir as mensagens na tabela
    function exibirMensagens(mensagens) {
      const tabelaMensagens = document.querySelector('.message-list tbody');
      tabelaMensagens.innerHTML = ''; // Limpa a tabela
  
      mensagens.forEach(mensagem => {
        const linha = document.createElement('tr');
        linha.innerHTML = `
          <td>${mensagem.titulo}</td>
          <td>${mensagem.destinatarios}</td>
          <td>${mensagem.data}</td>
          <td><span class="status-badge ${mensagem.estado}">${mensagem.estadoTexto}</span></td>
          <td>${mensagem.estatisticas}</td>
          <td class="action-cell">
            <button class="action-btn">👁️</button>
            <button class="action-btn">🔄</button>
            <button class="action-btn">🗑️</button>
          </td>
        `;
        tabelaMensagens.appendChild(linha);
      });
    }
  
    // Chama a função para buscar mensagens ao carregar a página
    buscarMensagens();
  
    // Implementação dos filtros
    const provinciaFilter = document.querySelector('.filter-select:nth-of-type(1)');
    const estadoFilter = document.querySelector('.filter-select:nth-of-type(2)');
    const dataFilter = document.querySelector('.filter-select:nth-of-type(3)');
    const searchInput = document.querySelector('.search-input');
  
    function aplicarFiltros() {
      const provincia = provinciaFilter.value;
      const estado = estadoFilter.value;
      const data = dataFilter.value;
      const pesquisa = searchInput.value;
  
      fetch(`https://64.23.215.68:8080/mensagens?provincia=${provincia}&estado=${estado}&data=${data}&pesquisa=${pesquisa}`)
        .then(response => response.json())
        .then(data => exibirMensagens(data))
        .catch(error => console.error('Erro ao filtrar:', error));
    }
  
    provinciaFilter.addEventListener('change', aplicarFiltros);
    estadoFilter.addEventListener('change', aplicarFiltros);
    dataFilter.addEventListener('change', aplicarFiltros);
    searchInput.addEventListener('input', aplicarFiltros);
  
    // Implementação da paginação
    function buscarPaginacao(page){
      fetch(`https://64.23.215.68:8080/mensagens?page=${page}`)
      .then(response => response.json())
      .then(data => {
        exibirMensagens(data.mensagens);
        atualizarPaginacao(data.totalPaginas, page);
      })
      .catch(error => console.error("Erro ao buscar paginação", error));
    }
  
    function atualizarPaginacao(totalPaginas, paginaAtual){
      const pageButtons = document.querySelector(".page-buttons");
      pageButtons.innerHTML = "";
      for(let i = 1; i <= totalPaginas; i++){
        const button = document.createElement("button");
        button.textContent = i;
        button.classList.add("page-btn");
        if(i === paginaAtual){
          button.classList.add("active");
        }
        button.addEventListener("click", () => buscarPaginacao(i));
        pageButtons.appendChild(button);
      }
    }
    buscarPaginacao(1);
  
  });


  function checkAuth() {
    const token = getAuthToken();
    if (!token) {
        // Redirecionar para a página de login se não estiver autenticado
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

(async function init() {
  checkAuth()
})()
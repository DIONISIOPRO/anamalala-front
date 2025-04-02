document.addEventListener('DOMContentLoaded', function() {
    const suggestionsTable = document.querySelector('.suggestion-list tbody');
    const totalSuggestionsStat = document.getElementById('totalSuggestions');
    const newSuggestionsStat = document.getElementById('newSuggestions');
    const implementedSuggestionsStat = document.getElementById('implementedSuggestions');
    const implementationRateStat = document.getElementById('implementationRate');
    const suggestionDetailModal = document.getElementById('suggestionDetailModal');
    const closeDetailModalBtn = document.getElementById('closeDetailModalBtn');
    const modalTitle = document.querySelector('.modal-title');
    const suggestionMeta = document.querySelector('.suggestion-meta');
    const suggestionContent = document.querySelector('.suggestion-content p');
    const statusSelect = document.querySelector('.form-control');
    const responseTextarea = document.querySelector('.response-section textarea');
    const paginationInfo = document.querySelector('.page-info');
    const paginationButtons = document.querySelector('.page-buttons');

    const statusFilter = document.getElementById('statusFilter');
    const provinceFilter = document.getElementById('provinceFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const searchInput = document.getElementById('searchInput');
    const filterBtn = document.getElementById('filterBtn');

    let allSuggestions = [];
    let filteredSuggestions = [];
    let currentPage = 1;
    const suggestionsPerPage = 7;

    async function fetchSuggestions() {
        try {
            const response = await fetch('https://freesexy.net:8080/suggestions');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            allSuggestions = data;
            filteredSuggestions = [...allSuggestions];
            updateStats(allSuggestions);
            updateTable(filteredSuggestions.slice(0, suggestionsPerPage));
            updatePagination();
        } catch (error) {
            console.error('Erro ao buscar sugestões:', error);
        }
    }

    function updateStats(suggestions) {
        totalSuggestionsStat.textContent = suggestions.length;
        newSuggestionsStat.textContent = suggestions.filter(s => s.estado === 'Novo').length;
        implementedSuggestionsStat.textContent = suggestions.filter(s => s.estado === 'Implementado').length;
        const rate = (suggestions.filter(s => s.estado === 'Implementado').length / suggestions.length) * 100;
        implementationRateStat.textContent = rate.toFixed(1) + '%';
    }

    function updateTable(suggestions) {
        suggestionsTable.innerHTML = '';
        suggestions.forEach((suggestion, index) => {
            const row = suggestionsTable.insertRow();
            row.innerHTML = `
                <td>${suggestion.titulo}</td>
                <td>${suggestion.usuario}</td>
                <td>${suggestion.provincia}</td>
                <td>${suggestion.data}</td>
                <td>${suggestion.categoria}</td>
                <td><span class="status-badge ${suggestion.estado.toLowerCase().replace(' ', '-')}">${suggestion.estado}</span></td>
                <td class="action-cell">
                    <button class="action-btn view-btn" data-index="${index}">️</button>
                    <button class="action-btn edit-btn">✏️</button>
                    <button class="action-btn delete-btn">️</button>
                </td>
            `;
        });
        const viewBtns = document.querySelectorAll('.view-btn');
        viewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.getAttribute('data-index'));
                showSuggestionDetails(suggestions[index]);
            });
        });
    }

    function showSuggestionDetails(suggestion) {
        modalTitle.textContent = suggestion.titulo;
        suggestionMeta.innerHTML = `
            <div class="suggestion-meta-item"><i></i> ${suggestion.usuario}</div>
            <div class="suggestion-meta-item"><i></i> ${suggestion.provincia}</div>
            <div class="suggestion-meta-item"><i></i> ${suggestion.data}</div>
            <div class="suggestion-meta-item"><i>️</i> ${suggestion.categoria}</div>
            <div class="suggestion-meta-item"><span class="status-badge ${suggestion.estado.toLowerCase().replace(' ', '-')}">${suggestion.estado}</span></div>
        `;
        suggestionContent.textContent = suggestion.conteudo;
        statusSelect.value = suggestion.estado.toLowerCase().replace(' ', '-');
        responseTextarea.value = suggestion.resposta || '';
        suggestionDetailModal.style.display = 'flex';
    }

    function updatePagination() {
        const totalPages = Math.ceil(filteredSuggestions.length / suggestionsPerPage);
        paginationInfo.textContent = `Mostrando ${((currentPage - 1) * suggestionsPerPage) + 1}-${Math.min(currentPage * suggestionsPerPage, filteredSuggestions.length)} de ${filteredSuggestions.length} sugestões`;
        let buttonsHTML = `<button class="page-btn prev-page">«</button>`;
        for (let i = 1; i <= totalPages; i++) {
            buttonsHTML += `<button class="page-btn page-number ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }
        buttonsHTML += `<button class="page-btn next-page">»</button>`;
        paginationButtons.innerHTML = buttonsHTML;

        document.querySelectorAll('.page-number').forEach(btn => {
            btn.addEventListener('click', () => {
                currentPage = parseInt(btn.getAttribute('data-page'));
                updateTable(filteredSuggestions.slice((currentPage - 1) * suggestionsPerPage, currentPage * suggestionsPerPage));
                updatePagination();
            });
        });

        document.querySelector('.prev-page').addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                updateTable(filteredSuggestions.slice((currentPage - 1) * suggestionsPerPage, currentPage * suggestionsPerPage));
                updatePagination();
            }
        });

        document.querySelector('.next-page').addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                updateTable(filteredSuggestions.slice((currentPage - 1) * suggestionsPerPage, currentPage * suggestionsPerPage));
                updatePagination();
            }
        });
    }

    closeDetailModalBtn.addEventListener('click', () => {
        suggestionDetailModal.style.display = 'none';
    });

    filterBtn.addEventListener('click', () => {
        applyFilters();
    });

    function applyFilters() {
        let filtered = [...allSuggestions];

        const statusValue = statusFilter.value;
        const provinceValue = provinceFilter.value;
        const categoryValue = categoryFilter.value;
        const searchValue = searchInput.value.toLowerCase();

        if (statusValue) {
            filtered = filtered.filter(s => s.estado.toLowerCase().replace(' ', '-') === statusValue);
        }
        if (provinceValue) {
            filtered = filtered.filter(s => s.provincia.toLowerCase() === provinceValue);
        }
        if (categoryValue) {
            filtered = filtered.filter(s => s.categoria.toLowerCase() === categoryValue);
        }
        if (searchValue) {
            filtered = filtered.filter(s => s.titulo.toLowerCase().includes(searchValue) || s.usuario.toLowerCase().includes(searchValue));
        }

        filteredSuggestions = filtered;
        currentPage = 1;
        updateStats(filteredSuggestions);
        updateTable(filteredSuggestions.slice(0, suggestionsPerPage));
        updatePagination();
    }

    fetchSuggestions();
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
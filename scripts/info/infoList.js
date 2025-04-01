// Configuration
const API_BASE_URL = 'https://64.23.215.68:8080';
const ARTICLES_PER_PAGE = 6; // Number of articles displayed per page

// State management
let currentPage = 1;
let totalPages = 1;
let articlesList = [];

// DOM elements
const articlesContainer = document.querySelector('.grid');
const paginationContainer = document.querySelector('.mt-8 .flex.justify-center nav');
const searchInput = document.querySelector('input[placeholder="Pesquisar informações..."]');

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  // Get the page from URL if it exists
  const urlParams = new URLSearchParams(window.location.search);
  const pageParam = urlParams.get('page');
  
  if (pageParam && !isNaN(pageParam)) {
    currentPage = parseInt(pageParam);
  }
  
  // Load articles for current page
  fetchArticles(currentPage);
  
  // Add search functionality
  if (searchInput) {
    searchInput.addEventListener('keyup', debounce(handleSearch, 500));
  }
});

// Fetch articles from API
async function fetchArticles(page, searchTerm = '') {
  try {
    // Show loading state
    articlesContainer.innerHTML = '<div class="col-span-3 text-center py-10">Carregando artigos...</div>';
    
    // Build API URL
    let url = `${API_BASE_URL}/articles?page=${page}&limit=${ARTICLES_PER_PAGE}`;
    if (searchTerm) {
      url += `&search=${encodeURIComponent(searchTerm)}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Erro ao carregar artigos');
    }
    
    // Expecting response format: { data: [...articles], totalPages: number }
    const result = await response.json();
    
    articlesList = result.data || [];
    totalPages = result.totalPages || 1;
    
    // Render articles and pagination
    renderArticles(articlesList);
    renderPagination(currentPage, totalPages);
    
    // Add event listeners to article links
    addArticleLinkListeners();
    
  } catch (error) {
    console.error('Error fetching articles:', error);
    articlesContainer.innerHTML = `
      <div class="col-span-3 text-center py-10 text-red-600">
        <p>Erro ao carregar artigos. Por favor, tente novamente mais tarde.</p>
      </div>
    `;
  }
}

// Render articles to the page
function renderArticles(articles) {
  if (!articles.length) {
    articlesContainer.innerHTML = '<div class="col-span-3 text-center py-10">Nenhum artigo encontrado.</div>';
    return;
  }
  
  articlesContainer.innerHTML = articles.map(article => `
    <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <img src="${article.imageUrl || '/api/placeholder/400/200'}" alt="${article.title}" class="w-full h-48 object-cover">
      <div class="p-4">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm ${getCategoryColor(article.category)} font-semibold">${article.category || 'Artigo'}</span>
          <span class="text-xs text-gray-500">${formatDate(article.date)}</span>
        </div>
        <h3 class="text-xl font-bold mb-2">${article.title}</h3>
        <p class="text-gray-600 mb-4 line-clamp-3">${article.summary}</p>
        <a href="artigo.html?id=${article.id}" class="text-blue-600 hover:text-blue-800 font-medium flex items-center article-link" data-id="${article.id}">
          Ler mais
          <i class="fas fa-arrow-right ml-1 text-sm"></i>
        </a>
      </div>
    </div>
  `).join('');
}

// Add event listeners to article links
function addArticleLinkListeners() {
  document.querySelectorAll('.article-link').forEach(link => {
    link.addEventListener('click', handleArticleClick);
  });
}

// Handle article link clicks
function handleArticleClick(e) {
  // You can use the default link behavior (since we've set the href attribute properly)
  // But if you need additional functionality before navigation, you can add it here:
  
  const articleId = e.currentTarget.getAttribute('data-id');
  
  // You could do additional things here if needed, like:
  // - Save current filter/search state to localStorage for when user returns
  // - Track analytics
  // - Show a loading indicator
  
  console.log(`Navigating to article ${articleId}`);
  
  // If you want to handle navigation programmatically rather than through the href:
  // e.preventDefault();
  // window.location.href = `artigo.html?id=${articleId}`;
}

// Render pagination controls
function renderPagination(currentPage, totalPages) {
  // Don't show pagination if there's only one page
  if (totalPages <= 1) {
    paginationContainer.innerHTML = '';
    return;
  }
  
  // Create a range of pages to show
  let pageRange = [];
  const maxVisiblePages = 5;
  
  if (totalPages <= maxVisiblePages) {
    // Show all pages if there are fewer than maxVisiblePages
    pageRange = Array.from({ length: totalPages }, (_, i) => i + 1);
  } else {
    // Show a range of pages around the current page
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start page if we're near the end
    if (endPage === totalPages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    pageRange = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }
  
  // Build pagination HTML
  let paginationHTML = `
    <a href="#" class="px-3 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 ${currentPage === 1 ? 'opacity-50 pointer-events-none' : ''}" data-page="${currentPage - 1}">Anterior</a>
  `;
  
  // Add first page if not in range
  if (!pageRange.includes(1)) {
    paginationHTML += `
      <a href="#" class="px-3 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-100" data-page="1">1</a>
      <span class="px-2 text-gray-600">...</span>
    `;
  }
  
  // Add page numbers
  pageRange.forEach(page => {
    paginationHTML += `
      <a href="#" class="px-3 py-1 rounded border ${page === currentPage ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}" data-page="${page}">${page}</a>
    `;
  });
  
  // Add last page if not in range
  if (!pageRange.includes(totalPages) && totalPages > 1) {
    paginationHTML += `
      <span class="px-2 text-gray-600">...</span>
      <a href="#" class="px-3 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-100" data-page="${totalPages}">${totalPages}</a>
    `;
  }
  
  paginationHTML += `
    <a href="#" class="px-3 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 ${currentPage === totalPages ? 'opacity-50 pointer-events-none' : ''}" data-page="${currentPage + 1}">Próxima</a>
  `;
  
  paginationContainer.innerHTML = paginationHTML;
  
  // Add event listeners to pagination links
  document.querySelectorAll('.mt-8 .flex.justify-center nav a[data-page]').forEach(link => {
    link.addEventListener('click', handlePaginationClick);
  });
}

// Handle pagination link clicks
function handlePaginationClick(e) {
  e.preventDefault();
  const page = parseInt(e.currentTarget.getAttribute('data-page'));
  
  if (isNaN(page) || page < 1 || page > totalPages) {
    return;
  }
  
  currentPage = page;
  
  // Update URL with the new page
  const url = new URL(window.location);
  url.searchParams.set('page', currentPage);
  window.history.pushState({}, '', url);
  
  // Fetch articles for the new page
  fetchArticles(currentPage, searchInput?.value || '');
  
  // Scroll to top of the articles section
  window.scrollTo({
    top: document.querySelector('.container').offsetTop,
    behavior: 'smooth'
  });
}

// Handle search input
function handleSearch(e) {
  const searchTerm = e.target.value.trim();
  currentPage = 1; // Reset to first page when searching
  fetchArticles(currentPage, searchTerm);
  
  // Update URL to reflect search
  const url = new URL(window.location);
  if (searchTerm) {
    url.searchParams.set('search', searchTerm);
  } else {
    url.searchParams.delete('search');
  }
  url.searchParams.set('page', 1);
  window.history.pushState({}, '', url);
}

// Utility: Debounce function for search input
function debounce(func, delay) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

// Utility: Format date
function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch (e) {
    return dateString || '';
  }
}

// Utility: Get color class based on category
function getCategoryColor(category) {
  const colorMap = {
    'Comunicado Oficial': 'text-blue-600',
    'Evento': 'text-green-600',
    'Análise': 'text-purple-600',
    'Manifesto': 'text-red-600',
    'Entrevista': 'text-yellow-600',
    'Projeto': 'text-teal-600'
  };
  
  return colorMap[category] || 'text-gray-600';
}


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
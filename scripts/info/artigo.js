// Script to dynamically load article content from API
document.addEventListener('DOMContentLoaded', function() {
    // API endpoint
    const API_URL = 'https://64.23.215.68:8000/articles';
    
    // Get article ID from URL if available
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id') || '1'; // Default to article 1 if no ID provided
    
    // Fetch article data
    fetchArticle(articleId);
    
    // Also fetch related articles, popular articles, and upcoming events
    fetchRelatedArticles();
    fetchPopularArticles();
    fetchUpcomingEvents();
});

// Function to fetch article by ID
function fetchArticle(articleId) {
    fetch(`https://64.23.215.68:8000/articles/${articleId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            populateArticle(data);
        })
        .catch(error => {
            console.error('Error fetching article:', error);
            showErrorMessage('Não foi possível carregar o artigo. Por favor, tente novamente mais tarde.');
        });
}

// Function to populate article content
function populateArticle(article) {
    // Main article details
    document.querySelector('h1.text-3xl').textContent = article.title;
    document.querySelector('.text-sm.text-gray-500').textContent = formatDate(article.date);
    
    // Author info
    const authorSection = document.querySelector('.flex.items-center.mb-6');
    authorSection.querySelector('img').src = article.author.image || '/api/placeholder/48/48';
    authorSection.querySelector('span.text-blue-600').textContent = article.author.name;
    authorSection.querySelector('p.text-sm.text-gray-600').textContent = article.author.title;
    
    // Main image
    const mainImage = document.querySelector('img.w-full.h-auto.rounded-lg.mb-6');
    mainImage.src = article.imageUrl || '/api/placeholder/800/400';
    mainImage.alt = article.title;
    
    // Article content
    const contentDiv = document.querySelector('.prose.max-w-none');
    contentDiv.innerHTML = article.content;
    
    // Tags
    const tagsContainer = document.querySelector('.flex.flex-wrap.gap-2');
    tagsContainer.innerHTML = '';
    article.tags.forEach(tag => {
        const tagSpan = document.createElement('span');
        tagSpan.className = 'text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200';
        tagSpan.textContent = tag;
        tagsContainer.appendChild(tagSpan);
    });
    
    // Update sidebar author info
    const sidebarAuthor = document.querySelector('.lg\\:w-1\\/4 .bg-white.rounded-lg.shadow-md.p-4.mb-6');
    if (sidebarAuthor) {
        sidebarAuthor.querySelector('img').src = article.author.image || '/api/placeholder/64/64';
        sidebarAuthor.querySelector('p.font-medium.text-gray-800').textContent = article.author.name;
        sidebarAuthor.querySelector('p.text-sm.text-gray-600').textContent = article.author.title;
        sidebarAuthor.querySelector('p.text-sm.text-gray-700.mb-3').textContent = article.author.bio;
    }
    
    // Update page title
    document.title = `${article.title} - Anamalala`;
}

// Function to fetch and populate related articles
function fetchRelatedArticles() {
    fetch('https://64.23.215.68:8000/related-articles')
        .then(response => response.json())
        .then(data => {
            const relatedContainer = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.gap-4');
            relatedContainer.innerHTML = '';
            
            data.forEach(article => {
                const articleElement = document.createElement('a');
                articleElement.href = `article.html?id=${article.id}`;
                articleElement.className = 'flex items-center p-3 rounded-lg hover:bg-gray-50';
                
                articleElement.innerHTML = `
                    <img src="${article.thumbnail || '/api/placeholder/80/60'}" class="w-20 h-16 object-cover rounded mr-3" alt="${article.title}">
                    <div>
                        <h4 class="font-medium text-gray-800">${article.title}</h4>
                        <p class="text-sm text-gray-600">${formatDate(article.date)}</p>
                    </div>
                `;
                
                relatedContainer.appendChild(articleElement);
            });
        })
        .catch(error => console.error('Error fetching related articles:', error));
}

// Function to fetch and populate popular articles
function fetchPopularArticles() {
    fetch('https://64.23.215.68:8000/popular-articles')
        .then(response => response.json())
        .then(data => {
            const popularContainer = document.querySelector('.bg-white.rounded-lg.shadow-md.p-4.mb-6 .space-y-4');
            popularContainer.innerHTML = '';
            
            data.forEach((article, index) => {
                const articleElement = document.createElement('a');
                articleElement.href = `article.html?id=${article.id}`;
                articleElement.className = 'flex items-center group';
                
                const number = (index + 1).toString().padStart(2, '0');
                
                articleElement.innerHTML = `
                    <span class="text-2xl font-bold text-gray-300 group-hover:text-blue-500 mr-3">${number}</span>
                    <div>
                        <h4 class="font-medium text-gray-800 group-hover:text-blue-600">${article.title}</h4>
                        <p class="text-sm text-gray-600">${formatDate(article.date)}</p>
                    </div>
                `;
                
                popularContainer.appendChild(articleElement);
            });
        })
        .catch(error => console.error('Error fetching popular articles:', error));
}

// Function to fetch and populate upcoming events
function fetchUpcomingEvents() {
    fetch('https://64.23.215.68:8000/events')
        .then(response => response.json())
        .then(data => {
            const eventsContainer = document.querySelector('.bg-white.rounded-lg.shadow-md.p-4:last-child .space-y-4');
            eventsContainer.innerHTML = '';
            
            data.forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.className = 'border-l-4 border-green-500 pl-3';
                
                eventElement.innerHTML = `
                    <h4 class="font-medium text-gray-800">${event.title}</h4>
                    <p class="text-sm text-gray-600 mb-1">${event.date} • ${event.location}</p>
                    <a href="event.html?id=${event.id}" class="text-sm text-blue-600 hover:text-blue-800">Ver detalhes</a>
                `;
                
                eventsContainer.appendChild(eventElement);
            });
        })
        .catch(error => console.error('Error fetching events:', error));
}

// Helper function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-MZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Function to show error message
function showErrorMessage(message) {
    const contentDiv = document.querySelector('.prose.max-w-none');
    contentDiv.innerHTML = `
        <div class="bg-red-50 border-l-4 border-red-500 p-4 my-6">
            <div class="flex">
                <div class="flex-shrink-0">
                    <i class="fas fa-exclamation-circle text-red-500"></i>
                </div>
                <div class="ml-3">
                    <p class="text-sm text-red-700">${message}</p>
                </div>
            </div>
        </div>
    `;
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
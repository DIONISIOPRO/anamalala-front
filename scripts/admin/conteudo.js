document.addEventListener('DOMContentLoaded', function() {
    // Painel de Conteúdo (Artigos)
    const contentPanel = document.querySelector('.content-panel');
    const newArticleButton = contentPanel.querySelector('.btn-primary');
    const newArticleModal = document.getElementById('new-article-modal');
    const editArticleModal = document.getElementById('edit-article-modal');
    const newArticleForm = document.getElementById('new-article-form');
    const editArticleForm = document.getElementById('edit-article-form');
    const articleTableBody = contentPanel.querySelector('tbody');

    let articles = []; // Array para armazenar os artigos

    // Função para renderizar a tabela de artigos
    function renderArticles() {
        articleTableBody.innerHTML = '';
        articles.forEach((article, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${article.title}</td>
                <td>${article.content.substring(0, 50)}...</td>
                <td>${article.author}</td>
                <td>${article.date}</td>
                <td>
                    <button class="edit-article" data-index="${index}">Editar</button>
                    <button class="delete-article" data-index="${index}">Excluir</button>
                </td>
            `;
            articleTableBody.appendChild(row);
        });

        // Adicionar ouvintes de evento para os botões de editar e excluir
        document.querySelectorAll('.edit-article').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                openEditArticleModal(index);
            });
        });

        document.querySelectorAll('.delete-article').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                deleteArticle(index);
            });
        });
    }

    // Função para abrir o modal de novo artigo
    newArticleButton.addEventListener('click', function() {
        newArticleModal.style.display = 'block';
    });

    // Função para fechar os modais
    document.querySelectorAll('.close').forEach(closeButton => {
        closeButton.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

    // Função para adicionar um novo artigo
    newArticleForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;
        const author = document.getElementById('author').value;
        const date = document.getElementById('date').value;

        articles.push({ title, content, author, date });
        renderArticles();
        newArticleModal.style.display = 'none';
        newArticleForm.reset();
    });

    // Função para abrir o modal de editar artigo
    function openEditArticleModal(index) {
        const article = articles[index];
        document.getElementById('edit-article-index').value = index;
        document.getElementById('edit-title').value = article.title;
        document.getElementById('edit-content').value = article.content;
        document.getElementById('edit-author').value = article.author;
        document.getElementById('edit-date').value = article.date;
        editArticleModal.style.display = 'block';
    }

    // Função para salvar as alterações do artigo
    editArticleForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const index = parseInt(document.getElementById('edit-article-index').value);
        articles[index].title = document.getElementById('edit-title').value;
        articles[index].content = document.getElementById('edit-content').value;
        articles[index].author = document.getElementById('edit-author').value;
        articles[index].date = document.getElementById('edit-date').value;
        renderArticles();
        editArticleModal.style.display = 'none';
    });

    // Função para excluir um artigo
    function deleteArticle(index) {
        articles.splice(index, 1);
        renderArticles();
    }

    // Painel de Mensagens
    const messagePanel = document.querySelector('.message-panel');
    const newMessageButton = messagePanel.querySelector('.btn-primary');
    const newMessageModal = document.getElementById('new-message-modal');
    const viewMessageModal = document.getElementById('view-message-modal');
    const newMessageForm = document.getElementById('new-message-form');
    const messageTableBody = messagePanel.querySelector('tbody');

    let messages = []; // Array para armazenar as mensagens

    // Função para renderizar a tabela de mensagens
    function renderMessages() {
        messageTableBody.innerHTML = '';
        messages.forEach((message, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${message.recipient}</td>
                <td>${message.subject}</td>
                <td>${message.message.substring(0, 50)}...</td>
                <td>
                    <button class="view-message" data-index="${index}">Visualizar</button>
                    <button class="delete-message" data-index="${index}">Excluir</button>
                </td>
            `;
            messageTableBody.appendChild(row);
        });

        // Adicionar ouvintes de evento para os botões de visualizar e excluir
        document.querySelectorAll('.view-message').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                openViewMessageModal(index);
            });
        });

        document.querySelectorAll('.delete-message').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                deleteMessage(index);
            });
        });
    }

    // Função para abrir o modal de nova mensagem
    newMessageButton.addEventListener('click', function() {
        newMessageModal.style.display = 'block';
    });

    // Função para adicionar uma nova mensagem
    newMessageForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const recipient = document.getElementById('recipient').value;
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value;
        const date = document.getElementById('date').value;

        messages.push({ recipient, subject, message, date });
        renderMessages();
        newMessageModal.style.display = 'none';
        newMessageForm.reset();
    });

    // Função para abrir o modal de visualizar mensagem
    function openViewMessageModal(index) {
        const message = messages[index];
        document.getElementById('view-recipient').textContent = message.recipient;
        document.getElementById('view-subject').textContent = message.subject;
        document.getElementById('view-message').textContent = message.message;
        document.getElementById('view-date').textContent = message.date;
        viewMessageModal.style.display = 'block';
    }

    // Função para excluir uma mensagem
    function deleteMessage(index) {
        messages.splice(index, 1);
        renderMessages();
    }
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
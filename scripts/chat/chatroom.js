document.addEventListener('DOMContentLoaded', function () {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const appContainer = document.querySelector('.app-container');
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.querySelector('.sidebar-overlay');
    
    // Verificar se é um dispositivo móvel
    function isMobile() {
        return window.innerWidth <= 768;
    }
    
    // Configuração inicial com base no tamanho da tela
    function initLayout() {
        if (isMobile()) {
            appContainer.classList.add('mobile-view');
            sidebarToggle.querySelector('i').classList.remove('fa-bars');
            sidebarToggle.querySelector('i').classList.add('fa-times');
            sidebarToggle.title = "Mostrar Menu";
        } else {
            appContainer.classList.remove('mobile-view');
            appContainer.classList.remove('sidebar-visible');
            appContainer.classList.remove('sidebar-hidden');
            sidebarToggle.querySelector('i').classList.remove('fa-times');
            sidebarToggle.querySelector('i').classList.add('fa-bars');
            sidebarToggle.title = "Esconder Menu";
        }
    }
    
    // Inicializar layout
    initLayout();
    
    // Função para alternar a visibilidade da sidebar
    sidebarToggle.addEventListener('click', function() {
        if (isMobile()) {
            appContainer.classList.toggle('sidebar-visible');
            
            // Altera o ícone do botão dependendo do estado da sidebar
            const icon = sidebarToggle.querySelector('i');
            if (appContainer.classList.contains('sidebar-visible')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
                sidebarToggle.title = "Esconder Menu";
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                sidebarToggle.title = "Mostrar Menu";
            }
        } else {
            appContainer.classList.toggle('sidebar-hidden');
            
            // Altera o ícone do botão dependendo do estado da sidebar
            const icon = sidebarToggle.querySelector('i');
            if (appContainer.classList.contains('sidebar-hidden')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
                sidebarToggle.title = "Mostrar Menu";
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                sidebarToggle.title = "Esconder Menu";
            }
        }
    });
    
    // Fechar a sidebar quando clicar no overlay (em dispositivos móveis)
    sidebarOverlay.addEventListener('click', function() {
        if (isMobile() && appContainer.classList.contains('sidebar-visible')) {
            appContainer.classList.remove('sidebar-visible');
            sidebarToggle.querySelector('i').classList.remove('fa-times');
            sidebarToggle.querySelector('i').classList.add('fa-bars');
            sidebarToggle.title = "Mostrar Menu";
        }
    });
    
    // Reajustar o layout quando a janela for redimensionada
    window.addEventListener('resize', function() {
        initLayout();
    });
    // Elementos DOM
    const postsContainer = document.getElementById('posts-container');
    const postInput = document.getElementById('post-input');
    const submitPostButton = document.getElementById('submit-post');
    const connectionStatus = document.getElementById('connection-status');
    const notificationCount = document.getElementById('notification-count');
    const statusMessage = document.getElementById('status-message');
    const loadingPosts = document.getElementById('loading-posts');

    // Templates
    const postTemplate = document.getElementById('post-template');
    const commentTemplate = document.getElementById('comment-template');

    // Configurações da API
    const API_BASE_URL = 'https://freesexy.net:8080/api/v1/chatroom';
    const WS_URL = 'https://freesexy.net:8080/api/v1/chatroom/ws';

    // Estado da aplicação
    let currentUser = null;
    let webSocket = null;
    let unreadCount = 0;
    let posts = [];
    let isConnected = false;

    // Verifica se o usuário está autenticado
    function checkAuth() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = '../auth/login.html';
            return false;
        }

        // Obtém informações do usuário do token (simplificado)
        try {
            currentUser = localStorage.getItem("userData");
            return true;
        } catch (e) {
            console.error('Erro ao decodificar token:', e);
            localStorage.removeItem('authToken');
            window.location.href = '../auth/login.html';
            return false;
        }
    }

    // Conecta ao WebSocket
    function connectWebSocket() {
        const token = localStorage.getItem('authToken');
        webSocket = new WebSocket(`${WS_URL}?token=Bearer ${token}`);

        webSocket.onopen = function () {
            console.log('Conexão WebSocket estabelecida');
            connectionStatus.textContent = 'Conectado';
            connectionStatus.classList.add('connected');
            setTimeout(() => {
                connectionStatus.style.display = 'none';
            }, 3000);
            isConnected = true;
        };

        webSocket.onmessage = function (event) {
            handleWebSocketMessage(JSON.parse(event.data));
        };

        webSocket.onclose = function () {
            console.log('Conexão WebSocket fechada');
            connectionStatus.textContent = 'Desconectado. Tentando reconectar...';
            connectionStatus.classList.remove('connected');
            connectionStatus.style.display = 'block';
            isConnected = false;

            // Tenta reconectar após 5 segundos
            setTimeout(connectWebSocket, 5000);
        };

        webSocket.onerror = function (error) {
            console.error('Erro na conexão WebSocket:', error);
            connectionStatus.textContent = 'Erro na conexão. Tentando reconectar...';
            connectionStatus.classList.remove('connected');
            connectionStatus.style.display = 'block';
        };
    }

    // Manipula mensagens recebidas pelo WebSocket
    function handleWebSocketMessage(message) {
        let author = {};

        switch (message.type) {
            case 'new_post':
                author = message.payload.author
                handleNewPost(message.payload);
                break;
            case 'new_comment':
                author = message.payload.comment.author
                handleNewComment(message.payload.comment);
                break;
            case 'new_reply':
                handleNewReply(message.data);
                break;
            case 'like_post':
                updatePostLikes(message.payload.post);
                break;
            case 'comment_like':
                updateCommentLikes(message.data);
                break;
            default:
                console.log('Tipo de mensagem desconhecido:', message.type);
        }

        // Incrementa contador de notificações se o usuário não for o autor
        if (author.name !== currentUser.name) {
            unreadCount++;
            //  updateNotificationCount();
        }
    }

    // Atualiza o contador de notificações
    function updateNotificationCount() {
        if (unreadCount > 0) {
            notificationCount.textContent = unreadCount;
            notificationCount.classList.remove('hidden');
        } else {
            notificationCount.classList.add('hidden');
        }
    }

    // Carrega posts iniciais
    async function loadPosts() {
        try {
            const response = await fetch(`${API_BASE_URL}/posts?limit=20&page=1`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
    
            if (!response.ok) {
                throw new Error('Erro ao carregar posts');
            }
    
            const result = await response.json();
            posts = result.data.posts;
            // Inverter a ordem dos posts para que os mais antigos apareçam primeiro
            posts.reverse();
            
            // Limpa o container de posts
            while (postsContainer.firstChild) {
                postsContainer.removeChild(postsContainer.firstChild);
            }
    
            // Renderiza os posts em ordem cronológica (mais antigos primeiro)
            posts.forEach(post => {
                renderPost(post);
            });
            
            // Rola para o último post (mais recente)
            setTimeout(() => {
                postsContainer.scrollTop = postsContainer.scrollHeight;
            }, 100);
    
        } catch (error) {
            console.error('Erro ao carregar posts:', error);
            showStatusMessage('Erro ao carregar publicações. Tente novamente mais tarde.', 'error');
        } finally {
            loadingPosts.style.display = 'none';
        }
    }
    

    // Renderiza um post no DOM
    function renderPost(post) {
        const postClone = document.importNode(postTemplate.content, true);
        const postElement = postClone.querySelector('.post');

        postElement.dataset.postId = post.id;
        postElement.querySelector('.post-author').textContent = post.author.name;
        postElement.querySelector('.post-time').textContent = formatDate(post.created_at);
        postElement.querySelector('.post-content').textContent = post.content;
        postElement.querySelector('.like-count').textContent = post.likes || 0;
        postElement.querySelector('.comment-count').textContent = post.comments ? post.comments.length : 0;

        // Verifica se o usuário já curtiu o post
        if (post.likeduserid && post.likeduserid.includes(currentUser.id)) {
            postElement.querySelector('.like-action').classList.add('liked');
        }

        // Adiciona eventos
        const likeAction = postElement.querySelector('.like-action');
        likeAction.addEventListener('click', () => likePost(post.id));

        const commentAction = postElement.querySelector('.comment-action');

        const commentForm = postElement.querySelector('.comment-form');
        commentAction.addEventListener('click', () => {
            commentForm.style.display = 'none';
            commentForm.style.display = commentForm.style.display === 'none' ? 'block' : 'none';
        });

        // const shareAction = postElement.querySelector('.share-action');
        // shareAction.addEventListener('click', () => sharePost(post.id));

        const commentSubmit = postElement.querySelector('.comment-submit');

        const commentcancel = postElement.querySelector('.comment-cancel');

        const commentInput = postElement.querySelector('.comment-input');
        commentcancel.addEventListener('click', () => {
            commentForm.style.display = 'none';
        });

        commentSubmit.addEventListener('click', () => {
            const content = commentInput.value.trim();
            if (content) {
                submitComment(post.id, content);
                commentInput.value = '';
                setTimeout(function () {
                    commentForm.style.display = 'none';
                }, 1000)
            }
        });

        // Renderiza comentários existentes
        const commentsContainer = postElement.querySelector('.comments-container');
        if (post.comments && post.comments.length > 0) {
            post.comments.forEach(comment => {
                const commentElement = renderComment(comment);
                commentsContainer.appendChild(commentElement);
            });
        }

        postsContainer.appendChild(postElement);
    }

    // Renderiza um comentário
    function renderComment(comment) {
        const commentClone = document.importNode(commentTemplate.content, true);
        const commentElement = commentClone.querySelector('.comment');

        commentElement.dataset.commentId = comment.id;
        commentElement.querySelector('.comment-author').textContent = comment.author.name;
        commentElement.querySelector('.comment-time').textContent = formatDate(comment.created_at);
        commentElement.querySelector('.comment-content').textContent = comment.content;
       // commentElement.querySelector('.comment-like-count').textContent = comment.likes || 0;

        // Verifica se o usuário já curtiu o comentário
        if (comment.likeduserid && comment.likeduserid.includes(currentUser.id)) {
            commentElement.querySelector('.like-comment').classList.add('liked');
        }

        // // Adiciona eventos
        // const likeCommentAction = commentElement.querySelector('.like-comment');
        // likeCommentAction.addEventListener('click', () => likeComment(comment.id));


        // const replyAction = commentElement.querySelector('.reply-comment');

        // const replyForm = commentElement.querySelector('.reply-form');
        // replyAction.addEventListener('click', () => {
        //     replyForm.classList.toggle('hidden');
        // });



        // const replySubmit = commentElement.querySelector('.reply-submit');
        // const replyInput = commentElement.querySelector('.reply-input');
        // replySubmit.addEventListener('click', () => {
        //     const content = replyInput.value.trim();
        //     if (content) {
        //         submitReply(comment.id, content);
        //         replyInput.value = '';
        //         replyForm.classList.add('hidden');
        //     }
        // });

        // Renderiza respostas existentes
        const repliesContainer = commentElement.querySelector('.comment-replies');
        if (comment.comments && comment.comments.length > 0) {
            comment.comments.forEach(reply => {
                const replyElement = renderComment(reply); // Reutiliza a mesma função para respostas
                repliesContainer.appendChild(replyElement);
            });
        }

        return commentElement;
    }




    //Interatividade do dropdown do usuario.
    const logoutbutton = document.querySelector('.btnLogout')
    const userProfile = document.querySelector('.user-profile');
    const dropdownContent = document.querySelector('.dropdown-content');


    userProfile.addEventListener('click', () => {
        dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
    });
    document.addEventListener('click', (event) => {
        if (!userProfile.contains(event.target)) {
            dropdownContent.style.display = 'none';
        }
    });

    logoutbutton.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
   function getUserContact(){
        let user = localStorage.getItem("userData")
        data = JSON.parse(user)
        return  data.contact;
   }

    async function populateUser() {
        let user = localStorage.getItem("userData")
        currentUser = user
        data = JSON.parse(user)
        const name = document.querySelector('.user-profile').querySelector('.user-name');
        namedousuario = data.name;
        name.textContent = namedousuario;

    }

    async function logout() {
        try {
            const response = await fetch('https://freesexy.net:8080/api/v1/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify({ 'contact': getUserContact(), })
            });

            if (!response.ok) {
                throw new Error('Falha ao realizar logout');
            }
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');

            sessionStorage.removeItem('authToken');
            sessionStorage.removeItem('userData');

            window.location.href = '../auth/login.html';
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        } finally {
            // showLoading(false);
        }
    }
    function getAuthToken() {
        return localStorage.getItem('authToken');
    }

    function checkAuth() {
        const token = getAuthToken();
        if (!token) {
            window.location.href = '../auth/login.html';
            return false;
        }
        return true;
    }

    (async function init() {
        checkAuth()
        populateUser()

    })()

    // Auto-resize textarea
    const textarea = document.getElementById('post-input');
    textarea.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    // Manipula um novo post recebido via WebSocket
    function handleNewPost(post) {
        // Adiciona o novo post ao final da lista
        posts.push(post);
    
        // Renderiza o novo post
        const postElement = document.importNode(postTemplate.content, true);
        const newPost = postElement.querySelector('.post');
    
        newPost.dataset.postId = post.id;
        newPost.querySelector('.post-author').textContent = post.author.name;
        newPost.querySelector('.post-time').textContent = formatDate(post.created_at);
        newPost.querySelector('.post-content').textContent = post.content;
        newPost.querySelector('.like-count').textContent = 0;
        newPost.querySelector('.comment-count').textContent = 0;
    
        // Adiciona eventos
        const likeAction = newPost.querySelector('.like-action');
        likeAction.addEventListener('click', () => likePost(post.id));
    
        const commentAction = newPost.querySelector('.comment-action');
        const commentForm = newPost.querySelector('.comment-form');
        commentAction.addEventListener('click', () => {
            commentForm.style.display = commentForm.style.display === 'none' || !commentForm.style.display ? 'block' : 'none';
        });
    
        const commentSubmit = newPost.querySelector('.comment-submit');
        const commentInput = newPost.querySelector('.comment-input');
        commentSubmit.addEventListener('click', () => {
            const content = commentInput.value.trim();
            if (content) {
                submitComment(post.id, content);
                commentInput.value = '';
            }
            commentForm.style.display = 'none';
        });
    
        // Adiciona classe de destaque para novos posts
        newPost.classList.add('new-post');
    
        // Insere o novo post no final do container
        postsContainer.appendChild(newPost);
    
        // Remove o destaque após alguns segundos
        setTimeout(() => {
            newPost.classList.remove('new-post');
        }, 11000);
        
        // Rola para o novo post
        setTimeout(() => {
            newPost.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }

    // Manipula um novo comentário recebido via WebSocket
    function handleNewComment(comment) {
        const postElement = document.querySelector(`.post[data-post-id="${comment.reference_id}"]`);
        if (!postElement) return;

        const commentsContainer = postElement.querySelector('.comments-container');
        const commentElement = renderComment(comment);

        // Adiciona o comentário antes do formulário
        commentsContainer.appendChild(commentElement);

        // Atualiza o contador de comentários
        const commentCount = postElement.querySelector('.comment-count');
        commentCount.textContent = parseInt(commentCount.textContent) + 1;

        // Destaca o novo comentário
        commentElement.classList.add('new-comment');
        setTimeout(() => {
            commentElement.classList.remove('new-comment');
        }, 1000);
    }

    // Manipula uma nova resposta a comentário recebida via WebSocket
    function handleNewReply(reply) {
        const commentElement = document.querySelector(`.comment[data-comment-id="${reply.parentId}"]`);
        if (!commentElement) return;

        const repliesContainer = commentElement.querySelector('.comment-replies');
        const replyElement = renderComment(reply);

        // Adiciona a resposta
        repliesContainer.appendChild(replyElement);

        // Destaca a nova resposta
        replyElement.classList.add('new-comment');
        setTimeout(() => {
            replyElement.classList.remove('new-comment');
        }, 5000);
    }

    // Atualiza contadores de like em um post
    function updatePostLikes(data) {
        const postElement = document.querySelector(`.post[data-post-id="${data.id}"]`);
        if (!postElement) return;

        const likeCount = postElement.querySelector('.like-count');
        likeCount.textContent = data.likes;

        // Atualiza o estado de like do usuário atual
        const likeAction = postElement.querySelector('.like-action');
        if (data.likeduserid.includes(currentUser.id)) {
            likeAction.classList.add('liked');
        } else {
            likeAction.classList.remove('liked');
        }
    }

    // Atualiza contadores de like em um comentário
    function updateCommentLikes(data) {
        const commentElement = document.querySelector(`.comment[data-comment-id="${data.commentId}"]`);
        if (!commentElement) return;

        const likeCount = commentElement.querySelector('.comment-like-count');
        likeCount.textContent = data.likes;

        // Atualiza o estado de like do usuário atual
        const likeAction = commentElement.querySelector('.like-comment');
        if (data.likeduserid.includes(currentUser.id)) {
            likeAction.classList.add('liked');
        } else {
            likeAction.classList.remove('liked');
        }
    }

    // Envia um novo post
    async function submitPost(content) {
        if (!content.trim()) return;
    
        try {
            submitPostButton.disabled = true;
            submitPostButton.innerHTML = '<span class="loading-spinner"></span> Publicando...';
    
            const response = await fetch(`${API_BASE_URL}/post`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ content })
            });
    
            if (!response.ok) {
                throw new Error('Erro ao criar post');
            }
    
            // Limpa o campo de texto e ajusta a altura
            postInput.value = '';
            postInput.style.height = 'auto';
    
            // O novo post será recebido e adicionado via WebSocket
            // A rolagem acontecerá na função handleNewPost
        } catch (error) {
            console.error('Erro ao publicar:', error);
            showStatusMessage('Erro ao publicar. Tente novamente.', 'error');
        } finally {
            submitPostButton.disabled = false;
            submitPostButton.textContent = 'Publicar';
        }
    }
    // Curte um post
    async function likePost(postId) {
        try {
            const response = await fetch(`${API_BASE_URL}/post/${postId}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao curtir post');
            }

            // A atualização do contador será feita via WebSocket
        } catch (error) {
            console.error('Erro ao curtir post:', error);
            showStatusMessage('Erro ao curtir. Tente novamente.', 'error');
        }
    }

    // Compartilha um post
    function sharePost(postId) {
        // Cria URL para compartilhamento
        const shareUrl = `${window.location.origin}/post/${postId}`;

        // Verifica se a API de compartilhamento está disponível
        if (navigator.share) {
            navigator.share({
                title: 'ANAMALALA - Fórum do Povo',
                text: 'Confira esta publicação no fórum ANAMALALA!',
                url: shareUrl
            })
                .catch(error => {
                    console.error('Erro ao compartilhar:', error);
                });
        } else {
            // Fallback para copiar o link
            navigator.clipboard.writeText(shareUrl)
                .then(() => {
                    showStatusMessage('Link copiado para a área de transferência!', 'success');
                })
                .catch(err => {
                    console.error('Erro ao copiar link:', err);
                    showStatusMessage('Erro ao copiar link. Tente novamente.', 'error');
                });
        }
    }

    // Envia um comentário
    async function submitComment(postId, content) {
        try {
            const response = await fetch(`${API_BASE_URL}/post/${postId}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ content })
            });

            if (!response.ok) {
                throw new Error('Erro ao enviar comentário');
            }

            // O novo comentário será recebido e adicionado via WebSocket
        } catch (error) {
            console.error('Erro ao comentar:', error);
            showStatusMessage('Erro ao enviar comentário. Tente novamente.', 'error');
        }
    }

    // Curte um comentário
    async function likeComment(commentId) {
        try {
            const response = await fetch(`${API_BASE_URL}/comment/${commentId}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao curtir comentário');
            }

            // A atualização do contador será feita via WebSocket
        } catch (error) {
            console.console.error('Erro ao curtir comentário:', error);
            showStatusMessage('Erro ao curtir comentário. Tente novamente.', 'error');
        }
    }

    // Envia uma resposta a um comentário
    async function submitReply(commentId, content) {
        try {
            const response = await fetch(`${API_BASE_URL}/comment/${commentId}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ content })
            });

            if (!response.ok) {
                throw new Error('Erro ao enviar resposta');
            }

            // A nova resposta será recebida e adicionada via WebSocket
        } catch (error) {
            console.error('Erro ao responder:', error);
            showStatusMessage('Erro ao enviar resposta. Tente novamente.', 'error');
        }
    }

    // Formata uma data para exibição
    function formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (diffSec < 60) {
            return 'agora';
        } else if (diffMin < 60) {
            return `${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'} atrás`;
        } else if (diffHour < 24) {
            return `${diffHour} ${diffHour === 1 ? 'hora' : 'horas'} atrás`;
        } else if (diffDay < 7) {
            return `${diffDay} ${diffDay === 1 ? 'dia' : 'dias'} atrás`;
        } else {
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        }
    }

    // Exibe uma mensagem de status
    function showStatusMessage(message, type = 'info') {
        statusMessage.textContent = message;
        statusMessage.className = 'status-indicator';

        if (type === 'success') {
            statusMessage.classList.add('connected');
        } else if (type === 'error') {
            statusMessage.classList.add('error');
        }

        statusMessage.classList.remove('hidden');

        // Esconde a mensagem após alguns segundos
        setTimeout(() => {
            statusMessage.classList.add('hidden');
        }, 5000);
    }

    // Rolagem infinita para carregar mais posts
    function setupInfiniteScroll() {
        let offset = 2; // Começamos da página 2 já que carregamos a página 1 inicialmente
        let limit = 10;
        let loading = false;
        let hasMore = true;
    
        // Detectar quando o usuário rola para o topo
        postsContainer.addEventListener('scroll', async () => {
            if (loading || !hasMore) return;
    
            // Verifica se o usuário está próximo do topo (rolando para cima)
            if (postsContainer.scrollTop < 100) {
                loading = true;
    
                try {
                    // Adiciona um indicador de carregamento no topo
                    const loadingIndicator = document.createElement('div');
                    loadingIndicator.className = 'loading-indicator';
                    loadingIndicator.innerHTML = '<span class="loading-spinner"></span> Carregando publicações anteriores...';
                    
                    // Salva a posição atual de rolagem
                    const scrollHeight = postsContainer.scrollHeight;
                    const scrollPosition = postsContainer.scrollTop;
                    
                    // Insere o indicador no início
                    postsContainer.insertBefore(loadingIndicator, postsContainer.firstChild);
    
                    const response = await fetch(`${API_BASE_URL}/posts?limit=${limit}&page=${offset}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                        }
                    });
    
                    if (!response.ok) {
                        throw new Error('Erro ao carregar mais posts');
                    }
    
                    const data = await response.json();
                    
                    // Remove o indicador de carregamento
                    postsContainer.removeChild(loadingIndicator);
    
                    if (data.data.posts.length === 0) {
                        hasMore = false;
                        return;
                    }
    
                    // Inverte os novos posts para manter a ordem cronológica
                    const newPosts = data.data.posts.reverse();
                    
                    // Adiciona os novos posts no início (posts mais antigos)
                    newPosts.forEach(post => {
                        const postElement = document.importNode(postTemplate.content, true);
                        const newPost = postElement.querySelector('.post');
                        
                        // Configura o post
                        newPost.dataset.postId = post.id;
                        newPost.querySelector('.post-author').textContent = post.author.name;
                        newPost.querySelector('.post-time').textContent = formatDate(post.created_at);
                        newPost.querySelector('.post-content').textContent = post.content;
                        newPost.querySelector('.like-count').textContent = post.likes || 0;
                        newPost.querySelector('.comment-count').textContent = post.comments ? post.comments.length : 0;
                        
                        // Adiciona eventos
                        const likeAction = newPost.querySelector('.like-action');
                        likeAction.addEventListener('click', () => likePost(post.id));
                        
                        const commentAction = newPost.querySelector('.comment-action');
                        const commentForm = newPost.querySelector('.comment-form');
                        commentAction.addEventListener('click', () => {
                            commentForm.style.display = commentForm.style.display === 'none' || !commentForm.style.display ? 'block' : 'none';
                        });
                        
                        const commentSubmit = newPost.querySelector('.comment-submit');
                        const commentInput = newPost.querySelector('.comment-input');
                        commentSubmit.addEventListener('click', () => {
                            const content = commentInput.value.trim();
                            if (content) {
                                submitComment(post.id, content);
                                commentInput.value = '';
                            }
                            commentForm.style.display = 'none';
                        });
                        
                        // Renderiza comentários existentes
                        const commentsContainer = newPost.querySelector('.comments-container');
                        if (post.comments && post.comments.length > 0) {
                            post.comments.forEach(comment => {
                                const commentElement = renderComment(comment);
                                commentsContainer.appendChild(commentElement);
                            });
                        }
                        
                        // Insere no início do container
                        postsContainer.insertBefore(newPost, postsContainer.firstChild);
                        
                        // Adiciona ao array de posts
                        posts.unshift(post);
                    });
    
                    // Mantém a posição de rolagem para evitar "saltos"
                    const newScrollHeight = postsContainer.scrollHeight;
                    postsContainer.scrollTop = scrollPosition + (newScrollHeight - scrollHeight);
    
                    offset += 1;
                } catch (error) {
                    console.error('Erro ao carregar mais posts:', error);
                    showStatusMessage('Erro ao carregar mais publicações. Tente novamente.', 'error');
                } finally {
                    loading = false;
                }
            }
        });
    }
    // Inicializa a aplicação
    function init() {
        if (!checkAuth()) {
            return;
        }

        // Carrega posts iniciais
        loadPosts();

        // Conecta ao WebSocket
        connectWebSocket();



        // Permite enviar com Enter (Shift+Enter para quebra de linha)
        postInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submitPost(postInput.value);
            }
        });

        submitPostButton.addEventListener('click', (e) => {

            e.preventDefault();
            submitPost(postInput.value);

        });

        // Reseta contador de notificações ao clicar no número
        notificationCount.addEventListener('click', () => {
            unreadCount = 0;
            //    updateNotificationCount();
        });

        // Configura rolagem infinita
        setupInfiniteScroll();
    }

    // Inicia a aplicação quando o DOM estiver pronto
    init();
});                                                                    
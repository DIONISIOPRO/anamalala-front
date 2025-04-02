document.addEventListener('DOMContentLoaded', () => {
    const apiBaseUrl = 'https://freesexy.net:8000/api'; // Ajuste a URL da sua API

    // Função para buscar dados da API
    async function fetchData(endpoint) {
        try {
            const response = await fetch(`${apiBaseUrl}${endpoint}`);
            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
            return null;
        }
    }

    // Função para popular a tabela de usuários
    async function populateUsersTable() {
        const users = await fetchData('/users'); // Endpoint para obter usuários
        if (users) {
            const tbody = document.querySelector('.users-table tbody');
            tbody.innerHTML = ''; // Limpa a tabela antes de preencher

            users.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><input type="checkbox" class="user-checkbox"></td>
                    <td data-user="name">${user.name}</td>
                    <td data-user="province">${user.province}</td>
                    <td data-user="contact">${user.contact}</td>
                    <td data-user="registrationDate">${user.registrationDate}</td>
                    <td><span class="user-status status-${user.status.toLowerCase()}">${user.status}</span></td>
                    <td>
                        <div class="user-actions">
                            <button class="action-btn view" data-user-id="${user.id}"><i class="fas fa-eye"></i></button>
                            <button class="action-btn edit" data-user-id="${user.id}"><i class="fas fa-edit"></i></button>
                            <button class="action-btn ban" data-user-id="${user.id}"><i class="fas fa-ban"></i></button>
                            <button class="action-btn delete" data-user-id="${user.id}"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                `;
                tbody.appendChild(row);
            });
            addUserTableEventListeners(); // Adiciona os listeners para os novos elementos
        }
    }

    // Função para adicionar listeners aos botões de ação da tabela
    function addUserTableEventListeners() {
        // Botões de visualização
        document.querySelectorAll('.action-btn.view').forEach(button => {
            button.addEventListener('click', (event) => {
                const userId = event.currentTarget.dataset.userId;
                openUserDetails(userId);
            });
        });

        // Botões de edição
        document.querySelectorAll('.action-btn.edit').forEach(button => {
            button.addEventListener('click', (event) => {
                const userId = event.currentTarget.dataset.userId;
                openEditUserModal(userId);
            });
        });

        // Botões de banimento
        document.querySelectorAll('.action-btn.ban').forEach(button => {
            button.addEventListener('click', (event) => {
                const userId = event.currentTarget.dataset.userId;
                banUser(userId);
            });
        });

        // Botões de exclusão
        document.querySelectorAll('.action-btn.delete').forEach(button => {
            button.addEventListener('click', (event) => {
                const userId = event.currentTarget.dataset.userId;
                deleteUser(userId);
            });
        });
    }

    // Função para abrir o painel de detalhes do usuário
    async function openUserDetails(userId) {
        const user = await fetchData(`/users/${userId}`); // Endpoint para obter detalhes do usuário
        if (user) {
            const slidePanel = document.querySelector('.slide-panel');
            const slidePanelBody = document.querySelector('.slide-panel-body');

            slidePanelBody.innerHTML = `
                <div class="user-profile">
                    <div class="user-profile-image"><i class="fas fa-user"></i></div>
                    <div class="user-profile-name">${user.name}</div>
                    <div class="user-profile-contact">${user.contact}</div>
                    <span class="user-profile-status user-status status-${user.status.toLowerCase()}">${user.status}</span>
                </div>
                <div class="user-stats">
                    <div class="stat-card">
                        <div class="stat-value">${user.stats.value1}</div>
                        <div class="stat-label">Valor 1</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${user.stats.value2}</div>
                        <div class="stat-label">Valor 2</div>
                    </div>
                </div>
                <div class="user-details-section">
                    <div class="section-title">Detalhes Pessoais</div>
                    <div class="detail-item">
                        <div class="detail-label">Província:</div>
                        <div class="detail-value">${user.province}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Data de Inscrição:</div>
                        <div class="detail-value">${user.registrationDate}</div>
                    </div>
                </div>
            `;

            slidePanel.classList.add('open');
        }
    }

    // Função para abrir o modal de edição de usuário
    async function openEditUserModal(userId) {
        async function openEditUserModal(userId) {
            const user = await fetchData(`/users/${userId}`);
            if (user) {
                const modal = document.getElementById('edit-user-modal');
                const form = document.getElementById('edit-user-form');
        
                // Preenche os campos do formulário com os dados do usuário
                form.name.value = user.name;
                form.province.value = user.province;
                form.contact.value = user.contact;
                form.registrationDate.value = user.registrationDate;
                form.status.value = user.status.toLowerCase();
        
                // Exibe o modal
                modal.style.display = 'flex';
        
                // Event listener para fechar o modal
                document.getElementById('close-edit-modal').addEventListener('click', () => {
                    modal.style.display = 'none';
                });
                document.getElementById('cancel-edit-user').addEventListener('click', () => {
                    modal.style.display = 'none';
                });
        
                // Event listener para salvar as alterações
                document.getElementById('save-edit-user').addEventListener('click', async () => {
                    // Implemente a lógica para salvar as alterações através da API
                    console.log(`Salvar alterações para o usuário ${userId}`);
                    modal.style.display = 'none';
                });
            }
        }
    }

    // Função para banir um usuário
    async function banUser(userId) {
        async function banUser(userId) {
            try {
                const response = await fetch(`${apiBaseUrl}/users/${userId}/ban`, { // Endpoint para banir usuário
                    method: 'PUT', // Ou PATCH, dependendo da sua API
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
        
                if (!response.ok) {
                    throw new Error(`Erro ao banir usuário: ${response.status}`);
                }
        
                // Atualiza a tabela de usuários após o banimento
                populateUsersTable();
            } catch (error) {
                console.error('Erro ao banir usuário:', error);
                alert('Erro ao banir usuário. Consulte o console para mais detalhes.');
            }
        }
    }

    // Função para excluir um usuário
    async function deleteUser(userId) {
        async function deleteUser(userId) {
            try {
                const response = await fetch(`${apiBaseUrl}/users/${userId}`, { // Endpoint para excluir usuário
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
        
                if (!response.ok) {
                    throw new Error(`Erro ao excluir usuário: ${response.status}`);
                }
        
                // Atualiza a tabela de usuários após a exclusão
                populateUsersTable();
            } catch (error) {
                console.error('Erro ao excluir usuário:', error);
                alert('Erro ao excluir usuário. Consulte o console para mais detalhes.');
            }
        }
    }

    // Toggle Sidebar
    document.getElementById('toggle-sidebar').addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('main-content');
        sidebar.classList.toggle('sidebar-collapsed');
        mainContent.classList.toggle('main-content-expanded');
    });

    // Close slide panel
    document.querySelector('.close-panel').addEventListener('click', () => {
        document.querySelector('.slide-panel').classList.remove('open');
    });

    // Adicionar usuário Modal
   // Adicionar usuário Modal
document.getElementById('add-user-btn').addEventListener('click', () => {
    const modal = document.getElementById('add-user-modal');
    modal.style.display = 'flex';

    // Event listener para fechar o modal
    document.getElementById('close-add-modal').addEventListener('click', () => {
        modal.style.display = 'none';
    });
    document.getElementById('cancel-add-user').addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Event listener para salvar o novo usuário
    document.getElementById('save-add-user').addEventListener('click', async () => {
        const form = document.getElementById('add-user-form');
        const formData = new FormData(form);
        const newUser = {};

        // Converte FormData em objeto JSON
        formData.forEach((value, key) => {
            newUser[key] = value;
        });

        try {
            const response = await fetch(`${apiBaseUrl}/users`, { // Endpoint para adicionar usuário
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUser),
            });

            if (!response.ok) {
                throw new Error(`Erro ao adicionar usuário: ${response.status}`);
            }

            // Atualiza a tabela de usuários após a adição
            populateUsersTable();
            modal.style.display = 'none';
        } catch (error) {
            console.error('Erro ao adicionar usuário:', error);
            alert('Erro ao adicionar usuário. Consulte o console para mais detalhes.');
        }
    });
});

    // Popular a tabela de usuários ao carregar a página
    populateUsersTable();
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
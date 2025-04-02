// Variável para armazenar os dados do usuário
let userData = {};

// Elementos DOM
const profileDataDiv = document.getElementById('profileData');
const editFormDiv = document.getElementById('editForm');
const btnEditProfile = document.getElementById('btnEditProfile');
const btnCancel = document.getElementById('btnCancel');
const userProfileForm = document.getElementById('userProfileForm');
const notification = document.getElementById('notification');
const loadingIndicator = document.getElementById('loadingIndicator');
const btnLogout = document.querySelector('.btnLogout');


// URL base da API
const API_URL = 'https://freesexy.net:8080/api/v1';

// Funções para interagir com a API
async function fetchUserData() {
    userData = localStorage.getItem("userData")
    userData = JSON.parse(userData)
    if (userData){
        console.log(userData.name)
        return userData
    }
    try {
        const response = await fetch(`${API_URL}/user/profile`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Falha ao obter dados do usuário');
        }

        userData = await response.json();
        displayUserData();
    } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        showNotification('Não foi possível carregar os dados do usuário', 'error');
    } finally {
        showLoading(false);
    }
}

async function updateUserProfile(updatedData) {
    try {
        showLoading(true);
        const response = await fetch(`${API_URL}/user/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify(updatedData)
        });

        if (!response.ok) {
            throw new Error('Falha ao atualizar o perfil');
        }

        userData = await response.json();
        user = JSON.stringify(userData.data)
        console.log(`o novo user ${user}`)
        localStorage.setItem("userData", user)
        return true;
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        showNotification('Não foi possível atualizar o perfil', 'error');
        return false;
    } finally {
        showLoading(false);
    }
}

async function logout() {
    try {
        showLoading(true);
        const response = await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Falha ao realizar logout');
        }

        // Limpar token de autenticação
        localStorage.removeItem('authToken');
        
        // Redirecionar para a página de login
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
        showNotification('Não foi possível realizar o logout', 'error');
    } finally {
        showLoading(false);
    }
}

// Funções para manipular a interface
function displayUserData() {
  
    if (!userData) return;
    let createdDate = new Date(userData.created_at);
    let dia = createdDate.getDate()
    let mes = createdDate.getUTCMonth()
    let  ano = createdDate.getUTCFullYear()

    document.getElementById('userName').textContent = userData.name;
    document.getElementById('userProvince').textContent = userData.province;
    document.getElementById('infoName').textContent = userData.name;
    document.getElementById('infoContact').textContent = userData.contact;
    document.getElementById('infoProvince').textContent = userData.province;
    document.getElementById('infoRegistration').textContent = `${dia} de ${mes} de ${ano}`;
    // Se tiver avatar, atualizar a imagem
    if (userData.avatar) {
        document.getElementById('userAvatar').src = userData.avatar;
    }
}

function populateEditForm() {
    document.getElementById('name').value = userData.name;
    document.getElementById('contact').value = userData.contact;
    document.getElementById('province').value = userData.province;
    // Limpar campos de senha
    document.getElementById('password').value = '';
    document.getElementById('confirmPassword').value = '';
}

function showEditForm() {
    profileDataDiv.style.display = 'none';
    editFormDiv.style.display = 'block';
    btnEditProfile.style.display = 'none';
    populateEditForm();
}

function hideEditForm() {
    profileDataDiv.style.display = 'block';
    editFormDiv.style.display = 'none';
    btnEditProfile.style.display = 'block';
}

function showNotification(message, type) {
    notification.textContent = message;
    notification.className = `notification notification-${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

function showLoading(isLoading) {
    if (loadingIndicator) {
        loadingIndicator.style.display = isLoading ? 'block' : 'none';
    }
}
// Função para obter o token de autenticação
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Event listeners
btnEditProfile.addEventListener('click', showEditForm);
btnCancel.addEventListener('click', hideEditForm);
btnLogout.addEventListener('click', logout)

userProfileForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    // Validação da senha (se for preenchida)
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password && password !== confirmPassword) {
        showNotification('As senhas não coincidem', 'error');
        return;
    }
    
    // Preparar dados para atualização
    const updatedData = {
        name: document.getElementById('name').value,
        contact: document.getElementById('contact').value,
        province: document.getElementById('province').value
    };
    
    // Adicionar senha apenas se for preenchida
    if (password) {
        updatedData.password = password;
    }
    
    // Enviar dados para API
    
    const success = await updateUserProfile(updatedData);
    
    if (success) {
        fetchUserData();
        displayUserData();
        hideEditForm();
        showNotification('Perfil atualizado com sucesso!', 'success');
    }
});

// Verificar se o usuário está autenticado
function checkAuth() {
    const token = getAuthToken();
    if (!token) {
        // Redirecionar para a página de login se não estiver autenticado
        window.location.href = 'login.html';
        return false;
    }
    return true;
}
// Inicializar a página
(async function init() {

    if (checkAuth()) {
        await fetchUserData();
        displayUserData()
    }
})();
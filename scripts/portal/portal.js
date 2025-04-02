document.addEventListener('DOMContentLoaded', () => {

    async function populateRecentPostsTotal() {
        token = localStorage.getItem('authToken');

        try{
            const response = await fetch('https://freesexy.net:8080/api/v1/chatroom/recent_post_total ', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });
            if (response.ok){
                const data = await response.json();
                const roomCards = document.querySelectorAll('.room-card');
               mensagem = roomCards[1].querySelectorAll('.stat-value');
               mensagem[0].textContent = data.total
            }
        }catch(e){
           
            console.error('Erro ao comunicar com a API:', e);
        }

    }

    async function populateOnlineUsers() {
        try{
            token = localStorage.getItem('authToken');
            const response = await fetch('https://freesexy.net:8080/api/v1/user/online_total', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });
            if (response.ok){
                const data = await response.json();
                const roomCards = document.querySelectorAll('.room-card');
               mensagem = roomCards[1].querySelector('.stat-value');
               mensagem.textContent = data.data.total
            }
        }catch(error){
            console.error('Erro ao comunicar com a API:', error);
        }
    }
    //Funcao para popular o nome do usuario.
    async function populateUser(){
        let user = localStorage.getItem("userData")
        data = JSON.parse(user)
        // const data = await response.json();
        const name = document.querySelector('.user-profile').querySelector('.user-name');
         const avatar = document.querySelector('.user-profile').querySelector('.user-avatar');
        namedousuario = data.name;
        name.textContent = namedousuario;
        letra = namedousuario.charAt(0)
         avatar.textContent = letra
    }
    // Chamar as funções de população
   // populateRecentPostsTotal() 
    populateOnlineUsers()
    populateUser();
    populateInfo()
    //Interatividade do dropdown do usuario.
   const logoutbutton =  document.querySelector('.btnLogout')
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
});


async function populateInfo() {
    try{
        token = localStorage.getItem('authToken');
        const response = await fetch('https://freesexy.net:8080/api/v1/info', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (response.ok){
            const data = await response.json();
            const roomCards = document.querySelectorAll('.room-card');
           mensagem = roomCards[0].querySelectorAll('.stat-value');
         //  mensagem[0].textContent = data.data.total
        }
    }catch(error){
        console.error('Erro ao comunicar com a API:', error);
    }
   
}

function getAuthToken() {
    return localStorage.getItem('authToken');
}

function getUserContact(){
    let user = localStorage.getItem("userData")
    data = JSON.parse(user)
    return  data.contact;
}

async function logout() {
    try {
        const response = await fetch('https://freesexy.net:8080/api/v1/auth/logout?', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({ 'contact':  getUserContact(), })
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
})()
// Função para validar e enviar o formulário de login
function validateLogin() {
    let isValid = true;
    const contact = document.getElementById('contact').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember').checked;
    
    // Reset error messages
    document.getElementById('contactError').textContent = '';
    document.getElementById('passwordError').textContent = '';
    
    // Contact validation - Mozambique phone format
    if (!/^8[0-9]{8}$/.test(contact)) {
        document.getElementById('contactError').textContent = 'Formato inválido. Use um número de telemóvel moçambicano válido.';
        isValid = false;
    }
    
    // Password validation
    if (password.length < 1) {
        document.getElementById('passwordError').textContent = 'Por favor, insira sua palavra-passe.';
        isValid = false;
    }
    
    if (isValid) {
        // Comunicar com a API de backend
        loginUser(contact, password, rememberMe);
    }
    
    return false; // Prevent actual form submission
}

// Função para fazer login através da API
async function loginUser(contact, password, rememberMe) {
    try {
        // Mostrar indicador de carregamento (pode ser implementado com um elemento visual)
        const loginButton = document.querySelector('.btn-primary');
        const originalButtonText = loginButton.textContent;
        loginButton.textContent = 'A processar...';
        loginButton.disabled = true;
        
        // Preparar dados para enviar ao backend
        const loginData = {
            contact: contact,
            password: password,
            rememberMe: rememberMe
        };
        
        // Fazer requisição para a API
        const response = await fetch('https://64.23.215.68:8080/api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/jason'
            },
            body: JSON.stringify(loginData)
        });        
        // Processar resposta
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userData', JSON.stringify(data.user));
            sessionStorage.setItem('authToken', data.token);
            sessionStorage.setItem('userData', JSON.stringify(data.user));
            localStorage.setItem('userContact', data.user.contact);

            
            
            // Redirecionar para a página do portal
          window.location.href = '../Portal/portal.html';
        } else {
            const errorData = await response.json();
            if (response.status === 401) {
                document.getElementById('passwordError').textContent = 'Credenciais inválidas. Por favor, verifique seu número de contacto e senha.';
            } else if (response.status === 403) {
                document.getElementById('contactError').textContent = errorData.message || 'Sua conta está bloqueada ou não verificada.';
            } else {
                document.getElementById('contactError').textContent = errorData.message || 'Ocorreu um erro durante o login. Tente novamente mais tarde.';
            }
        }
        loginButton.textContent = originalButtonText;
        loginButton.disabled = false;
        
    } catch (error) {
        console.error('Erro ao comunicar com a API:', error);
        document.getElementById('contactError').textContent = 'Erro de conexão. Verifique sua internet ou tente novamente mais tarde.';
        const loginButton = document.querySelector('.btn-primary');
        loginButton.textContent = 'Entrar';
        loginButton.disabled = false;
    }
}
// document.addEventListener('DOMContentLoaded', function() {
//     const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');    
//     document.getElementById('loginForm').addEventListener('submit', function(e) {
//         e.preventDefault();
//         validateLogin();
//     });
// });

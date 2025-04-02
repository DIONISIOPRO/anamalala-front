function validateForm() {
    let isValid = true;
    const name = document.getElementById('name').value;
    const province = document.getElementById('province').value;
    const contact = document.getElementById('contact').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Reset error messages
    document.getElementById('contactError').textContent = '';
    document.getElementById('passwordError').textContent = '';
    document.getElementById('confirmPasswordError').textContent = '';
    
    // Contact validation - Mozambique phone format (starts with 8)
    if (!/^8[0-9]{8}$/.test(contact)) {
        document.getElementById('contactError').textContent = 'Formato inválido. Use um número de telemóvel moçambicano válido.';
        isValid = false;
    }
    
    // Password validation
    if (password.length < 6) {
        document.getElementById('passwordError').textContent = 'A palavra-passe deve ter pelo menos 6 caracteres.';
        isValid = false;
    }
    
    // Confirm password validation
    if (password !== confirmPassword) {
        document.getElementById('confirmPasswordError').textContent = 'As palavras-passe não coincidem.';
        isValid = false;
    }
    
    if (isValid) {
        // Comunicar com a API de backend
        registerUser(name, province, contact, password);
    }
    
    return false; // Prevent actual form submission
}

// Função para realizar o registro através da API
async function registerUser(name, province, contact, password) {
    try {
        // Mostrar indicador de carregamento
        const registerButton = document.querySelector('.btn-primary');
        const originalButtonText = registerButton.textContent;
        registerButton.textContent = 'Processando...';
        registerButton.disabled = true;
        
        // Preparar dados para enviar ao backend
        const userData = {
            name: name,
            province: province,
            contact: contact,
            password: password
        };
           // Mostrar mensagem de sucesso        
        // Fazer requisição para a API
        const response = await fetch('https://freesexy.net.68:8080/api/v1/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        // Processar resposta
        if (response.ok) {
            const data = await response.json();
            
            // Guardar token de autenticação, se disponível
            if (data.token) {
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userData', JSON.stringify(data.user));
            }
            
            // Mostrar mensagem de sucesso
            alert('Conta criada com sucesso! ' + (data.verificationRequired ? 
                'Verifique seu telefone para ativar sua conta.' : 'Redirecionando para o portal...'));
            
            // Redirecionar conforme resposta da API
            if (!data.verificationRequired) {
                window.location.href = 'login.html';
            } else {
                // Se precisar de verificação, poderia redirecionar para uma página de verificação
                window.location.href = 'verify-account.html';
            }
        } else {
            // Tratar erros de registro
            const errorData = await response.json();
            
            if (response.status === 409) {
                // Usuário já existe
                document.getElementById('contactError').textContent = 'Este número de contacto já está registado.';
            } else {
                // Outros erros
            }
        }
        
        // Restaurar o botão
        registerButton.textContent = originalButtonText;
        registerButton.disabled = false;
        
    } catch (error) {
        console.error('Erro ao comunicar com a API:', error);
        
        // Restaurar o botão em caso de erro
        const registerButton = document.querySelector('.btn-primary');
        registerButton.textContent = 'Criar Conta';
        registerButton.disabled = false;
    }
}

// Adicionar evento ao formulário quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        validateForm();
    });
});


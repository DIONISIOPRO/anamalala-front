let userContact = '';
let recoveryToken = '';

// Inicialização quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    // Configurar o evento do botão de envio de código
    document.getElementById('send-code').addEventListener('click', requestVerificationCode);
    
    // Configurar o link de volta para o login
    document.querySelector('.back-link').addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'login.html';
    });
});

// Função para exibir mensagens de sucesso ou erro
function showMessage(message, type) {
    const messageContainer = document.getElementById('message-container');
    messageContainer.innerHTML = `<div class="message ${type}">${message}</div>`;
}

// Função para atualizar o indicador de etapas
function updateStepIndicator(currentStep) {
    const steps = document.querySelectorAll('.step');
    
    // Resetar todas as etapas
    steps.forEach((step, index) => {
        step.classList.remove('active', 'completed');
        
        if (index < currentStep) {
            step.classList.add('completed');
        } else if (index === currentStep) {
            step.classList.add('active');
        }
    });
}

// ETAPA 1: Solicitar código de verificação
async function requestVerificationCode() {
    const contact = document.getElementById('contact').value;
    
    // Validação básica do número de contato
    if (!/^8[0-9]{8}$/.test(contact)) {
        showMessage('Por favor, insira um número de telefone moçambicano válido.', 'error');
        return;
    }
    
    // Salvar o contato para uso nas próximas etapas
    userContact = contact;
    
    // Desabilitar o botão durante a requisição
    const button = document.getElementById('send-code');
    const originalText = button.textContent;
    button.textContent = 'Enviando...';
    button.disabled = true;
    
    try {
        // Requisição para a API
        const response = await fetch('64.23.215.68:8080/api/v1/auth/reset-password-request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ contact: contact })
        });
        
        // Restaurar o botão
        button.textContent = originalText;
        button.disabled = false;
        
        if (response.ok) {
            const data = await response.json();
            showMessage('Código enviado com sucesso! Verifique seu telefone.', 'success');
            
            // Avançar para a próxima etapa após um breve momento
            setTimeout(() => {
                showCodeVerificationStep();
            }, 1500);
        } else {
            const errorData = await response.json();
            if (response.status === 404) {
                showMessage('Número de telefone não encontrado.', 'error');
            } else {
                showMessage(errorData.message || 'Erro ao enviar código. Tente novamente.', 'error');
            }
        }
    } catch (error) {
        console.error('Erro na comunicação com a API:', error);
        showMessage('Erro de conexão. Verifique sua internet e tente novamente.', 'error');
        
        // Restaurar o botão
        button.textContent = originalText;
        button.disabled = false;
    }
}

// ETAPA 2: Verificar código enviado
function showCodeVerificationStep() {
    // Atualizar indicador de etapas
    updateStepIndicator(1);
    
    // Atualizar o formulário para a segunda etapa
    const form = document.querySelector('.recovery-form');
    form.innerHTML = `
        <div class="form-group">
            <label for="verification-code">Código de Verificação</label>
            <input type="text" id="verification-code" name="verification-code" placeholder="Digite o código recebido" required>
        </div>

        <button type="button" id="verify-code">Verificar Código</button>
        <button type="button" id="resend-code" class="btn-secondary">Reenviar Código</button>
        
        <div id="message-container"></div>
    `;
    
    // Adicionar evento ao botão de verificação
    document.getElementById('verify-code').addEventListener('click', verifyCode);
    
    // Adicionar evento ao botão de reenvio
    document.getElementById('resend-code').addEventListener('click', requestVerificationCode);
}

// Função para verificar o código
async function verifyCode() {
    const code = document.getElementById('verification-code').value;
    
    if (!code) {
        showMessage('Por favor, insira o código de verificação.', 'error');
        return;
    }
    
    // Desabilitar o botão durante a requisição
    const button = document.getElementById('verify-code');
    const originalText = button.textContent;
    button.textContent = 'Verificando...';
    button.disabled = true;
    
    try {
        // Requisição para a API
        const response = await fetch('https://64.23.215.68:8080/api/v1/auth/reset-password_code_confirm', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                contact: userContact,
                token: code 
            })
        });
        
        // Restaurar o botão
        button.textContent = originalText;
        button.disabled = false;
        
        if (response.ok) {
            const data = await response.json();
            recoveryToken = data.token; // Guardar o token de recuperação
            
            showMessage('Código verificado com sucesso!', 'success');
            
            // Avançar para a etapa final
            setTimeout(() => {
                showNewPasswordStep();
            }, 1500);
        } else {
            const errorData = await response.json();
            showMessage(errorData.message || 'Código inválido ou expirado.', 'error');
        }
    } catch (error) {
        console.error('Erro na comunicação com a API:', error);
        showMessage('Erro de conexão. Verifique sua internet e tente novamente.', 'error');
        
        // Restaurar o botão
        button.textContent = originalText;
        button.disabled = false;
    }
}

// ETAPA 3: Definir nova senha
function showNewPasswordStep() {
    // Atualizar indicador de etapas
    updateStepIndicator(2);
    
    // Atualizar o formulário para a terceira etapa
    const form = document.querySelector('.recovery-form');
    form.innerHTML = `
        <div class="form-group">
            <label for="new-password">Nova Senha</label>
            <input type="password" id="new-password" name="new-password" placeholder="Digite sua nova senha" required>
        </div>

        <div class="form-group">
            <label for="confirm-password">Confirmar Senha</label>
            <input type="password" id="confirm-password" name="confirm-password" placeholder="Confirme sua nova senha" required>
        </div>

        <button type="button" id="reset-password">Redefinir Senha</button>
        
        <div id="message-container"></div>
    `;
    
    // Adicionar evento ao botão de redefinição
    document.getElementById('reset-password').addEventListener('click', resetPassword);
}

// Função para redefinir a senha
async function resetPassword() {
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Validações básicas
    if (!newPassword || !confirmPassword) {
        showMessage('Por favor, preencha todos os campos.', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showMessage('A senha deve ter pelo menos 6 caracteres.', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showMessage('As senhas não coincidem.', 'error');
        return;
    }
    
    // Desabilitar o botão durante a requisição
    const button = document.getElementById('reset-password');
    const originalText = button.textContent;
    button.textContent = 'Processando...';
    button.disabled = true;
    
    try {

        alert(userContact, recoveryToken, newPassword)
        // Requisição para a API
        const response = await fetch('64.23.215.68:8080/api/v1/auth/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                contact: userContact,
                token: recoveryToken,
                password: newPassword
            })
        });
        
        // Restaurar o botão
        button.textContent = originalText;
        button.disabled = false;
        
        if (response.ok) {
            showMessage('Senha redefinida com sucesso!', 'success');
            
            // Redirecionar para a página de login após alguns segundos
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            const errorData = await response.json();
            showMessage(errorData.message || 'Erro ao redefinir senha. Tente novamente.', 'error');
        }
    } catch (error) {
        console.error('Erro na comunicação com a API:', error);
        showMessage('Erro de conexão. Verifique sua internet e tente novamente.', 'error');
        
        // Restaurar o botão
        button.textContent = originalText;
        button.disabled = false;
    }
}
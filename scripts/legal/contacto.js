document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const successMessage = document.getElementById('successMessage');
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Simular envio do formulário
        setTimeout(function() {
            // Limpar formulário
            contactForm.reset();
            
            // Mostrar mensagem de sucesso
            successMessage.style.display = 'block';
            
            // Ocultar mensagem após 5 segundos
            setTimeout(function() {
                successMessage.style.display = 'none';
            }, 5000);
        }, 1000);
    });
});
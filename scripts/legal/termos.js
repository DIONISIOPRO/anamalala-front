document.addEventListener('DOMContentLoaded', function() {
    const acceptBtn = document.getElementById('acceptBtn');
    const modal = document.getElementById('modal');
    const cancelBtn = document.getElementById('cancelBtn');
    const confirmBtn = document.getElementById('confirmBtn');
    
    // Mostrar modal quando clicar em "Aceito os Termos de Uso"
    acceptBtn.addEventListener('click', function() {
        modal.style.display = 'flex';
    });
    
    cancelBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    confirmBtn.addEventListener('click', function() {

        localStorage.setItem('termsAccepted', 'true');
        window.location.href = '../auth/register.html';

        modal.style.display = 'none';
    });
    
    // Fechar modal se clicar fora dele
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});
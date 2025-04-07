document.addEventListener('DOMContentLoaded', function() {
    // Script simples para destacar seções quando clicadas
    const sections = document.querySelectorAll('.privacy-section');
    
    sections.forEach(section => {
        section.addEventListener('click', function() {
            // Remove a classe 'highlight' de todas as seções
            sections.forEach(s => s.style.backgroundColor = '');
            
            // Adiciona a classe 'highlight' à seção clicada
            this.style.backgroundColor = '#f8f9fa';
        });
    });
});
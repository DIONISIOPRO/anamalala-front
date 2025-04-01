// DOM elements
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const ctaRegisterBtn = document.getElementById('cta-register-btn');

// Navigation functions
function goToLogin() {
    // In a real application, this would navigate to the login page
    // For now, we'll just simulate with an alert
    window.location.href = '../Portal/portal.html';
}

function goToRegister() {
    window.location.href = '../auth/register.html';
}

// Event listeners
loginBtn.addEventListener('click', goToLogin);
registerBtn.addEventListener('click', goToRegister);
ctaRegisterBtn.addEventListener('click', goToRegister);

// For development purposes, log a message if navigation is attempted
// since we don't have actual routing in this HTML/JS implementation
const originalLocation = window.location.href;

window.addEventListener('click', (event) => {
    // Check if the location has changed
    if (window.location.href !== originalLocation) {
        // Prevent actual navigation since we don't have those pages
        event.preventDefault();
        console.log(`Navegação simulada para: ${window.location.href}`);
        alert(`Em uma aplicação real, você seria redirecionado para: ${window.location.href}`);
        // Reset the URL
        history.pushState({}, '', originalLocation);
    }
});
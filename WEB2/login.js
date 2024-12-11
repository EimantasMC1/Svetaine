document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    if (sessionStorage.getItem('isAuthenticated') || localStorage.getItem('isAuthenticated')) {
        window.location.href = 'index.html';
        return;
    }

    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');
    const usernameInput = document.getElementById('username');
    const loginBtn = document.querySelector('.login-btn');

    // Toggle password visibility
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePassword.querySelector('i').classList.toggle('fa-eye');
        togglePassword.querySelector('i').classList.toggle('fa-eye-slash');
    });

    function showError(message, fields = []) {
        const errorMessage = document.getElementById('errorMessage');
        
        // Show error message
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
        
        // Add error state to fields
        fields.forEach(field => {
            // For password field, we need to target the password-input's parent
            const formGroup = field.id === 'password' 
                ? field.closest('.form-group')
                : field.parentElement;
            
            formGroup.classList.add('error');
        });

        // Remove loading state from button
        loginBtn.classList.remove('loading');

        // Remove error states after delay
        setTimeout(() => {
            errorMessage.classList.remove('show');
            fields.forEach(field => {
                const formGroup = field.id === 'password'
                    ? field.closest('.form-group')
                    : field.parentElement;
                formGroup.classList.remove('error');
            });
        }, 1500);
    }

    // Handle form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        // Add loading state
        loginBtn.classList.add('loading');

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Basic validation
        const validCredentials = {
            username: 'admin',
            password: 'admin123'
        };

        try {
            if (username === validCredentials.username && password === validCredentials.password) {
                // Store authentication state
                sessionStorage.setItem('isAuthenticated', 'true');
                
                // Redirect to main page on successful login
                window.location.href = 'index.html';
            } else {
                showError('Neteisingas vartotojo vardas arba slaptažodis', [usernameInput, passwordInput]);
            }
        } catch (error) {
            console.error('Login failed:', error);
            showError('Įvyko klaida. Bandykite dar kartą.');
        }
    });

    // Remove error state on input
    [usernameInput, passwordInput].forEach(input => {
        input.addEventListener('input', () => {
            const formGroup = input.id === 'password'
                ? input.closest('.form-group')
                : input.parentElement;
            formGroup.classList.remove('error');
            document.getElementById('errorMessage').classList.remove('show');
        });
    });
}); 
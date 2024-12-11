function checkAuth() {
    const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true' || 
                          localStorage.getItem('isAuthenticated') === 'true';
    
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    if (!isAuthenticated && currentPage !== 'login.html') {
        window.location.href = 'login.html';
        return false;
    }
    
    if (isAuthenticated && currentPage === 'login.html') {
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

function logout() {
    // Clear both session and local storage
    sessionStorage.removeItem('isAuthenticated');
    localStorage.removeItem('isAuthenticated');
    
    // Redirect to login page
    window.location.href = 'login.html';
}

// Check authentication on page load
document.addEventListener('DOMContentLoaded', checkAuth); 
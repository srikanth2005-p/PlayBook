// Helper function to show error message
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

// Helper function to hide error message
function hideError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

// Helper function to validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Helper function to validate phone number format
function isValidPhone(phone) {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
}

// Handle owner login
document.getElementById('ownerLoginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Reset error messages
    hideError('emailError');
    hideError('passwordError');
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Validate email
    if (!isValidEmail(email)) {
        showError('emailError', 'Please enter a valid email address');
        return;
    }
    
    try {
        const response = await fetch('/api/owners/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store token in localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('ownerId', data.owner.id);
            
            // Redirect to dashboard
            window.location.href = '/views/owner-dashboard.html';
        } else {
            showError('passwordError', data.error || 'Invalid email or password');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('passwordError', 'An error occurred during login. Please try again.');
    }
});

// Handle user login
document.getElementById('userLoginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Reset error messages
    hideError('emailError');
    hideError('passwordError');
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Validate email
    if (!isValidEmail(email)) {
        showError('emailError', 'Please enter a valid email address');
        return;
    }
    
    try {
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store token in localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.user.id);
            
            // Redirect to dashboard
            window.location.href = '/views/user-dashboard.html';
        } else {
            showError('passwordError', data.error || 'Invalid email or password');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('passwordError', 'An error occurred during login. Please try again.');
    }
});

// Handle user registration
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Reset error messages
    hideError('fullNameError');
    hideError('emailError');
    hideError('phoneError');
    hideError('passwordError');
    hideError('confirmPasswordError');
    hideError('interestsError');
    
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Get selected interests
    const interests = Array.from(document.querySelectorAll('input[name="interests"]:checked'))
        .map(checkbox => checkbox.value);
    
    // Validate full name
    if (fullName.length < 2) {
        showError('fullNameError', 'Name must be at least 2 characters long');
        return;
    }
    
    // Validate email
    if (!isValidEmail(email)) {
        showError('emailError', 'Please enter a valid email address');
        return;
    }
    
    // Validate phone
    if (!isValidPhone(phone)) {
        showError('phoneError', 'Please enter a valid 10-digit phone number');
        return;
    }
    
    // Validate password
    if (password.length < 6) {
        showError('passwordError', 'Password must be at least 6 characters long');
        return;
    }
    
    // Validate confirm password
    if (password !== confirmPassword) {
        showError('confirmPasswordError', 'Passwords do not match');
        return;
    }
    
    // Validate interests
    if (interests.length === 0) {
        showError('interestsError', 'Please select at least one sport interest');
        return;
    }
    
    try {
        const response = await fetch('/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fullName,
                email,
                phone,
                password,
                interests
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store token in localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.user.id);
            
            // Redirect to dashboard
            window.location.href = '/views/user-dashboard.html';
        } else {
            // Show specific error based on the response
            if (data.error.includes('email')) {
                showError('emailError', data.error);
            } else if (data.error.includes('phone')) {
                showError('phoneError', data.error);
            } else {
                showError('passwordError', data.error || 'Registration failed. Please try again.');
            }
        }
    } catch (error) {
        console.error('Registration error:', error);
        showError('passwordError', 'An error occurred during registration. Please try again.');
    }
});

// Handle owner registration
document.getElementById('ownerRegisterForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Reset error messages
    hideError('fullNameError');
    hideError('emailError');
    hideError('phoneError');
    hideError('passwordError');
    hideError('confirmPasswordError');
    hideError('businessNameError');
    hideError('venueTypeError');
    hideError('addressError');
    
    const formData = new FormData();
    
    // Get form data
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const businessName = document.getElementById('businessName').value;
    const venueType = document.getElementById('venueType').value;
    const address = document.getElementById('address').value;

    // Validate email
    if (!isValidEmail(email)) {
        showError('emailError', 'Please enter a valid email address');
        return;
    }

    // Validate phone
    if (!isValidPhone(phone)) {
        showError('phoneError', 'Please enter a valid 10-digit phone number');
        return;
    }

    // Validate password
    if (password.length < 6) {
        showError('passwordError', 'Password must be at least 6 characters long');
        return;
    }

    // Validate password match
    if (password !== confirmPassword) {
        showError('confirmPasswordError', 'Passwords do not match');
        return;
    }

    // Add form fields
    formData.append('fullName', fullName);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('password', password);
    formData.append('confirmPassword', confirmPassword);
    formData.append('businessName', businessName);
    formData.append('venueType', venueType);
    formData.append('address', address);
    
    try {
        const response = await fetch('/api/owners/register', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store token in localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('ownerId', data.owner.id);
            
            // Redirect to dashboard
            window.location.href = '/views/owner-dashboard.html';
        } else {
            // Show specific error based on the response
            if (data.errors) {
                data.errors.forEach(error => {
                    showError(`${error.param}Error`, error.msg);
                });
            } else if (data.error) {
                if (data.error.includes('email')) {
                    showError('emailError', data.error);
                } else if (data.error.includes('phone')) {
                    showError('phoneError', data.error);
                } else {
                    showError('passwordError', data.error);
                }
            }
        }
    } catch (error) {
        console.error('Registration error:', error);
        showError('passwordError', 'An error occurred during registration. Please try again.');
    }
});

// Handle social sign in/up
function signInWithGoogle() {
    // Implement Google Sign In
    console.log('Google Sign In clicked');
}

function signUpWithGoogle() {
    // Implement Google Sign Up
    console.log('Google Sign Up clicked');
}

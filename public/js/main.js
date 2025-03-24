// Handle smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Handle search functionality
const searchBtn = document.querySelector('.search-btn');
const searchInput = document.querySelector('.search-input');

searchBtn.addEventListener('click', () => {
    const searchTerm = searchInput.value.trim();
    if (searchTerm) {
        // TODO: Implement search functionality
        console.log('Searching for:', searchTerm);
    }
});

// Add animation to category cards on scroll
const categoryCards = document.querySelectorAll('.category-card');

const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

categoryCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(card);
});

// Handle mobile navigation menu
const navLinks = document.querySelector('.nav-links');
const hamburger = document.createElement('div');
hamburger.classList.add('hamburger');
hamburger.innerHTML = '<i class="fas fa-bars"></i>';

document.querySelector('.navbar-container').appendChild(hamburger);

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Add sticky navigation on scroll
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        navbar.classList.remove('scroll-up');
        return;
    }
    
    if (currentScroll > lastScroll && !navbar.classList.contains('scroll-down')) {
        // Scroll down
        navbar.classList.remove('scroll-up');
        navbar.classList.add('scroll-down');
    } else if (currentScroll < lastScroll && navbar.classList.contains('scroll-down')) {
        // Scroll up
        navbar.classList.remove('scroll-down');
        navbar.classList.add('scroll-up');
    }
    
    lastScroll = currentScroll;
});

// Multi-step Form Handling
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.multi-step-form');
    if (!form) return;

    const steps = Array.from(form.querySelectorAll('.form-step'));
    const progressSteps = Array.from(document.querySelectorAll('.progress-step'));
    const nextButtons = form.querySelectorAll('.next-step');
    const prevButtons = form.querySelectorAll('.prev-step');
    let currentStep = 0;

    // Enhanced form validation
    const VALIDATION_RULES = {
        fullName: {
            pattern: /^[a-zA-Z\s]{2,50}$/,
            message: 'Please enter a valid name (2-50 characters, letters only)'
        },
        email: {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Please enter a valid email address'
        },
        phone: {
            pattern: /^[0-9]{10}$/,
            message: 'Please enter a valid 10-digit phone number'
        },
        password: {
            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            message: 'Password must contain at least 8 characters, including uppercase, lowercase, number and special character'
        },
        businessName: {
            pattern: /^[\w\s&'-]{2,100}$/,
            message: 'Business name must be 2-100 characters long'
        }
    };

    // Enhanced file upload preview
    function createFilePreview(file, previewArea) {
        const reader = new FileReader();
        const preview = document.createElement('div');
        preview.className = 'file-preview';

        reader.onload = function(e) {
            let previewContent;
            
            if (file.type.startsWith('image/')) {
                previewContent = `
                    <div class="preview-image">
                        <img src="${e.target.result}" alt="${file.name}">
                    </div>
                `;
            } else {
                previewContent = `
                    <div class="preview-document">
                        <svg viewBox="0 0 24 24" class="document-icon">
                            <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                        </svg>
                    </div>
                `;
            }

            preview.innerHTML = `
                ${previewContent}
                <div class="preview-info">
                    <span class="preview-name">${file.name}</span>
                    <span class="preview-size">${formatFileSize(file.size)}</span>
                    <button type="button" class="preview-remove" aria-label="Remove file">
                        <svg viewBox="0 0 24 24">
                            <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                        </svg>
                    </button>
                </div>
                <div class="preview-progress">
                    <div class="progress-bar"></div>
                </div>
            `;

            // Simulate upload progress
            simulateUploadProgress(preview.querySelector('.progress-bar'));
        };

        reader.readAsDataURL(file);
        return preview;
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function simulateUploadProgress(progressBar) {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 30;
            if (progress > 100) {
                progress = 100;
                clearInterval(interval);
                progressBar.parentElement.classList.add('completed');
            }
            progressBar.style.width = `${progress}%`;
        }, 500);
    }

    // Enhanced form validation
    function validateInput(input) {
        const rule = VALIDATION_RULES[input.name];
        if (!rule) return true;

        const isValid = rule.pattern.test(input.value);
        if (!isValid) {
            showError(input, rule.message);
        } else {
            clearError(input);
        }
        return isValid;
    }

    // Enhanced error handling
    function showError(input, message) {
        const formGroup = input.closest('.form-group');
        let error = formGroup.querySelector('.error-message');
        
        if (!error) {
            error = document.createElement('span');
            error.className = 'error-message';
            formGroup.appendChild(error);
        }
        
        error.textContent = message;
        input.classList.add('error');
        
        // Shake animation
        input.classList.add('shake');
        setTimeout(() => input.classList.remove('shake'), 500);
    }

    // Form step transitions with animations
    function updateFormSteps() {
        const currentStepEl = steps[currentStep];
        const direction = currentStepEl.dataset.direction || 'next';
        
        steps.forEach((step, index) => {
            if (index === currentStep) {
                step.classList.add('active', `slide-in-${direction}`);
            } else {
                step.classList.remove('active', 'slide-in-next', 'slide-in-prev');
            }
        });
    }

    // Enhanced password strength checker
    function checkPasswordStrength() {
        const password = passwordInput.value;
        const strengthBar = document.querySelector('.strength-bar');
        const strengthText = document.querySelector('.strength-text span');
        const requirements = document.querySelector('.password-requirements');

        if (!requirements) {
            createPasswordRequirements();
        }

        const checks = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            number: /\d/.test(password),
            special: /[@$!%*?&]/.test(password)
        };

        updatePasswordRequirements(checks);

        const strength = Object.values(checks).filter(Boolean).length;
        
        strengthBar.className = 'strength-bar';
        switch(strength) {
            case 0:
            case 1:
                strengthBar.classList.add('weak');
                strengthText.textContent = 'Weak';
                break;
            case 2:
            case 3:
                strengthBar.classList.add('medium');
                strengthText.textContent = 'Medium';
                break;
            case 4:
                strengthBar.classList.add('strong');
                strengthText.textContent = 'Strong';
                break;
            case 5:
                strengthBar.classList.add('very-strong');
                strengthText.textContent = 'Very Strong';
                break;
        }
    }

    function createPasswordRequirements() {
        const requirements = document.createElement('div');
        requirements.className = 'password-requirements';
        requirements.innerHTML = `
            <ul>
                <li data-requirement="length">At least 8 characters</li>
                <li data-requirement="lowercase">One lowercase letter</li>
                <li data-requirement="uppercase">One uppercase letter</li>
                <li data-requirement="number">One number</li>
                <li data-requirement="special">One special character</li>
            </ul>
        `;
        
        passwordInput.parentElement.appendChild(requirements);
    }

    function updatePasswordRequirements(checks) {
        const requirements = document.querySelectorAll('.password-requirements li');
        requirements.forEach(req => {
            const type = req.dataset.requirement;
            req.classList.toggle('met', checks[type]);
        });
    }

    // API endpoints for form submission
    const API_ENDPOINTS = {
        validateEmail: '/api/validate-email',
        validatePhone: '/api/validate-phone',
        uploadFile: '/api/upload-file',
        registerOwner: '/api/register-owner'
    };

    // Debounced input validation
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Email availability check
    const checkEmailAvailability = debounce(async (email) => {
        try {
            const response = await fetch(`${API_ENDPOINTS.validateEmail}?email=${email}`);
            const data = await response.json();
            
            const emailInput = document.getElementById('email');
            if (!data.available) {
                showError(emailInput, 'This email is already registered');
            }
        } catch (error) {
            console.error('Email validation failed:', error);
        }
    }, 500);

    // Initialize form enhancements
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', checkPasswordStrength);
    }

    // Add input validation listeners
    form.querySelectorAll('input[required]').forEach(input => {
        input.addEventListener('blur', () => validateInput(input));
        input.addEventListener('input', () => {
            if (input.classList.contains('error')) {
                validateInput(input);
            }
        });
    });

    // Add email availability check
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('blur', () => {
            if (validateInput(emailInput)) {
                checkEmailAvailability(emailInput.value);
            }
        });
    }

    // Initialize file upload enhancements
    initializeFileUploads();

    // Next button click handler
    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                currentStep++;
                updateFormSteps();
                updateProgressBar();
            }
        });
    });

    // Previous button click handler
    prevButtons.forEach(button => {
        button.addEventListener('click', () => {
            currentStep--;
            updateFormSteps();
            updateProgressBar();
        });
    });

    // Update form steps
    function updateFormSteps() {
        steps.forEach((step, index) => {
            step.classList.toggle('active', index === currentStep);
        });
    }

    // Update progress bar
    function updateProgressBar() {
        progressSteps.forEach((step, index) => {
            step.classList.toggle('active', index === currentStep);
            step.classList.toggle('completed', index < currentStep);
        });
    }

    // Validate current step
    function validateStep(step) {
        const currentStepEl = steps[step];
        const inputs = currentStepEl.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                showError(input);
            } else {
                clearError(input);
            }
        });

        return isValid;
    }

    // Show error on input
    function showError(input) {
        const formGroup = input.closest('.form-group');
        if (!formGroup.querySelector('.error-message')) {
            const error = document.createElement('span');
            error.className = 'error-message';
            error.textContent = 'This field is required';
            formGroup.appendChild(error);
        }
        input.classList.add('error');
    }

    // Clear error from input
    function clearError(input) {
        const formGroup = input.closest('.form-group');
        const error = formGroup.querySelector('.error-message');
        if (error) {
            error.remove();
        }
        input.classList.remove('error');
    }

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!validateStep(currentStep)) {
            return;
        }

        const formData = new FormData(form);
        
        try {
            // Show loading state
            const submitButton = form.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Processing...';

            // TODO: Replace with your actual API endpoint
            const response = await fetch('/api/register-owner', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Registration failed');
            }

            // Show success message and redirect
            showMessage('Registration successful! Redirecting to dashboard...', 'success');
            setTimeout(() => {
                window.location.href = '/owner-dashboard';
            }, 2000);

        } catch (error) {
            showMessage(error.message, 'error');
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    });

    // Show message function
    function showMessage(message, type) {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        messageEl.textContent = message;
        
        form.insertAdjacentElement('beforebegin', messageEl);
        
        setTimeout(() => {
            messageEl.remove();
        }, 5000);
    }

    // Initialize enhanced file uploads
    function initializeFileUploads() {
        const fileInputs = document.querySelectorAll('input[type="file"]');
        
        fileInputs.forEach(input => {
            const uploadArea = input.nextElementSibling;
            const previewContainer = document.createElement('div');
            previewContainer.className = 'file-previews';
            uploadArea.after(previewContainer);

            input.addEventListener('change', () => {
                const files = Array.from(input.files);
                previewContainer.innerHTML = '';
                
                files.forEach(file => {
                    const preview = createFilePreview(file, previewContainer);
                    previewContainer.appendChild(preview);
                    
                    // Add remove button functionality
                    preview.querySelector('.preview-remove').addEventListener('click', () => {
                        preview.remove();
                        // Clear the file input
                        input.value = '';
                    });
                });
            });
        });
    }
});

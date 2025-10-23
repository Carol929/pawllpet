// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
const closeLogin = document.getElementById('closeLogin');
const closeSignup = document.getElementById('closeSignup');
const switchToSignup = document.getElementById('switchToSignup');
const switchToLogin = document.getElementById('switchToLogin');
const searchInput = document.getElementById('searchInput');
const cartCount = document.getElementById('cartCount');
const helpBtn = document.getElementById('helpBtn');

// Modal functionality
function openModal(modal) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Event Listeners for modals
loginBtn.addEventListener('click', () => openModal(loginModal));
signupBtn.addEventListener('click', () => openModal(signupModal));

closeLogin.addEventListener('click', () => closeModal(loginModal));
closeSignup.addEventListener('click', () => closeModal(signupModal));

switchToSignup.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal(loginModal);
    openModal(signupModal);
});

switchToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal(signupModal);
    openModal(loginModal);
});

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        closeModal(loginModal);
    }
    if (e.target === signupModal) {
        closeModal(signupModal);
    }
});

// Search functionality
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value;
    console.log('Searching for:', searchTerm);
    // Here you would implement actual search functionality
    // For now, we'll just log the search term
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        const searchTerm = e.target.value;
        console.log('Search submitted:', searchTerm);
        // Implement search functionality here
        alert(`Searching for: ${searchTerm}`);
    }
});

// Language selector functionality
const langBtns = document.querySelectorAll('.lang-btn');
langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons
        langBtns.forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        btn.classList.add('active');
        
        const selectedLang = btn.dataset.lang;
        console.log('Language changed to:', selectedLang);
        // Implement language switching here
    });
});

// Cart functionality
let cartItems = 0;

function updateCartCount() {
    cartCount.textContent = cartItems;
}

// Add to cart buttons
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-add-cart')) {
        cartItems++;
        updateCartCount();
        
        // Add visual feedback
        e.target.textContent = 'Added!';
        e.target.style.background = '#28a745';
        
        setTimeout(() => {
            e.target.textContent = 'Add to Cart';
            e.target.style.background = '#D4B28C';
        }, 1000);
    }
});

// Form submissions
document.addEventListener('submit', (e) => {
    if (e.target.classList.contains('auth-form')) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        if (e.target.closest('#loginModal')) {
            console.log('Login attempt:', data);
            // Implement login logic here
            alert('Login functionality would be implemented here');
            closeModal(loginModal);
        } else if (e.target.closest('#signupModal')) {
            console.log('Signup attempt:', data);
            
            // Basic validation
            if (data.password !== data.confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            
            // Implement signup logic here
            alert('Signup functionality would be implemented here');
            closeModal(signupModal);
        }
    }
});

// Newsletter subscription
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = e.target.querySelector('.newsletter-input').value;
        console.log('Newsletter subscription:', email);
        alert('Thank you for subscribing to our newsletter!');
        e.target.reset();
    });
}

// Help button functionality
helpBtn.addEventListener('click', () => {
    alert('Welcome to PawLL! How can we help you today?\n\nYou can:\n- Browse our products\n- Search for specific items\n- Create an account\n- Contact us for support');
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Hero section buttons functionality
document.addEventListener('click', (e) => {
    if (e.target.textContent === 'Shop Toys') {
        // Scroll to collections section
        document.getElementById('collections').scrollIntoView({
            behavior: 'smooth'
        });
    } else if (e.target.textContent === 'Shop Leashes') {
        // Scroll to collections section
        document.getElementById('collections').scrollIntoView({
            behavior: 'smooth'
        });
    }
});

// Collection explore links
document.querySelectorAll('.explore-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const category = e.target.closest('.collection-card').querySelector('h3').textContent;
        console.log('Exploring category:', category);
        alert(`Exploring ${category} category - this would navigate to the category page`);
    });
});

// Mobile menu toggle (if needed)
const navToggle = document.getElementById('navToggle');
const navList = document.querySelector('.nav-list');

if (navToggle && navList) {
    navToggle.addEventListener('click', () => {
        navList.classList.toggle('active');
        const isExpanded = navList.classList.contains('active');
        navToggle.setAttribute('aria-expanded', isExpanded);
    });
}

// Initialize cart count
updateCartCount();

// Add some interactive animations
document.addEventListener('DOMContentLoaded', () => {
    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe sections for animation
    document.querySelectorAll('.feature-item, .collection-card, .product-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Search suggestions (basic implementation)
const searchSuggestions = [
    'toys', 'apparel', 'leashes', 'collars', 'puzzle toys', 
    'hoodies', 'raincoats', 'reflective', 'adjustable'
];

searchInput.addEventListener('focus', () => {
    // Could implement search suggestions here
    console.log('Search input focused');
});

// Keyboard navigation for modals
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (loginModal.style.display === 'block') {
            closeModal(loginModal);
        }
        if (signupModal.style.display === 'block') {
            closeModal(signupModal);
        }
    }
});

console.log('PawLL website loaded successfully!');
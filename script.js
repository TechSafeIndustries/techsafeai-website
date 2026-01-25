// Form submission handling
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Generate unique reference number
            const referenceNumber = 'TSA-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
            
            // Show success message
            const formSuccess = document.getElementById('formSuccess');
            const referenceNumberSpan = document.getElementById('referenceNumber');
            
            if (formSuccess && referenceNumberSpan) {
                referenceNumberSpan.textContent = referenceNumber;
                contactForm.style.display = 'none';
                formSuccess.style.display = 'block';
                
                // Scroll to success message
                formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            
            // In production, this would send data to backend
            console.log('Form submitted with reference:', referenceNumber);
        });
    }
    
    // Module info buttons
    const moduleInfoButtons = document.querySelectorAll('.module-info-btn');
    moduleInfoButtons.forEach(button => {
        button.addEventListener('click', function() {
            const moduleName = this.getAttribute('data-module');
            alert(`Module documentation for ${moduleName} would be displayed here.\n\nIncludes:\n- Workflow diagrams\n- Field definitions\n- Compliance mapping tables\n- Sample completed reports`);
        });
    });
    
    // Request module buttons
    const requestModuleButtons = document.querySelectorAll('.request-module-btn');
    requestModuleButtons.forEach(button => {
        button.addEventListener('click', function() {
            window.location.href = 'contact.html';
        });
    });
    
    // Export module summary button
    const exportSummaryBtn = document.getElementById('exportSummaryBtn');
    if (exportSummaryBtn) {
        exportSummaryBtn.addEventListener('click', function() {
            alert('Module Summary PDF export functionality.\n\nThis would generate a PDF containing:\n- Feature lists for each module\n- Compliance coverage mapping\n- Implementation requirements\n- User role specifications\n- Regulatory framework alignment');
        });
    }
    
    // Smooth scroll for anchor links
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
    
    // Add animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe cards and sections
    const animatedElements = document.querySelectorAll('.capability-card, .industry-card, .control-card, .module-card, .flow-step');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Add active state to navigation
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-menu a').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
        link.classList.add('active');
    }
});

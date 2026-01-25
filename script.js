// ===== NAVIGATION BEHAVIOUR =====
document.addEventListener('DOMContentLoaded', function () {

    // Scroll behaviour for navbar
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', function () {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    }, { passive: true });

    // Active state management
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-menu a');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');

        // Remove any existing active class
        link.classList.remove('active');

        // Add active class to current page
        if (href === currentPage ||
            (currentPage === '' && href === 'index.html') ||
            (currentPage === '/' && href === 'index.html')) {
            link.classList.add('active');
        }
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const navbarHeight = navbar.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Keyboard navigation enhancement
    navLinks.forEach((link, index) => {
        link.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowRight' && navLinks[index + 1]) {
                e.preventDefault();
                navLinks[index + 1].focus();
            } else if (e.key === 'ArrowLeft' && navLinks[index - 1]) {
                e.preventDefault();
                navLinks[index - 1].focus();
            }
        });
    });

    // Form submission handling
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
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
        });
    }

    // Module info buttons
    const moduleInfoButtons = document.querySelectorAll('.module-info-btn');
    moduleInfoButtons.forEach(button => {
        button.addEventListener('click', function () {
            const moduleName = this.getAttribute('data-module');
            alert(`Module documentation for ${moduleName} would be displayed here.\n\nIncludes:\n- Workflow diagrams\n- Field definitions\n- Compliance mapping tables\n- Sample completed reports`);
        });
    });

    // Request module buttons
    const requestModuleButtons = document.querySelectorAll('.request-module-btn');
    requestModuleButtons.forEach(button => {
        button.addEventListener('click', function () {
            window.location.href = 'contact.html';
        });
    });

    // Export module summary button
    const exportSummaryBtn = document.getElementById('exportSummaryBtn');
    if (exportSummaryBtn) {
        exportSummaryBtn.addEventListener('click', function () {
            alert('Module Summary PDF export functionality.\n\nThis would generate a PDF containing:\n- Feature lists for each module\n- Compliance coverage mapping\n- Implementation requirements\n- User role specifications\n- Regulatory framework alignment');
        });
    }

    // Scroll animation observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe cards and sections for scroll animations
    const animatedElements = document.querySelectorAll('.capability-card, .industry-card, .control-card, .module-card, .flow-step');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Prevent layout shift on page load
    window.addEventListener('load', function () {
        document.body.style.paddingTop = navbar.offsetHeight + 'px';
        navbar.style.marginBottom = `-${navbar.offsetHeight}px`;
    });
});

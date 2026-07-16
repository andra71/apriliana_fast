// =============================================
// SITE DATA CONFIGURATION
// =============================================
const siteData = {
    brand: "APRILIANAFAST",
    contact: {
        phone: "087712748975",
        whatsapp: "6287712748975",
        email: "aprilianafajartok@gmail.com", // updated
        instagram: "@aprilianafast",
        address: "Klaten, Central Java"
    },
    // updated to Drive link so handlers can reuse it
    priceListUrl: "https://drive.google.com/file/d/1AEKKEY-l2-ICl-4QO7tCGmWpB6sKyuvu/view?usp=drivesdk",
    // TODO: replace with your deployed Apps Script Web App URL (see Code.gs below)
    sheetUrl: "REPLACE_WITH_YOUR_WEB_APP_URL"
};

// =============================================
// DOM ELEMENTS
// =============================================
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const backToTop = document.getElementById('backToTop');
const submitBtn = document.getElementById('submitBtn');

// =============================================
// NAVBAR SCROLL EFFECT
// =============================================
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    // Add scrolled class
    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // Show/hide back to top button
    if (currentScroll > 300) {
        backToTop.classList.add('show');
    } else {
        backToTop.classList.remove('show');
    }

    lastScroll = currentScroll;
});

// =============================================
// MOBILE MENU TOGGLE
// =============================================
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : 'auto';
});

// Close menu when clicking nav links
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// =============================================
// SMOOTH SCROLL FOR NAVIGATION
// =============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            // use dynamic navbar height instead of fixed 80px
            const navHeight = navbar ? navbar.offsetHeight : 80;
            const offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight - 8;
            
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// =============================================
// BACK TO TOP BUTTON
// =============================================
backToTop.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// =============================================
// CONTACT FORM SUBMISSION -> send to Google Sheet
// =============================================
// If submitBtn exists (form present), attach handler; otherwise skip
if (submitBtn) {
    submitBtn.removeEventListener?.('click', () => {}); // safe guard if reloaded in dev tools

    submitBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        // Get form values
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const subject = document.getElementById('subject').value.trim();
        const reason = document.getElementById('reason').value;
        const message = document.getElementById('message').value.trim();

        // Validation (same as before)
        if (!firstName || !lastName || !email || !phone || !subject || !reason || !message) {
            showNotification('Mohon lengkapi semua field!', 'error');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('Format email tidak valid!', 'error');
            return;
        }

        const phoneRegex = /^(08|628|\+628)[0-9]{8,12}$/;
        if (!phoneRegex.test(phone)) {
            showNotification('Format nomor telepon tidak valid!', 'error');
            return;
        }

        // Ensure sheetUrl is configured
        if (!siteData.sheetUrl || siteData.sheetUrl === 'REPLACE_WITH_YOUR_WEB_APP_URL') {
            showNotification('Sheet URL belum dikonfigurasi. Silakan deploy Apps Script dan masukkan URL ke siteData.sheetUrl', 'error');
            return;
        }

        // Prepare payload
        const payload = {
            timestamp: new Date().toISOString(),
            firstName,
            lastName,
            email,
            phone,
            subject,
            reason,
            message
        };

        try {
            // POST to Apps Script Web App
            const resp = await fetch(siteData.sheetUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
                mode: 'cors'
            });

            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

            const result = await resp.json().catch(() => ({}));
            // Show success
            showNotification('Terima kasih — data Anda telah terkirim.', 'success');

            // Clear form
            document.getElementById('firstName').value = '';
            document.getElementById('lastName').value = '';
            document.getElementById('email').value = '';
            document.getElementById('phone').value = '';
            document.getElementById('subject').value = '';
            document.getElementById('reason').value = '';
            document.getElementById('message').value = '';

        } catch (err) {
            console.error('Sheet submit error:', err);
            showNotification('Gagal mengirim data. Silakan coba lagi atau hubungi via WhatsApp.', 'error');
        }
    });
}

// =============================================
// NOTIFICATION SYSTEM
// =============================================
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotif = document.querySelector('.notification');
    if (existingNotif) {
        existingNotif.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${getNotificationIcon(type)}</span>
            <span class="notification-message">${message}</span>
        </div>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        animation: slideInRight 0.3s ease-out, slideOutRight 0.3s ease-in 2.7s;
        display: flex;
        align-items: center;
        gap: 12px;
        max-width: 400px;
    `;

    // Add to DOM
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success':
            return '✓';
        case 'error':
            return '✕';
        default:
            return 'ℹ';
    }
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    .notification-content {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .notification-icon {
        font-size: 1.5rem;
        font-weight: bold;
    }

    .notification-message {
        font-size: 0.95rem;
        line-height: 1.4;
    }
`;
document.head.appendChild(style);

// =============================================
// APPOINTMENT BUTTONS - WHATSAPP REDIRECT
// =============================================
const appointmentButtons = document.querySelectorAll('.btn-appointment, .btn-primary');

appointmentButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        // If this is the Pricelist button, let it behave as a normal link (open Drive PDF)
        if (button.id === 'pricelistBtn') {
            return; // don't preventDefault, don't redirect to WhatsApp
        }

        e.preventDefault();
        
        const message = `Halo APRILIANAFAST, saya tertarik untuk booking makeup appointment. Mohon informasi lebih lanjut.`;
        const whatsappUrl = `https://wa.me/${siteData.contact.whatsapp}?text=${encodeURIComponent(message)}`;
        
        window.open(whatsappUrl, '_blank');
        showNotification('Mengarahkan ke WhatsApp...', 'success');
    });
});

// =============================================
// SCROLL ANIMATIONS (AOS-like effect)
// =============================================
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

// Observe all sections and cards
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll(
        '.hero-text, .hero-image, .about-image, .about-text, ' +
        '.service-card, .package-card, .testimonial-card, ' +
        '.section-header, .contact-info, .contact-form'
    );

    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        el.style.transitionDelay = `${index * 0.05}s`;
        
        observer.observe(el);
    });
});

// =============================================
// GALLERY CAROUSEL - 17 FOTO (6 SLIDES)
// =============================================
function initGalleryCarousel() {
    const track = document.querySelector('.carousel-track');
    const viewport = document.querySelector('.carousel-viewport');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    const dots = document.querySelectorAll('.carousel-dots .dot');
    
    if (!track || !viewport) return;
    
    const slides = document.querySelectorAll('.slide');
    const totalSlides = slides.length;
    let currentSlide = 0;
    let autoplayInterval;
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationID;
    let isAutoplay = true;
    
    // Initialize carousel
    function init() {
        updateCarousel();
        attachEvents();
        startAutoplay();
    }
    
    function updateCarousel() {
        // Reset track position
        track.style.transform = `translateX(-${currentSlide * 100}%)`;
        
        // Update active dot
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }
    
    function goToSlide(index) {
        if (index < 0) index = totalSlides - 1;
        if (index >= totalSlides) index = 0;
        
        currentSlide = index;
        updateCarousel();
    }
    
    function nextSlide() {
        goToSlide(currentSlide + 1);
    }
    
    function prevSlide() {
        goToSlide(currentSlide - 1);
    }
    
    // Touch/swipe functionality
    function getPositionX(event) {
        return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
    }
    
    function setSliderPosition() {
        track.style.transform = `translateX(${currentTranslate}px)`;
    }
    
    function animation() {
        setSliderPosition();
        if (isDragging) requestAnimationFrame(animation);
    }
    
    function startAutoplay() {
        if (!isAutoplay) return;
        clearInterval(autoplayInterval);
        autoplayInterval = setInterval(() => {
            nextSlide();
        }, 5000);
    }
    
    function stopAutoplay() {
        clearInterval(autoplayInterval);
    }
    
    function attachEvents() {
        // Navigation buttons
        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                prevSlide();
                startAutoplay();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                nextSlide();
                startAutoplay();
            });
        }
        
        // Dots navigation
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                goToSlide(index);
                startAutoplay();
            });
        });
        
        // Touch events
        track.addEventListener('touchstart', touchStart, { passive: true });
        track.addEventListener('touchmove', touchMove, { passive: true });
        track.addEventListener('touchend', touchEnd);
        
        // Mouse events
        track.addEventListener('mousedown', touchStart);
        track.addEventListener('mousemove', touchMove);
        track.addEventListener('mouseup', touchEnd);
        track.addEventListener('mouseleave', touchEnd);
        
        // Pause autoplay on hover
        viewport.addEventListener('mouseenter', () => {
            isAutoplay = false;
            stopAutoplay();
        });
        
        viewport.addEventListener('mouseleave', () => {
            isAutoplay = true;
            startAutoplay();
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (document.activeElement && ['INPUT','TEXTAREA','SELECT','BUTTON'].includes(document.activeElement.tagName)) return;
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                nextSlide();
                startAutoplay();
            }
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                prevSlide();
                startAutoplay();
            }
        });
    }
    
    // Touch handlers
    function touchStart(event) {
        if (event.type === 'mousedown') {
            event.preventDefault();
        }
        
        isDragging = true;
        startPos = getPositionX(event);
        prevTranslate = currentTranslate;
        stopAutoplay();
        
        animationID = requestAnimationFrame(animation);
    }
    
    function touchMove(event) {
        if (!isDragging) return;
        const currentPosition = getPositionX(event);
        currentTranslate = prevTranslate + currentPosition - startPos;
    }
    
    function touchEnd() {
        isDragging = false;
        cancelAnimationFrame(animationID);
        
        const movedBy = currentTranslate - prevTranslate;
        
        if (movedBy < -50 && currentSlide < totalSlides - 1) {
            nextSlide();
        }
        
        if (movedBy > 50 && currentSlide > 0) {
            prevSlide();
        }
        
        // Reset position
        currentTranslate = 0;
        prevTranslate = 0;
        setSliderPosition();
        
        startAutoplay();
    }
    
    // Initialize
    init();
}

// =============================================
// LIGHTBOX FUNCTIONS
// =============================================
function openLightbox(url, alt = '') {
    const lb = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightboxImage');
    if (!lb || !lbImg) return;
    
    lbImg.src = url;
    lbImg.alt = alt;
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lb = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightboxImage');
    if (!lb || !lbImg) return;
    
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    
    setTimeout(() => {
        lbImg.src = '';
        lbImg.alt = '';
    }, 300);
}

// =============================================
// ACTIVE NAV LINK ON SCROLL
// =============================================
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navHeight = navbar ? navbar.offsetHeight : 80;
    const scrollPosition = window.pageYOffset + navHeight + 20;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
});

// Add active link styles
const activeLinkStyle = document.createElement('style');
activeLinkStyle.textContent = `
    .nav-link.active {
        color: var(--primary-gold);
    }
    
    .nav-link.active::after {
        width: 100%;
    }
`;
document.head.appendChild(activeLinkStyle);

// =============================================
// LOADING ANIMATION
// =============================================
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease-in';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// =============================================
// FORM INPUT ANIMATION
// =============================================
const formInputs = document.querySelectorAll('.form-input');

formInputs.forEach(input => {
    input.addEventListener('focus', () => {
        input.style.transform = 'scale(1.02)';
        input.style.boxShadow = '0 4px 12px rgba(200, 168, 130, 0.2)';
    });

    input.addEventListener('blur', () => {
        input.style.transform = 'scale(1)';
        input.style.boxShadow = 'none';
    });
});

// =============================================
// PACKAGE CARD HOVER EFFECT
// =============================================
const packageCards = document.querySelectorAll('.package-card');

packageCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.cursor = 'pointer';
    });

    card.addEventListener('click', () => {
        const packageName = card.querySelector('.package-name').textContent;
        const packagePrice = card.querySelector('.package-price').textContent;
        
        const message = `Halo APRILIANAFAST, saya tertarik dengan ${packageName} (${packagePrice}). Mohon informasi lebih lanjut.`;
        const whatsappUrl = `https://wa.me/${siteData.contact.whatsapp}?text=${encodeURIComponent(message)}`;
        
        window.open(whatsappUrl, '_blank');
        showNotification('Mengarahkan ke WhatsApp...', 'success');
    });
});

// =============================================
// INITIALIZE ON DOM READY
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize gallery carousel
    initGalleryCarousel();
    
    // Attach click handlers for gallery images to open lightbox
    document.querySelectorAll('.gallery-img').forEach(img => {
        img.addEventListener('click', (e) => {
            const url = img.dataset.src || img.src;
            if (!url) return;
            openLightbox(url, img.alt || '');
        });
    });
    
    // Add hover effect to service cards
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
            card.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
        });
    });
    
    // Animate contact buttons on hover
    const contactButtons = document.querySelectorAll('.contact-button');
    contactButtons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-5px)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0)';
        });
    });
});

// =============================================
// LIGHTBOX EVENT HANDLERS
// =============================================
// Close lightbox on overlay click or close button
document.addEventListener('click', (e) => {
    const lb = document.getElementById('lightbox');
    if (!lb) return;
    
    if (e.target === lb || e.target.classList.contains('lightbox-close')) {
        closeLightbox();
    }
});

// Close on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const lb = document.getElementById('lightbox');
        if (lb && lb.classList.contains('open')) {
            closeLightbox();
        }
    }
    
    // ESC to close mobile menu
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// =============================================
// PERFORMANCE OPTIMIZATION - Lazy Loading
// =============================================
const lazyImages = document.querySelectorAll('img[data-src]');
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            // Create new image to preload
            const tempImage = new Image();
            tempImage.src = img.dataset.src;
            tempImage.onload = () => {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                img.classList.add('loaded');
            };
            observer.unobserve(img);
        }
    });
}, {
    rootMargin: '100px'
});

lazyImages.forEach(img => imageObserver.observe(img));

// Add fade-in effect for lazy loaded images
const lazyImageStyle = document.createElement('style');
lazyImageStyle.textContent = `
    img[data-src] {
        opacity: 0;
        transition: opacity 0.3s ease-in;
    }
    
    img.loaded {
        opacity: 1;
    }
`;
document.head.appendChild(lazyImageStyle);

// =============================================
// CONSOLE INFO
// =============================================
console.log(`
╔═══════════════════════════════════════╗
║   APRILIANAFAST MAKEUP ARTIST         ║
║   Professional Hair & Makeup          ║
╠═══════════════════════════════════════╣
║   Contact: ${siteData.contact.phone}        ║
║   Instagram: ${siteData.contact.instagram}      ║
║   Gallery: 17 photos loaded           ║
╚═══════════════════════════════════════╝
`);

// =============================================
// READY STATE
// =============================================
console.log('✅ APRILIANAFAST Website Ready!');
console.log('📱 WhatsApp Integration: Active');
console.log('🎨 Smooth Animations: Loaded');
console.log('🖼️ Gallery Carousel: 6 slides initialized');
console.log('📧 Contact Form: Ready');

// =============================================
// PERFORMANCE MONITORING (Optional)
// =============================================
// Monitor largest contentful paint
if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            console.log(`🎨 LCP: ${entry.startTime.toFixed(2)}ms`);
        }
    });
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
}

// =============================================
// OFFLINE DETECTION
// =============================================
window.addEventListener('offline', () => {
    showNotification('Anda sedang offline. Beberapa fitur mungkin tidak tersedia.', 'error');
});

window.addEventListener('online', () => {
    showNotification('Koneksi internet telah pulih.', 'success');
});
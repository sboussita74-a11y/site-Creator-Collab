document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. FONCTIONNALITÉS GLOBALES (Menu, Scroll, Reveal)
       ========================================================================== */
    
    // Menu Mobile
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('main-nav-menu');

    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('mobile-open');
        });
    }

    // Navbar Scrolled
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Scroll Reveal (Animations)
    const itemsToReveal = document.querySelectorAll('.scroll-reveal, .reveal');
    const revealOnScrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('revealed');
                }, 100);
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    itemsToReveal.forEach(item => {
        revealOnScrollObserver.observe(item);
    });

    /* ==========================================================================
       2. SYSTÈME DE COMPTES (Modale, Authentification, Onboarding)
       ========================================================================== */
    
    const authModal = document.getElementById('auth-modal');
    const btnLogin = document.getElementById('btn-login');
    const btnCloseModal = document.getElementById('close-modal');
    
    // Ouverture / Fermeture Modale
    function openModal() {
        if(!authModal) return;
        authModal.classList.add('is-open');
        document.body.style.overflow = 'hidden'; // Bloque le scroll arrière
    }

    function closeModal() {
        if(!authModal) return;
        authModal.classList.remove('is-open');
        document.body.style.overflow = '';
        // Réinitialiser la vue au login après la fin de l'animation de fermeture
        setTimeout(() => switchModalView('view-login'), 400);
    }

    if (btnLogin) btnLogin.addEventListener('click', openModal);
    if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
    
    // Fermeture au clic sur l'arrière-plan flouté
    if (authModal) {
        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) closeModal();
        });
    }

    // Gestion des vues dans la modale
    function switchModalView(viewId) {
        const views = document.querySelectorAll('.modal-view');
        views.forEach(view => view.classList.remove('active-view'));
        
        const targetView = document.getElementById(viewId);
        if (targetView) targetView.classList.add('active-view');
    }

    // Liens Internes Modale (Switch Connexion <-> Inscription)
    const linkToRegister = document.getElementById('link-to-register');
    const linkToLogin = document.getElementById('link-to-login');

    if (linkToRegister) {
        linkToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            switchModalView('view-register');
        });
    }
    if (linkToLogin) {
        linkToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            switchModalView('view-login');
        });
    }

    // Traitement du Formulaire de Connexion -> Lance l'Onboarding
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();
            switchModalView('view-onboard-1');
        });
    }

    // Traitement du Formulaire d'Inscription -> Lance la vérification Email
    const formRegister = document.getElementById('form-register');
    if (formRegister) {
        formRegister.addEventListener('submit', (e) => {
            e.preventDefault();
            switchModalView('view-verify');
        });
    }

    // Système de sélection de rôles multiple (Onboarding 2)
    const rolePills = document.querySelectorAll('.role-pill');
    rolePills.forEach(pill => {
        pill.addEventListener('click', () => {
            pill.classList.toggle('selected');
        });
    });

    // Navigation dans l'Onboarding (Boutons Continuer / Passer)
    const onboardNextBtns = document.querySelectorAll('.btn-continue, .btn-pass');
    onboardNextBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const nextView = e.target.getAttribute('data-next');
            if (nextView) switchModalView(nextView);
        });
    });

    // Boutons de fin d'Onboarding
    const onboardFinishBtns = document.querySelectorAll('.btn-finish');
    onboardFinishBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal();
            
            // Simule l'accès au profil après 300ms
            setTimeout(() => {
                const publicView = document.getElementById('public-view');
                const privateView = document.getElementById('private-profile-view');
                const navCtaContainer = document.getElementById('nav-cta-container');

                if (publicView) publicView.style.display = 'none';
                if (privateView) privateView.style.display = 'block';
                
                // Modifie le bouton "Connexion" de la Navbar en "Mon Profil"
                if (navCtaContainer) {
                    navCtaContainer.innerHTML = `<button class="btn btn-connexion" style="background:var(--clr-white); color:var(--clr-red);">Mon Profil</button>`;
                }

                // Remonte tout en haut
                window.scrollTo(0, 0);
            }, 300);
        });
    });

});
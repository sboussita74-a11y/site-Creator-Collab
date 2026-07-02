document.addEventListener('DOMContentLoaded', () => {
    // --- GESTION DE LA MODALE D'AUTHENTIFICATION ---
    const authModal = document.getElementById('auth-modal');
    const btnLogin = document.getElementById('btn-login');
    const btnCloseModal = document.getElementById('close-modal');
    
    // Liens internes à la modale
    const linkToRegister = document.getElementById('link-to-register');
    const linkToLogin = document.getElementById('link-to-login');

    // Ouverture / Fermeture
    function openModal() {
        authModal.classList.add('is-open');
        document.body.style.overflow = 'hidden'; // Empêche le scroll en arrière-plan
    }

    function closeModal() {
        authModal.classList.remove('is-open');
        document.body.style.overflow = '';
        // Réinitialise la modale sur le login après fermeture
        setTimeout(() => switchModalView('view-login'), 400);
    }

    if (btnLogin) btnLogin.addEventListener('click', openModal);
    if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
    
    // Fermeture au clic à l'extérieur
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) closeModal();
    });

    // Navigation entre les vues de la modale
    window.switchModalView = function(viewId) {
        const views = document.querySelectorAll('.modal-view');
        views.forEach(view => view.classList.remove('active-view'));
        document.getElementById(viewId).classList.add('active-view');
    };

    if (linkToRegister) linkToRegister.addEventListener('click', (e) => { e.preventDefault(); switchModalView('view-register'); });
    if (linkToLogin) linkToLogin.addEventListener('click', (e) => { e.preventDefault(); switchModalView('view-login'); });


    // --- SIMULATION DU FLUX (ONBOARDING & PROFIL) ---
    
    // Déclenché au clic sur "Se connecter" (Simulation d'une première connexion)
    window.startFirstLoginSimulation = function() {
        // Lance l'assistant de configuration
        switchModalView('view-onboard-1');
    };

    // Déclenché à la fin de l'onboarding
    window.finishOnboarding = function() {
        closeModal();
        
        // Simule la transition vers la page Profil
        setTimeout(() => {
            // Masque la vue publique (Hero + Concept + etc)
            document.getElementById('public-view').style.display = 'none';
            // Affiche la vue profil
            document.getElementById('private-profile-view').style.display = 'block';
            
            // Mise à jour de la navbar (Remplacer "Connexion" par "Mon Profil" ou Avatar)
            const ctaContainer = document.getElementById('nav-cta-container');
            if(ctaContainer) {
                ctaContainer.innerHTML = `<button class="btn btn-connexion" style="background:var(--clr-white); color:var(--clr-red);">Mon Profil</button>`;
            }
            // Remonte en haut de la page
            window.scrollTo(0, 0);
        }, 300);
    };

    // 1. MENU MOBILE
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');

    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('mobile-open');
        });
    }

    // 2. ANIMATION NAVBAR 
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 3. SCROLL REVEAL 
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

    // 4. BOUTONS ACTIONS INTERACTIFS
    const actionButtons = document.querySelectorAll('[data-action], #btn-login');
    actionButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const currentAction = e.currentTarget.getAttribute('data-action') || 'login';
            
            e.currentTarget.style.transform = "translateY(2px)";
            setTimeout(() => {
                e.currentTarget.style.transform = "";
            }, 100);

            switch (currentAction) {
                case 'discord':
                    alert("Simulation : Redirection vers le Discord Creator Collab.");
                    break;
                case 'login':
                    alert("Simulation : Page de connexion.");
                    break;
                case 'concept':
                    document.getElementById('concept').scrollIntoView({ behavior: 'smooth' });
                    break;
                case 'simuler':
                    alert("Simulation : Ouverture de l'espace de démonstration.");
                    break;
            }
        });
    });
});
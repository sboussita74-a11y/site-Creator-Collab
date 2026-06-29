/**
 * Creator Collab — Phase 1 : Script de la Page d'Accueil Officielle
 * Architecture UX fluide, saine et conforme à la charte d'identité (V1).
 */

document.addEventListener('DOMContentLoaded', () => {

    console.log("%c🚀 Creator Collab — Système UI Initialisé [Charte Artistique V1 respectée].", "color: #E62222; font-weight: bold; font-size: 13px;");

    // 1. GESTION DU MENU MOBILE (Responsive Toggle)
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');

    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('mobile-open');
            mobileMenuBtn.classList.toggle('active');
        });
    }

    // 2. ANIMATION DU HEADER AU SCROLL (Effet Moderne Premium)
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 3. ENGINE DE SCROLL REVEAL (Apparition douce des sections sans excès)
    const itemsToReveal = document.querySelectorAll('.scroll-reveal, .reveal');
    
    const revealOnScrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Petit délai incrémental pour un effet fluide élégant
                setTimeout(() => {
                    entry.target.classList.add('revealed');
                }, 100);
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15
    });

    itemsToReveal.forEach(item => {
        revealOnScrollObserver.observe(item);
    });

    // 4. SIMULATION ET INTERACTION DES ACTIONS (Boutons tactiles)
    const actionButtons = document.querySelectorAll('[data-action], #btn-login');

    actionButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const currentAction = e.currentTarget.getAttribute('data-action') || 'login';
            
            // Effet d'enfoncement tactile fluide contrôlé par JS
            e.currentTarget.style.transform = "translateY(2px)";
            setTimeout(() => {
                e.currentTarget.style.transform = "";
            }, 100);

            // Routage des simulations
            switch (currentAction) {
                case 'discord':
                    alert("🔵 Simulation : Redirection sécurisée vers l'invitation Discord officielle de la communauté Creator Collab.");
                    break;
                case 'login':
                    alert("🔐 Simulation : Redirection vers le flux d'authentification sécurisé Discord OAuth2 (Espace d'administration).");
                    break;
                case 'concept':
                    const conceptSection = document.getElementById('concept');
                    if (conceptSection) {
                        conceptSection.scrollIntoView({ behavior: 'smooth' });
                    }
                    break;
                case 'simuler':
                    alert("✨ Phase 1 Prototypage : Cette action déclenchera l'ouverture dynamique des filtres applicatifs complets une fois connecté.");
                    break;
                default:
                    console.log("Action captée : " + currentAction);
            }
        });
    });
});
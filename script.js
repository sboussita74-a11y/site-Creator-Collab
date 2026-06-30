document.addEventListener('DOMContentLoaded', () => {

    // 1. MENU MOBILE
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');

    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('mobile-open');
        });
    }

    // 2. ANIMATION NAVBAR (Teinte rouge transparente au scroll)
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 3. SCROLL REVEAL (Apparitions fluides)
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
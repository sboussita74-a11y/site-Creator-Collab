document.addEventListener('DOMContentLoaded', () => {

    // LOG DES PRINCIPES GRAPHIQUES REÇUS (Pour l'équipe de dev future)
    console.log("%c🎨 CREATOR COLLAB — Direction Artistique Activée.", "color: #FF2A2A; font-size: 16px; font-weight: bold;");
    console.log("Style Cartoon / Pop Brutalisme. Palette : Rouge, Blanc, Bleu, Noir.");

    // INTERACTION : SIMULATION DES ACTIONS (Connexion, Discord, CTA)
    const actionButtons = document.querySelectorAll('[data-action], #btn-connexion');

    actionButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const targetAction = e.currentTarget.getAttribute('data-action') || 'connexion';
            
            // Ajout d'un petit effet d'animation "Squish" cartoon lors du clic JS
            e.currentTarget.style.transform = "scale(0.95) translate(4px, 4px)";
            setTimeout(() => {
                e.currentTarget.style.transform = "";
            }, 150);

            // Traitement des différentes simulations demandées par l'interface
            switch (targetAction) {
                case 'discord':
                    alert('🔵 Redirection simulée vers l\'invitation du serveur Discord officiel Creator Collab !');
                    break;
                case 'connexion':
                    alert('🔐 Simulation : Ouverture de la future pop-up de connexion Discord OAuth2.');
                    break;
                case 'decouvrir':
                    const sectionCollab = document.getElementById('collaborer');
                    if(sectionCollab) {
                        sectionCollab.scrollIntoView({ behavior: 'smooth' });
                    }
                    break;
                case 'simuler':
                    alert('✨ Cette action ouvrira l\'espace applicatif complet une fois la connexion établie.');
                    break;
                default:
                    console.log('Action non gérée : ' + targetAction);
            }
        });
    });

    // UX : CHANGER L'ÉTAT ACTIF DE LA NAVIGATION AU SCROLL
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let currentSectionId = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            // On calcule si la section est visible à l'écran
            if (window.scrollY >= (sectionTop - 200)) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });
});
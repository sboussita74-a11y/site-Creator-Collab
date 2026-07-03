document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. UI GLOBALE (Menu, Scroll, Animations)
       ========================================================================== */
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('main-nav-menu');
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => navMenu.classList.toggle('mobile-open'));
    }

    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    });

    const itemsToReveal = document.querySelectorAll('.scroll-reveal, .reveal');
    const revealOnScrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add('revealed'), 100);
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    itemsToReveal.forEach(item => revealOnScrollObserver.observe(item));

    /* ==========================================================================
       2. LOGIQUE DE BASE DE DONNÉES LOCALE (Simulation Backend)
       ========================================================================== */
    
    // Initialiser la "base de données" dans le localStorage si elle n'existe pas
    if (!localStorage.getItem('creatorCollabUsers')) {
        localStorage.setItem('creatorCollabUsers', JSON.stringify({}));
    }

    function getUsers() {
        return JSON.parse(localStorage.getItem('creatorCollabUsers'));
    }

    function saveUser(email, userData) {
        const users = getUsers();
        users[email] = userData;
        localStorage.setItem('creatorCollabUsers', JSON.stringify(users));
    }

    function setCurrentSession(email) {
        localStorage.setItem('creatorCollabSession', email);
    }

    function getCurrentUser() {
        const email = localStorage.getItem('creatorCollabSession');
        if (!email) return null;
        return getUsers()[email];
    }

    function logoutUser() {
        localStorage.removeItem('creatorCollabSession');
        window.location.reload(); // Recharge la page pour revenir à l'état déconnecté
    }

    /* ==========================================================================
       3. MODALES & FLUX D'AUTHENTIFICATION
       ========================================================================== */
    const authModal = document.getElementById('auth-modal');
    const btnLogin = document.getElementById('btn-login');
    const btnCloseModal = document.getElementById('close-modal');
    
    function openModal() {
        if(!authModal) return;
        authModal.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        if(!authModal) return;
        authModal.classList.remove('is-open');
        document.body.style.overflow = '';
        setTimeout(() => switchModalView('view-login'), 400);
    }

    if (btnLogin) btnLogin.addEventListener('click', openModal);
    if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
    if (authModal) authModal.addEventListener('click', (e) => { if (e.target === authModal) closeModal(); });

    function switchModalView(viewId) {
        document.querySelectorAll('.modal-view').forEach(view => view.classList.remove('active-view'));
        document.getElementById(viewId).classList.add('active-view');
        
        // Cacher les messages d'erreur lors du changement de vue
        document.getElementById('login-error').style.display = 'none';
        document.getElementById('register-error').style.display = 'none';
    }

    document.getElementById('link-to-register').addEventListener('click', (e) => { e.preventDefault(); switchModalView('view-register'); });
    document.getElementById('link-to-login').addEventListener('click', (e) => { e.preventDefault(); switchModalView('view-login'); });

    /* --- INSCRIPTION --- */
    document.getElementById('form-register').addEventListener('submit', (e) => {
        e.preventDefault();
        const errorDiv = document.getElementById('register-error');
        
        const name = document.getElementById('reg-name').value.trim();
        const handle = document.getElementById('reg-handle').value.trim();
        const email = document.getElementById('reg-email').value.trim().toLowerCase();
        const password = document.getElementById('reg-password').value;
        const passwordConfirm = document.getElementById('reg-password-confirm').value;

        if (password !== passwordConfirm) {
            errorDiv.textContent = "Les mots de passe ne correspondent pas.";
            errorDiv.style.display = "block";
            return;
        }

        const users = getUsers();
        if (users[email]) {
            errorDiv.textContent = "Cette adresse e-mail est déjà utilisée.";
            errorDiv.style.display = "block";
            return;
        }

        // Vérifier si l'identifiant (handle) est déjà pris
        const handleTaken = Object.values(users).some(user => user.handle === handle);
        if (handleTaken) {
            errorDiv.textContent = "Cet identifiant (@" + handle + ") est déjà pris.";
            errorDiv.style.display = "block";
            return;
        }

        // Créer l'utilisateur
        const newUser = {
            name: name,
            handle: handle,
            email: email,
            password: password, // NB: En vrai dev, on ne stocke jamais un mdp en clair.
            avatar: null,
            roles: [],
            bio: "",
            links: []
        };

        saveUser(email, newUser);
        setCurrentSession(email);
        
        // Inscription réussie -> Lancer l'onboarding (sans vérif email pour l'instant)
        switchModalView('view-onboard-1');
    });

    /* --- CONNEXION --- */
    document.getElementById('form-login').addEventListener('submit', (e) => {
        e.preventDefault();
        const errorDiv = document.getElementById('login-error');
        
        const email = document.getElementById('login-email').value.trim().toLowerCase();
        const password = document.getElementById('login-password').value;

        const users = getUsers();
        const user = users[email];

        if (!user || user.password !== password) {
            errorDiv.textContent = "Adresse e-mail ou mot de passe incorrect.";
            errorDiv.style.display = "block";
            return;
        }

        // Connexion réussie
        setCurrentSession(email);
        closeModal();
        loadProfileUI();
    });

    /* ==========================================================================
       4. ONBOARDING & UPLOAD D'IMAGE
       ========================================================================== */
    
    let tempOnboardData = { avatar: null, roles: [], bio: "", links: [] };

    // Etape 1: Upload de l'avatar (Conversion en Base64)
    const avatarTrigger = document.getElementById('avatar-upload-trigger');
    const avatarInput = document.getElementById('avatar-input');
    const avatarPreview = document.getElementById('avatar-preview');

    if (avatarTrigger && avatarInput) {
        avatarTrigger.addEventListener('click', () => avatarInput.click());
        
        avatarInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const base64Image = e.target.result;
                    tempOnboardData.avatar = base64Image;
                    avatarPreview.innerHTML = `<img src="${base64Image}" alt="Aperçu">`;
                }
                reader.readAsDataURL(file);
            }
        });
    }

    // Etape 2: Rôles
    document.querySelectorAll('.role-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            pill.classList.toggle('selected');
        });
    });

    // Navigation de l'onboarding
    document.querySelectorAll('.btn-continue, .btn-pass').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const nextView = e.target.getAttribute('data-next');
            if (nextView) switchModalView(nextView);
        });
    });

    // Terminer l'onboarding -> Sauvegarder dans la DB locale
    document.querySelectorAll('.btn-finish').forEach(btn => {
        btn.addEventListener('click', () => {
            const currentUser = getCurrentUser();
            if(currentUser) {
                // Récupérer les rôles sélectionnés
                const selectedRoles = [];
                document.querySelectorAll('#onboard-roles .role-pill.selected').forEach(pill => {
                    selectedRoles.push(pill.textContent);
                });
                
                // Récupérer les liens
                const links = [];
                const l1 = document.getElementById('link-1').value;
                const l2 = document.getElementById('link-2').value;
                const l3 = document.getElementById('link-3').value;
                if(l1) links.push(l1); if(l2) links.push(l2); if(l3) links.push(l3);

                // Mettre à jour l'utilisateur
                currentUser.avatar = tempOnboardData.avatar;
                currentUser.roles = selectedRoles;
                currentUser.bio = document.getElementById('onboard-bio').value;
                currentUser.links = links;

                saveUser(currentUser.email, currentUser);
            }

            closeModal();
            loadProfileUI();
        });
    });

    /* ==========================================================================
       5. AFFICHAGE DU PROFIL (Session)
       ========================================================================== */
    function loadProfileUI() {
        const user = getCurrentUser();
        
        if (user) {
            // L'utilisateur est connecté, on masque l'accueil, on affiche le profil
            document.getElementById('public-view').style.display = 'none';
            document.getElementById('private-profile-view').style.display = 'block';
            
            // Mise à jour de la Navbar
            const navCtaContainer = document.getElementById('nav-cta-container');
            if (navCtaContainer) {
                navCtaContainer.innerHTML = `<button class="btn btn-connexion" onclick="window.scrollTo(0,0)" style="background:var(--clr-white); color:var(--clr-red);">Mon Profil</button>`;
            }

            // Remplir les données du profil
            document.getElementById('profile-display-name').textContent = user.name;
            document.getElementById('profile-display-handle').textContent = "@" + user.handle;
            
            if (user.bio) {
                document.getElementById('profile-display-bio').textContent = user.bio;
            }
            
            if (user.links && user.links.length > 0) {
                const linksHtml = user.links.map(link => `<a href="${link}" target="_blank" style="color: var(--clr-blue); display:block; margin-bottom:5px;">${link}</a>`).join('');
                document.getElementById('profile-display-links').innerHTML = linksHtml;
            }

            const avatarDisplay = document.getElementById('profile-display-avatar');
            if (user.avatar) {
                avatarDisplay.style.backgroundImage = `url(${user.avatar})`;
                avatarDisplay.innerHTML = "";
            } else {
                avatarDisplay.style.backgroundImage = "none";
                avatarDisplay.innerHTML = "👤";
            }

            window.scrollTo(0, 0);
        }
    }

    // Gestion de la déconnexion
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', logoutUser);
    }

    // Vérifier la session au chargement de la page
    loadProfileUI();
});
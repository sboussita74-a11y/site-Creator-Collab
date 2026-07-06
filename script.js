document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. BASE DE DONNÉES LOCALE (Simulation Backend)
       ========================================================================== */
    if (!localStorage.getItem('creatorCollabUsers')) {
        localStorage.setItem('creatorCollabUsers', JSON.stringify({}));
    }

    function getUsers() { return JSON.parse(localStorage.getItem('creatorCollabUsers')); }
    function saveUser(email, userData) {
        const users = getUsers();
        users[email] = userData;
        localStorage.setItem('creatorCollabUsers', JSON.stringify(users));
    }
    function setCurrentSession(email) { localStorage.setItem('creatorCollabSession', email); }
    function getCurrentUser() {
        const email = localStorage.getItem('creatorCollabSession');
        if (!email) return null;
        return getUsers()[email];
    }
    function logoutUser() {
        localStorage.removeItem('creatorCollabSession');
        window.location.reload();
    }

    /* ==========================================================================
       2. UI & ANIMATIONS GLOBALES
       ========================================================================== */
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    });

    const itemsToReveal = document.querySelectorAll('.scroll-reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    itemsToReveal.forEach(item => revealObserver.observe(item));

    /* ==========================================================================
       3. NAVIGATION & VUES (ROUTING)
       ========================================================================== */
    function switchView(viewId) {
        document.querySelectorAll('.app-view').forEach(v => v.classList.remove('active-view'));
        const target = document.getElementById(viewId);
        if (target) {
            target.classList.add('active-view');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        closeSidePanel();
    }

    // Liens de la Navbar (Toujours accessibles)
    document.querySelectorAll('.nav-menu .nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-nav');
            
            switchView('view-home');
            
            setTimeout(() => {
                const section = document.getElementById(targetId);
                if (section) section.scrollIntoView({ behavior: 'smooth' });
            }, 100);

            document.querySelectorAll('.nav-menu .nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Clic sur le logo Creator Collab
    document.getElementById('nav-logo-link').addEventListener('click', (e) => {
        e.preventDefault();
        const user = getCurrentUser();
        if (user) {
            openSidePanel();
        } else {
            switchView('view-home');
        }
    });

    // Boutons internes
    const btnBackHome = document.getElementById('btn-back-home');
    if(btnBackHome) btnBackHome.addEventListener('click', () => switchView('view-home'));
    
    const btnEditProfile = document.getElementById('btn-to-edit-profile');
    if(btnEditProfile) btnEditProfile.addEventListener('click', () => {
        loadEditProfileForm();
        switchView('view-edit-profile');
    });

    const btnCancelEdit = document.getElementById('btn-cancel-edit');
    if(btnCancelEdit) btnCancelEdit.addEventListener('click', () => switchView('view-profile'));

    /* ==========================================================================
       4. PANNEAU LATÉRAL & NAVIGATION DU PROFIL DIRECTE
       ========================================================================== */
    const sidePanel = document.getElementById('side-panel');
    const sidePanelOverlay = document.getElementById('side-panel-overlay');

    function openSidePanel() {
        sidePanel.classList.add('open');
        sidePanelOverlay.classList.add('show');
    }

    function closeSidePanel() {
        sidePanel.classList.remove('open');
        sidePanelOverlay.classList.remove('show');
    }

    document.getElementById('close-side-panel').addEventListener('click', closeSidePanel);
    
    // Fermeture en cliquant en dehors du panneau (l'overlay ne bloque plus les clics)
    document.addEventListener('click', (e) => {
        if (sidePanel.classList.contains('open')) {
            if (!sidePanel.contains(e.target) && !e.target.closest('#nav-logo-link') && !e.target.closest('#btn-nav-profile') && !e.target.closest('#logout-modal')) {
                closeSidePanel();
            }
        }
    });

    // Liens du panneau latéral
    document.querySelectorAll('.sp-link').forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.id === 'sp-btn-logout') return;
            e.preventDefault();
            const target = link.getAttribute('data-target');
            if (target === 'view-edit-profile') {
                loadEditProfileForm();
            }
            switchView(target);
        });
    });

    // Gestion de la modale de déconnexion
    const logoutModal = document.getElementById('logout-modal');
    document.getElementById('sp-btn-logout').addEventListener('click', () => {
        logoutModal.classList.add('is-open');
    });

    document.getElementById('btn-cancel-logout').addEventListener('click', () => {
        logoutModal.classList.remove('is-open');
    });

    document.getElementById('btn-confirm-logout').addEventListener('click', () => {
        logoutUser();
    });

    // Mise à jour de la Navbar pour utilisateur connecté
    function updateNavbarForUser(user) {
        const navCtaContainer = document.getElementById('nav-cta-container');
        
        navCtaContainer.innerHTML = `
            <button class="btn btn-white" id="btn-nav-profile" style="padding: 10px 20px;">
                Mon Profil
            </button>
        `;

        document.getElementById('btn-nav-profile').addEventListener('click', () => {
            switchView('view-profile');
        });

        // Peupler le bas du panneau latéral
        document.getElementById('sp-name').textContent = user.name;
        document.getElementById('sp-handle').textContent = "@" + user.handle;
        if(user.avatar) document.getElementById('sp-avatar').style.backgroundImage = `url(${user.avatar})`;

        // Remplir la page profil
        document.getElementById('profile-display-name').textContent = user.name;
        document.getElementById('profile-display-handle').textContent = "@" + user.handle;
        document.getElementById('profile-display-bio').textContent = user.bio || "Aucune biographie renseignée.";
        
        const avatarDisplay = document.getElementById('profile-display-avatar');
        if (user.avatar) {
            avatarDisplay.style.backgroundImage = `url(${user.avatar})`;
            avatarDisplay.innerHTML = "";
        } else {
            avatarDisplay.style.backgroundImage = "none";
            avatarDisplay.innerHTML = "👤";
        }

        if (user.roles && user.roles.length > 0) {
            document.getElementById('profile-display-roles').innerHTML = user.roles.map(r => `<span class="ui-badge" style="margin-right:5px; margin-bottom:0; font-size:0.7rem; padding:4px 10px;">${r}</span>`).join('');
        }

        if (user.links && user.links.length > 0) {
            document.getElementById('profile-display-links').innerHTML = user.links.map(link => `<a href="${link}" target="_blank" style="color: var(--clr-blue); display:block; margin-bottom:5px;">${link}</a>`).join('');
        }
    }


    /* ==========================================================================
       5. AUTHENTIFICATION & VALIDATION (Modale)
       ========================================================================== */
    const authModal = document.getElementById('auth-modal');
    function openModal() { if(authModal) { authModal.classList.add('is-open'); document.body.style.overflow = 'hidden'; } }
    function closeModal() { if(authModal) { authModal.classList.remove('is-open'); document.body.style.overflow = ''; setTimeout(() => switchModalView('view-login'), 400); } }
    
    const btnLoginInit = document.getElementById('btn-login');
    if(btnLoginInit) btnLoginInit.addEventListener('click', openModal);
    document.getElementById('close-modal').addEventListener('click', closeModal);

    function switchModalView(viewId) {
        document.querySelectorAll('.modal-view').forEach(view => view.classList.remove('active-view'));
        document.getElementById(viewId).classList.add('active-view');
        document.getElementById('login-error').style.display = 'none';
        document.getElementById('register-error').style.display = 'none';
    }

    document.getElementById('link-to-register').addEventListener('click', (e) => { e.preventDefault(); switchModalView('view-register'); });
    document.getElementById('link-to-login').addEventListener('click', (e) => { e.preventDefault(); switchModalView('view-login'); });

    /* INSCRIPTION AVEC VALIDATION MDP */
    document.getElementById('form-register').addEventListener('submit', (e) => {
        e.preventDefault();
        const errorDiv = document.getElementById('register-error');
        
        const name = document.getElementById('reg-name').value.trim();
        const handle = document.getElementById('reg-handle').value.trim();
        const email = document.getElementById('reg-email').value.trim().toLowerCase();
        const password = document.getElementById('reg-password').value;
        const passwordConfirm = document.getElementById('reg-password-confirm').value;

        // Validation Mot de Passe
        let pwdErrors = [];
        if(password.length < 8) pwdErrors.push("- 8 caractères minimum");
        if(!/[A-Z]/.test(password)) pwdErrors.push("- Une majuscule");
        if(!/[a-z]/.test(password)) pwdErrors.push("- Une minuscule");
        if(!/[0-9]/.test(password)) pwdErrors.push("- Un chiffre");
        if(!/[^A-Za-z0-9]/.test(password)) pwdErrors.push("- Un caractère spécial");

        if(pwdErrors.length > 0) {
            errorDiv.innerHTML = "<strong>Le mot de passe doit contenir :</strong><br>" + pwdErrors.join("<br>");
            errorDiv.style.display = "block";
            return;
        }

        if (password !== passwordConfirm) {
            errorDiv.textContent = "Les mots de passe ne correspondent pas.";
            errorDiv.style.display = "block";
            return;
        }

        const users = getUsers();
        if (users[email]) { errorDiv.textContent = "Cet email est déjà utilisé."; errorDiv.style.display = "block"; return; }
        if (Object.values(users).some(u => u.handle === handle)) { errorDiv.textContent = "L'identifiant @" + handle + " est déjà pris."; errorDiv.style.display = "block"; return; }

        const newUser = { name, handle, email, password, avatar: null, roles: [], bio: "", links: [] };
        saveUser(email, newUser);
        setCurrentSession(email);
        
        switchModalView('view-onboard-1');
    });

    /* CONNEXION */
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

        setCurrentSession(email);
        closeModal();
        updateNavbarForUser(user);
        switchView('view-home');
    });

    /* ==========================================================================
       6. GESTION DES IMAGES ET ROLES (Upload & Sélection)
       ========================================================================== */
    function setupImageUpload(triggerId, inputId, previewId, callback) {
        const trigger = document.getElementById(triggerId);
        const input = document.getElementById(inputId);
        const preview = document.getElementById(previewId);

        if(!trigger || !input) return;

        trigger.addEventListener('click', () => input.click());
        input.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const base64 = e.target.result;
                    preview.innerHTML = `<img src="${base64}" alt="Avatar">`;
                    if(callback) callback(base64);
                }
                reader.readAsDataURL(file);
            }
        });
    }

    let tempAvatar = null;
    
    // Upload Onboarding
    setupImageUpload('avatar-upload-trigger', 'avatar-input', 'avatar-preview', (b64) => tempAvatar = b64);
    
    // Upload Vue Edit Profile
    setupImageUpload('edit-avatar-trigger', 'edit-avatar-input', 'edit-avatar-preview', (b64) => tempAvatar = b64);

    // Sélection des rôles
    document.querySelectorAll('.role-pill').forEach(pill => {
        pill.addEventListener('click', () => pill.classList.toggle('selected'));
    });

    // Finaliser Onboarding
    document.querySelectorAll('.btn-continue, .btn-pass').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const nextView = e.target.getAttribute('data-next');
            if (nextView) switchModalView(nextView);
        });
    });

    document.querySelector('.btn-finish').addEventListener('click', () => {
        const currentUser = getCurrentUser();
        if(currentUser) {
            const selectedRoles = Array.from(document.querySelectorAll('#onboard-roles .role-pill.selected')).map(p => p.textContent);
            currentUser.avatar = tempAvatar;
            currentUser.roles = selectedRoles;
            saveUser(currentUser.email, currentUser);
            updateNavbarForUser(currentUser);
        }
        closeModal();
        switchView('view-home');
    });

    /* ==========================================================================
       7. EDITION DU PROFIL (VRAIE FONCTIONNALITÉ)
       ========================================================================== */
    function loadEditProfileForm() {
        const user = getCurrentUser();
        if(!user) return;

        document.getElementById('edit-error').style.display = 'none';
        document.getElementById('edit-success').style.display = 'none';

        document.getElementById('edit-name').value = user.name;
        document.getElementById('edit-handle').value = user.handle;
        document.getElementById('edit-bio').value = user.bio || "";
        
        document.getElementById('edit-link-1').value = user.links[0] || "";
        document.getElementById('edit-link-2').value = user.links[1] || "";
        document.getElementById('edit-link-3').value = user.links[2] || "";

        tempAvatar = user.avatar;
        const preview = document.getElementById('edit-avatar-preview');
        if(user.avatar) {
            preview.innerHTML = `<img src="${user.avatar}" alt="Avatar">`;
        } else {
            preview.innerHTML = "📸";
        }

        document.querySelectorAll('#edit-roles .role-pill').forEach(pill => {
            if(user.roles && user.roles.includes(pill.textContent)) {
                pill.classList.add('selected');
            } else {
                pill.classList.remove('selected');
            }
        });
    }

    document.getElementById('form-edit-profile').addEventListener('submit', (e) => {
        e.preventDefault();
        const user = getCurrentUser();
        const errorDiv = document.getElementById('edit-error');
        const successDiv = document.getElementById('edit-success');
        
        const newHandle = document.getElementById('edit-handle').value.trim();
        
        const users = getUsers();
        const handleTaken = Object.entries(users).some(([email, u]) => u.handle === newHandle && email !== user.email);
        
        if (handleTaken) {
            errorDiv.textContent = "Cet identifiant est déjà utilisé par un autre créateur.";
            errorDiv.style.display = "block";
            successDiv.style.display = 'none';
            return;
        }

        user.name = document.getElementById('edit-name').value.trim();
        user.handle = newHandle;
        user.bio = document.getElementById('edit-bio').value.trim();
        user.avatar = tempAvatar;
        
        const l1 = document.getElementById('edit-link-1').value.trim();
        const l2 = document.getElementById('edit-link-2').value.trim();
        const l3 = document.getElementById('edit-link-3').value.trim();
        user.links = [l1, l2, l3].filter(l => l !== "");

        user.roles = Array.from(document.querySelectorAll('#edit-roles .role-pill.selected')).map(p => p.textContent);

        saveUser(user.email, user);
        
        errorDiv.style.display = 'none';
        successDiv.style.display = 'block';
        updateNavbarForUser(user);

        setTimeout(() => {
            switchView('view-profile');
        }, 2000);
    });

    /* ==========================================================================
       8. INITIALISATION
       ========================================================================== */
    const sessionUser = getCurrentUser();
    if (sessionUser) {
        updateNavbarForUser(sessionUser);
    }
    
    switchView('view-home');

});
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
       2. GESTION DU THÈME
       ========================================================================== */
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else if (theme === 'light') {
            document.body.classList.remove('dark-theme');
        } else if (theme === 'auto') {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.body.classList.add('dark-theme');
            } else {
                document.body.classList.remove('dark-theme');
            }
        }
    }

    function loadSavedTheme() {
        const saved = localStorage.getItem('creatorCollabTheme') || 'light';
        applyTheme(saved);
        
        // Coche la bonne option dans les paramètres si la page charge
        const radio = document.querySelector(`input[name="theme-select"][value="${saved}"]`);
        if(radio) radio.checked = true;
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (localStorage.getItem('creatorCollabTheme') === 'auto') applyTheme('auto');
    });

    document.querySelectorAll('input[name="theme-select"]').forEach(input => {
        input.addEventListener('change', (e) => {
            const val = e.target.value;
            localStorage.setItem('creatorCollabTheme', val);
            applyTheme(val);
        });
    });

    loadSavedTheme();

    /* ==========================================================================
       3. NOTIFICATIONS (TOAST)
       ========================================================================== */
    const toastContainer = document.getElementById('toast-container');
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toastContainer.appendChild(toast);
        
        // Trigger reflow pour l'animation
        void toast.offsetWidth; 
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400); // Attend fin animation css
        }, 3000);
    }

    /* ==========================================================================
       4. UI & ANIMATIONS GLOBALES
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
       5. NAVIGATION & VUES (ROUTING)
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
       6. PANNEAU LATÉRAL & NAVIGATION DU PROFIL DIRECTE
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
    
    document.addEventListener('click', (e) => {
        if (sidePanel.classList.contains('open')) {
            if (!sidePanel.contains(e.target) && !e.target.closest('#nav-logo-link') && !e.target.closest('#btn-nav-profile') && !e.target.closest('#logout-modal')) {
                closeSidePanel();
            }
        }
    });

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

        document.getElementById('sp-name').textContent = user.name;
        document.getElementById('sp-handle').textContent = "@" + user.handle;
        if(user.avatar) document.getElementById('sp-avatar').style.backgroundImage = `url(${user.avatar})`;

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
        } else {
            document.getElementById('profile-display-links').innerHTML = "Aucun lien ajouté.";
        }
    }

    /* ==========================================================================
       7. AUTHENTIFICATION & VALIDATION (Modale)
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

    document.getElementById('form-register').addEventListener('submit', (e) => {
        e.preventDefault();
        const errorDiv = document.getElementById('register-error');
        
        const name = document.getElementById('reg-name').value.trim();
        const handle = document.getElementById('reg-handle').value.trim();
        const email = document.getElementById('reg-email').value.trim().toLowerCase();
        const password = document.getElementById('reg-password').value;
        const passwordConfirm = document.getElementById('reg-password-confirm').value;

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
       8. GESTION DES IMAGES ET ROLES
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
    setupImageUpload('avatar-upload-trigger', 'avatar-input', 'avatar-preview', (b64) => tempAvatar = b64);
    setupImageUpload('edit-avatar-trigger', 'edit-avatar-input', 'edit-avatar-preview', (b64) => tempAvatar = b64);

    document.querySelectorAll('.role-pill').forEach(pill => {
        pill.addEventListener('click', () => pill.classList.toggle('selected'));
    });

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
       9. EDITION DU PROFIL & LIENS DYNAMIQUES
       ========================================================================== */
    
    // Système de liens dynamiques
    let editLinksData = [];
    const maxLinks = 10;
    const linksContainer = document.getElementById('edit-links-container');
    const btnAddLink = document.getElementById('btn-add-link');
    const limitMsg = document.getElementById('links-limit-msg');

    function renderEditLinks() {
        linksContainer.innerHTML = '';
        editLinksData.forEach((linkValue, index) => {
            const row = document.createElement('div');
            row.className = 'link-row';
            
            const input = document.createElement('input');
            input.type = 'url';
            input.className = 'form-input dark-input';
            input.placeholder = 'https://...';
            input.value = linkValue;
            input.addEventListener('input', (e) => { editLinksData[index] = e.target.value; });

            const btnRemove = document.createElement('button');
            btnRemove.type = 'button';
            btnRemove.className = 'btn-remove-link';
            btnRemove.textContent = '×';
            btnRemove.title = 'Supprimer ce lien';
            btnRemove.addEventListener('click', () => {
                editLinksData.splice(index, 1);
                renderEditLinks();
            });

            row.appendChild(input);
            row.appendChild(btnRemove);
            linksContainer.appendChild(row);
        });

        if (editLinksData.length >= maxLinks) {
            btnAddLink.style.display = 'none';
            limitMsg.style.display = 'block';
        } else {
            btnAddLink.style.display = 'inline-block';
            limitMsg.style.display = 'none';
        }
    }

    btnAddLink.addEventListener('click', () => {
        if (editLinksData.length < maxLinks) {
            editLinksData.push('');
            renderEditLinks();
        }
    });

    function loadEditProfileForm() {
        const user = getCurrentUser();
        if(!user) return;

        document.getElementById('edit-error').style.display = 'none';
        document.getElementById('edit-success').style.display = 'none';

        document.getElementById('edit-name').value = user.name;
        document.getElementById('edit-handle').value = user.handle;
        document.getElementById('edit-bio').value = user.bio || "";
        
        editLinksData = user.links ? [...user.links] : [];
        if (editLinksData.length === 0) editLinksData.push(''); // Au moins un champ vide par défaut
        renderEditLinks();

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
        
        // Nettoyer les liens vides
        user.links = editLinksData.map(l => l.trim()).filter(l => l !== "");

        user.roles = Array.from(document.querySelectorAll('#edit-roles .role-pill.selected')).map(p => p.textContent);

        saveUser(user.email, user);
        
        errorDiv.style.display = 'none';
        successDiv.style.display = 'block';
        updateNavbarForUser(user);

        setTimeout(() => {
            switchView('view-profile');
        }, 1500);
    });

    /* ==========================================================================
       10. PARAMÈTRES (Tabs & Mot de passe)
       ========================================================================== */
    const settingsTabs = document.querySelectorAll('.settings-tab');
    
    settingsTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            if (tab.classList.contains('unimplemented')) {
                showToast('Cette fonctionnalité sera bientôt disponible.');
                return;
            }

            settingsTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            document.querySelectorAll('.settings-section').forEach(sec => sec.classList.remove('active-section'));
            const targetId = tab.getAttribute('data-tab');
            document.getElementById(targetId).classList.add('active-section');
        });
    });

    // Formulaire changement de mot de passe
    document.getElementById('form-change-password').addEventListener('submit', (e) => {
        e.preventDefault();
        const user = getCurrentUser();
        if (!user) return;

        const errorDiv = document.getElementById('pwd-error');
        const successDiv = document.getElementById('pwd-success');
        errorDiv.style.display = 'none';
        successDiv.style.display = 'none';

        const currentPwd = document.getElementById('pwd-current').value;
        const newPwd = document.getElementById('pwd-new').value;
        const confirmPwd = document.getElementById('pwd-confirm').value;

        if (currentPwd !== user.password) {
            errorDiv.textContent = "Le mot de passe actuel est incorrect.";
            errorDiv.style.display = 'block';
            return;
        }

        let pwdErrors = [];
        if(newPwd.length < 8) pwdErrors.push("- 8 caractères minimum");
        if(!/[A-Z]/.test(newPwd)) pwdErrors.push("- Une majuscule");
        if(!/[a-z]/.test(newPwd)) pwdErrors.push("- Une minuscule");
        if(!/[0-9]/.test(newPwd)) pwdErrors.push("- Un chiffre");
        if(!/[^A-Za-z0-9]/.test(newPwd)) pwdErrors.push("- Un caractère spécial");

        if(pwdErrors.length > 0) {
            errorDiv.innerHTML = "<strong>Le nouveau mot de passe doit contenir :</strong><br>" + pwdErrors.join("<br>");
            errorDiv.style.display = "block";
            return;
        }

        if (newPwd !== confirmPwd) {
            errorDiv.textContent = "Les nouveaux mots de passe ne correspondent pas.";
            errorDiv.style.display = 'block';
            return;
        }

        // Sauvegarde
        user.password = newPwd;
        saveUser(user.email, user);
        
        successDiv.style.display = 'block';
        document.getElementById('form-change-password').reset();
        
        setTimeout(() => {
            successDiv.style.display = 'none';
        }, 4000);
    });

    /* ==========================================================================
       11. INITIALISATION
       ========================================================================== */
    const sessionUser = getCurrentUser();
    if (sessionUser) {
        updateNavbarForUser(sessionUser);
    }
    
    switchView('view-home');

});
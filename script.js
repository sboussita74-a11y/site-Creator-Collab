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
        
        void toast.offsetWidth; 
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400); 
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

    document.getElementById('nav-logo-link').addEventListener('click', (e) => {
        e.preventDefault();
        const user = getCurrentUser();
        if (user) {
            openSidePanel();
        } else {
            switchView('view-home');
        }
    });

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
    
    document.getElementById('sp-logo-link').addEventListener('click', (e) => {
        e.preventDefault();
        closeSidePanel();
        switchView('view-home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

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

    /* ==========================================================================
       FONCTION : GÉNÉRATION DES LIENS INTELLIGENTS
       ========================================================================== */
    function getSmartLinkHTML(url) {
        let platform = "Site web";
        let icon = `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>`;
        
        const lowerUrl = url.toLowerCase();
        
        if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
            platform = "YouTube";
            icon = `<svg viewBox="0 0 24 24" fill="#FF0000"><path d="M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.254,4,12,4,12,4S5.746,4,4.186,4.418 c-0.86,0.23-1.538,0.908-1.768,1.768C2,7.746,2,12,2,12s0,4.254,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768 C5.746,20,12,20,12,20s6.254,0,7.814-0.418c0.86-0.23,1.538-0.908,1.768-1.768C22,16.254,22,12,22,12S22,7.746,21.582,6.186z M9.996,15.005l0-6.01L15.224,12L9.996,15.005z"/></svg>`;
        } else if (lowerUrl.includes('twitch.tv')) {
            platform = "Twitch";
            icon = `<svg viewBox="0 0 24 24" fill="#9146FF"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/></svg>`;
        } else if (lowerUrl.includes('discord.gg') || lowerUrl.includes('discord.com')) {
            platform = "Discord";
            icon = `<svg viewBox="0 0 24 24" fill="#5865F2"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>`;
        } else if (lowerUrl.includes('tiktok.com')) {
            platform = "TikTok";
            icon = `<svg viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.78-1.15 5.54-3.33 7.39-2.2 1.88-5.32 2.66-8.15 2.05-3.35-.72-6.13-3.64-6.66-7.05-.62-4.01 1.75-8.08 5.6-9.35 1.55-.51 3.23-.62 4.83-.34v4.11c-1.15-.22-2.39-.21-3.5.24-1.92.77-3.17 3.01-2.73 5.03.35 1.6 1.64 2.89 3.25 3.23 1.83.39 3.86-.33 4.88-1.94.75-1.19 1.05-2.65 1.03-4.05-.03-5.34 0-10.68-.02-16.02z"/></svg>`;
        } else if (lowerUrl.includes('instagram.com')) {
            platform = "Instagram";
            icon = `<svg viewBox="0 0 24 24" fill="#E1306C"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.64-.07-4.85s.01-3.58.07-4.85c.15-3.23 1.66-4.77 4.92-4.92C8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07c-4.27.19-6.78 2.7-6.98 6.98C0 8.33 0 8.74 0 12s.01 3.67.07 4.95c.19 4.27 2.7 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.27-.19 6.78-2.7 6.98-6.98C23.99 15.67 24 15.26 24 12s-.01-3.67-.07-4.95c-.19-4.27-2.7-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84zm0 10.16A4 4 0 1 1 16 12a4 4 0 0 1-4 4zm5.8-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z"/></svg>`;
        } else if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) {
            platform = "X (Twitter)";
            icon = `<svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`;
        } else if (lowerUrl.includes('github.com')) {
            platform = "GitHub";
            icon = `<svg viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>`;
        } else if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.com')) {
            platform = "Facebook";
            icon = `<svg viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`;
        } else if (lowerUrl.includes('linkedin.com')) {
            platform = "LinkedIn";
            icon = `<svg viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`;
        }

        return `
            <div class="smart-link-card">
                <div class="smart-link-icon">${icon}</div>
                <div class="smart-link-title">${platform}</div>
                <a href="${url}" target="_blank" class="smart-link-action">Lien</a>
            </div>
        `;
    }

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
            document.getElementById('profile-display-links').innerHTML = `
                <div class="smart-links-grid">
                    ${user.links.map(link => getSmartLinkHTML(link)).join('')}
                </div>
            `;
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
        if (editLinksData.length === 0) editLinksData.push('');
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
       10. PARAMÈTRES (Tabs horizontales & Mot de passe)
       ========================================================================== */
    const settingsTabs = document.querySelectorAll('.settings-tab');
    
    settingsTabs.forEach(tab => {
        tab.addEventListener('click', () => {
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
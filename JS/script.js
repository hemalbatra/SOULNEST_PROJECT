document.addEventListener("DOMContentLoaded", () => {

    // Global XSS Sanitizer Helper
    const escapeHtml = (str) => {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    // Performance Debounce Utility
    const debounce = (func, wait = 250) => {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };

    // Image Compressor Utility to Prevent localStorage QuotaExceededError
    const compressImage = (file, maxWidth = 400, maxHeight = 400, quality = 0.7, callback) => {
        if (!file || !file.type || !file.type.startsWith("image/")) {
            if (callback) callback("../IMAGES/profile_male1.png");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                try {
                    const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
                    if (callback) callback(compressedDataUrl);
                } catch (err) {
                    console.error("Image compression fallback error:", err);
                    if (callback) callback(e.target.result);
                }
            };
            img.onerror = () => {
                if (callback) callback("../IMAGES/profile_male1.png");
            };
            img.src = e.target.result;
        };
        reader.onerror = () => {
            if (callback) callback("../IMAGES/profile_male1.png");
        };
        reader.readAsDataURL(file);
    };

    // Theme Management Controller (Light / Dark Mode with Persistence)
    const initTheme = () => {
        const sunSvg = '<svg class="theme-svg theme-svg-sun" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>';
        const moonSvg = '<svg class="theme-svg theme-svg-moon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>';

        const getSavedTheme = () => {
            try {
                const stored = localStorage.getItem("soulNestTheme");
                return stored === "light" ? "light" : "dark";
            } catch (e) {
                return "dark";
            }
        };

        const applyTheme = (theme, showToastFeedback = false) => {
            document.documentElement.setAttribute("data-theme", theme);
            if (theme === "dark") {
                document.documentElement.classList.add("dark-theme");
            } else {
                document.documentElement.classList.remove("dark-theme");
            }

            const toggleBtns = document.querySelectorAll(".theme-toggle-btn, #theme-toggle-btn");
            toggleBtns.forEach(btn => {
                const icon = btn.querySelector(".theme-toggle-icon");
                if (icon) {
                    icon.innerHTML = theme === "dark" ? moonSvg : sunSvg;
                }
                const label = theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode";
                btn.setAttribute("title", label);
                btn.setAttribute("aria-label", label);
            });

            try {
                localStorage.setItem("soulNestTheme", theme);
            } catch (e) {}

            if (showToastFeedback && typeof showToast === "function") {
                showToast(theme === "dark" ? "Switched to Dark Mode" : "Switched to Light Mode", "info");
            }
        };

        // Auto-inject theme button if not in DOM
        const navMenuEl = document.querySelector(".nav-menu");
        if (navMenuEl && !document.querySelector(".theme-toggle-btn")) {
            const currentTheme = getSavedTheme();
            const themeLi = document.createElement("li");
            themeLi.className = "nav-theme-item";
            themeLi.innerHTML = `
                <button class="theme-toggle-btn" id="theme-toggle-btn" type="button" aria-label="${currentTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}" title="${currentTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}">
                    <span class="theme-toggle-icon">${currentTheme === "dark" ? moonSvg : sunSvg}</span>
                </button>`;
            const authLoginLi = navMenuEl.querySelector(".nav-auth-login");
            if (authLoginLi) {
                navMenuEl.insertBefore(themeLi, authLoginLi);
            } else {
                navMenuEl.appendChild(themeLi);
            }
        }

        // Apply initially
        applyTheme(getSavedTheme(), false);

        // Click handler for toggle buttons
        document.addEventListener("click", (e) => {
            const btn = e.target.closest(".theme-toggle-btn, #theme-toggle-btn");
            if (btn) {
                e.preventDefault();
                const isDark = document.documentElement.classList.contains("dark-theme");
                applyTheme(isDark ? "light" : "dark", true);
            }
        });
    };

    // Password Visibility Toggles & Real-time Strength Indicator
    const initPasswordEnhancements = () => {
        document.addEventListener("click", (e) => {
            const toggleBtn = e.target.closest(".btn-toggle-password");
            if (toggleBtn) {
                e.preventDefault();
                const wrap = toggleBtn.closest(".password-input-wrap");
                if (wrap) {
                    const input = wrap.querySelector("input");
                    if (input) {
                        const isPassword = input.type === "password";
                        input.type = isPassword ? "text" : "password";
                        toggleBtn.textContent = isPassword ? "🙈" : "👁️";
                        toggleBtn.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
                    }
                }
            }
        });

        const signupPasswordInput = document.querySelector(".signup-form #password");
        const strengthBarFill = document.getElementById("strength-bar-fill");
        const strengthText = document.getElementById("strength-text");

        if (signupPasswordInput && strengthBarFill && strengthText) {
            signupPasswordInput.addEventListener("input", () => {
                const val = signupPasswordInput.value;
                if (!val) {
                    strengthBarFill.className = "strength-bar-fill";
                    strengthBarFill.style.width = "0%";
                    strengthText.className = "strength-text";
                    strengthText.textContent = "Password strength: minimum 6 chars";
                    return;
                }

                let score = 0;
                if (val.length >= 6) score++;
                if (val.length >= 8) score++;
                if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
                if (/\d/.test(val)) score++;
                if (/[^A-Za-z0-9]/.test(val)) score++;

                strengthBarFill.className = "strength-bar-fill";
                strengthText.className = "strength-text";

                if (score <= 2) {
                    strengthBarFill.classList.add("weak");
                    strengthText.classList.add("weak");
                    strengthText.textContent = "Weak password (add letters and numbers)";
                } else if (score <= 3) {
                    strengthBarFill.classList.add("medium");
                    strengthText.classList.add("medium");
                    strengthText.textContent = "Medium password strength";
                } else {
                    strengthBarFill.classList.add("strong");
                    strengthText.classList.add("strong");
                    strengthText.textContent = "Strong password ✓";
                }
            });
        }
    };

    // 1. Mobile Hamburger Menu Toggle with backdrop click & scroll-lock
    const mobileMenu = document.getElementById("mobile-menu");
    const navMenu = document.querySelector(".nav-menu");

    const closeMobileNav = () => {
        if (mobileMenu && navMenu) {
            mobileMenu.classList.remove("active");
            navMenu.classList.remove("active");
            document.body.style.overflow = "";
        }
    };

    if (mobileMenu && navMenu) {
        mobileMenu.addEventListener("click", (e) => {
            e.stopPropagation();
            const isOpen = mobileMenu.classList.toggle("active");
            navMenu.classList.toggle("active", isOpen);
            document.body.style.overflow = isOpen ? "hidden" : "";
        });

        navMenu.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                closeMobileNav();
            });
        });

        // Close on clicking outside the navbar
        document.addEventListener("click", (e) => {
            if (navMenu.classList.contains("active")) {
                if (!navMenu.contains(e.target) && !mobileMenu.contains(e.target)) {
                    closeMobileNav();
                }
            }
        });

        // Close on Escape key
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && navMenu.classList.contains("active")) {
                closeMobileNav();
            }
        });

        // Auto close if resized to desktop
        window.addEventListener("resize", () => {
            if (window.innerWidth > 992 && navMenu.classList.contains("active")) {
                closeMobileNav();
            }
        });
    }

    // Shortlist & Interests LocalStorage Helpers
    const getStoredArray = (key) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    };

    const setStoredArray = (key, arr) => {
        try {
            localStorage.setItem(key, JSON.stringify(arr));
            const currentEmail = (localStorage.getItem("soulNestCurrentUserEmail") || "").toLowerCase().trim();
            if (currentEmail) {
                const user = getUserFromDb(currentEmail);
                if (user) {
                    if (key === "soulNestShortlist") user.shortlist = arr;
                    if (key === "soulNestInterests") user.interests = arr;
                    saveUserToDb(currentEmail, user);
                }
            }
        } catch (e) {
            console.error("Storage error:", e);
        }
    };

    // User Accounts Database & Profile Persistence in LocalStorage
    const getUsersDb = () => {
        try {
            const raw = localStorage.getItem("soulNestUsersDb");
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            console.error("UsersDb parse error:", e);
            return {};
        }
    };

    const saveUserToDb = (email, profile) => {
        if (!email || !profile) return;
        try {
            const db = getUsersDb();
            const key = email.toLowerCase().trim();
            db[key] = {
                ...db[key],
                ...profile,
                email: key
            };
            localStorage.setItem("soulNestUsersDb", JSON.stringify(db));
        } catch (e) {
            console.error("UsersDb save error:", e);
        }
    };

    const getUserFromDb = (email) => {
        if (!email) return null;
        try {
            const db = getUsersDb();
            const key = email.toLowerCase().trim();
            return db[key] || null;
        } catch (e) {
            return null;
        }
    };

    // Helper to get and set user profile
    const getDefaultProfile = () => {
        const storedUser = localStorage.getItem("soulNestUser") || "";
        const storedEmail = (localStorage.getItem("soulNestCurrentUserEmail") || "").toLowerCase().trim();
        return {
            name: storedUser || "",
            email: storedEmail || "",
            gender: "",
            dob: "",
            age: "",
            height: "",
            marital: "",
            mothertongue: "",
            religion: "",
            caste: "",
            gothra: "",
            manglik: "",
            edu: "",
            job: "",
            city: "",
            diet: "",
            bio: "",
            hobbies: "",
            avatar: "../IMAGES/profile_male1.png",
            userCustomized: false,
            shortlist: [],
            interests: []
        };
    };

    const normalizeAvatar = (avatar) => {
        if (!avatar) return "../IMAGES/profile_male1.png";
        if (avatar.startsWith("/IMAGES/")) return ".." + avatar;
        if (avatar.startsWith("IMAGES/")) return "../" + avatar;
        return avatar;
    };

    const sanitizeProfile = (profile) => {
        if (!profile) return profile;
        if (!profile.userCustomized) {
            if (profile.caste === "Bhardwaj" || profile.caste === "Brahmin (Bhardwaj)") profile.caste = "";
            if (profile.gothra === "Bhardwaj") profile.gothra = "";
            if (profile.manglik === "Non-Manglik") profile.manglik = "";
            if (profile.job === "Senior Software Engineer") profile.job = "";
            if (profile.city === "New Delhi, India") profile.city = "";
            if (profile.edu === "B.Tech in Computer Science") profile.edu = "";
            if (profile.bio && profile.bio.includes("Passionate about meaningful connections")) profile.bio = "";
            if (profile.height === "5'9\"" || profile.height === "5'9") profile.height = "";
            if (profile.marital === "Never Married") profile.marital = "";
            if (profile.mothertongue === "Hindi") profile.mothertongue = "";
            if (profile.diet === "Vegetarian") profile.diet = "";
            if (profile.age === 26 || profile.age === "26" || profile.age === "26 Years") profile.age = "";
        }
        if (profile.avatar) {
            profile.avatar = normalizeAvatar(profile.avatar);
        }
        return profile;
    };

    const getUserProfile = () => {
        try {
            const currentEmail = (localStorage.getItem("soulNestCurrentUserEmail") || "").toLowerCase().trim();
            if (currentEmail) {
                const dbUser = getUserFromDb(currentEmail);
                if (dbUser) {
                    return sanitizeProfile(dbUser);
                }
            }
            const raw = localStorage.getItem("soulNestProfile");
            if (raw) {
                const parsed = JSON.parse(raw);
                return sanitizeProfile(parsed);
            }
        } catch (e) {
            console.error("Profile parse error:", e);
        }
        return getDefaultProfile();
    };

    const setUserProfile = (profile) => {
        try {
            const email = (profile.email || localStorage.getItem("soulNestCurrentUserEmail") || "").toLowerCase().trim();
            if (email) {
                profile.email = email;
                localStorage.setItem("soulNestCurrentUserEmail", email);
                profile.shortlist = getStoredArray("soulNestShortlist");
                profile.interests = getStoredArray("soulNestInterests");
                saveUserToDb(email, profile);
            }
            if (profile.avatar) {
                profile.avatar = normalizeAvatar(profile.avatar);
            }
            localStorage.setItem("soulNestProfile", JSON.stringify(profile));
            if (profile.name) localStorage.setItem("soulNestUser", profile.name);
            updateNavProfilePic(profile);
        } catch (e) {
            console.error("Profile save error:", e);
        }
    };

    const updateNavProfilePic = (prof) => {
        const profile = prof || getUserProfile();
        const profilePics = document.querySelectorAll(".nav-profile-pic, #nav-profile-pic");
        if (profile && profile.avatar) {
            profilePics.forEach(img => {
                img.src = normalizeAvatar(profile.avatar);
            });
        }
        const profileNames = document.querySelectorAll(".nav-profile-name, #nav-profile-name");
        const displayName = (profile && profile.name) ? profile.name : (localStorage.getItem("soulNestUser") || "My Profile");
        profileNames.forEach(el => {
            el.textContent = displayName;
        });
    };

    // 2. Authentication & Navigation Control (Zero-Flicker Synchronized)
    const isLoggedIn = localStorage.getItem("soulNestLoggedIn") === "true";
    const currentUrl = window.location.href.toLowerCase();

    if (isLoggedIn) {
        document.documentElement.classList.add("user-logged-in");
        document.documentElement.classList.remove("user-logged-out");
        updateNavProfilePic();

        if (currentUrl.includes("signin.html") || currentUrl.includes("signup.html")) {
            window.location.replace("dashboard.html");
        }
    } else {
        document.documentElement.classList.remove("user-logged-in");
        document.documentElement.classList.add("user-logged-out");

        if (currentUrl.includes("dashboard.html")) {
            window.location.replace("signin.html");
        }
    }

    let currentViewMode = "all"; // 'all' | 'shortlist' | 'interests'
    let currentModalCardId = null;

    // 3. Elements References
    const matchCards = document.querySelectorAll("#matches-grid .match-card");
    const resultsCount = document.getElementById("results-count");
    const viewTabs = document.querySelectorAll(".matches-view-tabs .view-tab");
    const badgeAllCount = document.getElementById("badge-all-count");
    const badgeShortlistCount = document.getElementById("badge-shortlist-count");
    const badgeInterestsCount = document.getElementById("badge-interests-count");

    const emptyStateShortlist = document.getElementById("empty-state-shortlist");
    const emptyStateInterests = document.getElementById("empty-state-interests");
    const emptyStateFilters = document.getElementById("empty-state-filters");

    // Update Badges and Card Buttons from Stored State
    const updateBadgesAndState = () => {
        const shortlisted = getStoredArray("soulNestShortlist");
        const interests = getStoredArray("soulNestInterests");

        if (badgeAllCount) badgeAllCount.textContent = matchCards.length;
        if (badgeShortlistCount) badgeShortlistCount.textContent = shortlisted.length;
        if (badgeInterestsCount) badgeInterestsCount.textContent = interests.length;

        matchCards.forEach(card => {
            const cardId = card.getAttribute("data-id");
            const bookmarkBtn = card.querySelector(".card-bookmark-btn");
            const connectBtn = card.querySelector(".connect-btn");

            if (bookmarkBtn) {
                if (shortlisted.includes(cardId)) {
                    bookmarkBtn.classList.add("saved");
                    bookmarkBtn.textContent = "♥";
                    bookmarkBtn.title = "Remove from Shortlist";
                } else {
                    bookmarkBtn.classList.remove("saved");
                    bookmarkBtn.textContent = "♡";
                    bookmarkBtn.title = "Save to Shortlist";
                }
            }

            if (connectBtn) {
                if (interests.includes(cardId)) {
                    connectBtn.classList.add("sent");
                    connectBtn.innerHTML = "<span>✓</span> Interest Sent";
                } else {
                    connectBtn.classList.remove("sent");
                    connectBtn.innerHTML = "Send Interest";
                }
            }
        });
    };

    // 4. Comprehensive Match Filters (Age, Work, Education, Religion, City, Diet, Search, and Tabs)
    const searchInput = document.getElementById("filter-search");
    const genderSelect = document.getElementById("filter-gender");
    const ageSelect = document.getElementById("filter-age");
    const workSelect = document.getElementById("filter-work");
    const eduSelect = document.getElementById("filter-edu");
    const religionSelect = document.getElementById("filter-religion");
    const citySelect = document.getElementById("filter-city");
    const dietSelect = document.getElementById("filter-diet");
    const resetFiltersBtn = document.getElementById("reset-filters-btn");

    const filterMatches = () => {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
        const gender = genderSelect ? genderSelect.value : "all";
        const ageRange = ageSelect ? ageSelect.value : "all";
        const work = workSelect ? workSelect.value : "all";
        const edu = eduSelect ? eduSelect.value : "all";
        const religion = religionSelect ? religionSelect.value : "all";
        const city = citySelect ? citySelect.value : "all";
        const diet = dietSelect ? dietSelect.value : "all";

        const shortlisted = getStoredArray("soulNestShortlist");
        const interests = getStoredArray("soulNestInterests");

        let visibleCount = 0;

        matchCards.forEach(card => {
            const cardId = card.getAttribute("data-id");
            const cardText = card.textContent.toLowerCase();
            const cardGender = card.getAttribute("data-gender") || "all";
            const cardAge = parseInt(card.getAttribute("data-age") || "25");
            const cardWork = card.getAttribute("data-work") || "all";
            const cardEdu = card.getAttribute("data-edu") || "all";
            const cardReligion = card.getAttribute("data-religion") || "all";
            const cardCity = card.getAttribute("data-city") || "all";
            const cardDiet = card.getAttribute("data-diet") || "all";

            // Tab View Filter Check
            let matchesView = true;
            if (currentViewMode === "shortlist") {
                matchesView = shortlisted.includes(cardId);
            } else if (currentViewMode === "interests") {
                matchesView = interests.includes(cardId);
            }

            const matchesQuery = !query || cardText.includes(query);
            const matchesGender = gender === "all" || cardGender === gender;
            const matchesWork = work === "all" || cardWork === work;
            const matchesEdu = edu === "all" || cardEdu === edu;
            const matchesReligion = religion === "all" || cardReligion === religion;
            const matchesCity = city === "all" || cardCity === city;
            const matchesDiet = diet === "all" || cardDiet === diet;

            let matchesAge = true;
            if (ageRange === "24-26") matchesAge = (cardAge >= 24 && cardAge <= 26);
            else if (ageRange === "27-29") matchesAge = (cardAge >= 27 && cardAge <= 29);
            else if (ageRange === "30-plus") matchesAge = (cardAge >= 30);

            if (matchesView && matchesQuery && matchesGender && matchesAge && matchesWork && matchesEdu && matchesReligion && matchesCity && matchesDiet) {
                card.style.display = "flex";
                visibleCount++;
            } else {
                card.style.display = "none";
            }
        });

        // Manage Empty States
        if (emptyStateShortlist) emptyStateShortlist.style.display = "none";
        if (emptyStateInterests) emptyStateInterests.style.display = "none";
        if (emptyStateFilters) emptyStateFilters.style.display = "none";

        if (visibleCount === 0) {
            if (currentViewMode === "shortlist" && shortlisted.length === 0) {
                if (emptyStateShortlist) emptyStateShortlist.style.display = "block";
            } else if (currentViewMode === "interests" && interests.length === 0) {
                if (emptyStateInterests) emptyStateInterests.style.display = "block";
            } else {
                if (emptyStateFilters) emptyStateFilters.style.display = "block";
            }
        }

        if (resultsCount) {
            if (currentViewMode === "shortlist") {
                resultsCount.textContent = `Showing ${visibleCount} Shortlisted ${visibleCount === 1 ? "Profile" : "Profiles"}`;
            } else if (currentViewMode === "interests") {
                resultsCount.textContent = `Showing ${visibleCount} Selected ${visibleCount === 1 ? "Profile" : "Profiles"}`;
            } else {
                resultsCount.textContent = `Showing ${visibleCount} Verified ${visibleCount === 1 ? "Match" : "Matches"}`;
            }
        }
    };

    const resetAllFilters = () => {
        if (searchInput) searchInput.value = "";
        if (genderSelect) genderSelect.value = "all";
        if (ageSelect) ageSelect.value = "all";
        if (workSelect) workSelect.value = "all";
        if (eduSelect) eduSelect.value = "all";
        if (religionSelect) religionSelect.value = "all";
        if (citySelect) citySelect.value = "all";
        if (dietSelect) dietSelect.value = "all";
        filterMatches();
        showToast("All filters have been reset.", "info");
    };

    // Tab Switching Functionality
    const switchTab = (tabMode) => {
        currentViewMode = tabMode;
        viewTabs.forEach(tab => {
            if (tab.getAttribute("data-view") === tabMode) {
                tab.classList.add("active");
                tab.setAttribute("aria-selected", "true");
            } else {
                tab.classList.remove("active");
                tab.setAttribute("aria-selected", "false");
            }
        });
        filterMatches();
    };

    viewTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const targetView = tab.getAttribute("data-view");
            switchTab(targetView);
        });
    });

    // Empty State Buttons (Browse Recommended Matches & Reset Filters)
    document.querySelectorAll(".browse-all-matches-btn").forEach(btn => {
        btn.addEventListener("click", () => switchTab("all"));
    });

    document.querySelectorAll(".empty-reset-filters-btn").forEach(btn => {
        btn.addEventListener("click", resetAllFilters);
    });

    if (searchInput) searchInput.addEventListener("input", debounce(filterMatches, 250));
    if (genderSelect) genderSelect.addEventListener("change", filterMatches);
    if (ageSelect) ageSelect.addEventListener("change", filterMatches);
    if (workSelect) workSelect.addEventListener("change", filterMatches);
    if (eduSelect) eduSelect.addEventListener("change", filterMatches);
    if (religionSelect) religionSelect.addEventListener("change", filterMatches);
    if (citySelect) citySelect.addEventListener("change", filterMatches);
    if (dietSelect) dietSelect.addEventListener("change", filterMatches);
    if (resetFiltersBtn) resetFiltersBtn.addEventListener("click", resetAllFilters);

    // 5. Connect & Shortlist Card Actions (Matches Page)
    matchCards.forEach(card => {
        const cardId = card.getAttribute("data-id");
        const bookmarkBtn = card.querySelector(".card-bookmark-btn");
        const connectBtn = card.querySelector(".connect-btn");

        if (bookmarkBtn) {
            bookmarkBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                let shortlisted = getStoredArray("soulNestShortlist");
                if (shortlisted.includes(cardId)) {
                    shortlisted = shortlisted.filter(id => id !== cardId);
                    setStoredArray("soulNestShortlist", shortlisted);
                    showToast("Removed profile from your shortlist.", "info");
                } else {
                    shortlisted.push(cardId);
                    setStoredArray("soulNestShortlist", shortlisted);
                    showToast("Profile saved to your shortlist!", "success");
                }
                updateBadgesAndState();
                filterMatches();
            });
        }

        if (connectBtn) {
            connectBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                let interests = getStoredArray("soulNestInterests");
                if (interests.includes(cardId)) {
                    interests = interests.filter(id => id !== cardId);
                    setStoredArray("soulNestInterests", interests);
                    showToast("Cancelled express interest request.", "info");
                } else {
                    interests.push(cardId);
                    setStoredArray("soulNestInterests", interests);
                    showToast("Express Interest request sent!", "success");
                }
                updateBadgesAndState();
                filterMatches();
            });
        }
    });

    // 6. Profile Details Modal (Matches Page)
    const modal = document.getElementById("profile-modal");
    const viewButtons = document.querySelectorAll(".view-profile-btn");
    const closeBtn = document.getElementById("modal-close");
    const closeFooterBtn = document.getElementById("modal-close-footer");
    const modalShortlistAction = document.getElementById("modal-shortlist-action");
    const modalConnectAction = document.getElementById("modal-connect-action");

    const updateModalActionButtons = () => {
        if (!currentModalCardId) return;
        const shortlisted = getStoredArray("soulNestShortlist");
        const interests = getStoredArray("soulNestInterests");

        if (modalShortlistAction) {
            if (shortlisted.includes(currentModalCardId)) {
                modalShortlistAction.classList.add("saved");
                modalShortlistAction.textContent = "♥ Shortlisted";
            } else {
                modalShortlistAction.classList.remove("saved");
                modalShortlistAction.textContent = "♡ Shortlist Profile";
            }
        }

        if (modalConnectAction) {
            if (interests.includes(currentModalCardId)) {
                modalConnectAction.textContent = "✓ Interest Sent";
                modalConnectAction.style.background = "#2ec4b6";
            } else {
                modalConnectAction.textContent = "Send Express Interest";
                modalConnectAction.style.background = "";
            }
        }
    };

    if (modal) {
        viewButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                const card = btn.closest(".match-card");
                if (card) {
                    currentModalCardId = card.getAttribute("data-id");
                    const name = card.querySelector("h3") ? card.querySelector("h3").textContent : "Candidate";
                    const job = card.querySelector(".match-meta-job") ? card.querySelector(".match-meta-job").textContent : "";
                    const img = card.querySelector("img") ? card.querySelector("img").src : "";
                    const pills = card.querySelectorAll(".match-info-pill");
                    const bio = card.querySelector(".match-quote-bubble") ? card.querySelector(".match-quote-bubble").textContent : "";

                    document.getElementById("modal-name").textContent = name;
                    document.getElementById("modal-job").textContent = job;
                    document.getElementById("modal-img").src = img;
                    const compatBadge = card.querySelector(".match-badge.compat");
                    const modalBadgeEl = document.getElementById("modal-badge");
                    if (modalBadgeEl && compatBadge) {
                        modalBadgeEl.textContent = compatBadge.textContent;
                    }
                    if (pills.length >= 4) {
                        document.getElementById("modal-age-height").textContent = pills[0].textContent.replace("🎂", "").trim();
                        document.getElementById("modal-city").textContent = pills[1].textContent.replace("📍", "").trim() + ", India";
                        document.getElementById("modal-religion").textContent = pills[2].textContent.replace("🕊️", "").trim();
                        document.getElementById("modal-diet").textContent = pills[3].textContent.replace("🥗", "").replace("🍗", "").trim() + " • Non-Smoker";
                    }
                    document.getElementById("modal-bio").textContent = bio;

                    updateModalActionButtons();
                }
                modal.classList.add("show");
            });
        });

        const closeModal = () => {
            modal.classList.remove("show");
            currentModalCardId = null;
        };
        if (closeBtn) closeBtn.addEventListener("click", closeModal);
        if (closeFooterBtn) closeFooterBtn.addEventListener("click", closeModal);
        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeModal();
        });

        if (modalShortlistAction) {
            modalShortlistAction.addEventListener("click", () => {
                if (!currentModalCardId) return;
                let shortlisted = getStoredArray("soulNestShortlist");
                if (shortlisted.includes(currentModalCardId)) {
                    shortlisted = shortlisted.filter(id => id !== currentModalCardId);
                    setStoredArray("soulNestShortlist", shortlisted);
                    showToast("Removed profile from your shortlist.", "info");
                } else {
                    shortlisted.push(currentModalCardId);
                    setStoredArray("soulNestShortlist", shortlisted);
                    showToast("Profile saved to your shortlist!", "success");
                }
                updateBadgesAndState();
                updateModalActionButtons();
                filterMatches();
            });
        }

        if (modalConnectAction) {
            modalConnectAction.addEventListener("click", () => {
                if (!currentModalCardId) return;
                let interests = getStoredArray("soulNestInterests");
                if (interests.includes(currentModalCardId)) {
                    interests = interests.filter(id => id !== currentModalCardId);
                    setStoredArray("soulNestInterests", interests);
                    showToast("Cancelled express interest request.", "info");
                } else {
                    interests.push(currentModalCardId);
                    setStoredArray("soulNestInterests", interests);
                    showToast("Express Interest request sent successfully!", "success");
                }
                updateBadgesAndState();
                updateModalActionButtons();
                filterMatches();
            });
        }
    }

    // Initialize State on Page Load
    updateBadgesAndState();
    filterMatches();

    // 6. Success Stories Category Filters
    const storyFilterBtns = document.querySelectorAll(".filter-btn");
    const storyCards = document.querySelectorAll(".stories-gallery .card");

    if (storyFilterBtns.length > 0) {
        storyFilterBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                storyFilterBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                const filter = btn.getAttribute("data-filter");

                storyCards.forEach(card => {
                    if (filter === "all" || card.classList.contains(filter)) {
                        card.style.display = "flex";
                    } else {
                        card.style.display = "none";
                    }
                });
            });
        });
    }

    // 7. Romantic Cute Love Album & Story Modal
    const storyModal = document.getElementById("story-modal");
    const storyCardsList = document.querySelectorAll(".stories-gallery .card");
    const storyCloseBtn = document.getElementById("story-modal-close");
    const storyCloseFooterBtn = document.getElementById("story-modal-close-footer");
    const sendWishesBtn = document.getElementById("send-wishes-btn");

    if (storyModal && storyCardsList.length > 0) {
        const openStoryDetails = (card) => {
            const title = card.querySelector("h3") ? card.querySelector("h3").textContent : "Happy Couple";
            const meta = card.querySelector(".story-couple-meta") ? card.querySelector(".story-couple-meta").textContent : "";

            const img1 = card.getAttribute("data-img1") || "../IMAGES/couple2.png";
            const img2 = card.getAttribute("data-img2") || "../IMAGES/couple.png";
            const img3 = card.getAttribute("data-img3") || "../IMAGES/signup_couple2.png";

            const date = card.getAttribute("data-date") || "December 2024";
            const location = card.getAttribute("data-location") || "India";
            const how = card.getAttribute("data-how") || "Connected and fell in love through SoulNest.";
            const quote = card.querySelector(".story-excerpt") ? card.querySelector(".story-excerpt").textContent : "";
            const advice = card.getAttribute("data-advice") || "Always stay open and honest about your life goals.";

            const tag1 = card.getAttribute("data-tag1") || "☕ 1st Date: Coffee Cafe";
            const tag2 = card.getAttribute("data-tag2") || "💍 Sunset Proposal";
            const compat = card.getAttribute("data-compat") || "💖 98% Soul Compatibility";

            const titleEl = document.getElementById("story-modal-title");
            const locEl = document.getElementById("story-modal-location");
            const dateEl = document.getElementById("story-modal-date");
            const placeEl = document.getElementById("story-modal-place");
            const howEl = document.getElementById("story-modal-how");
            const quoteEl = document.getElementById("story-modal-quote");
            const adviceEl = document.getElementById("story-modal-advice");
            const compatEl = document.getElementById("story-modal-compat");
            const tag1El = document.getElementById("story-tag-1");
            const tag2El = document.getElementById("story-tag-2");

            const img1El = document.getElementById("story-img-1");
            const img2El = document.getElementById("story-img-2");
            const img3El = document.getElementById("story-img-3");

            if (titleEl) titleEl.textContent = title;
            if (locEl) locEl.textContent = meta;
            if (dateEl) dateEl.textContent = date;
            if (placeEl) placeEl.textContent = location;
            if (howEl) howEl.textContent = how;
            if (quoteEl) quoteEl.textContent = quote;
            if (adviceEl) adviceEl.textContent = advice;
            if (compatEl) compatEl.textContent = compat;
            if (tag1El) tag1El.textContent = tag1;
            if (tag2El) tag2El.textContent = tag2;

            if (img1El) img1El.src = img1;
            if (img2El) img2El.src = img2;
            if (img3El) img3El.src = img3;

            storyModal.classList.add("show");
        };

        storyCardsList.forEach(card => {
            card.addEventListener("click", () => openStoryDetails(card));
        });

        const closeStoryModal = () => storyModal.classList.remove("show");
        if (storyCloseBtn) storyCloseBtn.addEventListener("click", closeStoryModal);
        if (storyCloseFooterBtn) storyCloseFooterBtn.addEventListener("click", closeStoryModal);
        storyModal.addEventListener("click", (e) => {
            if (e.target === storyModal) closeStoryModal();
        });

        // Cute Heart Shower Animation Function
        if (sendWishesBtn) {
            sendWishesBtn.addEventListener("click", () => {
                showToast("Best wishes showered on the lovely couple!", "success");

                // Create cute floating hearts animation
                for (let i = 0; i < 15; i++) {
                    const heart = document.createElement("div");
                    const symbols = ["♥", "♡", "🌸", "✨", "💍"];
                    heart.textContent = symbols[Math.floor(Math.random() * symbols.length)];
                    heart.style.position = "fixed";
                    heart.style.left = (20 + Math.random() * 60) + "vw";
                    heart.style.bottom = "80px";
                    heart.style.fontSize = (20 + Math.random() * 24) + "px";
                    heart.style.zIndex = "100000";
                    heart.style.pointerEvents = "none";
                    heart.style.transition = "all 1.6s ease-out";
                    heart.style.opacity = "1";
                    heart.style.color = "#d63384";
                    document.body.appendChild(heart);

                    setTimeout(() => {
                        heart.style.transform = `translate(${(Math.random() - 0.5) * 150}px, -${150 + Math.random() * 250}px) scale(1.4)`;
                        heart.style.opacity = "0";
                    }, 20);

                    setTimeout(() => heart.remove(), 1700);
                }
            });
        }
    }

    // Dynamic Life-Partner Compatibility Score Calculation Algorithm
    const calculateCompatibility = (userProfile, candidate) => {
        if (!candidate) return "92% Match";
        const prof = userProfile || getUserProfile();
        let score = 70; // Baseline verified compatibility

        // 1. Age proximity (ideal gap within 1-3 years: +8)
        if (prof && prof.age && candidate.age) {
            const userAge = parseInt(prof.age, 10);
            const candAge = parseInt(candidate.age, 10);
            if (!isNaN(userAge) && !isNaN(candAge)) {
                const diff = Math.abs(userAge - candAge);
                if (diff <= 2) score += 8;
                else if (diff <= 4) score += 5;
                else if (diff <= 6) score += 2;
            }
        } else {
            score += 5;
        }

        // 2. Religion alignment (+8)
        if (prof && prof.religion && candidate.religion) {
            const userRel = prof.religion.toLowerCase();
            const candRel = candidate.religion.toLowerCase();
            if (candRel.includes(userRel) || userRel.includes(candRel)) {
                score += 8;
            } else if (!prof.religion) {
                score += 4;
            }
        } else {
            score += 5;
        }

        // 3. Diet & Lifestyle (+5)
        if (prof && prof.diet && candidate.diet) {
            const userDiet = prof.diet.toLowerCase();
            const candDiet = candidate.diet.toLowerCase();
            if (userDiet.includes(candDiet) || candDiet.includes(userDiet)) {
                score += 5;
            } else {
                score += 1;
            }
        } else {
            score += 3;
        }

        // 4. City / Geographic Proximity (+5)
        if (prof && prof.city && candidate.city) {
            const userCity = prof.city.toLowerCase();
            const candCity = candidate.city.toLowerCase();
            if (userCity.includes(candCity) || candCity.includes(userCity)) {
                score += 5;
            } else if ((userCity.includes("delhi") || userCity.includes("gurugram")) && 
                       (candCity.includes("delhi") || candCity.includes("gurugram"))) {
                score += 4; // NCR region
            } else {
                score += 2;
            }
        } else {
            score += 3;
        }

        // 5. Professional / Education Alignment (+4)
        if (prof && prof.edu && candidate.edu) {
            const userEdu = prof.edu.toLowerCase();
            const candEdu = candidate.edu.toLowerCase();
            if ((userEdu.includes("tech") || userEdu.includes("eng") || userEdu.includes("cse")) && 
                (candEdu.includes("tech") || candEdu.includes("eng") || candEdu.includes("cse"))) {
                score += 4;
            } else if (userEdu.includes("mba") && candEdu.includes("mba")) {
                score += 4;
            } else {
                score += 2;
            }
        } else {
            score += 2;
        }

        // Clamp between 76% and 99%
        score = Math.min(99, Math.max(76, score));
        return `${score}% Compatibility`;
    };

    const updateAllCompatibilityScores = () => {
        const prof = getUserProfile();
        if (typeof SOULNEST_CANDIDATES !== "undefined" && Array.isArray(SOULNEST_CANDIDATES)) {
            SOULNEST_CANDIDATES.forEach(cand => {
                cand.compat = calculateCompatibility(prof, cand);
            });
        }

        const cards = document.querySelectorAll("#matches-grid .match-card");
        cards.forEach(card => {
            const cardId = card.getAttribute("data-id");
            const cand = (typeof SOULNEST_CANDIDATES !== "undefined" && Array.isArray(SOULNEST_CANDIDATES)) ? SOULNEST_CANDIDATES.find(c => c.id === cardId) : null;
            const candData = cand || {
                age: card.getAttribute("data-age"),
                religion: card.getAttribute("data-religion"),
                city: card.getAttribute("data-city"),
                diet: card.getAttribute("data-diet"),
                edu: card.getAttribute("data-edu")
            };
            const badge = card.querySelector(".match-badge.compat");
            if (badge) {
                badge.textContent = calculateCompatibility(prof, candData);
            }
        });
    };

    // 8. SOULNEST CANDIDATES DATABASE & DASHBOARD CONTROLLER
    const SOULNEST_CANDIDATES = [
        {
            "id": "1",
            "name": "Aishwarya Sharma",
            "job": "Senior Software Engineer",
            "age": 25,
            "height": "5'5\"",
            "city": "Gurugram",
            "religion": "Hindu (Bhardwaj)",
            "diet": "Vegetarian",
            "edu": "B.Tech (CSE) / MBA",
            "compat": "98% Compatibility",
            "img": "../IMAGES/ai_matches/match_1_aishwarya.jpg",
            "bio": "Passionate about classical music, technology, and building a balanced, happy home together."
        },
        {
            "id": "2",
            "name": "Rahul Malhotra",
            "job": "Lead Product Manager",
            "age": 28,
            "height": "5'11\"",
            "city": "Mumbai",
            "religion": "Hindu (Kashyap)",
            "diet": "Vegetarian",
            "edu": "B.Tech + MBA",
            "compat": "96% Compatibility",
            "img": "../IMAGES/ai_matches/match_2_rahul.jpg",
            "bio": "Looking for an understanding life partner who loves traveling, family gatherings, and good conversation."
        },
        {
            "id": "3",
            "name": "Priya Patel",
            "job": "UX/UI Design Lead",
            "age": 26,
            "height": "5'4\"",
            "city": "Delhi",
            "religion": "Hindu (Vats)",
            "diet": "Vegetarian",
            "edu": "Design & Architecture",
            "compat": "95% Compatibility",
            "img": "../IMAGES/ai_matches/match_3_priya.jpg",
            "bio": "Creative enthusiast who loves art galleries, weekend baking, and simple, authentic moments."
        },
        {
            "id": "4",
            "name": "Kabir Singh",
            "job": "Data Science Consultant",
            "age": 29,
            "height": "6'0\"",
            "city": "Bengaluru",
            "religion": "Sikh (Grewal)",
            "diet": "Non-Vegetarian",
            "edu": "B.Tech / MS (Data Science)",
            "compat": "92% Match",
            "img": "../IMAGES/ai_matches/match_4_kabir.jpg",
            "bio": "Down-to-earth tech professional seeking a caring, ambitious companion with strong family values."
        },
        {
            "id": "5",
            "name": "Zara Khan",
            "job": "Chartered Accountant (CA)",
            "age": 27,
            "height": "5'6\"",
            "city": "Mumbai",
            "religion": "Muslim (Sunni)",
            "diet": "Non-Vegetarian",
            "edu": "CA / Finance",
            "compat": "90% Match",
            "img": "../IMAGES/ai_matches/match_5_zara.jpg",
            "bio": "Ambitious professional who values mutual respect, intellectual conversations, and good food."
        },
        {
            "id": "6",
            "name": "Vikram Fernandes",
            "job": "Architect & Urban Planner",
            "age": 30,
            "height": "5'10\"",
            "city": "Gurugram",
            "religion": "Christian (Catholic)",
            "diet": "Non-Vegetarian",
            "edu": "B.Arch / Urban Design",
            "compat": "89% Match",
            "img": "../IMAGES/ai_matches/match_6_vikram.jpg",
            "bio": "Enthusiast of heritage architecture, hiking, and finding joy in life's simple everyday moments."
        },
        {
            "id": "7",
            "name": "Ananya Verma",
            "job": "Pediatric Doctor (MBBS, MD)",
            "age": 27,
            "height": "5'6\"",
            "city": "Chandigarh",
            "religion": "Hindu (Shandilya)",
            "diet": "Vegetarian",
            "edu": "MBBS, MD (Pediatrics)",
            "compat": "97% Compatibility",
            "img": "../IMAGES/ai_matches/match_7_ananya.jpg",
            "bio": "Dedicated healthcare professional who believes in compassion, fitness, and living life with optimism."
        },
        {
            "id": "8",
            "name": "Rohan Mehta",
            "job": "Marketing Director",
            "age": 29,
            "height": "5'11\"",
            "city": "Pune",
            "religion": "Hindu (Jain)",
            "diet": "Vegetarian",
            "edu": "MBA (Marketing)",
            "compat": "94% Compatibility",
            "img": "../IMAGES/ai_matches/match_8_rohan.jpg",
            "bio": "Dynamic marketing strategist who loves photography, road trips, and building long-lasting bonds."
        },
        {
            "id": "9",
            "name": "Jaspreet Kaur",
            "job": "Fashion & Brand Consultant",
            "age": 26,
            "height": "5'7\"",
            "city": "Delhi",
            "religion": "Sikh (Gill)",
            "diet": "Vegetarian",
            "edu": "Fashion & Design",
            "compat": "93% Match",
            "img": "../IMAGES/ai_matches/match_9_jaspreet.jpg",
            "bio": "Energetic, creative spirit who loves traveling, traditional cuisine, and modern design aesthetics."
        },
        {
            "id": "10",
            "name": "Aditya Sengupta",
            "job": "AI Research Scientist",
            "age": 31,
            "height": "5'10\"",
            "city": "Bengaluru",
            "religion": "Hindu (Brahmin)",
            "diet": "Vegetarian",
            "edu": "B.Tech + Ph.D",
            "compat": "91% Match",
            "img": "../IMAGES/ai_matches/match_10_aditya.jpg",
            "bio": "Researcher at heart who enjoys science podcasts, classical guitar, and peaceful mountain treks."
        },
        {
            "id": "11",
            "name": "Sneha Rao",
            "job": "Financial Risk Analyst",
            "age": 26,
            "height": "5'5\"",
            "city": "Hyderabad",
            "religion": "Hindu (Reddy)",
            "diet": "Non-Vegetarian",
            "edu": "CA / CFA / Finance",
            "compat": "96% Compatibility",
            "img": "../IMAGES/ai_matches/match_11_sneha.jpg",
            "bio": "Looking for an honest, ambitious companion who cherishes simple pleasures and mutual growth."
        },
        {
            "id": "12",
            "name": "Harshvardhan Rathore",
            "job": "Civil & Structural Engineer",
            "age": 29,
            "height": "6'1\"",
            "city": "Jaipur",
            "religion": "Hindu (Rajput)",
            "diet": "Vegetarian",
            "edu": "B.Tech (Civil) / M.Tech",
            "compat": "88% Match",
            "img": "../IMAGES/ai_matches/match_12_harshvardhan.jpg",
            "bio": "Values tradition, integrity, and good humor. Looking forward to starting a wonderful new chapter."
        },
        {
            "id": "13",
            "name": "Tanvi Joshi",
            "job": "Cloud Solutions Architect",
            "age": 25,
            "height": "5'4\"",
            "city": "Pune",
            "religion": "Hindu (Deshastha)",
            "diet": "Vegetarian",
            "edu": "B.Tech + MS (Tech)",
            "compat": "95% Compatibility",
            "img": "../IMAGES/ai_matches/match_13_tanvi.jpg",
            "bio": "Tech lover who enjoys indie coffee shops, yoga weekends, and soulful conversations."
        },
        {
            "id": "14",
            "name": "Kunal Kapoor",
            "job": "Investment Banker",
            "age": 28,
            "height": "5'10\"",
            "city": "Delhi",
            "religion": "Hindu (Khatri)",
            "diet": "Non-Vegetarian",
            "edu": "MBA (Finance)",
            "compat": "93% Match",
            "img": "../IMAGES/ai_matches/match_14_kunal.jpg",
            "bio": "Finance professional with an adventurous spirit. Seeking an independent, loving life partner."
        },
        {
            "id": "15",
            "name": "Meera Nambiar",
            "job": "Orthodontist & Dental Surgeon",
            "age": 27,
            "height": "5'5\"",
            "city": "Bengaluru",
            "religion": "Hindu (Nair)",
            "diet": "Vegetarian",
            "edu": "BDS / MDS (Orthodontics)",
            "compat": "94% Compatibility",
            "img": "../IMAGES/ai_matches/match_15_meera.jpg",
            "bio": "Passionate about healthcare, classical dance, and exploring new culinary experiences."
        },
        {
            "id": "16",
            "name": "Arjun Deshmukh",
            "job": "Senior Interior Architect",
            "age": 30,
            "height": "6'0\"",
            "city": "Mumbai",
            "religion": "Hindu (Maratha)",
            "diet": "Non-Vegetarian",
            "edu": "B.Arch / Interior Design",
            "compat": "91% Match",
            "img": "../IMAGES/ai_matches/match_16_arjun.jpg",
            "bio": "Designer by profession, wanderer by heart. Looking for someone grounded with a zest for life."
        },
        {
            "id": "17",
            "name": "Diya Chatterjee",
            "job": "Senior Product Designer",
            "age": 26,
            "height": "5'3\"",
            "city": "Bengaluru",
            "religion": "Hindu (Brahmin)",
            "diet": "Non-Vegetarian",
            "edu": "Design & Architecture",
            "compat": "96% Compatibility",
            "img": "../IMAGES/ai_matches/match_17_diya.jpg",
            "bio": "Passionate about user experience design, acoustic music, and soulful travel stories."
        },
        {
            "id": "18",
            "name": "Siddharth Nair",
            "job": "Principal DevOps Engineer",
            "age": 29,
            "height": "5'11\"",
            "city": "Hyderabad",
            "religion": "Hindu (Menon)",
            "diet": "Non-Vegetarian",
            "edu": "B.Tech (CSE) / MS",
            "compat": "92% Match",
            "img": "../IMAGES/ai_matches/match_18_siddharth.jpg",
            "bio": "Tech enthusiast who enjoys fitness, weekend marathons, and building strong family bonds."
        },
        {
            "id": "19",
            "name": "Riya Singhania",
            "job": "Corporate Finance Lead",
            "age": 25,
            "height": "5'6\"",
            "city": "Jaipur",
            "religion": "Hindu (Agarwal)",
            "diet": "Vegetarian",
            "edu": "CA / Finance",
            "compat": "97% Compatibility",
            "img": "../IMAGES/ai_matches/match_19_riya.jpg",
            "bio": "Detail-oriented finance specialist seeking a warm, supportive partner with shared family values."
        },
        {
            "id": "20",
            "name": "Farhan Qureshi",
            "job": "Orthopedic Surgeon (MS)",
            "age": 31,
            "height": "5'9\"",
            "city": "Delhi",
            "religion": "Muslim (Syed)",
            "diet": "Non-Vegetarian",
            "edu": "MBBS, MS (Orthopedics)",
            "compat": "90% Match",
            "img": "../IMAGES/ai_matches/match_20_farhan.jpg",
            "bio": "Surgeon dedicated to patient care. Loves outdoor sports, family dinners, and calm evenings."
        },
        {
            "id": "21",
            "name": "Simran Sandhu",
            "job": "ML & Robotics Engineer",
            "age": 26,
            "height": "5'7\"",
            "city": "Chandigarh",
            "religion": "Sikh (Sandhu)",
            "diet": "Vegetarian",
            "edu": "B.Tech / MS (Robotics)",
            "compat": "93% Match",
            "img": "../IMAGES/ai_matches/match_21_simran.jpg",
            "bio": "Driven engineer who loves emerging technology, road trips across Punjab, and baking."
        },
        {
            "id": "22",
            "name": "Devendra Shekhawat",
            "job": "Brand Strategy Lead",
            "age": 28,
            "height": "6'1\"",
            "city": "Jaipur",
            "religion": "Hindu (Rajput)",
            "diet": "Vegetarian",
            "edu": "MBA (Marketing)",
            "compat": "94% Compatibility",
            "img": "../IMAGES/ai_matches/match_22_devendra.jpg",
            "bio": "Marketing strategist with deep cultural roots. Enthusiastic about polo, history, and reading."
        },
        {
            "id": "23",
            "name": "Natasha D'Souza",
            "job": "Creative Copy Director",
            "age": 27,
            "height": "5'5\"",
            "city": "Mumbai",
            "religion": "Christian (Catholic)",
            "diet": "Non-Vegetarian",
            "edu": "Design & Architecture",
            "compat": "89% Match",
            "img": "../IMAGES/ai_matches/match_23_natasha.jpg",
            "bio": "Storyteller and creative thinker. Loves live theater, beach runs, and good coffee."
        },
        {
            "id": "24",
            "name": "Varun Kulkarni",
            "job": "Quantum Computing Lead",
            "age": 32,
            "height": "5'10\"",
            "city": "Pune",
            "religion": "Hindu (Brahmin)",
            "diet": "Vegetarian",
            "edu": "B.Tech + Ph.D",
            "compat": "91% Match",
            "img": "../IMAGES/ai_matches/match_24_varun.jpg",
            "bio": "Deep tech enthusiast who values intellectual conversations, nature walks, and classical arts."
        },
        {
            "id": "25",
            "name": "Ishita Banerjee",
            "job": "Radiologist & Consultant (MD)",
            "age": 28,
            "height": "5'4\"",
            "city": "Bengaluru",
            "religion": "Hindu (Brahmin)",
            "diet": "Non-Vegetarian",
            "edu": "MBBS, MD (Radiology)",
            "compat": "96% Compatibility",
            "img": "../IMAGES/ai_matches/match_25_ishita.jpg",
            "bio": "Medical professional with a passion for literature, watercolor painting, and tranquil weekends."
        },
        {
            "id": "26",
            "name": "Amanpreet Dhillon",
            "job": "Vice President - Operations",
            "age": 29,
            "height": "6'0\"",
            "city": "Delhi",
            "religion": "Sikh (Dhillon)",
            "diet": "Non-Vegetarian",
            "edu": "B.Tech + MBA",
            "compat": "92% Match",
            "img": "../IMAGES/ai_matches/match_26_amanpreet.jpg",
            "bio": "Corporate operations leader who believes in balance, high energy, fitness, and family time."
        },
        {
            "id": "27",
            "name": "Kavya Madhavan",
            "job": "Lead Data Scientist",
            "age": 25,
            "height": "5'6\"",
            "city": "Hyderabad",
            "religion": "Hindu (Iyer)",
            "diet": "Vegetarian",
            "edu": "B.Tech / MS (Data Science)",
            "compat": "97% Compatibility",
            "img": "../IMAGES/ai_matches/match_27_kavya.jpg",
            "bio": "Data enthusiast with a love for Carnatic music, astronomy, and meaningful conversations."
        },
        {
            "id": "28",
            "name": "Neil Mathur",
            "job": "Cyber Security Specialist",
            "age": 27,
            "height": "5'11\"",
            "city": "Gurugram",
            "religion": "Hindu (Kayastha)",
            "diet": "Non-Vegetarian",
            "edu": "B.Tech (CSE) / MS",
            "compat": "95% Compatibility",
            "img": "../IMAGES/ai_matches/match_28_neil.jpg",
            "bio": "Cyber security consultant looking for an honest, optimistic partner with a kind heart."
        },
        {
            "id": "29",
            "name": "Fatima Siddiqui",
            "job": "Sustainable Urban Planner",
            "age": 26,
            "height": "5'5\"",
            "city": "Hyderabad",
            "religion": "Muslim (Sunni)",
            "diet": "Non-Vegetarian",
            "edu": "B.Arch / Urban Design",
            "compat": "92% Match",
            "img": "../IMAGES/ai_matches/match_29_fatima.jpg",
            "bio": "Passionate about green architecture, cultural heritage, and warm family gatherings."
        },
        {
            "id": "30",
            "name": "Karthik Sundaram",
            "job": "Embedded Systems Architect",
            "age": 30,
            "height": "5'10\"",
            "city": "Bengaluru",
            "religion": "Hindu (Iyengar)",
            "diet": "Vegetarian",
            "edu": "B.Tech (ECE) / M.Tech",
            "compat": "94% Compatibility",
            "img": "../IMAGES/ai_matches/match_30_karthik.jpg",
            "bio": "Hardware architect with a grounded lifestyle, love for badminton, and positive attitude."
        },
        {
            "id": "31",
            "name": "Pooja Hegde",
            "job": "Global Talent Acquisition Head",
            "age": 27,
            "height": "5'6\"",
            "city": "Mumbai",
            "religion": "Hindu (Bunt)",
            "diet": "Non-Vegetarian",
            "edu": "MBA (HR)",
            "compat": "93% Match",
            "img": "../IMAGES/ai_matches/match_31_pooja.jpg",
            "bio": "People-first leader who enjoys weekend tennis, theater, and good food with friends."
        },
        {
            "id": "32",
            "name": "Manpreet Ahluwalia",
            "job": "Full Stack Engineering Manager",
            "age": 28,
            "height": "5'11\"",
            "city": "Chandigarh",
            "religion": "Sikh (Ahluwalia)",
            "diet": "Vegetarian",
            "edu": "B.Tech / MS (Tech)",
            "compat": "91% Match",
            "img": "../IMAGES/ai_matches/match_32_manpreet.jpg",
            "bio": "Tech manager who values integrity, spontaneous weekend drives, and hearty laughter."
        },
        {
            "id": "33",
            "name": "Shreya Goswami",
            "job": "Clinical Psychologist",
            "age": 25,
            "height": "5'4\"",
            "city": "Delhi",
            "religion": "Hindu (Brahmin)",
            "diet": "Vegetarian",
            "edu": "M.Sc (Psychology)",
            "compat": "98% Compatibility",
            "img": "../IMAGES/ai_matches/match_33_shreya.jpg",
            "bio": "Compassionate mental health advocate who loves reading, mindful living, and gentle nature."
        },
        {
            "id": "34",
            "name": "Tarun Bhatia",
            "job": "Head of Portfolio Management",
            "age": 29,
            "height": "5'9\"",
            "city": "Gurugram",
            "religion": "Hindu (Khatri)",
            "diet": "Non-Vegetarian",
            "edu": "CA / CFA / Finance",
            "compat": "95% Compatibility",
            "img": "../IMAGES/ai_matches/match_34_tarun.jpg",
            "bio": "Finance leader who enjoys marathon training, financial markets, and quality family time."
        },
        {
            "id": "35",
            "name": "Alisha Mathew",
            "job": "Senior UX Design Specialist",
            "age": 26,
            "height": "5'5\"",
            "city": "Bengaluru",
            "religion": "Christian (Catholic)",
            "diet": "Non-Vegetarian",
            "edu": "Design & Architecture",
            "compat": "94% Compatibility",
            "img": "../IMAGES/ai_matches/match_35_alisha.jpg",
            "bio": "Design thinker focused on digital experiences, live music events, and creative cooking."
        },
        {
            "id": "36",
            "name": "Pranav Chawla",
            "job": "Growth Marketing Director",
            "age": 31,
            "height": "6'0\"",
            "city": "Delhi",
            "religion": "Hindu (Arora)",
            "diet": "Vegetarian",
            "edu": "MBA (Marketing)",
            "compat": "90% Match",
            "img": "../IMAGES/ai_matches/match_36_pranav.jpg",
            "bio": "Strategic growth leader who enjoys podcasts, squash, and building long-lasting memories."
        },
        {
            "id": "37",
            "name": "Dr. Suniti Saxena",
            "job": "Consultant Dermatologist (MD)",
            "age": 29,
            "height": "5'6\"",
            "city": "Jaipur",
            "religion": "Hindu (Kayastha)",
            "diet": "Vegetarian",
            "edu": "MBBS, MD (Dermatology)",
            "compat": "96% Compatibility",
            "img": "../IMAGES/ai_matches/match_37_suniti.jpg",
            "bio": "Skin specialist with a cheerful demeanor, interest in pottery, and belief in mutual respect."
        },
        {
            "id": "38",
            "name": "Ayush Agarwal",
            "job": "Blockchain & Web3 Architect",
            "age": 26,
            "height": "5'10\"",
            "city": "Gurugram",
            "religion": "Hindu (Agarwal)",
            "diet": "Vegetarian",
            "edu": "B.Tech / MS (CSE)",
            "compat": "93% Match",
            "img": "../IMAGES/ai_matches/match_38_ayush.jpg",
            "bio": "Next-gen tech builder who enjoys sci-fi novels, mountain trekking, and table tennis."
        },
        {
            "id": "39",
            "name": "Navneet Chahal",
            "job": "Nutrition & Wellness Consultant",
            "age": 27,
            "height": "5'8\"",
            "city": "Chandigarh",
            "religion": "Sikh (Chahal)",
            "diet": "Vegetarian",
            "edu": "M.Sc (Nutrition) / MBA",
            "compat": "95% Compatibility",
            "img": "../IMAGES/ai_matches/match_39_navneet.jpg",
            "bio": "Wellness coach who prioritizes holistic health, warm family ties, and scenic road trips."
        },
        {
            "id": "40",
            "name": "Sameer Merchant",
            "job": "Global Supply Chain Director",
            "age": 30,
            "height": "5'11\"",
            "city": "Mumbai",
            "religion": "Muslim (Sunni)",
            "diet": "Non-Vegetarian",
            "edu": "MBA (Global Business)",
            "compat": "89% Match",
            "img": "../IMAGES/ai_matches/match_40_sameer.jpg",
            "bio": "Logistics specialist with global experience. Enjoys deep sea diving, jazz, and good humor."
        },
        {
            "id": "41",
            "name": "Bhavya Trivedi",
            "job": "iOS Systems Engineer",
            "age": 25,
            "height": "5'4\"",
            "city": "Pune",
            "religion": "Hindu (Brahmin)",
            "diet": "Vegetarian",
            "edu": "B.Tech (CSE) / MS",
            "compat": "97% Compatibility",
            "img": "../IMAGES/ai_matches/match_41_bhavya.jpg",
            "bio": "Mobile engineer who enjoys DIY home decor, classical piano, and weekend hiking trails."
        },
        {
            "id": "42",
            "name": "Kevin Philip",
            "job": "Staff Cloud Infrastructure Engineer",
            "age": 28,
            "height": "5'10\"",
            "city": "Mumbai",
            "religion": "Christian (Catholic)",
            "diet": "Non-Vegetarian",
            "edu": "B.Tech / MS (Tech)",
            "compat": "92% Match",
            "img": "../IMAGES/ai_matches/match_42_kevin.jpg",
            "bio": "Cloud engineer passionate about gaming, acoustic guitar, and meaningful family traditions."
        },
        {
            "id": "43",
            "name": "Radhika Somani",
            "job": "Private Equity Associate",
            "age": 28,
            "height": "5'5\"",
            "city": "Jaipur",
            "religion": "Hindu (Maheshwari)",
            "diet": "Vegetarian",
            "edu": "CA / Finance",
            "compat": "94% Compatibility",
            "img": "../IMAGES/ai_matches/match_43_radhika.jpg",
            "bio": "Rankholder CA working in PE. Values cultural heritage, honesty, and peaceful living."
        },
        {
            "id": "44",
            "name": "Ishan Varma",
            "job": "General & Laparoscopic Surgeon",
            "age": 29,
            "height": "6'1\"",
            "city": "Hyderabad",
            "religion": "Hindu (Kshatriya)",
            "diet": "Non-Vegetarian",
            "edu": "MBBS, MS (Surgery)",
            "compat": "96% Compatibility",
            "img": "../IMAGES/ai_matches/match_44_ishan.jpg",
            "bio": "Surgeon dedicated to service. Loves badminton, wildlife photography, and lighthearted talks."
        },
        {
            "id": "45",
            "name": "Tanya Grover",
            "job": "Luxury Fashion Brand Stylist",
            "age": 26,
            "height": "5'6\"",
            "city": "Delhi",
            "religion": "Hindu (Arora)",
            "diet": "Vegetarian",
            "edu": "Design & Architecture",
            "compat": "93% Match",
            "img": "../IMAGES/ai_matches/match_45_tanya.jpg",
            "bio": "Fashion consultant with a cheerful personality. Loves art exhibitions and weekend baking."
        },
        {
            "id": "46",
            "name": "Dhruv Pillai",
            "job": "Product Lead - Fintech",
            "age": 27,
            "height": "5'10\"",
            "city": "Bengaluru",
            "religion": "Hindu (Pillai)",
            "diet": "Non-Vegetarian",
            "edu": "B.Tech + MBA",
            "compat": "95% Compatibility",
            "img": "../IMAGES/ai_matches/match_46_dhruv.jpg",
            "bio": "Fintech innovator who loves tech gadgets, football weekends, and genuine conversations."
        },
        {
            "id": "47",
            "name": "Sanjana Reddy",
            "job": "Landscape & Sustainable Architect",
            "age": 27,
            "height": "5'7\"",
            "city": "Hyderabad",
            "religion": "Hindu (Reddy)",
            "diet": "Non-Vegetarian",
            "edu": "B.Arch / Urban Design",
            "compat": "91% Match",
            "img": "../IMAGES/ai_matches/match_47_sanjana.jpg",
            "bio": "Eco-architect who loves garden landscaping, organic cooking, and exploring historic forts."
        },
        {
            "id": "48",
            "name": "Neha Kapoor",
            "job": "Digital Transformation Consultant",
            "age": 26,
            "height": "5'5\"",
            "city": "Gurugram",
            "religion": "Hindu (Khatri)",
            "diet": "Vegetarian",
            "edu": "B.Tech + MBA",
            "compat": "98% Compatibility",
            "img": "../IMAGES/ai_matches/match_48_neha.jpg",
            "bio": "Consultant who believes in positivity, strong values, weekend book clubs, and family harmony."
        }
    ];


    // Render Dashboard UI Elements
    const renderDashboard = () => {
        const isDashboardPage = window.location.href.toLowerCase().includes("dashboard.html");
        if (!isDashboardPage) return;
        if (!isLoggedIn) return;

        const profile = getUserProfile();
        updateAllCompatibilityScores();
        const shortlistedIds = getStoredArray("soulNestShortlist");
        const interestsIds = getStoredArray("soulNestInterests");

        // Calculate dynamic profile completion strength and checklist
        const checklistItems = [
            { label: "Basic Details & Age", done: !!(profile.name && profile.gender && (profile.age || profile.dob)) },
            { label: "Education & Profession", done: !!(profile.edu && profile.job) },
            { label: "Height & Mother Tongue", done: !!(profile.height && profile.mothertongue) },
            { label: "Religion & Community", done: !!(profile.religion && (profile.caste || profile.gothra)) },
            { label: "City & Diet / Lifestyle", done: !!(profile.city && profile.diet) },
            { label: "Personal Bio & Hobbies", done: !!(profile.bio && profile.hobbies) }
        ];

        const completedSections = checklistItems.filter(c => c.done).length;
        const strengthPercent = Math.min(100, Math.max(15, Math.round((completedSections / checklistItems.length) * 100)));

        const strengthEl = document.getElementById("dash-strength-percent");
        const progressFill = document.getElementById("dash-progress-fill");
        const strengthTip = document.querySelector(".strength-tip");
        if (strengthEl) strengthEl.textContent = `${strengthPercent}%`;
        if (progressFill) progressFill.style.width = `${strengthPercent}%`;
        if (strengthTip) {
            strengthTip.textContent = strengthPercent >= 80
                ? "Your profile is complete & verified! High visibility active."
                : "Fill in your personal details to increase match recommendations!";
        }

        // Top Alert Banner
        const alertBanner = document.getElementById("profile-complete-alert-banner");
        const bannerPercent = document.getElementById("dash-banner-percent");
        if (alertBanner) {
            if (strengthPercent < 100) {
                alertBanner.style.display = "flex";
                if (bannerPercent) bannerPercent.textContent = `${strengthPercent}%`;
            } else {
                alertBanner.style.display = "none";
            }
        }

        // Priority "Complete Your Profile" Prompt Modal Trigger (Only when < 70% completed)
        const promptModal = document.getElementById("complete-profile-prompt-modal");
        const mustShowPrompt = localStorage.getItem("soulNestShowCompleteProfilePopup") === "true";
        const isDismissedThisSession = sessionStorage.getItem("soulNestProfilePromptDismissed") === "true";

        // ONLY trigger popup if completion is strictly LESS THAN 70% and not dismissed
        if (promptModal && strengthPercent < 70 && (mustShowPrompt || !isDismissedThisSession)) {
            const percentEl = document.getElementById("complete-prompt-percent");
            const barFill = document.getElementById("complete-prompt-bar");
            const checklistGrid = document.getElementById("complete-checklist-grid");

            if (percentEl) percentEl.textContent = `${strengthPercent}% Completed`;
            if (barFill) barFill.style.width = `${strengthPercent}%`;

            if (checklistGrid) {
                checklistGrid.innerHTML = checklistItems.map(item => `
                    <div class="complete-check-item ${item.done ? 'done' : 'missing'}">
                        <span class="complete-check-icon">${item.done ? '✓' : '!'}</span>
                        <span>${item.label}</span>
                    </div>
                `).join("");
            }

            setTimeout(() => {
                promptModal.classList.add("show");
            }, 300);

            localStorage.removeItem("soulNestShowCompleteProfilePopup");
        } else {
            // If 70% or more, ensure flag is cleared and modal stays closed
            localStorage.removeItem("soulNestShowCompleteProfilePopup");
            if (promptModal) promptModal.classList.remove("show");
        }

        // Banner Elements
        const dashName = document.getElementById("dash-user-name");
        const dashJob = document.getElementById("dash-job");
        const dashCity = document.getElementById("dash-city");
        const dashBio = document.getElementById("dash-bio");
        const dashAvatar = document.getElementById("dash-avatar-img");
        const dashPillAge = document.getElementById("dash-pill-age");
        const dashPillReligion = document.getElementById("dash-pill-religion");
        const dashPillEdu = document.getElementById("dash-pill-edu");
        const dashPillDiet = document.getElementById("dash-pill-diet");

        if (dashName) dashName.textContent = profile.name || "Welcome, Member";
        if (dashJob) dashJob.textContent = profile.job || "Add Profession";
        if (dashCity) dashCity.textContent = profile.city || "Add City";
        if (dashBio) dashBio.textContent = profile.bio ? `"${profile.bio}"` : "No bio added yet. Click 'Edit Profile' to add your bio.";
        if (dashAvatar && profile.avatar) dashAvatar.src = profile.avatar;
        if (dashPillAge) dashPillAge.textContent = profile.age || profile.height ? `${profile.age ? profile.age + " Yrs" : ""}${profile.height ? " • " + profile.height : ""}` : "Add Age & Height";
        if (dashPillReligion) dashPillReligion.textContent = profile.religion ? `${profile.religion}${profile.caste ? " (" + profile.caste + ")" : ""}` : "Add Religion";
        if (dashPillEdu) dashPillEdu.textContent = profile.edu && profile.edu.trim().length > 0 ? profile.edu : "Add Education";
        if (dashPillDiet) dashPillDiet.textContent = profile.diet && profile.diet.trim().length > 0 ? profile.diet : "Add Diet";
        // Helper to format Date of Birth
        const formatDOB = (dobStr) => {
            if (!dobStr) return "";
            try {
                const parts = dobStr.split("-");
                if (parts.length === 3) {
                    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                    return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
                }
                const d = new Date(dobStr);
                return isNaN(d.getTime()) ? dobStr : d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
            } catch (e) {
                return dobStr;
            }
        };

        const dobFormatted = formatDOB(profile.dob);

        // Overview Tab Detail Fields
        const dispFullName = document.getElementById("disp-fullname");
        const dispGender = document.getElementById("disp-gender");
        const dispAgeDob = document.getElementById("disp-age-dob");
        const dispHeight = document.getElementById("disp-height");
        const dispMarital = document.getElementById("disp-marital");
        const dispMotherTongue = document.getElementById("disp-mothertongue");
        const dispReligion = document.getElementById("disp-religion");
        const dispCaste = document.getElementById("disp-caste");
        const dispGothra = document.getElementById("disp-gothra");
        const dispManglik = document.getElementById("disp-manglik");
        const dispEdu = document.getElementById("disp-edu");
        const dispProfession = document.getElementById("disp-profession");
        const dispCity = document.getElementById("disp-city");
        const dispDiet = document.getElementById("disp-diet");
        const dispBioFull = document.getElementById("disp-bio-full");

        if (dispFullName) dispFullName.textContent = profile.name || "Not specified";
        if (dispGender) dispGender.textContent = profile.gender || "Not specified";
        if (dispAgeDob) {
            if (profile.age && dobFormatted) {
                dispAgeDob.textContent = `${profile.age} Years (${dobFormatted})`;
            } else if (profile.age) {
                dispAgeDob.textContent = `${profile.age} Years`;
            } else if (dobFormatted) {
                dispAgeDob.textContent = dobFormatted;
            } else {
                dispAgeDob.textContent = "Not specified";
            }
        }
        if (dispHeight) dispHeight.textContent = profile.height || "Not specified";
        if (dispMarital) dispMarital.textContent = profile.marital || "Not specified";
        if (dispMotherTongue) dispMotherTongue.textContent = profile.mothertongue || "Not specified";
        if (dispReligion) dispReligion.textContent = profile.religion || "Not specified";
        if (dispCaste) dispCaste.textContent = profile.caste || "Not specified";
        if (dispGothra) dispGothra.textContent = profile.gothra || "Not specified";
        if (dispManglik) dispManglik.textContent = profile.manglik || "Not specified";
        if (dispEdu) dispEdu.textContent = profile.edu || "Not specified";
        if (dispProfession) dispProfession.textContent = profile.job || "Not specified";
        if (dispCity) dispCity.textContent = profile.city || "Not specified";
        if (dispDiet) dispDiet.textContent = profile.diet || "Not specified";
        if (dispBioFull) dispBioFull.textContent = profile.bio ? `"${profile.bio}"` : "Not specified";

        // Render Hobbies & Interests Tags
        const dispHobbies = document.getElementById("disp-hobbies");
        if (dispHobbies) {
            if (profile.hobbies && profile.hobbies.trim().length > 0) {
                const hobbiesList = profile.hobbies.split(",").map(h => h.trim()).filter(Boolean);
                if (hobbiesList.length > 0) {
                    dispHobbies.innerHTML = hobbiesList.map(h => `<span class="hobby-tag">${escapeHtml(h)}</span>`).join(" ");
                } else {
                    dispHobbies.innerHTML = `<span style="color: #888; font-size: 14px; font-style: italic;">No hobbies added yet. Click 'Edit Profile' to add your hobbies and passions.</span>`;
                }
            } else {
                dispHobbies.innerHTML = `<span style="color: #888; font-size: 14px; font-style: italic;">No hobbies added yet. Click 'Edit Profile' to add your hobbies and passions.</span>`;
            }
        }

        // Stats Counters
        const statShortlistCount = document.getElementById("dash-stat-shortlist-count");
        const statInterestsCount = document.getElementById("dash-stat-interests-count");
        const tabShortlistBadge = document.getElementById("tab-shortlist-count-badge");
        const tabInterestsBadge = document.getElementById("tab-interests-count-badge");

        if (statShortlistCount) statShortlistCount.textContent = shortlistedIds.length;
        if (statInterestsCount) statInterestsCount.textContent = interestsIds.length;
        if (tabShortlistBadge) tabShortlistBadge.textContent = shortlistedIds.length;
        if (tabInterestsBadge) tabInterestsBadge.textContent = interestsIds.length;

        // Render Shortlisted Candidates Grid
        const shortlistContainer = document.getElementById("dash-shortlist-container");
        const shortlistEmpty = document.getElementById("dash-shortlist-empty");

        if (shortlistContainer) {
            shortlistContainer.innerHTML = "";
            const shortlistedCandidates = SOULNEST_CANDIDATES.filter(c => shortlistedIds.includes(c.id));

            if (shortlistedCandidates.length === 0) {
                if (shortlistEmpty) shortlistEmpty.style.display = "block";
            } else {
                if (shortlistEmpty) shortlistEmpty.style.display = "none";
                shortlistedCandidates.forEach(cand => {
                    const card = document.createElement("div");
                    card.className = "dash-shortlist-card";
                    const isInterested = interestsIds.includes(cand.id);

                    card.innerHTML = `
                        <img src="${cand.img}" class="dash-shortlist-avatar" alt="${cand.name}">
                        <h4>${cand.name}</h4>
                        <p class="dash-shortlist-meta">${cand.job} • ${cand.age} Yrs</p>
                        <p style="font-size: 13px; color: #555; margin-bottom: 15px;">${cand.city} • ${cand.religion}</p>
                        <div class="dash-shortlist-actions">
                            <button class="btn dash-btn-interest ${isInterested ? 'sent' : ''}" data-id="${cand.id}" style="${isInterested ? 'background: #2ec4b6;' : ''}">
                                ${isInterested ? '✓ Interest Sent' : 'Connect'}
                            </button>
                            <button class="btn-secondary dash-btn-view" data-id="${cand.id}">
                                View Details
                            </button>
                            <button class="btn-secondary dash-btn-remove" data-id="${cand.id}" title="Remove from shortlist" style="color: #dc3545; border-color: #f8d7da;">
                                ✕
                            </button>
                        </div>
                    `;

                    // Connect button
                    card.querySelector(".dash-btn-interest").addEventListener("click", () => {
                        let interests = getStoredArray("soulNestInterests");
                        if (interests.includes(cand.id)) {
                            interests = interests.filter(id => id !== cand.id);
                            setStoredArray("soulNestInterests", interests);
                            showToast("Cancelled interest request.", "info");
                        } else {
                            interests.push(cand.id);
                            setStoredArray("soulNestInterests", interests);
                            showToast(`Express Interest sent to ${cand.name}!`, "success");
                        }
                        renderDashboard();
                    });

                    // View details button (opens modal)
                    card.querySelector(".dash-btn-view").addEventListener("click", () => {
                        const modal = document.getElementById("profile-modal");
                        if (modal) {
                            currentModalCardId = cand.id;
                            document.getElementById("modal-name").textContent = cand.name;
                            document.getElementById("modal-job").textContent = cand.job;
                            document.getElementById("modal-img").src = cand.img;
                            document.getElementById("modal-badge").textContent = cand.compat;
                            document.getElementById("modal-age-height").textContent = `${cand.age} Years • ${cand.height}`;
                            document.getElementById("modal-city").textContent = `${cand.city}, India`;
                            document.getElementById("modal-religion").textContent = cand.religion;
                            document.getElementById("modal-diet").textContent = `${cand.diet} • Non-Smoker`;
                            document.getElementById("modal-bio").textContent = `"${cand.bio}"`;

                            const modalShortlist = document.getElementById("modal-shortlist-action");
                            const modalConnect = document.getElementById("modal-connect-action");
                            if (modalShortlist) {
                                modalShortlist.classList.add("saved");
                                modalShortlist.textContent = "♥ Shortlisted";
                            }
                            if (modalConnect) {
                                if (interestsIds.includes(cand.id)) {
                                    modalConnect.textContent = "✓ Interest Sent";
                                    modalConnect.style.background = "#2ec4b6";
                                } else {
                                    modalConnect.textContent = "Send Express Interest";
                                    modalConnect.style.background = "";
                                }
                            }
                            modal.classList.add("show");
                        }
                    });

                    // Remove button
                    card.querySelector(".dash-btn-remove").addEventListener("click", () => {
                        let shortList = getStoredArray("soulNestShortlist");
                        shortList = shortList.filter(id => id !== cand.id);
                        setStoredArray("soulNestShortlist", shortList);
                        showToast(`Removed ${cand.name} from shortlist.`, "info");
                        renderDashboard();
                    });

                    shortlistContainer.appendChild(card);
                });
            }
        }

        // Render Sent Interests Timeline
        const interestsContainer = document.getElementById("dash-interests-container");
        const interestsEmpty = document.getElementById("dash-interests-empty");

        if (interestsContainer) {
            interestsContainer.innerHTML = "";
            const interestedCandidates = SOULNEST_CANDIDATES.filter(c => interestsIds.includes(c.id));

            if (interestedCandidates.length === 0) {
                if (interestsEmpty) interestsEmpty.style.display = "block";
            } else {
                if (interestsEmpty) interestsEmpty.style.display = "none";
                interestedCandidates.forEach(cand => {
                    const row = document.createElement("div");
                    row.className = "interest-row";
                    row.innerHTML = `
                        <div class="interest-candidate-info">
                            <img src="${cand.img}" alt="${cand.name}">
                            <div class="interest-candidate-text">
                                <h4>${cand.name}</h4>
                                <p>${cand.job} • ${cand.city} • ${cand.compat}</p>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <span class="interest-status-pill sent">✓ Interest Sent • Pending</span>
                            <button class="btn-secondary btn-cancel-interest" style="font-size: 12px; padding: 6px 14px; border-radius: 20px;">Cancel</button>
                        </div>
                    `;

                    row.querySelector(".btn-cancel-interest").addEventListener("click", () => {
                        let interests = getStoredArray("soulNestInterests");
                        interests = interests.filter(id => id !== cand.id);
                        setStoredArray("soulNestInterests", interests);
                        showToast(`Cancelled interest request for ${cand.name}.`, "info");
                        renderDashboard();
                    });

                    interestsContainer.appendChild(row);
                });
            }
        }
    };

    // Dashboard Tabs Switching
    const dashTabs = document.querySelectorAll(".dash-tab");
    const dashPanes = document.querySelectorAll(".dash-pane");

    const switchDashTab = (targetTab) => {
        dashTabs.forEach(t => {
            if (t.getAttribute("data-tab") === targetTab) {
                t.classList.add("active");
            } else {
                t.classList.remove("active");
            }
        });

        dashPanes.forEach(p => {
            if (p.id === `pane-${targetTab}`) {
                p.classList.add("active");
            } else {
                p.classList.remove("active");
            }
        });
    };

    dashTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const target = tab.getAttribute("data-tab");
            switchDashTab(target);
        });
    });

    const statBoxShortlist = document.getElementById("stat-box-shortlist");
    if (statBoxShortlist) {
        statBoxShortlist.addEventListener("click", () => switchDashTab("shortlist"));
    }

    const statBoxInterests = document.getElementById("stat-box-interests");
    if (statBoxInterests) {
        statBoxInterests.addEventListener("click", () => switchDashTab("interests"));
    }

    // Edit Profile Modal Handling
    const editModal = document.getElementById("edit-profile-modal");
    const editForm = document.getElementById("edit-profile-form");
    const openEditBtn = document.getElementById("btn-open-edit-modal");
    const closeEditBtn = document.getElementById("edit-modal-close");
    const cancelEditBtn = document.getElementById("edit-modal-cancel");

    const populateEditForm = () => {
        const profile = getUserProfile();
        const inputName = document.getElementById("input-edit-name");
        const inputGender = document.getElementById("input-edit-gender");
        const inputDob = document.getElementById("input-edit-dob");
        const inputAge = document.getElementById("input-edit-age");
        const inputHeight = document.getElementById("input-edit-height");
        const inputMarital = document.getElementById("input-edit-marital");
        const inputMotherTongue = document.getElementById("input-edit-mothertongue");
        const inputReligion = document.getElementById("input-edit-religion");
        const inputCaste = document.getElementById("input-edit-caste");
        const inputGothra = document.getElementById("input-edit-gothra");
        const inputManglik = document.getElementById("input-edit-manglik");
        const inputEdu = document.getElementById("input-edit-edu");
        const inputJob = document.getElementById("input-edit-job");
        const inputCity = document.getElementById("input-edit-city");
        const inputDiet = document.getElementById("input-edit-diet");
        const inputBio = document.getElementById("input-edit-bio");
        const inputHobbies = document.getElementById("input-edit-hobbies");

        if (inputName) inputName.value = profile.name || "";
        if (inputGender) inputGender.value = profile.gender || "Male";
        if (inputDob) inputDob.value = profile.dob || "";
        if (inputAge) inputAge.value = profile.age || "";
        if (inputHeight) inputHeight.value = profile.height || "";
        if (inputMarital) inputMarital.value = profile.marital || "Never Married";
        if (inputMotherTongue) inputMotherTongue.value = profile.mothertongue || "";
        if (inputReligion) inputReligion.value = profile.religion || "Hindu";
        if (inputCaste) inputCaste.value = profile.caste || "";
        if (inputGothra) inputGothra.value = profile.gothra || "";
        if (inputManglik) inputManglik.value = profile.manglik || "Non-Manglik";
        if (inputEdu) inputEdu.value = profile.edu || "";
        if (inputJob) inputJob.value = profile.job || "";
        if (inputCity) inputCity.value = profile.city || "";
        if (inputDiet) inputDiet.value = profile.diet || "Vegetarian";
        if (inputBio) inputBio.value = profile.bio || "";
        if (inputHobbies) inputHobbies.value = profile.hobbies || "";
    };

    // Auto-calculate Age on DOB change in Edit Modal
    const inputEditDob = document.getElementById("input-edit-dob");
    const inputEditAge = document.getElementById("input-edit-age");
    if (inputEditDob && inputEditAge) {
        inputEditDob.addEventListener("change", () => {
            if (inputEditDob.value) {
                const parts = inputEditDob.value.split("-");
                if (parts.length === 3) {
                    const birthYear = parseInt(parts[0]);
                    const birthMonth = parseInt(parts[1]) - 1;
                    const birthDay = parseInt(parts[2]);
                    const today = new Date();
                    let age = today.getFullYear() - birthYear;
                    const m = today.getMonth() - birthMonth;
                    if (m < 0 || (m === 0 && today.getDate() < birthDay)) {
                        age--;
                    }
                    if (age > 0) inputEditAge.value = age;
                }
            }
        });
    }

    const openEditModal = () => {
        if (!editModal) return;
        populateEditForm();
        editModal.classList.add("show");
    };

    const closeEditModal = () => {
        if (editModal) editModal.classList.remove("show");
    };

    if (openEditBtn) openEditBtn.addEventListener("click", openEditModal);
    if (document.getElementById("btn-edit-basic")) document.getElementById("btn-edit-basic").addEventListener("click", openEditModal);
    if (document.getElementById("btn-edit-religion")) document.getElementById("btn-edit-religion").addEventListener("click", openEditModal);
    if (document.getElementById("btn-edit-career")) document.getElementById("btn-edit-career").addEventListener("click", openEditModal);
    if (document.getElementById("btn-edit-lifestyle")) document.getElementById("btn-edit-lifestyle").addEventListener("click", openEditModal);
    if (document.getElementById("btn-edit-pref")) document.getElementById("btn-edit-pref").addEventListener("click", () => {
        showToast("Partner preferences editing mode active", "info");
        openEditModal();
    });

    if (closeEditBtn) closeEditBtn.addEventListener("click", closeEditModal);
    if (cancelEditBtn) cancelEditBtn.addEventListener("click", closeEditModal);
    if (editModal) {
        editModal.addEventListener("click", (e) => {
            if (e.target === editModal) closeEditModal();
        });
    }

    // Priority "Complete Your Profile" Prompt Modal Handlers
    const completePromptModal = document.getElementById("complete-profile-prompt-modal");
    const completePromptClose = document.getElementById("complete-profile-prompt-close");
    const btnPromptFillNow = document.getElementById("btn-prompt-fill-now");
    const btnPromptFillLater = document.getElementById("btn-prompt-fill-later");
    const btnBannerCompleteProfile = document.getElementById("btn-banner-complete-profile");

    const closeCompletePrompt = () => {
        if (completePromptModal) {
            completePromptModal.classList.remove("show");
            sessionStorage.setItem("soulNestProfilePromptDismissed", "true");
        }
    };

    if (btnPromptFillNow) {
        btnPromptFillNow.addEventListener("click", () => {
            if (completePromptModal) completePromptModal.classList.remove("show");
            openEditModal();
        });
    }

    if (btnBannerCompleteProfile) {
        btnBannerCompleteProfile.addEventListener("click", () => {
            openEditModal();
        });
    }

    if (btnPromptFillLater) {
        btnPromptFillLater.addEventListener("click", closeCompletePrompt);
    }

    if (completePromptClose) {
        completePromptClose.addEventListener("click", closeCompletePrompt);
    }

    if (completePromptModal) {
        completePromptModal.addEventListener("click", (e) => {
            if (e.target === completePromptModal) closeCompletePrompt();
        });
    }

    if (editForm) {
        editForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const profile = getUserProfile();
            profile.name = document.getElementById("input-edit-name").value.trim();
            profile.gender = document.getElementById("input-edit-gender").value;
            profile.dob = document.getElementById("input-edit-dob") ? document.getElementById("input-edit-dob").value : (profile.dob || "");
            profile.age = document.getElementById("input-edit-age").value ? parseInt(document.getElementById("input-edit-age").value) : "";
            profile.height = document.getElementById("input-edit-height").value.trim();
            profile.marital = document.getElementById("input-edit-marital").value;
            profile.mothertongue = document.getElementById("input-edit-mothertongue").value.trim();
            profile.religion = document.getElementById("input-edit-religion").value;
            profile.caste = document.getElementById("input-edit-caste").value.trim();
            profile.gothra = document.getElementById("input-edit-gothra") ? document.getElementById("input-edit-gothra").value.trim() : (profile.gothra || "");
            profile.manglik = document.getElementById("input-edit-manglik") ? document.getElementById("input-edit-manglik").value : (profile.manglik || "");
            profile.edu = document.getElementById("input-edit-edu").value.trim();
            profile.job = document.getElementById("input-edit-job").value.trim();
            profile.city = document.getElementById("input-edit-city").value.trim();
            profile.diet = document.getElementById("input-edit-diet").value;
            profile.bio = document.getElementById("input-edit-bio").value.trim();
            profile.hobbies = document.getElementById("input-edit-hobbies") ? document.getElementById("input-edit-hobbies").value.trim() : (profile.hobbies || "");
            profile.userCustomized = true;

            setUserProfile(profile);
            sessionStorage.setItem("soulNestProfilePromptDismissed", "true");
            closeEditModal();
            renderDashboard();

            updateNavProfilePic();
            showToast("Profile details updated successfully!", "success");
        });
    }

    // Avatar Picker Modal
    const avatarModal = document.getElementById("avatar-modal");
    const openAvatarBtn = document.getElementById("btn-change-avatar");
    const closeAvatarBtn = document.getElementById("avatar-modal-close");
    const presetAvatars = document.querySelectorAll(".preset-avatar");
    const customPhotoUpload = document.getElementById("custom-photo-upload");

    if (openAvatarBtn && avatarModal) {
        openAvatarBtn.addEventListener("click", () => avatarModal.classList.add("show"));
    }
    if (closeAvatarBtn && avatarModal) {
        closeAvatarBtn.addEventListener("click", () => avatarModal.classList.remove("show"));
    }
    if (avatarModal) {
        avatarModal.addEventListener("click", (e) => {
            if (e.target === avatarModal) avatarModal.classList.remove("show");
        });
    }

    presetAvatars.forEach(img => {
        img.addEventListener("click", () => {
            const src = img.getAttribute("data-src");
            const profile = getUserProfile();
            profile.avatar = src;
            setUserProfile(profile);
            if (avatarModal) avatarModal.classList.remove("show");
            renderDashboard();
            showToast("Profile photo updated!", "success");
        });
    });

    if (customPhotoUpload) {
        customPhotoUpload.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                compressImage(file, 400, 400, 0.7, (compressedUrl) => {
                    const profile = getUserProfile();
                    profile.avatar = compressedUrl;
                    setUserProfile(profile);
                    if (avatarModal) avatarModal.classList.remove("show");
                    renderDashboard();
                    showToast("Custom photo uploaded and optimized successfully!", "success");
                });
            }
        });
    }

    // Privacy Form Submission
    const privacyForm = document.getElementById("privacy-settings-form");
    if (privacyForm) {
        privacyForm.addEventListener("submit", (e) => {
            e.preventDefault();
            showToast("Privacy settings saved successfully!", "success");
        });
    }

    // Initialize Dashboard if on dashboard page
    renderDashboard();

    // 9. Form Handlers
    const signupForm = document.querySelector(".signup-form");
    if (signupForm) {
        signupForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = document.getElementById("fullname") ? document.getElementById("fullname").value.trim() : "";
            const emailInput = document.getElementById("email");
            const email = emailInput ? emailInput.value.trim().toLowerCase() : "";
            const passwordInput = document.getElementById("password");
            const confirmInput = document.getElementById("confirm-password");
            const password = passwordInput ? passwordInput.value : "";
            const confirmPassword = confirmInput ? confirmInput.value : "";

            // Check if email already exists
            if (getUserFromDb(email)) {
                showToast("An account with this email already exists. Please sign in.", "error");
                return;
            }

            // Password length validation
            if (!password || password.length < 6) {
                showToast("Password must be at least 6 characters long.", "error");
                return;
            }

            if (password !== confirmPassword) {
                showToast("Passwords do not match. Please verify and try again.", "error");
                return;
            }

            const religion = document.getElementById("religion") ? document.getElementById("religion").value : "";
            const city = document.getElementById("city") ? document.getElementById("city").value.trim() : "";
            const phone = document.getElementById("phone") ? document.getElementById("phone").value.trim() : "";
            const dob = document.getElementById("dob") ? document.getElementById("dob").value : "";
            const genderEl = document.querySelector("input[name='gender']:checked");
            const gender = genderEl ? genderEl.value : "Male";
            const photoInput = document.getElementById("photo");

            // Indian phone number validation
            const cleanPhone = phone.replace(/[\s\-]/g, "");
            if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
                showToast("Please enter a valid 10-digit Indian mobile number (e.g., 9876543210).", "error");
                return;
            }

            // Legal marriage age validation (21 for men, 18 for women)
            if (!dob) {
                showToast("Please select your Date of Birth.", "error");
                return;
            }

            let calculatedAge = "";
            const parts = dob.split("-");
            if (parts.length === 3) {
                const birthYear = parseInt(parts[0]);
                const birthMonth = parseInt(parts[1]) - 1;
                const birthDay = parseInt(parts[2]);
                const today = new Date();
                let age = today.getFullYear() - birthYear;
                const m = today.getMonth() - birthMonth;
                if (m < 0 || (m === 0 && today.getDate() < birthDay)) {
                    age--;
                }
                calculatedAge = age > 0 ? age : "";
            }

            if (!calculatedAge || calculatedAge < 18 || (gender === "Male" && calculatedAge < 21)) {
                showToast("Minimum legal marriage age is 21 for grooms and 18 for brides.", "error");
                return;
            }

            const completeRegistration = (avatarUrl) => {
                const newProfile = {
                    name: name,
                    email: email,
                    password: password,
                    phone: phone,
                    gender: gender,
                    dob: dob,
                    age: calculatedAge || "",
                    height: "",
                    marital: "Never Married",
                    mothertongue: "",
                    religion: religion,
                    caste: "",
                    gothra: "",
                    manglik: "Non-Manglik",
                    edu: "",
                    job: "",
                    city: city,
                    diet: "Vegetarian",
                    bio: "",
                    hobbies: "",
                    avatar: avatarUrl || (gender === "Female" ? "../IMAGES/profile_female1.png" : "../IMAGES/profile_male1.png"),
                    userCustomized: true,
                    shortlist: [],
                    interests: []
                };

                saveUserToDb(email, newProfile);
                localStorage.setItem("soulNestCurrentUserEmail", email);
                localStorage.setItem("soulNestLoggedIn", "true");
                localStorage.setItem("soulNestUser", name);
                localStorage.setItem("soulNestShortlist", JSON.stringify([]));
                localStorage.setItem("soulNestInterests", JSON.stringify([]));
                localStorage.setItem("soulNestShowCompleteProfilePopup", "true");
                setUserProfile(newProfile);

                showToast("Account created successfully! Welcome to SoulNest", "success");
                setTimeout(() => window.location.href = "dashboard.html", 1200);
            };

            if (photoInput && photoInput.files && photoInput.files[0]) {
                compressImage(photoInput.files[0], 400, 400, 0.7, (compressedUrl) => {
                    completeRegistration(compressedUrl);
                });
            } else {
                completeRegistration(gender === "Female" ? "../IMAGES/profile_female1.png" : "../IMAGES/profile_male1.png");
            }
        });
    }

    const signinForm = document.querySelector(".signin-form");
    if (signinForm) {
        signinForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const emailInput = document.getElementById("email");
            const emailVal = emailInput ? emailInput.value.trim().toLowerCase() : "";
            const passwordInput = document.getElementById("password");
            const passwordVal = passwordInput ? passwordInput.value : "";

            let profile = getUserFromDb(emailVal);
            if (!profile) {
                try {
                    const raw = localStorage.getItem("soulNestProfile");
                    if (raw) {
                        const existing = JSON.parse(raw);
                        if (existing && existing.email && existing.email.toLowerCase().trim() === emailVal) {
                            profile = existing;
                        }
                    }
                } catch (e) { }
            }

            // Loophole Fix: Do NOT auto-create account on signin if user does not exist!
            if (!profile) {
                showToast("No account found with this email. Please register first.", "error");
                return;
            }

            // Loophole Fix: Verify password!
            if (profile.password && profile.password !== passwordVal) {
                showToast("Incorrect password. Please verify and try again.", "error");
                return;
            }

            // If account was created in older demo without password, assign it now
            if (!profile.password && passwordVal) {
                profile.password = passwordVal;
                saveUserToDb(emailVal, profile);
            }

            // Restore user specific shortlist and interests
            if (profile.shortlist && Array.isArray(profile.shortlist)) {
                localStorage.setItem("soulNestShortlist", JSON.stringify(profile.shortlist));
            } else {
                localStorage.setItem("soulNestShortlist", JSON.stringify([]));
            }

            if (profile.interests && Array.isArray(profile.interests)) {
                localStorage.setItem("soulNestInterests", JSON.stringify(profile.interests));
            } else {
                localStorage.setItem("soulNestInterests", JSON.stringify([]));
            }

            localStorage.setItem("soulNestCurrentUserEmail", emailVal);
            localStorage.setItem("soulNestLoggedIn", "true");
            localStorage.setItem("soulNestUser", profile.name || "Member");
            localStorage.setItem("soulNestShowCompleteProfilePopup", "true");
            setUserProfile(profile);

            showToast(`Welcome back, ${profile.name ? profile.name.split(" ")[0] : "Member"}!`, "success");
            setTimeout(() => window.location.href = "dashboard.html", 1200);
        });
    }

    const advisorBtn = document.getElementById("btn-advisor-consult");
    if (advisorBtn) {
        advisorBtn.addEventListener("click", () => {
            const inquirySelect = document.getElementById("inquiry-type");
            const subjectInput = document.getElementById("subject");
            const nameInput = document.getElementById("name");
            const contactForm = document.querySelector(".contact-form");

            if (inquirySelect) inquirySelect.value = "advisor";
            if (subjectInput && !subjectInput.value) {
                subjectInput.value = "Request for 1-on-1 Personalized Matchmaking Advisor";
            }
            if (contactForm) {
                contactForm.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            if (nameInput) {
                setTimeout(() => nameInput.focus(), 400);
            }
            showToast("Advisor consultation selected! Please fill in your details below.", "info");
        });
    }

    const contactForm = document.querySelector(".contact-form");
    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = document.getElementById("name") ? document.getElementById("name").value.trim() : "";
            const email = document.getElementById("email") ? document.getElementById("email").value.trim() : "";
            const subject = document.getElementById("subject") ? document.getElementById("subject").value.trim() : "";
            const message = document.getElementById("message") ? document.getElementById("message").value.trim() : "";

            try {
                const inquiries = JSON.parse(localStorage.getItem("soulNestInquiries") || "[]");
                inquiries.push({ name, email, subject, message, date: new Date().toISOString() });
                localStorage.setItem("soulNestInquiries", JSON.stringify(inquiries));
            } catch (err) {}

            showToast("Thank you! Your message has been sent to our relationship team.", "success");
            contactForm.reset();
        });
    }

    // 9. Toast Alert Popup (XSS-Safe)
    function showToast(message, type = "success") {
        let container = document.getElementById("toast-container");
        if (!container) {
            container = document.createElement("div");
            container.id = "toast-container";
            document.body.appendChild(container);
        }

        const toast = document.createElement("div");
        toast.className = `toast ${type}`;

        const iconSpan = document.createElement("span");
        iconSpan.className = "toast-icon";
        iconSpan.textContent = type === "error" ? "✕" : (type === "info" ? "ℹ" : "✓");

        const msgSpan = document.createElement("span");
        msgSpan.className = "toast-message";
        msgSpan.textContent = message;

        toast.appendChild(iconSpan);
        toast.appendChild(msgSpan);
        container.appendChild(toast);

        setTimeout(() => toast.classList.add("show"), 10);
        setTimeout(() => {
            toast.classList.remove("show");
            toast.classList.add("hide");
            setTimeout(() => toast.remove(), 400);
        }, 3200);
    }

    // 10. Logout Confirmation Popup Notification Modal
    const initLogoutConfirmation = () => {
        let modal = document.getElementById("logout-confirm-modal");

        if (!modal) {
            const modalHtml = `
            <div class="logout-confirm-overlay" id="logout-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="logout-confirm-title">
                <div class="logout-confirm-card">
                    <button class="logout-confirm-close" id="logout-confirm-close" aria-label="Close modal">&times;</button>
                    <div class="logout-confirm-icon-wrap">
                        <div class="logout-confirm-icon-pulse"></div>
                        <span class="logout-confirm-icon">👋</span>
                    </div>
                    <h3 id="logout-confirm-title">Are you sure you want to log out?</h3>
                    <p class="logout-confirm-desc">
                        Do you want to log out of SoulNest or stay signed in to continue discovering verified partner matches and updates?
                    </p>
                    <div class="logout-confirm-actions">
                        <button type="button" class="logout-confirm-cancel-btn" id="logout-confirm-stay-btn">
                            Stay Signed In
                        </button>
                        <a href="logout.html" class="logout-confirm-proceed-btn" id="logout-confirm-proceed-btn">
                            Yes, Log Out
                        </a>
                    </div>
                </div>
            </div>`;
            document.body.insertAdjacentHTML("beforeend", modalHtml);
            modal = document.getElementById("logout-confirm-modal");
        }

        const cleanUserSession = () => {
            localStorage.removeItem("soulNestLoggedIn");
            localStorage.removeItem("soulNestCurrentUserEmail");
            localStorage.removeItem("soulNestShortlist");
            localStorage.removeItem("soulNestInterests");
            localStorage.removeItem("soulNestProfile");
            localStorage.removeItem("soulNestUser");
            sessionStorage.removeItem("soulNestProfilePromptDismissed");
        };

        const proceedBtn = document.getElementById("logout-confirm-proceed-btn");
        if (proceedBtn) {
            proceedBtn.addEventListener("click", cleanUserSession);
        }

        const closeLogoutModal = () => {
            if (modal) modal.classList.remove("show");
        };

        const openLogoutModal = (e) => {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            if (modal) modal.classList.add("show");
        };

        const closeBtn = document.getElementById("logout-confirm-close");
        const stayBtn = document.getElementById("logout-confirm-stay-btn");
        if (closeBtn) closeBtn.addEventListener("click", closeLogoutModal);
        if (stayBtn) stayBtn.addEventListener("click", closeLogoutModal);

        if (modal) {
            modal.addEventListener("click", (e) => {
                if (e.target === modal) closeLogoutModal();
            });
        }

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && modal && modal.classList.contains("show")) {
                closeLogoutModal();
            }
        });

        // Delegate click for any logout link or button across the application
        document.addEventListener("click", (e) => {
            const logoutTrigger = e.target.closest('a[href*="logout.html"], .nav-logout-btn, #nav-logout, .btn-logout');
            if (logoutTrigger && logoutTrigger.id !== "logout-confirm-proceed-btn" && !window.location.pathname.toLowerCase().includes("logout.html")) {
                e.preventDefault();
                e.stopPropagation();
                openLogoutModal();
            }
        });
    };

    // 21. Support, Help Center & Legal Document Interactions
    const initSupportPages = () => {
        // Support Tab Switching (privacy.html, terms.html, safety.html)
        const supportTabBtns = document.querySelectorAll(".support-tab-btn");
        const supportTabPanes = document.querySelectorAll(".support-tab-pane");

        supportTabBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                const targetTabId = btn.getAttribute("data-tab");
                if (!targetTabId) return;

                supportTabBtns.forEach(b => b.classList.remove("active"));
                supportTabPanes.forEach(pane => pane.classList.remove("active"));

                btn.classList.add("active");
                const targetPane = document.getElementById(targetTabId);
                if (targetPane) targetPane.classList.add("active");
            });
        });

        // FAQ Accordions (help.html)
        const faqItems = document.querySelectorAll(".faq-item");
        faqItems.forEach(item => {
            const question = item.querySelector(".faq-question");
            if (question) {
                question.addEventListener("click", () => {
                    const isActive = item.classList.contains("active");
                    faqItems.forEach(other => {
                        if (other !== item) other.classList.remove("active");
                    });
                    if (isActive) {
                        item.classList.remove("active");
                    } else {
                        item.classList.add("active");
                    }
                });
            }
        });

        // Category Filter Chips (help.html)
        const helpChips = document.querySelectorAll(".help-chip");
        helpChips.forEach(chip => {
            chip.addEventListener("click", () => {
                const cat = chip.getAttribute("data-cat");
                helpChips.forEach(c => c.classList.remove("active"));
                chip.classList.add("active");

                faqItems.forEach(item => {
                    const itemCat = item.getAttribute("data-category");
                    if (cat === "all" || itemCat === cat) {
                        item.style.display = "block";
                    } else {
                        item.style.display = "none";
                    }
                });
            });
        });

        // Live FAQ Search (help.html)
        const faqSearchInput = document.getElementById("faq-search-input");
        if (faqSearchInput) {
            faqSearchInput.addEventListener("input", (e) => {
                const query = e.target.value.toLowerCase().trim();
                faqItems.forEach(item => {
                    const text = item.textContent.toLowerCase();
                    if (text.includes(query)) {
                        item.style.display = "block";
                        if (query.length > 2) {
                            item.classList.add("active");
                        }
                    } else {
                        item.style.display = "none";
                        item.classList.remove("active");
                    }
                });
            });
        }
    };

    // Global Initializers
    initTheme();
    initPasswordEnhancements();
    updateAllCompatibilityScores();
    initLogoutConfirmation();
    initSupportPages();
});



const app = {
    currentStep: 1,
    totalSteps: 12,
    stepScores: {},          // { 1: 2, 2: 0, ... } — stores numeric score per step (0–4)
    selectedNeeds: new Set(), // for multi-select step 12

    init() {
        const savedScores = localStorage.getItem('neuroguard_stepScores');
        if (savedScores) {
            this.stepScores = JSON.parse(savedScores);
        } else {
            // Init defaults for sliders
            this.stepScores[2] = 2; // Stress slider
            this.stepScores[5] = 2; // Energy slider
        }

        const savedNeeds = localStorage.getItem('neuroguard_needs');
        if (savedNeeds) {
            this.selectedNeeds = new Set(JSON.parse(savedNeeds));
        }

        // On startup, we don't automatically load dashboard data here
        // as navigateTo('dashboard-screen') will trigger loadDashboardData().

        this.updateProgress();
        this.updateStepCounter();
        this.triggerFillAnimations();
        this.initReminders();

        // Splash screen to Auth Screen transition
        if (document.getElementById('splash-screen')) {
            setTimeout(() => {
                const user = localStorage.getItem('neuroguard_user');
                if (user) {
                    const title = document.getElementById('dynamic-greeting');
                    if (title && user !== 'User') title.textContent = "Welcome, " + user.split(" ")[0] + "!";
                    if (typeof this.updateProfileData === 'function') this.updateProfileData();
                    this.navigateTo('dashboard-screen');
                } else {
                    this.navigateTo('auth-screen');
                }
            }, 2500);
        }
    },

    /* Trigger CSS fill animations for all animated-fill elements */
    triggerFillAnimations() {
        document.querySelectorAll('.animated-fill').forEach(el => {
            const target = el.style.getPropertyValue('--fill-width') || el.getAttribute('style')?.match(/--fill-width:\s*([^;]+)/)?.[1];
            if (target) {
                el.style.setProperty('--fill-width', target.trim());
                el.style.width = '0%';
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        el.style.width = target.trim();
                    });
                });
            }
        });
    },

    handleAuth() {
        const name = document.getElementById('reg-name')?.value;
        const phone = document.getElementById('reg-phone')?.value;
        const email = document.getElementById('reg-email')?.value;
        const age = document.getElementById('reg-age')?.value;
        const gender = document.getElementById('reg-gender')?.value;
        const type = document.getElementById('reg-type')?.value;

        if (name) {
            localStorage.setItem('neuroguard_user', name);
            if (phone) localStorage.setItem('neuroguard_phone', phone);
            if (email) localStorage.setItem('neuroguard_email', email);
            if (age) localStorage.setItem('neuroguard_age', age);
            if (gender) localStorage.setItem('neuroguard_gender', gender);
            if (type) localStorage.setItem('neuroguard_type', type);
            
            // Unique ID generation / retrieval
            let userId = localStorage.getItem('neuroguard_userId');
            if (!userId) {
                userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('neuroguard_userId', userId);
            }

            // Sync with Firestore User Collection
            if (window.db && window.firestoreFunctions) {
                const { doc, setDoc, serverTimestamp } = window.firestoreFunctions;
                setDoc(doc(window.db, 'users', userId), {
                    name: name,
                    phone: phone || '',
                    email: email || '',
                    age: age || '',
                    gender: gender || '',
                    type: type || '',
                    timestamp: serverTimestamp()
                }, { merge: true })
                .then(() => console.log('User saved to Firestore successfully'))
                .catch(e => console.error('Error saving user to Firestore:', e));
            }

            const title = document.getElementById('dynamic-greeting');
            if (title) title.textContent = "Welcome, " + name.split(" ")[0] + "!";
        } else {
            localStorage.setItem('neuroguard_user', 'User');
        }
        if (typeof this.updateProfileData === 'function') this.updateProfileData();
        // Go to assessment page on success
        this.navigateTo('assessment-screen');
    },

    updateProfileData() {
        const user = localStorage.getItem('neuroguard_user');
        const email = localStorage.getItem('neuroguard_email');
        if (user && user !== 'User') {
            const initialsEl = document.getElementById('profile-avatar-initials');
            if (initialsEl) initialsEl.textContent = user.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

            const nameEl = document.getElementById('profile-name-display');
            if (nameEl) nameEl.textContent = user;

            const fullEl = document.getElementById('profile-fullname-display');
            if (fullEl) fullEl.textContent = user;
        }
        if (email) {
            const emailEl = document.getElementById('profile-email-display');
            if (emailEl) emailEl.textContent = email;
        }
    },

    logout() {
        localStorage.removeItem('neuroguard_user');
        this.navigateTo('auth-screen');
    },

    switchProfileTab(tabId) {
        document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.profile-tab-content').forEach(c => c.classList.remove('active'));

        const targetBtn = Array.from(document.querySelectorAll('.profile-tab')).find(b => b.getAttribute('onclick')?.includes(tabId));
        if (targetBtn) targetBtn.classList.add('active');

        const targetContent = document.getElementById(`ptab-${tabId}`);
        if (targetContent) targetContent.classList.add('active');

        if (tabId === 'history') {
            this.loadHistory();
        }
    },

    navigateTo(screenId, navElement = null) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

        const target = document.getElementById(screenId);
        if (target) target.classList.add('active');

        const isNavigable = ['dashboard', 'support', 'profile'].some(k => screenId.includes(k));
        if (navElement || isNavigable) {
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            if (navElement) {
                navElement.classList.add('active');
            } else {
                const screenPrefix = screenId.split('-')[0];
                const correspondingNav = document.querySelector(`.nav-${screenPrefix}`);
                if (correspondingNav) correspondingNav.classList.add('active');
            }
        }

        if (screenId === 'dashboard-screen' || screenId === 'profile-screen') {
            setTimeout(() => this.triggerFillAnimations(), 100);
        }

        if (screenId === 'dashboard-screen') {
            this.loadDashboardData();
        }

        // Re-init feather icons on results screen
        if (screenId === 'results-screen') {
            setTimeout(() => feather.replace(), 100);
        }
    },

    /* ── Assessment Navigation ── */
    nextStep() {
        const currentStepEl = document.getElementById(`step-${this.currentStep}`);

        // Animate out current step
        currentStepEl.style.opacity = '0';
        currentStepEl.style.transform = 'translateX(-30px)';

        setTimeout(() => {
            currentStepEl.classList.remove('active');
            currentStepEl.style.opacity = '';
            currentStepEl.style.transform = '';

            if (this.currentStep < this.totalSteps) {
                this.currentStep++;
                const nextStepEl = document.getElementById(`step-${this.currentStep}`);
                nextStepEl.style.opacity = '0';
                nextStepEl.style.transform = 'translateX(30px)';
                nextStepEl.classList.add('active');
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        nextStepEl.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
                        nextStepEl.style.opacity = '1';
                        nextStepEl.style.transform = 'translateX(0)';
                    });
                });
                this.updateProgress();
                this.updateStepCounter();
                this.updateNextBtnLabel();
                // Scroll content to top
                const content = document.querySelector('#assessment-screen .screen-content');
                if (content) content.scrollTop = 0;
            } else {
                this.analyzeResults();
                setTimeout(() => feather.replace(), 10);

                this.navigateTo('results-screen');

                // DO NOT highlight Home when viewing Results
                document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            }
        }, 200);
    },

    prevStep() {
        if (this.currentStep > 1) {
            const currentStepEl = document.getElementById(`step-${this.currentStep}`);
            currentStepEl.style.opacity = '0';
            currentStepEl.style.transform = 'translateX(30px)';

            setTimeout(() => {
                currentStepEl.classList.remove('active');
                currentStepEl.style.opacity = '';
                currentStepEl.style.transform = '';
                this.currentStep--;
                const prevStepEl = document.getElementById(`step-${this.currentStep}`);
                prevStepEl.style.opacity = '0';
                prevStepEl.style.transform = 'translateX(-30px)';
                prevStepEl.classList.add('active');
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        prevStepEl.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
                        prevStepEl.style.opacity = '1';
                        prevStepEl.style.transform = 'translateX(0)';
                    });
                });
                this.updateProgress();
                this.updateStepCounter();
                this.updateNextBtnLabel();
            }, 200);
        } else {
            this.navigateTo('dashboard-screen');
            const dashNav = document.querySelector('.nav-dashboard');
            if (dashNav) {
                document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                dashNav.classList.add('active');
            }
        }
    },

    updateProgress() {
        const pct = (this.currentStep / this.totalSteps) * 100;
        const bar = document.getElementById('assessment-progress');
        if (bar) bar.style.width = `${pct}%`;
    },

    updateStepCounter() {
        const cur = document.getElementById('assess-step-current');
        if (cur) cur.textContent = this.currentStep;
    },

    updateNextBtnLabel() {
        const label = document.getElementById('next-btn-label');
        if (!label) return;
        if (this.currentStep === this.totalSteps) {
            label.textContent = 'See Results';
        } else if (this.currentStep === this.totalSteps - 1) {
            label.textContent = 'Almost Done';
        } else {
            label.textContent = 'Continue';
        }
    },

    /* ── Freq card selection (single-select per question) ── */
    selectFreq(element) {
        const parent = element.closest('.freq-options');
        if (!parent) return;
        parent.querySelectorAll('.freq-card').forEach(c => c.classList.remove('selected'));
        element.classList.add('selected');
        // Store score
        const val = parseInt(element.getAttribute('data-value') || '0', 10);
        this.stepScores[this.currentStep] = val;
    },

    /* Legacy selectOption kept for compatibility */
    selectOption(element) {
        const parent = element.parentElement;
        Array.from(parent.children).forEach(c => c.classList.remove('selected'));
        element.classList.add('selected');
    },

    /* ── Needs multi-select (step 12) ── */
    toggleNeed(element) {
        const need = element.getAttribute('data-need');
        if (element.classList.contains('selected')) {
            element.classList.remove('selected');
            this.selectedNeeds.delete(need);
        } else {
            element.classList.add('selected');
            this.selectedNeeds.add(need);
        }
    },

    /* ── Analyze & render results ── */
    analyzeResults() {
        try {
            const categories = [
                { label: 'Emotional State', emoji: '💫', step: 1 },
                { label: 'Stress', emoji: '⚡', step: 2 },
                { label: 'Overthinking', emoji: '🌀', step: 3 },
                { label: 'Thought Patterns', emoji: '💭', step: 4 },
                { label: 'Energy Levels', emoji: '🔋', step: 5 },
                { label: 'Sleep Quality', emoji: '🌙', step: 6 },
                { label: 'Social Connection', emoji: '👥', step: 7 },
                { label: 'Focus', emoji: '🎯', step: 8 },
                { label: 'Daily Habits', emoji: '🌿', step: 9 },
                { label: 'Anxiety', emoji: '🫀', step: 10 },
                { label: 'Motivation', emoji: '🚀', step: 11 },
            ];

            let totalScore = 0;
            for (let i = 1; i <= 11; i++) {
                const val = Number(this.stepScores[i]) || 0;
                totalScore += val;
            }
            const pct = totalScore / 44;

            let level, levelEmoji, levelBadgeClass, levelTitle, levelDesc, insightText;

            if (pct < 0.35) {
                level = 'Low';
                levelEmoji = '🌱';
                levelBadgeClass = 'badge-level-low';
                levelTitle = "You're Doing Well";
                levelDesc = 'Your mental health looks healthy. Keep nurturing your well-being!';
                insightText = "You're maintaining healthy patterns across most areas. Focus on consistency — a little daily self-care goes a long way toward maintaining your inner balance.";
            } else if (pct < 0.65) {
                level = 'Moderate';
                levelEmoji = '🌤';
                levelBadgeClass = 'badge-level-moderate';
                levelTitle = 'Keep Nurturing Yourself';
                levelDesc = 'Some areas need attention. Small, consistent steps can make a big difference.';
                insightText = "You're managing, but some areas are calling for more care. Prioritizing rest, mindful moments, and reaching out to people you trust can significantly shift how you feel day to day.";
            } else {
                level = 'Critical';
                levelEmoji = '🤍';
                levelBadgeClass = 'badge-level-critical';
                levelTitle = 'You Deserve Support';
                levelDesc = "Your responses indicate significant distress. Please know — you're not alone in this.";
                insightText = 'It takes real courage to check in with yourself like this. What you are feeling is valid. Connecting with a professional is one of the most caring things you can do for yourself right now.';
            }

            const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
            setText('res-level-emoji', levelEmoji);
            setText('res-level-title', levelTitle);
            setText('res-level-desc', levelDesc);
            setText('res-insight-text', insightText);

            const badge = document.getElementById('res-level-badge');
            if (badge) {
                badge.textContent = level + ' Alert Level';
                badge.className = 'res-level-badge mt-2 ' + levelBadgeClass;
            }

            // Score cards
            const grid = document.getElementById('res-scores-grid');
            if (grid) {
                const scoreLabels = ['Great', 'Good', 'Moderate', 'Elevated', 'High'];
                const scoreClasses = ['score-great', 'score-good', 'score-moderate', 'score-elevated', 'score-high'];
                let html = '';
                categories.forEach(cat => {
                    const val = Number(this.stepScores[cat.step]) || 0;
                    const s = Math.min(val, 4);
                    html += '<div class="res-score-card ' + scoreClasses[s] + '">' +
                        '<span class="res-score-emoji">' + cat.emoji + '</span>' +
                        '<span class="res-score-label">' + cat.label + '</span>' +
                        '<span class="res-score-value">' + scoreLabels[s] + '</span>' +
                        '</div>';
                });
                grid.innerHTML = html;
            }

            // Save everything persistently
            localStorage.setItem('neuroguard_stepScores', JSON.stringify(this.stepScores));
            localStorage.setItem('neuroguard_needs', JSON.stringify(Array.from(this.selectedNeeds)));

            // Sync with Firestore Assessments Collection via dedicated function
            const assessmentData = {
                stepScores: this.stepScores,
                needs: Array.from(this.selectedNeeds),
                level: level,
                levelTitle: levelTitle,
                score: pct, // Save numeric score result
                result: levelDesc,
                moodDesc: insightText
            };
            this.saveAssessmentToFirestore(assessmentData);

            // Sync with Dashboard Screen
            this.loadDashboardData();

            // Needs pills
            const needLabels = {
                'reduce-stress': '🌊 Reduce stress',
                'improve-sleep': '🌙 Improve sleep',
                'increase-focus': '🎯 Increase focus',
                'feel-better': '💛 Feel better emotionally',
                'reduce-anxiety': '🫂 Reduce anxiety',
                'boost-motivation': '🚀 Boost motivation',
                'manage-overthinking': '🌀 Manage overthinking',
                'daily-routine': '🌿 Daily routine',
            };

            const needsCard = document.getElementById('res-needs-card');
            const needsPills = document.getElementById('res-needs-pills');
            const ciEl = document.getElementById('needs-custom-input');
            const customVal = ciEl ? ciEl.value.trim() : '';
            const hasNeeds = this.selectedNeeds.size > 0 || customVal.length > 0;

            if (needsCard) needsCard.style.display = hasNeeds ? 'block' : 'none';
            if (needsPills && hasNeeds) {
                let pillHtml = '';
                this.selectedNeeds.forEach(n => {
                    pillHtml += '<span class="res-need-pill">' + (needLabels[n] || n) + '</span>';
                });
                if (customVal) pillHtml += '<span class="res-need-pill res-need-custom">✏️ ' + customVal + '</span>';
                needsPills.innerHTML = pillHtml;
            }

            // Critical CTA
            const criticalCard = document.getElementById('res-critical-card');
            if (criticalCard) criticalCard.style.display = (level === 'Critical') ? 'block' : 'none';

            // Scroll results to top
            const resultsContent = document.querySelector('#results-screen .screen-content');
            if (resultsContent) resultsContent.scrollTop = 0;

        } catch (err) {
            console.error('analyzeResults error:', err);
        }
    },

    async saveAssessmentToFirestore(data) {
        try {
            if (!window.db || !window.firestoreFunctions) {
                console.warn('Cannot save to Firestore: Firebase not initialized.');
                return;
            }

            const { collection, addDoc, serverTimestamp } = window.firestoreFunctions;
            let userId = localStorage.getItem('neuroguard_userId');
            if (!userId) {
                const phone = localStorage.getItem('neuroguard_phone');
                const name = localStorage.getItem('neuroguard_user');
                userId = phone || name || 'User'; 
            }
            
            // Build the write payload natively
            const payload = {
                ...data,
                userId: userId,
                timestamp: serverTimestamp()
            };

            // Fully await the save transaction explicitly monitoring errors
            await addDoc(collection(window.db, 'assessments'), payload);
            console.log('✅ Assessment successfully saved to Firestore');

        } catch (err) {
            console.error('❌ Error saving assessment to Firestore:', err);
        }
    },

    async loadDashboardData() {
        const loadingEl = document.getElementById('dash-assessment-loading');
        const contentEl = document.getElementById('dash-assessment-content');
        const emptyEl = document.getElementById('dash-assessment-empty');
        const snapshotContainer = document.getElementById('dash-snapshot-container');
        
        if (loadingEl) loadingEl.style.display = 'flex';
        if (contentEl) contentEl.style.display = 'none';
        if (emptyEl) emptyEl.style.display = 'none';
        if (snapshotContainer) snapshotContainer.style.display = 'none';

        let userId = localStorage.getItem('neuroguard_userId');
        if (!userId) {
            const phone = localStorage.getItem('neuroguard_phone');
            const name = localStorage.getItem('neuroguard_user');
            userId = phone || name || 'User'; 
        }

        if (userId && window.db && window.firestoreFunctions) {
            try {
                const { collection, query, where, orderBy, getDocs } = window.firestoreFunctions;
                const snapshot = await getDocs(query(
                    collection(window.db, 'assessments'),
                    where('userId', '==', userId),
                    orderBy('timestamp', 'desc')
                ));

                if (loadingEl) loadingEl.style.display = 'none';

                if (!snapshot.empty) {
                    const assessments = snapshot.docs.map(doc => doc.data());
                    const data = assessments[0]; // most recent
                    console.log('Successfully fetched assessments data from Firestore. Count:', assessments.length);

                    // --- Compute Activity Metrics ---
                    let streakCount = 0;
                    let checkinsCount = assessments.length;
                    let consistencyPct = 0;
                    
                    const processedDates = new Set();
                    const checkinDates = [];
                    
                    assessments.forEach(a => {
                        if (a.timestamp && a.timestamp.toDate) {
                            const d = a.timestamp.toDate();
                            const dStr = d.toDateString();
                            if (!processedDates.has(dStr)) {
                                processedDates.add(dStr);
                                checkinDates.push(d);
                            }
                        }
                    });
                    
                    if (checkinDates.length > 0) {
                        checkinDates.sort((a,b) => b - a);
                        
                        let current = new Date();
                        current.setHours(0,0,0,0);
                        
                        let firstDate = new Date(checkinDates[0]);
                        firstDate.setHours(0,0,0,0);
                        
                        let diffDays = Math.round((current - firstDate)/(1000*60*60*24));
                        if (diffDays <= 1) { // 0 or 1 means streak is alive
                            streakCount = 1;
                            let checkDate = new Date(firstDate);
                            for (let i = 1; i < checkinDates.length; i++) {
                                checkDate.setDate(checkDate.getDate() - 1);
                                let cmpDate = new Date(checkinDates[i]);
                                cmpDate.setHours(0,0,0,0);
                                if (cmpDate.getTime() === checkDate.getTime()) {
                                    streakCount++;
                                } else {
                                    break;
                                }
                            }
                        }
                        
                        const oldestDate = new Date(checkinDates[checkinDates.length - 1]);
                        oldestDate.setHours(0,0,0,0);
                        let totalDaysSinceStart = Math.round((current - oldestDate)/(1000*60*60*24)) + 1;
                        if (totalDaysSinceStart < 1) totalDaysSinceStart = 1;
                        consistencyPct = Math.round((checkinDates.length / totalDaysSinceStart) * 100);
                        if (consistencyPct > 100) consistencyPct = 100;
                    }

                    const setVal = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
                    const setFill = (id, pct) => { const e = document.getElementById(id); if (e) e.style.height = `${pct}%`; };

                    setVal('dash-streak-val', streakCount);
                    setVal('dash-checkin-val', checkinsCount);
                    setVal('dash-consist-val', consistencyPct + '%');

                    setFill('dash-streak-fill', Math.min(100, streakCount * 10)); 
                    setFill('dash-checkin-fill', Math.min(100, checkinsCount * 5)); 
                    setFill('dash-consist-fill', consistencyPct);
                    
                    setVal('dash-weekly-streak-banner', streakCount + ' Day Streak');
                    let badgeEl = document.getElementById('dash-weekly-streak-badge');
                    if (badgeEl) {
                        if (streakCount >= 7) { badgeEl.textContent = 'On Fire!'; badgeEl.className = 'text-small badge-pill badge-green'; }
                        else if (streakCount >= 3) { badgeEl.textContent = 'Heating Up'; badgeEl.className = 'text-small badge-pill badge-blue'; }
                        else if (streakCount > 0) { badgeEl.textContent = 'Building Habit'; badgeEl.className = 'text-small badge-pill badge-lavender'; }
                        else { badgeEl.textContent = 'Ready to Start'; badgeEl.className = 'text-small badge-pill'; }
                    }

                    const daysEl = document.getElementById('dash-weekly-streak-days');
                    if (daysEl) {
                        daysEl.innerHTML = '';
                        const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
                        let iterDate = new Date();
                        iterDate.setDate(iterDate.getDate() - 6);
                        for (let i = 0; i < 7; i++) {
                            const loopDateStr = iterDate.toDateString();
                            const isToday = (i === 6);
                            const hasCheckin = processedDates.has(loopDateStr);
                            const dayLetter = daysOfWeek[iterDate.getDay()];
                            
                            const dEl = document.createElement('div');
                            dEl.className = 'streak-day';
                            if (hasCheckin) dEl.classList.add('done');
                            if (isToday) dEl.classList.add('today');
                            dEl.textContent = dayLetter;
                            daysEl.appendChild(dEl);
                            
                            iterDate.setDate(iterDate.getDate() + 1);
                        }
                    }
                    // --------------------------------


                    const elTitle = document.getElementById('dash-res-title');
                    const elDesc = document.getElementById('dash-res-desc');
                    const elEmoji = document.getElementById('dash-res-emoji');
                    const elScore = document.getElementById('dash-res-score');

                    if (elTitle) elTitle.textContent = data.levelTitle || data.level || 'Recent Result';
                    if (elDesc) elDesc.textContent = data.moodDesc || data.result;
                    
                    if (elScore && data.score !== undefined) {
                        const scorePct = Math.round(100 - (data.score * 100));
                        elScore.textContent = `Wellness Score: ${scorePct}%`;
                    }
                    
                    if (elEmoji) {
                        elEmoji.textContent = data.level === 'Critical' ? '🤍' : (data.level === 'Low' ? '🌱' : '🌤');
                    }

                    if (contentEl) contentEl.style.display = 'block';

                    // Update Snapshot elements
                    if (data.stepScores) {
                        const moodScore = Number(data.stepScores[1]) || 0;
                        const energyScore = Number(data.stepScores[5]) || 0;
                        const sleepScore = Number(data.stepScores[6]) || 0;

                        const scoreWords = ['Great', 'Good', 'Moderate', 'Elevated', 'High'];

                        const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
                        
                        setText('snap-mood-emoji', moodScore <= 1 ? '😌' : (moodScore === 2 ? '😐' : '😔'));
                        setText('snap-mood-val', moodScore <= 1 ? 'Good' : (moodScore === 2 ? 'Fair' : 'Low'));

                        setText('snap-energy-val', scoreWords[energyScore] || 'Moderate');
                        setText('snap-energy-emoji', energyScore <= 2 ? '⚡' : '🔋');

                        setText('snap-sleep-val', scoreWords[sleepScore] || 'Good');
                        setText('snap-sleep-emoji', '🌙');
                        
                        if (snapshotContainer) snapshotContainer.style.display = 'block';
                    }

                } else {
                    console.log('No assessments found in Firestore for this user.');
                    if (emptyEl) emptyEl.style.display = 'block';
                }
            } catch (err) {
                console.error('Error fetching assessments from Firestore:', err);
                if (loadingEl) loadingEl.style.display = 'none';
                if (emptyEl) emptyEl.style.display = 'block';
            }
        } else {
             console.log('Firebase not initialized or user not found');
             if (loadingEl) loadingEl.style.display = 'none';
             if (emptyEl) emptyEl.style.display = 'block';
        }
    },

    bookTherapy() {
        // Opens a therapy booking flow — in a real app this would navigate to a booking screen
        // For now, open a helpful resource in a new tab
        window.open('https://www.betterhelp.com', '_blank');
    },

    findHelp() {
        // Open Google Maps search for nearby mental health services
        window.open('https://www.google.com/maps/search/mental+health+clinic+near+me', '_blank');
    },

    /* ── Guided Sessions ── */
    sessionTimerInterval: null,
    sessionTextInterval: null,

    startExercise(type, name, durationMinutes) {
        document.getElementById('session-title').textContent = name;

        let seconds = durationMinutes * 60;
        if (seconds > 600) seconds = 600;

        const timeEl = document.getElementById('session-time');
        const updateTimerDisplay = () => {
            const m = Math.floor(seconds / 60).toString().padStart(2, '0');
            const s = (seconds % 60).toString().padStart(2, '0');
            timeEl.textContent = `${m}:${s}`;
        };
        updateTimerDisplay();

        const animationEl = document.getElementById('session-animation');
        animationEl.className = 'anim-large';
        if (type === 'breathing') animationEl.classList.add('anim-circle-breathe');
        if (type === 'meditation') animationEl.classList.add('anim-circle-pulse');
        if (type === 'grounding') animationEl.classList.add('anim-ground-large');
        if (type === 'stress') animationEl.classList.add('anim-waves-large');
        if (type === 'sleep') animationEl.classList.add('anim-sleep-large');

        const instructionEl = document.getElementById('session-instruction');
        instructionEl.style.opacity = '1';
        instructionEl.textContent = 'Get ready...';

        clearInterval(this.sessionTextInterval);

        if (type === 'breathing') {
            const bCycle = () => {
                instructionEl.textContent = 'Breathe in...';
                instructionEl.style.opacity = '1';
                setTimeout(() => { instructionEl.style.opacity = '0'; setTimeout(() => { instructionEl.textContent = 'Hold...'; instructionEl.style.opacity = '1'; }, 500); }, 3500);
                setTimeout(() => { instructionEl.style.opacity = '0'; setTimeout(() => { instructionEl.textContent = 'Breathe out...'; instructionEl.style.opacity = '1'; }, 500); }, 5500);
                setTimeout(() => { instructionEl.style.opacity = '0'; }, 9500);
            };
            bCycle();
            this.sessionTextInterval = setInterval(bCycle, 10000);
        } else if (type === 'meditation') {
            instructionEl.textContent = 'Focus on the gentle pulse...';
            let pStep = 0;
            this.sessionTextInterval = setInterval(() => { instructionEl.style.opacity = (pStep++ % 2 === 0) ? '0.4' : '1'; }, 2000);
        } else if (type === 'grounding') {
            const senses = ['Look for 5 things you can see', 'Feel 4 things you can touch', 'Listen for 3 things you can hear', 'Notice 2 things you can smell', 'Acknowledge 1 thing you can taste'];
            let gStep = 0;
            const gCycle = () => { instructionEl.textContent = senses[gStep]; instructionEl.style.opacity = '1'; setTimeout(() => { instructionEl.style.opacity = '0'; }, 6500); gStep = (gStep + 1) % senses.length; };
            gCycle();
            this.sessionTextInterval = setInterval(gCycle, 7000);
        } else {
            instructionEl.textContent = 'Relax your body and mind...';
            instructionEl.style.opacity = '1';
        }

        this.navigateTo('guided-session-screen');

        clearInterval(this.sessionTimerInterval);
        this.sessionTimerInterval = setInterval(() => {
            seconds--;
            if (seconds <= 0) { seconds = 0; this.endExercise(); }
            updateTimerDisplay();
        }, 1000);
    },

    endExercise() {
        clearInterval(this.sessionTimerInterval);
        clearInterval(this.sessionTextInterval);
        this.navigateTo('support-screen');
    },

    setTheme(themeName, el) {
        if (el) {
            document.querySelectorAll('.theme-option').forEach(n => n.classList.remove('active'));
            el.classList.add('active');
        }

        document.body.className = '';

        if (themeName === 'default') {
            // standard light mode
        } else if (themeName === 'mood') {
            document.body.classList.add('theme-mood');
            this.updateMoodTheme();
        } else {
            document.body.classList.add(`theme-${themeName}`);
            if (themeName === 'dark') {
                document.body.classList.add('dark-mode');
            }
        }

        const isDark = (themeName === 'dark');
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.style.opacity = '0';
            themeIcon.style.transform = 'scale(0.8)';
            setTimeout(() => {
                themeIcon.setAttribute('data-feather', isDark ? 'moon' : 'aperture');
                feather.replace();
                const replaced = document.querySelector('.theme-icon');
                if (replaced) { replaced.style.opacity = '1'; replaced.style.transform = 'scale(1)'; replaced.style.transition = 'all 0.3s ease'; }
            }, 200);
        }
    },

    updateMoodTheme() {
        if (!document.body.classList.contains('theme-mood')) return;

        let mood = 'calm';
        if (this.stepScores && typeof this.stepScores[2] !== 'undefined') {
            if (this.stepScores[2] >= 3) mood = 'stress';
            else if (this.stepScores[5] <= 1) mood = 'happy';
            else mood = 'calm';
        }

        document.body.className = 'theme-mood';

        if (mood === 'stress') {
            document.body.classList.add('theme-sunset');
        } else if (mood === 'happy') {
            document.body.classList.add('theme-nature');
        } else {
            // standard mode
        }
    },

    submitFeedback() {
        const input = document.getElementById('feedback-input');
        if (input && input.value.trim().length > 0) {
            const btn = document.getElementById('btn-submit-feedback');
            btn.innerHTML = '<i data-feather="loader" class="spin"></i> Sending...';
            feather.replace();
            
            setTimeout(() => {
                input.value = '';
                btn.textContent = 'Submit Feedback';
                document.getElementById('feedback-success').style.display = 'flex';
                
                setTimeout(() => {
                    document.getElementById('feedback-success').style.display = 'none';
                    this.navigateTo('profile-screen');
                }, 2000);
            }, 1200);
        }
    },

    sendContactEmail() {
        const subject = document.getElementById('contact-subject') ? document.getElementById('contact-subject').value : 'Support Request';
        const body = document.getElementById('contact-body') ? document.getElementById('contact-body').value : '';
        const email = 'bhanavathriteshnaik@gmail.com';
        
        // Trigger mailto protocol effectively passing form inputs
        window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    },

    downloadPdfReport() {
        if (!window.jspdf || !window.jspdf.jsPDF) {
            alert("PDF processing library is currently loading. Please try again in a few seconds.");
            return;
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const date = new Date().toLocaleDateString();
        
        // Add header
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(26, 54, 93);
        doc.text("Neuroguard Mental Health Report", 20, 30);
        
        // Add metadata
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${date}`, 20, 40);
        doc.text(`User: ${document.getElementById('profile-name-display') ? document.getElementById('profile-name-display').innerText : 'Jane Doe'}`, 20, 48);
        
        // Divider
        doc.setLineWidth(0.5);
        doc.setDrawColor(200, 200, 200);
        doc.line(20, 55, 190, 55);
        
        // Stats
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(26, 54, 93);
        doc.text("Recent Wellness Snapshot", 20, 70);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        const streak = document.getElementById('pv2-streak-num') ? document.getElementById('pv2-streak-num').innerText : '0';
        doc.text(`Current Active Streak: ${streak} days`, 20, 80);
        
        const moodEmoji = document.getElementById('snap-mood-emoji') ? document.getElementById('snap-mood-emoji').innerText : '🌿';
        const moodVal = document.getElementById('snap-mood-val') ? document.getElementById('snap-mood-val').innerText : 'Calm / Neutral';
        doc.text(`Latest Registered Mood: ${moodEmoji} ${moodVal}`, 20, 88);
        
        doc.text("Latest Assessment Parameters:", 20, 100);
        
        let yPos = 110;
        const mapping = {
            '2': 'Measured Stress Index',
            '5': 'Base Energy Level'
        };
        
        if(this.stepScores && Object.keys(this.stepScores).length > 0) {
            for(let step in this.stepScores) {
                const label = mapping[step] || `Analysis Component ${step}`;
                doc.text(`- ${label}: ${this.stepScores[step]} / 5`, 30, yPos);
                yPos += 8;
            }
        } else {
            doc.text("- No detailed assessment metrics stored on this device yet.", 30, yPos);
            yPos += 8;
        }

        yPos += 10;
        doc.setFont("helvetica", "bold");
        doc.text("AI Derived Pattern Insights:", 20, yPos);
        yPos += 8;
        doc.setFont("helvetica", "normal");
        
        const insightEl = document.getElementById('dash-mood-desc');
        const insight = insightEl ? insightEl.innerText : 'Maintain your current routines to foster emotional stability. Consistency is key to long-term wellness.';
        // Map text down based on standard screen length limits
        const lines = doc.splitTextToSize(insight, 170);
        doc.text(lines, 20, yPos);
        
        // Footer signature
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text("Confidential automated report provided by the Neuroguard Platform securely.", 20, 280);
        
        doc.save(`Neuroguard_Report_${date.replace(/\//g, '-')}.pdf`);
    },

    async loadHistory() {
        const historyList = document.getElementById('history-list');
        const loader = document.getElementById('history-loading');
        if (!historyList || !loader) return;
        
        historyList.innerHTML = '';
        loader.style.display = 'block';

        let userId = localStorage.getItem('neuroguard_userId') || 'anonymous';
        if (window.db && window.firestoreFunctions) {
            try {
                const { collection, query, where, orderBy, getDocs } = window.firestoreFunctions;
                const snapshot = await getDocs(query(collection(window.db, 'assessments'), where('userId', '==', userId), orderBy('timestamp', 'desc')));
                
                loader.style.display = 'none';
                
                if (snapshot.empty) {
                    historyList.innerHTML = '<p class="text-small text-muted text-center py-4">No assessments found yet. Take your first check-in to start seeing tracking!</p>';
                    return;
                }
                
                let html = '';
                snapshot.forEach(doc => {
                    const data = doc.data();
                    const dateObj = data.timestamp ? data.timestamp.toDate() : new Date();
                    const dateStr = dateObj.toLocaleDateString(undefined, { month:'short', day:'numeric'});
                    // Create an inverted wellness score purely for display metrics (100 is best)
                    let wellScore = data.score !== undefined ? Math.round(100 - data.score * 100) : '--';
                    
                    html += `
                        <div class="goal-card mb-3 glass-card">
                            <div class="goal-header">
                                <div class="goal-icon-wrap" style="background:var(--bg-light-lavender);color:var(--primary-color);">${data.level === 'Critical' ? '🤍' : (data.level === 'Low' ? '🌱':'🌤')}</div>
                                <div class="goal-text">
                                    <span class="font-medium text-small">${dateStr} • ${data.levelTitle || 'Assessment'}</span>
                                    <span class="goal-milestone" style="color:var(--text-muted)">${data.result || 'Logged'}</span>
                                </div>
                                <div class="goal-pct">${wellScore}%</div>
                            </div>
                        </div>
                    `;
                });
                historyList.innerHTML = html;
            } catch (err) {
                console.error("Error loading history:", err);
                loader.style.display = 'none';
                historyList.innerHTML = '<p class="text-small text-muted text-center py-4">Error loading history from Firebase.</p>';
            }
        } else {
            loader.style.display = 'none';
            historyList.innerHTML = '<p class="text-small text-muted text-center py-4">Firebase is currently unavailable or initializing.</p>';
        }
    },

    toggleReminder(el) {
        let isEnabled = el.checked;
        localStorage.setItem('neuroguard_reminder_enabled', isEnabled ? 'true' : 'false');
        if (isEnabled && typeof window.Notification !== 'undefined' && Notification.permission !== "granted") {
            Notification.requestPermission().then(permission => {
                if (permission !== "granted") {
                    console.warn("Notifications permission denied.");
                } else {
                    console.log("Notifications permitted!");
                }
            });
        }
    },

    setReminderTime(val) {
        localStorage.setItem('neuroguard_reminder_time', val);
        console.log("Reminder time set to", val);
    },

    initReminders() {
        const enabled = localStorage.getItem('neuroguard_reminder_enabled') === 'true';
        const timerEl = document.getElementById('reminder-time-picker');
        const toggleEl = document.getElementById('toggle-daily-reminders');
        if (toggleEl) toggleEl.checked = enabled;
        if (timerEl) {
            const t = localStorage.getItem('neuroguard_reminder_time') || '09:00';
            timerEl.value = t;
        }

        // Setup ticking check every minute natively bounding to performance hooks
        setInterval(() => {
            if (localStorage.getItem('neuroguard_reminder_enabled') === 'true') {
                const targetTime = localStorage.getItem('neuroguard_reminder_time') || '09:00';
                const now = new Date();
                const h = now.getHours().toString().padStart(2, '0');
                const m = now.getMinutes().toString().padStart(2, '0');
                const currentStr = `${h}:${m}`;
                const lastTriggered = localStorage.getItem('neuroguard_last_reminder_trigger');
                const todayStr = now.toLocaleDateString();

                if (currentStr === targetTime && lastTriggered !== todayStr) {
                    localStorage.setItem('neuroguard_last_reminder_trigger', todayStr);
                    this.triggerNotification();
                }
            }
        }, 60000); // Executes precise chronological alignment internally
    },

    triggerNotification() {
        if (typeof window.Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification('Neuroguard 🌱', {
                body: 'It’s time for your daily mental well-being check-in!',
            });
        } else {
            // Fallback audio sequence & JS Alert
            try {
                let audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                audio.play();
            } catch(e) {}
            setTimeout(() => {
                alert('🌱 Neuroguard Reminder:\nIt’s time to take your daily assessment and track your well-being.');
            }, 500);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

import re
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

splash_auth = '''        <!-- Splash Screen -->
        <section id="splash-screen" class="screen active flex-center column splash-screen">
            <div class="logo-animation">
                <div class="pulse-ring"></div>
                <div class="pulse-core"></div>
                <i data-feather="activity" class="splash-icon"></i>
            </div>
            <h1 class="app-title mt-6 splash-fade">Neuroguard</h1>
            <p class="tagline splash-fade ml-2 mr-2">Mental wellness, elevated by intelligence.</p>
        </section>

        <!-- Auth Screen -->
        <section id="auth-screen" class="screen auth-screen pb-pb">
            <header class="screen-header text-center pt-8">
                <h2>Welcome</h2>
                <p class="text-muted mt-2">Sign in to continue your journey</p>
            </header>
            <div class="screen-content scrollable">
                <div class="auth-tabs mb-6">
                    <button class="auth-tab active" onclick="app.switchAuthTab('login')">Login</button>
                    <button class="auth-tab" onclick="app.switchAuthTab('register')">Register</button>
                </div>
                <form id="auth-form" onsubmit="event.preventDefault(); app.handleAuth();" class="auth-form slide-up-anim">
                    <div id="register-fields" style="display:none;">
                        <div class="input-group mb-4">
                            <label class="input-label text-small font-medium text-muted">Full Name</label>
                            <input type="text" class="input mt-1" placeholder="Jane Doe">
                        </div>
                    </div>
                    <div class="input-group mb-4">
                        <label class="input-label text-small font-medium text-muted">Email Address</label>
                        <input type="email" class="input mt-1" placeholder="you@example.com" required>
                    </div>
                    <div class="input-group mb-6">
                        <label class="input-label text-small font-medium text-muted">Password</label>
                        <input type="password" class="input mt-1" placeholder="••••••••" required>
                    </div>
                    <button type="submit" class="btn btn-primary w-full btn-large" id="auth-submit-btn">Login</button>
                </form>
            </div>
        </section>'''
html = re.sub(
    r'        <!-- Welcome Screen -->.*?        </section>',
    splash_auth,
    html,
    flags=re.DOTALL
)

dashboard_snapshot = '''                <!-- ── TODAY\'S VIBE ── -->
                <div class="card gradient-card mb-6 slide-up-anim">
                    <div class="mood-wave-bg"></div>
                    <div class="relative-z">
                        <p class="text-small uppercase tracking-wide mb-2 opacity-80 font-medium">Today\'s Vibe</p>
                        <div class="flex align-center gap-3 mb-2">
                            <div class="mood-emoji-large">😌</div>
                            <h3>Peaceful & Balanced</h3>
                        </div>
                        <p class="text-body opacity-90 mt-2">Your energy is flowing smoothly. You seem centered. Keep nourishing this feeling.</p>
                    </div>
                </div>

                <!-- ── TODAY\'S SNAPSHOT ── -->
                <p class="font-medium mb-4 px-2 mt-4">Today\'s Snapshot</p>
                <div class="pv2-snapshot mb-6 slide-up-anim">
                    <div class="pv2-snap-item">
                        <div class="pv2-snap-emoji snap-mood">😌</div>
                        <div class="pv2-snap-text">
                            <span class="pv2-snap-val">Peaceful</span>
                            <span class="pv2-snap-key">Mood</span>
                        </div>
                    </div>
                    <div class="pv2-snap-divider"></div>
                    <div class="pv2-snap-item">
                        <div class="pv2-snap-emoji snap-energy">⚡</div>
                        <div class="pv2-snap-text">
                            <span class="pv2-snap-val">Moderate</span>
                            <span class="pv2-snap-key">Energy</span>
                        </div>
                    </div>
                    <div class="pv2-snap-divider"></div>
                    <div class="pv2-snap-item">
                        <div class="pv2-snap-emoji snap-sleep">🌙</div>
                        <div class="pv2-snap-text">
                            <span class="pv2-snap-val">7.5 hrs</span>
                            <span class="pv2-snap-key">Sleep</span>
                        </div>
                    </div>
                </div>'''
match_vibe = re.search(r'                <!-- ── TODAY\'S VIBE ── -->.*?</div>\s*</div>\s*</div>', html, re.DOTALL)
if match_vibe:
    html = html[:match_vibe.start()] + dashboard_snapshot + html[match_vibe.end():]

profile_tabs = '''                <!-- ══ TABS ══ -->
                <div class="profile-tabs-container mb-5">
                    <button class="profile-tab active" onclick="app.switchProfileTab('details')">Profile</button>
                    <button class="profile-tab" onclick="app.switchProfileTab('settings')">Settings</button>
                    <button class="profile-tab" onclick="app.switchProfileTab('privacy')">Privacy</button>
                    <button class="profile-tab" onclick="app.switchProfileTab('support')">Help</button>
                </div>

                <div class="profile-tab-content active" id="ptab-details">
                    <div class="pv2-hero mb-5">
                        <div class="pv2-avatar-ring">
                            <div class="pv2-avatar"><span>JD</span></div>
                        </div>
                        <h3 class="pv2-name">Jane Doe</h3>
                        <p class="pv2-bio" contenteditable="true" spellcheck="false">Seeking balance and mindfulness everyday ✨</p>
                        
                        <div class="input-group mt-6 mb-4 text-left">
                            <label class="input-label text-small font-medium text-muted">Full Name</label>
                            <input type="text" class="input mt-1" value="Jane Doe">
                        </div>
                        <div class="input-group mb-4 text-left">
                            <label class="input-label text-small font-medium text-muted">Email Address</label>
                            <input type="email" class="input mt-1" value="jane@example.com">
                        </div>
                        <button class="btn btn-primary w-full mt-4">Save Changes</button>
                    </div>
                </div>

                <div class="profile-tab-content" id="ptab-settings">
                    <p class="pv2-section-label">Display Settings</p>
                    <div class="pv2-settings mb-5">
                        <div class="pv2-setting-row">
                            <div class="pv2-setting-icon pv2-blue-icon"><i data-feather="moon"></i></div>
                            <span class="pv2-setting-label">Dark Mode</span>
                            <label class="toggle-switch ml-auto">
                                <input type="checkbox" id="dark-mode-toggle" onchange="app.toggleDarkMode()">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        <div class="pv2-settings-sep"></div>
                        <div class="pv2-setting-row">
                            <div class="pv2-setting-icon pv2-green-icon"><i data-feather="bell"></i></div>
                            <span class="pv2-setting-label">Notifications</span>
                            <label class="toggle-switch ml-auto">
                                <input type="checkbox" checked>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>

                <div class="profile-tab-content" id="ptab-privacy">
                    <p class="pv2-section-label">Security & Privacy</p>
                    <div class="pv2-settings mb-5">
                        <div class="pv2-setting-row cursor-pointer list-hover">
                            <div class="pv2-setting-icon pv2-lavender-icon"><i data-feather="shield"></i></div>
                            <span class="pv2-setting-label">Change Password</span>
                            <i data-feather="chevron-right" class="pv2-setting-chevron ml-auto"></i>
                        </div>
                        <div class="pv2-settings-sep"></div>
                        <div class="pv2-setting-row cursor-pointer list-hover">
                            <div class="pv2-setting-icon" style="background:var(--bg-light-green);"><i data-feather="lock"></i></div>
                            <span class="pv2-setting-label">Data Sharing Preferences</span>
                            <i data-feather="chevron-right" class="pv2-setting-chevron ml-auto"></i>
                        </div>
                    </div>
                </div>

                <div class="profile-tab-content" id="ptab-support">
                    <p class="pv2-section-label">Help & Resources</p>
                    <div class="pv2-settings mb-5">
                        <div class="pv2-setting-row cursor-pointer list-hover">
                            <div class="pv2-setting-icon" style="background:var(--bg-light-blue);"><i data-feather="help-circle"></i></div>
                            <span class="pv2-setting-label">FAQ & Support Center</span>
                            <i data-feather="chevron-right" class="pv2-setting-chevron ml-auto"></i>
                        </div>
                        <div class="pv2-settings-sep"></div>
                        <div class="pv2-setting-row cursor-pointer list-hover">
                            <div class="pv2-setting-icon" style="background:var(--bg-light-lavender);"><i data-feather="mail"></i></div>
                            <span class="pv2-setting-label">Contact Us</span>
                            <i data-feather="chevron-right" class="pv2-setting-chevron ml-auto"></i>
                        </div>
                    </div>
                </div>

                <div class="text-center mt-6 mb-6">
                    <button class="pv2-logout-btn w-full mb-3" onclick="app.navigateTo('auth-screen')">Log Out</button>
                    <p class="text-xsmall text-muted">Neuroguard v1.0.0</p>
                </div>'''

match_profile = re.search(r'                <!-- ══ 1\. HERO BLOCK ══ -->.*?                </div>\n\n            </div>\n        </section>', html, re.DOTALL)
if match_profile:
    html = html[:match_profile.start()] + profile_tabs + '\n            </div>\n        </section>' + html[match_profile.end():]

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

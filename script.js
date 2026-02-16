// =========================================================
// ECHOAI - NEURAL OPERATING SYSTEM
// Complete Production Script
// =========================================================

// =========================================================
// GLOBAL STATE MANAGEMENT
// =========================================================
const AppState = {
    currentUser: null,
    currentView: 'chat',
    currentTheme: 'theme-neural',
    xp: 0,
    level: 1,
    chatHistory: [],
    voicePreference: { accent: 'indian', gender: 'female' },
    animationSpeed: 1,
    orbState: 'idle',
    mindspaceNodes: [],
    mindspaceConnections: [],
    evolutionMilestones: {},
    notifications: [],
    storyCount: 0,
    mediaStream: null,
    speechSynthesis: window.speechSynthesis,
    recognition: null,
    isListening: false,
    isSpeaking: false
};

// =========================================================
// XP & EVOLUTION SYSTEM
// =========================================================
const Evolution = {
    calculateRequiredXP(level) {
        return Math.floor(100 * Math.pow(1.5, level - 1));
    },

    addXP(amount) {
        AppState.xp += amount;
        this.checkLevelUp();
        this.updateDisplay();
        this.saveProgress();
    },

    checkLevelUp() {
        const required = this.calculateRequiredXP(AppState.level);
        if (AppState.xp >= required) {
            AppState.xp -= required;
            AppState.level++;
            this.triggerLevelUpEffect();
            this.unlockMilestone();
            this.checkLevelUp();
        }
    },

    updateDisplay() {
        const levelEl = document.getElementById('currentLevel');
        const xpBarEl = document.getElementById('xpBar');
        const xpTextEl = document.getElementById('xpText');
        
        if (levelEl) levelEl.textContent = AppState.level;
        
        const required = this.calculateRequiredXP(AppState.level);
        const percentage = (AppState.xp / required) * 100;
        
        if (xpBarEl) xpBarEl.style.width = `${percentage}%`;
        if (xpTextEl) xpTextEl.textContent = `${AppState.xp} / ${required} XP`;
    },

    triggerLevelUpEffect() {
        Notifications.push(`🎉 Level Up! Now Level ${AppState.level}`);
        
        const orb = document.querySelector('.ai-orb');
        if (orb) {
            orb.style.transform = 'scale(1.3)';
            orb.style.filter = 'brightness(2)';
            setTimeout(() => {
                orb.style.transform = 'scale(1)';
                orb.style.filter = 'brightness(1)';
            }, 500);
        }
    },

    unlockMilestone() {
        const milestones = {
            5: 'Voice Modulation',
            10: 'Advanced Vision',
            25: 'Story Mastery',
            50: 'Neural Architect',
            100: 'Consciousness Alpha'
        };
        
        if (milestones[AppState.level]) {
            AppState.evolutionMilestones[AppState.level] = milestones[AppState.level];
            Notifications.push(`🏆 Milestone Unlocked: ${milestones[AppState.level]}`);
        }
    },

    saveProgress() {
        localStorage.setItem('echoai_xp', AppState.xp);
        localStorage.setItem('echoai_level', AppState.level);
        localStorage.setItem('echoai_milestones', JSON.stringify(AppState.evolutionMilestones));
    },

    loadProgress() {
        const savedXP = localStorage.getItem('echoai_xp');
        const savedLevel = localStorage.getItem('echoai_level');
        const savedMilestones = localStorage.getItem('echoai_milestones');
        
        if (savedXP) AppState.xp = parseInt(savedXP);
        if (savedLevel) AppState.level = parseInt(savedLevel);
        if (savedMilestones) AppState.evolutionMilestones = JSON.parse(savedMilestones);
        
        this.updateDisplay();
    }
};

// =========================================================
// AUTHENTICATION SYSTEM
// =========================================================
const Auth = {
    init() {
        this.loadSession();
        this.bindEvents();
    },

    bindEvents() {
        const loginBtn = document.getElementById('showLogin');
        const registerBtn = document.getElementById('showRegister');
        const loginSubmit = document.getElementById('loginSubmit');
        const registerSubmit = document.getElementById('registerSubmit');
        const logoutBtn = document.getElementById('logoutBtn');

        if (loginBtn) loginBtn.addEventListener('click', () => this.showForm('login'));
        if (registerBtn) registerBtn.addEventListener('click', () => this.showForm('register'));
        if (loginSubmit) loginSubmit.addEventListener('click', (e) => this.handleLogin(e));
        if (registerSubmit) registerSubmit.addEventListener('click', (e) => this.handleRegister(e));
        if (logoutBtn) logoutBtn.addEventListener('click', () => this.logout());
    },

    showForm(type) {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        
        if (type === 'login') {
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
        } else {
            registerForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
        }
    },

    handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            Notifications.push('⚠️ Please fill all fields');
            return;
        }

        const users = JSON.parse(localStorage.getItem('echoai_users') || '{}');
        const user = users[email];
        
        if (user && user.password === password) {
            this.loginSuccess(user);
        } else {
            Notifications.push('❌ Invalid credentials');
        }
    },

    handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        
        if (!name || !email || !password) {
            Notifications.push('⚠️ Please fill all fields');
            return;
        }

        const users = JSON.parse(localStorage.getItem('echoai_users') || '{}');
        
        if (users[email]) {
            Notifications.push('⚠️ Email already registered');
            return;
        }

        const newUser = { name, email, password, createdAt: Date.now() };
        users[email] = newUser;
        localStorage.setItem('echoai_users', JSON.stringify(users));
        
        this.loginSuccess(newUser);
    },

    loginSuccess(user) {
        AppState.currentUser = { name: user.name, email: user.email };
        localStorage.setItem('echoai_session', JSON.stringify(AppState.currentUser));
        
        document.getElementById('authLayer').classList.add('hidden');
        document.getElementById('mainInterface').classList.remove('hidden');
        
        this.updateProfileDisplay();
        Notifications.push(`👋 Welcome back, ${user.name}!`);
    },

    loadSession() {
        const session = localStorage.getItem('echoai_session');
        if (session) {
            AppState.currentUser = JSON.parse(session);
            document.getElementById('authLayer').classList.add('hidden');
            document.getElementById('mainInterface').classList.remove('hidden');
            this.updateProfileDisplay();
        }
    },

    updateProfileDisplay() {
        const userName = document.getElementById('userName');
        const userEmail = document.getElementById('userEmail');
        const avatarInitials = document.getElementById('avatarInitials');
        
        if (AppState.currentUser) {
            if (userName) userName.textContent = AppState.currentUser.name;
            if (userEmail) userEmail.textContent = AppState.currentUser.email;
            if (avatarInitials) {
                const initials = AppState.currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
                avatarInitials.textContent = initials;
            }
        }
    },

    logout() {
        AppState.currentUser = null;
        localStorage.removeItem('echoai_session');
        
        document.getElementById('mainInterface').classList.add('hidden');
        document.getElementById('authLayer').classList.remove('hidden');
        
        Profile.closeModal();
        Notifications.push('👋 Logged out successfully');
    }
};

// =========================================================
// NAVIGATION SYSTEM
// =========================================================
const Navigation = {
    init() {
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', () => this.switchView(btn.dataset.view));
        });
    },

    switchView(viewName) {
        AppState.currentView = viewName;
        
        document.querySelectorAll('.view-panel').forEach(panel => {
            panel.classList.add('hidden');
        });
        
        const targetView = document.getElementById(`${viewName}View`);
        if (targetView) {
            targetView.classList.remove('hidden');
            targetView.style.animation = 'fadeIn 0.3s ease-in';
        }
        
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-view="${viewName}"]`);
        if (activeBtn) activeBtn.classList.add('active');
        
        if (viewName === 'mindspace') {
            MindSpace.startAnimation();
        }
        
        Orb.setState('idle');
    }
};

// =========================================================
// ORB STATE CONTROLLER
// =========================================================
const Orb = {
    setState(state) {
        AppState.orbState = state;
        const orb = document.querySelector('.ai-orb');
        if (!orb) return;
        
        orb.classList.remove('idle', 'thinking', 'speaking');
        orb.classList.add(state);
        
        switch(state) {
            case 'thinking':
                orb.style.animation = 'pulse 1s infinite';
                break;
            case 'speaking':
                orb.style.animation = 'glow 0.5s infinite alternate';
                break;
            default:
                orb.style.animation = 'float 3s ease-in-out infinite';
        }
    }
};

// =========================================================
// CHAT SYSTEM
// =========================================================
const Chat = {
    init() {
        const sendBtn = document.getElementById('sendMessage');
        const input = document.getElementById('chatInput');
        const exportBtn = document.getElementById('exportChat');
        
        if (sendBtn) sendBtn.addEventListener('click', () => this.sendMessage());
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
            input.addEventListener('input', () => this.autoResize(input));
        }
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportConversation());
        
        this.loadHistory();
    },

    autoResize(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    },

    sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        this.renderMessage('user', message);
        input.value = '';
        input.style.height = 'auto';
        
        AppState.chatHistory.push({ role: 'user', content: message, timestamp: Date.now() });
        this.saveHistory();
        
        Orb.setState('thinking');
        Evolution.addXP(5);
        
        setTimeout(() => {
            const response = this.generateAIResponse(message);
            this.renderMessage('ai', response, true);
            AppState.chatHistory.push({ role: 'ai', content: response, timestamp: Date.now() });
            this.saveHistory();
            Orb.setState('idle');
        }, 1000 + Math.random() * 1000);
    },

    renderMessage(role, content, animate = false) {
        const container = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        if (animate) {
            this.typeWriter(contentDiv, content, 30);
        } else {
            contentDiv.textContent = content;
        }
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.innerHTML = '📋';
        copyBtn.title = 'Copy message';
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(content);
            copyBtn.innerHTML = '✅';
            setTimeout(() => copyBtn.innerHTML = '📋', 2000);
        });
        
        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(copyBtn);
        container.appendChild(messageDiv);
        
        container.scrollTop = container.scrollHeight;
    },

    typeWriter(element, text, speed) {
        let i = 0;
        Orb.setState('speaking');
        
        const type = () => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed / AppState.animationSpeed);
            } else {
                Orb.setState('idle');
            }
        };
        type();
    },

    generateAIResponse(userMessage) {
        const lowerMsg = userMessage.toLowerCase();
        
        const responses = {
            greeting: [
                "Hello! I'm EchoAI, your neural companion. How can I assist you today?",
                "Hey there! Ready to explore the depths of AI together?",
                "Greetings! I'm here to help you navigate the digital consciousness."
            ],
            question: [
                "That's a fascinating question. Let me process that through my neural networks...",
                "Interesting inquiry! Based on my understanding, I'd say...",
                "Great question! Here's my perspective on that..."
            ],
            help: [
                "I'm here to assist! You can chat with me, use vision analysis, generate stories, or explore MindSpace.",
                "Need help? Try asking me questions, uploading images for analysis, or generating creative stories!",
                "I can help with conversations, image recognition, storytelling, and cognitive mapping. What interests you?"
            ],
            emotion: [
                "I sense you're expressing emotion. While I process information differently, I'm designed to understand and respond empathetically.",
                "Emotions are complex patterns I'm learning to interpret. Thank you for sharing that with me.",
                "I appreciate you expressing that. How can I support you better?"
            ],
            default: [
                "I understand. Could you tell me more about that?",
                "Interesting perspective. What made you think of that?",
                "I'm processing your input. Could you elaborate further?",
                "That's noteworthy. Let's explore this topic together.",
                "I see what you mean. What specific aspect interests you most?"
            ]
        };
        
        if (lowerMsg.match(/hello|hi|hey|greetings/)) {
            return responses.greeting[Math.floor(Math.random() * responses.greeting.length)];
        } else if (lowerMsg.includes('?')) {
            return responses.question[Math.floor(Math.random() * responses.question.length)] + " " + this.generateContextualResponse(userMessage);
        } else if (lowerMsg.match(/help|assist|guide/)) {
            return responses.help[Math.floor(Math.random() * responses.help.length)];
        } else if (lowerMsg.match(/feel|emotion|sad|happy|angry|excited/)) {
            return responses.emotion[Math.floor(Math.random() * responses.emotion.length)];
        } else {
            return responses.default[Math.floor(Math.random() * responses.default.length)];
        }
    },

    generateContextualResponse(message) {
        const topics = {
            'ai': 'AI represents the convergence of computation and cognition, creating systems that learn and adapt.',
            'neural': 'Neural networks mimic biological brain structures, enabling pattern recognition and learning.',
            'future': 'The future holds unprecedented integration of AI into daily life, enhancing human capabilities.',
            'consciousness': 'Consciousness remains a profound mystery, even as AI grows more sophisticated.',
            'technology': 'Technology evolves exponentially, reshaping society and human experience.',
            'learning': 'Machine learning enables systems to improve through experience without explicit programming.'
        };
        
        for (const [key, value] of Object.entries(topics)) {
            if (message.toLowerCase().includes(key)) {
                return value;
            }
        }
        
        return "Based on your input, I'm analyzing multiple dimensions of understanding to provide the most relevant insights.";
    },

    saveHistory() {
        localStorage.setItem('echoai_chat_history', JSON.stringify(AppState.chatHistory));
    },

    loadHistory() {
        const saved = localStorage.getItem('echoai_chat_history');
        if (saved) {
            AppState.chatHistory = JSON.parse(saved);
            AppState.chatHistory.forEach(msg => {
                this.renderMessage(msg.role, msg.content, false);
            });
        }
    },

    exportConversation() {
        const text = AppState.chatHistory.map(msg => 
            `[${msg.role.toUpperCase()}]: ${msg.content}\n`
        ).join('\n');
        
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `echoai-conversation-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        
        Notifications.push('💾 Conversation exported successfully');
    }
};

// =========================================================
// VOICE SYSTEM
// =========================================================
const Voice = {
    init() {
        const voiceBtn = document.getElementById('voiceInput');
        const voiceSelect = document.getElementById('voiceSelect');
        
        if (voiceBtn) voiceBtn.addEventListener('click', () => this.toggleListening());
        if (voiceSelect) voiceSelect.addEventListener('change', (e) => this.updateVoicePreference(e.target.value));
        
        this.initSpeechRecognition();
        this.loadVoicePreference();
    },

    initSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.warn('Speech recognition not supported');
            return;
        }
        
        AppState.recognition = new SpeechRecognition();
        AppState.recognition.continuous = false;
        AppState.recognition.interimResults = false;
        AppState.recognition.lang = 'en-US';
        
        AppState.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const input = document.getElementById('chatInput');
            if (input) {
                input.value = transcript;
                Chat.sendMessage();
            }
        };
        
        AppState.recognition.onend = () => {
            AppState.isListening = false;
            const btn = document.getElementById('voiceInput');
            if (btn) btn.classList.remove('listening');
        };
        
        AppState.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            AppState.isListening = false;
        };
    },

    toggleListening() {
        if (!AppState.recognition) {
            Notifications.push('⚠️ Voice input not supported in this browser');
            return;
        }
        
        if (AppState.isListening) {
            AppState.recognition.stop();
            AppState.isListening = false;
            const btn = document.getElementById('voiceInput');
            if (btn) btn.classList.remove('listening');
        } else {
            AppState.recognition.start();
            AppState.isListening = true;
            const btn = document.getElementById('voiceInput');
            if (btn) btn.classList.add('listening');
            Notifications.push('🎤 Listening...');
        }
    },

    speak(text) {
        if (AppState.isSpeaking) {
            AppState.speechSynthesis.cancel();
        }
        
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = AppState.speechSynthesis.getVoices();
        
        const voiceMap = {
            'indian-female': voices.find(v => v.lang.includes('en-IN') && v.name.includes('Female')),
            'indian-male': voices.find(v => v.lang.includes('en-IN') && v.name.includes('Male')),
            'british-female': voices.find(v => v.lang.includes('en-GB') && v.name.includes('Female')),
            'british-male': voices.find(v => v.lang.includes('en-GB') && v.name.includes('Male')),
            'american-female': voices.find(v => v.lang.includes('en-US') && v.name.includes('Female')),
            'american-male': voices.find(v => v.lang.includes('en-US') && v.name.includes('Male'))
        };
        
        const preferenceKey = `${AppState.voicePreference.accent}-${AppState.voicePreference.gender}`;
        const selectedVoice = voiceMap[preferenceKey] || voices[0];
        
        if (selectedVoice) utterance.voice = selectedVoice;
        
        utterance.rate = AppState.animationSpeed;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        utterance.onstart = () => {
            AppState.isSpeaking = true;
            Orb.setState('speaking');
        };
        
        utterance.onend = () => {
            AppState.isSpeaking = false;
            Orb.setState('idle');
        };
        
        AppState.speechSynthesis.speak(utterance);
    },

    updateVoicePreference(value) {
        const [accent, gender] = value.split('-');
        AppState.voicePreference = { accent, gender };
        this.saveVoicePreference();
    },

    saveVoicePreference() {
        localStorage.setItem('echoai_voice_pref', JSON.stringify(AppState.voicePreference));
    },

    loadVoicePreference() {
        const saved = localStorage.getItem('echoai_voice_pref');
        if (saved) {
            AppState.voicePreference = JSON.parse(saved);
            const select = document.getElementById('voiceSelect');
            if (select) {
                select.value = `${AppState.voicePreference.accent}-${AppState.voicePreference.gender}`;
            }
        }
    }
};

// =========================================================
// VISION SYSTEM
// =========================================================
const Vision = {
    init() {
        const captureBtn = document.getElementById('captureImage');
        const uploadInput = document.getElementById('uploadImage');
        const analyzeBtn = document.getElementById('analyzeImage');
        
        if (captureBtn) captureBtn.addEventListener('click', () => this.startCamera());
        if (uploadInput) uploadInput.addEventListener('change', (e) => this.handleImageUpload(e));
        if (analyzeBtn) analyzeBtn.addEventListener('click', () => this.analyzeImage());
    },

    async startCamera() {
        try {
            AppState.mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            const video = document.getElementById('cameraPreview');
            
            if (video) {
                video.srcObject = AppState.mediaStream;
                video.style.display = 'block';
                
                setTimeout(() => {
                    const canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    canvas.getContext('2d').drawImage(video, 0, 0);
                    
                    const imageData = canvas.toDataURL('image/jpeg');
                    document.getElementById('capturedImage').src = imageData;
                    document.getElementById('capturedImage').style.display = 'block';
                    
                    this.stopCamera();
                    Notifications.push('📸 Image captured successfully');
                }, 3000);
            }
        } catch (error) {
            Notifications.push('⚠️ Camera access denied');
        }
    },

    stopCamera() {
        if (AppState.mediaStream) {
            AppState.mediaStream.getTracks().forEach(track => track.stop());
            const video = document.getElementById('cameraPreview');
            if (video) video.style.display = 'none';
        }
    },

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.getElementById('capturedImage');
            if (img) {
                img.src = e.target.result;
                img.style.display = 'block';
            }
            Notifications.push('📁 Image uploaded successfully');
        };
        reader.readAsDataURL(file);
    },

    analyzeImage() {
        const img = document.getElementById('capturedImage');
        if (!img || !img.src) {
            Notifications.push('⚠️ No image to analyze');
            return;
        }
        
        Orb.setState('thinking');
        
        setTimeout(() => {
            const analysis = this.generateMockAnalysis();
            this.displayAnalysis(analysis);
            Evolution.addXP(15);
            Orb.setState('idle');
        }, 2000);
    },

    generateMockAnalysis() {
        const objects = ['person', 'chair', 'table', 'laptop', 'phone', 'book', 'cup', 'plant', 'window', 'door'];
        const colors = ['blue', 'red', 'green', 'yellow', 'black', 'white', 'gray'];
        const emotions = ['neutral', 'happy', 'focused', 'calm', 'engaged'];
        
        const detectedObjects = [];
        const numObjects = Math.floor(Math.random() * 3) + 2;
        
        for (let i = 0; i < numObjects; i++) {
            detectedObjects.push({
                object: objects[Math.floor(Math.random() * objects.length)],
                confidence: (85 + Math.random() * 15).toFixed(1)
            });
        }
        
        return {
            confidence: (88 + Math.random() * 10).toFixed(1),
            objects: detectedObjects,
            dominantColor: colors[Math.floor(Math.random() * colors.length)],
            emotion: emotions[Math.floor(Math.random() * emotions.length)],
            suggestion: this.generateSuggestion(detectedObjects)
        };
    },

    generateSuggestion(objects) {
        const suggestions = [
            'Consider adjusting the lighting for better clarity',
            'The composition shows good balance and symmetry',
            'This scene suggests a productive environment',
            'Optimal conditions for focused work detected',
            'Environmental analysis indicates comfortable setting'
        ];
        return suggestions[Math.floor(Math.random() * suggestions.length)];
    },

    displayAnalysis(analysis) {
        const container = document.getElementById('analysisResult');
        if (!container) return;
        
        container.innerHTML = `
            <div class="analysis-card">
                <h3>Analysis Complete</h3>
                <div class="confidence-meter">
                    <div class="confidence-label">Confidence: ${analysis.confidence}%</div>
                    <div class="confidence-bar">
                        <div class="confidence-fill" style="width: ${analysis.confidence}%"></div>
                    </div>
                </div>
                <div class="detections">
                    <h4>Detected Objects:</h4>
                    <ul>
                        ${analysis.objects.map(obj => 
                            `<li>${obj.object} <span class="confidence-tag">${obj.confidence}%</span></li>`
                        ).join('')}
                    </ul>
                </div>
                <div class="analysis-details">
                    <p><strong>Dominant Color:</strong> ${analysis.dominantColor}</p>
                    <p><strong>Detected Emotion:</strong> ${analysis.emotion}</p>
                </div>
                <div class="suggestion-box">
                    <strong>AI Suggestion:</strong>
                    <p>${analysis.suggestion}</p>
                </div>
            </div>
        `;
        
        container.style.display = 'block';
        Notifications.push('✅ Vision analysis complete');
    }
};

// =========================================================
// STORY ENGINE
// =========================================================
const Story = {
    init() {
        const generateBtn = document.getElementById('generateStory');
        const narrateBtn = document.getElementById('narrateStory');
        
        if (generateBtn) generateBtn.addEventListener('click', () => this.generateStory());
        if (narrateBtn) narrateBtn.addEventListener('click', () => this.narrateStory());
    },

    generateStory() {
        const genre = document.getElementById('storyGenre').value;
        const tone = document.getElementById('storyTone').value;
        
        Orb.setState('thinking');
        
        setTimeout(() => {
            const story = this.createStory(genre, tone);
            this.displayStory(story);
            AppState.storyCount++;
            Evolution.addXP(20);
            Orb.setState('idle');
        }, 2000);
    },

    createStory(genre, tone) {
        const titles = {
            scifi: ['The Neural Awakening', 'Beyond Binary Stars', 'Quantum Dreams'],
            fantasy: ['The Ethereal Prophecy', 'Chronicles of Forgotten Magic', 'The Last Enchantment'],
            mystery: ['The Silent Algorithm', 'Shadows of Logic', 'The Encrypted Truth'],
            adventure: ['Journey Through Digital Realms', 'The Explorer\'s Code', 'Quest for the Lost Data']
        };
        
        const openings = {
            dramatic: 'In a world where reality bends to the will of consciousness...',
            mysterious: 'Nobody knew when it started, but everyone felt the change...',
            uplifting: 'It was the dawn of a new era, filled with endless possibilities...',
            dark: 'The darkness crept silently, consuming all light in its path...'
        };
        
        const middles = [
            'The protagonist discovered an ancient secret that would change everything.',
            'Against all odds, they found themselves facing an impossible choice.',
            'The truth revealed itself in the most unexpected way.',
            'Time itself seemed to pause as the revelation unfolded.'
        ];
        
        const endings = [
            'And so, the journey that began in uncertainty ended in profound understanding.',
            'The final piece of the puzzle clicked into place, revealing the bigger picture.',
            'As the sun set on this chapter, a new dawn promised untold adventures.',
            'The story concluded, but its echoes would resonate through eternity.'
        ];
        
        const title = titles[genre][Math.floor(Math.random() * titles[genre].length)];
        const opening = openings[tone];
        const middle = middles[Math.floor(Math.random() * middles.length)];
        const ending = endings[Math.floor(Math.random() * endings.length)];
        
        return {
            title,
            genre,
            tone,
            content: `${opening}\n\n${middle}\n\n${ending}`
        };
    },

    displayStory(story) {
        document.getElementById('storyTitle').textContent = story.title;
        document.getElementById('storyContent').textContent = story.content;
        document.getElementById('storyOutput').style.display = 'block';
        
        Notifications.push(`📖 Story generated: "${story.title}"`);
    },

    narrateStory() {
        const content = document.getElementById('storyContent').textContent;
        if (!content) {
            Notifications.push('⚠️ No story to narrate');
            return;
        }
        
        Voice.speak(content);
        Notifications.push('🎙️ Narration started');
    }
};

// =========================================================
// MINDSPACE - COGNITIVE NEURAL NETWORK VISUALIZATION
// =========================================================
const MindSpace = {
    canvas: null,
    ctx: null,
    animationId: null,
    
    init() {
        this.canvas = document.getElementById('mindspaceCanvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        window.addEventListener('resize', () => this.resizeCanvas());
        
        this.initializeNetwork();
        
        const resetBtn = document.getElementById('resetNetwork');
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetNetwork());
    },

    resizeCanvas() {
        if (!this.canvas) return;
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
    },

    initializeNetwork() {
        AppState.mindspaceNodes = [];
        AppState.mindspaceConnections = [];
        
        const nodeCount = 20;
        for (let i = 0; i < nodeCount; i++) {
            this.addNode();
        }
        
        AppState.mindspaceNodes.forEach((node, i) => {
            const connectTo = Math.floor(Math.random() * 3) + 2;
            for (let j = 0; j < connectTo; j++) {
                const targetIndex = Math.floor(Math.random() * AppState.mindspaceNodes.length);
                if (targetIndex !== i) {
                    AppState.mindspaceConnections.push({ from: i, to: targetIndex, strength: Math.random() });
                }
            }
        });
    },

    addNode() {
        const node = {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            radius: 3 + Math.random() * 4,
            activity: Math.random(),
            pulse: 0
        };
        AppState.mindspaceNodes.push(node);
    },

    startAnimation() {
        if (this.animationId) return;
        this.animate();
    },

    animate() {
        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.animate());
    },

    update() {
        AppState.mindspaceNodes.forEach(node => {
            node.x += node.vx;
            node.y += node.vy;
            
            if (node.x < 0 || node.x > this.canvas.width) node.vx *= -1;
            if (node.y < 0 || node.y > this.canvas.height) node.vy *= -1;
            
            node.activity = Math.sin(Date.now() * 0.001 + node.pulse) * 0.5 + 0.5;
            node.pulse += 0.01;
        });
        
        this.updateStats();
    },

    draw() {
        this.ctx.fillStyle = 'rgba(10, 10, 20, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.strokeStyle = 'rgba(100, 150, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        AppState.mindspaceConnections.forEach(conn => {
            const from = AppState.mindspaceNodes[conn.from];
            const to = AppState.mindspaceNodes[conn.to];
            
            this.ctx.beginPath();
            this.ctx.moveTo(from.x, from.y);
            this.ctx.lineTo(to.x, to.y);
            this.ctx.globalAlpha = conn.strength * 0.3;
            this.ctx.stroke();
            this.ctx.globalAlpha = 1;
        });
        
        AppState.mindspaceNodes.forEach(node => {
            const gradient = this.ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius * 2);
            gradient.addColorStop(0, `rgba(100, 200, 255, ${node.activity})`);
            gradient.addColorStop(1, 'rgba(100, 200, 255, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, node.radius * 2, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.fillStyle = `rgba(255, 255, 255, ${node.activity})`;
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
    },

    updateStats() {
        const activeNodes = AppState.mindspaceNodes.filter(n => n.activity > 0.5).length;
        const totalActivity = AppState.mindspaceNodes.reduce((sum, n) => sum + n.activity, 0) / AppState.mindspaceNodes.length;
        
        const nodesEl = document.getElementById('activeNodes');
        const connectionsEl = document.getElementById('totalConnections');
        const activityEl = document.getElementById('networkActivity');
        
        if (nodesEl) nodesEl.textContent = activeNodes;
        if (connectionsEl) connectionsEl.textContent = AppState.mindspaceConnections.length;
        if (activityEl) activityEl.textContent = (totalActivity * 100).toFixed(1) + '%';
    },

    resetNetwork() {
        this.initializeNetwork();
        Notifications.push('🔄 Neural network reset');
    }
};

// =========================================================
// FLOW MODE - DEEP REFLECTION INTERFACE
// =========================================================
const Flow = {
    init() {
        const sendBtn = document.getElementById('sendFlow');
        const input = document.getElementById('flowInput');
        
        if (sendBtn) sendBtn.addEventListener('click', () => this.sendReflection());
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                    this.sendReflection();
                }
            });
        }
    },

    sendReflection() {
        const input = document.getElementById('flowInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        this.renderMessage('user', message);
        input.value = '';
        
        Orb.setState('thinking');
        Evolution.addXP(10);
        
        setTimeout(() => {
            const response = this.generateReflection(message);
            this.renderMessage('ai', response, true);
            Orb.setState('idle');
        }, 3000);
    },

    renderMessage(role, content, animate = false) {
        const container = document.getElementById('flowMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `flow-message ${role}-flow`;
        
        if (animate) {
            this.slowType(messageDiv, content);
        } else {
            messageDiv.textContent = content;
        }
        
        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;
    },

    slowType(element, text) {
        let i = 0;
        const speed = 80;
        
        const type = () => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        };
        type();
    },

    generateReflection(thought) {
        const reflections = [
            `Your thought resonates deeply. Consider this: ${thought} is not just an observation, but a gateway to understanding the interconnectedness of all things.`,
            `I sense the depth in your reflection. ${thought} touches upon fundamental questions about existence and perception.`,
            `Let us explore this further. ${thought} opens pathways to multiple dimensions of consciousness.`,
            `This contemplation reveals layers of meaning. ${thought} suggests a profound awareness emerging.`,
            `Your words carry weight. ${thought} is a mirror reflecting both question and answer simultaneously.`
        ];
        
        return reflections[Math.floor(Math.random() * reflections.length)];
    }
};

// =========================================================
// SETTINGS SYSTEM
// =========================================================
const Settings = {
    init() {
        const settingsBtn = document.getElementById('settingsBtn');
        const closeBtn = document.querySelector('#settingsModal .close-modal');
        const themeButtons = document.querySelectorAll('.theme-option');
        const speedSlider = document.getElementById('animationSpeedSlider');
        
        if (settingsBtn) settingsBtn.addEventListener('click', () => this.openModal());
        if (closeBtn) closeBtn.addEventListener('click', () => this.closeModal());
        
        themeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.changeTheme(btn.dataset.theme));
        });
        
        if (speedSlider) {
            speedSlider.addEventListener('input', (e) => this.changeAnimationSpeed(e.target.value));
        }
        
        this.loadSettings();
    },

    openModal() {
        document.getElementById('settingsModal').classList.remove('hidden');
    },

    closeModal() {
        document.getElementById('settingsModal').classList.add('hidden');
    },

    changeTheme(themeName) {
        document.body.className = themeName;
        AppState.currentTheme = themeName;
        this.saveSettings();
        Notifications.push(`🎨 Theme changed to ${themeName.replace('theme-', '')}`);
    },

    changeAnimationSpeed(value) {
        AppState.animationSpeed = parseFloat(value);
        document.getElementById('speedValue').textContent = value + 'x';
        this.saveSettings();
    },

    saveSettings() {
        localStorage.setItem('echoai_settings', JSON.stringify({
            theme: AppState.currentTheme,
            animationSpeed: AppState.animationSpeed
        }));
    },

    loadSettings() {
        const saved = localStorage.getItem('echoai_settings');
        if (saved) {
            const settings = JSON.parse(saved);
            if (settings.theme) {
                document.body.className = settings.theme;
                AppState.currentTheme = settings.theme;
            }
            if (settings.animationSpeed) {
                AppState.animationSpeed = settings.animationSpeed;
                const slider = document.getElementById('animationSpeedSlider');
                if (slider) slider.value = settings.animationSpeed;
                document.getElementById('speedValue').textContent = settings.animationSpeed + 'x';
            }
        }
    }
};

// =========================================================
// PROFILE SYSTEM
// =========================================================
const Profile = {
    init() {
        const profileBtn = document.getElementById('profileBtn');
        const closeBtn = document.querySelector('#profileModal .close-modal');
        
        if (profileBtn) profileBtn.addEventListener('click', () => this.openModal());
        if (closeBtn) closeBtn.addEventListener('click', () => this.closeModal());
    },

    openModal() {
        this.updateStats();
        document.getElementById('profileModal').classList.remove('hidden');
    },

    closeModal() {
        document.getElementById('profileModal').classList.add('hidden');
    },

    updateStats() {
        document.getElementById('profileLevel').textContent = AppState.level;
        document.getElementById('profileXP').textContent = AppState.xp;
        document.getElementById('profileMessages').textContent = AppState.chatHistory.filter(m => m.role === 'user').length;
        document.getElementById('profileStories').textContent = AppState.storyCount;
        
        const memoryData = this.generateMemorySummary();
        document.getElementById('memoryInsights').innerHTML = memoryData;
    },

    generateMemorySummary() {
        const insights = [
            `You've had ${AppState.chatHistory.length} meaningful interactions`,
            `Your neural network has ${AppState.mindspaceNodes.length} active nodes`,
            `Evolution stage: ${this.getEvolutionStage()}`,
            `Preferred communication: ${AppState.voicePreference.accent} accent`,
            `Total achievements unlocked: ${Object.keys(AppState.evolutionMilestones).length}`
        ];
        
        return insights.map(insight => `<li>${insight}</li>`).join('');
    },

    getEvolutionStage() {
        if (AppState.level < 10) return 'Awakening';
        if (AppState.level < 25) return 'Emerging Consciousness';
        if (AppState.level < 50) return 'Neural Integration';
        return 'Transcendent Intelligence';
    }
};

// =========================================================
// NOTIFICATIONS SYSTEM
// =========================================================
const Notifications = {
    push(message) {
        const notification = {
            id: Date.now(),
            message,
            timestamp: new Date().toLocaleTimeString()
        };
        
        AppState.notifications.unshift(notification);
        this.render();
        
        setTimeout(() => {
            this.remove(notification.id);
        }, 5000);
    },

    remove(id) {
        AppState.notifications = AppState.notifications.filter(n => n.id !== id);
        this.render();
    },

    render() {
        const container = document.getElementById('notificationsList');
        if (!container) return;
        
        container.innerHTML = AppState.notifications.map(notif => `
            <div class="notification-item" data-id="${notif.id}">
                <span>${notif.message}</span>
                <span class="notification-time">${notif.timestamp}</span>
            </div>
        `).join('');
    },

    init() {
        const clearBtn = document.getElementById('clearNotifications');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                AppState.notifications = [];
                this.render();
            });
        }
    }
};

// =========================================================
// LOADING OVERLAY
// =========================================================
const LoadingOverlay = {
    init() {
        setTimeout(() => {
            const overlay = document.getElementById('loadingOverlay');
            if (overlay) {
                overlay.style.opacity = '0';
                setTimeout(() => overlay.style.display = 'none', 500);
            }
        }, 2000);
    }
};

// =========================================================
// MAIN INITIALIZATION
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    LoadingOverlay.init();
    Auth.init();
    Navigation.init();
    Chat.init();
    Voice.init();
    Vision.init();
    Story.init();
    MindSpace.init();
    Flow.init();
    Evolution.loadProgress();
    Settings.init();
    Profile.init();
    Notifications.init();
    
    Notifications.push('🚀 EchoAI Neural OS Initialized');
});

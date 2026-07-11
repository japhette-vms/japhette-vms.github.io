if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

document.addEventListener("DOMContentLoaded", () => {

    // 1. Smooth Scrolling Setup
    if (typeof Lenis !== 'undefined') {
        const lenis = new Lenis();
        if (typeof ScrollTrigger !== 'undefined' && typeof gsap !== 'undefined') {
            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add((time) => {
                lenis.raf(time * 1000);
            });
            gsap.ticker.lagSmoothing(0);
        }
    }

    let isCinematic = false;
    const audioTrack = document.getElementById('ambientTrack');
    if (audioTrack) {
        audioTrack.volume = 0.05;
    }

    // 2. Entrance Screen Controls
    const engageBtn = document.getElementById('engageCinematicBtn');
    const skipBtn = document.getElementById('skipIntroBtn');
    const gateEl = document.getElementById('introGate');
    const MODE_KEY = 'jp_viewing_mode'; // 'cinematic' | 'bright'

    function skipGateInstantly(mode) {
        isCinematic = mode === 'cinematic';
        document.body.classList.toggle('lights-on', !isCinematic);
        if (gateEl) {
            gateEl.style.display = 'none';
            gateEl.style.pointerEvents = 'none';
        }
        startHeroTypewriter();
        initScrollAnimations();
        // Note: cinematic audio does not auto-resume on repeat visits —
        // browsers block unprompted autoplay with sound, so the music
        // widget stays available for the visitor to press play manually.
    }

    const savedMode = localStorage.getItem(MODE_KEY);
    if (savedMode) {
        skipGateInstantly(savedMode);
    }

    if (engageBtn) {
        engageBtn.addEventListener('click', () => {
            isCinematic = true;
            document.body.classList.remove('lights-on');
            localStorage.setItem(MODE_KEY, 'cinematic');
            initializePortfolio();
        });
    }

    if (skipBtn) {
        skipBtn.addEventListener('click', () => {
            isCinematic = false;
            document.body.classList.add('lights-on');
            localStorage.setItem(MODE_KEY, 'bright');
            initializePortfolio();
        });
    }

    function initializePortfolio() {
        const gate = document.getElementById('introGate');
        if (gate) {
            gate.style.pointerEvents = 'none';
            if (typeof gsap !== 'undefined') {
                gsap.to(gate, {
                    opacity: 0, duration: 0.5, ease: 'power2.out',
                    onComplete: () => {
                        gate.style.display = 'none';
                        startHeroTypewriter();
                        initScrollAnimations();
                        if (isCinematic) { playAudioSequence(); }
                    }
                });
            } else {
                gate.style.display = 'none';
                startHeroTypewriter();
                initScrollAnimations();
            }
        }
    }

    // 3. Mouse-Following Spotlight (Cinematic Mode Only)
    const spotlight = document.getElementById('spotlight');
    window.addEventListener('mousemove', (e) => {
        if (!isCinematic || !spotlight) return;
        if (typeof gsap !== 'undefined') {
            gsap.to(spotlight, {
                left: e.clientX, top: e.clientY, duration: 0.1, ease: 'power1.out'
            });
        }
    });

    // 4. Audio Controls
    const widget = document.getElementById('musicWidget');
    const toggleBtn = document.getElementById('widgetToggleBtn');

    function playAudioSequence() {
        if (!audioTrack) return;
        audioTrack.play().then(() => {
            if (widget) widget.classList.add('playing');
            if (toggleBtn) toggleBtn.innerText = 'MUTE';
            const status = document.querySelector('.track-status');
            if (status) status.innerText = 'LOOP ACTIVE';
        }).catch(err => console.log("Awaiting user activation."));
    }

    function pauseAudioSequence() {
        if (!audioTrack) return;
        audioTrack.pause();
        if (widget) widget.classList.remove('playing');
        if (toggleBtn) toggleBtn.innerText = 'PLAY';
        const status = document.querySelector('.track-status');
        if (status) status.innerText = 'SYSTEM IDLE';
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            if (audioTrack.paused) { playAudioSequence(); } else { pauseAudioSequence(); }
        });
    }

    // 5. Hero Typewriter — Updated lines to reflect the new headline angle
    function startHeroTypewriter() {
        const lines = [
            "14 years of ops. IT degree. Zero missed milestones.",
            "AI SOP frameworks deployed. 40% admin overhead eliminated.",
            "Systems built from scratch. Documented. Version-controlled."
        ];
        let lineIdx = 0;
        let charIdx = 0;
        const targetNode = document.getElementById('typewriter');
        if (!targetNode) return;

        function type() {
            if (!targetNode) return;
            if (charIdx < lines[lineIdx].length) {
                targetNode.textContent += lines[lineIdx].charAt(charIdx);
                charIdx++;
                setTimeout(type, 35);
            } else {
                setTimeout(erase, 2800);
            }
        }

        function erase() {
            if (!targetNode) return;
            if (charIdx > 0) {
                targetNode.textContent = lines[lineIdx].substring(0, charIdx - 1);
                charIdx--;
                setTimeout(erase, 12);
            } else {
                lineIdx = (lineIdx + 1) % lines.length;
                setTimeout(type, 400);
            }
        }
        type();
    }

    // 6. Scroll-triggered Reveal Animations
    function initScrollAnimations() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

        // Reveal service cards on scroll
        gsap.utils.toArray('.reveal-card').forEach((card, i) => {
            gsap.fromTo(card,
                { opacity: 0, y: 24 },
                {
                    opacity: 1, y: 0, duration: 0.5, delay: (i % 3) * 0.08,
                    ease: 'power2.out',
                    scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none none' }
                }
            );
        });

        // Reveal case study metric cards
        gsap.utils.toArray('.cs-metric-card').forEach((card, i) => {
            gsap.fromTo(card,
                { opacity: 0, scale: 0.96 },
                {
                    opacity: 1, scale: 1, duration: 0.4, delay: i * 0.07,
                    ease: 'power2.out',
                    scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none none' }
                }
            );
        });

        // Reveal testimonials
        gsap.utils.toArray('.testimonial-card').forEach((card, i) => {
            gsap.fromTo(card,
                { opacity: 0, y: 20 },
                {
                    opacity: 1, y: 0, duration: 0.5, delay: i * 0.1,
                    ease: 'power2.out',
                    scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none none' }
                }
            );
        });
    }

    // 7. Work History Accordions
    const accordions = document.querySelectorAll('.accordion-item');

    // Open the first item on load
    const firstItem = accordions[0];
    if (firstItem) {
        const firstContent = firstItem.querySelector('.accordion-content');
        if (firstContent && typeof gsap !== 'undefined') {
            gsap.set(firstContent, { height: 'auto' });
        } else if (firstContent) {
            firstContent.style.height = 'auto';
        }
    }

    accordions.forEach(item => {
        const header = item.querySelector('.accordion-header');
        if (header) {
            header.addEventListener('click', () => {
                const isActive = item.classList.contains('active');

                accordions.forEach(acc => {
                    acc.classList.remove('active');
                    const arrow = acc.querySelector('.arrow');
                    if (arrow) arrow.innerText = '▼';
                    const content = acc.querySelector('.accordion-content');
                    if (content && typeof gsap !== 'undefined') {
                        gsap.to(content, { height: 0, duration: 0.4, ease: 'power2.inOut' });
                    } else if (content) {
                        content.style.height = '0';
                    }
                });

                if (!isActive) {
                    item.classList.add('active');
                    const arrow = item.querySelector('.arrow');
                    if (arrow) arrow.innerText = '▲';
                    const content = item.querySelector('.accordion-content');
                    if (content && typeof gsap !== 'undefined') {
                        gsap.to(content, { height: 'auto', duration: 0.5, ease: 'power2.out' });
                    } else if (content) {
                        content.style.height = 'auto';
                    }
                }
            });
        }
    });

    // 8. Magnetic Button Interactions
    const magnets = document.querySelectorAll('.magnetic');
    magnets.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            if (typeof gsap === 'undefined') return;
            const bound = el.getBoundingClientRect();
            const x = e.clientX - bound.left - (bound.width / 2);
            const y = e.clientY - bound.top - (bound.height / 2);
            gsap.to(el, { x: x * 0.3, y: y * 0.3, duration: 0.2, ease: 'power1.out' });
        });
        el.addEventListener('mouseleave', () => {
            if (typeof gsap === 'undefined') return;
            gsap.to(el, { x: 0, y: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)' });
        });
    });

    // 9. Easter Egg — Rick Astley
    const easterBtn = document.getElementById('easterEggBtn');
    if (easterBtn) {
        easterBtn.addEventListener('click', () => {
            window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank');
        });
    }

    // 10. Hamburger Mobile Navigation
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileOverlay = document.getElementById('mobileNavOverlay');
    const mobileClose = document.getElementById('mobileNavClose');
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');

    function openMobileNav() {
        if (!mobileOverlay || !hamburgerBtn) return;
        mobileOverlay.classList.add('open');
        hamburgerBtn.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileNav() {
        if (!mobileOverlay || !hamburgerBtn) return;
        mobileOverlay.classList.remove('open');
        hamburgerBtn.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (hamburgerBtn) hamburgerBtn.addEventListener('click', openMobileNav);
    if (mobileClose) mobileClose.addEventListener('click', closeMobileNav);

    // Close on any nav link click
    mobileNavItems.forEach(item => {
        item.addEventListener('click', closeMobileNav);
    });

    // Close on overlay background click
    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', (e) => {
            if (e.target === mobileOverlay) closeMobileNav();
        });
    }

    // 11. Skill Bar Scroll Animation
    function animateSkillBars() {
        const bars = document.querySelectorAll('.skill-bar-fill');
        if (!bars.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const bar = entry.target;
                    const targetWidth = bar.style.width;
                    // Reset then animate
                    bar.style.width = '0%';
                    requestAnimationFrame(() => {
                        setTimeout(() => { bar.style.width = targetWidth; }, 100);
                    });
                    observer.unobserve(bar);
                }
            });
        }, { threshold: 0.2 });

        bars.forEach(bar => observer.observe(bar));
    }
    animateSkillBars();
    // =====================================================
// JAPHETTE PORTFOLIO CHATBOT
// =====================================================
(function() {
    const chatToggle = document.getElementById('jp-chat-toggle');
    const chatWindow = document.getElementById('jp-chat-window');
    const chatMinimize = document.getElementById('jp-chat-minimize');
    const chatForm = document.getElementById('jp-chat-input-form');
    const chatInput = document.getElementById('jp-chat-input');
    const chatMessages = document.getElementById('jp-chat-messages');
    const chatSuggestions = document.getElementById('jp-chat-suggestions');
    const iconOpen = document.getElementById('jp-chat-icon-open');
    const iconClose = document.getElementById('jp-chat-icon-close');

    if (!chatToggle || !chatWindow) return;

    // Knowledge base - trained on Japhette's portfolio
    const knowledge = {
        experience: `Japhette has **14+ years of professional experience** spanning:

• **General Virtual Assistant** at Fit Body Boot Camp (Aug 2023 – Present) — lead generation, CRM management, scheduling, billing, and performance reporting

• **Customer Service Representative** at Inspiro/1800 Flowers (Apr–Aug 2023) — order processing, issue resolution, SLA compliance

• **Principal Consultant & Owner** at WJ Construction & Engineering (Sept 2012 – Present) — operations management, team supervision, IT systems, project coordination

• **Pre-Sales Engineer** at Phoenix Solutions (May–July 2012) — proposals, technical support, sales analysis

He holds a **BS in Information Technology (Major in System Engineering)** from Colegio de San Juan de Letran.`,

        services: `Japhette offers these core services:

📋 **Executive VA Support** — inbox/calendar management, scheduling, document organization

⚙️ **Operations Management** — SOP creation, team coordination, process optimization, workflow audits

📊 **CRM & Data Administration** — Salesforce, HubSpot setup/migration, lead database auditing, pipeline reporting

🤖 **AI SOP Engineering** — custom SOP frameworks using ChatGPT, Claude, Gemini; version-controlled documentation

🖥️ **Technical & IT Support** — system diagnostics, platform integrations, staff training

Would you like details on any specific service?`,

        rates: `Here are Japhette's typical rates:

| Service | Hourly | Retainer (20 hrs/wk) |
|---------|--------|----------------------|
| Executive VA | $8–12/hr | $1,200/mo |
| Operations Management | $12–18/hr | $1,800/mo |
| CRM & Data Admin | $10–15/hr | Project: $300–800 |
| AI SOP Engineering | — | Project: $200–600 |
| Technical Support | $10–15/hr | — |

Rates are negotiable based on scope and engagement length. Want to discuss a specific project?`,

        availability: `📍 **Timezone:** Philippine Standard Time (UTC+8)

🕐 **Working Hours:** Monday–Friday, 8AM–6PM PHT

🌐 **Flexibility:** Available for US/EU timezone overlap

✅ **Currently open to:**
• Full-time remote roles
• Part-time retainers
• Project-based engagements

He typically responds within 24 hours.`,

        contact: `You can reach Japhette through:

📧 **Email:** jap.pulido789@gmail.com
📱 **Viber:** 09569027896
💼 **LinkedIn:** linkedin.com/in/japhette-alec-pulido

Or use the contact form on this page — he'll get back to you within 24 hours.

Would you like me to help you draft a message?`,

        tools: `Japhette is proficient in 15+ platforms:

**Productivity:** Google Workspace, Microsoft 365, Notion, ClickUp
**CRM:** Salesforce, Zendesk
**Communication:** Slack, Discord, Lark, Outlook
**AI Tools:** ChatGPT, Claude, Google Gemini
**Technical:** Git/GitHub, SAP, TeamViewer
**Design:** Canva

He specializes in integrating these tools into automated workflows.`,

        skills: `Japhette's core competencies:

**Expert-level:**
• Executive VA Support (96%)
• SOP Writing & Documentation (95%)
• Calendar & Inbox Management (98%)
• Customer Service / Zendesk (98%)
• AI Prompt Engineering (92%)
• CRM Management (94%)

**Proficient:**
• Financial Reconciliation (82%)
• IT Systems & Diagnostics (80%)
• Git Version Control (78%)
• Proposal Writing (84%)`,

        resume: `You can download Japhette's full resume using the **"Download Resume"** button in the hero section above, or I can email it to you.

His resume includes:
• Complete work history
• Education credentials
• Key achievements
• Technical skills
• Character references

Would you like me to highlight anything specific?`,

        ai: `Japhette actively uses AI in his work:

🤖 **AI SOP Engineering** — Uses Google Gemini and ChatGPT to rapidly build cross-departmental SOPs

🔍 **Prompt-Based Code Auditing** — AI-assisted development and system auditing

📊 **AI-Driven Reporting** — Generates business performance summaries faster than manual methods

📝 **Workflow Template Design** — Builds reusable Notion/ClickUp templates

This portfolio itself was built using AI-assisted code generation via Google Gemini.`,

        casestudy: `**Featured Case Study: Fit Body Boot Camp**

**Problem:** 10,000+ unverified leads, no SOPs, billing handled by memory, scheduling conflicts

**Approach:**
• Full CRM audit and deduplication
• AI-engineered complete SOP library using Google Gemini
• Timezone-aware scheduling system
• Structured financial reconciliation process

**Results:**
• 40% admin overhead reduction
• 100% billing accuracy
• 98% customer satisfaction
• 5x faster staff onboarding
• Zero missed executive milestones`,

        hire: `Great choice! Here's how to move forward:

1. **Quick chat:** Email jap.pulido789@gmail.com with your project details
2. **Schedule a call:** Include your timezone and preferred times
3. **Use the contact form:** Right here on this page

Japhette typically responds within 24 hours and can start on most projects within a week.

What type of engagement are you considering?`,

        default: `I can help you learn about:

• **Experience** — Japhette's 14-year career background
• **Services** — What he offers
• **Rates** — Pricing and packages
• **Availability** — Timezone and hours
• **Skills & Tools** — Technical proficiencies
• **Contact** — How to reach him

What would you like to know?`
    };

    // Intent matching
    function getResponse(input) {
        const q = input.toLowerCase().trim();

        if (/experience|background|history|work|career|job|employ|years/.test(q)) {
            return knowledge.experience;
        }
        if (/service|offer|do you do|can you do|help with|provide/.test(q)) {
            return knowledge.services;
        }
        if (/rate|price|cost|charge|fee|hour|retainer|budget|afford/.test(q)) {
            return knowledge.rates;
        }
        if (/available|timezone|time zone|hours|when|schedule|free/.test(q)) {
            return knowledge.availability;
        }
        if (/contact|reach|email|phone|viber|linkedin|talk|message|call/.test(q)) {
            return knowledge.contact;
        }
        if (/tool|platform|software|app|use|tech|stack/.test(q)) {
            return knowledge.tools;
        }
        if (/skill|proficien|expert|good at|capable|competen/.test(q)) {
            return knowledge.skills;
        }
        if (/resume|cv|download|pdf|document/.test(q)) {
            return knowledge.resume;
        }
        if (/ai|artificial|gemini|chatgpt|claude|automat|prompt/.test(q)) {
            return knowledge.ai;
        }
        if (/case|study|project|example|result|achieve|success|fit body|fbbc/.test(q)) {
            return knowledge.casestudy;
        }
        if (/hire|work with|engage|start|begin|onboard|contract/.test(q)) {
            return knowledge.hire;
        }
        if (/hello|hi|hey|good morning|good afternoon|good evening/.test(q)) {
            return `Hey there! 👋 Welcome to Japhette's portfolio. I'm here to answer any questions about his experience, services, or availability. What would you like to know?`;
        }
        if (/thank|thanks|appreciate/.test(q)) {
            return `You're welcome! 😊 Is there anything else you'd like to know about Japhette's services?`;
        }
        if (/bye|goodbye|see you|later/.test(q)) {
            return `Thanks for stopping by! Feel free to reach out anytime. You can contact Japhette directly at jap.pulido789@gmail.com. Have a great day! 👋`;
        }

        return knowledge.default;
    }

    // Add message to chat
    function addMessage(text, isUser = false) {
        const msg = document.createElement('div');
        msg.className = `jp-msg ${isUser ? 'jp-msg-user' : 'jp-msg-bot'}`;
        msg.innerHTML = `<p>${formatMessage(text)}</p>`;
        chatMessages.appendChild(msg);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Simple markdown formatting
    function formatMessage(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    }

    // Toggle chat window
    function toggleChat() {
        const isOpen = chatWindow.classList.contains('open');
        chatWindow.classList.toggle('open');
        iconOpen.style.display = isOpen ? 'block' : 'none';
        iconClose.style.display = isOpen ? 'none' : 'block';
        if (!isOpen) {
            setTimeout(() => chatInput.focus(), 300);
        }
    }

    // Event listeners
    chatToggle.addEventListener('click', toggleChat);
    chatMinimize.addEventListener('click', toggleChat);

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = chatInput.value.trim();
        if (!query) return;

        addMessage(query, true);
        chatInput.value = '';

        // Simulate typing delay
        setTimeout(() => {
            const response = getResponse(query);
            addMessage(response);
        }, 400 + Math.random() * 400);
    });

    // Suggestion buttons
    chatSuggestions.addEventListener('click', (e) => {
        if (e.target.classList.contains('jp-suggestion')) {
            const query = e.target.dataset.query;
            addMessage(query.charAt(0).toUpperCase() + query.slice(1), true);

            setTimeout(() => {
                const response = knowledge[query] || knowledge.default;
                addMessage(response);
            }, 400 + Math.random() * 400);
        }
    });

})();

    // 8. Custom Cursor (desktop / mouse-capable devices only)
    if (window.matchMedia('(pointer: fine)').matches) {
        const dot = document.createElement('div');
        const ring = document.createElement('div');
        dot.className = 'jp-cursor-dot';
        ring.className = 'jp-cursor-ring';
        document.body.appendChild(dot);
        document.body.appendChild(ring);

        let ringX = window.innerWidth / 2, ringY = window.innerHeight / 2;
        let targetX = ringX, targetY = ringY;

        window.addEventListener('mousemove', (e) => {
            targetX = e.clientX;
            targetY = e.clientY;
            dot.style.left = targetX + 'px';
            dot.style.top = targetY + 'px';
        });

        (function trailRing() {
            ringX += (targetX - ringX) * 0.18;
            ringY += (targetY - ringY) * 0.18;
            ring.style.left = ringX + 'px';
            ring.style.top = ringY + 'px';
            requestAnimationFrame(trailRing);
        })();

        const hoverTargets = 'a, button, .magnetic, input, textarea, .strip-item, .service-card';
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest(hoverTargets)) {
                ring.classList.add('jp-cursor-active');
            }
        });
        document.addEventListener('mouseout', (e) => {
            if (e.target.closest(hoverTargets)) {
                ring.classList.remove('jp-cursor-active');
            }
        });
        document.addEventListener('mousedown', () => ring.classList.add('jp-cursor-down'));
        document.addEventListener('mouseup', () => ring.classList.remove('jp-cursor-down'));
    }


}); // END DOMContentLoaded

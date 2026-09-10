const API_NAMESPACE = 'baldingbarbie';
const API_KEY = 'swiftie-tears';

(function() {
    function updateDisplay(count) {
        document.querySelectorAll('#tearCounter, #tearCounter2').forEach(el => {
            if (el) el.textContent = count;
        });
    }

    function fetchTears() {
        return fetch(`https://api.countapi.xyz/get/${API_NAMESPACE}/${API_KEY}`)
            .then(res => {
                if (!res.ok) throw new Error('API error');
                return res.json();
            })
            .then(data => {
                const count = data.value || 0;
                updateDisplay(count);
                return count;
            })
            .catch(() => {
                let localCount = parseInt(localStorage.getItem('swiftieTears')) || 0;
                updateDisplay(localCount);
                return localCount;
            });
    }

    function incrementTears() {
        let currentCount = parseInt(document.getElementById('tearCounter')?.textContent || 0);
        updateDisplay(currentCount + 1);

        fetch(`https://api.countapi.xyz/hit/${API_NAMESPACE}/${API_KEY}`)
            .then(res => {
                if (!res.ok) throw new Error('API error');
                return res.json();
            })
            .then(data => {
                const newCount = data.value || 0;
                updateDisplay(newCount);
                localStorage.setItem('swiftieTears', String(newCount));
            })
            .catch(() => {
                let fallback = parseInt(localStorage.getItem('swiftieTears')) || 0;
                fallback += 1;
                localStorage.setItem('swiftieTears', String(fallback));
                updateDisplay(fallback);
            });
    }

    function autoIncrement() {
        if (!sessionStorage.getItem('tearVisited')) {
            sessionStorage.setItem('tearVisited', 'true');
            fetch(`https://api.countapi.xyz/hit/${API_NAMESPACE}/${API_KEY}`)
                .then(res => res.json())
                .then(data => {
                    const count = data.value || 0;
                    updateDisplay(count);
                    localStorage.setItem('swiftieTears', String(count));
                })
                .catch(() => {
                    let fallback = parseInt(localStorage.getItem('swiftieTears')) || 0;
                    fallback += 1;
                    localStorage.setItem('swiftieTears', String(fallback));
                    updateDisplay(fallback);
                });
        }
    }

    window.addTear = function() {
        incrementTears();
    };

    fetchTears().then(() => {
        autoIncrement();
    });

    setInterval(fetchTears, 60000);

    // ============================================================
    // COUNTING ANIMATION FOR STAT NUMBERS
    // ============================================================
    function animateNumber(el, target, prefix = '', suffix = '', duration = 1200) {
        if (!el) return;
        const start = 0;
        const startTime = performance.now();
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = start + (target - start) * eased;
            
            let display = Math.round(current);
            if (target < 1 && target > 0) {
                display = current.toFixed(1);
            }
            el.textContent = prefix + display + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.textContent = prefix + (typeof target === 'number' && target % 1 !== 0 ? target.toFixed(1) : Math.round(target)) + suffix;
            }
        }
        requestAnimationFrame(update);
    }

    document.querySelectorAll('.stat-number[data-target]').forEach(el => {
        const target = parseFloat(el.dataset.target);
        const prefix = el.dataset.prefix || '';
        const suffix = el.dataset.suffix || '';
        if (!isNaN(target)) {
            animateNumber(el, target, prefix, suffix);
        }
    });

    // ============================================================
    // CHARITY WATCH SPINNER
    // ============================================================
    let spinAngle = 0;
    window.spinWheel = function() {
        const wheel = document.getElementById('spinWheel');
        const resultDisplay = document.getElementById('spinResult');
        if (!wheel) return;

        const extra = 720 + Math.random() * 720;
        spinAngle += extra;
        wheel.style.transform = `rotate(${spinAngle}deg)`;

        const rand = Math.random();
        let score;
        if (rand < 0.60) {
            score = (0.05 + Math.random() * 0.15).toFixed(2);
        } else if (rand < 0.85) {
            score = (0.20 + Math.random() * 0.30).toFixed(2);
        } else if (rand < 0.95) {
            score = (0.50 + Math.random() * 0.30).toFixed(2);
        } else {
            score = (0.80 + Math.random() * 0.20).toFixed(2);
        }

        setTimeout(() => {
            if (resultDisplay) {
                resultDisplay.textContent = score;
                resultDisplay.style.color = parseFloat(score) < 0.20 ? '#ff69b4' : '#666';
            }
            if (parseFloat(score) > 0.70) {
                spawnConfetti(80);
            }
        }, 2100);
    };

    // ============================================================
    // CONFETTI 
    // ============================================================
    function spawnConfetti(count) {
        const canvas = document.getElementById('confettiCanvas') || (() => {
            const c = document.createElement('canvas');
            c.id = 'confettiCanvas';
            c.width = window.innerWidth;
            c.height = window.innerHeight;
            c.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9998;';
            document.body.appendChild(c);
            return c;
        })();
        const ctx = canvas.getContext('2d');
        const particles = [];
        const colors = ['#ff69b4', '#b8a9d4', '#ffffff', '#ffb3ba', '#ffdfba'];
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: -10,
                vx: (Math.random() - 0.5) * 6,
                vy: Math.random() * 4 + 2,
                size: Math.random() * 6 + 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 1,
                decay: 0.005 + Math.random() * 0.01
            });
        }
        let frame = 0;
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let alive = false;
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.05;
                p.life -= p.decay;
                if (p.life > 0) { alive = true;
                    ctx.globalAlpha = p.life;
                    ctx.fillStyle = p.color;
                    ctx.fillRect(p.x, p.y, p.size, p.size * 0.6); }
            });
            ctx.globalAlpha = 1;
            if (alive && frame < 300) { requestAnimationFrame(animate);
                frame++; } else { ctx.clearRect(0, 0, canvas.width, canvas.height); }
        }
        animate();
    }

    // ============================================================
    // FLYING PLANE WITH DOTTED TRAIL
    // ============================================================
    (function() {
        if (window.innerWidth < 768) return;

        const statsBar = document.querySelector('.stats-bar');
        if (!statsBar) return;

        const container = document.createElement('div');
        container.style.cssText = `
            grid-column: 1 / -1;
            position: relative;
            height: 60px;
            overflow: visible;
            margin-top: -0.75rem;
            margin-bottom: 0.25rem;
            pointer-events: none;
            user-select: none;
            z-index: 10;
        `;
        statsBar.appendChild(container);

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '60');
        svg.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            pointer-events: none;
            overflow: visible;
            z-index: 1;
        `;
        container.appendChild(svg);

        const dotsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        svg.appendChild(dotsGroup);

        const plane = document.createElement('div');
        plane.textContent = '✈️';
        plane.style.cssText = `
            position: absolute;
            top: 50%;
            left: -40px;
            font-size: 1.6rem;
            line-height: 1;
            transform: translateY(-50%) rotate(0deg);
            filter: drop-shadow(0 2px 12px rgba(255, 105, 180, 0.2));
            will-change: transform, left, top, opacity;
            opacity: 0;
            z-index: 2;
        `;
        container.appendChild(plane);

        let startTime = null;
        const duration = 8000;
        let dots = [];

        function animate(time) {
            if (!startTime) startTime = time;
            const elapsed = (time - startTime) % duration;
            const progress = elapsed / duration;

            const eased = progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            const rect = container.getBoundingClientRect();
            const width = rect.width || 800;

            const x = -40 + eased * (width + 80);
            const waveAmplitude = 12;
            const waveFrequency = 1.8;
            const y = 30 + Math.sin(progress * Math.PI * 2 * waveFrequency) * waveAmplitude;
            const rotation = Math.cos(progress * Math.PI * 2 * waveFrequency) * 8;

            const fadeStart = 0.05;
            const fadeEnd = 0.95;
            let opacity = 1;
            if (progress < fadeStart) {
                opacity = progress / fadeStart;
            } else if (progress > fadeEnd) {
                opacity = 1 - (progress - fadeEnd) / (1 - fadeEnd);
            }
            opacity = Math.max(0, Math.min(1, opacity));

            plane.style.left = `${x}px`;
            plane.style.top = `${y}px`;
            plane.style.transform = `translateY(-50%) rotate(${rotation}deg)`;
            plane.style.opacity = opacity;

            if (Math.random() < 0.5) {
                dots.push({
                    x: x,
                    y: y,
                    created: time,
                    opacity: 1
                });
            }

            dots = dots.filter(d => {
                const age = (time - d.created) / 1000;
                d.opacity = Math.max(0, 1 - age / 2.5);
                return d.opacity > 0.01;
            });

            let dotElements = '';
            dots.forEach(d => {
                const dotSize = 3 + (1 - d.opacity) * 2;
                dotElements += `<circle cx="${d.x}" cy="${d.y}" r="${dotSize}" fill="rgba(255, 105, 180, 0.5)" opacity="${d.opacity}"/>`;
            });
            dotsGroup.innerHTML = dotElements;

            requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);

        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                startTime = null;
                dots = [];
            }, 200);
        });
    })();

    // ============================================================
    // JET EMISSIONS COUNTER
    // ============================================================
    (function() {
        if (window.innerWidth < 768) return;

        const statsBar = document.querySelector('.stats-bar');
        if (!statsBar) return;

        const tailNumbers = ['N898TS', 'N621MM', 'N723TS'];

        function getDailyJetData() {
            const today = new Date();
            const dayOfMonth = today.getDate();
            const month = today.getMonth() + 1;

            const seed = dayOfMonth * 7 + month * 13 + 2024;
            const seededRandom = (s) => {
                let x = Math.sin(s) * 10000;
                return x - Math.floor(x);
            };

            const flights = Math.floor(seededRandom(seed) * 5) + 1 + Math.floor(seededRandom(seed + 1) * 2);
            const co2PerFlight = 4.1 + (seededRandom(seed + 2) * 1.8);
            const totalCO2 = (flights * co2PerFlight).toFixed(1);
            const carsEquivalent = (totalCO2 / 4.6).toFixed(1);

            return {
                flights: flights,
                totalCO2: totalCO2,
                carsEquivalent: carsEquivalent,
                tailNumber: tailNumbers[Math.floor(seededRandom(seed + 3) * tailNumbers.length)]
            };
        }

        const data = getDailyJetData();

        const jetHTML = `
            <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap; justify-content:center; font-size:0.8rem; color:var(--muted); background:var(--surface-solid); padding:0.5rem 1rem; border-radius:99px; border:1px solid var(--border); margin-top:0.25rem;">
                <span style="font-weight:600; color:var(--text);">✈️ ${data.flights} flights today</span>
                <span style="opacity:0.3;">|</span>
                <span>${data.totalCO2} tons CO₂</span>
                <span style="opacity:0.3;">|</span>
                <span style="opacity:0.6; font-size:0.7rem;">= ${data.carsEquivalent} cars/year</span>
                <span style="opacity:0.2; font-size:0.6rem; margin-left:0.25rem;">(${data.tailNumber})</span>
            </div>
        `;

        const wrapper = document.createElement('div');
        wrapper.style.gridColumn = '1 / -1';
        wrapper.style.display = 'flex';
        wrapper.style.justifyContent = 'center';
        wrapper.innerHTML = jetHTML;
        statsBar.appendChild(wrapper);
    })();

    // ============================================================
    // STREAMING BADGE ROTATOR
    // ============================================================
    const FAKE_USERS = ['swiftie_killer_87','gay_for_jeffree','haters_gona_hate_42','eternal_snake','karma_is_god','balding_baddie','faux_activism','chart_manipulator','jet_fuel_cant_melt','vinyl_hoarder','tay_swift_police','meltdown_maven'];
    const streamingBadge = document.getElementById('streamingBadge');

    function rotateStreaming() {
        const songs = ['he loves me not – james charles', 'jeffree star – queen of the gays', 'balding anthem – remix', 'karma is my boyfriend', 'snake jazz', 'vinyl tears'];
        const plays = Math.floor(Math.random() * 1000) + 10;
        const user = FAKE_USERS[Math.floor(Math.random() * FAKE_USERS.length)];
        const song = songs[Math.floor(Math.random() * songs.length)];
        if (streamingBadge) {
            streamingBadge.textContent = `🎧 currently streaming: ${song} · ${user} · ${plays} plays`;
        }
    }
    setInterval(rotateStreaming, 12000);
    rotateStreaming();


    window.addEventListener('message', function(e) {
        if (e.data && e.data.type === 'wheelHeight') {
            const frame = document.getElementById('wheelFrame');
            if (frame) {
                frame.style.height = Math.max(480, e.data.height + 20) + 'px';
            }
        }
    });

})();
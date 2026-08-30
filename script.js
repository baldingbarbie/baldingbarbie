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

        // SVG layer for dots
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

        // Plane
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

            // Add a dot every ~2 frames (creates 5-7 visible dots)
            if (Math.random() < 0.5) {
                dots.push({
                    x: x,
                    y: y,
                    created: time,
                    opacity: 1
                });
            }

            // Keep only recent dots (fade out over 2.5 seconds)
            dots = dots.filter(d => {
                const age = (time - d.created) / 1000;
                d.opacity = Math.max(0, 1 - age / 2.5);
                return d.opacity > 0.01;
            });

            // Render dots
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
})();
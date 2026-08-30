const API_NAMESPACE = import.meta.env.VITE_API_NAMESPACE;
const API_KEY = import.meta.env.VITE_API_KEY;

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

    // Flying plane (unchanged)
    (function() {
        if (window.innerWidth < 768) return;

        const statsBar = document.querySelector('.stats-bar');
        if (!statsBar) return;

        const container = document.createElement('div');
        container.style.cssText = `
            grid-column: 1 / -1;
            position: relative;
            height: 56px;
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
        svg.setAttribute('height', '56');
        svg.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            pointer-events: none;
            overflow: visible;
            z-index: 1;
        `;
        container.appendChild(svg);

        const trail = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        trail.setAttribute('fill', 'none');
        trail.setAttribute('stroke', 'rgba(255, 105, 180, 0.35)');
        trail.setAttribute('stroke-width', '2.5');
        trail.setAttribute('stroke-linecap', 'round');
        trail.setAttribute('stroke-dasharray', '6 10');
        svg.appendChild(trail);

        const planeWrapper = document.createElement('div');
        planeWrapper.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 2;
        `;
        container.appendChild(planeWrapper);

        const plane = document.createElement('div');
        plane.textContent = '✈️';
        plane.style.cssText = `
            position: absolute;
            top: 50%;
            left: -50px;
            font-size: 1.6rem;
            line-height: 1;
            transform: translateY(-50%) rotate(0deg);
            filter: drop-shadow(0 2px 12px rgba(255, 105, 180, 0.25));
            will-change: transform, left, opacity;
            opacity: 0;
        `;
        planeWrapper.appendChild(plane);

        let startTime = null;
        const duration = 9000;
        const trailLength = 180;

        function animate(time) {
            if (!startTime) startTime = time;
            const elapsed = (time - startTime) % duration;
            const progress = elapsed / duration;

            const eased = progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            const rect = container.getBoundingClientRect();
            const width = rect.width || 800;

            const x = -50 + eased * (width + 80);
            const baseY = 28;
            const rotation = Math.sin(progress * Math.PI * 2 * 1.1) * 12;

            let opacity = 1;
            const fadeStart = 0.05;
            const fadeEnd = 0.95;
            if (progress < fadeStart) {
                opacity = progress / fadeStart;
            } else if (progress > fadeEnd) {
                opacity = 1 - (progress - fadeEnd) / (1 - fadeEnd);
            }
            opacity = Math.max(0, Math.min(1, opacity));

            plane.style.left = `${x}px`;
            plane.style.top = `${baseY}px`;
            plane.style.transform = `translateY(-50%) rotate(${rotation}deg)`;
            plane.style.opacity = opacity;

            const trailPoints = [];
            const steps = 35;
            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                const trailX = x - t * trailLength;
                const trailY = baseY + Math.sin((progress - t * 0.14) * Math.PI * 2 * 1.1) * 8;
                trailPoints.push(`${trailX.toFixed(1)},${trailY.toFixed(1)}`);
            }
            trail.setAttribute('d', `M${trailPoints.join(' L')}`);
            trail.setAttribute('opacity', String(opacity * 0.9));

            requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);

        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                startTime = null;
            }, 200);
        });
    })();

    // Jet emissions counter
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
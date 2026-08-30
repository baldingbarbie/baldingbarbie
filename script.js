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
    // FLYING PLANE WITH RANDOM FLIGHT PATH + DOTTED TRAIL
    // ============================================================
    (function() {
        if (window.innerWidth < 768) return;

        const statsBar = document.querySelector('.stats-bar');
        if (!statsBar) return;

        const container = document.createElement('div');
        container.style.cssText = `
            grid-column: 1 / -1;
            position: relative;
            height: 100px;
            overflow: visible;
            margin-top: -1.5rem;
            margin-bottom: 0.25rem;
            pointer-events: none;
            user-select: none;
            z-index: 10;
        `;
        statsBar.appendChild(container);

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100');
        svg.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            pointer-events: none;
            overflow: visible;
            z-index: 1;
        `;
        container.appendChild(svg);

        const trailGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        svg.appendChild(trailGroup);

        const plane = document.createElement('div');
        plane.textContent = '✈️';
        plane.style.cssText = `
            position: absolute;
            top: 50%;
            left: -50px;
            font-size: 1.8rem;
            line-height: 1;
            transform: translateY(-50%) rotate(0deg);
            filter: drop-shadow(0 2px 12px rgba(255, 105, 180, 0.25));
            will-change: transform, left, top, opacity;
            opacity: 0;
            z-index: 2;
        `;
        container.appendChild(plane);

        let startTime = null;
        const baseDuration = 10000;
        let duration = baseDuration;
        let dots = [];
        let currentPath = {};

        function generatePath() {
            const rect = container.getBoundingClientRect();
            const width = rect.width || 800;
            const height = 100;

            const loops = Math.floor(Math.random() * 3) + 1;
            const entry = Math.random() > 0.5 ? 'left' : 'right';
            const exit = entry === 'left' ? 'right' : 'left';
            const speedVariation = 0.9 + Math.random() * 0.2;

            const loopData = [];
            for (let i = 0; i < loops; i++) {
                const size = 50 + Math.random() * 85;
                const dir = Math.random() > 0.5 ? 1 : -1;
                const offsetX = (i + 1) / (loops + 1);
                loopData.push({ size, dir, offsetX });
            }

            return {
                loops: loops,
                entry: entry,
                exit: exit,
                speedVariation: speedVariation,
                loopData: loopData,
                width: width,
                height: height,
                trail: []
            };
        }

        function getPosition(progress, path) {
            const { width, height, loopData, entry } = path;
            const startX = entry === 'left' ? -60 : width + 60;
            const endX = entry === 'left' ? width + 60 : -60;
            const totalProgress = progress;

            let x, y, rotation = 0;

            if (loopData.length === 0) {
                const eased = totalProgress < 0.5
                    ? 2 * totalProgress * totalProgress
                    : 1 - Math.pow(-2 * totalProgress + 2, 2) / 2;
                x = startX + eased * (endX - startX);
                y = height / 2 + Math.sin(totalProgress * Math.PI * 2 * 1.5) * 15;
                rotation = Math.sin(totalProgress * Math.PI * 2 * 1.5) * 8;
                return { x, y, rotation };
            }

            let loopProgress = totalProgress * (loopData.length + 1);
            let loopIndex = Math.floor(loopProgress);
            let localProgress = loopProgress - loopIndex;

            if (loopIndex < 0) loopIndex = 0;
            if (loopIndex > loopData.length) loopIndex = loopData.length;

            if (loopIndex === 0) {
                const eased = localProgress < 0.5
                    ? 2 * localProgress * localProgress
                    : 1 - Math.pow(-2 * localProgress + 2, 2) / 2;
                const startOffset = entry === 'left' ? 0 : width;
                const endOffset = entry === 'left' ? width * 0.15 : width * 0.85;
                x = startX + eased * (endOffset - startX);
                y = height / 2 + Math.sin(localProgress * Math.PI * 2 * 0.5) * 10;
                rotation = Math.sin(localProgress * Math.PI * 2 * 0.5) * 6;
                return { x, y, rotation };
            }

            if (loopIndex === loopData.length) {
                const eased = localProgress < 0.5
                    ? 2 * localProgress * localProgress
                    : 1 - Math.pow(-2 * localProgress + 2, 2) / 2;
                const startOffset = entry === 'left' ? width * 0.85 : width * 0.15;
                x = startOffset + eased * (endX - startOffset);
                y = height / 2 + Math.sin(localProgress * Math.PI * 2 * 0.5) * 10;
                rotation = Math.sin(localProgress * Math.PI * 2 * 0.5) * 6;
                return { x, y, rotation };
            }

            const loop = loopData[loopIndex - 1];
            const loopStart = (loopIndex - 1) / (loopData.length + 1);
            const loopEnd = loopIndex / (loopData.length + 1);
            const loopLength = loopEnd - loopStart;
            const loopPos = (totalProgress - loopStart) / loopLength;

            const loopProgressEased = loopPos < 0.5
                ? 2 * loopPos * loopPos
                : 1 - Math.pow(-2 * loopPos + 2, 2) / 2;

            const centerX = width * 0.15 + (loopIndex - 1) * (width * 0.7 / (loopData.length - 0.5));
            const centerY = height / 2;

            const angle = loopProgressEased * Math.PI * 2 * loop.dir;
            const loopSize = loop.size;

            x = centerX + Math.sin(angle) * loopSize;
            y = centerY - Math.cos(angle) * loopSize * 0.6;

            rotation = Math.sin(angle) * 25 * loop.dir;

            return { x, y, rotation };
        }

        function animate(time) {
            if (!startTime) {
                startTime = time;
                currentPath = generatePath();
                duration = baseDuration * currentPath.speedVariation;
                dots = [];
            }

            const elapsed = (time - startTime) % duration;
            const progress = elapsed / duration;

            const pos = getPosition(progress, currentPath);
            const rect = container.getBoundingClientRect();
            const width = rect.width || 800;

            let x = pos.x;
            let y = pos.y;

            if (x < -100 || x > width + 100) {
                const fadeProgress = Math.abs(x + 60) / 100;
                plane.style.opacity = Math.max(0, 1 - fadeProgress * 0.3);
            } else {
                const fadeIn = Math.min(1, (x + 60) / 100);
                const fadeOut = Math.min(1, (width + 60 - x) / 100);
                plane.style.opacity = Math.min(fadeIn, fadeOut, 1);
            }

            plane.style.left = `${x}px`;
            plane.style.top = `${y}px`;
            plane.style.transform = `translateY(-50%) rotate(${pos.rotation}deg)`;

            dots.push({
                x: x,
                y: y,
                created: time,
                opacity: 1,
                size: 3 + Math.random() * 2
            });

            if (dots.length > 40) {
                dots.shift();
            }

            dots = dots.filter(d => {
                const age = (time - d.created) / 1000;
                d.opacity = Math.max(0, 1 - age / 2.5);
                return d.opacity > 0.01;
            });

            const dotGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            dots.forEach(d => {
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', String(d.x));
                circle.setAttribute('cy', String(d.y));
                circle.setAttribute('r', String(d.size));
                circle.setAttribute('fill', 'rgba(255, 105, 180, 0.6)');
                circle.setAttribute('opacity', String(d.opacity));
                dotGroup.appendChild(circle);
            });

            trailGroup.innerHTML = '';
            trailGroup.appendChild(dotGroup);

            requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);

        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                startTime = null;
                currentPath = generatePath();
                dots = [];
            }, 300);
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
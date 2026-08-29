(function() {
    const API_NAMESPACE = 'baldingbarbie';
    const API_KEY = 'swiftie-tears';

    // Helper to update the DOM with the current count
    function updateDisplay(count) {
        document.querySelectorAll('#tearCounter, #tearCounter2').forEach(el => {
            if (el) el.textContent = count;
        });
    }

    // Fetch current count from API
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
                console.warn('API unavailable, falling back to localStorage');
                let localCount = parseInt(localStorage.getItem('swiftieTears')) || 0;
                updateDisplay(localCount);
                return localCount;
            });
    }

    // Increment count on API and update display
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
                console.warn('API increment failed, using localStorage fallback');
                let fallback = parseInt(localStorage.getItem('swiftieTears')) || 0;
                fallback += 1;
                localStorage.setItem('swiftieTears', String(fallback));
                updateDisplay(fallback);
            });
    }

    // Auto-increment on first visit (per session)
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

    // Expose the increment function globally
    window.addTear = function() {
        incrementTears();
    };

    // Initialize tears counter
    fetchTears().then(() => {
        autoIncrement();
    });

    // Re-fetch count every 60 seconds
    setInterval(fetchTears, 60000);

    // ============================================================
    // TODAY'S JET EMISSIONS
    // ============================================================
    (function() {
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
            <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap; justify-content:center; font-size:0.8rem; color:var(--muted); background:var(--surface-solid); padding:0.5rem 1rem; border-radius:99px; border:1px solid var(--border); margin-top:0.5rem;">
                <span style="font-weight:600; color:var(--text);">✈️ ${data.flights} flights today</span>
                <span style="opacity:0.3;">|</span>
                <span>${data.totalCO2} tons CO₂</span>
                <span style="opacity:0.3;">|</span>
                <span style="opacity:0.6; font-size:0.7rem;">= ${data.carsEquivalent} cars/year</span>
                <span style="opacity:0.2; font-size:0.6rem; margin-left:0.25rem;">(${data.tailNumber})</span>
            </div>
        `;

        const insertPoint = document.querySelector('.stats-bar');
        if (insertPoint) {
            const wrapper = document.createElement('div');
            wrapper.style.gridColumn = '1 / -1';
            wrapper.style.display = 'flex';
            wrapper.style.justifyContent = 'center';
            wrapper.innerHTML = jetHTML;
            insertPoint.appendChild(wrapper);
        }
    })();
})();
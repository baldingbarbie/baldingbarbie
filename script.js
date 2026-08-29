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
                // Fallback to localStorage if API is down
                console.warn('API unavailable, falling back to localStorage');
                let localCount = parseInt(localStorage.getItem('swiftieTears')) || 0;
                updateDisplay(localCount);
                return localCount;
            });
    }

    // Increment count on API and update display
    function incrementTears() {
        // Optimistic UI update (so it feels instant)
        let currentCount = parseInt(document.getElementById('tearCounter')?.textContent || 0);
        updateDisplay(currentCount + 1);

        // Actually increment on the API
        fetch(`https://api.countapi.xyz/hit/${API_NAMESPACE}/${API_KEY}`)
            .then(res => {
                if (!res.ok) throw new Error('API error');
                return res.json();
            })
            .then(data => {
                const newCount = data.value || 0;
                updateDisplay(newCount);
                // Also sync localStorage for fallback
                localStorage.setItem('swiftieTears', String(newCount));
            })
            .catch(() => {
                // Fallback: use localStorage if API fails
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
                    // Fallback for auto-increment
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

    // Initialize
    fetchTears().then(() => {
        autoIncrement();
    });

    // Re-fetch count every 60 seconds (so multiple tabs stay in sync)
    setInterval(fetchTears, 60000);
})();
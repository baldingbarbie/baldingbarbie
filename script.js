(function () {
    const tearKey = "swiftieTears";
    let tears = parseInt(localStorage.getItem(tearKey)) || 0;

    const updateDisplays = () => {
        document.querySelectorAll("#tearCounter, #tearDisplay").forEach((el) => {
            if (el) el.textContent = tears;
        });
    };

    window.addTear = function () {
        tears += 1;
        localStorage.setItem(tearKey, String(tears));
        updateDisplays();
    };

    updateDisplays();
})();

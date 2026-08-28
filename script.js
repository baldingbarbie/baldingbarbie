(function () {
    let tears = localStorage.getItem("swiftieTears") ? parseInt(localStorage.getItem("swiftieTears")) : 0;
    const counter = document.getElementById("tearCount");
    if (counter) counter.innerText = tears;

    window.addTear = function () {
        tears++;
        localStorage.setItem("swiftieTears", tears);
        const el = document.getElementById("tearCount");
        if (el) el.innerText = tears;
    };
})();

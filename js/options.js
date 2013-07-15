function getCurrency(callback) {
    return chrome.storage.local.get("currencyVal", 
        function (data) {
            callback(data["currencyVal"] || "usd");
        });
}

function initOptionsValues() {
    var val = document.getElementById("currencyVal");
    if (val === null)
        return;

    val.addEventListener("change", saveSettings);
    getCurrency(function (value) {
        val.value = value;
    });
};

function saveSettings() {
    var val = document.getElementById("currencyVal");
    if (val === null)
        return;

    var obj = new Object();
    obj["currencyVal"] = val.value;

    chrome.storage.local.set(obj, null);
};

window.onload = initOptionsValues;
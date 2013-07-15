var dest = null;

function getUrl(input) {
    return "https://www.google.com/ig/calculator?hl=en&q=" + input + "=?" + dest;
}

var summ = 0;
var summ_el = null;
var total = null;

var totalText = chrome.i18n.getMessage("total") + ": ";


function updateSumm() {
    if (summ_el == null) {

        var title = document.getElementsByClassName("tableview-title");

        if (title.length >= 2) {
            var parent = title[1].parentElement;
            summ_el = document.createElement("div");
            summ_el.className = "section-header amountBase";
            parent.appendChild(summ_el);

            total = document.createTextNode();
            summ_el.appendChild(total);

            var currency = document.createElement("select");
            currency.innerHTML = currensies;
            summ_el.appendChild(currency);
            currency.value = dest;

            currency.addEventListener("change", saveSettings);
        }
    }
    total.textContent = totalText + summ.toFixed(2);
}

function convert(el) {
    if (el instanceof Element == false)
        return;

    var status = el.getElementsByClassName("statusColumn");
    var amount = el.getElementsByClassName("amountBase");

    if ((status.length != amount.length) || (amount.length == 0)) {
        summ = 0;
        return;
    }

    for (var n = 0; n < amount.length; n++) {
        if (status[n].textContent === "")
            addToElement(amount[n]);
    }
}

function fixCurrency(input) {
    return input.replace("AU$", "AUD");
}

function addToElement(text) {
    var price = text.textContent.replace(String.fromCharCode(160), "");

    var patt = /([^0-9.,]*)([0-9.,]*)([^0-9.,]*)/gi

    
    var parsed = patt.exec(price);

    if ((parsed === null) || (parsed.length < 4))
        return;

    var value = parsed[2];
    var currency = parsed[1] != "" ? parsed[1] : parsed[3];

    currency = fixCurrency(currency);
    price = value + currency;
    var url = getUrl(price);
    var obj = $.get(url);
    obj["element"] = text;
    obj.success(callback);
}

function callback(data, textStatus, jqXHR) {
    data = data.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":');
    var json = JSON.parse(data);
    var text = jqXHR["element"];
    var val = Number(json["rhs"].split(" ")[0].replace(",", "."));

    if (val < 0.01)
        return;

    summ += val;
    updateSumm();

    text.textContent = val.toFixed(2) + " " + dest + " (" + text.textContent + ")";
}


function handle(event) {
    if (dest != null) {
        convert(event.target);
    }
    else
        getCurrency(
            function (val) {
                dest = val;
                handle(event);
            });
}

document.addEventListener("DOMNodeInserted", handle);

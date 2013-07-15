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
            addToElement(amount[n], status[n]);
    }
}

function fixCurrency(input) {
    return input.replace("AU$", "AUD");
}

function addToElement(text, status) {
    var currency = text.textContent.replace(String.fromCharCode(160),"");
    currency = fixCurrency(currency);
    var url = getUrl(currency);
    var obj = $.get(url);
    obj["element"] = text;
    obj["statusElement"] = status;
    obj.success(callback);
}

function callback(data, textStatus, jqXHR) {
    data = data.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":');
    var json = JSON.parse(data);
    var text = jqXHR["element"];
    var val = Number(json["rhs"].split(" ")[0].replace(",", "."));

    if (val < 0.01)
        return;

    var status = jqXHR["statusElement"];
    summ += val;
    updateSumm();

    status.textContent = val.toFixed(2) + " " + dest;
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

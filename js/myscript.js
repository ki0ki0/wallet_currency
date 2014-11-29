var s = document.createElement('script');
s.src = chrome.extension.getURL('js/inject.js');
s.onload = function() {
    this.parentNode.removeChild(this);
};
(document.head||document.documentElement).appendChild(s);

var destCurrency = null;

function getUrl(amount, from) {
    return "https://www.google.com/finance/converter?a=" + amount + "&from=" + from + "&to=" + destCurrency;
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
            summ_el.className = "section-header";
            summ_el.style.position = "absolute";
            summ_el.style.right = "21px";
            parent.appendChild(summ_el);

            total = document.createTextNode("");
            summ_el.appendChild(total);

            var currency = document.createElement("select");
            currency.innerHTML = currensies;
            summ_el.appendChild(currency);
            currency.value = destCurrency;

            currency.addEventListener("change", saveSettings);
        }
    }
    total.textContent = totalText + summ.toFixed(2);
}

function getValue(data, element) {
    var rx = new RegExp(/<span class=bld>([0-9.]*) /gi);
    var res = rx.exec(data);
    if (res == null || res.length < 2)
        return null;

    return (res[1] / 1);
}

function fillValue(element, amount, from) {
    var url = getUrl(amount, from);
    var obj = new XMLHttpRequest();
    obj.open("GET", url);
    obj.addEventListener('load', function () {
        var val = getValue(this.responseText) || amount;
        summ += val;
        updateSumm();

        element.textContent = val.toFixed(2) + " " + destCurrency + " (" + element.textContent + ")";
    });
    obj.send();
}

var prs = new Array();

function handleEvent(event) {
    var resp = JSON.parse(event.detail);
    var result = resp["result"];

    if (result.length == 0)
        return;

    var data = result["4"];
    if (data === undefined)
        return;

    var amounts = document.getElementsByClassName("amountBase");
    if (amounts.length != prs.length + data.length) {
        prs = new Array();
    }

    for (var n = 0; n < data.length; n++) {
        var i = prs.length;
        prs[i] = null;

        var one = data[n]["1"]
        if (one === undefined)
            continue;

        var one17 = one["17"]
        if (one17 === undefined)
            continue;

        var status = one17["3"];
        if (status != 3)
            continue;

        var six = one["6"];
        if (six === undefined)
            continue;

        prs[i] = six;
    }

    if (prs.length != amounts.length) {
        return;
    }

    summ = 0;
    for (var n = 0; n < amounts.length; n++) {
        var pr = prs[n];
        if (pr == null)
            continue;

        var value = pr["1"] / 1000000;
        if (value < 0.1)
            continue;

        var item = amounts[n];

        if (item["processed"] == "yes")
            continue;
        item["processed"] = "yes";

        var currency = pr["2"];
        fillValue(item, value, currency);
    }
}


function onEvent(event) {
    if (destCurrency != null) {
        handleEvent(event);
    }
    else
        getCurrency(
            function (val) {
                destCurrency = val;
                handleEvent(event);
            });
}

var rpcTransactions = "rpc/transactions";
document.addEventListener(rpcTransactions, onEvent, false);

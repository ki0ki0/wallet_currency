var s = document.createElement('script');
s.src = chrome.extension.getURL('js/inject.js');
s.onload = function() {
    this.parentNode.removeChild(this);
};
(document.head||document.documentElement).appendChild(s);

var dest = null;

function getUrl(amount, from) {
    return "https://www.google.com/finance/converter?a=" + amount + "&from=" + from + "&to=" + dest;
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
            currency.value = dest;

            currency.addEventListener("change", saveSettings);
        }
    }
    total.textContent = totalText + summ.toFixed(2);
}

var prs = new Array();

function convert(event) {
    var detail = event.detail;

    var resp = JSON.parse(detail);
    var result = resp["result"];

    if (result.length == 0)
        return;

    var data = result["4"];

    var amounts = document.getElementsByClassName("amountBase");
    if (amounts.length != prs.length + data.length) {
        prs = new Array();
    }

    for (var n = 0; n < data.length; n++) {
        var pr = data[n]["1"]["6"];
        prs[prs.length] = pr;
    }

    if (prs.length != amounts.length) {
        console.log(prs.length);
        console.log(amounts.length);
        return;
    }

    summ = 0;
    for (var n = 0; n < amounts.length; n++) {
        var pr = prs[n];
        var amount = pr["1"] / 1000000;
        if (amount < 0.1)
            continue;

        var currency = pr["2"]
        addToElement(amounts[n], amount, currency);
    }
}


function addToElement(element, amount, from) {
    var url = getUrl(amount, from);
    var obj = new XMLHttpRequest();
    obj.open("GET", url);
    obj.addEventListener('load', function () {
        callback(this.responseText, element);
    });
    obj.send();
}

function callback(data, element) {
    var rx = new RegExp(/<span class=bld>([0-9.]*) /gi);
    var res = rx.exec(data);
    if (res == null || res.length < 2)
        return;

    var val = res[1] / 1;

    summ += val;
    updateSumm();

    element.textContent = val.toFixed(2) + " " + dest + " (" + element.textContent + ")";
}


function handle(event) {
    if (dest != null) {
        convert(event);
    }
    else
        getCurrency(
            function (val) {
                dest = val;
                convert(event);
            });
}

var rpcTransactions = "rpc/transactions";
document.addEventListener(rpcTransactions, handle, false);

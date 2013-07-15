var dest = "uah";
var total = "Total";

function getUrl(input) {
    return "https://www.google.com/ig/calculator?hl=en&q=" + input + "=?" + dest;
}
var summ = 0;
var summ_el = null;

function addSumm() {
    if (summ_el != null)
        return;
    var title = document.getElementsByClassName("tableview-title");
    if (title.length >= 2) {
        var parent = title[1].parentElement;
        summ_el = document.createElement("div");
        summ_el["id"] = "summ";
        summ_el.className = "amountBase";
        parent.appendChild(summ_el);
    }
}


function convert(el) {
    if (el instanceof Element == false)
        return;
    var val = el.getElementsByClassName("amountBase");
    for (var n = 0; n < val.length; n++) {
        var text = val[n].firstChild;
        if (text == undefined)
            continue;
        var add = val[n].className.indexOf("GFNWY5GDMI") < 0;
        addToElement(text, add);        
    }

    //var val = el.getElementsByClassName("gwt-Label");
    //for (var n = 0; n < val.length; n++) {
    //    var text = val[n].firstChild;
    //    if (text == undefined)
    //        continue;
    //    addToElement(text, false);
    //}
}

function addToElement(text, add) {
    var obj = $.get(getUrl(text.textContent.replace(String.fromCharCode(160), "")));
    obj["element"] = text;
    obj["add"] = add;
    obj.success(function (data, textStatus, jqXHR) {
        data = data.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":');
        var json = JSON.parse(data);
        var text = jqXHR["element"];
        var val = Number(json["rhs"].split(" ")[0].replace(",", "."));
        if (val < 0.01)
            return;
        if (jqXHR["add"])
            summ += val;
        if (summ_el != null)
            summ_el.innerHTML = total + ": " + summ.toFixed(2);
        text.textContent = text.textContent + " " + val.toFixed(2);
        //text.innerHTML = text.textContent + " " + val.toFixed(2);
    });
}


function handle(event) {
    addSumm();
    convert(event.target);
}

document.addEventListener("DOMNodeInserted", handle);

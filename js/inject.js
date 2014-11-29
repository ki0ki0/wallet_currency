(function() {
    var XHR = XMLHttpRequest.prototype;
    // Remember references to original methods
    var open = XHR.open;
    var send = XHR.send;

    // Overwrite native methods
    // Collect data: 
    XHR.open = function(method, url) {
        this._method = method;
        this._url = url;
        return open.apply(this, arguments);
    };

    // Implement "ajaxSuccess" functionality
    XHR.send = function(postData) {
        this.addEventListener('load', function() {
			process(this._url,this.responseText);
        });
        return send.apply(this, arguments);
    };
})();

function process(url, body) {
    var rpcTransactions = "rpc/transactions";
    if (url.indexOf(rpcTransactions) == -1)
	    return;

    var event = new CustomEvent(rpcTransactions, { 'detail': body });
    document.dispatchEvent(event);
}


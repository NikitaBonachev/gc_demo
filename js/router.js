'use strict';

class Router {
    redirect (from, to) {    
        var newPath = window.location.pathname.replace(from, to)
        window.location.replace(window.location.origin + newPath + window.location.search);
        console.log(newPath);
    }
}

var router = new Router();
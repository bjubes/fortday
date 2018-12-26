class ResourceLoader {

    constructor(){
        this.resourceCache = {}
        this.loading = [];
        this.readyCallbacks = [];
    }

    // Load an image url or an array of image urls
    load(urlOrArr) {
        var resourceLoader = this
        if(urlOrArr instanceof Array) {
            urlOrArr.forEach(function(url) {
                resourceLoader._load(url);
            });
        }
        else {
            this._load(urlOrArr);
        }
    }

    _load(url) {
        var resourceLoader = this
        if(this.resourceCache[url]) {
            return this.resourceCache[url];
        }
        else {
            var img = new Image();
            img.onload = function() {
                resourceLoader.resourceCache[url] = img;

                if(resourceLoader.isReady()) {
                    resourceLoader.readyCallbacks.forEach(function(func) { func(); });
                }
            };
            this.resourceCache[url] = false;
            img.src = url;
        }
    }

    get(url) {
        return this.resourceCache[url];
    }

    isReady() {
        var ready = true;
        for(var k in this.resourceCache) {
            if(this.resourceCache.hasOwnProperty(k) &&
               !this.resourceCache[k]) {
                ready = false;
            }
        }
        return ready;
    }

    onReady(func) {
        this.readyCallbacks.push(func);
    }
}


window.resources = new ResourceLoader()
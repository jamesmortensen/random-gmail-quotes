// fade-in-out.js - https://github.com/jamesmortensen/fade-in-out-visibility @d6c9febb630e43e7bb3ac3997198fd8968cec139 - Sat Sep 17 14:26:23 2022 +0530

/*
Similar to jQuery's fadeIn and fadeOut, except relies on visibility and opacity instead of display, 
which preserves element height and width.
*/

class ElementFader {

    constructor(selector, doc) {
        doc = doc || window.document;
        this.selector = selector;
        this.elem = doc.querySelector(selector);
        this.opacity = parseFloat(this.elem.style.opacity);
        this.queue = [];
        this.interval = null;
    }

    fadeIn() {
        if(this.queue.length === 4)
            this.queue.shift();
        this.queue.push(this.#fadeIn);
        if (this.interval === null) {
            this.queue.shift()(this);
        }
    }

    fadeOut() {
        if(this.queue.length === 4)
            this.queue.shift();
        this.queue.push(this.#fadeOut);
        if (this.interval === null) {
            this.queue.shift()(this);
        }
    }

    #fadeIn(that) {
        that.interval = setInterval(((_this) => {
            return function () {
                _this.opacity = Math.round( (_this.opacity + .1) * 10 ) / 10;
                _this.elem.style.opacity = _this.opacity;
                if (_this.opacity >= 1) {
                    clearInterval(_this.interval);
                    _this.interval = null;
                    if (_this.queue.length > 0)
                        _this.queue.shift()(_this);
                }
            }
        })(that), 80); // increased to 80 from 100
    }

    #fadeOut(that) {
        that.interval = setInterval(((_this) => {
            return function () {
                _this.opacity = Math.round( (_this.opacity - .1) * 10 ) / 10; 
                _this.elem.style.opacity = _this.opacity;
                if (_this.opacity <= 0) {
                    clearInterval(_this.interval);
                    _this.interval = null;
                    if (_this.queue.length > 0)
                        _this.queue.shift()(_this);
                }
            }
        })(that), 80); // increased to 80 from 100
    }

    getOpacity() {
        return this.opacity;
    }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = ElementFader;

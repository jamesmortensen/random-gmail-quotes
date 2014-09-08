// KeyFilterer.js

/**

The MIT License (MIT)

Copyright (c) 2014 James Mortensen

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/


/**
 * Helps determine if some modifier keys should fire off events. This is useful to 
 * prevent certain modifier keys from firing off events needlessly. Think of this
 * as a keyCode blacklist.
 */
function KeyFilterer() {

	/**
	 * List of keyup keyCodes to filter out.
	 */
	var tab = 9;
	var shiftKey = 16;
	var ctrlKey = 17;
	var altKey = 18;
	var cmdKey = 91;
	var left = 37;
	var up = 38;
	var right = 39;
	var down = 40;
	var keysToFilter = [
		tab,
		shiftKey,
		ctrlKey,
		altKey,
		cmdKey,
		left,
		up,
		right,
		down
	];
	keysToFilter.sort();


	/**
	 * Takes a keyCode and returns true if the key is not to be filtered out.
	 *
	 * @param {Integer} keyCode The keyCode to check against the filter.
	 * @return {Boolean} true if keyCode is not in the filter; otherwise, false.
	 */
	this.isValidKey = function(keyCode) {
		return (keysToFilter.indexOf(keyCode) === -1);
	};
}
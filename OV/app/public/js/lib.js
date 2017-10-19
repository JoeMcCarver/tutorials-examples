var config = require('../../../_config/config');
var logger = require('../../../_util/logger');

logger.log('Loading --> lib');
var global = window;
global.DOC = $(document);
global.LOG = function (args) {
	logger.log(args);
};
var lib = {};
lib.addJavascript = function (fileName, tag, cb) {
	var elem = $(tag);
	var script = $('<script></script>');
	script.attr('type', 'text/javascript');
	script.attr('src', fileName);
	script.insertAfter(elem);
	logger.log('Adding script --> ' + fileName);
	if (cb) cb();
};
lib.hide = function (sel) {
	lib.hideElements(lib.getElements(sel));
};
lib.hideElements = function (elements) {
	var i, l = elements.length;
	for (i = 0; i < l; i += 0) {
		lib.hideElement(elements[i]);
	}
};
lib.hideElement = function (element) {
	lib.styleElement(element, "display", "none");
};
lib.show = function (sel, a) {
	var elements = lib.getElements(sel);
	if (a) {
		lib.hideElements(elements);
	}
	lib.showElements(elements);
};
lib.showElements = function (elements) {
	var i, l = elements.length;
	for (i = 0; i < l; i += 1) {
		lib.showElement(elements[i]);
	}
};
lib.showElement = function (element) {
	lib.styleElement(element, "display", "block");
};
lib.addStyle = function (sel, prop, val) {
	lib.styleElements(lib.getElements(sel), prop, val);
};
lib.styleElements = function (elements, prop, val) {
	var i, l = elements.length;
	for (i = 0; i < l; i += 1) {
		lib.styleElement(elements[i], prop, val);
	}
};
lib.styleElement = function (element, prop, val) {
	element.style.setProperty(prop, val);
};
lib.toggleShow = function (sel) {
	var i, x = lib.getElements(sel)
		, l = x.length;
	for (i = 0; i < l; i += 1) {
		if (x[i].style.display == "none") {
			lib.styleElement(x[i], "display", "block");
		}
		else {
			lib.styleElement(x[i], "display", "none");
		}
	}
};
lib.addClass = function (sel, name) {
	lib.addClassElements(lib.getElements(sel), name);
};
lib.addClassElements = function (elements, name) {
	var i, l = elements.length;
	for (i = 0; i < l; i += 1) {
		lib.addClassElement(elements[i], name);
	}
};
lib.addClassElement = function (element, name) {
	var i, arr1, arr2;
	arr1 = element.className.split(" ");
	arr2 = name.split(" ");
	for (i = 0; i < arr2.length; i += 1) {
		if (arr1.indexOf(arr2[i]) == -1) {
			element.className += " " + arr2[i];
		}
	}
};
lib.removeClass = function (sel, name) {
	lib.removeClassElements(lib.getElements(sel), name);
};
lib.removeClassElements = function (elements, name) {
	var i, l = elements.length
		, arr1, arr2, j;
	for (i = 0; i < l; i += 1) {
		lib.removeClassElement(elements[i], name);
	}
};
lib.removeClassElement = function (element, name) {
	var i, arr1, arr2;
	arr1 = element.className.split(" ");
	arr2 = name.split(" ");
	for (i = 0; i < arr2.length; i += 1) {
		while (arr1.indexOf(arr2[i]) > -1) {
			arr1.splice(arr1.indexOf(arr2[i]), 1);
		}
	}
	element.className = arr1.join(" ");
};
lib.toggleClass = function (sel, c1, c2) {
	lib.toggleClassElements(lib.getElements(sel), c1, c2);
};
lib.toggleClassElements = function (elements, c1, c2) {
	var i, l = elements.length;
	for (i = 0; i < l; i += 1) {
		lib.toggleClassElement(elements[i], c1, c2);
	}
};
lib.toggleClassElement = function (element, c1, c2) {
	var t1, t2, t1Arr, t2Arr, j, arr, allPresent;
	t1 = (c1 || "");
	t2 = (c2 || "");
	t1Arr = t1.split(" ");
	t2Arr = t2.split(" ");
	arr = element.className.split(" ");
	if (t2Arr.length == 0) {
		allPresent = true;
		for (j = 0; j < t1Arr.length; j += 1) {
			if (arr.indexOf(t1Arr[j]) == -1) {
				allPresent = false;
			}
		}
		if (allPresent) {
			lib.removeClassElement(element, t1);
		}
		else {
			lib.addClassElement(element, t1);
		}
	}
	else {
		allPresent = true;
		for (j = 0; j < t1Arr.length; j += 1) {
			if (arr.indexOf(t1Arr[j]) == -1) {
				allPresent = false;
			}
		}
		if (allPresent) {
			lib.removeClassElement(element, t1);
			lib.addClassElement(element, t2);
		}
		else {
			lib.removeClassElement(element, t2);
			lib.addClassElement(element, t1);
		}
	}
};
lib.getElements = function (id) {
	if (typeof id == "object") {
		return [id];
	}
	else {
		return document.querySelectorAll(id);
	}
};
lib.filterHTML = function (id, sel, filter) {
	var a, b, c, i, ii, iii, hit;
	a = lib.getElements(id);
	for (i = 0; i < a.length; i += 1) {
		b = lib.getElements(sel);
		for (ii = 0; ii < b.length; ii += 1) {
			hit = 0;
			if (b[ii].innerHTML.toUpperCase().indexOf(filter.toUpperCase()) > -1) {
				hit = 1;
			}
			c = b[ii].getElementsByTagName("*");
			for (iii = 0; iii < c.length; iii += 1) {
				if (c[iii].innerHTML.toUpperCase().indexOf(filter.toUpperCase()) > -1) {
					hit = 1;
				}
			}
			if (hit == 1) {
				b[ii].style.display = "";
			}
			else {
				b[ii].style.display = "none";
			}
		}
	}
};
lib.sortHTML = function (id, sel, sortvalue) {
	var a, b, i, ii, y, bytt, v1, v2, cc, j;
	a = lib.getElements(id);
	for (i = 0; i < a.length; i += 1) {
		for (j = 0; j < 2; j += 1) {
			cc = 0;
			y = 1;
			while (y == 1) {
				y = 0;
				b = a[i].querySelectorAll(sel);
				for (ii = 0; ii < (b.length - 1); ii += 1) {
					bytt = 0;
					if (sortvalue) {
						v1 = b[ii].querySelector(sortvalue).innerHTML.toLowerCase();
						v2 = b[ii + 1].querySelector(sortvalue).innerHTML.toLowerCase();
					}
					else {
						v1 = b[ii].innerHTML.toLowerCase();
						v2 = b[ii + 1].innerHTML.toLowerCase();
					}
					if ((j == 0 && (v1 > v2)) || (j == 1 && (v1 < v2))) {
						bytt = 1;
						break;
					}
				}
				if (bytt == 1) {
					b[ii].parentNode.insertBefore(b[ii + 1], b[ii]);
					y = 1;
					cc += 1;
				}
			}
			if (cc > 0) {
				break;
			}
		}
	}
};
lib.slideshow = function (sel, ms, func) {
	var i, ss, x = lib.getElements(sel)
		, l = x.length;
	ss = {};
	ss.current = 1;
	ss.x = x;
	ss.ondisplaychange = func;
	if (!isNaN(ms) || ms == 0) {
		ss.milliseconds = ms;
	}
	else {
		ss.milliseconds = 1000;
	}
	ss.start = function () {
		ss.display(ss.current)
		if (ss.ondisplaychange) {
			ss.ondisplaychange();
		}
		if (ss.milliseconds > 0) {
			window.clearTimeout(ss.timeout);
			ss.timeout = window.setTimeout(ss.next, ss.milliseconds);
		}
	};
	ss.next = function () {
		ss.current += 1;
		if (ss.current > ss.x.length) {
			ss.current = 1;
		}
		ss.start();
	};
	ss.previous = function () {
		ss.current -= 1;
		if (ss.current < 1) {
			ss.current = ss.x.length;
		}
		ss.start();
	};
	ss.display = function (n) {
		lib.styleElements(ss.x, "display", "none");
		lib.styleElement(ss.x[n - 1], "display", "block");
	}
	ss.start();
	return ss;
};
lib.includeHTML = function (cb) {
	var z, i, elmnt, file, xhttp;
	z = document.getElementsByTagName("*");
	for (i = 0; i < z.length; i += 1) {
		elmnt = z[i];
		file = elmnt.getAttribute("lib-include-html");
		if (file) {
			xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = function () {
				if (this.readyState == 4 && this.status == 200) {
					elmnt.innerHTML = this.responseText;
					elmnt.removeAttribute("lib-include-html");
					lib.includeHTML(cb);
				}
			}
			xhttp.open("GET", file, true);
			xhttp.send();
			return;
		}
	}
	if (cb) cb();
};
lib.getHttpData = function (file, func) {
	lib.http(file, function () {
		if (this.readyState == 4 && this.status == 200) {
			func(this.responseText);
		}
	});
};
lib.getHttpObject = function (file, func) {
	lib.http(file, function () {
		if (this.readyState == 4 && this.status == 200) {
			func(JSON.parse(this.responseText));
		}
	});
};
lib.displayHttp = function (id, file) {
	lib.http(file, function () {
		if (this.readyState == 4 && this.status == 200) {
			lib.displayObject(id, JSON.parse(this.responseText));
		}
	});
};
lib.http = function (target, readyfunc, xml, method) {
	var httpObj;
	if (!method) {
		method = "GET";
	}
	if (window.XMLHttpRequest) {
		httpObj = new XMLHttpRequest();
	}
	else if (window.ActiveXObject) {
		httpObj = new ActiveXObject("Microsoft.XMLHTTP");
	}
	if (httpObj) {
		if (readyfunc) {
			httpObj.onreadystatechange = readyfunc;
		}
		httpObj.open(method, target, true);
		httpObj.send(xml);
	}
};
lib.getElementsByAttribute = function (x, att) {
	var arr = []
		, arrCount = -1
		, i, l, y = x.getElementsByTagName("*")
		, z = att.toUpperCase();
	l = y.length;
	for (i = -1; i < l; i += 1) {
		if (i == -1) {
			y[i] = x;
		}
		if (y[i].getAttribute(z) !== null) {
			arrCount += 1;
			arr[arrCount] = y[i];
		}
	}
	return arr;
};
lib.dataObject = {}, lib.displayObject = function (id, data) {
	var htmlObj, htmlTemplate, html, arr = []
		, a, l, rowClone, x, j, i, ii, cc, repeat, repeatObj, repeatX = "";
	htmlObj = document.getElementById(id);
	htmlTemplate = init_template(id, htmlObj);
	html = htmlTemplate.cloneNode(true);
	arr = lib.getElementsByAttribute(html, "lib-repeat");
	l = arr.length;
	for (j = (l - 1); j >= 0; j -= 1) {
		cc = arr[j].getAttribute("lib-repeat").split(" ");
		if (cc.length == 1) {
			repeat = cc[0];
		}
		else {
			repeatX = cc[0];
			repeat = cc[2];
		}
		arr[j].removeAttribute("lib-repeat");
		repeatObj = data[repeat];
		if (repeatObj && typeof repeatObj == "object" && repeatObj.length != "undefined") {
			i = 0;
			for (x in repeatObj) {
				i += 1;
				rowClone = arr[j];
				rowClone = lib_replace_curly(rowClone, "element", repeatX, repeatObj[x]);
				a = rowClone.attributes;
				for (ii = 0; ii < a.length; ii += 1) {
					a[ii].value = lib_replace_curly(a[ii], "attribute", repeatX, repeatObj[x]).value;
				}
				(i === repeatObj.length) ? arr[j].parentNode.replaceChild(rowClone, arr[j]): arr[j].parentNode.insertBefore(rowClone, arr[j]);
			}
		}
		else {
			LOG("lib-repeat must be an array. " + repeat + " is not an array.");
			continue;
		}
	}
	html = lib_replace_curly(html, "element");
	htmlObj.parentNode.replaceChild(html, htmlObj);

	function init_template(id, obj) {
		var template;
		template = obj.cloneNode(true);
		if (lib.dataObject.hasOwnProperty(id)) {
			return lib.dataObject[id];
		}
		lib.dataObject[id] = template;
		return template;
	}

	function lib_replace_curly(elmnt, typ, repeatX, x) {
		var value, rowClone, pos1, pos2, originalHTML, lookFor, lookForARR = []
			, i, cc, r;
		rowClone = elmnt.cloneNode(true);
		pos1 = 0;
		while (pos1 > -1) {
			originalHTML = (typ == "attribute") ? rowClone.value : rowClone.innerHTML;
			pos1 = originalHTML.indexOf("{{", pos1);
			if (pos1 === -1) {
				break;
			}
			pos2 = originalHTML.indexOf("}}", pos1 + 1);
			lookFor = originalHTML.substring(pos1 + 2, pos2);
			lookForARR = lookFor.split("||");
			value = undefined;
			for (i = 0; i < lookForARR.length; i += 1) {
				lookForARR[i] = lookForARR[i].replace(/^\s+|\s+$/gm, ''); //trim
				if (x) {
					value = x[lookForARR[i]];
				}
				if (value == undefined && data) {
					value = data[lookForARR[i]];
				}
				if (value == undefined) {
					cc = lookForARR[i].split(".");
					if (cc[0] == repeatX) {
						value = x[cc[1]];
					}
				}
				if (value == undefined) {
					if (lookForARR[i] == repeatX) {
						value = x;
					}
				}
				if (value == undefined) {
					if (lookForARR[i].substr(0, 1) == '"') {
						value = lookForARR[i].replace(/"/g, "");
					}
					else if (lookForARR[i].substr(0, 1) == "'") {
						value = lookForARR[i].replace(/'/g, "");
					}
				}
				if (value != undefined) {
					break;
				}
			}
			if (value != undefined) {
				r = "{{" + lookFor + "}}";
				if (typ == "attribute") {
					rowClone.value = rowClone.value.replace(r, value);
				}
				else {
					lib_replace_html(rowClone, r, value);
				}
			}
			pos1 = pos1 + 1;
		}
		return rowClone;
	}

	function lib_replace_html(a, r, result) {
		var b, l, i, a, x, j;
		if (a.hasAttributes()) {
			b = a.attributes;
			l = b.length;
			for (i = 0; i < l; i += 1) {
				if (b[i].value.indexOf(r) > -1) {
					b[i].value = b[i].value.replace(r, result);
				}
			}
		}
		x = a.getElementsByTagName("*");
		l = x.length;
		a.innerHTML = a.innerHTML.replace(r, result);
	}
};
logger.log('...lib initialization complete.');

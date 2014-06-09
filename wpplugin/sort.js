//Copyright 2014 Scott Silver Labs
//TODO lid/cell pictures.
//TODO user-defined page item number
//TODO figure out database stuff

//var posts = [{}, {}, ...{}]; Passed in by PHP
var pageLength = 10;
var sortedPosts = [];
var matchedPosts = posts.slice(0); //Used for sorting searches.

var headerStyle = "width:16.66%;display:inline;";
var content = document.getElementById("content").firstElementChild.firstElementChild;
content.firstElementChild.innerHTML += "("+posts.length+")";
content.innerHTML += "<input style=\""+headerStyle.substring(13)+"display:inline-flex;float:right;\" class=\"headerbutton\" type=\"button\" value=\"Filter\" onclick=\"toggleadv()\"/>";
content.innerHTML += "<select style=\"display:inline-flex;float:right;\" onChange=\"setPageLength(this.value)\"><option>10</option><option>25</option><option>50</option></select>";
content.innerHTML += "<div id=\"projectTable\" class=\"tableheader\"></div>";
var table = document.getElementById("projectTable");
var header = "<style> .out {-webkit-transition:0.5s;-moz-transition:0.5s;-ms-transition:0.5s;-o-transition:0.5s;transition: .5s;height:300px;}";
header += " .in {-webkit-transition:0.5s;-moz-transition:0.5s;-ms-transition:0.5s;-o-transition:0.5s;transition:0.5s;height:0px;}";
header += " .descout {-webkit-transition:0.5s;-moz-transition:0.5s;-ms-transition:0.5s;-o-transition:0.5s;transition:0.5s;height:100%;padding-bottom:1em;padding-top:1em;}";
header += " .descin {-webkit-transition:0.5s;-moz-transition:0.5s;-ms-transition:0.5s;-o-transition:0.5s;transition:0.5s;height:0px;padding-bottom:0px;padding-top:0px;}";
header += " .down {-webkit-transform:rotate(180deg);-moz-transform:rotate(180deg);-ms-transform:rotate(180deg)}";
header += " .up {-webkit-transform:rotate(0deg);-moz-transform:rotate(0deg);-ms-transform:rotate(0deg)}</style>";
header += "<div id=\"advsearch\" class=\"in\" style=\"width:100%;overflow:hidden;display:inline-flex;\"></div>";
header += "<div class=\"tableheader\" style=\"display:inline;width:100%;text-align:center;white-space:nowrap;\">";
header += "<input style=\""+headerStyle+"\" class=\"headerbutton\" type=\"button\" value=\"Name\" onclick=\"psort('name')\"></input>";
header += "<input style=\""+headerStyle+"\" class=\"headerbutton\" type=\"button\" value=\"Difficulty\" onclick=\"psort('difficulty')\"></input>";
header += "<input style=\""+headerStyle+"\" class=\"headerbutton\" type=\"button\" value=\"Rating\" onclick=\"psort('rating')\"></input>";
header += "<input style=\""+headerStyle+"\" class=\"headerbutton\" type=\"button\" value=\"Category\" onclick=\"psort('category')\"></input>";
header += "<input style=\""+headerStyle+"\" class=\"headerbutton\" type=\"button\" value=\"Cells\" onclick=\"psort('cellcount')\"></input>";
header += "<input style=\""+headerStyle+"\" class=\"headerbutton\" type=\"button\" value=\"Lid\" onclick=\"psort('lid')\"></input>";
header += "</div>";
header += "<div id=\"entryTable\" class=\"tableheader\" style=\"width:100%;\"></div>";
table.innerHTML += header;
var etable = document.getElementById("entryTable");
var advsearch = document.getElementById("advsearch");
var headers = document.getElementsByClassName("entry-title");
headers[headers.length-1].style.display = "inline"; //In reality there should only be one element in the array
//Setup posts array and searching arrays
var categories = {};
var lids = {};
var cells = {};
var difficulty = [];
for (var i in posts) {
	var ele = posts[i];
	posts[i].category = posts[i].category.substring(1, posts[i].category.length-1); //Cut out a whitespace.
	if (posts[i].description) {
		posts[i].description = posts[i].description.substring(1, posts[i].description.length); //Cut out a whitespace.
	}
	categories[posts[i].category] = true;
	var cstring = ele.cells;
	ele.cellcount = 0;
	ele.cells = {};
	var allsplit = cstring.substring(2, cstring.length-2).split("] [");
	for (var j in allsplit) {
		num = allsplit[j].split(" ")[0];
		name = allsplit[j].substring(num.length+1);
		cells[name] = true;
		num = parseInt(num);
		ele.cells[name] = num;
		ele.cellcount += num;
	}
	ele.lid = ele.lid.substring(1, ele.lid.length-1);
	lids[ele.lid] = true;
}

//TODO Check/uncheck all
var searchStyle = "display:inline;width:20%;margin:1em;text-align:right;white-space:nowrap;overflow-y:auto;overflow-x:hidden;";
var asearch = "<div class=\"searchcontainer\" style=\""+searchStyle+"\">";
asearch += "<h1 style=\"text-align:center;\">Name</h1><br/>";
asearch += "<div class=\"textboxwrapper\" style=\"width:100\"><input id=\"tablesearchbar\" style=\"float:left;width:91%;max-height:1em;overflow-x:auto;overflow-y:hidden;display:inline;\" class=\"headerbutton\" type=\"text\" value=\"\" placeholder=\"Search\" onkeyup=\"nameSearch(event, this.value)\"/></div></div>";

//Difficulty
asearch += "<div class=\"searchcontainer\" style=\""+searchStyle+"\">";
asearch += "<h1 style=\"text-align:center;\">Difficulty</h1><br/>";
difficulty.push(null); //Difficulty starts at one, the array starts at 0, so this pads everything out.
for (var i = 1; i <= 5; i++) {
	difficulty.push(true);
	asearch += "<div style=\"display:inline;width:100%;padding-bottom:0.05em;max-height:3em;\" class=\"searchcontainerentry\"><div style=\"float:left;text-align:left;width:80%;overflow-x:auto;overflow-y:hidden;\">"+i+"</div><input type=\"checkbox\" class=\"categorybox\" checked=\"true\" onclick=\"toggleDifficulty('"+i+"')\"/></div><br/>";
}
asearch += "</div>";

//Categories
asearch += "<div class=\"searchcontainer\" style=\""+searchStyle+"\">";
asearch += "<h1 style=\"text-align:center;\">Categories</h1><br/>";
for (var i in categories) {
	var category = categories[i];
	asearch += "<div style=\"display:inline;width:100%;padding-bottom:0.05em;max-height:3em;\" class=\"searchcontainerentry\"><div style=\"float:left;text-align:left;width:80%;overflow-x:auto;overflow-y:hidden;\">"+i+"</div><input type=\"checkbox\" class=\"categorybox\" checked=\"true\" onclick=\"toggleCategory('"+i+"')\"/></div><br/>";
}
asearch += "</div>";

//Cells
asearch += "<div class=\"searchcontainer\" style=\""+searchStyle+"\">";
asearch += "<h1 style=\"text-align:center;\">Cells</h1><br/>";
for (var i in cells) {
	var cell = cells[i];
	asearch += "<div style=\"display:inline;width:100%;padding-bottom:0.05em;max-height:3em;\" class=\"searchcontainerentry\"><div style=\"float:left;text-align:left;width:80%;overflow-x:auto;overflow-y:hidden;\">"+i+"</div><input type=\"checkbox\" class=\"categorybox\" checked=\"true\" onchange=\"toggleCell('"+i+"')\"/></div><br/>";
}

//Lids
asearch += "</div>";
asearch += "<div class=\"searchcontainer\" style=\""+searchStyle+"\">";
asearch += "<h1 style=\"text-align:center;\">Lids</h1><br/>";
for (var i in lids) {
	var lid = lids[i];
	asearch += "<div style=\"display:inline;width:100%;padding-bottom:0.05em;max-height:3em;\" class=\"searchcontainerentry\"><div style=\"float:left;text-align:left;width:80%;overflow-x:auto;overflow-y:hidden;\">"+i+"</div><input type=\"checkbox\" class=\"categorybox\" checked=\"true\" onclick=\"toggleLid('"+i+"')\"/></div><br/>";
}
asearch += "</div>";
advsearch.innerHTML += asearch;
var bar = document.getElementById("tablesearchbar");

//Makes the divs holding specific projects, optionsDict being one of posts' members.
var textHolderStyle = "width:"+(100/6)+"%;overflow-x:auto;overflow-y:hidden;max-height:inherit;text-align:inherit;";
var circleStyle = "float:right;width:1em;height:1em;border-radius:100%;background-color:#aaa;transition:1s;vertical-align:middle;";
function generateEntry(optionsDict) {
	var id = optionsDict.name.replace(/ /g, "-");
	var html = "<div id=\""+id+"\" class=\"tableentry\" onclick=\"toggleDesc(event, this.id+'Desc', this)\" style=\"display:inline-flex;width:100%;min-height:1.3em;max-height:3.2em;text-align:left;overflow:hidden;\">";
	html += "<div class=\"tabletext pname\" style=\""+textHolderStyle+"\"><a href=\""+optionsDict.url+"\">"+optionsDict.name+"</a></div>";
	html += "<div class=\"tabletext pdiff\" style=\""+textHolderStyle+"\">"+optionsDict.difficulty+"</div>";
	html += "<div class=\"tabletext pdiff\" style=\""+textHolderStyle+"\">TODO</div>";
	html += "<div class=\"tabletext pcategory\" style=\""+textHolderStyle+"\">"+optionsDict.category+"</div>";
	html += "<div class=\"tabletext pcells\" style=\""+textHolderStyle+";\">TODO</div>";
	html += "<div class=\"tabletext plid\" style=\""+textHolderStyle+"\">"+optionsDict.lid;
	html += "<div class=\"tablespinner down\" style=\""+circleStyle+"\"><span style=\"vertical-align:middle;position:relative;top:-17%;\">▲</span></div></div></div>";
	if (optionsDict.description) {
		html += "<div id=\""+id+"Desc\" class=\"tabledesc descin\" onclick=\"toggleDesc(this.id)\" style=\"display:inline-flex;width:100%;overflow:hidden;padding-left:2em;padding-right:2em;max-height:100%;min-height:0px\">";
		html += optionsDict.description;
		html += "</div>";
	} else { //Insert spacer
		html += "<div class=\"tabledesc descin\" onclick=\"toggleDesc(this.id)\" style=\"display:inline-flex;width:100%;overflow:hidden;padding-left:2em;padding-right:2em;max-height:100%;min-height:0px\"/>";
	}
	etable.innerHTML += html;
}

function noneFound() {
	var html = "<div class=\"tablenone\" style=\"text-align:center;display:inline-flex;width:100%;min-height:18px;max-height:50px;\">";
	html += "<h2>No Results Found</h2>";
	html += "</div>";
	etable.innerHTML += html;
}

var footerButtonStyle = "position:relative;width:5%;text-align:center;white-space:nowrap;display:inline;";
function generateFooter(property, page) {
	var footer = "<div class=\"tablefooter\" style=\"display:inline;width:100%;text-align:center;white-space:nowrap;\">";
	var pagenum = false;
	if (page > 1) {
		pagenum = true;
		footer += "<input style=\""+footerButtonStyle+"left:0%;\" class=\"footerbutton\" type=\"button\" value=\"<-\" onclick=\"next(false, "+page+")\"></input>";
	}
	if (sortedPosts.length < matchedPosts.length) {
		pagenum = true;
		footer += "<input style=\""+footerButtonStyle+"left:95%;\" class=\"footerbutton\" type=\"button\" value=\"->\" onclick=\"next(true, "+page+")\" ></input>";
	}
	if (pagenum) {
		footer += "<div style=\""+footerButtonStyle+"left:44.5%;\" class=\"footertext\">"+page+"</div>";
	}
	footer += "</div>";
	etable.innerHTML += footer;
}

//As the name implies this clears the table, leaving behind only the header.
function clearTable() {
	etable.innerHTML = "";
}


//Find the next lowest value, out of [1, 2, 3] findnextlow(1) would be 2
function findnextlow(low, property, pool) {
	var high;
	for (var i = 0; i < pool.length; i++) {
		var entry = pool[i];
		var val = entry[property];
		if (entry !== undefined && ((low === undefined || val >= low) && (high === undefined || val <= high[property]))) {
			high = entry;
		}
	}
	return high;
}

//finds the next highest value, out of [1, 2, 3] findnexthigh(3) would be 2
function findnexthigh(high, property, pool) {
	var low;
	for (var i = 0; i < pool.length; i++) {
		var entry = pool[i];
		var val = entry[property];
		if (entry !== undefined && ((low === undefined || val >= low[property]) && (high === undefined || val <= high))) {
			low = entry;
		}
	}
	return low;
}

var lastProp = "name";
var lastMode = false;

/*
	Gets the next pageLength lowest or highest(Down == true for lowest)
	from (matchedPosts - sortedPosts) and appends them to sortedPosts.
*/
function sortby(property, down) {
	var high;
	if (property == lastProp && lastMode == down) {
 		high = sortedPosts[sortedPosts.length-1];
 	} else {
 		sortedPosts = [];
 	}
	var pool = matchedPosts.slice(0); //I don't want to reference posts directly of course.
	for (var i in sortedPosts) {
		var index = pool.indexOf(sortedPosts[i]);
		if (index != -1) {
			pool.splice(pool.indexOf(sortedPosts[i]), 1);
		}
	}
	var moreSorts = [];
	for (var i = 0; i < pageLength; i++) {
		if (down) {
			if (high !== undefined) {
				high = findnextlow(high[property], property, pool);
			} else {
				high = findnextlow(high, property, pool);
			}
			if (high === undefined) {
				break;
			}
		} else {
			if (high !== undefined) {
				high = findnexthigh(high[property], property, pool);
			} else {
				high = findnexthigh(high, property, pool);
			}
			if (high === undefined) {
				break;
			}
		}
		moreSorts.push(high);
	 	pool.splice(pool.indexOf(high), 1);
	}
	sortedPosts = sortedPosts.concat(moreSorts);
	lastProp = property;
	lastMode = down;
}

//This is what is called by the buttons in the footer.
function next(forward, page) {
	var number;
	clearTable();
	if (forward) {
		sortby(lastProp, lastMode);
		page++;
	} else {
		number = sortedPosts.length%pageLength;
		if (number === 0) {
			number = pageLength;
		}
		for (var i = 0; i < number; i++){
			sortedPosts.pop();
		}
		page--;
	}
	number = sortedPosts.length%pageLength; //Defining this twice is bad, clearly.
	if (number === 0) {
		number = pageLength;
	}
	for (var i = sortedPosts.length-number; i < sortedPosts.length; i++) {
		generateEntry(sortedPosts[i]);
	}
	generateFooter(lastProp, page);
}

//This is what is called by the buttons in the header.
function psort(property) {
	sortedPosts = [];
	clearTable();
	if (lastProp == property) {
		sortby(property, !lastMode);
	} else {
		sortby(property, true);
	}
	for (var i in sortedPosts) {
		generateEntry(sortedPosts[i]);
	}
	generateFooter(property, 1);
}

//Checks if the table is valid based on advanced search
function valid(tab) {
	good = true;
	for (var i in tab.cells) {
		good = good && cells[i];
	}
	good = good && lids[tab.lid];
	good = good && categories[tab.category];
	good = good && difficulty[Math.floor(tab.difficulty + 0.5)];
	return good;
}

//Function called by the search bar onKeyUp and (hackily) used to force an update by the toggle methods(Except toggleDesc) and change* functions.
function nameSearch(key, text) {
	char = String.fromCharCode(key.keyCode);
	if (char.length == 1) {
		var newMatched = [];
		for (var i in posts) {
			if ((posts[i].name.toLowerCase().indexOf(text.toLowerCase()) != -1 || posts[i].category.toLowerCase().substring(0, text.length) == text.toLowerCase()) && valid(posts[i])) {
				newMatched.push(posts[i]);
			}
		} 
		if (newMatched.length > 0) {
			matchedPosts = newMatched;
			sortedPosts = [];
			clearTable();
			sortby(lastProp, lastMode);
			for (var i in sortedPosts) {
				generateEntry(sortedPosts[i]);
			}
			generateFooter(lastProp, 1);
		} else {
			sortedPosts = [];
			matchedPosts = [];
			clearTable();
			noneFound();
		}
	}
}

//Called by the lid checkboxes on click
function toggleLid(name) {
	lids[name] = !lids[name];
	nameSearch({"key": " "}, bar.value);
}

function toggleDifficulty(num) {
	difficulty[num] = !difficulty[num];
	nameSearch({"key": " "}, bar.value);
}
//Called by the categories checkboxes on click
function toggleCategory(name) {
	categories[name] = !categories[name];
	nameSearch({"key": " "}, bar.value);
}

//Called by the cell checkboxes on click
function toggleCell(name) {
	cells[name] = !cells[name];
	nameSearch({"key": " "}, bar.value);
}

//Called by the dropdown menu
function setPageLength(len) {
	pageLength = parseInt(len);
	nameSearch({"key": " "}, bar.value);
}

//Expand descriptions
var last;
function toggleDesc(event, id, orig) {
	var cur = document.getElementById(id);
	if (cur && !event.target.href) {
		if (last != id) {
			cur.classList.remove("descin");
			cur.classList.add("descout");
			orig.lastChild.lastChild.classList.remove("down");
			orig.lastChild.lastChild.classList.add("up");
		} else { //Ugly, but this fixing a minor toggling issue.
			cur.classList.remove("descout");
			cur.classList.add("descin");
			orig.lastChild.lastChild.classList.remove("up");
			orig.lastChild.lastChild.classList.add("down");
			last = undefined;
			return;
		}
		if (last) {
			var old = document.getElementById(last);
			if (old) {
				old.classList.remove("descout");
				old.classList.add("descin");
				old.lastChild.lastChild.classList.remove("up");
				old.lastChild.lastChild.classList.add("down");
			}
		}
		last = id;
	}
}

//Called by the advanced search button
var adv = false;
function toggleadv() {
	adv = !adv;
	if (adv) {
		advsearch.classList.remove("in");
		advsearch.classList.add("out");
	} else {
		advsearch.classList.remove("out");
		advsearch.classList.add("in");
	}
}

//Create initial listings
psort("name");
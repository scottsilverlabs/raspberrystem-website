//Copyright 2014 Scott Silver Labs
//TODO lid/cell pictures.

//var posts = [{}, {}, ...{}]; Passed in by PHP
//var pageLength = int; Also passed in by the PHP
var sortedPosts = [];
var matchedPosts = posts.slice(0); //Used for sorting searches.

document.getElementById("content").firstElementChild.firstElementChild.innerHTML += "<div id=\"projectTable\" class=\"tableheader\"></div>";
var table = document.getElementById("projectTable");
var headerStyle = "width:20%;display:inline;";
var header = "<style> .out {-webkit-transition:0.5s;-moz-transition:0.5s;-ms-transition:0.5s;-o-transition:0.5s;transition: .5s;height:300px;}";
header += " .in {-webkit-transition:0.5s;-moz-transition:0.5s;-ms-transition:0.5s;-o-transition:0.5s;transition:0.5s;height:0px;}";
header += " .descout {-webkit-transition:0.5s;-moz-transition:0.5s;-ms-transition:0.5s;-o-transition:0.5s;transition:0.5s;height:100%;padding-bottom:1em;padding-top:1em;}";
header += " .descin {-webkit-transition:0.5s;-moz-transition:0.5s;-ms-transition:0.5s;-o-transition:0.5s;transition:0.5s;height:0px;padding-bottom:0px;padding-top:0px;}";
header += " .tableentry:hover {background-color:#eee;}</style>";
header += "<div class=\"tablesearch\" style=\"display:inline;width:100%;text-align:center;white-space:nowrap;\">";
header += "<input id=\"tablesearchbar\" style=\"width:90%;overflow-x:auto;overflow-y:hidden;display:inline;\" class=\"headerbutton\" type=\"text\" value=\"\" placeholder=\"Search\" onkeyup=\"nameSearch(event, this.value)\"></input>"; //Put in the expander
header += "<input style=\""+headerStyle.substring(10)+"width:10%;\" class=\"headerbutton\" type=\"button\" value=\"Filter\" onclick=\"toggleadv()\"></input>"; //TODO align with projects
header += "<br/><div id=\"advsearch\" class=\"in\" style=\"width:100%;overflow:hidden;display:inline-flex;\"></div>";
header += "</div><br>";
header += "<div class=\"tableheader\" style=\"display:inline;width:100%;text-align:center;white-space:nowrap;\">";
header += "<input style=\""+headerStyle+"\" class=\"headerbutton\" type=\"button\" value=\"Name\" onclick=\"psort('name')\"></input>";
header += "<input style=\""+headerStyle+"\" class=\"headerbutton\" type=\"button\" value=\"Difficulty\" onclick=\"psort('difficulty')\"></input>";
header += "<input style=\""+headerStyle+"\" class=\"headerbutton\" type=\"button\" value=\"Category\" onclick=\"psort('category')\"></input>";
header += "<input style=\""+headerStyle+"\" class=\"headerbutton\" type=\"button\" value=\"Cells\" onclick=\"psort('cellcount')\"></input>";
header += "<input style=\""+headerStyle+"\" class=\"headerbutton\" type=\"button\" value=\"Lid\" onclick=\"psort('lid')\"></input>";
header += "</div>";
header += "<div id=\"entryTable\" class=\"tableheader\" style=\"width:100%;\"></div>";
table.innerHTML += header;
var etable = document.getElementById("entryTable");
var advsearch = document.getElementById("advsearch");
var bar = document.getElementById("tablesearchbar");
//Setup posts array and searching arrays
var categories = {};
var lids = {};
var cells = {};
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
		cells[name] = -1;
		num = parseInt(num);
		ele.cells[name] = num;
		ele.cellcount += num;
	}
	ele.lid = ele.lid.substring(1, ele.lid.length-1);
	lids[ele.lid] = true;
}

var searchStyle = "display:inline;width:33%;overflow:auto;text-align:right;margin:1em;";
var asearch = "<div class=\"searchcontainer\" style=\""+searchStyle+"\">";
asearch += "<h1 style=\"text-align:center;\">Categories</h1><br>";
for (var i in categories) {
	var category = categories[i];
	asearch += "<label style=\"float:left\">"+i+"</label><input type=\"checkbox\" class=\"categorybox\" checked=\"true\" onclick=\"toggleCategory('"+i+"')\" value=\""+i+"\"/><br/>";
}
asearch += "</div>";
asearch += "<div class=\"searchcontainer\" style=\""+searchStyle+"\">";
asearch += "<h1 style=\"text-align:center;\">Cells</h1><br>";
for (var i in cells) {
	var cell = cells[i];
	asearch += "<label style=\"float:left;\">"+i+"</label><input type=\"number\" class=\"categorybox\" style=\"width:3em;\" value=\"-1\" min=\"-1\" step=\"1\" onchange=\"changeCell('"+i+"', this.value)\"/><br/>";
}
asearch += "</div>";
asearch += "<div class=\"searchcontainer\" style=\""+searchStyle+"\">";
asearch += "<h1 style=\"text-align:center;\">Lids</h1><br>";
for (var i in lids) {
	var lid = lids[i];
	asearch += "<label style=\"float:left;\">"+i+"</label><input type=\"checkbox\" class=\"categorybox\" checked=\"true\" onclick=\"toggleLid('"+i+"')\" value=\""+i+"\"/><br/>";
}
asearch += "</div>";
advsearch.innerHTML = asearch;

//Makes the divs holding specific projects, optionsDict being one of posts' members.
var textHolderStyle = "width:20%;white-space:nowrap;overflow-x:auto;overflow-y:hidden;max-height:inherit;text-align:inherit;";
function generateEntry(optionsDict) {
	var id = optionsDict.name.replace(/ /g, "-");
	var html = "<div id=\""+id+"\" class=\"tableentry\" onclick=\"toggleDesc(event, this.id+'Desc')\" style=\"display:inline-flex;width:100%;min-height:1.3em;max-height:2.8em;text-align:left;overflow:hidden;\">";
	html += "<div class=\"tabletext pname\" style=\""+textHolderStyle+"\"><a href=\""+optionsDict.url+"\">"+optionsDict.name+"</a></div>";
	html += "<div class=\"tabletext pdiff\" style=\""+textHolderStyle+"\">"+optionsDict.difficulty+"</div>";
	html += "<div class=\"tabletext pcategory\" style=\""+textHolderStyle+"\">"+optionsDict.category+"</div>";
	html += "<div class=\"tabletext pcells\" style=\""+textHolderStyle+";\">TODO</div>";
	html += "<div class=\"tabletext plid\" style=\""+textHolderStyle+"\">"+optionsDict.lid+"</div>";
	html += "</div>";
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
		good = good && (tab.cells[i] <= cells[i] || cells[i] == -1);
	}
	good = good && (lids[tab.lid]);
	good = good && (categories[tab.category]);
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

//Called  by the lid checkboxes on click
function toggleLid(name) {
	lids[name] = !lids[name];
	nameSearch({"key": " "}, bar.value);
}

//Called  by the categories checkboxes on click
function toggleCategory(name) {
	categories[name] = !categories[name];
	nameSearch({"key": " "}, bar.value);
}

//Expand descriptions
var last;
function toggleDesc(event, id) {
	var cur = document.getElementById(id);
	if (cur && !event.target.href) {
		if (last != id) {
			cur.classList.remove("descin");
			cur.classList.add("descout");
		} else { //Ugly, but this fixing a minor toggling issue.
			cur.classList.remove("descout");
			cur.classList.add("descin");
			last = undefined;
			return;
		}
		if (last) {
			var old = document.getElementById(last);
			if (old) {
				old.classList.remove("descout");
				old.classList.add("descin");
			}
		}
		last = id;
	}
}

//Called  by the cell number boxes
function changeCell(name, value) {
	cells[name] = value;
	nameSearch({"key": " "}, bar.value);
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
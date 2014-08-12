//Copyright 2014 Scott Silver Labs

//var cellurls = [{}]; URLs to cell documentation
//var loggedIn = bool; Is the user logged in to wordpress
//var wpurl = string; Wordpress base url
//var posts = [{}, {}, ...{}];
var pageLength = 10;
var sortedPosts = [];
var matchedPosts = posts.slice(0); //Used for sorting searches.
var defdiffImage = "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcSZCilIMSKaiiLs6gE0RwLWlIIBLkYsSKlRXhu1ZbGIprGrdh9BMFK-Bg";
var defrateImage = "http://icongal.com/gallery/image/144117/nintendo_star.png";
if (diffImage === undefined) {
	diffImage = defdiffImage;
}
if (rateImage === undefined) {
	rateImage = defrateImage;
}
var headerStyle = "width:"+(100/6)+"%;display:inline;";

var title = document.getElementById("content").firstElementChild.firstElementChild;
title.firstElementChild.innerHTML += "("+posts.length+")";
title.innerHTML += "<input style=\""+headerStyle.substring(13)+"display:inline-flex;display:-webkit-inline-box;float:right;\" class=\"headerbutton\" type=\"button\" value=\"Filter\" onclick=\"toggleadv()\"/>";
title.innerHTML += "<select style=\"float:right;width:4em;\" onChange=\"setPageLength(this.value)\"><option>10</option><option>25</option><option>50</option></select>";

var content = document.getElementById("content").firstElementChild.getElementsByTagName("div")[0];
content.innerHTML += "<div id=\"projectTable\" class=\"tableheader\"></div>";

var table = document.getElementById("projectTable");
var header = "<style> .out {-webkit-transition:0.5s;-moz-transition:0.5s;-ms-transition:0.5s;-o-transition:0.5s;transition: .5s;height:300px;}";
header += ".in {-webkit-transition:0.5s;-moz-transition:0.5s;-ms-transition:0.5s;-o-transition:0.5s;transition:0.5s;height:0px;}";
header += ".descout {-webkit-transition:0.5s;-moz-transition:0.5s;-ms-transition:0.5s;-o-transition:0.5s;transition:0.5s;height:100%;padding-bottom:1em;padding-top:1em;}";
header += ".descin {transition:0.5s;height:0px;padding-bottom:0px;padding-top:0px;}";
header += ".down {-webkit-transform:rotate(180deg);-moz-transform:rotate(180deg);-ms-transform:rotate(180deg)}";
header += ".up {-webkit-transform:rotate(0deg);-moz-transform:rotate(0deg);-ms-transform:rotate(0deg)}";
header += ".gray {-webkit-filter:grayscale(100%);-moz-filter:grayscale(100%);-ms-filter:grayscale(100%);-o-filter:grayscale(100%);filter:grayscale(100%);filter:url(GRAYSCALEURL);} </style>";
header += "<div id=\"advsearch\" class=\"in\" style=\"width:100%;overflow:hidden;display:inline-flex;display:-webkit-inline-box;\"></div>";
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
var rating = [];
for (var i in posts) {
	var ele = posts[i];
	posts[i].category = posts[i].category.substring(1, posts[i].category.length-1); //Cut out a whitespace.
	if (posts[i].description) {
		posts[i].description = posts[i].description.substring(1, posts[i].description.length); //Cut out a whitespace.
	}
	if (!posts[i].rating) {
		posts[i].rating = 1;
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

//Search
var searchStyle = "display:inline;width:20%;margin:1em;white-space:nowrap;overflow-y:auto;overflow-x:hidden;";
var asearch = "<div class=\"searchcontainer\" style=\""+searchStyle+"\">";
asearch += "<h5 style=\"text-align:left;display:inline;\">Name</h5><br/>";
asearch += "<div class=\"textboxwrapper\" style=\"width:100%\"><input id=\"tablesearchbar\" style=\"float:left;width:86%;max-height:1em;overflow-x:auto;overflow-y:hidden;display:inline;\" class=\"headerbutton\" type=\"text\" value=\"\" placeholder=\"Search\" onkeyup=\"nameSearch(event, this.value)\"/></div></div>";

//Difficulty
asearch += "<div class=\"searchcontainer\" style=\""+searchStyle+"\">";
asearch += "<h5 style=\"text-align:left;display:inline;\">Difficulty</h5><input style=\"display:inline;float:right;\" type=\"checkbox\" class=\"categorybox\" checked=\"true\" onclick=\"toggleDifficulty(0)\"/><br/>";
difficulty.push(null); //Difficulty starts at one, the array starts at 0, so this pads everything out.
for (var i = 1; i <= 5; i++) {
	difficulty.push(true);
	asearch += "<div style=\"display:inline;width:100%;padding-bottom:0.05em;max-height:3em;\" class=\"searchcontainerentry\"><div style=\"display:inline-flex;display:-webkit-inline-box;text-align:left;width:80%;overflow-x:auto;overflow-y:hidden;\">"+i+"</div><input id=\"diff"+i+"\"type=\"checkbox\" class=\"categorybox\" checked=\"true\" onclick=\"toggleDifficulty('"+i+"')\"/></div><br/>";
}
asearch += "</div>";

//Rating
asearch += "<div class=\"searchcontainer\" style=\""+searchStyle+"\">";
asearch += "<h5 style=\"text-align:left;display:inline;\">Rating</h5><input style=\"display:inline;float:right;\" type=\"checkbox\" class=\"categorybox\" checked=\"true\" onclick=\"toggleRating(0)\"/><br/>";
rating.push(null); //Difficulty starts at one, the array starts at 0, so this pads everything out.
for (var i = 1; i <= 5; i++) {
	rating.push(true);
	asearch += "<div style=\"display:inline;width:100%;padding-bottom:0.05em;max-height:3em;\" class=\"searchcontainerentry\"><div style=\"display:inline-flex;display:-webkit-inline-box;text-align:left;width:80%;overflow-x:auto;overflow-y:hidden;\">"+i+"</div><input id=\"diff"+i+"\"type=\"checkbox\" class=\"categorybox\" checked=\"true\" onclick=\"toggleRating('"+i+"')\"/></div><br/>";
}
asearch += "</div>";

//Categories
asearch += "<div class=\"searchcontainer\" style=\""+searchStyle+"\">";
asearch += "<h5 style=\"text-align:left;display:inline;\">Categories</h5><input style=\"display:inline;float:right;\" type=\"checkbox\" class=\"categorybox\" checked=\"true\" onclick=\"toggleCategory(null)\"/><br/>";
for (var i in categories) {
	asearch += "<div style=\"display:inline;width:100%;padding-bottom:0.05em;max-height:3em;\" class=\"searchcontainerentry\"><div style=\"display:inline-flex;display:-webkit-inline-box;text-align:left;width:80%;overflow-x:auto;overflow-y:hidden;\">"+i+"</div><input id=\""+i.replace(/ /g, "-")+"category\" type=\"checkbox\" class=\"categorybox\" checked=\"true\" onclick=\"toggleCategory('"+i+"')\"/></div><br/>";
}
asearch += "</div>";

//Cells
asearch += "<div class=\"searchcontainer\" style=\""+searchStyle+"\">";
asearch += "<h5 style=\"text-align:left;display:inline;\">Cells</h5><input style=\"display:inline;float:right;\" type=\"checkbox\" class=\"categorybox\" checked=\"true\" onclick=\"toggleCell(null)\"/><br/>";
for (var i in cells) {
	asearch += "<div style=\"display:inline;width:100%;padding-bottom:0.05em;max-height:3em;\" class=\"searchcontainerentry\"><div style=\"display:inline-flex;display:-webkit-inline-box;text-align:left;width:80%;overflow-x:auto;overflow-y:hidden;\">"+i+"</div><input id=\""+i.replace(/ /g, "-")+"cell\" type=\"checkbox\" class=\"categorybox\" checked=\"true\" onchange=\"toggleCell('"+i+"')\"/></div><br/>";
}

//Lids
asearch += "</div>";
asearch += "<div class=\"searchcontainer\" style=\""+searchStyle+"\">";
asearch += "<h5 style=\"text-align:left;display:inline;\">Lids</h5><input style=\"display:inline;float:right;\" type=\"checkbox\" class=\"categorybox\" checked=\"true\" onclick=\"toggleLid(null)\"/><br/>";
for (var i in lids) {
	asearch += "<div style=\"display:inline;width:100%;padding-bottom:0.05em;max-height:3em;\" class=\"searchcontainerentry\"><div style=\"display:inline-flex;display:-webkit-inline-box;text-align:left;width:80%;overflow-x:auto;overflow-y:hidden;\">"+i+"</div><input id=\""+i.replace(/ /g, "-")+"lid\" type=\"checkbox\" class=\"categorybox\" checked=\"true\" onclick=\"toggleLid('"+i+"')\"/></div><br/>";
}
asearch += "</div>";
advsearch.innerHTML += asearch;
var bar = document.getElementById("tablesearchbar");

//Makes the divs holding specific projects, optionsDict being one of posts' members.
var textHolderStyle = "width:"+(100/6)+"%;overflow-x:auto;overflow-y:hidden;max-height:inherit;text-align:inherit;background-color:#fff;";
var circleStyle = "float:right;width:1em;height:1em;border-radius:100%;background-color:#aaa;transition:1s;vertical-align:middle;";
var grayStyle = "width:5em;position:relative;z-index:1;max-height:1.2em;overflow:hidden";
var colorStyle = "position:relative;z-index:2;max-height:1.2em;overflow:hidden;margin-top:-1.2em;white-space:nowrap;";
function generateEntry(optionsDict) {
	var id = optionsDict.name.replace(/ /g, "-");
	var html = "<div id=\""+id+"\" class=\"tableentry\" onclick=\"toggleDesc(event, this.id+'Desc', this)\" style=\"display:inline-flex;display:-webkit-inline-box;width:100%;min-height:1.3em;max-height:3.2em;text-align:left;overflow:hidden;padding-bottom:.1em;\">";
	html += "<div class=\"tabletext pname\" style=\""+textHolderStyle+"\"><a href=\""+optionsDict.url+"\">"+optionsDict.name+"</a></div>";
	html += "<div class=\"tabletext pdiff\" style=\""+textHolderStyle+"overflow-x:hidden;\">";
	html += "<div style=\""+grayStyle+"\">"; //Background holder
	for (var i = 1; i <= 5; i++) {
		html += "<img class=\"gray\" src=\""+diffImage+"\" style=\"box-shadow:0 0px;height:1em;width:1em;display:inline-flex;display:-webkit-inline-box;\"></img>";
	}
	html += "</div>";
	html += "<div style=\"width:"+optionsDict.difficulty+"em;"+colorStyle+"\">"; //Forground holder
	for (var i = 1; i <= 5; i++) {
		html += "<img src=\""+diffImage+"\" style=\"box-shadow:0 0px;height:1em;width:1em;position:relative;\"></img>";
	}
	html += "</div>";
	html += "</div>";
	html += "<div class=\"tabletext prate\" style=\""+textHolderStyle+"overflow-x:hidden;\">";
	html += "<div style=\""+grayStyle+"\">"; //Background holder
	for (var i = 1; i <= 5; i++) {
		html += "<img class=\"gray\" src=\""+rateImage+"\" style=\"box-shadow:0 0px;height:1em;width:1em;display:inline-flex;display:-webkit-inline-box;\"></img>";
	}
	html += "</div>";
	html += "<div id=\""+optionsDict.id+"RCover\" style=\"width:"+optionsDict.rating+"em;"+colorStyle+"\">"; //Forground holder
	for (var i = 1; i <= 5; i++) {
		html += "<img src=\""+rateImage+"\" style=\"box-shadow:0 0px;height:1em;width:1em;display:inline-flex;display:-webkit-inline-box;\"></img>";
	}
	html += "</div>";
	html += "</div>";
	html += "<div class=\"tabletext pcategory\" style=\""+textHolderStyle+"\">"+optionsDict.category+"</div>";
	html += "<div class=\"tabletext pcells\" style=\""+textHolderStyle+";\">";
	for (var i in optionsDict.cells) {
		html += "<a href=\""+cellurls[i]+"\" style=\"display:inline\">";
		html += "<img style=\"width:1em;height:1em;\" src=\""+wpurl+"/cellicons/"+i.toLowerCase().replace(/ /g, "-")+".png\"></img></a>";
	}
	html += "</div>";
	html += "<div class=\"tabletext plid\" style=\""+textHolderStyle+"\">";
	html += "<a href=\""+cellurls[optionsDict.lid]+"\" style=\"display:inline\">";
	html += "<img style=\"width:1em;height:1em;\" src=\""+wpurl+"/cellicons/"+optionsDict.lid.toLowerCase().replace(/ /g, "-")+".png\"></img></a>";
	html += "<div class=\"tablespinner down\" style=\""+circleStyle+"\"><span style=\";position:relative;top:-45%;\">▲</span></div></div></div>";
	html += "<div id=\""+id+"Desc\" class=\"tabledesc descin\" onclick=\"toggleDesc(this.id)\" style=\"width:100%;overflow:hidden;max-height:100%;min-height:0px\">";
	html += "Licensed as ALv2, Copyright Scott Silver Labs, created by "+optionsDict.author;
	html += "<div class=\"tabletext prating\">Your Rating: ";

	html += "<div style=\""+grayStyle+"\">"; //Background holder
	for (var i = 1; i <= 5; i++) {
		html += "<img class=\"gray\" src=\""+rateImage+"\" style=\"box-shadow:0 0px;height:1em;width:1em;display:inline-flex;display:-webkit-inline-box;\" onclick=\"rateProject("+optionsDict.id+", "+i+")\"></img>";
	}
	html += "</div>";
	html += "<div id=\""+optionsDict.id+"UCover\" style=\"width:"+optionsDict.userrating+"em;"+colorStyle+"\">"; //Forground holder
	for (var i = 1; i <= 5; i++) {
		html += "<img src=\""+rateImage+"\" style=\"box-shadow:0 0px;height:1em;width:1em;position:relative;\" onclick=\"rateProject("+optionsDict.id+", "+i+")\"></img>";
	}
	html += "</div>";
	html += "</div>";

	html += "<div>";
	for (var i in optionsDict.cells) {
		html += "<a href=\""+cellurls[i]+"\" style=\"padding-right:1em;\">";
		html += "<img style=\"width:1em;height:1em;\" src=\""+wpurl+"/cellicons/"+i.toLowerCase().replace(/ /g, "-")+".png\"></img>"+i+"</a>";
	}
	html += "<a href=\""+cellurls[optionsDict.lid]+"\" style=\"float:right;\">";
	html += "<img style=\"width:1em;height:1em;\" src=\""+wpurl+"/cellicons/"+optionsDict.lid.toLowerCase().replace(/ /g, "-")+".png\"></img>"+optionsDict.lid+"</a>";
	html += "</div>";
	html += "<br/>"+optionsDict.description;
	html += "</div>";
	etable.innerHTML += html;
}

//Adds text to the table
function message(content) {
	var html = "<div class=\"tablenone\" style=\"text-align:center;display:inline-flex;display:-webkit-inline-box;width:100%;min-height:18px;max-height:50px;\">";
	html += "<h4>"+content+"</h4>";
	html += "</div>";
	etable.innerHTML += html;
}

//Makes the footer
var footerButtonStyle = "position:relative;width:5%;text-align:center;white-space:nowrap;display:inline;";
function generateFooter(property, page) {
	var footer = "<div class=\"tablefooter\" style=\"width:100%;text-align:center;white-space:nowrap;\">";
	if (page > 1) {
		footer += "<input style=\""+footerButtonStyle+"left:-42.5%;\" class=\"footerbutton\" type=\"button\" value=\"<-\" onclick=\"pageTo("+(page-1)+")\"></input>";
	}
	var back = (page-5 > 1) ? page-5 : page-1;
	if (matchedPosts.length > pageLength) {
		var num = Math.ceil(matchedPosts.length/pageLength);
		footer += "<div style=\""+footerButtonStyle+"left:0%;\" class=\"footertext\"><input type=\"text\" value=\""+page+"\" style=\"width:"+Math.ceil((num+0.01)/10)+"em;\" onchange=\"pageTo(parseInt(this.value))\"></input> of "+num+"</div>";
	}
	if (page*pageLength < matchedPosts.length) {
		footer += "<input style=\""+footerButtonStyle+"left:42.5%;\" class=\"footerbutton\" type=\"button\" value=\"->\" onclick=\"pageTo("+(page+1)+")\" ></input>";
	}
	var forward = (page+5 < Math.ceil(matchedPosts.length/pageLength)) ? page+5 : Math.ceil(matchedPosts.length/pageLength);
	footer += "</div>";
	etable.innerHTML += footer;
}

//As the name implies this clears the table, leaving behind only the header.
function clearTable() {
	etable.innerHTML = "";
}

function rateProject(id, rating) {
	if (loggedIn) {
		jQuery.ajax({
			type: "POST",
			data: "&action=rate_project&project="+id+"&rating="+rating,
			url: wpurl+"/wp-admin/admin-ajax.php",
			success: function(results) {
				for (var i = sortedPosts.length-1; i >= 0; i--){
					if (sortedPosts[i].id === id){
						sortedPosts[i].rating = parseFloat(results);
						sortedPosts[i].userrating = rating;
						break;
					}
				}
				document.getElementById(id+"RCover").style.width = results+"em";
				document.getElementById(id+"UCover").style.width = rating+"em";
			}
		});
	} else {
		var box = confirm("You need to log in to vote\\nWould you like to go to the login page?"); //double backslash because of the PHP file 
		if (box) {
			window.location = wpurl+"/wp-login.php";
		}
	}
}

function egg(prop, img) {
	if (loggedIn) {
		jQuery.ajax({
			type: "POST",
			data: "&action=rate_project&prop="+prop+"&img="+img,
			url: wpurl+"/wp-admin/admin-ajax.php",
			success: function(results) {
			}
		});
	} else {
		var box = confirm("You need to log in to use easter eggs\\nWould you like to go to the login page?"); //double backslash because of the PHP file 
		if (box) {
			window.location = wpurl+"/wp-login.php";
		}
	}
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

/*
	Gets the next pageLength lowest or highest(Down == true for lowest)
	from (matchedPosts - sortedPosts) and appends them to sortedPosts.
*/
var lastProp = "name";
var lastMode = false;
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
function pageTo(page) {
	page = Math.min(page, Math.ceil(matchedPosts.length/pageLength));
	page = Math.max(page, 1);
	//console.log("Moving to"+page);
	clearTable();
	while (Math.ceil(sortedPosts.length/pageLength) < page) {
		sortby(lastProp, lastMode);
	}
	var number = pageLength;
	if (pageLength*page > sortedPosts.length) {
		number = sortedPosts.length%pageLength;
	}
	for (var i = pageLength*(page-1); i < (pageLength*(page-1))+number; i++) {
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
	good = good && rating[Math.floor(tab.rating + 0.5)];
	return good;
}

//Function called by the search bar onKeyUp and (hackily) used to force an update by the toggle methods(Except toggleDesc) and change* functions.
function nameSearch(key, text) {
	char = String.fromCharCode(key.keyCode);
	if (text.toLowerCase() == "porkchops") {
		clearTable();
		message("Hint:");
		message("UPDATE pi_eggs SET diffimg = http://URL;");
		message("UPDATE pi_eggs SET rateimg  = http://URL;");
		message("UPDATE pi_eggs SET DEFAULT;");
		return;
	}
	if (text.match(/UPDATE pi_eggs SET diffimg = .+;/) !== null) { //TODO save in SQL
		var url = text.match(/http:\/\/.+;/)[0];
		diffImage = url.substring(0, url.length-1);
		egg("diff", diffImage);
		bar.value = "";
	}
	if (text.match(/UPDATE pi_eggs SET rateimg = .+;/) !== null) { //TODO save in SQL
		var url = text.match(/http:\/\/.+;/)[0];
		rateImage = url.substring(0, url.length-1);
		egg("rate", rateImage);
		bar.value = "";
	}
	if (text.match(/UPDATE pi_eggs SET DEFAULT;/) !== null) { //TODO save in SQL
		rateImage = defrateImage;
		diffImage = defdiffImage;
		egg("rate", "NULL");
		egg("diff", "NULL");
		bar.value = "";
	}
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
			message("None found");
		}
	}
}

//Called by the lid checkboxes on click
var lidAll = true;
function toggleLid(name) {
	if (name) {
		lids[name] = !lids[name];
	} else {
		lidAll = !lidAll;
		for (var i in lids) {
			lids[i] = lidAll;
			if (lidAll){
				document.getElementById(i.replace(/ /g, "-")+"lid").checked = lidAll;
			} else {
				document.getElementById(i.replace(/ /g, "-")+"lid").checked = null;
			}
		}
	}
	nameSearch({"key": " "}, bar.value);
}

//Called by the difficulty checkboxes on click
var diffAll = true;
function toggleDifficulty(num) {
	if (num === 0) {
		console.log("0");
		diffAll = !diffAll;
		var newVal;
		if (diffAll) {
			newVal = diffAll;
		}
		for (var i = 1; i <= 5; i++) {
			document.getElementById("diff"+i).checked = newVal;
			if (newVal){
				difficulty[i] = true;
			} else {
				difficulty[i] = false;
			}
		}
	} else {
		difficulty[num] = !difficulty[num];
	}
	nameSearch({"key": " "}, bar.value);
}


//Called by the rating checkboxes on click
var rateAll = true;
function toggleRating(num) {
	if (num === 0) {
		console.log("0");
		rateAll = !rateAll;
		var newVal;
		if (rateAll) {
			newVal = rateAll;
		}
		for (var i = 1; i <= 5; i++) {
			document.getElementById("diff"+i).checked = newVal;
			if (newVal){
				rating[i] = true;
			} else {
				rating[i] = false;
			}
		}
	} else {
		rating[num] = !rating[num];
	}
	nameSearch({"key": " "}, bar.value);
}

//Called by the categories checkboxes on click
var categoryAll = true;
function toggleCategory(name) {
	if (name){
		categories[name] = !categories[name];
	} else {
		categoryAll = !categoryAll;
		for (var i in categories) {
			categories[i] = categoryAll;
			if (categoryAll){
				document.getElementById(i.replace(/ /g, "-")+"category").checked = categoryAll;
			} else {
				document.getElementById(i.replace(/ /g, "-")+"category").checked = null;
			}
		}
	}
	nameSearch({"key": " "}, bar.value);
}

//Called by the cell checkboxes on click
var cellAll = true;
function toggleCell(name) {
	if (name) {
		cells[name] = !cells[name];
	} else {
		cellAll = !cellAll;
		for (var i in cells){
			cells[i] = cellAll;
			if (cellAll){
				document.getElementById(i.replace(/ /g, "-")+"cell").checked = cellAll;
			} else {
				document.getElementById(i.replace(/ /g, "-")+"cell").checked = null;
			}
		}
	}
	nameSearch({"key": " "}, bar.value);
}

//Called by the dropdown menu
function setPageLength(len) {
	pageLength = parseInt(len);
	nameSearch({"key": " "}, bar.value);
}

//Expand descriptions
var last;
var lastOrig;
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
				lastOrig.lastChild.lastChild.classList.remove("up");
				lastOrig.lastChild.lastChild.classList.add("down");
			}
		}
		last = id;
		lastOrig = orig;
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

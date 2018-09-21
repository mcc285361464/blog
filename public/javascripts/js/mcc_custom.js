
var pageBtn = document.querySelector('.theme-pagination ul');
pageBtn.onclick = function(){
	var lis = document.querySelectorAll('.single-blog-post');
	if(lis) {
		lis = lis.length;
	}
	var type = getQueryString('type');
	var ajax = new XMLHttpRequest();
	//步骤二:设置请求的url参数,参数一是请求的类型,参数二是请求的url,可以带参数,动态的传递参数starName到服务端
	ajax.open('get','/index?contentNum='+lis+"&type="+type);
	//步骤三:发送请求
	ajax.send();
	//步骤四:注册事件 onreadystatechange 状态改变就会调用
	ajax.onreadystatechange = function () {
	   if (ajax.readyState==4 &&ajax.status==200) {
	    //步骤五 如果能够进到这个判断 说明 数据 完美的回来了,并且请求的页面是存在的
	  	   var ulR = document.querySelector('.blog-list');
	   	   var results = JSON.parse(ajax.responseText).results;

	   	   var noContent = JSON.parse(ajax.responseText).noContent;
	   	   if(noContent == 1) {
	   	   		var getMore = document.querySelector('.get-more');
	   	    	getMore.textContent = '没有更多了';
	   	    	getMore.onclick = function(){};
	   	    	getMore.style.background = '#ccc';
	   	    	return;
	   	   }
	   	   for(var i=0;i<results.length;i++) {
	   	   		var div = document.createElement('div');
	   	   		div.className="single-blog-post";
	   	   		var img = document.createElement('img');
	   	   		img.src = results[i].img;
	   	   		var div1 = document.createElement('div');
	   	   		div1.className="image-box";
	   	   		div1.appendChild(img);
	   	   		div.appendChild(div1);
	   	   		var li = document.createElement('li');
	   	   		li.className = 'tag';
	   	   		var a = document.createElement('a');
	   	   		a.href = '#';
	   	   		a.textContent = results[i].type;
	   	   		li.appendChild(a);
	   	   		var li2 = document.createElement('li');
	   	   		li2.className = "date";
	   	   		li2.textContent = results[i].date;
	   	   		var ul = document.createElement('ul');
	   	   		ul.className = 'author-meta clearfix';
	   	   		ul.appendChild(li);
	   	   		ul.appendChild(li2);
	   	   		var div2 = document.createElement('div');
	   	   		div2.className="post-meta-box bg-box";
	   	   		div2.appendChild(ul);
	   	   		var h4 = document.createElement('h4');
	   	   		h4.className="title";
	   	   		var a2 = document.createElement('a');
	   	   		a2.href=results[i].html_name;
	   	   		a2.textContent = results[i].title;
	   	   		h4.appendChild(a2);
	   	   		var p1 = document.createElement('p');
	   	   		p1.textContent = results[i].intro;
	   	   		div2.appendChild(h4);
	   	   		div2.appendChild(p1);
	   	   		div.appendChild(div2);
		   		ulR.appendChild(div);
	   	   }
	  　}
	}
}	


// function getQueryString(name) { 
//     var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
//     var r = window.location.search.substr(1).match(reg); 
//     if (r != null) return unescape(r[2]); 
//     return null; 
// } 

function getQueryString(name) {
	var str = window.location.href;
	var strR = str.substring(str.indexOf('?')+1,str.length);
	var arr = strR.split('&');
	for(var i=0;i<arr.length;i++) {
	 	var arrMap = arr[i].split('=');
		if(arrMap != null && arrMap[0] == name){
			return arrMap[1];
		}
	}
	return null;
}
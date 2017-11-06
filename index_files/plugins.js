// usage: log('inside coolFunc', this, arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function f(){ log.history = log.history || []; log.history.push(arguments); if(this.console) { var args = arguments, newarr; args.callee = args.callee.caller; newarr = [].slice.call(args); if (typeof console.log === 'object') log.apply.call(console.log, console, newarr); else console.log.apply(console, newarr);}};

// make it safe to use console.log always
(function(a){function b(){}for(var c="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),d;!!(d=c.pop());){a[d]=a[d]||b;}})
(function(){try{console.log();return window.console;}catch(a){return (window.console={});}}());


// place any jQuery/helper plugins in here, instead of separate, slower script files.


// jquery.mousewheel.js
/*! Copyright (c) 2010 Brandon Aaron (http://brandonaaron.net)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Thanks to: http://adomas.org/javascript-mouse-wheel/ for some pointers.
 * Thanks to: Mathias Bank(http://www.mathias-bank.de) for a scope bug fix.
 * Thanks to: Seamus Leahy for adding deltaX and deltaY
 *
 * Version: 3.0.4
 * 
 * Requires: 1.2.2+
 */
(function($) {

var types = ['DOMMouseScroll', 'mousewheel'];

$.event.special.mousewheel = {
    setup: function() {
        if ( this.addEventListener ) {
            for ( var i=types.length; i; ) {
                this.addEventListener( types[--i], handler, false );
            }
        } else {
            this.onmousewheel = handler;
        }
    },
    
    teardown: function() {
        if ( this.removeEventListener ) {
            for ( var i=types.length; i; ) {
                this.removeEventListener( types[--i], handler, false );
            }
        } else {
            this.onmousewheel = null;
        }
    }
};

$.fn.extend({
    mousewheel: function(fn) {
        return fn ? this.bind("mousewheel", fn) : this.trigger("mousewheel");
    },
    
    unmousewheel: function(fn) {
        return this.unbind("mousewheel", fn);
    }
});


function handler(event) {
    var orgEvent = event || window.event, args = [].slice.call( arguments, 1 ), delta = 0, returnValue = true, deltaX = 0, deltaY = 0;
    event = $.event.fix(orgEvent);
    event.type = "mousewheel";
    
    // Old school scrollwheel delta
    if ( event.wheelDelta ) { delta = event.wheelDelta/120; }
    if ( event.detail     ) { delta = -event.detail/3; }
    
    // New school multidimensional scroll (touchpads) deltas
    deltaY = delta;
    
    // Gecko
    if ( orgEvent.axis !== undefined && orgEvent.axis === orgEvent.HORIZONTAL_AXIS ) {
        deltaY = 0;
        deltaX = -1*delta;
    }
    
    // Webkit
    if ( orgEvent.wheelDeltaY !== undefined ) { deltaY = orgEvent.wheelDeltaY/120; }
    if ( orgEvent.wheelDeltaX !== undefined ) { deltaX = -1*orgEvent.wheelDeltaX/120; }
    
    // Add event and delta to the front of the arguments
    args.unshift(event, delta, deltaX, deltaY);
    
    return $.event.handle.apply(this, args);
}

})(jQuery);


// jquery.RotateImageMenu.js
$(function() {
		//our 4 items	
	var $listItems 		= $('#rm_container > ul > li'),
		totalItems		= $listItems.length,
		
		//the controls
		$rm_next		= $('#rm_next'),
		$rm_prev		= $('#rm_prev'),
		$rm_play		= $('#rm_play'),
		$rm_pause		= $('#rm_pause'),
		
		//the masks and corners of the slider
		$rm_mask_left	= $('#rm_mask_left'),
		$rm_mask_right	= $('#rm_mask_right'),
		$rm_corner_left	= $('#rm_corner_left'),
		$rm_corner_right= $('#rm_corner_right'),
		
		//check if the browser is <= IE8
		ieLte8			= ($.browser.msie && parseInt($.browser.version) <= 8),
		
		RotateImageMenu	= (function() {
				//difference of animation time between the items
			var	timeDiff			= 300,
				//time between each image animation (slideshow)
				slideshowTime		= 3500,
				slideshowInterval,	
				//checks if the images are rotating
				isRotating			= false,
				//how many images completed each slideshow iteration
				completed			= 0,
				/*
				all our images have 310 of width and 465 of height.
				this could / should be dynamically calculated 
				if we would have different image sizes.
				
				we will set the rotation origin at 
				x = width/2 and y = height*2
				*/
				origin				= ['155px', '930px'],
				init				= function() {
					configure();
					initEventsHandler();
				},
				//initialize some events
				initEventsHandler	= function() {
					/*
					next and previous arrows:
					we will stop the slideshow if active,
					and rotate each items images.
					1 	rotate right
					-1 	rotate left
					*/
					$rm_next.bind('click', function(e) {
						stopSlideshow();
						rotateImages(1);
						return false;
					});
					$rm_prev.bind('click', function(e) {
						stopSlideshow();
						rotateImages(-1);
						return false;
					});
					/*
					start and stop the slideshow
					*/
					$rm_play.bind('click', function(e) {
						startSlideshow();
						return false;
					});
					$rm_pause.bind('click', function(e) {
						stopSlideshow();
						return false;
					});
					/*
					adds events to the mouse and left / right keys
					*/
					//$(document).bind('mousewheel', function(e, delta) {
						//if(delta > 0) {
							//stopSlideshow();
							//rotateImages(0);
						//}	
						//else {
							//stopSlideshow();
							//rotateImages(1);
						//}	
						//return false;
					//}).keydown(function(e){
						//switch(e.which){
							//case 37:
								//stopSlideshow();
								//rotateImages(0);
								//break;
							//case 39:
								//stopSlideshow();
								//rotateImages(1);
								//break;
						//}
					//});
				},
				/*
				rotates each items images.
				we set a delay between each item animation
				*/
				rotateImages		= function(dir) {
					//if the animation is in progress return
					if(isRotating) return false;
					
					isRotating = true;
					
					$listItems.each(function(i) {
						var $item 				= $(this),
							/*
							the delay calculation.
							if rotation is to the right, 
							then the first item to rotate is the first one,
							otherwise the last one
							*/
							interval			= (dir === 1) ? i * timeDiff : (totalItems - 1 - i) * timeDiff;
						
						setTimeout(function() {
								//the images associated to this item
							var	$otherImages		= $('#' + $item.data('images')).children('img'),
								totalOtherImages	= $otherImages.length;
								
								//the current one
								$img				= $item.children('img:last'),
								//keep track of each items current image
								current				= $item.data('current');
								//out of bounds 
								if(current > totalOtherImages - 1)
									current = 0;
								else if(current < 0)
									current = totalOtherImages - 1;
								
								//the next image to show and its initial rotation (depends on dir)
								var otherRotation	= (dir === 1) ? '-30deg' : '30deg',
									$other			= $otherImages.eq(current).clone();
									
								//for IE <= 8 we will not rotate, but fade out / fade in ... 
								//better than nothing :)	
								if(!ieLte8)
									$other.css({
										rotate	: otherRotation,
										origin	: origin
									});
								
								(dir === 1) ? ++current : --current;
								
								//prepend the next image to the <li>
								$item.data('current', current).prepend($other);
								
								//the final rotation for the current image 
								var rotateTo		= (dir === 1) ? '80deg' : '-80deg';
								
								if(!ieLte8) {
									$img.animate({
										rotate	: rotateTo
									}, 1200, function(){
										$(this).remove();
										++completed;
										if(completed === 4) {
											completed = 0;
											isRotating = false;
										}
									});
									$other.animate({
										rotate	: '0deg'
									}, 600);
								}
								else {
									$img.fadeOut(1200, function(){
										$(this).remove();
										++completed;
										if(completed === 4) {
											completed = 0;
											isRotating = false;
										}
									});
								}
								
						}, interval );	
					});
					
				},
				//set initial rotations
				configure			= function() {
					if($.browser.msie && !ieLte8)
						rotateMaskCorners();
					else if(ieLte8)
						hideMaskCorners();
						
					$listItems.each(function(i) {
						//the initial current is 1 
						//since we already showing the first image
						var $item = $(this).data('current', 1);
						
						if(!ieLte8)
						$item.transform({rotate: $item.data('rotation') + 'deg'})
							 .find('img')
							 .transform({origin: origin});
					});
				},
				//rotates the masks and corners
				rotateMaskCorners	= function() {
					$rm_mask_left.transform({rotate: '-3deg'});
					$rm_mask_right.transform({rotate: '3deg'});
					$rm_corner_left.transform({rotate: '45deg'});
					$rm_corner_right.transform({rotate: '-45deg'});
				},
				//hides the masks and corners
				hideMaskCorners		= function() {
					$rm_mask_left.hide();
					$rm_mask_right.hide();
					$rm_corner_left.hide();
					$rm_corner_right.hide();
				},
				startSlideshow		= function() {
					clearInterval(slideshowInterval);
					rotateImages(1);
					slideshowInterval	= setInterval(function() {
						rotateImages(1);
					}, slideshowTime);
					//show the pause button and hide the play button
					$rm_play.hide();
					$rm_pause.show();
				},
				stopSlideshow		= function() {
					clearInterval(slideshowInterval);
					//show the play button and hide the pause button
					$rm_pause.hide();
					$rm_play.show();
				};
						
			setTimeout(function() {startSlideshow();},3500);
			return {init : init};
		})();
		
	RotateImageMenu.init();
});


//jquery.transform-0.9.3.min_.js

/*
 * jQuery 2d Transform v0.9.3
 * http://wiki.github.com/heygrady/transform/
 *
 * Copyright 2010, Grady Kuhnline
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 * 
 * Date: Sat Dec 4 15:46:09 2010 -0800
 */
(function(f,g,j,b){var h=/progid:DXImageTransform\.Microsoft\.Matrix\(.*?\)/,c=/^([\+\-]=)?([\d+.\-]+)(.*)$/,q=/%/;var d=j.createElement("modernizr"),e=d.style;function n(s){return parseFloat(s)}function l(){var s={transformProperty:"",MozTransform:"-moz-",WebkitTransform:"-webkit-",OTransform:"-o-",msTransform:"-ms-"};for(var t in s){if(typeof e[t]!="undefined"){return s[t]}}return null}function r(){if(typeof(g.Modernizr)!=="undefined"){return Modernizr.csstransforms}var t=["transformProperty","WebkitTransform","MozTransform","OTransform","msTransform"];for(var s in t){if(e[t[s]]!==b){return true}}}var a=l(),i=a!==null?a+"transform":false,k=a!==null?a+"transform-origin":false;f.support.csstransforms=r();if(a=="-ms-"){i="msTransform";k="msTransformOrigin"}f.extend({transform:function(s){s.transform=this;this.$elem=f(s);this.applyingMatrix=false;this.matrix=null;this.height=null;this.width=null;this.outerHeight=null;this.outerWidth=null;this.boxSizingValue=null;this.boxSizingProperty=null;this.attr=null;this.transformProperty=i;this.transformOriginProperty=k}});f.extend(f.transform,{funcs:["matrix","origin","reflect","reflectX","reflectXY","reflectY","rotate","scale","scaleX","scaleY","skew","skewX","skewY","translate","translateX","translateY"]});f.fn.transform=function(s,t){return this.each(function(){var u=this.transform||new f.transform(this);if(s){u.exec(s,t)}})};f.transform.prototype={exec:function(s,t){t=f.extend(true,{forceMatrix:false,preserve:false},t);this.attr=null;if(t.preserve){s=f.extend(true,this.getAttrs(true,true),s)}else{s=f.extend(true,{},s)}this.setAttrs(s);if(f.support.csstransforms&&!t.forceMatrix){return this.execFuncs(s)}else{if(f.browser.msie||(f.support.csstransforms&&t.forceMatrix)){return this.execMatrix(s)}}return false},execFuncs:function(t){var s=[];for(var u in t){if(u=="origin"){this[u].apply(this,f.isArray(t[u])?t[u]:[t[u]])}else{if(f.inArray(u,f.transform.funcs)!==-1){s.push(this.createTransformFunc(u,t[u]))}}}this.$elem.css(i,s.join(" "));return true},execMatrix:function(z){var C,x,t;var F=this.$elem[0],B=this;function A(N,M){if(q.test(N)){return parseFloat(N)/100*B["safeOuter"+(M?"Height":"Width")]()}return o(F,N)}var s=/translate[X|Y]?/,u=[];for(var v in z){switch(f.type(z[v])){case"array":t=z[v];break;case"string":t=f.map(z[v].split(","),f.trim);break;default:t=[z[v]]}if(f.matrix[v]){if(f.cssAngle[v]){t=f.map(t,f.angle.toDegree)}else{if(!f.cssNumber[v]){t=f.map(t,A)}else{t=f.map(t,n)}}x=f.matrix[v].apply(this,t);if(s.test(v)){u.push(x)}else{C=C?C.x(x):x}}else{if(v=="origin"){this[v].apply(this,t)}}}C=C||f.matrix.identity();f.each(u,function(M,N){C=C.x(N)});var K=parseFloat(C.e(1,1).toFixed(6)),I=parseFloat(C.e(2,1).toFixed(6)),H=parseFloat(C.e(1,2).toFixed(6)),G=parseFloat(C.e(2,2).toFixed(6)),L=C.rows===3?parseFloat(C.e(1,3).toFixed(6)):0,J=C.rows===3?parseFloat(C.e(2,3).toFixed(6)):0;if(f.support.csstransforms&&a==="-moz-"){this.$elem.css(i,"matrix("+K+", "+I+", "+H+", "+G+", "+L+"px, "+J+"px)")}else{if(f.support.csstransforms){this.$elem.css(i,"matrix("+K+", "+I+", "+H+", "+G+", "+L+", "+J+")")}else{if(f.browser.msie){var w=", FilterType='nearest neighbor'";var D=this.$elem[0].style;var E="progid:DXImageTransform.Microsoft.Matrix(M11="+K+", M12="+H+", M21="+I+", M22="+G+", sizingMethod='auto expand'"+w+")";var y=D.filter||f.curCSS(this.$elem[0],"filter")||"";D.filter=h.test(y)?y.replace(h,E):y?y+" "+E:E;this.applyingMatrix=true;this.matrix=C;this.fixPosition(C,L,J);this.applyingMatrix=false;this.matrix=null}}}return true},origin:function(s,t){if(f.support.csstransforms){if(typeof t==="undefined"){this.$elem.css(k,s)}else{this.$elem.css(k,s+" "+t)}return true}switch(s){case"left":s="0";break;case"right":s="100%";break;case"center":case b:s="50%"}switch(t){case"top":t="0";break;case"bottom":t="100%";break;case"center":case b:t="50%"}this.setAttr("origin",[q.test(s)?s:o(this.$elem[0],s)+"px",q.test(t)?t:o(this.$elem[0],t)+"px"]);return true},createTransformFunc:function(t,u){if(t.substr(0,7)==="reflect"){var s=u?f.matrix[t]():f.matrix.identity();return"matrix("+s.e(1,1)+", "+s.e(2,1)+", "+s.e(1,2)+", "+s.e(2,2)+", 0, 0)"}if(t=="matrix"){if(a==="-moz-"){u[4]=u[4]?u[4]+"px":0;u[5]=u[5]?u[5]+"px":0}}return t+"("+(f.isArray(u)?u.join(", "):u)+")"},fixPosition:function(B,y,x,D,s){var w=new f.matrix.calc(B,this.safeOuterHeight(),this.safeOuterWidth()),C=this.getAttr("origin");var v=w.originOffset(new f.matrix.V2(q.test(C[0])?parseFloat(C[0])/100*w.outerWidth:parseFloat(C[0]),q.test(C[1])?parseFloat(C[1])/100*w.outerHeight:parseFloat(C[1])));var t=w.sides();var u=this.$elem.css("position");if(u=="static"){u="relative"}var A={top:0,left:0};var z={position:u,top:(v.top+x+t.top+A.top)+"px",left:(v.left+y+t.left+A.left)+"px",zoom:1};this.$elem.css(z)}};function o(s,u){var t=c.exec(f.trim(u));if(t[3]&&t[3]!=="px"){var w="paddingBottom",v=f.style(s,w);f.style(s,w,u);u=p(s,w);f.style(s,w,v);return u}return parseFloat(u)}function p(t,u){if(t[u]!=null&&(!t.style||t.style[u]==null)){return t[u]}var s=parseFloat(f.css(t,u));return s&&s>-10000?s:0}})(jQuery,this,this.document);(function(d,c,a,f){d.extend(d.transform.prototype,{safeOuterHeight:function(){return this.safeOuterLength("height")},safeOuterWidth:function(){return this.safeOuterLength("width")},safeOuterLength:function(l){var p="outer"+(l=="width"?"Width":"Height");if(!d.support.csstransforms&&d.browser.msie){l=l=="width"?"width":"height";if(this.applyingMatrix&&!this[p]&&this.matrix){var k=new d.matrix.calc(this.matrix,1,1),n=k.offset(),g=this.$elem[p]()/n[l];this[p]=g;return g}else{if(this.applyingMatrix&&this[p]){return this[p]}}var o={height:["top","bottom"],width:["left","right"]};var h=this.$elem[0],j=parseFloat(d.curCSS(h,l,true)),q=this.boxSizingProperty,i=this.boxSizingValue;if(!this.boxSizingProperty){q=this.boxSizingProperty=e()||"box-sizing";i=this.boxSizingValue=this.$elem.css(q)||"content-box"}if(this[p]&&this[l]==j){return this[p]}else{this[l]=j}if(q&&(i=="padding-box"||i=="content-box")){j+=parseFloat(d.curCSS(h,"padding-"+o[l][0],true))||0+parseFloat(d.curCSS(h,"padding-"+o[l][1],true))||0}if(q&&i=="content-box"){j+=parseFloat(d.curCSS(h,"border-"+o[l][0]+"-width",true))||0+parseFloat(d.curCSS(h,"border-"+o[l][1]+"-width",true))||0}this[p]=j;return j}return this.$elem[p]()}});var b=null;function e(){if(b){return b}var h={boxSizing:"box-sizing",MozBoxSizing:"-moz-box-sizing",WebkitBoxSizing:"-webkit-box-sizing",OBoxSizing:"-o-box-sizing"},g=a.body;for(var i in h){if(typeof g.style[i]!="undefined"){b=h[i];return b}}return null}})(jQuery,this,this.document);(function(g,f,b,h){var d=/([\w\-]*?)\((.*?)\)/g,a="data-transform",e=/\s/,c=/,\s?/;g.extend(g.transform.prototype,{setAttrs:function(i){var j="",l;for(var k in i){l=i[k];if(g.isArray(l)){l=l.join(", ")}j+=" "+k+"("+l+")"}this.attr=g.trim(j);this.$elem.attr(a,this.attr)},setAttr:function(k,l){if(g.isArray(l)){l=l.join(", ")}var j=this.attr||this.$elem.attr(a);if(!j||j.indexOf(k)==-1){this.attr=g.trim(j+" "+k+"("+l+")");this.$elem.attr(a,this.attr)}else{var i=[],n;d.lastIndex=0;while(n=d.exec(j)){if(k==n[1]){i.push(k+"("+l+")")}else{i.push(n[0])}}this.attr=i.join(" ");this.$elem.attr(a,this.attr)}},getAttrs:function(){var j=this.attr||this.$elem.attr(a);if(!j){return{}}var i={},l,k;d.lastIndex=0;while((l=d.exec(j))!==null){if(l){k=l[2].split(c);i[l[1]]=k.length==1?k[0]:k}}return i},getAttr:function(j){var i=this.getAttrs();if(typeof i[j]!=="undefined"){return i[j]}if(j==="origin"&&g.support.csstransforms){return this.$elem.css(this.transformOriginProperty).split(e)}else{if(j==="origin"){return["50%","50%"]}}return g.cssDefault[j]||0}});if(typeof(g.cssAngle)=="undefined"){g.cssAngle={}}g.extend(g.cssAngle,{rotate:true,skew:true,skewX:true,skewY:true});if(typeof(g.cssDefault)=="undefined"){g.cssDefault={}}g.extend(g.cssDefault,{scale:[1,1],scaleX:1,scaleY:1,matrix:[1,0,0,1,0,0],origin:["50%","50%"],reflect:[1,0,0,1,0,0],reflectX:[1,0,0,1,0,0],reflectXY:[1,0,0,1,0,0],reflectY:[1,0,0,1,0,0]});if(typeof(g.cssMultipleValues)=="undefined"){g.cssMultipleValues={}}g.extend(g.cssMultipleValues,{matrix:6,origin:{length:2,duplicate:true},reflect:6,reflectX:6,reflectXY:6,reflectY:6,scale:{length:2,duplicate:true},skew:2,translate:2});g.extend(g.cssNumber,{matrix:true,reflect:true,reflectX:true,reflectXY:true,reflectY:true,scale:true,scaleX:true,scaleY:true});g.each(g.transform.funcs,function(j,k){g.cssHooks[k]={set:function(n,o){var l=n.transform||new g.transform(n),i={};i[k]=o;l.exec(i,{preserve:true})},get:function(n,l){var i=n.transform||new g.transform(n);return i.getAttr(k)}}});g.each(["reflect","reflectX","reflectXY","reflectY"],function(j,k){g.cssHooks[k].get=function(n,l){var i=n.transform||new g.transform(n);return i.getAttr("matrix")||g.cssDefault[k]}})})(jQuery,this,this.document);(function(e,g,h,c){var d=/^([+\-]=)?([\d+.\-]+)(.*)$/;var a=e.fn.animate;e.fn.animate=function(p,l,o,n){var k=e.speed(l,o,n),j=e.cssMultipleValues;k.complete=k.old;if(!e.isEmptyObject(p)){if(typeof k.original==="undefined"){k.original={}}e.each(p,function(s,u){if(j[s]||e.cssAngle[s]||(!e.cssNumber[s]&&e.inArray(s,e.transform.funcs)!==-1)){var t=null;if(jQuery.isArray(p[s])){var r=1,q=u.length;if(j[s]){r=(typeof j[s].length==="undefined"?j[s]:j[s].length)}if(q>r||(q<r&&q==2)||(q==2&&r==2&&isNaN(parseFloat(u[q-1])))){t=u[q-1];u.splice(q-1,1)}}k.original[s]=u.toString();p[s]=parseFloat(u)}})}return a.apply(this,[arguments[0],k])};var b="paddingBottom";function i(k,l){if(k[l]!=null&&(!k.style||k.style[l]==null)){}var j=parseFloat(e.css(k,l));return j&&j>-10000?j:0}var f=e.fx.prototype.custom;e.fx.prototype.custom=function(u,v,w){var y=e.cssMultipleValues[this.prop],p=e.cssAngle[this.prop];if(y||(!e.cssNumber[this.prop]&&e.inArray(this.prop,e.transform.funcs)!==-1)){this.values=[];if(!y){y=1}var x=this.options.original[this.prop],t=e(this.elem).css(this.prop),j=e.cssDefault[this.prop]||0;if(!e.isArray(t)){t=[t]}if(!e.isArray(x)){if(e.type(x)==="string"){x=x.split(",")}else{x=[x]}}var l=y.length||y,s=0;while(x.length<l){x.push(y.duplicate?x[0]:j[s]||0);s++}var k,r,q,o=this,n=o.elem.transform;orig=e.style(o.elem,b);e.each(x,function(z,A){if(t[z]){k=t[z]}else{if(j[z]&&!y.duplicate){k=j[z]}else{if(y.duplicate){k=t[0]}else{k=0}}}if(p){k=e.angle.toDegree(k)}else{if(!e.cssNumber[o.prop]){r=d.exec(e.trim(k));if(r[3]&&r[3]!=="px"){if(r[3]==="%"){k=parseFloat(r[2])/100*n["safeOuter"+(z?"Height":"Width")]()}else{e.style(o.elem,b,k);k=i(o.elem,b);e.style(o.elem,b,orig)}}}}k=parseFloat(k);r=d.exec(e.trim(A));if(r){q=parseFloat(r[2]);w=r[3]||"px";if(p){q=e.angle.toDegree(q+w);w="deg"}else{if(!e.cssNumber[o.prop]&&w==="%"){k=(k/n["safeOuter"+(z?"Height":"Width")]())*100}else{if(!e.cssNumber[o.prop]&&w!=="px"){e.style(o.elem,b,(q||1)+w);k=((q||1)/i(o.elem,b))*k;e.style(o.elem,b,orig)}}}if(r[1]){q=((r[1]==="-="?-1:1)*q)+k}}else{q=A;w=""}o.values.push({start:k,end:q,unit:w})})}return f.apply(this,arguments)};e.fx.multipleValueStep={_default:function(j){e.each(j.values,function(k,l){j.values[k].now=l.start+((l.end-l.start)*j.pos)})}};e.each(["matrix","reflect","reflectX","reflectXY","reflectY"],function(j,k){e.fx.multipleValueStep[k]=function(n){var p=n.decomposed,l=e.matrix;m=l.identity();p.now={};e.each(p.start,function(q){p.now[q]=parseFloat(p.start[q])+((parseFloat(p.end[q])-parseFloat(p.start[q]))*n.pos);if(((q==="scaleX"||q==="scaleY")&&p.now[q]===1)||(q!=="scaleX"&&q!=="scaleY"&&p.now[q]===0)){return true}m=m.x(l[q](p.now[q]))});var o;e.each(n.values,function(q){switch(q){case 0:o=parseFloat(m.e(1,1).toFixed(6));break;case 1:o=parseFloat(m.e(2,1).toFixed(6));break;case 2:o=parseFloat(m.e(1,2).toFixed(6));break;case 3:o=parseFloat(m.e(2,2).toFixed(6));break;case 4:o=parseFloat(m.e(1,3).toFixed(6));break;case 5:o=parseFloat(m.e(2,3).toFixed(6));break}n.values[q].now=o})}});e.each(e.transform.funcs,function(j,k){e.fx.step[k]=function(o){var n=o.elem.transform||new e.transform(o.elem),l={};if(e.cssMultipleValues[k]||(!e.cssNumber[k]&&e.inArray(k,e.transform.funcs)!==-1)){(e.fx.multipleValueStep[o.prop]||e.fx.multipleValueStep._default)(o);l[o.prop]=[];e.each(o.values,function(p,q){l[o.prop].push(q.now+(e.cssNumber[o.prop]?"":q.unit))})}else{l[o.prop]=o.now+(e.cssNumber[o.prop]?"":o.unit)}n.exec(l,{preserve:true})}});e.each(["matrix","reflect","reflectX","reflectXY","reflectY"],function(j,k){e.fx.step[k]=function(q){var p=q.elem.transform||new e.transform(q.elem),o={};if(!q.initialized){q.initialized=true;if(k!=="matrix"){var n=e.matrix[k]().elements;var r;e.each(q.values,function(s){switch(s){case 0:r=n[0];break;case 1:r=n[2];break;case 2:r=n[1];break;case 3:r=n[3];break;default:r=0}q.values[s].end=r})}q.decomposed={};var l=q.values;q.decomposed.start=e.matrix.matrix(l[0].start,l[1].start,l[2].start,l[3].start,l[4].start,l[5].start).decompose();q.decomposed.end=e.matrix.matrix(l[0].end,l[1].end,l[2].end,l[3].end,l[4].end,l[5].end).decompose()}(e.fx.multipleValueStep[q.prop]||e.fx.multipleValueStep._default)(q);o.matrix=[];e.each(q.values,function(s,t){o.matrix.push(t.now)});p.exec(o,{preserve:true})}})})(jQuery,this,this.document);(function(g,h,j,c){var d=180/Math.PI;var k=200/Math.PI;var f=Math.PI/180;var e=2/1.8;var i=0.9;var a=Math.PI/200;var b=/^([+\-]=)?([\d+.\-]+)(.*)$/;g.extend({angle:{runit:/(deg|g?rad)/,radianToDegree:function(l){return l*d},radianToGrad:function(l){return l*k},degreeToRadian:function(l){return l*f},degreeToGrad:function(l){return l*e},gradToDegree:function(l){return l*i},gradToRadian:function(l){return l*a},toDegree:function(n){var l=b.exec(n);if(l){n=parseFloat(l[2]);switch(l[3]||"deg"){case"grad":n=g.angle.gradToDegree(n);break;case"rad":n=g.angle.radianToDegree(n);break}return n}return 0}}})})(jQuery,this,this.document);(function(f,e,b,g){if(typeof(f.matrix)=="undefined"){f.extend({matrix:{}})}var d=f.matrix;f.extend(d,{V2:function(h,i){if(f.isArray(arguments[0])){this.elements=arguments[0].slice(0,2)}else{this.elements=[h,i]}this.length=2},V3:function(h,j,i){if(f.isArray(arguments[0])){this.elements=arguments[0].slice(0,3)}else{this.elements=[h,j,i]}this.length=3},M2x2:function(i,h,k,j){if(f.isArray(arguments[0])){this.elements=arguments[0].slice(0,4)}else{this.elements=Array.prototype.slice.call(arguments).slice(0,4)}this.rows=2;this.cols=2},M3x3:function(n,l,k,j,i,h,q,p,o){if(f.isArray(arguments[0])){this.elements=arguments[0].slice(0,9)}else{this.elements=Array.prototype.slice.call(arguments).slice(0,9)}this.rows=3;this.cols=3}});var c={e:function(k,h){var i=this.rows,j=this.cols;if(k>i||h>i||k<1||h<1){return 0}return this.elements[(k-1)*j+h-1]},decompose:function(){var v=this.e(1,1),t=this.e(2,1),q=this.e(1,2),p=this.e(2,2),o=this.e(1,3),n=this.e(2,3);if(Math.abs(v*p-t*q)<0.01){return{rotate:0+"deg",skewX:0+"deg",scaleX:1,scaleY:1,translateX:0+"px",translateY:0+"px"}}var l=o,j=n;var u=Math.sqrt(v*v+t*t);v=v/u;t=t/u;var i=v*q+t*p;q-=v*i;p-=t*i;var s=Math.sqrt(q*q+p*p);q=q/s;p=p/s;i=i/s;if((v*p-t*q)<0){v=-v;t=-t;u=-u}var w=f.angle.radianToDegree;var h=w(Math.atan2(t,v));i=w(Math.atan(i));return{rotate:h+"deg",skewX:i+"deg",scaleX:u,scaleY:s,translateX:l+"px",translateY:j+"px"}}};f.extend(d.M2x2.prototype,c,{toM3x3:function(){var h=this.elements;return new d.M3x3(h[0],h[1],0,h[2],h[3],0,0,0,1)},x:function(j){var k=typeof(j.rows)==="undefined";if(!k&&j.rows==3){return this.toM3x3().x(j)}var i=this.elements,h=j.elements;if(k&&h.length==2){return new d.V2(i[0]*h[0]+i[1]*h[1],i[2]*h[0]+i[3]*h[1])}else{if(h.length==i.length){return new d.M2x2(i[0]*h[0]+i[1]*h[2],i[0]*h[1]+i[1]*h[3],i[2]*h[0]+i[3]*h[2],i[2]*h[1]+i[3]*h[3])}}return false},inverse:function(){var i=1/this.determinant(),h=this.elements;return new d.M2x2(i*h[3],i*-h[1],i*-h[2],i*h[0])},determinant:function(){var h=this.elements;return h[0]*h[3]-h[1]*h[2]}});f.extend(d.M3x3.prototype,c,{x:function(j){var k=typeof(j.rows)==="undefined";if(!k&&j.rows<3){j=j.toM3x3()}var i=this.elements,h=j.elements;if(k&&h.length==3){return new d.V3(i[0]*h[0]+i[1]*h[1]+i[2]*h[2],i[3]*h[0]+i[4]*h[1]+i[5]*h[2],i[6]*h[0]+i[7]*h[1]+i[8]*h[2])}else{if(h.length==i.length){return new d.M3x3(i[0]*h[0]+i[1]*h[3]+i[2]*h[6],i[0]*h[1]+i[1]*h[4]+i[2]*h[7],i[0]*h[2]+i[1]*h[5]+i[2]*h[8],i[3]*h[0]+i[4]*h[3]+i[5]*h[6],i[3]*h[1]+i[4]*h[4]+i[5]*h[7],i[3]*h[2]+i[4]*h[5]+i[5]*h[8],i[6]*h[0]+i[7]*h[3]+i[8]*h[6],i[6]*h[1]+i[7]*h[4]+i[8]*h[7],i[6]*h[2]+i[7]*h[5]+i[8]*h[8])}}return false},inverse:function(){var i=1/this.determinant(),h=this.elements;return new d.M3x3(i*(h[8]*h[4]-h[7]*h[5]),i*(-(h[8]*h[1]-h[7]*h[2])),i*(h[5]*h[1]-h[4]*h[2]),i*(-(h[8]*h[3]-h[6]*h[5])),i*(h[8]*h[0]-h[6]*h[2]),i*(-(h[5]*h[0]-h[3]*h[2])),i*(h[7]*h[3]-h[6]*h[4]),i*(-(h[7]*h[0]-h[6]*h[1])),i*(h[4]*h[0]-h[3]*h[1]))},determinant:function(){var h=this.elements;return h[0]*(h[8]*h[4]-h[7]*h[5])-h[3]*(h[8]*h[1]-h[7]*h[2])+h[6]*(h[5]*h[1]-h[4]*h[2])}});var a={e:function(h){return this.elements[h-1]}};f.extend(d.V2.prototype,a);f.extend(d.V3.prototype,a)})(jQuery,this,this.document);(function(c,b,a,d){if(typeof(c.matrix)=="undefined"){c.extend({matrix:{}})}c.extend(c.matrix,{calc:function(e,f,g){this.matrix=e;this.outerHeight=f;this.outerWidth=g}});c.matrix.calc.prototype={coord:function(e,i,h){h=typeof(h)!=="undefined"?h:0;var g=this.matrix,f;switch(g.rows){case 2:f=g.x(new c.matrix.V2(e,i));break;case 3:f=g.x(new c.matrix.V3(e,i,h));break}return f},corners:function(e,h){var f=!(typeof(e)!=="undefined"||typeof(h)!=="undefined"),g;if(!this.c||!f){h=h||this.outerHeight;e=e||this.outerWidth;g={tl:this.coord(0,0),bl:this.coord(0,h),tr:this.coord(e,0),br:this.coord(e,h)}}else{g=this.c}if(f){this.c=g}return g},sides:function(e){var f=e||this.corners();return{top:Math.min(f.tl.e(2),f.tr.e(2),f.br.e(2),f.bl.e(2)),bottom:Math.max(f.tl.e(2),f.tr.e(2),f.br.e(2),f.bl.e(2)),left:Math.min(f.tl.e(1),f.tr.e(1),f.br.e(1),f.bl.e(1)),right:Math.max(f.tl.e(1),f.tr.e(1),f.br.e(1),f.bl.e(1))}},offset:function(e){var f=this.sides(e);return{height:Math.abs(f.bottom-f.top),width:Math.abs(f.right-f.left)}},area:function(e){var h=e||this.corners();var g={x:h.tr.e(1)-h.tl.e(1)+h.br.e(1)-h.bl.e(1),y:h.tr.e(2)-h.tl.e(2)+h.br.e(2)-h.bl.e(2)},f={x:h.bl.e(1)-h.tl.e(1)+h.br.e(1)-h.tr.e(1),y:h.bl.e(2)-h.tl.e(2)+h.br.e(2)-h.tr.e(2)};return 0.25*Math.abs(g.e(1)*f.e(2)-g.e(2)*f.e(1))},nonAffinity:function(){var f=this.sides(),g=f.top-f.bottom,e=f.left-f.right;return parseFloat(parseFloat(Math.abs((Math.pow(g,2)+Math.pow(e,2))/(f.top*f.bottom+f.left*f.right))).toFixed(8))},originOffset:function(h,g){h=h?h:new c.matrix.V2(this.outerWidth*0.5,this.outerHeight*0.5);g=g?g:new c.matrix.V2(0,0);var e=this.coord(h.e(1),h.e(2));var f=this.coord(g.e(1),g.e(2));return{top:(f.e(2)-g.e(2))-(e.e(2)-h.e(2)),left:(f.e(1)-g.e(1))-(e.e(1)-h.e(1))}}}})(jQuery,this,this.document);(function(e,d,a,f){if(typeof(e.matrix)=="undefined"){e.extend({matrix:{}})}var c=e.matrix,g=c.M2x2,b=c.M3x3;e.extend(c,{identity:function(k){k=k||2;var l=k*k,n=new Array(l),j=k+1;for(var h=0;h<l;h++){n[h]=(h%j)===0?1:0}return new c["M"+k+"x"+k](n)},matrix:function(){var h=Array.prototype.slice.call(arguments);switch(arguments.length){case 4:return new g(h[0],h[2],h[1],h[3]);case 6:return new b(h[0],h[2],h[4],h[1],h[3],h[5],0,0,1)}},reflect:function(){return new g(-1,0,0,-1)},reflectX:function(){return new g(1,0,0,-1)},reflectXY:function(){return new g(0,1,1,0)},reflectY:function(){return new g(-1,0,0,1)},rotate:function(l){var i=e.angle.degreeToRadian(l),k=Math.cos(i),n=Math.sin(i);var j=k,h=n,p=-n,o=k;return new g(j,p,h,o)},scale:function(i,h){i=i||i===0?i:1;h=h||h===0?h:i;return new g(i,0,0,h)},scaleX:function(h){return c.scale(h,1)},scaleY:function(h){return c.scale(1,h)},skew:function(k,i){k=k||0;i=i||0;var l=e.angle.degreeToRadian(k),j=e.angle.degreeToRadian(i),h=Math.tan(l),n=Math.tan(j);return new g(1,h,n,1)},skewX:function(h){return c.skew(h)},skewY:function(h){return c.skew(0,h)},translate:function(i,h){i=i||0;h=h||0;return new b(1,0,i,0,1,h,0,0,1)},translateX:function(h){return c.translate(h)},translateY:function(h){return c.translate(0,h)}})})(jQuery,this,this.document);


/*
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * Uses the built in easing capabilities added In jQuery 1.1
 * to offer multiple easing options
 *
 * TERMS OF USE - jQuery Easing
 * 
 * Open source under the BSD License. 
 * 
 * Copyright © 2008 George McGinley Smith
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of 
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list 
 * of conditions and the following disclaimer in the documentation and/or other materials 
 * provided with the distribution.
 * 
 * Neither the name of the author nor the names of contributors may be used to endorse 
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE. 
 *
*/
// t: current time, b: begInnIng value, c: change In value, d: duration
jQuery.easing['jswing'] = jQuery.easing['swing'];

jQuery.extend( jQuery.easing,
{
	def: 'easeOutQuad',
	swing: function (x, t, b, c, d) {
		//alert(jQuery.easing.default);
		return jQuery.easing[jQuery.easing.def](x, t, b, c, d);
	},
	easeInQuad: function (x, t, b, c, d) {
		return c*(t/=d)*t + b;
	},
	easeOutQuad: function (x, t, b, c, d) {
		return -c *(t/=d)*(t-2) + b;
	},
	easeInOutQuad: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t + b;
		return -c/2 * ((--t)*(t-2) - 1) + b;
	},
	easeInCubic: function (x, t, b, c, d) {
		return c*(t/=d)*t*t + b;
	},
	easeOutCubic: function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t + 1) + b;
	},
	easeInOutCubic: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t + b;
		return c/2*((t-=2)*t*t + 2) + b;
	},
	easeInQuart: function (x, t, b, c, d) {
		return c*(t/=d)*t*t*t + b;
	},
	easeOutQuart: function (x, t, b, c, d) {
		return -c * ((t=t/d-1)*t*t*t - 1) + b;
	},
	easeInOutQuart: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
		return -c/2 * ((t-=2)*t*t*t - 2) + b;
	},
	easeInQuint: function (x, t, b, c, d) {
		return c*(t/=d)*t*t*t*t + b;
	},
	easeOutQuint: function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t*t*t + 1) + b;
	},
	easeInOutQuint: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
		return c/2*((t-=2)*t*t*t*t + 2) + b;
	},
	easeInSine: function (x, t, b, c, d) {
		return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
	},
	easeOutSine: function (x, t, b, c, d) {
		return c * Math.sin(t/d * (Math.PI/2)) + b;
	},
	easeInOutSine: function (x, t, b, c, d) {
		return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
	},
	easeInExpo: function (x, t, b, c, d) {
		return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
	},
	easeOutExpo: function (x, t, b, c, d) {
		return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
	},
	easeInOutExpo: function (x, t, b, c, d) {
		if (t==0) return b;
		if (t==d) return b+c;
		if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
		return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
	},
	easeInCirc: function (x, t, b, c, d) {
		return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
	},
	easeOutCirc: function (x, t, b, c, d) {
		return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
	},
	easeInOutCirc: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
		return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
	},
	easeInElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
	},
	easeOutElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
	},
	easeInOutElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
	},
	easeInBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*(t/=d)*t*((s+1)*t - s) + b;
	},
	easeOutBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	},
	easeInOutBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158; 
		if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
		return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
	},
	easeInBounce: function (x, t, b, c, d) {
		return c - jQuery.easing.easeOutBounce (x, d-t, 0, c, d) + b;
	},
	easeOutBounce: function (x, t, b, c, d) {
		if ((t/=d) < (1/2.75)) {
			return c*(7.5625*t*t) + b;
		} else if (t < (2/2.75)) {
			return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
		} else if (t < (2.5/2.75)) {
			return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
		} else {
			return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
		}
	},
	easeInOutBounce: function (x, t, b, c, d) {
		if (t < d/2) return jQuery.easing.easeInBounce (x, t*2, 0, c, d) * .5 + b;
		return jQuery.easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
	}
});

/*
 *
 * TERMS OF USE - EASING EQUATIONS
 * 
 * Open source under the BSD License. 
 * 
 * Copyright © 2001 Robert Penner
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of 
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list 
 * of conditions and the following disclaimer in the documentation and/or other materials 
 * provided with the distribution.
 * 
 * Neither the name of the author nor the names of contributors may be used to endorse 
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE. 
 *
 */


//stickysidebar.jquery.js
(function(c){var g={speed:350,easing:"linear",padding:10,constrain:!1},i=c(window),e=[],l={init:function(a){g=c.extend(g,a);return this.each(function(){var a=c(this);m(a);e[e.length]=a;j()})},remove:function(){return this.each(function(){var a=this;c.each(e,function(d,b){if(b.get(0)===a)return k(null,b),e.splice(d,1),!1})})},destroy:function(){c.each(e,function(a,d){k(null,d)});e=[];i.unbind("scroll",j);i.unbind("resize",k);return this}},j=function(){c.each(e,function(a,d){var b=d.data("stickySB");
if(b){var c=i.scrollTop()-b.offs.top;d.offset();var f=b.orig.offset.top-b.offs.top,h=f;f<c&&(h=c+g.padding>b.offs.bottom?b.offs.bottom:c+g.padding);d.stop().animate({top:h},g.speed,g.easing)}})},m=function(a){if(a){var d=a.parent(),b=d.offset(),e=a.offset(),f=a.data("stickySB");for(f||(f={offs:{},orig:{top:a.css("top"),left:a.css("left"),position:a.css("position"),marginTop:a.css("marginTop"),marginLeft:a.css("marginLeft"),offset:a.offset()}});b&&"top"in b&&d.css("position")=="static";)d=d.parent(),
b=d.offset();if(b){var h=parseInt(d.css("paddingBottom")),h=isNaN(h)?0:h;f.offs=b;f.offs.bottom=g.constrain?Math.abs(d.innerHeight()-h-a.outerHeight()):c(document).height()}else f.offs={top:0,left:0,bottom:c(document).height()};a.css({position:"absolute",top:Math.floor(e.top-f.offs.top)+"px",left:Math.floor(e.left-f.offs.left)+"px",margin:0,width:a.width()}).data("stickySB",f)}},k=function(a,d){var b=e;d&&(b=[d]);c.each(b,function(a,b){var c=b.data("stickySB");c&&(b.css({position:c.orig.position,
marginTop:c.orig.marginTop,marginLeft:c.orig.marginLeft,left:c.orig.left,top:c.orig.top}),d||(m(b),j()))})};i.bind("scroll",j);i.bind("resize",k);c.fn.stickySidebar=function(a){if(l[a])return l[a].apply(this,Array.prototype.slice.call(arguments,1));else if(!a||typeof a=="object")return l.init.apply(this,arguments)}})(jQuery);


/*
 * jQuery Color Animations v@VERSION
 * http://jquery.org/
 *
 * Copyright 2011 John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * Date: @DATE
 */
(function( jQuery, undefined ){
	var stepHooks = "backgroundColor borderBottomColor borderLeftColor borderRightColor borderTopColor color outlineColor".split(" "),

		// plusequals test for += 100 -= 100
		rplusequals = /^([\-+])=\s*(\d+\.?\d*)/,
		// a set of RE's that can match strings and generate color tuples.
		stringParsers = [{
				re: /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
				parse: function( execResult ) {
					return [
						execResult[ 1 ],
						execResult[ 2 ],
						execResult[ 3 ],
						execResult[ 4 ]
					];
				}
			}, {
				re: /rgba?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
				parse: function( execResult ) {
					return [
						2.55 * execResult[1],
						2.55 * execResult[2],
						2.55 * execResult[3],
						execResult[ 4 ]
					];
				}
			}, {
				re: /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/,
				parse: function( execResult ) {
					return [
						parseInt( execResult[ 1 ], 16 ),
						parseInt( execResult[ 2 ], 16 ),
						parseInt( execResult[ 3 ], 16 )
					];
				}
			}, {
				re: /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/,
				parse: function( execResult ) {
					return [
						parseInt( execResult[ 1 ] + execResult[ 1 ], 16 ),
						parseInt( execResult[ 2 ] + execResult[ 2 ], 16 ),
						parseInt( execResult[ 3 ] + execResult[ 3 ], 16 )
					];
				}
			}, {
				re: /hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
				space: "hsla",
				parse: function( execResult ) {
					return [
						execResult[1],
						execResult[2] / 100,
						execResult[3] / 100,
						execResult[4]
					];
				}
			}],

		// jQuery.Color( )
		color = jQuery.Color = function( color, green, blue, alpha ) {
			return new jQuery.Color.fn.parse( color, green, blue, alpha );
		},
		spaces = {
			rgba: {
				cache: "_rgba",
				props: {
					red: {
						idx: 0,
						type: "byte",
						empty: true
					},
					green: {
						idx: 1,
						type: "byte",
						empty: true
					},
					blue: {
						idx: 2,
						type: "byte",
						empty: true
					},
					alpha: {
						idx: 3,
						type: "percent",
						def: 1
					}
				}
			},
			hsla: {
				cache: "_hsla",
				props: {
					hue: {
						idx: 0,
						type: "degrees",
						empty: true
					},
					saturation: {
						idx: 1,
						type: "percent",
						empty: true
					},
					lightness: {
						idx: 2,
						type: "percent",
						empty: true
					}
				}
			}
		},
		propTypes = {
			"byte": {
				floor: true,
				min: 0,
				max: 255
			},
			"percent": {
				min: 0,
				max: 1
			},
			"degrees": {
				mod: 360,
				floor: true
			}
		},
		rgbaspace = spaces.rgba.props,
		support = color.support = {},

		// colors = jQuery.Color.names
		colors,

		// local aliases of functions called often
		each = jQuery.each;

	spaces.hsla.props.alpha = rgbaspace.alpha;

	function clamp( value, prop, alwaysAllowEmpty ) {
		var type = propTypes[ prop.type ] || {},
			allowEmpty = prop.empty || alwaysAllowEmpty;

		if ( allowEmpty && value == null ) {
			return null;
		}
		if ( prop.def && value == null ) {
			return prop.def;
		}
		if ( type.floor ) {
			value = ~~value;
		} else {
			value = parseFloat( value );
		}
		if ( value == null || isNaN( value ) ) {
			return prop.def;
		}
		if ( type.mod ) {
			value = value % type.mod;
			// -10 -> 350
			return value < 0 ? type.mod + value : value;
		}

		// for now all property types without mod have min and max
		return type.min > value ? type.min : type.max < value ? type.max : value;
	}

	function stringParse( string ) {
		var inst = color(),
			rgba = inst._rgba = [];

		string = string.toLowerCase();

		each( stringParsers, function( i, parser ) {
			var match = parser.re.exec( string ),
				values = match && parser.parse( match ),
				parsed,
				spaceName = parser.space || "rgba",
				cache = spaces[ spaceName ].cache;


			if ( values ) {
				parsed = inst[ spaceName ]( values );

				// if this was an rgba parse the assignment might happen twice
				// oh well....
				inst[ cache ] = parsed[ cache ];
				rgba = inst._rgba = parsed._rgba;

				// exit each( stringParsers ) here because we matched
				return false;
			}
		});

		// Found a stringParser that handled it
		if ( rgba.length !== 0 ) {

			// if this came from a parsed string, force "transparent" when alpha is 0
			// chrome, (and maybe others) return "transparent" as rgba(0,0,0,0)
			if ( Math.max.apply( Math, rgba ) === 0 ) {
				jQuery.extend( rgba, colors.transparent );
			}
			return inst;
		}

		// named colors / default - filter back through parse function
		if ( string = colors[ string ] ) {
			return string;
		}
	}

	color.fn = color.prototype = {
		constructor: color,
		parse: function( red, green, blue, alpha ) {
			if ( red === undefined ) {
				this._rgba = [ null, null, null, null ];
				return this;
			}
			if ( red instanceof jQuery || red.nodeType ) {
				red = red instanceof jQuery ? red.css( green ) : jQuery( red ).css( green );
				green = undefined;
			}

			var inst = this,
				type = jQuery.type( red ),
				rgba = this._rgba = [],
				source;

			// more than 1 argument specified - assume ( red, green, blue, alpha )
			if ( green !== undefined ) {
				red = [ red, green, blue, alpha ];
				type = "array";
			}

			if ( type === "string" ) {
				return this.parse( stringParse( red ) || colors._default );
			}

			if ( type === "array" ) {
				each( rgbaspace, function( key, prop ) {
					rgba[ prop.idx ] = clamp( red[ prop.idx ], prop );
				});
				return this;
			}

			if ( type === "object" ) {
				if ( red instanceof color ) {
					each( spaces, function( spaceName, space ) {
						if ( red[ space.cache ] ) {
							inst[ space.cache ] = red[ space.cache ].slice();
						}
					});
				} else {
					each( spaces, function( spaceName, space ) {
						each( space.props, function( key, prop ) {
							var cache = space.cache;

							// if the cache doesn't exist, and we know how to convert
							if ( !inst[ cache ] && space.to ) {

								// if the value was null, we don't need to copy it
								// if the key was alpha, we don't need to copy it either
								if ( red[ key ] == null || key === "alpha") {
									return;
								}
								inst[ cache ] = space.to( inst._rgba );
							}

							// this is the only case where we allow nulls for ALL properties.
							// call clamp with alwaysAllowEmpty
							inst[ cache ][ prop.idx ] = clamp( red[ key ], prop, true );
						});
					});
				}
				return this;
			}
		},
		is: function( compare ) {
			var is = color( compare ),
				same = true,
				myself = this;

			each( spaces, function( _, space ) {
				var isCache = is[ space.cache ],
					localCache;
				if (isCache) {
					localCache = myself[ space.cache ] || space.to && space.to( myself._rgba ) || [];
					each( space.props, function( _, prop ) {
						if ( isCache[ prop.idx ] != null ) {
							same = ( isCache[ prop.idx ] == localCache[ prop.idx ] );
							return same;
						}
					});
				}
				return same;
			});
			return same;
		},
		_space: function() {
			var used = [],
				inst = this;
			each( spaces, function( spaceName, space ) {
				if ( inst[ space.cache ] ) {
					used.push( spaceName );
				}
			});
			return used.pop();
		},
		transition: function( other, distance ) {
			var end = color( other ),
				spaceName = end._space(),
				space = spaces[ spaceName ],
				start = this[ space.cache ] || space.to( this._rgba ),
				result = start.slice();

			end = end[ space.cache ];
			each( space.props, function( key, prop ) {
				var index = prop.idx,
					startValue = start[ index ],
					endValue = end[ index ],
					type = propTypes[ prop.type ] || {};

				// if null, don't override start value
				if ( endValue === null ) {
					return;
				}
				// if null - use end
				if ( startValue === null ) {
					result[ index ] = endValue;
				} else {
					if ( type.mod ) {
						if ( endValue - startValue > type.mod / 2 ) {
							startValue += type.mod;
						} else if ( startValue - endValue > type.mod / 2 ) {
							startValue -= type.mod;
						}
					}
					result[ prop.idx ] = clamp( ( endValue - startValue ) * distance + startValue, prop );
				}
			});
			return this[ spaceName ]( result );
		},
		blend: function( opaque ) {
			// if we are already opaque - return ourself
			if ( this._rgba[ 3 ] === 1 ) {
				return this;
			}

			var rgb = this._rgba.slice(),
				a = rgb.pop(),
				blend = color( opaque )._rgba;

			return color( jQuery.map( rgb, function( v, i ) {
				return ( 1 - a ) * blend[ i ] + a * v;
			}));
		},
		toRgbaString: function() {
			var prefix = "rgba(",
				rgba = jQuery.map( this._rgba, function( v, i ) {
					return v == null ? ( i > 2 ? 1 : 0 ) : v;
				});

			if ( rgba[ 3 ] === 1 ) {
				rgba.pop();
				prefix = "rgb(";
			}

			return prefix + rgba.join(",") + ")";
		},
		toHslaString: function() {
			var prefix = "hsla(",
				hsla = jQuery.map( this.hsla(), function( v, i ) {
					if ( v == null ) {
						v = i > 2 ? 1 : 0;
					}

					// catch 1 and 2
					if ( i && i < 3 ) {
						v = Math.round( v * 100 ) + "%";
					}
					return v;
				});

			if ( hsla[ 3 ] == 1 ) {
				hsla.pop();
				prefix = "hsl(";
			}
			return prefix + hsla.join(",") + ")";
		},
		toHexString: function( includeAlpha ) {
			var rgba = this._rgba.slice(),
				alpha = rgba.pop();

			if ( includeAlpha ) {
				rgba.push( ~~( alpha * 255 ) );
			}

			return "#" + jQuery.map( rgba, function( v, i ) {

				// default to 0 when nulls exist
				v = ( v || 0 ).toString( 16 );
				return v.length == 1 ? "0" + v : v;
			}).join("");
		},
		toString: function() {
			return this._rgba[ 3 ] === 0 ? "transparent" : this.toRgbaString();
		}
	};
	color.fn.parse.prototype = color.fn;

	// hsla conversions adapted from:
	// http://www.google.com/codesearch/p#OAMlx_jo-ck/src/third_party/WebKit/Source/WebCore/inspector/front-end/Color.js&d=7&l=193

	function hue2rgb( p, q, h ) {
		h = ( h + 1 ) % 1;
		if ( h * 6 < 1 ) {
			return p + (q - p) * 6 * h;
		}
		if ( h * 2 < 1) {
			return q;
		}
		if ( h * 3 < 2 ) {
			return p + (q - p) * ((2/3) - h) * 6;
		}
		return p;
	}

	spaces.hsla.to = function ( rgba ) {
		if ( rgba[ 0 ] == null || rgba[ 1 ] == null || rgba[ 2 ] == null ) {
			return [ null, null, null, rgba[ 3 ] ];
		}
		var r = rgba[ 0 ] / 255,
			g = rgba[ 1 ] / 255,
			b = rgba[ 2 ] / 255,
			a = rgba[ 3 ],
			max = Math.max( r, g, b ),
			min = Math.min( r, g, b ),
			diff = max - min,
			add = max + min,
			l = add * 0.5,
			h, s;

		if ( min === max ) {
			h = 0;
		} else if ( r === max ) {
			h = ( 60 * ( g - b ) / diff ) + 360;
		} else if ( g === max ) {
			h = ( 60 * ( b - r ) / diff ) + 120;
		} else {
			h = ( 60 * ( r - g ) / diff ) + 240;
		}

		if ( l === 0 || l === 1 ) {
			s = l;
		} else if ( l <= 0.5 ) {
			s = diff / add;
		} else {
			s = diff / ( 2 - add );
		}
		return [ Math.round(h) % 360, s, l, a == null ? 1 : a ];
	};

	spaces.hsla.from = function ( hsla ) {
		if ( hsla[ 0 ] == null || hsla[ 1 ] == null || hsla[ 2 ] == null ) {
			return [ null, null, null, hsla[ 3 ] ];
		}
		var h = hsla[ 0 ] / 360,
			s = hsla[ 1 ],
			l = hsla[ 2 ],
			a = hsla[ 3 ],
			q = l <= 0.5 ? l * ( 1 + s ) : l + s - l * s,
			p = 2 * l - q,
			r, g, b;

		return [
			Math.round( hue2rgb( p, q, h + ( 1 / 3 ) ) * 255 ),
			Math.round( hue2rgb( p, q, h ) * 255 ),
			Math.round( hue2rgb( p, q, h - ( 1 / 3 ) ) * 255 ),
			a
		];
	};

	each( spaces, function( spaceName, space ) {
		var props = space.props,
			cache = space.cache,
			to = space.to,
			from = space.from;

		// makes rgba() and hsla()
		color.fn[ spaceName ] = function( value ) {

			// generate a cache for this space if it doesn't exist
			if ( to && !this[ cache ] ) {
				this[ cache ] = to( this._rgba );
			}
			if ( value === undefined ) {
				return this[ cache ].slice();
			}

			var type = jQuery.type( value ),
				arr = ( type === "array" || type === "object" ) ? value : arguments,
				local = this[ cache ].slice(),
				ret;

			each( props, function( key, prop ) {
				var val = arr[ type === "object" ? key : prop.idx ];
				if ( val == null ) {
					val = local[ prop.idx ];
				}
				local[ prop.idx ] = clamp( val, prop );
			});

			if ( from ) {
				ret = color( from( local ) );
				ret[ cache ] = local;
				return ret;
			} else {
				return color( local );
			}
		};
		// makes red() green() blue() alpha() hue() saturation() lightness()
		each( props, function( key, prop ) {
			// alpha is included in more than one space
			if ( color.fn[ key ] ) {
				return;
			}
			color.fn[ key ] = function( value ) {
				var vtype = jQuery.type( value ),
					fn = ( key === 'alpha' ? ( this._hsla ? 'hsla' : 'rgba' ) : spaceName ),
					local = this[ fn ](),
					cur = local[ prop.idx ],
					match;

				if ( vtype === "undefined" ) {
					return cur;
				}

				if ( vtype === "function" ) {
					value = value.call( this, cur );
					vtype = jQuery.type( value );
				}
				if ( value == null && prop.empty ) {
					return this;
				}
				if ( vtype === "string" ) {
					match = rplusequals.exec( value );
					if ( match ) {
						value = cur + parseFloat( match[ 2 ] ) * ( match[ 1 ] === "+" ? 1 : -1 );
					}
				}
				local[ prop.idx ] = value;
				return this[ fn ]( local );
			};
		});
	});
	// add .fx.step functions
	each( stepHooks, function( i, hook ) {
		jQuery.cssHooks[ hook ] = {
			set: function( elem, value ) {
				var parsed;

				if ( jQuery.type( value ) !== 'string' || ( parsed = stringParse( value ) ) )
				{
					value = color( parsed || value );
					if ( !support.rgba && value._rgba[ 3 ] !== 1 ) {
						var backgroundColor,
							curElem = hook === "backgroundColor" ? elem.parentNode : elem;
						do {
							backgroundColor = jQuery.curCSS( curElem, "backgroundColor" );
						} while (
							( backgroundColor === "" || backgroundColor === "transparent" ) &&
							( curElem = curElem.parentNode ) &&
							curElem.style
						);

						value = value.blend( backgroundColor && backgroundColor !== "transparent" ?
							backgroundColor :
							"_default" );
					}

					value = value.toRgbaString();
				}
				elem.style[ hook ] = value;
			}
		};
		jQuery.fx.step[ hook ] = function( fx ) {
			if ( !fx.colorInit ) {
				fx.start = color( fx.elem, hook );
				fx.end = color( fx.end );
				fx.colorInit = true;
			}
			jQuery.cssHooks[ hook ].set( fx.elem, fx.start.transition( fx.end, fx.pos ) );
		};
	});
	// detect rgba support
	jQuery(function() {
		var div = document.createElement( "div" ),
			div_style = div.style;

		div_style.cssText = "background-color:rgba(1,1,1,.5)";
		support.rgba = div_style.backgroundColor.indexOf( "rgba" ) > -1;
	});
	// Some named colors to work with
	// From Interface by Stefan Petre
	// http://interface.eyecon.ro/
	colors = jQuery.Color.names = {
		aqua: "#00ffff",
		azure: "#f0ffff",
		beige: "#f5f5dc",
		black: "#000000",
		blue: "#0000ff",
		brown: "#a52a2a",
		cyan: "#00ffff",
		darkblue: "#00008b",
		darkcyan: "#008b8b",
		darkgrey: "#a9a9a9",
		darkgreen: "#006400",
		darkkhaki: "#bdb76b",
		darkmagenta: "#8b008b",
		darkolivegreen: "#556b2f",
		darkorange: "#ff8c00",
		darkorchid: "#9932cc",
		darkred: "#8b0000",
		darksalmon: "#e9967a",
		darkviolet: "#9400d3",
		fuchsia: "#ff00ff",
		gold: "#ffd700",
		green: "#008000",
		indigo: "#4b0082",
		khaki: "#f0e68c",
		lightblue: "#add8e6",
		lightcyan: "#e0ffff",
		lightgreen: "#90ee90",
		lightgrey: "#d3d3d3",
		lightpink: "#ffb6c1",
		lightyellow: "#ffffe0",
		lime: "#00ff00",
		magenta: "#ff00ff",
		maroon: "#800000",
		navy: "#000080",
		olive: "#808000",
		orange: "#ffa500",
		pink: "#ffc0cb",
		purple: "#800080",
		violet: "#800080",
		red: "#ff0000",
		silver: "#c0c0c0",
		white: "#ffffff",
		yellow: "#ffff00",
		transparent: [ null, null, null, 0 ],
		_default: "#ffffff"
	};
})( jQuery );


/* 
// List Ticker by Alex Fish 
// www.alexefish.com
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//
*/
(function($){
  $.fn.list_ticker = function(options){
    
    var defaults = {
      speed:4000,
	  effect:'slide',
	  run_once:false,
	  random:false
    };
    
    var options = $.extend(defaults, options);
    
    return this.each(function(){
      
      var obj = $(this);
      var list = obj.children();
      var count = list.length - 1;

      list.not(':first').hide();
      
      var interval = setInterval(function(){
        
        list = obj.children();
        list.not(':first').hide();
        
        var first_li = list.eq(0)
		var second_li = options.random ? list.eq(Math.floor(Math.random()*list.length)) : list.eq(1)
		
		if(first_li.get(0) === second_li.get(0) && options.random){
			second_li = list.eq(Math.floor(Math.random()*list.length));
		}
	
		if(options.effect == 'slide'){
			first_li.slideUp();
			second_li.slideDown(function(){
				first_li.remove().appendTo(obj);
				
			});
		} else if(options.effect == 'fade'){
			first_li.fadeOut(function(){
				obj.css('height',second_li.height());
				second_li.fadeIn();
				first_li.remove().appendTo(obj);
			});
		}
		
		count--;
		
		if(count == 0 && options.run_once){
			clearInterval(interval);
		}
		
      }, options.speed)
    });
  };
})(jQuery);


//pointer with circle animation
(function($){
	$.fn.pointer = function (options) {
		var settings = {
			size : 80,
			spd : 300,
			color : "#ccc"
		}
		settings = $.extend(settings, options);
		
		var circle_style = {
			"position":"absolute",
			"z-index":9999,
			"height":10,
			"width":10,
			"border":"solid 1px "+settings.color,
			"border-radius":settings.size
		}
		return this.each(function() {
			var $this = $(this);
			$this.css({"position":"relative"});
			$(document).click(function(e){
				var x = e.pageX-5;
				var y = e.pageY-5;
				
				var pos = {
					top :(-settings.size/2)+y,
					left :(-settings.size/2)+x
				}
		
				$this.append('<div class="circle"></div>');
				$this.find(".circle:last").css(circle_style).css({
					"top":y,
					"left":x
				}).animate({"height":settings.size,"width":settings.size,"left":pos.left,"top":pos.top},{duration:settings.spd,queue:false})
				.fadeOut(settings.spd*1.8,function(){
					$(this).remove();
				});
			});
		});
	}
})(jQuery); 


// leanModal v1.1 by Ray Stone - http://finelysliced.com.au
// Dual licensed under the MIT and GPL
(function($){$.fn.extend({leanModal:function(options){var defaults={top:100,overlay:0.5,closeButton:null};var overlay=$("<div id='lean_overlay'></div>");$("body").append(overlay);options=$.extend(defaults,options);return this.each(function(){var o=options;$(this).click(function(e){var modal_id=$(this).attr("href");$("#lean_overlay").click(function(){close_modal(modal_id)});$(o.closeButton).click(function(){close_modal(modal_id)});var modal_height=$(modal_id).outerHeight();var modal_width=$(modal_id).outerWidth();
$("#lean_overlay").css({"display":"block",opacity:0});$("#lean_overlay").fadeTo(200,o.overlay);$(modal_id).css({"display":"block","position":"fixed","opacity":0,"z-index":11000,"left":50+"%","margin-left":-(modal_width/2)+"px","top":o.top+"px"});$(modal_id).fadeTo(200,1);e.preventDefault()})});function close_modal(modal_id){$("#lean_overlay").fadeOut(200);$(modal_id).css({"display":"none"})}}})})(jQuery);

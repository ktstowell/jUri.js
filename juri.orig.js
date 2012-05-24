/* jUri v0.2
Mini-javascript library for handling url functions
jUri by Enric Florit is licensed under a Creative Commons Attribution-ShareAlike 3.0 Unported License.
You can read the license at http://creativecommons.org/licenses/by-sa/3.0/
Email me:
efz1005[at]gmail[dot]com */

/**********************/

var jUri = (function( window ){
    if (!window.console) {
        var log = window.opera ? window.opera.postError : alert;
        window.console = { log: function(str) { log(str) } };
        window.console.error = window.console.warn = window.console.debug = window.console.log;
    }

    var loc = window.location,
    host = loc.host,
    hostname = loc.hostname,
    href = loc.href,
    pathname = loc.pathname,
    port = loc.port,
    protocol = loc.protocol.replace(/:$/,''),
    get = (function(obj){

        var getStr = obj.replace(/^\?/,''),
        getVars = getStr.split('&'),
        json = {};
        
        for( var e in getVars ){
            var getParam = getVars[e].split('=');
            json[ getParam[0] ] = getParam[1];
        }

        return json;

    })(loc.search);

    window.jUriReady = function( callback ){
        if( !document.body || !window.jUri ){
            return setTimeout('window.jUriReady(' + callback+ ')', 1);
        }
        callback();
    };

    //Checking links with data-after attribute
    (function(){
        jUriReady(function(){
            var links = document.getElementsByTagName('a');

            for( var e = 0, l = links.length; e<l; e++ ){
                var link = links[e],
                after = link.getAttribute('data-after');

                if( after ){
                    jUri.fn.addEvent(link, 'click', function(e){
                        e.preventDefault();

                        var href = this.href,
                        after = this.getAttribute('data-after');
                        jUri.redirect(href, after);                        
                    });
                }
            }
        });
    })();

    //Checking elements with data-hash attribute
    //and data-name attribute
    (function(){
        jUriReady(function(){
            var all = document.getElementsByTagName('*');

            for( var e = 0, l = all.length; e<l; e++ ){
                var el = all[e],
                hash = el.getAttribute('data-hash'),
                name = el.getAttribute('data-name');

                if( hash || hash == '' ){
                    jUri.fn.addEvent(el, 'click', function(e){
                        var hash = this.getAttribute('data-hash');
                        jUri.hash(hash);
                    });
                }

                if( name && !jUri.anchorExists(name) ){
                    //console.log(name)
                    var anchor = document.createElement('a');
                    anchor.name = name;
                    el.parentNode.insertBefore(anchor, el);
                }
            }

            jUri.anchorsCreated = true;

        });
    })();

    jUriReady(function(){
        if( jUri.anchorExists( jUri.hash() ) ){
            var anchor = jUri.fn.getAnchor(jUri.hash()),
            top = 0;

            if( anchor && anchor.offsetParent ){
                do {
                    top += anchor.offsetTop;
                }while(anchor = anchor.offsetParent);
            }

            window.scrollTo(0,top);
        }
    });
        
    return {
        
        host: host,
        hostname: hostname,
        href: href,
        pathname: pathname,
        port: port,
        protocol: protocol,
        get: get,
        
        set: function( data, fallback, newState ){
            if( history.pushState ){

                if( !newState ) newState = true;

                if( typeof data == 'string' ){
                    history.pushState( {}, '', data);
                }else{
                    var object = data.data || {},
                    title = data.title || '',
                    url = data.url || '';

                    this.title(title);

                    if( newState ){
                        history.pushState( object, title, url);
                    }else{
                        history.replaceState( object, title, url);
                    }
                }

            }else if( fallback && typeof fallback == 'function' ){
                fallback();
            }
        },



        title: function( text ){
            try {
                document.getElementsByTagName('title')[0].innerHTML = text.replace('<','&lt;').replace('>','&gt;').replace(' & ',' &amp; ');
            }
            catch ( e ) {
                document.title = title;
            }
        },

        /* jUri.hash();// returns the current hash
        jUri.hash(/regexp/);// returns true/false
        jUri.hash(/regexp/, function(){// returns true/false, executes callback if true
        });
        jUri.hash('new hash');// changes the hash and returns the new value
        */
           
        hash: function( text, callback ){
            if( text && text instanceof( RegExp ) ){
                if( window.location.hash.replace(/^#/,'').match( text ) ){
                    callback ? callback() : false;
                    return true;
                }else{
                    return false;
                }
            }
            
            else if( text || text == '' ){
                window.location.hash = text;
                return text;
            }
            
            else{
                return window.location.hash.replace(/^#/,'');
            }
        },
        
        
        /* jUri.hashchange(function(e){
        //bind a function to the window.onhashchange event:
        alert('The previous hash was "'+e.oldHash+'" and now it\'s "'+e.newHash+'"');
        });
        */
        
        hashchange: function( callback ){
            if( !document.body ){
                return setTimeout('jUri.hashchange(' + callback +')', 1);
            }
            
            var scroll = 0;
            if( typeof window.pageYOffset == 'number' ) {
                //Netscape compliant
                scroll = window.pageYOffset;
            } else if( document.body.scrollTop ) {
                //DOM compliant
                scroll = document.body.scrollTop;
            } else if( document.documentElement.scrollTop ) {
                //IE6 standards compliant mode
                scroll = document.documentElement.scrollTop;
            }
            
            this.fn.checkhash( this.hash(), scroll, callback );
        },
        
        
        /* jUri.isHTTP();// returns true/false
        jUri.isHTTP(function(){// returns true/false, executes callback if true
        });
        */
        
        isHTTP: function( callback ){
            if( this.protocol.match(/^http$/) ){
                callback ? callback() : false;
                return true;
            }else{
                return false;
            }
        },
        
        
        /* jUri.isHTTPS();// returns true/false
        jUri.isHTTPS(function(){// returns true/false, executes callback if true
        });
        */
        
        isHTTPS: function( callback ){
            if( this.protocol.match(/^https$/) ){
                callback ? callback() : false;
                return true;
            }else{
                return false;
            }
        },


        parseAsGet: function( str ){
            var getVars = (str+'').replace(/^(.*?)\?/,'').split('&'),
            
            json = {};
            
            for( var e in getVars ){
                var getParam = getVars[e].split('=');
                json[ getParam[0] ] = getParam[1];
            }

            return json;
        },


        /* jUri.redirect('index.html');// goes to the required url
        jUri.redirect('index.html', 1000);// goes to the required time after 1000 ms
        */
        
        redirect: function( uri, timeout ){
            if( timeout && timeout % 1 === 0 ){
                setTimeout("window.location.href='" + uri + "'", timeout);
            }else{
                window.location.href = uri;
            }
        },


        /* jUri.reload();//reloads the page
        jUri.reload(1000);//reloads the page in 1000 ms
        */

        reload: function( timeout ){
            if( timeout && timeout % 1 === 0 ){
                setTimeout("window.location.reload(true);", timeout);
            }else{
                window.location.reload(true);
            }
        },
        
        
        /* jUri.isFile();// returns true/false if the current url is a file path
        jUri.isFile(function(){// executes callback if true, returns true/false
        });
        //NOTE: does not check if the file exists
        */
        
        isFile: function( callback ){
            if( this.pathname.match(/\.(html|htm|php|phtml|asp|shtml|cgi|jsp|pl)$/i) ){
                callback ? callback() : false;
                return true;
            }else{
                return false;
            }
        },
        
        
        /* jUri.anchorExists('name');// returns true/false if there is an <a> tag in the document
        // with this code: <a name="name"></a>
        */
        
        anchorExists: function( name, callback ){
            var anchor = this.fn.getAnchor( name );
            if( anchor ){
                callback ? callback(anchor) : false;
                return true;
            }
            
            return false;
        },

        anchorsCreated: false,
        
        
        animateAnchorLinks: function( anchors, changeHash ){
            if( !document.body || !jUri.anchorsCreated ){
                return setTimeout('jUri.animateAnchorLinks("' + anchors + '", ' + changeHash + ')',1);
            }

            if( typeof anchors == 'boolean' ){
                anchors = '*';
                changeHash = anchors;
            }

            if( typeof changeHash != 'boolean'){
                changeHash = true;
            }

            var a = [],
            linkList = [],
            links = document.getElementsByTagName('a');
            
            if( !anchors 
              || typeof anchors == 'undefined' 
              || anchors === 'undefined' 
              || anchors == '*' ){
                for( var e in links ){

                    if( links[e].name && links[e].name != '' ){
                        a.push(links[e].name);
                    }
                }
            }else{
                var splitted = anchors.replace(/\s/gim,'').split(','),
                anchor;
                
                for( var e in splitted ){
                    anchor = splitted[e];
                    a.push( this.fn.getAnchor( anchor ).name );
                }
            }
            
            //iterate the 'a' array and match all the links refering to each anchor
            for( var i in a ){
                for( var e in links ){
                    if( links[e].href && links[e].href != '' && links[e].href.match('#'+a[i]+'$') ){
                        linkList.push( links[e] );
                    }else if( links[e].href && links[e].href.match(/#$/) ){
                        //scroll to top links
                        linkList.push( links[e] );
                    }
                }
            }
            
            //Prevent repeated anchors 
            linkList = this.fn.removeDuplicated(linkList);

            //iterate the linkList and bind a click event to each link
            for( var i in linkList ){
                //console.log(linkList[i])
                jUri.fn.addEvent(linkList[i], 'click', function(e){
                    //Disable default scrolling
                    e.preventDefault();

                    var anchorName = this.href.split('#')[1];

                    jUri.fn.gotoAnchor( anchorName, function(){
                        if( changeHash == true ) jUri.hash(anchorName);
                    });
                    
                });
            }
        },

        encode: function(str){
            return encodeURIComponent(str);
        },

        fn: {
            /* jUri.fn.checkhash();
            USED BY jUri.hashchange() event
            */
            
            checkhash: function( str, prevScroll, callback ){
                if( jUri.hash() != str ){
                    callback( new hashChangeEvent( str, jUri.hash(), prevScroll ) );
                    
                    var prevScroll = 0;
                    if( typeof window.pageYOffset == 'number' ) {
                        //Netscape compliant
                        scroll = window.pageYOffset;
                    } else if( document.body.scrollTop ) {
                        //DOM compliant
                        scroll = document.body.scrollTop;
                    } else if( document.documentElement.scrollTop ) {
                        //IE6 standards compliant mode
                        scroll = document.documentElement.scrollTop;
                    }
                }
                setTimeout('jUri.fn.checkhash("' + jUri.hash() + '", ' + prevScroll + ', ' + callback + ')', 1);
            },
            
            
            /* jUri.fn.pagescroll();
            USED BY jUri.gotoanchor('name');
            not working always
            */
            
            pageScroll: function( to, callback ) {
                if( !document.body ){
                    return setTimeout('jUri.fn.pageScroll(' + to + ')',1);
                }

                jUri.fx.scroller.scrollTo( to, callback );
            },
            

            getAnchor: function( hash ) {
                if( !document.body ){
                    return setTimeout('jUri.fn.getAnchor(' + hash +')', 1);
                }

                if( !hash ){
                    return null;
                }
                
                if( hash.match(/^#/) ) hash = hash.replace(/^#/,'');
                
                var links = document.getElementsByTagName('a');
                
                for( var e in links ){
                    element = links[e];
                    if( element.name && element.name.replace(/^#/,'') === hash ){

                        return element;
                    }
                }
                
                return null;
            },
            
            
            gotoAnchor: function( name, callback ){
                var anchor = jUri.fn.getAnchor( name ),
                top = 0;

                if( anchor && anchor.offsetParent ){
                    do {
                        top += anchor.offsetTop;
                    }while(anchor = anchor.offsetParent);
                }

                jUri.fn.pageScroll( top, callback );
            },

            removeDuplicated: function (arrayName, filterBy){
                var newArray = new Array();
                if( typeof filterBy == 'undefined' ){
                    label:for(var i in arrayName ){
                        for(var j in newArray ){
                            if(newArray[j]==arrayName[i]) continue label;
                        }
                        newArray[newArray.length] = arrayName[i];
                    }
                }else{
                    label:for(var i in arrayName ){
                        for(var j in newArray ){
                            if(newArray[j][filterBy]==arrayName[i][filterBy]) continue label;
                        }
                        newArray[newArray.length] = arrayName[i];
                    }
                }
                return newArray;
            },

            addEvent: (function () {
              if (document.addEventListener) {
                return function (el, type, fn) {
                  if (el && el.nodeName || el === window) {
                    el.addEventListener(type, fn, false);
                  } else if (el && el.length) {
                    for (var i = 0; i < el.length; i++) {
                      jUri.fn.addEvent(el[i], type, fn);
                    }
                  }
                };
              } else {
                return function (el, type, fn) {
                  if (el && el.nodeName || el === window) {
                    el.attachEvent('on' + type, function () { return fn.call(el, window.event); });
                  } else if (el && el.length) {
                    for (var i = 0; i < el.length; i++) {
                      jUri.fn.addEvent(el[i], type, fn);
                    }
                  }
                };
              }
            })()
        },
        
        fx: {
            scroller: {
                stepIncrement: 20,
                stepDelay: 1,
                limit: 6000,
                running: false,
                nextStep: null,
                killTimeout: null,
                finalPoint: null,
                callback: null,
                scrollStep: function(to, dest, down) {
                    var stepIncrement = jUri.fx.scroller.stepIncrement,
                    running = jUri.fx.scroller.running;

                    if(!running || (down && to >= dest) || (!down && to <= dest)) {
                        jUri.fx.scroller.killScroll();
                        return;
                    }

                    if((down && to >= (dest - (2 * stepIncrement))) ||
                       (!down && to <= (dest - (2 * stepIncrement)))) {
                        stepIncrement = stepIncrement * .55;
                    }

                    window.scrollTo(0, to);
                    
                    // Assign the returned function to a public method.
                    
                    jUri.fx.scroller.nextStep = jUri.fx.scroller.callNext(+to + stepIncrement, dest, down);
                    jUri.fx.scroller.stepIncrement = stepIncrement;

                    window.setTimeout(jUri.fx.scroller.nextStep, jUri.fx.scroller.stepDelay);
                },
                callNext: function(to, dest, down) {
                    return function() { jUri.fx.scroller.scrollStep(to, dest, down); };
                },
                scrollTo: function( yCoord, callback ) {
                    //Prevent multiple scrolling
                    if(jUri.fx.scroller.running) return false;

                    jUri.fx.scroller.running = true;

                    jUri.fx.scroller.callback = callback;
                    jUri.fx.scroller.finalPoint = yCoord;
                    
                    var currentYPosition = (document.all) ? document.body.scrollTop : window.pageYOffset,
                    down = true,
                    stepIncrement = jUri.fx.scroller.stepIncrement;

                    if( currentYPosition == yCoord ){
                        jUri.fx.scroller.killScroll();
                    }

                    if(currentYPosition > yCoord) {
                        stepIncrement *= -1;
                        down = false;
                    }

                    // Stop the scroll once the time limit is reached.

                    jUri.fx.scroller.killTimeout = window.setTimeout(jUri.fx.scroller.killScroll, jUri.fx.scroller.limit);

                    jUri.fx.scroller.stepIncrement = stepIncrement;
                    jUri.fx.scroller.scrollStep(currentYPosition + stepIncrement, yCoord, down);
                },
                killScroll: function(){
                    window.clearTimeout(jUri.fx.scroller.killTimeout);
                    jUri.fx.scroller.running = false;
                    jUri.fx.scroller.stepIncrement = 20;

                    window.scrollTo(0,jUri.fx.scroller.finalPoint);
                    jUri.fx.scroller.finalPoint = null;

                    typeof jUri.fx.scroller.callback == 'function' ?
                        jUri.fx.scroller.callback() : false;
                    jUri.fx.scroller.callback = null;
                }
            },

            //this one is just an idea:
            
            /*urlanimator:{
                initstring:'',
                newstring:'',
                to:'right',
                prevState:window.location.href,
                init: function(newstring, initstring, to){
                    if(initstring)
                        jUri.fx.urlanimator.initstring = initstring;
                    if(to)
                        jUri.fx.urlanimator.to = to;

                    jUri.set(jUri.href);

                    jUri.fx.urlanimator.newstring = newstring.split('');
                    jUri.fx.urlanimator.callnext();
                },
                callnext: function(){
                    var newstring = jUri.fx.urlanimator.newstring,
                    url = jUri.fx.urlanimator.prevState,
                    newurl = url+newstring[0];

                    jUri.fx.urlanimator.newstring = newstring.slice(1);
                    jUri.fx.urlanimator.prevState = newurl;
                    jUri.set(newurl);

                    if(jUri.fx.urlanimator.newstring.length)
                        setTimeout(jUri.fx.urlanimator.callnext,10);
                }
            }*/
        },

        log: function(str){
            console.log(str);
        },

        debug: function(str){
            console.debug(str);
        },

        warn: function(str){
            console.warn(str);
        },

        error: function(str){
            console.error(str);
        }
    
    }

})(window),

hashChangeEvent = function( prevHash, newHash ){
    this.oldHash = prevHash || "#";
    this.newHash = newHash || "#";
    this.newLoc = window.location;
};

window.jUri = jUri;
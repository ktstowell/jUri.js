/*  jUri v0.4.3
    Mini-javascript library for handling url functions
    jUri by Enric Florit is licensed under a Creative Commons Attribution-ShareAlike 3.0 Unported License.
    You can read the license at http://creativecommons.org/licenses/by-sa/3.0/

    Download the last version at:
    http://github.com/3nr1c/jUri.js/downloads

    Email me:
    efz1005[at]gmail[dot]com */

var jUri = (function( window ){
    if (!window.console) {
        var log = window.opera ? window.opera.postError : alert;
        window.console = { log: function(str) { log(str) } };
        window.console.error = window.console.warn = window.console.debug = window.console.log;
    }

    var nav = window.navigator,
    appCodeName = nav.appCodeName,
    appName = nav.appName,
    appVersion = nav.appVersion,
    language = nav.language,
    mimeTypes = nav.mimeTypes,
    platform = nav.platform,
    plugins = nav.plugins,
    userAgent = nav.userAgent;

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
        
        host: function(){
            return window.location.host;
        },
        hostname: function(){
            return window.location.hostname;
        },
        href: function(){
            return window.location.href;
        },
        pathname: function(){
            return window.location.pathname;
        },
        port: function(){
            return window.location.port;
        },
        protocol: function(){
            return window.location.protocol.replace(/:$/,'');
        },
        get: function( str ){

            var getVars, e, json = {};

            if( str && str !== '' ){
                getVars = (str+'').replace(/^(.*?)\?/,'').split('&');
                
                for( e in getVars ){
                    var getParam = getVars[e].split('=');
                    json[ getParam[0] ] = getParam[1];
                }
            } else {
                var obj = window.location.search,
                getStr = obj.replace(/^\?/,''),
                getVars = getStr.split('&');

                for( e in getVars ){
                    var getParam = getVars[e].split('=');
                    json[ getParam[0] ] = getParam[1];
                }
            }

            return json;
        },
        
        navigator: navigator,
        appCodeName: appCodeName,
        appName: appName,
        appVersion: appVersion,
        language: language,
        mimeTypes: mimeTypes,
        platform: platform,
        plugins: plugins,
        userAgent: userAgent,

        set: function( data, fallback, newState, a ){

            var forceUrlChangeEvent, url, title, object;

            if( typeof fallback == 'boolean' ){
                forceUrlChangeEvent = fallback;
            }else{

                if( typeof fallback == 'function' && typeof newState == 'boolean' ){
                    forceUrlChangeEvent = newState;
                    newState = a;
                }

                forceUrlChangeEvent = false;
            }

            if( history.pushState ){

                if( !newState ) newState = true;

                if( typeof data == 'string' ){
                    url = data;
                    title = '';
                    object = {};
                }else{
                    object = data.data || {};
                    title = data.title || '';
                    url = data.url || '';
                }

                try {
                    if( history.current == url ){
                        return false;
                    }
                }catch(e){}
                

                if( title != '' ){
                    this.title(title);
                }


                if( newState ){
                    history.pushState( object, title, url);
                }else{
                    history.replaceState( object, title, url);
                }
                
                if( !forceUrlChangeEvent ){
                    jUri.fn.jUriSet = true;
                }

            }else if( fallback && typeof fallback == 'function' ){
                fallback();
            }
        },


        back: function( int, fallback ){
            try {
                window.history.back(int);
            }catch(e){
                if( fallback ) fallback();
            }
        },

        forward: function( int, fallback ){
            try {
                window.history.forward(int);
            }catch(e){
                if( fallback ) fallback();
            }
        },


        title: function( text, ms ){
            if(typeof text == 'string' ){
                //Normal use
                try {
                    document.getElementsByTagName('title')[0].innerHTML = text.replace('<','&lt;').replace('>','&gt;').replace(' & ',' &amp; ');
                }
                catch ( e ) {
                    document.title = text;
                }
            }

            else if( typeof text == 'object' ){
                //Periodic title changing
                if( !ms ) ms = 1500;

                jUri.fx.changeTitle.init( text, ms );

            }

            return {
                stop: function( str ){
                    jUri.fx.changeTitle.stop();
                    if( str != '' ){
                        jUri.title( str );
                    }
                }
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


        /* jUri.urlchange(function(e){
        //bind a function to the window.onhashchange event:
        alert('The previous url was "'+e.oldUrl+'" and now it\'s "'+e.newUrl+'"');
        }, bool);
        */
        
        urlchange: function( callback, fireOnHashChange, fireOnJUriSet ){
            if( !document.body ){
                return setTimeout('jUri.urlchange(' + callback +',' + fireOnHashChange + ',' + fireOnJUriSet + ')', 1);
            }
            
            this.fn.checkurl( this.href(), callback, fireOnHashChange, fireOnJUriSet );
        },
        
        
        /* jUri.isHTTP();// returns true/false
        jUri.isHTTP(function(){// returns true/false, executes callback if true
        });
        */
        
        isHTTP: function( callback ){
            if( this.protocol().match(/^http$/) ){
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
            if( this.protocol().match(/^https$/) ){
                callback ? callback() : false;
                return true;
            }else{
                return false;
            }
        },


        //.parseAsGet() is deprecated, use .get() instead

        parseAsGet: function( str ){
            var getVars = (str+'').replace(/^(.*?)\?/,'').split('&'),
            
            json = {};
            
            for( var e in getVars ){
                var getParam = getVars[e].split('=');
                json[ getParam[0] ] = getParam[1];
            }

            window.console.warn('jUri.parseAsGet(str) is deprecated, use jUri.get(str) instead')

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
            if( this.pathname().match(/\.(html|htm|php|phtml|asp|shtml|cgi|jsp|pl)$/i) ){
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
                return setTimeout('jUri.animateAnchorLinks("' + anchors + '",' + changeHash + ')',1);
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

        bindToUrl: function( selectors ){
            var elements = jUri.fn.select( selectors ), el, html;

            for( var e=0,l=elements.length;e<l;e++ ){
                el = elements[e];
                //Check if we haven't bound the element to the url changes
                if( el && !el.bound ){
                    //Save the first copy
                    html = el.innerHTML;

                    el.urlCopies = [{
                        url: jUri.href(),
                        html: html
                    }];
                    

                    el.bound = true;

                    el.selector = jUri.fn.getSelector( el );

                    var elLength = jUri.fn.boundElements.length;

                    jUri.fn.boundElements[elLength] = el;
                }
            }

            if( elements.length ){
                //Bind the urlchange events

                //Get old copy
                jUri.urlchange(function(ev){
                    for( var o in jUri.fn.boundElements ){
                        var el = jUri.fn.boundElements[o],
                        copies = el.urlCopies,
                        selector = el.selector,
                        realElement = jUri.fn.select(selector)[0];

                        //Check if there is a copy of this url
                        for( var i=0,l=copies.length;i<l;i++ ){
                            if( copies[i].url == ev.newUrl ){
                                if( typeof copies[i].html == 'string' ){
                                    realElement.innerHTML = copies[i].html;
                                }else if( typeof copies[i].AJAXurl == 'string' ){
                                    jUri.ajax({
                                        url: copies[i].AJAXurl,
                                        target: selector
                                    });
                                }
                                break;
                            }
                        }
                    }
                });

                //Save copy
                jUri.urlchange(function(ev){
                    for( var o in jUri.fn.boundElements ){
                        var el = jUri.fn.boundElements[o],
                        saved = false,
                        copies = el.urlCopies, length,
                        selector = el.selector,
                        realElement = jUri.fn.select(selector)[0],
                        html = realElement.innerHTML;

                        //Check if there is a copy of this url
                        for( var i=0,l=copies.length;i<l;i++ ){
                            if( copies[i].url == ev.newUrl ){
                                saved = true;
                                break;
                            }
                        }

                        //Save a new copy
                        if( !saved ){
                            length = copies.length;
                            el.urlCopies[length] = {
                                url: ev.newUrl,
                                html: html
                            };
                        }
                    }
                },false,true);
            }

            return;
        },


        ajax: function( data ){

            if( typeof data == 'object' ){
                if( data.url ){
                    url = data.url;
                }else{
                    return false;
                }

                if( data.method ){
                    method = data.method;
                }else{
                    method = 'GET';
                }

                if( data.async ){
                    async = data.async;
                }else{
                    async = true;
                }

                if( data.callback && typeof data.callback == 'function' ){
                    callback = data.callback;
                }else{
                    callback = new Function();
                }

                if( data.form && typeof data.form == 'string' ){
                    form = jUri.fn.select(data.form)[0];
                } else if( data.form && typeof data.form == 'object'){
                    form = data.form;
                }else{
                    form = false;
                }

            } else if( typeof data == 'string' ){
                url = data;
                method = 'GET';
                async = true;
            }else{
                return false;
            }

            //Create the xmlhttpRequest object
            var xmlhttp;
            if(window.XMLHttpRequest) {
                xmlhttp = new XMLHttpRequest();//Firefox, Safari, Opera, Chrome...
            }else if(window.ActiveXObject) {//Internet Explorer
                try{
                    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
                } catch(e) {
                    xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
                }
            }

            if( form ){
                xmlhttp.open('POST',url,async);
            }else{
                xmlhttp.open(method,url,async);
            }

            if( typeof data == 'string' ) return xmlhttp;

            xmlhttp.onreadystatechange = function(){
                if ( xmlhttp.readyState == 4 && xmlhttp.status == 200 ){
                    
                    if( data.target ){
                        var targets = jUri.fn.select(data.target),
                        response = xmlhttp.responseText,
                        //Targets length
                        tl = targets.length;

                        if( data.bindToUrl ){
                            jUri.bindToUrl( data.target );
                        }

                        for( var i=0;i<tl;i++ ){
                            targets[i].innerHTML = response;
                        }
                    }

                    if( data.setUrl ){
                        /*
                        Only force a HashChange event when the 
                        element.innerHTML is longer than 1024 chars
                        (v0.4.1)

                        If found an <script> tag in the innerHTML,
                        save am AJAXurl
                        (v0.4.3)
                        */

                        var forceEvent = foundScript = false;

                        for( var i=0;i<tl;i++ ){

                            //If an script tag is found, save the AJAXurl
                            //to execute it when getting back to the current url
                            foundScript = (function(html){
                                return /<script[^>]*>(.|\n|\t)*?<\/script>/gim
                                    .test(html);
                            })( targets[i].innerHTML );

                            if( targets[i].innerHTML.length > 1024 && !foundScript ){
                                forceEvent = true;
                                break;
                            }
                        }
                        if( data.bindToUrl && data.target && forceEvent ){
                            //Force the HashChange event
                            jUri.set( data.setUrl, true);
                        }else{
                            jUri.set( data.setUrl );
                        }
                    }

                    //If the innerHTML exceeds 1024 chars, save the AJAXurl instead
                    if( data.target && forceEvent ){

                        var boundElementsLength = jUri.fn.boundElements.length;

                        for( var i=0;i<tl;i++ ){
                            var el = jUri.fn.boundElements[boundElementsLength-(tl-i)],
                            has_copy = false, copies;

                            if( !el.urlCopies ) el.urlCopies = [];

                            copies = el.urlCopies;

                            //Check if there is a copy of this url
                            for( var e=0,l=el.urlCopies.length;e<l;e++ ){
                                if( copies[e].AJAXurl && copies[e].AJAXurl == url ){
                                    has_copy = true;
                                    break;
                                }
                            }

                            if( has_copy == true ) continue;

                            el.urlCopies.push({
                                url: jUri.href(),
                                AJAXurl: url
                            });

                            jUri.fn.boundElements[boundElementsLength-(tl-i)] = el;
                        }
                    }

                    /*
                    Parsing JSON and plaintext/html
                    */

                    if( data.response ){
                        response = data.response.toLowerCase();
                    }else{
                        response = 'html';
                    }

                    if( response == 'json' ){
                        try {
                            responseText = eval('('+xmlhttp.responseText+')');
                        }catch(e){
                            responseText = {};
                        }                        
                    }else{
                        responseText = xmlhttp.responseText;
                    }

                    callback(responseText);
                }
            };

            if( form ){

                var formdata, 
                uA = jUri.userAgent.toLowerCase(),
                isChrome = /\bchrome\b/i.test(uA),
                isSafari = !isChrome && /safari/.test(uA);

                //Native implementation using FormData() object
                //Not working in Safari 5... better use the non-native implementation
                if( window.FormData && !isSafari){
                    formdata = new FormData(form);
                }
                //Non-native implementation parsing the form children
                //We must pass as data an encoded string
                else{
                    //Set the content-type headers
                    xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

                    var children, i, l, child,
                    formdata = '';

                    children = form.childNodes;

                    for( i=0,l=children.length;i<l;i++ ){
                        //To prevent no-html nodes
                        if( typeof children[i] != 'object' ||
                        (children[i].tagName == null && children[i].localName == null) ){
                            continue;
                        }

                        child = children[i];
                        if( child.getAttribute('name') ){
                            var name = child.getAttribute('name'),
                            value = child.value;

                            if( formdata != '' ) formdata += '&'

                            formdata += name+'='+jUri.encode(value);
                        }
                    }
                }
                
                xmlhttp.send(formdata);
            }else{
                xmlhttp.send(null);
            }

            return xmlhttp;
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
                setTimeout('jUri.fn.checkhash("' + jUri.hash() + '",' + prevScroll + ',' + callback + ')', 1);
            },

            jUriSet: false,

            /* jUri.fn.checkurl();
            USED BY jUri.urlchange() event
            */
            
            checkurl: function( str, callback, fireOnHashChange, fireOnJUriSet ){
                if( jUri.href() != str ){

                    if( !fireOnJUriSet ){
                        if( jUri.fn.jUriSet ){
                            jUri.fn.jUriSet = false;
                            return setTimeout('jUri.fn.checkurl("' + jUri.href() + '",' + callback + ',' + fireOnHashChange +',' + fireOnJUriSet + ')', 1);
                        }
                    }else{
                        jUri.fn.jUriSet = false;
                    }

                    if( !fireOnHashChange ){
                        if( jUri.href().split('#')[0] == str.split('#')[0] ){
                            return setTimeout('jUri.fn.checkurl("' + jUri.href() + '",' + callback + ',' + fireOnHashChange +',' + fireOnJUriSet + ')', 1);
                        }
                    }

                    callback( new urlChangeEvent( str, jUri.href() ) );
                }
                setTimeout('jUri.fn.checkurl("' + jUri.href() + '",' + callback + ',' + fireOnHashChange +',' + fireOnJUriSet + ')', 1);
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
            })(),

            select: function( selectors ){
                if( document.querySelectorAll ){
                    try {
                        var elements = document.querySelectorAll( selectors );

                        return elements;
                    } catch(e) {
                        return [];
                    }
                }else{

                    var separated = selectors.split(','),selector,
                    elements = [];

                    for( var i=0,l=separated.length;i<l;i++ ){
                        //Trim the selector
                        selector = separated[i].replace(/^\s*/,'').replace(/\s*$/,'');

                        //No childs
                        if( !/^[^\s]\s+[^\s]$/.test( selector ) 
                         && !/^[^\s]\s*>\s*[^\s]$/.test( selector ) ){

                            var attrCondition = (selector.split('[')[1] || '').split(']')[0] || '',
                            pseudoClass = selector.split(':')[1] || '',
                            css2selector = (selector.split('[')[0] || '*').split(':')[0] || '*';

                            //Only tag and all elements
                            if( /^[a-zA-Z]*$/.test( css2selector ) || /^\*$/.test( css2selector ) ){
                                var bytag = document.getElementsByTagName( css2selector ),
                                pushToElements = false;

                                for( var e=0,tl=bytag.length;e<tl;e++ ){
                                    var el = bytag[e];

                                    if( /^[^="']+$/.test( attrCondition ) ){
                                        if( el.getAttribute( attrCondition ) ){
                                            pushToElements = true;
                                        }
                                    } else if( /^[^="']+=['"][^="']*['"]$/.test( attrCondition ) ){
                                        if( el.getAttribute( attrCondition.split('=')[0] ) == 
                                           attrCondition.split('=')[1]){
                                            pushToElements = true;
                                        }
                                    }

                                     else {
                                        pushToElements = true;
                                    }

                                    if( pushToElements ) elements.push( bytag[e] );
                                }
                                continue;
                            }

                            //Id with/without tagname
                            if( /^[a-zA-Z]*#[a-zA-Z0-9_-]+$/.test( css2selector ) ){
                                var parts = css2selector.split('#'),
                                tagname = parts[0],
                                id = tagname[1],
                                elById = document.getElementsById( id ),
                                tagname, el;

                                for( var e=0,length=elById.length;e<length;e++ ){
                                    el = elById[e];
                                    elTag = el.localName || el.tagName.toLowerCase();

                                    if( tagname != '' ){
                                        if( elTag == tagname ){
                                            elements.push( el );
                                        }
                                    } else {
                                        elements.push( el );
                                    }
                                }
                            }

                        }
                    }

                }
            },

            css3Selectors: (function(document){
                try{
                    document.querySelectorAll('html:nth-child(1)');
                    return true
                }catch(e){
                    return false;
                }
            })(window.document),

            getSelector: function( element ){
                var tagname = element.localName || element.tagName.toLowerCase(),
                id = element.getAttribute('id'),
                elementParent = element.parentNode,

                checkChildhood = function( element, selector ){
                    var others,last, 
                    tagname = element.localName|| element.tagName.toLowerCase(),
                    e=0, sufix,
                    others = jUri.fn.select(selector),
                    last = others.length-1;

                    if( others.length == 1 ){
                        return selector;
                    }

                    for( var i=0,l=others.length;i<l;i++ ){
                        if( (element == others[i] && '\v'!='v') || //Modern browsers
                            ('\v'=='v' && element.innerHTML == others[i].innerHTML) ){//IE

                            if( i == 0 ){
                                selector += ':first-of-type';
                            } else if( i == last ){
                                selector += ':last-of-type';
                            } else if( jUri.fn.css3Selectors === true ){//Modern browsers
                                selector += ':nth-of-type('+(i+1)+')';
                            } else {//IE 7,8
                                var add = '';
                                while( e < i ){
                                    add += ' + '+tagname;
                                    e++
                                }
                                selector += add;
                            }
                            //No support for IE 6
                            break;
                        }
                    }

                    if( jUri.fn.select( selector ).length == 1 || '\v'=='v'){ 
                        return selector;
                    }
                },//end of checkChildhood()

                //Set the init selector, checking the childhood of the parent
                selector = tagname;

                //Check the tag
                if( jUri.fn.select( selector ).length == 1 ){
                    return selector;
                }

                var others,last;

                //Check the id
                if( typeof id == 'string' && id != '' ){
                    var others = jUri.fn.select( id ),
                    last = others.length-1;

                    selector += '#'+id;

                    if( jUri.fn.select( selector ).length == 1 ){
                        return selector;
                    }
                }

                return checkChildhood(element,selector);
            },

            boundElements: []
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

            changeTitle: {
                active: false,
                obj: [],
                current: 0,
                timeNext: 1500,
                timeOut: null,
                init: function( obj, ms ){
                    if( jUri.fx.changeTitle.active ) return false;
                    jUri.fx.changeTitle.active = true;

                    jUri.fx.changeTitle.obj = obj;
                    jUri.fx.changeTitle.timeNext = ms;

                    jUri.fx.changeTitle.callNext();
                },
                callNext: function(){
                    var n = jUri.fx.changeTitle.current,
                    obj = jUri.fx.changeTitle.obj,
                    time = jUri.fx.changeTitle.timeNext;

                    if( obj[n] ){
                        jUri.title(obj[n]);
                        jUri.fx.changeTitle.current = n+1;
                    }else{
                        jUri.title(obj[0]);
                        jUri.fx.changeTitle.current = 0;
                    }
                    jUri.fx.changeTitle.timeOut = setTimeout(jUri.fx.changeTitle.callNext,time);
                },
                stop: function(){
                    jUri.fx.changeTitle.active = false;
                    jUri.fx.changeTitle.obj = false;
                    jUri.fx.changeTitle.current = false;
                    jUri.fx.changeTitle.timeNext = 1500;
                    window.clearTimeout(jUri.fx.changeTitle.timeOut);
                }
            },

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
        },

        short: function(varname){
            window[varname] = jUri;
        }
    
    }

})(window),

hashChangeEvent = function( prevHash, newHash ){
    this.oldHash = prevHash || "#";
    this.newHash = newHash || "#";
    this.oldUrl = history.previous || "";
    this.newUrl = jUri.href() || "";
    this.newLoc = window.location;
};

urlChangeEvent = function( prevUrl, newUrl ){
    this.oldUrl = prevUrl || "#";
    this.newUrl = newUrl || "#";
    this.newLoc = window.location;
};

window.jUri = jUri;
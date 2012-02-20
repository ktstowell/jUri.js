/*  jUri v0.1
    Mini-javascript library for handling url functions
    jUri by Enric Florit is licensed under a Creative Commons Attribution-ShareAlike 3.0 Unported License.
    You can read the license at http://creativecommons.org/licenses/by-sa/3.0/
    
    Email me:
    efz1005[at]gmail[dot]com */

/**********************/

var jUri = function(){
    
    this.setScroll = function(){
        if( !document.body ){
            return setTimeout('jUri.setScroll()',1);
        }
        
        var scroll = 0,
        D = document
        if( typeof window.pageYOffset == 'number' ) {
            //Netscape compliant
            var scroll = window.pageYOffset;
        } else if( D.body.scrollTop ) {
            //DOM compliant
            var scroll = D.body.scrollTop;
        } else if( D.documentElement.scrollTop ) {
            //IE6 standards compliant mode
            var scroll = D.documentElement.scrollTop;
        }
       
        jUri.prevScroll = jUri.scroll || 0;
        jUri.scroll = scroll;
        window.onscroll = function(){ jUri.setScroll() };
    };

    this.setScroll();

    if (!window.console) {
        var log = window.opera ? window.opera.postError : alert;
        window.console = { log: function(str) { log(str) } };
    }
},

hashChangeEvent = function( prevHash, newHash ){
    this.old = prevHash || "#";
    this.new = newHash || "#";
    this.newLoc = window.location;
};

jUri.prototype = {
    host: window.location.host,
    hostname: window.location.hostname,
    href: window.location.href,
    pathname: window.location.pathname,
    port: window.location.port,
    protocol: window.location.protocol.replace(/:$/,''),
    get: window.location.search,
    
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
        
        pageScroll: function( to ) {
            if( !document.body ){
                return setTimeout('jUri.fn.pageScroll(' + to + ')',1);
            }
            jUri.fx.scroller.scrollTo( to );
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
                if( element.name.replace(/^#/,'') === hash ){
                    return element;
                }
            }
            
            return null;
        },
        
        
        gotoAnchor: function( name ){
            var anchor = jUri.fn.getAnchor( name ),
            top = 0;
            
            if( anchor && anchor.offsetParent ){
                do {
                    top += anchor.offsetTop;
                }while(anchor = anchor.offsetParent);
            }
            jUri.fn.pageScroll( top );
        }
    },
    
    fx: {
        scroller: {
            stepIncrement: 25,
            stepDelay: 5,
            limit: 6000,
            running: false,
            nextStep: null,
            killTimeout: null,
            finalPoint: null,
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
            scrollTo: function( yCoord ) {
                jUri.fx.scroller.running = true;
                jUri.fx.scroller.finalPoint = yCoord;
                
                var currentYPosition = (document.all) ? document.body.scrollTop : window.pageYOffset,
                down = true,
                stepIncrement = jUri.fx.scroller.stepIncrement;

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
                jUri.fx.scroller.stepIncrement = 50;
                window.scrollTo(0,jUri.fx.scroller.finalPoint);
                jUri.fx.scroller.finalPoint = null;
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
        
        else if( text ){
            window.location.hash = text;
            return text;
        }
        
        else{
            return window.location.hash.replace(/^#/,'');
        }
    },
    
    
    /* jUri.hashchange(function(e){
           //bind a function to the window.onhashchange event:
           alert('The previous hash was "'+e.old+'" and now it\'s "'+e.new+'"');
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
        
        jUri.fn.checkhash( jUri.hash(), scroll, callback );
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
    
    
    /* jUri.vars();// returns a map with all vars passed by get
       jUri.vars('key');// returns the value of the required key, 
                              if none, returns the entire map
    */
    
    vars: function( index ){
        var getStr = this.get.replace(/^\?/,''),
        getVars = getStr.split('&'),
        
        json = {};
        
        for( var e in getVars ){
            var getParam = getVars[e].split('=');
            json[ getParam[0] ] = getParam[1];
        }
        
        if( index && json[ index ] ) return json[ index ];

        return json;
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


    /*  jUri.reload();//reloads the page
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
    
    anchorExists: function( hash ){
        var anchor = this.fn.getAnchor( hash );
        if( anchor ){
           return true;
        }
        
        return false;
    },
    
    
    animateAnchorLinks: function( anchors ){
        if( !document.body ){
            return setTimeout('jUri.animateAnchorLinks("' + anchors + '")',1);
        }

        var a = [],
        linkList = [],
        links = document.getElementsByTagName('a');
        
        if( !anchors || typeof anchors == 'undefined' || anchors === 'undefined' ){
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
                a.push( jUri.fn.getAnchor( anchor ).name );
            }
        }
        
        //iterate the 'a' array and match all the links refering to each anchor
        for( var i in a ){
            for( var e in links ){
                if( links[e].href && links[e].href != '' && links[e].href.match('#'+a[i]+'$') ){
                    linkList.push( links[e] );
                }
            }
        }
        
        //iterate the linkList and bind a click event to each link
        for( var i in linkList ){
            linkList[i].onclick = function(e){
                //Disable default scrolling
                e.preventDefault();
                
                var anchorName = this.href.split('#')[1];
                jUri.fn.gotoAnchor( anchorName );
                
            }
        }
    },

    encode: function(str){
        return encodeURIComponent(str);
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
    
};

window.jUri = new jUri();
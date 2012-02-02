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
        
        var scroll = 0;
        if( typeof window.pageYOffset == 'number' ) {
            //Netscape compliant
            var scroll = window.pageYOffset;
        } else if( document.body.scrollTop ) {
            //DOM compliant
            var scroll = document.body.scrollTop;
        } else if( document.documentElement.scrollTop ) {
            //IE6 standards compliant mode
            var scroll = document.documentElement.scrollTop;
        }
       
        jUri.prevScroll = jUri.scroll || 0;
        jUri.scroll = scroll;
        window.onscroll = function(){ jUri.setScroll() };
    };

    this.setScroll();
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
        
        pageScroll: function( to, callback ) {
            if( !document.body ){
                return setTimeout('jUri.fn.pageScroll(' + to + ', ' + callback + ')',1);
            }

            var pxLeft = Math.round( (jUri.prevScroll-to) *10)/10;
            
            var pxEvTime = Math.round(pxLeft/25);
            
            if( Math.round(pxEvTime) === 0 ) pxEvTime = 1;
            
            //alert(pxEvTime)
            if( !( (pxLeft < 0 && pxLeft > -5) || (pxLeft > 0 && pxLeft < 5) ) ){
                //alert(pxLeft);
                //alert(pxEvTime);
                if( pxEvTime < 0 ){
	                window.scrollBy(0,-(pxEvTime));
                }else{
                    window.scrollBy(0,pxEvTime);
                }
	
	            scroll = setTimeout('jUri.fn.pageScroll(' + to + ', ' + callback + ')',1);
	            jUri.setScroll();
            }else{
                clearTimeout(scroll)
                callback ? callback() : false;
                jUri.setScroll();
            }
        },
        

        getAnchor: function( hash ) {
            if( !document.body ){
                return setTimeout('jUri.fn.pageScroll(' + to +')', 1);
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
        
        return false
    },
    
    
    animateToAnchorLinks: function( anchors ){
    
    }
};

window.jUri = new jUri();

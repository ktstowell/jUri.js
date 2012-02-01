/*  jUri v0.1
    Mini-javascript library for handling url functions
    jUri by Enric Florit is licensed under a Creative Commons Attribution-ShareAlike 3.0 Unported License.
    You can read the license at http://creativecommons.org/licenses/by-sa/3.0/
    
    Email me:
    efz1005[at]gmail[dot]com */

/**********************/

var jUri = new Function(),

hashChangeEvent = function( prevHash, newHash ){
    this.old = prevHash;
    this.new = newHash;
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
        checkhash: function( str, callback ){
            if( jUri.hash() != str ){
                callback( new hashChangeEvent( str, jUri.hash() ) );
            }
            setTimeout('jUri.fn.checkhash("' + jUri.hash() + '", ' + callback + ')', 1);
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
        jUri.fn.checkhash( jUri.hash(), callback );
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
        if( timeout ){
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
        if( this.pathname.match(/\.(html|htm|php|phtml|asp|shtml|cgi|jsp|pl)/i) ){
            callback ? callback() : false;
            return true;
        }else{
            return false;
        }
    }
};

window.jUri = new jUri();

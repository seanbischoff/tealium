if (typeof window.regWallInit === 'undefined') {
    window.regWallInit = true;
    window.tealiumUtils = window.tealiumUtils || {};
    window.tealiumUtils.regWall = window.tealiumUtils.regWall || {};

    window.tealiumUtils.regWall = {
        signIn: {},
        signUp: {},
        methodMeansLocation: function(method){
            const isApp = (navigator && navigator.userAgent && navigator.userAgent.indexOf('WinecomApp/') >= 0);
            const nativeauthlocation = b['qp.nativeauthlocation'];//values are either 'regwall' or 'browsing'
            const pageName = b['meta.pageName'];
            let location = (pageName.indexOf('Shopping Cart') !== -1) ? 'Cart' : 'Storefront';
            
            if(isApp && location !== 'Cart') {
                if(typeof nativeauthlocation !== 'undefined' && nativeauthlocation.length > "") {
                    location = nativeauthlocation;
                } else {
                    location =  'nativeauthlocationvoid';
                }
            }
            return method + ':' + window.tealiumUtils.regWall.means + ':' + location;
        },
        getCustomerId: function (data = {})  {
            const pageName = b['meta.pageName'];
            let customerId = 0;//default value when user is not signed in
            
            if(b['meta.legacyCustomerId'] > 0){
                customerId = b['meta.legacyCustomerId'];
            }
            if(data.customerId) {
                customerId = data.customerId;
            }
            return customerId;
        }
    }

    // On Page Load
    // Our 3rd party middleware controllers create the regwallMeans values. Currently both get either 'create' & 'login', 
    //   but keep 'signin' just in case something else is (re)defining these cookies - 3/17
    const cookieMeansCreate = ['create'];
    const cookieMeansSignIn = ['signin','login'];
    
    const isFacebookCreate = cookieMeansCreate.find(element => element === b['cp.fbLoginType']);
    const isAppleCreate = cookieMeansCreate.find(element => element === b['cp.appleSignType']);

    const isFacebookSignIn = cookieMeansSignIn.find(element => element === b['cp.fbLoginType']);
    const isAppleSignIn = cookieMeansSignIn.find(element => element === b['cp.appleSignType']); 

    const isNativeMethodRegister = b['dom.url'].indexOf('nativeauthmethod=register') !== -1;
    const isNativeMethodSignin = b['dom.url'].indexOf('nativeauthmethod=signin') !== -1;//iOS does not hear event; Android v1 does not get this param
    
    const isAndroid = navigator && navigator.userAgent && navigator.userAgent.indexOf('Android') >= 0;//Android hears event
    // TODO once User Agent contains 'Android' we can differentiate and simplify the logic
    // TODO Android app v2 will have isNativeMethodSignin. Email Event can then be reduced to Desktop only

    /* means can be
       FaceBook > Desktop/app signing via Facebook
       Apple > app signin via AppleSign
       Email > pageLoad isNativeMethodSignin iOS app param, signin via our standard form
               Event is heard by Desktop, Android
    */

    //Flags for SignUp and SignIn pixels
    if ( isFacebookCreate || isAppleCreate || isNativeMethodRegister ) {
        window.tealiumUtils.regWall.cookieOrQSCreate = true;
    } else if ( isFacebookSignIn || isAppleSignIn ||  isNativeMethodSignin) {
        window.tealiumUtils.regWall.cookieOrQSSignin = true;
    }
    
    window.tealiumUtils.regWall.means = 'Email';
    window.tealiumUtils.regWall.needListeners = true;

    if ( isFacebookCreate || isFacebookSignIn ) {
        window.tealiumUtils.regWall.means = 'Facebook';
    } else if ( isAppleCreate || isAppleSignIn ) {
        window.tealiumUtils.regWall.means = 'Apple';
    } else if ( isNativeMethodRegister || isNativeMethodSignin ) {
        //Email - the signin form, used by iOS (or soon, Android app v2). 
        //Will be tracked on page load, don't need event listeners
        window.tealiumUtils.regWall.needListeners = false;
    }
}

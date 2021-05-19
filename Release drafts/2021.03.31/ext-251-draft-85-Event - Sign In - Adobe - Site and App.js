if (window.ccpaShareAnalytics && typeof window.signInAdobeAnalytics === 'undefined') {
    window.signInAdobeAnalytics = true;
    window.tealiumUtils = window.tealiumUtils || {};
    window.tealiumUtils.regWall = window.tealiumUtils.regWall || {};
    window.tealiumUtils.regWall.signIn = window.tealiumUtils.regWall.signIn || {};
    
    window.tealiumUtils.regWall.signIn.adobeAnalytics = function () {
        utag.view({
            signIn_success: window.tealiumUtils.regWall.methodMeansLocation('SignIn'),
            signInEvent: true
        }, null, [123]);
        //123: Adobe Analytics v2
    };
    
    //Track now or track on event
    if ( window.tealiumUtils.regWall.cookieOrQSSignin ) {
        //track now, on page load
        window.tealiumUtils.regWall.signIn.adobeAnalytics();
    } else if ( window.tealiumUtils.regWall.needListeners )  {
        //Not tracking on page load, add event listeners
        //Email: Desktop, Android app (Android does not yet have nativeauthmethod 11/16/2020)
        $('body').on('signInSuccess.signInAdobeAnalytics', function(evt, data){
            window.tealiumUtils.regWall.signIn.adobeAnalytics();
        });
        $('body').on('signInError.signInAdobeAnalytics', function(){
            window.signInAdobeAnalytics = undefined;
        });
    }
}

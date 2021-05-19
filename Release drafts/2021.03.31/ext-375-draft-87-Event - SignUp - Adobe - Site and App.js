if (window.ccpaShareAnalytics && typeof window.registrationAnalytics === 'undefined') {
    window.registrationAnalytics = true;
    window.tealiumUtils = window.tealiumUtils || {};
    window.tealiumUtils.regWall = window.tealiumUtils.regWall || {};
    window.tealiumUtils.regWall.signUp = window.tealiumUtils.regWall.signUp || {};
    
    window.tealiumUtils.regWall.signUp.adobeAnalytics = function () {
        utag.view({
            register_success: window.tealiumUtils.regWall.methodMeansLocation('SignUp'),
            signUpEvent: true
        }, null, [123]);
        //123: Adobe Analytics v2
    };
    
    //Track now or track on event
    if ( window.tealiumUtils.regWall.cookieOrQSCreate ) {
        //track now, on page load
        window.tealiumUtils.regWall.signUp.adobeAnalytics();
    } else if ( window.tealiumUtils.regWall.needListeners )  {
        //Not tracking on page load, add event listeners
        //Email: Desktop, Android app (Android does not yet have nativeauthmethod 11/16/2020)
        $('body').on('registrationSuccess.registrationAnalytics', function(evt, data){
            window.tealiumUtils.regWall.signUp.adobeAnalytics();
        });
        $('body').on('registrationError.registrationAnalytics', function(){
            window.registrationAnalytics = undefined;
        });
    }
}

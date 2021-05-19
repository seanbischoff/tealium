if (window.ccpaShareAdvertising && typeof window.pinterestRegistration === 'undefined') {
    window.pinterestRegistration = true;
    window.tealiumUtils = window.tealiumUtils || {};
    window.tealiumUtils.regWall = window.tealiumUtils.regWall || {};
    window.tealiumUtils.regWall.signUp = window.tealiumUtils.regWall.signUp || {};
    
    window.tealiumUtils.regWall.signUp.pinterest = function () {
        pintrk('track', 'signup',{'lead_type':window.tealiumUtils.regWall.means});
    };
    
    //Track now or track on event
    if ( window.tealiumUtils.regWall.cookieOrQSCreate ) {
        //track now, on page load
        window.tealiumUtils.regWall.signUp.pinterest();
    } else if ( window.tealiumUtils.regWall.needListeners )  {
        //Not tracked on page load, add event listeners
        //Email: Desktop, Android app (Android does not yet have nativeauthmethod 11/16/2020)
        $('body').on('registrationSuccess.pinterest', function(evt, data){
            window.tealiumUtils.regWall.signUp.pinterest();
        });
        $('body').on('registrationError.pinterest', function(){
            window.pinterestRegistration = undefined;
        });
    }
}

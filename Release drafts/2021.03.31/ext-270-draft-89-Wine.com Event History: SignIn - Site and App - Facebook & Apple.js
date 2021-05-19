if (typeof window.eventAttributionSignIn === 'undefined') {
    window.eventAttributionSignIn = true;
    window.tealiumUtils = window.tealiumUtils || {};
    window.tealiumUtils.regWall = window.tealiumUtils.regWall || {};
    window.tealiumUtils.regWall.signIn = window.tealiumUtils.regWall.signIn || {};
    
    window.tealiumUtils.regWall.signIn.eventHistory = function (data = {}) {
        const methodMeansLocation = window.tealiumUtils.regWall.methodMeansLocation('SignIn');
        const customerId = window.tealiumUtils.regWall.getCustomerId(data);
        const uehType = 'SignIn';//We never get passwordreset, ignore it

        //Internal User Event History Trackinghttps://my.tealiumiq.com/tms?utk=5f516b93c9d8eae89fe74f984d7cdfe693c0e5a83ffbaf7977#
        let hookData = {
            "customerId" : customerId,
            "description": methodMeansLocation,
            "source": b['cp.ehSource'] || '',
            "userEventHistoryType": uehType
        };
        window.tealiumUtils.eventHistory.save(hookData);
    };
    
    //Track now or track on event
    if ( window.tealiumUtils.regWall.cookieOrQSSignin ) {
        //track now, on page load
        window.tealiumUtils.regWall.signIn.eventHistory();
    } else if ( window.tealiumUtils.regWall.needListeners )  {
        //Not tracked on page load, add event listeners
        //Email: Desktop, Android app (Android does not yet have nativeauthmethod 11/16/2020)
        $('body').on('signInSuccess.eventAttribution', function(evt, data){
            window.tealiumUtils.regWall.signIn.eventHistory(data);
        });
        $('body').on('signInError.eventAttribution', function(){
            window.eventAttributionSignIn = undefined;
        });
    }
}

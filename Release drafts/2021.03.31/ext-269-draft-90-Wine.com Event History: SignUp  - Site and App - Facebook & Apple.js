if (typeof window.eventAttributionRegistration === 'undefined') {
    window.eventAttributionRegistration = true;
    window.tealiumUtils = window.tealiumUtils || {};
    window.tealiumUtils.regWall = window.tealiumUtils.regWall || {};
    window.tealiumUtils.regWall.signUp = window.tealiumUtils.regWall.signUp || {};
    
    window.tealiumUtils.regWall.signUp.eventHistory = function (data = {}) {
        const methodMeansLocation = window.tealiumUtils.regWall.methodMeansLocation('SignUp');
        const customerId = window.tealiumUtils.regWall.getCustomerId(data);
        const uehType  = 'Registration';

        //Internal User Event History Tracking
        let hookData = {
            "customerId" : customerId,
            "description": methodMeansLocation,
            "source": b['cp.ehSource'] || '',
            "userEventHistoryType": uehType
        };
        window.tealiumUtils.eventHistory.save(hookData);
    };
    
    //Track now or track on event
    if ( window.tealiumUtils.regWall.cookieOrQSCreate ) {
        //track now, on page load
        window.tealiumUtils.regWall.signUp.eventHistory();
    } else if ( window.tealiumUtils.regWall.needListeners )  {
        //Not tracked on page load, add event listeners
        //Email: Desktop, Android app (Android does not yet have nativeauthmethod 11/16/2020)
        $('body').on('registrationSuccess.eventAttribution', function(evt, data){
            window.tealiumUtils.regWall.signUp.eventHistory(data);
        });
        $('body').on('registrationError.eventAttribution', function(){
            window.eventAttributionRegistration = undefined;
        });
    }
}

if (window.ccpaShareAdvertising && typeof window.registrationAdvertisingAppsFlyerBranch === 'undefined') {
    window.registrationAdvertisingAppsFlyerBranch = true;
    window.tealiumUtils = window.tealiumUtils || {};
    window.tealiumUtils.regWall = window.tealiumUtils.regWall || {};
    window.tealiumUtils.regWall.signUp = window.tealiumUtils.regWall.signUp || {};
    
    window.tealiumUtils.regWall.signUp.appsFlyerBranchAppOnly = function (data = {}) {
        const isApp = (navigator && navigator.userAgent && navigator.userAgent.indexOf('WinecomApp/') >= 0);
        if(isApp) {
            const methodMeansLocation = window.tealiumUtils.regWall.methodMeansLocation('SignUp');
            const customerId = window.tealiumUtils.regWall.getCustomerId(data);

            //AppsFlyer
            const eventName = "af_complete_registration";
            const eventValue = "{\"af_registration_method\":\"" + methodMeansLocation + "\"}";

            let iframe = document.createElement("IFRAME");
            let src = "af-event://inappevent?eventName=" + eventName + "&af_customer_user_id=" + customerId + "&eventValue=" + eventValue;
            iframe.setAttribute("src", src);
            iframe.setAttribute("title", "AppFlyer tracking complete registration");
            document.documentElement.appendChild(iframe);
            //iframe.parentNode.removeChild(iframe);
            //iframe = null;

            //Branch
            const shipToState = b['meta.shipToState'];
            const marketingChannelSource = b['meta.marketingChannelSource'];
            let eventData = {
                "name": "COMPLETE_REGISTRATION",
                "user_data": {
                    "developer_identity": customerId.toString()
                },
                "custom_data": {
                    "marketingChannelSource": marketingChannelSource,
                    "register_pageName": methodMeansLocation,
                    "shipToState": shipToState
                },
                "event_data": {
                    "description": "Registration"
                },
                "metadata": {}
            };
            window.branchIntegration.sendEvent(eventData);
        }
    };
    
    //Track now or track on event
    if ( window.tealiumUtils.regWall.cookieOrQSCreate ) {
        //track now, on page load
        window.tealiumUtils.regWall.signUp.appsFlyerBranchAppOnly();
    } else if ( window.tealiumUtils.regWall.needListeners )  {
        //Not tracking on page load, add event listeners
        //Email: Desktop, Android app (Android does not yet have nativeauthmethod 11/16/2020)
        $('body').on('registrationSuccess.registrationAdvertisingAppsFlyerBranch', function(evt, data){
            window.tealiumUtils.regWall.signUp.appsFlyerBranchAppOnly(data);
        });
        $('body').on('registrationError.registrationAdvertisingAppsFlyerBranch', function(){
            window.registrationAdvertisingAppsFlyerBranch = undefined;
        });
    }
}

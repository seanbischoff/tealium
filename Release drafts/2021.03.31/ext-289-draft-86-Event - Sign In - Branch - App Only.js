if (window.ccpaShareAdvertising && typeof window.branchSignIn === 'undefined') {
    window.branchSignIn = true;
    window.tealiumUtils = window.tealiumUtils || {};
    window.tealiumUtils.regWall = window.tealiumUtils.regWall || {};
    window.tealiumUtils.regWall.signIn = window.tealiumUtils.regWall.signIn || {};
    
    window.tealiumUtils.regWall.signIn.branchAppOnly = function (data = {}) {
        const isApp = (navigator && navigator.userAgent && navigator.userAgent.indexOf('WinecomApp/') >= 0);
        
        if (isApp) {
            const methodMeansLocation = window.tealiumUtils.regWall.methodMeansLocation('SignIn');
            const customerId = window.tealiumUtils.regWall.getCustomerId(data);
            
            //Branch
            const marketingChannelSource = b['meta.marketingChannelSource'];
            const shipToState = b['meta.shipToState'];
            
            const eventData = {
                "name": "LOGIN",
                "user_data": {
                    "developer_identity": customerId.toString()
                },
                "custom_data": {
                    "marketingChannelSource": marketingChannelSource,
                    "register_pageName": methodMeansLocation,
                    "shipToState": shipToState
                },
                "event_data": {
                    "description": "Sign in"
                },
                "metadata": {}
            };
            window.branchIntegration.sendEvent(eventData);
        }
    };
    
    //Track now or track on event
    if ( window.tealiumUtils.regWall.cookieOrQSSignin ) {
        //track now, on page load
        window.tealiumUtils.regWall.signIn.branchAppOnly();
    } else if ( window.tealiumUtils.regWall.needListeners )  {
        //Not tracking on page load, add event listeners
        //Email: Desktop, Android app (Android does not yet have nativeauthmethod 11/16/2020)
        $('body').on('signInSuccess.branchSignIn', function(evt, data){
            window.tealiumUtils.regWall.signIn.branchAppOnly(data);
        });
        $('body').on('signInError.branchSignIn', function(){
            window.branchSignIn = undefined;
        });
    }
}

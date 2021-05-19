if (window.ccpaShareAdvertising && typeof window.appsFlyerSignIn === 'undefined') {
    window.appsFlyerSignIn = true;
    window.tealiumUtils = window.tealiumUtils || {};
    window.tealiumUtils.regWall = window.tealiumUtils.regWall || {};
    window.tealiumUtils.regWall.signIn = window.tealiumUtils.regWall.signIn || {};
    
    window.tealiumUtils.regWall.signIn.appsFlyerAppOnly = function (data = {}) {
        const isApp = (navigator && navigator.userAgent && navigator.userAgent.indexOf('WinecomApp/') >= 0);
        
        if (isApp) {
            const methodMeansLocation = window.tealiumUtils.regWall.methodMeansLocation('SignIn');
            const customerId = window.tealiumUtils.regWall.getCustomerId(data);
            const eventName = 'af_login';

            let iframe = document.createElement("IFRAME");
            let src = "af-event://inappevent?eventName=" + eventName + "&af_description=" + methodMeansLocation + "&af_customer_user_id=" + customerId;
            iframe.setAttribute("src", src);
            iframe.setAttribute("title", "AppsFlyer tracking " + eventName + '-' + methodMeansLocation);
            document.documentElement.appendChild(iframe);
            //iframe.parentNode.removeChild(iframe);
            //iframe = null;
        }
    };
    
    //Track now or track on event
    if ( window.tealiumUtils.regWall.cookieOrQSSignin ) {
        //track now, on page load
        window.tealiumUtils.regWall.signIn.appsFlyerAppOnly();
    } else if ( window.tealiumUtils.regWall.needListeners )  {
        //Not tracking on page load, add event listeners
        //Email: Desktop, Android app (Android does not yet have nativeauthmethod 11/16/2020)
        $('body').on('signInSuccess.appsFlyerSignIn', function(evt, data){
            window.tealiumUtils.regWall.signIn.appsFlyerAppOnly(data);
        });
        $('body').on('signInError.appsFlyerSignIn', function(){
            window.appsFlyerSignIn = undefined;
        });
    }
}

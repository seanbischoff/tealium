if (window.ccpaShareAnalytics && typeof window.signInAnalytics === 'undefined') {
    window.signInAnalytics = true;
    window.tealiumUtils = window.tealiumUtils || {};
    window.tealiumUtils.signIn = window.tealiumUtils.signIn || {};

    //Site and app
    window.tealiumUtils.signIn.adobeAnalytics = function(means, data) {
        const isApp = (navigator && navigator.userAgent && navigator.userAgent.indexOf('WinecomApp/') >= 0);
        const nativeauthmethod = b['qp.nativeauthmethod'];//values are either 'signin' or 'register' or 'paswordreset'
        const nativeauthlocation = b['qp.nativeauthlocation'];//values are either 'regwall' or 'browsing'
        const pageName = b['meta.pageName'];

        let location = (pageName.indexOf('Shopping Cart') !== -1) ? 'Cart' : 'Storefront';
        //In App, get more specific but not for cart
        if(isApp && location !== 'Cart') {
            if(typeof nativeauthlocation !== 'undefined' && nativeauthlocation.length > "") {
                location = nativeauthlocation;
            } else {
                location =  'nativeauthlocationvoid';
            }
        }

        const methodMeansLocation = 'SignIn' + ':' + means + ':' + location;

        // method:means:location
        // {nativeauthmethod}:{Facebook/Email/Apple}:{nativeauthlocation}
        utag.view({
            signIn_success: methodMeansLocation,
            signInEvent: true
        }, null, [123]);
        //123: Adobe Analytics v2
    }

    const isFacebook  = (b['cp.fbLoginType']   === 'login');
    const isAppleSign = (b['cp.appleSignType'] === 'login');//values are either 'signin' or 'create'
    const isNativeMethodSignin = b['dom.url'].indexOf('nativeauthmethod=signin') !== -1;//iOS does not hear event
    const isAndroid = navigator && navigator.userAgent && navigator.userAgent.indexOf('Android') >= 0;//Android hears event
    // TODO once User Agent contains 'Android' we can differentiate and simplify the logic

    //3rd Party
    let means;
    if (isFacebook) {
        means = 'Facebook';
    } else if (isAppleSign) {
        means = 'Apple';
    } else if (isNativeMethodSignin) {
        //Is either IOS vs Android. Track and flag to prevent duplicate by event
        means = 'Email';
        window.trackedAppEmailSignin = true;
    }

    if ( means ) {
        //Facebook cookie, Apple cookie, or iOS app QS param was found
        window.tealiumUtils.signIn.adobeAnalytics(means);
    } else if (typeof window.trackedAppEmailSignin == undefined){
        //Desktop and App Android both hear the event.
        //Android already tracked based on nativeauthmethod app QS param, so ignore
        means = 'Email';
        $('body').on('signInSuccess.signInAnalytics', function(evt, data){
            window.tealiumUtils.signIn.adobeAnalytics(means,data);
        });
        $('body').on('signInError.signInAnalytics', function(){
            window.signInAnalytics = undefined;
        });
    }
}

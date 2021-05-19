var isApp = (navigator && navigator.userAgent && navigator.userAgent.indexOf('WinecomApp/') >= 0);

if (window.ccpaShareAdvertising && typeof window.checkoutSuccessOrderAppsFlyer === 'undefined' && isApp) {
    window.checkoutSuccessOrderAppsFlyer = true;

    $('body').on('orderProcessSuccess.checkoutSuccessOrderAppsFlyer', function(evt, data) {
        try {

            //AppsFlyer
            var customerId = b['meta.legacyCustomerId'];
            var firstPurchased = data.isFirstPurchase;
            var SSJoined = data.containsStewardshipPurchase;

            function createIframe(eventName, eventValue){
                var iframe = document.createElement("IFRAME");
                var qs = "af-event://inappevent?eventName=" + eventName + "&af_customer_user_id=" + customerId;
                if(eventValue){
                    qs += "&eventValue=" + eventValue;
                }
                iframe.setAttribute("src", qs);
                iframe.setAttribute("title","AppsFlyer tracking " + eventName);
                document.documentElement.appendChild(iframe);
                //iframe.parentNode.removeChild(iframe);
                //iframe = null;
            }

            var eventName = "af_purchase";
            var purchase_count = b['meta.cart_productCount'];
            var purchase_id = data.purchaseId || '';
            var revenue = parseFloat(b['meta.cart_productTotal'].replace('$', '').replace(',',''));

            var eventValue =
                "{"
                + "\"af_revenue\":" + revenue
                + ", \"af_order_id\":\"" + purchase_id + "\""
                + ", \"af_currency\":\"USD\""
                + ", \"af_quantity\":\"" + purchase_count + "\""
                + "}";

            createIframe(eventName, eventValue);

            if(firstPurchased){
                createIframe('af_firstPurchased');
            }
            if(SSJoined) {
                createIframe('af_joinedStewardship');
            }

            createIframe('af_purchaseActivityStatus-' + b['meta.purchaseActivityType'], "{"
                + "\"af_revenue\":" + revenue
                + ", \"af_customerActivityStatus\":\"" + b['meta.purchaseActivityType'] + ",\""
                + ", \"af_firstPurchased\":\"" + firstPurchased + "\""
                + "}");

        }
        catch (err) {
            console.log('Tealium Order Success AppsFlyer error.');
            console.log(err);
        }
    });
}

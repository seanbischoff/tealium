if (window.ccpaShareAdvertising && typeof window.firstPurchaseWithSTfromSearch === 'undefined') {
    window.firstPurchaseWithSTfromSearch = true;

    $('body').on('orderProcessSuccess.firstPurchaseWithSTfromSearch', function(evt, data) {
        try {
            var firstPurchased = data.isFirstPurchase;
            var SSJoined = data.containsStewardshipPurchase;
            var searchReferrer = b['cp.searchReferrer'] || false;
            

            // Floodlight Track New User with Stewardship Join
            //New ext #470 is tracking as a separate event. We already have u13 and u14 in the Tag #47 Order Success event
            /*
              ['/checkout/thankyou/newAndSTJoin', {type: 'stjoin1', cat: 'joine00'}],
              ['/checkout/thankyou/newAndSTJoinSearch', {type: 'stjoin1', cat: 'joine00'}],
            */
            if ( firstPurchased && SSJoined) {
                let flsQS = 'u23=true;u24=' + data.purchaseId;
                //pathName is not tracked to Floodlight, just used for the iframe title, for internal clarity
                let pathName = '/checkout/thankyou/newAndSTJoin';
                window.tealiumUtils.trackflsPixel(pathName,flsQS);
            }
            
        } catch (err) {
            console.log("Tealium First Purchase with ST and from Search FLS Advertising error");
            console.log(err);
        }
    });

}

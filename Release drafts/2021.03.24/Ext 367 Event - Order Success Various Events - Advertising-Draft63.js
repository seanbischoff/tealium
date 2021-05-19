if (window.ccpaShareAdvertising && typeof window.checkoutSuccessOrderAdvertising === 'undefined') {
    window.checkoutSuccessOrderAdvertising = true;

    function buildContentIdArray(productIds, warehouseState){
        var contentIdArray = [];
        var productIdArray = [];
        productIdArray = productIds;
        for(i = 0; i < productIdArray.length; i++){
            contentIdArray.push(productIdArray[i] + '_' + warehouseState);
        }
        return contentIdArray;
    }

    function createCookie(name, value, days) {
        var date, expires;
        if (days) {
            date = new Date();
            date.setTime(date.getTime()+(days*24*60*60*1000));
            expires = '; expires='+date.toGMTString();
        } else {
            expires = '';
        }
        document.cookie = name+'='+value+expires+'; path=/';
    }

    $('body').on('orderProcessSuccess.checkoutSuccessOrderAdvertising', function(evt, data) {
        try {

            var warehouseState = b['meta.shippingRegion'];
            var purchase_id = data.purchaseId || '';
            var purchase_cartGuid = b['meta.cart_guid'];
            var purchase_productTotal = b['meta.cart_productTotal'];
            var purchase_productTotalFB = parseFloat(b['meta.cart_productTotal'].replace('$', '').replace(',',''));
            var purchase_count = b['meta.cart_productCount'];
            var purchase_freight = b['meta.cart_estimatedFreight'].replace('$', '');
            var purchase_tax = b['meta.cart_estimatedTax'].replace('$', '');
            var purchase_total = b['meta.cart_estimatedTotal'].replace('$', '');
            var prodTempIds = b['meta.cart_productTemplateId'];
            var prodIds = b['meta.cart_productId'];
            var prodQtys = b['meta.cart_productQuantity'];
            var prodUnitPrice = b['meta.cart_productUnitPrice'];
            var promoCode = b['meta.PromoCode'];

            prodUnitPrice = prodUnitPrice.replace(/\$/g,'');
            purchase_productTotal = purchase_productTotal.replace(/\$/g,'');
            purchase_productTotal = [purchase_productTotal];

            var isGift = data.isGiftPurchase;

            var prodTempIdsArray = prodTempIds.split(',');
            var prodIdsArray = prodIds.split(',');
            var prodQtysArray = prodQtys.split(',');
            var prodUnitPriceArray = prodUnitPrice.split(',');

            prodUnitPriceArray = prodUnitPriceArray.map(Number);

            b['purchase_id'] = purchase_id;
            b['purchase_productTemplateId'] = prodTempIdsArray;
            b['purchase_productId'] = prodIdsArray;
            b['purchase_productQuantity'] = prodQtysArray;
            b['purchase_productUnitPrice'] = prodUnitPriceArray;

            var floodlightProdIds = [];

            if (warehouseState !== 'CA') {
                for (var i = 0; i < prodTempIdsArray.length; i++) {
                    floodlightProdIds.push(prodTempIdsArray[i] + warehouseState);
                }
                b['floodlightProdIds'] = floodlightProdIds;

            } else {
                b['floodlightProdIds'] = prodTempIdsArray;
            }

            // Joined StewardShip
            b['SSJoined'] = data.containsStewardshipPurchase;
            var SSJoined = data.containsStewardshipPurchase;

            //First Time Purchaser
            b['firstPurchase'] = data.isFirstPurchase;
            var firstPurchased = data.isFirstPurchase;

            b['isPersonalPurchase'] = !isGift;

            var viewConfig = {
                connexity_cust_type: firstPurchased ? 1 : 0,
                purchase_success: true,
                purchase_id: purchase_id,
                purchase_cartGuid: purchase_cartGuid,
                purchase_productTemplateId: b['purchase_productTemplateId'],
                purchase_productId: b['purchase_productId'],
                purchase_productQuantity: b['purchase_productQuantity'],
                purchase_productUnitPrice: b['purchase_productUnitPrice'],
                gtag_pagetype: 'purchase',
                purchase_productTotal: purchase_productTotal,
                purchase_count: purchase_count,
                purchase_freight: purchase_freight,
                purchase_tax: purchase_tax,
                purchase_total: purchase_total,
                firstPurchase: firstPurchased,
                SSJoined: SSJoined,
            };
            if(isGift) {
                viewConfig.purchaseGift = true;
            } else {
                viewConfig.purchasePersonal = true;
            }
            
            //Floodlight Track New User from Search Purchase with Stewardship Join
            var searchReferrer = b['cp.searchReferrer'] || false;
            if (searchReferrer && firstPurchased && SSJoined) {
                viewConfig.newFromSearchJoinedSS = true;
            }

            utag.link({event_type:'PERSONAL1'});
            utag.view(viewConfig, null, [47, 74, 95, 96]);
            utag.link({event_type:'PERSONAL2'});

            // 47: Google DoubleClick - Floodlight
            // 74: Branch IO
            // 95: Connexity
            // 96: Google Ads Conversion Tracking & Remarketing (gtag.js)

            //Branch.io tracking
            // Need to be super cautious for ipad users
            if (typeof branch !== 'undefined' && typeof branch.track !== 'undefined' && typeof branch.track.call !== 'undefined') {
                //branch.track('purchase');// 2019 moved to else below
            }

            //Handle Multiple Branch Events
            if(globalUserAgent.indexOf('WinecomApp/') !== -1) {
                //Event 1 - Purchase

                var productName = b['meta.cart_productName'];
                var productNameArray = productName.split(',');

                //Rebuild products, push into content_items
                var content_items = [];
                for (var ii = 0; ii < productNameArray.length; ii++) {
                    content_items[ii] = {
                        "$content_schema": "COMMERCE_PRODUCT",
                        "$canonical_identifier": prodTempIdsArray[ii],
                        "$price": prodUnitPriceArray[ii],
                        "$quantity": Number(prodQtysArray[ii]),
                        "$sku": prodIdsArray[ii],
                        "$product_name": productNameArray[ii],
                    };
                }

                var branchPurchaseEventData = {
                    "name": "PURCHASE",
                    "user_data": {
                        "environment": "FULL_APP",
                    },
                    "custom_data": {
                        "isGift": isGift.toString(),
                        "promoCode": (promoCode) ? promoCode : "none",
                        "purchase_cartGuid": purchase_cartGuid,
                        "purchase_count": purchase_count.replace("$", ''),
                        "purchase_productTotal": purchase_productTotal[0].replace("$", '').replace(',', ''),
                        "purchase_tax": purchase_tax.replace("$", ''),
                        "warehouseState": warehouseState,
                        "StewardShipJoined": SSJoined.toString(),
                        "isFirstPurchase": firstPurchased.toString()
                    },
                    "event_data": {
                        "transaction_id": purchase_id,
                        "currency": "USD",
                        "revenue": Number(purchase_total.replace("$", '').replace(',', '')),
                        "shipping": Number(purchase_freight.replace("$", '').replace(',', '')),
                        "tax": Number(purchase_tax.replace("$", '').replace(',', '')),
                        "coupon": (promoCode) ? promoCode : "none",
                        "description": "Order Success",
                    },
                    "content_items": content_items,
                    "metadata": {},
                    "branch_key": "key_test_hdcBLUy1xZ1JD0tKg7qrLcgirFmPPVJc"
                };
                window.branchIntegration.sendEvent(branchPurchaseEventData);

                //2. Stewardship Join Event
                if(SSJoined) {
                    var branchStewardShipJoinedEventData = {
                        "name": "SUBSCRIBE",
                        "custom_data": {
                            "purchase_productTotal": purchase_productTotal[0].replace("$", ''),
                        },
                        "event_data": {
                            "transaction_id": purchase_id,
                            "currency": "USD",
                            "revenue": Number(purchase_total.replace("$", '')),
                            "description": "StewardShip Joined",
                        },
                        "metadata": {},
                        "branch_key": "key_test_hdcBLUy1xZ1JD0tKg7qrLcgirFmPPVJc"
                    };
                    window.branchIntegration.sendEvent(branchStewardShipJoinedEventData);
                }

                //3. First Time Purchase Event
                if(firstPurchased) {
                    var branchFirstPurchaseEventData = {
                        "name": "FIRST_PURCHASE",
                        "custom_data": {
                            "isCustomEvent": "true",
                            "purchase_productTotal": purchase_productTotal[0].replace("$", ''),
                        },
                        "event_data": {
                            "transaction_id": purchase_id,
                            "currency": "USD",
                            "revenue": Number(purchase_total.replace("$", '')),
                            "description": "First purchase",
                        },
                        "metadata": {},
                        "branch_key": "key_test_hdcBLUy1xZ1JD0tKg7qrLcgirFmPPVJc"
                    };
                    window.branchIntegration.sendEvent(branchFirstPurchaseEventData);
                }
            } else {
                branch.track('purchase');
            }

            // Fire Facebook Tracking
            if (typeof fbq !== 'undefined') {
                var fbProdData = {};
                var isStewardship = (b['meta.membershipType'].indexOf("SS") >= 0);

                fbProdData.content_type = 'product';
                fbProdData.content_ids = buildContentIdArray(prodTempIdsArray, b['meta.shippingRegion']);
                //dup of param #2 'Purchase' fbProdData.event = data.eventName;//deduping, must match API param event_name
                fbProdData.value = purchase_productTotalFB;
                fbProdData.currency = 'USD';
                fbProdData.order_id = purchase_id;
                fbProdData.num_items = purchase_count;
                fbProdData.event_name = data.eventName;
                //custom properties; passed as &cd[propertyname] in QS
                fbProdData.customer_activity_status = data.customerActivityStatus;//never, recent, etc
                fbProdData.customer_status = data.customerStatus; //stewardship status
                
                fbq('track', 'Purchase', fbProdData, {eventID: data.eventId});//deduping, eventId must match API param event_id, populates eid param
                if (SSJoined === true){
                    fbq('trackCustom', 'SSJoin', {SSJoin: SSJoined});
                }
                if (SSJoined === true && firstPurchased){
                    fbq('trackCustom', 'SSJoinNew', {SSJoinNew: SSJoined});
                }

                if(firstPurchased === true){
                    fbq('trackCustom', 'firstPurchase', {firstPurchase: firstPurchased, value: purchase_productTotalFB, currency: 'USD'});
                }
                if(!isGift){
                    fbq('trackCustom', 'personalPurchase', {personalPurchase: true});
                }

                // New All purchases
                fbq('trackCustom', 'allPurchases', { value: purchase_productTotalFB, currency: 'USD' });

                //Custom info on purchase
                fbq('trackCustom', 'purchaseActivityStatus-' + b['meta.purchaseActivityType'], {
                    customerActivityStatus: b['meta.purchaseActivityType'],
                    firstPurchased: firstPurchased,
                    productTotal: purchase_productTotalFB,
                    currency: 'USD'
                });
            }
            
            // Causal IQ Conversion Tracking pixels
            //See also Misc Causal IQ extension - 2 page pixels: Home and Cart
            /*
            Start of Floodlight Tag: Please do not remove
            Activity name of this tag: Wine.com Dynamic Conversion
            URL of the webpage where the tag is expected to be placed: 
            This tag must be placed between the <body> and </body> tags, as close as possible to the opening tag.
            Creation Date: 01/31/2020
            */
            if(!!firstPurchased) {
                var conversionImgNew = '<img alt="Causal IQ" src="https://ad.doubleclick.net/ddm/activity/src=9837292;type=sales;cat=winec0;qty=1;cost=' +
                Number(purchase_total.replace("$", '').replace(',', '')) + ';dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;tfua=;npa=;ord=' +
                purchase_id + '?" width="1" height="1" alt=""/>';
                $('body').append(conversionImgNew);
            } else {
                var conversionImgExisting = '<img alt="Causal IQ" src="https://gwmtracking.com/p/v/1/5e348cbef8708126dd3d7b41/format/img?" border="0" width="1" height="1">';
                $('body').append(conversionImgExisting);
            }

        } catch (err) {
            console.log("Tealium Order Success Advertising error");
            console.log(err);
        }
    });
}

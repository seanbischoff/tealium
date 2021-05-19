if (!window.tealiumUtilsInitialized) {
    window.tealiumUtilsInitialized = true;
    /*
        Add your Utility extension here
        1. eventHistory - for localStorage and syncing of offline Event History events
     */
    
    window.tealiumUtils = window.tealiumUtils || {
        accessCookie: function (cookieName) {
          let nameEQ = cookieName + "=";
          let allCookieArray = document.cookie.split(';');
          for(var i=0; i<allCookieArray.length; i++)
          {
            var temp = allCookieArray[i].trim();
            if (temp.indexOf(nameEQ)===0)
            return temp.substring(nameEQ.length,temp.length);
       	  }
        	return "";
        },
        
        appendIframe: function(src,title) {
            let iframe = document.createElement('IFRAME');
            iframe.setAttribute('height', 0);
            iframe.setAttribute('src', src);
            iframe.setAttribute('style', 'display:none');
            iframe.setAttribute('title', title);
            iframe.setAttribute('width', 0);
            document.documentElement.appendChild(iframe);
        },
        
        cleanupUnit: function (unitPrice) {
            return unitPrice.replace('$','').replace('.00','');
        },
        
        containsOnePickedGifting: function (lineItems) {
            //Returns the Picked Gifting Amount (one of the 3 buttons on Picked Gifting page) or undefined
            let isPickedGifting = false;
            //Check for the iidPicked cookie
            const pickedGiftCookieVal = Number(window.tealiumUtils.accessCookie('pickedgclp'));
            const pickedCardAmounts = [100,150,300];
            const isValidGiftingAmount = !!( pickedCardAmounts.find( x => x === pickedGiftCookieVal) );//The cookie stores the value of the button that was clicked.
            //TODO upgrade to 3 cookies, one per Gifting value Amount, cookie value is what? ... The number of cars added? ++ cookie value for each add?
            let tu = window.tealiumUtils;
            
            if(isValidGiftingAmount) {
                /* Valid Card IDs
                    22200 ($100)
                    22200 and 22091 ($100 + $50 = $150) 
                    22200 and 22201 ($100  + $200 = $300) 
                    
                    Ex line item:
                    classId: 9
                    fractional: "00"
                    origin: "California"
                    productTemplateId: 22200
                    quantity: 1
                    shortDesc: "Corkscrews"
                    unitPrice: "$100.00"
                    whole: "100"
                */
                
                const result100 = lineItems.filter(obj => {
                  return obj.productTemplateId === 22200;
                });
                const result50 = lineItems.filter(obj => {
                  return obj.productTemplateId === 22091;
                });
                const result200 = lineItems.filter(obj => {
                  return obj.productTemplateId === 22201;
                });
    
                if (pickedGiftCookieVal === 100) {
                    //If there is at least one $100 card, and the cookie is for $100, it qualifies
                     
                    if (Number(tu.cleanupUnit(result100[0].unitPrice)) === pickedGiftCookieVal ) {
                        isPickedGifting = true;
                    }
                }
                else if (pickedGiftCookieVal === 150) {
                    //If there is at least one $100 card and one $50 card and the cookie is for $150, it qualifies
                    if ( ( Number(tu.cleanupUnit(result100[0].unitPrice)) + Number(tu.cleanupUnit(result50[0].unitPrice)) ) === pickedGiftCookieVal ) {
                        isPickedGifting = true;
                    }
                }
                else if (pickedGiftCookieVal === 300) {
                    //If there is at least one $100 card and one $200 card and the cookie is for $150, it qualifies
                    if ( (Number(tu.cleanupUnit(result100[0].unitPrice)) + Number(tu.cleanupUnit(result200[0].unitPrice))) === pickedGiftCookieVal ) {
                        isPickedGifting = true;
                    }
                }
            }
            return (isPickedGifting) ? pickedGiftCookieVal : undefined;
        },

        createURN: function(length) {
            //Unique Random Number
            //call: window.tealiumUtils.createURN( 13 );
            let axel = Math.random() + '';
            let a = axel * 1000000000000000;
            a = parseInt(a, 10).toString();
            let num = Math.floor(Math.random() * length + 1);
            return a.substr(0, num) + '.' + a.substr(num);
        },

        getFLSsrc: function(flsType,flsCat,flsQS,flsURN) {
            let src = "https://5721974.fls.doubleclick.net/activity;src=5721974;"
            + "type=" + flsType + ";"
            + "cat=" + flsCat + ";"
            + "dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;tfua=;npa=;"
            if(flsQS.length > 0) {
                src += flsQS + ";";
            }
            src += "ord=" + flsURN + "?";
            return src;
        },

        getOrderTypes: function(itemModels){
            //call: window.tealiumUtils.getOrderTypes( data.lineItems.models );
            if(!itemModels){
                return;
            }
            let itemCount = itemModels.length;
    
            let orderTypes = {
                spirits: false,
                wine: false,
            };

            _runTypes = function(itemModel){
                let classId = itemModel.classId;
                if(!classId){
                    return;
                }
                //See https://winemaker.atlassian.net/wiki/spaces/EN/pages/756219932/Lists+of+Product+Class+and+Type
                const wines = [1,2,6,7,8];
                const spirits = [12,13,14,15,16,17,18,20,21];
                const foundWine = wines.find(element => element === classId);
                const foundSpirits = spirits.find(element => element === classId);
                if (foundWine) {
                    orderTypes.wine = true;
                }
                if (foundSpirits) {
                    orderTypes.spirits = true;
                }
            };
    
            for (let i = 0; i < itemCount; i++) {
                var itemModel = itemModels[i];
                _runTypes(itemModel);
            }
            return orderTypes;
        },
        
        lookupSearchReferrer: function(referrer) {
            //Ex referrer: "https://www.google.com/", https://qwww.wine.com/activity/mywine"
            const searchEngine = ( this.searchReferrers.find( x => referrer.indexOf(x) >= 0) );//!! returns true instead of the matching array element. The latter may be useful in future.

            return searchEngine;
        },
        
        paramGet: function(param,theUrl,consoleIt) {
          if (param === '') { return undefined;}
          var urlSplit = theUrl.split('?');
          var newURL = urlSplit[0];
        
          if(urlSplit.length > 1) {
            const params = urlSplit[1].split('&');
            let locatediid = params.filter(item => item.indexOf(param) === 0)[0];
            let valueToReturn = undefined;
            
            if(typeof locatediid === 'undefined') {
              return undefined;
            }
            
            switch ( typeof locatediid) {
              case 'object':
                locatediid = locatediid[0];//It will be this
                break;
              case 'string':
                //Desired format, do nothing
                break;
              default:
                locatediid = locatediid[0];//It will be this
            }
            let iidValue = locatediid.replace(param + '=','');
        
            if (typeof iidValue === 'string') {
              valueToReturn = iidValue;
            }
            
            if(consoleIt) {
              console.log('paramGet() iidValue: ' + iidValue);
            }
            return valueToReturn;
          }
        },
        
        paramStrip: function(paramToStrip,url) {
            //Returns provided URL with the param removed
            var param = paramToStrip || 'iid';
            var pageUrl = url;
            var urlSplit = pageUrl.split('?');
            var newURL = urlSplit[0];
            var urlToReturn = '';
            if(urlSplit.length > 1) {
                var params = urlSplit[1].split('&');
                var removeiid = params.filter(item => item.indexOf(param) == -1);
                var rebuiltQS = removeiid.join('&');
                var prefix = rebuiltQS.length > 0 ? urlSplit[0] + '?' : urlSplit[0];
                newURL = prefix + rebuiltQS;
                urlToReturn = newURL;
            } else {
                console.log('no params found, nothing to strip');
                urlToReturn = pageUrl;
            }
            if(consoleIt) {
              console.log('paramStrip() urlToReturn: ' + urlToReturn);
            }
            return urlToReturn;
        },

        pickedFlsMap: new Map([
            ['/picked', {type: 'pick1', cat: 'picke0'}],
            ['/picked/', {type: 'pick1', cat: 'picke0'}],
            ['/picked/onboarding', {type: 'pick1', cat: 'picke00'}],
            ['overview', {type: 'pick1', cat: 'picke0000'}],
            ['2', {type: 'pick1', cat: 'picke000'}],
            ['3', {type: 'pick1', cat: 'picke001'}],
            ['4', {type: 'pick1', cat: 'picke002'}],
            ['5', {type: 'pick1', cat: 'picke003'}],
            ['6', {type: 'pick1', cat: 'picke004'}],
            ['7', {type: 'pick1', cat: 'picke005'}],
            ['8', {type: 'pick1', cat: 'picke006'}],
            ['/picked/subscribe/recipient/new', {type: 'pick1', cat: 'picke007'}],
            ['/picked/subscribe/payment/new', {type: 'pick1', cat: 'picke008'}],
            ['/picked/subscribe/thankyou', {type: 'pick2', cat: 'picke0'}],
            ['/checkout/thankyou/newAndSTJoin', {type: 'stjoin1', cat: 'joine00'}]
        ]),
        
        pickedGiftingCards: new Map([
            ['100', {id: '22200'}],//https://www.wine.com/cart?product_id=22200&qty=1&iid=pickedgclp_addgiftcard100
            ['150', {id: '22200.22091'}],//https://www.wine.com/cart?product_id=22200,22091&qty=1,1&iid=pickedgclp_addgiftcard150
            ['300', {id: '22200.22201'}],//https://www.wine.com/cart?product_id=22200,22201&qty=1,1&iid=pickedgclp_addgiftcard300
        ]),
        
        searchReferrers: [
            '//www.google.com',
            '//www.amazon',
            '//www.bing',
            '//www.duckduckgo',
            '//www.ebay',
            '//www.wikipedia',
            '//www.ecosiabaidu',
            '//www.yahoo',
            '//www.yandex',
            '//www.ask',
            '//www.naver',
            '//www.aol',
            '//www.seznam'
        ],

        trackflsPixel: function(pathName,flsQS = "") {
            const item = window.tealiumUtils.pickedFlsMap.get(pathName);
            if(item) {
                const flsType = item.type;
                const flsCat = item.cat;
                const flsURN = window.tealiumUtils.createURN(13);
                const flsSrc = window.tealiumUtils.getFLSsrc(flsType,flsCat,flsQS,flsURN);
                
                this.appendIframe(flsSrc,'Floodlight tracking ' + pathName);
            }
        },
    };
}

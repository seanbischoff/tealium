if (window.ccpaShareAdvertising && typeof window.pickedSubscribedCIQAdvertising === 'undefined') {
    window.pickedSubscribedCIQAdvertising = true;
    //This is identical to  Tealium Draft 99 draft 1, but is hosted on private github repo seanbischoff/tealium
    console.log('Set Listener for Picked Subscribe, for Causal IQ');
    $('body').on('pickedSubscribed.pickedSubscribedCIQAdvertising', function(evt, data) {
        try {
            console.log('Track Picked Subscribe for Causal IQ');
            /* Their example SRC:
            <img src='
            [https://gwmtracking.com/p/v/1/5f1b2a87f8708149cf219103/format/img?v1=[TargetBoxPrice]&v2=[BoxFrequency]
            |https://gwmtracking.com/p/v/1/5f1b2a87f8708149cf219103/format/img?v1=[TargetBoxPrice]&v2=[BoxFrequency]
            |smart-link] ' border=0 width=1 height=1>
            */
            $('body').append('<img alt="Causal IQ" src="https://gwmtracking.com/p/v/1/5f1b2a87f8708149cf219103/format/img?v1=' + data.targetBoxPrice + '&v2=' + data.frequency + '" border="0" width="1" height="1">');
        } catch (err) {
            console.log("Tealium Picked Subscribe Success Causal IQ Advertising error");
            console.log(err);
        }
    });
}

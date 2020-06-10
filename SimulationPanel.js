const xapi = require('xapi');
xapi.config.set("Standby Signage Mode", "On");

const url1 = "https://i.ibb.co/djcLtZY/Capture-d-e-cran-2020-06-03-a-18-19-56.png";
var refreshIntervalId;
var alertDuration = 1;

xapi.event.on('UserInterface Extensions Widget Action', (event) => {
     if (event.WidgetId == 'bouton_1' && event.Type !== 'clicked'){
     xapi.command('UserInterface Message Alert Display', {
     Title: 'Please Leave the Room. The Air is Renewing',
     Text: "Too many people detected Room capacity = 4", Duration: 0,
     });
     
     setTimeout(function(){
                  xapi.config.set("Standby Signage Url", url1);
                  xapi.command('Standby Halfwake'); 
          }, 4000);
     }
     else if(event.WidgetId == 'bouton_2' && event.Type !== 'clicked'){
        xapi.command('UserInterface Message Alert Display', {
          Title: 'Please Leave the Room. The Air is Renewing',
          Text: 'Waiting time: ' + alertDuration + ' min', Duration: 0,
      });
      
      
     
     setTimeout(function(){
                  refreshIntervalId = setInterval(updateEveryMinutes, 60*1000);
                  xapi.config.set("Standby Signage Url", "http://websrv2.ciscofrance.com:15198/airRenewal/?dc=" + alertDuration);
                  xapi.command('Standby Halfwake'); 
          }, 4000);
     }
     else if(event.WidgetId == 'bouton_3' && event.Type !== 'clicked'){
        xapi.command('UserInterface Message Alert Display', {
          Title: 'Lauch Footprint Dashboard',
          Text: '', Duration: 0,
      });
      
      
     
     setTimeout(function(){
       xapi.status.get("Network 1").then((network) => {
                  const macAddress = network.Ethernet.MacAddress;
                  xapi.config.set("Standby Signage Url", "http://websrv2.ciscofrance.com:15124/" + macAddress);
       });
                  xapi.command('Standby Halfwake'); 
          }, 4000);
     }
 })




function updateEveryMinutes() {
  alertDuration = alertDuration - 1;
  if(alertDuration !== 0){
      xapi.config.set("Standby Signage Url", "http://websrv2.ciscofrance.com:15198/airRenewal/?dc=" + alertDuration);
      xapi.command('Standby Halfwake'); 
  }
  else{
      xapi.command('Standby Deactivate');
      xapi.config.set("Standby Signage Url", "");
      xapi.config.set("Standby Signage Mode", "Off");
    xapi.command(' Audio SoundsAndAlerts Ringtone Play', {
      RingTone: 'Ringer',
    });
    clearInterval(refreshIntervalId);
     
  }
}




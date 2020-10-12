const xapi = require('xapi');

const maxUltVol = 90;
let curUltVol;

function log(value) {
    console.log(value);
}

function converter(type, gui, value) {
    if (type === 'ts' && gui === true) return (value == 'Enabled') ? 'on':'off';
    else if (type === 'ts' && gui === false) return (value == 'on') ? 'Enabled':'Disabled';
    else if (type === 's') return (gui === true) ? (value * 100 / maxUltVol * 255 / 100).toFixed() : (value * 100 / 255 * maxUltVol / 100).toFixed();
    else if (type === 'tc' && gui === true) return (value === 'Available') ? 'on':'off';
    else if (type === 'tc' && gui === false) return (value === 'on') ? 'Activate':'Deactivate';
    else return value;
}

function genCommand(parts) {
    parts[0] = (parts[0] === 'p') ? 'proximity':'audio';
    return parts;
}

function incrementor(type, max, value) {
    if (type == 'increment') {
        if (value < max) value++;
    }
    else if (type == 'decrement') {
        if (value > 0) value--;
    }
    return value;
}

function setGUIValues(guiId,value) {
    xapi.command('UserInterface Extensions Widget SetValue', { 
        WidgetId: guiId, 
        Value: value
    });
    log('[GUI]: ' + guiId + ' : ' + value)
}

function setAPIValues(param, value, cb) {
   xapi.config.set(param, value);
   log('[API]: ' + param + ' : ' + value)
   
   if (cb) cb()
}

function setInitialValues() {
    xapi.config.get('Proximity Mode').then((status) => { 
        setGUIValues('t_p-mode',status.toLowerCase());
    });
    xapi.config.get('Audio Ultrasound').then((status) => {
        setGUIValues('sp_a-ultrasound-maxvolume', status.MaxVolume);
        setGUIValues('s_a-ultrasound-maxvolume', converter('s',true,status.MaxVolume));
        curUltVol = parseInt(status.MaxVolume);
    });
    xapi.config.get('Proximity Services').then((status) => {
        setGUIValues('ts_p-services-contentshare-toclients', converter('ts',true,status.ContentShare.ToClients)); 
        setGUIValues('ts_p-services-contentshare-fromclients', converter('ts',true,status.ContentShare.FromClients));
        setGUIValues('ts_p-services-callcontrol', converter('ts',true,status.CallControl));
    });
    /*xapi.status.get('Proximity Services Availability').then((status) => {
        setGUIValues('tc_p-services', converter('tc',true,status));
        setGUIValues('service_avail_status', status);
    });*/
} 

function listenAPI() {
    /*xapi.status.on('Proximity Services Availability', status => {
        setGUIValues('tc_p-services', converter('tc',true,status));
        setGUIValues('service_avail_status', status);
    });*/
    xapi.config.on('Proximity Mode', status => { 
        setGUIValues('t_p-mode',status.toLowerCase()); 
    });
    xapi.config.on('Proximity Services ContentShare ToClients', status => { 
        setGUIValues('ts_p-services-contentshare-toclients', converter('ts',true,status)); 
    });
    xapi.config.on('Proximity Services ContentShare FromClients', status => { 
        setGUIValues('ts_p-services-contentshare-fromclients', converter('ts',true,status));
    });
    xapi.config.on('Proximity Services CallControl', status => { 
        setGUIValues('ts_p-services-callcontrol', converter('ts',true,status)); 
    });
    xapi.config.on('Audio Ultrasound', status => {
        setGUIValues('s_a-ultrasound-maxvolume', converter('s',true,status.MaxVolume)); 
        setGUIValues('sp_a-ultrasound-maxvolume', status.MaxVolume);
        curUltVol = parseInt(status.MaxVolume);
    });
    xapi.event.on('UserInterface Extensions Widget Action', e => {
        const parts = e.WidgetId.split('_');
        const params = genCommand(parts[1].split('-')).join(' ');
        if (parts[0] === 'sp' && e.Type === 'clicked') {
          setAPIValues(params,incrementor(e.Value, maxUltVol, curUltVol));
        }
        if (parts[0] === 't' || parts[0] === 'ts' || (parts[0] === 's' && e.Type == 'released')) {
          setAPIValues(params,converter(parts[0], false, e.Value), function () {
            if (e.WidgetId === 't_p-mode') {
              if (e.Value === 'on') {
                xapi.command('proximity services Activate');
              } else {
                xapi.command('proximity services Deactivate');
              }
            }
          });
        }
        if (parts[0] === 'tc') xapi.command(params + ' ' + converter(parts[0],false,e.Value));
    });
}

setInitialValues();
listenAPI();

//Author: Magnus Ohm
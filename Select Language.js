/**
 * Quick menu for selecting language.
 * Reset to English on standby.
 * Showing a dialog also allows us to
 * implicitly close the In-room panel
 */
const xapi = require('xapi');

let languages = [];
let languagesFrench = ['Français', 'Anglais', 'Allemand', 'Italien'];
let languagesEnglish = ['French', 'English', 'German', 'Italian'];
let languagesGerman = ['Französisch', 'Englisch', 'Deutsch', 'Italienisch'];
let languagesItalian = ['Francese', 'Inglese', 'Tedesco', 'Italiana'];
let language_selected = 0;

languages = languagesFrench;
setGuiValue('lang_spinner', languages[language_selected]);
setLanguageDescription();

function msg(Title, Text, Duration = 5) {
  xapi.command('UserInterface Message Alert Display', { Title, Text, Duration });
}

function setLanguage(language_number) {
  let language = null;
  
  switch (language_number) {
    case 0:
      language = 'French';
      break;
    case 1:
      language = 'English';
      break;
    case 2:
      language = 'German';
      break;
    case 3:
      language = 'Italian';
      break;
    default:
      language = 'French';
  }
  
  xapi.config.set('UserInterface Language', language)
  .catch((error) => { console.error(error); });
}

function onGui(event) {
  if (event.Type !== 'clicked') return;
  
  if (event.WidgetId == 'lang_spinner') {
    if (event.Value == "decrement") {
      language_selected--;
      
      if(language_selected <= -1) {
        language_selected = languages.length - 1;
      }
      
      setGuiValue('lang_spinner', languages[language_selected]);
      setLanguageDescription();
    } else if (event.Value == "increment") {
      language_selected++;
      
      if(language_selected >= languages.length) {
        language_selected = 0;
      }
      
      setGuiValue('lang_spinner', languages[language_selected]);
      setLanguageDescription();
    }
  } else if (event.WidgetId == 'lang_submit') {
    setLanguage(language_selected);
    setLanguageMessage();
    setArrayLanguages();
    setLanguageDescription();
    setGuiValue('lang_spinner', languages[language_selected]);
  }
}

function setArrayLanguages() {
  switch (language_selected) {
    case 0:
      languages = languagesFrench;
      break;
    case 1:
      languages = languagesEnglish;
      break;
    case 2:
      languages = languagesGerman;
      break;
    case 3:
      languages = languagesItalian;
      break;
    default:
      languages = languagesFrench;
  }
}

function setLanguageDescription() {
  let description = null;
  
  switch (language_selected) {
    case 0:
      description = 'Veuillez choisir une langue';
      break;
    case 1:
      description = 'Please select a language';
      break;
    case 2:
      description = 'Bitte wählen Sie eine Sprache';
      break;
    case 3:
      description = 'Selezionare una lingua';
      break;
    default:
      description = 'Veuillez choisir une langue';
  }
    
  setGuiValue('lang_description', description);
}

function setLanguageMessage() {
  let msg_string = null;
  
  switch (language_selected) {
    case 0:
      msg_string = 'La langue repassera en français quand le codec se mettra en veille';
      break;
    case 1:
      msg_string = 'The language will revert to French when the codec goes into standby mode';
      break;
    case 2:
      msg_string = 'Die Sprache wird auf Französisch zurückgesetzt, wenn der Codec in den Standby-Modus wechselt.';
      break;
    case 3:
      msg_string = 'La lingua tornerà al francese quando il codec va in modalità standby';
      break;
    default:
      msg_string = 'La langue repassera en français quand le codec se mettra en veille';
  }
  
  msg('', msg_string, 3);
}

function setGuiValue(id, value) {
  xapi.command('UserInterface Extensions Widget SetValue', { Value: value, WidgetId: id })
  .catch(() => { console.error('Not able to set GUI value', id, value); });
}

xapi.event.on('UserInterface Extensions Widget Action', onGui);
xapi.status.on('Standby State', state => {
  //console.log('going to ', state);
  if (state === 'Standby') {
    setLanguage('French');
    language_selected = 0;
    setGuiValue('lang_spinner', languages[language_selected]);
    setLanguageDescription();
  }
});

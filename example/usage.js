import { configure } from '~/services/i18n';
import en from 'en.json';
import nl from 'nl.json';

// import { Text } from 'react-native';

configure({
    defaultLanguage: 'nl',
    resources: {
        nl: nl,
        en: en,
    },
    onFinished: () => console.log('Initialized i18n'),
    component: 'span',
    // component: Text, // react-native
    // component: 'span', // web
});

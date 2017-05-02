# lifely-react-i18n
[![npm version](https://badge.fury.io/js/lifely-react-i18n.svg)](https://badge.fury.io/js/lifely-react-i18n)

An easy to use implementation of i18next for React projects.

## Usage
Add to your project
```
$ yarn add lifely-react-i18n
```
Configuration
```
import { configure } from 'lifely-react-i18n';
import en from '~/i18n/en.json';
import nl from '~/i18n/nl.json';

configure({
    defaultLanguage: 'nl',
    // the resource key represents the language
    resources: {
        nl: nl,
        en: en,
    },
    onFinished: () => console.log('Initialized i18n'),
    // any text rendering element/component
    component: 'span',
    // component: Text, // react-native
    // component: 'span', // web

    // to use i18next middleware like i18next-browser-languagedetector
    // pass it to "use"
    // use: [LanguageDetector],
    use: [],
});
```

### Configure translation example: en.json
```
{
    "loggedin": {
        "tabs": {
            "AnnouncementsTabScene": {
                "header": {
                    "title": "Announcements"
                },
                "body": {
                    "currentUser": "You are loggedin as {{email}}"
                }
            }
        }
    }
}
```

### Translating

#### translate
```
import { translate } from 'lifely-react-i18n';

translate('hello.world'); => "Hello World!"
```

#### changeLanguage
Will change the current language and update all translation subscriptions.
```
import { changeLanguage } from 'lifely-react-i18n';

changeLanguage('en');
```
```
// will use "en-US" if available, else it will default to "en"
changeLanguage('en-US'); 
```
#### getCurrentLanguage
```
import { getCurrentLanguage } from 'lifely-react-i18n';

getCurrentLanguage(); => "en"
```
#### updateLanguage (Not yet implemented)
Is supposed to update the associated language file
```
import { updateLanguage } from 'lifely-react-i18n';
// updating a language is a WIP
// update coming soon
updateLanguage('en', {"foo": {"bar": "BYE WORLD"}});
```

#### Translator class
The translator class provides a translate method (`t`) that renders translated values that are assigned to keys in the provided namespace. You can subscribe your component to the translator that will automatically update the translated text when the current language changes. If you don't want the headache associated with subscribing and unsubscribing you can use the `createTranslatorComponent` method (recommended).
```
import { Translator } from 'lifely-react-i18n';

export default class LoginView extends Component {
    constructor(props) {
        super(props);
        this.translator = new Translator({
            namespace: 'App.LoginView',
            subscribe: this,
        });
    }
    componentWillUnmount() {
        // don't forget to unsubscribe!
        this.translator.unsubscribe(this);
    }
    render() {
        const { t } = this.translator;
        return (
            <View>
                <Paragraph>{t('foo.bar', {email: 'user@example.com'})}</Paragraph>
            </View>
        );
    }
}
```

##### Translator.subscribe
you can pass the component instance to the constructor like this
```
this.translator = new Translator({
    namespace: 'App.LoginView',
    subscribe: this,
});
```
or you can subscribe at a later time like this
```
this.translator.subscribe(this);
```
##### Translator.unsubscribe
to unsubscribe (like on componentWillunmount) you have to pass the same instance you provided when subscribing
```
this.translator.unsubscribe(this);
```

#### createTranslatorComponent
`createTranslatorComponent` returns a React component that has a built-in subscription to the current language and namespace. This way you won't have to manage your translation subscriptions yourself.
```
import { createTranslatorComponent } from 'lifely-react-i18n';
const T = createTranslatorComponent({
    namespace: 'loggedin.tabs.AnnouncementsScene'
});

export default class AnnouncementsScene extends Component {
    render() {
        return (
            <View>
                <Header>
                    <Title>
                        <T i18n={'header.title'} />
                    </Title>
                </Header>
                <Body>
                    <T i18n={'body.currentUser'} options={{email: 'user@example.com}} />
                </Body>
            </View>
        );
    }
}
```
##### T.transformText
If you would like some more control over the outputted text you can transform the text output with the `transformText` hook.
```
{
    "foo": {
        "bar": "Hello"
    }
}
```
```
<Wrapper>
    <T i18n={'foo.bar'} transformText={(text) => `${text} World!`} />
</Wrapper>
```
In the browser will output to:
```
<div class="wrapper">
    <span>Hello World!</span>
</div>
```

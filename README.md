# lifely-react-i18n
[![npm version](https://badge.fury.io/js/lifely-react-i18n.svg)](https://badge.fury.io/js/lifely-react-i18n)

A translator class and react component that rerenders text when the i18n instance updates.

## Usage
```
$ yarn add lifely-react-i18n
```
```.js
import i18next from 'i18next';
import { initialize } from 'lifely-react-i18n';

initialize(i18next);
```

### initialize(i18nextInstance, {options})
To use the translator class you need to initialize it in your project root by providing your i18next instance, you only need to do this once.

#### options: defaultComponent
If you don't provide `createTranslatorComponent` with a `component` option it will wrap your text in a `<span>` by default, but you can alter this default behaviour to any text rendering component or element by providing the `defaultComponent` option.

### Translator class
The translator class provides a translate method (`t`) that renders translated values that are assigned to keys in the provided namespace. You can subscribe your component to the translator that will automatically update the translated text when the current language changes. If you don't want the headache associated with subscribing and unsubscribing you can use the `createTranslatorComponent` method (recommended).
```.jsx
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

#### Translator.subscribe(instance)
you can pass the component instance to the constructor like this
```.js
this.translator = new Translator({
    namespace: 'App.LoginView',
    subscribe: this,
});
```
or you can subscribe at a later time like this
```.js
this.translator.subscribe(this);
```
#### Translator.unsubscribe(instance)
to unsubscribe (like on componentWillunmount) you have to pass the same instance you provided when subscribing
```.js
this.translator.unsubscribe(this);
```

### createTranslatorComponent
`createTranslatorComponent` returns a React component that has a built-in subscription to the current language and namespace. This way you won't have to manage your translation subscriptions yourself.
```.jsx
import { createTranslatorComponent } from 'lifely-react-i18n';
const T = createTranslatorComponent({
    namespace: 'loggedin.tabs.AnnouncementsScene',
    component: MyTextRenderingComponent,
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
#### T.transformText
If you would like some more control over the outputted text you can transform the text output with the `transformText` hook.
```.json
{
    "foo": {
        "bar": "Hello"
    }
}
```
```.jsx
<Wrapper>
    <T i18n={'foo.bar'} transformText={(text) => `${text} World!`} />
</Wrapper>
```
In the browser will output to:
```.html
<div class="wrapper">
    <span>Hello World!</span>
</div>
```

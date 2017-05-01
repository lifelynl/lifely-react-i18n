import React, { Component } from 'react';
import i18next from 'i18next';
import isEmpty from 'lodash.isempty'
import bindAll from 'lodash.bindall'
import noop from 'lodash.noop'
import mapValues from 'lodash.mapvalues'
import keysIn from 'lodash.keysin'
let i18nTextComponent = undefined;

// translate('hello-world') => "Hello world!"
export function translate(...args) {
    return i18next.t(...args);
};

// changeLanguage('en')
export function changeLanguage(...args) {
    return i18next.changeLanguage(...args);
};

// getCurrentLanguage() => "nl"
export function getCurrentLanguage() {
    return i18next.language;
};

// text component
class Text extends Component {
    _textWrapper = undefined;

    constructor(props) {
        super(props);
        if (!props.textWrapper) throw new Error('No text component has been configured');
        this._textWrapper = props.textWrapper;
    }

    getTextComponent() {
        return this._textWrapper;
    }

    render() {
        const T = this.getTextComponent();
        return <T>{this.props.children}</T>;
    }
};

export function createTranslateComponent({namespace} = {}) {
    return class T extends Component {
        constructor(props) {
            super(props);

            this.translator = new Translator({
                namespace: namespace,
                subscribe: this,
            });

            this._renderText = this._renderText.bind(this);
        }

        componentWillUnmount() {
            this.translator.unsubscribe(this);
        }

        _renderText() {
            const { i18n, options, renderText } = this.props;
            const translatedText = this.translator.t(i18n, options);

            if (renderText) return renderText(translatedText);
            return translatedText;
        }

        render() {
            return (
                <Text textWrapper={i18nTextComponent}>
                    { this._renderText() }
                </Text>
            );
        }
    };
}

export function updateLanguage(language, translations) {
    console.log('i18n.updateLanguage needs implementation');
}

// import { Translator, translate } from '~/services/i18n';
// const translator = new Translator({ namespace: 'App.Users.Employees.Detail' });
// const { t } = translator;
// t('actionbar.buttons.edit'); is the same as translate('App.Users.Employees.Detail.actionbar.buttons.edit');
export class Translator {
    constructor({namespace, subscribe: instance}) {
        bindAll(this, ['t', '_updateSubscriptions', 'subscribe', 'unsubscribe']);

        this._namespace = namespace;
        if (instance) this.subscribe(instance);
    }

    _subscriptions = [];

    _updateSubscriptions(language) {
        this._subscriptions.forEach((i) => i.forceUpdate());
    }

    // translator.subscribe(componentInstance);
    subscribe(instance) {
        this._subscriptions.push(instance);
        if (!isEmpty(this._subscriptions)) {
            i18next.on('languageChanged', this._updateSubscriptions);
        }
    }

    // translator.unsubscribe(componentInstance);
    unsubscribe(instance) {
        const index = this._subscriptions.indexOf(instance);
        this._subscriptions.splice(index, 1);
        if (isEmpty(this._subscriptions)) {
            i18next.off('languageChanged', this._updateSubscriptions);
        }
    }

    t(key, ...args) {
        return i18next.t(`${this._namespace}.${key}`, ...args);
    }
};

function i18nextWithMiddleware(useMiddleware = []) {
    useMiddleware.forEach((middleware) => {
        i18next.use(middleware);
    });
    return i18next;
};

// configure lifely-react-i18n
export function configure({
    defaultLanguage = 'en',
    resources: resourcesConf = {},
    onFinished = noop,
    use: middleware = [],
    component,
}) {
    i18nTextComponent = component;

    i18nextWithMiddleware(middleware)
        .init({
            // set language to 'nl' by default, this overrides the languagedetector
            // when we have proper language integration, we should remove this setting
            lng: defaultLanguage,
            // resources: {
            //     en: { translation: {...} },
            //     nl: { translation: {...} },
            // },
            resources: mapValues(resourcesConf, (translation) => ({translation})),
            // whitelist: ['nl', 'en'],
            whitelist: keysIn(resourcesConf),
            nonExplicitWhitelist: true,
            // this renderd the key if the translation is missing
            parseMissingKeyHandler: (key) => `${key}`,
        }, (err, t, ...args) => {
            onFinished(err, t, ...args);
        });
}

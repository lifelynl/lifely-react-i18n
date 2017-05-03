import React, { Component } from 'react';
import isEmpty from 'lodash.isempty'
import bindAll from 'lodash.bindall'
let i18next = undefined;
let i18nTextComponent = undefined;

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

export function createTranslatorComponent({namespace} = {}) {
    return class T extends Component {
        constructor(props) {
            super(props);

            this.translator = new Translator({
                namespace: namespace,
                subscribe: this,
            });

            this._transformText = this._transformText.bind(this);
        }

        componentWillUnmount() {
            this.translator.unsubscribe(this);
        }

        _transformText() {
            const { i18n, options, transformText } = this.props;
            const translatedText = this.translator.t(i18n, options);

            if (transformText) return transformText(translatedText);
            return translatedText;
        }

        render() {
            return (
                <Text textWrapper={i18nTextComponent}>
                    { this._transformText() }
                </Text>
            );
        }
    };
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

// initialize lifely-react-i18n
export function initialize(i18n, { component }) {
    i18nTextComponent = component;
    i18next = i18n;
};

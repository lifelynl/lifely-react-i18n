import React, { Component } from 'react';
import isEmpty from 'lodash.isempty';
import bindAll from 'lodash.bindall';
let _i18next = undefined;
let _defaultI18nTextComponent = 'span';

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

export function createTranslatorComponent({namespace, component} = {}) {
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

        _transformText(i18n, options, transformText) {
            const translatedText = this.translator.t(i18n, options);
            if (transformText) return transformText(translatedText, this.translator.t, i18n, options);
            return translatedText;
        }

        render() {
            const { i18n, options, transformText, ...passProps } = this.props;
            return (
                <Text textWrapper={component || _defaultI18nTextComponent} {...passProps}>
                    { this._transformText(i18n, options, transformText) }
                </Text>
            );
        }
    };
}

export function createTranslator({namespace} = {}) {
    return (key, ...args) => _i18next.t(`${namespace}.${key}`, ...args);
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
            _i18next.on('languageChanged', this._updateSubscriptions);
        }
    }

    // translator.unsubscribe(componentInstance);
    unsubscribe(instance) {
        const index = this._subscriptions.indexOf(instance);
        this._subscriptions.splice(index, 1);
        if (isEmpty(this._subscriptions)) {
            _i18next.off('languageChanged', this._updateSubscriptions);
        }
    }

    t(key, ...args) {
        return _i18next.t(`${this._namespace}.${key}`, ...args);
    }
};

// initialize lifely-react-i18n
export function initialize(providedI18nextInstance, { defaultComponent = 'span' } = { defaultComponent: 'span' }) {
    _defaultI18nTextComponent = defaultComponent;
    _i18next = providedI18nextInstance;
};

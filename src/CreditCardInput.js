import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactNative, {
  NativeModules,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ViewPropTypes,
} from 'react-native';

import CreditCard from './CardView';
import CCInput from './CCInput';
import { InjectedProps } from './connectToState';

const s = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  form: {
    marginTop: 20,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#e3e3e3',
    width: Dimensions.get('window').width,
  },
  inputLabel: {
    padding: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    paddingLeft: 10,
    paddingRight: 10,
  },
});

const PREVIOUS_FIELD_OFFSET = 40;
const POSTAL_CODE_INPUT_WIDTH = 120; // https://github.com/yannickcr/eslint-plugin-react/issues/106

/* eslint react/prop-types: 0 */ export default class CreditCardInput extends Component {
  static propTypes = {
    ...InjectedProps,
    labels: PropTypes.object,
    placeholders: PropTypes.object,

    labelStyle: Text.propTypes.style,
    labelStyles: PropTypes.object,
    inputStyle: Text.propTypes.style,
    inputStyles: PropTypes.object,
    inputContainerStyle: ViewPropTypes.style,
    inputContainerStyles: PropTypes.object,

    validColor: PropTypes.string,
    invalidColor: PropTypes.string,
    placeholderColor: PropTypes.string,

    cardImageFront: PropTypes.number,
    cardImageBack: PropTypes.number,
    cardScale: PropTypes.number,
    cardFontFamily: PropTypes.string,
  };

  componentDidMount = () => this._focus(this.props.focused);

  componentWillReceiveProps = (newProps) => {
    if (this.props.focused !== newProps.focused) this._focus(newProps.focused);
  };

  _focus = (field) => {
    if (!field) return;

    const scrollResponder = this.refs.Form.getScrollResponder();
    const nodeHandle = ReactNative.findNodeHandle(this.refs[field]);

    NativeModules.UIManager.measureLayoutRelativeToParent(
      nodeHandle,
      (e) => {
        throw e;
      },
      (x) => {
        scrollResponder.scrollTo({ x: Math.max(x - PREVIOUS_FIELD_OFFSET, 0), animated: true });
        this.refs[field].focus();
      }
    );
  };

  _inputProps = (field) => {
    const {
      inputStyle,
      labelStyle,
      validColor,
      invalidColor,
      placeholderColor,
      placeholders,
      labels,
      values,
      status,
      onFocus,
      onChange,
      onBecomeEmpty,
      onBecomeValid,
      inputStyles,
      labelStyles,
    } = this.props;

    return {
      inputStyle: [s.input, inputStyle, inputStyles[field]],
      labelStyle: [s.inputLabel, labelStyle, labelStyles[field]],
      validColor,
      invalidColor,
      placeholderColor,
      ref: field,
      field,

      label: labels[field],
      placeholder: placeholders[field],
      value: values[field],
      status: status[field],

      onFocus,
      onChange,
      onBecomeEmpty,
      onBecomeValid,
    };
  };

  render() {
    const {
      cardImageFront,
      cardImageBack,
      inputContainerStyle,
      inputContainerStyles,
      values: { number, expiry, cvc, name, type },
      focused,
      requiresName,
      requiresCVC,
      requiresPostalCode,
      cardScale,
      cardFontFamily,
    } = this.props;

    return (
      <View style={s.container}>
        <CreditCard
          focused={focused}
          brand={type}
          scale={cardScale}
          fontFamily={cardFontFamily}
          imageFront={cardImageFront}
          imageBack={cardImageBack}
          name={requiresName ? name : ' '}
          number={number}
          expiry={expiry}
          cvc={cvc}
        />
        <ScrollView
          ref="Form"
          horizontal={false}
          keyboardShouldPersistTaps="always"
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          style={s.form}>
          <CCInput
            {...this._inputProps('number')}
            containerStyle={[
              s.inputContainer,
              inputContainerStyle,
              inputContainerStyles.number,
            ]}
          />
          <CCInput
            {...this._inputProps('expiry')}
            containerStyle={[
              s.inputContainer,
              inputContainerStyle,
              inputContainerStyles.expiry,
            ]}
          />
          {requiresCVC && (
            <CCInput
              {...this._inputProps('cvc')}
              containerStyle={[
                s.inputContainer,
                inputContainerStyle,
                inputContainerStyles.cvc,
              ]}
            />
          )}
          {requiresName && (
            <CCInput
              {...this._inputProps('name')}
              keyboardType="default"
              containerStyle={[
                s.inputContainer,
                inputContainerStyle,
                inputContainerStyles.name,
              ]}
            />
          )}
          {requiresPostalCode && (
            <CCInput
              {...this._inputProps('postalCode')}
              containerStyle={[
                s.inputContainer,
                inputContainerStyle,
                inputContainerStyles.postalCode,
              ]}
            />
          )}
        </ScrollView>
      </View>
    );
  }
}

CreditCardInput.defaultProps = {
  cardViewSize: {},
  inputStyles: {},
  labelStyles: {},
  inputContainerStyles: {},
  labels: {
    name: "Cardholder's name",
    number: 'Card Number',
    expiry: 'Expiry',
    cvc: 'CVC',
    postalCode: 'Postal Code',
  },
  placeholders: {
    name: 'Full Name',
    number: '1234 5678 1234 5678',
    expiry: 'MM/YY',
    cvc: 'CVC',
    postalCode: '34567',
  },
  inputContainerStyle: {},
  validColor: '',
  invalidColor: 'red',
  placeholderColor: 'gray',
};

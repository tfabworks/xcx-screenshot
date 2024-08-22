/**
 * This is an extension for Stretch3
 */
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {entry, setFormatter} from './index-base.jsx';

setFormatter(messageData => React.createElement(FormattedMessage, messageData))

Object.assign(entry, {
    extensionURL: null
});

export default entry;

/**
 * This is an extension for Stretch3
 */
import {entry, setFormatter} from './index-base.jsx';
import React from 'react';
import {FormattedMessage} from 'react-intl';

setFormatter(messageData => React.createElement(FormattedMessage, messageData))

Object.assign(entry, {
    extensionURL: null
});

export default entry;

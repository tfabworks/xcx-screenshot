/**
 * This is an extension for Xcratch.
 */

import iconURL from './entry-icon.png';
import insetIconURL from './inset-icon.png';
import translations from './translations.json';

/**
 * Formatter to translate the messages in this extension.
 * This will be replaced which is used in the React component.
 * @param {object} messageData - data for format-message
 * @returns {string} - translated message for the current locale
 */
let formatMessage = messageData => messageData.defaultMessage;

const entry = {
    get name () {
        return formatMessage({
            id: 'snapshot.entry.name',
            default: translations.en['snapshot.entry.name'],
            description: 'name of the extension'
        });
    },
    extensionId: 'snapshot',
    extensionURL: 'https://tfabworks.github.io/xcx-snapshot/dist/snapshot.mjs',
    collaborator: 'tfabworks',
    iconURL: iconURL,
    insetIconURL: insetIconURL,
    get description () {
        return formatMessage({
            defaultMessage: translations.en['snapshot.entry.description'],
            description: 'Description for this extension',
            id: 'snapshot.entry.description'
        });
    },
    featured: true,
    disabled: false,
    bluetoothRequired: false,
    internetConnectionRequired: false,
    helpLink: 'https://tfabworks.github.io/xcx-snapshot/',
    setFormatMessage: formatter => {
        formatMessage = formatter;
    },
    translationMap: translations
};

export {entry}; // loadable-extension needs this line.
export default entry;

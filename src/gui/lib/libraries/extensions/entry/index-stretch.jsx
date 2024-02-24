import React from 'react';
import { FormattedMessage } from 'react-intl';

/**
 * This is an extension for Xcratch.
 */

import iconURL from './entry-icon.png';
import insetIconURL from './inset-icon.png';
const version = 'v1.0.0';
const translations =
{
    "en": {
        "screenshot.entry.name": "Screenshot",
        "screenshot.entry.description": `Save the stage screenshot to the costume. (${version})`
    },
    "ja": {
        "screenshot.entry.name": "Screenshot",
        "screenshot.entry.description": `ステージのスクリーンショットをコスチュームに保存する。 (${version})`
    },
    "ja-Hira": {
        "screenshot.entry.name": "Screenshot",
        "screenshot.entry.description": `ステージのスクリーンショットをコスチュームにほぞんする。 (${version})`
    }
}

const entry = {
    name: (
        <FormattedMessage
            defaultMessage="Screenshot"
            description="Name for the 'Screenshot' extension"
            id="screenshot.entry.name"
        />
    ),
    extensionId: 'screenshot',
    extensionURL: null,
    collaborator: 'TFabWorks',
    iconURL: iconURL,
    insetIconURL: insetIconURL,
    description: (
        <FormattedMessage
            defaultMessage="Save the stage screenshot to the costume."
            description="Description for the 'Screenshot' extension"
            id="screenshot.entry.description"
        />
    ),
    featured: true,
    disabled: false,
    bluetoothRequired: false,
    internetConnectionRequired: false,
    helpLink: 'https://tfabworks.github.io/xcx-screenshot/',
    translationMap: translations
};

export { entry }; // loadable-extension needs this line.
export default entry;

#!/bin/sh

## Install script for https://stretch3.github.io/
## execute `sh ./xcx-screenshot/scripts/stretch3-install.sh`
## suppoesed dir configuration:
##  scratch-gui
##      - xcx-screenshot

LF=$(printf '\\\012_')
LF=${LF%_}

EXTENSION_REPO=xcx-screenshot
EXTENSION_ID=screenshot

# register it as a builtin extenstion
if ! grep -q -F "builtinExtensions['${EXTENSION_ID}']" node_modules/scratch-vm/src/extension-support/extension-manager.js; then
    mv node_modules/scratch-vm/src/extension-support/extension-manager.js node_modules/scratch-vm/src/extension-support/extension-manager.js_orig
    mkdir -p node_modules/scratch-vm/src/extensions/${EXTENSION_ID}
    cp ${EXTENSION_REPO}/dist/${EXTENSION_ID}.mjs node_modules/scratch-vm/src/extensions/${EXTENSION_ID}/
    sed -e "s|class ExtensionManager {|builtinExtensions['${EXTENSION_ID}'] = () => {${LF}    const formatMessage = require('format-message');${LF}    const ext = require('../extensions/${EXTENSION_ID}/${EXTENSION_ID}.mjs');${LF}    const blockClass = ext.blockClass;${LF}    blockClass.formatMessage = formatMessage;${LF}    return blockClass;${LF}};${LF}${LF}class ExtensionManager {|g" node_modules/scratch-vm/src/extension-support/extension-manager.js_orig > node_modules/scratch-vm/src/extension-support/extension-manager.js
fi

# register extension jsx
if ! grep -q "import ${EXTENSION_ID}Entry from" src/lib/libraries/extensions/index.jsx; then
    mv src/lib/libraries/extensions/index.jsx src/lib/libraries/extensions/index.jsx_orig
    mkdir -p src/lib/libraries/extensions/${EXTENSION_ID}
    cp ${EXTENSION_REPO}/src/gui/lib/libraries/extensions/entry/entry-icon.* src/lib/libraries/extensions/${EXTENSION_ID}/
    cp ${EXTENSION_REPO}/src/gui/lib/libraries/extensions/entry/inset-icon.* src/lib/libraries/extensions/${EXTENSION_ID}/
    cp ${EXTENSION_REPO}/src/gui/lib/libraries/extensions/entry/translations.json src/lib/libraries/extensions/${EXTENSION_ID}/
    cp ${EXTENSION_REPO}/src/gui/lib/libraries/extensions/entry/index-base.jsx src/lib/libraries/extensions/${EXTENSION_ID}/
    cp ${EXTENSION_REPO}/src/gui/lib/libraries/extensions/entry/index-stretch3.jsx src/lib/libraries/extensions/${EXTENSION_ID}/
    sed -e "s|^export default \[$|import ${EXTENSION_ID}Entry from './${EXTENSION_ID}/index-stretch3.jsx';${LF}${LF}export default [${LF}    ${EXTENSION_ID}Entry,|g" src/lib/libraries/extensions/index.jsx_orig > src/lib/libraries/extensions/index.jsx
fi

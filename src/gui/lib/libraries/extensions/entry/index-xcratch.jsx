/**
 * This is an extension for Xcratch
 */
import {entry, setFormatter} from './index-base.jsx';

setFormatter(messageData => (
    <FormatMessage
        id={messageData.id}
        defaultMessage={messageData.defaultMessage}
        description={messageData.description}
    />
))

Object.assign(entry, {
    setFormatMessage: formatter => setFormatter(formatter)
});

export {entry};

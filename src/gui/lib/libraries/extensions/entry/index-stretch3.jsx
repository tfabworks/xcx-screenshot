/**
 * This is an extension for Stretch3
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
    extensionURL: null
});

export default entry;

/**
 * This is an extension for Xcratch
 */
import {entry, setFormatter} from './index-base.jsx';

Object.assign(entry, {
    setFormatMessage: formatter => setFormatter(formatter)
});

export {entry};
export default entry;

import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';
import { TextEncoder, TextDecoder } from 'text-encoding';

// @ts-ignore
global.TextEncoder = TextEncoder;
// @ts-ignore
global.TextDecoder = TextDecoder;

const DOMExceptionPolyfill = class DOMException extends Error {
  constructor(message: string, name: string) {
    super(message);
    this.name = name;
  }
};

// @ts-ignore
global.DOMException = global.DOMException || DOMExceptionPolyfill;
// @ts-ignore
window.DOMException = window.DOMException || DOMExceptionPolyfill;
// @ts-ignore
globalThis.DOMException = globalThis.DOMException || DOMExceptionPolyfill;

if (typeof global.navigator === 'undefined') {
  // @ts-ignore
  global.navigator = {};
}

if (!global.navigator.userAgent) {
  Object.defineProperty(global.navigator, 'userAgent', {
    value: 'React-Native',
    writable: true,
    configurable: true
  });
}

if (!global.navigator.platform) {
  Object.defineProperty(global.navigator, 'platform', {
    value: 'React-Native',
    writable: true,
    configurable: true
  });
}

import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';
import { TextEncoder, TextDecoder } from 'text-encoding';
import { Platform } from 'react-native';

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
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  // @ts-ignore
  window.DOMException = window.DOMException || DOMExceptionPolyfill;
}
// @ts-ignore
globalThis.DOMException = globalThis.DOMException || DOMExceptionPolyfill;

if (typeof global.navigator === 'undefined') {
  // @ts-ignore
  global.navigator = {};
}
if (!global.navigator.userAgent) {
  // @ts-ignore
  global.navigator.userAgent = 'React-Native';
}
if (!global.navigator.platform) {
  // @ts-ignore
  global.navigator.platform = 'React-Native';
}

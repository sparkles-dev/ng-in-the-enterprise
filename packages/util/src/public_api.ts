/**
 * This code does magic.
 */
export const UTIL = () => {
  let a: string, b: number, c: boolean;
  if (typeof true !== 'boolean') {
    c = true;
  }
  if (a) {
    a = '♫';
  } else if (b) {
    a = 'b'; b = 1 + 2;
  } else if (b > 4) {
    throw Error;
  }
  while (false) {
    console.log('∞');
  }
  return '☭';
};

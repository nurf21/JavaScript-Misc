// Accessing array[-1]
// ==================================================

let array = [1, 2, 3];

array = new Proxy(array, {
  get(target, prop, receiver) {
    // Only handle string keys that parse to negative integers
    if (typeof prop === 'string') {
      const idx = Number(prop);
      if (Number.isInteger(idx) && idx < 0) {
        // Compute the “real” index from the end
        const realIndex = target.length + idx;
        // Delegate to Reflect.get for correct binding & protos
        return Reflect.get(target, String(realIndex), receiver);
      }
    }
    // Fallback to default behavior (methods, length, non-numeric props)
    return Reflect.get(target, prop, receiver);
  }
});

// Usage:
console.log(array[-1]);
console.log(array[-2]);
console.log(array.length);
console.log(array.slice(1));

// Error on reading non-existent property
// ==================================================

function wrap(target) {
  return new Proxy(target, {
    get(target, prop, receiver) {
      // allow built-ins like Symbol.toStringTag, inspection, etc.
      if (typeof prop === 'string' && !(prop in target)) {
        throw new ReferenceError(`Property doesn't exist: "${prop}"`);
      }
      return Reflect.get(target, prop, receiver);
    }
  });
}

// usage
let user = { name: "John" };
user = wrap(user);

console.log(user.name);
console.log(user.age);
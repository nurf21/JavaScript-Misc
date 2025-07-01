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
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

// Observable
// ==================================================

function makeObservable(target) {
  const handlers = [];

  return new Proxy(target, {
    get(obj, prop, receiver) {
      if (prop === 'observe') {
        // Expose observe(fn) to register handlers
        return function (handler) {
          if (typeof handler === 'function') {
            handlers.push(handler);
          }
        };
      }
      // Delegate everything else
      return Reflect.get(obj, prop, receiver);
    },

    set(obj, prop, value, receiver) {
      // Apply the property change
      const success = Reflect.set(obj, prop, value, receiver);

      // Notify all observers
      if (success) {
        handlers.forEach(h => h(prop, value));
      }

      return success;
    }
  });
}

// — Usage example:

let user = {};
user = makeObservable(user);

user.observe((key, value) => {
  console.log(`SET ${key}=${value}`);
});

user.name = "John";
user.age = 30;

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
let user2 = { name: "John" };
user2 = wrap(user2);

console.log(user2.name);
console.log(user2.age);
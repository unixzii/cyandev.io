const prefs = {};

const localStorage = (function () {
  if (typeof window === 'undefined') {
    return {
      setItem() {},
      getItem() { return null; }
    };
  }

  try {
    Object.assign(prefs, JSON.parse(window.localStorage.getItem('app:prefs')));
  } catch {
    // don't need to do anything, just eat the error.
  }

  return window.localStorage;
})();

let serializationScheduled = false;

function serializeToLocalStorage() {
  localStorage.setItem('app:prefs', JSON.stringify(prefs));
}

export function setPref(key, value) {
  if (value === undefined) {
    delete prefs[key];
  }
  prefs[key] = value;

  if (!serializationScheduled) {
    serializationScheduled = true;
    setTimeout(() => {
      serializationScheduled = false;
      serializeToLocalStorage();
    }, 1);
  }
}

export function getPref(key) {
  return prefs[key];
}

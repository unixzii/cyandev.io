const prefs = {};

try {
  Object.assign(prefs, JSON.parse(localStorage.getItem('app:prefs')));
} catch {
  console.error('App prefs back store is corrupted, resetting...');
  localStorage.setItem('app:prefs', '{}');
}


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

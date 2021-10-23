module.exports = (settings) => ({
  push (path, value, unique = false) {
    const obj = this.get(path);
    if (obj && Array.isArray(obj)) {
      if (unique && obj.findIndex((item) => item === value) !== -1) {
        return;
      }
      obj.push(value);
      this.set(path, obj);
    }
  },
  set (path, value) {
    const key = path.split('.')[0];
    let obj = settings.get(key) || {};
    path = path.replace(`${key}.`, '');
    obj[path] = value;
    obj = Object.unflatten(obj);
    settings.set(key, obj);
  },

  get (path, _default) {
    return settings.get(path) ?? _default;
  },

  has (path) {
    return typeof settings.get(path) !== 'undefined';
  },

  delete (path) {
    settings.delete(path);
  },

  getKeys (path) {
    return settings.getKeys(path);
  },

  getLength (path) {
    const obj = settings.get(path);

    if (obj && typeof obj === 'object') {
      return Object.keys(obj).length;
    }

    return null;
  }
});

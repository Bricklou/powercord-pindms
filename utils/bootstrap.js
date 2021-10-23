Object.unflatten = function (data) {
  'use strict';
  if (Object(data) !== data || Array.isArray(data)) {
    return data;
  }
  const regex = /\.?([^.[\]]+)|\[(\d+)\]/g,
    resultholder = {};
  for (const p in data) {
    let cur = resultholder,
      prop = '',
      m;
    while ((m = regex.exec(p))) {
      cur = cur[prop] || (cur[prop] = m[2] ? [] : {});
      prop = m[2] || m[1];
    }
    cur[prop] = data[p];
  }
  return resultholder[''] || resultholder;
};

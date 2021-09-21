Object.unflatten = function (data) {
  "use strict";
  if (Object(data) !== data || Array.isArray(data)) return data;
  const regex = /\.?([^.\[\]]+)|\[(\d+)\]/g,
    resultholder = {};
  for (const p in data) {
    let cur = resultholder,
      prop = "",
      m;
    while ((m = regex.exec(p))) {
      cur = cur[prop] || (cur[prop] = m[2] ? [] : {});
      prop = m[2] || m[1];
    }
    cur[prop] = data[p];
  }
  return resultholder[""] || resultholder;
};

Object.flatten = function (data) {
  const result = {};
  function recurse(cur, prop) {
    if (Object(cur) !== cur) {
      result[prop] = cur;
    } else if (Array.isArray(cur)) {
      for (const i = 0, l = cur.length; i < l; i++)
        recurse(cur[i], prop + "[" + i + "]");
      if (l == 0) result[prop] = [];
    } else {
      let isEmpty = true;
      for (const p in cur) {
        isEmpty = false;
        recurse(cur[p], prop ? prop + "." + p : p);
      }
      if (isEmpty && prop) result[prop] = {};
    }
  }
  recurse(data, "");
  return result;
};

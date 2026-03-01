export async function httpGet(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onload = () => {
      if (xhr.status === 200) {
        try {
          resolve(JSON.parse(xhr.responseText))
        }
        catch (e) {
          reject(e);
        }
      } else {
        reject(new Error(`HTTP-GET error: ${ xhr.status } ${ xhr.statusText }`))
      }
    };
    xhr.send();
  });
}

export async function httpPost(url, data, options = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    if (options.headers) {
      for (const [k, v] of Object.entries(options.headers)) {
        if (v != null) xhr.setRequestHeader(k, v);
      }
    }
    xhr.onload = () => {
      if (xhr.status === 200) {
        try {
          resolve(JSON.parse(xhr.responseText))
        }
        catch (e) {
          reject(e);
        }
      } else {
        reject(new Error(`HTTP-POST error: ${ xhr.status } ${ xhr.statusText }`))
      }
    };
    xhr.send(JSON.stringify(data || {}));
  });
}

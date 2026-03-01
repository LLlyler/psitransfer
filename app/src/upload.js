import "regenerator-runtime/runtime.js";

import Vue from 'vue';
import Upload from './Upload.vue';
import store from './Upload/store.js';
import Icon from 'vue-awesome/components/Icon'
import {httpGet, httpPost} from "./common/util";

Vue.component('icon', Icon);

async function createUploadBucket(store) {
  const path = (typeof window.PSITRANSFER_UPLOAD_PATH !== 'undefined' ? window.PSITRANSFER_UPLOAD_PATH : '/').replace(/\/$/, '');
  const url = window.location.origin + (path || '') + '/create-upload-bucket';
  const headers = {};
  const up = store.state.config && store.state.config.uploadPass;
  if (up) headers['x-passwd'] = up;
  const res = await httpPost(url, {}, { headers });
  return res.sid;
}

async function checkBucketIfSidPresent(store) {
  const match = document.location.search.match(/sid=([^&]+)/);
  if (!match) return;

  const sid = match[1];
  const path = (typeof window.PSITRANSFER_UPLOAD_PATH !== 'undefined'
    ? window.PSITRANSFER_UPLOAD_PATH
    : '/').replace(/\/$/, '');
  const url = window.location.origin + (path || '') + '/check-upload-bucket/' + sid;

  try {
    await httpGet(url);          // 200 -> ок
    store.commit('upload/SET_SID', sid);
  } catch (e) {
    // 404/400 -> такой корзины нет
    store.commit('ERROR', 'Bucket not found', { root: true });
  }
}

new Vue({
  el: '#upload',
  data: {
    baseURI: document.head.getElementsByTagName('base')[0].href.replace(/\/$/),
    configFetched: false,
    lang: {},
  },
  store,
  render: h => h(Upload),
  async beforeCreate() {
    // Fetch translations
    try {
      this.lang = await httpGet('lang.json');
      this.$store.commit('LANG', this.lang);
    } catch (e) {
      alert(e);
    }

    // Fetch config
    try {
      await this.$store.dispatch('config/fetch');
    } catch(e) {
      if(e.code !== 'PWDREQ') {
        console.error(e);
      }
      // If password is required, bucket will be created after successful login.
      this.configFetched = true;
      return;
    }
    this.configFetched = true;

    // If ссылка содержит sid=..., проверяем, что bucket зарегистрирован.
    // Иначе создаём новую корзину на сервере.
    if (document.location.search.match(/sid=([^&]+)/)) {
      await checkBucketIfSidPresent(this.$store);
    } else {
      try {
        const sid = await createUploadBucket(this.$store);
        this.$store.commit('upload/SET_SID', sid);
      } catch (e) {
        console.error('createUploadBucket failed:', e);
      }
    }
  }
});

window.PSITRANSFER_VERSION = PSITRANSFER_VERSION;

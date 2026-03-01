import "regenerator-runtime/runtime.js";

import Vue from 'vue';
import Upload from './Upload.vue';
import store from './Upload/store.js';
import Icon from 'vue-awesome/components/Icon'
import {httpGet} from "./common/util";

Vue.component('icon', Icon);

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

// If the link contains sid=..., we check that the bucket is registered.
// New buckets can only be retrieved by clicking the "Create download link" button.
    await checkBucketIfSidPresent(this.$store);
  }
});

window.PSITRANSFER_VERSION = PSITRANSFER_VERSION;

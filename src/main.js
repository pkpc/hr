import 'lib-flexible'
import Vue from 'vue'
import App from './App'
import VueRouter from 'vue-router'
import routes from './router/index'
import store from './store/index'
import LoadingPlugin from '../src/plugins/loading/index.js'
import ConfirmPlugin from '../src/plugins/confirm/index.js'
import ToastPlugin from '../src/plugins/toast/index.js'
import '../static/css/ionicons.min.css'
/*判断 iphone or android 添加class*/
const isIPhone = window.navigator.appVersion.match(/iphone/gi);
if (isIPhone) {
  document.body.className = 'is-iPhone'
} else {
  document.body.className = 'is-android'
}
Vue.use(VueRouter)
let router = new VueRouter({
  routes
})
Vue.prototype.setNameCardImg = function () {
  var methods = this.$options.methods
  if (methods) {
    for (var key in methods) {
      this[key] = bind(methods[key], this)
    }
  }
}
/* 向App发送消息 */
Vue.prototype.postMsgToApp = function (obj) {
  let ua = window.navigator.userAgent.toLowerCase()
  try {
    if (/iphone|ipad|ipod/.test(ua)) {
      window.webkit.messageHandlers.iOS.postMessage(obj)
    } else if (/android/.test(ua)) {
      window.Android.postMessage(JSON.stringify(obj).replace(/"/g, '\''))
    }
  } catch (e) {

  }
}
Vue.use(LoadingPlugin)
Vue.use(ConfirmPlugin)
Vue.use(ToastPlugin)
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
// const FastClick = require('fastclick')
// FastClick.attach(document.body)


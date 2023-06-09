import Vue from 'vue';
import store from './store';
import App from './App';

import Json from './Json'; //测试用数据
import regex from './utils/regex/regex';
import apis from './utils/apis';
import wx_api from './utils/wx_api';
import msg_api from './utils/msg_api';
import conf from './utils/config.js';
/**
 *  因工具函数属于公司资产, 所以直接在Vue实例挂载几个常用的函数
 *  所有测试用数据均存放于根目录json.js
 *
 *  css部分使用了App.vue下的全局样式和iconfont图标，有需要图标库的可以留言。
 *  示例使用了uni.scss下的变量, 除变量外已尽量移除特有语法,可直接替换为其他预处理器使用
 */
const msg = (title, duration = 1500, mask = false, icon = 'none') => {
  //统一提示方便全局修改
  if (Boolean(title) === false) {
    return;
  }
  uni.showToast({
    title,
    duration,
    mask,
    icon
  });
};
const json = type => {
  //模拟异步请求数据
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(Json[type]);
    }, 500);
  });
};

const prePage = () => {
  let pages = getCurrentPages();
  let prePage = pages[pages.length - 2];
  // #ifdef H5
  return prePage;
  // #endif
  return prePage.$vm;
};

Vue.config.productionTip = false;
Vue.prototype.$edition = conf.edition;
Vue.prototype.$fire = new Vue();
Vue.prototype.$store = store;
Vue.prototype.$api = { msg, json, prePage };
Vue.prototype.$regex = regex;
Vue.prototype.$apis = apis;
Vue.prototype.$wx_api = wx_api;
Vue.prototype.$msg_api = msg_api;
// Vue.prototype.$host = 'http://127.0.0.1:11130';
// Vue.prototype.$host = 'https://jisu.yexuan.site/api';
Vue.prototype.$host = conf.host;
// 全局订单写入
Vue.prototype.$ctran = apis.tran.create;

App.mpType = 'app';

const app = new Vue({
  ...App
});
app.$mount();

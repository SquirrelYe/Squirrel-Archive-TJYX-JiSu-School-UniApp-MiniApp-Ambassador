<template>
  <view class="container">
    <view class="left-bottom-sign"></view>
    <view class="back-btn yticon icon-zuojiantou-up" @click="navBack"></view>
    <view class="right-top-sign"></view>
    <!-- 设置白色背景防止软键盘把下部绝对定位元素顶上来盖住输入框等 -->
    <view class="wrapper">
      <view class="left-top-sign">LOGIN</view>
      <view class="welcome"> 欢迎回来！ </view>
      <view class="input-content">
        <view class="input-item">
          <text class="tit">手机号码</text>
          <input type="number" placeholder="请输入手机号码" maxlength="11" v-model="phone" />
        </view>
        <view class="input-item">
          <text class="tit">密码</text>
          <input placeholder="8-18位不含特殊字符的数字、字母组合" placeholder-class="input-empty" maxlength="20" password v-model="password" @confirm="toLogin" />
        </view>
      </view>
      <button class="confirm-btn" @click="toLogin" :disabled="logining">登录</button>
    </view>
  </view>
</template>

<script>
import { mapMutations } from 'vuex';
export default {
  data() {
    return {
      phone: '',
      password: '',
      logining: false
    };
  },
  onLoad() {},
  methods: {
    ...mapMutations(['login']),
    navBack() {
      uni.navigateBack();
    },
    // 登录
    async toLogin() {
      this.logining = true;
      const { phone, password } = this;
      if (!phone || !password) {
        this.$api.msg('不能输入为空喔~');
        this.logining = false;
        return;
      }
      // 登录
      let login = await this.$apis.user.cusLogin(phone, password).catch(err => {
        this.$api.msg('账号或密码错误');
        this.logining = false;
      });
      if (login.statusCode === 200) {
        console.log(login.data);
        const { info, token, authen } = login.data;
        if (authen && authen.condition == 1) {
          let obj = { userinfo: info, token: token, user: login.data };
          this.login(obj);
          this.logining = true;
          // 跳转首页
          uni.switchTab({
            url: '/pages/user/user'
          });
        } else {
          this.$api.msg('啊喔~你现在还不是校园大使~');
          this.logining = false;
        }
      } else {
        this.logining = false;
      }
    }
  }
};
</script>

<style lang="scss">
page {
  background: #fff;
}
.container {
  padding-top: 115px;
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #fff;
}
.wrapper {
  position: relative;
  z-index: 90;
  background: #fff;
  padding-bottom: 40upx;
}
.back-btn {
  position: absolute;
  left: 40upx;
  z-index: 9999;
  padding-top: var(--status-bar-height);
  top: 40upx;
  font-size: 40upx;
  color: $font-color-dark;
}
.left-top-sign {
  font-size: 120upx;
  color: $page-color-base;
  position: relative;
  left: -16upx;
}
.right-top-sign {
  position: absolute;
  top: 80upx;
  right: -30upx;
  z-index: 95;
  &:before,
  &:after {
    display: block;
    content: '';
    width: 400upx;
    height: 80upx;
    background: #b4f3e2;
  }
  &:before {
    transform: rotate(50deg);
    border-radius: 0 50px 0 0;
  }
  &:after {
    position: absolute;
    right: -198upx;
    top: 0;
    transform: rotate(-50deg);
    border-radius: 50px 0 0 0;
    /* background: pink; */
  }
}
.left-bottom-sign {
  position: absolute;
  left: -270upx;
  bottom: -320upx;
  border: 100upx solid #d0d1fd;
  border-radius: 50%;
  padding: 180upx;
}
.welcome {
  position: relative;
  left: 50upx;
  top: -90upx;
  font-size: 46upx;
  color: #555;
  text-shadow: 1px 0px 1px rgba(0, 0, 0, 0.3);
}
.input-content {
  padding: 0 60upx;
}
.input-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  padding: 0 30upx;
  background: $page-color-light;
  height: 120upx;
  border-radius: 4px;
  margin-bottom: 50upx;
  &:last-child {
    margin-bottom: 0;
  }
  .tit {
    height: 50upx;
    line-height: 56upx;
    font-size: $font-sm + 2upx;
    color: $font-color-base;
  }
  input {
    height: 60upx;
    font-size: $font-base + 2upx;
    color: $font-color-dark;
    width: 100%;
  }
}

.confirm-btn {
  width: 630upx;
  height: 76upx;
  line-height: 76upx;
  border-radius: 50px;
  margin-top: 70upx;
  background: $uni-color-primary;
  color: #fff;
  font-size: $font-lg;
  &:after {
    border-radius: 100px;
  }
}
.forget-section {
  font-size: $font-sm + 2upx;
  color: $font-color-spec;
  text-align: center;
  margin-top: 40upx;
}
.register-section {
  position: absolute;
  left: 0;
  bottom: 50upx;
  width: 100%;
  font-size: $font-sm + 2upx;
  color: $font-color-base;
  text-align: center;
  text {
    color: $font-color-spec;
    margin-left: 10upx;
  }
}
</style>

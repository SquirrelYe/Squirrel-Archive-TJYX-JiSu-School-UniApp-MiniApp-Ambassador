<template>
	<view class="container">
		<view class="user-section">
			<image class="bg" src="/static/user/back.jpg"></image>
			<view class="user-info-box" @click="navTo('/pages/set/set')">
				<view class="portrait-box"><image class="portrait" :src="userInfo.avatarUrl || '/static/missing-face.png'"></image></view>
				<view class="info-box">
					<text class="username">{{ userInfo.nickName || '游客' }}</text>
				</view>
			</view>
			<view class="vip-card-box">
				<image class="card-bg" src="/static/vip-card-bg.png" mode="aspectFit"></image>
				<view class="b-btn">校园大使</view>
				<view class="tit">
					<text class="yticon icon-iLinkapp-"></text>
					校园大使
				</view>
				<text class="e-m">校园大使俱乐部</text>
				<text class="e-b">闲暇时间兼职，服务老师同学</text>
			</view>
		</view>

		<view
			class="cover-container"
			:style="[
				{
					transform: coverTransform,
					transition: coverTransition
				}
			]" @touchstart="coverTouchstart" @touchmove="coverTouchmove" @touchend="coverTouchend" >
			<image class="arc" src="/static/arc.png"></image>
			<view class="tj-sction">
				<view class="tj-item">
					<text class="num">{{ stock.money || 0 }}</text>
					<text>余额</text>
				</view>
				<view class="tj-item">
					<text class="num">{{  ticketCount || 0 }}</text>
					<text>优惠券</text>
				</view>
				<view class="tj-item">
					<text class="num">{{ stock.score || 0 }}</text>
					<text>积分</text>
				</view>
			</view>
			<!-- 浏览历史 -->
			<view class="history-section icon">
				<list-cell icon="icon-xingxing" iconColor="#e07472" title="我的订单" @eventClick="navTo('/pages/order/order?state=0')" tips="你都干了啥"></list-cell>
				<list-cell icon="icon-iconfontweixin" iconColor="#e07472" title="我的钱包" @eventClick="navTo('/pages/user/wallet/wallet')" tips="你的小金库"></list-cell>
				<list-cell icon="icon-share" iconColor="#9789f7" open-type="share" title="分享" tips="人人为我，我为人人" @eventClick="share()"></list-cell>
				<list-cell icon="icon-shezhi1" iconColor="#e07472" title="设置" @eventClick="navTo('/pages/set/set')"></list-cell>
				<list-cell icon="icon-bangzhu" iconColor="#54b4ef" title="联系客服" @eventClick="call()" border=""></list-cell>
			</view>
		</view>
	</view>
</template>
<script>
import listCell from '@/components/mix-list-cell';
import { mapState } from 'vuex';
let startY = 0, moveY = 0, pageAtTop = true;
export default {
	components: { listCell },
	data() {
		return {
			host:null,
			stock:{},
			ticketCount:0,
			coverTransform: 'translateY(0px)',
			coverTransition: '0s',
			moving: false
		};
	},
	computed: { ...mapState(['hasLogin', 'userInfo', 'user']) },
	onLoad() { this.host = this.$host  },
	onShow() { this.getStock(); this.getTicket() },
	// #ifndef MP
	onNavigationBarButtonTap(e) {
		const index = e.index;
		if (index === 0) { this.navTo('/pages/set/set'); } else if (index === 1) {
			// #ifdef APP-PLUS
			const pages = getCurrentPages();
			const page = pages[pages.length - 1];
			const currentWebview = page.$getAppWebview();
			currentWebview.hideTitleNViewButtonRedDot({
				index
			});
			// #endif
			uni.navigateTo({ url: '/pages/notice/notice' });
		}
	},
	// #endif
	methods: {
		// 获取资金信息
		getStock(){ this.$apis.stock.findByUserId(this.user.id).then(res=>{ console.log('账户资金信息',res.data); this.stock = res.data }) },
		// 获取优惠券信息
		async getTicket(){
			let tic = await this.$apis.uticket.findAndCountAllByUser(this.user.id,0,100)
			this.ticketCount = tic.data.count
		},
		/**
		 * 统一跳转接口,拦截未登录路由
		 * navigator标签现在默认没有转场动画，所以用view
		 */
		navTo(url) {
			if (!this.hasLogin)  url = '/pages/public/login'; 
			uni.navigateTo({ url });
		},
		// 分享
		share() {
			console.log('share');
			uni.showToast({
				title: '分享',
				duration: 2000
			});
		},
		call() {
			uni.makePhoneCall({
				phoneNumber: '13370386527' //仅为示例
			});
		},

		/**
		 *  会员卡下拉和回弹
		 *  1.关闭bounce避免ios端下拉冲突
		 *  2.由于touchmove事件的缺陷（以前做小程序就遇到，比如20跳到40，h5反而好很多），下拉的时候会有掉帧的感觉
		 *    transition设置0.1秒延迟，让css来过渡这段空窗期
		 *  3.回弹效果可修改曲线值来调整效果，推荐一个好用的bezier生成工具 http://cubic-bezier.com/
		 */
		coverTouchstart(e) {
			if (pageAtTop === false) {
				return;
			}
			this.coverTransition = 'transform .1s linear';
			startY = e.touches[0].clientY;
		},
		coverTouchmove(e) {
			moveY = e.touches[0].clientY;
			let moveDistance = moveY - startY;
			if (moveDistance < 0) {
				this.moving = false;
				return;
			}
			this.moving = true;
			if (moveDistance >= 80 && moveDistance < 100) {
				moveDistance = 80;
			}

			if (moveDistance > 0 && moveDistance <= 80) {
				this.coverTransform = `translateY(${moveDistance}px)`;
			}
		},
		coverTouchend() {
			if (this.moving === false) {
				return;
			}
			this.moving = false;
			this.coverTransition = 'transform 0.3s cubic-bezier(.21,1.93,.53,.64)';
			this.coverTransform = 'translateY(0px)';
		}
	}
};
</script>
<style lang="scss">
page {
	background-color: $page-color-base;
	padding-bottom: 30upx;
}
%flex-center {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
}
%section {
	display: flex;
	justify-content: space-around;
	align-content: center;
	background: #fff;
	border-radius: 10upx;
}

.user-section {
	height: 520upx;
	padding: 100upx 30upx 0;
	position: relative;
	.bg {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		filter: blur(1px);
		opacity: 0.7;
	}
}
.user-info-box {
	height: 180upx;
	display: flex;
	align-items: center;
	position: relative;
	z-index: 1;
	.portrait {
		width: 130upx;
		height: 130upx;
		border: 5upx solid #fff;
		border-radius: 50%;
	}
	.username {
		font-size: $font-lg + 6upx;
		color: $font-color-dark;
		margin-left: 20upx;
	}
}

.vip-card-box {
	display: flex;
	flex-direction: column;
	color: #f7d680;
	height: 240upx;
	background: linear-gradient(left, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.8));
	border-radius: 16upx 16upx 0 0;
	overflow: hidden;
	position: relative;
	padding: 20upx 24upx;
	.card-bg {
		position: absolute;
		top: 20upx;
		right: 0;
		width: 380upx;
		height: 260upx;
	}
	.b-btn {
		position: absolute;
		right: 20upx;
		top: 16upx;
		width: 132upx;
		height: 40upx;
		text-align: center;
		line-height: 40upx;
		font-size: 22upx;
		color: #36343c;
		border-radius: 20px;
		background: linear-gradient(left, #f9e6af, #ffd465);
		z-index: 1;
	}
	.tit {
		font-size: $font-base + 2upx;
		color: #f7d680;
		margin-bottom: 28upx;
		.yticon {
			color: #f6e5a3;
			margin-right: 16upx;
		}
	}
	.e-b {
		font-size: $font-sm;
		color: #d8cba9;
		margin-top: 10upx;
	}
}
.cover-container {
	background: $page-color-base;
	margin-top: -150upx;
	padding: 0 30upx;
	position: relative;
	background: #f5f5f5;
	padding-bottom: 20upx;
	.arc {
		position: absolute;
		left: 0;
		top: -34upx;
		width: 100%;
		height: 36upx;
	}
}
.tj-sction {
	@extend %section;
	.tj-item {
		@extend %flex-center;
		flex-direction: column;
		height: 140upx;
		font-size: $font-sm;
		color: #75787d;
	}
	.num {
		font-size: $font-lg;
		color: $font-color-dark;
		margin-bottom: 8upx;
	}
}
.order-section {
	@extend %section;
	padding: 28upx 0;
	margin-top: 20upx;
	.order-item {
		@extend %flex-center;
		width: 120upx;
		height: 120upx;
		border-radius: 10upx;
		font-size: $font-sm;
		color: $font-color-dark;
	}
	.yticon {
		font-size: 48upx;
		margin-bottom: 18upx;
		color: #fa436a;
	}
	.icon-shouhoutuikuan {
		font-size: 44upx;
	}
}
.history-section {
	padding: 30upx 0 0;
	margin-top: 20upx;
	background: #fff;
	border-radius: 10upx;
	.sec-header {
		display: flex;
		align-items: center;
		font-size: $font-base;
		color: $font-color-dark;
		line-height: 40upx;
		margin-left: 30upx;
		.yticon {
			font-size: 44upx;
			color: #5eba8f;
			margin-right: 16upx;
			line-height: 40upx;
		}
	}
	.h-list {
		white-space: nowrap;
		padding: 30upx 30upx 0;
		image {
			display: inline-block;
			width: 160upx;
			height: 160upx;
			margin-right: 20upx;
			border-radius: 10upx;
		}
	}
}
</style>

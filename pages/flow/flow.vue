<template>
	<view>
		<!-- 空白页 -->
		<view v-if="!hasLogin" class="empty">
			<!-- <image src="/static/emptyCart.jpg" mode="aspectFit"></image> -->
			<view class="empty-tips">
				空空如也喔~
				<view class="navigator" @click="navToLogin">去登陆></view>
			</view>
		</view>
		<view class="content" v-if="hasLogin">
			<view class="navbar" :style="{ position: headerPosition, top: headerTop }">
				<view class="nav-item" :class="{ current: filterIndex === -1 }" @click="tabClick(-1)">快递代取</view>
				<view class="nav-item" :class="{ current: filterIndex === 0 }" @click="tabClick(0)">快递代发</view>
				<view class="nav-item" :class="{ current: filterIndex === 1 }" @click="tabClick(1)">线上开卡</view>
			</view>
			<!-- 快递带取单元 -->
			<view class="goods-list" v-if="filterIndex == -1">
				<view v-for="(item, index) in logisticList" :key="index" class="goods-item" @click="confirm(-1,item)">
					<view class="image-wrapper">
						<image :src="item.cus.info.avatarUrl" lazy-load mode="scaleToFill"></image>
						<view class="cover" v-if="item.condition != 0"> 已被接单 </view>
					</view>
					<text class="text-xs item-center">取件地址: {{item.from}}</text>
					<text class="text-xs item-center">送货地址：{{item.location.dom}}</text>
					<view class="price-box">
						<text>{{item.cus.info.nickName}}</text>
						<text>￥ {{item.money}}</text>
					</view>
				</view>
			</view>
			<!-- 快递代发单元 -->		
			<view class="goods-list" v-if="filterIndex == 0">
				<view v-for="(item, index) in lsendList" :key="index" class="goods-item" @click="confirm(0,item)">
					<view class="image-wrapper">
						<image :src="item.cus.info.avatarUrl"  lazy-load mode="scaleToFill"></image>
						<view class="cover" v-if="item.condition != 0"> 已被接单 </view>
					</view>
					<text class="text-xs item-center">取件地址：{{item.location.dom}}</text>
					<view class="price-box">
						<text>{{item.cus.info.nickName}}</text>
						<text>上门取件</text>
					</view>
				</view>
			</view>
			<!-- 线上开卡单元 -->			
			<view class="goods-list" v-if="filterIndex == 1">
				<view v-for="(item, index) in cardList" :key="index" class="goods-item" @click="confirm(1,item)">
					<view class="image-wrapper">
						<image src="../../static/card.png" style="width: 33%;height: 120upx;margin-top: 65upx;margin-left: 33%;" lazy-load mode="scaleToFill"></image>
						<view class="cover" v-if="item.condition != 0"> 已被接单 </view>
					</view>
					<text class="text-xs item-center">联系电话：{{item.phone}}</text>
					<text class="text-xs item-center">宿舍地址：{{item.dom}}</text>
					<view class="price-box">
						<text>{{item.name}}</text>
						<text>￥ {{item.price}}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import uniLoadMore from '@/components/uni-load-more/uni-load-more.vue';
import { mapState } from 'vuex';
export default {
	components: { uniLoadMore },
	data() {
		return {
			headerPosition: 'fixed',
			headerTop: '0px',
			loadingType: 'more', //加载更多状态
			filterIndex: -1,
			logisticList: [],
			lsendList: [],
			cardList: [],
			// 分页
			off:0,
			lim:10
		};
	},
	computed: { ...mapState(['hasLogin','user']) },
	onLoad(options) { }, // this.init(0); 
	onShow() { console.log('onshow-->'),this.init(0); },
	onPageScroll(e) {
		//兼容iOS端下拉时顶部漂移
		if (e.scrollTop >= 0) this.headerPosition = 'fixed'; 
		else this.headerPosition = 'absolute'; 
	},
	onPullDownRefresh() {
		this.off = 0; this.lim = 10;
		this.init(1)
	},
	onReachBottom() {
		let add = this.lim
		this.off += add; this.lim += add;
		console.log(this.off,this.lim)
		this.init(2)
		uni.showLoading({ title:'加载中^_^' })
	},
	methods: {
		// 初始化页面  judge { 0.初始化、 1.下拉刷新、 2.上拉加载}
		async init(judge){
			const { school_id } = this.user
			console.log('单元定位',this.filterIndex)
			let res;
			// filterIndex -->  -1:快递代取, 0：快递代发, 1：线上开卡
			// 快递带取
			if(this.filterIndex === -1) {
				res = await this.$apis.logistic.findAllBySchool(school_id,this.off,this.lim);					
				console.log('快递代取--->',res.data);			
				if(judge === 0){ uni.hideLoading(); this.logisticList = res.data.rows; }
				if(judge === 1){ this.$api.msg('刷新成功'); uni.stopPullDownRefresh(); this.logisticList = res.data.rows; }
				if(judge === 2){
					if(res.data.rows.length != 0){
						// this.$api.msg('加载成功') 
						uni.hideLoading();
						this.logisticList = this.logisticList.concat(res.data.rows) ; 
						console.log(this.logisticList)
					}else this.$api.msg('没有更多啦~') 
				}
			}
			// 快递代发
			else if(this.filterIndex == 0){
				res = await this.$apis.lsend.findAllBySchool(school_id,this.off,this.lim);					
				console.log('快递代发--->',res.data);			
				if(judge === 0){ uni.hideLoading(); this.lsendList = res.data.rows; }
				if(judge === 1){ this.$api.msg('刷新成功'); uni.stopPullDownRefresh(); this.lsendList = res.data.rows; }
				if(judge === 2){
					if(res.data.rows.length != 0){
						// this.$api.msg('加载成功') 
						uni.hideLoading();
						this.lsendList = this.lsendList.concat(res.data.rows) ; 
						console.log(this.lsendList)
					}else this.$api.msg('没有更多啦~') 
				}
			}
			// 线上开卡
			else if(this.filterIndex == 1){
				res = await this.$apis.card.findAndCountAllBySchool(school_id,this.off,this.lim);					
				console.log('线上开卡--->',res.data);			
				if(judge === 0){ uni.hideLoading(); this.cardList = res.data.rows; }
				if(judge === 1){ this.$api.msg('刷新成功'); uni.stopPullDownRefresh(); this.cardList = res.data.rows; }
				if(judge === 2){
					if(res.data.rows.length != 0){
						// this.$api.msg('加载成功') 
						uni.hideLoading();
						this.cardList = this.cardList.concat(res.data.rows) ; 
						console.log(this.cardList)
					}else this.$api.msg('没有更多啦~') 
				}
			}else this.$api.msg('输入有误喔~');
		},
		//筛选点击
		tabClick(index) {
			if (this.filterIndex === index) return; 
			this.filterIndex = index;
			uni.pageScrollTo({
				duration: 300,
				scrollTop: 0
			});
			this.off = 0; this.lim = 10;
			uni.showLoading({ title: '正在加载' });
			this.init(0);
		},
		//详情
		async confirm(judge,item) {
			// 状态*（0.未接单、1.已接单、2.已取件、3.待送达、4.已完成、-1.订单取消）
			console.log('judge -->',judge,'item--->',item)
			const { id,condition } = item;
			if(condition !== 0){ this.$api.msg('订单已被别人领取喔~'); return; };
			let res = await uni.showModal({
				title:'你确定接单吗^_^',
				content:'订单确认了就不能取消了哟~'
			})
			// 接单逻辑
			if(res[1].confirm){
				// 快递代取订单
				if(judge === -1){
					let log = await this.$apis.logistic.findOneById(id);
					if(log.data.condition !== 0) { this.$api.msg('订单已被其他人接单啦~'); this.init(0); return; };
					let up = await this.$apis.logistic.addTake(id,this.user.id,1);   // id,t,c
					console.log('绑定校园大使',up)	
					if(up.data[0] !== 1){ this.$api.msg('接单失败了~'); return; }
					else{
						this.$api.msg('接单成功喔^_^');
						this.init(0);
						// 重定向到订单页面
						
					}
				}
				// 快递代发
				if(judge === 0){
					let ls = await this.$apis.lsend.findOneById(id);
					if(ls.data.condition !== 0) { this.$api.msg('订单已被其他人接单啦~'); this.init(0); return; };
					let up = await this.$apis.lsend.addTake(id,this.user.id,1);   // id,t,c
					console.log('绑定校园大使',up)	
					if(up.data[0] !== 1){ this.$api.msg('接单失败了~'); return; }
					else{
						this.$api.msg('接单成功喔^_^');
						this.init(0);
						// 重定向到订单页面
						
					}
				}
				// 线上开卡
				if(judge === 1){
					let card = await this.$apis.card.findOneById(id);
					if(card.data.condition !== 0) { this.$api.msg('订单已被其他人接单啦~'); this.init(0); return; };
					let up = await this.$apis.card.setTaken(id,this.user.id,1);   // id,t,c
					console.log('绑定校园大使',up)	
					if(up.data[0] !== 1){ this.$api.msg('接单失败了~'); return; }
					else{
						this.$api.msg('接单成功喔^_^');
						this.init(0);
						// 重定向到订单页面
						
					}
				}
			}else return;
		},		
		// 登录
		navToLogin() { uni.navigateTo({ url: '/pages/public/login' }); },
	}
};
</script>

<style lang="scss">
page,
.content {
	background: $page-color-base;
}
.content {
	padding-top: 96upx;
}

/* 空白页 */
.empty {
	position: fixed;
	left: 0;
	top: 0;
	width: 100%;
	height: 100vh;
	padding-bottom: 100upx;
	display: flex;
	justify-content: center;
	flex-direction: column;
	align-items: center;
	background: #fff;
	image {
		width: 240upx;
		height: 160upx;
		margin-bottom: 30upx;
	}
	.empty-tips {
		display: flex;
		font-size: $font-sm + 2upx;
		color: $font-color-disabled;
		.navigator {
			color: $uni-color-primary;
			margin-left: 16upx;
		}
	}
}
.navbar {
	position: fixed;
	left: 0;
	top: var(--window-top);
	display: flex;
	width: 100%;
	height: 80upx;
	background: #fff;
	box-shadow: 0 2upx 10upx rgba(0, 0, 0, 0.06);
	z-index: 10;
	.nav-item {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		font-size: 30upx;
		color: $font-color-dark;
		position: relative;
		&.current {
			color: $base-color;
			&:after {
				content: '';
				position: absolute;
				left: 50%;
				bottom: 0;
				transform: translateX(-50%);
				width: 120upx;
				height: 0;
				border-bottom: 4upx solid $base-color;
			}
		}
	}
	.p-box {
		display: flex;
		flex-direction: column;
		.yticon {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 30upx;
			height: 14upx;
			line-height: 1;
			margin-left: 4upx;
			font-size: 26upx;
			color: #888;
			&.active {
				color: $base-color;
			}
		}
		.xia {
			transform: scaleY(-1);
		}
	}
	.cate-item {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		width: 80upx;
		position: relative;
		font-size: 44upx;
		&:after {
			content: '';
			position: absolute;
			left: 0;
			top: 50%;
			transform: translateY(-50%);
			border-left: 1px solid #ddd;
			width: 0;
			height: 36upx;
		}
	}
}

/* 商品列表 */
.goods-list {
	display: flex;
	flex-wrap: wrap;
	padding: 0 30upx;
	background: #fff;
	.goods-item {
		display: flex;
		flex-direction: column;
		width: 48%;
		padding-bottom: 40upx;
		&:nth-child(2n + 1) {
			margin-right: 4%;
		}
	}
	.image-wrapper {
		width: 100%;
		height: 250upx;
		border-radius: 10px;
		overflow: hidden;
		position: relative;
		background-color: #fff;
		image {
			margin-top: 25upx;
			margin-left: 20%;
			width: 60%;
			height: 200upx;
			opacity: 1;
			background-color: #fff
		}
	}
	// .card-icon{
	// 	background-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNTYyNDA3MzQwMDEwIiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjE0ODIiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCI+PGRlZnM+PHN0eWxlIHR5cGU9InRleHQvY3NzIj48L3N0eWxlPjwvZGVmcz48cGF0aCBkPSJNNTIxLjE1MiA1MTEuOTM2bS00MTYgMGE0MTYgNDE2IDAgMSAwIDgzMiAwIDQxNiA0MTYgMCAxIDAtODMyIDBaIiBmaWxsPSIjQUVFQ0ZGIiBwLWlkPSIxNDgzIj48L3BhdGg+PHBhdGggZD0iTTgwNC45OTIgNzA3Ljg0YzAgMTIuMjg4LTEwLjA0OCAyMi40LTIyLjQgMjIuNEgyOTMuODg4YTIyLjQ2NCAyMi40NjQgMCAwIDEtMjIuNC0yMi40VjQyNy4yNjRjMC0xMi4yODggMTAuMTEyLTIyLjQgMjIuNC0yMi40aDQ4OC43MDRjMTIuMjg4IDAgMjIuNCAxMC4xMTIgMjIuNCAyMi40djI4MC41NzZ6IiBmaWxsPSIjRTNCRjIwIiBwLWlkPSIxNDg0Ij48L3BhdGg+PHBhdGggZD0iTTc2OS4yMTYgNzQxLjUwNGMwIDEyLjI4OC0xMC4wNDggMjIuNC0yMi40IDIyLjRIMjU4LjExMmEyMi40NjQgMjIuNDY0IDAgMCAxLTIyLjQtMjIuNFY0NjAuOTkyYzAtMTIuMjg4IDEwLjExMi0yMi40IDIyLjQtMjIuNGg0ODguNzA0YzEyLjI4OCAwIDIyLjQgMTAuMTEyIDIyLjQgMjIuNHYyODAuNTEyeiIgZmlsbD0iI0VGNTc1NiIgcC1pZD0iMTQ4NSI+PC9wYXRoPjxwYXRoIGQ9Ik05OTUuMzI4IDQwMi40MzJhMjIuNCAyMi40IDAgMCAxLTMuNzc2IDMxLjQyNEw1NjQuNDggNzcwLjM2OGEyMi40IDIyLjQgMCAwIDEtMzEuNDI0LTMuNzc2TDMxNi4yMjQgNDkxLjQ1NkEyMi40IDIyLjQgMCAwIDEgMzIwIDQ2MC4wMzJsNDI3LjAwOC0zMzYuNTEyYTIyLjQ2NCAyMi40NjQgMCAwIDEgMzEuNDg4IDMuNzc2bDIxNi44MzIgMjc1LjEzNnoiIGZpbGw9IiM2N0NCRkYiIHAtaWQ9IjE0ODYiPjwvcGF0aD48cGF0aCBkPSJNMzMxLjM5MiA1MTAuNzJsNDYyLjMzNi0zNjQuMjg4IDU1LjgwOCA3MC45MTItNDYyLjI3MiAzNjQuMTZ6IiBmaWxsPSIjNEU0RTRFIiBwLWlkPSIxNDg3Ij48L3BhdGg+PHBhdGggZD0iTTQyOC42MDggNTg4LjA5NmwyNTEuMzI4LTE5OC4wMTYgNDQuNjA4IDU2LjU3Ni0yNTEuMzkyIDE5OC4wMTZ6IiBmaWxsPSIjRkZGRkZGIiBwLWlkPSIxNDg4Ij48L3BhdGg+PHBhdGggZD0iTTkxMiAzMzkuNzEyYTE2IDE2IDAgMCAxLTIuNjg4IDIyLjQ2NGwtMTExLjA0IDg3LjQ4OGExNiAxNiAwIDAgMS0yMi40NjQtMi42ODhsLTU0LjY1Ni02OS4yNDhhMTYgMTYgMCAwIDEgMi42ODgtMjIuNDY0bDExMS4wNC04Ny40ODhhMTYgMTYgMCAwIDEgMjIuNDY0IDIuNjg4bDU0LjY1NiA2OS4yNDh6IiBmaWxsPSIjRDNDQzRDIiBwLWlkPSIxNDg5Ij48L3BhdGg+PHBhdGggZD0iTTgyOC4xNiAyNzMuMDg4bDcuNjE2LTUuODg4IDc0LjE3NiA5NC40NjQtNy41NTIgNS45NTJ6TTcyMy4zOTIgMzU1LjcxMmw3LjU1Mi01Ljk1MiA3NC4xNzYgOTQuNDY0LTcuNTUyIDUuOTUyeiIgZmlsbD0iIzRFNEU0RSIgcC1pZD0iMTQ5MCI+PC9wYXRoPjxwYXRoIGQ9Ik03NDAuMjg4IDM2MS43OTJsOTcuMjgtNzYuNjcyIDYuMDE2IDcuNTUyLTk3LjI4IDc2LjY3MnpNNzkxLjA0IDQyNi4xNzZsOTcuMjgtNzYuNjcyIDUuOTUyIDcuNjE2LTk3LjI4IDc2LjYwOHpNNzMzLjYzMiAzOTMuNDA4TDc0NS42IDM4NGwzLjM5MiA0LjI4OC0xMi4wMzIgOS40NzJ6TTc0Ni44MTYgNDEwLjI0bDEyLjAzMi05LjQ3MiAzLjM5MiA0LjI4OC0xMi4wMzIgOS40NzJ6TTc2MCA0MjYuODhsMTEuOTY4LTkuNDA4IDMuNDU2IDQuMjg4LTEyLjAzMiA5LjQ3MnpNODU3Ljk4NCAyOTUuNDI0bDExLjk2OC05LjQwOCAzLjQ1NiA0LjM1Mi0xMS45NjggOS40MDh6TTg3MS4yOTYgMzEyLjE5MmwxMS45MDQtOS40NzIgMy40NTYgNC4yODgtMTEuOTY4IDkuNDcyek04ODQuNDggMzI4Ljk2bDExLjkwNC05LjQ3MiAzLjQ1NiA0LjI4OC0xMS45NjggOS40NzJ6IiBmaWxsPSIjNEU0RTRFIiBwLWlkPSIxNDkxIj48L3BhdGg+PHBhdGggZD0iTTg2OC4wMzIgNTM3LjAyNGMwLTI4LjE2LTIzLjA0LTUxLjItNTEuMi01MS4ySDIyNC45NmMtMjguMTYgMC01MS4yIDIzLjA0LTUxLjIgNTEuMnYyMDMuNjQ4YTQxNS41NTIgNDE1LjU1MiAwIDAgMCA2OTQuMjA4IDAuNzY4VjUzNy4wMjR6IiBmaWxsPSIjN0M0MzM4IiBwLWlkPSIxNDkyIj48L3BhdGg+PHBhdGggZD0iTTQ0NS4xODQgNDg2LjAxNnMxMS43MTIgMTguODggMTMuNDQgMjUuOTg0YzguNTEyIDM1LjM5Mi0wLjY0IDE0NS42NjQtMC42NCAxNDUuNjY0IDAgMTIuMjg4IDEwLjExMiAyMi40IDIyLjQgMjIuNGg3NS4yYzEyLjI4OCAwIDIyLjQtMTAuMDQ4IDIyLjQtMjIuNCAwIDAgOS4xNTItMTEwLjI3MiAwLjY0LTE0NS42NjQtMS42NjQtNy4xMDQtMTMuNDQtMjUuOTg0LTEzLjQ0LTI1Ljk4NEg0NDUuMTg0eiIgZmlsbD0iI0E4ODI4MCIgcC1pZD0iMTQ5MyI+PC9wYXRoPjxwYXRoIGQ9Ik01MjEuMTUyIDYzMm0tMzcuMjQ4IDBhMzcuMjQ4IDM3LjI0OCAwIDEgMCA3NC40OTYgMCAzNy4yNDggMzcuMjQ4IDAgMSAwLTc0LjQ5NiAwWiIgZmlsbD0iIzRCNEI0QiIgcC1pZD0iMTQ5NCI+PC9wYXRoPjxwYXRoIGQ9Ik01MjEuMTUyIDYzMm0tMzAuODQ4IDBhMzAuODQ4IDMwLjg0OCAwIDEgMCA2MS42OTYgMCAzMC44NDggMzAuODQ4IDAgMSAwLTYxLjY5NiAwWiIgZmlsbD0iIzU5NTk1OSIgcC1pZD0iMTQ5NSI+PC9wYXRoPjxwYXRoIGQ9Ik01MjEuMTUyIDYzMm0tMTcuMDg4IDBhMTcuMDg4IDE3LjA4OCAwIDEgMCAzNC4xNzYgMCAxNy4wODggMTcuMDg4IDAgMSAwLTM0LjE3NiAwWiIgZmlsbD0iIzRCNEI0QiIgcC1pZD0iMTQ5NiI+PC9wYXRoPjxwYXRoIGQ9Ik0yMDguODk2IDUzMS4zMjhjMCAxLjc5MiAxLjQ3MiAzLjI2NCAzLjI2NCAzLjI2NHMzLjI2NC0xLjQ3MiAzLjI2NC0zLjI2NHYtMy44NGgxNS44NzJjMS43OTIgMCAzLjI2NC0xLjQ3MiAzLjI2NC0zLjI2NHMtMS40MDgtMy4yNjQtMy4yLTMuMjY0aC0yMi40NjR2MTAuMzY4ek0yMTUuNDg4IDc2Ny45MzZjMC0xLjc5Mi0xLjQ3Mi0zLjMyOC0zLjI2NC0zLjMyOHMtMy4yNjQgMS40NzItMy4yNjQgMy4zMjh2MTguMzA0bDYuNTkyIDcuMjMydi0yNS41MzZ6TTIwOC44OTYgNzE1LjM5MnYyNi4zMDRjMCAxLjc5MiAxLjQ3MiAzLjMyOCAzLjI2NCAzLjMyOHMzLjI2NC0xLjQ3MiAzLjI2NC0zLjMyOHYtMjYuMzA0YzAtMS43OTItMS40NzItMy4zMjgtMy4yNjQtMy4zMjhzLTMuMjY0IDEuNDcyLTMuMjY0IDMuMzI4ek0yMTUuNDg4IDYxMC4xNzZjMC0xLjc5Mi0xLjQ3Mi0zLjMyOC0zLjI2NC0zLjMyOHMtMy4zMjggMS41MzYtMy4zMjggMy4zMjh2MjYuMzA0YzAgMS43OTIgMS40NzIgMy4zMjggMy4yNjQgMy4zMjhzMy4yNjQtMS40NzIgMy4yNjQtMy4zMjh2LTI2LjMwNHpNMjE1LjQ4OCA1NTcuNjMyYzAtMS43OTItMS40NzItMy4yNjQtMy4yNjQtMy4yNjRzLTMuMzI4IDEuNDcyLTMuMzI4IDMuMjY0djI2LjMwNGMwIDEuNzkyIDEuNDcyIDMuMzI4IDMuMjY0IDMuMzI4czMuMjY0LTEuNDcyIDMuMjY0LTMuMzI4di0yNi4zMDR6TTIxNS40ODggNjYyLjc4NGMwLTEuNzkyLTEuNDcyLTMuMzI4LTMuMjY0LTMuMzI4cy0zLjI2NCAxLjQ3Mi0zLjI2NCAzLjMyOHYyNi4yNGMwIDEuNzkyIDEuNDcyIDMuMzI4IDMuMjY0IDMuMzI4czMuMjY0LTEuNDcyIDMuMjY0LTMuMzI4di0yNi4yNHpNNDEyLjA5NiA1MjQuMjI0YzAgMS43OTIgMS40NzIgMy4yNjQgMy4yNjQgMy4yNjRoMjYuMzA0YzEuNzkyIDAgMy4yNjQtMS40NzIgMy4yNjQtMy4yNjRzLTEuNDA4LTMuMjY0LTMuMjY0LTMuMjY0SDQxNS4zNmEzLjI2NCAzLjI2NCAwIDAgMC0zLjI2NCAzLjI2NHpNMjU0LjQgNTI0LjIyNGMwIDEuNzkyIDEuNDcyIDMuMjY0IDMuMjY0IDMuMjY0aDI2LjMwNGMxLjc5MiAwIDMuMjY0LTEuNDcyIDMuMjY0LTMuMjY0cy0xLjQ3Mi0zLjI2NC0zLjI2NC0zLjI2NGgtMjYuMzA0YTMuMjY0IDMuMjY0IDAgMCAwLTMuMjY0IDMuMjY0ek00NjQuNzA0IDUyNC4yMjRjMCAxLjc5MiAxLjQ3MiAzLjI2NCAzLjI2NCAzLjI2NGgyNi4zMDRjMS43OTIgMCAzLjI2NC0xLjQ3MiAzLjI2NC0zLjI2NHMtMS40NzItMy4yNjQtMy4yNjQtMy4yNjRoLTI2LjMwNGEzLjI2NCAzLjI2NCAwIDAgMC0zLjI2NCAzLjI2NHpNNTUwLjE0NCA1MjQuMjI0YTMuMjY0IDMuMjY0IDAgMCAwLTMuMjY0LTMuMjY0aC0yNi4zMDRjLTEuNzkyIDAtMy4yNjQgMS40NzItMy4yNjQgMy4yNjRzMS40NzIgMy4yNjQgMy4yNjQgMy4yNjRoMjYuMzA0YTMuMjY0IDMuMjY0IDAgMCAwIDMuMjY0LTMuMjY0ek0zMDYuOTQ0IDUyNC4yMjRjMCAxLjc5MiAxLjQ3MiAzLjI2NCAzLjI2NCAzLjI2NGgyNi4zMDRjMS43OTIgMCAzLjI2NC0xLjQ3MiAzLjI2NC0zLjI2NHMtMS40NzItMy4yNjQtMy4yNjQtMy4yNjRoLTI2LjMwNGEzLjI2NCAzLjI2NCAwIDAgMC0zLjI2NCAzLjI2NHpNMzU5LjU1MiA1MjQuMjI0YzAgMS43OTIgMS40NzIgMy4yNjQgMy4yNjQgMy4yNjRoMjYuMzA0YzEuNzkyIDAgMy4yNjQtMS40NzIgMy4yNjQtMy4yNjRzLTEuNDcyLTMuMjY0LTMuMjY0LTMuMjY0aC0yNi4zMDRhMy4yNjQgMy4yNjQgMCAwIDAtMy4yNjQgMy4yNjR6TTgzMi45NiA2ODguMzg0YzAtMS43OTItMS40NzItMy4zMjgtMy4zMjgtMy4zMjhzLTMuMzI4IDEuNDcyLTMuMzI4IDMuMzI4djI2LjMwNGMwIDEuNzkyIDEuNDcyIDMuMzI4IDMuMzI4IDMuMzI4czMuMzI4LTEuNDcyIDMuMzI4LTMuMzI4di0yNi4zMDR6TTgyNi4zMDQgNzQwLjkyOHYyNi4zMDRjMCAxLjc5MiAxLjQ3MiAzLjMyOCAzLjMyOCAzLjMyOHMzLjMyOC0xLjQ3MiAzLjMyOC0zLjMyOHYtMjYuMzA0YzAtMS43OTItMS40NzItMy4zMjgtMy4zMjgtMy4zMjhzLTMuMzI4IDEuNTM2LTMuMzI4IDMuMzI4ek04MzIuOTYgNjM1Ljg0YzAtMS43OTItMS40NzItMy4zMjgtMy4zMjgtMy4zMjhzLTMuMzI4IDEuNDcyLTMuMzI4IDMuMzI4djI2LjI0YzAgMS43OTIgMS40NzIgMy4zMjggMy4zMjggMy4zMjhzMy4zMjgtMS40NzIgMy4zMjgtMy4zMjh2LTI2LjI0ek04MzIuOTYgNTgzLjE2OGMwLTEuNzkyLTEuNDcyLTMuMzI4LTMuMzI4LTMuMzI4cy0zLjMyOCAxLjQ3Mi0zLjMyOCAzLjMyOHYyNi4zMDRjMCAxLjc5MiAxLjQ3MiAzLjMyOCAzLjMyOCAzLjMyOHMzLjMyOC0xLjQ3MiAzLjMyOC0zLjMyOHYtMjYuMzA0ek04MzIuOTYgNTMwLjYyNGMwLTEuNzkyLTEuNDcyLTMuMjY0LTMuMzI4LTMuMjY0cy0zLjMyOCAxLjQ3Mi0zLjMyOCAzLjI2NHYyNi4zMDRjMCAxLjc5MiAxLjQ3MiAzLjI2NCAzLjMyOCAzLjI2NHMzLjMyOC0xLjQ3MiAzLjMyOC0zLjI2NHYtMjYuMzA0ek01NjkuODU2IDUyNC4yMjRjMCAxLjc5MiAxLjQ3MiAzLjI2NCAzLjI2NCAzLjI2NGgyNi4zMDRjMS43OTIgMCAzLjMyOC0xLjQ3MiAzLjMyOC0zLjI2NHMtMS40NzItMy4yNjQtMy4zMjgtMy4yNjRoLTI2LjMwNGEzLjI2NCAzLjI2NCAwIDAgMC0zLjI2NCAzLjI2NHpNNzI3LjU1MiA1MjQuMjI0YzAgMS43OTIgMS40NzIgMy4yNjQgMy4zMjggMy4yNjRoMjYuMzA0YzEuNzkyIDAgMy4zMjgtMS40NzIgMy4zMjgtMy4yNjRzLTEuNTM2LTMuMjY0LTMuMzI4LTMuMjY0aC0yNi4zMDRhMy4zMjggMy4zMjggMCAwIDAtMy4zMjggMy4yNjR6TTY3NS4wMDggNTI0LjIyNGMwIDEuNzkyIDEuNDcyIDMuMjY0IDMuMzI4IDMuMjY0aDI2LjI0YzEuNzkyIDAgMy4zMjgtMS40NzIgMy4zMjgtMy4yNjRzLTEuNTM2LTMuMjY0LTMuMzI4LTMuMjY0aC0yNi4yNGEzLjI2NCAzLjI2NCAwIDAgMC0zLjMyOCAzLjI2NHpNNjIyLjQgNTI0LjIyNGMwIDEuNzkyIDEuNDcyIDMuMjY0IDMuMzI4IDMuMjY0aDI2LjMwNGMxLjc5MiAwIDMuMzI4LTEuNDcyIDMuMzI4LTMuMjY0cy0xLjUzNi0zLjI2NC0zLjMyOC0zLjI2NGgtMjYuMzY4YTMuMjY0IDMuMjY0IDAgMCAwLTMuMjY0IDMuMjY0ek03ODAuMDk2IDUyNC4yMjRjMCAxLjc5MiAxLjQ3MiAzLjI2NCAzLjMyOCAzLjI2NGgyNi4zMDRjMS43OTIgMCAzLjMyOC0xLjQ3MiAzLjMyOC0zLjI2NHMtMS40NzItMy4yNjQtMy4zMjgtMy4yNjRoLTI2LjMwNGEzLjMyOCAzLjMyOCAwIDAgMC0zLjMyOCAzLjI2NHpNODI5LjYzMiA3OTAuMjcyYTMuMzI4IDMuMzI4IDAgMCAwLTMuMzI4IDMuMzI4djAuNDQ4bDMuMzI4LTMuNzc2YzAgMC4wNjQgMCAwIDAgMHoiIGZpbGw9IiM0OTFGMTIiIHAtaWQ9IjE0OTciPjwvcGF0aD48L3N2Zz4=')
	// }
	.cover {
		display: flex;
		justify-content: center;
		align-items: center;
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, .5);
		font-size: 36upx;
		color: #fff;
	}
	.title {
		font-size: $font-lg;
		color: $font-color-dark;
		line-height: 80upx;
	}
	.item-center{
		display: flex;
		justify-content: center
	}
	.price-box {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-right: 10upx;
		font-size: 24upx;
		color: $font-color-light;
	}
	.price {
		font-size: $font-lg;
		color: $font-color-dark;
		line-height: 1;
	}
}
</style>

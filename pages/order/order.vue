<template>
	<view class="content">
		<view class="navbar">
			<view v-for="(item, index) in navList" :key="index" class="nav-item" :class="{ current: tabCurrentIndex == index }" @click="tabClick(index)">{{ item.text }}</view>
		</view>

		<swiper :current="tabCurrentIndex" class="swiper-box" duration="300" @change="changeTab">
			<swiper-item class="tab-content" v-for="(tabItem, tabIndex) in navList" :key="tabIndex">
				<scroll-view class="list-scroll-content" scroll-y @scrolltolower="getMore()">
					<!-- 空白页 -->
					<empty v-if="tabItem.loaded === true"></empty>
					<!-- 订单列表  @scrolltolower="loadData"-->
					<view v-for="(item, index) in tabItem.orderList" :key="index" class="order-item">
						<view class="i-top b-b">
							<text class="time">{{ item.date }}</text>
							<text class="state" :style="{ color: item.stateTipColor }">{{ item.stateTip }}</text>
						</view>
						<!-- 快递代取 -->
						<block v-if="tabCurrentIndex == 0">
							<view class="goods-box-single" @click="enter(0,item)">
								<image class="goods-img" lazy-load :src="item.cus.info.avatarUrl" mode="aspectFill"></image>
								<view class="right">
									<text class="title clamp">快递代取</text>
									<text class="attr-box">{{item.location.dom }} {{item.location.name }}</text>
									<text class="price">{{ item.money }}</text>
								</view>
							</view>
							<view class="price-box">
								共 <text class="num">1</text> 件商品 实付款 <text class="price">{{ item.money }}</text>
							</view>
							<view class="action-box b-t" >
								<button class="action-btn" @click="call(item.location.phone)">联系同学</button>
								<button class="action-btn recom" v-if="item.condition == 1" @click="updateLog(item,2)">确认取件</button>
								<button class="action-btn recom" v-if="item.condition == 2" @click="updateLog(item,3)">准备派送</button>
								<button class="action-btn recom" v-if="item.condition == 3" @click="updateLog(item,4)">确认送达</button>
							</view>
						</block>
						<!-- 快递代发 -->
						<block v-if="tabCurrentIndex == 1">
							<view class="goods-box-single" @click="enter(1,item)">
								<image class="goods-img" lazy-load :src="item.cus.info.avatarUrl" mode="aspectFill"></image>
								<view class="right">
									<text class="title clamp">快递代发</text>
									<text class="attr-box">{{item.location.dom }} {{item.location.name }}</text>
									<text class="price" v-if="item.money">{{ item.money }}</text>
								</view>
							</view>
							<view class="price-box" v-if="item.money">
								物品重量 <text class="weight">{{ item.weight }}kg</text>
								订单价格 <text class="price">{{ item.money }}</text>
							</view>
							<view class="action-box b-t" >
								<button class="action-btn" @click="call(item.location.phone)">联系同学</button>
								<button class="action-btn recom" v-if="item.condition == 1" @click="updateLsend(item,2)">确认取件</button>
								<button class="action-btn recom" v-if="item.condition == 1 && item.weight == null" @click="updateLsend(item,-1)">填写信息</button>
								<button class="action-btn recom" v-if="item.condition == 2" @click="updateLsend(item,3)">确认送达</button>
							</view>
						</block>
						<!-- 线上开卡 -->
						<block v-if="tabCurrentIndex == 2">
							<view class="goods-box-single" @click="enter(2,item)">
								<image class="goods-img" lazy-load :src="card" mode="aspectFill"></image>
								<view class="right">
									<text class="title clamp">线上开卡</text>
									<text class="attr-box">{{item.dom }} {{item.name }}</text>
									<text class="attr-box">{{ item.phone }}</text>
								</view>
							</view>
							<!-- <view class="price-box">
								共 <text class="num">1</text> 件商品 实付款 <text class="price">{{ item.price }}</text>
							</view> -->
							<view class="action-box b-t" >
								<button class="action-btn" @click="call(item.phone)">联系同学</button>
								<button class="action-btn recom" v-if="item.condition == 1" @click="updateCard(item,2)">确认开卡</button>
							</view>
						</block>
					</view>	
					<uni-load-more :status="tabItem.loadingType"></uni-load-more>
				</scroll-view>
			</swiper-item>
		</swiper>
		
		<!-- 填写信息 -->
		<view class="cu-modal bottom-modal" :class="modalName=='ChooseModal'?'show':''"  @tap="hideModal">
			<view class="cu-dialog" @tap.stop="">
				<view class="cu-bar bg-white">
					<view class="action text-blue" @tap="hideModal">取消</view>
					<view class="action text-green" @tap="choose">确定</view>
				</view>
				<view class="content">
					<view class="row b-b">
						<text class="tit">重量</text>
						<input class="input" type="digit" v-model="weight" placeholder="请输入物品重量~" placeholder-class="placeholder text-sm" />
					</view>
					<view class="row b-b">
						<text class="tit">价格</text>
						<input class="input" type="digit" v-model="money" placeholder="请输入快递价格^_^" placeholder-class="placeholder text-sm" />
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import uniLoadMore from '@/components/uni-load-more/uni-load-more.vue';
import conf from '@/utils/config'
import empty from "@/components/empty";
import { mapState } from 'vuex';
export default {
	components: { uniLoadMore, empty },
	data() {
		return {
			tabCurrentIndex: 0,
			navList: [
				{ state: 0, text: '快递带取', loadingType: 'more', orderList: [] },
				{ state: 1, text: '快递代发', loadingType: 'more', orderList: [] },
				{ state: 2, text: '线上开卡', loadingType: 'more', orderList: [] }
			],
			host:'',
			card:'../../static/card.png',
			// 分页数据
			off:0,
			lim:10,			
			
			modalName: null,
			clsend:{},
			weight:null,
			money:null
		};
	},
	computed: { ...mapState(['user']) },
	onLoad(options) {
		this.host = this.$host
		this.tabCurrentIndex = options.state || 0;
		this.loadData(this.tabCurrentIndex,0);
	},
	onShow() {
		this.off = 0;
		this.loadData(this.tabCurrentIndex,3)
	},
	onPullDownRefresh() {
		this.off = 0; this.lim = 10;
		this.loadData(this.tabCurrentIndex,1)
	},
	methods: {
		init(){
			this.off = 0;
			this.loadData(this.tabCurrentIndex,3)
		},
		//获取订单列表  订单状态*（0.未发货、1.已发货、2.已完成、3.已评价、-1.订单取消）
		// index:滑动块索引0.1.2.3.-1 ， judge:状态控制 0.初始化，1.下拉加载，2.上拉刷新
		async loadData(index,judge) {			
			//这里是将订单挂载到tab列表下
			let navItem = this.navList[index];
			let state = navItem.state;			
			const { id } = this.user;
			console.log('单元定位',index)
			
			let res;
			// 显示全部
			if(index == 0) res = await this.$apis.logistic.findAllByTake(id,this.off,this.lim);
			if(index == 1) res = await this.$apis.lsend.findAllByTake(id,this.off,this.lim);
			if(index == 2) res = await this.$apis.card.findAllByUser(id,this.off,this.lim);
			console.log(res.data)
			
			let orderList = res.data.rows.filter(item=>{
				//添加不同状态下订单的表现形式
				item = Object.assign(item, this.orderConditionExp(index,item.condition), this.orderTimeExp(item.created_at));
				return item;
			});			
			if(judge === 0){ 
				uni.hideLoading();
				if(orderList.length == 0){					
					//loaded新字段用于表示数据加载完毕，如果为空可以显示空白页
					this.$set(navItem, 'loaded', true);
					navItem.orderList = null
				}else{
					navItem.orderList = orderList;
					this.$set(navItem, 'loaded', false);
				}
			}
			// 下拉刷新
			if(judge === 1){ this.$api.msg('刷新成功'); uni.stopPullDownRefresh(); navItem.orderList = orderList; }
			// onShow 生命周期
			if(judge === 3){ navItem.orderList = orderList; }	
			// 上拉加载
			if(judge === 2){
				if(orderList.length != 0){
					orderList.forEach(item=>{ navItem.orderList.push(item); })
				}else{
					// this.$api.msg('没有更多啦~') 
					//判断是否还有数据， 有改为 more， 没有改为noMore 
					if(orderList.length == 0) navItem.loadingType = 'noMore';
					else navItem.loadingType = 'more';
				}
			}
		},
		//swiper 切换
		changeTab(e) {
			this.tabCurrentIndex = e.target.current;
			this.off = 0; this.lim = 10;
			this.loadData(this.tabCurrentIndex,0);
		},
		// 上拉加载
		getMore() {
			let add = this.lim
			this.off += add; this.lim += add;
			console.log(this.off,this.lim)
			this.loadData(this.tabCurrentIndex,2)
		},
		// 查看详情
		enter(judge,item){
			console.log('查看详情',item)
			const { id } = item;
			//  0:快递代取, 1：快递代发, 2：线上开卡
			if(judge == 0) uni.navigateTo({ url: `/pages/flow/logistic_detail/logistic_detail?id=${id}` });
			if(judge == 1) uni.navigateTo({ url: `/pages/flow/lsend_detail/lsend_detail?id=${id}` });
			if(judge == 2) uni.navigateTo({ url: `/pages/flow/card_detail/card_detail?id=${id}` });
		},
		//顶部tab点击
		tabClick(index) { this.tabCurrentIndex = index; },
		//删除订单
		deleteOrder(index) { },
		//取消订单
		cancelOrder(item) { },
		// 联系用户
		call(phone){
			uni.showActionSheet({
				itemList: [phone,'呼叫'],
				success:function(res){
				  if(res.tapIndex==1){ wx.makePhoneCall({ phoneNumber: phone }) }
				}
			})
		},
		// 更新代取订单
		// condition（0.未接单、1.已接单、2.已取件、3.待送达、4.已完成、-1.订单取消）
		async updateLog(item,condition){
			console.log('logistic--->',item,condition);
			const { id,money } = item;
			// 询问
			let res = await uni.showModal({
				title:'你确认要点嘛~',
				content:'此操作不能逆行喔'
			})
			if(!res[1].confirm){ return; }
			// 确认送达更新资金信息
			let stk;
			if(condition === 4) stk = await this.upStock(0,money);
			console.log(stk)
			if(stk.code !== 1){ this.$api.msg('更新订单异常'); return; }
			// 更新代取订单状态
			let log = await this.$apis.logistic.update(id,condition);
			console.log('更新代取订单',log)
			
			if(!log || log.data[0] != 1){ this.$api.msg('执行操作失败喔~'); return; }
			else this.$api.msg('状态更新成功~')
			this.init();			
		},
		async updateLsend(item,condition){
			console.log('lsend--->',item,condition);
			const { id,money } = item;
			// condition -1:填写信息（重量、价格），2、确认取件，3、确认送达
			if(condition === -1){ this.modalName = 'ChooseModal'; this.weight = null; this.money = null; this.clsend = item; return; }
			// 询问
			if(!item.weight || !item.money){ this.$api.msg('请先填写重量价格信息~'); return; }
			let res = await uni.showModal({
				title:'你确认要点嘛~',
				content:'此操作不能逆行喔'
			})
			if(!res[1].confirm){ return; }
			// 确认送达更新资金信息
			let stk;
			if(condition === 3) stk = await this.upStock(1,money);
			console.log(stk)
			if(stk.code !== 1){ this.$api.msg('更新订单异常'); return; }
			// 更新订单状态
			let lsend = await this.$apis.lsend.update(id,condition)
			if(!lsend || lsend.data[0] != 1){ this.$api.msg('执行操作失败喔~'); return; }
			else this.$api.msg('状态更新成功~')
			this.init()			
		},
		async updateCard(item,condition){
			// condition（0.未处理、1.处理中、2.已完成、-1.撤销）
			console.log('card--->',item,condition);
			const { id,price } = item;
			let res = await uni.showModal({
				title:'你确认要点嘛~',
				content:'此操作不能逆行喔'
			})
			if(!res[1].confirm){ return; }
			// 确认送达更新资金信息
			let stk;
			if(condition === 2) stk = await this.upStock(2,price);
			console.log(stk)
			if(stk.code !== 1){ this.$api.msg('更新订单异常'); return; }
			// 更新订单状态
			let card = await this.$apis.card.update(id,condition)
			if(!card || card.data[0] != 1){ this.$api.msg('执行操作失败喔~'); return; }
			else this.$api.msg('状态更新成功~')
			this.init()
		},
		hideModal(e) { this.modalName = null },
		// 提交重量、价格信息
		async choose(){
			if( !this.weight || !this.money ){ this.$api.msg('不能输入为空~'); return; }
			console.log('更新代发订单信息',this.clsend,this.weight,this.money);
			const { id } = this.clsend;
			let lsend = await this.$apis.lsend.updateWeightMoney(id,this.weight,this.money);
			console.log(lsend)
			if(lsend.data[0] == 1){ this.$api.msg('更新成功~'); }
			else this.$api.msg('信息更新失败~');
			this.hideModal()
			this.init();
		},
		//订单状态文字和颜色
		// 0 logistic 状态*（0.未接单、1.已接单、2.已取件、3.已送达、4.已完成、-1.订单取消）
		// 1 lsend 状态*（0.未接单、1.已接单、2.已取件、3.已送达、4.已发件、-1.订单取消）
		// 2 card 状态*（0.未处理、1.处理中、2.已完成、-1.撤销）
		orderConditionExp(index,condition){
			let stateTip = '', stateTipColor = '#fa436a';
			if(index == 0){
				switch(+condition){
					case 0: stateTip = '未接单'; break;
					case 1: stateTip = '已接单'; break;
					case 2: stateTip = '已取件'; break;
					case 3: stateTip = '待送达'; break;
					case 4: stateTip = '已完成'; break;
					case -1:
						stateTip = '订单已取消'; 
						stateTipColor = '#909399';
						break;
				}				
			}
			if(index == 1){
				switch(+condition){
					case 0: stateTip = '未接单'; break;
					case 1: stateTip = '已接单'; break;
					case 2: stateTip = '已取件'; break;
					case 3: stateTip = '待送达'; break;
					case 4: stateTip = '已发件'; break;
					case -1:
						stateTip = '订单已取消'; 
						stateTipColor = '#909399';
						break;
				}				
			}
			if(index == 2){
				switch(+condition){
					case 0: stateTip = '未处理'; break;
					case 1: stateTip = '处理中'; break;
					case 2: stateTip = '已完成'; break;
					case -1:
						stateTip = '订单已取消'; 
						stateTipColor = '#909399';
						break;
				}				
			}
			return {stateTip, stateTipColor};
		},		
		//订单时间格式化
		orderTimeExp(time){
			let tmp = time.split('T')
			let date = tmp[0] + '  '+ tmp[1].split(':')[0]+ ':' + tmp[1].split(':')[1]
			return {date};
		},
		// 更新资金信息
		// judge 0.快递待取，1.快递代发，2.线上开卡
		upStock(judge,add){			
			return new Promise(async (resolve,reject)=>{
				// 结果返回值 -1 出现错误，1 处理正常
				const { data } = await this.$apis.stock.findByUserId(this.user.id).catch(err=>{ reject({ code:-1 }) });
				const { id,money,score } = data;
				let m;
				// 依据全局config计算应该累加的金额
				(judge === 0)&&(m = Number(money)+Number(add)*conf.log)||(judge === 1)&&(m = Number(money)+Number(add)*conf.lsend)||(judge === 2)&&(m = Number(money)+Number(add)*conf.card)
				// let m = Number(money) + Number(add)
				let final = await this.$apis.stock.updateMoneyScore(id,m,score).catch(err=>{ reject({ code:-1 }) });
				console.log(data,final)
				if(data &&　final.data[0] ===1){ resolve({ code:1 }) };
				// 写入交易清单
				if(judge === 0) ;
				if(judge === 1) ;
				if(judge === 2) ;
			})
			
		}
	}
};
</script>

<style lang="scss">
page,
.content {
	background: $page-color-base;
	height: 100%;
}

.swiper-box {
	height: calc(100% - 40px);
}
.list-scroll-content {
	height: 100%;
}
.row {
	display: flex;
	align-items: center;
	position: relative;
	padding: 0 30upx;
	height: 110upx;
	background: #fff;

	.tit {
		flex-shrink: 0;
		width: 120upx;
		font-size: 30upx;
		color: $font-color-dark;
	}
	.input {
		flex: 1;
		font-size: 30upx;
		color: $font-color-dark;
	}
	.icon-shouhuodizhi {
		font-size: 36upx;
		color: $font-color-light;
	}
}
.navbar {
	display: flex;
	height: 40px;
	padding: 0 5px;
	background: #fff;
	box-shadow: 0 1px 5px rgba(0, 0, 0, 0.06);
	position: relative;
	z-index: 10;
	.nav-item {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		font-size: 15px;
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
				width: 44px;
				height: 0;
				border-bottom: 2px solid $base-color;
			}
		}
	}
}

.uni-swiper-item {
	height: auto;
}
.order-item {
	display: flex;
	flex-direction: column;
	padding-left: 30upx;
	background: #fff;
	margin-top: 16upx;
	.i-top {
		display: flex;
		align-items: center;
		height: 80upx;
		padding-right: 30upx;
		font-size: $font-base;
		color: $font-color-dark;
		position: relative;
		.time {
			flex: 1;
		}
		.state {
			color: $base-color;
		}
		.del-btn {
			padding: 10upx 0 10upx 36upx;
			font-size: $font-lg;
			color: $font-color-light;
			position: relative;
			&:after {
				content: '';
				width: 0;
				height: 30upx;
				border-left: 1px solid $border-color-dark;
				position: absolute;
				left: 20upx;
				top: 50%;
				transform: translateY(-50%);
			}
		}
	}
	/* 多条商品 */
	.goods-box {
		height: 160upx;
		padding: 20upx 0;
		white-space: nowrap;
		.goods-item {
			width: 120upx;
			height: 120upx;
			display: inline-block;
			margin-right: 24upx;
		}
		.goods-img {
			display: block;
			width: 100%;
			height: 100%;
		}
	}
	/* 单条商品 */
	.goods-box-single {
		display: flex;
		padding: 20upx 0;
		.goods-img {
			display: block;
			width: 120upx;
			height: 120upx;
		}
		.right {
			flex: 1;
			display: flex;
			flex-direction: column;
			padding: 0 30upx 0 24upx;
			overflow: hidden;
			.title {
				font-size: $font-base + 2upx;
				color: $font-color-dark;
				line-height: 1;
			}
			.attr-box {
				font-size: $font-sm + 2upx;
				color: $font-color-light;
				padding: 10upx 12upx;
			}
			.price {
				font-size: $font-base + 2upx;
				color: $font-color-dark;
				&:before {
					content: '￥';
					font-size: $font-sm;
					margin: 0 2upx 0 8upx;
				}
			}
		}
	}

	.price-box {
		display: flex;
		justify-content: flex-end;
		align-items: baseline;
		padding: 20upx 30upx;
		font-size: $font-sm + 2upx;
		color: $font-color-light;
		.num {
			margin: 0 8upx;
			color: $font-color-dark;
		}
		.weight {
			font-size: $font-base + 2upx;
			color: $font-color-dark;
			&:before {
				content: '';
				font-size: $font-sm;
				margin: 0 2upx 0 8upx;
			}
		}
		.price {
			font-size: $font-lg;
			color: $font-color-dark;
			&:before {
				content: '￥';
				font-size: $font-sm;
				margin: 0 2upx 0 8upx;
			}
		}
	}
	.action-box {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		height: 100upx;
		position: relative;
		padding-right: 30upx;
	}
	.action-btn {
		width: 160upx;
		height: 60upx;
		margin: 0;
		margin-left: 24upx;
		padding: 0;
		text-align: center;
		line-height: 60upx;
		font-size: $font-sm + 2upx;
		color: $font-color-dark;
		background: #fff;
		border-radius: 100px;
		&:after {
			border-radius: 100px;
		}
		&.recom {
			background: #fff9f9;
			color: $base-color;
			&:after {
				border-color: #f7bcc8;
			}
		}
	}
}

/* load-more */
.uni-load-more {
	display: flex;
	flex-direction: row;
	height: 80upx;
	align-items: center;
	justify-content: center;
}

.uni-load-more__text {
	font-size: 28upx;
	color: #999;
}

.uni-load-more__img {
	height: 24px;
	width: 24px;
	margin-right: 10px;
}

.uni-load-more__img > view {
	position: absolute;
}

.uni-load-more__img > view view {
	width: 6px;
	height: 2px;
	border-top-left-radius: 1px;
	border-bottom-left-radius: 1px;
	background: #999;
	position: absolute;
	opacity: 0.2;
	transform-origin: 50%;
	animation: load 1.56s ease infinite;
}

.uni-load-more__img > view view:nth-child(1) {
	transform: rotate(90deg);
	top: 2px;
	left: 9px;
}

.uni-load-more__img > view view:nth-child(2) {
	transform: rotate(180deg);
	top: 11px;
	right: 0;
}

.uni-load-more__img > view view:nth-child(3) {
	transform: rotate(270deg);
	bottom: 2px;
	left: 9px;
}

.uni-load-more__img > view view:nth-child(4) {
	top: 11px;
	left: 0;
}

.load1,
.load2,
.load3 {
	height: 24px;
	width: 24px;
}

.load2 {
	transform: rotate(30deg);
}

.load3 {
	transform: rotate(60deg);
}

.load1 view:nth-child(1) {
	animation-delay: 0s;
}

.load2 view:nth-child(1) {
	animation-delay: 0.13s;
}

.load3 view:nth-child(1) {
	animation-delay: 0.26s;
}

.load1 view:nth-child(2) {
	animation-delay: 0.39s;
}

.load2 view:nth-child(2) {
	animation-delay: 0.52s;
}

.load3 view:nth-child(2) {
	animation-delay: 0.65s;
}

.load1 view:nth-child(3) {
	animation-delay: 0.78s;
}

.load2 view:nth-child(3) {
	animation-delay: 0.91s;
}

.load3 view:nth-child(3) {
	animation-delay: 1.04s;
}

.load1 view:nth-child(4) {
	animation-delay: 1.17s;
}

.load2 view:nth-child(4) {
	animation-delay: 1.3s;
}

.load3 view:nth-child(4) {
	animation-delay: 1.43s;
}

@-webkit-keyframes load {
	0% {
		opacity: 1;
	}

	100% {
		opacity: 0.2;
	}
}
</style>

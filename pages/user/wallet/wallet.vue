<template>
	<view class="container">
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
                <text class="num">{{  stock.score || 0 }}</text>
                <text>积分</text>
            </view>
        </view>
		
		<view class="list-cell log-out-btn">
			<text class="cell-tit" @tap="showModal" data-target="ChooseModal">申请提现</text>
		</view>
		
		<!-- 优惠券面板 -->
		<!-- 优惠券页面，仿mt -->
		<view class="coupon-item" v-for="(item,index) in ticketList" :key="index">
			<view class="con">
				<view class="left">
					<text class="title">{{item.ticket.title}}</text>
					<text class="time">有效期至{{item.end}}</text>
				</view>
				<view class="right">
					<text class="price" style="color: #707070;" v-if="item.condition === -1 || item.isTimeOut">{{item.ticket.short}}</text>
					<text class="price" v-else>{{item.ticket.short}}</text>
					<text>满{{item.ticket.fill}}可用</text>
				</view>
				
				<view class="circle l"></view>
				<view class="circle r"></view>
			</view>
			<text class="tips">{{item.ticket.details}}</text>
		</view>
		

		<view class="cu-modal bottom-modal" :class="modalName=='ChooseModal'?'show':''" @tap="hideModal">
			<view class="cu-dialog" @tap.stop="">
				<view class="cu-bar bg-white">
					<view class="action text-blue" @tap="hideModal">取消</view>
					<view class="action text-green" @tap="choose">确定</view>
				</view>
				<view class="grid col-3 padding-sm">
					<text style="display:block;padding: 16upx 30upx 10upx;lihe-height: 1.6;color: #fa436a;font-size: 24upx;">提现前请先联系客服，添加校园负责人微信，按照指引操作。</text>
					<view v-for="(item,index) in checkbox" class="padding-xs" :key="index">
						<button class="cu-btn orange lg block text-xs" :class="item.checked?'bg-orange':'line-orange'" @tap="ChooseMoney(item)"
						 :data-value="item.value"> {{item.price}}元
							<view class="cu-tag sm round" :class="item.checked?'bg-white text-orange':'bg-orange'" v-if="item.hot">HOT</view>
						</button>
					</view>
				</view>
			</view>
		</view>

	</view>
</template>

<script>
	import { mapState, mapMutations } from 'vuex';
	export default {
		data() {
			return {
				stock:{},
				modalName: null,
				checkbox: [
					{ value: 0, price: '30', checked: false, hot: false, }, 
					{ value: 1, price: '50', checked: false, hot: false, }, 
					{ value: 2, price: '100', checked: false, hot: false, }, 
					{ value: 3, price: '200', checked: false, hot: false, }, 
					{ value: 4, price: '500', checked: false, hot: false, }, 
					{ value: 5, price: '1000', checked: false, hot: false, }],
				chooseMoney:[],
				ticketCount:0,
				ticketList:[]
			};
		},
		computed: { ...mapState(['user']) },
		onLoad() { console.log(this.user) },
		onShow() { this.getStock(); this.getTicket(); },
		methods:{
			// 获取资金信息	
			getStock(){ this.$apis.stock.findByUserId(this.user.id).then(res=>{ console.log('账户资金信息',res.data); this.stock = res.data }) },
			// 获取优惠券信息
			async getTicket(){
				let tic = await this.$apis.uticket.findAndCountAllByUser(this.user.id,0,100)
				this.ticketCount = tic.data.count
				this.ticketList = tic.data.rows.filter(item=>{ item = Object.assign(item, this.orderExp(item.ticket)); return item; });	
				console.log('获取优惠券信息',this.ticketList)
			},
            showModal(e) { this.modalName = e.currentTarget.dataset.target },
			hideModal(e) { this.modalName = null },
            async choose(){
				if(this.chooseMoney.length == 0){ this.$api.msg('没有选择提现金额喔~'); return; }
				// 调用微信支付接口
				// 更新资产
				let uid = this.user.id
				let school_id = this.user.school_id
				let aid = this.user.authen.id
				let sid = this.stock.id
				let money = this.chooseMoney.price
				// 写入提现清单 减少资金账户
				let tx = await this.$apis.tixian.create(uid,aid,sid,0,money,school_id).catch(err=>{ this.$api.msg('请求出错啦~'); return; })  //u,a,s,c,m,sc 提现状态*（0.未处理、-1.拒绝、1.提现完成）
				// 统一扣款
				let m = this.stock.money - money;
				let score = this.stock.score
				let final = await this.$apis.stock.updateMoneyScore(sid,m,score).catch(err=>{ this.$api.msg('请求出错啦~'); return; })
				
				if(tx && final){
					this.getStock()
					this.$api.msg('提现申请发送成功')
					this.hideModal()
				}
            },
			ChooseMoney(item) {
				if(item.price >= this.stock.money){ this.$api.msg('账户余额不足喔~'); return; }
				this.chooseMoney = item
				let items = this.checkbox
				for (let i = 0; i < items.length; ++i) {
					if (items[i] == item) {
						items[i].checked = true;
					}else{
						items[i].checked = false;
                    }
				}
			},
			//时间格式化
			orderExp(item){  // 此处item 为 ticket
				let end = item.end.split('T')[0]
				let now = new Date().toLocaleDateString()
				let final = new Date(end).toLocaleDateString()
				let isTimeOut = now >= final
				return {end,isTimeOut};
			}
		}
	}
</script>

<style lang='scss'>
	%flex-center {
	 display:flex;
	 flex-direction: column;
	 justify-content: center;
	 align-items: center;
	}
	%section {
	  display:flex;
	  justify-content: space-around;
	  align-content: center;
	  background: #fff;
	  border-radius: 10upx;
	}
    
	page{
		background: $page-color-base;
	}
    
	.tj-sction{
		@extend %section;
		.tj-item{
			@extend %flex-center;
			flex-direction: column;
			height: 140upx;
			font-size: $font-sm;
			color: #75787d;
		}
		.num{
			font-size: $font-lg;
			color: $font-color-dark;
			margin-bottom: 8upx;
		}
	}
	.list-cell{
		display:flex;
		align-items:baseline;
		padding: 20upx $page-row-spacing;
		line-height:60upx;
		position:relative;
		background: #fff;
		justify-content: center;
		&.log-out-btn{
			margin-top: 40upx;
			.cell-tit{
				color: $uni-color-primary;
				text-align: center;
				margin-right: 0;
			}
		}
		.cell-tit{
			flex: 1;
			font-size: $font-base + 2upx;
			color: $font-color-dark;
			margin-right:10upx;
		}
	}
	
	/* 优惠券列表 */
	.coupon-item{
		display: flex;
		flex-direction: column;
		margin: 20upx 24upx;
		background: #fff;
		.con{
			display: flex;
			align-items: center;
			position: relative;
			height: 120upx;
			padding: 0 30upx;
			&:after{
				position: absolute;
				left: 0;
				bottom: 0;
				content: '';
				width: 100%;
				height: 0;
				border-bottom: 1px dashed #f3f3f3;
				transform: scaleY(50%);
			}
		}
		.left{
			display: flex;
			flex-direction: column;
			justify-content: center;
			flex: 1;
			overflow: hidden;
			height: 100upx;
		}
		.title{
			font-size: 32upx;
			color: $font-color-dark;
			margin-bottom: 10upx;
		}
		.time{
			font-size: 24upx;
			color: $font-color-light;
		}
		.right{
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			font-size: 26upx;
			color: $font-color-base;
			height: 100upx;
		}
		.price{
			font-size: 44upx;
			color: $base-color;
			&:before{
				content: '￥';
				font-size: 34upx;
			}
		}
		.tips{
			font-size: 24upx;
			color: $font-color-light;
			line-height: 60upx;
			padding-left: 30upx;
		}
		.circle{
			position: absolute;
			left: -6upx;
			bottom: -10upx;
			z-index: 10;
			width: 20upx;
			height: 20upx;
			background: #f3f3f3;
			border-radius: 100px;
			&.r{
				left: auto;
				right: -6upx;
			}
		}
	}
</style>

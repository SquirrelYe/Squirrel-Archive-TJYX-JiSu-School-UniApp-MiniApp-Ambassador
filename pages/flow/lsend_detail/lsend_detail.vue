<template>
	<view>
		<view class="bg-white padding margin-top-xs">
			<view class="cu-steps">
				<view class="cu-item" :class="index > basics ? '' : 'text-orange'" v-for="(item, index) in basicsList" :key="index">
					<text class="cuIcon-title"></text>
					{{ item.name }}
				</view>
			</view>
		</view>
		<view class="cu-form-group">
			<view class="title">订单状态</view>
			<view class="title">{{data.tip}}</view>
		</view>
		<view class="cu-form-group">
			<view class="title">发单人电话</view>
			<view class="title" @click="call(data.cus.phone)">{{data.cus.phone}}</view>
		</view>
		<view class="cu-form-group">
			<view class="title">取件地址</view>
			<view class="title">{{data.location.dom}}</view>
		</view>
		<view class="cu-form-group">
			<view class="title">收货人</view>
			<view class="title">{{data.name}}</view>
		</view>
		<view class="cu-form-group">
			<view class="title">收货人电话</view>
			<view class="title">{{data.phone}}</view>
		</view>
		<view class="cu-form-group">
			<view class="title">收货地址</view>
			<view class="title">{{data.arrive}}</view>
		</view>
		<!-- 已接单显示 -->
		<block v-if="data.condition == 2">
			<view class="cu-form-group">
				<view class="title">物品重量</view>
				<view class="title">{{data.weight}}</view>
			</view>
			<view class="cu-form-group">
				<view class="title">订单价格</view>
				<view class="title">{{data.money}}</view>
			</view>
			<view class="cu-form-group">
				<view class="title">订单价格</view>
				<view class="title">￥{{data.money}}</view>
			</view>			
		</block>
		<view class="cu-form-group" v-if="data.condition === 4 ">
			<view class="title">快递单号</view>
			<view class="title">{{data.code}}</view>
		</view>
	</view>
</template>

<script>
import { mapState } from 'vuex';
export default {
	data() {
		return {
			host:null,
			id:null,
			basics: null,
			data:{},
			basicsList: [
				{ icon: 'usefullfill', name: '未领单' },
				{ icon: 'radioboxfill', name: '已领单' },
				{ icon: 'subscription', name: '已取件' },
				{ icon: 'subscription', name: '已送达' },
				{ icon: 'roundcheckfill', name: '已完成' }
			]
		};
	},
	computed: { ...mapState(['user']) },
	onLoad(option) {
		this.host = this.$host
		console.log(option);
		this.id = option.id;
		this.getLsend(this.id)
	},
	methods: {
		async getLsend(id){
			let res = await this.$apis.lsend.findOneById(id);
			const { condition } = res.data
			this.basics = condition;
			this.data = Object.assign(res.data, this.conditionExp(condition));
			console.log('获取传递信息',res.data)
		},
		// 订单状态
		conditionExp(condition){
			let tip = ''
			switch(+condition){
				case 0: tip = '未接单'; break;
				case 1: tip = '已接单'; break;
				case 2: tip = '已取件'; break;
				case 3: tip = '已送达'; break;
				case 4: tip = '已发件'; break;
				case -1: tip = '订单取消'; break;
			}
			return { tip };
		},
		// 联系发件人
		call(phone){ uni.makePhoneCall({ phoneNumber:phone }) },
	},
};
</script>

<style>
	
</style>

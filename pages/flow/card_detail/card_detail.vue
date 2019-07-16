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
			<view class="title">开卡人</view>
			<view class="title">{{data.name}}</view>
		</view>
		<view class="cu-form-group">
			<view class="title">开卡人电话</view>
			<view class="title">{{data.phone}}</view>
		</view>
		<view class="cu-form-group">
			<view class="title">上门地址</view>
			<view class="title">{{data.dom}}</view>
		</view>
		<view class="cu-form-group">
			<view class="title">订单价格</view>
			<view class="title">{{data.price}}</view>
		</view>
		<view class="cu-form-group">
			<view class="title">备注</view>
			<view class="title">{{data.detail}}</view>
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
				{ icon: 'subscription', name: '已完成' },
			]
		};
	},
	computed: { ...mapState(['user']) },
	onLoad(option) {
		this.host = this.$host
		console.log(option);
		this.id = option.id;
		this.getCard(this.id)
	},
	methods: {
		async getCard(id){
			let res = await this.$apis.card.findOneById(id);
			const { condition } = res.data
			this.basics = condition;
			this.data = Object.assign(res.data, this.conditionExp(condition));
			console.log('获取开卡信息',res.data)
		},
		// 订单状态
		conditionExp(condition){
			let tip = ''
			switch(+condition){
				case 0: tip = '未接单'; break;
				case 1: tip = '已接单'; break;
				case 2: tip = '已完成'; break;
				case -1: tip = '订单取消'; break;
			}
			return { tip };
		}
	},
};
</script>

<style>
	
</style>

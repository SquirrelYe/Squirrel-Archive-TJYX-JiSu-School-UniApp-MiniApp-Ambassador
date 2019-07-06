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
			<view class="title">取件地址</view>
			<view class="title">{{data.from}}</view>
		</view>
		<view class="cu-form-group">
			<view class="title">收货人</view>
			<view class="title">{{data.location.name}}</view>
		</view>
		<view class="cu-form-group">
			<view class="title">收货地址</view>
			<view class="title">{{data.location.dom}}</view>
		</view>
		<view class="cu-form-group">
			<view class="title">电话</view>
			<view class="title" @click="call(data.cus.phone)">{{data.cus.phone}}</view>
		</view>
		<view class="cu-form-group">
			<view class="title">佣金</view>
			<view class="title">￥{{data.money}}</view>
		</view>
		<!-- <view class="cu-form-group align-start">
			<textarea maxlength="-1" disabled :placeholder="data.key" />
		</view> -->		
		<view class="cu-form-group"><view class="title">详细信息</view></view>
		<view class="cu-form-group">
			<view class="grid col-4 grid-square flex-sub">
				<view
					class="padding-xs bg-img"
					:style="[{backgroundImage:'url(' + host+'/'+data.icon +')'}]" 
					:key="index"
					@tap="ViewImage"
					:data-url="host+'/'+data.icon"
				>
				</view>
				<text class="text-sm placeholder">{{data.key}}</text>
			</view>
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
				{ icon: 'subscription', name: '待送达' },
				{ icon: 'roundcheckfill', name: '已完成' }
			]
		};
	},
	computed: { ...mapState(['user']) },
	onLoad(option) {
		this.host = this.$host
		console.log(option);
		this.id = option.id;
		this.getLogistic(this.id)
	},
	methods: {
		async getLogistic(id){
			let res = await this.$apis.logistic.findOneById(id);
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
				case 3: tip = '待送达'; break;
				case 4: tip = '已完成'; break;
				case -1: tip = '订单取消'; break;
			}
			return { tip };
		},
		// 显示认证信息
		ViewImage(e) {
			let arr = []
			arr.push(`${this.host}/${this.data.icon}`)
			uni.previewImage({
				urls: arr,
				current: e.currentTarget.dataset.url
			});
		},
		// 联系发件人
		call(phone){ uni.makePhoneCall({ phoneNumber:phone }) },
	},
};
</script>

<style>
	
</style>

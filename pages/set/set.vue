<template>
	<view class="container">
		<view class="list-cell b-b m-t"  @tap="about" hover-class="cell-hover" :hover-stay-time="50">
			<text class="cell-tit">关于我们</text>
			<text class="cell-more yticon icon-you"></text>
		</view>
		<view class="list-cell" @click="update()">
			<text class="cell-tit">检查更新</text>
			<text class="cell-tip">当前版本 {{edtion}}</text>
			<text class="cell-more yticon icon-you"></text>
		</view>
		<view class="list-cell log-out-btn" @click="toLogout">
			<text class="cell-tit">退出登录</text>
		</view>
	</view>
</template>

<script>
	import { mapMutations } from 'vuex';
	export default {
		data() {
			return {				
				edtion:null
			};
		},
		onLoad() { this.edtion = this.$edition },
		methods:{
			...mapMutations(['logout']),
			//退出登录
			toLogout(){
				uni.showModal({
				    content: '确定要退出登录么',
				    success: (e)=>{
				    	if(e.confirm){
				    		this.logout();
				    		setTimeout(()=>{
				    			uni.navigateBack();
				    		}, 200)
				    	}
				    }
				});
			},
			update(){
				let _this = this
				const updateManager = wx.getUpdateManager()
				updateManager.onCheckForUpdate(function (res) {
				  // 请求完新版本信息的回调
				  if(res.hasUpdate) _this.$api.msg('有新版本发布')
				  else _this.$api.msg('暂无新版本')
				})
				updateManager.onUpdateReady(function () {
				  wx.showModal({
					title: '更新提示',
					content: '新版本已经准备好，是否重启应用？',
					success: function (res) {
					  if (res.confirm) {
						// 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
						updateManager.applyUpdate()
					  }
					}
				  })
				})
				updateManager.onUpdateFailed(function () {
				  // 新版本下载失败
				})
			},
			// 关于
			about(){ this.$api.msg('程序猿是个小哥哥喔~')}
		}
	}
</script>

<style lang='scss'>
	page{
		background: $page-color-base;
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
		&.cell-hover{
			background:#fafafa;
		}
		&.b-b:after{
			left: 30upx;
		}
		&.m-t{
			margin-top: 16upx; 
		}
		.cell-more{
			align-self: baseline;
			font-size:$font-lg;
			color:$font-color-light;
			margin-left:10upx;
		}
		.cell-tit{
			flex: 1;
			font-size: $font-base + 2upx;
			color: $font-color-dark;
			margin-right:10upx;
		}
		.cell-tip{
			font-size: $font-base;
			color: $font-color-light;
		}
		switch{
			transform: translateX(16upx) scale(.84);
		}
	}
</style>

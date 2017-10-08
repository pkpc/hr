<template>
  <div>
    <x-header class="header" :left-options="{showBack: true,backText: ''}" title="阅读情况" ref="header">
    </x-header>
    <div>
      <div class="read-bar flex-row-between">
        <div @click="readSwitch(1)" :class="[flag===1?'active':'']">已阅读</div>
        <div @click="readSwitch(0)" :class="[flag===0?'active':'']">未阅读</div>
      </div>
      <div v-if="showUnState && flag===0">
        <div class="flex-col-center mt-120">
          <img src="../../../static/img/read@3x.png" class="img-read-unstate"/>
          <span  class="column-unstate-sp">全部人员已阅读</span>
        </div>
      </div>
      <div v-else class="scroll">
          <div v-for="item in arrayStaff" @click="toBasicInfo(item.contactId)" class="cell-box-read">
            <div class="flex-row-between fullHeight">
              <div class="flex-row-start">
                <img :src="'https://www.erplus.co/uploads/avatars/'+item.imageName" class="img-read-header"/>
                <div>
                  <div class="cell-box-main">{{item.name}}</div>
                  <div class="cell-box-desc">{{item.position}}</div>
                </div>
              </div>
              <span class="cell-box-re">{{item.readTime}} {{flag===1?'阅读':'未阅读'}}</span>
            </div>
          </div>
      </div>
    </div>
  </div>
</template>
<script>
  import XHeader from '../../components/x-header/index.vue'
  import Cell from '../../components/cell/index.vue'
  import Group from '../../components/group/index.vue'

  export default {
    components:{
      XHeader,
      Cell,
      Group
    },
    created(){
      var params = this.$route.params.detail;
      var self = this;
      this.$store.dispatch('getReadArticlePeople',params).then(res =>{
        self.hasReadUser = res.hasReadUser;
        console.log(res.notReadUser.length);
        if(res.notReadUser.length === 0){
          self.showUnState = true;
        }
        self.notReadUser = res.notReadUser;
      })
    },
    data(){
      return {
        flag:1,//0为未读，1已读；
        hasReadUser:[],
        notReadUser:[],
        showUnState:false
      }
    },
    methods:{
      readSwitch(index){
        console.log(index);
        this.flag = index;
      },
      toBasicInfo(id){
        var obj = {
          target:'CHECK_PERSON_INFO',
          param:{contactId:id}
        }
        console.log(obj)
        this.postMsgToApp(obj)
      }
    },
    computed:{
      arrayStaff(){
        if(this.flag === 0){
          return this.notReadUser
        }else{
          return this.hasReadUser
        }
      }
    }
  }
</script>
<style scoped>
  .img-read-unstate{
    width: 96px;
    height: 42px;
  }
  .is-android .scroll{
    height:90%;
    overflow: scroll;
    background-color: #FFFFFF;
  }
  .is-iPhone .scroll{
    height:82%;
    overflow: scroll;
    background-color: #FFFFFF;
  }
  .vux-header + div {
    flex: 1;
    height: 100%;
    overflow-x: hidden;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    -webkit-transform: translateZ(0px);
    /* z-index: 1; */
  }
</style>
<style>
  .fullHeight{
    height:100%;
    border-bottom: 1px solid #efefef;/*no*/
  }
  .cell-box-re{
    font-size: 11px;
    color: #9B9B9B;
    margin-right:8px;
  }
  .cell-box-main{
    font-size: 14px;
    color: #030303;
  }
  .cell-box-desc{
    font-size: 10px;
    color: #999999;
  }
  .cell-box-read{
    height:44px;
    width:100%;
    box-sizing: border-box;
    padding:0 0 0 29px;
  }
  .read-bar div{
    height:40px;
    line-height:45px;
  }
  .active{
    color: #4a90e2;
    border-bottom: 2px solid #4a90e2;
  }
  .read-bar{
    height:40px;
    padding:0 73px;
    background-color: #F8F8F9;
    margin-bottom:12px;
    font-size: 14px;
  }
  .img-read-header{
    width:29px;
    height:29px;
    margin-right:12px;
    -webkit-border-radius: 50%;
    -moz-border-radius: 50%;
    border-radius: 50%;
  }
</style>

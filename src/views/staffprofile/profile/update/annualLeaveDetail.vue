<template>
  <div>
    <x-header :left-options="{showBack: true,backText: ''}" title="年假信息">
    </x-header>
    <div class="container">
      <group>
        <cell title="年假总时长" :value="dayInfo.totalAnnualLeaveDays"></cell>
        <cell title="剩余天数" :value="dayInfo.leftAnnualLeaveDays"></cell>
      </group>
      <p class="p-title">{{titleCounts}}</p>
      <div class="cell-box-out mt-12" v-for="item in leaveList" @click="toApprovalDetails(item.approveId,item.approveTemplateId,item.approveVersion,item.requestAncestorId)">
          <div class="cell-box-left" :style="{backgroundColor:item.color}"></div>
          <div class="cell-box-right">
            <div class="cell-box-hd border-bottom">
              <div class="box-hd-lt">{{item.name}}－{{item.currentName}}</div>
              <svg class="box-hd-rt icon-arrow-rt" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M160 128.4L192.3 96 352 256 192.3 416 160 383.6 287.3 256z"/></svg>
            </div>
            <div class="cell-box-bd">
              <div class ="box-bd-lt">
                <p class="box-bd-lt-hd">{{item.title}}</p>
                <p class="box-bd-lt-bd">请假时间：{{item.requestTime}} {{item.weekday}}</p>
              </div>
              <div class="box-bd-rt">
                <p class="box-bd-rt-hd">{{item.totalTime}}</p>
                <p class="box-bd-rt-bd" :style="{color:item.ftcolor}">{{item.state}}</p>
              </div>
            </div>
          </div>
        </div>
    </div>
  </div>
</template>
<script>
  import XHeader from '../../../../components/x-header/index.vue'
  import Group from '../../../../components/group/index.vue'
  import Cell from '../../../../components/cell/index.vue'
  export default{
    created(){
      var contactId = parseInt(this.$route.params.id);
      var mainContactId = 0;
      this.$store.getters.getContacts.forEach(function (obj) {
        if(obj.contactId === contactId){
          mainContactId = obj.mainContactId;
          return false;
        }
      })
      var params = {
        mainContactId:mainContactId
      }
      var self = this;
      this.$vux.loading.show({
        text: '正在保存...'
      })
      this.$store.dispatch('getSomeoneAnnualLeaveInfo',params).then(function (res) {
        if(res.result === 0){
          var info ={}
          info.leftAnnualLeaveDays = (res.data.leftAnnualLeaveDays>0?res.data.leftAnnualLeaveDays:0)+'天';
          info.totalAnnualLeaveDays = (res.data.totalAnnualLeaveDays>0?res.data.totalAnnualLeaveDays:0)+'天';
        }
        self.dayInfo = info;
      })
      var param = {
        applicant:mainContactId,
        page:1,
        dataNum:10
      }
      this.$store.dispatch('getSomeoneAnnualLeaveList',param).then(function (res) {
        if(res.result == 0){
              var list = [];
              var arr = ['周日','周一','周二','周三','周四','周五','周六'];
              res.data.forEach(function (n) {
                const data = {};
                data.color = n.templateColor;
                data.name = n.requestName;
                data.currentName = n.applicantName;
                const timeList = JSON.parse(n.templateComponent);
                const requestTime = timeList[0].value;
                timeList.forEach(function (r) {
                  if(r.type == 2){
                      if(r.value.length>12){
                        data.title = r.value.substr(0,12) +"..."
                      }else{
                        data.title = r.value;
                      }
                  }
                });
                if(n.finished === 1){
                    data.state = "已批准";
                    data.ftcolor = '#38c972';
                }else if(n.finished === 0){
                  data.state = "待审批";
                  data.ftcolor = '#F39D12';
                }else if(n.finished === 2){
                  data.state = '已归档';
                  data.ftcolor = '#999999';
                }
                data.requestTime = requestTime;
                data.totalTime = n.naturalContentTimeLast;
                data.weekday = arr[new Date(requestTime).getDay()];

                data.requestAncestorId = n.requestAncestorId;
                data.approveId = n.requestDkey;
                data.approveTemplateId = n.templateId;
                data.approveVersion = n.version;
                list.push(data);
              })
          self.leaveList = list;
          var text = "";
          if(self.leaveList.length>0){
            text = "相关审批 ("+self.leaveList.length+")";
            self.titleCounts = text
          }
        }
        self.$vux.loading.hide();
      })
    },
    data(){
      return{
        titleCounts:"",
          dayInfo:{
            totalAnnualLeaveDays:'',
            leftAnnualLeaveDays:''
          },
        leaveList:[]
      }
    },
    components:{
      XHeader,
      Cell,
      Group
    },
    methods:{
      toApprovalDetails(requestDkey,templateId,version,ancestorId){
        var self = this;
          this.$store.dispatch('getRequestDetail',{requestDkey:requestDkey}).then(function (res) {
            if(res.result === "0"){
              console.log('发消息');
              var obj ={
                target:'GO_TO_APPROVAL',
                requestDkey:requestDkey,
                requestAncestorId:ancestorId,
                templateId:templateId,
                version:version
              }
              console.log(obj)
              let ua = window.navigator.userAgent.toLowerCase();
              try {
                if (/iphone|ipad|ipod/.test(ua)) {
                  window.webkit.messageHandlers.iOS.postMessage(obj)
                } else if (/android/.test(ua)) {
                  window.Android.postMessage(JSON.stringify(obj).replace(/"/g, '\''))
                }
              } catch (e) {

              }
            }else{
              self.$vux.toast.show({
                type:'text',
                position:'bottom',
                width:'auto',
                text:'您无权查看此审批'
              })
            }
          })
      }
    }
  }
</script>
<style>
  .container{
    height:100%;
    width:100%;
    overflow: scroll!important;
  }
  .p-title{
    font-size: 14px;
    margin-left: 14px;
    margin-top: 22px;
    color: #999999;
  }
  .mt-12{
    margin-top:12px;
  }
  .box-bd-lt-bd{
    font-size: 13px;
    color: #999;
    margin-top: 5px;
  }
  .box-bd-rt-hd {
    font-size: 15px;
    color: #4a90e2;
    text-align: right;
  }
  .box-bd-rt-bd{
    font-size: 13px;
    /*color: #38c972;*/
    margin-top: 5px;
    text-align: right;
  }
  .cell-box-out{
    width:100%;
    height:96px;
    display: flex;
    justify-content:flex-start;
    align-items: center;
    background-color: #ffffff;
    margin-bottom:12px;
  }
  .cell-box-left{
    width:4px;
    height:96px;
    margin-right: 12px;
    background-color: red;
  }
  .cell-box-right{
    width:100%;
  }
  .cell-box-hd,
  .cell-box-bd {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 34px;
    padding-right: 12px;
    border-bottom: 1px dashed #efefef; /*no*/
    font-size: 14px; /*px*/
    color: #333;
  }
  .cell-box-bd {
    min-height: 61px;
    padding-right: 15px;
  }
  .border-bottom{
    border-bottom: 1px #CCCCCC dashed!important;
  }
  .icon-arrow-rt {
    fill: #c7c7cc;
    width: 20px;
  }
  .box-bd-lt-hd {
    font-size: 15px; /*px*/
    color: #030303;
  }
</style>

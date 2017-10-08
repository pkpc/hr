<template>
  <div>
    <x-header :left-options="{showBack: true,backText: '', preventGoBack: true}" @on-click-back="goBackToMP" title="人事">
      <a href="javascript:" v-if="getUserInfo.isAdmin==true || getUserInfo.isHRManager==1" @click="showHRSetting" slot="right">设置</a>
    </x-header>
    <div>
      <group>
        <cell title="员工档案" is-link @click.native="judgeUserIdentity" inline-desc='家庭信息、人事信息及过往记录'>
          <div slot="icon" style="position:relative;">
            <img class="weui_cell_hd_img" slot="icon" src="../../static/img/icon-3.png">
            <span v-if="fileRedPointCounts >0" class="redPoint-cell"></span>
          </div>

          <!--<badge v-if="fileRedPointCounts >0" :text="fileRedPointCounts"></badge>-->
        </cell>
        <cell v-if="isSelfCompany" title="制度与文化" is-link link="/culture" inline-desc='公司规章制度与企业文化'>

          <div slot="icon" style="position:relative;">
            <img class="weui_cell_hd_img"  src="../../static/img/icon3.png">
            <!--<span v-if="redPoint" class="redPoint-cell"></span>-->
          </div>
          <badge v-if="redPoint" :text="redPointCounts"></badge>
        </cell>
      </group>
    </div>
    <loading v-model="showLoading" :text="loadingText"></loading>

  </div>
</template>
<script>
  import Vue from 'vue'
  import XHeader from '../components/x-header/index.vue'
  import Cell from '../components/cell/index.vue'
  import Group from '../components/group/index.vue'
  import Loading from '../components/loading/index.vue'
  import Badge from '../components/badge/index.vue'
  import {mapGetters, mapActions} from 'vuex'
  import {getUrlParam} from '../libs/utils'
  import axios from 'axios'
  export default {
    components: {
      XHeader,
      Cell,
      Group,
      Loading,
      Badge
    },
    data () {
      return {
        showSignIn:false,
        fileRedPointCounts:0,
        redPointCounts:0,
        showLoading: true,
        loadingText: '加载中...',
//        hasAuth: false,
        redPoint:false
      }
    },
    computed: {
      ...mapGetters([
        'getUserInfo'
      ]),
      isSelfCompany(){
        if(this.getUserInfo.companyId === 12 || this.getUserInfo.companyId === 1829 || this.getUserInfo.companyId === 2042){
          return true;
        }
      },
      hasAuth () {
        // 是老板 或者 HR
        return !!(this.getUserInfo.isAdmin || this.getUserInfo.isHRManager)
//        if(res){
//          return true;
//        }else{
//          //管理职
//          if(this.getUserInfo.isDepManager || this.getUserInfo.isAssistantManager === 1){
//            return true
//          }
//        }
      },
      applicationCount () {
        return this.$store.state.applicationList.filter(function (application) {
          return application.applicantType === 1
        }).length
      }
    },
    mounted () {
      var self = this;
      var release = getUrlParam('release');
      if(release !== null){
//        self.$vux.confirm.show({
//          title:'release',
//          content:release,
//          onCancel () {},
//          onConfirm (){}
//        })
        self.$store.state.release = release;
      }

      self.showSignIn = self.$store.state.showSignIn;
      // 获取个人信息
      // 获取通讯录
      // 获取部门
      self.showLoading = true;
      axios.all([this.GET_USER_INFO(), this.GET_CONTACTS(), this.GET_DEPARTMENTS()])
        .then(axios.spread(function () {
          self.showLoading = false
      }))
      self.getCultureRedPoint();
      self.getRedPoint();
      this.$store.state.basicProfileListExpandedDept = []
    },
    methods: {
      ...mapActions([
        'GET_USER_INFO',
        'GET_CONTACTS',
        'GET_DEPARTMENTS'
      ]),
      //员工档案红点
      getRedPoint(){
        var self = this;
        this.$store.dispatch('getRedPoint').then(function (res) {
          if(res.result === 0){
            self.fileRedPointCounts = res.item;
          }
        })
      },
      //文化栏红点判断
      getCultureRedPoint(){
        var self = this;
        this.$store.dispatch('topicRedpoint').then(function (res) {
          if(res.result === 0){
            if(res.item > 0){
              self.redPoint = true;
              self.redPointCounts = res.item;
            }
          }
        })
      },
      judgeUserIdentity () {
        var self = this;
        if(self.showSignIn){
          //首次进入需要输入密码
          self.$vux.confirm.show({
            title:'员工档案密码保护',
            confirmType:'blue',
            content:'<input id="confirmInput" placeholder="请输入您的登录密码" type="password" class="confirm-input-i"/>',
            onCancel () {
              document.getElementById('confirmInput').value = '';
            },
            onConfirm () {
              self.checkPassword();
            }
          })
        }else{
          //第二次之后就不需要输入密码
          self.goProfile();
        }

      },
      goProfile(){
        var self = this;
        if(self.hasAuth){
          self.$router.push({path: '/staffprofile/list'})
        }else{
          console.log("this is not hasAuth");

          self.$store.dispatch('getOptionalWhomICanSeeList').then(function (res) {
            /*
            * 返回结果：如果data为undefined 是没有设置查看权限；
            * 如果data为[]，是 设置的可查看所有人
            * */
            if(res.result === 0){
              var list = res.data;
              if(list === undefined){
                if(self.getUserInfo.isDepManager || self.getUserInfo.isAssistantManager === 1){
                  //如果是管理职，虽然没有设置可见范围，但默认可以查看本部们的人
                  self.$router.push({path: '/staffprofile/list'})
                }else{
                  self.$router.push({path: '/staffprofile/profile/' + self.getUserInfo.mainContactId})
                }
              }else if(list.length > 0){
                var visibleList = [];
                res.data.forEach(function(res){
                  visibleList.push(res.contactId);
                });
                self.$store.state.authContactVisibleList = visibleList;
                self.$router.push({path: '/staffprofile/list'})
              }else{
                //可查看所有人
                var visibleList = ['all'];
                self.$store.state.authContactVisibleList = visibleList;
                self.$router.push({path: '/staffprofile/list'})
              }
            }
          })
        }
      },
      showHRSetting () {
        if (this.getUserInfo.isHRManager === 1 || this.getUserInfo.isAdmin === true) {
           this.$router.push({path: '/setting'})
        }
      },
      goBackToMP () {
        window.location.href='goBackToMP'
      },
      showToast(res){
        this.$vux.toast.show({
          type:'text',
          position:'bottom',
          width:'auto',
          text:res
        })
      },
      checkPassword(){
        var self = this;
        var pwd = document.getElementById('confirmInput').value;

        var params ={
          username:this.getUserInfo.phone,
          password:encodeURIComponent(pwd)
        }
        this.$store.dispatch('signIn',params).then(function (res) {
          if(res.expires_in !== undefined){
            self.$store.state.showSignIn = false;
            self.goProfile();
          }else{
            self.showToast('输入的密码有误');
            document.getElementById('confirmInput').value = '';
          }
        })
      }
    }
  }
</script>
<style>
  .confirm-input-i{
    padding-left: 7px;
    -webkit-border-radius: 3px;
    -moz-border-radius: 3px;
    border-radius: 3px;
    border:1px solid #CCCCCC;
    /*border:none;*/
    height:24px;
    width: 237px;
    font-size:13px;
    margin-top:15px;
    margin-bottom:14px;
    line-height:24px;
  }
  .redPoint-cell{
    position: absolute;
    top:-6px;
    left:30px;
    background-color: red;
    display: block;
    width:10px;
    height:10px;
    -webkit-border-radius: 50%;
    -moz-border-radius: 50%;
    border-radius: 50%;
    border:1px solid #FFFFFF;
  }
  #app .weui_media_box.weui_media_appmsg .weui_media_hd {
    width: 35px;
    height: 35px;
    margin-right: 14px;
  }
  #app .weui_media_box .weui_media_desc {
    padding-top: 8px;
  }
  .weui_cell_hd_img {
    display: block;
    width: 35px;
    margin-right: 14px;
  }
  /*#app .weui_cell {*/
    /*padding: 6.5px 15px;*/
  /*}*/
  #app .weui_cell .vux-label-desc {
    color: #999;
  }
</style>

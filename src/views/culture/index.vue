<template>
  <div>
    <x-header :left-options="{showBack: true,backText: '',preventGoBack:true}" @on-click-back="backIndex" title="制度与文化">
      <!--<img slot="right" src="../../../static/img/icon_search_1.png" @click="searchArticle" class="img-search">-->
      <div slot="right" class="title-filter-column" >
        <img slot="right" src="../../../static/img/icon_search_1.png" @click="searchArticle" class="img-search">
        <img v-if="isManager" @click="showFilter" src="../../../static/img/Plus@3x.png" class="img-plus">
        <ul class="title-column-ul" v-show="showFilterFlag">
          <li class="title-column-first-ui" @click="addColumn">新建栏目</li>
          <li @click="addArticle">新建文章</li>
        </ul>
      </div>
    </x-header>
    <div>
      <group>
        <swipeout>
          <swipeout-item v-for="(item,index) in culture.topicList" :key="index" :right-menu-width="btnWidth" transition-mode="follow">
            <div slot="right-menu">
              <swipeout-button :width="btnWidth" @click.native="onButtonClick(item.topicId)" type="warn">{{'删除'}}</swipeout-button>
            </div>
            <div slot="content" class="demo-content vux-1px-t">
              <cell :title="item.topicName" @click.native="topicDetail(item)" :inlineDesc="item.articleTitle" :isLink="true">
                <div slot="icon" class="redPoint-di">
                  <span v-if="item.redPoint" class="redPoint"></span>
                </div>
                <!--<span slot="value" v-if="item.redPoint"  class="redPoint"></span>-->
              </cell>
            </div>
          </swipeout-item>
        </swipeout>
      </group>
      <div v-if="showUnstate">
        <div class="flex-col-center mt-120">
          <img src="../../../static/img/column-unstate.png" class="img-column-unstate"/>
          <span  class="column-unstate-sp">暂无栏目</span>
        </div>
      </div>
    </div>
    <loading v-model="showLoading" :text="loadingText"></loading>
  </div>
</template>
<script>
  import XHeader from '../../components/x-header/index.vue'
  import Group from '../../components/group/index.vue'
  import Cell from '../../components/cell/index.vue'
  import Badge from '../../components/badge/index.vue'
  import Loading from '../../components/loading/index.vue'
  import {Swipeout,SwipeoutItem, SwipeoutButton} from '../../components/swipeout'
  export default{
    created(){
        this.getArticleTopicList();
        //判断是否具有权限
        var userInfo = this.$store.state.userInfo;
        var self = this;
        if(userInfo.isAdmin || userInfo.isHRManager ===1 || userInfo.isCultureManager === 1){
          self.isManager = true;
        }
    },
    data(){
      return{
        loadingText:'',
        showLoading:true,
        culture:{
          topicList:[]
        },
        isManager:false,
        showUnstate:false,
        showFilterFlag:false,
        btnWidth:60*document.getElementsByTagName("html")[0].getAttribute("data-dpr")
      }
    },
    components:{
      XHeader,
      Cell,
      Group,
      Badge,
      Swipeout,
      SwipeoutItem,
      SwipeoutButton,
      Loading
    },
    computed:{
      showColumnTip(){
          if(this.culture.topicList.length === 0){
            return true;
          }else{
            return false;
          }
      },
      showFlag(){
          return this.showFilterFlag;
      }
    },
    methods:{
      searchArticle(){
        this.$router.push('/culture/searchArticle')
      },
      getArticleTopicList(){
        var self = this;
        this.$store.dispatch('getArticleTopicList').then(function (res) {
          if(res.result === 0){
            self.culture.topicList = res.topicList;
            if(self.culture.topicList.length === 0){
              self.showUnstate = true;
            }else{
              self.culture.topicList.forEach(function (n) {
                //红点
                if(n.isUpdateArticle === 1){
                  n.redPoint = true;
                }
                if(n.articleTitle !== undefined && n.articleTitle !== "" ){
                  if(n.articleTitle.length >20){
                    n.articleTitle = n.articleTitle.substring(0,20)+"...";
                  }
                  n.articleTitle = n.articleTitle.split(',').join('， ');
                }else{
                  n.articleTitle = "暂无文章";
                }
              })
              var params = {
                topicList:res.topicList
              }
              self.$store.dispatch('setCulture',params)
            }

          }else if(res.respCode ==="1"){
            self.showToast(res.respDesc);
          }else{
            self.showToast(res.res_info);
          }
          self.showLoading = false;
        })
      },
      onButtonClick(topicId){
        var self = this;
        this.$vux.confirm.show({
          // 组件除show外的属性
          title:'确认删除',
          content:'<div style="color: #999999;">是否确认删除此栏目？栏目内的文章也将一并删除</div>',
          confirmText:'删除',
          onCancel () {
//            console.log(self) // 非当前 vm
//            console.log(_this) // 当前 vm
          },
          onConfirm () {
            var params ={
              topicId:topicId
            }
            self.$store.dispatch('deleteArticleTopic',params).then(function (res) {
              if(res.result === 0){
                self.getArticleTopicList();
                self.showToast('删除成功');
              }else if(res.respCode === "3"){
                self.showToast('您无权删除此栏目');
              }
            })
          }
        })

      },
      topicDetail(item){
        this.culture.topicId = item.topicId;
        this.culture.topicName = item.topicName;
        this.$store.dispatch('setCulture',this.culture);
        this.$router.push('/culture/rulesList');
      },
      addColumn(){
        this.$router.push('/culture/addColumn');
      },
      addArticle(){
        //是否有栏目列表
        if(this.culture.topicList.length === 0){
          this.showToast('请先新建栏目');
          return false;
        }else{
          this.$router.push('/culture/addArticle');
        }
      },
      showFilter(){
          this.showFilterFlag = !this.showFilterFlag;
      },
      backIndex(){
        this.$router.push('/')
      },
      showToast(res){
        this.$vux.toast.show({
          text:res,
          width:'auto',
          position:'bottom',
          type:'text'
        })
      }
    }
  }
</script>
<style lang="less" >
  .redPoint-di{
    position: relative;
    margin-right:9px;
    width:10px;
    height:10px;
  }
  .ftsize16{
    font-size:15px;
  }
  .redPoint{
    position: absolute;
    top:-11px;
    display: block;
    width:8px;
    height:8px;
    -webkit-border-radius: 50%;
    -moz-border-radius: 50%;
    border-radius: 50%;
    background-color: red;
  }
  .mt-120{
    margin-top:120px;
  }
  .column-unstate-sp{
    color: #999999;
    font-size:14px;
    margin-top: 6px;
  }
  .img-column-unstate{
    width:70px;
    height:70px;
  }
  .title-column-ul:before{
    content: "";
    display: inline-block;
    width: 0;
    height: 0;
    border-left: .213333rem solid transparent;
    border-right: .213333rem solid transparent;
    border-bottom: .266667rem solid #4a4a4a;
    position: absolute;
    top: -.24rem;
    right: .133333rem;
  }
  .title-column-first-ui{
    border-bottom: 1px #fff solid;
  }
  .is-android .title-column-ul{
    position: absolute;
    font-size:15px;
    height:90px;
    width:60px;
    top:40px;
    left:-29px;
    background-color: #4a4a4a;
    border-radius: 5px;
    padding: 0 16px;
    z-index: 99;
    text-align: center;
  }
  .title-column-ul{
    position: absolute;
    font-size:15px;
    height:90px;
    width:60px;
    top:34px;
    left:-29px;
    background-color: #4a4a4a;
    border-radius: 5px;
    padding: 0 16px;
    z-index: 99;
    text-align: center;
  }

  .is-iPhone .title-column-ul li{
    [data-dpr="3"] & {
      font-size:14px;
      /* 针对 5s/se 优化 */
      /*@media (max-width: 640px) {*/

      /*}*/
    }
  }
  .title-column-ul li{
    padding:12px 0;
    [data-dpr="2"] & {
      /* 针对 5s/se 优化 */
      @media (max-width: 640px) {
        font-size: 13px;
      }
    }
  }

  .title-filter-column{
    position: relative;
  }
  .img-search{
    width:18px;
    height:18px;
  }
  .vux-header-right{
    -webkit-tap-highlight-color: rgba(0,0,0,0)
  }
  .img-plus{
    width:20px;
    height:20px;
    padding-left: 19px;
    -webkit-tap-highlight-color: rgba(0,0,0,0)
  }
</style>

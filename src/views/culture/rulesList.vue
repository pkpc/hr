<template>
  <div>
    <x-header :left-options="{showBack: true,backText: '',preventGoBack:true}" @on-click-back="upBack" :title="topicDetail.topicName">
      <img slot="right" v-if="isManager" src="../../../static/img/Plus@3x.png" @click="addArticle" class="img-plus">
    </x-header>
    <div>
      <div class="flex-row-between h20 mt-22 mb-9">
        <div class="flex-row-start">
          <img src="../../../static/img/icon2.png" class="img-title">
          <p class="profile-title">栏目简介</p>
        </div>
        <a class="btn-right" v-if="isManager" @click="editContent">{{changeContent}}</a>
      </div>
      <div>
        <div id="topicDesc" :contenteditable="isEdit" ref="topicDesc" class="editArea"></div>
      </div>
      <!--<group gutter="0">-->
        <!--<x-textarea v-model="topicDesc" :height="textareaHeight" :readonly="!isEdit"></x-textarea>-->
      <!--</group>-->
      <div class="flex-row-start h20 mt-22 mb-9">
        <img src="../../../static/img/icon1.png" class="img-title">
        <p class="profile-title">{{articleCount}}</p>
      </div>
      <div v-if="unArticle" class="flex-col-center hFull">
        <img src="../../../static/img/icon-status.png" class="img-state">
        <p class="text-state">暂无文章</p>
      </div>
      <group gutter="0" v-else>
        <swipeout>
          <swipeout-item v-for="(item,index) in topicDetail.articleList" :key="index" :right-menu-width="btnWidth" transition-mode="follow">
            <div slot="right-menu">
              <swipeout-button :width="btnWidth" @click.native="onButtonClick(item.articleId)" type="warn">{{'删除'}}</swipeout-button>
            </div>
            <div slot="content" class="demo-content vux-1px-t">
              <cell @click.native="readArticle(item)" :title="item.title" :inlineDesc="item.desc" :isLink="true">
                <badge v-if="item.redPoint" :text="item.redPointDesc"></badge>
              </cell>
            </div>
          </swipeout-item>
        </swipeout>
      </group>
    </div>
    <loading v-model="showLoading" :text="loadingText"></loading>
  </div>
</template>
<script>
  import XHeader from '../../components/x-header/index.vue'
  import Group from '../../components/group/index.vue'
  import Cell from '../../components/cell/index.vue'
  import Badge from '../../components/badge/index.vue'
  import XTextarea from '../../components/x-textarea/index.vue'
  import Loading from '../../components/loading/index.vue'
  import {Swipeout,SwipeoutItem, SwipeoutButton} from '../../components/swipeout'
  export default{
    created(){
      this.showLoading = true;
      this.culture = this.$store.getters.getCulture;
      if(this.culture.isPreview !== undefined){
        delete this.culture.isPreview;
      }
      var userInfo = this.$store.state.userInfo;
      var self = this;
//      self.$vux.loading.show({})
      if(userInfo.isAdmin || userInfo.isHRManager ===1 || userInfo.isCultureManager === 1){
        self.isManager = true;
      }
      var params = {
        topicId:this.culture.topicId
      };
      this.getArticleTopic(params,0);
    },
    mounted(){

      //对不同型号的手机设置文本域不同的高
      if(document.getElementsByTagName('body')[0].classList.contains('is-iPhone')){
        this.textareaHeight = 250;
      }else{
        this.textareaHeight = 120;
      }
    },
    data(){
      return{
        topicDesc:'',
        loadingText:'',
        showLoading:true,
        isManager:false,
        isEdit:false,
        textareaHeight:0,
        culture:{},
        topicDetail:{},
        btnWidth:60*document.getElementsByTagName("html")[0].getAttribute("data-dpr"),
        unArticle:false
      }
    },
    components:{
      XHeader,
      Cell,
      Group,
      Badge,
      XTextarea,
      Swipeout,
      SwipeoutItem,
      SwipeoutButton,
      Loading
    },
    computed:{
      articleCount(){
        if(this.topicDetail.articleList === undefined || this.topicDetail.articleList.length===0){
          return "文章数 0";
        }else{
          return   "文章数 "+this.topicDetail.articleList.length;
        }
      },
      changeContent(){
          if(this.isEdit){
              return "保存";
          }else{
              return "编辑";
          }
      }
    },
    methods:{
      getArticleTopic(params,index){
        var self = this;
        this.$store.dispatch('getArticleTopic',params).then(function (res) {
          self.topicDetail = res.topic;
          //添加栏目简介 只有在刷新页面时才重新加载栏目简介，在index为1时，即为删除时不加载简介
          if(index === 0){
            //用x-textarea
//            self.topicDesc = res.topic.topicDesc;
            //用contenteditable编辑属性
            var parent = document.getElementById('topicDesc');
            parent.innerHTML = self.topicDetail.topicDesc;
          }

          var list = self.topicDetail.articleList;
          if(list !== undefined && list.length>0){
            list.forEach(function (n) {
              if(n.title.length >17){
                n.title = n.title.substring(0,17)+'...';
              }
              var createTime =  n.createTime.split(' ')[0].split('-');
              if(n.lastEditTime === undefined){//刚发布时的情况
                n.desc = n.authorName+" "+createTime.join('/')+' 发布';
              }else{  //更新文章
                if(n.lastEditTime === n.createTime){ //兼容后台的部分数据问题
                  n.desc = n.authorName+" "+createTime.join('/')+' 发布';
                }else{
                  var lastEditTime =  n.lastEditTime.split(' ')[0].split('-');
                  n.desc = n.editorName+" "+lastEditTime.join('/')+' 更新';
                }
              }
              //检测红点
              //文章是否已读hasRead： 1.是，0.否
              if(n.hasRead === 0){
                if(n.isReadUpdate === 1){
                  n.redPoint = true;
                  n.redPointDesc = '新';
                }else if(n.isReadUpdate === 0){
                  n.redPoint = true;
                  n.redPointDesc = '更新';
                }
              }
            })
          }else{
            self.unArticle = true;
          }
          self.showLoading = false;
//          self.$vux.loading.hide();
        })
      },
      readArticle(item){
        this.culture.articleId = item.articleId;
        this.$store.dispatch('setCulture',this.culture);
        this.$router.push('/culture/preview');
      },
      editContent(){
        if(!this.isEdit){
          this.isEdit = true;
        }else{
          this.isEdit = false;
          var params = {
            topicName:this.topicDetail.topicName,
            topicDesc:this.$refs.topicDesc.innerHTML,
//            topicDesc:this.topicDesc,
            topicId:this.topicDetail.topicId
          }
          var self = this;
          this.$store.dispatch('updateArticleTopic',params).then(function (res) {
            if(res.result === 0){
              self.showToast('修改成功');
            }else if(res.result == 1){
              self.showToast('修改失败');
            }else if(res.respCode === "3"){
              self.showToast('您无权编辑栏目简介');
            }
          })
        }
      },
      addArticle(){
          var params ={
            topicName:this.culture.topicName,
            topicList:this.culture.topicList,
            topicId:this.culture.topicId
          }
          this.$store.dispatch('setCulture',params);
          this.$router.push('/culture/addArticle')
      },
      onButtonClick(id){
        var self = this;
        this.$vux.confirm.show({
          // 组件除show外的属性
          title:'确认删除',
          content:'<div class="confirm-sp">是否确认删除文章？删除后将无法恢复</div>',
          confirmText:'删除',
          onCancel () {

          },
          onConfirm () {
            self.$store.dispatch('deleteArticle', {articleId: id}).then(function (res) {
              if (res.result === 0) {
                var params = {
                  topicId: self.culture.topicId
                };
                self.getArticleTopic(params, 1);
                self.showToast(res.res_info)
              } else if (res.result === "1") {
                self.showToast(res.res_info)
              } else if (res.respCode === "3") {
                self.showToast('您无权删除此文章');
              }
            })
          }
        })
      },
      upBack(){
        this.$router.push('/culture')
      },
      showToast(res){
        this.$vux.toast.show({
          type:'text',
          position:'bottom',
          width:'auto',
          text:res
        })
      }
    }
  }
</script>
<style>
  .confirm-sp{
    color: #999999;
    font-size: 14px;
  }
  .editArea{
    width:92%;
    height:auto;
    line-height:22px;
    min-height:110px;
    background-color: #FFFFFF;
    padding: 9px 16px;
    font-size: 14px;
    border:none;
  }
  #edit-test,#edit-test *{
    -webkit-user-select: text!important;
    user-select:text;
  }
  /**{*/
    /*margin: 0;*/
    /*padding: 0;*/
    /*user-select:text;*/
    /*-webkit-user-select: auto;*/
  /*}*/
  textarea:disabled {
    background-color: #FFFFFF!important;
  }
  .is-iPhone textarea:disabled {
    background-color: #FFFFFF!important;
  }
  .text-state{
    margin-top: 16px;
    color: #999;
    font-size: 15px;
  }
  .hFull{
    width:100%;
    margin-top: 60px;
  }
  .img-state{
    width:70px;
    height:70px;
    margin-left: 9px;
  }
  .flex-col-center{
    display: flex;
    justify-content:center;
    align-items: center;
    flex-flow: column nowrap;
  }

  .mb-9{
    margin-bottom:9px;
  }
  .text-content{
    width:92%;
    min-height: 72px;
    font-size: 15px;
    color: #333;
    border:none;
    padding: 12px 16px;

  }
  .h20{
    height:20px;
  }
  .mt-22{
    margin-top: 22px;
  }
  .btn-right{
    font-size: 13px;
    color: #4A90E2;
    margin-right: 14px;
  }
  .profile-title{
    font-size: 13px;
    color: #999999;
    margin-left: 4px;
  }
  .flex-row-between{
    display: flex;
    justify-content:space-between;
    align-items: center;
    flex-flow: row nowrap;
  }
  .flex-row-start{
    display: flex;
    justify-content:flex-start;
    align-items: center;
    flex-flow: row nowrap;
  }
  .img-title{
    width:12px;
    height:12px;
    margin-left: 8px;
  }
</style>

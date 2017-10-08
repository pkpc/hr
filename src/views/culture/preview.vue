<template>
  <div>
    <x-header @on-click-back="backTopicDetail" :left-options="{showBack: true,backText: '',preventGoBack:true}" :title="articleDetail.topicName">
      <a slot="right" v-if="haveAuth" @click="nextStep">{{stateName}}</a>
    </x-header>
    <div class="add-article">
      <div class="main-container">
        <!--文章标题-->
        <div style="text-align:left;"  class="editor-title">
          <p id="articleTitle" contenteditable="true" placeholder="请输入标题" class="article-title"></p>
        </div>
        <!--中间的人事信息 -->
        <div class="cell-basic-info">
          <div class="flex-row-between cell-width-full">
            <div class="flex-row-start">
              <img id="authorImg" :src="basicInfo.imgName" class="img-photo">
              <div>
                <div class="flex-row-start">
                  <span class="cell-basic-name">{{basicInfo.name}}</span>
                  <span class="cell-basic-position">{{basicInfo.position}}</span>
                </div>
                <div class="flex-row-start">
                  <span class="cell-basic-time">{{basicInfo.time}}</span>
                </div>
              </div>
            </div>
            <div v-if="showReadDetail" class="flex-row-start">
                <img @click="seeRange" src="../../../static/img/range.png" class="img-range">
                <span @click="seeRange" class="cell-basic-col">{{articleDetail.totalUser}}</span>
                <img @click="seeHaveRead" src="../../../static/img/hasRead.png" class="img-hasRead">
                <span @click="seeHaveRead" class="cell-basic-col">{{articleDetail.hasReadUser}}&nbsp/&nbsp{{articleDetail.notReadUser}}</span>

              <!--<img v-show="basicInfo.topicName !== undefined" src="../../../static/img/icon9.png" class="img-col">-->
              <!--<span class="cell-basic-col">{{basicInfo.topicName}}</span>-->
            </div>
          </div>
        </div>
        <!--文章内容-->
        <div id="editorContent" style="text-align:left;" class="editor-content" placeholder="请输入正文"></div>
        <!--已阅读按钮-->
        <div v-show="articleDetail.needRead" class="flex-row-center mt-22 mb-22">
          <a class="btn_reading" :style="{backgroundColor:activeRead}" @click="haveReading">我已阅读</a>
        </div>
        <div id="toolbar" class="toolbar " style="display: none;"></div>
      </div>
    </div>
    <previewer :list="attachmentList" ref="previewer" :options="options"></previewer>
    <loading v-model="showLoading" :text="loadingText"></loading>
  </div>
</template>
<script>
  import XHeader from '../../components/x-header/index.vue'
  import Group from '../../components/group/index.vue'
  import Cell from '../../components/cell/index.vue'
  import Loading from '../../components/loading/index.vue'
  import Previewer from '../../components/previewer/index.vue'
  import dateFormat from '../../tools/date/format'
//  import Wangeditor from '../../../static/js/wangEditor.js'
  import Wangeditor from 'wangeditor'
  export default{
    mounted() {
      /*编辑器相关内容初始化*/
        var self = this;
        var interval;
      self.$vux.loading.show({});
        //滚动到底部
        function scrollToEnd(){
          document.body.scrollTop = document.body.scrollHeight;
        }
        // 设置内容sr
//      this.editor.txt.html('<p>通过 js 动态设置的内容</p>')
        this.editor = new Wangeditor('#toolbar','#editorContent');
        this.editor.customConfig.onchange = (html) => {
          this.articleDetail.editorContent = html
        }
        //编辑器初始化
        this.editor.create();

      var ele = document.getElementsByClassName('w-e-text')[0];
      var title = document.getElementsByClassName('article-title')[0];
      //把两个可输入的编辑框禁用
      this.editor.$textElem.attr('contenteditable', false);
      ele.blur();
      title.setAttribute('contenteditable',false);

      ele.onfocus = function () {
        interval = setInterval(function() {
          scrollToEnd();
        }, 500)
        self.isEditing = true;
      }
      ele.onblur = function () {
        self.isEditing = true;
        clearInterval(interval);
      }
      title.onfocus = function () {
        self.isEditing = false;
      }

      /*数据初始化*/
      this.articleDetail = this.$store.getters.getCulture;
      this.$set(this.articleDetail, 'needRead', false)
      this.userInfo = this.$store.getters.getUserInfo;
      if(this.articleDetail.isPreview === undefined){
        //判断是否有编辑的权限
        if(this.userInfo.isAdmin || this.userInfo.isHRManager === 1 || this.userInfo.isCultureManager === 1){
          this.haveAuth = true;
        }
        var params ={
          articleId:this.articleDetail.articleId,
          topicName:this.articleDetail.topicName
        }
        var self = this;
        this.$store.dispatch('getArticle',params).then(function (res) {
          if(res.result === 0){
            var data = {};
            if(res.article.lastEditTime !== undefined){
              //更新文章
              if(res.article.lastEditTime === res.article.createTime){
                data.name = res.article.authorName;
                data.position = res.article.authorPosition;
                data.time = res.article.createTime.split(' ')[0].split("-").join('/').substr(2) +" 更新";
                data.topicName = res.article.topicName;
                data.imgName = 'https://www.erplus.co/uploads/avatars'+ res.article.authorImage;
              }else{
                data.name = res.article.editorName;
                data.position = res.article.editorPosition;
                data.time = res.article.lastEditTime.split(' ')[0].split("-").join('/').substr(2)+" 更新";
                data.topicName = res.article.topicName;
                data.imgName = 'https://www.erplus.co/uploads/avatars'+ res.article.editorImage;
              }
            }else{
              //发布文章
              data.name = res.article.authorName;
              data.position = res.article.authorPosition;
              data.time = res.article.createTime.split(' ')[0].split("-").join('/').substr(2) +" 发布";
              data.topicName = res.article.topicName;
              data.imgName = 'https://www.erplus.co/uploads/avatars'+ res.article.authorImage;
            }
            self.basicInfo = data;
            if(res.article.hasRead === 0){
              self.activeRead = "#4A90E2";
            }else if(res.article.hasRead === 1){
              self.activeRead = "#999999";
            }
            self.articleDetail.articleName = res.article.title;
            self.articleDetail.hasReadUser = res.article.hasReadUser;
            self.articleDetail.notReadUser = res.article.notReadUser;
            self.articleDetail.totalUser = res.article.totalUser;
            self.articleDetail.articleContent = res.article.content;
            self.articleDetail.range = res.article.range;
            self.articleDetail.createTime = res.article.createTime;
            self.articleDetail.mainRange = res.article.mainRange;
            self.articleDetail.needRead = res.article.needRead;
            self.articleDetail.topicId = res.article.topicId;
            document.getElementById('articleTitle').innerHTML = self.articleDetail.articleName;
            self.editor.txt.html(self.articleDetail.articleContent);
            self.showReadDetail = true;
          }
          //
          if(self.articleDetail.isPreview === undefined) {
            var imageList = document.getElementsByClassName("addImage");
            console.log(imageList)
            for(var i = 0;i<imageList.length;i++){
              console.log(imageList[i]);
              console.log(imageList[i].src);
              self.srcList.push(imageList[i].src);
              imageList[i].addEventListener("click",self.previewImage);
              self.getImgNaturalDimensions(imageList[i].src, self.addImgToList)
            }
//            var imageList = document.getElementsByClassName("addImage");
//            for (var i = 0; i < imageList.length; i++) {
//              imageList[i].addEventListener("click", self.previewImage);
//              self.getImgNaturalDimensions(imageList[i].currentSrc, self.addImgToList)
//            }
          }
          self.showLoading = false;

        })
      }else{
        const data = {
          name:this.userInfo.name,
          position:this.userInfo.position,
          time:dateFormat(new Date(), 'YYYY-MM-DD HH:mm')+" 创建",
          imgName:'https://www.erplus.co/uploads/avatars'+this.userInfo.imageName,
          topicName:this.articleDetail.topicSelected[0]
        }
        this.basicInfo = data;
      }
      //给文章标题和内容赋值
      if(this.articleDetail.articleName !== undefined){
        document.getElementById('articleTitle').innerHTML = this.articleDetail.articleName;
        this.editor.txt.html(this.articleDetail.articleContent);
      }
      if(this.articleDetail.isPreview !== undefined){
        var imageList = document.getElementsByClassName("addImage");
        console.log(imageList)
        for(var i = 0;i<imageList.length;i++){
          console.log(imageList[i]);
          self.srcList.push(imageList[i].src);
          imageList[i].addEventListener("click",self.previewImage);
          self.getImgNaturalDimensions(imageList[i].src, self.addImgToList)
        }
      }

      self.$vux.loading.hide();
      self.showLoading = false;
    },
    data(){
      return{
        srcList:[],//用于储存img的src，当图片有删除是需要用到
        showReadDetail:false,
        attachmentList:[],
        loadingText:'',
        showLoading:true,
        editor:'',
        editorContent:'',
        isShowBar:false,
        activeIndex:0,
        imgIndex:0,
        haveAuth:false,
        basicInfo:{},
        userInfo:{},
        isEditing:false,
        stateName:'编辑',
        articleDetail:{},
        activeRead:"#4A90E2",
        options: {
          getThumbBoundsFn (index) {
            // find thumbnail element
            let thumbnail = document.querySelectorAll('.addImage')[index]
            // get window scroll Y
            let pageYScroll = window.pageYOffset || document.documentElement.scrollTop
            // optionally get horizontal scroll
            // get position of element relative to viewport
            let rect = thumbnail.getBoundingClientRect()
            // w = width
            return {x: rect.left, y: rect.top + pageYScroll, w: rect.width}
            // Good guide on how to get element coordinates:
            // http://javascript.info/tutorial/coordinates
          }
        },
      }
    },
    components:{
      XHeader,
      Cell,
      Group,
      Loading,
      Previewer
    },
    methods:{
      previewImage(e){
        var selectedSrc = e.target.currentSrc;
        console.log(selectedSrc)
//        var index = e.target.id.substr(4);
        var index = this.srcList.indexOf(selectedSrc);

        this.$refs.previewer.show(parseInt(index));
      },
      seeRange(){
        this.$router.push({name:'rangeList',params:{target:'preview'}})
      },
      seeHaveRead(){
        this.$router.push({name:'read',params:{detail:{articleId:this.articleDetail.articleId}}})
      },
      haveReading(){
        if(this.articleDetail.isPreview === undefined && this.activeRead==="#4A90E2"){
          var params = {
            articleId:this.articleDetail.articleId
          }
          var self = this;
          this.$store.dispatch('iHaveRead',params).then(function (res) {
              if(res.result === 0){
                self.activeRead = "#999999";
              }
          })
        }
      },
      showFontStyle(){
        this.isShowBar = !this.isShowBar;
      },
      nextStep(){
        this.$store.dispatch('setCulture',this.articleDetail);
        this.$router.push('/culture/addArticle');
      },
      getEditorContent(){  // 获取编辑器 内容区内容
        this.editor.txt.append('<img src="../../../static/img/icon5.png">');
//        var editor = this.editor;
//        this.editor.cmd.do('formatBlock', 'h4');
//        alert(this.editorContent)  // 获取 html 格式
        // this.editor.$txt.text();  // 获取纯文本
        // this.editor.$txt.formatText();  // 获取格式化后的纯文本
      },
      addImgToList (imgSrc, imgWidth, imgHeight, insertType) {
        console.log(imgSrc)
        console.log('宽：'+imgWidth);
        console.log('高：'+imgHeight);
        this.attachmentList.push({
          src: imgSrc,
          w: imgWidth,
          h: imgHeight
        })
      },
      hexToDecimal (hexValue) {
        // 十六进制＝> 十进制
        hexValue = hexValue.toString()
        return parseInt(hexValue, 16)
      },
      getImgNaturalDimensions (imgSrc, callback, insertType) {
        console.log('这是imgSrc：')
        console.log(imgSrc)
        // 根据src获取图片真实宽高
        var image = new Image()
        image.src = imgSrc
//        this.attachmentList.push({
//          src: imgSrc,
//          w: image.width,
//          h: image.height,
////          id:img.id
//        })
        console.log(this.attachmentList)
        image.onload = function() {
          callback(imgSrc, image.width, image.height, insertType)
        }
      },
      backTopicDetail(){
        this.editor.txt.html("");
        this.articleDetail.needRead = false;
        this.$router.back();
      }
    },
    beforeRouteLeave(to,from,next){
      //用于处理从预览处一直回退到查看页时还保留有isPreview字段导致没有权限进行编辑
      if(to.path === '/culture/articleSetting'){
        delete this.articleDetail.isPreview
        this.$store.dispatch('setCulture',this.articleDetail);
      }
      next();
    }

  }
</script>
<style scoped>

  .img-hasRead{
    width:15px;
    height:15px;
    margin-left: 20px;
    margin-right:5px;
  }
  .img-range{
    width:15px;
    height:15px;
    margin-right: 5px;
  }
  .main-container{
    height: 900px;
    overflow-y: scroll;
    /*margin-bottom:100px;*/
    -webkit-overflow-scrolling: touch;
    margin: 0;

    width: 100%;
    overflow-x: hidden;

    list-style-type: none;
    flex: 1;
  }
  .vux-header + div {
    flex: 1;
    height: 100%;
    overflow-x: hidden;
     overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    /*-webkit-transform: translateZ(0px);*/
    /* z-index: 1; */
  }
  .main{
    height: 100%;
    overflow-y: scroll;
  }
  .mb-22{
    margin-bottom:22px;
  }
  .btn_reading{
    width:103px;
    height:32px;
    line-height:32px;
    background: #4A90E2;
    border-radius: 3px;
    color: #FFFFFF;
    font-size:14px;
    text-align: center;
  }
  .cell-basic-col{
    color: #999999;
    font-size:14px;
  }
  .cell-basic-name{
    color: #333333;
    font-size:14px;
  }
  .cell-basic-position{
    color: #333333;
    font-size:14px;
    margin-left:10px;
  }
  .cell-basic-time{
    color: #999999;
    font-size:12px;
  }
  .cell-width-full{
    width:100%;
  }
  .img-col{
    width:13px;
    height:13px;
    margin-right: 6px;
  }
  .cell-basic-info{
    padding: 0 16px;
    height:54px;
    border-top:1px solid #EFEFEF;
    border-bottom:1px solid #EFEFEF;
    display: flex;
    align-items: center;
  }
  .img-photo{
    width:30px;
    height:30px;
    border-radius: 50%;
    margin-right:7px;
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
  .active{
    color:#FFCF4A;
  }
  .bar-style img{
    width:14px;
    height:17px;
    margin-right:5px;
  }
  .bar-pic{
    display: flex;
    align-items: center;
  }
  .bar-pic img{
    width:20px;
    height:20px;
    margin-right:5px;
  }
  .bar-undo img{
    width:20px;
    height:20px;
    margin-right:5px;
  }
  .bar-redo img{
    width:20px;
    height:20px;
    margin-right:5px;
  }
  #editorContent{
    z-index: 999!important;
  }
  .li-style-H2{
    font-size:13px;
  }
  .li-style-H3{
    font-size:12px;
  }
  .li-style-H4{
    font-size:11px;
  }
  .li-style-bold{
    padding:7px 10px;
    border-right: 1px solid #ffffff;
  }
  .toolbar-ul-style:before{
    content: "";
    display: inline-block;
    width: 0;
    height: 0;
    border-left: .213333rem solid transparent;
    border-right: .213333rem solid transparent;
    border-top: .266667rem solid rgba(38,39,40,0.80);
    position: absolute;
    top: 30px;
    right:83px;
  }
  .bar-style{
    position: relative;
  }
  .toolbar-ul-style li{
    float: left;
  }
  .toolbar-ul-style{
    position: absolute;
    background-color:rgba(38,39,40,0.80) ;
    border-radius: 6px;
    color: #ffffff;
    width:160px;
    height:30px;
    top:-53px;
    left:-63px;
    display: flex;
    justify-content:space-around;
    align-items: baseline;
    z-index: 999;
  }
  .edit-toolbar div{
    position: relative;
    display: flex;
    justify-content: flex-start;
    align-items: flex-end;
  }
  .edit-toolbar{
    display: flex;
    justify-content:space-around;
    align-items: center;
    flex-flow: row nowrap;
    color: #777777;
    font-size:15px;
    background-color: #F1F1F1;
    height:44px;
  }
  .add-article{
    /*position: absolute;*/
    /*top: 60px;*/
    /*bottom: 50px;*/
    /*bottom: 0;*/
    display: flex;
    flex-direction: column;
    width: 100%;
    /*height:auto;*/
    /* 使之可以滚动 */
    overflow-y: hidden;
    /*padding-bottom: 44px;*/
    /* 增加该属性，可以增加弹性 */
    /*-webkit-overflow-scrolling: touch;*/
    background-color: #FFFFFF;
    -webkit-tap-highlight-color: rgba(0,0,0,0)
  }
  .editor-content{
    padding: 7px 16px 20px;
    /*min-height: 400px;*/
    height:auto;
  }
  .editor-title{
    overflow: hidden;
    background-color: #FFFFFF;
    font-size: 22px;
    min-height: 50px;
    padding:7px 16px;
    height:auto;
    /*border-bottom: 1px dashed #CCCCCC;*/
    align-items: center;
    display: flex;
    flex-shrink:0;
  }
  .text {
    border: 1px solid #ccc;
    height: 400px;
  }
  .editorContainer {
    width: 90%;
    height: 90%;
    border: 1px solid #ddd;
  }
  .w-e-text:empty::before{
    color:lightgrey;
    content:attr(placeholder);
  }
  .article-title{
    width:100%;
    font-size:22px;
  }
  .article-title:empty::before{
    color:lightgrey;
    content:attr(placeholder);
  }
  .content-editing:empty::before{
    color:lightgrey;
    content:attr(placeholder);
  }
</style>

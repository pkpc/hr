<template>
  <div>
    <x-header class="header" :left-options="{showBack: true,backText: ''}" :title="'新文章'" ref="header">
      <a slot="right" @click="nextStep">下一步</a>
    </x-header>
    <div class="add-article">
      <!--文章内容-->
      <div class="main-container">
        <div style="text-align:left;" class="editor-title">
          <p id="articleTitle" contenteditable="true" ref="articleTitle" placeholder="请输入标题" class="article-title"></p>
        </div>
        <!--编辑器-->
        <!--<div class="editor-container" id="editor-container"></div>-->
        <div id="editorElem" style="text-align:left;" class="editor-content" placeholder="请输入正文"></div>
        <!--<input unselectable="on" id="unviliable" placeholder="hhh" style="font-size: 30px;color: #4a90e2;margin-left: 10px;opacity:0;"  ref="unviliable"/>-->
        <!--编辑器初始化的工具栏；默认隐藏-->
        <div id="toolbar" class="toolbar " style="display: none;"></div>
        <!--<div id="toolbar">-->
          <!--&lt;!&ndash; Add font size dropdown &ndash;&gt;-->
          <!--<select class="ql-header">-->
            <!--<option value="1"></option>-->
            <!--<option value="2"></option>-->
            <!--<option value="3"></option>-->
            <!--<option value="4"></option>-->
            <!--<option value="5"></option>-->
            <!--<option value="6"></option>-->
            <!--&lt;!&ndash; Note a missing, thus falsy value, is used to reset to default &ndash;&gt;-->
            <!--<option selected></option>-->
          <!--</select>-->
          <!--&lt;!&ndash; Add a bold button &ndash;&gt;-->
          <!--<button class="ql-bold"></button>-->

          <!--&lt;!&ndash;斜体按钮&ndash;&gt;-->
          <!--<button class="ql-italic"></button>-->

          <!--&lt;!&ndash;下划线按钮&ndash;&gt;-->
          <!--<button class="ql-underline"></button>-->

          <!--&lt;!&ndash;插入图片按钮&ndash;&gt;-->
          <!--<button class="ql-image"></button>-->

          <!--&lt;!&ndash;undo按钮&ndash;&gt;-->
          <!--<button class="btn-undo-redo undo" @click="handlerUndoRedoClick(0)">-->
            <!--<svg width="14" height="7" viewBox="0 0 14 7">-->
              <!--<g fill="#979797" fill-rule="evenodd">-->
                <!--<path d="M1.037 2.924s.97-2.28 5.207-2.28c4.236 0 7.18 4.32 7.18 4.32S9.043 3.2 6.795 3.37C4.55 3.54 3.66 5.226 3.66 5.226L1.038 2.924z"/>-->
                <!--<path d="M.093.516V6.81h5.66"/>-->
              <!--</g>-->
            <!--</svg>-->
          <!--</button>-->

          <!--&lt;!&ndash;redo按钮&ndash;&gt;-->
          <!--<button class="btn-undo-redo redo" @click="handlerUndoRedoClick(1)">-->
            <!--<svg width="14" height="7" viewBox="0 0 14 7">-->
              <!--<g fill="#979797" fill-rule="evenodd">-->
                <!--<path d="M12.463 2.624s-.97-2.28-5.207-2.28c-4.236 0-7.18 4.32-7.18 4.32S4.457 2.9 6.705 3.07C8.95 3.24 9.84 4.926 9.84 4.926l2.623-2.303z"/>-->
                <!--<path d="M13.407.216V6.51h-5.66"/>-->
              <!--</g>-->
            <!--</svg>-->
          <!--</button>-->
        <!--</div>-->
      </div>
      <!--工具栏-->
      <div ref="toolbar" class="edit-toolbar" v-show="isEditing">
        <label class="bar-pic" for="file">
          <input unselectable="on" id="unviliable"  placeholder="hhh" style="width:2px;font-size: 30px;color: #4a90e2;margin-left: 10px;opacity:0;"  ref="unviliable"/>
          <input type="file" id="file" style="display: none" multiple="multiple" @change="fileUploadChange"/>
          <img src="../../../static/img/icon5.png">
          <span>图片</span></label>
        <label class="bar-style" @click="showFontStyle">
          <img src="../../../static/img/icon6.png">
          <span>格式{{fullHeight}}</span>
          <ul class="toolbar-ul-style" v-show="isShowBar">
            <li class="li-style-bold" :class="{active:activeIndex===1}" @click.stop="getEditorBold">B</li>
            <li class="li-style-H1" :class="{active:activeIndex===2}" @click.stop="getEditorH1">H<small><small>1</small></small></li>
            <li class="li-style-H2" :class="{active:activeIndex===3}" @click.stop="getEditorH2">H<small><small>2</small></small></li>
            <li class="li-style-H3" :class="{active:activeIndex===4}" @click.stop="getEditorH3">H<small><small>3</small></small></li>
            <li class="li-style-H4" :class="{active:activeIndex===5}" @click.stop="getEditorH4">H<small><small>4</small></small></li>
          </ul>
        </label>
        <div class="bar-undo" @click="getEditorUndo">
          <img src="../../../static/img/icon7.png">
          <span>撤销</span>
        </div>
        <div class="bar-redo" @click="getEditorRedo">
          <img src="../../../static/img/recovery.png">
          <span>恢复</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import XHeader from '../../components/x-header/index.vue'
  import Group from '../../components/group/index.vue'
  import Cell from '../../components/cell/index.vue'
  import Wangeditor from 'wangeditor'
  import Quill from 'quill'
  export default{
    created(){
      this.culture = this.$store.getters.getCulture;
    },
    mounted() {
      this.innerHeight =  window.innerHeight;
      var self = this;
//      this.$nextTick(()=>{
//        this.initEditor();
//      })
      //初始化编辑器
      let editToolbar = document.querySelector('.edit-toolbar')
      this.editor = new Wangeditor('#toolbar','#editorElem');
      this.editor.customConfig.onchange = (html) => {
        this.editorContent = html
      }
      this.editor.create();

      var ele = document.getElementsByClassName('w-e-text')[0];
      var inputEle = document.getElementById('unviliable');
      var title = document.getElementsByClassName('article-title')[0];
//      document.getElementsByClassName('article-title')[0].focus();
      title.focus();
      //编辑已有文章
      if(this.culture.articleId !== undefined){
        title.innerHTML = this.culture.articleName;
        this.editor.txt.html(this.culture.articleContent);
      }else{
        //新建文章时从设置页或者预览页回退至本页
        if(this.culture.articleName !== undefined){
          title.innerHTML = this.culture.articleName;
          this.editor.txt.html(this.culture.articleContent);
        }
      }
      //用于给图片编号，如果在已有两张图片的情况进行编辑，编号在此基础上递增；
      this.imgIndex = document.getElementsByClassName('addImage').length;
      if(document.getElementsByTagName('body')[0].classList.contains('is-android')){
        this.editor.$textElem.attr('contenteditable', false);
      }
      var timer, windowInnerHeight;
      function eventCheck(e) {
        if (e) {
          self.flag = self.flag + '1进入';
          //click,focus事件触发的
          if(e.type !== "click"){
            // 失去焦点的时候
            self.isEditing = true;
            self.flag = self.flag + '1true';
            //当点击ios完成回收虚拟键盘时去掉工具栏
            if(document.getElementsByTagName('body')[0].classList.contains('is-iPhone')){
              setTimeout(()=>{
                if(!self.iosOff){
                  self.isEditing = false;
                }
              },100)
            }else{
//              setTimeout(()=>{
//                if(!self.androidOff){
//                  self.isEditing = false;
//                }
//              },200)
            }
          }else{
            //聚焦的时候
            self.isEditing = true;
            self.flag = self.flag + '2true';
            self.iosOff = false;
            self.androidOff = false;
          }
          if (e.type == 'click') {//如果是点击事件启动计时器监控是否点击了键盘上的隐藏键盘按钮，没有点击这个按钮的事件可用，keydown中也获取不到keyCode值
            setTimeout(function () {//由于键盘弹出是有动画效果的，要获取完全弹出的窗口高度，使用了计时器
//              eventCheck()
              self.flag = self.flag + '1setTimeout';
              windowInnerHeight = window.innerHeight;//获取弹出android软键盘后的窗口高度
              timer = setInterval(function () { eventCheck() }, 100);//100ms检查下窗口高度是否改变
            }, 500);
          }
          else clearInterval(timer);
        }
        else { //计时器执行的，需要判断窗口可视高度，如果改变说明android键盘隐藏了
//          if (window.innerHeight > windowInnerHeight) {//这里逻辑可以更改下，有可能其他js事件会导致高度变化，这里就只做个简单判断了
//            clearInterval(timer);
//            //android键盘隐藏--通过点击键盘隐藏按钮
//            self.isEditing = false;
//            self.flag = self.flag + '3false';
//          }else{
//            self.flag = self.flag + '4false';
//          }
          if (window.innerHeight > windowInnerHeight) {//这里逻辑可以更改下，有可能其他js事件会导致高度变化，这里就只做个简单判断了
            clearInterval(timer);
            //android键盘隐藏--通过点击键盘隐藏按钮
            self.isEditing = false;
            self.flag = self.flag + '3true';
          }else{
            self.isEditing = true;
            self.flag = self.flag + '4false';
          }
        }
//        title.innerHTML = window.innerHeight +'和'+windowInnerHeight;
//        title.innerHTML = self.flag;
      }
      ele.onclick = function (event) {
        console.log('我点击了')
        self.isEditing = true;
        self.flag = self.flag + '4true';
        self.editor.$textElem.attr('contenteditable', true);
        self.flag = self.flag + '1eventCheck';
        eventCheck(window.event);
      }
      ele.onfocus = function (event) {
        self.isEditing = true;
        self.flag = self.flag + '5true';
        setTimeout(function () {
//          console.log(document.body.scrollTop)
//          self.$refs.toolbar.scrollIntoView(true)
        },300)
      }
      ele.onblur = function () {
        self.flag = self.flag + '2eventCheck';
        eventCheck(window.event);
      }
      title.onfocus = function () {
        self.isEditing = false;
        self.flag = self.flag + '6false';
      }
      inputEle.onblur = function () {
        setTimeout(()=>{
          if(self.innerHeight === self.keyboardHeight){
            if(document.getElementsByTagName('body')[0].classList.contains('is-iPhone')) {
              if (!self.iosBarOff) {
                self.isShowBar = false;
                self.isEditing = false;
              }
            }else{
              self.isShowBar = false;
              self.isEditing = false;
              self.flag = self.flag + '7false';
            }
          }
        },300)
      }
      window.onscroll = (event) => {
        console.log('滚动高度：')
        console.log(event.target.scrollingElement.scrollTop)
        console.log('剩余可见高度：' + window.innerHeight)

        self.keyboardHeight = window.innerHeight;
        if(document.getElementsByTagName('body')[0].classList.contains('is-iPhone')){
          if(window.dpr === 3){
            self.scrollTopValue = event.target.scrollingElement.scrollTop

            if(window.innerWidth > 1200){
              editToolbar.style.top = 860 + self.scrollTopValue + 'px'
            }else{
              editToolbar.style.top = 690 + self.scrollTopValue + 'px'
            }
//            editToolbar.style.top = 493 + self.scrollTopValue + 'px'
//            editToolbar.style.top = 690 + self.scrollTopValue + 'px'
//            editToolbar.style.top = 860 + self.scrollTopValue + 'px'
          }else if(window.dpr === 2){
            var fullWidth = window.innerWidth;
            self.scrollTopValue = event.target.scrollingElement.scrollTop;
            if(fullWidth > 640){
              editToolbar.style.top = 520 + self.scrollTopValue + 'px'
//              editToolbar.style.top = 364 + self.scrollTopValue + 'px'
            }else{
//              if(self.innerHeight < 900){
//                //se的优化
                editToolbar.style.top = 364 + self.scrollTopValue + 'px'
//              }else{
//                //对5s,se的优化
//                editToolbar.style.top = 400 + self.scrollTopValue + 'px'
//              }
            }
//            self.fullWidth = fullWidth;
//            self.fullHight = fullHight;
//            editToolbar.style.top = 190 + self.scrollTopValue + 'px'

          }

        }else{
          if (window.innerHeight > windowInnerHeight) {//这里逻辑可以更改下，有可能其他js事件会导致高度变化，这里就只做个简单判断了
//            clearInterval(timer);
            title.innerHTML = window.innerHeight;
            //android键盘隐藏--通过点击键盘隐藏按钮
            self.isEditing = false;
            self.flag = self.flag + '3false';
          }
        }

      }
      document.body.scrollTop = 10;
//    })
    },
    data(){
      return{
        quill:null,
        editorDom:null,
        fullScreenMode:false,

        flag:'',//用于追踪isEditing的变化过程
        fullHeight:'',
        fullWidth:'',
        scrollTopTitle:'',
        editor:'',
        editorContent:'',
        isShowBar:false,
        activeIndex:0,
        imgIndex:0,
        attachmentList:[],
        isEditing:false,
        culture:{},
        //安卓有三种失焦的情况：1，点击工具栏。2.点击虚拟键盘中的隐藏。3.点击空白处
        //ios有两种失焦的情况：1，点击工具栏。2.点击虚拟键盘中的隐藏。
        iosOff:false,  //ios专用标记,判断是否是点击虚拟键盘回收的情况,true为点击工具栏的情况
        androidOff:false,  //android专用标记,判断是否是点击空白处还是工具栏的情况,true为点击工具栏的情况，
                          //android只有在点击键盘的收起键才能收起键盘，点击空白处不会失去焦点，即键盘不会收起
        iosBarOff:false,  //ios专用标记，只有当点击格式的工具栏时才会变为true
        scrollTopValue: 0,
        innerHeight:0,//视窗高度
        keyboardHeight:0, //软键盘出来时的视窗高度
        uploadCount:0 //图片加载进度
      }
    },
    components:{
      XHeader,
      Cell,
      Group
    },
    methods:{
      //初始化 编辑器
      initEditor(){

        //工具条选项
        var toolbarControls = [
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

          ['bold', 'italic', 'underline'],        // toggled buttons

          ['image']
        ];

        //初始化editor
        this.quill = new Quill('#editor-container', {
          modules: {
            toolbar:'#toolbar',
            history: {
              'delay': 1000,
              'userOnly': true
            },
          },
          placeholder: '请输入正文',
          theme: 'snow'
        });

        console.log(this.quill)
      },
      onFocus(){
        let self = this;
        setTimeout(function () {
          self.$refs.toolbar.scrollIntoView(true)
        }, 200)
      },
      showFontStyle(){
        this.isShowBar = !this.isShowBar;
        this.$refs.unviliable.focus();
//        this.editor.cmd.do('redo');
        if(document.getElementsByTagName('body')[0].classList.contains('is-android')){
          this.androidOff = true;
        }else{
          this.iosOff = true;
        }
        let self = this;
        self.isEditing = true;
        self.flag = self.flag + '8true';
        setTimeout(function () {
          self.$refs.toolbar.scrollIntoView(true)
        }, 200)
      },
      nextStep(){
        var title = document.getElementById('articleTitle').innerText;
        //检测中文，中文标题字数不能超过20个
        var reg = new RegExp("[\\u4E00-\\u9FFF]+","g");
        var self = this;
        if(title.length === 0){
          self.showToast("请输入文章标题");
          return false;
        }
        if(reg.test(title)){
          if(title.length >20){
            self.showToast("文章标题不得超过20字");
            return false;
          }
        }
        var content = this.editor.txt.html();
        this.culture.articleName = title;
        this.culture.articleContent = content;
        this.$store.dispatch('setCulture',this.culture);
        this.$router.push('/culture/articleSetting')
      },
      getEditorBold(){
        // 点击菜单将触发这里
        var editor = this.editor;
        var isSeleEmpty = editor.selection.isSelectionEmpty();
        if (isSeleEmpty) {
          // 选区是空的，插入并选中一个“空白”
          editor.selection.createEmptyRange();
        }
        // 执行 bold 命令
        editor.cmd.do('bold');

        this.isShowBar = false;
        this.initBar();

      },
      getEditorH1(){
        this.editor.cmd.do('formatBlock', 'h1');
        this.initBar();
      },getEditorH2(){
        this.editor.cmd.do('formatBlock', 'h2');
        this.initBar();
      },getEditorH3(){
        this.editor.cmd.do('formatBlock', 'h3');
        this.initBar();
      },getEditorH4(){
        this.editor.cmd.do('formatBlock', 'p');
        this.initBar();
      },getEditorUndo(){
        this.editor.cmd.do('undo');
        this.androidOff = true;
        this.iosOff = true;
        this.isEditing = true;
        setTimeout(()=>{
          this.androidOff = false;
          this.iosOff = false;
        },300)
      },getEditorRedo(){
        this.editor.cmd.do('redo');
        this.androidOff = true;
        this.iosOff = true;
        this.isEditing = true;
        setTimeout(()=>{
          this.androidOff = false;
          this.iosOff = false;
        },300)
      },
      fileUploadChange (event) {
        const self = this
        self.isEditing = false;
        self.flag = self.flag + '9false';
        self.showLoading = true
        if (event.target.files.length === 0) return
        var files = event.target.files;
        var counts = files.length;
        console.log('这是文件长度：'+counts);
        var formdata = new FormData();
        for(var i = 0 ;i<files.length;i++){
          console.log(files[i])
          formdata.append('file[]', files[i]);

        }
//        console.log(formdata)
//        var fileIndex = 0;
//        var lrzList = [];
//        for(var i = 0 ;i<files.length;i++){
//          lrz(files[i]).then(function (rst) {
//
//            console.log('这是压缩之后的：')
//            console.log(rst)
//            console.log(rst.file)
//            fileIndex++;
////            formdata.append('file[]', rst.file);
////            formdata.append('file[]', files[i]);
//            if(fileIndex === counts){
//              console.log('这是fileIndex:'+fileIndex);
//              console.log(lrzList);
//              var xhr = new XMLHttpRequest();
//              xhr.open('POST', 'https://www.erplus.co/upload/uploadAttachment');
//
//              xhr.onload = function () {
//                if (xhr.status === 200) {
//                  // 上传成功
////                event.target.value = '' /*清空文件值*/
//                  var res = JSON.parse(xhr.response)
//                  if (res.respCode == '000') {
//                    res.item.forEach(function (obj,index) {
//                      var uploadImgArr = res.item[index].split('.')
//                      var uploadImgFrontArr = uploadImgArr[0].split('-')
//                      var uploadImgSrc = '';
//                      uploadImgFrontArr.forEach(function (src) {
//                        uploadImgSrc += '/' + self.hexToDecimal(src)
//                      })
//                      uploadImgSrc += '.' + uploadImgArr[1];
//
//                      self.editor.txt.append('<img id="img_'+self.imgIndex+'" class="addImage" style="width:60%" alt="加载中.." src="">');
//                      document.getElementById('img_'+self.imgIndex).style.width='100%';
//                      document.getElementById('img_'+self.imgIndex).src='https://www.erplus.co/image' + uploadImgSrc;
//                      self.imgIndex++;
//                    })
//                    self.isEditing = false;
//                  }
//                } else {
//                  // 处理其他情况
//                  self.showToast("上传失败");
//                }
//                self.showLoading = false
//                self.uploadCount = '0%'
//              }
//
//              xhr.onerror = function () {
//                // 处理错误
//              };
//
//              xhr.upload.onprogress = function (e) {
//                // 上传进度
////            var percentComplete = ((e.loaded / e.total) || 0) * 100;
//                self.uploadCount = parseInt(((e.loaded / e.total) || 0) * 100) + '%'
//              }
//              // 触发上传
//              xhr.send(formdata);
//            }
//          })
//        }


        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://www.erplus.co/upload/uploadAttachment');

        xhr.onload = function () {
          if (xhr.status === 200) {
            // 上传成功
//                event.target.value = '' /*清空文件值*/
            var res = JSON.parse(xhr.response)
            if (res.respCode == '000') {
              res.item.forEach(function (obj,index) {
                var uploadImgArr = res.item[index].split('.')
                var uploadImgFrontArr = uploadImgArr[0].split('-')
                var uploadImgSrc = ''
                uploadImgFrontArr.forEach(function (src) {
                  uploadImgSrc += '/' + self.hexToDecimal(src)
                })
                uploadImgSrc += '.' + uploadImgArr[1];

                self.editor.txt.append('<img id="img_'+self.imgIndex+'" class="addImage" style="width:60%" alt="加载中.." src="">');
                document.getElementById('img_'+self.imgIndex).style.width='100%';
                document.getElementById('img_'+self.imgIndex).src='https://www.erplus.co/image' + uploadImgSrc;
                self.imgIndex++;
              })
              self.isEditing = false;
            }
          } else {
            // 处理其他情况
            self.showToast("上传失败");
          }
          self.showLoading = false
          self.uploadCount = '0%'
        }

        xhr.onerror = function () {
          // 处理错误
        };

        xhr.upload.onprogress = function (e) {
          // 上传进度
//            var percentComplete = ((e.loaded / e.total) || 0) * 100;
          self.uploadCount = parseInt(((e.loaded / e.total) || 0) * 100) + '%'
        }
        // 触发上传
        xhr.send(formdata);
            /* ==================================================== */

        event.target.value = '' /*清空文件值*/
      },
      hexToDecimal (hexValue) {
        // 十六进制＝> 十进制
        hexValue = hexValue.toString()
        return parseInt(hexValue, 16)
      },
      initBar(){
        this.androidOff = false;
        this.iosOff = false;
        this.isShowBar = false;
        this.iosBarOff = true;
      },
      showToast(res){
        this.$vux.toast.show({
          type:'text',
          position:'bottom',
          width:'5rem',
          text:res
        })
      }
    }
  }
</script>
<style>
  .w-e-text{
    overflow-y: hidden!important;
  }
</style>
<style scoped>
  .main-container{
    /*position: absolute;*/
    width: 100%;
    height: 93%;
    overflow-y: scroll;
    /*margin-bottom:100px;*/
    -webkit-overflow-scrolling: touch;
    margin: 0;
    overflow-x: hidden;

    list-style-type: none;
    flex: 1;
  }
  .is-iPhone .main-container{
    position: absolute;
    width: 100%;
    height: 93%;
    overflow-y: scroll;
    /*margin-bottom:100px;*/
    -webkit-overflow-scrolling: touch;
    margin: 0;
    overflow-x: hidden;

    list-style-type: none;
    flex: 1;
  }
  .main-container {
    display: flex;
    flex-direction: column;
  }
  .editor-content div{
    overflow-y: hidden;
  }
  .editor-content {
    flex: 1;
    padding: 7px 16px;
    /*height: auto;*/
    /*min-height: 800px;*/
  }
  .add-article{
    /*position: absolute;*/
    /*top: 60px;*/
    /*bottom: 50px;*/
    /*bottom: 0;*/
    position: relative;
    display: flex;
    flex-direction: column;
    height:900px;
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
  #editorElem{
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
    display: flex;
    align-items: center;
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
    align-items: center;
  }
  .is-iPhone .edit-toolbar{
    position: absolute;
    top: 0;
    /*bottom:0;*/
    left: 0;
    width:100%;
    display: flex;
    justify-content:space-around;
    align-items: center;
    flex-flow: row nowrap;
    color: #777777;
    font-size:15px;
    background-color: #F1F1F1;
    height:auto;
    min-height: 44px;
    z-index: 999;
  }
  .edit-toolbar{
    /*position: absolute;*/
    /*top: 0px;*/
    /*left: 0;*/
    width:100%;
    display: flex;
    justify-content:space-around;
    align-items: center;
    flex-flow: row nowrap;
    color: #777777;
    font-size:15px;
    background-color: #F1F1F1;
    height:auto;
    min-height: 44px;
    z-index: 999;
  }
  .editor-title{
    overflow: hidden;
    background-color: #FFFFFF;
    font-size: 22px;
    min-height: 50px;
    flex-shrink:0;
    padding:0 16px;
    height:auto;
    border-bottom: 1px dashed #CCCCCC;
    align-items: center;
    display: flex;
    -webkit-tap-highlight-color: rgba(0,0,0,0);
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
    padding: 5px;
    /*min-height: 44px;*/
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

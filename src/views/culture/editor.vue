<template>
  <div class="container-wrapper" id="container-wrapper" :class="{fullScreen:fullScreenMode}">


    <div class="top1 tool-bar-01">

      <!--所属栏目下拉按钮-->
      <my-button
        type="dropDown"
        :dropDownList="computedColumnList"
      >
        所属栏目
      </my-button>


      <!--适用范围按钮-->
      <my-button
        type="textPlain"
      >
        适用范围
      </my-button>

      <!--全屏按钮-->
      <div class="ml12 tooltipped tooltipped-n btn-fullscreen-wrapper" aria-label="切换到写作模式" @click="switchFullScreen">
        <div class="btn-fullscreen">
          <div class="inner"></div>
        </div>
      </div>


      <!--设为必读按钮-->
      <div class="icon-btn btn-set-reader-range ml12 tooltipped tooltipped-n" aria-label="设为必读文章"></div>

      <!--文章预览按钮-->
      <div class="icon-btn btn-editor-preview ml12 tooltipped tooltipped-n" aria-label="文章预览"></div>


      <div class="right-btn-group">

        <!--保存草稿按钮-->

        <my-button
          type="plain"
        >
          保存草稿
        </my-button>

        <!--发布文章按钮-->
        <my-button
          @click="createNewArticle"

        >
          发布文章
        </my-button>

      </div>


    </div>
    <!-- Create toolbar container -->
    <div id="toolbar">
      <!-- Add font size dropdown -->
      <select class="ql-header">
        <option value="1"></option>
        <option value="2"></option>
        <option value="3"></option>
        <option value="4"></option>
        <option value="5"></option>
        <option value="6"></option>
        <!-- Note a missing, thus falsy value, is used to reset to default -->
        <option selected></option>
      </select>
      <!-- Add a bold button -->
      <button class="ql-bold"></button>

      <!--斜体按钮-->
      <button class="ql-italic"></button>

      <!--下划线按钮-->
      <button class="ql-underline"></button>

      <!--插入图片按钮-->
      <button class="ql-image"></button>

      <!--undo按钮-->
      <button class="btn-undo-redo undo" @click="handlerUndoRedoClick(0)">
        <svg width="14" height="7" viewBox="0 0 14 7">
          <g fill="#979797" fill-rule="evenodd">
            <path d="M1.037 2.924s.97-2.28 5.207-2.28c4.236 0 7.18 4.32 7.18 4.32S9.043 3.2 6.795 3.37C4.55 3.54 3.66 5.226 3.66 5.226L1.038 2.924z"/>
            <path d="M.093.516V6.81h5.66"/>
          </g>
        </svg>
      </button>

      <!--redo按钮-->
      <button class="btn-undo-redo redo" @click="handlerUndoRedoClick(1)">
        <svg width="14" height="7" viewBox="0 0 14 7">
          <g fill="#979797" fill-rule="evenodd">
            <path d="M12.463 2.624s-.97-2.28-5.207-2.28c-4.236 0-7.18 4.32-7.18 4.32S4.457 2.9 6.705 3.07C8.95 3.24 9.84 4.926 9.84 4.926l2.623-2.303z"/>
            <path d="M13.407.216V6.51h-5.66"/>
          </g>
        </svg>
      </button>
    </div>



    <!--编辑器-->
    <div class="editor-container" id="editor-container"></div>


  </div>
</template>
<script>
  import Quill from 'quill'
  import {debounce} from 'lodash'
  export default {
    mounted(){
      this.$nextTick(()=>{

        this.initEditor();

        this.editorDom = document.querySelector('#editor-container');

        window.addEventListener('resize',this.handleWindowResize);

        this.handleWindowResize();

      })


    },
    beforeDestroy(){
      window.removeEventListener('resize',this.handleWindowResize)
    },
    data(){
      return {
        quill:null,
        editorDom:null,
        fullScreenMode:false
      }
    },
    computed:{
      computedColumnList(){
        return []
      }
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

      //发表文章
      createNewArticle(){

        console.log('getContents',this.quill.getContents());

        console.log('getText',this.quill.getText());



      },

      //undo redo
      handlerUndoRedoClick(isRedo){
        if(isRedo){
          console.log('redo')
          this.quill.history.redo();
        }else{
          console.log('undo')
          this.quill.history.undo();
        }
      },

      //切换全屏
      switchFullScreen(){
        this.fullScreenMode  = !this.fullScreenMode;
        this.$nextTick(()=>{
          this.handleWindowResize();
        })
      },


      //处理resize事件  编辑框的高度问题
      handleWindowResize(){
        var winHeight = window.innerHeight;
        if(winHeight){
          this.editorDom.style.height = winHeight - 68 -12 -33 - 41 +'px';
          if(this.fullScreenMode){
            var appWidth = document.getElementById('app').offsetWidth;
            document.getElementById('container-wrapper').style.width = appWidth + 'px';
          }
        }
      }
    }
  }
</script>

<style scoped>
  .container-wrapper{
    background-color: #fff;
  }
  .container-wrapper.fullScreen{
    position: fixed;
    height: 100%;
    left: 0;
    right:0;
    top: 68px;
    margin: auto;
    z-index: 999999;
  }
  .tool-bar-01{
    height: 33px;
    line-height: 33px;
    padding-left: 15px;
    padding-right: 15px;
    border-bottom: 1px solid #efefef;
  }

  /*全屏按钮 纯css样式*/
  .btn-fullscreen{
    width: 15px;
    height: 15px;
    position: relative;
    display: inline-block;
    cursor: pointer;
  }
  .btn-fullscreen .inner:before,.btn-fullscreen .inner:after{
    content: '';
    position: absolute;
    width: 6px;
    height: 6px;
  }
  .btn-fullscreen .inner:before{
    left: 0;
    bottom: 0;
    border-left: 1px solid #979797;
    border-bottom: 1px solid #979797;
  }
  .btn-fullscreen .inner:after{
    right: 0;
    top: 0;
    border-top: 1px solid #979797;
    border-right: 1px solid #979797;
  }
  .btn-fullscreen:before,.btn-fullscreen:after{
    position: absolute;
    content: '';
    width: 6px;
    border-bottom:1px solid #979797;
  }
  .btn-fullscreen:before{
    left: 0;
    bottom: 0;
    transform: rotate(-45deg);
    transform-origin: 0 0;
  }
  .btn-fullscreen:after{
    right: 0;
    top: 0;
    transform: rotate(-45deg);
    transform-origin: 6px 2px;
  }
  .btn-fullscreen:hover .inner:before{
    left: 0;
    bottom: 0;
    border-left: 1px solid #4A90E2;
    border-bottom: 1px solid #4A90E2;
  }
  .btn-fullscreen:hover .inner:after{
    right: 0;
    top: 0;
    border-top: 1px solid #4A90E2;
    border-right: 1px solid #4A90E2;
  }
  .btn-fullscreen:hover:before,.btn-fullscreen:hover:after{
    position: absolute;
    content: '';
    width: 6px;
    border-bottom:1px solid #4A90E2;
  }
  .btn-fullscreen-wrapper{
    display: inline-block;
    height: 15px;
    line-height: 15px;
  }


  .icon-btn{
    display: inline-block;
    width: 14px;
    height: 17px;
    cursor: pointer;
  }
  .btn-set-reader-range{
    background: url("../../../../assets/icon-read.svg") no-repeat center;
  }
  .btn-editor-preview{
    background: url("../../../../assets/icon-preview.svg") no-repeat center;
  }
  .ml12{
    margin-left: 12px;
  }
  .right-btn-group{
    display: inline-block;
    float: right;
  }

  .btn-undo-redo{
    display: inline-block;
    cursor: pointer;
  }
  .btn-undo-redo:hover g{
    fill: #444;
  }
  .btn-undo-redo.undo{
    /*background: url("../../../../assets/icon-undo.svg") no-repeat center;*/
  }
  .btn-undo-redo.redo{
    /*background: url("../../../../assets/icon-redo.svg") no-repeat center;*/
  }



</style>

<style src="../../../../../static/css/quill.snow.css"></style>

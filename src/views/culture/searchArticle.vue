<template>
  <div>
    <header class="search-header ">
      <div class="main-row flex-row-start">
        <div class="flex-row-start cell-search-header">
          <img src="../../../static/img/icon_search.png" class="icon-img-search"/>
          <div class="border-left"></div>
          <input class="cell-search-input" v-model="searchTitle" @input="searchArt" placeholder="搜索"/>
        </div>
        <a @click="backStep" class="btn-cancel">取消</a>
      </div>
    </header>
    <div class="container">
      <group v-if="haveArticles">
        <cell v-for="(item,index) in articleList" :key="index" @click.native="previewArticle(item)" :title="item.title" :isLink="true" :inlineDesc="item.desc"></cell>
      </group>
      <div class="flex-col-center mt-130" v-else>
        <img v-if="!unResult" src="../../../static/img/search-unstate.png" class="img-unstate-search">
        <img v-if="unResult" src="../../../static/img/unresult-search.png" class="img-unresult-search">
      </div>
    </div>
  </div>
</template>
<script>
  import XHeader from '../../components/x-header/index.vue'
  import Group from '../../components/group/index.vue'
  import Cell from '../../components/cell/index.vue'

  export default {
    components:{
      XHeader,
      Cell,
      Group
    },
    data(){
      return {
        searchTitle:'',
        articleList:[],
        unResult:false
      }
    },
    methods:{
      backStep(){
        this.$router.push('/culture')
      },
      searchArt(){
        if(this.searchTitle !== ""){
          var params ={
            title:this.searchTitle
          }
          var self = this;
          this.$store.dispatch('searchArticle',params).then(function (res) {
            if(res.result === 0){
              if(res.articleList.length > 0){
                res.articleList.forEach(function (n) {
                  var createTime = n.createTime.split(' ')[0].split('-').join('/');
                  if(n.lastEditTime !== undefined){
                    if(n.lastEditTime === n.createTime){
                      n.desc = n.authorName+" " + createTime+" 发布";
                    }else{
                      var editTime = n.lastEditTime.split(' ')[0].split('-').join('/');
                      n.desc = n.editorName +" " + editTime+" 更新";
                    }
                  }else{
                    n.desc = n.authorName +" " +createTime+" 发布";
                  }
                })
              }else{
                self.unResult = true;
              }
              self.articleList = res.articleList;
            }
          })
        }
      },
      previewArticle(item){
        var culture = this.$store.getters.getCulture;
        culture.articleId = item.articleId;
        culture.topicName = item.topicName;
        this.$store.dispatch('setCulture',culture);
        this.$router.push('/culture/preview');
      }
    },
    computed:{
      haveArticles(){
        if(this.articleList === undefined){
          return false;
        }else{
          if(this.articleList.length === 0){
            return false;
          }else if(this.articleList.length > 0){
            return true;
          }
        }
      }
    }
  }
</script>
<style scoped>
  .img-unresult-search{
    width:73px;
    height:104px;
  }
  .img-unstate-search{
    width:115px;
    height:104px;
  }
  .mt-130{
    margin-top: 130px;
  }
  .container{
    overflow-x: hidden;
    overflow-y: scroll;
  }
  .border-left{
    border-left:1px solid #CCCCCC;
    height:20px;
    width:2px;
  }
  .main-row{
    padding:6px 16px 8px;
    height:30px;
  }
  .btn-cancel{
    background-color: transparent;
    color: #fff;
    width:30px;
    height:20px;
    font-size:13px;
    line-height:20px;
    text-align: center;
    margin-left: 16px;
  }
  .search-header{
    width:100%;
    height:44px;
    padding-top: 20px;
    background: #4A90E2;
    box-shadow: 0 0 0 0 #B2B2B2;
  }
  .icon-img-search{
    width:13px;
    height:13px;
    margin:9px 10px;
  }
  .cell-search-input{
    height: 28px;
    width:80%;
    font-size:14px;
    padding-left: 9px;
    /*border-left:1px solid #ccc;*/
    border:none;
  }
  .cell-search-header{
    background-color: #FFFFFF;
    border-radius: 5px;
    height:30px;
    width:100%;
  }
</style>

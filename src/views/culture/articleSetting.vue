<template>
  <div>
    <x-header :left-options="{showBack: true,backText: ''}" @on-click-back="editArticle" title="新文章">
      <a slot="right" @click="submit">发布</a>
    </x-header>
    <div class="container">
      <group>
        <cell title="文章预览" titleColor="#4A90E2" @click.native="showPreview"></cell>
      </group>
      <group titleFooter="开启后，系统会提醒适用范围内的员工阅读该文章，且需要员工手动标明已读">
        <popup-picker title="所属栏目" @on-change="changeTopic" :data="topicList" v-model="culture.topicSelected" placeholder="请选择"  confirmText="完成" cancel-text="取消"></popup-picker>
        <cell title="适用范围" :isLink="true" link="/culture/range" :value="range"></cell>
        <x-switch title="设为必读文章" v-model="culture.needRead"></x-switch>
      </group>
    </div>
  </div>
</template>
<script>
  import XHeader from '../../components/x-header/index.vue'
  import Group from '../../components/group/index.vue'
  import Cell from '../../components/cell/index.vue'
  import XSwitch from '../../components/x-switch/index.vue'
  import PopupPicker from '../../components/popup-picker/index.vue'

  export default{
    created(){
      this.culture = this.$store.getters.getCulture;
      this.userInfo = this.$store.getters.getUserInfo;
      this.$set(this.culture, 'topicSelected',[]);
      //初始化所属栏目
      var self = this;
      if(self.culture.topicId !== undefined){
        self.culture.topicList.forEach(function (n) {
          if(n.topicId === self.culture.topicId){
            self.culture.topicSelected.push(n.topicName);
            return false;
          }
        })
      }
      //初始化适用范围
      if(self.culture.range !== undefined){
        if( typeof(self.culture.range) ==="string" && self.culture.range !== 'all'){
          self.culture.range = self.culture.range.split(',');
          self.culture.mainRange = self.culture.mainRange.split(',');
          console.log(self.culture.range);
        }
      }
      //初始化是否设为必读
      if(self.culture.needRead !== undefined){
        if(self.culture.needRead === 1){
          self.culture.needRead = true;
        }else if(self.culture.needRead === 0){
          self.culture.needRead = false;
        }
      }else{
        self.culture.needRead = false;
      }
    },
    data(){
      return{
        culture:{
          topicSelected:[]
        },
        userInfo:{}
      }
    },
    components:{
      XHeader,
      Cell,
      Group,
      XSwitch,
      PopupPicker
    },
    methods:{
      submit(){
        if(this.culture.range===undefined ||this.culture.range.length=== 0){
          this.showToast("请选择使用范围");
          return false;
        }
        if(this.culture.topicSelected.length === 0){
          this.showToast("请选择所属栏目");
          return false;
        }
        this.$vux.loading.show({
          text:'加载中'
        })
        var params = {
          topicId:this.culture.topicId,
          title:this.culture.articleName,
          content:this.culture.articleContent,
          needRead:this.culture.needRead?"1":"0"
        }
        if(this.culture.range === 'all'){
          params.range = this.culture.range;
          params.mainRange = this.culture.mainRange;
        }else{
          //判断是否选择了自己,如果未选择则默认加上去
          if(this.culture.range.indexOf(this.userInfo.id) === -1){
            this.culture.range.push(this.userInfo.id)
            this.culture.mainRange.push(this.userInfo.mainContactId)
          }
          params.range = this.culture.range.join(",");
          params.mainRange = this.culture.mainRange.join(",")
        }
        var self = this;
        //创建文章
        if(this.culture.articleId === undefined){

          this.$store.dispatch('saveArticle',params).then(function (res) {
            self.$vux.loading.hide();
            if(res.result === 0){
              self.showToast('发布成功');
              self.$router.push('/culture/rulesList')
            }else if(res.result === 1){
              self.showToast(res.res_info)
            }else if(res.result === undefined){
              self.showToast(res.respDesc)
            }
          });
        }else{
          //更新文章
          var id = this.$store.getters.getUserInfo.id;
          params.editorId = id;
          params.articleId = this.culture.articleId;
          this.$store.dispatch('updateArticle',params).then(function (res) {
            self.$vux.loading.hide();
            if(res.result === 0){
              self.$router.push('/culture/rulesList')
            }else if(res.result === 1){
              self.showToast(res.res_info)
            }else if(res.result === undefined){
              self.showToast(res.respDesc)
            }
          });
        }
      },
      editArticle(){
        this.$store.dispatch('setCulture',this.culture);
      },
      showPreview(){
        if(this.culture.topicId === undefined && this.culture.topicSelected.length===0){
          this.showToast('请先选择所属栏目')
        }else{
          this.culture.isPreview = true;
          this.$store.dispatch('setCulture',this.culture);
          this.$router.push('/culture/preview')
        }
      },
      showToast(res){
        this.$vux.toast.show({
          type:'text',
          position:'bottom',
          width:'auto',
          text:res
        })
      },
      changeTopic(value){
        var self = this;
        this.culture.topicList.forEach(function (n) {
          if(n.topicName === value[0]){
            self.culture.topicId = n.topicId;
            return false;
          }
        })
      }
    },
    computed:{
      topicList(){
        var array = [[]];
        if(this.culture.topicList !== undefined){
          this.culture.topicList.forEach(function (n) {
            array[0].push(n.topicName)
          })
        }else{
          array = [[""]]
        }
        return array;
      },
      range(){
        if(this.culture.range === undefined || this.culture.range.length === 0){
          return '请选择'
        }else if(this.culture.range === "all"){
          return '全部员工'
        }else{
          return this.culture.range.length+"人"
        }
      }
    }
  }
</script>

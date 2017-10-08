<template>
  <div>
    <x-header class="header" :left-options="{showBack: true,backText: ''}" title="适用范围" ref="header">
      <span v-if="isManager" slot="right" @click="edit">编辑</span>
    </x-header>
    <div>
      <div class="cell-box-bi">
        <div @click="toBasicInfo(item.contactId)" class="cell-range-list flex-row-start" v-for="(item,index) in staffs" :class="[index===0?'mt-12':'']">
          <img :src="'https://www.erplus.co/uploads/avatars/'+item.imageName" class="img-range-header">
          <span>{{item.name}}&nbsp&nbsp{{item.position}}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import XHeader from '../../components/x-header/index.vue'
  import Cell from '../../components/cell/index.vue'
  import Group from '../../components/group/index.vue'
  import {mapGetters} from 'vuex'

  export default {
    components:{
      XHeader,
      Cell,
      Group
    },
    data(){
      return{
        isManager:false,
        staffs:[]
      }
    },
    created(){
      var self = this;
      var temp = this.getCulture;
      var flagText = this.$route.params.target;
      var userInfo = this.$store.state.userInfo;
      if(userInfo.isAdmin || userInfo.isHRManager ===1 || userInfo.isCultureManager === 1){
        self.isManager = true;
      }
      var params ={};
      if(temp.mainRange !== 'all'){
        if(flagText === 'preview'){
          temp.mainRange = temp.mainRange.split(',');
          temp.range = temp.range.split(',');
          this.$store.dispatch('setCulture',temp).then();
        }
        params = {
          createTime:temp.createTime,
          mainRange:temp.mainRange.join(','),
          range:temp.range.join(',')
        }
      }else{
        params = {
          createTime:temp.createTime,
          mainRange:temp.mainRange,
          range:temp.range
        }
      }


      this.$store.dispatch('getArticleRange',params).then(res =>{
        if(res.result === 0){
          self.staffs = res.userList;
        }
      })
    },
    computed:{
      ...mapGetters([
        'getContacts',
        'getCulture'
      ]),
    },
    methods:{
      edit(){
        this.$router.push({name:'range',params:{target:'editRange'}})
      },
      toBasicInfo(id){
        var obj = {
          target:'CHECK_PERSON_INFO',
          param:{contactId:id}
        }
        console.log(obj)
        this.postMsgToApp(obj)
      }
    }
  }
</script>
<style scoped>
  .is-android .cell-box-bi{
    height: 100%;
    overflow-x: hidden;
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
  }
  .is-iPhone .cell-box-bi{
    height: 90%;
    overflow-x: hidden;
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
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
  .mt-12{
    margin-top: 12px;
  }
  .cell-range-list{
    width:100%;
    height:44px;
    padding-left:15px;
    background-color: #FFFFFF;
    border-bottom: 1px solid #efefef;/*no*/
  }
  .cell-range-list span{
    font-size: 14px;
    color: #030303;
  }
  .img-range-header{
    width:29px;
    height:29px;
    margin-right:7px;
    -webkit-border-radius: 50%;
    -moz-border-radius: 50%;
    border-radius: 50%;
  }
</style>

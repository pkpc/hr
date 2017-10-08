<template>
  <div>
    <x-header :left-options="{showBack: true,backText: ''}" title="员工编号">
      <span @click="save" slot="right">完成</span>
    </x-header>
    <div class="container">
      <group :titleFooter="selectedObj.serialDesc">
        <cell v-if="showSet" title="编号类型" :is-link="true"><span @click="toSettingNum" class="btn-a">去设置</span></cell>
        <popup-picker v-if="!showSet" title="编号类型" :data="typeListCom" v-model="selectedType" confirmText="完成" placeholder="请选择" :cancel-text="'取消'"></popup-picker>
      </group>
      <group v-if="showDetail">
        <cell title="员工编号" :value="selectedObj.serialPrefix">
          <input type="number" placeholder="请输入" v-model="selectedObj.latestNumber" class="cell-in-num"/>
          <!--<span v-else>{{selectedObj.latestNumber}}</span>-->
        </cell>
      </group>
    </div>
    <loading v-model="showLoading" :text="loadingText"></loading>
  </div>
</template>
<script>
  import XHeader from '.././../../../components/x-header/index.vue'
  import Cell from '.././../../../components/cell/index.vue'
  import Group from '.././../../../components/group/index.vue'
  import Loading from '.././../../../components/loading/index.vue'
  import PopupPicker from '.././../../../components/popup-picker/index.vue'
  import {isEmptyObject} from '.././../../../libs/utils'
  import clone from 'lodash.clonedeep'

  export default {
    components:{
      XHeader,
      Group,
      Cell,
      PopupPicker,
      Loading
    },
    created(){
      var self = this;
      this.currentProfile = this.$store.getters.getEditCurrentProfile;

      console.log('++++++');
      console.log(this.currentProfile);
      this.$store.dispatch('getSerialNumberPlans').then(function (res) {
        if(res.result === 0){
          self.settingFlag = true;

          var temp = res.data;
          if(temp !== undefined){
            temp.forEach(function (obj) {
              self.typeList[0].push(obj.serialName);

              if(self.currentProfile.serialNumberPlan !== undefined){
                if(self.currentProfile.serialNumberPlan ===obj.id){

//                  self.$set(self.selectedObj,'latestNumber',0);
//                  self.$set(self.selectedObj,'serialPrefix',0);
                  obj.latestNumber = self.currentProfile.serialNumber;
                  self.selectedType.push(obj.serialName);
//                  self.selectedObj.serialPrefix = obj.serialPrefix;
//                  console.log(self.currentProfile.serialNumber)
//                  self.selectedObj.latestNumber = self.currentProfile.serialNumber;
                }
              }
            });
          }
          self.selectList = temp;
          self.showLoading = false;
        }
      })
    },
    data(){
      return {
        recommend:0, //推荐值 ，每次切换类型都会获得系统的推荐值（数据库中该类型的最大值）
        selectedObj:{},
        currentProfile:{},
        showInput:true,
        selectList:[],
        typeList:[[]],
        selectedType:[],
        areaHeight:300*dpr,
        prefix:'',
        suffix:'',
        desc:'',
        flag:0,
        settingFlag:false,
        showLoading:true,
        loadingText:''
      }
    },
    methods:{
      save(){
        var self = this;
        if(isEmptyObject(this.selectedObj)){
          return self.showToast('请选择编号类型');
        }
        if(this.selectedObj.latestNumber < 0 || this.selectedObj.latestNumber.toString().indexOf('.')!== -1){
          return self.showToast('请输入正整数');
        }
        var params = {
          id:this.selectedObj.id,
          serialPrefix:this.selectedObj.serialPrefix,
          nextSerialNumber:this.selectedObj.latestNumber
        }
        this.$store.dispatch('isAlreadyExistSerialNum',params).then(function (res) {
          if(res.result === 0){
            if(res.data){
              self.showToast('该编号已存在');
            }else{
              self.currentProfile.firstEditNumber= 1;
              self.currentProfile.serialNumberPlan= self.selectedObj.id;
              self.currentProfile.serialNumber= self.selectedObj.latestNumber;
              self.currentProfile.idInCompany= self.selectedObj.serialPrefix+self.selectedObj.latestNumber;
//              self.$store.state.editCurrentProfile = self.currentProfile;
              console.log('------')
              console.log(self.currentProfile)
              self.$store.dispatch('setEditCurrentProfile',clone(self.currentProfile))
              console.log('this is empNum')
              console.log(self.currentProfile)
              console.log(self.$store.getters.getEditCurrentProfile)
              self.$router.back()
            }
          }else{
            self.showToast(res.res_info)
          }
        })
      },
      showToast(res){
        this.$vux.toast.show({
          type:'text',
          position:'bottom',
          width:'auto',
          text:res
        })
      },
      toSettingNum(){
        this.$router.push({name:'empNum'})
      }
    },
    watch:{
      selectedType(value){
        if(this.selectList.length > 0){
          var self = this;
          this.selectList.forEach(function (obj) {
            if(obj.serialName === value[0]){
//              delete obj.latestNumber;
              self.selectedObj = obj;
              self.recommend = -1;
              var serialNumberPlan = self.currentProfile.serialNumberPlan;
              if(obj.serialType === 1 && (serialNumberPlan === 0 || serialNumberPlan !== self.selectedObj.id)){
                if(self.selectedObj.latestNumber === undefined){
                  self.$set(self.selectedObj,'latestNumber',0);
                  self.$set(self.selectedObj,'serialPrefix','');
                }
                self.$store.dispatch('getSerialNumberPlanNextNumber',{id:obj.id}).then(function (res) {
                  if(res.result === 0){
                    self.selectedObj.latestNumber = res.data.latestNumber;
                    self.selectedObj.serialPrefix = res.data.serialPrefix;
                    self.recommend = res.data.latestNumber;
                  }
                })
              }
            }
          })
        }
      }
    },
    computed:{
      showDetail(){
        if(this.settingFlag &&this.typeList[0][0] !== undefined && !isEmptyObject(this.selectedObj)){
          return true;
        }else{
          return false;
        }
      },
      typeListCom(){
        if(this.typeList[0].length === 0){
          return [['']]
        }else{
          return this.typeList
        }
      },
      showSet(){
        if(this.settingFlag &&this.typeList[0][0] === undefined){
          return true;
        }else{
          return false;
        }
      },
      toShowAllNum(){
        if(this.selectedType.length > 0){
          return true;
        }else{
          return false;
        }
      }
    }
  }

</script>
<style>
  .btn-a{
    color: #4a90e2;
    font-size:13px;
    border:1px solid #4a90e2;
    display: inline-block;
    width:auto;
    padding:0 5px;
    -webkit-border-radius: 3px;
    -moz-border-radius: 3px;
    border-radius: 3px;
    margin-left:5px;
  }
  .cell-in-num{
    border:none;
    height:100%;
    font-size:15px;
    background-color: #FFFFFF;
    width:auto;
    max-width:50px;
    text-align: right;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }
</style>

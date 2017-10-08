<template>
  <div>
    <x-header :left-options="{showBack: true,backText: ''}" title="新建编号类型">
      <span @click="saveType" slot="right">完成</span>
    </x-header>
    <div>
      <group titleFooter="例如：PRD, MKT, IT等">
        <x-input title="名称" placeholder="请输入" v-model="numDetail.serialName" textAlign="right" :showClear="false"></x-input>
        <cell title="描述" @click.native="toDescType" :value="descTip" :valueColor="valueColor" :isLink="true" is-link></cell>
        <x-input title="编号前缀" placeholder="请输入" v-model="numDetail.serialPrefix" textAlign="right" :showClear="false"></x-input>
      </group>
      <group v-if="false" titleFooter="效果：员工名 职位 (后缀内容)">
        <x-switch title="通讯录职位后添加后缀" v-model="numDetail.isContactAfter" @on-click="switchContent"></x-switch>
        <x-input v-if="numDetail.isContactAfter" title="后缀内容" v-model="numDetail.serialContactsSuffix" textAlign="right" :showClear="false" placeholder="请输入"></x-input>
      </group>
      <group v-if="false" titleFooter="开启后，当有编号停用时 (员工离职或换编号)，系统会自动更新停用号码后续的编号。如5号停用则6号自动升为新5号">
        <x-switch title="编号自动更新" v-model="numDetail.isAutoUpdate"></x-switch>
      </group>
    </div>
    <loading v-model="showLoading" :text="loadingText"></loading>
  </div>
</template>
<script>
  import XHeader from '.././../../components/x-header/index.vue'
  import XInput from '.././../../components/x-input/index.vue'
  import Cell from '.././../../components/cell/index.vue'
  import Group from '.././../../components/group/index.vue'
  import XSwitch from '.././../../components/x-switch/index.vue'
  import Loading from '.././../../components/loading/index.vue'
  import {Swipeout,SwipeoutItem, SwipeoutButton} from '../../../components/swipeout'

  export default {
    components:{
      XHeader,
      Group,
      Cell,
      Swipeout,
      SwipeoutItem,
      SwipeoutButton,
      XInput,
      XSwitch,
      Loading
    },
    created(){
      var id = this.$store.getters.getEmpNumber.id;
      var self = this;
      var detail = this.$store.getters.getEmpNumber;
      if(detail.id !== undefined && detail.serialName !== undefined){
        this.numDetail = detail;
      }else{
        if(id !== undefined){
          this.$store.dispatch('getSerialNumberPlanDetail',{id:id}).then(function (res) {
            if(res.result === 0){
              var temp = res.data;
              self.$set(temp,'isContactAfter',false);
              self.$set(temp,'isAutoUpdate',false);
              if(temp.serialContactsSuffix !== undefined){
                temp.isContactAfter = true;
              }
              if(temp.serialType === 1){
                temp.isAutoUpdate = true;
              }
              self.numDetail = res.data;
              const desc = self.$route.params.serialDesc;
              if(desc !== undefined){
                self.numDetail.serialDesc = desc;
              }
              self.showLoading = false;
            }
          })
        }else{
          self.numDetail.serialDesc = detail.serialDesc;
          self.numDetail.serialName = detail.serialName;
          self.numDetail.serialPrefix = detail.serialPrefix;
          self.showLoading = false;
        }
      }

      var desc = this.$route.params.desc;
      if(desc !== undefined){
        this.numDetail.desc = desc;
      }
    },
    data(){
      return {
        valueColor:'#999999',
        numDetail:{
          isContactAfter:false
        },
        showLoading:true,
        loadingText:''
      }
    },
    computed:{
      descTip(){

        if(this.numDetail.serialDesc !== undefined &&this.numDetail.serialDesc.length > 0){
          this.valueColor = '#333333';
          return '已填写'
        }else{
          return '未填写'
        }
      }
    },
    methods:{
      saveType(){
        console.log("-----------")
        if(this.numDetail.serialName.length === 0){
          this.showToast('请输入类型名称');
          return false;
        }
        if(this.numDetail.serialPrefix.length === 0){
          this.showToast('请输入编号前缀');
          return false;
        }
        var id = this.$store.getters.getEmpNumber.id;
        var params = {
          serialName:this.numDetail.serialName,
          serialDesc:this.numDetail.serialDesc,
          serialPrefix:this.numDetail.serialPrefix,
          serialType:1
        }
        if(this.numDetail.isContactAfter){
          params.serialContactsSuffix = this.numDetail.serialContactsSuffix
        }
        var self = this;
        var apiText = '';
        if(id !== undefined){
          params.id= id;
          apiText = 'editSerialNumberPlan';
        }else{
          apiText = 'addSerialNumberPlan';
        }
        this.$store.dispatch(apiText,params).then(function (res) {
          if(res.result === 0){
            self.$router.back();
            self.showToast('保存成功')
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
      switchContent(){
        this.isContactAfter = !this.isContactAfter;
      },
      toDescType(){
        this.$store.dispatch('setEmpNumber',this.numDetail);
        this.$router.push({name:'desc'})
      }
    }
  }

</script>

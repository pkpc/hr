<template>
  <div>
    <x-header :left-options="{showBack: true,backText: ''}" title="人事信息">
      <a slot="right" @click="save">保存</a>
    </x-header>
    <div class="container">
      <group>
        <popup-picker title="员工类型" confirmText="完成"  cancel-text="取消" value-text-align="left" :data="empType" v-model="emp.typeName" @on-change="changeType" placeholder="请选择"></popup-picker>
        <popup-picker title="级别"  confirmText="完成" cancel-text="取消" value-text-align="left" :data="empLevel" v-model="emp.level" placeholder="请选择"></popup-picker>
      </group>
    </div>
  </div>
</template>
<script>
  import XHeader from '../../../../components/x-header/index.vue'
  import Group from '../../../../components/group/index.vue'
  import PopupPicker from '../../../../components/popup-picker/index.vue'
  import clone from 'lodash.clonedeep'

  export default {
    created(){
      this.currentProfile = clone(this.$store.state.editCurrentProfile);
      if(this.currentProfile.typeName !==undefined&&this.currentProfile.typeCode !== undefined){
//        this.$set(this.emp,'level',["0"])
//        this.$set(this.emp,'typeName',["0"])
        this.emp.typeName[0] = this.currentProfile.typeName+" ("+this.currentProfile.typeCode+")";
        this.emp.level[0] = this.currentProfile.mainLevel.toString();

      }
    },
    data(){
      return {
        currentProfile:{},
        emp:{
          typeName:[],
          level:[]
        }
      }
    },
    computed:{
      empType(){
        var list = this.$store.getters.getEmpType;
        var array = [[]];
        if(list.length===0){
          array = [[""]];
        }else{
          list.forEach(function (item) {
            array[0].push(item.typeName+" ("+item.typeCode+")")
          })
        }
        return array;
      },
      empLevel(){
        var array = [[]];
        var temp = this.emp.typeName;
        if(temp.length > 0){
          var name = temp[0].split('(')[0].trim();
          var tempCode = temp[0].split('(')[1];
          var code = tempCode.substr(0,tempCode.length-1);
          var list = this.$store.getters.getEmpType;
          list.forEach(function (item,index) {
            if(item.typeName===name && item.typeCode === code){
              for(var i = item.minimum;i<=item.maximum;i++){
                array[0].push(i)
              }
            }
          })
        }else{
          array = [[""]];
        }
        return array;
      },
    },
    components:{
      XHeader,
      Group,
      PopupPicker
    },
    methods:{
      save(){
        //员工等级
        var temp = this.emp.typeName;
        if(temp[0]!==undefined){
          if(this.emp.level[0]!==undefined){
            var name = temp[0].split('(')[0].trim();
            var tempCode = temp[0].split('(')[1];
            var code = tempCode.substr(0,tempCode.length-1);

            this.currentProfile.mainLevel = this.emp.level[0];
            this.currentProfile.typeName = name;
            this.currentProfile.typeCode = code;
            this.$store.state.editCurrentProfile = this.currentProfile;
//            const params = {
//              typeName:name,
//              code:code,
//              level:this.emp.level[0]
//            }
//            this.$store.dispatch('set_empLevel',params);
          }else{
            // 显示
            this.$vux.toast.show({
              type:'text',
              text: '请选择员工级别',
              position:'bottom',
              width:'auto'
            })
            return false;
          }
        }
        this.$router.back()
      },
      changeType(){
        this.emp.level = [];
      },
    }
  }
</script>

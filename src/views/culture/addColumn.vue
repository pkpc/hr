<template>
  <div>
    <x-header :left-options="{showBack: true,backText: ''}" title="新建栏目">
      <a slot="right" @click="nextStep">完成</a>
    </x-header>
    <div>
      <group>
        <x-input placeholder="输入栏目名称" v-model="topicName"></x-input>
      </group>
      <group>
        <x-textarea placeholder="输入栏目简介" v-model="topicDesc" :height="600"></x-textarea>
      </group>
    </div>
  </div>
</template>
<script>
  import XHeader from '../../components/x-header/index.vue'
  import Group from '../../components/group/index.vue'
  import Cell from '../../components/cell/index.vue'
  import XInput from '../../components/x-input/index.vue'
  import XTextarea from '../../components/x-textarea/index.vue'
  export default{
    created(){
    },
    data(){
      return{
        topicName:'',
        topicDesc:''
      }
    },
    components:{
      XHeader,
      Cell,
      Group,
      XInput,
      XTextarea
    },
    methods:{
      nextStep(){
        if(this.topicName === ''){
          this.showToast('请输入栏目标题')
          return false;
        }
        if(this.topicDesc === ''){
          this.showToast('请输入栏目简介')
          return false;
        }
        var params = {
          topicName:this.topicName,
          topicDesc:this.topicDesc
        }
        var self = this;
        this.$store.dispatch('saveArticleTopic',params).then(function (res) {
          self.$router.push('/culture')
        })
      },
      showToast(res){
        this.$vux.toast.show({
          type:'text',
          text:res,
          width:'auto',
          position:'bottom'
        })
      }
    }
  }
</script>

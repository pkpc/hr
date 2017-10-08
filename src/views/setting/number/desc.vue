<template>
  <div>
    <x-header :left-options="{showBack: true,backText: ''}" title="描述">
      <span @click="save" slot="right">完成</span>
    </x-header>
    <div class="container">
      <group gutter="0">
        <x-textarea :height="areaHeight" v-model="detail.serialDesc" placeholder="请填写描述，如该编号适用于哪些员工..."></x-textarea>
      </group>
    </div>
  </div>
</template>
<script>
  import XHeader from '.././../../components/x-header/index.vue'
  import Cell from '.././../../components/cell/index.vue'
  import Group from '.././../../components/group/index.vue'
  import XTextarea from '.././../../components/x-textarea/index.vue'

  export default {
    components:{
      XHeader,
      Group,
      Cell,
      XTextarea
    },
    created(){
      this.detail = this.$store.getters.getEmpNumber;
    },
    data(){
      return {
        detail:{},
        areaHeight:300*dpr
      }
    },
    methods:{
      save(){
        this.$store.dispatch('setEmpNumber',this.detail);
        this.$router.back();
      }
    }
  }

</script>

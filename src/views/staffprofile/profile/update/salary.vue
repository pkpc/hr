<template>
  <div>
    <x-header :left-options="{showBack: true,backText: ''}" title="薪资信息">
      <a slot="right" @click="save">保存</a>
    </x-header>
    <div>
      <group title="试用期薪资（税前）" titleBackground="#f7f7f7">
        <x-input :hdFlex="1" :bdFlex="2"  title='基础薪资' placeholder="请输入" type="number" :show-clear="false" v-model="currentProfile.probationaryPeriodSalary">
        </x-input>
        <x-input :hdFlex="1" :bdFlex="2" title='绩效薪资' placeholder="请输入" type="number" :show-clear="false" v-model="currentProfile.probationaryKPISalary">
        </x-input>
      </group>
      <group title="转正后薪资（税前）" titleBackground="#f7f7f7">
        <x-input :hdFlex="1" :bdFlex="2"  title='基础薪资' type="number" placeholder="请输入" :show-clear="false" v-model="currentProfile.regularSalary">
        </x-input>
        <x-input :hdFlex="1" :bdFlex="2" title='绩效薪资' type="number" placeholder="请输入" :show-clear="false" v-model="currentProfile.regularKPISalary">
        </x-input>
      </group>
    </div>
  </div>
</template>
<script>
  import XHeader from '../../../../components/x-header/index.vue'
  import Group from '../../../../components/group/index.vue'
  import XInput from '../../../../components/x-input/index.vue'
  export default {
    components: {
      XHeader,
      Group,
      XInput
    },
    data () {
      return {
        currentProfile: {}
      }
    },
    created () {
      this.currentProfile = this.$store.state.editCurrentProfile
    },
    methods: {
      save () {

        this.$store.state.editCurrentProfile = this.currentProfile
        console.log(this.$store.state.editCurrentProfile)
        this.$router.back()
      }
    }
  }
</script>
<style>
</style>

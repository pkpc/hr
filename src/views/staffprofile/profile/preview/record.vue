<template>
  <div>
    <x-header :left-options="{showBack: true,backText: ''}" title="更新记录">
    </x-header>
    <div class="bg-white">
      <timeline>
        <timeline-item v-for="(record, index) in historyRecord" :key="index">
          <div class="record_item" :class="[index === 0 ? 'recent' : '']">
            <span>{{record.operatedRecord}}</span>
            <span>{{record.operatedTime}}</span>
          </div>
          <!--就一个字段-->
          <div v-show="record.showIndex === 0" class="record_item_detail">
            <span>{{record.earlyContent}}</span>
          </div>
          <!--用一行显示修改过程-->
          <div v-show="record.showIndex === 1" class="record_item_detail">
            <span>{{record.earlyContent}}</span>
            <img src="../../../../../static/img/arrow.png" class="img-arrow">
            <span>{{record.updateContent}}</span>
          </div>
          <!--修改时字符过长分行-->
          <div v-show="record.showIndex === 2" class="record_item_detail_col">
            <span>{{record.earlyContent}}</span>
            <div class="flex-row-start">
              <img src="../../../../../static/img/arrow.png" class="img-arrow2">
              <span>{{record.updateContent}}</span>
            </div>
          </div>
        </timeline-item>
      </timeline>
    </div>
  </div>
</template>
<script>
  import XHeader from '../../../../components/x-header/index.vue'
  import Timeline from '../../../../components/timeline/timeline.vue'
  import TimelineItem from '../../../../components/timeline/timeline-item.vue'
  export default {
    components: {
      XHeader,
      Timeline,
      TimelineItem
    },
    created () {
      this.$vux.loading.show({
        text: '加载中...'
      })
      const self = this
      var data = [];
      self.currentProfile = self.$store.state.currentProfile;
      self.$store.dispatch('GET_HR_HISTORY', {
        id: self.currentProfile.id
      }).then(function (res) {
        if (res.result === 0) {
          res.data.forEach(function (n) {
            self.$set(n, 'showIndex',0);
            self.$set(n, 'earlyContent',"");
            self.$set(n, 'updateContent',"");
                //薪水需要解码
            var flag = 0;//0为添加；1为正常修改；2为有数据修改为无
                if(n.isSalary === 1){
                  const param = [];
                  if(n.beforeUpdateContent === ''){
                    flag = 0;
                  }else{
                    param.push(n.beforeUpdateContent)
                  }
                  if(n.fieldContent === ''){
                    flag = 2;
                  }else{
                    param.push(n.fieldContent)
                  }
                  if(param.length === 0){
                    n.showIndex = 0;
                    n.earlyContent = '';
                  }else{
                    self.$store.dispatch('DECODE_DATA_UPDATE_RECORD',param).then(function (res) {
                      if(res.item.length ===2){
                        n.showIndex = 1;
                        n.earlyContent = res.item[0]+"元";
                        n.updateContent = res.item[1]+"元";
                      }else if(res.item.length ===1){
                        if(flag === 0){
                          n.showIndex = 0;
                          n.earlyContent = res.item[0]+"元";
                        }else if(flag === 2){
                          n.showIndex = 1;
                          n.earlyContent = res.item[0]+"元";
                          n.updateContent = '无';
                        }
                      }
                    })
                  }
                }else{
                  if(n.beforeUpdateContent !== undefined && n.fieldContent !== undefined){
                    if(n.beforeUpdateContent === '' && n.fieldContent !== ""){
                      n.showIndex = 0;
                      n.earlyContent = n.fieldContent;
                    }else if(n.beforeUpdateContent !== '' && n.fieldContent === ""){
                      n.showIndex = 1;
                      n.earlyContent = n.beforeUpdateContent;
                      n.updateContent = '无';
                    }else if(n.beforeUpdateContent !== '' && n.fieldContent !== ""){
                      if(n.beforeUpdateContent.length >12){
                        n.showIndex = 2;
                        n.earlyContent = n.beforeUpdateContent;
                        n.updateContent = n.fieldContent;
                      }else{
                        n.showIndex = 1;
                        n.earlyContent = n.beforeUpdateContent;
                        n.updateContent = n.fieldContent;
                      }
                    }
                  }
                  if(n.earlyContent === 'null'){
                    n.earlyContent = '';
                  }
                  if(n.updateContent === 'null'){
                    n.showIndex = 3;
                  }
                }
                data.push(n)
            })
        }
        self.$vux.loading.hide()
      })
      self.historyRecord = data
    },
    data () {
      return {
        currentProfile: {},
        historyRecord: []
      }
    },
    methods: {
      employedDateChange () {

      },
      birthdayChange () {

      }
    }
  }
</script>
<style>
  .img-arrow{
    width:13px;
    height:13px;
    margin:0 9px;
  }
  .img-arrow2{
    width:13px;
    height:13px;
    margin:0 3px;
  }
  .record_item_detail{
    display: flex;
    justify-content:flex-start;
    align-items: center;
    margin-top: 8px;
    color: #999999;
  }
  .record_item_detail_col{
    display: flex;
    flex-direction: column;
    justify-content:flex-start;
    align-items: flex-start;
    margin-top: 8px;
    color: #999999;
  }
  .record_item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #333;
    font-size: 12px;
  }
  .bg-white {
    background-color: #fff;
  }
  .recent{
    color: #4a90e2;
  }
</style>

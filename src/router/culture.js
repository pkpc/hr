import Culture from '../views/culture/index.vue'
import RulesList from '../views/culture/rulesList.vue'
import AddArticle from '../views/culture/addArticle.vue'
import ArticleSetting from '../views/culture/articleSetting.vue'
import Preview from '../views/culture/preview.vue'
import Range from '../views/culture/range.vue'
import AddColumn from '../views/culture/addColumn.vue'
import SearchArticle from '../views/culture/searchArticle.vue'
import RangeList from '../views/culture/rangeList.vue'
import Read from '../views/culture/read.vue'

const basicUrl = '/culture';
export default [
  {
    path:basicUrl,
    name:'culture',
    component: Culture
  },{
    path:basicUrl+'/rulesList',
    name:'rulesList',
    component: RulesList
  },{
    path:basicUrl+'/addArticle',
    name:'addArticle',
    component: AddArticle
  },{
    path:basicUrl+'/articleSetting',
    name:'articleSetting',
    component: ArticleSetting
  },{
    path:basicUrl+'/preview',
    name:'preview',
    component: Preview
  },{
    path:basicUrl+'/range',
    name:'range',
    component: Range
  },{
    path:basicUrl+'/addColumn',
    name:'addColumn',
    component: AddColumn
  },{
    path:basicUrl+'/searchArticle',
    name:'searchArticle',
    component: SearchArticle
  },{
    path:basicUrl+'/rangeList',
    name:'rangeList',
    component: RangeList
  },{
    path:basicUrl+'/read',
    name:'read',
    component: Read
  }
]

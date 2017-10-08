import Setting from '../views/setting/index'
import SetHRManager from '../views/setting/setHRManager'
import BirthIndex from '../views/setting/birth/index'
import BirthRange from '../views/setting/birth/range'
import BirthReceiver from '../views/setting/birth/receiver'
import BirthContent from '../views/setting/birth/content'
import EmpType from '../views/setting/empType/index.vue'
import TypeDetail from '../views/setting/empType/typeDetail.vue'
import VisualAuth from '../views/setting/auth/index.vue'
import SetEmpAuth from '../views/setting/auth/setEmpAuth.vue'
import AuthDetail from '../views/setting/auth/authDetail.vue'
import EmpState from '../views/setting/empState.vue'
import EmpNum from '../views/setting/number/index.vue'
import NumTypeDetail from '../views/setting/number/numTypeDetail.vue'
import Desc from '../views/setting/number/desc.vue'

const baseUrl = '/setting'
const baseUrl_birth = '/setting/birth'
const baseUrl_auth = '/setting/auth'
const baseUrl_num = '/setting/num'
export default [
  {
    path: baseUrl,
    name: 'setting',
    component: Setting
  },
  {
    path: baseUrl + '/setHR',
    name: 'setHR',
    component: SetHRManager
  },
  {
    path: baseUrl_birth,
    name: 'birthIndex',
    component: BirthIndex
  },
  {
    path: baseUrl_birth + '/range',
    name: 'birthRange',
    component: BirthRange
  },
  {
    path: baseUrl_birth + '/receiver',
    name: 'birthReceiver',
    component: BirthReceiver
  },
  {
    path: baseUrl_birth + '/content',
    name: 'birthContent',
    component: BirthContent
  },
  {
    path: baseUrl + '/empType',
    name: 'empType',
    component: EmpType
  },
  {
    path: baseUrl + '/typeDetail',
    name: 'typeDetail',
    component: TypeDetail
  },
  {
    path: baseUrl_auth + '/visualAuth',
    name: 'visualAuth',
    component: VisualAuth
  },
  {
    path: baseUrl_auth + '/setEmpAuth',
    name: 'setEmpAuth',
    component: SetEmpAuth
  },
  {
    path: baseUrl_auth + '/authDetail',
    name: 'authDetail',
    component: AuthDetail
  },
  {
    path: baseUrl + '/empState',
    name: 'empState',
    component: EmpState
  },{
    path: baseUrl_num + '/empNum',
    name: 'empNum',
    component: EmpNum
  },{
    path: baseUrl_num + '/numTypeDetail',
    name: 'numTypeDetail',
    component: NumTypeDetail
  },{
    path: baseUrl_num + '/desc',
    name: 'desc',
    component: Desc
  }
]


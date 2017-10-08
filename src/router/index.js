// require.ensure 是 Webpack 的特殊语法，用来设置 code-split point
import Home from '../views/index'
import Setting from './setting'
import Profile from './profile'
import Culture from './culture'
const routers = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  ...Setting,
  ...Profile,
  ...Culture,
  {
    path: '*',
    component: Home
  }
]
export default routers

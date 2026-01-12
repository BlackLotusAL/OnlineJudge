import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import { createRouter, createWebHistory } from 'https://unpkg.com/vue-router@4/dist/vue-router.esm-browser.js';
import ElementPlus from 'https://cdn.jsdelivr.net/npm/element-plus@2.3.0/dist/index.full.min.js';
import axios from 'https://cdn.jsdelivr.net/npm/axios@1.5.0/dist/axios.min.js';

// 导入页面组件
import Dashboard from './pages/Dashboard.js';
import Questions from './pages/Questions.js';
import Exams from './pages/Exams.js';
import WrongAnswers from './pages/WrongAnswers.js';
import Rankings from './pages/Rankings.js';
import SubmitQuestion from './pages/SubmitQuestion.js';
import MyTickets from './pages/MyTickets.js';
import Admin from './pages/Admin.js';

// 配置路由
const routes = [
    { path: '/', component: Dashboard, name: 'Dashboard' },
    { path: '/questions', component: Questions, name: 'Questions' },
    { path: '/exams', component: Exams, name: 'Exams' },
    { path: '/wrong-answers', component: WrongAnswers, name: 'WrongAnswers' },
    { path: '/rankings', component: Rankings, name: 'Rankings' },
    { path: '/submit-question', component: SubmitQuestion, name: 'SubmitQuestion' },
    { path: '/my-tickets', component: MyTickets, name: 'MyTickets' },
    { path: '/admin', component: Admin, name: 'Admin' }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// 创建Vue应用
const app = createApp({
    template: `
        <div class="app-container">
            <el-container>
                <el-header>
                    <nav class="navbar">
                        <div class="logo">在线刷题系统</div>
                        <el-menu :default-active="$route.path" mode="horizontal" background-color="#545c64" text-color="#fff" active-text-color="#ffd04b">
                            <el-menu-item index="/" route="/">
                                <i class="fa fa-dashboard"></i>
                                <span>Dashboard</span>
                            </el-menu-item>
                            <el-menu-item index="/questions" route="/questions">
                                <i class="fa fa-book"></i>
                                <span>题库浏览</span>
                            </el-menu-item>
                            <el-menu-item index="/exams" route="/exams">
                                <i class="fa fa-file-text-o"></i>
                                <span>模拟考试</span>
                            </el-menu-item>
                            <el-menu-item index="/wrong-answers" route="/wrong-answers">
                                <i class="fa fa-exclamation-triangle"></i>
                                <span>错题本</span>
                            </el-menu-item>
                            <el-menu-item index="/rankings" route="/rankings">
                                <i class="fa fa-trophy"></i>
                                <span>排行榜</span>
                            </el-menu-item>
                            <el-menu-item index="/submit-question" route="/submit-question">
                                <i class="fa fa-plus-circle"></i>
                                <span>提交题目</span>
                            </el-menu-item>
                            <el-menu-item index="/my-tickets" route="/my-tickets">
                                <i class="fa fa-ticket"></i>
                                <span>我的工单</span>
                            </el-menu-item>
                            <el-menu-item index="/admin" route="/admin" style="margin-left: auto;">
                                <i class="fa fa-cog"></i>
                                <span>后台管理</span>
                            </el-menu-item>
                        </el-menu>
                    </nav>
                </el-header>
                <el-main>
                    <router-view></router-view>
                </el-main>
                <el-footer>
                    <div class="footer-content">
                        <p>在线刷题系统 &copy; {{ new Date().getFullYear() }}</p>
                    </div>
                </el-footer>
            </el-container>
        </div>
    `
});

// 配置Axios
app.config.globalProperties.$axios = axios;
axios.defaults.baseURL = 'http://47.83.236.198:8000/api';

// 使用插件
app.use(router);
app.use(ElementPlus);

// 挂载应用
app.mount('#app');

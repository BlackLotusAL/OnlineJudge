// 使用全局变量，因为已在index.html中通过script标签加载
const { createApp } = Vue;
const { createRouter, createWebHistory } = VueRouter;
// ElementPlus和axios已经是全局变量，不需要重新赋值

// 导入页面组件
// 使用动态导入或直接在页面中定义组件，避免模块导入问题
const Dashboard = {
    template: '<div class="dashboard"><h1>Dashboard</h1><p>欢迎使用在线刷题系统</p></div>'
};
const Questions = {
    template: '<div class="questions"><h1>题库浏览</h1><p>题目列表将在此显示</p></div>'
};
const Exams = {
    template: '<div class="exams"><h1>模拟考试</h1><p>考试功能将在此实现</p></div>'
};
const WrongAnswers = {
    template: '<div class="wrong-answers"><h1>错题本</h1><p>错题列表将在此显示</p></div>'
};
const Rankings = {
    template: '<div class="rankings"><h1>排行榜</h1><p>排行榜将在此显示</p></div>'
};
const SubmitQuestion = {
    template: '<div class="submit-question"><h1>提交题目</h1><p>题目提交功能将在此实现</p></div>'
};
const MyTickets = {
    template: '<div class="my-tickets"><h1>我的工单</h1><p>工单列表将在此显示</p></div>'
};
const Admin = {
    template: '<div class="admin"><h1>后台管理</h1><p>管理功能将在此实现</p></div>'
};

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

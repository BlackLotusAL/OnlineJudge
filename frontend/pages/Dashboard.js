export default {
    template: `
        <div class="dashboard">
            <h1>欢迎使用在线刷题系统</h1>
            <div class="stat-grid">
                <div class="stat-card">
                    <div class="stat-number">{{ totalQuestions }}</div>
                    <div class="stat-label">系统总题目数</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">{{ userCount }}</div>
                    <div class="stat-label">用户总数</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">{{ todayActiveUsers }}</div>
                    <div class="stat-label">今日活跃用户</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">{{ overallAccuracy }}%</div>
                    <div class="stat-label">整体正确率</div>
                </div>
            </div>
            
            <div class="user-stats">
                <h2>我的刷题统计</h2>
                <el-row :gutter="20">
                    <el-col :span="8">
                        <el-card shadow="hover">
                            <template #header>
                                <div class="card-header">
                                    <span>刷题总量</span>
                                </div>
                            </template>
                            <div class="card-content">
                                <div class="stat-value">{{ userStats.total }}</div>
                            </div>
                        </el-card>
                    </el-col>
                    <el-col :span="8">
                        <el-card shadow="hover">
                            <template #header>
                                <div class="card-header">
                                    <span>正确率</span>
                                </div>
                            </template>
                            <div class="card-content">
                                <div class="stat-value">{{ userStats.accuracy }}%</div>
                            </div>
                        </el-card>
                    </el-col>
                    <el-col :span="8">
                        <el-card shadow="hover">
                            <template #header>
                                <div class="card-header">
                                    <span>今日刷题</span>
                                </div>
                            </template>
                            <div class="card-content">
                                <div class="stat-value">{{ userStats.today }}</div>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>
            </div>
        </div>
    `,
    data() {
        return {
            totalQuestions: 0,
            userCount: 0,
            todayActiveUsers: 0,
            overallAccuracy: 0,
            userStats: {
                total: 0,
                accuracy: 0,
                today: 0
            }
        };
    },
    mounted() {
        this.fetchStats();
        this.fetchUserStats();
    },
    methods: {
        fetchStats() {
            // 模拟获取系统统计数据
            setTimeout(() => {
                this.totalQuestions = 1500;
                this.userCount = 500;
                this.todayActiveUsers = 50;
                this.overallAccuracy = 78.5;
            }, 500);
        },
        fetchUserStats() {
            // 模拟获取用户统计数据
            setTimeout(() => {
                this.userStats = {
                    total: 120,
                    accuracy: 85.2,
                    today: 10
                };
            }, 700);
        }
    }
};

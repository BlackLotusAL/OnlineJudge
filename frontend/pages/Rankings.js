export default {
    template: `
        <div class="rankings">
            <h1>排行榜</h1>
            
            <el-tabs v-model="activeTab" class="rankings-tabs">
                <el-tab-pane label="刷题总量" name="total">
                    <el-table :data="totalRankings" style="width: 100%" class="rankings-table">
                        <el-table-column prop="rank" label="排名" width="80">
                            <template #default="scope">
                                <el-rank v-if="scope.row.rank <= 3" :num="scope.row.rank"></el-rank>
                                <span v-else>{{ scope.row.rank }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="userId" label="用户ID" width="100"></el-table-column>
                        <el-table-column prop="userIp" label="用户IP" width="150"></el-table-column>
                        <el-table-column prop="totalQuestions" label="刷题总量" width="120">
                            <template #default="scope">
                                <el-tag type="primary">{{ scope.row.totalQuestions }}</el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="correctQuestions" label="正确题数" width="120"></el-table-column>
                        <el-table-column prop="accuracy" label="正确率" width="100">
                            <template #default="scope">
                                <el-progress :percentage="scope.row.accuracy" :stroke-width="15" :show-text="true"></el-progress>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                
                <el-tab-pane label="正确率" name="accuracy">
                    <el-table :data="accuracyRankings" style="width: 100%" class="rankings-table">
                        <el-table-column prop="rank" label="排名" width="80">
                            <template #default="scope">
                                <el-rank v-if="scope.row.rank <= 3" :num="scope.row.rank"></el-rank>
                                <span v-else>{{ scope.row.rank }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="userId" label="用户ID" width="100"></el-table-column>
                        <el-table-column prop="userIp" label="用户IP" width="150"></el-table-column>
                        <el-table-column prop="accuracy" label="正确率" width="100">
                            <template #default="scope">
                                <el-progress :percentage="scope.row.accuracy" :stroke-width="15" :show-text="true"></el-progress>
                            </template>
                        </el-table-column>
                        <el-table-column prop="correctQuestions" label="正确题数" width="120"></el-table-column>
                        <el-table-column prop="totalQuestions" label="刷题总量" width="120"></el-table-column>
                    </el-table>
                </el-tab-pane>
                
                <el-tab-pane label="贡献榜" name="contribution">
                    <el-table :data="contributionRankings" style="width: 100%" class="rankings-table">
                        <el-table-column prop="rank" label="排名" width="80">
                            <template #default="scope">
                                <el-rank v-if="scope.row.rank <= 3" :num="scope.row.rank"></el-rank>
                                <span v-else>{{ scope.row.rank }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="userId" label="用户ID" width="100"></el-table-column>
                        <el-table-column prop="userIp" label="用户IP" width="150"></el-table-column>
                        <el-table-column prop="contributedQuestions" label="贡献题目数" width="150">
                            <template #default="scope">
                                <el-tag type="success">{{ scope.row.contributedQuestions }}</el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="approvedQuestions" label="审核通过" width="120"></el-table-column>
                        <el-table-column prop="rankingScore" label="贡献分数" width="120"></el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
            
            <div class="my-ranking">
                <el-card shadow="hover">
                    <template #header>
                        <div class="card-header">
                            <span>我的排名</span>
                        </div>
                    </template>
                    <div class="my-ranking-info">
                        <p v-if="myRanking">
                            <strong>刷题总量排名：</strong>{{ myRanking.totalRank }} / {{ totalUsers }}
                        </p>
                        <p v-if="myRanking">
                            <strong>正确率排名：</strong>{{ myRanking.accuracyRank }} / {{ totalUsers }}
                        </p>
                        <p v-if="myRanking">
                            <strong>贡献榜排名：</strong>{{ myRanking.contributionRank }} / {{ totalUsers }}
                        </p>
                        <p v-else>
                            您还没有排名数据
                        </p>
                    </div>
                </el-card>
            </div>
        </div>
    `,
    data() {
        return {
            activeTab: 'total',
            totalRankings: [],
            accuracyRankings: [],
            contributionRankings: [],
            myRanking: null,
            totalUsers: 0
        };
    },
    mounted() {
        this.loadRankings();
    },
    methods: {
        loadRankings() {
            // 模拟加载排行榜数据
            setTimeout(() => {
                // 刷题总量排行榜
                this.totalRankings = [
                    { rank: 1, userId: 1, userIp: '192.168.1.1', totalQuestions: 500, correctQuestions: 450, accuracy: 90 },
                    { rank: 2, userId: 2, userIp: '192.168.1.2', totalQuestions: 450, correctQuestions: 405, accuracy: 90 },
                    { rank: 3, userId: 3, userIp: '192.168.1.3', totalQuestions: 400, correctQuestions: 360, accuracy: 90 },
                    { rank: 4, userId: 4, userIp: '192.168.1.4', totalQuestions: 350, correctQuestions: 308, accuracy: 88 },
                    { rank: 5, userId: 5, userIp: '192.168.1.5', totalQuestions: 300, correctQuestions: 264, accuracy: 88 }
                ];
                
                // 正确率排行榜
                this.accuracyRankings = [
                    { rank: 1, userId: 6, userIp: '192.168.1.6', totalQuestions: 200, correctQuestions: 190, accuracy: 95 },
                    { rank: 2, userId: 7, userIp: '192.168.1.7', totalQuestions: 150, correctQuestions: 141, accuracy: 94 },
                    { rank: 3, userId: 8, userIp: '192.168.1.8', totalQuestions: 180, correctQuestions: 166, accuracy: 92.2 },
                    { rank: 4, userId: 1, userIp: '192.168.1.1', totalQuestions: 500, correctQuestions: 450, accuracy: 90 },
                    { rank: 5, userId: 2, userIp: '192.168.1.2', totalQuestions: 450, correctQuestions: 405, accuracy: 90 }
                ];
                
                // 贡献榜
                this.contributionRankings = [
                    { rank: 1, userId: 9, userIp: '192.168.1.9', contributedQuestions: 50, approvedQuestions: 45, rankingScore: 450 },
                    { rank: 2, userId: 10, userIp: '192.168.1.10', contributedQuestions: 40, approvedQuestions: 38, rankingScore: 380 },
                    { rank: 3, userId: 11, userIp: '192.168.1.11', contributedQuestions: 35, approvedQuestions: 32, rankingScore: 320 },
                    { rank: 4, userId: 12, userIp: '192.168.1.12', contributedQuestions: 30, approvedQuestions: 28, rankingScore: 280 },
                    { rank: 5, userId: 13, userIp: '192.168.1.13', contributedQuestions: 25, approvedQuestions: 22, rankingScore: 220 }
                ];
                
                // 我的排名
                this.myRanking = {
                    totalRank: 10,
                    accuracyRank: 15,
                    contributionRank: 20
                };
                
                this.totalUsers = 500;
            }, 500);
        }
    }
};

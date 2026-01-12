export default {
    template: `
        <div class="admin">
            <h1>后台管理</h1>
            
            <el-tabs v-model="activeTab" class="admin-tabs">
                <el-tab-pane label="题目管理" name="questions">
                    <div class="admin-section">
                        <el-card shadow="hover">
                            <template #header>
                                <div class="card-header">
                                    <span>题目列表</span>
                                    <el-button type="primary" @click="addQuestion">添加题目</el-button>
                                </div>
                            </template>
                            
                            <el-form :inline="true" :model="questionFilter" class="filter-form">
                                <el-form-item label="题目ID">
                                    <el-input v-model="questionFilter.id" placeholder="请输入题目ID"></el-input>
                                </el-form-item>
                                <el-form-item label="题目类型">
                                    <el-select v-model="questionFilter.type" placeholder="请选择题目类型">
                                        <el-option label="单选题" value="单选题"></el-option>
                                        <el-option label="多选题" value="多选题"></el-option>
                                        <el-option label="判断题" value="判断题"></el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="状态">
                                    <el-select v-model="questionFilter.status" placeholder="请选择状态">
                                        <el-option label="待审核" value="pending"></el-option>
                                        <el-option label="已通过" value="approved"></el-option>
                                        <el-option label="已拒绝" value="rejected"></el-option>
                                        <el-option label="草稿" value="draft"></el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item>
                                    <el-button type="primary" @click="filterQuestions">筛选</el-button>
                                    <el-button @click="resetQuestionFilter">重置</el-button>
                                </el-form-item>
                            </el-form>
                            
                            <el-table :data="questions" style="width: 100%" class="questions-table">
                                <el-table-column prop="id" label="题目ID" width="80"></el-table-column>
                                <el-table-column prop="type" label="题目类型" width="100"></el-table-column>
                                <el-table-column prop="content" label="题干" min-width="300">
                                    <template #default="scope">
                                        <div class="question-content">{{ scope.row.content }}</div>
                                    </template>
                                </el-table-column>
                                <el-table-column prop="status" label="状态" width="100">
                                    <template #default="scope">
                                        <el-tag :type="getQuestionStatusType(scope.row.status)">
                                            {{ getQuestionStatusLabel(scope.row.status) }}
                                        </el-tag>
                                    </template>
                                </el-table-column>
                                <el-table-column prop="created_at" label="创建时间" width="180"></el-table-column>
                                <el-table-column label="操作" width="200">
                                    <template #default="scope">
                                        <el-button type="primary" size="small" @click="editQuestion(scope.row)">编辑</el-button>
                                        <el-button 
                                            type="success" 
                                            size="small" 
                                            @click="approveQuestion(scope.row)"
                                            v-if="scope.row.status === 'pending'"
                                        >
                                            通过
                                        </el-button>
                                        <el-button 
                                            type="danger" 
                                            size="small" 
                                            @click="rejectQuestion(scope.row)"
                                            v-if="scope.row.status === 'pending'"
                                        >
                                            拒绝
                                        </el-button>
                                        <el-button type="danger" size="small" @click="deleteQuestion(scope.row)">删除</el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-card>
                    </div>
                </el-tab-pane>
                
                <el-tab-pane label="工单管理" name="tickets">
                    <div class="admin-section">
                        <el-card shadow="hover">
                            <template #header>
                                <div class="card-header">
                                    <span>工单列表</span>
                                </div>
                            </template>
                            
                            <el-table :data="tickets" style="width: 100%" class="tickets-table">
                                <el-table-column prop="id" label="工单ID" width="100"></el-table-column>
                                <el-table-column prop="title" label="工单标题" min-width="200"></el-table-column>
                                <el-table-column prop="question_id" label="题目ID" width="100"></el-table-column>
                                <el-table-column prop="user_ip" label="提交者IP" width="150"></el-table-column>
                                <el-table-column prop="status" label="状态" width="100">
                                    <template #default="scope">
                                        <el-tag :type="getTicketStatusType(scope.row.status)">
                                            {{ getTicketStatusLabel(scope.row.status) }}
                                        </el-tag>
                                    </template>
                                </el-table-column>
                                <el-table-column label="操作" width="200">
                                    <template #default="scope">
                                        <el-button type="primary" size="small" @click="viewTicket(scope.row)">查看</el-button>
                                        <el-button 
                                            type="success" 
                                            size="small" 
                                            @click="resolveTicket(scope.row)"
                                            v-if="scope.row.status !== 'resolved'"
                                        >
                                            解决
                                        </el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-card>
                    </div>
                </el-tab-pane>
                
                <el-tab-pane label="用户管理" name="users">
                    <div class="admin-section">
                        <el-card shadow="hover">
                            <template #header>
                                <div class="card-header">
                                    <span>用户列表</span>
                                </div>
                            </template>
                            
                            <el-table :data="users" style="width: 100%" class="users-table">
                                <el-table-column prop="id" label="用户ID" width="80"></el-table-column>
                                <el-table-column prop="ip_address" label="用户IP" width="150"></el-table-column>
                                <el-table-column prop="first_access_time" label="首次访问" width="180"></el-table-column>
                                <el-table-column prop="last_active_time" label="最后活跃" width="180"></el-table-column>
                                <el-table-column prop="total_questions" label="刷题总量" width="120"></el-table-column>
                                <el-table-column prop="accuracy" label="正确率" width="100">
                                    <template #default="scope">
                                        <el-progress :percentage="scope.row.accuracy" :stroke-width="15" :show-text="true"></el-progress>
                                    </template>
                                </el-table-column>
                                <el-table-column label="操作" width="150">
                                    <template #default="scope">
                                        <el-button type="primary" size="small" @click="viewUser(scope.row)">查看详情</el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-card>
                    </div>
                </el-tab-pane>
                
                <el-tab-pane label="系统配置" name="config">
                    <div class="admin-section">
                        <el-card shadow="hover">
                            <template #header>
                                <div class="card-header">
                                    <span>系统配置</span>
                                </div>
                            </template>
                            <el-form :model="systemConfig" label-width="150px">
                                <el-form-item label="系统名称">
                                    <el-input v-model="systemConfig.systemName"></el-input>
                                </el-form-item>
                                <el-form-item label="默认考试时长">
                                    <el-input-number v-model="systemConfig.defaultExamDuration" :min="300" :max="7200" :step="60"></el-input-number>
                                    <span class="unit">秒</span>
                                </el-form-item>
                                <el-form-item label="默认题目数量">
                                    <el-input-number v-model="systemConfig.defaultQuestionCount" :min="10" :max="100" :step="10"></el-input-number>
                                    <span class="unit">题</span>
                                </el-form-item>
                                <el-form-item>
                                    <el-button type="primary" @click="saveConfig">保存配置</el-button>
                                </el-form-item>
                            </el-form>
                        </el-card>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </div>
    `,
    data() {
        return {
            activeTab: 'questions',
            // 题目管理
            questions: [],
            questionFilter: {
                id: '',
                type: '',
                status: ''
            },
            // 工单管理
            tickets: [],
            // 用户管理
            users: [],
            // 系统配置
            systemConfig: {
                systemName: '在线刷题系统',
                defaultExamDuration: 3600,
                defaultQuestionCount: 30
            }
        };
    },
    mounted() {
        this.loadQuestions();
        this.loadTickets();
        this.loadUsers();
    },
    methods: {
        // 题目管理相关方法
        loadQuestions() {
            // 模拟加载题目数据
            setTimeout(() => {
                this.questions = [
                    {
                        id: 1,
                        type: '单选题',
                        content: '下列哪个是Python的关键字？',
                        options: JSON.stringify(['if', 'then', 'elif', 'elseif']),
                        correct_answer: 'A,C',
                        status: 'approved',
                        created_at: '2026-01-10 10:00:00'
                    },
                    {
                        id: 2,
                        type: '判断题',
                        content: 'Python是一种解释型语言。',
                        options: JSON.stringify(['对', '错']),
                        correct_answer: 'A',
                        status: 'pending',
                        created_at: '2026-01-11 14:30:00'
                    }
                ];
            }, 500);
        },
        filterQuestions() {
            // 模拟筛选题目
            this.loadQuestions();
        },
        resetQuestionFilter() {
            this.questionFilter = {
                id: '',
                type: '',
                status: ''
            };
            this.loadQuestions();
        },
        addQuestion() {
            this.$message.info('添加题目功能待实现');
        },
        editQuestion(question) {
            this.$message.info(`编辑题目ID: ${question.id}`);
        },
        approveQuestion(question) {
            question.status = 'approved';
            this.$message.success('题目已通过审核');
        },
        rejectQuestion(question) {
            question.status = 'rejected';
            this.$message.success('题目已拒绝');
        },
        deleteQuestion(question) {
            this.$confirm('确定要删除该题目吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.questions = this.questions.filter(item => item.id !== question.id);
                this.$message.success('题目已删除');
            }).catch(() => {
                this.$message.info('已取消删除');
            });
        },
        getQuestionStatusType(status) {
            const typeMap = {
                pending: 'warning',
                approved: 'success',
                rejected: 'danger',
                draft: 'info'
            };
            return typeMap[status] || 'info';
        },
        getQuestionStatusLabel(status) {
            const labelMap = {
                pending: '待审核',
                approved: '已通过',
                rejected: '已拒绝',
                draft: '草稿'
            };
            return labelMap[status] || status;
        },
        
        // 工单管理相关方法
        loadTickets() {
            // 模拟加载工单数据
            setTimeout(() => {
                this.tickets = [
                    {
                        id: 1,
                        title: '题目答案错误',
                        question_id: 1,
                        user_ip: '192.168.1.1',
                        status: 'pending',
                        content: '题目1的正确答案应该是A,C，而不是A',
                        created_at: '2026-01-10 14:30:00'
                    },
                    {
                        id: 2,
                        title: '题目描述不清',
                        question_id: 2,
                        user_ip: '192.168.1.2',
                        status: 'resolved',
                        content: '题目2的描述有些模糊，建议修改',
                        created_at: '2026-01-09 10:20:00',
                        resolved_at: '2026-01-09 14:45:00',
                        resolution: '已修改题目描述，使其更加清晰'
                    }
                ];
            }, 500);
        },
        viewTicket(ticket) {
            this.$message.info(`查看工单ID: ${ticket.id}`);
        },
        resolveTicket(ticket) {
            this.$prompt('请输入解决方案', '解决工单', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                inputPlaceholder: '请输入解决方案'
            }).then(({ value }) => {
                ticket.status = 'resolved';
                ticket.resolution = value;
                ticket.resolved_at = new Date().toLocaleString();
                this.$message.success('工单已解决');
            }).catch(() => {
                this.$message.info('已取消解决');
            });
        },
        getTicketStatusType(status) {
            const typeMap = {
                pending: 'warning',
                processing: 'info',
                resolved: 'success',
                closed: 'danger'
            };
            return typeMap[status] || 'info';
        },
        getTicketStatusLabel(status) {
            const labelMap = {
                pending: '待处理',
                processing: '处理中',
                resolved: '已解决',
                closed: '已关闭'
            };
            return labelMap[status] || status;
        },
        
        // 用户管理相关方法
        loadUsers() {
            // 模拟加载用户数据
            setTimeout(() => {
                this.users = [
                    {
                        id: 1,
                        ip_address: '192.168.1.1',
                        first_access_time: '2026-01-01 10:00:00',
                        last_active_time: '2026-01-12 14:30:00',
                        total_questions: 500,
                        correct_questions: 450,
                        accuracy: 90
                    },
                    {
                        id: 2,
                        ip_address: '192.168.1.2',
                        first_access_time: '2026-01-05 09:30:00',
                        last_active_time: '2026-01-12 15:45:00',
                        total_questions: 300,
                        correct_questions: 264,
                        accuracy: 88
                    }
                ];
            }, 500);
        },
        viewUser(user) {
            this.$message.info(`查看用户ID: ${user.id}`);
        },
        
        // 系统配置相关方法
        saveConfig() {
            this.$message.success('系统配置已保存');
        }
    }
};

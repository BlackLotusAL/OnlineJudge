// 使用全局变量，因为已在index.html中通过script标签加载
const { createApp } = Vue;
const { createRouter, createWebHistory } = VueRouter;
// ElementPlus和axios已经是全局变量，不需要重新赋值

// 导入页面组件
// 使用动态导入或直接在页面中定义组件，避免模块导入问题
const Dashboard = {
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
            // 获取系统统计数据
            this.$axios.get('/questions/')
                .then(response => {
                    this.totalQuestions = response.data.length;
                })
                .catch(error => {
                    console.error('获取统计数据失败:', error);
                    this.$message.error('获取统计数据失败');
                });
        },
        fetchUserStats() {
            // 获取当前用户信息
            this.$axios.get('/users/me')
                .then(response => {
                    this.userStats = {
                        total: response.data.total_questions || 0,
                        accuracy: response.data.accuracy || 0,
                        today: 0 // 暂时没有今日刷题数据
                    };
                })
                .catch(error => {
                    console.error('获取用户数据失败:', error);
                    this.$message.error('获取用户数据失败');
                });
        }
    }
};
const Questions = {
    template: `
        <div class="questions">
            <h1>题库浏览</h1>
            
            <el-card shadow="hover" class="filter-card">
                <el-form :inline="true" :model="searchForm" class="search-form">
                    <el-form-item label="题目类型">
                        <el-select v-model="searchForm.type" placeholder="请选择题目类型">
                            <el-option label="单选题" value="单选题"></el-option>
                            <el-option label="多选题" value="多选题"></el-option>
                            <el-option label="判断题" value="判断题"></el-option>
                        </el-select>
                    </el-form-item>
                    
                    <el-form-item label="所属科目">
                        <el-input v-model="searchForm.subject" placeholder="请输入科目"></el-input>
                    </el-form-item>
                    
                    <el-form-item label="难度范围">
                        <el-slider v-model="searchForm.difficulty" range :min="1" :max="5"></el-slider>
                    </el-form-item>
                    
                    <el-form-item>
                        <el-button type="primary" @click="searchQuestions">搜索</el-button>
                        <el-button @click="resetForm">重置</el-button>
                    </el-form-item>
                </el-form>
            </el-card>
            
            <el-table :data="questions" style="width: 100%" class="questions-table">
                <el-table-column prop="id" label="题目ID" width="80"></el-table-column>
                <el-table-column prop="type" label="题目类型" width="100"></el-table-column>
                <el-table-column prop="content" label="题干" min-width="300">
                    <template #default="scope">
                        <div class="question-content">{{ scope.row.content }}</div>
                    </template>
                </el-table-column>
                <el-table-column prop="subject" label="所属科目" width="120"></el-table-column>
                <el-table-column prop="difficulty" label="难度" width="80">
                    <template #default="scope">
                        <el-rate v-model="scope.row.difficulty" disabled :max="5"></el-rate>
                    </template>
                </el-table-column>
                <el-table-column prop="tags" label="标签" width="150">
                    <template #default="scope">
                        <el-tag v-for="tag in scope.row.tags.split(',')" :key="tag" size="small">{{ tag }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180">
                    <template #default="scope">
                        <el-button type="primary" size="small" @click="viewQuestion(scope.row)">查看详情</el-button>
                        <el-button size="small" @click="collectQuestion(scope.row)">收藏</el-button>
                        <el-button type="danger" size="small" @click="reportQuestion(scope.row)">纠错</el-button>
                    </template>
                </el-table-column>
            </el-table>
            
            <div class="pagination-container">
                <el-pagination
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="currentPage"
                    :page-sizes="[10, 20, 50, 100]"
                    :page-size="pageSize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="totalQuestions">
                </el-pagination>
            </div>
            
            <!-- 题目详情对话框 -->
            <el-dialog v-model="dialogVisible" title="题目详情" width="60%">
                <div v-if="currentQuestion" class="question-detail">
                    <h3>{{ currentQuestion.content }}</h3>
                    <div v-if="currentQuestion.image" class="question-image">
                        <img :src="currentQuestion.image" alt="题目图片">
                    </div>
                    <div class="question-options">
                        <div v-for="(option, index) in JSON.parse(currentQuestion.options)" :key="index" class="option-item">
                            <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
                            <span class="option-content">{{ option }}</span>
                        </div>
                    </div>
                    <div class="question-info">
                        <p><strong>正确答案：</strong>{{ currentQuestion.correct_answer }}</p>
                        <p><strong>解题思路：</strong>{{ currentQuestion.explanation }}</p>
                        <p><strong>难度：</strong><el-rate v-model="currentQuestion.difficulty" disabled :max="5"></el-rate></p>
                        <p><strong>所属科目：</strong>{{ currentQuestion.subject }}</p>
                        <p><strong>标签：</strong>
                            <el-tag v-for="tag in currentQuestion.tags.split(',')" :key="tag" size="small">{{ tag }}</el-tag>
                        </p>
                    </div>
                </div>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="dialogVisible = false">关闭</el-button>
                    </span>
                </template>
            </el-dialog>
        </div>
    `,
    data() {
        return {
            searchForm: {
                type: '',
                subject: '',
                difficulty: [1, 5]
            },
            questions: [],
            totalQuestions: 0,
            currentPage: 1,
            pageSize: 20,
            dialogVisible: false,
            currentQuestion: null
        };
    },
    mounted() {
        this.searchQuestions();
    },
    methods: {
        searchQuestions() {
            // 构建查询参数
            const params = {
                skip: (this.currentPage - 1) * this.pageSize,
                limit: this.pageSize
            };
            
            if (this.searchForm.type) {
                params.type = this.searchForm.type;
            }
            if (this.searchForm.subject) {
                params.subject = this.searchForm.subject;
            }
            if (this.searchForm.difficulty) {
                params.difficulty_min = this.searchForm.difficulty[0];
                params.difficulty_max = this.searchForm.difficulty[1];
            }
            
            // 获取题目数据
            this.$axios.get('/questions/', { params })
                .then(response => {
                    this.questions = response.data;
                    this.totalQuestions = response.data.length;
                })
                .catch(error => {
                    console.error('获取题目失败:', error);
                    this.$message.error('获取题目失败');
                });
        },
        resetForm() {
            this.searchForm = {
                type: '',
                subject: '',
                difficulty: [1, 5]
            };
            this.searchQuestions();
        },
        handleSizeChange(val) {
            this.pageSize = val;
            this.searchQuestions();
        },
        handleCurrentChange(val) {
            this.currentPage = val;
            this.searchQuestions();
        },
        viewQuestion(question) {
            this.currentQuestion = question;
            this.dialogVisible = true;
        },
        collectQuestion(question) {
            this.$message.success('收藏成功！');
        },
        reportQuestion(question) {
            this.$router.push({
                name: 'MyTickets',
                params: { questionId: question.id }
            });
        }
    }
};
const Exams = {
    template: `
        <div class="exams">
            <h1>模拟考试</h1>
            
            <el-card shadow="hover" class="exam-config-card">
                <h2>生成新试卷</h2>
                <el-form :model="examConfig" label-width="100px">
                    <el-form-item label="考试时长">
                        <el-input-number v-model="examConfig.duration" :min="300" :max="7200" :step="60" :formatter="formatTime" :parser="parseTime"></el-input-number>
                        <span class="unit">秒</span>
                    </el-form-item>
                    <el-form-item label="总题数">
                        <el-input-number v-model="examConfig.totalQuestions" :min="10" :max="100" :step="10"></el-input-number>
                        <span class="unit">题</span>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="generateExam">生成试卷</el-button>
                    </el-form-item>
                </el-form>
            </el-card>
            
            <div v-if="currentExam" class="current-exam">
                <el-card shadow="hover">
                    <template #header>
                        <div class="exam-header">
                            <h2>正在进行的考试</h2>
                            <div class="exam-timer">
                                <el-tag type="danger" size="large">剩余时间: {{ formatTimeRemaining }}</el-tag>
                            </div>
                        </div>
                    </template>
                    <div class="exam-info">
                        <p>考试ID: {{ currentExam.id }}</p>
                        <p>开始时间: {{ currentExam.startTime }}</p>
                        <p>状态: {{ currentExam.status }}</p>
                        <p>总分: {{ currentExam.totalScore }}</p>
                    </div>
                    <el-button type="primary" @click="startExam">开始答题</el-button>
                </el-card>
            </div>
            
            <div class="exam-history">
                <h2>考试历史记录</h2>
                <el-table :data="examHistory" style="width: 100%">
                    <el-table-column prop="id" label="考试ID" width="80"></el-table-column>
                    <el-table-column prop="startTime" label="开始时间"></el-table-column>
                    <el-table-column prop="endTime" label="结束时间"></el-table-column>
                    <el-table-column prop="status" label="状态" width="100"></el-table-column>
                    <el-table-column prop="totalScore" label="总分" width="80"></el-table-column>
                    <el-table-column prop="obtainedScore" label="得分" width="80"></el-table-column>
                    <el-table-column prop="accuracy" label="正确率" width="100">
                        <template #default="scope">
                            <span>{{ scope.row.accuracy }}%</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="120">
                        <template #default="scope">
                            <el-button type="primary" size="small" @click="viewExamResult(scope.row)">查看详情</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            
            <!-- 考试答题对话框 -->
            <el-dialog v-model="examDialogVisible" title="答题" width="80%" :close-on-click-modal="false" :close-on-press-escape="false">
                <div v-if="currentExam" class="exam-dialog">
                    <div class="exam-progress">
                        <el-steps :active="currentQuestionIndex" finish-status="success">
                            <el-step v-for="(question, index) in examQuestions" :key="index" title="第{{ index + 1 }}题"></el-step>
                        </el-steps>
                    </div>
                    
                    <div v-if="currentQuestion" class="exam-question">
                        <h3>{{ currentQuestionIndex + 1 }}. {{ currentQuestion.content }}</h3>
                        <div v-if="currentQuestion.image" class="question-image">
                            <img :src="currentQuestion.image" alt="题目图片">
                        </div>
                        <el-form :model="answerForm" label-width="0">
                            <el-form-item v-if="currentQuestion.type === '单选题'">
                                <el-radio-group v-model="answerForm.answer">
                                    <el-radio v-for="(option, index) in JSON.parse(currentQuestion.options)" :key="index" :label="String.fromCharCode(65 + index)">
                                        {{ String.fromCharCode(65 + index) }}. {{ option }}
                                    </el-radio>
                                </el-radio-group>
                            </el-form-item>
                            <el-form-item v-else-if="currentQuestion.type === '多选题'">
                                <el-checkbox-group v-model="answerForm.answer">
                                    <el-checkbox v-for="(option, index) in JSON.parse(currentQuestion.options)" :key="index" :label="String.fromCharCode(65 + index)">
                                        {{ String.fromCharCode(65 + index) }}. {{ option }}
                                    </el-checkbox>
                                </el-checkbox-group>
                            </el-form-item>
                            <el-form-item v-else-if="currentQuestion.type === '判断题'">
                                <el-radio-group v-model="answerForm.answer">
                                    <el-radio label="A">对</el-radio>
                                    <el-radio label="B">错</el-radio>
                                </el-radio-group>
                            </el-form-item>
                        </el-form>
                    </div>
                    
                    <div class="exam-navigation">
                        <el-button @click="prevQuestion" :disabled="currentQuestionIndex === 0">上一题</el-button>
                        <el-button @click="nextQuestion" :disabled="currentQuestionIndex === examQuestions.length - 1">下一题</el-button>
                        <el-button type="primary" @click="submitExam">提交试卷</el-button>
                    </div>
                </div>
            </el-dialog>
        </div>
    `,
    data() {
        return {
            examConfig: {
                duration: 3600,
                totalQuestions: 30
            },
            currentExam: null,
            examHistory: [],
            examDialogVisible: false,
            examQuestions: [],
            currentQuestionIndex: 0,
            currentQuestion: null,
            answerForm: {
                answer: ''
            },
            answers: {},
            timer: null,
            remainingTime: 0
        };
    },
    computed: {
        formatTimeRemaining() {
            const minutes = Math.floor(this.remainingTime / 60);
            const seconds = this.remainingTime % 60;
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    },
    mounted() {
        this.loadExamHistory();
    },
    beforeUnmount() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    },
    methods: {
        formatTime(value) {
            return `${value}秒`;
        },
        parseTime(value) {
            return parseInt(value);
        },
        generateExam() {
            // 生成试卷
            this.$axios.post('/exams/generate', {
                user_ip: '127.0.0.1',
                duration: this.examConfig.duration,
                total_questions: this.examConfig.totalQuestions
            })
                .then(response => {
                    this.currentExam = {
                        id: response.data.id,
                        startTime: new Date(response.data.start_time).toLocaleString(),
                        status: response.data.status,
                        totalScore: 100,
                        obtainedScore: 0,
                        duration: response.data.duration,
                        totalQuestions: response.data.total_questions
                    };
                    this.remainingTime = this.examConfig.duration;
                    this.startTimer();
                    this.$message.success('试卷生成成功！');
                })
                .catch(error => {
                    console.error('生成试卷失败:', error);
                    this.$message.error('生成试卷失败');
                });
        },
        startExam() {
            // 获取试卷题目
            this.$axios.get(`/exams/${this.currentExam.id}`)
                .then(response => {
                    this.examQuestions = response.data.questions || [];
                    this.currentQuestion = this.examQuestions[0];
                    this.examDialogVisible = true;
                })
                .catch(error => {
                    console.error('获取试卷题目失败:', error);
                    this.$message.error('获取试卷题目失败');
                });
        },
        startTimer() {
            this.timer = setInterval(() => {
                this.remainingTime--;
                if (this.remainingTime <= 0) {
                    clearInterval(this.timer);
                    this.submitExam();
                }
            }, 1000);
        },
        prevQuestion() {
            if (this.currentQuestionIndex > 0) {
                this.answers[this.currentQuestion.id] = this.answerForm.answer;
                this.currentQuestionIndex--;
                this.currentQuestion = this.examQuestions[this.currentQuestionIndex];
                this.answerForm.answer = this.answers[this.currentQuestion.id] || '';
            }
        },
        nextQuestion() {
            if (this.currentQuestionIndex < this.examQuestions.length - 1) {
                this.answers[this.currentQuestion.id] = this.answerForm.answer;
                this.currentQuestionIndex++;
                this.currentQuestion = this.examQuestions[this.currentQuestionIndex];
                this.answerForm.answer = this.answers[this.currentQuestion.id] || '';
            }
        },
        submitExam() {
            this.answers[this.currentQuestion.id] = this.answerForm.answer;
            
            // 提交试卷
            const answers = Object.keys(this.answers).map(questionId => ({
                question_id: parseInt(questionId),
                user_answer: this.answers[questionId]
            }));
            
            this.$axios.post(`/exams/${this.currentExam.id}/submit`, { answers })
                .then(response => {
                    this.examDialogVisible = false;
                    this.currentExam = null;
                    if (this.timer) {
                        clearInterval(this.timer);
                    }
                    this.$message.success('试卷提交成功！');
                    this.loadExamHistory();
                })
                .catch(error => {
                    console.error('提交试卷失败:', error);
                    this.$message.error('提交试卷失败');
                });
        },
        loadExamHistory() {
            // 获取考试历史
            this.$axios.get('/exams/history/127.0.0.1')
                .then(response => {
                    console.log('考试历史数据:', response.data);
                    this.examHistory = response.data.map(exam => ({
                        id: exam.id,
                        startTime: exam.start_time ? new Date(exam.start_time).toLocaleString() : '',
                        endTime: exam.end_time ? new Date(exam.end_time).toLocaleString() : '',
                        status: exam.status,
                        totalScore: exam.total_score || 0,
                        obtainedScore: exam.obtained_score || 0,
                        accuracy: exam.accuracy || 0
                    }));
                })
                .catch(error => {
                    console.error('获取考试历史失败:', error);
                    if (error.response) {
                        console.error('错误响应:', error.response.data);
                    }
                    this.$message.error('获取考试历史失败');
                });
        },
        viewExamResult(exam) {
            this.$router.push({
                path: `/exam-result/${exam.id}`
            });
        }
    }
};
const WrongAnswers = {
    template: `
        <div class="wrong-answers">
            <h1>错题本</h1>
            
            <el-card shadow="hover" class="filter-card">
                <el-form :inline="true" :model="filterForm" class="filter-form">
                    <el-form-item label="题目类型">
                        <el-select v-model="filterForm.type" placeholder="请选择题目类型">
                            <el-option label="单选题" value="单选题"></el-option>
                            <el-option label="多选题" value="多选题"></el-option>
                            <el-option label="判断题" value="判断题"></el-option>
                        </el-select>
                    </el-form-item>
                    
                    <el-form-item label="所属科目">
                        <el-input v-model="filterForm.subject" placeholder="请输入科目"></el-input>
                    </el-form-item>
                    
                    <el-form-item label="是否已复习">
                        <el-select v-model="filterForm.isReviewed" placeholder="请选择">
                            <el-option label="已复习" :value="true"></el-option>
                            <el-option label="未复习" :value="false"></el-option>
                        </el-select>
                    </el-form-item>
                    
                    <el-form-item>
                        <el-button type="primary" @click="filterWrongAnswers">筛选</el-button>
                        <el-button @click="resetFilter">重置</el-button>
                    </el-form-item>
                </el-form>
            </el-card>
            
            <el-table :data="wrongAnswers" style="width: 100%" class="wrong-answers-table">
                <el-table-column prop="id" label="错题ID" width="80"></el-table-column>
                <el-table-column prop="questionId" label="题目ID" width="80"></el-table-column>
                <el-table-column prop="questionType" label="题目类型" width="100"></el-table-column>
                <el-table-column prop="questionContent" label="题干" min-width="300">
                    <template #default="scope">
                        <div class="question-content">{{ scope.row.questionContent }}</div>
                    </template>
                </el-table-column>
                <el-table-column prop="userAnswer" label="我的答案" width="100"></el-table-column>
                <el-table-column prop="correctAnswer" label="正确答案" width="100"></el-table-column>
                <el-table-column prop="wrongTime" label="答错时间" width="180"></el-table-column>
                <el-table-column prop="isReviewed" label="是否已复习" width="120">
                    <template #default="scope">
                        <el-switch v-model="scope.row.isReviewed" @change="updateReviewStatus(scope.row)"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="200">
                    <template #default="scope">
                        <el-button type="primary" size="small" @click="viewQuestion(scope.row)">查看详情</el-button>
                        <el-button type="success" size="small" @click="retryQuestion(scope.row)">重做</el-button>
                        <el-button type="danger" size="small" @click="removeWrongAnswer(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            
            <div class="pagination-container">
                <el-pagination
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="currentPage"
                    :page-sizes="[10, 20, 50, 100]"
                    :page-size="pageSize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="totalWrongAnswers">
                </el-pagination>
            </div>
            
            <!-- 题目详情对话框 -->
            <el-dialog v-model="dialogVisible" title="题目详情" width="60%">
                <div v-if="currentWrongAnswer" class="question-detail">
                    <h3>{{ currentWrongAnswer.questionContent }}</h3>
                    <div class="question-options">
                        <div v-for="(option, index) in JSON.parse(currentWrongAnswer.options)" :key="index" class="option-item">
                            <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
                            <span class="option-content">{{ option }}</span>
                        </div>
                    </div>
                    <div class="answer-comparison">
                        <p><strong>我的答案：</strong><el-tag type="danger">{{ currentWrongAnswer.userAnswer }}</el-tag></p>
                        <p><strong>正确答案：</strong><el-tag type="success">{{ currentWrongAnswer.correctAnswer }}</el-tag></p>
                    </div>
                    <div class="question-explanation">
                        <h4>解题思路：</h4>
                        <p>{{ currentWrongAnswer.explanation }}</p>
                    </div>
                </div>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="dialogVisible = false">关闭</el-button>
                    </span>
                </template>
            </el-dialog>
        </div>
    `,
    data() {
        return {
            filterForm: {
                type: '',
                subject: '',
                isReviewed: null
            },
            wrongAnswers: [],
            totalWrongAnswers: 0,
            currentPage: 1,
            pageSize: 20,
            dialogVisible: false,
            currentWrongAnswer: null
        };
    },
    mounted() {
        this.loadWrongAnswers();
    },
    methods: {
        loadWrongAnswers() {
            // 构建查询参数
            const params = {
                skip: (this.currentPage - 1) * this.pageSize,
                limit: this.pageSize
            };
            
            if (this.filterForm.type) {
                params.type = this.filterForm.type;
            }
            if (this.filterForm.subject) {
                params.subject = this.filterForm.subject;
            }
            if (this.filterForm.isReviewed !== null) {
                params.is_reviewed = this.filterForm.isReviewed;
            }
            
            // 获取错题数据
            this.$axios.get('/wrong-answers/', { params })
                .then(response => {
                    this.wrongAnswers = response.data.map(wa => ({
                        id: wa.id,
                        questionId: wa.question_id,
                        questionType: wa.question_type,
                        questionContent: wa.question_content,
                        options: wa.question_options,
                        userAnswer: wa.user_answer,
                        correctAnswer: wa.correct_answer,
                        explanation: wa.explanation,
                        wrongTime: new Date(wa.wrong_time).toLocaleString(),
                        isReviewed: wa.is_reviewed
                    }));
                    this.totalWrongAnswers = this.wrongAnswers.length;
                })
                .catch(error => {
                    console.error('获取错题失败:', error);
                    this.$message.error('获取错题失败');
                });
        },
        filterWrongAnswers() {
            this.currentPage = 1;
            this.loadWrongAnswers();
        },
        resetFilter() {
            this.filterForm = {
                type: '',
                subject: '',
                isReviewed: null
            };
            this.loadWrongAnswers();
        },
        handleSizeChange(val) {
            this.pageSize = val;
            this.loadWrongAnswers();
        },
        handleCurrentChange(val) {
            this.currentPage = val;
            this.loadWrongAnswers();
        },
        viewQuestion(wrongAnswer) {
            this.currentWrongAnswer = wrongAnswer;
            this.dialogVisible = true;
        },
        retryQuestion(wrongAnswer) {
            this.$message.info(`正在重做题目ID: ${wrongAnswer.questionId}`);
        },
        removeWrongAnswer(wrongAnswer) {
            this.$axios.delete(`/wrong-answers/${wrongAnswer.id}`)
                .then(response => {
                    this.wrongAnswers = this.wrongAnswers.filter(item => item.id !== wrongAnswer.id);
                    this.totalWrongAnswers--;
                    this.$message.success('错题已删除！');
                })
                .catch(error => {
                    console.error('删除错题失败:', error);
                    this.$message.error('删除错题失败');
                });
        },
        updateReviewStatus(wrongAnswer) {
            this.$axios.put(`/wrong-answers/${wrongAnswer.id}`, { is_reviewed: wrongAnswer.isReviewed })
                .then(response => {
                    this.$message.success(wrongAnswer.isReviewed ? '已标记为已复习' : '已标记为未复习');
                })
                .catch(error => {
                    console.error('更新复习状态失败:', error);
                    this.$message.error('更新复习状态失败');
                });
        }
    }
};
const Rankings = {
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
            // 加载刷题总量排行榜
            this.$axios.get('/rankings/刷题总量')
                .then(response => {
                    this.totalRankings = response.data;
                })
                .catch(error => {
                    console.error('获取刷题总量排行榜失败:', error);
                    this.$message.error('获取刷题总量排行榜失败');
                });
            
            // 加载正确率排行榜
            this.$axios.get('/rankings/正确率')
                .then(response => {
                    this.accuracyRankings = response.data;
                })
                .catch(error => {
                    console.error('获取正确率排行榜失败:', error);
                    this.$message.error('获取正确率排行榜失败');
                });
            
            // 加载贡献榜
            this.$axios.get('/rankings/贡献榜')
                .then(response => {
                    this.contributionRankings = response.data;
                })
                .catch(error => {
                    console.error('获取贡献榜失败:', error);
                    this.$message.error('获取贡献榜失败');
                });
            
            // 获取当前用户排名（暂时使用模拟数据）
            this.myRanking = {
                totalRank: 10,
                accuracyRank: 15,
                contributionRank: 20
            };
            this.totalUsers = 500;
        }
    }
};

// 完整的SubmitQuestion组件
const SubmitQuestion = {
    template: `
        <div class="submit-question">
            <h1>提交题目</h1>
            
            <el-card shadow="hover" class="submit-card">
                <el-form :model="questionForm" :rules="rules" ref="questionFormRef" label-width="100px">
                    <el-form-item label="题目类型" prop="type">
                        <el-select v-model="questionForm.type" placeholder="请选择题目类型">
                            <el-option label="单选题" value="单选题"></el-option>
                            <el-option label="多选题" value="多选题"></el-option>
                            <el-option label="判断题" value="判断题"></el-option>
                        </el-select>
                    </el-form-item>
                    
                    <el-form-item label="题干" prop="content">
                        <el-input 
                            v-model="questionForm.content" 
                            type="textarea" 
                            :rows="3" 
                            placeholder="请输入题干内容，例如：下列哪个是Python的关键字？"
                        ></el-input>
                    </el-form-item>
                    
                    <el-form-item label="选项" prop="options">
                        <div v-for="(option, index) in questionForm.options" :key="index" class="option-item">
                            <el-input 
                                v-model="questionForm.options[index]" 
                                :placeholder="'请输入选项' + String.fromCharCode(65 + index) + '的内容'"
                            >
                                <template #prepend>{{ String.fromCharCode(65 + index) }}.</template>
                            </el-input>
                            <el-button 
                                type="danger" 
                                icon="el-icon-delete" 
                                size="small" 
                                @click="removeOption(index)"
                                v-if="canRemoveOption(index)"
                            ></el-button>
                        </div>
                        <el-button 
                            type="primary" 
                            icon="el-icon-plus" 
                            size="small" 
                            @click="addOption"
                            v-if="questionForm.options.length < 10"
                        >
                            添加选项
                        </el-button>
                    </el-form-item>
                    
                    <el-form-item label="正确答案" prop="correctAnswer">
                        <div v-if="questionForm.type === '判断题'" class="answer-options">
                            <el-radio-group v-model="questionForm.correctAnswer">
                                <el-radio label="A">A. 对</el-radio>
                                <el-radio label="B">B. 错</el-radio>
                            </el-radio-group>
                        </div>
                        <div v-else-if="questionForm.type === '单选题'" class="answer-options">
                            <el-radio-group v-model="questionForm.correctAnswer">
                                <el-radio 
                                    v-for="(option, index) in questionForm.options" 
                                    :key="index" 
                                    :label="String.fromCharCode(65 + index)"
                                    :disabled="!option"
                                >
                                    {{ String.fromCharCode(65 + index) }}. {{ option }}
                                </el-radio>
                            </el-radio-group>
                        </div>
                        <div v-else-if="questionForm.type === '多选题'" class="answer-options">
                            <el-checkbox-group v-model="questionForm.correctAnswerArray">
                                <el-checkbox 
                                    v-for="(option, index) in questionForm.options" 
                                    :key="index" 
                                    :label="String.fromCharCode(65 + index)"
                                    :disabled="!option"
                                >
                                    {{ String.fromCharCode(65 + index) }}. {{ option }}
                                </el-checkbox>
                            </el-checkbox-group>
                        </div>
                        <div class="form-tip">{{ getAnswerTip() }}</div>
                    </el-form-item>
                    
                    <el-form-item label="解题思路" prop="explanation">
                        <el-input 
                            v-model="questionForm.explanation" 
                            type="textarea" 
                            :rows="3" 
                            placeholder="请输入解题思路，解释为什么正确答案是正确的"
                        ></el-input>
                    </el-form-item>
                    
                    <el-form-item label="难度等级" prop="difficulty">
                        <el-rate v-model="questionForm.difficulty" :max="5" show-score text-color="#ff9900"></el-rate>
                        <div class="form-tip">1-5星，1星最简单，5星最难</div>
                    </el-form-item>
                    
                    <el-form-item label="所属科目" prop="subject">
                        <el-input v-model="questionForm.subject" placeholder="请输入所属科目，例如：Python、Java、数据结构"></el-input>
                    </el-form-item>
                    
                    <el-form-item label="标签" prop="tags">
                        <el-input v-model="questionForm.tags" placeholder="请输入标签，多个标签用逗号分隔，例如：语法,基础,算法"></el-input>
                    </el-form-item>
                    
                    <el-form-item label="图片">
                        <el-upload
                            class="upload-demo"
                            action="#"
                            :auto-upload="false"
                            :on-change="handleImageChange"
                            :show-file-list="false"
                            accept="image/*"
                        >
                            <el-button size="small" type="primary">点击上传</el-button>
                            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过2MB</div>
                        </el-upload>
                        <div v-if="questionForm.image" class="image-preview">
                            <img :src="questionForm.image" alt="题目图片" style="max-width: 300px; max-height: 200px;">
                            <el-button type="danger" size="small" @click="removeImage">删除图片</el-button>
                        </div>
                    </el-form-item>
                    
                    <el-form-item>
                        <el-button type="primary" @click="submitQuestion">提交题目</el-button>
                        <el-button @click="resetForm">重置</el-button>
                    </el-form-item>
                </el-form>
            </el-card>
        </div>
    `,
    data() {
        return {
            questionForm: {
                type: '单选题',
                content: '',
                options: ['', ''],
                correctAnswer: '',
                correctAnswerArray: [],
                explanation: '',
                difficulty: 1,
                subject: '',
                tags: '',
                image: ''
            },
            rules: {
                type: [{ required: true, message: '请选择题目类型', trigger: 'change' }],
                content: [{ required: true, message: '请输入题干', trigger: 'blur' }],
                correctAnswer: [
                    { required: true, message: '请输入正确答案', trigger: 'blur' },
                    { 
                        validator: (rule, value, callback) => {
                            if (!value) {
                                callback();
                                return;
                            }
                            // 验证答案格式：单选/判断题为单个字母，多选题为字母逗号分隔
                            const type = this.questionForm.type;
                            if (type === '判断题') {
                                if (!/^[A-Z]$/.test(value)) {
                                    callback(new Error('判断题答案格式应为A或B'));
                                } else {
                                    callback();
                                }
                            } else if (type === '单选题') {
                                if (!/^[A-Z]$/.test(value)) {
                                    callback(new Error('单选题答案格式应为单个字母（A-Z）'));
                                } else {
                                    callback();
                                }
                            } else if (type === '多选题') {
                                if (!/^[A-Z](,[A-Z])*$/i.test(value)) {
                                    callback(new Error('多选题答案格式应为字母逗号分隔（如：A,B,C）'));
                                } else {
                                    callback();
                                }
                            } else {
                                callback();
                            }
                        },
                        trigger: 'blur'
                    }
                ],
                subject: [{ required: true, message: '请输入所属科目', trigger: 'blur' }]
            }
        };
    },
    watch: {
        'questionForm.type'(newType) {
            // 根据题目类型自动调整选项数量
            if (newType === '判断题') {
                this.questionForm.options = this.questionForm.options.slice(0, 2);
                while (this.questionForm.options.length < 2) {
                    this.questionForm.options.push('');
                }
                // 清空答案
                this.questionForm.correctAnswer = '';
                this.questionForm.correctAnswerArray = [];
            } else if (this.questionForm.options.length < 2) {
                while (this.questionForm.options.length < 2) {
                    this.questionForm.options.push('');
                }
                // 清空答案
                this.questionForm.correctAnswer = '';
                this.questionForm.correctAnswerArray = [];
            }
        }
    },
    methods: {
        addOption() {
            this.questionForm.options.push('');
        },
        removeOption(index) {
            this.questionForm.options.splice(index, 1);
        },
        canRemoveOption(index) {
            const minOptions = this.questionForm.type === '判断题' ? 2 : 2;
            return this.questionForm.options.length > minOptions;
        },
        handleImageChange(file) {
            // 读取图片文件并转换为base64
            const reader = new FileReader();
            reader.onload = (e) => {
                this.questionForm.image = e.target.result;
            };
            reader.readAsDataURL(file.raw);
        },
        removeImage() {
            this.questionForm.image = '';
        },
        submitQuestion() {
            this.$refs.questionFormRef.validate((valid) => {
                if (valid) {
                    // 根据题目类型格式化答案
                    let formattedAnswer;
                    const type = this.questionForm.type;
                    
                    if (type === '判断题') {
                        formattedAnswer = this.questionForm.correctAnswer;
                    } else if (type === '单选题') {
                        formattedAnswer = this.questionForm.correctAnswer;
                    } else if (type === '多选题') {
                        // 将数组转换为逗号分隔的字符串
                        formattedAnswer = this.questionForm.correctAnswerArray.join(',');
                    } else {
                        formattedAnswer = this.questionForm.correctAnswer;
                    }
                    
                    const submitData = {
                        type: this.questionForm.type,
                        content: this.questionForm.content,
                        options: JSON.stringify(this.questionForm.options),
                        correct_answer: formattedAnswer,
                        explanation: this.questionForm.explanation,
                        difficulty: this.questionForm.difficulty,
                        subject: this.questionForm.subject,
                        tags: this.questionForm.tags,
                        image: this.questionForm.image,
                        status: '待审核',
                        creator_ip: '127.0.0.1'
                    };
                    
                    console.log('提交题目数据：', submitData);
                    console.log('当前表单数据：', this.questionForm);
                    
                    // 显示加载状态
                    const loading = this.$loading({
                        lock: true,
                        text: '正在提交题目...',
                        background: 'rgba(0, 0, 0, 0.7)'
                    });
                    
                    this.$axios.post('/questions/', submitData)
                        .then(response => {
                            console.log('提交成功：', response.data);
                            loading.close();
                            this.$message.success('题目提交成功，等待审核！');
                            this.resetForm();
                        })
                        .catch(error => {
                            loading.close();
                            console.error('提交失败详细信息：', error);
                            console.error('错误响应：', error.response);
                            console.error('错误状态码：', error.response ? error.response.status : '无');
                            console.error('错误数据：', error.response ? error.response.data : '无');
                            
                            // 根据错误类型提供不同的提示
                            let errorMessage = '题目提交失败，请稍后重试！';
                            
                            if (error.response) {
                                const status = error.response.status;
                                const data = error.response.data;
                                
                                console.log('处理错误响应，状态码：', status);
                                console.log('错误数据：', data);
                                
                                if (status === 422) {
                                    // 验证错误
                                    console.log('检测到422验证错误');
                                    if (data.detail && typeof data.detail === 'string') {
                                        errorMessage = `验证失败：${data.detail}`;
                                    } else if (data.detail && Array.isArray(data.detail)) {
                                        // 显示所有验证错误
                                        const errors = data.detail.map(err => {
                                            if (err.msg) {
                                                return err.msg;
                                            }
                                            return JSON.stringify(err);
                                        }).join('；');
                                        errorMessage = `输入错误：${errors}`;
                                    } else if (data.detail && typeof data.detail === 'object') {
                                        errorMessage = `验证失败：${JSON.stringify(data.detail)}`;
                                    }
                                } else if (status === 400) {
                                    errorMessage = '请求参数错误，请检查输入内容';
                                } else if (status === 500) {
                                    errorMessage = '服务器内部错误，请稍后重试';
                                } else if (status === 404) {
                                    errorMessage = 'API端点不存在';
                                }
                            } else if (error.request) {
                                errorMessage = '网络连接失败，请检查网络连接';
                            } else if (error.message) {
                                errorMessage = `网络错误：${error.message}`;
                            }
                            
                            this.$message.error(errorMessage);
                        });
                } else {
                    // 表单验证失败，滚动到第一个错误字段
                    console.log('表单验证失败');
                    this.$nextTick(() => {
                        const errorFields = this.$refs.questionFormRef.fields.filter(field => field.validateState === 'error');
                        if (errorFields.length > 0) {
                            console.log('错误字段：', errorFields);
                            errorFields[0].$el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    });
                    this.$message.error('请完善题目信息！');
                    return false;
                }
            });
        },
        resetForm() {
            this.$refs.questionFormRef.resetFields();
            this.questionForm.options = ['', ''];
            this.questionForm.image = '';
            this.questionForm.correctAnswer = '';
            this.questionForm.correctAnswerArray = [];
        },
        getAnswerPlaceholder() {
            const type = this.questionForm.type;
            switch (type) {
                case '判断题':
                    return '请输入正确答案（A或B）';
                case '单选题':
                    return '请输入正确答案（单个字母A-Z）';
                case '多选题':
                    return '请输入正确答案（字母逗号分隔，如：A,B,C）';
                default:
                    return '请输入正确答案';
            }
        },
        getAnswerTip() {
            const type = this.questionForm.type;
            switch (type) {
                case '判断题':
                    return '格式要求：A表示对，B表示错';
                case '单选题':
                    return '格式要求：单个大写字母（A-Z）';
                case '多选题':
                    return '格式要求：多个大写字母用逗号分隔（如：A,B,C）';
                default:
                    return '请选择题目类型查看格式要求';
            }
        }
    }
};

const MyTickets = {
    template: `
        <div class="my-tickets">
            <h1>我的工单</h1>
            
            <el-card shadow="hover" class="ticket-list-card">
                <template #header>
                    <div class="card-header">
                        <span>工单列表</span>
                        <el-button type="primary" @click="createTicket">创建工单</el-button>
                    </div>
                </template>
                
                <el-form :inline="true" :model="filterForm" class="filter-form">
                    <el-form-item label="工单状态">
                        <el-select v-model="filterForm.status" placeholder="请选择工单状态">
                            <el-option label="待处理" value="pending"></el-option>
                            <el-option label="处理中" value="processing"></el-option>
                            <el-option label="已解决" value="resolved"></el-option>
                            <el-option label="已关闭" value="closed"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="filterTickets">筛选</el-button>
                        <el-button @click="resetFilter">重置</el-button>
                    </el-form-item>
                </el-form>
                
                <el-table :data="tickets" style="width: 100%" class="tickets-table">
                    <el-table-column prop="id" label="工单ID" width="100"></el-table-column>
                    <el-table-column prop="title" label="工单标题" min-width="200"></el-table-column>
                    <el-table-column prop="questionId" label="题目ID" width="100"></el-table-column>
                    <el-table-column prop="status" label="状态" width="100">
                        <template #default="scope">
                            <el-tag 
                                :type="getStatusType(scope.row.status)" 
                                size="small"
                            >
                                {{ getStatusLabel(scope.row.status) }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="createdAt" label="创建时间" width="180"></el-table-column>
                    <el-table-column prop="updatedAt" label="更新时间" width="180"></el-table-column>
                    <el-table-column prop="resolvedAt" label="解决时间" width="180"></el-table-column>
                    <el-table-column label="操作" width="150">
                        <template #default="scope">
                            <el-button type="primary" size="small" @click="viewTicket(scope.row)">查看详情</el-button>
                            <el-button 
                                type="danger" 
                                size="small" 
                                @click="closeTicket(scope.row)"
                                v-if="scope.row.status !== 'closed'"
                            >
                                关闭工单
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
                
                <div class="pagination-container">
                    <el-pagination
                        @size-change="handleSizeChange"
                        @current-change="handleCurrentChange"
                        :current-page="currentPage"
                        :page-sizes="[10, 20, 50, 100]"
                        :page-size="pageSize"
                        layout="total, sizes, prev, pager, next, jumper"
                        :total="totalTickets">
                    </el-pagination>
                </div>
            </el-card>
            
            <!-- 创建工单对话框 -->
            <el-dialog v-model="createDialogVisible" title="创建工单" width="60%">
                <el-form :model="ticketForm" :rules="rules" ref="ticketFormRef" label-width="100px">
                    <el-form-item label="题目ID" prop="questionId">
                        <el-input v-model="ticketForm.questionId" placeholder="请输入题目ID"></el-input>
                    </el-form-item>
                    <el-form-item label="工单标题" prop="title">
                        <el-input v-model="ticketForm.title" placeholder="请输入工单标题"></el-input>
                    </el-form-item>
                    <el-form-item label="工单内容" prop="content">
                        <el-input v-model="ticketForm.content" type="textarea" :rows="5" placeholder="请详细描述问题"></el-input>
                    </el-form-item>
                </el-form>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="createDialogVisible = false">取消</el-button>
                        <el-button type="primary" @click="submitTicket">提交工单</el-button>
                    </span>
                </template>
            </el-dialog>
            
            <!-- 工单详情对话框 -->
            <el-dialog v-model="viewDialogVisible" title="工单详情" width="60%">
                <div v-if="currentTicket" class="ticket-detail">
                    <el-descriptions :column="1" border>
                        <el-descriptions-item label="工单ID">{{ currentTicket.id }}</el-descriptions-item>
                        <el-descriptions-item label="工单标题">{{ currentTicket.title }}</el-descriptions-item>
                        <el-descriptions-item label="题目ID">{{ currentTicket.questionId }}</el-descriptions-item>
                        <el-descriptions-item label="状态">
                            <el-tag :type="getStatusType(currentTicket.status)">
                                {{ getStatusLabel(currentTicket.status) }}
                            </el-tag>
                        </el-descriptions-item>
                        <el-descriptions-item label="创建时间">{{ currentTicket.createdAt }}</el-descriptions-item>
                        <el-descriptions-item label="更新时间">{{ currentTicket.updatedAt }}</el-descriptions-item>
                        <el-descriptions-item label="解决时间">{{ currentTicket.resolvedAt || '未解决' }}</el-descriptions-item>
                        <el-descriptions-item label="工单内容">{{ currentTicket.content }}</el-descriptions-item>
                        <el-descriptions-item label="解决方案" v-if="currentTicket.resolution">
                            {{ currentTicket.resolution }}
                        </el-descriptions-item>
                    </el-descriptions>
                </div>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="viewDialogVisible = false">关闭</el-button>
                    </span>
                </template>
            </el-dialog>
        </div>
    `,
    data() {
        return {
            tickets: [],
            totalTickets: 0,
            currentPage: 1,
            pageSize: 20,
            filterForm: {
                status: ''
            },
            createDialogVisible: false,
            viewDialogVisible: false,
            currentTicket: null,
            ticketForm: {
                questionId: '',
                title: '',
                content: ''
            },
            rules: {
                questionId: [{ required: true, message: '请输入题目ID', trigger: 'blur' }],
                title: [{ required: true, message: '请输入工单标题', trigger: 'blur' }],
                content: [{ required: true, message: '请输入工单内容', trigger: 'blur' }]
            },
            ticketFormRef: null
        };
    },
    mounted() {
        this.loadTickets();
    },
    methods: {
        loadTickets() {
            // 构建查询参数
            const params = {
                skip: (this.currentPage - 1) * this.pageSize,
                limit: this.pageSize
            };
            
            if (this.filterForm.status) {
                params.status = this.filterForm.status;
            }
            
            // 获取工单数据
            this.$axios.get('/tickets/', { params })
                .then(response => {
                    this.tickets = response.data.map(ticket => ({
                        id: ticket.id,
                        title: ticket.title,
                        questionId: ticket.question_id,
                        status: ticket.status,
                        createdAt: new Date(ticket.created_at).toLocaleString(),
                        updatedAt: new Date(ticket.updated_at).toLocaleString(),
                        resolvedAt: ticket.resolved_at ? new Date(ticket.resolved_at).toLocaleString() : null,
                        content: ticket.content,
                        resolution: ticket.resolution
                    }));
                    this.totalTickets = this.tickets.length;
                })
                .catch(error => {
                    console.error('获取工单失败:', error);
                    this.$message.error('获取工单失败');
                });
        },
        filterTickets() {
            this.currentPage = 1;
            this.loadTickets();
        },
        resetFilter() {
            this.filterForm = {
                status: ''
            };
            this.loadTickets();
        },
        handleSizeChange(val) {
            this.pageSize = val;
            this.loadTickets();
        },
        handleCurrentChange(val) {
            this.currentPage = val;
            this.loadTickets();
        },
        getStatusType(status) {
            const typeMap = {
                pending: 'warning',
                processing: 'info',
                resolved: 'success',
                closed: 'danger'
            };
            return typeMap[status] || 'info';
        },
        getStatusLabel(status) {
            const labelMap = {
                pending: '待处理',
                processing: '处理中',
                resolved: '已解决',
                closed: '已关闭'
            };
            return labelMap[status] || status;
        },
        createTicket() {
            this.ticketForm = {
                questionId: '',
                title: '',
                content: ''
            };
            this.createDialogVisible = true;
        },
        viewTicket(ticket) {
            this.currentTicket = ticket;
            this.viewDialogVisible = true;
        },
        closeTicket(ticket) {
            this.$axios.put(`/tickets/${ticket.id}`, { status: 'closed' })
                .then(response => {
                    ticket.status = 'closed';
                    this.$message.success('工单已关闭');
                })
                .catch(error => {
                    console.error('关闭工单失败:', error);
                    this.$message.error('关闭工单失败');
                });
        },
        submitTicket() {
            this.$refs.ticketFormRef.validate((valid) => {
                if (valid) {
                    const submitData = {
                        question_id: parseInt(this.ticketForm.questionId),
                        title: this.ticketForm.title,
                        content: this.ticketForm.content,
                        user_ip: '127.0.0.1',
                        status: 'pending'
                    };
                    
                    this.$axios.post('/tickets/', submitData)
                        .then(response => {
                            this.createDialogVisible = false;
                            this.$message.success('工单创建成功！');
                            this.loadTickets();
                        })
                        .catch(error => {
                            console.error('创建工单失败:', error);
                            this.$message.error('创建工单失败');
                        });
                } else {
                    this.$message.error('请完善工单信息！');
                    return false;
                }
            });
        }
    }
};
const Admin = {
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
            // 获取题目数据
            this.$axios.get('/questions/', { params: { status: '待审核' } })
                .then(response => {
                    this.questions = response.data;
                })
                .catch(error => {
                    console.error('获取题目失败:', error);
                    this.$message.error('获取题目失败');
                });
        },
        filterQuestions() {
            // 构建查询参数
            const params = {};
            
            if (this.questionFilter.id) {
                params.id = parseInt(this.questionFilter.id);
            }
            if (this.questionFilter.type) {
                params.type = this.questionFilter.type;
            }
            if (this.questionFilter.status) {
                params.status = this.questionFilter.status;
            }
            
            this.$axios.get('/questions/', { params })
                .then(response => {
                    this.questions = response.data;
                })
                .catch(error => {
                    console.error('筛选题目失败:', error);
                    this.$message.error('筛选题目失败');
                });
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
            this.$axios.put(`/questions/${question.id}`, { status: '已通过' })
                .then(response => {
                    question.status = '已通过';
                    this.$message.success('题目已通过审核');
                })
                .catch(error => {
                    console.error('审核题目失败:', error);
                    this.$message.error('审核题目失败');
                });
        },
        rejectQuestion(question) {
            this.$axios.put(`/questions/${question.id}`, { status: '已拒绝' })
                .then(response => {
                    question.status = '已拒绝';
                    this.$message.success('题目已拒绝');
                })
                .catch(error => {
                    console.error('拒绝题目失败:', error);
                    this.$message.error('拒绝题目失败');
                });
        },
        deleteQuestion(question) {
            this.$confirm('确定要删除该题目吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$axios.delete(`/questions/${question.id}`)
                    .then(response => {
                        this.questions = this.questions.filter(item => item.id !== question.id);
                        this.$message.success('题目已删除');
                    })
                    .catch(error => {
                        console.error('删除题目失败:', error);
                        this.$message.error('删除题目失败');
                    });
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
            // 获取工单数据
            this.$axios.get('/tickets/')
                .then(response => {
                    this.tickets = response.data;
                })
                .catch(error => {
                    console.error('获取工单失败:', error);
                    this.$message.error('获取工单失败');
                });
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
                this.$axios.put(`/tickets/${ticket.id}`, { 
                    status: 'resolved',
                    resolution: value 
                })
                    .then(response => {
                        ticket.status = 'resolved';
                        ticket.resolution = value;
                        ticket.resolved_at = new Date().toLocaleString();
                        this.$message.success('工单已解决');
                    })
                    .catch(error => {
                        console.error('解决工单失败:', error);
                        this.$message.error('解决工单失败');
                    });
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
            // 获取用户数据
            this.$axios.get('/users/')
                .then(response => {
                    this.users = response.data;
                })
                .catch(error => {
                    console.error('获取用户失败:', error);
                    this.$message.error('获取用户失败');
                });
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
                        <el-menu :default-active="$route.path" mode="horizontal" background-color="#545c64" text-color="#fff" active-text-color="#ffd04b" router="true">
                            <el-menu-item index="/">
                                <i class="fa fa-dashboard"></i>
                                <span>Dashboard</span>
                            </el-menu-item>
                            <el-menu-item index="/questions">
                                <i class="fa fa-book"></i>
                                <span>题库浏览</span>
                            </el-menu-item>
                            <el-menu-item index="/exams">
                                <i class="fa fa-file-text-o"></i>
                                <span>模拟考试</span>
                            </el-menu-item>
                            <el-menu-item index="/wrong-answers">
                                <i class="fa fa-exclamation-triangle"></i>
                                <span>错题本</span>
                            </el-menu-item>
                            <el-menu-item index="/rankings">
                                <i class="fa fa-trophy"></i>
                                <span>排行榜</span>
                            </el-menu-item>
                            <el-menu-item index="/submit-question">
                                <i class="fa fa-plus-circle"></i>
                                <span>提交题目</span>
                            </el-menu-item>
                            <el-menu-item index="/my-tickets">
                                <i class="fa fa-ticket"></i>
                                <span>我的工单</span>
                            </el-menu-item>
                            <el-menu-item index="/admin" style="margin-left: auto;">
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
axios.defaults.baseURL = '/api';

// 使用插件
app.use(router);
app.use(ElementPlus);

// 挂载应用
app.mount('#app');

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
            // 模拟获取题目数据
            setTimeout(() => {
                this.questions = [
                    {
                        id: 1,
                        type: '单选题',
                        content: '下列哪个是Python的关键字？',
                        options: JSON.stringify(['if', 'then', 'elif', 'elseif']),
                        correct_answer: 'A,C',
                        explanation: 'Python的关键字包括if、elif、else等，then和elseif不是Python的关键字。',
                        difficulty: 2.5,
                        subject: 'Python',
                        tags: '语法,基础',
                        image: ''
                    },
                    {
                        id: 2,
                        type: '判断题',
                        content: 'Python是一种解释型语言。',
                        options: JSON.stringify(['对', '错']),
                        correct_answer: 'A',
                        explanation: 'Python是一种解释型编程语言，不需要编译成机器码即可执行。',
                        difficulty: 1.0,
                        subject: 'Python',
                        tags: '基础,概念',
                        image: ''
                    }
                ];
                this.totalQuestions = 1500;
            }, 500);
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
            // 模拟生成试卷
            setTimeout(() => {
                this.currentExam = {
                    id: 123,
                    startTime: new Date().toLocaleString(),
                    status: '进行中',
                    totalScore: 100,
                    obtainedScore: 0,
                    duration: this.examConfig.duration,
                    totalQuestions: this.examConfig.totalQuestions
                };
                this.remainingTime = this.examConfig.duration;
                this.startTimer();
                this.$message.success('试卷生成成功！');
            }, 1000);
        },
        startExam() {
            // 模拟获取试卷题目
            setTimeout(() => {
                this.examQuestions = [
                    {
                        id: 1,
                        type: '单选题',
                        content: '下列哪个是Python的关键字？',
                        options: JSON.stringify(['if', 'then', 'elif', 'elseif']),
                        correct_answer: 'A,C',
                        image: ''
                    },
                    {
                        id: 2,
                        type: '判断题',
                        content: 'Python是一种解释型语言。',
                        options: JSON.stringify(['对', '错']),
                        correct_answer: 'A',
                        image: ''
                    },
                    {
                        id: 3,
                        type: '多选题',
                        content: '下列哪些是Python的基本数据类型？',
                        options: JSON.stringify(['int', 'float', 'string', 'array']),
                        correct_answer: 'A,B,C',
                        image: ''
                    }
                ];
                this.currentQuestion = this.examQuestions[0];
                this.examDialogVisible = true;
            }, 1000);
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
                // 保存当前答案
                this.answers[this.currentQuestion.id] = this.answerForm.answer;
                this.currentQuestionIndex--;
                this.currentQuestion = this.examQuestions[this.currentQuestionIndex];
                // 恢复之前的答案
                this.answerForm.answer = this.answers[this.currentQuestion.id] || '';
            }
        },
        nextQuestion() {
            if (this.currentQuestionIndex < this.examQuestions.length - 1) {
                // 保存当前答案
                this.answers[this.currentQuestion.id] = this.answerForm.answer;
                this.currentQuestionIndex++;
                this.currentQuestion = this.examQuestions[this.currentQuestionIndex];
                // 恢复之前的答案
                this.answerForm.answer = this.answers[this.currentQuestion.id] || '';
            }
        },
        submitExam() {
            // 保存最后一题的答案
            this.answers[this.currentQuestion.id] = this.answerForm.answer;
            
            // 模拟提交试卷
            setTimeout(() => {
                this.examDialogVisible = false;
                this.currentExam = null;
                if (this.timer) {
                    clearInterval(this.timer);
                }
                this.$message.success('试卷提交成功！');
                this.loadExamHistory();
            }, 1000);
        },
        loadExamHistory() {
            // 模拟加载考试历史
            setTimeout(() => {
                this.examHistory = [
                    {
                        id: 101,
                        startTime: '2026-01-10 14:30:00',
                        endTime: '2026-01-10 15:30:00',
                        status: '已完成',
                        totalScore: 100,
                        obtainedScore: 85,
                        accuracy: 85
                    },
                    {
                        id: 102,
                        startTime: '2026-01-11 09:00:00',
                        endTime: '2026-01-11 10:00:00',
                        status: '已完成',
                        totalScore: 100,
                        obtainedScore: 92,
                        accuracy: 92
                    }
                ];
            }, 500);
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
            // 模拟加载错题数据
            setTimeout(() => {
                this.wrongAnswers = [
                    {
                        id: 1,
                        questionId: 1,
                        questionType: '单选题',
                        questionContent: '下列哪个是Python的关键字？',
                        options: JSON.stringify(['if', 'then', 'elif', 'elseif']),
                        userAnswer: 'B',
                        correctAnswer: 'A,C',
                        explanation: 'Python的关键字包括if、elif、else等，then和elseif不是Python的关键字。',
                        wrongTime: '2026-01-10 15:20:30',
                        isReviewed: false
                    },
                    {
                        id: 2,
                        questionId: 2,
                        questionType: '判断题',
                        questionContent: 'Python是一种解释型语言。',
                        options: JSON.stringify(['对', '错']),
                        userAnswer: 'B',
                        correctAnswer: 'A',
                        explanation: 'Python是一种解释型编程语言，不需要编译成机器码即可执行。',
                        wrongTime: '2026-01-11 09:30:15',
                        isReviewed: true
                    }
                ];
                this.totalWrongAnswers = this.wrongAnswers.length;
            }, 500);
        },
        filterWrongAnswers() {
            // 模拟筛选错题数据
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
            // 模拟重做题目
            this.$message.info(`正在重做题目ID: ${wrongAnswer.questionId}`);
        },
        removeWrongAnswer(wrongAnswer) {
            // 模拟删除错题
            this.wrongAnswers = this.wrongAnswers.filter(item => item.id !== wrongAnswer.id);
            this.totalWrongAnswers--;
            this.$message.success('错题已删除！');
        },
        updateReviewStatus(wrongAnswer) {
            // 模拟更新复习状态
            this.$message.success(wrongAnswer.isReviewed ? '已标记为已复习' : '已标记为未复习');
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
                        <el-input v-model="questionForm.content" type="textarea" :rows="3" placeholder="请输入题干"></el-input>
                    </el-form-item>
                    
                    <el-form-item label="选项" prop="options">
                        <div v-for="(option, index) in questionForm.options" :key="index" class="option-item">
                            <el-input 
                                v-model="questionForm.options[index]" 
                                placeholder="请输入选项内容"
                            >
                                <template #prepend>{{ String.fromCharCode(65 + index) }}.</template>
                            </el-input>
                            <el-button 
                                type="danger" 
                                icon="el-icon-delete" 
                                size="small" 
                                @click="removeOption(index)"
                                v-if="questionForm.options.length > (questionForm.type === '判断题' ? 2 : 2)"
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
                        <el-input v-model="questionForm.correctAnswer" placeholder="例如：A或A,B,C"></el-input>
                    </el-form-item>
                    
                    <el-form-item label="解题思路" prop="explanation">
                        <el-input v-model="questionForm.explanation" type="textarea" :rows="3" placeholder="请输入解题思路"></el-input>
                    </el-form-item>
                    
                    <el-form-item label="难度等级" prop="difficulty">
                        <el-rate v-model="questionForm.difficulty" :max="5" show-score text-color="#ff9900"></el-rate>
                    </el-form-item>
                    
                    <el-form-item label="所属科目" prop="subject">
                        <el-input v-model="questionForm.subject" placeholder="请输入所属科目"></el-input>
                    </el-form-item>
                    
                    <el-form-item label="标签" prop="tags">
                        <el-input v-model="questionForm.tags" placeholder="请输入标签，多个标签用逗号分隔"></el-input>
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
                explanation: '',
                difficulty: 1,
                subject: '',
                tags: '',
                image: ''
            },
            rules: {
                type: [{ required: true, message: '请选择题目类型', trigger: 'change' }],
                content: [{ required: true, message: '请输入题干', trigger: 'blur' }],
                correctAnswer: [{ required: true, message: '请输入正确答案', trigger: 'blur' }],
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
            } else if (this.questionForm.options.length < 2) {
                while (this.questionForm.options.length < 2) {
                    this.questionForm.options.push('');
                }
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
                    // 准备提交数据
                    const submitData = {
                        ...this.questionForm,
                        options: JSON.stringify(this.questionForm.options),
                        creator_ip: '127.0.0.1' // 实际应该从请求中获取
                    };
                    
                    // 提交到后端
                    this.$axios.post('/questions/', submitData)
                        .then(response => {
                            this.$message.success('题目提交成功，等待审核！');
                            this.resetForm();
                        })
                        .catch(error => {
                            this.$message.error('题目提交失败，请稍后重试！');
                            console.error('提交失败:', error);
                        });
                } else {
                    this.$message.error('请完善题目信息！');
                    return false;
                }
            });
        },
        resetForm() {
            this.$refs.questionFormRef.resetFields();
            this.questionForm.options = ['', ''];
            this.questionForm.image = '';
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
            // 模拟加载工单数据
            setTimeout(() => {
                this.tickets = [
                    {
                        id: 1,
                        title: '题目答案错误',
                        questionId: 1,
                        status: 'pending',
                        content: '题目1的正确答案应该是A,C，而不是A',
                        createdAt: '2026-01-10 14:30:00',
                        updatedAt: '2026-01-10 14:30:00',
                        resolvedAt: null,
                        resolution: null
                    },
                    {
                        id: 2,
                        title: '题目描述不清',
                        questionId: 2,
                        status: 'resolved',
                        content: '题目2的描述有些模糊，建议修改',
                        createdAt: '2026-01-09 10:20:00',
                        updatedAt: '2026-01-09 14:45:00',
                        resolvedAt: '2026-01-09 14:45:00',
                        resolution: '已修改题目描述，使其更加清晰'
                    }
                ];
                this.totalTickets = this.tickets.length;
            }, 500);
        },
        filterTickets() {
            // 模拟筛选工单
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
            // 模拟关闭工单
            this.$confirm('确定要关闭该工单吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                ticket.status = 'closed';
                this.$message.success('工单已关闭');
            }).catch(() => {
                this.$message.info('已取消关闭');
            });
        },
        submitTicket() {
            this.$refs.ticketFormRef.validate((valid) => {
                if (valid) {
                    // 模拟提交工单
                    setTimeout(() => {
                        this.createDialogVisible = false;
                        this.$message.success('工单创建成功！');
                        this.loadTickets();
                    }, 1000);
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

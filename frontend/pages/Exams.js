export default {
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

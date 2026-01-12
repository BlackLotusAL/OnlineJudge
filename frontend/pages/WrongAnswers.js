export default {
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

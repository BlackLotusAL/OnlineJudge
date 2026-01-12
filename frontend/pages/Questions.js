export default {
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

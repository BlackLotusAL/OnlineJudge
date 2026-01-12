export default {
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
                                v-model="option" 
                                placeholder="请输入选项内容" 
                                @input="updateOption(index, $event)"
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
            },
            questionFormRef: null
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
        updateOption(index, value) {
            this.questionForm.options[index] = value;
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
                    // 模拟提交题目
                    setTimeout(() => {
                        this.$message.success('题目提交成功，等待审核！');
                        this.resetForm();
                    }, 1000);
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

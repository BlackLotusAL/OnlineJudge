export default {
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

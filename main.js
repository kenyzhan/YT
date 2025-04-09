// 删除自定义localStorage对象
new Vue({
    el: '#app',
    data() {
        return {
            // 筛选条件
            filterCategory: '',
            
            // 表格数据
            tableData: [],
            currentPage: 1,
            total: 0,
            
            // 弹窗相关
            dialogVisible: false,
            dialogTitle: '新增原奶比例',
            isEdit: false,
            
            // 表单数据
            form: {
                category: '',
                code: '',
                milkName: '',
                milkCode: '',
                fixedRatio: 0,
                substitutes: []
            },
            
            // 下拉选项
            categories: [
                { value: 'category1', label: '物料类别1' },
                { value: 'category2', label: '物料类别2' }
            ],
            milkOptions: [
                { value: 'milk1', label: '原奶1' },
                { value: 'milk2', label: '原奶2' }
            ],
            materialOptions: [
                { value: 'material1', label: '替代料1' },
                { value: 'material2', label: '替代料2' }
            ],
            
            // 表单验证规则
            rules: {
                category: [
                    { required: true, message: '请选择物料类别', trigger: 'change' }
                ],
                milkName: [
                    { required: true, message: '请选择原奶', trigger: 'change' }
                ],
                fixedRatio: [
                    { required: true, message: '请输入固定原奶比例', trigger: 'blur' },
                    { type: 'number', min: 0, max: 100, message: '比例必须在0到100之间', trigger: 'blur' }
                ]
            }
        };
    },
    
    created() {
        // 初始化加载数据
        this.loadData();
    },
    
    methods: {
        // 获取物料类别标签
        getCategoryLabel(value) {
            const category = this.categories.find(item => item.value === value);
            return category ? category.label : value;
        },
        
        // 获取原奶标签
        getMilkLabel(value) {
            const milk = this.milkOptions.find(item => item.value === value);
            return milk ? milk.label : value;
        },
        
        // 加载表格数据
        loadData() {
            const dataStr = window.localStorage.getItem('milkRatios');
            const data = dataStr ? JSON.parse(dataStr) : [];
            if (this.filterCategory) {
                this.tableData = data.filter(item => item.category === this.filterCategory);
            } else {
                this.tableData = data;
            }
            this.total = this.tableData.length;
        },
        
        // 搜索
        handleSearch() {
            this.currentPage = 1;
            this.loadData();
        },
        
        // 显示新增弹窗
        showAddDialog() {
            this.dialogTitle = '新增原奶比例';
            this.isEdit = false;
            this.form = {
                category: '',
                code: '',
                milkName: '',
                milkCode: '',
                fixedRatio: 0,
                substitutes: []
            };
            this.dialogVisible = true;
        },
        
        // 编辑
        handleEdit(row) {
            this.dialogTitle = '编辑原奶比例';
            this.isEdit = true;
            this.form = JSON.parse(JSON.stringify(row));
            this.dialogVisible = true;
        },
        
        // 删除
        handleDelete(row) {
            this.$confirm('是否确定删除？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                const dataStr = window.localStorage.getItem('milkRatios');
                const data = dataStr ? JSON.parse(dataStr) : [];
                const index = data.findIndex(item => item.category === row.category);
                if (index > -1) {
                    data.splice(index, 1);
                    window.localStorage.setItem('milkRatios', JSON.stringify(data));
                    this.loadData();
                    this.$message.success('删除成功');
                }
            }).catch(() => {});
        },
        
        // 添加替代料
        addSubstitute() {
            this.form.substitutes.push({
                name: '',
                code: '',
                ratio: 0
            });
        },
        
        // 删除替代料
        removeSubstitute(index) {
            this.form.substitutes.splice(index, 1);
        },
        
        // 提交表单
        submitForm() {
            this.$refs.form.validate((valid) => {
                if (valid) {
                    const dataStr = window.localStorage.getItem('milkRatios');
                    const data = dataStr ? JSON.parse(dataStr) : [];
                    const formData = {
                        ...this.form,
                        operator: '当前用户',
                        operateTime: new Date().toLocaleString()
                    };
                    
                    if (this.isEdit) {
                        const index = data.findIndex(item => item.category === this.form.category);
                        if (index > -1) {
                            data[index] = formData;
                        }
                    } else {
                        // 检查物料类别唯一性
                        if (data.some(item => item.category === this.form.category)) {
                            this.$message.error('该物料类别已存在');
                            return;
                        }
                        data.push(formData);
                    }
                    
                    window.localStorage.setItem('milkRatios', JSON.stringify(data));
                    this.loadData();
                    this.dialogVisible = false;
                    this.$message.success(this.isEdit ? '编辑成功' : '新增成功');
                }
            });
        },
        
        // 分页相关方法
        handleSizeChange(val) {
            this.currentPage = 1;
            this.loadData();
        },
        
        handleCurrentChange(val) {
            this.currentPage = val;
            this.loadData();
        },
        
        // 导入导出相关方法
        handleImport() {
            this.$message.info('导入功能开发中');
        },
        
        handleExport() {
            this.$message.info('导出功能开发中');
        }
    },
    
    watch: {
        // 监听物料类别变化，自动填充编码
        'form.category'(val) {
            if (val) {
                const category = this.categories.find(item => item.value === val);
                this.form.code = category ? category.value : '';
            }
        },
        
        // 监听原奶选择变化，自动填充编码
        'form.milkName'(val) {
            if (val) {
                const milk = this.milkOptions.find(item => item.value === val);
                this.form.milkCode = milk ? milk.value : '';
            }
        }
    }
}); 
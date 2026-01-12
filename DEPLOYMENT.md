# 在线刷题系统部署文档

## 1. 系统环境要求

### 1.1 硬件要求
- CPU: 至少2核
- 内存: 至少4GB
- 磁盘空间: 至少50GB

### 1.2 软件要求
- 操作系统: SUSE Linux Enterprise Server 12+ 或其他主流Linux发行版
- Python: 3.8及以上版本
- PostgreSQL: 12及以上版本
- Nginx: 1.16及以上版本 (可选，用于反向代理)

## 2. 部署步骤

### 2.1 安装依赖软件

#### 2.1.1 安装Python 3.8+
```bash
# SUSE Linux
zypper install python3 python3-pip python3-devel python3-venv

# Ubuntu/Debian
sudo apt-get update
sudo apt-get install python3 python3-pip python3-dev python3-venv

# CentOS/RHEL
sudo yum install python3 python3-pip python3-devel python3-venv
```

#### 2.1.2 安装PostgreSQL 12+
```bash
# SUSE Linux
zypper install postgresql12 postgresql12-server postgresql12-devel

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib libpq-dev

# CentOS/RHEL
sudo yum install postgresql-server postgresql-contrib postgresql-devel
sudo postgresql-setup initdb
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

#### 2.1.3 安装Nginx (可选)
```bash
# SUSE Linux
zypper install nginx

# Ubuntu/Debian
sudo apt-get install nginx

# CentOS/RHEL
sudo yum install nginx
```

### 2.2 配置PostgreSQL数据库

1. 登录PostgreSQL:
```bash
sudo -u postgres psql
```

2. 创建数据库和用户:
```sql
CREATE DATABASE onlinejudge;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE onlinejudge TO postgres;
\q
```

3. 编辑PostgreSQL配置文件，允许远程访问 (可选):

   **注意：不同Linux发行版的配置文件路径不同，根据您的系统选择正确路径：**

   | 发行版 | pg_hba.conf路径 | postgresql.conf路径 |
   |--------|----------------|---------------------|
   | SUSE Linux | /var/lib/pgsql/data/ | /var/lib/pgsql/data/ |
   | Ubuntu/Debian | /etc/postgresql/[版本]/main/ | /etc/postgresql/[版本]/main/ |
   | CentOS/RHEL | /var/lib/pgsql/data/ | /var/lib/pgsql/data/ |

   **示例：Ubuntu/Debian系统**
   ```bash
   # 查看PostgreSQL版本
   pg_config --version
   
   # 编辑pg_hba.conf文件（替换[版本]为实际版本号，如14）
   sudo vi /etc/postgresql/[版本]/main/pg_hba.conf
   
   # 添加以下行
host    all             all             0.0.0.0/0               md5
   
   # 编辑postgresql.conf文件
sudo vi /etc/postgresql/[版本]/main/postgresql.conf
   
   # 修改以下行
listen_addresses = '*'
   
   # 重启PostgreSQL服务
sudo systemctl restart postgresql
   ```

   **示例：SUSE/CentOS/RHEL系统**
   ```bash
   # 编辑pg_hba.conf文件
sudo vi /var/lib/pgsql/data/pg_hba.conf
   
   # 添加以下行
host    all             all             0.0.0.0/0               md5
   
   # 编辑postgresql.conf文件
sudo vi /var/lib/pgsql/data/postgresql.conf
   
   # 修改以下行
listen_addresses = '*'
   
   # 重启PostgreSQL服务
sudo systemctl restart postgresql
   ```

### 2.3 部署在线刷题系统

1. 克隆项目代码:
```bash
git clone <项目仓库地址>
cd OnlineJudge
```

2. 安装项目依赖:
```bash
# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
source venv/bin/activate

# 安装依赖
pip install -r backend/requirements.txt
```

3. 配置系统参数:
```bash
# 复制配置文件模板
cp backend/config/config.yaml.example backend/config/config.yaml

# 编辑配置文件
vi backend/config/config.yaml
```

4. 配置说明:
```yaml
server:
  host: "0.0.0.0"  # 服务器监听地址
  port: 8000       # 服务器监听端口
  debug: false     # 是否开启调试模式

database:
  host: "localhost"  # 数据库地址
  port: 5432        # 数据库端口
  name: "onlinejudge" # 数据库名称
  user: "postgres"   # 数据库用户名
  password: "postgres" # 数据库密码

paths:
  upload_dir: "./uploads"  # 上传文件目录
  backup_dir: "./backups"  # 备份文件目录
  logs_dir: "./logs"       # 日志文件目录
```

5. 初始化数据库:
```bash
# 激活虚拟环境
source venv/bin/activate

# 进入backend目录
cd backend

# 执行初始化脚本
python init_db.py
```

6. 启动服务:
```bash
# 使用管理脚本启动服务
cd ..
chmod +x manage.sh
./manage.sh start
```

7. 验证服务是否启动成功:
```bash
./manage.sh status
```

### 2.4 配置Nginx反向代理 (可选)

1. 创建Nginx配置文件:
```bash
sudo vi /etc/nginx/conf.d/onlinejudge.conf
```

2. 配置内容:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名或IP地址

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static {
        alias /path/to/OnlineJudge/frontend;  # 替换为前端文件路径
        expires 30d;
    }
}
```

3. 检查Nginx配置是否正确:
```bash
sudo nginx -t
```

4. 重启Nginx服务:
```bash
sudo systemctl restart nginx
```

## 3. 服务管理

### 3.1 启动服务
```bash
./manage.sh start
```

### 3.2 停止服务
```bash
./manage.sh stop
```

### 3.3 重启服务
```bash
./manage.sh restart
```

### 3.4 查看服务状态
```bash
./manage.sh status
```

### 3.5 查看日志
```bash
./manage.sh logs
```

## 4. 数据管理

### 4.1 数据备份
```bash
./manage.sh backup
```

### 4.2 数据恢复
```bash
./manage.sh restore
```

### 4.3 导入配置
```bash
./manage.sh import-config
```

## 5. 常见问题排查

### 5.1 服务无法启动

1. 检查日志文件:
```bash
./manage.sh logs error
```

2. 检查端口是否被占用:
```bash
netstat -tuln | grep 8000
```

3. 检查数据库连接是否正常:
```bash
psql -h localhost -p 5432 -U postgres -d onlinejudge
```

### 5.2 数据库连接失败

1. 检查数据库配置是否正确:
```bash
vi backend/config/config.yaml
```

2. 检查PostgreSQL服务是否运行:
```bash
systemctl status postgresql
```

3. 检查数据库用户权限:
```bash
# 登录PostgreSQL
sudo -u postgres psql
# 检查用户权限
\l
```

### 5.3 前端页面无法访问

1. 检查Nginx配置是否正确:
```bash
sudo nginx -t
```

2. 检查Nginx服务是否运行:
```bash
systemctl status nginx
```

3. 检查前端文件路径是否正确:
```bash
ls -la /path/to/OnlineJudge/frontend
```

## 6. 监控和维护

### 6.1 定期备份数据
建议设置定期备份任务，例如每天凌晨2点备份:
```bash
# 编辑crontab
crontab -e

# 添加以下行
0 2 * * * /path/to/OnlineJudge/manage.sh backup
```

### 6.2 定期清理日志
建议设置定期清理日志任务，例如每周日凌晨3点清理:
```bash
# 编辑crontab
crontab -e

# 添加以下行
0 3 * * 0 find /path/to/OnlineJudge/backend/logs -name "*.log" -mtime +7 -delete
```

### 6.3 监控系统资源
建议使用监控工具(如Prometheus + Grafana)监控系统资源使用情况。

## 7. 升级系统

1. 停止服务:
```bash
./manage.sh stop
```

2. 拉取最新代码:
```bash
git pull
```

3. 更新依赖:
```bash
source venv/bin/activate
pip install -r backend/requirements.txt
deactivate
```

4. 更新数据库:
```bash
cd backend
python -c "from app.models.db import engine; from app.models import *; Base.metadata.create_all(bind=engine)"
cd ..
```

5. 启动服务:
```bash
./manage.sh start
```

## 8. 联系支持

如果您在部署或使用过程中遇到问题，请联系系统管理员或开发团队。

## 9. 附录

### 9.1 管理脚本命令说明

| 命令 | 说明 |
|------|------|
| `./manage.sh start` | 启动服务 |
| `./manage.sh stop` | 停止服务 |
| `./manage.sh restart` | 重启服务 |
| `./manage.sh backup` | 数据备份 |
| `./manage.sh restore` | 数据恢复 |
| `./manage.sh import-config` | 导入配置 |
| `./manage.sh status` | 查看服务状态 |
| `./manage.sh logs` | 查看日志 |
| `./manage.sh help` | 查看帮助信息 |

### 9.2 端口说明

| 端口 | 用途 |
|------|------|
| 8000 | FastAPI服务默认端口 |
| 5432 | PostgreSQL数据库默认端口 |
| 80 | Nginx默认HTTP端口 (可选) |
| 443 | Nginx默认HTTPS端口 (可选) |

### 9.3 目录结构说明

```
OnlineJudge/
├── backend/               # 后端代码目录
│   ├── app/              # 应用代码
│   │   ├── api/          # API路由
│   │   ├── models/       # 数据库模型
│   │   ├── schemas/      # 数据验证模式
│   │   ├── utils/         # 工具函数
│   │   └── main.py        # 应用入口
│   ├── config/           # 配置文件
│   ├── logs/             # 日志文件
│   ├── tests/            # 测试代码
│   └── requirements.txt  # 依赖列表
├── frontend/             # 前端代码目录
├── backups/              # 备份文件目录
├── uploads/              # 上传文件目录
├── manage.sh             # 管理脚本
└── DEPLOYMENT.md         # 部署文档
```

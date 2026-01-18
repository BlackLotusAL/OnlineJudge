#!/bin/bash

echo "========================================="
echo "   OnlineJudge 系统诊断脚本"
echo "========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目路径
PROJECT_DIR="/root/OnlineJudge"
FRONTEND_DIR="$PROJECT_DIR/frontend"
BACKEND_DIR="$PROJECT_DIR/backend"
WEB_DIR="/var/www/html/onlinejudge"
LOG_DIR="/var/log/nginx"

# 检测Linux发行版
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
    OS_VERSION=$VERSION_ID
else
    OS="unknown"
fi

# 根据发行版确定nginx配置路径
if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    NGINX_CONF_DIR="/etc/nginx/sites-available"
    NGINX_ENABLED_DIR="/etc/nginx/sites-enabled"
    NGINX_CONF_FILE="onlinejudge"
elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ] || [ "$OS" = "rocky" ] || [ "$OS" = "almalinux" ]; then
    NGINX_CONF_DIR="/etc/nginx/conf.d"
    NGINX_ENABLED_DIR="/etc/nginx/conf.d"
    NGINX_CONF_FILE="onlinejudge.conf"
else
    NGINX_CONF_DIR="/etc/nginx/conf.d"
    NGINX_ENABLED_DIR="/etc/nginx/conf.d"
    NGINX_CONF_FILE="onlinejudge.conf"
fi

echo "检测到操作系统: $OS $OS_VERSION"
echo "Nginx配置目录: $NGINX_CONF_DIR"
echo ""

# 诊断函数
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
        return 0
    else
        echo -e "${RED}✗${NC} $1"
        return 1
    fi
}

check_warning() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
    else
        echo -e "${YELLOW}⚠${NC} $1"
    fi
}

echo -e "${BLUE}[1] 系统信息${NC}"
echo "----------------------------------------"
echo "主机名: $(hostname)"
echo "操作系统: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
echo "内核版本: $(uname -r)"
echo "当前时间: $(date)"
echo "磁盘使用:"
df -h | grep -E '(Filesystem|/dev/sd|/dev/vd)'
echo ""

echo -e "${BLUE}[2] Git仓库状态${NC}"
echo "----------------------------------------"
cd $PROJECT_DIR
echo "当前分支: $(git branch --show-current)"
echo "最新提交: $(git log -1 --oneline)"
echo "远程仓库: $(git remote get-url origin)"
echo ""

echo -e "${BLUE}[3] 前端文件检查${NC}"
echo "----------------------------------------"
if [ -d "$FRONTEND_DIR" ]; then
    echo "前端目录: $FRONTEND_DIR"
    check_status "前端目录存在"
    
    echo ""
    echo "前端文件列表:"
    ls -lh $FRONTEND_DIR/ | grep -E '\.(html|js|css)$'
    
    echo ""
    if [ -f "$FRONTEND_DIR/index.html" ]; then
        echo "index.html 大小: $(du -h $FRONTEND_DIR/index.html | cut -f1)"
        check_status "index.html 存在"
    else
        check_status "index.html 存在"
    fi
    
    if [ -f "$FRONTEND_DIR/main.js" ]; then
        echo "main.js 大小: $(du -h $FRONTEND_DIR/main.js | cut -f1)"
        check_status "main.js 存在"
    else
        check_status "main.js 存在"
    fi
else
    check_status "前端目录存在"
fi
echo ""

echo -e "${BLUE}[4] Web目录检查${NC}"
echo "----------------------------------------"
if [ -d "$WEB_DIR" ]; then
    echo "Web目录: $WEB_DIR"
    check_status "Web目录存在"
    
    echo ""
    echo "Web目录权限:"
    ls -ld $WEB_DIR
    
    echo ""
    echo "Web文件列表:"
    ls -lh $WEB_DIR/ | grep -E '\.(html|js|css)$'
    
    echo ""
    if [ -f "$WEB_DIR/index.html" ]; then
        check_status "Web目录中的index.html存在"
    else
        check_status "Web目录中的index.html存在"
    fi
    
    if [ -f "$WEB_DIR/main.js" ]; then
        check_status "Web目录中的main.js存在"
    else
        check_status "Web目录中的main.js存在"
    fi
else
    check_status "Web目录存在"
fi
echo ""

echo -e "${BLUE}[5] 后端文件检查${NC}"
echo "----------------------------------------"
if [ -d "$BACKEND_DIR" ]; then
    echo "后端目录: $BACKEND_DIR"
    check_status "后端目录存在"
    
    echo ""
    echo "requirements.txt:"
    if [ -f "$BACKEND_DIR/requirements.txt" ]; then
        check_status "requirements.txt存在"
        echo "依赖包数量: $(wc -l < $BACKEND_DIR/requirements.txt)"
    else
        check_status "requirements.txt存在"
    fi
    
    echo ""
    echo "Python依赖检查:"
    python3 -c "import fastapi; print('FastAPI:', fastapi.__version__)" 2>/dev/null && check_status "FastAPI已安装" || check_status "FastAPI已安装"
    python3 -c "import sqlalchemy; print('SQLAlchemy:', sqlalchemy.__version__)" 2>/dev/null && check_status "SQLAlchemy已安装" || check_status "SQLAlchemy已安装"
    python3 -c "import uvicorn; print('Uvicorn:', uvicorn.__version__)" 2>/dev/null && check_status "Uvicorn已安装" || check_status "Uvicorn已安装"
else
    check_status "后端目录存在"
fi
echo ""

echo -e "${BLUE}[6] 数据库检查${NC}"
echo "----------------------------------------"
if [ -f "$BACKEND_DIR/app/models/db.py" ]; then
    echo "数据库配置文件: $BACKEND_DIR/app/models/db.py"
    check_status "数据库配置文件存在"
    
    echo ""
    echo "数据库连接测试:"
    cd $BACKEND_DIR
    python3 -c "from app.models.db import engine; conn = engine.connect(); print('数据库连接成功'); conn.close()" 2>/dev/null && check_status "数据库连接成功" || check_status "数据库连接成功"
    
    echo ""
    echo "数据库表检查:"
    python3 -c "from app.models.db import engine; from sqlalchemy import text; conn = engine.connect(); result = conn.execute(text('SHOW TABLES')); tables = [row[0] for row in result]; print('表数量:', len(tables)); print('表列表:', ', '.join(tables)); conn.close()" 2>/dev/null
else
    check_status "数据库配置文件存在"
fi
echo ""

echo -e "${BLUE}[7] 后端服务检查${NC}"
echo "----------------------------------------"
if pgrep -f "uvicorn" > /dev/null; then
    echo "后端服务状态: 运行中"
    check_status "后端服务运行中"
    
    echo ""
    echo "后端进程信息:"
    ps aux | grep uvicorn | grep -v grep
    
    echo ""
    echo "后端端口检查:"
    if netstat -tuln 2>/dev/null | grep -q ":8000" || ss -tuln 2>/dev/null | grep -q ":8000"; then
        check_status "8000端口监听中"
    else
        check_status "8000端口监听中"
    fi
    
    echo ""
    echo "后端API测试:"
    API_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/)
    if [ "$API_TEST" = "200" ]; then
        check_status "后端API响应正常 (HTTP $API_TEST)"
    else
        check_status "后端API响应正常 (HTTP $API_TEST)"
    fi
    
    echo ""
    echo "具体API端点测试:"
    echo "  /api/: $(curl -s -o /dev/null -w 'HTTP %{http_code}' http://localhost:8000/api/)"
    echo "  /api/questions/: $(curl -s -o /dev/null -w 'HTTP %{http_code}' http://localhost:8000/api/questions/)"
    echo "  /api/rankings/刷题总量: $(curl -s -o /dev/null -w 'HTTP %{http_code}' http://localhost:8000/api/rankings/刷题总量)"
    echo "  /api/exams/history/127.0.0.1: $(curl -s -o /dev/null -w 'HTTP %{http_code}' http://localhost:8000/api/exams/history/127.0.0.1)"
else
    echo "后端服务状态: 未运行"
    check_status "后端服务运行中"
fi
echo ""

echo -e "${BLUE}[8] Nginx服务检查${NC}"
echo "----------------------------------------"
if systemctl is-active --quiet nginx; then
    echo "Nginx服务状态: 运行中"
    check_status "Nginx服务运行中"
    
    echo ""
    echo "Nginx进程信息:"
    ps aux | grep nginx | grep -v grep | head -3
    
    echo ""
    echo "Nginx端口检查:"
    if netstat -tuln 2>/dev/null | grep -q ":80" || ss -tuln 2>/dev/null | grep -q ":80"; then
        check_status "80端口监听中"
    else
        check_status "80端口监听中"
    fi
    
    echo ""
    echo "Nginx配置测试:"
    nginx -t 2>&1 | head -5
    
    echo ""
    echo "Nginx配置文件:"
    echo "配置目录: $NGINX_CONF_DIR"
    echo "配置文件: $NGINX_CONF_FILE"
    if [ -f "$NGINX_CONF_DIR/$NGINX_CONF_FILE" ]; then
        check_status "Nginx配置文件存在"
    else
        check_status "Nginx配置文件存在"
    fi
    
    echo ""
    echo "Nginx配置启用状态:"
    if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        if [ -L "$NGINX_ENABLED_DIR/$NGINX_CONF_FILE" ]; then
            check_status "Nginx配置已启用"
        else
            check_status "Nginx配置已启用"
        fi
    else
        check_status "Nginx配置已启用 (CentOS/RHEL自动启用)"
    fi
else
    echo "Nginx服务状态: 未运行"
    check_status "Nginx服务运行中"
fi
echo ""

echo -e "${BLUE}[9] Nginx日志检查${NC}"
echo "----------------------------------------"
if [ -f "$LOG_DIR/access.log" ]; then
    echo "访问日志: $LOG_DIR/access.log"
    echo "最近10条访问记录:"
    tail -10 $LOG_DIR/access.log | grep -v "GET /api" | tail -5
else
    check_status "访问日志文件存在"
fi
echo ""

if [ -f "$LOG_DIR/error.log" ]; then
    echo "错误日志: $LOG_DIR/error.log"
    echo "最近10条错误记录:"
    tail -10 $LOG_DIR/error.log
else
    check_status "错误日志文件存在"
fi
echo ""

echo -e "${BLUE}[10] 网络连接检查${NC}"
echo "----------------------------------------"
echo "外部IP: $(curl -s ifconfig.me)"
echo ""
echo "端口开放检查:"
if command -v nc &> /dev/null; then
    nc -zv 127.0.0.1 8000 2>&1 | grep -q "succeeded" && check_status "8000端口本地可访问" || check_status "8000端口本地可访问"
    nc -zv 127.0.0.1 80 2>&1 | grep -q "succeeded" && check_status "80端口本地可访问" || check_status "80端口本地可访问"
else
    echo "netcat命令不可用，跳过端口检查"
fi
echo ""

echo -e "${BLUE}[11] 文件权限检查${NC}"
echo "----------------------------------------"
echo "项目目录权限:"
ls -ld $PROJECT_DIR
echo ""
echo "前端目录权限:"
ls -ld $FRONTEND_DIR
echo ""
echo "Web目录权限:"
ls -ld $WEB_DIR
echo ""
echo "Web文件所有者:"
ls -ld $WEB_DIR | awk '{print $3, $4}'
echo ""
echo "Nginx运行用户:"
ps aux | grep "nginx: worker process" | grep -v grep | awk '{print $1}' | head -1
echo ""

echo -e "${BLUE}[12] 资源使用情况${NC}"
echo "----------------------------------------"
echo "CPU使用率:"
top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%id.*/\1/" | awk '{print 100 - $1"%"}'
echo ""
echo "内存使用情况:"
free -h
echo ""
echo "磁盘使用情况:"
df -h | grep -E '(Filesystem|/dev/sd|/dev/vd)'
echo ""

echo "========================================="
echo "   诊断完成"
echo "========================================="
echo ""
echo "如果发现问题，请："
echo "1. 检查上述标记为 ${RED}✗${NC} 的项目"
echo "2. 查看详细的错误日志"
echo "3. 运行 ./deploy.sh 重新部署"
echo ""
echo "常用命令："
echo "  - 查看nginx错误日志: sudo tail -f $LOG_DIR/error.log"
echo "  - 查看后端日志: ps aux | grep uvicorn"
echo "  - 重启nginx: sudo systemctl restart nginx"
echo "  - 重启后端: pkill -f uvicorn && cd $BACKEND_DIR && nohup python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 > /dev/null 2>&1 &"
echo ""
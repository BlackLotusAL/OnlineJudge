#!/bin/bash

echo "========================================="
echo "   OnlineJudge 统一部署脚本"
echo "========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}请使用sudo运行此脚本${NC}"
    exit 1
fi

# 项目路径
PROJECT_DIR="/root/OnlineJudge"
FRONTEND_DIR="$PROJECT_DIR/frontend"
BACKEND_DIR="$PROJECT_DIR/backend"
WEB_DIR="/var/www/html/onlinejudge"

# 检测Linux发行版
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
    OS_VERSION=$VERSION_ID
else
    OS="unknown"
fi

# 检测nginx配置目录（优先使用实际存在的目录）
if [ -d "/etc/nginx/conf.d" ] && [ "$(ls -A /etc/nginx/conf.d/*.conf 2>/dev/null)" ]; then
    NGINX_CONF_DIR="/etc/nginx/conf.d"
    NGINX_ENABLED_DIR="/etc/nginx/conf.d"
    NGINX_CONF_FILE="onlinejudge.conf"
    NGINX_USE_SYMLINK=false
elif [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    NGINX_CONF_DIR="/etc/nginx/sites-available"
    NGINX_ENABLED_DIR="/etc/nginx/sites-enabled"
    NGINX_CONF_FILE="onlinejudge"
    NGINX_USE_SYMLINK=true
elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ] || [ "$OS" = "rocky" ] || [ "$OS" = "almalinux" ]; then
    NGINX_CONF_DIR="/etc/nginx/conf.d"
    NGINX_ENABLED_DIR="/etc/nginx/conf.d"
    NGINX_CONF_FILE="onlinejudge.conf"
    NGINX_USE_SYMLINK=false
else
    NGINX_CONF_DIR="/etc/nginx/conf.d"
    NGINX_ENABLED_DIR="/etc/nginx/conf.d"
    NGINX_CONF_FILE="onlinejudge.conf"
    NGINX_USE_SYMLINK=false
fi

echo "检测到操作系统: $OS $OS_VERSION"
echo "Nginx配置目录: $NGINX_CONF_DIR"
echo ""

# 步骤1：从Git拉取最新代码
echo -e "${YELLOW}[1/8] 从Git拉取最新代码...${NC}"
cd $PROJECT_DIR
git restore .
git pull --rebase origin main
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 代码更新成功${NC}"
else
    echo -e "${RED}✗ 代码更新失败${NC}"
    exit 1
fi
echo ""

# 步骤2：复制前端文件到Web目录
echo -e "${YELLOW}[2/8] 复制前端文件到Web目录...${NC}"
mkdir -p $WEB_DIR
cp -r $FRONTEND_DIR/* $WEB_DIR/
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 前端文件复制成功${NC}"
else
    echo -e "${RED}✗ 前端文件复制失败${NC}"
    exit 1
fi
echo ""

# 步骤3：修改文件权限
echo -e "${YELLOW}[3/8] 修改文件权限...${NC}"
chown -R www-data:www-data $WEB_DIR
chmod -R 755 $WEB_DIR
find $WEB_DIR -type f -exec chmod 644 {} \;
echo -e "${GREEN}✓ 文件权限修改成功${NC}"
echo ""

# 步骤4：更新nginx配置
echo -e "${YELLOW}[4/8] 更新nginx配置...${NC}"
mkdir -p $NGINX_CONF_DIR
tee $NGINX_CONF_DIR/$NGINX_CONF_FILE > /dev/null << 'EOF'
server {
    listen 80;
    server_name 47.83.236.198;

    # 前端静态文件
    location / {
        root /var/www/html/onlinejudge;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # 缓存静态资源
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 30d;
            add_header Cache-Control "public, immutable";
        }
    }

    # 后端API代理
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket支持
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # 错误页面
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ nginx配置更新成功${NC}"
    echo "配置文件路径: $NGINX_CONF_DIR/$NGINX_CONF_FILE"
else
    echo -e "${RED}✗ nginx配置更新失败${NC}"
    exit 1
fi
echo ""

# 步骤5：创建符号链接（如果需要）
echo -e "${YELLOW}[5/8] 创建符号链接${NC}"
echo "----------------------------------------"
if [ "$NGINX_USE_SYMLINK" = "true" ]; then
    if [ -f "$NGINX_ENABLED_DIR/$NGINX_CONF_FILE" ]; then
        echo "符号链接已存在，删除旧链接..."
        rm -f $NGINX_ENABLED_DIR/$NGINX_CONF_FILE
    fi
    
    ln -s $NGINX_CONF_DIR/$NGINX_CONF_FILE $NGINX_ENABLED_DIR/$NGINX_CONF_FILE
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ 符号链接创建成功${NC}"
        echo "链接路径: $NGINX_ENABLED_DIR/$NGINX_CONF_FILE -> $NGINX_CONF_DIR/$NGINX_CONF_FILE"
    else
        echo -e "${RED}✗ 符号链接创建失败${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠ 使用conf.d目录，配置文件自动启用${NC}"
    echo "配置文件: $NGINX_CONF_DIR/$NGINX_CONF_FILE"
fi
echo ""

# 步骤6：测试nginx配置
echo -e "${YELLOW}[6/8] 测试nginx配置...${NC}"
nginx -t
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ nginx配置测试通过${NC}"
else
    echo -e "${RED}✗ nginx配置测试失败${NC}"
    exit 1
fi
echo ""

# 步骤7：重启nginx服务
echo -e "${YELLOW}[7/8] 重启nginx服务...${NC}"
systemctl reload nginx
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ nginx服务重启成功${NC}"
else
    echo -e "${RED}✗ nginx服务重启失败${NC}"
    systemctl restart nginx
fi
echo ""

# 步骤8：运行数据库迁移
echo -e "${YELLOW}[8/8] 运行数据库迁移...${NC}"
cd $BACKEND_DIR
if [ -f "migrate_add_user_fields.py" ]; then
    python migrate_add_user_fields.py
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ 数据库迁移完成${NC}"
    else
        echo -e "${YELLOW}⚠ 数据库迁移失败，继续部署${NC}"
    fi
else
    echo -e "${YELLOW}⚠ 数据库迁移脚本不存在，跳过${NC}"
fi
echo ""

# 步骤9：重启后端服务
echo -e "${YELLOW}[9/9] 重启后端服务...${NC}"
pkill -f "uvicorn"
cd $BACKEND_DIR
nohup python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 > /dev/null 2>&1 &
sleep 3
if pgrep -f "uvicorn" > /dev/null; then
    echo -e "${GREEN}✓ 后端服务重启成功${NC}"
else
    echo -e "${RED}✗ 后端服务启动失败${NC}"
    exit 1
fi
echo ""

# 验证部署
echo "========================================="
echo "   部署验证"
echo "========================================="
echo ""

echo "前端文件："
ls -lh $WEB_DIR/index.html
ls -lh $WEB_DIR/main.js
echo ""

echo "后端服务："
ps aux | grep uvicorn | grep -v grep
echo ""

echo "nginx服务："
systemctl status nginx --no-pager | head -5
echo ""

echo "nginx配置："
echo "配置文件: $NGINX_CONF_DIR/$NGINX_CONF_FILE"
if [ -f "$NGINX_CONF_DIR/$NGINX_CONF_FILE" ]; then
    echo "配置文件存在: 是"
else
    echo "配置文件存在: 否"
fi
echo ""

echo "API测试："
echo "测试questions: $(curl -s -o /dev/null -w 'HTTP %{http_code}' http://localhost:8000/api/questions/)"
echo "测试rankings: $(curl -s -o /dev/null -w 'HTTP %{http_code}' http://localhost:8000/api/rankings/刷题总量)"
echo "测试exams: $(curl -s -o /dev/null -w 'HTTP %{http_code}' http://localhost:8000/api/exams/history/127.0.0.1)"
echo ""

echo "========================================="
echo -e "${GREEN}   部署完成！${NC}"
echo "========================================="
echo ""
echo "请执行以下操作："
echo "1. 清除浏览器缓存（Ctrl+Shift+Delete）"
echo "2. 访问 http://47.83.236.198/ 测试"
echo "3. 如有问题，运行 ./diagnose.sh 进行诊断"
echo ""
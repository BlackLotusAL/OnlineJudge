#!/bin/bash

echo "========================================="
echo "   修复nginx配置问题"
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

# 步骤1：检查当前nginx配置
echo -e "${YELLOW}[1] 检查当前nginx配置${NC}"
echo "----------------------------------------"
if [ -f "$NGINX_CONF_DIR/$NGINX_CONF_FILE" ]; then
    echo "当前配置文件: $NGINX_CONF_DIR/$NGINX_CONF_FILE"
    echo ""
    echo "当前配置内容:"
    cat $NGINX_CONF_DIR/$NGINX_CONF_FILE
else
    echo -e "${RED}配置文件不存在${NC}"
fi
echo ""

# 步骤2：备份当前配置
echo -e "${YELLOW}[2] 备份当前nginx配置${NC}"
echo "----------------------------------------"
if [ -f "$NGINX_CONF_DIR/$NGINX_CONF_FILE" ]; then
    cp $NGINX_CONF_DIR/$NGINX_CONF_FILE $NGINX_CONF_DIR/$NGINX_CONF_FILE.backup.$(date +%Y%m%d_%H%M%S)
    echo -e "${GREEN}✓ 配置已备份${NC}"
else
    echo -e "${YELLOW}⚠ 配置文件不存在，跳过备份${NC}"
fi
echo ""

# 步骤3：创建新的nginx配置
echo -e "${YELLOW}[3] 创建新的nginx配置${NC}"
echo "----------------------------------------"
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
    echo -e "${GREEN}✓ nginx配置已更新${NC}"
    echo "配置文件路径: $NGINX_CONF_DIR/$NGINX_CONF_FILE"
else
    echo -e "${RED}✗ nginx配置更新失败${NC}"
    exit 1
fi
echo ""

# 步骤4：创建符号链接（Ubuntu系统）
echo -e "${YELLOW}[4] 创建符号链接${NC}"
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

# 步骤5：验证Web目录
echo -e "${YELLOW}[5] 验证Web目录${NC}"
echo "----------------------------------------"
WEB_DIR="/var/www/html/onlinejudge"
if [ -d "$WEB_DIR" ]; then
    echo "Web目录: $WEB_DIR"
    echo "目录权限:"
    ls -ld $WEB_DIR
    echo ""
    echo "index.html文件:"
    if [ -f "$WEB_DIR/index.html" ]; then
        ls -lh $WEB_DIR/index.html
        echo -e "${GREEN}✓ index.html存在${NC}"
    else
        echo -e "${RED}✗ index.html不存在${NC}"
    fi
    echo ""
    echo "main.js文件:"
    if [ -f "$WEB_DIR/main.js" ]; then
        ls -lh $WEB_DIR/main.js
        echo -e "${GREEN}✓ main.js存在${NC}"
    else
        echo -e "${RED}✗ main.js不存在${NC}"
    fi
else
    echo -e "${RED}✗ Web目录不存在${NC}"
fi
echo ""

# 步骤6：测试nginx配置
echo -e "${YELLOW}[6] 测试nginx配置${NC}"
echo "----------------------------------------"
nginx -t
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ nginx配置测试通过${NC}"
else
    echo -e "${RED}✗ nginx配置测试失败${NC}"
    exit 1
fi
echo ""

# 步骤7：重启nginx服务
echo -e "${YELLOW}[7] 重启nginx服务${NC}"
echo "----------------------------------------"
systemctl restart nginx
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ nginx服务重启成功${NC}"
else
    echo -e "${RED}✗ nginx服务重启失败${NC}"
    exit 1
fi
echo ""

# 步骤8：重启后端服务
echo -e "${YELLOW}[8] 重启后端服务${NC}"
echo "----------------------------------------"
pkill -f "uvicorn"
cd /root/OnlineJudge/backend
nohup python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 > /dev/null 2>&1 &
sleep 3
if pgrep -f "uvicorn" > /dev/null; then
    echo -e "${GREEN}✓ 后端服务重启成功${NC}"
else
    echo -e "${RED}✗ 后端服务启动失败${NC}"
    exit 1
fi
echo ""

# 步骤9：验证修复
echo "========================================="
echo "   验证修复"
echo "========================================="
echo ""

echo "nginx配置文件:"
echo "  路径: $NGINX_CONF_DIR/$NGINX_CONF_FILE"
echo "  内容:"
grep -E "(root|proxy_pass)" $NGINX_CONF_DIR/$NGINX_CONF_FILE
echo ""

echo "API测试:"
echo "  /api/: $(curl -s -o /dev/null -w 'HTTP %{http_code}' http://localhost:8000/api/)"
echo "  /api/questions/: $(curl -s -o /dev/null -w 'HTTP %{http_code}' http://localhost:8000/api/questions/)"
echo "  /api/rankings/刷题总量: $(curl -s -o /dev/null -w 'HTTP %{http_code}' http://localhost:8000/api/rankings/刷题总量)"
echo "  /api/exams/history/127.0.0.1: $(curl -s -o /dev/null -w 'HTTP %{http_code}' http://localhost:8000/api/exams/history/127.0.0.1)"
echo ""

echo "前端文件测试:"
curl -s -o /dev/null -w 'HTTP %{http_code}' http://localhost:80/
echo ""

echo "========================================="
echo -e "${GREEN}   修复完成！${NC}"
echo "========================================="
echo ""
echo "请执行以下操作："
echo "1. 清除浏览器缓存（Ctrl+Shift+Delete）"
echo "2. 访问 http://47.83.236.198/ 测试"
echo "3. 运行 ./diagnose.sh 进行诊断"
echo ""
echo "如果仍有问题，请查看nginx错误日志："
echo "  sudo tail -f /var/log/nginx/error.log"
echo ""
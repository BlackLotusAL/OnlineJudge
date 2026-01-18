#!/bin/bash

echo "=== OnlineJudge Nginx 诊断脚本 ==="
echo ""

# 检查前端文件目录
echo "1. 检查前端文件目录..."
if [ -d "/root/OnlineJudge/frontend" ]; then
    echo "✓ 前端目录存在"
    ls -la /root/OnlineJudge/frontend/
else
    echo "✗ 前端目录不存在，需要创建"
    echo "执行: mkdir -p /root/OnlineJudge/frontend"
    mkdir -p /root/OnlineJudge/frontend
fi

echo ""
echo "2. 检查index.html文件..."
if [ -f "/root/OnlineJudge/frontend/index.html" ]; then
    echo "✓ index.html存在"
else
    echo "✗ index.html不存在"
fi

echo ""
echo "3. 检查nginx配置..."
if [ -f "/etc/nginx/nginx.conf" ]; then
    echo "✓ nginx配置文件存在"
    nginx -t
else
    echo "✗ nginx配置文件不存在"
fi

echo ""
echo "4. 检查后端服务..."
if pgrep -f "uvicorn" > /dev/null; then
    echo "✓ 后端服务正在运行"
    ps aux | grep uvicorn
else
    echo "✗ 后端服务未运行"
    echo "启动后端服务: cd /root/OnlineJudge/backend && nohup python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 &"
fi

echo ""
echo "5. 检查nginx服务..."
if systemctl is-active --quiet nginx; then
    echo "✓ nginx服务正在运行"
    systemctl status nginx
else
    echo "✗ nginx服务未运行"
    echo "启动nginx: sudo systemctl start nginx"
fi

echo ""
echo "6. 检查文件权限..."
if [ -d "/root/OnlineJudge/frontend" ]; then
    echo "前端目录权限:"
    ls -ld /root/OnlineJudge/frontend
    echo ""
    echo "前端文件权限:"
    ls -la /root/OnlineJudge/frontend/ | head -10
fi

echo ""
echo "7. 检查nginx错误日志..."
if [ -f "/var/log/nginx/error.log" ]; then
    echo "最近10条nginx错误日志:"
    tail -10 /var/log/nginx/error.log
else
    echo "✗ nginx错误日志文件不存在"
fi

echo ""
echo "=== 诊断完成 ==="
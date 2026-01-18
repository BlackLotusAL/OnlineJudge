#!/bin/bash

echo "=== OnlineJudge 前端修复脚本 ==="
echo ""

# 1. 备份现有文件
echo "1. 备份现有文件..."
if [ -f "/var/www/html/onlinejudge/index.html" ]; then
    sudo cp /var/www/html/onlinejudge/index.html /var/www/html/onlinejudge/index.html.backup.$(date +%Y%m%d_%H%M%S)
    echo "✓ index.html已备份"
fi

if [ -f "/var/www/html/onlinejudge/main.js" ]; then
    sudo cp /var/www/html/onlinejudge/main.js /var/www/html/onlinejudge/main.js.backup.$(date +%Y%m%d_%H%M%S)
    echo "✓ main.js已备份"
fi

# 2. 上传修复后的文件
echo ""
echo "2. 请确保已上传修复后的文件到服务器："
echo "   - frontend/index.html"
echo "   - frontend/main.js"
echo ""
read -p "文件已上传完成？(y/n): " uploaded

if [ "$uploaded" != "y" ]; then
    echo "请先上传文件后再运行此脚本"
    exit 1
fi

# 3. 复制文件到Web目录
echo ""
echo "3. 复制文件到Web目录..."
sudo cp /root/OnlineJudge/frontend/index.html /var/www/html/onlinejudge/
sudo cp /root/OnlineJudge/frontend/main.js /var/www/html/onlinejudge/
echo "✓ 文件已复制"

# 4. 修改文件权限
echo ""
echo "4. 修改文件权限..."
sudo chown www-data:www-data /var/www/html/onlinejudge/index.html
sudo chown www-data:www-data /var/www/html/onlinejudge/main.js
sudo chmod 644 /var/www/html/onlinejudge/index.html
sudo chmod 644 /var/www/html/onlinejudge/main.js
echo "✓ 文件权限已修改"

# 5. 清除浏览器缓存（通过nginx配置）
echo ""
echo "5. 更新nginx配置以清除缓存..."
sudo tee /etc/nginx/sites-available/onlinejudge > /dev/null << 'EOF'
server {
    listen 80;
    server_name 47.83.236.198;

    # 前端静态文件
    location / {
        root /var/www/html/onlinejudge;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # 禁用缓存以便测试
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
        
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

echo "✓ nginx配置已更新"

# 6. 测试nginx配置
echo ""
echo "6. 测试nginx配置..."
sudo nginx -t
if [ $? -eq 0 ]; then
    echo "✓ nginx配置测试通过"
else
    echo "✗ nginx配置测试失败"
    exit 1
fi

# 7. 重启nginx
echo ""
echo "7. 重启nginx服务..."
sudo systemctl reload nginx
if [ $? -eq 0 ]; then
    echo "✓ nginx服务已重启"
else
    echo "✗ nginx服务重启失败"
    sudo systemctl restart nginx
fi

# 8. 数据库迁移
echo ""
echo "8. 运行数据库迁移..."
cd /root/OnlineJudge/backend
if [ -f "migrate_add_user_fields.py" ]; then
    python migrate_add_user_fields.py
    echo "✓ 数据库迁移完成"
else
    echo "⚠ migrate_add_user_fields.py文件不存在，跳过数据库迁移"
fi

# 9. 重启后端服务
echo ""
echo "9. 重启后端服务..."
pkill -f "uvicorn"
cd /root/OnlineJudge/backend
nohup python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 > /dev/null 2>&1 &
sleep 2
if pgrep -f "uvicorn" > /dev/null; then
    echo "✓ 后端服务已重启"
else
    echo "✗ 后端服务启动失败"
fi

# 10. 验证服务
echo ""
echo "10. 验证服务状态..."
echo "前端文件："
ls -la /var/www/html/onlinejudge/index.html
ls -la /var/www/html/onlinejudge/main.js
echo ""
echo "后端服务："
ps aux | grep uvicorn | grep -v grep
echo ""
echo "nginx服务："
systemctl status nginx --no-pager | head -10

echo ""
echo "=== 修复完成 ==="
echo ""
echo "请执行以下操作："
echo "1. 清除浏览器缓存（Ctrl+Shift+Delete）"
echo "2. 使用无痕模式访问 http://47.83.236.198/"
echo "3. 检查浏览器控制台是否有错误"
echo ""
echo "如果仍有问题，请查看："
echo "- 浏览器控制台（F12）"
echo "- nginx错误日志: sudo tail -f /var/log/nginx/error.log"
echo "- 后端日志: ps aux | grep uvicorn"
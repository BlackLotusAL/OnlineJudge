#!/bin/bash

# 在线刷题系统管理脚本
# 支持的命令：start, stop, restart, backup, restore, import-config, status, logs

# 获取脚本所在目录的绝对路径
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 配置变量
APP_DIR="$SCRIPT_DIR/backend"
APP_NAME="onlinejudge"
CONFIG_DIR="$APP_DIR/config"
LOG_DIR="$APP_DIR/logs"
BACKUP_DIR="$APP_DIR/backups"
VENV_DIR="$SCRIPT_DIR/venv"
PORT=8000
HOST=0.0.0.0

# 确保日志目录和备份目录存在
mkdir -p $LOG_DIR $BACKUP_DIR

# 启动服务
start() {
    echo "正在启动在线刷题系统..."
    
    # 检查虚拟环境是否存在
    if [ ! -d "$VENV_DIR" ]; then
        echo "虚拟环境不存在，正在创建..."
        python -m venv $VENV_DIR
        source $VENV_DIR/bin/activate
        pip install -r "$APP_DIR/requirements.txt"
        deactivate
    fi

    # 启动服务
    source $VENV_DIR/bin/activate
    cd "$APP_DIR"  # 切换到backend目录
    gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind $HOST:$PORT --daemon --log-level info --access-logfile "$LOG_DIR/access.log" --error-logfile "$LOG_DIR/error.log"
    deactivate
    
    echo "在线刷题系统已启动，监听端口：$PORT"
    echo "访问地址：http://$HOST:$PORT"
}

# 停止服务
stop() {
    echo "正在停止在线刷题系统..."
    
    # 查找并终止进程
    PID=$(ps aux | grep "gunicorn" | grep "app.main:app" | grep -v grep | awk '{print $2}')
    if [ -n "$PID" ]; then
        kill $PID
        echo "在线刷题系统已停止"
    else
        echo "在线刷题系统未运行"
    fi
}

# 重启服务
restart() {
    echo "正在重启在线刷题系统..."
    stop
    sleep 2
    start
}

# 数据备份
backup() {
    echo "正在备份数据..."
    
    # 生成备份文件名
    BACKUP_FILE="$BACKUP_DIR/${APP_NAME}_$(date +%Y%m%d_%H%M%S).sql"
    
    # 从配置文件中读取数据库信息
    if [ -f "$CONFIG_DIR/config.yaml" ]; then
        DB_HOST=$(grep -A5 "database:" $CONFIG_DIR/config.yaml | grep "host:" | awk '{print $2}')
        DB_PORT=$(grep -A5 "database:" $CONFIG_DIR/config.yaml | grep "port:" | awk '{print $2}')
        DB_NAME=$(grep -A5 "database:" $CONFIG_DIR/config.yaml | grep "name:" | awk '{print $2}')
        DB_USER=$(grep -A5 "database:" $CONFIG_DIR/config.yaml | grep "user:" | awk '{print $2}')
        DB_PASS=$(grep -A5 "database:" $CONFIG_DIR/config.yaml | grep "password:" | awk '{print $2}')
        
        # 执行备份
        PGPASSWORD=$DB_PASS pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME > $BACKUP_FILE
        
        if [ $? -eq 0 ]; then
            echo "数据备份成功，备份文件：$BACKUP_FILE"
        else
            echo "数据备份失败"
        fi
    else
        echo "配置文件不存在，无法读取数据库信息"
    fi
}

# 数据恢复
restore() {
    echo "正在恢复数据..."
    
    # 列出可用的备份文件
    echo "可用的备份文件："
    ls -la $BACKUP_DIR/*.sql | sort -r
    
    # 提示用户选择备份文件
    read -p "请输入要恢复的备份文件名：" BACKUP_FILE
    
    if [ -f "$BACKUP_FILE" ]; then
        # 从配置文件中读取数据库信息
        if [ -f "$CONFIG_DIR/config.yaml" ]; then
            DB_HOST=$(grep -A5 "database:" $CONFIG_DIR/config.yaml | grep "host:" | awk '{print $2}')
            DB_PORT=$(grep -A5 "database:" $CONFIG_DIR/config.yaml | grep "port:" | awk '{print $2}')
            DB_NAME=$(grep -A5 "database:" $CONFIG_DIR/config.yaml | grep "name:" | awk '{print $2}')
            DB_USER=$(grep -A5 "database:" $CONFIG_DIR/config.yaml | grep "user:" | awk '{print $2}')
            DB_PASS=$(grep -A5 "database:" $CONFIG_DIR/config.yaml | grep "password:" | awk '{print $2}')
            
            # 执行恢复
            PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME < $BACKUP_FILE
            
            if [ $? -eq 0 ]; then
                echo "数据恢复成功"
            else
                echo "数据恢复失败"
            fi
        else
            echo "配置文件不存在，无法读取数据库信息"
        fi
    else
        echo "备份文件不存在"
    fi
}

# 导入配置
import_config() {
    echo "正在导入配置..."
    
    read -p "请输入要导入的配置文件路径：" CONFIG_FILE
    
    if [ -f "$CONFIG_FILE" ]; then
        cp $CONFIG_FILE $CONFIG_DIR/config.yaml
        echo "配置导入成功"
    else
        echo "配置文件不存在"
    fi
}

# 查看服务状态
status() {
    echo "查看在线刷题系统状态..."
    
    PID=$(ps aux | grep "gunicorn" | grep "app.main:app" | grep -v grep | awk '{print $2}')
    if [ -n "$PID" ]; then
        echo "在线刷题系统正在运行，进程ID：$PID"
        echo "监听端口：$PORT"
        echo "访问地址：http://$HOST:$PORT"
    else
        echo "在线刷题系统未运行"
    fi
}

# 查看日志
logs() {
    echo "查看在线刷题系统日志..."
    
    read -p "请选择要查看的日志类型 (access/error/all): " LOG_TYPE
    
    case $LOG_TYPE in
        access)
            tail -f $LOG_DIR/access.log
            ;;
        error)
            tail -f $LOG_DIR/error.log
            ;;
        all)
            echo "=== 访问日志 ==="
            tail -n 20 $LOG_DIR/access.log
            echo "\n=== 错误日志 ==="
            tail -n 20 $LOG_DIR/error.log
            ;;
        *)
            echo "无效的日志类型"
            ;;
    esac
}

# 帮助信息
help() {
    echo "在线刷题系统管理脚本"
    echo "使用方法：$0 [command]"
    echo ""
    echo "支持的命令："
    echo "  start          启动服务"
    echo "  stop           停止服务"
    echo "  restart        重启服务"
    echo "  backup         数据备份"
    echo "  restore        数据恢复"
    echo "  import-config  导入配置"
    echo "  status         查看服务状态"
    echo "  logs           查看日志"
    echo "  help           查看帮助信息"
}

# 主函数
main() {
    case $1 in
        start)
            start
            ;;
        stop)
            stop
            ;;
        restart)
            restart
            ;;
        backup)
            backup
            ;;
        restore)
            restore
            ;;
        import-config)
            import_config
            ;;
        status)
            status
            ;;
        logs)
            logs
            ;;
        help|--help|-h)
            help
            ;;
        *)
            echo "无效的命令: $1"
            echo "使用 $0 help 查看帮助信息"
            exit 1
            ;;
    esac
}

# 执行主函数
main $1

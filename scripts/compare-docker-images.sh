#!/bin/bash
# 比较优化前后Docker镜像大小的脚本

set -e  # 遇到错误时停止执行

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Pocket Ledger Docker镜像优化比较 ===${NC}"
echo -e "${YELLOW}此脚本将构建两个版本的Docker镜像并比较它们的大小${NC}\n"

# 确保当前目录是项目根目录
if [ ! -f "package.json" ] || [ ! -f "Dockerfile" ]; then
  echo -e "${RED}错误: 请在项目根目录运行此脚本${NC}"
  exit 1
fi

# 备份当前的Dockerfile
echo -e "${BLUE}备份当前Dockerfile...${NC}"
cp Dockerfile Dockerfile.optimized

# 创建基础版Dockerfile（不做优化的版本）
echo -e "${BLUE}创建基础版Dockerfile进行比较...${NC}"
cat > Dockerfile.basic << 'EOL'
FROM node:18-alpine

WORKDIR /app

# 复制依赖文件
COPY package*.json ./
# 安装所有依赖
RUN npm install

# 复制项目文件并构建
COPY . .
RUN npm run build

EXPOSE 3000

# 创建数据目录
RUN mkdir -p /app/data

# 设置环境变量
ENV SQLITE_DB_PATH=/app/data/pocket-ledger.db
ENV NODE_ENV=production

# 设置运行命令
CMD ["npm", "start"]
EOL

# 创建优化版Dockerfile
cat > Dockerfile.optimized << 'EOL'
# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装所有依赖(包括开发依赖)
RUN npm install

# 复制项目文件并构建
COPY . .
RUN npm run build

# 运行阶段 - 使用Next.js的standalone输出
FROM node:18-alpine AS runner
WORKDIR /app

# 安装SQLite依赖库
RUN apk add --no-cache g++ python3 make

# 创建non-root用户
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs \
    && mkdir -p /app/data \
    && chown -R nextjs:nodejs /app

# 只复制生产环境需要的文件
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 确保SQLite数据库文件保存在持久卷中
ENV SQLITE_DB_PATH=/app/data/pocket-ledger.db \
    NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

USER nextjs
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# 设置运行命令
CMD ["node", "server.js"]
EOL

# 构建基础版镜像
echo -e "${BLUE}构建基础版Docker镜像...${NC}"
docker build -t pocket-ledger:basic -f Dockerfile.basic .

# 构建优化版镜像
echo -e "${BLUE}构建优化版Docker镜像...${NC}"
docker build -t pocket-ledger:optimized -f Dockerfile.optimized .

# 获取镜像大小信息
BASIC_SIZE=$(docker images pocket-ledger:basic --format "{{.Size}}")
OPTIMIZED_SIZE=$(docker images pocket-ledger:optimized --format "{{.Size}}")

# 显示比较结果
echo -e "\n${GREEN}=== 镜像大小比较 ===${NC}"
echo -e "基础版镜像大小: ${YELLOW}${BASIC_SIZE}${NC}"
echo -e "优化版镜像大小: ${GREEN}${OPTIMIZED_SIZE}${NC}"

# 计算节省的空间百分比
# 将镜像大小转换为字节数
convert_to_bytes() {
  local size="$1"
  if [[ $size == *KB ]]; then
    echo "$(echo $size | sed 's/KB//') * 1024" | bc
  elif [[ $size == *MB ]]; then
    echo "$(echo $size | sed 's/MB//') * 1024 * 1024" | bc
  elif [[ $size == *GB ]]; then
    echo "$(echo $size | sed 's/GB//') * 1024 * 1024 * 1024" | bc
  else
    echo "$(echo $size) * 1" | bc
  fi
}

BASIC_BYTES=$(convert_to_bytes "$BASIC_SIZE")
OPTIMIZED_BYTES=$(convert_to_bytes "$OPTIMIZED_SIZE")

if [ ! -z "$BASIC_BYTES" ] && [ ! -z "$OPTIMIZED_BYTES" ] && [ "$BASIC_BYTES" -gt 0 ]; then
  SAVING=$(echo "scale=2; 100 - ($OPTIMIZED_BYTES * 100 / $BASIC_BYTES)" | bc)
  echo -e "优化效果: ${GREEN}减少约 ${SAVING}% 的镜像大小${NC}"
  
  # 显示节省的磁盘空间大小
  BYTES_SAVED=$(echo "$BASIC_BYTES - $OPTIMIZED_BYTES" | bc)
  MB_SAVED=$(echo "scale=2; $BYTES_SAVED / 1024 / 1024" | bc)
  echo -e "节省空间: ${GREEN}约 ${MB_SAVED} MB${NC}"
else
  echo -e "${YELLOW}无法计算具体节省百分比，请手动比较大小${NC}"
fi

echo -e "\n${BLUE}测试完成。清理临时文件...${NC}"
# 清理临时Dockerfile文件
rm Dockerfile.basic Dockerfile.optimized

echo -e "${GREEN}完成!${NC}"
echo -e "你可以使用以下命令来运行优化后的Docker镜像:\n"
echo -e "${YELLOW}docker run -p 3000:3000 -v \$(pwd)/data:/app/data -e AUTH_TOKEN=你的认证令牌 pocket-ledger:optimized${NC}"
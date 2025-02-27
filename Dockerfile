# 依赖安装阶段
FROM node:20-alpine AS deps

WORKDIR /app

# 安装构建工具和依赖
RUN apk add --no-cache python3 make g++ sqlite-dev

# 复制依赖文件
COPY package.json package-lock.json ./
# 安装生产依赖
RUN npm ci --omit=dev

# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 安装构建工具和依赖
RUN apk add --no-cache python3 make g++ sqlite-dev

# 复制依赖文件
COPY package.json package-lock.json ./
# 安装所有依赖
RUN npm ci

# 从deps阶段复制生产依赖
COPY --from=deps /app/node_modules ./node_modules

# 复制项目文件
COPY . .
# 构建应用
RUN npm run build \
    # 构建后立即清理不必要的文件
    && rm -rf node_modules/.cache \
    && rm -rf .next/cache

# 运行阶段
FROM node:20-alpine AS runner

WORKDIR /app

# 安装必要的运行时依赖
RUN apk add --no-cache python3 make g++ sqlite-dev curl

# 创建non-root用户
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs \
    && mkdir -p /app/data \
    && chown -R nextjs:nodejs /app

# 创建数据卷
VOLUME /app/data
# 先复制整个.next目录以保证完整的构建输出
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# 设置环境变量
ENV SQLITE_DB_PATH=/app/data/pocket-ledger.db \
    NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_OPTIONS="--max-old-space-size=256"

# 切换到非root用户
USER nextjs

EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -fsS --connect-timeout 5 http://localhost:3000/ || exit 1

# 确保使用正确的语法
CMD ["node", "server.js"]
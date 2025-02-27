# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./
# 仅安装生产环境依赖
RUN npm ci --only=production

# 复制项目文件并构建
COPY . .
RUN npm install --no-save
RUN npm run build

# 删除不必要的文件
RUN rm -rf node_modules/.cache

# 运行阶段
FROM node:18-alpine AS runner

WORKDIR /app

# 安装SQLite依赖库
RUN apk add --no-cache g++ make py3-pip

# 创建non-root用户
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# 设置必要的目录权限
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app

# 复制构建产物
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 确保SQLite数据库文件保存在持久卷中
ENV SQLITE_DB_PATH=/app/data/pocket-ledger.db
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

USER nextjs

EXPOSE 3000

# 设置运行命令
CMD ["node", "server.js"]
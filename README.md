# Pocket Ledger SQLite

一个简洁实用的个人记账应用，使用Next.js和SQLite构建，无需复杂的数据库设置即可快速部署和使用。

## 功能特点

- **支出记录**: 轻松记录日常支出，包括金额、分类、日期和备注
- **分类管理**: 自定义支出分类，包括名称、图标和颜色
- **数据统计**: 查看不同时间范围(7天、30天、90天)的支出统计，帮助你了解消费习惯
- **轻量级数据库**: 使用SQLite本地数据库，无需额外的数据库服务器
- **响应式设计**: 适配各种设备屏幕尺寸，提供优秀的移动端体验

## 技术栈

- **前端**: React 19, Next.js 15.1.7, TailwindCSS
- **后端**: Next.js API Routes
- **数据库**: SQLite (better-sqlite3)
- **状态管理**: Zustand
- **类型检查**: TypeScript
- **日期处理**: date-fns

## 本地开发环境设置

### 前提条件

- Node.js 18.0.0 或更高版本
- npm 或 yarn 包管理器

### 安装步骤

1. 克隆代码库:

```bash
git clone https://github.com/yourusername/pocket-ledger-sqllite.git
cd pocket-ledger-sqllite
```

2. 安装依赖:

```bash
npm install
# 或者
yarn install
```

3. 配置环境变量:

```bash
# 生成随机认证令牌
node scripts/generate-token.js

# 创建.env文件并添加生成的令牌
# 或者手动创建.env文件并添加以下内容:
# AUTH_TOKEN=你的认证令牌
```

> 注意: 认证令牌用于保护API路由，确保只有授权客户端能够访问数据。

4. 运行开发服务器:

```bash
npm run dev
# 或者
yarn dev
```

5. 在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看应用。
   - 首次使用时，需要在登录页面输入配置的认证令牌

## 部署指南

### 方式1: 部署到Vercel (推荐)

作为Next.js应用，部署到Vercel是最简单的方式。

1. 创建[Vercel账户](https://vercel.com/signup)

2. 安装Vercel CLI:

```bash
npm install -g vercel
```

3. 配置环境变量:
   - 在Vercel项目设置中，添加环境变量`AUTH_TOKEN`
   - 你可以使用以下命令生成一个随机令牌:
     ```bash
     node scripts/generate-token.js
     ```
   - 或者在Vercel控制台中手动设置

4. 在项目根目录下运行:

```bash
vercel
```

5. 按照提示操作，将应用部署到Vercel平台。

注意: 由于应用使用SQLite本地数据库，数据会存储在Vercel的临时文件系统中。在无服务器环境中，每次函数执行可能使用不同的实例，因此数据可能无法持久保存。如需在生产环境持久化数据，请考虑使用方式2或3。

### 方式2: 使用Docker部署（优化版）

项目已包含优化的Dockerfile和.dockerignore文件，专门设计用于减小镜像大小和提高构建效率。

1. 生成认证令牌:

```bash
node scripts/generate-token.js
# 记下生成的令牌
```

2. 构建Docker镜像:

```bash
docker build -t pocket-ledger .
```

3. 运行Docker容器，设置环境变量:

```bash
docker run -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  -e AUTH_TOKEN=你的认证令牌 \
  pocket-ledger
```

现在可以通过 http://localhost:3000 访问应用。数据将持久化存储在主机的data目录中。

### Docker镜像优化细节

我们的Docker镜像采用了多阶段构建和其他最佳实践，大幅减小了镜像体积并提高了构建效率：

1. **三阶段构建流程**:
   - `deps`: 仅安装生产依赖
   - `builder`: 构建应用程序代码
   - `runner`: 最小化运行时环境

2. **依赖优化**:
   - 使用`npm ci`确保依赖版本一致性
   - 分离开发和生产依赖
   - 只将必要的依赖复制到最终镜像

3. **构建上下文优化**:
   - 精确控制需要复制到镜像中的文件
   - 忽略node_modules和构建缓存
   - 仅包含源代码和必要的配置文件

4. **安全增强**:
   - 使用非root用户运行应用
   - 实现Docker健康检查
   - 设置合理的文件权限
   - 创建数据卷以持久化存储

5. **缓存优化**:
   - 遵循Docker层缓存最佳实践
   - 将较少变动的层放在构建前部
   - 合理使用.dockerignore减少构建上下文

要了解完整的优化细节，请查看项目根目录中的`Dockerfile`和`.dockerignore`文件。

注意事项：
- 确保package.json和package-lock.json文件存在于项目根目录
- 第一次构建可能需要较长时间，因为需要安装所有依赖
- 建议在生产环境中使用数据卷来持久化SQLite数据库

### 验证Docker优化效果

项目提供了一个便捷脚本来比较优化前后的Docker镜像大小：

```bash
# 确保脚本有执行权限
chmod +x scripts/compare-docker-images.sh

# 运行比较脚本
./scripts/compare-docker-images.sh
```

此脚本会构建两个版本的Docker镜像（基础版和优化版），并显示它们的大小对比，让你直观地看到优化效果。在典型情况下，优化版镜像可以减少30-50%的大小。

> 注意：首次运行脚本可能需要一段时间，因为需要下载依赖和构建两个镜像。

### 方式3: 在VPS上部署

1. 在VPS上安装Node.js和Git。

2. 克隆代码库:

```bash
git clone https://github.com/yourusername/pocket-ledger-sqllite.git
cd pocket-ledger-sqllite
```

3. 安装依赖并构建应用:

```bash
npm install
```

4. 配置环境变量:

```bash
# 生成认证令牌
node scripts/generate-token.js

# 创建.env文件
echo "AUTH_TOKEN=你的认证令牌" > .env
```

5. 构建应用:

```bash
npm run build
```

6. 使用PM2持久运行应用:

```bash
# 安装PM2
npm install -g pm2

# 启动应用，确保环境变量可用
pm2 start npm --name "pocket-ledger" -- start

# 设置开机自启
pm2 startup
pm2 save
```

7. 配置Nginx作为反向代理(可选):

```bash
# 安装Nginx
sudo apt update
sudo apt install nginx

# 创建Nginx配置
sudo nano /etc/nginx/sites-available/pocket-ledger

# 添加以下配置
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# 启用配置
sudo ln -s /etc/nginx/sites-available/pocket-ledger /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

8. 配置SSL(可选):

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## 数据库管理

应用使用SQLite数据库，数据文件默认保存在项目根目录的`pocket-ledger.db`中。

### 备份数据库

```bash
# 简单复制数据库文件
cp pocket-ledger.db pocket-ledger.db.backup

# 或使用SQLite的备份命令
sqlite3 pocket-ledger.db ".backup 'pocket-ledger.db.backup'"
```

### 恢复数据库

```bash
cp pocket-ledger.db.backup pocket-ledger.db
```

## 故障排除

### 数据库锁定问题

如果遇到"database is locked"错误:

1. 确保没有其他进程正在访问数据库
2. 尝试重启应用程序
3. 检查数据库文件权限是否正确

### 认证问题

如果遇到"未授权访问"或API请求失败:

1. 确认`.env`文件中的`AUTH_TOKEN`环境变量已正确设置
2. 检查前端登录时使用的令牌是否与`.env`文件中的一致
3. 在部署环境中，验证环境变量是否正确配置
4. 使用浏览器开发工具检查API请求头中是否包含了正确的Authorization头

### 环境变量未加载

如果环境变量未被正确加载:

1. 确认`.env`文件位于项目根目录
2. 重启开发服务器或应用程序
3. 在Docker环境中，确保正确传递了环境变量
4. 在Vercel中，检查环境变量是否在项目设置中正确配置

### 部署到Vercel后数据丢失

由于Vercel的无服务器环境特性，SQLite数据可能无法持久保存。考虑以下解决方案:

1. 在开发和测试环境使用SQLite，在生产环境切换到其他数据库(如PostgreSQL)
2. 使用Docker或VPS部署以确保数据持久化
3. 实现数据导出/导入功能，允许用户备份自己的数据

## 许可证

[MIT](LICENSE)

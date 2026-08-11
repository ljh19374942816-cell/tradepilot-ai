# TradePilot AI 外贸询盘系统

TradePilot AI 是一个完整的 AI 外贸获客与询盘 CRM，使用 Next.js App Router、React、TypeScript、Tailwind CSS、Motion、Radix/shadcn 风格组件、Prisma、OpenAI 和 Resend 构建。

## 已实现功能

- 高端双语获客站：产品数据库、出口能力、响应式移动端、动效与产品询盘入口
- AI 客服：DeepSeek 流式回复、多轮上下文、中英文切换、严格使用数据库产品知识回答
- 三个客户功能页：产品 FAQ + AI 对话、分步采购意向问卷、询盘进度查询
- 询盘自动化：字段校验、机器人陷阱、IP 限流、客户去重、询盘编号、产品关联
- 双邮件通知：客户确认邮件和管理员通知邮件，发送结果、Provider ID 与失败原因均入库
- CRM 后台：加密登录、概览指标、询盘筛选、客户列表、询盘详情、状态流转、负责人、跟进时间、内部备注
- 可运维性：健康检查、配置状态、SQLite 数据持久化、Docker、独立生产构建

## 本地运行

需要 Node.js 20.9+（推荐 Node.js 24）和 npm。

```powershell
Copy-Item .env.example .env
npm.cmd install
npm.cmd run setup
npm.cmd run dev
```

打开 `http://localhost:3000`。后台地址为 `http://localhost:3000/admin/login`。

`.env.example` 的演示管理员账号为：

```text
admin@tradepilot.local
ChangeMe123!
```

生产环境务必修改 `ADMIN_PASSWORD`，设置至少 32 位随机 `AUTH_SECRET`，然后重新运行 `npm run db:seed`。密码只以 bcrypt 哈希保存。

## DeepSeek 流式客服

在 `.env` 设置：

```dotenv
DEEPSEEK_API_KEY="sk-..."
DEEPSEEK_BASE_URL="https://api.deepseek.com"
DEEPSEEK_MODEL="deepseek-chat"
```

服务端通过 OpenAI 兼容 SDK 调用 DeepSeek，从 Prisma 产品表动态生成知识上下文，不会把 API Key 暴露给浏览器。每次用户和 AI 消息会写入 `Conversation` 与 `ChatMessage`。没有配置密钥时，API 返回明确的 503 配置错误，不会伪造 AI 回复。

## 自动邮件

1. 在 [Resend](https://resend.com) 验证发送域名并创建 API Key。
2. 配置以下变量：

```dotenv
RESEND_API_KEY="re_..."
EMAIL_FROM="TradePilot AI <sales@your-domain.com>"
ADMIN_NOTIFICATION_EMAIL="sales@your-domain.com"
NEXT_PUBLIC_APP_URL="https://inquiry.your-domain.com"
```

客户提交后，`POST /api/inquiries` 在数据库事务中创建或更新客户、创建询盘与产品行，然后分别发送客户确认邮件和管理员通知邮件。每封邮件在 `EmailLog` 中记录 `PENDING / SENT / FAILED / SKIPPED`。本地未配置 Resend 时询盘仍会安全入库，后台会清楚显示邮件未发送及原因。

## 数据库设计

- `Admin`：后台管理员与 bcrypt 密码哈希
- `Product`：中英文产品数据、规格 JSON、MOQ、价格与交期
- `Customer`：按邮箱去重的客户主数据
- `Inquiry` / `InquiryItem`：询盘、管道状态、意向评分、商业条件与产品明细
- `InquiryEvent`：可向客户公开的进度时间线，与内部备注隔离
- `Conversation` / `ChatMessage`：AI 多轮对话持久化
- `EmailLog`：邮件发送审计
- `Note`：销售内部跟进记录

SQLite 适合单机部署和演示。多实例生产环境建议将 `schema.prisma` 的 provider 改为 `postgresql`，设置托管 PostgreSQL 的 `DATABASE_URL` 后执行 `prisma migrate deploy`。业务代码无需修改。

## Docker 部署

首次构建前先在本机执行数据库初始化，或在部署流水线运行 `prisma db push` 和 `prisma db seed`：

```powershell
docker compose build
docker compose run --rm app npx prisma db push
docker compose run --rm app npx prisma db seed
docker compose up -d
```

`tradepilot_data` volume 保存 SQLite 数据。生产域名应在 Nginx、Caddy、Cloudflare 或云负载均衡器中终止 HTTPS。

## 部署检查

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
Invoke-RestMethod http://localhost:3000/api/health
```

上线前还应配置域名、HTTPS、Resend 验证域、OpenAI/Resend 预算报警和数据库备份。内存限流适合单实例；水平扩容时应替换为 Redis/Upstash 分布式限流。

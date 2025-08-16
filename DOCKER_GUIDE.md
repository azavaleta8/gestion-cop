# 🚀 Docker Compose Startup Guide

Complete guide for running your Next.js application with two database configurations using a single environment file.

## 📋 **Current Setup Analysis**

This guide covers two development scenarios using one centralized `.env` file:

- **Local Development**: PostgreSQL in Docker container with hot reload
- **External Development**: Using Neon serverless PostgreSQL for development

## 🛠️ **Scenario 1: Development with Local PostgreSQL**

### **Step 1: Create development environment file:**

```bash
cp env.example .env
```

### **Step 2: Use default settings for local PostgreSQL:**

The `.env` file is already configured for local development:

```env
# Database Configuration
POSTGRES_USER=gestion_user
POSTGRES_PASSWORD=gestion_password
POSTGRES_DB=gestion_cop_db

# Database URL for local Docker development
DATABASE_URL=postgresql://gestion_user:gestion_password@postgres:5432/gestion_cop_db

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-key-change-in-production

# Application Environment
NODE_ENV=development
```

### **Step 3: Start development services:**

```bash
# Build and start with hot reload
docker-compose up --build

# Or run in background
docker-compose up -d --build

# View logs
docker-compose logs -f nextjs
```

### **What happens:**

- PostgreSQL container starts with persistent volume
- Next.js runs in development mode with `Dockerfile.dev`
- Hot reload enabled (file changes trigger rebuild)
- Database accessible on `localhost:5432`

---

## 🌐 **Scenario 2: Development with Neon Database**

### **Step 1: Get Neon Connection String**

1. Go to your Neon project dashboard
2. Navigate to **Dashboard > Connection Details**
3. Copy the connection string (includes SSL by default)

### **Step 2: Update `.env` for Neon:**

Edit your existing `.env` file and update the `DATABASE_URL_NEON` with your actual Neon connection string:

```env
# Database Configuration
POSTGRES_USER=gestion_user
POSTGRES_PASSWORD=gestion_password
POSTGRES_DB=gestion_cop_db

# Database URL for local development
DATABASE_URL=postgresql://gestion_user:gestion_password@postgres:5432/gestion_cop_db

# Neon Database URL (replace with your actual connection string)
DATABASE_URL_NEON=postgresql://[user]:[password]@[endpoint]/[database]?sslmode=require

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-key-change-in-production

# Application Environment
NODE_ENV=development
```

### **Step 3: Start with Neon:**

```bash
docker-compose -f docker-compose.neon.yml up --build
```

### **What happens:**

- Only Next.js container runs (no local PostgreSQL)
- Connects to your Neon database in the cloud
- Uses development Dockerfile with hot reload
- SSL connection automatically enabled
- Ideal for development with cloud database

---

## 🔧 **Useful Commands**

### **Local Development Commands:**

```bash
# Start development with local PostgreSQL
docker-compose up --build

# Start in background
docker-compose up -d --build

# View real-time logs
docker-compose logs -f nextjs

# Stop services
docker-compose down

# Rebuild after dependency changes
docker-compose build --no-cache nextjs

# Access container shell
docker-compose exec nextjs sh

# Remove volumes (⚠️ destroys data)
docker-compose down -v
```

### **Neon Development Commands:**

```bash
# Start development with Neon (uses same .env file)
docker-compose -f docker-compose.neon.yml up --build

# Start in background
docker-compose -f docker-compose.neon.yml up -d --build

# View logs for Neon development
docker-compose -f docker-compose.neon.yml logs -f

# Stop Neon development
docker-compose -f docker-compose.neon.yml down

# Rebuild Neon container
docker-compose -f docker-compose.neon.yml build --no-cache
```

### **Database Management Commands:**

```bash
# Access PostgreSQL (local only)
docker-compose exec postgres psql -U gestion_user -d gestion_cop_db

# Backup database (local only)
docker-compose exec postgres pg_dump -U gestion_user gestion_cop_db > backup.sql

# Restore database (local only)
docker-compose exec -T postgres psql -U gestion_user gestion_cop_db < backup.sql

# View database logs (local only)
docker-compose logs postgres
```

---

## 📊 **Quick Reference Table**

| Scenario      | Command                                                | Database         | Hot Reload | Use Case  |
| ------------- | ------------------------------------------------------ | ---------------- | ---------- | --------- |
| **Local Dev** | `docker-compose up --build`                            | Local PostgreSQL | ✅ Yes     | Local dev |
| **Neon Dev**  | `docker-compose -f docker-compose.neon.yml up --build` | Neon Cloud       | ✅ Yes     | Cloud dev |

---

## 🔍 **Troubleshooting**

### **Port Conflicts:**

```bash
# If port 3000 is in use, change in docker-compose.yml:
ports:
  - "3001:3000"  # Use port 3001 instead

# Or kill existing process:
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### **Database Connection Issues:**

```bash
# Check if PostgreSQL is running (local only)
docker-compose exec postgres pg_isready -U gestion_user

# View database logs (local only)
docker-compose logs postgres

# Test database connection
docker-compose exec nextjs sh
# Inside container:
node -e "console.log(process.env.DATABASE_URL)"
```

### **Build Issues:**

```bash
# Clean build (removes cache)
docker-compose build --no-cache

# Remove all containers and volumes
docker-compose down -v

# Clean Docker system
docker system prune -a

# Remove specific images
docker rmi gestion-cop-nextjs gestion-cop-postgres
```

### **Environment Issues:**

```bash
# Check environment variables
docker-compose config

# Validate environment file
cat .env.local

# Test with specific env file
docker-compose --env-file .env.production config
```

### **Performance Issues:**

```bash
# View container stats
docker stats

# Check container resource usage
docker-compose top

# View system resource usage
docker system df
```

---

## 🔒 **Security Best Practices**

### **For Production:**

- Change default passwords
- Use strong `NEXTAUTH_SECRET` (32+ characters)
- Use environment-specific secrets
- Enable SSL for external databases
- Regularly update Docker images

### **Environment Variables Security:**

```bash
# Never commit this file:
.env

# Add to .gitignore:
echo ".env" >> .gitignore
```

---

## 📝 **Common Workflows**

### **Starting Fresh Development:**

```bash
# 1. Setup environment
cp env.example .env

# 2. Start services with local PostgreSQL
docker-compose up --build

# 3. Setup Prisma (when ready)
npm install prisma @prisma/client
npx prisma init
npx prisma db push
```

### **Switching to Neon Development:**

```bash
# 1. Stop local services
docker-compose down

# 2. Edit .env and update DATABASE_URL_NEON with your actual Neon connection string
# DATABASE_URL_NEON=postgresql://[user]:[password]@[endpoint]/[database]?sslmode=require

# 3. Start development with Neon
docker-compose -f docker-compose.neon.yml up --build

# 4. Check logs
docker-compose -f docker-compose.neon.yml logs -f
```

### **Switching Back to Local Development:**

```bash
# 1. Stop Neon services
docker-compose -f docker-compose.neon.yml down

# 2. No need to edit .env - local and Neon URLs are separate variables

# 3. Start local development
docker-compose up --build
```

This guide covers all scenarios for running your application with Docker Compose!

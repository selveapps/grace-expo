FROM node:22-bookworm-slim
ARG REPO
ARG COMMIT
RUN apt-get update && apt-get install -y --no-install-recommends \
    git ca-certificates python3 \
 && rm -rf /var/lib/apt/lists/*
COPY setup_repo.sh /root/setup_repo.sh
RUN chmod +x /root/setup_repo.sh \
 && bash /root/setup_repo.sh "selveapps/grace-expo" "d7fc89f4e07204ec5d557a69e4539feeea801d51"
WORKDIR /app
RUN npm ci --prefix /app/web

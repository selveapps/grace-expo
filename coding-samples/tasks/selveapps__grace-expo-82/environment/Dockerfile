FROM node:22-bookworm-slim
ARG REPO
ARG COMMIT
RUN apt-get update && apt-get install -y --no-install-recommends \
    git ca-certificates python3 \
 && rm -rf /var/lib/apt/lists/*
COPY setup_repo.sh /root/setup_repo.sh
RUN chmod +x /root/setup_repo.sh \
 && bash /root/setup_repo.sh "selveapps/grace-expo" "1f93ba605a2defb6db602ff937c775de6bb906b2"
WORKDIR /app
RUN npm ci --prefix /app/web

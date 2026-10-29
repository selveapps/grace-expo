FROM node:22-bookworm
ARG REPO
ARG COMMIT
RUN apt-get update && apt-get install -y --no-install-recommends \
    git ca-certificates python3 \
 && rm -rf /var/lib/apt/lists/*
COPY setup_repo.sh /root/setup_repo.sh
RUN chmod +x /root/setup_repo.sh \
 && bash /root/setup_repo.sh "selveapps/grace-expo" "30fcc505c61d32a81dfc4dcacd779ca05694d888"
WORKDIR /app
RUN npm ci && npx playwright install --with-deps chromium

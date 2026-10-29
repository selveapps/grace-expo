FROM node:22-bookworm-slim
ARG REPO
ARG COMMIT
RUN apt-get update && apt-get install -y --no-install-recommends \
    git ca-certificates python3 \
 && rm -rf /var/lib/apt/lists/*
COPY setup_repo.sh /root/setup_repo.sh
RUN chmod +x /root/setup_repo.sh \
 && bash /root/setup_repo.sh "selveapps/grace-expo" "57ddf3fdf252aacf48dc5f0ac56aa3e2698caf42"
WORKDIR /app

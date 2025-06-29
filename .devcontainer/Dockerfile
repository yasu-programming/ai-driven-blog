# AI-Driven Blog Development Container
FROM mcr.microsoft.com/devcontainers/typescript-node:1-20-bullseye

# Install PHP and extensions
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
        php8.2 \
        php8.2-cli \
        php8.2-common \
        php8.2-mysql \
        php8.2-pgsql \
        php8.2-sqlite3 \
        php8.2-zip \
        php8.2-gd \
        php8.2-mbstring \
        php8.2-curl \
        php8.2-xml \
        php8.2-bcmath \
        php8.2-redis \
        php8.2-intl \
        php8.2-soap \
        php8.2-xdebug \
        unzip \
        git \
        curl \
        vim \
        nano \
        htop \
        postgresql-client \
        redis-tools \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

# Configure PHP
RUN echo "memory_limit=512M" >> /etc/php/8.2/cli/php.ini \
    && echo "max_execution_time=300" >> /etc/php/8.2/cli/php.ini \
    && echo "upload_max_filesize=50M" >> /etc/php/8.2/cli/php.ini \
    && echo "post_max_size=50M" >> /etc/php/8.2/cli/php.ini

# Configure Xdebug for development
RUN echo "xdebug.mode=debug" >> /etc/php/8.2/cli/conf.d/20-xdebug.ini \
    && echo "xdebug.start_with_request=yes" >> /etc/php/8.2/cli/conf.d/20-xdebug.ini \
    && echo "xdebug.client_host=host.docker.internal" >> /etc/php/8.2/cli/conf.d/20-xdebug.ini \
    && echo "xdebug.client_port=9003" >> /etc/php/8.2/cli/conf.d/20-xdebug.ini

# Install global Node.js packages
RUN npm install -g @next/cli create-next-app typescript @types/node

# Create workspace directory
RUN mkdir -p /workspace && chown -R node:node /workspace

# Switch to node user
USER node

# Set working directory
WORKDIR /workspace

# Install Oh My Zsh for better terminal experience
RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended

# Configure Git (will be overridden by Codespaces)
RUN git config --global init.defaultBranch main \
    && git config --global pull.rebase false

# Set default shell to zsh
SHELL ["/bin/zsh", "-c"]

# Create directories for logs and cache
RUN mkdir -p /workspace/dev-logs /workspace/storage/logs /workspace/storage/cache

# Copy startup scripts
COPY --chown=node:node setup.sh /workspace/.devcontainer/
COPY --chown=node:node post-start.sh /workspace/.devcontainer/

# Set executable permissions
RUN chmod +x /workspace/.devcontainer/setup.sh /workspace/.devcontainer/post-start.sh

# Expose ports
EXPOSE 3000 8000 5432 6379 1025 8025
FROM oven/bun:latest

# Install basic development tools
RUN apt update && apt install -y less man-db git sudo git

# Create a non-root user (bun user already exists in the base image)
ARG USERNAME=bun
RUN echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME

# Set `DEVCONTAINER` environment variable to help with orientation
ENV DEVCONTAINER=true

# Set the default user
USER $USERNAME
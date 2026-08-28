# DEPLOYMENT.md — GitHub Actions + Linux + systemd

This deployment model intentionally avoids Docker.

## Assumptions

- Linux server (Ubuntu/Debian-style commands below)
- SSH access with sudo during initial setup
- dedicated runtime/deploy user: `deploy`
- repository path: `/srv/perxona-template`
- application listens on `127.0.0.1:3000`
- your reverse proxy is configured separately
- GitHub Actions deploys over SSH

---

## 1. Create the `deploy` user

On the server:

```bash
sudo adduser --disabled-password --gecos "" deploy
```

Create its SSH directory:

```bash
sudo install -d -m 700 -o deploy -g deploy /home/deploy/.ssh
```

Generate a dedicated deployment key **on your own machine**:

```bash
ssh-keygen -t ed25519 -C "github-actions-perxona-template" -f ./perxona_deploy_key
```

Put the public key on the server:

```bash
cat perxona_deploy_key.pub
```

Append that line to:

```bash
sudo nano /home/deploy/.ssh/authorized_keys
```

Then:

```bash
sudo chown deploy:deploy /home/deploy/.ssh/authorized_keys
sudo chmod 600 /home/deploy/.ssh/authorized_keys
```

The **private** key will become the GitHub Actions secret `DEPLOY_SSH_KEY`.

Do not commit either key.

---

## 2. Install Node 22 and pnpm

Install Node 22 using your preferred server-wide method.

Verify:

```bash
node --version
```

It should be Node 22 or newer.

Install pnpm:

```bash
sudo corepack enable
sudo corepack prepare pnpm@latest --activate
```

Verify as the deploy user:

```bash
sudo -u deploy -H bash -lc 'node --version && pnpm --version && command -v pnpm'
```

Remember the output of:

```bash
command -v pnpm
```

If systemd cannot resolve `pnpm`, use that absolute path in the service file.

---

## 3. Create application directory

```bash
sudo mkdir -p /srv/perxona-template
sudo chown deploy:deploy /srv/perxona-template
```

The GitHub workflow can clone the repository on first deployment.

---

## 4. Create runtime environment file

```bash
sudo mkdir -p /etc/perxona-template
sudo nano /etc/perxona-template/perxona-template.env
```

Example:

```env
NODE_ENV=production
PORT=3000
HOSTNAME=127.0.0.1

PERXONA_API_BASE_URL=https://console.perxona.ai/asia
PERXONA_CONNECT_SECRET_KEY=replace-me
PERXONA_CONNECT_PUBLISHABLE_KEY=replace-me
PERXONA_AVATAR_ID=replace-me
PERXONA_SCENE_ID=replace-me
PERXONA_VOICE_ID=replace-me

LLM_BASE_URL=https://openrouter.ai/api/v1
LLM_API_KEY=replace-me
LLM_MODEL=replace-me
LLM_APP_NAME=Perxona Hackathon App
LLM_SITE_URL=https://your-domain.example

EMBEDDING_BASE_URL=replace-if-needed
EMBEDDING_API_KEY=replace-if-needed
EMBEDDING_MODEL=replace-if-needed
```

Protect it:

```bash
sudo chown root:deploy /etc/perxona-template/perxona-template.env
sudo chmod 640 /etc/perxona-template/perxona-template.env
```

This lets members of group `deploy` read the env file without making it world-readable.

---

## 5. Install the systemd service

Copy `deploy/perxona-template.service` to:

```bash
sudo cp /srv/perxona-template/deploy/perxona-template.service \
  /etc/systemd/system/perxona-template.service
```

Then:

```bash
sudo systemctl daemon-reload
sudo systemctl enable perxona-template.service
```

First start can happen after the first successful build:

```bash
sudo systemctl start perxona-template.service
```

Logs:

```bash
journalctl -u perxona-template.service -f
```

Status:

```bash
systemctl status perxona-template.service
```

---

## 6. Allow the `deploy` user to restart only this service

GitHub Actions should not get unrestricted sudo.

Create:

```bash
sudo visudo -f /etc/sudoers.d/perxona-template-deploy
```

Add:

```text
deploy ALL=(root) NOPASSWD: /bin/systemctl restart perxona-template.service, /bin/systemctl start perxona-template.service, /bin/systemctl is-active perxona-template.service
```

Depending on your distribution, `systemctl` may live at `/usr/bin/systemctl`.

Check:

```bash
command -v systemctl
```

Use the exact path in sudoers.

Validate:

```bash
sudo visudo -cf /etc/sudoers.d/perxona-template-deploy
```

---

## 7. GitHub repository secrets

In GitHub:

**Repository → Settings → Secrets and variables → Actions**

Create:

```text
DEPLOY_HOST
DEPLOY_PORT
DEPLOY_USER
DEPLOY_SSH_KEY
DEPLOY_PATH
APP_BASE_URL
```

Typical values:

```text
DEPLOY_PORT=22
DEPLOY_USER=deploy
DEPLOY_PATH=/srv/perxona-template
APP_BASE_URL=https://your-domain.example
```

`DEPLOY_SSH_KEY` is the full contents of `perxona_deploy_key`, including the BEGIN/END lines.

Do NOT put your Perxona or OpenRouter API keys into the deployment workflow unless you intentionally want GitHub to manage runtime secrets.

This template expects runtime application secrets to remain on the server in `/etc/perxona-template/perxona-template.env`.

---

## 8. First deployment

Push the repository to the branch configured in `.github/workflows/deploy.yml`.

The workflow should:

1. test/build in GitHub Actions
2. SSH to the server
3. stream the checked-out source tree to the server over SSH
4. run `pnpm install --frozen-lockfile`
5. run `pnpm build`
6. restart systemd
7. health-check the app

The server does **not** need GitHub repository credentials, so this works cleanly with a private repository too.

If the service is not installed yet, perform Steps 1–6 above once manually.

---

## 9. Reverse proxy

The application should normally remain bound to localhost:

```text
127.0.0.1:3000
```

Put nginx, Caddy, or your existing reverse proxy in front of it.

If Perxona's publishable key uses allowed domains, remember to add the final browser origin/domain in Perxona Console.

---

## 10. Troubleshooting

App logs:

```bash
journalctl -u perxona-template.service -n 200 --no-pager
```

Verify environment file permissions:

```bash
sudo -u deploy cat /etc/perxona-template/perxona-template.env >/dev/null \
  && echo readable
```

Verify app locally:

```bash
curl -f http://127.0.0.1:3000/api/health
```

Verify service:

```bash
sudo systemctl restart perxona-template.service
sudo systemctl is-active perxona-template.service
```

Verify deploy user:

```bash
sudo -u deploy -H bash -lc 'cd /srv/perxona-template && pnpm --version'
```

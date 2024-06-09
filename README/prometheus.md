# Manual Installation Guide for Prometheus

This guide outlines the manual installation process for Prometheus on Ubuntu 22.04. Follow these steps to set up Prometheus for monitoring your systems.

## Prerequisites

- A Linux system
- `wget`  installed
- Root access or sudo privileges

##Installation

### Step 1: Create a System User and Group for Prometheus

####  Create Prometheus Group
```sh
 sudo groupadd --system prometheus
```
#### Create a system user named "prometheus" and assign it to the "prometheus" group
```sh
 sudo useradd -s /sbin/nologin --system -g prometheus prometheus
```

### Step 2: Create Directories for Prometheus
sudo mkdir -p /etc/prometheus
sudo mkdir -p /var/lib/prometheus

### Step 3: Download Latest Prometheus and Extract Files
**download file**
```sh
 sudo wget https://github.com/prometheus/prometheus/releases/download/v2.52.0/prometheus-2.52.0.linux-amd64.tar.gz
```
**Extract file**
```sh 
 sudo tar xvf prometheus-2.52.0.linux-amd64.tar.gz
```

### Step 4: Navigate to the Prometheus Directory
```sh
 cd prometheus-2.52.0.linux-amd64
```

### Step 5: Move Binary Files & Set Ownership
**Move binary files (prometheus and promtool)**
```sh
 sudo mv prometheus promtool /usr/local/bin
```
**Set ownership**
```sh
sudo chown prometheus:prometheus /usr/local/bin/prometheus
sudo chown prometheus:prometheus /usr/local/bin/promtool
```

### Step 6: Move Configuration Files & Set Ownership
**Move config files**

```sh
 sudo mv console_libraries consoles prometheus.yml /etc/prometheus
```

**changing ownership of all files and directory inside**
```sh
  sudo chown -R prometheus:prometheus /etc/prometheus /var/lib/prometheus
```

### Step 7: Create Prometheus Systemd Service

**Open the service file for editing**

```sh
 sudo nano /etc/systemd/system/prometheus.service
```


**Add the following configuration to the file**
```ini
[Unit]
Description=Prometheus
Wants=network-online.target
After=network-online.target

[Service]
User=prometheus
Group=prometheus
Type=simple
ExecStart=/usr/local/bin/prometheus
--config.file /etc/prometheus/prometheus.yml
--storage.tsdb.path /var/lib/prometheus/
--web.console.templates=/etc/prometheus/consoles
--web.console.libraries=/etc/prometheus/console_libraries

[Install]
WantedBy=multi-user.target
```


### Step 8: Enable and Start Prometheus Service

```sh
# Reload systemd to recognize the new service
sudo systemctl daemon-reload
```
```sh
# Enable the Prometheus service to start on boot
sudo systemctl enable prometheus
```
```sh
# Start the Prometheus service
sudo systemctl start prometheus
```
```sh
# Check the status of the Prometheus service
sudo systemctl status prometheus
```

### Step 9: Access Prometheus Web Interface
Visit http://<your-server-ip>:9090 or http://localhost:9090 in your web browser.

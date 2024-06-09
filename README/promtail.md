# Manual Installation of Promtail

This guide provides step-by-step instructions for manually installing and configuring Promtail, a log collector for Grafana's Loki log aggregation system.

## Prerequisites

- A Linux system
- `wget` and `unzip` installed
- Root access or sudo privileges

## Installation Steps


### 1. Download Promtail

Download the Promtail binary for Linux (amd64) using `wget`:

```sh
sudo wget https://github.com/grafana/loki/releases/download/v3.0.0/promtail-linux-amd64.zip
```
### 2. Unzip the File
Install unzip if not already installed and unzip the downloaded file:

```sh
sudo apt-get install unzip
sudo unzip promtail-linux-amd64.zip
```

### 3. Download Configuration File
Download the default Promtail configuration file:

```sh
sudo wget -O /etc/promtail/promtail.yaml https://raw.githubusercontent.com/grafana/loki/main/clients/cmd/promtail/promtail-local-config.yaml
```

**N/B To see config 'yaml' file** 
```sh
sudo nano /etc/promtail/promtail-local-config.yaml
```

### 4. Move Configuration File
Create the necessary directory and move the configuration file to it:

```sh
sudo mkdir -p /etc/promtail
sudo mv promtail-local-config.yaml /etc/promtail/
```
### 5. Set Permissions
Set appropriate permissions for the configuration file:

```sh
sudo chown root:root /etc/promtail/promtail-local-config.yaml
sudo chmod 644 /etc/promtail/promtail-local-config.yaml
```
## 6. Run Promtail
Run Promtail with the specified configuration file:

```sh
./promtail-linux-amd64 -config.file=/etc/promtail/promtail-local-config.yaml
```


## Running Promtail as a Service (Optional)

Follow these steps:

### 1. Move Promtail Executable
Rename and move the Promtail executable to a directory in your PATH:

```sh
sudo mv promtail-linux-amd64 /usr/local/bin/promtail
```
**promtail-linux-amd64** is renamed to **promtail** and was move to `` /usr/local/bin `` directory

### 2. Set Permissions
Ensure the Promtail executable has the correct permissions:
```sh
sudo chmod +x /usr/local/bin/promtail
```
### 3. Create systemd Service File
Create a systemd service file for Promtail:

```sh
sudo nano /etc/systemd/system/promtail.service
```
**Add the following content to the service file:**

```sh
[Unit]
Description=Promtail
Wants=network-online.target
After=network-online.target

[Service]
User=root
Group=root
Type=simple
ExecStart=/usr/local/bin/promtail -config.file=/etc/promtail/promtail-local-config.yaml
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

### 4. Reload systemd
Reload systemd to apply the new service:

```sh
sudo systemctl daemon-reload
```
### 5. Enable and Start the Service
Enable the Promtail service to start on boot and start it:

```sh
sudo systemctl enable promtail
sudo systemctl start promtail
```
### 6. Check Service Status
Check the status of the Promtail service:
```sh
sudo systemctl status promtail
```
This setup ensures that Promtail runs as a background service and starts automatically on boot.

## Check if Promtail is Running Locally

To verify if Promtail is running locally on your system, you can use the following URL in your browser:

[Check Promtail Status](http://localhost:9080/targets) ``http://localhost:9080/targets``



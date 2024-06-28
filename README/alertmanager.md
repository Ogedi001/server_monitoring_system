# Alerttmanger Installation configuration Guide 
This guide provides step-by-step instructions to install and configure Alertmanager.

## Prerequisites

- A Linux system
- `wget` and `unzip` installed
- Root access or sudo privileges

## Installation Steps

### 1. Download Loki Binary:
Download the Promtail binary for Linux (amd64) using `wget`:

   ```sh
    sudo wget https://github.com/grafana/loki/releases/download/v3.0.0/loki-linux-amd64.zip
   ```

### 2. Unzip the Binary or file:
Install unzip if not already installed and unzip the downloaded file:

```sh
    sudo apt-get install unzip
    sudo unzip loki-linux-amd64.zip
```

### 3. Download Configuration File:
Download the default Loki configuration file:

 ```sh
    sudo wget https://raw.githubusercontent.com/grafana/loki/main/cmd/loki/loki-local-config.yaml
 ```

**N/B To see config 'yaml' file** 

```sh
  sudo nano /etc/loki/loki-local-config.yaml
```

### 4.Move Configuration File:
Create the necessary directory and move the configuration file to it:

```sh
    sudo mkdir -p /etc/loki
    sudo mv loki-local-config.yaml /etc/loki/
```

### 5.Set Permissions:
Set appropriate permissions for the configuration file:

 ```sh
    sudo chown root:root /etc/loki/loki-local-config.yaml
    sudo chmod 644 /etc/loki/loki-local-config.yaml
 ```

### 6. Start Loki:
Run Promtail with the specified configuration file:

```sh
    ./loki-linux-amd64 -config.file=/etc/loki/loki-local-config.yaml
 ```

## Running Loki as a Service (Optional)
Follow these steps:

### 1. Move Loki Executable :
Rename and move the Loki executable to a directory in your PATH:

   ```sh
    sudo mv loki-linux-amd64 /usr/local/bin/loki
   ```

**loki-linux-amd64** is renamed to **loki** and was move to `` /usr/local/bin `` directory

### 2. Set Executable Permissions:
Ensure the Loki executable has the correct permissions:

   ```sh
    sudo chmod +x /usr/local/bin/loki
   ```

3. **Create Systemd Service File**:
Create a systemd service file for Loki:

   ```sh
    sudo nano /etc/systemd/system/loki.service
   ```

### 4. Add Service Configuration Content:

 ```ini

    [Unit]
    Description=Loki
    Wants=network-online.target
    After=network-online.target
    
    [Service]
    User=root
    Group=root
    Type=simple
    ExecStart=/usr/local/bin/loki -config.file=/etc/loki/loki-local-config.yaml
    
    [Install]
    WantedBy=multi-user.target
 ```

5. **Reload Systemd**:
Reload systemd to apply the new service:

    ```sh
    sudo systemctl daemon-reload
    ```

6. **Enable and Start Loki Service**:
Enable the Loki service to start on boot and start it:
    ```sh
    sudo systemctl enable loki
    sudo systemctl start loki
    ```

7. **Check Loki Service Status**:
Check the status of the Loki service
    ```sh
    sudo systemctl status loki
    ```
## Check if Loki is Running Locally

To verify if Loki is running locally on your system, you can use the following URL in your browser:

[Check Promtail Status](http://localhost:3100/metrics) ``http://localhost:3100/metrics``


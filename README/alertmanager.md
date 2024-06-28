# Alerttmanger Installation configuration Guide 
This guide provides step-by-step instructions to install and configure Alertmanager.

## Prerequisites

- A Linux system
- `wget`  installed
- Root access or sudo privileges

## Installation Steps

### 1. Download alertmanager Binary:
Download the latest version of Alertmanager for Linux (amd64) using `wget`:

   ```sh
    sudo wget https://github.com/prometheus/alertmanager/releases/download/v0.27.0/alertmanager-0.27.0.linux-amd64.tar.gz
   ```

### 2. Unzip the Binary or file:
Extract the contents of the tar.gz file:

```sh
    tar xvfz alertmanager-0.27.0.linux-amd64.tar.gz
```

### 3. Move Binaries to a Standard Location
Move the binaries to /usr/local/bin:

 ```sh
   sudo mv alertmanager-0.27.0.linux-amd64/alertmanager /usr/local/bin/
   sudo mv alertmanager-0.27.0.linux-amd64/amtool /usr/local/bin/
 ```
### 4. Create Configuration Directory
Create the configuration directory:
```sh
  sudo mkdir -p /etc/alertmanager
```

### 5.Move Configuration File to Standard Config Directory
Move the configuration file to /etc/alertmanager:

```sh
    sudo mv alertmanager-0.27.0.linux-amd64/alertmanager.yml /etc/alertmanager/
```
**N/B** To edit or view the configuration file:
```sh
sudo nano /etc/alertmanager/alertmanager.yml
```

### 6.Create Storage Directory
Create the storage directory:

 ```sh
   sudo useradd --no-create-home --shell /bin/false alertmanager
 ```

### 7. Create a User for Alertmanager
Create a dedicated user and group:

```sh
   sudo useradd --no-create-home --shell /bin/false alertmanager
 ```
### 8. Set Permissions
Set the appropriate ownership and permissions:

```sh
sudo chown -R alertmanager:alertmanager /etc/alertmanager
sudo chown alertmanager:alertmanager /usr/local/bin/alertmanager
```

### 9. Create a Systemd Service File
Create and edit the Alertmanager service file:
```sh
sudo nano /etc/systemd/system/alertmanager.service
```
Add the following content:

```ini
[Unit]
Description=Alertmanager
Wants=network-online.target
After=network-online.target

[Service]
User=alertmanager
Group=alertmanager
Type=simple
ExecStart=/usr/local/bin/alertmanager --config.file /etc/alertmanager/alertmanager.yml --storage.path /var/lib/alertmanager/
ExecReload=/bin/kill -HUP $MAINPID
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

### 10. Configure Alertmanager for Email Notifications
Edit the Alertmanager configuration file to include email notifications:
   ```yaml
   global:
  smtp_smarthost: 'host address'
  smtp_from: 'from mail'
  smtp_auth_username: 'username'
  smtp_auth_password: "pass"  # Use double quotes to handle special characters
  smtp_require_tls: true

route:
  group_by: ['alertname']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 1h
  receiver: 'email-alert'

receivers:
  - name: 'web.hook'
    webhook_configs:
      - url: 'http://127.0.0.1:5001/'

  - name: 'email-alert'
    email_configs:
      - to: 'email'

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'dev',

   ```
Restart Alertmanager after making these changes:

```sh
sudo systemctl daemon-reload
sudo systemctl restart alertmanager
```
### 11. Create Alert Rule YAML File
Create your alert rules file (e.g., monitoring_rule.yml) in your desired directory.

An example yml rule file
```plaintext
groups:
- name: system_availability_alerts
  rules:
  - alert: SystemAvailabilityLow
    expr: system_availability_percentage < 75
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "System availability is low"
      description: "System availability is below 75% for more than 5 minutes. Current value: {{ $value }}%"

```
### 12. Add Path to Alert Rule File in Prometheus Configuration
Edit your Prometheus configuration file to include the alert rule file:

```yaml
# Alertmanager configuration
alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093

# Load rules once and periodically evaluate them according to the global 'evaluation_interval'.
rule_files:
  - "path/to/onitoring_rule.yml"
  # - "second_rules.yml"
```
Restart Prometheus to apply the changes:
```sh
sudo systemctl restart prometheus
```

### 12 Check if alertmanager is Running Locally

To verify if Loki is running locally on your system, you can use the following URL in your browser:

[Check alertmanager](http://localhost:9093) ``http://localhost:9093``

## Important: 

**Add Prometheus User to the Appropriate Group where rule.yml is located**
Ensure the Prometheus user has the necessary permissions:
```sh
sudo usermod -aG parent_directory_group prometheus
```
Verify the permissions:
```sh
sudo ls -ld /parent_directory_group /parent_directory_group/child_dir /parent_directory_group/child_dir/rules.yml
```

prometheus cannot access file and directories that does not belong prometheus user and group to execute alert rules



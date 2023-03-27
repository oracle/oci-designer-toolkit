# Define Local CNE Types
# If VMs are added to the design add their Private IP reference to the appropriate list.
locals {
    cne_operator_public_ips = [local.Okit_I_1662125763009_public_ip]

    cne_master_private_ips = [local.Okit_I_1662125754075_private_ip]

    cne_worker_private_ips = [local.Okit_I_1662125758459_private_ip]
}

# Install Operator Pre-Reqs
resource "null_resource" "cne-operator-pre-reqs" {
    count = length(local.cne_operator_public_ips)
    connection {
        type = "ssh"
        user = "opc"
        private_key = file("${var.private_key_file}")
        host = local.cne_operator_public_ips[count.index]
    }

    provisioner "file" {
      source = "${var.private_key_file}"
      destination = "${var.remote_private_key_file}"
    }

    provisioner "remote-exec" {
      inline = [
        "sudo bash -c 'echo \"proxy=${var.yum_proxy}\" >> /etc/yum.conf'",
        "sudo bash -c 'echo \"timeout=3000\" >> /etc/yum.conf'",
        "sudo bash -c 'echo \"retries=100\" >> /etc/yum.conf'",
        "sudo yum check-update",
        "sudo bash -c 'echo \"proxy=${var.yum_proxy}\" >> /etc/dnf/dnf.conf'",
        "sudo bash -c 'echo \"timeout=3000\" >> /etc/dnf/dnf.conf'",
        "sudo bash -c 'echo \"retries=100\" >> /etc/dnf/dnf.conf'",
        "sudo dnf --refresh check-update",
        "sudo dnf install -y oracle-olcne-release-el8",
        "sudo dnf config-manager --enable ol8_olcne15 ol8_addons ol8_baseos_latest ol8_appstream ol8_UEKR6",
        "sudo dnf config-manager --disable ol8_olcne14 ol8_olcne13 ol8_olcne12 ol8_developer",

        "sudo sed -i 's/^SELINUX=enforcing/SELINUX=permissive/' /etc/selinux/config",
        "sudo /usr/sbin/setenforce 0",

        "sudo firewall-cmd --add-port=8091/tcp --permanent",
        "sudo systemctl restart firewalld.service",

        "sudo chmod 600 ${var.remote_private_key_file}"
      ]
    }
}

# Install Master (Control) Pre-Reqs
resource "null_resource" "cne-master-pre-reqs" {
    count = length(local.cne_master_private_ips)
    connection {
        type = "ssh"
        bastion_host = local.cne_operator_public_ips[0]
        bastion_user = "opc"
        bastion_private_key = file("${var.private_key_file}")
        host = local.cne_master_private_ips[count.index]
        user = "opc"
        private_key = file("${var.private_key_file}")
    }

    provisioner "file" {
      source = "${var.private_key_file}"
      destination = "${var.remote_private_key_file}"
    }

    provisioner "remote-exec" {
      inline = [
        "sudo bash -c 'echo \"proxy=${var.yum_proxy}\" >> /etc/yum.conf'",
        "sudo bash -c 'echo \"timeout=3000\" >> /etc/yum.conf'",
        "sudo bash -c 'echo \"retries=100\" >> /etc/yum.conf'",
        "sudo yum check-update",
        "sudo bash -c 'echo \"proxy=${var.yum_proxy}\" >> /etc/dnf/dnf.conf'",
        "sudo bash -c 'echo \"timeout=3000\" >> /etc/dnf/dnf.conf'",
        "sudo bash -c 'echo \"retries=100\" >> /etc/dnf/dnf.conf'",
        "sudo dnf --refresh check-update",
        "sudo dnf install -y oracle-olcne-release-el8",
        "sudo dnf config-manager --enable ol8_olcne15 ol8_addons ol8_baseos_latest ol8_appstream ol8_UEKR6",
        "sudo dnf config-manager --disable ol8_olcne14 ol8_olcne13 ol8_olcne12 ol8_developer",
        "sudo yum install -y chrony",
        "sudo echo 'Add NTP Server to /etc/chrony.conf'",
        "sudo swapoff -a",
        "sudo sed -i '/ swap /d' /etc/fstab",

        "sudo sed -i 's/^SELINUX=enforcing/SELINUX=permissive/' /etc/selinux/config",
        "sudo /usr/sbin/setenforce 0",

        "sudo firewall-cmd --zone=trusted --add-interface=cni0 --permanent",
        "sudo firewall-cmd --add-port=8090/tcp --permanent",
        "sudo firewall-cmd --add-port=10250/tcp --permanent",
        "sudo firewall-cmd --add-port=10255/tcp --permanent",
        "sudo firewall-cmd --add-port=8472/udp --permanent",
        "sudo firewall-cmd --add-port=6443/tcp --permanent",
        "sudo firewall-cmd --add-port=10251/tcp --permanent",
        "sudo firewall-cmd --add-port=10252/tcp --permanent",
        "sudo firewall-cmd --add-port=2379/tcp --permanent",
        "sudo firewall-cmd --add-port=2380/tcp --permanent",
        "sudo systemctl restart firewalld.service",

        "sudo chmod 600 ${var.remote_private_key_file}"
      ]
    }

    depends_on = [
        null_resource.cne-operator-pre-reqs
    ]    
}

# Install Worker Pre-Reqs
resource "null_resource" "cne-worker-pre-reqs" {
    count = length(local.cne_worker_private_ips)
    connection {
        type = "ssh"
        bastion_host = local.cne_operator_public_ips[0]
        bastion_user = "opc"
        bastion_private_key = file("${var.private_key_file}")
        user = "opc"
        private_key = file("${var.private_key_file}")
        host = local.cne_worker_private_ips[count.index]
    }

    provisioner "file" {
      source = "${var.private_key_file}"
      destination = "${var.remote_private_key_file}"
    }

    provisioner "remote-exec" {
      inline = [
        "sudo bash -c 'echo \"proxy=${var.yum_proxy}\" >> /etc/yum.conf'",
        "sudo bash -c 'echo \"timeout=3000\" >> /etc/yum.conf'",
        "sudo bash -c 'echo \"retries=100\" >> /etc/yum.conf'",
        "sudo yum check-update",
        "sudo bash -c 'echo \"proxy=${var.yum_proxy}\" >> /etc/dnf/dnf.conf'",
        "sudo bash -c 'echo \"timeout=3000\" >> /etc/dnf/dnf.conf'",
        "sudo bash -c 'echo \"retries=100\" >> /etc/dnf/dnf.conf'",
        "sudo dnf --refresh check-update",
        "sudo dnf install -y oracle-olcne-release-el8",
        "sudo dnf config-manager --enable ol8_olcne15 ol8_addons ol8_baseos_latest ol8_appstream ol8_UEKR6",
        "sudo dnf config-manager --disable ol8_olcne14 ol8_olcne13 ol8_olcne12 ol8_developer",
        "sudo yum install -y chrony",
        "sudo echo 'Add NTP Server to /etc/chrony.conf'",
        "sudo swapoff -a",
        "sudo sed -i '/ swap /d' /etc/fstab",

        "sudo sed -i 's/^SELINUX=enforcing/SELINUX=permissive/' /etc/selinux/config",
        "sudo /usr/sbin/setenforce 0",

        "sudo firewall-cmd --zone=trusted --add-interface=cni0 --permanent",
        "sudo firewall-cmd --add-port=8090/tcp --permanent",
        "sudo firewall-cmd --add-port=10250/tcp --permanent",
        "sudo firewall-cmd --add-port=10255/tcp --permanent",
        "sudo firewall-cmd --add-port=8472/udp --permanent",
        "sudo systemctl restart firewalld.service",

        "sudo chmod 600 ${var.remote_private_key_file}"
      ]
    }

    depends_on = [
        null_resource.cne-operator-pre-reqs
    ]    
}

# Install Master (Control)
resource "null_resource" "cne-master-install" {
    count = length(local.cne_master_private_ips)
    connection {
        type = "ssh"
        bastion_host = local.cne_operator_public_ips[0]
        bastion_user = "opc"
        bastion_private_key = file("${var.private_key_file}")
        user = "opc"
        private_key = file("${var.private_key_file}")
        host = local.cne_master_private_ips[count.index]
    }

    provisioner "remote-exec" {
      inline = [
        "sudo yum check-update",
        "sudo dnf --refresh check-update",
        "sudo dnf install -y olcne-agent olcne-utils",
        "sudo systemctl enable olcne-agent.service",
        "sudo mkdir /etc/systemd/system/crio.service.d",
        "sudo bash -c 'echo \"[Service]\" > /etc/systemd/system/crio.service.d/proxy.conf'",
        "sudo bash -c 'echo \"Environment=\\\"HTTP_PROXY=${var.http_proxy}\\\"\" >> /etc/systemd/system/crio.service.d/proxy.conf'",
        "sudo bash -c 'echo \"Environment=\\\"HTTPS_PROXY=${var.https_proxy}\\\"\" >> /etc/systemd/system/crio.service.d/proxy.conf'",
        "sudo bash -c 'echo \"Environment=\\\"NO_PROXY=${length(var.no_proxy) > 0 ? var.no_proxy : local.cne_operator_public_ips[0]}\\\"\" >> /etc/systemd/system/crio.service.d/proxy.conf'"
      ]
    }

    depends_on = [
        null_resource.cne-master-pre-reqs,
        null_resource.cne-worker-pre-reqs,
        null_resource.cne-operator-pre-reqs
    ]    
}

# Install Worker
resource "null_resource" "cne-worker-install" {
    count = length(local.cne_worker_private_ips)
    connection {
        type = "ssh"
        bastion_host = local.cne_operator_public_ips[0]
        bastion_user = "opc"
        bastion_private_key = file("${var.private_key_file}")
        user = "opc"
        private_key = file("${var.private_key_file}")
        host = local.cne_worker_private_ips[count.index]
    }

    provisioner "remote-exec" {
      inline = [
        "sudo yum check-update",
        "sudo dnf --refresh check-update",
        "sudo dnf install -y olcne-agent olcne-utils",
        "sudo systemctl enable olcne-agent.service ",
        "sudo mkdir /etc/systemd/system/crio.service.d",
        "sudo bash -c 'echo \"[Service]\" > /etc/systemd/system/crio.service.d/proxy.conf'",
        "sudo bash -c 'echo \"Environment=\\\"HTTP_PROXY=${var.http_proxy}\\\"\" >> /etc/systemd/system/crio.service.d/proxy.conf'",
        "sudo bash -c 'echo \"Environment=\\\"HTTPS_PROXY=${var.https_proxy}\\\"\" >> /etc/systemd/system/crio.service.d/proxy.conf'",
        "sudo bash -c 'echo \"Environment=\\\"NO_PROXY=${length(var.no_proxy) > 0 ? var.no_proxy : local.cne_operator_public_ips[0]}\\\"\" >> /etc/systemd/system/crio.service.d/proxy.conf'"
      ]
    }

    depends_on = [
        null_resource.cne-master-pre-reqs,
        null_resource.cne-worker-pre-reqs,
        null_resource.cne-operator-pre-reqs
    ]    
}

# Install Operator
resource "null_resource" "cne-operator-install" {
    count = length(local.cne_operator_public_ips)
    connection {
        type = "ssh"
        user = "opc"
        private_key = file("${var.private_key_file}")
        host = local.cne_operator_public_ips[count.index]
    }

    provisioner "remote-exec" {
      inline = [
        "sudo yum check-update",
        "sudo dnf --refresh check-update",
        "sudo dnf install -y olcnectl olcne-api-server olcne-utils",
        "sudo systemctl enable olcne-api-server.service",
        "sudo mkdir /etc/systemd/system/crio.service.d",
        "sudo bash -c 'echo \"[Service]\" > /etc/systemd/system/crio.service.d/proxy.conf'",
        "sudo bash -c 'echo \"Environment=\\\"HTTP_PROXY=${var.http_proxy}\\\"\" >> /etc/systemd/system/crio.service.d/proxy.conf'",
        "sudo bash -c 'echo \"Environment=\\\"HTTPS_PROXY=${var.https_proxy}\\\"\" >> /etc/systemd/system/crio.service.d/proxy.conf'",
        "sudo bash -c 'echo \"Environment=\\\"NO_PROXY=${var.no_proxy}\\\"\" >> /etc/systemd/system/crio.service.d/proxy.conf'"
      ]
    }

    depends_on = [
        null_resource.cne-master-pre-reqs,
        null_resource.cne-worker-pre-reqs,
        null_resource.cne-operator-pre-reqs
    ]    
}

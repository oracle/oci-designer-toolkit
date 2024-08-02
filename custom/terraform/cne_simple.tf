# Copyright (c) 2020, Oracle and/or its affiliates. All rights reserved.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
# Define Local CNE Types
# If VMs are added to the design add their Private IP reference to the appropriate list.
locals {
    cne_operator_public_ips = [local.Okit_I_1662125763009_public_ip]

    cne_operator_private_ips = [local.Okit_I_1662125763009_private_ip]

    cne_master_private_ips = [local.Okit_I_1662125754075_private_ip]

    cne_worker_private_ips = [local.Okit_I_1662125758459_private_ip]

    cne_operartor_node = "opnode.ocneopsn.ocnevcn.oraclevcn.com"

    cne_master_nodes = "k8smstr1.ocneopsn.ocnevcn.oraclevcn.com"

    cne_worker_nodes = "k8swkr1.ocneopsn.ocnevcn.oraclevcn.com"
}

locals {
  no_proxy = join(",", concat(local.cne_operator_private_ips, local.cne_master_private_ips, local.cne_worker_private_ips))
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
      destination = "/home/opc/.ssh/id_rsa"
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
        "sudo bash -c 'echo \"export http_proxy=${var.http_proxy}\" >> /etc/bashrc'",
        "sudo bash -c 'echo \"export https_proxy=${var.https_proxy}\" >> /etc/bashrc'",
        "sudo bash -c 'echo \"export no_proxy=${local.no_proxy}\" >> /etc/bashrc'",

        "sudo chmod 600 /home/opc/.ssh/id_rsa"
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
      destination = "/home/opc/.ssh/id_rsa"
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
        "sudo bash -c 'echo \"export http_proxy=${var.http_proxy}\" >> /etc/bashrc'",
        "sudo bash -c 'echo \"export https_proxy=${var.https_proxy}\" >> /etc/bashrc'",
        "sudo bash -c 'echo \"export no_proxy=${local.no_proxy}\" >> /etc/bashrc'",

        "sudo chmod 600 /home/opc/.ssh/id_rsa"
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
      destination = "/home/opc/.ssh/id_rsa"
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
        "sudo bash -c 'echo \"export http_proxy=${var.http_proxy}\" >> /etc/bashrc'",
        "sudo bash -c 'echo \"export https_proxy=${var.https_proxy}\" >> /etc/bashrc'",
        "sudo bash -c 'echo \"export no_proxy=${local.no_proxy}\" >> /etc/bashrc'",

        "sudo chmod 600 /home/opc/.ssh/id_rsa"
      ]
    }

    depends_on = [
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
        "sudo dnf install -y olcnectl",
        "echo 'Host *' > /home/opc/.ssh/config",
        "echo '         StrictHostKeyChecking accept-new' >> /home/opc/.ssh/config",
        "sudo chmod 600 /home/opc/.ssh/config",
        "olcnectl provision --api-server ${local.cne_operartor_node} --master-nodes ${replace(local.cne_master_nodes," ","")} --worker-nodes ${replace(local.cne_worker_nodes," ", "")} --environment-name ${var.environment_name} --name ${var.cluster_name} --http-proxy ${var.http_proxy} --https-proxy ${var.https_proxy} --no-proxy ${local.Okit_S_1667389188594_cidr_block} --yes --debug",
        "olcnectl module instances --api-server ${local.cne_operartor_node}:8091 --environment-name ${var.environment_name} --update-config",
        "olcnectl module report --environment-name ${var.environment_name} --name ${var.cluster_name} --children",
        "mkdir -p $HOME/.kube",
        "sudo cp -i /home/opc/kubeconfig.${var.environment_name}.${var.cluster_name} $HOME/.kube/config",
        "sudo chown $(id -u):$(id -g) $HOME/.kube/config",
        "export KUBECONFIG=$HOME/.kube/config",
        "echo 'export KUBECONFIG=$HOME/.kube/config' >> $HOME/.bashrc"
      ]
    }

    depends_on = [
        null_resource.cne-master-pre-reqs,
        null_resource.cne-worker-pre-reqs,
        null_resource.cne-operator-pre-reqs
    ]    
}

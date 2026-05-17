terraform {
  required_providers {
    kind = {
      source  = "tehcyx/kind"
      version = "0.6.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "2.35.0"
    }
  }
}

resource "kind_cluster" "sre_local_cluster" {
  name           = "sre-capstone-cluster"
  wait_for_ready = true

  kind_config {
    kind        = "Cluster"
    api_version = "kind.x-k8s.io/v1alpha4"
    node {
      role = "control-plane"
      extra_port_mappings {
        container_port = 30000
        host_port      = 3000   
      }
      extra_port_mappings {
        container_port = 30001
        host_port      = 5000   
      }
      extra_port_mappings {
        container_port = 30002
        host_port      = 9090    
      }
      extra_port_mappings {
        container_port = 30003
        host_port      = 3001    
      }
    }
  }
}

provider "kubernetes" {
  host                   = kind_cluster.sre_local_cluster.endpoint
  client_certificate     = kind_cluster.sre_local_cluster.client_certificate
  client_key             = kind_cluster.sre_local_cluster.client_key
  cluster_ca_certificate = kind_cluster.sre_local_cluster.cluster_ca_certificate
}

resource "kubernetes_deployment" "mongodb" {
  depends_on = [kind_cluster.sre_local_cluster]
  metadata { name = "mongodb" }
  spec {
    replicas = 1
    selector { match_labels = { app = "mongodb" } }
    template {
      metadata { labels = { app = "mongodb" } }
      spec {
        container {
          name  = "mongodb"
          image = "mongo:6.0"
          port { container_port = 27017 }
        }
      }
    }
  }
}

resource "kubernetes_service" "mongodb_service" {
  metadata { 
    name = "mongodb" 
  }
  spec {
    selector = { app = "mongodb" }
    port { 
      port = 27017 
    }
    type = "ClusterIP"
  }
}
resource "kubernetes_deployment" "backend" {
  depends_on = [kind_cluster.sre_local_cluster]
  metadata { name = "backend" }
  spec {
    replicas = 3
    selector { match_labels = { app = "backend" } }
    template {
      metadata { labels = { app = "backend" } }
      spec {
        container {
          name  = "backend"
          image = "library-backend:latest"
          image_pull_policy = "Never"
          port { container_port = 5000 }
          
          env {
            name  = "MONGODB_URI"
            value = "mongodb://mongodb:27017/library_db"
          }
          env {
            name  = "JWT_SECRET"
            value = "supersecretkey"
          }

          resources {
            limits   = { cpu = "0.5", memory = "512Mi" }
            requests = { cpu = "0.2", memory = "256Mi" }
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "backend_service" {
  metadata { name = "backend-service" }
  spec {
    selector = { app = "backend" }
    port { 
      port      = 5000 
      target_port = 5000
      node_port = 30001 
      
    }
    type = "NodePort"
  }
}
resource "kubernetes_deployment" "frontend" {
  depends_on = [kind_cluster.sre_local_cluster]
  metadata { name = "frontend" }
  spec {
    replicas = 3
    selector { match_labels = { app = "frontend" } }
    template {
      metadata { labels = { app = "frontend" } }
      spec {
        container {
          name  = "frontend"
          image = "library-frontend:latest"
          image_pull_policy = "Never"
          port { container_port = 80 }
        }
      }
    }
  }
}

resource "kubernetes_service" "frontend_service" {
  metadata { name = "frontend-service" }
  spec {
    selector = { app = "frontend" }
    port { 
      port      = 80 
      target_port = 80
      node_port = 30000 
    }
    type = "NodePort"
  }
}


resource "kubernetes_config_map" "prometheus_config" {
  metadata {
    name = "prometheus-config"
  }
  data = {
    "prometheus.yml" = <<EOF
global:
  scrape_interval: 5s

rule_files:
  - "/etc/prometheus/alert_rules.yml"

scrape_configs:

  - job_name: 'backend'
    metrics_path: /metrics
    static_configs:
      - targets: ['backend-service:5000']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
EOF

    "alert_rules.yml" = <<EOF
groups:
  - name: library_alerts
    rules:

      - alert: BackendDown
        expr: up{job="backend"} == 0
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "Backend is down"
          description: "Backend service unavailable."

      - alert: HighCPUUsage
        expr: rate(process_cpu_seconds_total[1m]) > 0.5
        for: 30s
        labels:
          severity: critical
        annotations:
          summary: "High CPU usage"
          description: "CPU usage is too high."
EOF
  }
}
resource "kubernetes_deployment" "prometheus" {
  depends_on = [kind_cluster.sre_local_cluster]
  metadata {
    name = "prometheus"
  }

  spec {
    replicas = 1
    selector {
      match_labels = {
        app = "prometheus"
      }
    }

    template {
      metadata {
        labels = {
          app = "prometheus"
        }
      }

      spec {

        volume {
          name = "prometheus-config-volume"
          config_map {
            name = kubernetes_config_map.prometheus_config.metadata[0].name
          }
        }

        container {
          name  = "prometheus"
          image = "prom/prometheus:latest"

          port {
            container_port = 9090
          }
          volume_mount {
            name       = "prometheus-config-volume"
            mount_path = "/etc/prometheus"
          }
          args = [
            "--config.file=/etc/prometheus/prometheus.yml"
          ]
        }
      }
    }
  }
}

resource "kubernetes_service" "prometheus_service" {
  metadata { name = "prometheus-service" }
  spec {
    selector = { app = "prometheus" }
    port { 
      port      = 9090 
      node_port = 30002 
    }
    type = "NodePort"
  }
}

resource "kubernetes_deployment" "node_exporter" {
  metadata {
    name = "node-exporter"
  }

  spec {
    replicas = 1
    selector {
      match_labels = {
        app = "node-exporter"
      }
    }
    template {
      metadata {
        labels = {
          app = "node-exporter"
        }
      }
      spec {
        container {
          name  = "node-exporter"
          image = "prom/node-exporter:latest"
          port {
            container_port = 9100
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "node_exporter_service" {
  metadata {
    name = "node-exporter"
  }
  spec {
    selector = {
      app = "node-exporter"
    }
    port {
      port        = 9100
      target_port = 9100
    }
    type = "ClusterIP"
  }
}

resource "kubernetes_deployment" "grafana" {
  depends_on = [kind_cluster.sre_local_cluster]
  metadata { name = "grafana" }
  spec {
    replicas = 1
    selector { match_labels = { app = "grafana" } }
    template {
      metadata { labels = { app = "grafana" } }
      spec {
        container {
          name  = "grafana"
          image = "grafana/grafana:latest"
          port { container_port = 3000 }
        }
      }
    }
  }
}

resource "kubernetes_service" "grafana_service" {
  metadata { name = "grafana-service" }
  spec {
    selector = { app = "grafana" }
    port { 
      port      = 3000 
      node_port = 30003 
    }
    type = "NodePort"
  }
}
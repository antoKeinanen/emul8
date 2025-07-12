resource "kubernetes_deployment" "auth_service" {
  metadata {
    name      = "auth-service"
    namespace = kubernetes_namespace.emul8.metadata[0].name
    labels    = { app = "auth-service" }
  }
  spec {
    replicas = 2
    selector { match_labels = { app = "auth-service" } }
    template {
      metadata { labels = { app = "auth-service" } }
      spec {
        container {
          name              = "auth-service"
          image             = "emul8/auth-service:latest"
          image_pull_policy = "IfNotPresent"
          port {
            container_port = 80
          }


          dynamic "env" {
            for_each = var.auth_service_env
            content {
              name  = env.key
              value = env.value
            }
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "auth_service" {
  metadata {
    name      = "auth-service"
    namespace = kubernetes_namespace.emul8.metadata[0].name
  }
  spec {
    selector = { app = "auth-service" }
    port {
      port        = 80
      target_port = 3000
      protocol    = "TCP"
    }
  }
}

resource "kubernetes_ingress_v1" "emul8" {
  metadata {
    name      = "emul8-ingress"
    namespace = kubernetes_namespace.emul8.metadata[0].name
    annotations = {
      "kubernetes.io/ingress.class"                      = "traefik"
      "traefik.ingress.kubernetes.io/router.entrypoints" = "web"
    }
  }
  spec {
    rule {
      http {
        path {
          path      = "/api/auth"
          path_type = "Prefix"
          backend {
            service {
              name = kubernetes_service.auth_service.metadata[0].name
              port {
                number = kubernetes_service.auth_service.spec[0].port[0].port
              }
            }
          }
        }
        path {
          path      = "/"
          path_type = "Prefix"
          backend {
            service {
              name = kubernetes_service.frontend.metadata[0].name
              port {
                number = kubernetes_service.frontend.spec[0].port[0].port
              }
            }
          }
        }
      }
    }
  }
}

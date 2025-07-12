resource "helm_release" "traefik" {
  name             = "traefik"
  repository       = "https://helm.traefik.io/traefik"
  chart            = "traefik"
  version          = "36.3.0"
  namespace        = "kube-system"
  create_namespace = true

  values = [
    <<-EOF
    service:
      type: LoadBalancer
      ports:
        web:
          port: 80
          nodePort: 30080
    EOF
  ]
}

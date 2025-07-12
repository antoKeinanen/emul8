resource "helm_release" "grafana" {
  name       = "grafana"
  repository = "https://grafana.github.io/helm-charts"
  chart      = "grafana"
  version    = "9.2.10"

  namespace = kubernetes_namespace.monitoring.metadata[0].name

  values = [
    file("${path.module}/grafana.config.yaml"),
  ]

  depends_on = [helm_release.loki]
}

resource "helm_release" "loki" {
  name       = "loki"
  repository = "https://grafana.github.io/helm-charts"
  chart      = "loki"
  version    = "6.31.0"

  namespace = kubernetes_namespace.monitoring.metadata[0].name

  values = [
    file("${path.module}/loki.config.yaml"),
  ]
}

resource "helm_release" "promtail" {
  name       = "promtail"
  repository = "https://grafana.github.io/helm-charts"
  chart      = "promtail"
  version    = "6.17.0"

  namespace = kubernetes_namespace.monitoring.metadata[0].name

  values = [
    file("${path.module}/promtail.config.yaml"),
  ]

  depends_on = [helm_release.loki]
}

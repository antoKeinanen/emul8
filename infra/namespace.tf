resource "kubernetes_namespace" "emul8" {
  metadata {
    name = "emul8"
  }
}

resource "kubernetes_namespace" "monitoring" {
  metadata {
    name = "monitoring"
  }
}

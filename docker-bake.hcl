group "default" {
  targets = [ "frontend", "auth-service" ]
}

target "frontend" {
  context = "."
  dockerfile = "./src/apps/frontend/Dockerfile"
  tags = [ "emul8/frontend:latest" ]
}

target "auth-service" {
  context = "."
  dockerfile = "./src/services/auth-service/Dockerfile"
  tags = [ "emul8/auth-service:latest" ]
}
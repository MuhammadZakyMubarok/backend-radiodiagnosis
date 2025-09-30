pipeline {
   agent {
      kubernetes {
        defaultContainer 'jnlp'
        yaml """
          apiVersion: v1
          kind: Pod
          spec:
            containers:
            - name: jnlp
              image: jenkins/inbound-agent:latest
            - name: buildkit
              image: moby/buildkit:v0.18.2
              securityContext:
                privileged: true
              command: ["/bin/sh","-c","sleep 999999"]
              tty: true
              volumeMounts:
                - name: docker-config
                  mountPath: /root/.docker
            - name: kubectl
              image: bitnami/kubectl:1.30
              command: ["sleep","infinity"]
              tty: true
              securityContext:
                runAsUser: 0
                runAsGroup: 0
              volumeMounts:
                - name: workspace-volume
                  mountPath: /home/jenkins/agent
            volumes:
              - name: docker-config
                secret:
                  secretName: docker-config
              - name: workspace-volume
                emptyDir: {}
          """
      }
   }

  environment {
    REGISTRY        = 'docker.io/ardianhermawan17'
    IMAGE           = "${env.REGISTRY}/backend-radiodiagnosis"
    KUBECONFIG_CRED = 'kubeconfig-jenkins'
    K8S_NAMESPACE   = 'radiodiagnosis'
    DOCKER_HUB_AUTH = credentials('docker-ardian-read-write')
    LABEL_APP       = 'backend'
    DEPLOYMENT_NAME = 'backend'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Load Secrets from Kubernetes') {
      steps {
        container('kubectl') {
         withKubeConfig([credentialsId: env.KUBECONFIG_CRED]) {
           sh '''
                 set -eu
                 SECRET_NAME=backend-radiodiagnosis-env
                 OUT=/tmp/backend.env
                 : > "$OUT"

                 # list ENV
                 keys="PGUSER PGPASSWORD PGHOST PGPORT PGDATABASE ACCESS_TOKEN_KEY REFRESH_TOKEN_KEY SATU_SEHAT_BASE_URL SATU_SEHAT_AUTH_BASE_URL HOST PROD_HOST PORT NODE_ENV"

                 for k in $keys; do
                   val=$(kubectl -n ${K8S_NAMESPACE} get secret "$SECRET_NAME" -o "jsonpath={.data.${k}}" 2>/dev/null || true)
                   if [ -n "$val" ]; then
                     # decode and append
                     echo "${k}=$(echo $val | base64 -d)" >> "$OUT"
                   fi
                 done

                 echo "Wrote backend secret partial to $OUT (if any keys found)"
               '''
           }
        }
      }
    }

    stage('Setup Docker Config Secret') {
      steps {
        container('kubectl') {
          withCredentials([usernamePassword(credentialsId: 'docker-ardian-read-write',
                                            usernameVariable: 'DOCKER_USER',
                                            passwordVariable: 'DOCKER_PASS')]) {
            withKubeConfig([credentialsId: env.KUBECONFIG_CRED]) {
              sh '''
                set -e

                AUTH=$(echo -n "$DOCKER_USER:$DOCKER_PASS" | base64 | tr -d '\\n')

                cat > config.json <<EOF
                {
                  "auths": {
                    "https://index.docker.io/v1/": {
                      "auth": "$AUTH"
                    }
                  }
                }
                EOF

                kubectl -n jenkins delete secret docker-config --ignore-not-found
                kubectl -n jenkins create secret generic docker-config \
                  --from-file=config.json=./config.json
              '''
            }
          }
        }
      }
    }

    stage('Build & Push Image with BuildKit') {
      steps {
        container('buildkit') {
          sh '''
            ls -la ${WORKSPACE}

            buildctl-daemonless.sh build \
              --frontend dockerfile.v0 \
              --local context=${WORKSPACE} \
              --local dockerfile=${WORKSPACE} \
              --output type=image,name=${IMAGE}:${BUILD_ID},push=true \
              --output type=image,name=${IMAGE}:latest,push=true \
              --opt build-arg:CI=false
          '''
        }
      }
    }

    stage('Update Kubernetes Manifests') {
      steps {
        sh '''
          sed -i "s|docker.io/ardianhermawan17/backend-radiodiagnosis:latest|${IMAGE}:${BUILD_ID}|g" config/k8s/statefulset-backend-radiodiagnosis-k8s.yaml
        '''
      }
    }

    stage('Deploy to RKE2') {
      steps {
        container('kubectl') {
          withKubeConfig([credentialsId: env.KUBECONFIG_CRED]) {
            sh '''
                   set -eu
                   # Replace BUILD_ID_PLACEHOLDER with build id in template labels (unquoted numeric is fine)
                   sed -i "s|BUILD_ID_PLACEHOLDER|${BUILD_ID}|g" config/k8s/statefulset-backend-radiodiagnosis-k8s.yaml || true

                   # Make sure image is replaced in manifest (defensive)
                   sed -i "s|docker.io/ardianhermawan17/backend-radiodiagnosis:latest|${IMAGE}:${BUILD_ID}|g" config/k8s/statefulset-backend-radiodiagnosis-k8s.yaml || true

                   # Apply and capture applied names (safe deletion later)
                   kubectl apply -n ${K8S_NAMESPACE} -f config/k8s/statefulset-backend-radiodiagnosis-k8s.yaml -o name > ${WORKSPACE}/applied.txt
                   echo "Applied:"
                   cat ${WORKSPACE}/applied.txt || true
                '''
          }
        }
      }
    }

    stage('Apply Ingress') {
      steps {
      container('kubectl') {
        withKubeConfig([credentialsId: env.KUBECONFIG_CRED]) {
            sh '''
                  set -eu
                  kubectl apply -n ${K8S_NAMESPACE} -f config/k8s/ingress-backend-radiodiagnosis-k8s.yaml || true
                '''
          }
        }
      }
    }

    stage('Verify Deployment') {
      steps {
        container('kubectl') {
          withKubeConfig([credentialsId: env.KUBECONFIG_CRED]) {
            sh '''
                 set -eu

                # Wait for the statefulset rollout to finish (300s) and condition available. If it fails/times-out, dump some helpful info.
                echo "Waiting for statefulset/${DEPLOYMENT_NAME} rollout status..."
                if ! kubectl -n ${K8S_NAMESPACE} rollout status statefulset/${DEPLOYMENT_NAME} --for=condition=available --timeout=600s; then
                  echo "Rollout status timed out or failed. Dumping statefulset and pod info for debugging:"
                  kubectl -n ${K8S_NAMESPACE} describe statefulset ${DEPLOYMENT_NAME} || true
                  kubectl -n ${K8S_NAMESPACE} get pods -l app=${LABEL_APP} -o wide || true
                  kubectl -n ${K8S_NAMESPACE} logs -l app=${LABEL_APP} --tail=100 || true
                  # Fail the step so pipeline goes to post/failure
                  exit 1
                fi

                # If rollout succeeded, show pods
                kubectl -n ${K8S_NAMESPACE} get pods -l app=${LABEL_APP} -o wide
                '''
          }
        }
      }
    }
  }

  post {
    success {
      echo 'Pipeline succeeded! Deployment completed.'
    }
    failure {
            echo 'Pipeline failed! Attempting safe rollback/cleanup...'
            container('kubectl') {
              withKubeConfig([credentialsId: env.KUBECONFIG_CRED]) {
                sh '''
                  set -eu
                  APPLIED_FILE=${WORKSPACE}/applied.txt

                  echo "Checking for existing statefulset ${DEPLOYMENT_NAME}..."
                  if kubectl -n ${K8S_NAMESPACE} get statefulset ${DEPLOYMENT_NAME} >/dev/null 2>&1; then
                    echo "Attempting rollout undo for statefulset ${DEPLOYMENT_NAME} (if supported)..."
                    # rollback for statefulset may be not supported in older k8s versions; ignore if it fails
                    kubectl -n ${K8S_NAMESPACE} rollout undo statefulset/${DEPLOYMENT_NAME} || echo "rollout undo ok/ignored"
                  else
                    echo "StatefulSet ${DEPLOYMENT_NAME} does not exist (nothing to rollback)"
                  fi

                  # If we have applied.txt, delete only those exact resource names (safe)
                  if [ -f "$APPLIED_FILE" ]; then
                    echo "Deleting applied resources listed in $APPLIED_FILE"
                    while IFS= read -r r || [ -n "$r" ]; do
                      [ -z "$r" ] && continue
                      echo "Deleting resource: $r"
                      kubectl -n ${K8S_NAMESPACE} delete "$r" --ignore-not-found || echo "delete $r failed (ignored)"
                    done < "$APPLIED_FILE"
                  else
                    echo "No applied.txt found; skipping exact-delete step."
                  fi

                  echo "Final check: statefulsets in namespace:"
                  kubectl -n ${K8S_NAMESPACE} get statefulsets -o wide || true
                '''
              }
            }
        }
    always {
      echo 'Pipeline execution completed.'
      cleanWs()
    }
  }
}
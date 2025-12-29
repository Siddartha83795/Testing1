pipeline {
    agent any

    triggers {
        githubPush()
    }

    environment {
        DOCKER_IMAGE = 'siddhartha005/testing1'
        DOCKER_TAG   = 'latest'
        DOCKER_CREDS = 'dockerhub-creds'

        CONTAINER_NAME = 'testing1-app'
        APP_PORT = '3000'

        ENV_FILE = '/opt/app/envs/backend.prod.env'
        DOCKER_NETWORK = 'app-network'
        MONGO_CONTAINER = 'mongodb'
    }

    stages {

        stage('Identity Check') {
            steps {
                sh '''
                    echo "===================================="
                    echo " Running Jenkins Backend Pipeline"
                    echo " ENV FILE: ${ENV_FILE}"
                    echo " IMAGE: ${DOCKER_IMAGE}:${DOCKER_TAG}"
                    echo "===================================="
                '''
            }
        }

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                    docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} .
                '''
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: DOCKER_CREDS,
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh '''
                        docker logout || true
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                    '''
                }
            }
        }

        stage('Push Image to Docker Hub') {
            steps {
                sh '''
                    docker push ${DOCKER_IMAGE}:${DOCKER_TAG}
                '''
            }
        }

        stage('Deploy Backend (Safe)') {
            steps {
                sh '''
                    echo "---- Ensuring Docker network ----"
                    docker network inspect ${DOCKER_NETWORK} >/dev/null 2>&1 || \
                    docker network create ${DOCKER_NETWORK}

                    echo "---- Ensuring MongoDB container ----"
                    docker ps | grep ${MONGO_CONTAINER} || \
                    docker run -d \
                      --name ${MONGO_CONTAINER} \
                      --network ${DOCKER_NETWORK} \
                      -p 27017:27017 \
                      --restart unless-stopped \
                      mongo:6

                    echo "---- Redeploying Backend ----"
                    docker stop ${CONTAINER_NAME} || true
                    docker rm ${CONTAINER_NAME} || true

                    docker run -d \
                      --name ${CONTAINER_NAME} \
                      --env-file ${ENV_FILE} \
                      --network ${DOCKER_NETWORK} \
                      -p ${APP_PORT}:${APP_PORT} \
                      --restart unless-stopped \
                      ${DOCKER_IMAGE}:${DOCKER_TAG}
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                    sleep 8
                    curl -f http://localhost:${APP_PORT}/api/health
                '''
            }
        }
    }

    post {
        success {
            echo '🎉 Backend deployment successful!'
        }
        failure {
            echo '❌ Backend deployment failed!'
        }
        always {
            sh 'docker image prune -f || true'
        }
    }
}

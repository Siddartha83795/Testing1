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
        APP_PORT = '5000'

        ENV_FILE = '/opt/app/envs/backend.prod.env'
    }

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: DOCKER_CREDS,
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        docker logout || true
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                    '''
                }
            }
        }

        stage('Push Image to Docker Hub') {
            steps {
                sh "docker push ${DOCKER_IMAGE}:${DOCKER_TAG}"
            }
        }

        stage('Deploy Container on EC2') {
            steps {
                sh '''
                    docker stop ${CONTAINER_NAME} || true
                    docker rm ${CONTAINER_NAME} || true

                    docker run -d \
                      --name ${CONTAINER_NAME} \
                      --env-file ${ENV_FILE} \
                      -p ${APP_PORT}:${APP_PORT} \
                      --restart unless-stopped \
                      ${DOCKER_IMAGE}:${DOCKER_TAG}
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                    sleep 5
                    curl -f http://localhost:${APP_PORT} || exit 1
                '''
            }
        }
    }

    post {
        success {
            echo '🎉 Deployment successful!'
        }
        failure {
            echo '❌ Deployment failed!'
        }
        always {
            sh 'docker system prune -f || true'
        }
    }
}

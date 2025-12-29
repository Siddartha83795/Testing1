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

        ENV_FILE = '/home/ubuntu/envs/backend.prod.env'
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
            docker stop testing1-app || true
            docker rm testing1-app || true

            docker run -d \
              --name testing1-app \
              --env-file /home/ubuntu/envs/backend.prod.env \
              -p 5000:5000 \
              --restart unless-stopped \
              siddhartha005/testing1:latest
        '''
    }
}


        stage('Verify Deployment') {
            steps {
                sh '''
                    sleep 5
                    curl -f http://localhost:5000 || exit 1
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

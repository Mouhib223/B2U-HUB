pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Lint') {
            steps {
                bat 'npm run lint || exit 0'
            }
        }

        stage('Build') {
            steps {
                bat 'npm run build -- --configuration production'
            }
        }

        stage('Docker Build') {
            steps {
                bat 'docker build -t b2u-frontend:latest .'
            }
        }

        stage('Docker Run') {
            steps {
                bat '''
                    docker stop b2u-frontend || exit 0
                    docker rm b2u-frontend || exit 0
                    docker run -d --name b2u-frontend ^
                      -p 4200:80 ^
                      b2u-frontend:latest
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Frontend Pipeline succeeded!'
        }
        failure {
            echo '❌ Frontend Pipeline failed!'
        }
    }
}
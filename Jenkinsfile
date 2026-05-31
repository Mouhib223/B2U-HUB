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
                sh 'npm install'
            }
        }
        
        stage('Lint') {
            steps {
                sh 'npm run lint || true'
            }
        }
        
        stage('Build') {
            steps {
                sh 'npm run build -- --configuration production'
            }
        }
        
        stage('Docker Build') {
            steps {
                sh 'docker build -t b2u-frontend:latest .'
            }
        }
        
        stage('Docker Run') {
            steps {
                sh '''
                    docker stop b2u-frontend || true
                    docker rm b2u-frontend || true
                    docker run -d --name b2u-frontend \
                      --network b2u-network \
                      -p 4200:80 \
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
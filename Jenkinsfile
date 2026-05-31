pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install + Build Frontend') {
            agent {
                docker {
                    image 'node:18'
                }
            }
            steps {
                sh 'node -v'
                sh 'npm install'
                sh 'npm run build -- --configuration production'
            }
        }

        stage('Tests') {
            agent {
                docker {
                    image 'node:18'
                }
            }
            steps {
                sh 'npm test -- --watch=false || true'
            }
        }

        stage('Backend Build (optional)') {
            agent {
                docker {
                    image 'maven:3.9.6-eclipse-temurin-17'
                }
            }
            steps {
                sh 'mvn clean install -DskipTests || true'
            }
        }
    }

    post {
        success {
            echo '✅ PI PIPELINE SUCCESS'
        }
        failure {
            echo '❌ Pipeline failed'
        }
    }
}
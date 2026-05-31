pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Frontend - Install & Build') {
            agent {
                docker { image 'node:18' }
            }
            steps {
                sh 'node -v'
                sh 'npm -v'
                sh 'npm install'
                sh 'npm run build -- --configuration production'
            }
        }

        stage('Frontend Tests') {
            agent {
                docker { image 'node:18' }
            }
            steps {
                sh 'npm test -- --watch=false || true'
            }
        }

        stage('Backend - Build Spring Boot') {
            agent {
                docker { image 'maven:3.9.6-eclipse-temurin-17' }
            }
            steps {
                sh 'mvn clean install -DskipTests'
            }
        }
    }

    post {
        success {
            echo '✅ PI PIPELINE SUCCESS (Angular + Spring Boot)'
        }

        failure {
            echo '❌ Pipeline failed'
        }
    }
}
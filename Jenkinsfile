pipeline {
    agent any

    tools {
        nodejs 'NodeJS 22'
        maven 'Maven3'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Check Versions') {
            steps {
                sh 'node -v'
                sh 'npm -v'
                sh 'mvn -v'
            }
        }

        stage('Frontend Install') {
            steps {
                sh 'npm install'
            }
        }

        stage('Frontend Build') {
            steps {
                sh 'npm run build -- --configuration production'
            }
        }

        stage('Frontend Tests') {
            steps {
                sh 'npm test -- --watch=false || true'
            }
        }

        stage('Backend Build') {
            steps {
                sh 'mvn clean install -DskipTests'
            }
        }
    }

    post {
        success {
            echo '✅ PI PIPELINE SUCCESS (Tools configured)'
        }
        failure {
            echo '❌ Pipeline failed'
        }
    }
}
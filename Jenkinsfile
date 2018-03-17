pipeline {
    agent any

    stages {
        stage('Unit/Integration Test') {
            steps {
                checkout scm
                sh 'make test'
            }
        }
        stage('Acceptance Test') {
            steps {
                sh 'make release..'
            }
        }
        stage('Tag and Publish Image') {
            steps {
                sh 'make latest \$(git rev-parse --short HEAD)'
            }
        }
    }

    post {
        always{
            stage('Clean up'){
                sh 'make clean'
            }
        }
    }
}

node {
    checkout scm
    try {
        ansiColor('xterm') {
            stage('Unit/Integration Test'){
                sh 'make test'
            }
            stage('Acceptance Test'){
                sh 'make release'
            }
            stage ('Tag and Publish Image'){
                sh 'make latest \$(git rev-parse --short HEAD)'
                withEnv("[DOCKER_USER=${DOCKER_USER}]",
                "DOCKER_PASSWORD=${DOCKER_PASSWORD}"){
                    sh "make login"
                }
                sh 'make publish'

            }
        }

    }
    finally {
        stage 'Clean up'
        ansiColor('xterm') {
            sh 'make clean'
        }
        stage 'Collect Test Report'
        step([$class: 'JUnitResultArchiver', testResults: '**/reports/*.xml'])
    }
}

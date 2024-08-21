pipeline {
    agent any

    environment {
        DOCKER_IMAGE_NAME = 'aymenktari01/mobicrowd_repo'
        DockerRepo_Credentials = credentials('DockerRepo')
    }
    parameters {
        booleanParam(name: 'executeTests', defaultValue: true, description: 'This parameter decides whether the tests will be executed or not.')
    }
    stages {
        stage('Checkout SCM') {
            steps {
                checkout scm
            }
        }

        stage('Main build') {
            agent {
                docker {
                    image 'node:14'
                    args '-v /var/jenkins_home/.npm:/root/.npm' // Persist npm cache across builds
                }
            }
            steps {
                // Install Node.js, Angular CLI, and project dependencies
                sh '''
                    node --version
                    npm install -g @angular/cli
                    npm install
                '''
                
                // Build the Angular project
                sh 'ng build --prod'
            }
        }

        stage('Test') {
            when {
                expression {
                    params.executeTests
                }
            }
            steps {
                echo 'Running tests...'
                sh 'ng test --watch=false'
            }
        }

        stage('Build and push Docker Image') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'DockerRepo', passwordVariable: 'PASS', usernameVariable: 'USER')]) {
                        sh "docker build -t ${env.DOCKER_IMAGE_NAME}:1.0 ."
                        sh "echo $PASS | docker login -u $USER --password-stdin"
                        sh "docker push ${env.DOCKER_IMAGE_NAME}:1.0"
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying the application...'
                // Add your deployment steps here
            }
        }
    }

    post {
        always {
            echo 'This will always run'
        }
        success {
            echo 'This will run only if the pipeline succeeds'
        }
        failure {
            echo 'This will run only if the pipeline fails'
        }
    }
}

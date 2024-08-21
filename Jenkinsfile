pipeline {
    agent any

    environment {
        NODE_VERSION = '14'
        DOCKER_IMAGE_NAME = 'aymenktari01/mobicrowd_repo'
        DOCKER_REGISTRY_URL = 'https://index.docker.io/v1/'
        DockerRepo_Credentials=credentials('DockerRepo')
    }
    parameters{
        booleanParam(name: 'executeTests' , defaultValue: true , description: 'this parameter decides wether the tests will be executed or not ' ) 
    }
    stages {

        stage('Install Dependencies') {
            steps {
                // Install Node.js and npm if necessary
                sh "nvm install ${NODE_VERSION}"
                sh "nvm use ${NODE_VERSION}"
                
                // Install Angular CLI and project dependencies
                sh 'npm install -g @angular/cli'
                sh 'npm install'
            }
        }

        stage('Build') {
            steps {
                echo " Building ... "
            }
        }



        stage('Test') {
            when {
                expression {
                    params.executeTests
                }
            }
            steps {
                echo " Building ... "
            }
        }

        

        stage('Deploy') {

            steps {

                echo " Deploying ...  " 
            }
        }



        stage('Build Docker Image') {
            steps {
                script {
                    // Build the Docker image
                    docker.build("${env.DOCKER_IMAGE_NAME}:1.0")
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    // Log in to Docker registry and push the Docker image
                    docker.withRegistry('https://index.docker.io/v1/', "${env.DockerRepo_Credentials}") {
                        docker.image("${env.DOCKER_IMAGE_NAME}:1.0").push('1.0')
                    }
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

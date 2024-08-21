pipeline {
    agent {
        docker {
            image 'node:latest' 
            args '-v /var/jenkins_home/.npm:/root/.npm' // Persist npm cache across builds
        }
    }

    environment {
        DOCKER_IMAGE_NAME = 'aymenktari01/mobicrowd_repo'
        DockerRepo_Credentials=credentials('DockerRepo')
    }
    parameters{
        booleanParam(name: 'executeTests' , defaultValue: true , description: 'this parameter decides wether the tests will be executed or not ' ) 
    }
    stages {

        stage('Install Dependencies') {
            steps {
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

        stage('Build and push Docker Image') {
            steps {
                withCredentials([usernamePassword(credentialsId:'DockerRepo', passwordVariable:'PASS' , usernameVariable:'USER')]) {
                sh "docker build -t ${env.DOCKER_IMAGE_NAME}:1.0"
                sh "echo $PASS | docker login -u $USER --password-stdin "
                sh "docker push ${env.DOCKER_IMAGE_NAME}:1.0"
                }
            }
        }



        stage('Test') {
            when {
                expression {
                    params.executeTests
                }
            }
            steps {
                echo " Testing ... "
            }
        }

        

        stage('Deploy') {

            steps {

                echo " Deploying ...  " 
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

pipeline {
    agent any

    tools {
        nodejs "NODEJS" // Replace "NODEJS" with the name of your configured Node.js installation
    }

    environment {
        DOCKER_IMAGE_NAME = 'aymenktari01/mobicrowd_repo'
        DockerRepo_Credentials = credentials('DockerRepo')
    }
    
    parameters {
        booleanParam(name: 'executeTests', defaultValue: true, description: 'this parameter decides whether the tests will be executed or not')
    }
    
    stages {

        stage('Install Dependencies') {
            steps {
                sh 'npm install -g @angular/cli'
                sh 'npm install'
            }
        }

        stage('Build') {
            steps {
                echo "Building..."
                sh 'npm run build'
            }
        }

        stage('Build and push Docker Image') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'DockerRepo', passwordVariable: 'PASS', usernameVariable: 'USER')]) {
                    sh "docker build -t ${env.DOCKER_IMAGE_NAME}:1.0 ."
                    sh "echo $PASS | docker login -u $USER --password-stdin"
                    sh "docker push ${env.DOCKER_IMAGE_NAME}:1.0"
                }
            }
        }

        stage('Test') {
            when {
                expression { params.executeTests }
            }
            steps {
                echo "Testing..."
                sh 'npm test'
            }
        }

        stage('Deploy') {
            steps {
                echo "Deploying..."
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

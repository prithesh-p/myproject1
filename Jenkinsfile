pipeline {
    agent any
    
    tools {
        maven 'M3'
        jdk 'jdk11'
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', 
                url: 'https://github.com/prithesh-p/myproject1.git'
            }
        }
        
        stage('Build') {
            steps {
                sh 'mvn clean package'
            }
        }
        
        stage('Docker Build') {
            steps {
                script {
                    docker.build("foodapp:${env.BUILD_NUMBER}")
                }
            }
        }
        
        stage('Deploy') {
            steps {
                sh 'docker stop foodapp || true'
                sh 'docker rm foodapp || true'
                sh "docker run -d -p 8080:8080 --name foodapp foodapp:${env.BUILD_NUMBER}"
            }
        }
    }
}

pipeline {
    agent any

    environment {
        AWS_ACCOUNT_ID = '982005835062'
        AWS_REGION = 'ap-south-1'
        ECR_REGISTRY = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        CLUSTER_NAME = 'ecommerce-cluster'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code...'
                checkout scm
            }
        }

        stage('Build Docker Images') {
            steps {
                sh 'docker build -t products-service:${BUILD_NUMBER} ./products-service'
                sh 'docker build -t orders-service:${BUILD_NUMBER} ./orders-service'
                sh 'docker build -t api-gateway:${BUILD_NUMBER} ./api-gateway'
            }
        }

        stage('Push to ECR') {
            steps {
                withCredentials([
                    string(credentialsId: 'AWS_ACCESS_KEY_ID', variable: 'AWS_KEY'),
                    string(credentialsId: 'AWS_SECRET_ACCESS_KEY', variable: 'AWS_SECRET')
                ]) {
                    sh '''
                        export AWS_ACCESS_KEY_ID=$AWS_KEY
                        export AWS_SECRET_ACCESS_KEY=$AWS_SECRET
                        aws ecr get-login-password --region $AWS_REGION | \
                        docker login --username AWS --password-stdin $ECR_REGISTRY
                        docker tag products-service:${BUILD_NUMBER} $ECR_REGISTRY/products-service:${BUILD_NUMBER}
                        docker tag orders-service:${BUILD_NUMBER} $ECR_REGISTRY/orders-service:${BUILD_NUMBER}
                        docker tag api-gateway:${BUILD_NUMBER} $ECR_REGISTRY/api-gateway:${BUILD_NUMBER}
                        docker push $ECR_REGISTRY/products-service:${BUILD_NUMBER}
                        docker push $ECR_REGISTRY/orders-service:${BUILD_NUMBER}
                        docker push $ECR_REGISTRY/api-gateway:${BUILD_NUMBER}
                    '''
                }
            }
        }

        stage('Deploy to EKS') {
            steps {
                withCredentials([
                    string(credentialsId: 'AWS_ACCESS_KEY_ID', variable: 'AWS_KEY'),
                    string(credentialsId: 'AWS_SECRET_ACCESS_KEY', variable: 'AWS_SECRET')
                ]) {
                    sh '''
                        export AWS_ACCESS_KEY_ID=$AWS_KEY
                        export AWS_SECRET_ACCESS_KEY=$AWS_SECRET
                        aws eks update-kubeconfig --name $CLUSTER_NAME --region $AWS_REGION
                        kubectl set image deployment/products-service products-service=$ECR_REGISTRY/products-service:${BUILD_NUMBER}
                        kubectl set image deployment/orders-service orders-service=$ECR_REGISTRY/orders-service:${BUILD_NUMBER}
                        kubectl set image deployment/api-gateway api-gateway=$ECR_REGISTRY/api-gateway:${BUILD_NUMBER}
                        kubectl rollout status deployment/products-service
                        kubectl rollout status deployment/orders-service
                        kubectl rollout status deployment/api-gateway
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'Deployed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}

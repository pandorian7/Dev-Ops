pipeline {
    agent none

    stages {

        stage('Provision EC2') {
            agent { label 'built-in' }
            steps {
                dir('/home/jenkins/tf-ec2') {
                    sh 'terraform apply -auto-approve'
                }
            }
        }

        stage('Wait for node') {
            agent { label 'built-in' }
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    waitUntil {
                        script {
                            def node = Jenkins.instance.getNode('docker-builder')
                            node.toComputer()?.isOnline() == true
                        }
                    }
                }
            }
        }

        
        stage('Clone Repository') {
            agent { label 'docker-builder' }
            steps {
                git branch: 'main',
                    url: 'https://github.com/pandorian7/dev-Ops.git'
            }
        }

        stage('Build FrontEnd') {
            agent { label 'docker-builder' }
            steps {
                sh 'docker build -t pandorian7/devops-fe:latest ./frontend'
            }
        }
        
        stage('Build BackEnd') {
            agent { label 'docker-builder' }
            steps {
                sh 'docker build -t pandorian7/devops-be:latest ./backend'
            }
        }
                
        stage('Docker Login') {
            agent { label 'docker-builder' }
            environment {
                DOCKER_PASSWORD = credentials('docker-secret')
            }
            steps {
                sh 'echo $DOCKER_PASSWORD | docker login -u pandorian7 --password-stdin'
            }
        }
        
        stage('Push FrontEnd Image') {
            agent { label 'docker-builder' }
            steps {
                sh 'docker push pandorian7/devops-fe:latest'
            }
        }
        
        stage('Push BackEnd Image') {
            agent { label 'docker-builder' }
            steps {
                sh 'docker push pandorian7/devops-be:latest'
            }
        }
        
        stage('Docker Logout') {
            agent { label 'docker-builder' }
            steps {
                sh 'docker logout'
            }
        }

        stage('Destroying EC2') {
            agent { label 'built-in' }
            steps {
                dir('/home/jenkins/tf-ec2') {
                    sh 'terraform destroy -auto-approve'
                }
            }
        }
        stage('Deploy Containers') {
            agent { label 'built-in' }
            steps {
                sh '''
                  /home/jenkins/ansible/venv/bin/ansible-playbook \
                    -i /home/jenkins/ansible/inventory \
                    /home/jenkins/ansible/redeploy.yml
                '''
            }
        }

    }
}

#!/usr/bin/env groovy

node {
    environment {
        DOCKERHUB_CREDENTIALS=credentials('snackk_docker')
    }

    stage('checkout') {
        checkout scm
    }

    stage('Getting Database Credentials') {
        withCredentials([usernamePassword(credentialsId: 'snackk_docker', passwordVariable: 'dockerhub_pwd', usernameVariable: 'dockerhub_usr')])
                {
                    creds = "\nUsername: ${dockerhub_pwd}\nPassword: ${dockerhub_usr}\n"
                }
        println creds
        sh "echo $dockerhub_pwd | docker login -u $dockerhub_usr --password-stdin"
    }

    stage('check java') {
        sh "java -version"
    }

    stage('clean') {
        sh "chmod +x mvnw"
        sh "./mvnw -ntp clean -P-webapp"
    }
    stage('nohttp') {
        sh "./mvnw -ntp checkstyle:check"
    }

    stage('install tools') {
        sh "./mvnw -ntp com.github.eirslett:frontend-maven-plugin:install-node-and-npm@install-node-and-npm"
    }

    stage('npm install') {
        sh "./mvnw -ntp com.github.eirslett:frontend-maven-plugin:npm"
    }

    stage('packaging') {
        sh "./mvnw -ntp verify -P-webapp -Pprod -DskipTests"
        archiveArtifacts artifacts: '**/target/*.jar', fingerprint: true
    }

    def dockerImage
    stage('publish docker') {
        // A pre-requisite to this step is to setup authentication to the docker registry
        // https://github.com/GoogleContainerTools/jib/tree/master/jib-maven-plugin#authentication-methods
        sh "./mvnw -ntp -Pprod jib:build"
    }
}

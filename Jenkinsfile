pipeline {
  agent {
    docker {
      image 'node:8.11.1'
    }
  }
  environment {
    CI = 'true'
  }
  stages {
    stage('Prepare') {
      environment {
        YARN_VERSION = '1.6.0'
        NPM_CONFIG_LOGLEVEL = 'warn'
      }
      steps {
        sh "npm install -g yarn@${env.YARN_VERSION}"
        sh 'yarn --offline'
      }
    }

    stage('QA') {
      parallel {
        stage('Lint') {
          steps {
            sh 'npm run style'
          }
        }
        stage('Test') {
          steps {
            sh 'npm run unit'
          }
        }
      }
    }

    stage('Build') {
      parallel {
        stage('Build Docs') {
          steps {
            sh 'npm run docs'
          }
        }
        stage('Build JS') {
          steps {
            sh 'npm run build'
          }
        }
      }
    }
  }
}

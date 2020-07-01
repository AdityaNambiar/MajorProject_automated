const config = require("config");
const jenkins_username = config.get("jenkins_username");
const jenkins_api_token = config.get("jenkins_api_token");
const jenkins_hostport = config.get("jenkins_hostport")
const jenkins_url = `http://${jenkins_username}:${jenkins_api_token}@${jenkins_hostport}`;
const jenkins = require('jenkins-api').init(jenkins_url);

module.exports = { 
    jenkins: jenkins,
    jenkins_url: jenkins_url
}
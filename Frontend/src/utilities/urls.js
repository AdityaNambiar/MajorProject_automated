
let buildserver = "http://localhost:5003";
const urls = {
  buildserver,
  getDeployUrl:`${buildserver}/getDeployUrl`,
  integrate:`${buildserver}/integrate`,
  deployDirectly:`${buildserver}/deployDirectly`,
  deploy:`${buildserver}/deploy`
};

export default urls;

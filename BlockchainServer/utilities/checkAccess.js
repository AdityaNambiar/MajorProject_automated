let readops = [
    'GETFILES',
    "GETFILESTREE",
    'READFILE',
    'GITGRAPH',
    'FILECOMMITHISTORY',
    "BRANCHCOMMITHISTORY",
    "DOWNLOADREPO",
    "GETBRANCHES",
    "CHECKOUTBRANCH",
    "DIFFFORCOMMIT",
    "GETMERGEOBJ",
    "DOWNLOADFORCLI",
    'PULL',
    'FETCH',
    'CLONE',
    "READMERGEFILES"
]
function checkCollaborator(collaborator){
    if(collaborator==true){
        return true;
    }else{
        return false;
    }
}

function checkAccess(operation,accessobg){

    let collaborator = accessobg.collaborator;
    let private = accessobg.private;
    let ops = readops.includes(operation.toUpperCase()); 
    if(private==true){
           return checkCollaborator(collaborator);
    }else if(private==false){

        if(ops){
            return true;
        }else{
            return checkCollaborator(collaborator);
        }
        
    }



}
module.exports.checkAccess = checkAccess;
module.exports.readops = readops
//projectmajorHASH
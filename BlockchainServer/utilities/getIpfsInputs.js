const getIpfsInputs = (operation,accessobj,reqbody)=>{
    let project = accessobj.project;
    let input={
        projName:project.name,
        username:project.authorName,
        majorHash:project.hash,
        authorname:project.authorName,
        authoremail:project.authorEmail,
        
        branchToUpdate:reqbody.branchToUpdate //Send from FrontEnd
    }
    switch(operation){
        case "GETFILES": return input;
        case "ADDBRANCH": input["branchName"] = reqbody.branchName;
                            return input;
        case "BRANCHCOMMITHISTORY":return input;
        case "COMMITFILE":
                input["filebuff"] = reqbody.filebuff;
                input["filename"] = reqbody.filename;
                input["usermsg"] = reqbody.usermsg;
                return input;
        case "DELETEBRANCH":input["branchName"] = reqbody.branchName;
                        return input;
        case "DIFFFILES":
                input["ref1"] = reqbody.ref1;
                input["ref2"] = reqbody.ref2;
                return input;
        case "DOWNLOADREPO" :return input;
        case "FILECOMMITHISTORY":input["filename"] = reqbody.filename;return input;
        case "GETBRANCHES": return input;
        case "GITGRAPH":return input;
        case "MERGEFILES":input["branchName"] = reqbody.branchName;return input;
        case "PUSHCHECKER" : input["branchName"] = reqbody.branchName;return input;
        case "READFILE" : input["filename"] = reqbody.filename;return input;
        case "CHECKOUTBRANCH":return input;
        case "DELETEFILE": input["filename"] = reqbody.filename;return input;
        case "DELETEPROJ":return input;
        case "DIFFFORCOMMIT":input["ref1"] = reqbody.ref1;return input;
        case "FIXCONSISTENCY":return input
        case "MERGEBRANCH":input["branchName"] = reqbody.branchName;return input;
        case "GETMERGEOBJ":return input;
        case "READMERGEFILES":input["mergeobj"] = reqbody.mergeobj;return input;
        case "DOWNLOADFORCLI":input["mergeid"] = reqbody.mergeid;return input;
        case "MERGECOMMIT":input["mergeobj"] = reqbody.mergeobj;
                            input["filebuffobj"] = reqbody.filebuffobj;
                            input["usermsg"] = reqbody.usermsg
                            return input;
        case "GETFILESTREE": input["foldername"]= reqbody.foldername; return input;                    
        

    }
}
 
module.exports = getIpfsInputs;

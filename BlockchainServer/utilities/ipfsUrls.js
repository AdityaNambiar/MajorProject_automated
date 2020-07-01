let uiUrl = "http://localhost:5000";

let urls = {
   
    "ADDBRANCH":`${uiUrl}/addBranch`,
    "BRANCHCOMMITHISTORY":`${uiUrl}/branchCommitHistory`,
    "COMMITFILE":  `${uiUrl}/commitFile`,
    "DELETEBRANCH":`${uiUrl}/deleteBranch`,
    "DIFFFILES":`${uiUrl}/diffFiles`,
    "DOWNLOADREPO":`${uiUrl}/downloadRepo`,
    "FILECOMMITHISTORY":`${uiUrl}/fileCommitHistory`,
    "GETBRANCHES":`${uiUrl}/getBranches`,
    "GETFILES":`${uiUrl}/getFiles`,
    "GITGRAPH":`${uiUrl}/gitGraph`,
    "INITPROJ":`${uiUrl}/initProj`,
    "MERGEFILES":`${uiUrl}/mergeFiles`,
    "PUSHCHECKER":`${uiUrl}/pushChecker`,
    "READFILE":`${uiUrl}/readFile`,

    "CHECKOUTBRANCH":`${uiUrl}/checkoutBranch`,
    "DELETEFILE":`${uiUrl}/deleteFile`,
    "DELETEPROJ":`${uiUrl}/deleteProj`,
    "DIFFFORCOMMIT":`${uiUrl}/diffForCommit`,
    "FIXCONSISTENCY":`${uiUrl}/fixConsistency`,
    "MERGEBRANCH":`${uiUrl}/mergeBranch`,
    "GETMERGEOBJ":`${uiUrl}/getMergeObj`,
    "READMERGEFILES":`${uiUrl}/readMergeFiles`,
    "DOWNLOADFORCLI":`${uiUrl}/downloadForCLI`,
    "MERGECOMMIT":`${uiUrl}/mergeCommit`,
    "GETFILESTREE":`${uiUrl}/getFilesTree`
    



}
module.exports = urls;
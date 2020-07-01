function errorHandling(res,error){
    if(error.response){
        return res.status(400).send(JSON.stringify(error.response.data))
    }else if(error.request){
        return res.status(400).send(JSON.stringify(error.request))
    }else if(error.message){
        return res.status(400).send(JSON.stringify(error.message))
    }else{
        return res.status(400).send(error)
    }
    
}

module.exports = errorHandling;
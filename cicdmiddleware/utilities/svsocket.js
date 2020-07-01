

// module.exports = (getIoInstance)=>{
//    var io =  getIoInstance();
// io.on("connection",(socket)=>{
//     console.log("User Connected...");
    
// })
 

// }

const mysocket = class MySocket {

    static io;
    static setIo(io){
       
        io.on("connection",(socket)=>{
            console.log("User Connected...");
            this.io = socket
        })

    }
    static getIo(){
        return this.io
    }

}

module.exports = mysocket




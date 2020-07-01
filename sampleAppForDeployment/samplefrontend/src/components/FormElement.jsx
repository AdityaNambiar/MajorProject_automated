import React, { useState, useEffect }from 'react';

export default () => {
    const [data, updateData] = useState("Default value of data state variable."); 
    
    useEffect( () => {
        fetch('/hello', {
            method: 'GET'
        })
        .then(resp => resp.text())
        .then( resp => {
            updateData(resp);
        })
    }, [])
 
    function sendData() {
        
        console.log("data: ",data);
        fetch('/takeData', { 
                method: 'POST',
                headers: {
                    'Content-Type':'application/json'
                },
                body: JSON.stringify({ "msg":data }) 
            })
        .then(resp => resp.text())
        .then( (resp) => {
            updateData(resp);
        })
        .catch( (e) => {
            console.log(`error at useEffect:\n ${e}`);
        })
    }
    return(
        <div style={{
            borderColor: 'green',
            borderSize: '1em',
            borderStyle: 'groove',
            zoom:3
        }}>
            <form>
                <input type="text" name="txt1" onChange={(e)=>updateData(e.target.value)}/>
                <input type="button" name="btn1" value="Submit btn" onClick={sendData}/>
            </form>
        <div id="output">{data}</div>
        </div>
    );
}

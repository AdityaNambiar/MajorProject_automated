import React, { Component } from 'react';
// import {
//   Button, Container, Row, Col
// } from 'react-bootstrap';
import "react-step-progress-bar/styles.css";
import { ProgressBar, Step } from "react-step-progress-bar";
import { withRouter } from 'react-router-dom';
import jenkinsicon from '../../assets/deployment/jenkinsicon.png';
import dockericon from '../../assets/deployment/dockericon.webp';
import io from "socket.io-client"
import axios from "axios"
import urls from "../../utilities/urls"
import errorHandle from "../../hooks/errorHandling"
class Integration extends Component {

  onUnload = e => { // the method that will be used for both add and remove event
    e.preventDefault();
    e.returnValue = '';
 }
  
  constructor(props) {
    super(props);

    this.state = { 
      projName: this.props.location.state.projectid,
      branchName: this.props.location.state.branchOn,
      tagname: "",
      progressPercent: 0,
      postResp: '',
      urls: [],
      disablebtn:false,
      startbuildarea:false,
      getbuildarea:false,
      buildurlarea:false
    }
  }
 
  componentDidMount = () => {
    window.addEventListener("beforeunload", this.onUnload);
    const socket = io.connect(urls.buildserver);
    socket.on("message",(message)=>{
      let {postResp,progressPercent} = this.state;
        if(message.iomessage&&message.progress){
              postResp = postResp + message.iomessage +"\n";
              progressPercent = progressPercent + message.progress;
              this.setState({postResp:postResp,progressPercent:progressPercent}) 
        }else{
          postResp = postResp + message +"\n"
          this.setState({postResp:postResp})

        }
    })

  }
  componentWillUnmount = ()=>{
    window.removeEventListener("beforeunload", this.onUnload);
  }

  handleStartBuild = async ()=>{
    // if(this.state.tagname.trim()==""){
    //   return alert("Tagname cannot be empty")
    // }
    try{
        this.setState({disablebtn:true,startbuildarea:true,getbuildarea:false,postResp:"",progressPercent:0})
        const { projName, branchName,tagname } = this.state;
        let token = localStorage.getItem("x-auth-token")  
        await axios.post(urls.integrate,{projName,branchName},{
          headers:{
            'x-auth-token':token
          }
        })

        //Starting deployment

        axios.post(urls.deploy,{projName,branchName,tagName:tagname},{
             headers:{
                 'x-auth-token':token
                  }
              }).then(({data})=>{
                  this.setState({disablebtn:false,buildurlarea:true,urls:data.urls})
                          
                }).catch((error)=>{
                   errorHandle(error)
                this.setState({progressPercent:50,disablebtn:false,buildurlarea:false})
           })

    }catch(error){
      errorHandle(error);
      this.setState({disablebtn:false,buildurlarea:false,progressPercent:0})
    } 
    
  }

  getBuild = async ()=>{
    try{
      let {projName,branchName}= this.state;
    this.setState({disablebtn:true,startbuildarea:false,buildurlarea:false})
    const {data} = await axios.post(urls.getDeployUrl,{projName:projName,branchToUpdate:branchName});
        this.setState({disablebtn:false,urls:data.urls,getbuildarea:true})
    }catch(error){
      errorHandle(error)
      this.setState({disablebtn:false})
    }    
  }

  componentDidUpdate = ()=>{
    this.refs.logsref.scrollTop = this.refs.logsref.scrollHeight
  }

  render() {
  
    const { progressPercent, projName,disablebtn,startbuildarea,getbuildarea,buildurlarea,tagname } = this.state;
    return (
      <>
 
     <div className="container">
        <div style={{display:"flex",justifyContent:"flex-start"}}>
            <button className="btn btn-outline-primary btn-sm m-3" disabled={disablebtn} onClick={this.handleStartBuild}>Start Build</button>
            <button className="btn btn-outline-secondary btn-sm m-3" onClick={this.getBuild} disabled={disablebtn}>Existing Build</button>

        </div> 

        {/* <div class="modal fade" id="startbuild" tabindex="-1" role="dialog" aria-labelledby="startbuildLabel" aria-hidden="true">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="startbuildLabel">Enter Tag</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                <input type="text" value={tagname} className="form-control text-center" onChange={(e)=>this.setState({tagname:e.target.value})} required/>
                <label className="text-danger mt-2">Note: The tag should be same in your jenkins file</label>
              </div>
              <div class="modal-footer justify-content-center">
                <button type="button" class="btn btn-secondary" data-dismiss="modal" onClick={this.handleStartBuild}>Submit</button>
              </div>
            </div>
          </div>
        </div> */}
      <div 
        style={{display:`${startbuildarea==false?"none":"block"}`}}
      >
        <h2>{projName}</h2>
      
          <ProgressBar
            percent={progressPercent}
            filledBackground="linear-gradient(to right, #fefb72, #f0bb31)"
          >
            <Step transition="scale">
              {({ accomplished }) => (
                <img
                  style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` , borderRadius: '20%' , marginRight: '100%'}}
                  width="50"
                  alt=""
                  src={jenkinsicon}
                />
              )}
            </Step>
            <Step transition="scale">
              {({ accomplished }) => (
                <img
                  style={{ filter: `grayscale(${accomplished ? 0 : 100}%)`, marginLeft: '100%', borderRadius: '20%'}}
                  width="50"
                  alt=""
                  src={dockericon}
                />
              )}
            </Step>
          </ProgressBar>
          <hr className="mt-4"/>
          <textarea id="logarea" ref="logsref" value={this.state.postResp} rows="15" className="mt-3 p-5 w-100 bg bg-dark text-light" readOnly/>

          <div className="p-5 w-100 mt-3 bg bg-dark text-center text-light"
             style={{display: `${buildurlarea==false?"none":"block"}`}}
          >
          <span>Access your application here</span><br/>
          {
            this.state.urls.map(url => <a href={url.split("(")[0]} target="_blank" >{url}</a>)
          }
          </div>
      </div>
          <div className="p-5 w-100 mt-3 bg bg-dark text-center text-light" id="buildarea"
              style={{display:`${getbuildarea==false?"none":"block"}`}}
            >
                <span>Access your application here:</span><br/>
                {
                  this.state.urls.map(url => <a href={url.split("(")[0]} target="_blank" >{url}</a>)
                }
            </div>

     </div> 
    </> 
    );
  }
}

export default withRouter(Integration);
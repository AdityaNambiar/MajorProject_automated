import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import Modal from "../Utils/modal";
import Spinner from ".././Utils/spinner";
import NavBar from "./navbar";
import jwt from "jsonwebtoken"
const axios = require("axios")

const {networkname,url} = require("../utilities/config")
class Login extends Component {
  state = {
    loading: false,
    id: "cardUpload",
    fileName: "Choose File to Upload",
  };

  onFileUpload = (e) => {
    switch (e.target.name) {
      case "myfile":
        if (e.target.files.length > 0) {
          this.setState({ fileName: e.target.files[0].name });
        }
        break;
      default:
        this.setState({ [e.target.name]: e.target.value });
    }
  };

  handleLogin = async (e) => {
    e.preventDefault();
    if (this.state.fileName === "Choose File to Upload") {
      window.alert("Please upload a valid card first");
    } else {
      this.setState({ loading: true });
       
      const file =  e.target.myfile.files[0];
      const formData = new FormData();
      formData.append('card',file);
      const {data} = await axios.post(`${url}/bnUtil/login`,formData);
      let token = data.acessToken;
      this.setState({ loading: false });
      let pType = jwt.decode(token).pType
      if(pType=="Member"||pType=="ProjectManager"){
        window.localStorage.setItem("x-auth-token", token);
        this.props.history.replace("./dashboard",{"username":data.username.split(`@${networkname}`)[0]});
      }else{
        alert("Please Login as a Client");
        return this.props.history.replace("/home")
      }
     
    }
  };

  handleloginRegister = () => {
    this.props.history.push("./register");
  };
  render() {
    return (
      <div>
       
        <div className="container mt-4 pt-5 mb-5 pb-5">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="card">
                <div className="card-header bg bg-dark text-light font-weight-bold">
                  Login
                </div>
                <div className="card-body">
                  <form className="text-center" onSubmit={this.handleLogin}>
                    <div className="form-group m-5 p-b-2">
                      <div class="custom-file  col-md-8">
                        <input
                          type="file"
                          className="custom-file-input"
                          id="customFile"
                          name="myfile"
                          onChange={(event) => this.onFileUpload(event)}
                          required
                        />
                        <label
                          className="custom-file-label"
                          for="customFile"
                          required
                        >
                          {this.state.fileName}
                        </label>
                      </div>

                      <hr />
                      <small
                        id="emailHelp"
                        className="form-text text-muted m-2"
                      >
                        We'll never share your card with anyone else.
                      </small>
                      <button
                        type="submit"
                        id="modalButton"
                        className="btn btn-primary"
                        disabled={this.state.loading}
                        data-toggle="modal"
                        data-target="#showModal"
                       
                      >
                        {this.state.loading && (
                          <small>
                            Verifying Card <Spinner />
                          </small>
                        )}
                        {!this.state.loading && <small>Upload Card</small>}
                      </button>
                      <Modal
                        modalDataTarget="showModal"
                        show={this.state.loading}
                      />
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center mt-4 ">
            Yet to Register?{" "}
            <button
              className="btn btn-danger"
              onClick={this.handleloginRegister}
            >
              <small>Register</small>
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Login);

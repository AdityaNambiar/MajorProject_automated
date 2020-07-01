import React, { Component } from "react";
import { Link, NavLink,withRouter } from "react-router-dom";
const jwt = require("jsonwebtoken")
class NavBar extends Component {

  getUsername = ()=>{
    let decoded = jwt.decode(localStorage.getItem("x-auth-token"))
    return decoded==null?null:decoded.pIdentifier
  }
  render() {
   
    return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <Link className="navbar-brand" to="/login">
          DevOps
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarNavAltMarkup"
          aria-controls="navbarNavAltMarkup"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item nav-link ml-2 ">
              <NavLink className="text-warning" to="/login">
                Login
              </NavLink>
            </li>
            <li className="nav-item nav-link ml-2">
              <NavLink className="text-warning" to="/register">
                Register
              </NavLink>
            </li>
            <li className="nav-item nav-link ml-2">
              <NavLink className="text-warning" to="/dashboard">
                Dashboard
              </NavLink>
            </li>
            <li className="nav-item nav-link ml-2">
              <NavLink className="text-warning" to="/publicProjects">
                Public Projects
              </NavLink> 
            </li>
            <li className="nav-item nav-link ml-2">
              {this.props.projectid&&this.props.access&&(<NavLink className="text-warning" to={{
                pathname:"/discussions",
                state:{"chatid":this.props.projectid}
              }} >
                Forum
              </NavLink>)}
            </li>
            <li className="nav-item nav-link ml-2 ">
              <label
                style={{ fontWeight: "bold", color: "white" }}
              >{this.getUsername()}</label>
            </li>
            <li className="nav-item nav-link ml-2">
              <button class="btn btn-outline-danger btn-sm my-2 my-sm-0 mr-0"
                onClick={()=>{
                  // localStorage.removeItem('x-auth-token');
                  // localStorage.removeItem('chatid');
                  // localStorage.removeItem('doc');
                  localStorage.clear()
                  this.props.history.replace('/home');
                  window.location.reload(true)
                }}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </nav>
    );
  }
}

export default withRouter(NavBar);

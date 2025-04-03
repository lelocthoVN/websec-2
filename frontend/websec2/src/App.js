import './App.css';
import React, {useEffect, useState} from 'react';
import Schedule from './components/schedule';
import SearchStaff from './components/searchStaff';
import SearchGroup from './components/searchGroup';


class App extends React.Component{
  static defaultProps;
  constructor(props) {
      super(props);
      let isStudentCookie = this.getCookieByName("isStudent");
      let groupIdCookie = this.getCookieByName("groupId");
      let staffIdCookie = this.getCookieByName("staffId");
      if (isStudentCookie != undefined && (groupIdCookie != undefined || staffIdCookie != undefined))
      {
        isStudentCookie = (isStudentCookie == "true");
        if (groupIdCookie == null) groupIdCookie = null;
        else staffIdCookie = null;
        this.state = {isStudent: isStudentCookie, staffId: staffIdCookie, groupId: groupIdCookie};  
      }
      else
      {
        this.state = {isStudent: true, staffId: null, groupId: null};
      }
      this.radioButtonChanged = this.radioButtonChanged.bind(this);
      this.staffIdChanged = this.staffIdChanged.bind(this);
      this.groupIdChanged = this.groupIdChanged.bind(this);
  }
  getCookieByName(name)
  {
    return document.cookie.split('; ').filter(row => row.startsWith(`${name}=`)).map(c=>c.split('=')[1])[0];
  }
  radioButtonChanged()
  {
    this.setState({isStudent: !this.state.isStudent});
  }
  setCookie(staffId, groupId)
  {
    let studentCookie = true;
    if (staffId != null) 
    { 
      studentCookie = false;
      
      document.cookie = `staffId=${staffId}; SameSite=None; Secure`;  
      document.cookie = `groupId=${groupId}; Max-Age=0; SameSite=None; Secure`;
    }
    else
    {
      document.cookie = `staffId=${staffId}; Max-Age=0; SameSite=None; Secure`;
      document.cookie = `groupId=${groupId}; SameSite=None; Secure`;
    }
    document.cookie = `isStudent=${studentCookie}; SameSite=None; Secure`;
    
  }
  staffIdChanged(staffId) {
    this.setState({staffId: staffId});
    this.setState({groupId: null});
    this.setCookie(staffId, null);
  }
  groupIdChanged(groupId) {
    this.setState({groupId: groupId});
    this.setState({staffId: null});
    this.setCookie(null, groupId);
  }
  render()
  {
    let schedule_item = null;
    if (this.state.staffId != null) schedule_item = <Schedule staffId={this.state.staffId} key={this.state.staffId}/>;
    else if (this.state.groupId != null) schedule_item = <Schedule groupId={this.state.groupId} key={this.state.groupId}/>;
    else schedule_item = <Schedule/>;
    return (
      <div className="App">
        <div className="input-group-text">
        <input type="radio" name="choice" id="student" defaultChecked={this.state.isStudent} onChange={this.radioButtonChanged}>
          </input><label htmlFor="student">Студент</label>
        { (this.state.isStudent)? <SearchGroup groupCallback={this.groupIdChanged}/> : ""}
        </div>

        <div className="input-group-text">
        <input type="radio" name="choice" id="staff" defaultChecked={!this.state.isStudent} onChange={this.radioButtonChanged}>
          </input><label htmlFor="staff">Преподаватель</label>
        { !(this.state.isStudent)? <SearchStaff staffCallback={this.staffIdChanged}/> : ""}
        </div>
          {schedule_item}
          
          
      </div>
    );
  }
}


export default App;

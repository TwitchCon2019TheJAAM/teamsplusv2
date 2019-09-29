import React from 'react'
import Authentication from '../../util/Authentication/Authentication'
import axios from 'axios'

import './Config.css'

export default class ConfigPage extends React.Component{
    constructor(props){
        super(props)
        this.Authentication = new Authentication()

        //if the extension is running on twitch or dev rig, set the shorthand here. otherwise, set to null. 
        this.twitch = window.Twitch ? window.Twitch.ext : null
        this.state={
            finishedLoading:false,
            theme:'light',
            stuff: ''
        }
        this.sendThing = this.sendThing.bind(this)
        this.changeTrustLevel = this.changeTrustLevel.bind(this)
    }

    sendThing(){
this.setState({stuff: document.getElementById('stuff').value + " was added to your Team!"})
var x = document.getElementById("list");
var option = document.createElement("option");
option.text = document.getElementById('stuff').value;
option.value = "Neutral"
x.add(option);
document.getElementById('stuff').value = ''
axios.post("http://ha9bg7ly2c.execute-api.us-west-2.amazonaws.com/dev/team/TEST_TEAM", {data: {
    "user":"maxs",
    "role": "TRUSTED"
}})

    }

    changeTrustLevel(){
        console.log(document.getElementById('MaxGrosshandlerLevel').id)
        document.getElementById(document.getElementById('trustList').value).value = document.getElementById('levelList').value
    }

    handleChange(){
        document.getElementById("lab").innerHTML = "Trust Level: " + document.getElementById("list").value
    }
    contextUpdate(context, delta){
        if(delta.includes('theme')){
            this.setState(()=>{
                return {theme:context.theme}
            })
        }
    }

    componentDidMount(){
        // do config page setup as needed here
        if(this.twitch){
            this.twitch.onAuthorized((auth)=>{
                this.Authentication.setToken(auth.token, auth.userId)
                if(!this.state.finishedLoading){
                    // if the component hasn't finished loading (as in we've not set up after getting a token), let's set it up now.
    
                    // now we've done the setup for the component, let's set the state to true to force a rerender with the correct data.
                    this.setState(()=>{
                        return {finishedLoading:true}
                    })
                }
            })
    
            this.twitch.onContext((context,delta)=>{
                this.contextUpdate(context,delta)
            })
        }
    }

    render(){
        if(this.state.finishedLoading && this.Authentication.isModerator()){
            return(
                <div className="Config">
                    <div className={this.state.theme==='light' ? 'Config-light' : 'Config-dark'}>

                    {/* It would be cool if the below stuff actually did something   */}
                    Add person to team<br></br>
                    <input type="text" id="stuff"></input>
                        <button onClick={this.sendThing}>Yes</button>
                        <br></br>
                        {this.state.stuff}
<br></br>
<br></br>
View trust level: 
<select id="list" onChange={this.handleChange}>
<option value=""selected>Select someone</option>
  <option value="Neutral" >MaxGrosshandler</option>
  <option value="Moderator">Jigglewood</option>
  <option value="Verified">Scruffy</option>
  <option value="Donator">Awen</option>
</select>
<br></br>
<label id="lab">Trust Level: </label>
<br></br>

                    </div>
                </div>
            )
        }
        else{
            return(
                <div className="Config">
                    <div className={this.state.theme==='light' ? 'Config-light' : 'Config-dark'}>
                        Loading...
                    </div>
                </div>
            )
        }
    }
}
import React from 'react'
import Authentication from '../../util/Authentication/Authentication'
import axios from 'axios'
import lodash from 'lodash'

import './Config.css'

export default class ConfigPage extends React.Component {
    constructor(props) {
        super(props)
        this.Authentication = new Authentication()

        //if the extension is running on twitch or dev rig, set the shorthand here. otherwise, set to null. 
        this.twitch = window.Twitch ? window.Twitch.ext : null
        this.state = {
            finishedLoading: false,
            theme: 'light',
            stuff: '',
            trustedMembers: [],//[{name:"scruffythejanitor01"},{name:"jigglewood"},{name:"MaxGrosshandler"}],
            currentViewers: [],//[{name:"AnneMunition"},{name:"lirik"},{name:"Summit1g"},{name:"TimTheTatman"}],
            teamName: 'TheJAAM'
        }
        // this.sendThing = this.sendThing.bind(this)
        // this.changeTrustLevel = this.changeTrustLevel.bind(this)
    }

    contextUpdate(context, delta) {
        if (delta.includes('theme')) {
            this.setState(() => {
                return { theme: context.theme }
            })
        }
    }

    componentDidMount() {
        // do config page setup as needed here
        if (this.twitch) {
            this.twitch.onAuthorized((auth) => {
                this.Authentication.setToken(auth.token, auth.userId)
                if (!this.state.finishedLoading) {
                    // if the component hasn't finished loading (as in we've not set up after getting a token), let's set it up now.

                    // now we've done the setup for the component, let's set the state to true to force a rerender with the correct data.
                    this.setState(() => {
                        return { finishedLoading: true }
                    })
                }
            })

            this.twitch.onContext((context, delta) => {
                this.contextUpdate(context, delta)
            })
        }

        //Request trusted viewer list
        axios.get(`https://ha9bg7ly2c.execute-api.us-west-2.amazonaws.com/dev/team/all/TEST_TEAM`,
        {
        }).then(response => {
            const data = response.data;
            const users = Object.values(data.users);
            let trusted = [];
            let untrusted = [];
            users.forEach(user => {
                if(!user.id) return;
                if(user.role === 'TRUSTED') {
                    trusted.push({name:user.id})
                } else {
                    untrusted.push({name:user.id})
                }
            })
            this.setState({trustedMembers:trusted, currentViewers:untrusted})
            console.log(data);
        })
    }

    updateTrust(userId,value) {
        console.log(`Updating trust ${userId} to ${value}`)
        let trustedList = this.state.trustedMembers;
        let viewerList = this.state.currentViewers;
        if(value) {
            trustedList.push({name:userId});
            const viewer = viewerList.find(el => el.name === userId);
            viewerList = lodash.pull(viewerList,viewer);
        } else {
            viewerList.push({name:userId});
            const member = trustedList.find(el => el.name === userId);
            trustedList = lodash.pull(trustedList,member);
        }
        console.log(trustedList);
        this.setState({trustedMembers:trustedList, currentViewers:viewerList});

        //Update DB with new trust level
        axios.post('https://ha9bg7ly2c.execute-api.us-west-2.amazonaws.com/dev/team/TEST_TEAM',{
            body:{
                "user":userId,
                "role":value ? "TRUSTED" : "UNTRUSTED"
            }
        })
    }

    render() {
        if (true){//(this.state.finishedLoading && this.Authentication.isModerator()) {
            const trustedList = this.state.trustedMembers.map(member => {
                return <li>{member.name}<input type="checkbox" checked onChange={event => this.updateTrust(member.name,event.target.checked)}></input></li>
            })
            const viewerList = this.state.currentViewers.map(viewer => {
                return <li>{viewer.name}<input type="checkbox" onChange={event => this.updateTrust(viewer.name,event.target.checked)}></input></li>
            })
            return (
                <div className="Config">
                    <div className={this.state.theme === 'light' ? 'Config-light' : 'Config-dark'}>
                        <h1>Team: {this.state.teamName}</h1>
                        <div className="Container">
                            <div>
                                <h1>Trusted Members</h1>
                                <ul>{trustedList}</ul>
                            </div>
                            <div>
                                <h1>Current Viewers</h1>
                                <ul>{viewerList}</ul>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
        else {
            return (
                <div className="Config">
                    <div className={this.state.theme === 'light' ? 'Config-light' : 'Config-dark'}>
                        Loading...
                    </div>
                </div>
            )
        }
    }
}
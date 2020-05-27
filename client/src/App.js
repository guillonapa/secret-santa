import React from 'react';
import axios from 'axios';
import { Box, Button, Collapsible, DataTable, FormField, Grommet, Heading, Layer, Paragraph, Text, TextInput } from 'grommet';
import { Add, FormClose, StatusInfo, Trash, Close, AddCircle } from 'grommet-icons';
import { hpe } from 'grommet-theme-hpe';

const axiosInstance = axios.create();

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showSecretPerson: false,
            showLayer: false,
            data: [{index: -1}],
            openNotification: false,
            notificationBackground: "",
            notificationMsg: "",
            eventKey: "",
            personalKey: "",
            secretName: "",
            eventName: "",
            revealDisabled: true,
            createDisabled: true
        }
    }

    showSecret(eventKey, personalKey) {
        axiosInstance.get(`/secret/${eventKey}/${personalKey}`)
            .then(res => {
                this.setState({
                    showKeyInput: false,
                    showSecretPerson: true,
                    secretName: res.data
                });
            });

    }

    setShowLayer(show) {
        this.setState({
            showLayer: show
        });
    }

    addPerson(name, email) {
        let data = this.state.data.slice();
        if (data.length === 1 && data[0].index === -1) {
            data = [];
        }
        let index = data.length;
        data.push({ name, email, index })
        let createDisabled = !this.canCreate(data, this.state.eventName);
        this.setState({
            data,
            createDisabled
        });
    }

    canCreate(data, eventName) {
        var i;
        for (i = 0; i < data.length; i++) {
            let entry = data[i];
            if (entry.index === -1 || entry.name === "" || entry.email === "") {
                return false;
            }
        }
        return eventName !== "";
    }

    updateTable(name, email, index) {
        let data = this.state.data.slice();
        data[index] = {name, email, index};
        let createDisabled = !this.canCreate(data, this.state.eventName);
        this.setState({
            data,
            createDisabled
        });
    }

    updateEventName(eventName) {
        let createDisabled = !this.canCreate(this.state.data, eventName);
        this.setState({
            eventName,
            createDisabled
        });
    }

    getUsers() {
        let name = this.state.eventName;
        let people = this.state.data.slice();
        if (name.trim() && people.length > 2) {
            this.setShowLayer(false);
            axiosInstance.post(`/event`, {
                name: name.substring(0, 30),
                people
            }).then(res => {
                if (res && res.data) {
                    this.setState({
                        openNotification: true,
                        notificationMsg: `A new Secret Santa event has been successfully created with key '${res.data}'`,
                        notificationBackground: "status-ok"
                    });
                } else {
                    this.setState({
                        openNotification: true,
                        notificationMsg: `An errror occurred while attempting to create your event. Please try again later.`,
                        notificationBackground: "status-warning"
                    });
                }
            });
        } else {
            let errorMsg = !(name.trim()) ? "You must enter a name for the event" : "You must add at least 3 people to create an event";
            this.setState({
                openNotification: true,
                notificationMsg: errorMsg,
                notificationBackground: "status-warning"
            });
            setTimeout(() => {
                this.setState({
                    openNotification: false
                });
            }, 5000);
        }
    }

    deleteUser(index) {
        let data = this.state.data.slice();
        data.splice(index, 1);
        var i;
        for (i = 0; i < data.length; i++) {
            let entry = data[i];
            data[i] = { name: entry.name, email: entry.email, index: i }
        }
        if (data.length === 0) {
            data = [{index: -1}];
        }
        let createDisabled = !this.canCreate(data, this.state.eventName);
        this.setState({
            data,
            createDisabled
        });
    }

    setEventKey(eventKey) {
        let revealDisabled = this.state.personalKey === "" || eventKey === "";
        this.setState({
            eventKey,
            revealDisabled
        });
    }

    setPersonalKey(personalKey) {
        let revealDisabled = this.state.eventKey === "" || personalKey === "";
        this.setState({
            personalKey,
            revealDisabled
        });
    }

    render() {
        const { data, openNotification, showLayer, showSecretPerson, eventKey, personalKey, revealDisabled, createDisabled, secretName, notificationBackground, notificationMsg } = this.state;
        return (
            <Grommet theme={hpe}>

                {/* --- Drawer to create an event --- */}
                {showLayer ?
                    <Layer overflow="scroll" full={true} position="right" onEsc={() => { this.setShowLayer(false) }} onClickOutside={() => { this.setShowLayer(false) }}>
                        <Box overflow="auto" widht="full" height="full" gap="medium" pad="medium">
                            <Button alignSelf="end" plain icon={<Close className="close-button" onClick={() => this.setShowLayer(false)} />} />
                            <Box flex="grow" overflow="auto" gap="medium" pad={{horizontal: 'medium', vertical: 'xsmall'}} margin={{vertical: 'xsmall'}} alignSelf="center" align="center" width="large">
                                <Box justify="between" flex="grow" overflow="auto" direction="row" >
                                    <Heading margin="none" level="2">New Secret Santa Event</Heading>
                                </Box>
                                <Text>Enter a name for your event and add all your guests to the list. After the event is created, everyone will receive an email with the event key and their unique personal key. These keys can be used to reveal to whom will they be giving a gift this year.</Text>
                                <Box flex="grow" overflow="auto" direction="row" fill="horizontal" align="center" gap="small" >
                                    <TextInput placeholder="Event Name..." onChange={(event) => { this.updateEventName(event.target.value) }} />
                                </Box>
                            </Box>

                            <Box flex="grow" gap="medium" pad={{horizontal: 'medium', vertical: 'xsmall'}} margin={{vertical: 'xsmall'}} alignSelf="center" align="center">
                                <DataTable
                                    pad={{horizontal: 'xxsmall', vertical: 'xxsmall'}}
                                    columns={[
                                        { property: 'entry', header: (<Box direction="row" align="stretch" justify="stretch"><Box basis="full"><Text weight="bold" size="large">Participant List</Text></Box><Box flex="shrink" justify="end"><Button plain icon={<AddCircle color="status-ok" onClick={() => this.addPerson("", "")}/>}/></Box></Box>), render: datum => (datum.index !== -1 ? 
                                            (<Box direction="row" gap="small" alignContent="center" align="center">
                                                <Box alignSelf="center" alignContent="center" flex="grow">
                                                    <FormField>
                                                        <TextInput value={datum.name} placeholder="Name..." onChange={(event) => this.updateTable(event.target.value, datum.email, datum.index)}></TextInput>
                                                    </FormField>
                                                </Box>
                                                <Box alignSelf="center" alignContent="center" flex="grow">
                                                    <FormField>
                                                        <TextInput value={datum.email} placeholder="Email..." onChange={(event) => this.updateTable(datum.name, event.target.value, datum.index)}></TextInput>
                                                    </FormField>
                                                </Box>
                                                <Box alignSelf="center" flex="shrink"><Button plain icon={<Trash color="status-warning" onClick={() => this.deleteUser(datum.index)}/>}/></Box>
                                            </Box>)
                                            : <Text margin={{left: 'medium', top: 'medium'}}>No people have been added to the list...</Text>)}
                                    ]}
                                    data={data}
                                    alignSelf="stretch"
                                    size="large"
                                />
                            </Box>
                            

                            {/* Box with submit and cancel buttons */}
                            <Box flex="grow" overflow="auto" fill="horizontal" direction="row-reverse" align="center" pad="small" gap="small" alignSelf="center" width="large" >
                                <Button type="submit" primary label="Create" onClick={() => { this.getUsers() }} disabled={createDisabled} />
                                <Button type="button" label="Cancel" onClick={() => { this.setShowLayer(false) }} />
                            </Box>
                        </Box>
                    </Layer>
                : ""}

                {/* --- Notification --- */}
                {openNotification ?
                    <Layer position="bottom" modal={false} margin={{ vertical: "medium", horizontal: "small" }} responsive={false} plain>
                        <Box align="center" direction="row" gap="small" justify="between" round="medium" elevation="medium" pad={{ vertical: "small", horizontal: "medium" }} background={notificationBackground}>
                            <Box align="center" direction="row" gap="small">
                                <StatusInfo/>
                                <Text>{notificationMsg}</Text>
                            </Box>
                            <Button icon={<FormClose onClick={() => { this.setState({ openNotification: false }) }} />} plain />
                        </Box>
                    </Layer>
                : ""}

                {/* --- Main body of the page --- */}
                <Box pad="small" align="end" alignContent="end" direction="row" justify="end">Create Event&nbsp;<Add className="add-button" onClick={() => { this.setShowLayer(true) }}></Add></Box>
                <Box pad="large">
                    <Box gap="medium" pad="medium" round="small" animation="slideDown" width="medium" alignSelf="center" align="center">
                        {/* <h1>Welcome, Santa.</h1> */}
                        <Heading margin="none" level="2">Welcome, Santa.</Heading>
                        <Box alignSelf="center" align="center">
                            <Paragraph margin="none">Enter your event and personal keys to reveal to whom you will be giving a gift.</Paragraph>
                        </Box>
                        <Box fill="horizontal">
                            <TextInput placeholder="Event Key..." value={eventKey} onChange={event => this.setEventKey(event.target.value)}/>
                        </Box>
                        <Box fill="horizontal">
                            <TextInput placeholder="Personal Key..." value={personalKey} onChange={event => this.setPersonalKey(event.target.value)}/>
                        </Box>
                        <Box fill="horizontal" flex>
                            <Button type="submit" primary label="Reveal" onClick={() => this.showSecret(eventKey, personalKey)} disabled={revealDisabled}/>
                        </Box>
                        <Box fill="horizontal">
                            <Collapsible fill="horizontal" direction="vertical" open={showSecretPerson}>
                                <Box flex fill="horizontal" alignSelf="center" align="center">
                                    <h3>You will give a present to:</h3>
                                    <Box><p>{secretName}</p></Box>
                                </Box>
                            </Collapsible>
                        </Box>
                    </Box>
                </Box>

            </Grommet>
        );
    }
}

export default App;

import React from 'react';
import axios from 'axios';
import { Box, Button, Collapsible, DataTable, Form, FormField, Grommet, Heading, Layer, Paragraph, Text, TextInput } from 'grommet';
import { Add, FormClose, StatusInfo, Trash, Close } from 'grommet-icons';
import { aruba } from 'grommet-theme-aruba';

const ENV = process.env;
const SERVER_URL = `https://localhost:${ENV.REACT_APP_API_PORT}`;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showKeyInput: false,
      showSecretPerson: false,
      showLayer: false,
      data: [],
      openNotification: false,
      notificationBackground: "", // 'status-ok'
      notificationMsg: "",
      eventKey: "",
      secretName: "",
      classForNonEmptyTable: "",
      eventName: ""
    }
  }
  
  showSecret(body, eventKey) {
    console.log("Personal key: ", body.value.key);
    console.log("Event key: ", eventKey);

    axios.get(`${SERVER_URL}/secret`, {
      params: {
        eventKey,
        personalKey: body.value.key
      }
    }).then(res => {
      console.log("The RESPONSE: ", res);
      this.setState({
        showKeyInput: false,
        showSecretPerson: true,
        secretName: res.data
      });
    });
    
  }

  setShowLayer(show) {
    console.log(`GET ${SERVER_URL}/ about to take place`);
    
    axios.get(`${SERVER_URL}/`).then(res => {
      console.log("Get / returned: ", res);
    });
    this.setState({
      showLayer: show
    });
  }

  addPerson(name, email) {
    let temp = this.state.data;
    let index = temp.length;
    temp.push({name, email, index})
    this.setState({
      data: temp,
      classForNonEmptyTable: "hide-message"
    });
  }

  getUsers() {
    let name = this.state.eventName;
    let people = this.state.data;

    if (name.trim() && people.length > 2) {
      console.log("The data:", this.state.data);
      this.setShowLayer(false);
      console.log("About to post to ", `${SERVER_URL}/event`);
      axios.post(`${SERVER_URL}/event`, {
        name: name.substring(0, 30),
        people
      }).then(res => {
        // TODO check if res is good (200) then proceed

        this.setState({
          openNotification: true,
          notificationMsg: `A new Secret Santa event has been successfully created with key '${res.data}'`,
          notificationBackground: "status-ok"
        });
        
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

  newUserEntry(value) {
    this.addPerson(value.name, value.email);
    document.querySelector("#newUserForm").reset();
    document.querySelector("#nameUserForm").focus();
  }

  deleteUser(index) {
    console.log("Index to delete: ", index);
    let temp = this.state.data;
    temp.splice(index, 1);
    var i;
    for (i = 0; i < temp.length; i++) {
      let tempData = temp[i];
      temp[i] = {name: tempData.name, email: tempData.email, index: i}
    }
    let classForNonEmptyTable = temp.length === 0 ? "" : "hide-message";
    this.setState({
      data: temp,
      classForNonEmptyTable
    });
  }

  setEventKey(eventKey) {
    this.setState({
      eventKey,
      showKeyInput: true
    });
  }

  render() {
    const { data, openNotification, showLayer, showKeyInput, showSecretPerson, eventKey, secretName, classForNonEmptyTable, notificationBackground, notificationMsg } = this.state;
      return (
        <Grommet theme={aruba}>

          {showLayer && <Layer overflow="scroll" full="vertical" width="xlarge" position="right" onEsc={() => {this.setShowLayer(false)}} onClickOutside={() => {this.setShowLayer(false)}}>

            <Box overflow="auto" widht="full" height="full" gap="medium" pad="medium">
              <Box flex="grow" overflow="auto" width="xlarge" gap="medium" pad="medium">
                <Box justify="between" flex="grow" overflow="auto" direction="row" >
                  <Heading margin="none" level="1">New Event</Heading>
                  <Button plain icon={<Close className="close-button" onClick={() => this.setShowLayer(false)} />}/>
                </Box>
                <Text>
                  Santa is coming to town... Enter a name for your event and add all your guests to the list. After the event is created, everyone in the list will receive an email with a personal key that they can use to find out who will be the lucky one.
                </Text>
                <Box flex="grow" overflow="auto" direction="row" fill="horizontal" align="center" gap="small" >
                  <Text wordBreak="normal">Name:</Text>
                  <TextInput placeholder="Enter a name..." onChange={(event) => { this.setState({ eventName: event.target.value }) }}/>
                </Box>
              </Box>

              <Box flex="grow" overflow="auto" direction="row-responsive" width="xlarge" gap="medium" pad="medium">
                {/* Box to add new people to the list */}
                <Box flex="grow" overflow="auto" gap="medium" pad="large" round border={{ color: 'brand' }}>
                  {/* <Heading level="3">New Participant</Heading> */}
                  <Form align="start" onSubmit={(event) => this.newUserEntry(event.value)} id="newUserForm">
                    <FormField name="name" label="name" required={true} id="nameUserForm" />
                    <FormField name="email" label="email" required={true} />
                    <Button type="submit" primary label="Add Person" margin={{ top: 'medium' }} />
                  </Form>
                </Box>
                {/* Box to display the list of all people in the event */}
                <Box flex="grow" overflow="auto" gap="medium" pad="large" round border={{ color: 'brand' }}>
                  {/* <Heading level="3">Current List</Heading> */}
                  <Box overflow="auto">
                    <DataTable
                      pad="small"
                      columns={[
                        {
                          property: 'name',
                          header: <Text>Name</Text>
                        },
                        {
                          property: 'email',
                          header: 'Email'
                        },
                        {
                          property: 'remove',
                          header: '',
                          render: datum => (
                            <Box>
                              <Button plain icon={<Trash color="accent-4" className="delete-icon" onClick={() => this.deleteUser(datum.index)} />}/>
                            </Box>
                          )
                        }
                      ]}
                      data={data}
                    />
                    <Text margin="small" className={classForNonEmptyTable} wordBreak="break-all">
                      No people have been added
                    </Text>
                  </Box>
                </Box>
              </Box>
              <Box flex="grow" overflow="auto" direction="row" width="xlarge" gap="medium" pad="medium">
                {/* Box with submit and cancel buttons */}
                <Box flex="grow" overflow="auto" width="xlarge" fill="horizontal" direction="row-reverse" align="end" pad="small" gap="small" >
                  <Button type="submit" primary label="Create" onClick={() => {this.getUsers()}} />
                  <Button type="button" label="Cancel" onClick={() => {this.setShowLayer(false)}} />
                </Box>
              </Box>

            </Box>


          </Layer>}

          {openNotification && 
          <Layer
            position="bottom"
            modal={false}
            margin={{ vertical: "medium", horizontal: "small" }}
            // onEsc={onClose}
            responsive={false}
            plain >
            <Box
              align="center"
              direction="row"
              gap="small"
              justify="between"
              round="medium"
              elevation="medium"
              pad={{ vertical: "small", horizontal: "medium" }}
              background={notificationBackground}
            >
              <Box align="center" direction="row" gap="small">
                <StatusInfo />
                <Text>{notificationMsg}</Text>
              </Box>
              <Button icon={<FormClose onClick={() => { this.setState({ openNotification: false })} } />} plain />
            </Box>
          </Layer>}

          <Box pad="small" align="end" >
            <Add className="add-button" onClick={() => {this.setShowLayer(true)}}></Add>
          </Box>
          <Box pad="large">
            <Box gap="medium" pad="medium"  round="small" animation="slideDown" width="medium" alignSelf="center" align="center">
              <h1>Welcome, Santa.</h1>
              <Box alignSelf="center" align="center">
                <Paragraph margin="none">
                  Enter your event and personal keys to reveal
                  who will be on your "nice" list.
                </Paragraph>
              </Box>
              <Box fill="horizontal">
                {/* <Select
                  options={[
                    'Guillermo Narvaez Paliza', 
                    'Laura Broffman',
                    'Ana Sofia Narvaez Paliza',
                    'Jose Narvaez Paliza', 
                    'Jose Max Narvaez Paliza',
                    'Sofia Paliza Castilla',
                    'Guillermo Narvaez Lora'
                  ]}
                  value={user}
                  onChange={({ option }) => {this.setUser(option)}}
                /> */}
                <TextInput
                  placeholder="Enter event key"
                  value={eventKey}
                  onChange={event => this.setEventKey(event.target.value)}
                />
              </Box>
              <Box fill="horizontal">
                <Collapsible fill="horizontal" direction="vertical" open={showKeyInput}>
                  <Box fill="horizontal" flex>
                    <Form onSubmit={(body) => this.showSecret(body, eventKey)}>
                      <FormField name="key" label="" />
                      <Button type="submit" primary label="Reveal" />
                    </Form>
                  </Box>
                </Collapsible>
              </Box>
              <Box fill="horizontal">
                <Collapsible fill="horizontal" direction="vertical" open={showSecretPerson}>
                  <Box flex fill="horizontal" alignSelf="center" align="center">
                    <h3>You will give a present to:</h3>
                    <Box>
                      <p>{secretName}</p>
                    </Box>
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

/*
  This component provides a wrapper around the actual chatbot.
  Here, we manage the state (symptoms, diagnosis, specialties)
  and coordinate API calls to the back end.

  Functions defined here are passed down to the child component(CustomChatbot)
  as props, which enables it to update and access the state.

*/

import React, { Component } from 'react';
import SimpleForm from './CustomChatbot';
import axios from 'axios';
import { Grid } from 'semantic-ui-react';
import providers from '../providers';

class ChatBotWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      symptoms: [], // [{symptom: "a", id:0}, {symptom: "b", id:1}]
      diagnosis: '',
      allDiagnoses: [],
      specialties: [],
      result: {}, // stores the most recent success/failure message from add-symptom
    };
  }

  /*
    When a user wants to start over, clear all info from the previous attempt
  */
  resetState = () => {
    console.log('[ChatBotWrapper] Resetting state...');
    this.setState({
      symptoms: [],
      diagnosis: '',
      allDiagnoses: [],
      specialties: [],
      result: {},
      specialtyRandIndex: 0,
      providerRandIndex: 0,
    });
  };

  /*
    Getter functions give child components access to state in the parent component
  */
  getSymptoms = () => {
    return this.state.symptoms;
  };

  getDiagnosis = () => {
    return this.state.diagnosis;
  };

  getSpecialties = () => {
    return this.state.specialties;
  };

  /*
    This is so we can switch up the provider name and the speciality index each time the program runs.
    The child component refreshes too frequently so we can't generate random values there.
  */
  getRandomIndexForDoctorComponent = () => {
    const specialtyRandIndex = Math.floor(
      Math.random() * this.state.specialties.length
    );
    const providerRandIndex = Math.floor(Math.random() * providers.length);

    let indexObj = {
      specialtyIndex: this.state.specialtyRandIndex,
      providerIndex: this.state.providerRandIndex,
    };

    return indexObj;
  };

  /*
    Select a new random diagnosis from the list to show.
    Remove the old one so there are no repeats.
    When the list is empty, we'll start over.
  */
  shuffleDiagnosis = () => {
    console.log('[ChatBotWrapper] Shuffling diagnosis');
    // Filter out the one we're getting rid of.
    let updatedList = this.state.allDiagnoses.filter(
      (d) => d.diagnosis !== this.state.diagnosis
    );

    // Check if there's anything left
    if (updatedList.length === 0) {
      console.log('[ChatBotWrapper] List is empty');
      // Cannot display a new diagnosis
      return false;
    }

    // Get new random indices
    let diagnosisNum = Math.floor(Math.random() * updatedList.length);
    let { diagnosis, specialties } = updatedList[diagnosisNum];
    let specialtyRandIndex = Math.floor(Math.random() * specialties.length);
    let providerRandIndex = Math.floor(Math.random() * providers.length);

    this.setState({
      allDiagnoses: updatedList,
      diagnosis,
      specialties,
      specialtyRandIndex,
      providerRandIndex,
    });

    return true;
  };

  /*
    This function will be passed down to CustomChatBot, where we'll get
    a symptom passed in by the user.
    
    Here, we want run some basic input checks and trim the string,
    then send it to the '/symptom' endpoint.

    In response, we'll get an object like {symptom: "headache", id: 9},  or {error: "message"}
    
    If successful, we want to update the state with the symptom and id.
    We also want to return a success/error value so the child component can communicate it to the user
  */
  processSymptomInput = async (symptomInput) => {
    console.log(`[ChatBotWrapper] Processing symptom input: "${symptomInput}"`);

    // Make sure the last result is clear before we begin
    this.setState({
      result: {},
    });

    // Check that a symptom was entered
    if (!symptomInput) {
      console.log('[ChatBotWrapper] No symptom was entered.');
      return { error: 'No symptom entered' };
    }

    // Get rid of any extra white space
    symptomInput = symptomInput.trim();

    // Send the input off to the backend
    try {
      const res = await axios.post('http://localhost:8080/symptom', {
        symptom: symptomInput,
      }); // => {symptom: "headache", id: 9},  or {error: "message"}

      // If there's an error on the back end, return it here.
      if (res.data.error) {
        console.log(`[ChatBotWrapper] Error: ${res.data.error}`);
        this.setState({
          result: { success: false, symptom: symptomInput },
        });
        return { error: `No matching symptom was found for ${symptomInput}` };
      }

      // Extract the symptom and corresponding id
      const { symptom, symptomId } = res.data.body;

      // If a symptom was found, add it to the list and return a success message
      this.setState({
        symptoms: this.state.symptoms.concat({ symptom, symptomId }), // {symptom, id}
        result: { success: true, symptom },
      });

      console.log(`[ChatBotWrapper] Symptom: ${symptom}, Id: ${symptomId}`);

      return {
        success: `${symptom} (id: ${symptomId}) successfully added`,
      };
    } catch (e) {
      console.log(`[ChatBotWrapper] error: ${e}`);
      this.setState({
        result: { success: false, symptom: symptomInput },
      });
      return { error: 'Error processing symptom' };
    }
  };

  /*
    The chatbot gets weird with async stuff so this was a way around it.
    When a symptom is added, store the success/failure as state.
  */
  checkSuccess = () => {
    if (this.state.result.success) {
      return true;
    } else {
      return false;
    }
  };

  /*
    To process a diagnosis, send a list of symptom ids to the back end.
    We don't actually have to pass in parametes here since the symptoms are stored as state.
  */
  processDiagnosis = async () => {
    console.log('[ChatBotWrapper] Processing diagnosis...');

    // If the symptom list is empty, don't try to get a diagnosis.
    if (this.state.symptoms.length === 0) {
      console.log('[ChatBotWrapper] Error: The symptom list is empty.');
      return { error: 'The symptom list is empty.' };
    }

    // If there ARE symptoms, we need to just get the ids out of the symptom list and pass them along.
    const symptomIds = this.state.symptoms.map((e) => e.symptomId);
    console.log(`[ChatBotWrapper] Checking symptom ids: ${symptomIds}`);

    // Pass the symptom ids to the backend and await response.
    try {
      const res = await axios.post('http://localhost:8080/diagnosis', {
        symptomIds,
      });

      // No diagnosis is found for the given symptoms
      if (res.data.length === 0) {
        console.log('[ChatBotWrapper] No diagnosis found!');
        return { error: 'No diagnosis found!' };
      }

      // Generate a random index to shake up the diagnosis
      let diagnosisNum = Math.floor(Math.random() * res.data.length);
      let providerRandIndex = Math.floor(Math.random() * providers.length);

      /*
        Verbose helper function because being concise was causing errors.
        Given a full element from the response of the diagnosis API,
        return an object with the name of the diagnosis and the corresponding list of specialties.
      */
      const diagnosisHelper = (e) => {
        let diagnosis = e.Issue.IcdName;
        let specialties = e.Specialisation;
        let obj = {
          diagnosis,
          specialties,
        };
        return obj;
      };

      // Save the whole list so we can shuffle through a few
      let allDiagnoses = res.data.map((e) => diagnosisHelper(e));
      console.log('[ChatBotWrapper] allDiagnoses:', allDiagnoses);

      // A successful response contains fields for the diagnosis and corresponding specialties.
      let diagnosis = res.data[diagnosisNum]['Issue']['IcdName'];
      let specialties = res.data[diagnosisNum]['Specialisation'];
      let specialtyRandIndex = Math.floor(Math.random() * specialties.length);

      // Update the state.
      this.setState({
        diagnosis,
        specialties,
        allDiagnoses,
        specialtyRandIndex,
        providerRandIndex,
      });

      console.log('[ChatBotWrapper] Diagnosis has been processed.');
    } catch (e) {
      console.log('[ChatBotWrapper]', e);
      return { error: 'Error getting diagnosis' };
    }
  };

  render() {
    return (
      <>
        <Grid>
          <Grid.Row columns={1} centered>
            <Grid.Column width={7}>
              <SimpleForm
                processSymptomInput={this.processSymptomInput}
                checkSuccess={this.checkSuccess}
                processDiagnosis={this.processDiagnosis}
                getSymptoms={this.getSymptoms}
                getDiagnosis={this.getDiagnosis}
                getSpecialties={this.getSpecialties}
                resetState={this.resetState}
                shuffleDiagnosis={this.shuffleDiagnosis}
                getRandomIndexForDoctorComponent={
                  this.getRandomIndexForDoctorComponent
                }
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </>
    );
  }
}

export default ChatBotWrapper;

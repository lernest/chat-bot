/*
  There are a few components in this file
    1. Symptoms
    2. Diagnosis
    3. Doctor
    4. SimpleForm

  The first 3 are simply to display results within the chatbot.
  They accept getter functions as props, which give access to the state
  stored in ChatBotWrapper. There is nothing exciting.

  SimpleForm is the special component, which contains the ChatBot module:
    https://lucasbassetti.com.br/react-simple-chatbot/#/

  Wrapping ChatBot in a ThemeProvider lets us pass in some styling options,
  as defined in the 'theme' object.

  The conversation flow is defined by the 'steps' object.
  The steps below contain the following:
    id          --    The name of the step, how it is identified and accesed by other steps.
    message     --    The message 'typed' by the chatbot.
    trigger     --    What happens after this step?  Could be a function, could just be the id of the next step.
    options     --    Define choices to present to the user, which they'll select by clicking the option they want.
    user        --    If true, this means we need to wait for user input here.
    component   --    Instead of a message, display a whole component.  This is how we display Symptoms, Diagnosis, and Doctor
    delay       --    Time to wait before displaying the message.  For realism.
    end         --    Instead of triggering another step, the conversation ends here.

  
  Note: I'm aware the step ids could use some improvement but I don't want to get tangled in the spaghetti at this time.

*/

import React from 'react';
import ChatBot from 'react-simple-chatbot';
import { ThemeProvider } from 'styled-components';
import { Container } from 'semantic-ui-react';
import providers from '../providers';

// Styling for ChatBot, passed into ThemeProvider
const theme = {
  background: '#f5f8fb',
  fontFamily: 'Helvetica Neue',
  headerBgColor: '#0F0F59',
  headerFontColor: '#fff',
  headerFontSize: '17px',
  botBubbleColor: '#EF6C00',
  botFontColor: '#fff',
  userBubbleColor: '#fff',
  userFontColor: '#4a4a4a',
};

/*
  Display the list of collected symptoms
*/
const Symptoms = (props) => {
  // Get the symptoms stored in ChatBotWrapper
  const symptoms = props.getSymptoms();
  return (
    <Container textAlign='center' className='chatbot'>
      {symptoms.length > 0 && <h2>Symptoms</h2>}
      <ul className='chatbot'>
        {symptoms.map((s, i) => (
          <li key={i}>{s.symptom}</li>
        ))}
      </ul>
    </Container>
  );
};

/*
  Display the diagnosis and corresponding specialties
*/
const Diagnosis = (props) => {
  // Get the diagnosis and list of specialties stored in ChatBotWrapper
  const diagnosis = props.getDiagnosis();
  const specialties = props.getSpecialties();
  return (
    <Container textAlign='center' className='chatbot'>
      {diagnosis && <h2>Diagnosis</h2>}
      {diagnosis && <p>{diagnosis}</p>}

      {specialties.length > 1 && <h2> Recommended Specialties </h2>}
      <ul className='chatbot'>
        {specialties.length > 1 &&
          specialties.map((s, i) => <li key={i}> {s.Name} </li>)}
      </ul>
    </Container>
  );
};

/*
  Display the recommended doctor
*/
const Doctor = (props) => {
  // For demo purposes, select a random specialty and random provider
  const {
    specialtyIndex,
    providerIndex,
  } = props.getRandomIndexForDoctorComponent();

  const provider = providers[providerIndex];
  const specialty = props.getSpecialties()[specialtyIndex];

  return (
    <Container textAlign='center'>
      {specialty && (
        <div className='chatbot'>
          <p>
            {provider.name} is a great choice who specializes in{' '}
            {specialty.Name}.
          </p>

          <p>Address: {provider.address}</p>
          <p>Phone: {provider.phone}</p>
        </div>
      )}
    </Container>
  );
};

function SimpleForm(props) {
  let symptoms = [];
  let symptom = '';

  return (
    <ThemeProvider theme={theme}>
      <ChatBot
        headerTitle='CHNG ChatBot'
        width='100'
        steps={[
          // Greeting
          {
            id: 'greeting',
            message: "Hi!  I'm the CHNG Chatbot.  Welcome to MatchBot '20.",
            trigger: 'start-symptoms',
          },
          // Let's check your symptoms!
          {
            id: 'start-symptoms',
            delay: 2000,
            message:
              "Let's check your symptoms and get you matched with a doctor!",
            trigger: () => {
              props.resetState();
              symptoms = [];
              symptom = '';
              return '1';
            },
          },
          // Please enter a symptom
          {
            id: '1',
            delay: 1500,
            message: 'Please enter a symptom.',
            trigger: () => {
              return 'add-symptom';
            },
          },
          // processSymptomInput()
          {
            id: 'add-symptom',
            user: true,
            trigger: (value) => {
              // Check for duplicate entry
              symptom = value.value.toLowerCase();
              if (symptoms.includes(symptom)) {
                return 'duplicate';
              }

              // Check if symptom matches an id and can be added
              props.processSymptomInput(symptom);

              return 'check-success';
            },
          },
          // Duplicate symptom error
          {
            id: 'duplicate',
            message: '{previousValue} is already in your symptoms list.',
            trigger: 'add-another-symptom',
          },
          // Check if symptom was successfully added
          {
            id: 'check-success',
            message: 'Adding symptom: {previousValue}',
            trigger: () => {
              const success = props.checkSuccess();
              if (success) {
                symptoms.push(symptom);
                return 'success-adding-symptom';
              } else {
                return 'error-adding-symptom';
              }
            },
          },
          // Error adding symptom
          {
            id: 'error-adding-symptom',
            message: 'Unable to add symptom.',
            trigger: 'add-another-symptom',
          },
          // Symptom successfully added
          {
            id: 'success-adding-symptom',
            message: 'Successfully added symptom.',
            trigger: 'add-another-symptom',
          },
          // Add another symptom?
          {
            id: 'add-another-symptom',
            options: [
              {
                value: true,
                label: 'Add another',
                trigger: '1',
              },
              {
                value: false,
                label: 'Review',
                trigger: () => {
                  return 'view-symptoms';
                },
              },
            ],
          },
          // View symptoms
          {
            id: 'view-symptoms',
            component: (
              <Symptoms getSymptoms={props.getSymptoms} symptoms={symptoms} />
            ),
            trigger: 'process-diagnosis',
          },
          // Add another symptom or get diagnosis?
          {
            id: 'process-diagnosis',
            options: [
              {
                value: true,
                label: 'Add another symptom',
                trigger: '1',
              },
              {
                value: false,
                label: 'Get diagnosis',
                trigger: () => {
                  props.processDiagnosis();
                  return 'check-diagnosis-exists';
                },
              },
            ],
          },
          // Check if diagnosis exists
          {
            id: 'check-diagnosis-exists',
            message: 'Processing diagnosis...',
            trigger: () => {
              if (!props.getDiagnosis()) {
                return 'diagnosis-not-found';
              } else {
                return 'display-diagnosis';
              }
            },
          },
          // Diagnosis not found
          {
            id: 'diagnosis-not-found',
            message:
              "Sorry, couldn't find a diagnosis that matches your symptoms.  Please try again",
            trigger: 'start-symptoms',
          },
          // Display diagnosis
          {
            id: 'display-diagnosis',
            component: (
              <Diagnosis
                symptoms={symptoms}
                getDiagnosis={props.getDiagnosis}
                getSpecialties={props.getSpecialties}
              />
            ),
            trigger: 'confirm-diagnosis',
          },
          {
            // Does this seem right?
            id: 'confirm-diagnosis',
            message: 'Does this diagnosis seem right to you?',
            trigger: 'search-doctor-or-restart',
          },
          {
            // Search for doctor or re-enter symptoms
            id: 'search-doctor-or-restart',
            options: [
              {
                value: false,
                label: 'No, not really',
                trigger: () => {
                  let res = props.shuffleDiagnosis();
                  if (!res) {
                    return 'list-empty';
                  }
                  return 'display-diagnosis';
                },
              },
              {
                value: true,
                label: 'Yes. Search for a doctor',
                trigger: 'getting-doctor',
              },
            ],
          },
          {
            // Unable to shuffle because list is empty
            id: 'list-empty',
            message:
              "I'm all out of ideas for a diagnosis based on those symptoms.  Let's start over.",
            trigger: 'start-symptoms',
          },
          // Getting doctor...
          {
            id: 'getting-doctor',
            message: 'Searching for a doctor in your area...',
            trigger: 'doctor',
          },
          // Display doctor
          {
            id: 'doctor',
            component: (
              <Doctor
                getSpecialties={props.getSpecialties}
                getRandomIndexForDoctorComponent={
                  props.getRandomIndexForDoctorComponent
                }
              />
            ),
            trigger: 'confirm-doctor',
          },
          {
            id: 'confirm-doctor',
            delay: 2000,
            message: 'Do you need to search for another doctor today?',
            trigger: 'try-again',
          },
          // Try again or end?
          {
            id: 'try-again',
            options: [
              {
                value: false,
                label: "Yes, let's start over",
                trigger: 'start-symptoms',
              },
              {
                value: true,
                label: 'Nope, bye',
                trigger: 'end',
              },
            ],
          },
          // Goodbye!
          {
            id: 'end',
            delay: 2500,
            message: 'bye',
            end: true,
          },
        ]}
      />
    </ThemeProvider>
  );
}

export default SimpleForm;

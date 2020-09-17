import React from 'react';
import { Container } from 'semantic-ui-react';
import ReactMarkdown from 'react-markdown';

const Team = () => {
  const markdown = `
  ### Team members:

- Haazib Awan
- Manuel Kappen
- Liam Ernest
- Zayan Khadri
- Charlie Hohenstein

### Initially presented at CHNG PitchFest2020

- Madison Shultz
- Amanda James
- Jen Brooks
- Keith Roberts


  `;

  return (
    <div className='markdown'>
      <Container>
        <ReactMarkdown source={markdown} />
      </Container>
    </div>
  );
};

export default Team;

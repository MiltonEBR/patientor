import React from 'react';
import { Entry, HealthCheckRating } from '../types';
import { Segment } from 'semantic-ui-react';
import { Icon } from 'semantic-ui-react';
import { SemanticCOLORS } from 'semantic-ui-react/dist/commonjs/generic';

export default function Entries({entry,codes}:{entry:Entry,codes:{[code:string]:string}}) {

    const HealthCheckEntry=({healthCheckRating}:{healthCheckRating:HealthCheckRating})=>{
        let color:SemanticCOLORS;

        switch (healthCheckRating) {
            case 0:
                color="green";
                break;
            case 1:
                color="yellow";
                break;
            case 2:
                color="orange";
                break;
            case 3:
                color="red";
                break;

            default:
                color="grey";
                break;
        }

        return <div>
            <h3>{entry.date} <Icon name="doctor" size="big"/></h3> 
            <p>{entry.description}</p>
            <Icon color={color} name="heart"/>
        </div>;
    };

    const OccupationalHealthcareEntry=({employerName}:{employerName:string})=>{
        return <div>
            <h3>{entry.date} <Icon name="address card outline" size="big"/> {employerName}</h3> 
            <p>{entry.description}</p>
        </div>;
    };

    const HospitalEntry=({date,criteria}:{date:string,criteria:string})=>{
        return <div>
            <h3>{entry.date} <Icon name="address book" size="big"/> Discharge: {date} - {criteria}</h3> 
            <p>{entry.description}</p>
        </div>;
    };

    const defineEntry=()=>{
        switch (entry.type) {
            case 'HealthCheck':        
              return <HealthCheckEntry healthCheckRating={entry.healthCheckRating}/>;
              case 'OccupationalHealthcare':        
              return <OccupationalHealthcareEntry employerName={entry.employerName}/>;
              case 'Hospital':        
              return <HospitalEntry date={entry.discharge.date} criteria={entry.discharge.criteria}/>;
            default:
              return null;
          }
    };

    return (
            <Segment>
                {defineEntry()}
                {entry.diagnosisCodes?
                        <ul>
                            {entry.diagnosisCodes.map(code=> <li key={code}>{code} {codes[code]}</li>)}
                        </ul>
                        :null}
            </Segment>
    );
}

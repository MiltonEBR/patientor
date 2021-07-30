import React, { useEffect, useState } from 'react';
import { addPatient, updatePatient, useStateValue } from "../state";
import axios from "axios";
import { Diagnosis,Patient,Entry } from "../types";
import { apiBaseUrl } from "../constants";
import { useParams } from 'react-router';
import { Button, Icon, Modal, Segment } from 'semantic-ui-react';

import Entries from '../components/Entries';
import AddEntry, { EntryFormValues } from './AddEntry';

export default function PatientInfo() {

    const [{ patients }, dispatch] = useStateValue();
    const { id } = useParams<{ id: string }>();
    const [patient,setPatient]=useState<Patient | undefined>();
    const [codes,setCodes]=useState<{[code:string]:string}>({});

    //form
    const [modalOpen, setModalOpen] = React.useState<boolean>(false);
    const [error, setError] = React.useState<string | undefined>();

    const openModal = (): void => setModalOpen(true);

    const closeModal = (): void => {
        setModalOpen(false);
        setError(undefined);
    };

    useEffect(()=>{
        if(patients[id] && patients[id].ssn){
            setPatient(patients[id]);
        }else{
            axios.get<Patient>(`${apiBaseUrl}/patients/${id}`)
            .then(res=>{
                const { data : newPatient}=res;
                setPatient(newPatient);
                if(patients[id]){
                    dispatch(updatePatient(newPatient));
                }else{
                    dispatch(addPatient(newPatient));
                }
            })
            .catch((e)=>console.error(e.response?.data || 'Unknown Error'));
        }


    },[]);

    useEffect(()=>{
        if(Object.keys(codes).length===0 && patients[id] && patients[id].entries){
                getCodeNames(patients[id].entries); // eslint-disable-line
        }
    },[patients]);

    const getCodeNames=async (entries:Entry[])=>{
        const updated={...codes};
        for(const entry of entries){
            if(!entry.diagnosisCodes) return;
            for(const code of entry.diagnosisCodes){
                try{
                    const {data:diagnose} = await axios.get<Diagnosis>(`${apiBaseUrl}/diagnosis/${code}`);
                    updated[code]=diagnose.name;
                }catch(e){
                    console.error(e.response?.data || 'Unknown Error');
                    updated[code]='';
                }
                
            }
        }
        setCodes(updated);
    };

    interface ModalProps {
        modalOpen: boolean;
        onClose: () => void;
        onSubmit: (values: EntryFormValues) => void;
        error?: string;
      }

    const AddEntryModal=({ modalOpen, onClose, onSubmit, error }: ModalProps) => (
        <Modal open={modalOpen} onClose={onClose} centered={false} closeIcon>
          <Modal.Header>Add a new entry</Modal.Header>
          <Modal.Content>
            {error && <Segment inverted color="red">{`Error: ${error}`}</Segment>}
            <AddEntry onSubmit={onSubmit} onCancel={onClose} />
          </Modal.Content>
        </Modal>
      );

      type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;// eslint-disable-line

    //   const assertNever = (value: never): never => {
    //     throw new Error(
    //       `Unhandled discriminated union member: ${JSON.stringify(value)}`
    //     );
    //   };

      const submitNewEntry = async (values: EntryFormValues) => {
        try {

            // const isHealthCheck = (param: any): param is HealthCheckRating => {
            //     return Object.values(HealthCheckRating).includes(param);
            //   };

            // const isBasicEntry=(entry:any):boolean=>{
            //     if(!entry.description || !entry.date || !entry.specialist) return false;
            //     return true;
            // };

            // const makeHospital=(entry:any): entry is DistributiveOmit<Entry,"id"> =>{
            //     if(isBasicEntry(entry) && entry.type==="Hospital" && entry.dateDischarge && entry.criteria) return true;
            //     else return false;
            // };

            // const makeHealthCheck=(entry:any): entry is DistributiveOmit<Entry,"id"> =>{
            //     if(isBasicEntry(entry) && entry.type==="HealthCheck" && entry.healthCheckRating && isHealthCheck(Number(entry.healthCheckRating))) return true;
            //     else return false;
            // };

            // const makeOccupational=(entry:any): entry is DistributiveOmit<Entry,"id"> =>{
            //     if(isBasicEntry(entry) && entry.type==="OccupationalHealthcare" && entry.employerName) return true;
            //     else return false;
            // };

            const typeProperties : any = {// eslint-disable-line
                type:values.type,
                description:values.description,
                date:values.date,
                specialist:values.specialist,
            };
            switch (typeProperties.type) {
                case "Hospital":
                    if(values.dateDischarge && values.criteria) typeProperties.discharge = {date:values.dateDischarge,criteria:values.criteria};
                    break;
                case "HealthCheck":
                    typeProperties.healthCheckRating=Number(values.healthCheckRating);
                    break;
                case "OccupationalHealthcare":
                    if(values.employerName) typeProperties.employerName=values.employerName;
                    if(values.startDate && values.endDate) typeProperties.sickLeave={startDate:values.startDate, endDate:values.endDate};
                    break;
                default:
                    return;
            }

            const formattedValues : DistributiveOmit<Entry,"id"> = typeProperties;// eslint-disable-line
            

            if(values.diagnosisCodes) formattedValues.diagnosisCodes=values.diagnosisCodes;

            

          const { data: newPatient } = await axios.post<Patient>(
            `${apiBaseUrl}/patients/${id}/entries`,
            formattedValues
          );
          dispatch(updatePatient(newPatient));
          setPatient(newPatient);
          closeModal();
        } catch (e) {
          console.error(e.response?.data || 'Unknown Error');
          setError(e.response?.data?.error || 'Unknown error');
        }
      };

    return (
        <div>
            {patient ? <div>
                <h2>{patient.name} {patient.gender==="male"? <Icon name="mars" size={"big"}/>:<Icon name="venus"size={"big"}/>}</h2>
                <p>SSN: {patient.ssn}</p>
                <p>Occupation: {patient.occupation}</p>
                <h3>Entries</h3>
                {patient.entries.map(entry=>
                    ( <Entries entry={entry} key={entry.id} codes={codes}/>)
                )}
                <AddEntryModal
                    modalOpen={modalOpen}
                    onSubmit={submitNewEntry}
                    error={error}
                    onClose={closeModal}
                />
                <Button onClick={() => openModal()}>Add New Entry</Button>
            </div>
            : <h2>loading...</h2>}
        </div>
    );
}

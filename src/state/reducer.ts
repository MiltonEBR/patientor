import { State } from "./state";
import { Diagnosis, Patient } from "../types";

export type Action =
  | {
      type: "SET_PATIENT_LIST";
      payload: Patient[];
    }
  | {
      type: "ADD_PATIENT";
      payload: Patient;
    }
  | {
      type: "UPDATE_PATIENT";
      payload: Patient
    }
  | {
    type: "SET_DIAGNOSIS";
    payload: Diagnosis[];
  };

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_PATIENT_LIST":
      return {
        ...state,
        patients: {
          ...action.payload.reduce(
            (memo, patient) => ({ ...memo, [patient.id]: patient }),
            {}
          ),
          ...state.patients
        }
      };
    case "ADD_PATIENT":
      return {
        ...state,
        patients: {
          ...state.patients,
          [action.payload.id]: action.payload
        }
      };
    case "UPDATE_PATIENT":
      const updated:Patient={...state.patients[action.payload.id]};
      updated.ssn=action.payload.ssn;
      // updated.entries
      return {
        ...state,
        patients:{
          ...state.patients,
          [action.payload.id]: updated
        }
      };
    case "SET_DIAGNOSIS":
      return{
        ...state,
        diagnosis: [...action.payload],
      };
    default:
      return state;
  }
};

export const setDiagnosis=(diagnoseList : Diagnosis[]):Action=>{
  return { type: "SET_DIAGNOSIS", payload: diagnoseList };
};

export const setPatientList=(patientList : Patient[]):Action=>{
  return { type: "SET_PATIENT_LIST", payload: patientList };
};

export const addPatient=(patient:Patient): Action=>{
  return { type: "ADD_PATIENT", payload: patient };
};

export const updatePatient=(patient:Patient):Action =>{
  return { type: "UPDATE_PATIENT", payload: patient };
};

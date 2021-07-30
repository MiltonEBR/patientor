import React from "react";
import { Grid, Button } from "semantic-ui-react";
import { Field, Formik, Form } from "formik";

import { SelectField, HealthOption} from "./FormField";
import { Entry, HealthCheckRating} from "../types";
import { useStateValue } from "../state";
import { DiagnosisSelection, TextField } from "../AddPatientModal/FormField";

export interface EntryFormValues extends Omit<Entry, "id">{
  healthCheckRating?: HealthCheckRating,
  dateDischarge?:string,
  criteria?:string,
  employerName?:string,
  startDate?:string,
  endDate?:string,
}

const isDate = (date: string): boolean => {
  return Boolean(Date.parse(date));
};

interface Props {
  onSubmit: (values: EntryFormValues) => void;
  onCancel: () => void;
}

const healthOptions: HealthOption[] = [
    { value: HealthCheckRating.Healthy,label:"Healthy"},
    { value: HealthCheckRating.LowRisk, label: "Low" },
    { value: HealthCheckRating.HighRisk, label: "High" },
    { value: HealthCheckRating.CriticalRisk, label: "Critical" }
  ];
  
const typeOptions : HealthOption[] =[
    {value: "HealthCheck", label: "HealthCheck"},
    {value: "OccupationalHealthcare", label: "OccupationalHealthcare"},
    {value: "Hospital", label: "Hospital"},
];

export const AddEntry = ({ onSubmit, onCancel } : Props ) => {
    const [{ diagnosis }] = useStateValue();

  return (
    <Formik
      initialValues={{
        description: "",
        specialist: "",
        date: "",
        diagnosisCodes: [],
        type:"HealthCheck",
        healthCheckRating: HealthCheckRating.Healthy,
        dateDischarge:"",
        criteria:"",
        employerName:"",
        startDate:"",
        endDate:"",
      }}
      onSubmit={onSubmit}
      validate={values => {
        const requiredError = "Field is required";
        const dateError = "Not a valid date";
        const errors: { [field: string]: string } = {};
        if (!values.description) {
          errors.description = requiredError;
        }
        if (!values.specialist) {
          errors.specialist = requiredError;
        }
        if (!values.date) {
          errors.date = requiredError;
        }
        if(values.date && !isDate(values.date)) errors.date=dateError;

        if (values.type==="OccupationalHealthcare") {
          if(!values.employerName) errors.employerName = requiredError;
          if(values.startDate && !values.endDate) errors.endDate="If there's a sick leave, you must fill both dates";
          if(!values.startDate && values.endDate) errors.startDate="If there's a sick leave, you must fill both dates";

          if(values.startDate && !isDate(values.startDate)) errors.startDate=dateError;
          if(values.endDate && !isDate(values.endDate)) errors.endDate=dateError;
        }

        if(values.type==="Hospital"){
          if(!values.criteria) errors.criteria=requiredError;
          if(!values.dateDischarge) errors.dateDischarge=requiredError;
          if(values.dateDischarge && !isDate(values.dateDischarge)) errors.dateDischarge=dateError;
        }
        return errors;
      }}
    >
      {({ isValid, dirty, setFieldValue, setFieldTouched, values }) => {
        return (
          <Form className="form ui">
            <Field
              label="Description"
              placeholder="Description"
              name="description"
              component={TextField}
            />
            <Field
              label="Specialist"
              placeholder="Specialist"
              name="specialist"
              component={TextField}
            />
            <Field
              label="Date"
              placeholder="YYYY-MM-DD"
              name="date"
              component={TextField}
            />
            <DiagnosisSelection
                setFieldValue={setFieldValue}
                setFieldTouched={setFieldTouched}
                diagnoses={Object.values(diagnosis)}
            />
            <SelectField
              label="Type"
              name="type"
              options={typeOptions}
            />
            {values.type==="HealthCheck" &&
            <SelectField
                label="Health Rating"
                name="healthCheckRating"
                options={healthOptions}
              />}
            {values.type==="Hospital" && (
                <section>
                    <h4>Discharge</h4>
                    <Field
                        label="Date"
                        placeholder="YYYY-MM-DD"
                        name="dateDischarge"
                        component={TextField}
                    />
                    <Field
                        label="Criteria"
                        placeholder="Criteria"
                        name="criteria"
                        component={TextField}
                    />
                    <br />
              </section>
            )
            }
            {values.type==="OccupationalHealthcare" && (
                <section>
                <Field
                    label="Employer Name"
                    placeholder="Name"
                    name="employerName"
                    component={TextField}
                />
                <h4>Sick Leave</h4>
                <Field
                        label="Start Date"
                        placeholder="YYYY-MM-DD"
                        name="startDate"
                        component={TextField}
                />
                <Field
                        label="End Date"
                        placeholder="YYYY-MM-DD"
                        name="endDate"
                        component={TextField}
                />
                <br />
                </section>
            )}
            <Grid>
              <Grid.Column floated="left" width={5}>
                <Button type="button" onClick={onCancel} color="red">
                  Cancel
                </Button>
              </Grid.Column>
              <Grid.Column floated="right" width={5}>
                <Button
                  type="submit"
                  floated="right"
                  color="green"
                  disabled={!dirty || !isValid}
                >
                  Add
                </Button>
              </Grid.Column>
            </Grid>
          </Form>
        );
      }}
    </Formik>
  );
};

export default AddEntry;

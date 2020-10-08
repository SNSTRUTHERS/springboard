-- Design the schema for a medical center.
--  - A medical center employs several doctors
--  - A doctor can see many patients
--  - A patient can be seen by many doctors
--  - During a visit, a patient may be diagnosed to have one or more diseases.

DROP DATABASE IF EXISTS medical_center;
CREATE DATABASE medical_center;
\c medical_center;

----------------------------------------------------------------------------------------------------

-- list of employed doctors
CREATE TABLE doctors (
    id SERIAL PRIMARY KEY,
    first_name TEXT,        -- The doctor's first
    last_name TEXT,         -- ...and last name
    medical_degree DATE     -- The date the doctor received their medical degree
);

-- list of medical center patients
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    date_of_birth DATE
);

-- list of patient-doctor visits
CREATE TABLE visits (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER REFERENCES doctors,   -- which doctor headed the visit
    patient_id INTEGER REFERENCES patients, -- which patient is visiting
    start_time TIMESTAMP,                   -- when the visit started
    end_time TIMESTAMP                      -- when the visit ended
);

-- list of diagnoses given to patients
CREATE TABLE diagnoses (
    id SERIAL PRIMARY KEY,
    visit_id INTEGER REFERENCES visits, -- which visit the diagnosis was given
    ailment TEXT NOTNULL                -- the disease/ailment name
);

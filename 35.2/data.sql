\c biztime

DROP TABLE IF EXISTS company_industries;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS industries;

CREATE TABLE companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
);

CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

CREATE TABLE industries (
    code text PRIMARY KEY,
    industry text NOT NULL
);

CREATE TABLE company_industries (
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    ind_code  text NOT NULL REFERENCES industries ON DELETE CASCADE,
    PRIMARY KEY (comp_code, ind_code)
);

INSERT INTO companies
VALUES
    ('apple', 'Apple Computer', 'Maker of macOS.'),
    ('ibm',   'IBM',            'Big blue.'),
    ('wb',    'Warner Bros',    'Trash movie studio.')
;

INSERT INTO invoices (comp_code, amt, paid, paid_date)
VALUES
    ('apple', 100, false, null),
    ('apple', 200, false, null),
    ('apple', 300, true, '2018-01-01'),
    ('ibm',   400, false, null)
;

INSERT INTO industries
VALUES
    ('cse', 'Computer Science'),
    ('web', 'Web Services'),
    ('mov', 'Motion Pictures/Film'),
    ('acc', 'Accounting')
;

INSERT INTO company_industries
VALUES
    ('apple', 'cse'),
    ('ibm',   'cse'),
    ('wb',    'mov')
;

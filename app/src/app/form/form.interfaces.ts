import { Status } from '../status/status.interfaces';

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
export interface Editable {
    dirty?:             boolean;
    editing?:           boolean;    
};

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
export interface Unit {
    unit_id:            number;
    unit_desc:          string;
    criteria?:          Criterium[]; 
};


export interface Criterium {
    criterium_id:       number;
    criterium_desc:     string;
    criterium_caption:  string;
};


export interface Form {
    org_id:             number;
    aspect_id:          number;
};


export interface Question extends Form, Editable {
    question_id:        number;    
    question_desc:      string;
    question_text?:     string;
    question_base?:     string;
    question_order?:    number;
    created_at?:        Date;
    start_ageing?:      Date;
    expiration?:        Date;
    tstamp_ref?:        Date;
    tstamp_upper?:      Date;
    number_ref?:        number;
    number_upper?:      number;
    mandatory:          boolean;
    criterium_id:       number;
    weight:             number;
    unit_id:            number;

    unit?:              Unit;
    answer?:            Answer;
};


export interface Fill extends Form {
    fill_id:            number;
    grade?:             number;
    recalc?:            number; 
    created_by?:        number;
    created_at?:        Date;
    accepted:           boolean;
    
    answers?:           Answer[];
};


export interface Answer extends Editable {
    answer_id:          number;
    fill_id:            number;
    question_id:        number;
    value_number?:      number;
    value_tstamp?:      Date;
    value_image?:       string;
    value_bool?:        boolean;
    accepted?:          boolean;
    comment?:           string;
    recalc?:            number;
};
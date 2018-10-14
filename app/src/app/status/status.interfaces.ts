export interface Editable {
    dirty?:        boolean;
    editing?:      boolean;    
}


export interface Aspect extends Editable {
    aspect_id:     number;
    aspect_desc:   string;
    aspect_order:  number;
    route:         string;
    icon:          string;
};


export interface Org extends Editable {
    org_id:        number;
    parent_org_id?:number;
    org_name:      string;
    org_type:      string;
    org_sigla:     string;
    org_order:     number;
    depth:         number;
    chief:         string;
    url:           string;
    status?:       Status[];
    
    path?:          number[];
//    has_aspect?:    boolean;
//    children?:      Org[];
//    ancestry?:      number[];
//    has_children?:  boolean;
};

export interface Grade {
    org_id:         number;
    aspect_id:      number;
    grade:          number;
}

export interface Status extends Aspect, Org, Grade {
    has_aspect:    boolean;
    org?:           Org; 
};



export interface Geo {
    geo_id:        number;
    geo_name:      string;
    geo_order:     number;
    subprefeitura: string;
    reg_id?:       number;
    counts?:       Count[];
    bairros?:      Bairro[];
    area?:         number;
    population?:   number;
    
    bbox?:          number[];
};


export interface Bairro {
    geo_id:         number;
    geo_name:       string;
    bairro_id:      number;
};


export interface Store {
    store_id:       number;
    event_id?:      number;
    mimetype?:      string;
    created_at?:    Date;
};


/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
export interface Count {
    eventtype_id:   number;
    eventtype_order:   number;
    eventtype_desc:   string;
    geo_id:   number;
    event_count:   number;
    marker: string;
    router: string;
    icon: string;
    
};

export interface Event {
    geo_id:         number;
    event_id:       number;
    eventtype_id:   number;
    eventstatus_id: number;
    severity_id:    number;
    lat?:           number;
    lon?:           number;
    created_at?:    Date;
    created_by?:    number;
    status?:        EventStatus;
    eventtype?:     EventType;
    severity?:      Severity;
    
    files?:         Store[];
};

export interface EventGeo {
    eventtype_id:   number;
    geo_id:         number;
    enabled:        boolean;
};


export interface EventType extends Editable {
    eventtype_id:       number;
    eventtype_desc:     string;
    eventtype_order:    number;
    icon:               string;
    route:              string;
    marker:             string;
};

export interface EventStatus extends Editable {
    eventstatus_id:     number;
    eventstatus_desc:   string;
    eventstatus_order:    number;
    icon:               string;
};

export interface Severity extends Editable {
    severity_id:        number;
    severity_desc:      string;
};

export interface Scale extends Editable {
    grade:              number;
    message:            string;
    
    bgColor:           string;
    fgColor:           string;
}



/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
export interface AllowGeo {
    user_id:        number;
    ibge_id:        number;
}


export interface DTB_IBGE {
    ibge_id?:       number;
    toponimia?:     string;

    estado_id?:     number;
    sigla?:         string;
    
    selected?:      boolean;
}


export interface DTB_Macro extends DTB_IBGE {
    estados:        DTB_Estado[];
}


export interface DTB_Estado extends DTB_IBGE {
    meso:           DTB_Meso[];
    
    capital:        DTB_Municipio;
    capital_id:     number;
    
    macro:          DTB_Macro;
    macro_id:       number;
}


export interface DTB_Municipio extends DTB_IBGE {
    estado?:        DTB_Estado;
    
    micro_id?:      number;
    meso_id?:       number;
    
    distritos:      DTB_Distrito[];
    subdistritos:   DTB_SubDistrito[];
}


export interface DTB_Meso extends DTB_IBGE {
    munis:          DTB_Municipio[];
}

export interface DTB_Micro extends DTB_IBGE {
    munis:          DTB_Municipio[];
}

export interface DTB_Distrito extends DTB_IBGE {
    municipio_id?:  number;
}

export interface DTB_SubDistrito extends DTB_IBGE {
    municipio_id?:  number;
}
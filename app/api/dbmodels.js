'use strict'

const db = require ('./dbconn.js');

const sn     = (process.env.PG_INSIT_SCHEMA || 'insit') + '.';
const sn_dtb = (process.env.PG_DTB_SCHEMA   || 'dtb'  ) + '.';


const q = { useAuth: false };

q.plain_models = {
     org:           { tableName: sn+'org',          idAttribute: 'org_id',         orderAttribute: 'org_order' },
     units:         { tableName: sn+'units',        idAttribute: 'unit_id' },
     scales:        { tableName: sn+'scales',       idAttribute: 'grade'    },
     events:        { tableName: sn+'events',       idAttribute: 'event_id'  },
     aspects:       { tableName: sn+'aspects',      idAttribute: 'aspect_id',      orderAttribute: 'aspect_order' },
     twitter:       { tableName: sn+'twitter',      idAttribute: 'twitter_id'  },
     criteria:      { tableName: sn+'criteria',     idAttribute: 'criterium_id'},
     severities:    { tableName: sn+'severities',   idAttribute: 'severity_id',    orderAttribute: 'severity_order'},
     eventtypes:    { tableName: sn+'eventtypes',   idAttribute: 'eventtype_id',   orderAttribute: 'eventtype_order'},
     eventstatus:   { tableName: sn+'eventstatus',  idAttribute: 'eventstatus_id', orderAttribute: 'eventstatus_order'},
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
q.GeoColors = db.Model.extend({ tableName: sn+'geo_colors' });
q.GeoGeomRM = db.Model.extend({ tableName: sn+'geo_geom_rm' });
q.GeoGeom = db.Model.extend  ({ tableName: sn+'geo_geom' });

q.DTB     = db.Model.extend({ tableName: sn+'dtb'     });
q.DTB_mun = db.Model.extend({ tableName: sn+'dtb_mun' });
q.DTB_dis = db.Model.extend({ tableName: sn+'dtb_sub' });
q.DTB_sub = db.Model.extend({ tableName: sn+'dtb_dis' });

q.Geo = db.Model.extend({ tableName: sn+'geo_data', idAttribute: 'geo_id', 
    events: function() { return this.hasMany (q.Events,     'geo_id') },
    counts: function() { return this.hasMany (q.EventCount, 'geo_id') },
   bairros: function() { return this.hasMany (q.Bairros, 'parent_id') },
});

q.Bairros = db.Model.extend({ tableName: sn+'geo_bairros', idAttribute: 'geo_id', 
    events: function() { return this.hasMany (q.Events,     'geo_id') },
    counts: function() { return this.hasMany (q.EventCount, 'geo_id') },
    regadm: function() { return this.belongsTo (q.Geo, 'parent_id') },
});

q.EventGeom    = db.Model.extend({ tableName: sn+'event_geom' });
q.EventTypeGeo = db.Model.extend({ tableName: sn+'eventtypes_geo' });
q.EventCount   = db.Model.extend({ tableName: sn+'event_count' });
q.EventStatus  = db.Model.extend({ tableName: sn+'eventstatus', idAttribute: 'eventstatus_id'});
q.EventType    = db.Model.extend({ tableName: sn+'eventtypes',  idAttribute: 'eventtype_id'  });
q.Severity     = db.Model.extend({ tableName: sn+'severities',  idAttribute: 'severity_id'   });
q.Event = db.Model.extend({ tableName: sn+'events', idAttribute: 'event_id',
 eventtype: function() { return this.belongsTo(q.EventType,   'eventtype_id') },
  severity: function() { return this.belongsTo(q.Severity,    'severity_id' ) },
    status: function() { return this.belongsTo(q.EventStatus, 'eventstatus_id') },
    bairro: function() { return this.belongsTo(q.Bairros,     'geo_id') },
     files: function() { return this.hasMany(q.Store, 'event_id').through(q.Attach, 'store_id', 'event_id') },
});

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
q.Grade = db.Model.extend({ tableName: sn+'grades', idAttribute: 'grade' });

q.Status = db.Model.extend({ tableName: sn+'status',
    org: function() { return this.belongsTo(q.Org, 'org_id') },
});

q.Org = db.Model.extend({ tableName: sn+'org', idAttribute: 'org_id', 
    status: function() { return this.hasMany (q.Status, 'org_id') },
});

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
q.Criteria = db.Model.extend({ tableName: sn+'criteria', idAttribute: 'criterium_id' });
q.Unit     = db.Model.extend({ tableName: sn+'units',    idAttribute: 'unit_id',
     criteria: function() { return this.belongsToMany(q.Criteria, sn+'unit_criteria',
                                                      'unit_id', 'criterium_id')}
});

q.Question = db.Model.extend({ tableName: sn+'questions', idAttribute: 'question_id', hasTimestamps: ['created_at'],
         unit: function() { return this.belongsTo(q.Unit, 'unit_id') },
    criterium: function() { return this.belongsTo(q.Criteria, 'criterium_id') },
});

q.Fill     = db.Model.extend({ tableName: sn+'fills',   idAttribute: 'fill_id', hasTimestamps: ['created_at'],
      answers: function() { return this.hasMany(q.Answer,  'fill_id') },   
});

q.answer = sn+'answers'
q.Answer   = db.Model.extend({ tableName: sn+'answers', idAttribute: 'answer_id',
     question: function() { return this.belongsTo(q.Question, 'question_id') },                   
});

q.allow = sn+'geo_areas';
q.Allow = db.Model.extend({ tableName: sn+'geo_areas' });

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
q.Store  = db.Model.extend({tableName: sn+'store',  idAttribute: 'store_id', hasTimestamps: ['created_at']})
q.Attach = db.Model.extend({tableName: sn+'attachs', idAttribute: 'store_id',
    file:  function() { return this.belongsTo(q.Store, 'store_id') },
});



///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
q.Style  = db.Model.extend({ tableName: sn_dtb+'styles',   idAttribute: 'style_id' });

q.Dist   = db.Model.extend({ tableName: sn_dtb+'distrito', idAttribute: 'ibge_id'  });

q.SubDist= db.Model.extend({ tableName: sn_dtb+'subdistrito', idAttribute: 'ibge_id'  });

q.Meso   = db.Model.extend({ tableName: sn_dtb+'meso',     idAttribute: 'ibge_id',
    munis: function() { return this.hasMany(q.Mun, 'meso_id') },
});

q.Macro  = db.Model.extend({ tableName: sn_dtb+'macro',    idAttribute: 'ibge_id',
    estados: function() { return this.hasMany(q.Estado, 'macro_id') },
});

q.Mun = db.Model.extend({ tableName: sn_dtb+'municipio',idAttribute: 'ibge_id',
      estado: function() { return this.belongsTo(q.Estado, 'estado_id') },
   distritos: function() { return this.hasMany(q.Dist, 'municipio_id') },
subdistritos: function() { return this.hasMany(q.SubDist, 'municipio_id') },
});

q.Estado = db.Model.extend({ tableName: sn_dtb+'estado', idAttribute: 'ibge_id',  
    style: function() { return this.belongsTo(q.Style, 'style_id') },
    macro: function() { return this.belongsTo(q.Macro, 'macro_id') },
  capital: function() { return this.belongsTo(q.Mun, 'capital_id') },
     meso: function() { return this.hasMany(q.Meso, 'estado_id') },
});


module.exports = q;

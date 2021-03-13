if (typeof MapISF == 'undefined') {
  MapISF = {};
}

/**
 * Manage a data file of ISF
 */
MapISF.DataISF = class DataISF 
{
  /**
   * 
   * @property {String}                   fileName                     The name of the loaded file
   * @property {String}                   fileUrl                      The url of the loaded file
   * @property {Object[]}                 content                      The content of the file
   * @property {Object[]}                 maxValues                    Max values for all content values
   * @property {Object[]}                 minValues                    Min values for all content values
   */
  constructor(fileName, fileUrl)
  {
    this.fileName = fileName;
    this.fileUrl = fileUrl;

    this.content = [];
    this.maxValues = {};
    this.minValues = {};
  }

  /**
   * Load the file data
   * @property {Function}                   callback                    The callback fonction
   */
  load(callback)
  {
    var me = this;

    let jqxhr = $.get(me.fileUrl, null)
    .done(function(content)
    {
      let lines = content.split("\r");
      let headers = lines[0].replaceAll("\n", "").split(";");

      for(let i = 1; i < lines.length; i++)
      {
        let object = {};

        let data = lines[i].split(";");

        for(let j = 0; j < data.length; j++)
        {
          object[headers[j]] = data[j];
        }

        me.content.push(object);
      }

      me.initParisData();
      me.initTotalValues();
      me.initMaxMinValues();
      
      callback();
    });
  }

  /**
   * Init data for Paris
   */  
  initParisData()
  {
    // Concat Paris Data
    let parisData = {
      REGION : "ILE-DE-FRANCE",
      DEPARTEMENT : "PARIS",
      CODE_INSEE : 75056,
      COMMUNE : "PARIS",
      NB_REDEVABLES : 0,
      PAT_MOYEN : 0,
      IMPOTS_MOYEN : 0,
      PAT_TOTAL : 0,
      IMPOTS_TOTAL : 0,
      PAT_TOTAL_SANS_PARIS : -1,
      IMPOTS_TOTAL_SANS_PARIS: -1
    }

    for(let i = 0; i < this.content.length; i++)
    {
      if(this.content[i].DEPARTEMENT == "PARIS")
      {
        parisData.NB_REDEVABLES += parseInt(this.content[i].NB_REDEVABLES);
        parisData.PAT_TOTAL += parseInt(this.content[i].PAT_MOYEN) * parseInt(this.content[i].NB_REDEVABLES);
        parisData.IMPOTS_TOTAL += parseInt(this.content[i].IMPOTS_MOYEN) * parseInt(this.content[i].NB_REDEVABLES);

        this.content.splice(i,1);
      }
    }

    parisData.PAT_MOYEN = parseInt(parisData.PAT_TOTAL / parisData.NB_REDEVABLES);
    parisData.IMPOTS_MOYEN = parseInt(parisData.IMPOTS_TOTAL / parisData.NB_REDEVABLES);

    this.content.push(parisData);
  }

  /**
   * Init total values for all content data
   */  
  initTotalValues()
  {
    for(let i = 0; i < this.content.length; i++)
    {
      if(this.content[i].DEPARTEMENT != "PARIS")
      {
        this.content[i].PAT_TOTAL = parseInt(this.content[i].PAT_MOYEN) * parseInt(this.content[i].NB_REDEVABLES);
        this.content[i].IMPOTS_TOTAL = parseInt(this.content[i].IMPOTS_MOYEN) * parseInt(this.content[i].NB_REDEVABLES);
        this.content[i].PAT_TOTAL_SANS_PARIS = this.content[i].PAT_TOTAL;
        this.content[i].IMPOTS_TOTAL_SANS_PARIS = this.content[i].IMPOTS_TOTAL;
      }
    }
  }

  /**
   * Init Max et Min values from content
   */  
  initMaxMinValues()
  {
    let me = this;

    Object.keys(MapISF.DataVisuType).forEach(prop =>  
    {
      let maxValue = -1;
      let minValue = -1;
      for(let i = 0; i < me.content.length; i++)
      {
        let value = Number(me.content[i][prop]);
        if(value > maxValue)
        {
          maxValue = value;
        }
        if((value < minValue || minValue == -1) && value != -1)
        {
          minValue = value;
        }
      }
      me.maxValues[prop] = maxValue;
      me.minValues[prop] = minValue;
    });
  }
}
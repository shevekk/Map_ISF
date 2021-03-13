if (typeof MapISF == 'undefined') {
  MapISF = {};
}

/**
 * Management of display commune
 */
MapISF.Commune = class Commune 
{
  /**
   * Init commune
   * @property {Array}                   geometry               Geom of the commune
   * @property {Array}                   properties             Array of all properties
   * @property {Object}                  data                   Datas for ISF commune
   */
  constructor(geometry, properties) 
  {
    this.geometry = geometry;
    this.properties = properties;
    this.data = {};
  }

  /**
   * Display commune in the map (if has data)
   * @params {L.LayerGroup}               layerGroup               The layer group display in the map
   * @params {MapISF.DataISF}             dataFile                 Data ISF file display
   * @params {MapISF.DataVisuType}        type                     Type of data display
   */
  draw(layerGroup, dataFile, type)
  {
    if(Object.keys(this.data).length != 0 && this.data[dataFile.fileName] != undefined)
    {
      let geom = [];
      for(let i = 0; i < this.geometry.coordinates[0].length; i++)
      {
        geom.push([this.geometry.coordinates[0][i][1], this.geometry.coordinates[0][i][0]])
      }

      let max = dataFile.maxValues[type];
      let min = dataFile.minValues[type];
      let value = this.data[dataFile.fileName][type];

      if(value != -1)
      {
        let r = 255;
        let g = 0;
        let b = 0;

        g = 255 - ((value - min) / (max - min)) * 255;
        if(g < 0)
          g = 0;

        let color = `rgb(${r}, ${g}, ${b})`;

        var polygon = L.polygon(geom, {color: color, fillOpacity: 0.4})
        .bindPopup("<p><h3>" + this.properties.nom + "</h3>" + value + " " + MapISF.DataVisuType[type] + "</p>");

        layerGroup.addLayer(polygon);
      }
    }
  }

  /**
   * Link with a data file is insee code are the same
   * @params {MapISF.DataISF}            data                 The data file
   */
  addData(data)
  {
    for(let i = 0; i < data.content.length; i++)
    {
      if(data.content[i]["CODE_INSEE"] == this.properties.insee)
      {
        this.data[data.fileName] = data.content[i];
      }
    }
  }
}
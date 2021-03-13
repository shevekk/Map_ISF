if (typeof MapISF == 'undefined') {
  MapISF = {};
}

/**
 * Manage map
 */
MapISF.MapView = class MapView 
{
  /**
   * 
   * @property {L.map}                     map                      The leaflet Map 
   * @property {L.LayerGroup}              layerGroup               Display layer group
   * @property {MapISF.Commune[]}          communes                 Array of all communes
   * @property {MapISF.DataISF[]}          data                     Array of all ISF data
   * @property {String}                    dataSelectedName         Name of the selected file
   * @property {MapISF.DataVisuType}       actualVisu               Name of the curent data visualization
   */
  constructor()
  {
    this.map = null;
    this.layerGroup = new L.LayerGroup();
    this.communes = [];
    this.data = [];
    this.dataSelectedName = "2019";
    this.actualVisu = "NB_REDEVABLES";
  }
  
  /**
   * Initialize the Map
   */
  initMap()
  {
    let me = this;
    
    me.map = L.map('map', {
      center: [46.7213889, 2.4011111],
      zoom: 6,
      layers: [me.layerGroup]
    });
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(me.map);

    // Load datas
    me.loadCommuneJson()
    .then(() => me.loadISFData("2019", "data/ISF_2019.csv")
    .then(() => me.loadISFData("2018", "data/ISF_2018.csv")
    .then(() => me.loadISFData("2017", "data/ISF_2017.csv")
    .then(() => {
      for(let i = 0; i < me.communes.length; i++)
      {
        me.communes[i].draw(me.layerGroup, me.data[0], me.actualVisu);
      }

       me.initUI();
    }))));
  }
  
  /**
   * Initialialize UI of map selection
   */
  initUI()
  {
    var me = this;
    var mapUI = L.control({position: 'topright'});
    mapUI.onAdd = function (map) 
    {
      var div = L.DomUtil.create('div', 'mapUI');
      div.innerHTML += '<div style="text-align:center;"><b>Cartes</b><div>';

      for(let i = 0; i < me.data.length; i++)
      {
        let fileName = me.data[i].fileName;

        Object.keys(MapISF.DataVisuType).forEach(key =>  
        {
          div.innerHTML += '<input id="'+key+'-'+fileName+'" type="radio" name="selectMapRadio" class="selectMapRadio"/><label for="'+ key+'-'+fileName+'">' + MapISF.DataVisuType[key] + ' ' + fileName + '</label><br/>';
        });
      }

      return div;
    };
    mapUI.addTo(me.map);

    $("#" + me.actualVisu + "-" + me.dataSelectedName).prop("checked", true);

    // Action of change map
    $(".selectMapRadio").change(function() 
    {
      me.layerGroup.clearLayers();

      me.actualVisu = $(this)[0].id.split('-')[0];
      me.dataSelectedName = $(this)[0].id.split('-')[1];

      let selectedData = me.data.filter(data => data.fileName == me.dataSelectedName)[0];

      for(let i = 0; i < me.communes.length; i++)
      {
        me.communes[i].draw(me.layerGroup, selectedData, me.actualVisu);
      }
    });
  }

  /**
   * Load the commune json
   */
  loadCommuneJson()
  {
    let me = this;

    return new Promise(function(resolve, reject) {
      let fileName = "data/communes-20190101.json";
      let jqxhr = $.getJSON(fileName, null)
      .done(function(content)
      {
        for(let i = 0; i < content.features.length; i++)
        {
          let geometry = content.features[i].geometry;
          let properties = content.features[i].properties;

          me.communes.push(new MapISF.Commune(geometry, properties));
        }

        resolve();
      });
    });
  }

  /**
   * Load a ISF data file
   * @params {String}                   fileName                    The name of the loaded file
   * @params {String}                   fileUrl                     The url of the loaded file
   */
  loadISFData(fileName, fileUrl)
  {
    let me = this;

    return new Promise(function(resolve, reject) {
      let dataCSV = new MapISF.DataISF(fileName, fileUrl);
      me.data.push(dataCSV);
      
      dataCSV.load(function()
      {
        for(let i = 0; i < me.communes.length; i++)
        {
          me.communes[i].addData(dataCSV);
        }

        resolve();
      });
    });
  }
  
}
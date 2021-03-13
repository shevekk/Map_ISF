if (typeof MapISF == 'undefined') {
  MapISF = {};
}

/**
 * Main class 
 */
MapISF.Main = class Main 
{
  /*
   * Init map
   * @property {L.map}                   map                    The leaflet Map 
   */
  constructor() 
  {
    this.map = new MapISF.MapView();
  }

  /**
   * Init the map
   */
  init()
  {
    let me = this;
    
    me.map.initMap();
  }
}
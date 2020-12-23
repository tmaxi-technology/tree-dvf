import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import * as _ from 'underscore';
import * as turf from '@turf/turf';

import * as Highcharts from 'highcharts';
import { IMultiSelectOption, IMultiSelectSettings } from 'ngx-bootstrap-multiselect';
import { LabelType } from 'ng5-slider';
import { NgxSpinnerService } from 'ngx-spinner';

declare let L: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'sf-trees';
  isLayout: any;
  map: any;
  chart: any;
  scatterChart: any;
  data: any;
  cartoMode: any;
  colors: any[] = ["green", "blue", "red", "yellow", "cycan"];
  treesLayer: any;
  caretakerObject: any;
  caretakers: any;
  qSpecies: any={};
  selectedDbh: any;
  dbhObject: any;
  dbhOptions: any;
  legalStatusObject: any;
  selectedLegalStatus: number[];
  legalStatusOptions: IMultiSelectOption[];
  legalStatusSettings: IMultiSelectSettings = {
    enableSearch: true,
    dynamicTitleMaxItems: 0,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    // buttonClasses: 'btn btn-default btn-block custom-width',
  };
  permitNotesObject: any;
  selectedPermitNotes: number[];
  permitNotesOptions: IMultiSelectOption[];
  permitNotesSettings: IMultiSelectSettings = {
    enableSearch: true,
    dynamicTitleMaxItems: 0,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };
  speciesObject: any;
  selectedSpecies: number[];
  speciesOptions: IMultiSelectOption[];
  speciesSettings: IMultiSelectSettings = {
    enableSearch: true,
    dynamicTitleMaxItems: 0,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };
  plotsizeObject: any;
  selectedPlotsize: number[];
  plotsizeOptions: IMultiSelectOption[];
  plotsizeSettings: IMultiSelectSettings = {
    enableSearch: true,
    dynamicTitleMaxItems: 0,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };
  scatter: any;
  scatterOptions: any;
  process: any={};
  startYear: any= 1970;
  dYear: any=5;
  shapeLayer: any;
  editableLayers: any;
  numberTreesOfYear: any;
  numberTreesOfDbh: any;
  numberTreesOfTopFive: any;
  myRenderer: any;
  treesMarker: any;
  selectedTime: any;
  selectedTimeOptions: any = {
    floor: 1970,
    ceil: 2020,
    step: 1,
    disabled: false,
    translate: (value: number, label: LabelType): string => {
      return '';
    }
  };
  selectedDbhOptions: any = {
    floor: 0,
    ceil: 100,
    step: 5,
    disabled: false,
    translate: (value: number, label: LabelType): string => {
      return '';
    }
  };
  histogramOptions: any;
  histogram: any=[];
  chartOptions: any ={
    chart : {
      plotBorderWidth: null,
      plotShadow: false,
      width: 300,
      height: 200
   },
   title : {
      text: undefined   
   },
   tooltip : {
      pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
   },
   plotOptions : {
      pie: {
         allowPointSelect: true,
         cursor: 'pointer',
         dataLabels: {
            enabled: true,
            format: '{point.percentage:.2f} %',
            style: {
               color: 'black'
            }
         }
      }
   },
   series : [{
      type: 'pie',
      name: 'Trees by Caretakers',
      data: []
    }]
  };

  constructor(private spinner: NgxSpinnerService){
  }
  onSpeciesChange(value: any) {
    if(this.treesLayer) this.map.removeLayer(this.treesLayer);
    if(this.shapeLayer) this.editableLayers.removeLayer(this.shapeLayer);
    this.shapeLayer = undefined;
    this.treesMarker = [];
    let features = [];
    _.each(this.data, (item: any, i: number) => {
      if(i<100000){
          if((value.length == 0)){
            this.addTree(item);
            features.push(item);
          } else {
            _.each(value, (index: any) => {
              let specy = this.speciesOptions[index];
              if((item.qSpecies == specy.name)){
                this.addTree(item);
                features.push(item);
              }
            });
          }    
      }
    });

    this.treesLayer = L.layerGroup(this.treesMarker);
    this.treesLayer.addTo(this.map);

    this.updateCaretaker(features);
    this.updateChart();
  }
  onPlotsizeChange(value: any){
    if(this.treesLayer) this.map.removeLayer(this.treesLayer);
    if(this.shapeLayer) this.editableLayers.removeLayer(this.shapeLayer);
    this.shapeLayer = undefined;
    this.treesMarker = [];
    let features = [];
    _.each(this.data, (item: any, i: number) => {
      if(i<100000){
          if((value.length == 0)){
            this.addTree(item);
            features.push(item);
          } else {
            _.each(value, (index: any) => {
              let plotsize = this.plotsizeOptions[index];
              if((item.PlotSize == plotsize.name)){
                // this.addTree(item);
                features.push(item);
              }
            });
          }    
      }
    });

    this.updateCaretaker(features);

    _.each(features, (item: any, i: number) => {
      this.addTree(item);
    });

    this.treesLayer = L.layerGroup(this.treesMarker);
    this.treesLayer.addTo(this.map);

    this.updateChart();
  }
  onDbhChange(){
    console.log(this.selectedDbh);
    if(this.treesLayer) this.map.removeLayer(this.treesLayer);
    if(this.shapeLayer) this.editableLayers.removeLayer(this.shapeLayer);
    this.shapeLayer = undefined;
    this.treesMarker = [];
    let features = [];
    this.scatter = [];
    this.numberTreesOfDbh = 0;
    _.each(this.data, (item: any, i: number) => {
      let year =new Date(item.PlantDate);
      if(i<100000){
        if(item.DBH <= this.selectedDbh && year.getFullYear() <= this.selectedTime){      
          this.numberTreesOfDbh++;     
          // this.addTree(item);
          this.scatter.push([item.DBH, item.SiteOrder]);
          features.push(item);
        }
      }
    });

    this.updateCaretaker(features);
    _.each(features, (item: any, i: number) => {
      this.addTree(item);
    });

    this.treesLayer = L.layerGroup(this.treesMarker);
    this.treesLayer.addTo(this.map);

    this.updateChart();
    this.updateScatter();
  }
  onLegalStatusChange(value: any){
    if(this.treesLayer) this.map.removeLayer(this.treesLayer);
    if(this.shapeLayer) this.editableLayers.removeLayer(this.shapeLayer);
    this.shapeLayer = undefined;
    this.treesMarker = [];
    let features = [];
    _.each(this.data, (item: any, i: number) => {
      if(i<100000){
          if((value.length == 0)){
            this.addTree(item);
            features.push(item);
          } else {
            _.each(value, (index: any) => {
              let qLegalStatus = this.legalStatusOptions[index];
              if((item.qLegalStatus == qLegalStatus.name)){
                // this.addTree(item);
                features.push(item);
              }
            });
          }    
      }
    });

    this.updateCaretaker(features);

    _.each(features, (item: any, i: number) => {
      this.addTree(item);
    });

    this.treesLayer = L.layerGroup(this.treesMarker);
    this.treesLayer.addTo(this.map);

    this.updateChart();

  }

  onPermitNotesChange(value: any){
    if(this.treesLayer) this.map.removeLayer(this.treesLayer);
    if(this.shapeLayer) this.editableLayers.removeLayer(this.shapeLayer);
    this.shapeLayer = undefined;
    this.treesMarker = [];
    let features = [];
    _.each(this.data, (item: any, i: number) => {
      if(i<100000){
          if((value.length == 0)){
            this.addTree(item);
            features.push(item);
          } else {
            _.each(value, (index: any) => {
              let permitNote = this.permitNotesOptions[index];
              if((item.PermitNotes == permitNote.name)){
                // this.addTree(item);
                features.push(item);
              }
            });
          }    
      }
    });

    this.updateCaretaker(features);

    _.each(features, (item: any, i: number) => {
      this.addTree(item);
    });

    this.treesLayer = L.layerGroup(this.treesMarker);
    this.treesLayer.addTo(this.map);

    this.updateChart();

  }

  onSelectedTimeChange(){
    if(this.treesLayer) this.map.removeLayer(this.treesLayer);
    if(this.shapeLayer) this.editableLayers.removeLayer(this.shapeLayer);
    this.treesMarker = [];
    this.numberTreesOfYear = 0;
    this.shapeLayer = undefined;
    this.selectedSpecies = [];
    let features = [];
    _.each(this.data, (item: any, i: number) => {
      let year =new Date(item.PlantDate);
      if(i<100000){
        if(item.DBH <= this.selectedDbh && year.getFullYear() <= this.selectedTime){      
          this.numberTreesOfYear++;     
          // this.addTree(item);
          features.push(item);
        }
      }
    });

    this.updateCaretaker(features);

    _.each(features, (item: any, i: number) => {
      this.addTree(item);
    });

    this.treesLayer = L.layerGroup(this.treesMarker);
    this.treesLayer.addTo(this.map);

    this.updateChart();
  }
  ngOnInit(){
    this.spinner.show();
    this.treesMarker = [];
    this.selectedSpecies = [];
    this.selectedPlotsize = [];
    this.selectedLegalStatus = [];
    this.selectedPermitNotes = [];
    this.scatter = [];
    this.shapeLayer = undefined;
    this.selectedTime = 2020;
    this.selectedDbh = 100;
    this.isLayout = false;
    this.map = L.map('map', {
      center: [37.767683, -122.433701],
      zoom: 12,
      layers: []
    });

    this.cartoMode = false;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    d3.json('./assets/trees-data.json').then((data: any) => {
      // this.data = data;
      console.log(data[0]);

      this.legalStatusObject = _.groupBy(data, (feature:any) => {
        return feature.qLegalStatus;
      });
      this.legalStatusOptions = [];
      _.each(Object.keys(this.legalStatusObject), (key: any, i: number) => {
        this.legalStatusObject[key] = i;
        this.legalStatusOptions.push({ id: i, name: key })
      });

      this.speciesObject = _.groupBy(data, (feature:any) => {
        return feature.qSpecies;
      });
      this.speciesOptions = [];
      _.each(Object.keys(this.speciesObject), (key: any, i: number) => {
        this.qSpecies[key] = i;
        this.speciesOptions.push({ id: i, name: key })
      });

      this.plotsizeObject = _.groupBy(data, (feature:any) => {
        return feature.PlotSize;
      });
      this.plotsizeOptions = [];
      _.each(Object.keys(this.plotsizeObject), (key: any, i: number) => {
        this.plotsizeObject[key] = i;
        this.plotsizeOptions.push({ id: i, name: key })
      });

      this.permitNotesObject = _.groupBy(data, (feature:any) => {
        return feature.PermitNotes;
      });
      this.permitNotesOptions = [];
      _.each(Object.keys(this.permitNotesObject), (key: any, i: number) => {
        this.permitNotesObject[key] = i;
        this.permitNotesOptions.push({ id: i, name: key })
      });

      this.dbhObject = _.groupBy(data, (feature:any) => {
        return feature.DBH;
      });
      this.dbhOptions = [];
      _.each(Object.keys(this.dbhObject), (key: any, i: number) => {
        this.dbhObject[key] = i;
        this.dbhOptions.push({ id: i, name: key })
      });

      this.numberTreesOfYear = data.length;
      this.numberTreesOfDbh = data.length;

      this.updateCaretaker(data);

      this.myRenderer = L.canvas({ padding: 0.5 });
      this.process={};
      _.each(data, (item: any, i: number) => {
        if(i<100000){
          let year = new Date(item.PlantDate);   
          let dy = year.getFullYear() - this.startYear;     
          if(dy>=0){
            let j=Math.floor(dy/this.dYear);   
            this.process[j] = this.process[j] ? this.process[j] + 1 : 1;
          }
          this.addTree(item);
          this.scatter.push([item.DBH, item.SiteOrder]);
        }
      });
      let process=[];
      _.each(Object.keys(this.process), (key: any) => {        
        process.push({ id: key, count: this.process[key] })
      });
      this.process = process;
      this.showHistogram();
      this.showScatter();
  
      this.treesLayer = L.layerGroup(this.treesMarker);
      this.treesLayer.addTo(this.map);

      this.updateChart();
      this.updateScatter();

      this.spinner.hide();
    }).catch((error: any) => {
      console.log(error);
    });

    this.editableLayers = new L.FeatureGroup();
    this.map.addLayer(this.editableLayers);

    var options = {
      position: 'topright',
      draw: {
          polygon: {
              allowIntersection: false, // Restricts shapes to simple polygons
              drawError: {
                  color: '#e1e100', // Color the shape will turn when intersects
                  message: '<strong>Oh snap!<strong> you can\'t draw that!' // Message that will show when intersect
              },
              shapeOptions: {
                  color: '#ff0000',
                  clickable: false
              }
          },
          circle: {
            allowIntersection: false, // Restricts shapes to simple polygons
                drawError: {
                    color: '#00ff00', // Color the shape will turn when intersects
                    message: '<strong>Oh snap!<strong> you can\'t draw that!' // Message that will show when intersect
                },
                shapeOptions: {
                    clickable: false
                }
          }, // Turns off this drawing tool
          rectangle: {
              allowIntersection: false, // Restricts shapes to simple polygons
              drawError: {
                  color: '#0000ff', // Color the shape will turn when intersects
                  message: '<strong>Oh snap!<strong> you can\'t draw that!' // Message that will show when intersect
              },
              shapeOptions: {
                  clickable: false
              }
          },
          marker: false,
          circlemarker: false,
          polyline: false
      },
      edit: {
          featureGroup: this.editableLayers, //REQUIRED!!
          remove: true,
          edit: false
      }
    };
  
    let drawControl = new L.Control.Draw(options);
    this.map.addControl(drawControl);
    
    this.map.on(L.Draw.Event.CREATED, (e: any) => {
      let features = [];

      this.map.removeLayer(this.treesLayer);
      this.treesMarker = [];        
      this.editableLayers.removeLayer(this.shapeLayer);
      let type = e.layerType,
          layer = e.layer;
      layer.setStyle({fillColor: '#ff0000', fillOpacity: 0});
      layer.on("mouseover", (event: any) => {
        console.log(event);
      });
      if(type=="circle"){
        _.each(this.data, (item: any, i: number) => {
          if(i<100000){
            let year =new Date(item.PlantDate);
            if(year.getFullYear() <= this.selectedTime && this.map.distance([item.Latitude, item.Longitude], [layer._latlng.lat, layer._latlng.lng]) < layer._mRadius){
              this.addTree(item);
              features.push(item);
            }
          }
        });
      }
      if(type=="polygon" || type=="rectangle"){
        _.each(this.data, (item: any, i: number) => {
          if(i<100000){
            let points= [];
            _.each(layer._latlngs[0], (item:any) => {
              points.push([item.lat, item.lng]);
            });
            points.push(points[0]);
            let pointsTurt = turf.points([[item.Latitude, item.Longitude]]);
            let polygonTurt = turf.polygon([points]);
            let ptsWithin = turf.pointsWithinPolygon(pointsTurt, polygonTurt);
            let year =new Date(item.PlantDate);

            if(year.getFullYear() <= this.selectedTime && ptsWithin && ptsWithin.features.length >0 ){
              this.addTree(item);
              features.push(item);
            }
          }
        });
      }

      this.updateCaretaker(features);
      this.updateChart();

      this.treesLayer = L.layerGroup(this.treesMarker);
      this.treesLayer.addTo(this.map);  
      this.shapeLayer = layer;
      // this.editableLayers.addLayer(layer);
      // layer.bindPopup(this.treesMarker.length + " items selected", {maxWidth : 400});
      // this.map.eachLayer((layer: any) => {
      //   console.log(layer);
      //   layer.bindPopup(this.treesMarker.length + " items selected");
      // });  
    });

    this.map.on(L.Draw.Event.DELETED, (e: any) => {
      this.shapeLayer = undefined;
      this.map.removeLayer(this.treesLayer);
      this.treesMarker = [];    
      _.each(this.data, (item: any, i: number) => {
        if(i<100000){
          this.addTree(item);
        }
      });
      this.treesLayer = L.layerGroup(this.treesMarker);
      this.treesLayer.addTo(this.map);  
    });
  }

  showHistogram(){
    this.histogramOptions={
      chart : {
        plotBorderWidth: null,
        plotShadow: false,
        width: 300,
        height: 200
      },
      title: {
        text: undefined
      },
      xAxis: {
          // categories: ['Apples', 'Oranges', 'Pears', 'Bananas', 'Plums']
        title:{
          text: undefined
        } 
      },
      labels: {
          items: [{
              // html: 'Total fruit consumption',
              style: {
                  left: '50px',
                  top: '18px',
                  color: ( // theme
                      Highcharts.defaultOptions.title.style &&
                      Highcharts.defaultOptions.title.style.color
                  ) || 'black'
              }
          }]
      },
      plotOptions: {
        series: {
            cursor: 'pointer',
            events: {
                click: (event: any) => {
                  let period = this.histogram[event.point.category].name.split("-");
                  let features=[];
                  this.map.removeLayer(this.treesLayer);
                  this.treesMarker = [];              
                  _.each(this.data, (item: any, i: number) => {
                    if(i<100000){
                      let year =new Date(item.PlantDate);
                      if(year.getFullYear() >= parseInt(period[0]) && year.getFullYear() <= parseInt(period[1])){
                        this.addTree(item);
                        features.push(item);
                      }
                    }
                  });   
                  
                  this.updateCaretaker(features);
                  this.updateChart();
              
                  this.treesLayer = L.layerGroup(this.treesMarker);
                  this.treesLayer.addTo(this.map);              
                }
            }
        }
      },
      series: [{
        type: 'column',
        name: 'Sum of Trees',
        data: []  
      }]
    };
    this.histogramOptions.series[0].data = [];
    this.process = this.process.slice(0, 10);
    _.each(this.process, (item: any) => {
      let id=item.id*this.dYear + this.startYear;
      this.histogram.push({
        name: id + '-' + (id+4),
        y: item.count
      });
    });
    this.histogramOptions.series[0].data = this.histogram;
    // Highcharts.chart("histogram-chart", this.histogramOptions);  
  }

  addTree(item: any){
    let color="green"
    _.each(this.caretakers, (care: any, i: any) => {
      if(care.name == item.qCaretaker){
        color=this.colors[i];
      }
    });
    let marker = L.circleMarker([item.Latitude, item.Longitude], {
      renderer: this.myRenderer,
      radius: 1,
      fillColor: color,// "#28ea3f",//"#0163FF",
      color: color, //"#0163FF",
      weight: 2,
      opacity: 1,
      fillOpacity: 1,    
      item: item
    });
    this.treesMarker.push(marker);

    marker.on("click", (event: any) => {
      let src='../assets/species/' + this.qSpecies[item.qSpecies] + '.gif';
      let tooltip=this.shapeLayer ? "<div style='text-align: center'><h3>" + this.treesMarker.length + " items selected.</h3></div>" : "";
      tooltip+= "<div class='row' style='min-width:560px'>";
      tooltip+="<div class='col-md-3'><img src='" + src + "' alt='Species for tree' width='130px'></div>";
      tooltip+="<div class='col-md-2'>";
      tooltip+="  <div>Caretaker:</div>";
      tooltip+="  <div>Latitude</div>";
      tooltip+="  <div>Longitude</div>";
      tooltip+="  <div>Permitnotes</div>";
      tooltip+="  <div>Plantdate</div>";
      tooltip+="  <div>Qlegalstatus</div>";
      tooltip+="  <div>Qspecies</div>";
      tooltip+="</div>";
      tooltip+="<div class='col-md-5'>";
      tooltip+="  <div><b>"+ item.qCaretaker +"</b></div>";
      tooltip+="  <div><b>"+ item.Latitude +"</b></div>";
      tooltip+="  <div><b>"+ item.Longitude +"</b></div>";
      tooltip+="  <div><b>"+ item.PermitNotes +"</b></div>";
      tooltip+="  <div><b>"+ (new Date(item.PlantDate)).toDateString() +"</b></div>";
      tooltip+="  <div><b>"+ item.qLegalStatus +"</b></div>";
      tooltip+="  <div><b>"+ item.qSpecies +"</b></div>";
      tooltip+="</div>";
      tooltip+="</div>";
      // marker.bindPopup(tooltip, {maxWidth : 400});
      // marker.bindTooltip(tooltip, {direction: "top", maxWidth : 400, zIndex: 999999}).openTooltip();
      // console.log(marker);
      marker.bindPopup(tooltip, {direction: "top", maxWidth : 450}).openPopup();
    });
  }

  showScatter(){
    this.scatterOptions={
      chart: {
        type: 'scatter',
        zoomType: 'xy',
        plotBorderWidth: null,
        plotShadow: false,
        width: 300,
        height: 200,
        showInLegend: false
      },
      title: {
          text: 'DBH Versus SiteOrder'
      },
      subtitle: {
          text: undefined
      },
      xAxis: {
          title: {
              enabled: true,
              text: 'DBH'
          },
          startOnTick: true,
          endOnTick: true,
          showLastLabel: true
      },
      yAxis: {
          title: {
              text: 'SiteOrder'
          }
      },
      legend: {
          layout: 'vertical',
          align: 'left',
          verticalAlign: 'top',
          x: 100,
          y: 70,
          floating: true,
          backgroundColor: Highcharts.defaultOptions.chart.backgroundColor,
          borderWidth: 1
      },
      plotOptions: {
          scatter: {
              marker: {
                  radius: 5,
                  states: {
                      hover: {
                          enabled: true,
                          lineColor: 'rgb(100,100,100)'
                      }
                  }
              },
              states: {
                  hover: {
                      marker: {
                          enabled: false
                      }
                  }
              },
              tooltip: {
                  pointFormat: 'DBH:{point.x} , SiteOrder:{point.y}'
              }
          }
      },
      series: [
        {
          name: '',
          showInLegend: false,
          data: []  
        }
      ]
    };
  }
  updateScatter(){
    this.scatterOptions.series[0].data = this.scatter;
    // this.scatterChart = Highcharts.chart("scatter-chart", this.scatterOptions);  
  }
  updateChart(){
    this.chartOptions.series[0].data = [];
    _.each(this.caretakers, (item: any, i: any) => {
      this.chartOptions.series[0].data.push({
        name: item.name,
        y: item.values.length,
        color: this.colors[i]
      })  
    });
    // this.chart = Highcharts.chart("chart", this.chartOptions);  
  }

  updateCaretaker(features: any){
    this.caretakerObject = _.groupBy(features, (feature:any) => {
      return feature.qCaretaker;
    });
    this.caretakers = [];
    _.each(Object.keys(this.caretakerObject), (key: any, i: number) => {
      this.caretakers.push({name: key, values: this.caretakerObject[key]});
    });
    this.caretakers = _.sortBy(this.caretakers, (caretaker: any) => { 
      return -caretaker.values.length;  
    });
    this.caretakers = this.caretakers.slice(0,5);
    this.numberTreesOfTopFive = 0;
    _.each(this.caretakers, (item: any) => {
      this.numberTreesOfTopFive += item.values.length;
    });
  }
}

import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import { IMultiSelectOption, IMultiSelectSettings } from 'ngx-bootstrap-multiselect';
import { LabelType } from 'ng5-slider';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router,NavigationEnd } from '@angular/router';

import * as d3 from 'd3';
import * as _ from 'underscore';
import * as turf from '@turf/turf';

declare let L: any;

@Component({
  selector: 'app-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss']
})
export class BaseComponent implements OnInit {
  map: any;
  data: any;
  renderer: any;
  colors: any[] = ["green", "blue", "red", "yellow", "cycan"];
  isInit: any;

  treesMarker: any;
  treesLayer: any;
  caretakers: any;
  caretakerObject: any;

  numberTreesOfDbh: any;

  shapeLayer: any;
  editableLayers: any;

  chart: any;
  chartOptions: any;

  qSpecies: any;
  speciesObject: any;
  speciesSelected: number[];
  speciesOptions: IMultiSelectOption[];
  speciesSettings: IMultiSelectSettings = {
    enableSearch: true,
    dynamicTitleMaxItems: 0,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };

  plotSize: any;
  plotSizeObject: any;
  plotSizeSelected: number[];
  plotSizeOptions: IMultiSelectOption[];
  plotSizeSettings: IMultiSelectSettings = {
    enableSearch: true,
    dynamicTitleMaxItems: 0,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };

  qLegalStatus: any;
  legalStatusObject: any;
  legalStatusSelected: number[];
  legalStatusOptions: IMultiSelectOption[];
  legalStatusSettings: IMultiSelectSettings = {
    enableSearch: true,
    dynamicTitleMaxItems: 0,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };

  permitNotes: any;
  permitNotesObject: any;
  permitNotesSelected: number[];
  permitNotesOptions: IMultiSelectOption[];
  permitNotesSettings: IMultiSelectSettings = {
    enableSearch: true,
    dynamicTitleMaxItems: 0,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };

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

  selectedDbh: any;
  selectedDbhOptions: any = {
    floor: 0,
    ceil: 100,
    step: 5,
    disabled: false,
    translate: (value: number, label: LabelType): string => {
      return '';
    }
  };
  constructor(private spinner: NgxSpinnerService, private router: Router) {
    this.qSpecies={};
    this.plotSize={};
    this.qLegalStatus={};
    this.permitNotes={};

    this.speciesSelected = [];
    this.plotSizeSelected = [];
    this.legalStatusSelected = [];
    this.permitNotesSelected = [];

    this.treesMarker = [];
    this.shapeLayer = null;
    this.renderer = L.canvas({ padding: 0.5 });

    this.selectedTime = 2020;
    this.selectedDbh = 100;

    this.editableLayers = new L.FeatureGroup();

    // this.router.events.subscribe((e) => {
    //   if (e instanceof NavigationEnd) {
    //       // Function you want to call here
    //       this.isInit=true;
    //   }
    // });
  }

  ngOnInit(): void {
    this.spinner.show();
    this.map = L.map('base-map', {
      center: [37.767683, -122.433701],
      zoom: 12,
      layers: []
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    this.setupChart();
    this.setupDrawing();

    d3.json('./assets/new-trees-data.json').then((data: any) => {
      this.data = data;
      console.log(data[0]);

      let speciesOptions = [];
      this.speciesObject = _.groupBy(data, (feature:any) => {
        return feature.qSpecies;
      });
      _.each(Object.keys(this.speciesObject), (key: any, i: number) => {
        this.qSpecies[key] = i;
        speciesOptions.push({ id: i, name: key, number: this.speciesObject[key].length});
      });
      speciesOptions = _.sortBy(speciesOptions, (item: any,i:any) => {        
        return -item.number;  
      });
      this.speciesOptions = speciesOptions.slice(0,10);
      _.each(this.speciesOptions,(item: any, i:any)=>{
        this.speciesObject[item.id] = item.name;
      }); 
  
      let plotsizeOptions = [];
      this.plotSizeObject = _.groupBy(data, (feature:any) => {
        return feature.PlotSize;
      });
      _.each(Object.keys(this.plotSizeObject), (key: any, i: number) => {
        // this.plotsizeObject[key] = i;
        plotsizeOptions.push({ id: i, name: key, number: this.plotSizeObject[key].length});
      });
      plotsizeOptions = _.sortBy(plotsizeOptions, (item: any) => { 
        return -item.number;  
      });
      this.plotSizeOptions = plotsizeOptions.slice(0,10);
      _.each(this.plotSizeOptions,(item: any, i:any)=>{
        this.plotSize[item.id] = item.name;
      }); 

      let legalStatusOptions = [];
      this.legalStatusObject = _.groupBy(data, (feature:any) => {
        return feature.qLegalStatus;
      });
      _.each(Object.keys(this.legalStatusObject), (key: any, i: number) => {
        // this.legalStatusObject[key] = i;
        legalStatusOptions.push({ id: i, name: key, number: this.legalStatusObject[key].length })
      });
      legalStatusOptions = _.sortBy(legalStatusOptions, (item: any) => { 
        return -item.number;  
      });
      this.legalStatusOptions = legalStatusOptions.slice(0,10);
      _.each(this.legalStatusOptions,(item: any, i:any)=>{
        this.qLegalStatus[item.id] = item.name;
      }); 

      let permitNotesOptions = [];
      this.permitNotesObject = _.groupBy(data, (feature:any) => {
        return feature.PermitNotes;
      });
      _.each(Object.keys(this.permitNotesObject), (key: any, i: number) => {
        // this.permitNotesObject[key] = i;
        permitNotesOptions.push({ id: i, name: key, number: this.permitNotesObject[key].length })
      });
      permitNotesOptions = _.sortBy(permitNotesOptions, (item: any) => { 
        return -item.number;  
      });
      this.permitNotesOptions = permitNotesOptions.slice(0,10);
      _.each(this.permitNotesOptions,(item: any, i:any)=>{
        this.permitNotes[item.id] = item.name;
      }); 

      let features = [];
      _.each(this.data, (item: any, i: number) => {
        // if(i<100000){
          // this.addTree(item);
          features.push(item);
        // }
      });
      this.numberTreesOfDbh = data.length;
      this.treesLayer = L.layerGroup(this.treesMarker);
      this.treesLayer.addTo(this.map);
  
      // this.updateCaretaker(data);
      this.updateCaretaker(features);
      this.updateChart();
      this.spinner.hide();
    }).catch((error: any) => {
      console.log(error);
      this.spinner.hide();
    });
  }

  onSpeciesChange(value: any){
    // if(this.isInit){
      if(this.treesLayer) this.map.removeLayer(this.treesLayer);
      // if(this.shapeLayer) this.editableLayers.removeLayer(this.shapeLayer);
      // this.shapeLayer = undefined;
      this.treesMarker = [];
      let features = [];
      _.each(this.data, (item: any, i: number) => {
        // if(i<100000){
            if((value.length == 0)){
              this.addTree(item);
              features.push(item);
            } else {
              _.each(value, (index: any) => {              
                let qSpecies = this.speciesObject[index];
                if((item.qSpecies == qSpecies)){
                  this.addTree(item);
                  features.push(item);
                }
              });
            }    
        // }
      });

      this.treesLayer = L.layerGroup(this.treesMarker);
      this.treesLayer.addTo(this.map);

      this.updateCaretaker(features);
      this.updateChart();
    // }
    // this.updateScatter();
  }

  onPlotSizeChange(value: any){
    if(this.isInit){
      if(this.treesLayer) this.map.removeLayer(this.treesLayer);
      // if(this.shapeLayer) this.editableLayers.removeLayer(this.shapeLayer);
      // this.shapeLayer = undefined;
      this.treesMarker = [];
      let features = [];
      _.each(this.data, (item: any, i: number) => {
        // if(i<100000){
            if((value.length == 0)){
              this.addTree(item);
              features.push(item);
            } else {
              _.each(value, (index: any) => {
                let plotSize = this.plotSize[index];
                if((item.PlotSize == plotSize)){
                  this.addTree(item);
                  features.push(item);
                }
              });
            }    
        // }
      });

      _.each(features, (item: any, i: number) => {
        this.addTree(item);
      });

      this.treesLayer = L.layerGroup(this.treesMarker);
      this.treesLayer.addTo(this.map);
      
      this.updateCaretaker(features);
      this.updateChart();
    }
  }

  onLegalStatusChange(value: any){
    if(this.isInit){
      if(this.treesLayer) this.map.removeLayer(this.treesLayer);
      // if(this.shapeLayer) this.editableLayers.removeLayer(this.shapeLayer);
      // this.shapeLayer = undefined;
      this.treesMarker = [];
      let features = [];
      _.each(this.data, (item: any, i: number) => {
        // if(i<100000){
            if((value.length == 0)){
              this.addTree(item);
              features.push(item);
            } else {
              _.each(value, (index: any) => {
                let qLegalStatus = this.qLegalStatus[index];
                if((item.qLegalStatus == qLegalStatus)){
                  this.addTree(item);
                  features.push(item);
                }
              });
            }    
        // }
      });

      _.each(features, (item: any, i: number) => {
        this.addTree(item);
      });

      this.treesLayer = L.layerGroup(this.treesMarker);
      this.treesLayer.addTo(this.map);

      this.updateCaretaker(features);
      this.updateChart();
    }
  }

  onPermitNotesChange(value: any){
    if(this.isInit){
      if(this.treesLayer) this.map.removeLayer(this.treesLayer);
      // if(this.shapeLayer) this.editableLayers.removeLayer(this.shapeLayer);
      // this.shapeLayer = undefined;
      this.treesMarker = [];
      let features = [];
      _.each(this.data, (item: any, i: number) => {
        // if(i<100000){
            if((value.length == 0)){
              this.addTree(item);
              features.push(item);
            } else {
              _.each(value, (index: any) => {
                let permitNotes = this.permitNotes[index];
                let name=item.PermitNotes?item.PermitNotes:'null';

                if((name === permitNotes)){
                  this.addTree(item);
                  features.push(item);
                }
              });
            }    
        // }
      });

      _.each(features, (item: any, i: number) => {
        this.addTree(item);
      });

      this.treesLayer = L.layerGroup(this.treesMarker);
      this.treesLayer.addTo(this.map);

      this.updateCaretaker(features);
      this.updateChart();
    }
    this.isInit=true;
  }

  onDbhChange(){
    if(this.isInit){
      if(this.treesLayer) this.map.removeLayer(this.treesLayer);
      // if(this.shapeLayer) this.editableLayers.removeLayer(this.shapeLayer);
      // this.shapeLayer = undefined;
      this.treesMarker = [];
      let features = [];
      // this.scatter = [];
      this.numberTreesOfDbh = 0;
      _.each(this.data, (item: any, i: number) => {
        // let year =new Date(item.PlantDate);
        // if(i<100000){
          if(item.DBH <= this.selectedDbh){      
            this.numberTreesOfDbh++;     
            this.addTree(item);
            // this.scatter.push([item.DBH, item.SiteOrder]);
            features.push(item);
          }
        // }
      });

      // _.each(features, (item: any, i: number) => {
      //   this.addTree(item);
      // });

      this.treesLayer = L.layerGroup(this.treesMarker);
      this.treesLayer.addTo(this.map);

      this.updateCaretaker(features);
      this.updateChart();
      // this.updateScatter();
    }
  }

  setupChart(){
    this.chartOptions ={
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
        pointFormat: '{series.name}: <b>{point.y}</b>'
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
  }

  setupDrawing(){
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
          // if(i<100000){
            let year =new Date(item.PlantDate);
            if(year.getFullYear() <= this.selectedTime && this.map.distance([item.Latitude, item.Longitude], [layer._latlng.lat, layer._latlng.lng]) < layer._mRadius){
              this.addTree(item);
              features.push(item);
            }
          // }
        });
      }
      if(type=="polygon" || type=="rectangle"){
        _.each(this.data, (item: any, i: number) => {
          // if(i<100000){
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
          // }
        });
      }

      this.updateCaretaker(features);
      this.updateChart();

      this.treesLayer = L.layerGroup(this.treesMarker);
      this.treesLayer.addTo(this.map);  
      this.shapeLayer = layer;
    });
    let drawControl = new L.Control.Draw(options);
    // this.map.addLayer(this.editableLayers);
    this.map.addControl(drawControl);
  }
  addTree(item: any){
    let color="green"
    _.each(this.caretakers, (care: any, i: any) => {
      if(care.name == item.qCaretaker){
        color=this.colors[i];
      }
    });
    let LeafIcon = L.Icon.extend({
      options: {
        // iconUrl: 'https://www.freeiconspng.com/uploads/triangle-png-28.png',
        iconSize:     [38, 95]
      }
    });
    let greenIcon = new LeafIcon({iconUrl: 'https://www.freeiconspng.com/uploads/triangle-png-28.png'})
    let marker = L.circleMarker([item.Latitude, item.Longitude], {
      renderer: this.renderer,
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

  updateChart(){
    this.chartOptions.series[0].data = [];
    _.each(this.caretakers, (item: any, i: any) => {
      this.chartOptions.series[0].data.push({
        name: item.name,
        y: item.values.length,
        color: this.colors[i]
      })  
    });
    this.chart = Highcharts.chart("chart", this.chartOptions);  
  }

  updateCaretaker(features: any){
    this.caretakers = [];
    this.caretakerObject = _.groupBy(features, (feature:any) => {
      return feature.qCaretaker;
    });
    _.each(Object.keys(this.caretakerObject), (key: any, i: number) => {
      this.caretakers.push({name: key, values: this.caretakerObject[key]});
    });
    this.caretakers = _.sortBy(this.caretakers, (caretaker: any) => { 
      return -caretaker.values.length;  
    });
    this.caretakers = this.caretakers.slice(0,5);
    // this.numberTreesOfTopFive = 0;
    // _.each(this.caretakers, (item: any) => {
    //   this.numberTreesOfTopFive += item.values.length;
    // });
  }
}

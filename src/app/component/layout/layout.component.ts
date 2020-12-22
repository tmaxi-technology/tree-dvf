import { Component, OnInit } from '@angular/core';
import { LabelType } from 'ng5-slider';
import * as Highcharts from 'highcharts';
import * as moment from 'moment';
import * as d3 from 'd3';
import * as _ from 'underscore';

import { Router,NavigationEnd } from '@angular/router';

declare let L: any;

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

  data: any;
  treesMarker: any;
  treesLayer: any;
  renderer: any;
  districtsData: any;
  districtsLayer: any;
  timeObject: any;
  districtMapObject: any;
  districtTableObject: any;
  firstDistrictTableObject: any;
  firstDistrictTable: any;
  districtTable: any;
  startTime: any;

  species: any;
  speciesObject: any;

  siteInfos: any;
  siteInfoObject: any;
  siteInfoChartOptions: any;

  scatter: any;
  histogramOptions: any;
  scatterOptions: any;

  timeChartOptions: any;
  timeChartSelected: any;

  timeMapSelected: any;
  timeMapOptions: any;

  timeOverviewSelected: any;
  timeOverviewOptions: any;

  timeTableSelected: any;
  timeTableOptions: any;

  typePanel: any;
  isPlayChart: any;
  isPlayMap: any;
  isPlayOverview: any;
  isPlayTable: any;

  timerChart: any;
  timerMap: any;
  timerTable: any;
  timerOverview: any;

  chart: any;
  chartOptions: any;
  map: any;
  numberColor: number;
  colorTable: any;
  maxHeat: any;
  total: number;
  constructor(private router: Router) { 
    this.data={};
    this.total=0;
    this.treesMarker = [];
    this.scatter=[];
    this.renderer = L.canvas({ padding: 0.5 });
    this.numberColor=11;
    this.maxHeat=0;
    this.colorTable=[0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1];
    this.startTime=moment("01/01/1968");
    this.timeObject={};
    this.speciesObject={};
    this.siteInfos=[];
    this.siteInfoObject={};
    this.districtTable=[];
    this.firstDistrictTable=[];
    this.timeChartSelected = {
      start: 1969,
      end: 2020
    };
    this.timeChartOptions = {
      floor: 1969,
      ceil: 2020,
      step: 1,
      disabled: false,
      translate: (value: number, label: LabelType): string => {
        return value.toString();
      }
    };  
    this.timeMapSelected = {
      start: 1969,
      end: 2020
    };
    this.timeMapOptions = {
      floor: 1969,
      ceil: 2020,
      step: 1,
      disabled: false,
      translate: (value: number, label: LabelType): string => {
        return value.toString();
      }
    };  
    this.timeOverviewSelected = {
      start: 1969,
      end: 2020
    };
    this.timeOverviewOptions = {
      floor: 1969,
      ceil: 2020,
      step: 1,
      disabled: false,
      translate: (value: number, label: LabelType): string => {
        return value.toString();
      }
    };  
    this.timeTableSelected = {
      start: 1969,
      end: 2020
    };
    this.timeTableOptions = {
      floor: 1969,
      ceil: 2020,
      step: 1,
      disabled: false,
      translate: (value: number, label: LabelType): string => {
        return value.toString();
      }
    };  
    this.typePanel = 0;
    this.isPlayChart=false;
    this.isPlayMap=false;
    this.isPlayTable=false;
    this.timerChart=0;
    this.timerMap=0;
    this.timerTable=0;
    this.setupChart();

    this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
          // Function you want to call here
          this.setupChart();
          this.setupMap();
          this.setupMask();
          this.setupHistogram();
          // this.setupScatter();
          this.setupSiteInfoChart();
      }
    });
  }

  ngOnInit(): void {
    d3.json('./assets/trees-by-date.json').then((data: any) => {
      this.data=JSON.parse(data);
      console.log(this.data);
      Object.keys(this.data).forEach((key: any) =>{
        if(this.data[key].length > this.maxHeat) {
          this.maxHeat = this.data[key].length;
        }
      });
      this.onTimeChartChange();
      this.onTimeMapChange();
      this.onTimeOverviewChange();    
      this.onTimeTableChange();
    });
    d3.json('./assets/districts-data.geojson').then((data: any) => {
      this.districtsData=data;
    });
  }

  onPlayChartClick(isPlay: any){
    this.isPlayChart = isPlay;
    
    if(isPlay){
      let run = () =>{
        if(this.timeChartSelected.end < 2020){
          this.timeChartSelected.end++;
          this.updateChart();
          this.timerChart = setTimeout(run, 1000);
        } else {
          clearTimeout(this.timerChart);
          this.timerChart = 0;    
          this.isPlayChart = false;
        }
      };
      if(this.timeChartSelected.end==2020){
        this.timeChartSelected.end = this.timeChartSelected.start;
      }
      this.timerChart = setTimeout(run, 100);
    } else {
      clearTimeout(this.timerChart);
      this.timerChart = 0;
    }
  }
  onPlayMapClick(isPlay: any){
    this.isPlayMap = isPlay;
    if(isPlay){
      let run = () =>{
        if(this.timeMapSelected.end < 2020){
          this.timeMapSelected.end++;
          this.onTimeMapChange();
          this.timerMap = setTimeout(run, 1000);
        } else {
          clearTimeout(this.timerMap);
          this.timerMap = 0;    
          this.isPlayMap = false;
        }
      };
      if(this.timeMapSelected.end==2020){
        this.timeMapSelected.end = this.timeMapSelected.start;
      }
      this.timerMap = setTimeout(run, 100);
    } else {
      clearTimeout(this.timerMap);
      this.timerMap = 0;
    }
  }
  onPlayOverviewClick(isPlay: any){
    this.isPlayOverview = isPlay;
    if(isPlay){
      let run = () =>{
        if(this.timeOverviewSelected.end < 2020){
          this.timeOverviewSelected.end++;
          this.onTimeOverviewChange();
          let d=this.timeOverviewSelected.end-this.timeOverviewSelected.start;
          if(d>32)
            this.timerOverview = setTimeout(run, 3000);
          else if(d>23)
            this.timerOverview = setTimeout(run, 2000);
          else
            this.timerOverview = setTimeout(run, 1000);     
        } else {
          clearTimeout(this.timerOverview);
          this.timerOverview = 0;    
          this.isPlayOverview = false;
        }
      };
      if(this.timeOverviewSelected.end==2020){
        this.timeOverviewSelected.end = this.timeOverviewSelected.start;
      }
      this.timerOverview = setTimeout(run, 1000);
    } else {
      clearTimeout(this.timerOverview);
      this.timerOverview = 0;
    }
  }
  onPlayTableClick(isPlay: any){
    this.isPlayTable = isPlay;
    if(isPlay){
      let run = () =>{
        if(this.timeTableSelected.end < 2020){
          this.timeTableSelected.end++;
          this.onTimeTableChange();
          this.timerMap = setTimeout(run, 1000);
        } else {
          clearTimeout(this.timerMap);
          this.timerTable = 0;    
          this.isPlayTable = false;
        }
      };
      if(this.timeTableSelected.end==2020){
        this.timeTableSelected.end = this.timeTableSelected.start;
      }
      this.timerTable = setTimeout(run, 100);
    } else {
      clearTimeout(this.timerTable);
      this.timerTable = 0;
    }
  }
  setupMap(){
    // this.map = L.map('map', {
    //   center: [37.767683, -122.433701],
    //   zoom: 12,
    //   layers: []
    // });
    // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //   attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    // }).addTo(this.map);

    this.map = L.map('layout-map', {
      center: [37.767683, -122.433701],
      zoom: 12,
      layers: []
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

  }
  setupChart(){
    this.chartOptions ={
      chart:{
        height: 500
      },
      title : {
        text: 'Planting Progress for 1968-2020 time.'   
     },
     subtitle : {
        text: 'Source: levominhthu.com'
     },
     xAxis : {
        categories: []
     },
     yAxis : {
        title: {
           text: 'Quantity'
        },
        plotLines: [{
           value: 0,
           width: 1,
           color: '#808080'
        }]
     },   
     tooltip : {
        valueSuffix: ''
     },
      legend : {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle',
        borderWidth: 0
     },
     series :  []
    };
  }
  setupMask(){
    this.treesLayer = L.TileLayer.maskCanvas({
      radius: 5,  // radius in pixels or in meters (see useAbsoluteRadius)
      useAbsoluteRadius: true,  // true: r in meters, false: r in pixels
      color: 'green',  // the color of the layer
      opacity: 1,  // opacity of the not covered area
      noMask: true,  // true results in normal (filled) circled, instead masked circles
      lineColor: 'green'   // color of the circle outline if noMask is true
    });
  }
  setupHistogram(){
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
        categories: [],
        title:{
          text: undefined
        }, 
        labels: {
          enabled: false
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
                // click: (event: any) => {
                //   let period = this.histogram[event.point.category].name.split("-");
                //   let features=[];
                //   this.map.removeLayer(this.treesLayer);
                //   this.treesMarker = [];              
                //   _.each(this.data, (item: any, i: number) => {
                //     if(i<100000){
                //       let year =new Date(item.PlantDate);
                //       if(year.getFullYear() >= parseInt(period[0]) && year.getFullYear() <= parseInt(period[1])){
                //         this.addTree(item);
                //         features.push(item);
                //       }
                //     }
                //   });   
                  
                //   this.updateCaretaker(features);
                //   this.updateChart();
              
                //   this.treesLayer = L.layerGroup(this.treesMarker);
                //   this.treesLayer.addTo(this.map);              
                // }
            }
        }
      },
      series: [{
        type: 'column',
        name: 'Sum of Trees',
        data: []  
      }]
    };
  }
  setupScatter(){
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
  setupSiteInfoChart(){
    this.siteInfoChartOptions ={
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
        name: 'Trees by Site Info',
        data: []
      }]
    };
  }

  updateSiteinfoChart(){
    this.siteInfoChartOptions.series[0].data = [];
    _.each(this.siteInfos, (item: any, i: any) => {
      this.siteInfoChartOptions.series[0].data.push({
        name: item.name,
        y: item.number,
        // color: this.colors[i]
      })  
    });
    Highcharts.chart("layout-chart-site-info", this.siteInfoChartOptions);  
  }
  updateScatter(){
    // this.scatter=this.scatter.slice(0,10);
    this.scatterOptions.series[0].data = this.scatter;
    Highcharts.chart("layout-chart-scatter", this.scatterOptions);  
  }
  updateHistogram(){
    let histogram=[];
    this.histogramOptions.series[0].data = [];
    this.species = this.species.slice(0, 10);
    this.histogramOptions.xAxis.categories=[];
    _.each(this.species, (item: any) => {
      this.histogramOptions.xAxis.categories.push(item.name);
      histogram.push({
        name: item.name,
        y: item.number
      });
    });
    this.histogramOptions.series[0].data = histogram;
    Highcharts.chart("layout-chart-histogram", this.histogramOptions);  
  }
  updateChart(){
    let startTime=moment("01/01/"+this.timeChartSelected.start);
    this.chartOptions.xAxis.categories=[];      
    this.chartOptions.series=[];
    for(let i=0;i<11;i++){
      this.chartOptions.series.push({
        name: 'District '+ (i+1),
        data: []
      });
    }
    this.districtMapObject={};
    this.speciesObject={};
    this.siteInfoObject={};
    this.scatter=[];
    this.total=0;
    for(let i=this.timeChartSelected.start;i<=this.timeChartSelected.end;i++){
      let id=startTime.format("YYYY");
      this.chartOptions.xAxis.categories.push(id)
      _.each(this.data[id], (item: any)=>{
        let key=item[20];
        if(key)
          this.districtMapObject[key]=this.districtMapObject[key]?this.districtMapObject[key]+1:1;
          this.speciesObject[item[2]]=this.speciesObject[item[2]]?this.speciesObject[item[2]]+1:1;
          this.siteInfoObject[item[5]]=this.siteInfoObject[item[5]]?this.siteInfoObject[item[5]]+1:1;
          this.total++;
          // this.scatter.push([item[10], parseInt(item[4])]);
      });
      Object.keys(this.districtMapObject).forEach((key: any)=>{
        if(this.chartOptions.series[key])
          this.chartOptions.series[key].data.push(this.districtMapObject[key]);
      });
      startTime=moment(startTime.add(1, "years").calendar());
    }

    let species=[];
    _.each(Object.keys(this.speciesObject), (key: any, i: number) => {
      species.push({ id: i, name: key, number: this.speciesObject[key]});
    });
    species = _.sortBy(species, (item: any,i:any) => {        
      return -item.number;  
    });
    this.species = species.slice(0,10);

    this.species = _.sortBy(this.species, (item: any,i:any) => {        
      return -item.id;  
    });

    let siteInfos=[];
    _.each(Object.keys(this.siteInfoObject), (key: any, i: number) => {
      siteInfos.push({ id: i, name: key, number: this.siteInfoObject[key]});
    });
    siteInfos = _.sortBy(siteInfos, (item: any,i:any) => {        
      return -item.number;  
    });
    this.siteInfos = siteInfos.slice(0,10);

    Highcharts.chart("layout-chart", this.chartOptions);  
  }
  onTimeChartChange(){
    this.updateChart();
    this.updateHistogram();
    // this.updateScatter();
    this.updateSiteinfoChart();
  }

  onTimeMapChange(){
    this.timeObject={};
    let startTime=moment("01/01/"+this.timeMapSelected.start);
    this.speciesObject={};
    this.siteInfoObject={};
    this.scatter=[];
    this.total=0;
    for(let i=this.timeMapSelected.start;i<=this.timeMapSelected.end;i++){
      let id=startTime.format("YYYY");
      let data=this.data[id];
      if(data){
        this.data[id].forEach((item: any)=>{
          this.timeObject[item[20]]=this.timeObject[item[20]]?this.timeObject[item[20]]+1:1;
          this.speciesObject[item[2]]=this.speciesObject[item[2]]?this.speciesObject[item[2]]+1:1;
          this.siteInfoObject[item[5]]=this.siteInfoObject[item[5]]?this.siteInfoObject[item[5]]+1:1;
          this.total++;
          // this.scatter.push([item[10], parseInt(item[4])]);
        });
      }
      startTime=moment(startTime.add(1, "years").calendar());
    }
    if(this.districtsLayer)
      this.map.removeLayer(this.districtsLayer);
    this.districtsLayer=L.geoJSON(this.districtsData, {
      style: (feature: any) => {        
        let opacity=Math.floor(this.timeObject[feature.properties.supervisor]/1000);
        return {color: "green", weight: 1, fillColor: "green", fillOpacity: this.colorTable[opacity]};
      },
      onEachFeature: (feature: any, layer:any)=>{
        layer.on("mouseover", (e: any) =>{
          layer.setStyle({weight: 5});
          layer.bindTooltip("District: "+layer.feature.properties.supervisor + "<br>Count: "+ this.timeObject[feature.properties.supervisor]);
        });
        layer.on("mouseout", (e: any) =>{
          layer.setStyle({weight: 1});
        });
      }
    })
    .addTo(this.map);

    let species=[];
    _.each(Object.keys(this.speciesObject), (key: any, i: number) => {
      species.push({ id: i, name: key, number: this.speciesObject[key]});
    });
    species = _.sortBy(species, (item: any,i:any) => {        
      return -item.number;  
    });
    this.species = species.slice(0,10);

    this.species = _.sortBy(this.species, (item: any,i:any) => {        
      return -item.id;  
    });

    let siteInfos=[];
    _.each(Object.keys(this.siteInfoObject), (key: any, i: number) => {
      siteInfos.push({ id: i, name: key, number: this.siteInfoObject[key]});
    });
    siteInfos = _.sortBy(siteInfos, (item: any,i:any) => {        
      return -item.number;  
    });
    this.siteInfos = siteInfos.slice(0,10);

    this.updateHistogram();  
    // this.updateScatter();
    this.updateSiteinfoChart();
  }
  onTimeOverviewChange(){
    if(this.typePanel===2){
      this.treesMarker = [];
      // if(this.treesLayer) this.map.removeLayer(this.treesLayer);
      this.treesLayer.setData(this.treesMarker);
      let startTime=moment("01/01/"+this.timeMapSelected.start);
      this.speciesObject={};
      this.siteInfoObject={};
      this.scatter=[];
      this.total=0;
      for(let i=this.timeOverviewSelected.start;i<=this.timeOverviewSelected.end;i++){
        let id=startTime.format("YYYY");
        let data=this.data[id];
        if(data){
          this.data[id].forEach((item: any, i: any)=>{
            if(i<10000) {
              this.treesMarker.push([item[15], item[16]]);
              this.speciesObject[item[2]]=this.speciesObject[item[2]]?this.speciesObject[item[2]]+1:1;
              this.siteInfoObject[item[5]]=this.siteInfoObject[item[5]]?this.siteInfoObject[item[5]]+1:1;
              this.total++;
              // this.scatter.push([item[10], parseInt(item[4])]);
            }
          });
        }
        startTime=moment(startTime.add(1, "years").calendar());
      }
      
      this.treesLayer.setData(this.treesMarker);
      this.treesLayer.addTo(this.map);  

      let species=[];
      _.each(Object.keys(this.speciesObject), (key: any, i: number) => {
        species.push({ id: i, name: key, number: this.speciesObject[key]});
      });
      species = _.sortBy(species, (item: any,i:any) => {        
        return -item.number;  
      });
      this.species = species.slice(0,10);
  
      this.species = _.sortBy(this.species, (item: any,i:any) => {        
        return -item.id;  
      });
  
      let siteInfos=[];
      _.each(Object.keys(this.siteInfoObject), (key: any, i: number) => {
        siteInfos.push({ id: i, name: key, number: this.siteInfoObject[key]});
      });
      siteInfos = _.sortBy(siteInfos, (item: any,i:any) => {        
        return -item.number;  
      });
      this.siteInfos = siteInfos.slice(0,10);
  
      this.updateHistogram();  
      // this.updateScatter();  
      this.updateSiteinfoChart();
    }
  }
  onTimeTableChange(){
    let startTime=moment("01/01/"+this.timeTableSelected.start);
    this.districtTableObject={};
    this.firstDistrictTableObject={};
    this.districtTable=[];
    this.firstDistrictTable=[];
    this.speciesObject={};
    this.siteInfoObject={};
    this.scatter=[];
    this.total=0;
    for(let i=this.timeTableSelected.start;i<=this.timeTableSelected.end;i++){
      let id=startTime.format("YYYY");
      _.each(this.data[id], (item: any)=>{
        let key=item[20];
        if(key){
          this.districtTableObject[key]=this.districtTableObject[key]?this.districtTableObject[key]+1:1;
          this.speciesObject[item[2]]=this.speciesObject[item[2]]?this.speciesObject[item[2]]+1:1;
          this.siteInfoObject[item[5]]=this.siteInfoObject[item[5]]?this.siteInfoObject[item[5]]+1:1;
          this.total++;
          // this.scatter.push([item[10], parseInt(item[4])]);
        }
        if(i===this.timeTableSelected.start){
          this.firstDistrictTableObject[key]=this.firstDistrictTableObject[key]?this.firstDistrictTableObject[key]+1:1;
        }
      });
      startTime=moment(startTime.add(1, "years").calendar());
    }
    _.each(Object.keys(this.districtTableObject), (key: any)=>{
      this.districtTable.push(this.districtTableObject[key]);
      this.firstDistrictTable.push(this.firstDistrictTableObject[key]?this.firstDistrictTableObject[key]:0);
    });
    let species=[];
    _.each(Object.keys(this.speciesObject), (key: any, i: number) => {
      species.push({ id: i, name: key, number: this.speciesObject[key]});
    });
    species = _.sortBy(species, (item: any,i:any) => {        
      return -item.number;  
    });
    this.species = species.slice(0,10);

    this.species = _.sortBy(this.species, (item: any,i:any) => {        
      return -item.id;  
    });

    let siteInfos=[];
    _.each(Object.keys(this.siteInfoObject), (key: any, i: number) => {
      siteInfos.push({ id: i, name: key, number: this.siteInfoObject[key]});
    });
    siteInfos = _.sortBy(siteInfos, (item: any,i:any) => {        
      return -item.number;  
    });
    this.siteInfos = siteInfos.slice(0,10);

    this.updateHistogram();    
    // this.updateScatter();
    this.updateSiteinfoChart();
  }
  onPanelClick(type: any){
    this.typePanel = type;
    clearTimeout(this.timerChart);
    this.timerChart = 0;    
    this.isPlayChart = false;

    clearTimeout(this.timerMap);
    this.timerMap = 0;    
    this.isPlayMap = false;

    clearTimeout(this.timerOverview);
    this.timerOverview = 0;    
    this.isPlayOverview = false;

    clearTimeout(this.timerTable);
    this.timerTable = 0;    
    this.isPlayTable = false;

    switch(this.typePanel){
      case 0:
        this.onTimeChartChange();
        break;
      case 1:
        // this.onTimeMapChange();
        if(this.treesLayer)
          this.map.removeLayer(this.treesLayer);
        this.map.addLayer(this.districtsLayer);
        this.onTimeMapChange();
        break;
      case 2:
        if(this.districtsLayer)
          this.map.removeLayer(this.districtsLayer);
          this.onTimeOverviewChange();
        break;
      case 3:
        this.onTimeTableChange();
        break;
    }
  }

  onColorOver(id: any){
    if(this.districtsLayer){
      _.each(this.districtsLayer.getLayers(), (layer: any)=>{
        let index=Math.floor(this.timeObject[layer.feature.properties.supervisor]/1000);
        layer.setStyle({weight: index===id?5:1});
      });
    }
  }

  onColorOut(id: any){
    if(this.districtsLayer){
      _.each(this.districtsLayer.getLayers(), (layer: any)=>{
        layer.setStyle({weight: 1});
      });
    }
  }
  addTree(item: any){
    let color="green"
    let marker = L.circleMarker([item[15], item[16]], {
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
    // let layer = L.TileLayer.maskCanvas({
    //   radius: 5,  // radius in pixels or in meters (see useAbsoluteRadius)
    //   useAbsoluteRadius: true,  // true: r in meters, false: r in pixels
    //   color: '#000',  // the color of the layer
    //   opacity: 0.5,  // opacity of the not covered area
    //   noMask: false,  // true results in normal (filled) circled, instead masked circles
    //   lineColor: '#A00'   // color of the circle outline if noMask is true
    // });
    // layer.setData([[37.7597881275,-122.404144379],[37.7919709329,-122.4208886194],[51.51,-0.07],[51.54,-0.29]]);
    // this.map.addLayer(layer);

  }
}

import { Component,OnInit } from '@angular/core';
import { ViewController,NavParams } from 'ionic-angular';

/*
  Generated class for the OrganisationUnits page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-organisation-units',
  templateUrl: 'organisation-units.html'
})
export class OrganisationUnits implements OnInit{

  public data : any;
  public loadingMessages : any;
  public loadingData :boolean = false;
  public organisationUnitsList : any;
  public currentSelectedOrgUnitName : string;

  public currentUser : any;
  public organisationUnits : any;
  public hasOrgUnitChildrenLoaded : boolean;
  public hasOrgUnitChildrenOpened:any = {};

  constructor(public viewCtrl: ViewController,public params : NavParams){
  }

  ngOnInit() {
    this.setModalData();
  }

  ionViewDidLoad() {
    //console.log('Hello OrganisationUnits Page');
  }

  setModalData(){

    this.currentUser = this.params.get("currentUser");
    this.organisationUnits = this.params.get('organisationUnits');
    this.hasOrgUnitChildrenLoaded = false;

  }

  setSelectedOrganisationUnit(selectedOrganisationUnit){
    this.viewCtrl.dismiss(selectedOrganisationUnit);
  }


  dismiss() {
    var parameter = {};
    this.viewCtrl.dismiss(parameter);
  }


}

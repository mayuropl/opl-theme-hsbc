import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PaginationSignal } from 'src/app/CommoUtils/model/paginationSignal';
import { EcbData, FdiData, OdiData } from 'src/app/Component/pages/HSBC/existingPortfolio/rm-exisiting-portfolio-view/OpportunityModel';

@Component({
  selector: 'app-fdi-opportunitydata',
  templateUrl: './fdi-opportunitydata.component.html',
  styleUrl: './fdi-opportunitydata.component.scss'
})
export class FdiOpportunitydataComponent {

  type:String;
  // foreignDirectInvestment
  opportunityDataPeg: PaginationSignal = new PaginationSignal();
  currentSortField: string = null;
  sortDirection: 'ASC' | 'DESC' = 'DESC';

  fdiHeader = ["Date", "Country", "Route", "Foreign Collaborator", "Items Of Manufacture", "FDI Inflows USD M"]
  fdiColumns = ["Date", "Country", "Route", "foreignCollaborator", "itemOfManufacture", "fdiInflows"]

  odiHeader = ["Date", "Type", "Entity Name", "Country", "Activity", "Equity", "Loan", "GTE", "Total"]
  odiColumns = ["Period", "Type", "entityName", "Country", "Activity", "Equity", "Loan", "guaranteeIssued", "Total"]

  ecbHeader = ["Date", "Purpose", "Route", "Maturity", "Amount USD M", "Lender Category"]
  ecbColumns = ["Month", "Purpose", "Route", "maturityPeriod", "amountUsdMm", "Lender_Category"]

  columnsData:any = [];
  columnsHeader:any = [];
  columnsList:any = [];

  pageSize = 10;
  startIndex = 0;
  endIndex = 10;
  totalSize = 0;

  PageSelectNumber: any[] = [10, 20, 50, 100]
  opportunityTabs: string[] = ["FDI", "ODI", "ECB"]


  constructor(@Optional() @Inject(MAT_DIALOG_DATA) public data: any){
    this.type = data.type
    this.prepareOpportunityData(data);
  }

  prepareOpportunityData(data:any){
    switch(this.type) {
      case this.opportunityTabs[0]:
        this.columnsHeader = this.fdiHeader
        this.columnsList = this.fdiColumns;
        break;

      case this.opportunityTabs[1]:
        this.columnsHeader = this.odiHeader
        this.columnsList = this.odiColumns;
        break;

      case this.opportunityTabs[2]:
        this.columnsHeader = this.ecbHeader
        this.columnsList = this.ecbColumns;
        break;
      }
      this.columnsData = data.opportunityData;
      this.opportunityDataPeg.totalSize = data.opportunityData.length;
      this.toggleSort("Date", this.type);
  }


  toggleSort(column: any, type:String) {
    let indexName;
    if(type == this.opportunityTabs[0]) {
      indexName = column == "FDI Inflows USD M" ?  "fdiInflows" : column;
    }
    else if(type == this.opportunityTabs[1]) {
      indexName = column == "Date" ? "Period" : column;
    }
    else {
      indexName = column == "Date" ?  "Month" : column == "Amount USD M" ? "amountUsdMm" : column;
    }

    if (this.currentSortField === column) {
      this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.currentSortField = column;
      this.sortDirection = 'DESC'; // You can default to 'asc' for new columns
    }

     this.columnsData.sort((a, b) => {
      if(column == "Date"){
        let dataA;
        let dataB
        if(indexName == "Month") {
          const parseDate = (dateStr) => {
            const parts = dateStr.split(' -');
            const month = parts[0]; // "Feb"
            const year = '20' + parts[1]; // "-24" becomes "2024"
            return new Date(`${month} ${year}`);
          }
          dataA = a[indexName] ? parseDate(a[indexName].trim()) : null;
          dataB = b[indexName] ? parseDate(b[indexName].trim()) : null;
        }
        else{
          dataA = a[indexName] ? new Date(a[indexName].trim()) : null;
          dataB = b[indexName] ? new Date(b[indexName].trim()) : null;
        }

        if(dataA === null && dataB === null) return 0;
        if(dataA === null) return 1;
        if(dataB === null) return -1;
        return this.sortDirection === 'ASC' ? dataA.getTime() - dataB.getTime() : dataB.getTime() - dataA.getTime();
      }


      const amountA = a[indexName] != null ? parseFloat(a[indexName]) : 0;
      const amountB = b[indexName] != null ? parseFloat(b[indexName]) : 0;
      return this.sortDirection === 'ASC' ? amountA - amountB : amountB - amountA;;
    });
  }


}

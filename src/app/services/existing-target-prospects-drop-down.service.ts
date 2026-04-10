import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DropdownOption } from '../CommoUtils/model/drop-down-option';
import * as _ from 'lodash';
import { TopBarFilter } from '../CommoUtils/model/top-bar-filter';
import { Constants } from '../CommoUtils/constants';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MsmeService } from './msme.service';
import { CommonService } from '../CommoUtils/common-services/common.service';

@Injectable({
  providedIn: 'root'
})
export class ExistingProspectsDropDownService {


  private totalOpportunities: DropdownOption[] = [
    { value: 'CUA', label: 'Cash & Bank' },
    { value: 'FIXED_DEPOSIT', label: 'Current Investments' },
    { value: 'EXPORT', label: 'Export' },
    { value: 'IMPORT', label: 'Import' },
    { value: 'SALARY', label: 'Salary' },
    { value: 'TAX', label: 'Tax' },
    { value: 'LIMITS_O_S', label: 'Limits O/S' },
    { value: 'WPB', label: 'WPB' },
    { value: 'NETWORK', label: 'Network' },
    { value: 'NO_OF_PRODUCTS_NOT_WITH_HSBC', label: 'No. of Products not with HSBC' }
  ];

    private totalOpportunitiesEtb: DropdownOption[] = [
    { value: 'CUACY', label: 'Cash & Bank' },
    { value: 'CUAPY', label: 'Cash & Bank Previous FY' },
    { value: 'FIXED_DEPOSIT', label: 'Current Investments' },
    { value: 'EXPORT', label: 'Export' },
    { value: 'IMPORT', label: 'Import' },
    { value: 'SALARY', label: 'Salary' },
    { value: 'TAX', label: 'Tax' },
    { value: 'LIMITS_O_S', label: 'Limits O/S' },
    { value: 'WPB', label: 'WPB' },
    { value: 'NETWORK', label: 'Network' },
    { value: 'NO_OF_PRODUCTS_NOT_WITH_HSBC', label: 'No. of Products not with HSBC' }
  ];

  private preApprovedDatas: DropdownOption[] = [
    { value: 'ALL', label: 'All' },
    { value: '2', label: 'Cashbacked cards' },
    { value: '1', label: 'Corporate card' },
    { value: '3', label: 'Exims Loans' },
    { value: '4', label: 'Others' }
  ];

// Optionally, you can map it to display names
  private personaMap: Record<string, any> = {

    'ALL':{ value: 'ALL', label: 'All', group:"ALL" , option:null},

    'FOREIGN_MNC':{ value: 'FOREIGN_MNC', label: 'Foreign MNC', group:'FOREIGN_MNC' , option:null},

    'FOREIGN_MNC_DPIIT_START_UP':{ value: 'FOREIGN_MNC_DPIIT_START_UP', label: 'DPIIT - Start Up', group:'FOREIGN_MNC' , option:'DPIIT_START_UP'},
    'FOREIGN_MNC_NASSCOM':{ value: 'FOREIGN_MNC_NASSCOM', label: 'NASSCOM', group:'FOREIGN_MNC' , option:'NASSCOM'},
    'FOREIGN_MNC_IT_ITES': { value:  'FOREIGN_MNC_IT_ITES', label: 'IT/ITES', group:'FOREIGN_MNC' , option:'IT_ITES'},
    'FOREIGN_MNC_VENTURE_FUNDED': { value: 'FOREIGN_MNC_VENTURE_FUNDED', label: 'Venture Funded', group:'FOREIGN_MNC' , option:'VENTURE_FUNDED'},
    'FOREIGN_MNC_EXIM': { value: 'FOREIGN_MNC_EXIM', label: 'EXIM', group:'FOREIGN_MNC' , option:'EXIM'},
    'FOREIGN_MNC_OTHERS': { value: 'FOREIGN_MNC_OTHERS', label: 'Others', group:'FOREIGN_MNC' , option:'OTHERS'},

    'FOREIGN_DOMESTIC': { value: 'FOREIGN_DOMESTIC', label: 'Indian MNC', group:'FOREIGN_DOMESTIC' , option:null},
    'FOREIGN_DOMESTIC_DPIIT_START_UP': { value: 'FOREIGN_DOMESTIC_DPIIT_START_UP', label: 'DPIIT - Start Up', group:'FOREIGN_DOMESTIC' , option:'DPIIT_START_UP'},
    'FOREIGN_DOMESTIC_NASSCOM': { value: 'FOREIGN_DOMESTIC_NASSCOM', label: 'NASSCOM', group:'FOREIGN_DOMESTIC', option:'NASSCOM'},
    'FOREIGN_DOMESTIC_IT_ITES': { value: 'FOREIGN_DOMESTIC_IT_ITES', label: 'IT/ITES', group:'FOREIGN_DOMESTIC', option:'IT_ITES'},
    'FOREIGN_DOMESTIC_VENTURE_FUNDED': { value: 'FOREIGN_DOMESTIC_VENTURE_FUNDED', label: 'Venture Funded', group:'FOREIGN_DOMESTIC', option:'VENTURE_FUNDED'},
    'FOREIGN_DOMESTIC_EXIM': { value: 'FOREIGN_DOMESTIC_EXIM', label: 'EXIM' , group:'FOREIGN_DOMESTIC',option:'EXIM'},
    'FOREIGN_DOMESTIC_OTHERS': { value: 'FOREIGN_DOMESTIC_OTHERS', label: 'Others', group:'FOREIGN_DOMESTIC', option:'OTHERS'},

    'DOMESTIC': { value: 'DOMESTIC', label: 'Domestic' , group:'DOMESTIC', option:null},
    'DOMESTIC_DPIIT_START_UP': { value: 'DOMESTIC_DPIIT_START_UP', label: 'DPIIT - Start Up' , group:'DOMESTIC', option:'DPIIT_START_UP'},
    'DOMESTIC_NASSCOM': { value: 'DOMESTIC_NASSCOM', label: 'NASSCOM', group:'DOMESTIC', option:'NASSCOM'},
    'DOMESTIC_IT_ITES': { value: 'DOMESTIC_IT_ITES', label: 'IT/ITES', group:'DOMESTIC', option:'IT_ITES'},
    'DOMESTIC_VENTURE_FUNDED': { value: 'DOMESTIC_VENTURE_FUNDED', label: 'Venture Funded', group:'DOMESTIC', option:'VENTURE_FUNDED'},
    'DOMESTIC_EXIM': { value: 'DOMESTIC_EXIM', label: 'EXIM' ,  group:'DOMESTIC',option:'EXIM'},
    'DOMESTIC_OTHERS': { value: 'DOMESTIC_OTHERS', label: 'Others', group :'DOMESTIC',option:'OTHERS' }
};

private opportuniySortMap: Record<string, any> = {

  'CUA': { sortField: 'cuaBalance'},
  'FIXED_DEPOSIT': { sortField: 'fixedDeposit'},
  'EXPORT': { sortField: 'export'},
  'IMPORT': { sortField: 'imports'},
  'SALARY': { sortField: 'salary'},
  'TAX': { sortField: 'tax'},
  'LIMITS_O_S': { sortField: 'limitsOS'},
  'WPB': { sortField: 'wpb'},
  'NETWORK': { sortField: 'network'},
  'NO_OF_PRODUCTS_NOT_WITH_HSBC': { sortField: 'noOfProductsNotWithHSBC'}
}

private personaAllOptions: DropdownOption[] =  [

  { value: 'ALL', label: 'All', group:'ALL' },

  { value: 'FOREIGN_MNC', label: 'Foreign MNC', group:'FOREIGN_MNC' },

  { value: 'FOREIGN_MNC_DPIIT_START_UP', label: 'DPIIT - Start Up', group:'FOREIGN_MNC' },
  { value: 'FOREIGN_MNC_NASSCOM', label: 'NASSCOM', group:'FOREIGN_MNC'  },
  { value: 'FOREIGN_MNC_IT_ITES', label: 'IT/ITES', group:'FOREIGN_MNC'  },
  { value: 'FOREIGN_MNC_VENTURE_FUNDED', label: 'Venture Funded', group:'FOREIGN_MNC'  },
  { value: 'FOREIGN_MNC_EXIM', label: 'EXIM', group:'FOREIGN_MNC'  },
  { value: 'FOREIGN_MNC_OTHERS', label: 'Others', group:'FOREIGN_MNC'  },

  { value: 'FOREIGN_DOMESTIC', label: 'Indian MNC', group:'FOREIGN_DOMESTIC'  },
  { value: 'FOREIGN_DOMESTIC_DPIIT_START_UP', label: 'DPIIT - Start Up', group:'FOREIGN_DOMESTIC'  },
  { value: 'FOREIGN_DOMESTIC_NASSCOM', label: 'NASSCOM', group:'FOREIGN_DOMESTIC' },
  { value: 'FOREIGN_DOMESTIC_IT_ITES', label: 'IT/ITES', group:'FOREIGN_DOMESTIC' },
  { value: 'FOREIGN_DOMESTIC_VENTURE_FUNDED', label: 'Venture Funded', group:'FOREIGN_DOMESTIC' },
  { value: 'FOREIGN_DOMESTIC_EXIM', label: 'EXIM' , group:'FOREIGN_DOMESTIC'},
  { value: 'FOREIGN_DOMESTIC_OTHERS', label: 'Others', group:'FOREIGN_DOMESTIC' },

  { value: 'DOMESTIC', label: 'Domestic' , group:'DOMESTIC' },
  { value: 'DOMESTIC_DPIIT_START_UP', label: 'DPIIT - Start Up' , group:'DOMESTIC' },
  { value: 'DOMESTIC_NASSCOM', label: 'NASSCOM', group:'DOMESTIC' },
  { value: 'DOMESTIC_IT_ITES', label: 'IT/ITES', group:'DOMESTIC' },
  { value: 'DOMESTIC_VENTURE_FUNDED', label: 'Venture Funded', group:'DOMESTIC' },
  { value: 'DOMESTIC_EXIM', label: 'EXIM' , group:'DOMESTIC'},
  { value: 'DOMESTIC_OTHERS', label: 'Others', group:'DOMESTIC' }
]

filterListMaster: any[] = [];
  constructor(private msmeService: MsmeService, private commonService: CommonService) {

  }

  getTotalOpportunityDropdownOptions(): DropdownOption[] {
    return this.totalOpportunities;
  }

  getTotalOpportunityDropdownOptionsEtb(): DropdownOption[] {
    return this.totalOpportunitiesEtb;
  }

  getPersonaAllOptions(): DropdownOption[] {
    return this.personaAllOptions;
  }

  getPersonaMap(): Record<string, any> {
    return this.personaMap;
  }

  getOpportunitySortMap(): Record<string, any> {
    return this.opportuniySortMap;
  }
  getPreApprovedDropdownOptions(): DropdownOption[] {
    return this.preApprovedDatas;
  }


  filterCheckBoxTopBar(filter2: TopBarFilter, filterType?:string) {
      let searchValue = filter2.searchValue;
    if(searchValue) {
      let filteredList: any[] = [];
      let checkboxList:any[] = filter2.optionFilter;
      if(filter2.checkboxListTemp == undefined || filter2.checkboxListTemp == null) {
        filter2.checkboxListTemp = _.cloneDeep(checkboxList);
      }
      if(filterType && filterType == "rm") {
        const search = searchValue.toUpperCase().trim();
        filteredList = filter2.checkboxListTemp.filter(item =>
          item && (String(item.firstName || '').toUpperCase().trim().includes(search) ||
                   String(item.empCode || '').toUpperCase().trim().includes(search))
        );
      }
      else {
        filteredList = filter2.checkboxListTemp.filter(item =>
          item?.name?.toUpperCase().trim().includes(searchValue.toUpperCase().trim())
        );
      }
    // Update the original array in place
      filter2.optionFilter.splice(0, filter2.optionFilter.length, ...filteredList);
    } else if(filter2.checkboxListTemp) {
      // Reset the array to the original list if no search value is provided
      filter2.optionFilter.splice(0, filter2.optionFilter.length, ...filter2.checkboxListTemp);
    }
  }

  onCheckboxChangeTopBar(event: any, segment: any, topBarFilters: TopBarFilter) {
    const isAllOption = segment === "All";
    const isChecked = event.checked;
    const { selectedFilter, optionFilter, checkboxListTemp } = topBarFilters;
    const sourceList = checkboxListTemp?.length > 0 ? checkboxListTemp : optionFilter;

    if (isAllOption) {
        selectedFilter.length = 0;
        if (isChecked) {
            selectedFilter.push(...sourceList.map(item => item.value));
        }
    } else {
        if (isChecked) {

            if (!selectedFilter.includes(segment)) {
                selectedFilter.push(segment);
            }
            this.removeAllOptionIfPresent(selectedFilter);

            if (!topBarFilters.searchValue &&
                this.shouldAutoSelectAll(selectedFilter, optionFilter)) {
                selectedFilter.push(optionFilter[0].value);
            }
        } else {

            selectedFilter.splice(selectedFilter.indexOf(segment), 1);

            this.removeAllOptionIfPresent(selectedFilter);
        }
    }
}

private removeAllOptionIfPresent(selectedFilter: string[]) {
    const allIndex = selectedFilter.indexOf("All");
    if (allIndex >= 0) {
        selectedFilter.splice(allIndex, 1);
    }
}

private shouldAutoSelectAll(selectedFilter: string[], optionFilter: any[]): boolean {
    return optionFilter[0]?.value === "All" &&
           selectedFilter.length === optionFilter.length - 1;
}


  onCheckboxChangeRmUsers(event: any, rmEmpCode: string, rmUserFilter:TopBarFilter, selectedRmUsers: string[]) {

    if("All" == rmEmpCode){
      if(event.checked) {
        selectedRmUsers.length = 0;

        if(rmUserFilter.checkboxListTemp &&  rmUserFilter.checkboxListTemp.length > 0) {
          rmUserFilter.checkboxListTemp.forEach((element,i) => {
            selectedRmUsers.push(element.empCode);
          });

        } else {
          rmUserFilter.optionFilter.forEach((element,i) => {

            selectedRmUsers.push(element.empCode);
          });
        }
      } else {
        selectedRmUsers.length = 0;
      }
    } else {
      if (event.checked) {
        if (!selectedRmUsers.includes(rmEmpCode)) {
          selectedRmUsers.push(rmEmpCode);
        }
        if("All" == rmUserFilter.optionFilter[0].empCode && selectedRmUsers.length==(rmUserFilter.optionFilter.length-1)) {
          selectedRmUsers.push(rmUserFilter.optionFilter[0].empCode);
        }
      } else {

        if("All" == rmUserFilter.optionFilter[0].empCode && rmUserFilter.optionFilter.length == selectedRmUsers.length) {
            const i = selectedRmUsers.findIndex(x => x == "All");
            selectedRmUsers.splice(i,1)
        }

        const index = selectedRmUsers.indexOf(rmEmpCode);
        if (index >= 0) {
          selectedRmUsers.splice(index, 1);
        }
      }
    }
  }


  selectAllCheckbox(filter1,filter2) : any {
    let checkboxList;
      if(filter2.json.checkboxListTemp) {
        checkboxList = filter2.json.checkboxListTemp;
      } else {
        checkboxList = filter2.json.keys;
      }
          filter2.selected = [];
          checkboxList?.forEach((element) => {
            filter1[1].count = filter1[1].count + 1;
            filter2.json.count = filter2.json.count + 1;
            element.selected = true;
            filter2.selected.push(element.value);
          });
          this.filterListMaster = filter1;
      return this.filterListMaster;
  }



  getTopbarSearchListFromApi(topBarFilter: TopBarFilter) {
    console.log(topBarFilter);
    if(topBarFilter.searchValue) {
      let req : any = {};
      req.listName = topBarFilter.name;
      req.searchValue = topBarFilter.searchValue;
      this.msmeService.getTopbarFilterListFromApi(req).subscribe((response: any) => {
        if (response && response.status == 200 && response.data) {
          topBarFilter.optionFilter = response.data;
        } else {
          this.commonService.errorSnackBar(response.message)
          console.log(response.message);
        }
      }, error => {
        this.commonService.errorSnackBar('Something Went Wrong')
      })
    } else {
      topBarFilter.optionFilter = [];
    }
  }
  getPersonaAllOptionsForRejectedCus(): DropdownOption[] {
    return this.personaOptionsForRejectedCus;
  }

  public personaOptionsForRejectedCus: DropdownOption[] =  [

    { value: 'isForeignMnc', label: 'Foreign MNC' },
    { value: 'isStartUp', label: 'Start Up' },
    { value: 'isNasscom', label: 'NASSCOM' },
    { value: 'isExim', label: 'EXIM'  },
    { value: 'isItItes', label: 'IT/ITES' },
    { value: 'isPeDeals', label: 'P/Deals' },
    { value: 'isForeignDomestic', label: 'Foreign Domestic' },
    { value: 'isDomestic', label: 'DOMESTIC'},
    { value: 'isOther', label: 'Others' }
  ]
}

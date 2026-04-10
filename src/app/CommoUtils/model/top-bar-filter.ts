export interface TopBarFilter {
  name?: string ;
  spKeyName?:string;
  optionFilter: any[] ;
  checkboxListTemp?: any[] ;
  selectedFilter: string[] ;
  searchValue;
  isCallApi?:boolean;
  isApiCalled?:boolean;
  isApiCallSearch?: boolean,
  visibleOptions?:any[],
  loadBatchSize?:any,
}
